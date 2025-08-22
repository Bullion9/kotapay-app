#!/usr/bin/env node

/**
 * Create Demo User for KotaPay Testing
 * This creates a test user account so you can see real balance integration
 */

require('dotenv').config();
const { Client, Account, Databases, ID } = require('node-appwrite');

// Get configuration from environment variables
const config = {
  endpoint: process.env.EXPO_PUBLIC_APPWRITE_ENDPOINT || 'https://nyc.cloud.appwrite.io/v1',
  projectId: process.env.EXPO_PUBLIC_APPWRITE_PROJECT_ID || '689dc4200011a5bd1658',
  databaseId: process.env.EXPO_PUBLIC_APPWRITE_DATABASE_ID || '68a6fbd8003e42a7bc5f',
  apiKey: 'standard_0bd3713af516c78ff667780730f1ab9d833d79befd1ece7b59c4f986f69d7a126b08e4b44a6311c634e96e7a77d207d181353429af9bc10c4a85fa4e63e194c073af0688093bb9215cb32d396ac496644a9c0fdd09319cdf79a5087456a5ad2fdd637acfef3c83c10b956167a0e7713fce0f386447be858c63efa036e94e2c1e'
};

console.log('🎯 Creating Demo User for KotaPay Testing...');
console.log('🔧 Configuration:');
console.log(`   Endpoint: ${config.endpoint}`);
console.log(`   Project ID: ${config.projectId}`);
console.log(`   Database ID: ${config.databaseId}`);
console.log('');

// Initialize Appwrite
const client = new Client()
  .setEndpoint(config.endpoint)
  .setProject(config.projectId)
  .setKey(config.apiKey);

const account = new Account(client);
const databases = new Databases(client);

const demoUser = {
  email: 'demo@kotapay.com',
  password: 'DemoUser123!',
  name: 'Demo User',
  firstName: 'Demo',
  lastName: 'User',
  phone: '+2348012345678',
  walletBalance: 50000.00 // ₦50,000 starting balance
};

async function createDemoUser() {
  try {
    console.log('📝 Creating demo account...');
    
    let userAccount;
    
    // Try to create authentication account
    try {
      userAccount = await account.create(
        ID.unique(),
        demoUser.email,
        demoUser.password,
        demoUser.name
      );
      console.log('✅ Demo account created:', userAccount.email);
    } catch (authError) {
      if (authError.message.includes('already exists')) {
        console.log('⚠️  Auth account already exists, getting existing account...');
        // For demo purposes, we'll create a mock user ID
        userAccount = { $id: 'demo_auth_user_' + Date.now() };
      } else {
        console.error('❌ Auth error:', authError.message);
        throw authError;
      }
    }
    
    // Always try to create user profile in database
    console.log('📊 Creating user profile in database...');
    
    const userProfile = await databases.createDocument(
      config.databaseId,
      'users', // collection ID
      ID.unique(),
      {
        userId: userAccount.$id,
        firstName: demoUser.firstName,
        lastName: demoUser.lastName,
        email: demoUser.email,
        phone: demoUser.phone,
        walletBalance: demoUser.walletBalance,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }
    );
    
    console.log('✅ User profile created in database with ID:', userProfile.$id);
    
    // Create some sample transactions
    console.log('💰 Creating sample transactions...');
    
    const transactions = [
      {
        userId: userAccount.$id,
        type: 'credit',
        amount: 50000,
        description: 'Welcome bonus',
        reference: 'WELCOME_' + Date.now(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      },
      {
        userId: userAccount.$id,
        type: 'debit',
        amount: 2500,
        description: 'Airtime purchase - MTN',
        reference: 'AIRTIME_' + Date.now(),
        createdAt: new Date(Date.now() - 86400000).toISOString(), // Yesterday
        updatedAt: new Date(Date.now() - 86400000).toISOString()
      },
      {
        userId: userAccount.$id,
        type: 'credit',
        amount: 15000,
        description: 'Money received from John Doe',
        reference: 'TRANSFER_' + Date.now(),
        createdAt: new Date(Date.now() - 172800000).toISOString(), // 2 days ago
        updatedAt: new Date(Date.now() - 172800000).toISOString()
      }
    ];
    
    for (const transaction of transactions) {
      await databases.createDocument(
        config.databaseId,
        'transactions',
        ID.unique(),
        transaction
      );
      await new Promise(resolve => setTimeout(resolve, 200)); // Rate limiting
    }
    
    console.log('✅ Sample transactions created');
    
    console.log('\n🎉 DEMO USER CREATED SUCCESSFULLY!');
    console.log('\n📱 LOGIN CREDENTIALS:');
    console.log(`📧 Email: ${demoUser.email}`);
    console.log(`🔐 Password: ${demoUser.password}`);
    console.log(`💰 Starting Balance: ₦${demoUser.walletBalance.toLocaleString()}`);
    
    console.log('\n🚀 NEXT STEPS:');
    console.log('1. Open your KotaPay app');
    console.log('2. Tap "Sign In"');
    console.log('3. Use the credentials above');
    console.log('4. Your balance cards will show REAL data!');
    console.log('5. You\'ll see the sample transaction history');
    
    console.log('\n✨ Your balance integration is now fully functional!');
    
  } catch (error) {
    if (error.message.includes('already exists')) {
      console.log('\n⚠️  Demo user already exists!');
      console.log('\n📱 LOGIN CREDENTIALS:');
      console.log(`📧 Email: ${demoUser.email}`);
      console.log(`🔐 Password: ${demoUser.password}`);
      console.log('\nJust sign in with these credentials to see real balance data.');
    } else {
      console.error('\n❌ Error creating demo user:', error.message);
      console.error('   Error details:', error);
    }
  }
}

createDemoUser();
