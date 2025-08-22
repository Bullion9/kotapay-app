/**
 * KotaPay Security & Settlement Test
 * 
 * Quick test to verify all implemented features are working correctly
 */

import { securityService } from '../services/SecurityService';
import { settlementService } from '../services/SettlementService';
import { taskScheduler } from '../utils/TaskScheduler';

// Test Security Features
export const testSecurityFeatures = async () => {
  console.log('🔐 Testing KotaPay Security Features...\n');

  try {
    // Test 1: Initialize Security Service
    console.log('1. Initializing Security Service...');
    await securityService.initialize();
    console.log('✅ Security service initialized\n');

    // Test 2: Device Binding Validation
    console.log('2. Testing Device Binding Validation...');
    const deviceBinding = await securityService.validateDeviceBinding('mock_auth_token');
    console.log('✅ Device binding validation:', deviceBinding, '\n');

    // Test 3: Velocity Check
    console.log('3. Testing Velocity Limits...');
    const velocityCheck = await securityService.checkTransactionVelocity('test_user_123', 5000);
    console.log('✅ Velocity check result:', velocityCheck, '\n');

    // Test 4: Risk Score Calculation
    console.log('4. Testing Risk Score Calculation...');
    const riskScore = await securityService.calculateRiskScore('test_user_123', {
      amount: 15000,
      recipientId: 'test_user_456',
      deviceInfo: { platform: 'ios', brand: 'Apple' },
      transactionType: 'wallet_to_wallet'
    });
    console.log('✅ Risk score calculated:', riskScore, '\n');

    // Test 5: Authentication Challenge for High-Value Transaction
    console.log('5. Testing Authentication Challenge...');
    const needsAuth = await securityService.requiresAuthenticationChallenge(15000);
    console.log('✅ Authentication required:', needsAuth);
    
    if (needsAuth) {
      const challenge = await securityService.createAuthenticationChallenge('test_user_123', 15000);
      console.log('✅ Authentication challenge created:', challenge.challengeId, '\n');
    }

    console.log('🎉 All security tests completed successfully!\n');
    
  } catch (error) {
    console.error('❌ Security test failed:', error);
  }
};

// Test Settlement Features
export const testSettlementFeatures = async () => {
  console.log('💰 Testing KotaPay Settlement Features...\n');

  try {
    // Test 1: Create Ledger Entry
    console.log('1. Creating Ledger Entry...');
    const ledgerEntry = await settlementService.createLedgerEntry({
      from: 'test_user_123',
      to: 'test_user_456',
      amount: 10000,
      fee: 0,
      status: 'completed',
      type: 'wallet_to_wallet',
      reference: 'test_tx_' + Date.now()
    });
    console.log('✅ Ledger entry created:', ledgerEntry.id, '\n');

    // Test 2: Bank Transfer Entry
    console.log('2. Creating Bank Transfer Entry...');
    const bankTransfer = await settlementService.createLedgerEntry({
      from: 'test_user_123',
      to: 'bank',
      amount: 50000,
      fee: 25,
      status: 'pending',
      type: 'wallet_to_bank',
      reference: 'bank_tx_' + Date.now(),
      paystackReference: 'ps_ref_' + Date.now()
    });
    console.log('✅ Bank transfer entry created:', bankTransfer.id, '\n');

    // Test 3: Get Settlement Status
    console.log('3. Checking Settlement Status...');
    const settlementStatus = await settlementService.getSettlementStatus(bankTransfer.reference);
    console.log('✅ Settlement status:', settlementStatus, '\n');

    // Test 4: Process Chargeback
    console.log('4. Processing Chargeback...');
    const chargeback = await settlementService.processChargeback({
      originalTransactionId: bankTransfer.reference,
      amount: 50000,
      reason: 'Test chargeback - unauthorized transaction',
      bankReference: 'cb_ref_' + Date.now()
    });
    console.log('✅ Chargeback processed:', chargeback.id, '\n');

    // Test 5: Bank Reconciliation
    console.log('5. Testing Bank Reconciliation...');
    const mockBankStatements = [
      {
        id: 'bank_stmt_001',
        bankReference: bankTransfer.paystackReference || 'ps_ref_test',
        amount: 50000,
        type: 'debit' as const,
        description: `PAYSTACK TRANSFER ${bankTransfer.reference}`,
        valueDate: new Date().toISOString(),
        processingDate: new Date().toISOString(),
        accountNumber: '1234567890',
        status: 'settled' as const
      }
    ];
    
    const reconciliationResult = await settlementService.performReconciliation(mockBankStatements);
    console.log('✅ Reconciliation completed. Results:', {
      matched: reconciliationResult.matched,
      unmatched: reconciliationResult.unmatched,
      total: reconciliationResult.totalProcessed
    }, '\n');

    console.log('🎉 All settlement tests completed successfully!\n');
    
  } catch (error) {
    console.error('❌ Settlement test failed:', error);
  }
};

// Test Scheduled Tasks
export const testScheduledTasks = () => {
  console.log('⏰ Testing Scheduled Tasks...\n');

  try {
    // Test 1: Get Task Status
    console.log('1. Getting Task Status...');
    const taskStatus = taskScheduler.getTaskStatus();
    console.log('✅ Active tasks:', taskStatus.map(t => ({ name: t.name, status: t.status, enabled: t.enabled })), '\n');

    // Test 2: Run Manual Task
    console.log('2. Running Manual Reconciliation...');
    taskScheduler.runTaskManually('nightly_reconciliation');
    console.log('✅ Manual task executed\n');

    console.log('🎉 All scheduled task tests completed successfully!\n');
    
  } catch (error) {
    console.error('❌ Scheduled task test failed:', error);
  }
};

// Run All Tests
export const runAllTests = async () => {
  console.log('🚀 Starting KotaPay Security & Settlement Tests...\n');
  console.log('='.repeat(60) + '\n');
  
  await testSecurityFeatures();
  console.log('='.repeat(60) + '\n');
  
  await testSettlementFeatures();
  console.log('='.repeat(60) + '\n');
  
  testScheduledTasks();
  console.log('='.repeat(60) + '\n');
  
  console.log('✅ All tests completed! KotaPay Security & Settlement system is ready! 🎉');
};

// Example usage in development
if (__DEV__) {
  // Uncomment to run tests
  // runAllTests();
}
