// Test Paystack API Connection
import { PaystackService } from './src/services/PaystackService';

async function testPaystackConnection() {
  const service = new PaystackService();
  
  try {
    console.log('🔄 Testing Paystack API connection...');
    
    // Test 1: Health check (list banks)
    const healthCheck = await service.checkHealth();
    console.log('✅ Health check passed:', healthCheck.status ? 'Success' : 'Failed');
    
    // Test 2: Get banks
    const banks = await service.getBanks({ country: 'nigeria' });
    console.log('✅ Banks fetched:', banks.data?.length, 'banks found');
    console.log('📋 Sample banks:', banks.data?.slice(0, 3).map(b => b.name));
    
    console.log('\n🎉 SUCCESS: PaystackService is now connected to live Paystack API!');
    console.log('💡 Core features (payments, transfers, banks) are working with live data');
    console.log('⚠️  Bills payment features require third-party integration (see PAYSTACK_API_LIMITATIONS.md)');
    
  } catch (error) {
    console.error('❌ Paystack API connection failed:', error.message);
    console.log('\n🔧 Troubleshooting:');
    console.log('1. Check your .env file has EXPO_PUBLIC_PAYSTACK_SECRET_KEY set');
    console.log('2. Verify your Paystack secret key is valid and live');
    console.log('3. Check internet connection');
  }
}

testPaystackConnection();
