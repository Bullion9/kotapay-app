#!/usr/bin/env node

/**
 * Test Authentication Flow
 * This script tests the complete authentication and balance loading flow
 */

const { Client, Databases, Query } = require('node-appwrite');

// Your Appwrite Configuration
const config = {
  endpoint: 'https://nyc.cloud.appwrite.io/v1',
  projectId: '689dc4200011a5bd1658',
  databaseId: '68a6fbd8003e42a7bc5f',
  apiKey: 'standard_0bd3713af516c78ff667780730f1ab9d833d79befd1ece7b59c4f986f69d7a126b08e4b44a6311c634e96e7a77d207d181353429af9bc10c4a85fa4e63e194c073af0688093bb9215cb32d396ac496644a9c0fdd09319cdf79a5087456a5ad2fdd637acfef3c83c10b956167a0e7713fce0f386447be858c63efa036e94e2c1e'
};

console.log('🧪 Testing KotaPay Authentication Flow...');

// Initialize Appwrite
const client = new Client()
  .setEndpoint(config.endpoint)
  .setProject(config.projectId)
  .setKey(config.apiKey);

const databases = new Databases(client);

async function testAuthFlow() {
  try {
    console.log('\n1️⃣ Testing getUserByEmail for demo user...');
    
    const response = await databases.listDocuments(
      config.databaseId,
      'users',
      [Query.equal('email', 'demo@kotapay.com')]
    );
    
    if (response.documents.length > 0) {
      const demoUser = response.documents[0];
      console.log('✅ Demo user found:', {
        id: demoUser.$id,
        userId: demoUser.userId,
        firstName: demoUser.firstName,
        lastName: demoUser.lastName,
        email: demoUser.email,
        phone: demoUser.phone,
        walletBalance: demoUser.walletBalance
      });
      
      console.log('\n2️⃣ Testing getUserProfile with userId...');
      const profileResponse = await databases.listDocuments(
        config.databaseId,
        'users',
        [Query.equal('userId', demoUser.userId)]
      );
      
      if (profileResponse.documents.length > 0) {
        const profile = profileResponse.documents[0];
        console.log('✅ Profile found by userId:', {
          documentId: profile.$id,
          userId: profile.userId,
          walletBalance: profile.walletBalance
        });
        
        console.log('\n3️⃣ Testing balance update...');
        const originalBalance = profile.walletBalance || 0;
        const testAmount = 100;
        const newBalance = originalBalance + testAmount;
        
        const updateResponse = await databases.updateDocument(
          config.databaseId,
          'users',
          profile.$id, // Use document ID for update
          {
            walletBalance: newBalance,
            updatedAt: new Date().toISOString()
          }
        );
        
        console.log('✅ Balance updated successfully:', {
          originalBalance,
          testAmount,
          newBalance: updateResponse.walletBalance
        });
        
        // Restore original balance
        await databases.updateDocument(
          config.databaseId,
          'users',
          profile.$id,
          {
            walletBalance: originalBalance,
            updatedAt: new Date().toISOString()
          }
        );
        console.log('✅ Balance restored to original value');
        
      } else {
        console.log('❌ Profile not found by userId');
      }
      
    } else {
      console.log('❌ Demo user not found by email');
    }
    
    console.log('\n🎉 Authentication flow test completed!');
    
  } catch (error) {
    console.error('\n❌ Test failed:', error.message);
  }
}

testAuthFlow();
