#!/usr/bin/env node

/**
 * Debug Demo User Database Lookup
 * This script tests if we can find the demo user in the database
 */

const { Client, Databases, Query } = require('node-appwrite');

// Your Appwrite Configuration
const config = {
  endpoint: 'https://nyc.cloud.appwrite.io/v1',
  projectId: '689dc4200011a5bd1658',
  databaseId: '68a6fbd8003e42a7bc5f',
  apiKey: 'standard_0bd3713af516c78ff667780730f1ab9d833d79befd1ece7b59c4f986f69d7a126b08e4b44a6311c634e96e7a77d207d181353429af9bc10c4a85fa4e63e194c073af0688093bb9215cb32d396ac496644a9c0fdd09319cdf79a5087456a5ad2fdd637acfef3c83c10b956167a0e7713fce0f386447be858c63efa036e94e2c1e'
};

console.log('🔍 Debugging Demo User Database Lookup...');

// Initialize Appwrite
const client = new Client()
  .setEndpoint(config.endpoint)
  .setProject(config.projectId)
  .setKey(config.apiKey);

const databases = new Databases(client);

async function debugDemoUser() {
  try {
    console.log('\n1. 📋 Listing all users in the database...');
    
    // List all users
    const allUsers = await databases.listDocuments(
      config.databaseId,
      'users'
    );
    
    console.log(`✅ Found ${allUsers.documents.length} users in database`);
    
    allUsers.documents.forEach((user, index) => {
      console.log(`   User ${index + 1}:`, {
        id: user.$id,
        userId: user.userId,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        phone: user.phone,
        walletBalance: user.walletBalance
      });
    });
    
    console.log('\n2. 🎯 Searching for demo user by email...');
    
    // Search by email
    const demoUserByEmail = await databases.listDocuments(
      config.databaseId,
      'users',
      [Query.equal('email', 'demo@kotapay.com')]
    );
    
    if (demoUserByEmail.documents.length > 0) {
      console.log('✅ Demo user found by email search:');
      console.log(JSON.stringify(demoUserByEmail.documents[0], null, 2));
    } else {
      console.log('❌ Demo user NOT found by email search');
    }
    
    console.log('\n3. 📧 Checking email field values...');
    
    allUsers.documents.forEach((user, index) => {
      console.log(`   User ${index + 1} email:`, {
        email: user.email,
        type: typeof user.email,
        length: user.email ? user.email.length : 'undefined'
      });
    });
    
  } catch (error) {
    console.error('\n❌ Error during debug:', error.message);
  }
}

debugDemoUser();
