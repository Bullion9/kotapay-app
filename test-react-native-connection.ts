// Test Appwrite connection for React Native client
import { Client, Account, Databases } from 'appwrite';

const client = new Client()
  .setEndpoint('https://nyc.cloud.appwrite.io/v1')
  .setProject('689dc4200011a5bd1658');

const account = new Account(client);
const databases = new Databases(client);

console.log('🔧 Testing React Native Appwrite Connection...\n');

async function testConnection() {
  try {
    console.log('1. Testing basic client connection...');
    
    // Test basic connection by trying to get account info (will fail if not logged in, but should connect)
    try {
      const user = await account.get();
      console.log('✅ User already logged in:', user.email);
    } catch (authError) {
      console.log('ℹ️ No user session (expected for testing)');
    }
    
    console.log('\n2. Testing anonymous session creation...');
    try {
      const session = await account.createAnonymousSession();
      console.log('✅ Anonymous session created:', session.$id);
      
      console.log('\n3. Testing database access with session...');
      const result = await databases.listDocuments(
        '68a6fbd8003e42a7bc5f', // database ID
        'users' // collection ID
      );
      console.log('✅ Database access successful! Found', result.total, 'users');
      
      // Clean up
      await account.deleteSession('current');
      console.log('✅ Session cleaned up');
      
    } catch (sessionError) {
      console.log('⚠️ Anonymous session failed:', sessionError.message);
      
      // Try to test database without session (should still fail but with different error)
      try {
        const result = await databases.listDocuments(
          '68a6fbd8003e42a7bc5f',
          'users'
        );
        console.log('✅ Database access worked!', result.total, 'users found');
      } catch (dbError) {
        console.log('ℹ️ Database error (expected without auth):', dbError.message);
      }
    }
    
  } catch (error: any) {
    console.error('❌ Connection test failed:', error.message);
  }
}

testConnection().then(() => {
  console.log('\n🎉 Connection test completed!');
}).catch(error => {
  console.error('❌ Fatal error:', error);
});
