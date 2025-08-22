// Load environment variables first
import * as dotenv from 'dotenv';
dotenv.config();

import { authService } from './src/services/auth';
import AppwriteService from './src/services/AppwriteService';

console.log('🔧 Debugging Current Authentication State...\n');
console.log('Environment check:');
console.log('  PROJECT_ID:', process.env.EXPO_PUBLIC_APPWRITE_PROJECT_ID);
console.log('  ENDPOINT:', process.env.EXPO_PUBLIC_APPWRITE_ENDPOINT);
console.log('');

async function debugCurrentAuth() {
  try {
    console.log('1. Testing authService.getCurrentUser():');
    const currentUser = await authService.getCurrentUser();
    console.log('   Result:', currentUser ? {
      id: currentUser.id,
      email: currentUser.email,
      name: currentUser.name,
      balance: currentUser.balance
    } : 'null');

    console.log('\n2. Testing direct database lookup for demo user:');
    const demoUser = await AppwriteService.getUserByEmail('demo@kotapay.com');
    console.log('   Database result:', demoUser ? {
      id: demoUser.$id,
      email: demoUser.email,
      firstName: demoUser.firstName,
      lastName: demoUser.lastName,
      walletBalance: demoUser.walletBalance
    } : 'not found');

    console.log('\n3. Testing authService.login() for demo user:');
    const loginResult = await authService.login('demo@kotapay.com', 'DemoUser123!');
    console.log('   Login result:', loginResult ? {
      id: loginResult.id,
      email: loginResult.email,
      name: loginResult.name,
      balance: loginResult.balance
    } : 'null');

    console.log('\n4. Testing authService.getCurrentUser() after login:');
    const afterLoginUser = await authService.getCurrentUser();
    console.log('   After login:', afterLoginUser ? {
      id: afterLoginUser.id,
      email: afterLoginUser.email,
      name: afterLoginUser.name,
      balance: afterLoginUser.balance
    } : 'null');

  } catch (error: any) {
    console.error('❌ Error during auth debugging:', error.message);
    console.error('   Stack:', error.stack);
  }
}

debugCurrentAuth().then(() => {
  console.log('\n🎉 Auth debugging completed!');
}).catch(error => {
  console.error('❌ Fatal error:', error);
});
