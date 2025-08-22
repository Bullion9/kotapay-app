/**
 * KotaPay Fees & Social Features Test
 * 
 * Tests the fees & revenue system and social features
 */

import { feesRevenueService } from '../services/FeesRevenueService';
import { socialFeaturesService } from '../services/SocialFeaturesService';

// Test Fees & Revenue Features
export const testFeesRevenueFeatures = async () => {
  console.log('💰 Testing KotaPay Fees & Revenue Features...\n');

  try {
    // Test 1: Wallet-to-wallet transfer (free)
    console.log('1. Testing Wallet-to-Wallet Fee (Free)...');
    const walletToWalletFee = feesRevenueService.calculateFee('wallet_to_wallet', 500000); // ₦5,000
    console.log('✅ Wallet-to-wallet fee:', {
      amount: `₦${(walletToWalletFee.transactionAmount / 100).toFixed(2)}`,
      fee: `₦${(walletToWalletFee.feeAmount / 100).toFixed(2)}`,
      total: `₦${(walletToWalletFee.totalAmount / 100).toFixed(2)}`,
      description: walletToWalletFee.feeDescription
    }, '\n');

    // Test 2: Wallet-to-bank transfer (₦25 fee)
    console.log('2. Testing Wallet-to-Bank Fee...');
    const bankTransferFee = feesRevenueService.calculateFee('wallet_to_bank_instant', 5000000); // ₦50,000
    console.log('✅ Bank transfer fee:', {
      amount: `₦${(bankTransferFee.transactionAmount / 100).toFixed(2)}`,
      fee: `₦${(bankTransferFee.feeAmount / 100).toFixed(2)}`,
      total: `₦${(bankTransferFee.totalAmount / 100).toFixed(2)}`,
      kotapayRevenue: `₦${(bankTransferFee.revenueBreakdown.kotapayRevenue / 100).toFixed(2)}`,
      partnerRevenue: `₦${(bankTransferFee.revenueBreakdown.partnerRevenue / 100).toFixed(2)}`
    }, '\n');

    // Test 3: Card top-up (1.5% fee)
    console.log('3. Testing Card Top-up Fee (1.5%)...');
    const cardTopupFee = feesRevenueService.calculateFee('card_topup', 1000000); // ₦10,000
    console.log('✅ Card top-up fee:', {
      amount: `₦${(cardTopupFee.transactionAmount / 100).toFixed(2)}`,
      fee: `₦${(cardTopupFee.feeAmount / 100).toFixed(2)}`,
      total: `₦${(cardTopupFee.totalAmount / 100).toFixed(2)}`,
      percentage: '1.5%',
      kotapayRevenue: `₦${(cardTopupFee.revenueBreakdown.kotapayRevenue / 100).toFixed(2)}`,
      partnerRevenue: `₦${(cardTopupFee.revenueBreakdown.partnerRevenue / 100).toFixed(2)}`
    }, '\n');

    // Test 4: Revenue Recording
    console.log('4. Testing Revenue Recording...');
    await feesRevenueService.recordRevenue('txn_test_001', bankTransferFee, 'wallet_to_bank_instant');
    console.log('✅ Revenue recorded successfully\n');

    // Test 5: Revenue Analytics
    console.log('5. Testing Revenue Analytics...');
    const analytics = feesRevenueService.getRevenueAnalytics('2025-08-01', '2025-08-22');
    console.log('✅ Revenue analytics:', analytics, '\n');

    // Test 6: Transaction Cost Estimation
    console.log('6. Testing Transaction Cost Estimation...');
    const estimation = feesRevenueService.estimateTransactionCost('card_topup', 2000000); // ₦20,000
    console.log('✅ Cost estimation:', {
      fee: `₦${(estimation.fee / 100).toFixed(2)}`,
      total: `₦${(estimation.total / 100).toFixed(2)}`,
      description: estimation.description
    }, '\n');

    console.log('🎉 All fees & revenue tests completed successfully!\n');
    
  } catch (error) {
    console.error('❌ Fees & revenue test failed:', error);
  }
};

// Test Social Features
export const testSocialFeatures = async () => {
  console.log('👥 Testing KotaPay Social Features...\n');

  try {
    // Test 1: Contact Sync
    console.log('1. Testing Contact Sync...');
    const mockContacts = [
      { name: 'John Doe', phoneNumber: '+2348012345678' },
      { name: 'Jane Smith', phoneNumber: '+2348087654321' },
      { name: 'Bob Wilson', phoneNumber: '+2348055555555' },
      { name: 'Alice Brown', phoneNumber: '+2348099999999' }
    ];
    
    const syncedContacts = await socialFeaturesService.syncContacts(mockContacts);
    console.log('✅ Contact sync completed:', {
      total: syncedContacts.length,
      kotapayUsers: syncedContacts.filter(c => c.isKotaPayUser).length,
      regularContacts: syncedContacts.filter(c => !c.isKotaPayUser).length
    }, '\n');

    // Test 2: Get KotaPay Contacts
    console.log('2. Getting KotaPay Contacts...');
    const kotapayContacts = await socialFeaturesService.getKotaPayContacts();
    console.log('✅ KotaPay contacts:', kotapayContacts.length, '\n');

    // Test 3: Create Split Bill
    console.log('3. Testing Split Bill Creation...');
    const splitBill = await socialFeaturesService.createSplitBill({
      title: 'Group Dinner at Restaurant',
      description: 'Amazing dinner with friends at Lagos Continental',
      totalAmount: 2400000, // ₦24,000
      creatorId: 'user_creator_123',
      members: [
        { userId: 'user_001', name: 'John Doe', phoneNumber: '+2348012345678', amount: 800000 }, // ₦8,000
        { userId: 'user_002', name: 'Jane Smith', phoneNumber: '+2348087654321', amount: 800000 }, // ₦8,000
        { userId: 'user_003', name: 'Bob Wilson', phoneNumber: '+2348055555555', amount: 800000 } // ₦8,000
      ]
    });
    
    console.log('✅ Split bill created:', {
      id: splitBill.id,
      title: splitBill.title,
      total: `₦${(splitBill.totalAmount / 100).toFixed(2)}`,
      members: splitBill.members.length,
      status: splitBill.status
    }, '\n');

    // Test 4: Pay Split Bill Share
    console.log('4. Testing Split Bill Payment...');
    const paymentResult = await socialFeaturesService.paySplitBillShare(
      splitBill.id,
      'user_001',
      '1234' // PIN
    );
    console.log('✅ Split bill payment:', paymentResult, '\n');

    // Test 5: Get User Split Bills
    console.log('5. Getting User Split Bills...');
    const userSplitBills = await socialFeaturesService.getUserSplitBills('user_001');
    console.log('✅ User split bills:', userSplitBills.length, '\n');

    // Test 6: Create Chat Thread
    console.log('6. Testing Chat Thread Creation...');
    const chatThread = await socialFeaturesService.createChatThread(
      'txn_test_chat_001',
      ['user_001', 'user_002']
    );
    console.log('✅ Chat thread created:', {
      id: chatThread.id,
      transactionId: chatThread.transactionId,
      participants: chatThread.participants.length
    }, '\n');

    // Test 7: Send Chat Message
    console.log('7. Testing Chat Messaging...');
    const chatMessage = await socialFeaturesService.sendChatMessage({
      threadId: chatThread.id,
      transactionId: chatThread.transactionId,
      senderId: 'user_001',
      senderName: 'John Doe',
      message: 'Payment sent! Thanks for the dinner 🍽️',
      messageType: 'text'
    });
    console.log('✅ Chat message sent:', {
      id: chatMessage.id,
      message: chatMessage.message,
      type: chatMessage.messageType,
      status: chatMessage.status
    }, '\n');

    // Test 8: Get Chat Messages
    console.log('8. Getting Chat Messages...');
    const messages = await socialFeaturesService.getChatMessages(chatThread.transactionId);
    console.log('✅ Chat messages retrieved:', messages.length, '\n');

    console.log('🎉 All social features tests completed successfully!\n');
    
  } catch (error) {
    console.error('❌ Social features test failed:', error);
  }
};

// Run All Tests
export const runFeesAndSocialTests = async () => {
  console.log('🚀 Starting KotaPay Fees & Social Features Tests...\n');
  console.log('='.repeat(60) + '\n');
  
  await testFeesRevenueFeatures();
  console.log('='.repeat(60) + '\n');
  
  await testSocialFeatures();
  console.log('='.repeat(60) + '\n');
  
  console.log('✅ All fees and social features tests completed! 🎉');
};

// Example usage in development
if (__DEV__) {
  // Uncomment to run tests
  // runFeesAndSocialTests();
}
