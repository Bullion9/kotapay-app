import { databases } from './AppwriteService';
import { APPWRITE_CONFIG } from '../config/api';
import { complianceService } from './ComplianceServiceSimple';
import { feesRevenueService } from './FeesRevenueService';
import { receiptService } from './receiptService';
import { notificationService } from './notifications';
import { Query } from 'appwrite';

export interface SendRequest {
  senderId: string;
  recipient: {
    type: 'phone' | 'qr' | 'link' | 'account_number';
    value: string; // phone number, QR data, payment link, or account details
    name?: string;
    bankCode?: string; // for external bank transfers
  };
  amount: number; // in kobo
  description: string;
  pin: string; // sender's transaction PIN
  metadata?: any;
}

export interface SendFlowResult {
  success: boolean;
  transactionId?: string;
  status: 'completed' | 'pending' | 'failed' | 'requires_verification';
  message: string;
  recipient?: {
    name: string;
    isKotaPayUser: boolean;
    phone?: string;
  };
  estimatedDelivery?: string;
  receiptUrl?: string;
  nextActions?: string[];
}

export interface RecipientInfo {
  id?: string;
  name?: string;
  phone?: string;
  isKotaPayUser: boolean;
  accountNumber?: string;
  bankName?: string;
  bankCode?: string;
}

export interface ValidatedSendRequest extends SendRequest {
  valid: boolean;
  error?: string;
  fee: number;
  total: number;
}

export interface RoutingResult {
  isInternal: boolean;
  method: 'kotapay_wallet' | 'bank_transfer' | 'card_transfer';
  estimatedDelivery: string;
  additionalInfo?: any;
}

interface EscrowRecord {
  transactionId: string;
  senderId: string;
  amount: number;
  fee: number;
  status: 'held' | 'released' | 'reversed';
  createdAt: Date;
  expiresAt: Date;
}

class SendFlowService {
  private readonly ESCROW_TIMEOUT = 5 * 60 * 1000; // 5 minutes
  private readonly MAX_DAILY_SEND_LIMIT_TIER1 = 5000000; // ₦50,000
  private readonly MAX_DAILY_SEND_LIMIT_TIER2 = 20000000; // ₦200,000
  private readonly MAX_DAILY_SEND_LIMIT_TIER3 = 100000000; // ₦1,000,000

  /**
   * Main send flow orchestrator
   */
  async executeSendFlow(request: SendRequest): Promise<SendFlowResult> {
    try {
      console.log(`💸 Starting send flow: ₦${request.amount / 100} to ${request.recipient.value}`);

      // Step 1: Input validation and sender verification
      const validationResult = await this.validateSendRequest(request);
      if (!validationResult.valid) {
        return {
          success: false,
          status: 'failed',
          message: validationResult.error || 'Validation failed'
        };
      }

      const sender = validationResult.sender!;
      const fee = validationResult.fee!;
      const totalAmount = request.amount + fee;

      // Step 2: Recipient resolution
      const recipientResult = await this.resolveRecipient(request.recipient);
      if (!recipientResult.success) {
        return {
          success: false,
          status: 'failed',
          message: recipientResult.message
        };
      }

      const recipient = recipientResult.recipient!;

      // Step 3: Balance and limit validation
      const balanceCheck = await this.validateBalanceAndLimits(
        sender,
        totalAmount,
        request.amount
      );
      if (!balanceCheck.valid) {
        return {
          success: false,
          status: 'failed',
          message: balanceCheck.error || 'Insufficient balance or limit exceeded'
        };
      }

      // Step 4: Compliance checks
      const complianceResult = await complianceService.runComplianceCheck(
        request.senderId,
        `send_${Date.now()}`,
        request.amount,
        sender.tier || 'tier1',
        {
          name: `${sender.firstName} ${sender.lastName}`,
          phoneNumber: sender.phoneNumber,
          address: sender.address
        },
        {
          name: recipient.name,
          phoneNumber: recipient.phone,
          accountNumber: recipient.accountNumber,
          bankCode: recipient.bankCode
        }
      );

      if (!complianceResult.allowed) {
        return {
          success: false,
          status: 'failed',
          message: 'Transaction blocked by compliance rules',
          nextActions: complianceResult.issues
        };
      }

      // Step 5: Create transaction and escrow
      const transactionId = `txn_send_${Date.now()}_${request.senderId}`;
      
      const escrowResult = await this.createEscrowAndTransaction(
        transactionId,
        request,
        sender,
        recipient,
        fee,
        totalAmount,
        complianceResult
      );

      if (!escrowResult.success) {
        return {
          success: false,
          status: 'failed',
          message: escrowResult.message
        };
      }

      // Step 6: Route transaction based on recipient type
      const routingResult = await this.routeTransaction(
        transactionId,
        request,
        sender,
        recipient,
        totalAmount
      );

      // Step 7: Send notifications
      await this.sendNotifications(
        transactionId,
        sender,
        recipient,
        request.amount,
        routingResult.status
      );

      // Step 8: Generate receipt
      const receiptUrl = await this.generateReceipt(
        transactionId,
        sender,
        recipient,
        request.amount,
        fee,
        routingResult.status
      );

      return {
        success: true,
        transactionId,
        status: routingResult.status,
        message: routingResult.message,
        recipient: {
          name: recipient.name,
          isKotaPayUser: recipient.isKotaPayUser,
          phone: recipient.phone
        },
        estimatedDelivery: routingResult.estimatedDelivery,
        receiptUrl,
        nextActions: routingResult.nextActions
      };

    } catch (error) {
      console.error('Send flow failed:', error);
      return {
        success: false,
        status: 'failed',
        message: 'Send flow failed due to system error'
      };
    }
  }

  /**
   * Step 1: Validate send request and sender
   */
  private async validateSendRequest(request: SendRequest): Promise<{
    valid: boolean;
    error?: string;
    sender?: any;
    fee?: number;
  }> {
    try {
      // Validate amount
      if (request.amount <= 0) {
        return { valid: false, error: 'Invalid amount' };
      }

      if (request.amount < 10000) { // Minimum ₦100
        return { valid: false, error: 'Minimum send amount is ₦100' };
      }

      // Get sender details
      const sender = await databases.getDocument(
        APPWRITE_CONFIG.databaseId,
        APPWRITE_CONFIG.collections.users,
        request.senderId
      );

      if (!sender) {
        return { valid: false, error: 'Sender not found' };
      }

      // Verify PIN (simplified - in production, use proper hashing)
      if (!this.verifyPIN(sender.pin, request.pin)) {
        return { valid: false, error: 'Invalid transaction PIN' };
      }

      // Calculate fee
      const feeResult = feesRevenueService.calculateFee(
        request.recipient.type === 'phone' ? 'wallet_to_wallet' : 'wallet_to_bank_instant',
        request.amount
      );

      return {
        valid: true,
        sender,
        fee: feeResult.feeAmount
      };
    } catch (error) {
      console.error('Validation failed:', error);
      return { valid: false, error: 'Validation failed' };
    }
  }

  /**
   * Step 2: Resolve recipient (phone/QR/link/account)
   */
  private async resolveRecipient(recipient: SendRequest['recipient']): Promise<{
    success: boolean;
    message: string;
    recipient?: {
      id?: string;
      name: string;
      phone?: string;
      accountNumber?: string;
      bankCode?: string;
      bankName?: string;
      isKotaPayUser: boolean;
    };
  }> {
    try {
      switch (recipient.type) {
        case 'phone':
          return await this.resolvePhoneRecipient(recipient.value);
          
        case 'qr':
          return await this.resolveQRRecipient(recipient.value);
          
        case 'link':
          return await this.resolveLinkRecipient(recipient.value);
          
        case 'account_number':
          return await this.resolveBankRecipient(
            recipient.value,
            recipient.bankCode!,
            recipient.name
          );
          
        default:
          return {
            success: false,
            message: 'Unsupported recipient type'
          };
      }
    } catch (error) {
      console.error('Recipient resolution failed:', error);
      return {
        success: false,
        message: 'Failed to resolve recipient'
      };
    }
  }

  /**
   * Resolve phone number recipient
   */
  private async resolvePhoneRecipient(phoneNumber: string): Promise<{
    success: boolean;
    message: string;
    recipient?: any;
  }> {
    try {
      // Clean phone number
      const cleanPhone = phoneNumber.replace(/[^\d+]/g, '');
      
      // Check if phone exists in KotaPay
      const users = await databases.listDocuments(
        APPWRITE_CONFIG.databaseId,
        APPWRITE_CONFIG.collections.users,
        [Query.equal('phoneNumber', cleanPhone)]
      );

      if (users.documents.length > 0) {
        const user = users.documents[0];
        return {
          success: true,
          message: 'KotaPay user found',
          recipient: {
            id: user.$id,
            name: `${user.firstName} ${user.lastName}`,
            phone: user.phoneNumber,
            isKotaPayUser: true
          }
        };
      }

      // External recipient
      return {
        success: true,
        message: 'External recipient',
        recipient: {
          name: `User ${cleanPhone.slice(-4)}`,
          phone: cleanPhone,
          isKotaPayUser: false
        }
      };
    } catch (error) {
      console.error('Phone resolution failed:', error);
      return {
        success: false,
        message: 'Failed to resolve phone number'
      };
    }
  }

  /**
   * Resolve QR code recipient
   */
  private async resolveQRRecipient(qrData: string): Promise<{
    success: boolean;
    message: string;
    recipient?: any;
  }> {
    try {
      // Parse QR data (assuming format: kotapay://pay?user=USER_ID&name=NAME)
      const url = new URL(qrData);
      const userId = url.searchParams.get('user');
      const name = url.searchParams.get('name');

      if (!userId) {
        return {
          success: false,
          message: 'Invalid QR code format'
        };
      }

      const user = await databases.getDocument(
        APPWRITE_CONFIG.databaseId,
        APPWRITE_CONFIG.collections.users,
        userId
      );

      return {
        success: true,
        message: 'QR recipient resolved',
        recipient: {
          id: user.$id,
          name: name || `${user.firstName} ${user.lastName}`,
          phone: user.phoneNumber,
          isKotaPayUser: true
        }
      };
    } catch (error) {
      console.error('QR resolution failed:', error);
      return {
        success: false,
        message: 'Invalid or expired QR code'
      };
    }
  }

  /**
   * Resolve payment link recipient
   */
  private async resolveLinkRecipient(linkData: string): Promise<{
    success: boolean;
    message: string;
    recipient?: any;
  }> {
    try {
      // Parse payment link
      const url = new URL(linkData);
      const requestId = url.searchParams.get('request');

      if (!requestId) {
        return {
          success: false,
          message: 'Invalid payment link'
        };
      }

      const paymentRequest = await databases.getDocument(
        APPWRITE_CONFIG.databaseId,
        APPWRITE_CONFIG.collections.paymentRequests,
        requestId
      );

      if (paymentRequest.status !== 'pending') {
        return {
          success: false,
          message: 'Payment link is no longer valid'
        };
      }

      const requester = await databases.getDocument(
        APPWRITE_CONFIG.databaseId,
        APPWRITE_CONFIG.collections.users,
        paymentRequest.requesterId
      );

      return {
        success: true,
        message: 'Payment link resolved',
        recipient: {
          id: requester.$id,
          name: `${requester.firstName} ${requester.lastName}`,
          phone: requester.phoneNumber,
          isKotaPayUser: true,
          paymentRequestId: requestId
        }
      };
    } catch (error) {
      console.error('Link resolution failed:', error);
      return {
        success: false,
        message: 'Invalid or expired payment link'
      };
    }
  }

  /**
   * Resolve bank account recipient
   */
  private async resolveBankRecipient(
    accountNumber: string,
    bankCode: string,
    providedName?: string
  ): Promise<{
    success: boolean;
    message: string;
    recipient?: any;
  }> {
    try {
      // Validate account number (simplified)
      if (!accountNumber || accountNumber.length < 10) {
        return {
          success: false,
          message: 'Invalid account number'
        };
      }

      // In production, verify account with bank API
      const accountName = await this.verifyBankAccount(accountNumber, bankCode);
      
      if (!accountName) {
        return {
          success: false,
          message: 'Account number could not be verified'
        };
      }

      return {
        success: true,
        message: 'Bank account verified',
        recipient: {
          name: accountName,
          accountNumber,
          bankCode,
          bankName: this.getBankName(bankCode),
          isKotaPayUser: false
        }
      };
    } catch (error) {
      console.error('Bank resolution failed:', error);
      return {
        success: false,
        message: 'Bank account verification failed'
      };
    }
  }

  /**
   * Step 3: Validate balance and limits
   */
  private async validateBalanceAndLimits(
    sender: any,
    totalAmount: number,
    sendAmount: number
  ): Promise<{
    valid: boolean;
    error?: string;
  }> {
    // Check wallet balance
    if (sender.walletBalance < totalAmount) {
      return {
        valid: false,
        error: `Insufficient balance. Available: ₦${sender.walletBalance / 100}, Required: ₦${totalAmount / 100}`
      };
    }

    // Check daily limits
    const dailyLimit = this.getDailyLimit(sender.tier || 'tier1');
    const dailySpent = await this.getDailySpentAmount(sender.$id);
    
    if (dailySpent + sendAmount > dailyLimit) {
      return {
        valid: false,
        error: `Daily limit exceeded. Limit: ₦${dailyLimit / 100}, Spent: ₦${dailySpent / 100}`
      };
    }

    return { valid: true };
  }

  /**
   * Step 4: Create escrow and transaction record
   */
  private async createEscrowAndTransaction(
    transactionId: string,
    request: SendRequest,
    sender: any,
    recipient: any,
    fee: number,
    totalAmount: number,
    complianceResult: any
  ): Promise<{
    success: boolean;
    message: string;
  }> {
    try {
      // Debit sender wallet (escrow)
      const newBalance = sender.walletBalance - totalAmount;
      
      await databases.updateDocument(
        APPWRITE_CONFIG.databaseId,
        APPWRITE_CONFIG.collections.users,
        request.senderId,
        { walletBalance: newBalance }
      );

      // Create transaction record
      await databases.createDocument(
        APPWRITE_CONFIG.databaseId,
        APPWRITE_CONFIG.collections.transactions,
        transactionId,
        {
          userId: request.senderId,
          type: recipient.isKotaPayUser ? 'transfer' : 'bank_transfer',
          amount: request.amount,
          fee: fee,
          description: request.description,
          reference: `ref_${Date.now()}`,
          status: 'pending',
          recipientId: recipient.id,
          recipientName: recipient.name,
          bankCode: recipient.bankCode,
          accountNumber: recipient.accountNumber,
          category: 'transfer',
          metadata: JSON.stringify({
            ...request.metadata,
            recipientType: request.recipient.type,
            complianceResult: complianceResult.amlResult,
            escrowCreatedAt: new Date().toISOString()
          }),
          balanceBefore: sender.walletBalance,
          balanceAfter: newBalance,
          riskScore: complianceResult.amlResult?.riskScore || 0
        }
      );

      // Create escrow record
      await this.createEscrowRecord(transactionId, request.senderId, request.amount, fee);

      console.log(`💰 Escrow created: ₦${totalAmount / 100} held for transaction ${transactionId}`);
      
      return {
        success: true,
        message: 'Escrow and transaction created successfully'
      };
    } catch (error) {
      console.error('Escrow creation failed:', error);
      
      // Attempt to reverse the wallet debit
      try {
        await databases.updateDocument(
          APPWRITE_CONFIG.databaseId,
          APPWRITE_CONFIG.collections.users,
          request.senderId,
          { walletBalance: sender.walletBalance }
        );
      } catch (reverseError) {
        console.error('Failed to reverse wallet debit:', reverseError);
      }

      return {
        success: false,
        message: 'Failed to create escrow'
      };
    }
  }

  /**
   * Step 5: Route transaction based on recipient type
   */
  private async routeTransaction(
    transactionId: string,
    request: SendRequest,
    sender: any,
    recipient: any,
    totalAmount: number
  ): Promise<{
    status: 'completed' | 'pending';
    message: string;
    estimatedDelivery?: string;
    nextActions?: string[];
  }> {
    try {
      if (recipient.isKotaPayUser) {
        // Internal KotaPay transfer - instant
        return await this.processInternalTransfer(
          transactionId,
          request,
          sender,
          recipient,
          totalAmount
        );
      } else {
        // External transfer - queue for settlement
        return await this.queueExternalTransfer(
          transactionId,
          request,
          sender,
          recipient,
          totalAmount
        );
      }
    } catch (error) {
      console.error('Transaction routing failed:', error);
      
      // Mark transaction as failed
      await databases.updateDocument(
        APPWRITE_CONFIG.databaseId,
        APPWRITE_CONFIG.collections.transactions,
        transactionId,
        { status: 'failed' }
      );

      return {
        status: 'pending',
        message: 'Transaction routing failed'
      };
    }
  }

  /**
   * Process internal KotaPay transfer (instant)
   */
  private async processInternalTransfer(
    transactionId: string,
    request: SendRequest,
    sender: any,
    recipient: any,
    totalAmount: number
  ): Promise<{
    status: 'completed';
    message: string;
    estimatedDelivery: string;
  }> {
    // Credit recipient wallet
    const recipientUser = await databases.getDocument(
      APPWRITE_CONFIG.databaseId,
      APPWRITE_CONFIG.collections.users,
      recipient.id
    );

    const newRecipientBalance = recipientUser.walletBalance + request.amount;

    await databases.updateDocument(
      APPWRITE_CONFIG.databaseId,
      APPWRITE_CONFIG.collections.users,
      recipient.id,
      { walletBalance: newRecipientBalance }
    );

    // Update transaction status
    await databases.updateDocument(
      APPWRITE_CONFIG.databaseId,
      APPWRITE_CONFIG.collections.transactions,
      transactionId,
      {
        status: 'completed',
        settlementDate: new Date().toISOString()
      }
    );

    // Release escrow
    await this.releaseEscrow(transactionId);

    // Record revenue
    if (request.amount > 0) {
      await feesRevenueService.recordRevenue(
        transactionId,
        feesRevenueService.calculateFee('wallet_to_wallet', request.amount),
        'wallet_to_wallet'
      );
    }

    console.log(`✅ Internal transfer completed: ${transactionId}`);

    return {
      status: 'completed',
      message: 'Transfer completed instantly',
      estimatedDelivery: 'Instant'
    };
  }

  /**
   * Queue external transfer for settlement
   */
  private async queueExternalTransfer(
    transactionId: string,
    request: SendRequest,
    sender: any,
    recipient: any,
    totalAmount: number
  ): Promise<{
    status: 'pending';
    message: string;
    estimatedDelivery: string;
    nextActions: string[];
  }> {
    // Add to settlement queue (simplified)
    await databases.createDocument(
      APPWRITE_CONFIG.databaseId,
      'settlement_queue', // Assuming this collection exists
      `settlement_${transactionId}`,
      {
        transactionId,
        type: 'bank_transfer',
        amount: request.amount,
        recipientName: recipient.name,
        accountNumber: recipient.accountNumber,
        bankCode: recipient.bankCode,
        status: 'queued',
        scheduledAt: new Date().toISOString()
      }
    );

    // Update transaction status
    await databases.updateDocument(
      APPWRITE_CONFIG.databaseId,
      APPWRITE_CONFIG.collections.transactions,
      transactionId,
      {
        status: 'pending',
        metadata: JSON.stringify({
          ...JSON.parse(request.metadata || '{}'),
          queuedForSettlement: true,
          estimatedSettlement: new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString() // 2 hours
        })
      }
    );

    console.log(`⏳ External transfer queued: ${transactionId}`);

    return {
      status: 'pending',
      message: 'Transfer queued for processing',
      estimatedDelivery: 'Within 2 hours',
      nextActions: ['track_transaction', 'contact_support_if_delayed']
    };
  }

  /**
   * Step 6: Send notifications to both parties
   */
  private async sendNotifications(
    transactionId: string,
    sender: any,
    recipient: any,
    amount: number,
    status: string
  ): Promise<void> {
    try {
      // Sender notification
      await notificationService.sendMoneySentNotification({
        transactionId,
        amount,
        currency: 'NGN',
        senderName: sender.name,
        recipientName: recipient.name || recipient.phone || 'Bank Account',
        message: '',
        settlementType: 'internal'
      });

      // Recipient notification (if KotaPay user)
      if (recipient.isKotaPayUser && recipient.id) {
        await notificationService.sendMoneyReceivedNotification({
          transactionId,
          amount,
          currency: 'NGN',
          senderName: sender.name,
          recipientName: recipient.name || recipient.phone,
          message: `₦${amount / 100} received from ${sender.firstName} ${sender.lastName}`
        });
      }

      // SMS notifications (simplified)
      if (recipient.phone && !recipient.isKotaPayUser) {
        await this.sendSMSNotification(
          recipient.phone,
          `You have received ₦${amount / 100} from ${sender.firstName}. Download KotaPay to access your money.`
        );
      }

      console.log(`📱 Notifications sent for transaction: ${transactionId}`);
    } catch (error) {
      console.error('Notification sending failed:', error);
      // Don't fail the transaction if notifications fail
    }
  }

  /**
   * Step 7: Generate and store receipt
   */
  private async generateReceipt(
    transactionId: string,
    sender: any,
    recipient: any,
    amount: number,
    fee: number,
    status: string
  ): Promise<string> {
    try {
      const receiptResponse = await receiptService.generateReceipt(transactionId);
      
      console.log(`📄 Receipt generated for transaction: ${transactionId}`);
      return receiptResponse.receiptId;
    } catch (error) {
      console.error('Receipt generation failed:', error);
      return '';
    }
  }

  // Helper methods

  private verifyPIN(storedPIN: string, providedPIN: string): boolean {
    // In production, use proper PIN hashing and verification
    return storedPIN === providedPIN;
  }

  private async verifyBankAccount(accountNumber: string, bankCode: string): Promise<string | null> {
    // Mock bank verification - in production, call actual bank API

    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Mock verification (70% success rate)
    if (Math.random() > 0.3) {
      return `Account Holder ${accountNumber.slice(-4)}`;
    }
    
    return null;
  }

  private getBankName(bankCode: string): string {
    const bankNames: Record<string, string> = {
      '044': 'Access Bank',
      '014': 'Mainstreet Bank',
      '023': 'Citibank',
      '050': 'Ecobank',
      '011': 'First Bank',
      '058': 'GTBank',
      '030': 'Heritage Bank',
      '082': 'Keystone Bank',
      '076': 'Polaris Bank',
      '221': 'Stanbic IBTC',
      '068': 'Standard Chartered',
      '232': 'Sterling Bank',
      '032': 'Union Bank',
      '033': 'United Bank for Africa',
      '215': 'Unity Bank',
      '035': 'Wema Bank',
      '057': 'Zenith Bank'
    };

    return bankNames[bankCode] || 'Unknown Bank';
  }

  private getDailyLimit(tier: string): number {
    switch (tier) {
      case 'tier1': return this.MAX_DAILY_SEND_LIMIT_TIER1;
      case 'tier2': return this.MAX_DAILY_SEND_LIMIT_TIER2;
      case 'tier3': return this.MAX_DAILY_SEND_LIMIT_TIER3;
      default: return this.MAX_DAILY_SEND_LIMIT_TIER1;
    }
  }

  private async getDailySpentAmount(userId: string): Promise<number> {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const transactions = await databases.listDocuments(
      APPWRITE_CONFIG.databaseId,
      APPWRITE_CONFIG.collections.transactions,
      [
        Query.equal('userId', userId),
        Query.equal('status', 'completed'),
        Query.greaterThan('$createdAt', today.toISOString()),
        Query.contains('type', ['transfer', 'bank_transfer'])
      ]
    );

    return transactions.documents.reduce((total, txn) => total + (txn.amount || 0), 0);
  }

  private async createEscrowRecord(
    transactionId: string,
    senderId: string,
    amount: number,
    fee: number
  ): Promise<void> {
    const escrowRecord: EscrowRecord = {
      transactionId,
      senderId,
      amount,
      fee,
      status: 'held',
      createdAt: new Date(),
      expiresAt: new Date(Date.now() + this.ESCROW_TIMEOUT)
    };

    // In a real implementation, store this in a dedicated escrow table
    console.log(`🔒 Escrow record created: ${JSON.stringify(escrowRecord)}`);
  }

  private async releaseEscrow(transactionId: string): Promise<void> {
    // In a real implementation, update escrow status to 'released'
    console.log(`🔓 Escrow released for transaction: ${transactionId}`);
  }

  private async sendSMSNotification(phoneNumber: string, message: string): Promise<void> {
    // Mock SMS sending - integrate with SMS provider
    console.log(`📱 SMS to ${phoneNumber}: ${message}`);
  }
}

export const sendFlowService = new SendFlowService();
export default SendFlowService;
