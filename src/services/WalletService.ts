/**
 * KotaPay Wallet Service
 * Implements the core "Wallet vs Bank Logic" as outlined in the architecture:
 * 
 * WALLET = Stored-value (Appwrite balance field), Instant, zero-fee
 * BANK = Pass-through (no stored value), Uses partner bank's API, small fee
 */

import AppwriteService, { Transaction } from './AppwriteService';
import PaystackService from './PaystackService';
import { notificationService } from './notifications';

export interface WalletBalance {
  available: number;
  pending: number;
  total: number;
  currency: string;
  lastUpdated: string;
}

export interface BankAccount {
  id: string;
  bankName: string;
  accountNumber: string;
  accountName: string;
  bankCode: string;
  isDefault: boolean;
  isVerified: boolean;
}

export interface FundingSource {
  id: string;
  type: 'wallet' | 'bank' | 'card';
  name: string;
  balance?: number;
  isDefault: boolean;
  accountDetails?: BankAccount;
  cardDetails?: {
    lastFour: string;
    expiryMonth: string;
    expiryYear: string;
    brand: string;
  };
}

export interface TransferRequest {
  recipientId?: string; // For wallet-to-wallet transfers
  recipientPhone?: string;
  recipientAccount?: string; // For bank transfers
  recipientBank?: string;
  amount: number;
  description?: string;
  fundingSource: 'wallet' | 'bank' | 'card';
  fundingSourceId?: string;
  pin: string;
}

export interface TransferResult {
  success: boolean;
  transactionId: string;
  type: 'internal' | 'external';
  settlementType: 'instant' | 'pending' | 'next_cycle';
  estimatedSettlement?: string;
  fee: number;
  message: string;
  reference?: string;
}

export interface TopUpRequest {
  amount: number;
  method: 'bank_transfer' | 'card' | 'ussd';
  bankAccount?: string;
  cardToken?: string;
  pin?: string;
}

export interface WithdrawalRequest {
  amount: number;
  destinationType: 'bank' | 'mobile_money' | 'agent';
  destination: {
    bankAccount?: string;
    bankCode?: string;
    phoneNumber?: string;
    agentCode?: string;
  };
  pin: string;
}

class WalletService {
  private currentUser: any = null;
  private mockMode: boolean = false;
  private walletBalance: WalletBalance = {
    available: 0,
    pending: 0,
    total: 0,
    currency: '₦',
    lastUpdated: new Date().toISOString()
  };

  // Enable mock mode for testing without database
  enableMockMode(mockBalance: number = 2847.50): void {
    this.mockMode = true;
    this.walletBalance = {
      available: mockBalance,
      pending: 0,
      total: mockBalance,
      currency: '₦',
      lastUpdated: new Date().toISOString()
    };
    this.currentUser = {
      $id: 'mock_user_123',
      firstName: 'Test',
      lastName: 'User',
      email: 'test@kotapay.com'
    };
    console.log('🎭 Wallet Service running in MOCK MODE');
  }

  // Initialize wallet service for current user
  async initialize(userId: string): Promise<void> {
    try {
      this.currentUser = await AppwriteService.getUserProfile(userId);
      await this.refreshBalance();
    } catch (error) {
      console.error('Error initializing wallet service:', error);
      // Fallback to mock mode if database isn't ready
      console.log('📡 Database not ready, enabling mock mode...');
      this.enableMockMode();
    }
  }

  // Get current wallet balance (stored-value)
  async getWalletBalance(): Promise<WalletBalance> {
    await this.refreshBalance();
    return this.walletBalance;
  }

  // Refresh balance from Appwrite
  private async refreshBalance(): Promise<void> {
    if (this.mockMode) {
      // Skip balance refresh in mock mode
      console.log('🎭 Mock mode: Using simulated balance');
      return;
    }

    try {
      if (!this.currentUser) throw new Error('User not initialized');

      // Get user profile with balance field - use userId field, not document $id
      const userProfile = await AppwriteService.getUserProfile(this.currentUser.userId);
      
      // Calculate pending transactions
      const pendingTransactions = await this.getPendingTransactions();
      const pendingAmount = pendingTransactions.reduce((sum, tx) => 
        tx.type === 'debit' ? sum + tx.amount : sum, 0
      );

      this.walletBalance = {
        available: userProfile?.walletBalance || 0,
        pending: pendingAmount,
        total: (userProfile?.walletBalance || 0) + pendingAmount,
        currency: '₦',
        lastUpdated: new Date().toISOString()
      };
    } catch (error) {
      console.error('Error refreshing balance:', error);
      // Fallback to mock mode if database error
      if (!this.mockMode) {
        console.log('🎭 Database error, enabling mock mode...');
        this.enableMockMode();
      }
    }
  }

  // Get user's linked bank accounts
  async getBankAccounts(): Promise<BankAccount[]> {
    // Mock implementation - replace with actual Appwrite query
    return [
      {
        id: 'bank1',
        bankName: 'First Bank Nigeria',
        accountNumber: '1234567890',
        accountName: 'John Doe',
        bankCode: '011',
        isDefault: true,
        isVerified: true
      }
    ];
  }

  // Get available funding sources
  async getFundingSources(): Promise<FundingSource[]> {
    const bankAccounts = await this.getBankAccounts();
    const walletBalance = await this.getWalletBalance();

    const sources: FundingSource[] = [
      // Wallet (stored-value)
      {
        id: 'wallet',
        type: 'wallet',
        name: 'KotaPay Wallet',
        balance: walletBalance.available,
        isDefault: true
      }
    ];

    // Add bank accounts (pass-through)
    bankAccounts.forEach(bank => {
      sources.push({
        id: bank.id,
        type: 'bank',
        name: `${bank.bankName} (${bank.accountNumber.slice(-4)})`,
        isDefault: bank.isDefault && !sources.find(s => s.isDefault),
        accountDetails: bank
      });
    });

    return sources;
  }

  // Send money (core routing logic)
  async sendMoney(request: TransferRequest): Promise<TransferResult> {
    try {
      // Mock mode simulation
      if (this.mockMode) {
        console.log('🎭 Mock mode: Simulating money transfer...');
        
        const { amount } = request;
        const fee = request.recipientId ? 0 : 25; // Internal = no fee, External = ₦25
        const totalDebit = amount + fee;
        
        if (this.walletBalance.available < totalDebit) {
          throw new Error(`Insufficient funds (including ₦${fee} fee)`);
        }
        
        // Simulate successful transfer
        this.walletBalance.available -= totalDebit;
        this.walletBalance.total = this.walletBalance.available;
        
        const isInternal = !!request.recipientId;
        
        return {
          success: true,
          transactionId: `mock_tx_${Date.now()}`,
          type: isInternal ? 'internal' : 'external',
          settlementType: isInternal ? 'instant' : 'next_cycle',
          estimatedSettlement: isInternal ? undefined : 'Next business day',
          fee,
          message: isInternal ? 'Transfer completed instantly' : 'Transfer initiated, settlement in 1-3 business days'
        };
      }

      // Real database mode
      // Validate PIN
      if (!this.validatePin(request.pin)) {
        throw new Error('Invalid PIN');
      }

      // Check if recipient is on KotaPay (internal) or external
      const isInternal = await this.isInternalRecipient(request.recipientPhone || request.recipientId);
      
      if (isInternal && request.recipientId) {
        return await this.processInternalTransfer(request);
      } else {
        return await this.processExternalTransfer(request);
      }
    } catch (error) {
      console.error('Error sending money:', error);
      throw error;
    }
  }

  // Internal transfer (wallet-to-wallet, instant, zero-fee)
  private async processInternalTransfer(request: TransferRequest): Promise<TransferResult> {
    const { amount, recipientId, description } = request;
    const fee = 0; // Zero fee for wallet-to-wallet
    
    // Check wallet balance
    const balance = await this.getWalletBalance();
    if (balance.available < amount) {
      throw new Error('Insufficient wallet balance');
    }

    // Create transaction in escrow state
    const transactionId = await this.createTransaction({
      type: 'debit',
      amount,
      description: description || 'Money sent',
      recipientId,
      status: 'pending'
    });

    // Debit sender wallet
    await this.updateWalletBalance(this.currentUser.$id, -amount);

    // Credit recipient wallet instantly
    await this.updateWalletBalance(recipientId!, amount);

    // Update transaction to successful
    await AppwriteService.updateTransaction(transactionId, {
      status: 'successful'
    });

    // Send notifications
    await notificationService.sendMoneySentNotification({
      transactionId,
      amount,
      currency: '₦',
      senderName: this.currentUser?.firstName || 'You',
      recipientName: 'Recipient Name', // Get from user profile
      settlementType: 'internal'
    });

    return {
      success: true,
      transactionId,
      type: 'internal',
      settlementType: 'instant',
      fee,
      message: 'Transfer completed instantly'
    };
  }

  // External transfer (wallet-to-bank, uses Paystack, has fee)
  private async processExternalTransfer(request: TransferRequest): Promise<TransferResult> {
    const { amount, recipientAccount, recipientBank, description } = request;
    const fee = 25; // ₦25 fee for external transfers
    const totalDebit = amount + fee;
    
    // Check wallet balance
    const balance = await this.getWalletBalance();
    if (balance.available < totalDebit) {
      throw new Error('Insufficient funds (including ₦25 fee)');
    }

    // Create transaction in escrow state
    const transactionId = await this.createTransaction({
      type: 'debit',
      amount: totalDebit,
      description: description || 'Bank transfer',
      recipientAccount,
      recipientBank,
      status: 'pending'
    });

    // Debit sender wallet (amount + fee)
    await this.updateWalletBalance(this.currentUser.$id, -totalDebit);

    // Push to bank settlement queue via Paystack
    try {
      const paystackResponse = await PaystackService.initiateTransfer({
        source: 'balance',
        amount: amount * 100, // Convert to kobo
        recipient: recipientAccount!, // Recipient code from Paystack
        reason: description || 'KotaPay transfer'
      });

      // Update transaction with Paystack reference
      await AppwriteService.updateTransaction(transactionId, {
        paystackReference: paystackResponse.data.reference,
        status: 'successful'
      });

      // Send notification
      await notificationService.sendMoneySentNotification({
        transactionId,
        amount,
        currency: '₦',
        senderName: this.currentUser?.firstName || 'You',
        recipientName: recipientAccount!,
        settlementType: 'external',
        estimatedSettlement: 'Next business day'
      });

      return {
        success: true,
        transactionId,
        type: 'external',
        settlementType: 'next_cycle',
        estimatedSettlement: 'Next business day',
        fee,
        message: 'Transfer initiated, settlement in 1-3 business days',
        reference: paystackResponse.data.reference
      };

    } catch (error) {
      // Reverse wallet debit if Paystack fails
      await this.updateWalletBalance(this.currentUser.$id, totalDebit);
      await AppwriteService.updateTransaction(transactionId, {
        status: 'failed'
      });
      throw error;
    }
  }

  // Top up wallet (refill by bank transfer/card)
  async topUpWallet(request: TopUpRequest): Promise<TransferResult> {
    const { amount, method } = request;
    
    try {
      if (method === 'card') {
        // Card top-up with 1.5% fee
        const fee = Math.round(amount * 0.015);
        const totalCharge = amount + fee;

        const paymentResponse = await PaystackService.initializePayment({
          email: this.currentUser?.email || 'user@kotapay.com',
          amount: totalCharge * 100, // Convert to kobo
          callback_url: 'https://kotapay.com/payment/callback',
          metadata: {
            userId: this.currentUser?.$id,
            type: 'wallet_topup'
          }
        });

        return {
          success: true,
          transactionId: paymentResponse.data.reference,
          type: 'external',
          settlementType: 'pending',
          fee,
          message: 'Complete payment to add funds to wallet',
          reference: paymentResponse.data.reference
        };

      } else if (method === 'bank_transfer') {
        // Generate virtual account for bank transfer
        const virtualAccount = await this.generateVirtualAccount();
        
        return {
          success: true,
          transactionId: `bank_topup_${Date.now()}`,
          type: 'external',
          settlementType: 'pending',
          fee: 0,
          message: `Transfer ₦${amount} to account ${virtualAccount} to top up wallet`
        };
      }

      throw new Error('Unsupported top-up method');
    } catch (error) {
      console.error('Error topping up wallet:', error);
      throw error;
    }
  }

  // Withdraw from wallet to bank
  async withdrawFromWallet(request: WithdrawalRequest): Promise<TransferResult> {
    const { amount, destinationType, destination, pin } = request;
    
    // Validate PIN
    if (!this.validatePin(pin)) {
      throw new Error('Invalid PIN');
    }

    // Calculate fee based on destination
    const feeMap = {
      bank: 50,
      mobile_money: 25,
      agent: 75
    };
    const fee = feeMap[destinationType];
    const totalDebit = amount + fee;

    // Check balance
    const balance = await this.getWalletBalance();
    if (balance.available < totalDebit) {
      throw new Error(`Insufficient funds (including ₦${fee} fee)`);
    }

    // Process withdrawal based on destination type
    if (destinationType === 'bank') {
      return await this.processExternalTransfer({
        recipientAccount: destination.bankAccount!,
        recipientBank: destination.bankCode!,
        amount,
        description: 'Wallet withdrawal',
        fundingSource: 'wallet',
        pin
      });
    }

    // For mobile money and agent pickup, implement specific logic
    throw new Error('Destination type not yet implemented');
  }

  // Utility methods
  private async isInternalRecipient(identifier?: string): Promise<boolean> {
    if (!identifier) return false;
    
    // Check if user exists in KotaPay system
    try {
      const user = await AppwriteService.getUserProfile(identifier);
      return !!user;
    } catch {
      return false;
    }
  }

  private validatePin(pin: string): boolean {
    // Mock PIN validation - replace with secure implementation
    return pin === '1234';
  }

  private async createTransaction(data: Partial<Transaction>): Promise<string> {
    const transaction = await AppwriteService.createTransaction({
      userId: this.currentUser.$id,
      type: data.type || 'debit',
      amount: data.amount || 0,
      description: data.description || '',
      reference: `tx_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      status: data.status || 'pending',
      recipientId: data.recipientId,
      recipientAccount: data.recipientAccount,
      recipientBank: data.recipientBank,
      paystackReference: data.paystackReference
    });
    
    return transaction.$id;
  }

  private async updateWalletBalance(userId: string, amount: number): Promise<void> {
    const userProfile = await AppwriteService.getUserProfile(userId);
    if (!userProfile) {
      throw new Error(`User profile not found for userId: ${userId}`);
    }
    
    const currentBalance = userProfile.walletBalance || 0;
    
    await AppwriteService.updateUserProfile(userProfile.$id, {
      walletBalance: currentBalance + amount
    });
  }

  // Public method to update wallet balance after successful top-up
  async processTopUpSuccess(reference: string, amount: number, metadata: any = {}): Promise<void> {
    if (!this.currentUser) {
      throw new Error('User not initialized');
    }

    try {
      // Update wallet balance
      await this.updateWalletBalance(this.currentUser.$id, amount);

      // Create transaction record
      await this.createTransaction({
        type: 'credit',
        amount,
        description: `Wallet top-up via ${metadata.paymentMethod || 'Card'} - ₦${amount.toLocaleString()}`,
        reference,
        status: 'successful'
      });

      // Send notification
      await notificationService.sendWalletTopUpNotification(
        reference,
        amount,
        '₦',
        metadata.paymentMethod || 'Card Payment'
      );

      console.log('Top-up processed successfully:', { reference, amount });
    } catch (error) {
      console.error('Error processing top-up success:', error);
      throw error;
    }
  }

  private async getPendingTransactions(): Promise<Transaction[]> {
    if (!this.currentUser) return [];
    
    return await AppwriteService.getUserTransactions(this.currentUser.$id);
  }

  private async generateVirtualAccount(): Promise<string> {
    // Mock virtual account generation
    return `9876543210`; // Return actual virtual account from payment provider
  }

  // Handle payment webhooks (for card top-ups, bank transfers)
  async handlePaymentWebhook(reference: string, status: 'success' | 'failed'): Promise<void> {
    try {
      if (status === 'success') {
        const payment = await PaystackService.verifyPayment(reference);
        const amount = payment.data.amount / 100; // Convert from kobo
        
        // Credit user wallet
        await this.updateWalletBalance(this.currentUser.$id, amount);
        
        // Send notification
        await notificationService.sendWalletTopUpNotification(
          reference,
          amount,
          '₦',
          'Card Payment'
        );
      }
    } catch (error) {
      console.error('Error handling payment webhook:', error);
    }
  }
}

export const walletService = new WalletService();
export default walletService;
