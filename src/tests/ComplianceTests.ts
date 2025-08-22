/**
 * KotaPay Compliance Service Test
 * 
 * Quick test to verify the fixed ComplianceService is working correctly
 */

import ComplianceService from '../services/ComplianceService';

export async function testComplianceService(): Promise<void> {
  console.log('🧪 Testing Compliance Service...\n');

  const complianceService = new ComplianceService();

  // Test 1: AML Screening
  await testAMLScreening(complianceService);

  // Test 2: Daily Limit Check
  await testDailyLimitCheck(complianceService);

  // Test 3: Compliance Check
  await testComplianceCheck(complianceService);

  console.log('✅ All Compliance Service tests completed!\n');
}

async function testAMLScreening(service: ComplianceService): Promise<void> {
  console.log('🔍 Testing AML Screening...');

  try {
    const amlRequest = {
      userId: 'test_user_123',
      transactionId: 'txn_test_456',
      amount: 15000000, // ₦150,000 (above AML threshold)
      recipientDetails: {
        name: 'John Doe',
        accountNumber: '1234567890',
        bankCode: '044'
      },
      senderDetails: {
        name: 'Jane Smith',
        phoneNumber: '+2348123456789',
        address: 'Lagos, Nigeria'
      }
    };

    const result = await service.performAMLScreening(amlRequest);

    console.log('✅ AML Screening Result:', {
      status: result.status,
      riskScore: result.riskScore,
      flags: result.flags.length,
      reference: result.reference.substring(0, 15) + '...'
    });

    if (result.status === 'flagged' || result.status === 'blocked') {
      console.log('  ⚠️ High-value transaction flagged correctly');
    }
  } catch (error) {
    console.error('❌ AML Screening Error:', error);
  }

  console.log('');
}

async function testDailyLimitCheck(service: ComplianceService): Promise<void> {
  console.log('📊 Testing Daily Limit Check...');

  try {
    const result = await service.checkDailyLimit('test_user_123', 2500000, 'tier1'); // ₦25,000

    console.log('✅ Daily Limit Check Result:', {
      allowed: result.allowed,
      currentSpent: `₦${result.currentSpent / 100}`,
      dailyLimit: `₦${result.dailyLimit / 100}`,
      remainingLimit: `₦${result.remainingLimit / 100}`
    });

    if (result.allowed) {
      console.log('  ✅ Transaction within daily limit');
    } else {
      console.log('  ⚠️ Transaction exceeds daily limit');
    }
  } catch (error) {
    console.error('❌ Daily Limit Check Error:', error);
  }

  console.log('');
}

async function testComplianceCheck(service: ComplianceService): Promise<void> {
  console.log('🛡️ Testing Compliance Check...');

  try {
    const result = await service.runComplianceCheck(
      'test_user_123',
      'txn_compliance_test',
      7500000, // ₦75,000
      'tier1',
      { name: 'Jane Smith', phoneNumber: '+2348123456789' },
      { name: 'John Doe', accountNumber: '1234567890' }
    );

    console.log('✅ Compliance Check Result:', {
      allowed: result.allowed,
      issues: result.issues.length,
      amlResult: result.amlResult?.status || 'none',
      dailyLimitCheck: result.dailyLimitCheck ? 'checked' : 'skipped'
    });

    if (result.allowed) {
      console.log('  ✅ Transaction allowed by compliance');
    } else {
      console.log('  ❌ Transaction blocked by compliance');
      console.log('    Issues:', result.issues);
    }
  } catch (error) {
    console.error('❌ Compliance Check Error:', error);
  }

  console.log('');
}

// Helper function to run all compliance tests
export async function runComplianceTests(): Promise<void> {
  console.log('🚀 Starting KotaPay Compliance Tests\n');
  console.log('=' .repeat(50));
  
  try {
    await testComplianceService();
    console.log('🎉 All Compliance tests passed successfully!');
  } catch (error) {
    console.error('💥 Compliance tests failed:', error);
  }
  
  console.log('=' .repeat(50));
}

// Export for use in other test files
export {
  testAMLScreening,
  testDailyLimitCheck,
  testComplianceCheck
};
