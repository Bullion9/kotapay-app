/**
 * KotaPay Wallet vs Bank Logic - Usage Examples
 * 
 * This file demonstrates the implementation of your core architecture:
 * "KotaPay is a bank-centric, wallet-augmented, social-first money-movement engine."
 * 
 * 🔄 CURRENT MODE: MOCK/SIMULATION MODE
 * 
 * Due to missing Appwrite database collections, some examples run in mock mode.
 * To enable full functionality:
 * 1. Create required collections in Appwrite Console
 * 2. Follow the DATABASE_SETUP_GUIDE.md
 * 3. Tap "Setup DB" button on home screen for instructions
 * 
 * Mock examples show expected behavior and console output.
 */

import { walletService } from './WalletService';
import { notificationService } from './notifications';
import PaymentRequestService from './PaymentRequestService';

// Example usage scenarios based on your architecture

export class KotaPayTransactionExamples {
  private paymentRequestService: PaymentRequestService;

  constructor() {
    this.paymentRequestService = new PaymentRequestService();
  }

  // SCENARIO 1: User Onboarding & Identity (KYC Levels) - MOCK VERSION
  async onboardingFlow() {
    console.log('🆔 USER ONBOARDING & IDENTITY (MOCK MODE)');
    
    try {
      // Step 1: User registration (simulated)
      console.log('📝 Step 1: User Registration (Mock)');
      
      // Mock KYC profile initialization (since DB doesn't exist yet)
      console.log('✅ KYC profile created (mock) - Current Tier: 1');
      
      // Step 2: Phone verification (simulated)
      console.log('📱 Step 2: Phone Verification (Mock)');
      const otpCode = '123456'; // Mock OTP
      console.log(`📨 OTP sent (mock): ${otpCode}`);
      
      const phoneVerified = true; // Mock verification
      console.log(`✅ Phone verified (mock): ${phoneVerified}`);
      
      // Step 3: Basic information (simulated)
      console.log('👤 Step 3: Basic Information (Mock)');
      console.log('✅ Basic info updated (mock) - Tier 1 complete!');
      console.log('🎉 Monthly limit unlocked: ₦5,000');
      
    } catch (error) {
      console.error('❌ Onboarding error:', error);
    }
  }

  // SCENARIO 2: KYC Tier Upgrade (Tier 1 → Tier 2) - MOCK VERSION
  async kycTierUpgrade() {
    console.log('📈 KYC TIER UPGRADE (Tier 1 → Tier 2) - MOCK MODE');
    
    try {
      // Upload government ID (simulated)
      console.log('📄 Uploading government ID (mock)...');
      const idDocumentId = 'mock_doc_id_001';
      console.log(`✅ Government ID uploaded (mock): ${idDocumentId}`);
      
      // Upload selfie for verification (simulated)
      console.log('🤳 Uploading selfie (mock)...');
      const selfieDocumentId = 'mock_selfie_001';
      console.log(`✅ Selfie uploaded (mock): ${selfieDocumentId}`);
      
      // Simulate verification process (3-5 seconds)
      console.log('⏳ Documents under review (mock)...');
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      console.log('🎉 Tier 2 verification complete (mock)!');
      console.log('💰 New monthly limit: ₦50,000');
      
    } catch (error) {
      console.error('❌ Tier upgrade error:', error);
    }
  }

  // SCENARIO 3: JWT Token Management & Device Binding - MOCK VERSION
  async authenticationFlow() {
    console.log('🔐 AUTHENTICATION & TOKEN MANAGEMENT (MOCK MODE)');
    
    try {
      // Login with credentials (simulated)
      console.log('🔑 Logging in (mock)...');
      const mockTokens = {
        accessToken: 'mock_access_token_123',
        refreshToken: 'mock_refresh_token_456',
        expiresAt: Date.now() + 3600000 // 1 hour from now
      };
      
      console.log('✅ Login successful (mock)');
      console.log(`🎫 Access token expires: ${new Date(mockTokens.expiresAt).toLocaleString()}`);
      
      // Mock user data
      const mockPayload = {
        email: 'john.doe@example.com',
        kycTier: 1,
        permissions: ['send_money', 'receive_money', 'view_balance']
      };
      
      console.log(`👤 User: ${mockPayload.email}`);
      console.log(`🎯 KYC Tier: ${mockPayload.kycTier}`);
      console.log(`🔒 Permissions: ${mockPayload.permissions.join(', ')}`);
      
      // Check specific permission
      const canSendMoney = mockPayload.permissions.includes('send_money');
      console.log(`💸 Can send money: ${canSendMoney}`);
      
      // Simulate token refresh
      console.log('🔄 Testing token refresh (mock)...');
      const refreshed = true; // Mock success
      console.log(`🔄 Token refresh: ${refreshed ? 'Success' : 'Failed'}`);
      
    } catch (error) {
      console.error('❌ Authentication error:', error);
    }
  }

  // SCENARIO 4: Transaction Limit Validation - MOCK VERSION
  async transactionLimitValidation() {
    console.log('⚖️ TRANSACTION LIMIT VALIDATION (MOCK MODE)');
    
    try {
      const attemptedAmount = 7500;
      
      // Mock limit check
      const mockLimitCheck = {
        canProceed: false,
        reason: 'Amount exceeds Tier 1 monthly limit (₦5,000)',
        currentTier: 1,
        monthlyRemaining: 0,
        dailyRemaining: 2000
      };
      
      if (mockLimitCheck.canProceed) {
        console.log(`✅ Transaction approved: ₦${attemptedAmount.toLocaleString()}`);
        console.log(`💰 Monthly remaining: ₦${mockLimitCheck.monthlyRemaining.toLocaleString()}`);
        console.log(`📅 Daily remaining: ₦${mockLimitCheck.dailyRemaining.toLocaleString()}`);
        
        console.log('📊 Spending limits updated (mock)');
        
      } else {
        console.log(`❌ Transaction blocked: ${mockLimitCheck.reason}`);
        console.log(`🎯 Current tier: ${mockLimitCheck.currentTier}`);
        
        // Suggest tier upgrade
        if (mockLimitCheck.currentTier < 3) {
          console.log('📱 Tier upgrade notification sent (mock)');
          console.log('� Suggestion: Upgrade to Tier 2 for ₦50,000 monthly limit');
        }
      }
      
    } catch (error) {
      console.error('❌ Limit validation error:', error);
    }
  }

  // SCENARIO 1: Wallet-to-Wallet Transfer (Internal, Instant, Zero-fee)
  async walletToWalletTransfer() {
    console.log('🔄 WALLET-TO-WALLET TRANSFER (Internal)');
    
    try {
      // Enable mock mode for testing
      walletService.enableMockMode(5000); // ₦5,000 mock balance
      
      const result = await walletService.sendMoney({
        recipientId: 'user456', // KotaPay user
        amount: 2000,
        description: 'Lunch money',
        fundingSource: 'wallet',
        pin: '1234'
      });

      console.log('✅ Result:', {
        type: result.type, // 'internal'
        settlement: result.settlementType, // 'instant'
        fee: result.fee, // 0
        message: result.message // 'Transfer completed instantly'
      });

    } catch (error) {
      console.error('❌ Error:', error);
    }
  }

  // SCENARIO 2: Wallet-to-Bank Transfer (External, Next-cycle, ₦25 fee)
  async walletToBankTransfer() {
    console.log('🏦 WALLET-TO-BANK TRANSFER (External)');
    
    try {
      // Enable mock mode for testing
      walletService.enableMockMode(5000); // ₦5,000 mock balance
      
      const result = await walletService.sendMoney({
        recipientAccount: '1234567890',
        recipientBank: 'First Bank Nigeria',
        amount: 3000,
        description: 'Payment for services',
        fundingSource: 'wallet',
        pin: '1234'
      });

      console.log('✅ Result:', {
        type: result.type, // 'external'
        settlement: result.settlementType, // 'next_cycle'
        fee: result.fee, // 25
        estimated: result.estimatedSettlement, // 'Next business day'
        message: result.message // 'Transfer initiated, settlement in 1-3 business days'
      });

    } catch (error) {
      console.error('❌ Error:', error);
    }
  }

  // SCENARIO 3: Card Top-up (1.5% fee, stored in wallet)
  async cardTopUp() {
    console.log('💳 CARD TOP-UP (Stored-value)');
    
    try {
      const result = await walletService.topUpWallet({
        amount: 20000,
        method: 'card',
        cardToken: 'card_token_123'
      });

      console.log('✅ Result:', {
        fee: result.fee, // 300 (1.5% of 20000)
        message: result.message, // 'Complete payment to add funds to wallet'
        reference: result.reference // Paystack reference for payment
      });

    } catch (error) {
      console.error('❌ Error:', error);
    }
  }

  // SCENARIO 4: Bank Transfer Top-up (Zero fee, virtual account)
  async bankTransferTopUp() {
    console.log('🏦 BANK TRANSFER TOP-UP');
    
    try {
      const result = await walletService.topUpWallet({
        amount: 50000,
        method: 'bank_transfer'
      });

      console.log('✅ Result:', {
        fee: result.fee, // 0
        message: result.message, // Instructions with virtual account
        type: result.type // 'external'
      });

    } catch (error) {
      console.error('❌ Error:', error);
    }
  }

  // SCENARIO 5: Insufficient Wallet Funds (Top-up & Send flow)
  async insufficientFundsFlow() {
    console.log('⚠️ INSUFFICIENT FUNDS SCENARIO');
    
    try {
      // This will fail due to insufficient funds
      await walletService.sendMoney({
        recipientId: 'user789',
        amount: 100000, // More than wallet balance
        fundingSource: 'wallet',
        pin: '1234'
      });

    } catch (error) {
      console.log('❌ Expected error:', error.message); // 'Insufficient wallet balance'
      
      // Trigger "top-up & send" notification
      await notificationService.sendInsufficientFundsNotification(
        100000, // attempted amount
        45000,  // current wallet balance
        '₦'
      );
      
      console.log('📱 Notification sent: Top-up suggestion');
    }
  }

  // SCENARIO 6: KYC Tier Limits (Based on your tier system)
  async kycTierLimitCheck() {
    console.log('🎯 KYC TIER LIMIT CHECK');
    
    const monthlySpent = 4500;
    const attemptedAmount = 1000;
    const tierLimit = 5000; // Tier 1: ₦5k monthly cap
    
    if (monthlySpent + attemptedAmount > tierLimit) {
      console.log('❌ Transaction blocked: Exceeds Tier 1 limit');
      
      // Send tier upgrade notification
      await notificationService.sendKYCTierUpgradeNotification(2, 50000);
      console.log('📱 Notification sent: Upgrade to Tier 2 for higher limits');
      
    } else {
      console.log('✅ Transaction within Tier 1 limits');
    }
  }

  // SCENARIO 7: Velocity Checks (Max 5 txns/minute)
  async velocityCheck() {
    console.log('🚀 VELOCITY CHECK (Max 5 txns/minute)');
    
    const recentTransactions = 5; // User made 5 transactions in last minute
    
    if (recentTransactions >= 5) {
      console.log('❌ Transaction blocked: Velocity limit reached');
      
      await notificationService.sendVelocityLimitNotification(5, '1 minute');
      console.log('📱 Notification sent: Velocity limit warning');
      
    } else {
      console.log('✅ Transaction within velocity limits');
    }
  }

  // SCENARIO 8: AML Screening (₦50k+ transactions)
  async amlScreening() {
    console.log('🔍 AML SCREENING (₦50k+ transactions)');
    
    const transactionAmount = 75000;
    
    if (transactionAmount >= 50000) {
      console.log('🔍 AML screening triggered for large transaction');
      
      // Mock AML API call
      const amlResult = await this.mockAMLCheck(transactionAmount);
      
      await notificationService.sendAMLScreeningNotification(
        'tx_large_001',
        amlResult.status
      );
      
      console.log(`📱 AML result: ${amlResult.status}`);
    }
  }

  // SCENARIO 9: Settlement Reconciliation (Bank vs Ledger)
  async settlementReconciliation() {
    console.log('⚖️ SETTLEMENT RECONCILIATION');
    
    // Mock internal ledger vs bank statement reconciliation
    const internalLedger = [
      { id: 'tx_001', amount: 10000, status: 'completed' },
      { id: 'tx_002', amount: 5000, status: 'pending' }
    ];
    
    const bankStatements = [
      { reference: 'tx_001', amount: 10000, settled: true }
      // tx_002 not yet in bank statement
    ];
    
    // Reconciliation logic
    internalLedger.forEach(async (tx) => {
      const bankTx = bankStatements.find(b => b.reference === tx.id);
      
      if (bankTx && bankTx.settled && tx.status === 'pending') {
        console.log(`✅ Settlement confirmed for ${tx.id}`);
        
        await notificationService.sendSettlementNotification(
          tx.id,
          tx.amount,
          '₦',
          'external'
        );
      } else if (!bankTx && tx.status === 'pending') {
        console.log(`⏳ ${tx.id} still pending bank settlement`);
      }
    });
  }

  // SCENARIO 10: Chargeback Handling (Auto-refund wallet)
  async chargebackHandling() {
    console.log('🔄 CHARGEBACK HANDLING');
    
    const originalTransaction = {
      id: 'tx_dispute_001',
      amount: 15000,
      userId: 'user123'
    };
    
    // Mock chargeback from bank
    console.log('🏦 Bank initiated chargeback');
    
    // Auto-refund to wallet
    await walletService.handlePaymentWebhook(
      `chargeback_${originalTransaction.id}`,
      'success'
    );
    
    await notificationService.sendChargebackNotification(
      originalTransaction.id,
      originalTransaction.amount,
      'Disputed transaction reversed by bank'
    );
    
    console.log('💰 Wallet refunded automatically');
  }

  // Helper method for mock AML check
  private async mockAMLCheck(amount: number): Promise<{ status: 'passed' | 'flagged' | 'pending' }> {
    // Simulate AML API delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Mock risk scoring
    if (amount > 100000) {
      return { status: 'flagged' };
    } else if (amount > 75000) {
      return { status: 'pending' };
    } else {
      return { status: 'passed' };
    }
  }

  // SCENARIO 11: Bill Split (Social layer)
  async billSplitFlow() {
    console.log('🧾 BILL SPLIT (Social Layer)');
    
    const billDetails = {
      totalAmount: 12000,
      description: 'Restaurant dinner',
      organizer: 'John Doe',
      participants: ['user456', 'user789', 'user101']
    };
    
    const amountPerPerson = billDetails.totalAmount / (billDetails.participants.length + 1);
    
    // Send split requests to all participants
    billDetails.participants.forEach(async (participantId) => {
      await notificationService.sendBillSplitInviteNotification(
        'split_001',
        amountPerPerson,
        '₦',
        billDetails.organizer,
        billDetails.description
      );
    });
    
    console.log(`📱 Split requests sent: ₦${amountPerPerson} each to ${billDetails.participants.length} friends`);
  }

  // Comprehensive demonstration - MOCK VERSION
  async demonstrateKotaPayArchitecture() {
    console.log('\n🚀 KOTAPAY ARCHITECTURE DEMONSTRATION (MOCK MODE)\n');
    console.log('="'.repeat(40));
    
    // Mock wallet initialization (since DB doesn't exist yet)
    console.log('✅ Wallet service initialized (mock) for user123');
    
    // Mock wallet balance (stored-value)
    const mockBalance = {
      available: 2847.50,
      pending: 0,
      total: 2847.50,
      currency: '₦',
      lastUpdated: new Date().toISOString()
    };
    console.log(`💰 Wallet Balance: ₦${mockBalance.available.toLocaleString()}`);
    
    // Mock funding sources (wallet + banks)
    const mockSources = [
      { type: 'wallet', name: 'KotaPay Wallet' },
      { type: 'bank', name: 'First Bank Nigeria' }
    ];
    console.log(`🏦 Funding Sources: ${mockSources.length} available`);
    
    console.log('\n📋 Running scenarios...\n');
    
    // NEW: Identity & Onboarding scenarios
    await this.onboardingFlow();
    console.log('');
    
    await this.kycTierUpgrade();
    console.log('');
    
    await this.authenticationFlow();
    console.log('');
    
    await this.transactionLimitValidation();
    console.log('');
    
    // Existing wallet scenarios
    await this.walletToWalletTransfer();
    console.log('');
    
    await this.walletToBankTransfer();
    console.log('');
    
    await this.cardTopUp();
    console.log('');
    
    await this.insufficientFundsFlow();
    console.log('');
    
    await this.kycTierLimitCheck();
    console.log('');
    
    await this.velocityCheck();
    console.log('');
    
    await this.amlScreening();
    console.log('');
    
    await this.billSplitFlow();
    
    console.log('');
    await this.paymentRequestFlow();
    
    console.log('\n✅ Complete architecture demonstration finished!');
    console.log('🎯 Showcased: Identity, KYC, Auth, Wallet, Bank, Social, Payment Requests');
    console.log('="'.repeat(30));
  }

  // SCENARIO 12: Payment Request & QR Code Examples - MOCK VERSION
  async paymentRequestFlow() {
    console.log('💰 PAYMENT REQUEST & QR CODE FLOW (MOCK MODE)');
    
    try {
      // Create payment link (simulated)
      console.log('🔗 Creating payment link (mock)...');
      const mockPaymentLink = {
        id: 'req_' + Date.now(),
        linkUrl: 'https://kotapay.app/pay/mock123abc',
        amount: 5000,
        description: 'Split dinner bill at Chicken Republic',
        status: 'pending',
        expiresAt: new Date(Date.now() + 48 * 60 * 60 * 1000).toISOString()
      };

      console.log(`✅ Payment link created (mock): ${mockPaymentLink.linkUrl}`);
      console.log(`💰 Amount: ₦${mockPaymentLink.amount.toLocaleString()}`);
      console.log(`⏰ Expires: ${new Date(mockPaymentLink.expiresAt).toLocaleString()}`);

      // Create QR payment request (simulated)
      console.log('\n📱 Creating QR payment request (mock)...');
      const mockQrRequest = {
        id: 'qr_' + Date.now(),
        amount: 2500,
        description: 'Coffee and snacks',
        qrData: JSON.stringify({
          userId: 'user456',
          amount: 2500,
          note: 'Coffee and snacks',
          requestId: 'qr_' + Date.now(),
          timestamp: Date.now(),
          version: '1.0'
        }),
        status: 'pending'
      };

      console.log(`✅ QR request created (mock)`);
      console.log(`💰 Amount: ₦${mockQrRequest.amount.toLocaleString()}`);
      
      // Simulate QR scan and payment
      console.log('\n📱 Processing QR payment (mock)...');
      const mockQrPayment = {
        ...mockQrRequest,
        status: 'paid',
        paidAt: new Date().toISOString(),
        payerName: 'John Doe'
      };
      console.log(`✅ QR payment completed (mock): ${mockQrPayment.status}`);
      console.log(`💸 Paid by: ${mockQrPayment.payerName}`);

      // Create direct payment request (simulated)
      console.log('\n💳 Creating direct payment request (mock)...');
      const mockDirectRequest = {
        id: 'direct_' + Date.now(),
        requesterId: 'user111',
        payerId: 'user222',
        amount: 7500,
        description: 'Uber ride fare',
        status: 'pending',
        requesterName: 'Alice Johnson',
        payerName: 'Bob Smith'
      };

      console.log(`✅ Direct request sent (mock) to ${mockDirectRequest.payerName}`);
      console.log(`💰 Amount: ₦${mockDirectRequest.amount.toLocaleString()}`);
      
      // Show payment requests (simulated)
      console.log('\n📋 Fetching payment requests (mock)...');
      const mockRequests = [
        mockPaymentLink,
        mockQrRequest,
        mockDirectRequest
      ];
      console.log(`📊 Total requests: ${mockRequests.length}`);
      
      mockRequests.forEach(request => {
        const type = request.id.includes('req_') ? 'link' : 
                    request.id.includes('qr_') ? 'qr' : 'direct';
        console.log(`  ${type} | ₦${request.amount.toLocaleString()} | ${request.status} | ${request.description}`);
      });

      console.log('\n🎉 Payment request demo completed successfully!');
      console.log('💡 Note: This is mock data. Real functionality requires database setup.');

    } catch (error) {
      console.error('❌ Payment request flow error:', error);
    }
  }
}

// Export for use in your app
export const kotaPayExamples = new KotaPayTransactionExamples();
