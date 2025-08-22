import { databases } from './AppwriteService';
import { APPWRITE_CONFIG } from '../config/api';
import { complianceService } from './ComplianceServiceSimple';
import { edgeCaseHandler } from './EdgeCaseHandler';
import { feesRevenueService } from './FeesRevenueService';
import NetInfo from '@react-native-community/netinfo';

interface TransactionRequest {
  userId: string;
  type: 'wallet_transfer' | 'bank_transfer' | 'card_topup' | 'bill_payment';
  amount: number;
  description: string;
  recipientId?: string;
  recipientDetails?: {
    name: string;
    accountNumber?: string;
    bankCode?: string;
    phoneNumber?: string;
  };
  senderDetails?: {
    name: string;
    phoneNumber: string;
    address?: string;
  };
  metadata?: any;
  qrData?: string; // For QR-based transactions
}

interface TransactionResult {
  success: boolean;
  transactionId?: string;
  queueId?: string;
  topUpFlowId?: string;
  message: string;
  status: 'completed' | 'queued' | 'failed' | 'requires_topup' | 'compliance_review';
  complianceIssues?: string[];
  nextActions?: string[];
}

class TransactionEngine {
  /**
   * Process a transaction with full compliance and edge case handling
   */
  async processTransaction(request: TransactionRequest): Promise<TransactionResult> {
    try {
      console.log(`🔄 Processing transaction: ${request.type} for ₦${request.amount / 100}`);

      // 1. Check network connectivity
      const networkState = await NetInfo.fetch();
      if (!networkState.isConnected) {
        return await this.handleOfflineTransaction(request);
      }

      // 2. Check for duplicate QR scan
      if (request.qrData) {
        const idempotencyCheck = await edgeCaseHandler.checkIdempotency(
          request.userId,
          request.qrData,
          request.amount
        );

        if (idempotencyCheck.isDuplicate) {
          return {
            success: false,
            status: 'failed',
            message: idempotencyCheck.message || 'Duplicate transaction detected',
            nextActions: ['check_transaction_history']
          };
        }
      }

      // 3. Get user details and balance
      const user = await this.getUserDetails(request.userId);
      if (!user) {
        return {
          success: false,
          status: 'failed',
          message: 'User not found'
        };
      }

      // 4. Check wallet balance for outgoing transactions
      if (this.isOutgoingTransaction(request.type)) {
        const totalAmount = request.amount + await this.calculateFees(request);
        
        if (user.walletBalance < totalAmount) {
          return await this.handleInsufficientBalance(request, user, totalAmount);
        }
      }

      // 5. Run compliance checks
      const complianceResult = await complianceService.runComplianceCheck(
        request.userId,
        `txn_${Date.now()}`,
        request.amount,
        user.tier || 'tier1',
        request.senderDetails || { name: `${user.firstName} ${user.lastName}`, phoneNumber: user.phoneNumber },
        request.recipientDetails || {}
      );

      if (!complianceResult.allowed) {
        // Block transactions with critical compliance issues
        const hasCriticalIssues = complianceResult.issues.some(issue => 
          issue.includes('AML screening') && issue.includes('blocked')
        );

        if (hasCriticalIssues) {
          return {
            success: false,
            status: 'failed',
            message: 'Transaction blocked for compliance reasons',
            complianceIssues: complianceResult.issues
          };
        }

        // Flag for review but allow to proceed
        return {
          success: true,
          status: 'compliance_review',
          message: 'Transaction flagged for compliance review but will proceed',
          complianceIssues: complianceResult.issues,
          transactionId: await this.executeTransaction(request, user, complianceResult)
        };
      }

      // 6. Execute the transaction
      const transactionId = await this.executeTransaction(request, user, complianceResult);

      // 7. Create idempotency record for QR transactions
      if (request.qrData && transactionId) {
        await edgeCaseHandler.createIdempotencyRecord(
          request.userId,
          request.qrData,
          request.amount,
          transactionId
        );
      }

      return {
        success: true,
        status: 'completed',
        message: 'Transaction completed successfully',
        transactionId
      };

    } catch (error) {
      console.error('Transaction processing failed:', error);
      
      return {
        success: false,
        status: 'failed',
        message: 'Transaction failed due to system error'
      };
    }
  }

  /**
   * Execute the actual transaction
   */
  private async executeTransaction(
    request: TransactionRequest,
    user: any,
    complianceResult: any
  ): Promise<string> {
    const transactionId = `txn_${Date.now()}_${user.$id}`;
    
    try {
      // Calculate fees
      const feeInfo = feesRevenueService.calculateFee(
        request.type === 'wallet_transfer' ? 'wallet_to_wallet' : 'wallet_to_bank_instant',
        request.amount
      );

      const totalAmount = request.amount + feeInfo.feeAmount;

      // Create transaction record
      await databases.createDocument(
        APPWRITE_CONFIG.databaseId,
        APPWRITE_CONFIG.collections.transactions,
        transactionId,
        {
          userId: request.userId,
          type: request.type,
          amount: request.amount,
          fee: feeInfo.feeAmount,
          description: request.description,
          reference: `ref_${Date.now()}`,
          status: 'processing',
          recipientId: request.recipientId,
          recipientName: request.recipientDetails?.name,
          bankCode: request.recipientDetails?.bankCode,
          accountNumber: request.recipientDetails?.accountNumber,
          category: this.getCategoryFromType(request.type),
          metadata: JSON.stringify({
            ...request.metadata,
            complianceResult: complianceResult.amlResult,
            feeBreakdown: feeInfo.revenueBreakdown
          }),
          balanceBefore: user.walletBalance,
          balanceAfter: user.walletBalance - totalAmount,
          riskScore: complianceResult.amlResult?.riskScore || 0
        }
      );

      // Update user balance for outgoing transactions
      if (this.isOutgoingTransaction(request.type)) {
        await databases.updateDocument(
          APPWRITE_CONFIG.databaseId,
          APPWRITE_CONFIG.collections.users,
          request.userId,
          {
            walletBalance: user.walletBalance - totalAmount
          }
        );
      }

      // Record revenue
      if (feeInfo.feeAmount > 0) {
        await feesRevenueService.recordRevenue(
          transactionId,
          feeInfo,
          request.type === 'wallet_transfer' ? 'wallet_to_wallet' : 'wallet_to_bank_instant'
        );
      }

      // Simulate external API calls (bank transfer, card processing, etc.)
      await this.simulateExternalProcessing(request.type);

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

      console.log(`✅ Transaction completed: ${transactionId}`);
      return transactionId;

    } catch (error) {
      console.error('Transaction execution failed:', error);
      
      // Update transaction status to failed
      try {
        await databases.updateDocument(
          APPWRITE_CONFIG.databaseId,
          APPWRITE_CONFIG.collections.transactions,
          transactionId,
          {
            status: 'failed',
            metadata: JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' })
          }
        );
      } catch (updateError) {
        console.error('Failed to update transaction status:', updateError);
      }

      throw error;
    }
  }

  /**
   * Handle offline transactions
   */
  private async handleOfflineTransaction(request: TransactionRequest): Promise<TransactionResult> {
    console.log('📶 No internet connection - queuing transaction');

    const queueId = await edgeCaseHandler.queueOfflineTransaction(
      request.userId,
      request,
      true // Retry when online
    );

    return {
      success: true,
      status: 'queued',
      queueId,
      message: 'No internet connection. Transaction queued and will be processed when connection is restored.',
      nextActions: ['check_connection', 'view_queue']
    };
  }

  /**
   * Handle insufficient wallet balance
   */
  private async handleInsufficientBalance(
    request: TransactionRequest,
    user: any,
    requiredAmount: number
  ): Promise<TransactionResult> {
    console.log(`💳 Insufficient balance: Need ₦${requiredAmount / 100}, Have ₦${user.walletBalance / 100}`);

    const topUpFlow = await edgeCaseHandler.handleInsufficientBalance(
      request.userId,
      requiredAmount,
      user.walletBalance,
      { id: `temp_${Date.now()}`, ...request }
    );

    return {
      success: false,
      status: 'requires_topup',
      topUpFlowId: topUpFlow.flowId,
      message: topUpFlow.message,
      nextActions: topUpFlow.actions
    };
  }

  /**
   * Process queued transactions when back online
   */
  async processQueuedTransactions(userId: string): Promise<{
    processed: number;
    successful: number;
    failed: number;
    details: any[];
  }> {
    console.log('🔄 Processing queued transactions...');
    return await edgeCaseHandler.processQueuedTransactions(userId);
  }

  /**
   * Complete top-up and send flow
   */
  async completeTopUpAndSend(flowId: string, topUpTransactionId: string): Promise<TransactionResult> {
    const result = await edgeCaseHandler.completeTopUpAndSend(flowId, topUpTransactionId);

    return {
      success: result.success,
      status: result.success ? 'completed' : 'failed',
      message: result.message,
      transactionId: result.originalTransactionId
    };
  }

  // Helper methods

  private async getUserDetails(userId: string): Promise<any> {
    try {
      return await databases.getDocument(
        APPWRITE_CONFIG.databaseId,
        APPWRITE_CONFIG.collections.users,
        userId
      );
    } catch (error) {
      console.error('Failed to get user details:', error);
      return null;
    }
  }

  private isOutgoingTransaction(type: string): boolean {
    return ['wallet_transfer', 'bank_transfer', 'bill_payment'].includes(type);
  }

  private async calculateFees(request: TransactionRequest): Promise<number> {
    const feeInfo = feesRevenueService.calculateFee(
      request.type === 'wallet_transfer' ? 'wallet_to_wallet' : 'wallet_to_bank_instant',
      request.amount
    );

    return feeInfo.feeAmount;
  }

  private getCategoryFromType(type: string): string {
    const categoryMap: Record<string, string> = {
      'wallet_transfer': 'transfer',
      'bank_transfer': 'bank',
      'card_topup': 'topup',
      'bill_payment': 'bills'
    };

    return categoryMap[type] || 'other';
  }

  private async simulateExternalProcessing(type: string): Promise<void> {
    // Simulate different processing times for different transaction types
    const delays: Record<string, number> = {
      'wallet_transfer': 500,   // Instant internal transfer
      'bank_transfer': 2000,    // Bank API call
      'card_topup': 1500,       // Paystack API
      'bill_payment': 1000      // Biller API
    };

    const delay = delays[type] || 1000;
    await new Promise(resolve => setTimeout(resolve, delay));

    // Simulate occasional failures (5% failure rate)
    if (Math.random() < 0.05) {
      throw new Error(`External ${type} processing failed`);
    }
  }
}

export const transactionEngine = new TransactionEngine();
export default TransactionEngine;
