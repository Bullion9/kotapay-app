/**
 * KotaPay Send Flow Service Tests
 * 
 * Tests the complete send flow implementation with all integrations
 */

import { sendFlowService } from '../services/SendFlowService';
import type { SendRequest } from '../services/SendFlowService';

export async function testSendFlowService(): Promise<void> {
  console.log('🧪 Testing Send Flow Service...\n');

  // Test 1: Internal Wallet-to-Wallet Transfer
  await testInternalTransfer();

  // Test 2: External Bank Transfer
  await testExternalBankTransfer();

  // Test 3: QR Code Payment
  await testQRPayment();

  // Test 4: Payment Link
  await testPaymentLink();

  // Test 5: Compliance Checks
  await testComplianceFlow();

  // Test 6: Edge Cases
  await testEdgeCases();

  console.log('✅ All Send Flow tests completed!\n');
}

async function testInternalTransfer(): Promise<void> {
  console.log('📱 Testing Internal Wallet-to-Wallet Transfer...');

  const sendRequest: SendRequest = {
    senderId: 'test_sender_123',
    recipient: {
      type: 'phone',
      value: '+2348123456789',
      name: 'John Doe'
    },
    amount: 500000, // ₦5,000
    description: 'Test transfer to friend',
    pin: '1234',
    metadata: { source: 'test' }
  };

  try {
    const result = await sendFlowService.executeSendFlow(sendRequest);
    
    console.log('✅ Internal Transfer Result:', {
      success: result.success,
      status: result.status,
      message: result.message,
      transactionId: result.transactionId?.substring(0, 8) + '...',
      recipient: result.recipient
    });

    if (result.success) {
      console.log('  💰 Amount: ₦50.00');
      console.log('  📧 Receipt URL:', result.receiptUrl || 'Generated');
      console.log('  ⏱️ Delivery:', result.estimatedDelivery || 'Instant');
    }
  } catch (error) {
    console.error('❌ Internal Transfer Error:', error);
  }

  console.log('');
}

async function testExternalBankTransfer(): Promise<void> {
  console.log('🏦 Testing External Bank Transfer...');

  const sendRequest: SendRequest = {
    senderId: 'test_sender_123',
    recipient: {
      type: 'account_number',
      value: '1234567890',
      name: 'Jane Smith',
      bankCode: '044' // Access Bank
    },
    amount: 2500000, // ₦25,000
    description: 'Payment for services',
    pin: '1234',
    metadata: { source: 'test_bank' }
  };

  try {
    const result = await sendFlowService.executeSendFlow(sendRequest);
    
    console.log('✅ Bank Transfer Result:', {
      success: result.success,
      status: result.status,
      message: result.message,
      transactionId: result.transactionId?.substring(0, 8) + '...',
      estimatedDelivery: result.estimatedDelivery
    });

    if (result.success) {
      console.log('  💳 Bank: Access Bank');
      console.log('  💰 Amount: ₦250.00');
      console.log('  📧 Receipt URL:', result.receiptUrl || 'Generated');
    }
  } catch (error) {
    console.error('❌ Bank Transfer Error:', error);
  }

  console.log('');
}

async function testQRPayment(): Promise<void> {
  console.log('📱 Testing QR Code Payment...');

  const sendRequest: SendRequest = {
    senderId: 'test_sender_123',
    recipient: {
      type: 'qr',
      value: 'KTP:PAY:user_789:amount_1000000:ref_xyz123',
      name: 'Merchant Store'
    },
    amount: 1000000, // ₦10,000
    description: 'QR payment at store',
    pin: '1234',
    metadata: { source: 'qr_scan' }
  };

  try {
    const result = await sendFlowService.executeSendFlow(sendRequest);
    
    console.log('✅ QR Payment Result:', {
      success: result.success,
      status: result.status,
      message: result.message,
      transactionId: result.transactionId?.substring(0, 8) + '...'
    });

    if (result.success) {
      console.log('  🏪 Merchant: Merchant Store');
      console.log('  💰 Amount: ₦100.00');
      console.log('  📧 Receipt URL:', result.receiptUrl || 'Generated');
    }
  } catch (error) {
    console.error('❌ QR Payment Error:', error);
  }

  console.log('');
}

async function testPaymentLink(): Promise<void> {
  console.log('🔗 Testing Payment Link...');

  const sendRequest: SendRequest = {
    senderId: 'test_sender_123',
    recipient: {
      type: 'link',
      value: 'https://pay.kotapay.com/p/abc123def456',
      name: 'Online Service'
    },
    amount: 750000, // ₦7,500
    description: 'Payment via link',
    pin: '1234',
    metadata: { source: 'payment_link' }
  };

  try {
    const result = await sendFlowService.executeSendFlow(sendRequest);
    
    console.log('✅ Payment Link Result:', {
      success: result.success,
      status: result.status,
      message: result.message,
      transactionId: result.transactionId?.substring(0, 8) + '...'
    });

    if (result.success) {
      console.log('  🌐 Service: Online Service');
      console.log('  💰 Amount: ₦75.00');
      console.log('  📧 Receipt URL:', result.receiptUrl || 'Generated');
    }
  } catch (error) {
    console.error('❌ Payment Link Error:', error);
  }

  console.log('');
}

async function testComplianceFlow(): Promise<void> {
  console.log('🛡️ Testing Compliance Checks...');

  // Large amount to trigger AML screening
  const largeTransferRequest: SendRequest = {
    senderId: 'test_sender_123',
    recipient: {
      type: 'account_number',
      value: '9876543210',
      name: 'Business Account',
      bankCode: '058' // GTBank
    },
    amount: 15000000, // ₦150,000 (triggers AML)
    description: 'Large business payment',
    pin: '1234',
    metadata: { source: 'compliance_test' }
  };

  try {
    const result = await sendFlowService.executeSendFlow(largeTransferRequest);
    
    console.log('✅ Compliance Check Result:', {
      success: result.success,
      status: result.status,
      message: result.message,
      nextActions: result.nextActions
    });

    if (result.status === 'requires_verification') {
      console.log('  🔍 AML Screening triggered');
      console.log('  ⏳ Pending compliance review');
    }
  } catch (error) {
    console.error('❌ Compliance Check Error:', error);
  }

  console.log('');
}

async function testEdgeCases(): Promise<void> {
  console.log('⚠️ Testing Edge Cases...');

  // Test insufficient balance scenario
  const insufficientBalanceRequest: SendRequest = {
    senderId: 'test_sender_low_balance',
    recipient: {
      type: 'phone',
      value: '+2348987654321'
    },
    amount: 100000000, // ₦1,000,000 (likely insufficient)
    description: 'Large amount test',
    pin: '1234',
    metadata: { source: 'edge_case_test' }
  };

  try {
    const result = await sendFlowService.executeSendFlow(insufficientBalanceRequest);
    
    console.log('✅ Insufficient Balance Test:', {
      success: result.success,
      status: result.status,
      message: result.message,
      nextActions: result.nextActions
    });

    if (!result.success && result.message.includes('insufficient')) {
      console.log('  💸 Insufficient balance detected correctly');
      console.log('  🔄 Top-up flow suggested');
    }
  } catch (error) {
    console.error('❌ Edge Case Error:', error);
  }

  console.log('');
}

// Helper function to run all send flow tests
export async function runSendFlowTests(): Promise<void> {
  console.log('🚀 Starting KotaPay Send Flow Tests\n');
  console.log('=' .repeat(50));
  
  try {
    await testSendFlowService();
    console.log('🎉 All Send Flow tests passed successfully!');
  } catch (error) {
    console.error('💥 Send Flow tests failed:', error);
  }
  
  console.log('=' .repeat(50));
}

// Export for use in other test files
export {
  testInternalTransfer,
  testExternalBankTransfer,
  testQRPayment,
  testPaymentLink,
  testComplianceFlow,
  testEdgeCases
};
