#!/usr/bin/env node

/**
 * KotaPay Database Setup Script - Production Ready
 * Creates all required Appwrite collections with your API credentials
 */

const { Client, Databases, Permission, Role } = require('node-appwrite');

// Your Appwrite Configuration
const config = {
  endpoint: 'https://nyc.cloud.appwrite.io/v1',
  projectId: '689dc4200011a5bd1658',
  databaseId: '68a6fbd8003e42a7bc5f',
  apiKey: 'standard_0bd3713af516c78ff667780730f1ab9d833d79befd1ece7b59c4f986f69d7a126b08e4b44a6311c634e96e7a77d207d181353429af9bc10c4a85fa4e63e194c073af0688093bb9215cb32d396ac496644a9c0fdd09319cdf79a5087456a5ad2fdd637acfef3c83c10b956167a0e7713fce0f386447be858c63efa036e94e2c1e'
};

console.log('🚀 KotaPay Database Setup Starting...');
console.log(`📱 Project: Kota pay (${config.projectId})`);
console.log(`🗄️  Database: ${config.databaseId}`);

// Initialize Appwrite
const client = new Client()
  .setEndpoint(config.endpoint)
  .setProject(config.projectId)
  .setKey(config.apiKey);

const databases = new Databases(client);

// Collection definitions with all required attributes
const collections = [
  {
    id: 'users',
    name: 'Users',
    attributes: [
      { key: 'userId', type: 'string', size: 255, required: true },
      { key: 'firstName', type: 'string', size: 255, required: true },
      { key: 'lastName', type: 'string', size: 255, required: true },
      { key: 'email', type: 'string', size: 255, required: true },
      { key: 'phone', type: 'string', size: 20, required: false },
      { key: 'walletBalance', type: 'double', required: false, default: 0 },
      { key: 'kycStatus', type: 'string', size: 20, required: true, default: 'pending' },
      { key: 'createdAt', type: 'datetime', required: true },
      { key: 'updatedAt', type: 'datetime', required: true }
    ]
  },
  {
    id: 'transactions',
    name: 'Transactions',
    attributes: [
      { key: 'userId', type: 'string', size: 255, required: true },
      { key: 'type', type: 'string', size: 20, required: true },
      { key: 'amount', type: 'double', required: true },
      { key: 'description', type: 'string', size: 500, required: false },
      { key: 'reference', type: 'string', size: 255, required: true },
      { key: 'status', type: 'string', size: 20, required: true, default: 'pending' },
      { key: 'createdAt', type: 'datetime', required: true },
      { key: 'updatedAt', type: 'datetime', required: true }
    ]
  },
  {
    id: 'kyc_documents',
    name: 'KYC Documents',
    attributes: [
      { key: 'userId', type: 'string', size: 255, required: true },
      { key: 'documentType', type: 'string', size: 100, required: true },
      { key: 'verificationStatus', type: 'string', size: 20, required: true, default: 'pending' },
      { key: 'tierLevel', type: 'integer', required: true, default: 1 },
      { key: 'createdAt', type: 'datetime', required: true },
      { key: 'updatedAt', type: 'datetime', required: true }
    ]
  },
  {
    id: 'payment_requests',
    name: 'Payment Requests',
    attributes: [
      { key: 'requesterId', type: 'string', size: 255, required: true },
      { key: 'amount', type: 'double', required: true },
      { key: 'description', type: 'string', size: 500, required: false },
      { key: 'status', type: 'string', size: 20, required: true, default: 'pending' },
      { key: 'createdAt', type: 'datetime', required: true },
      { key: 'expiresAt', type: 'datetime', required: true }
    ]
  },
  {
    id: 'virtual_cards',
    name: 'Virtual Cards',
    attributes: [
      { key: 'userId', type: 'string', size: 255, required: true },
      { key: 'cardNumber', type: 'string', size: 20, required: true },
      { key: 'cardHolderName', type: 'string', size: 255, required: true },
      { key: 'balance', type: 'double', required: true, default: 0 },
      { key: 'isActive', type: 'boolean', required: true, default: true },
      { key: 'createdAt', type: 'datetime', required: true },
      { key: 'updatedAt', type: 'datetime', required: true }
    ]
  },
  {
    id: 'beneficiaries',
    name: 'Beneficiaries',
    attributes: [
      { key: 'userId', type: 'string', size: 255, required: true },
      { key: 'name', type: 'string', size: 255, required: true },
      { key: 'accountNumber', type: 'string', size: 20, required: true },
      { key: 'bankName', type: 'string', size: 255, required: true },
      { key: 'createdAt', type: 'datetime', required: true },
      { key: 'updatedAt', type: 'datetime', required: true }
    ]
  }
];

async function createAttribute(databaseId, collectionId, attr) {
  try {
    console.log(`    ➕ ${attr.key} (${attr.type})`);
    
    if (attr.type === 'string') {
      await databases.createStringAttribute(
        databaseId, collectionId, attr.key, attr.size, attr.required, attr.default
      );
    } else if (attr.type === 'double') {
      await databases.createFloatAttribute(
        databaseId, collectionId, attr.key, attr.required, undefined, undefined, attr.default
      );
    } else if (attr.type === 'integer') {
      await databases.createIntegerAttribute(
        databaseId, collectionId, attr.key, attr.required, undefined, undefined, attr.default
      );
    } else if (attr.type === 'boolean') {
      await databases.createBooleanAttribute(
        databaseId, collectionId, attr.key, attr.required, attr.default
      );
    } else if (attr.type === 'datetime') {
      await databases.createDatetimeAttribute(
        databaseId, collectionId, attr.key, attr.required, attr.default
      );
    }
    
    // Wait to avoid rate limiting
    await new Promise(resolve => setTimeout(resolve, 300));
    
  } catch (error) {
    if (error.message.includes('already exists')) {
      console.log(`    ⚠️  ${attr.key} already exists`);
    } else {
      console.error(`    ❌ ${attr.key} failed:`, error.message);
    }
  }
}

async function createCollection(collectionConfig) {
  try {
    console.log(`\n📝 Creating collection: ${collectionConfig.name}`);
    
    // Create collection with default permissions
    await databases.createCollection(
      config.databaseId,
      collectionConfig.id,
      collectionConfig.name,
      [
        Permission.read(Role.any()),
        Permission.create(Role.users()),
        Permission.update(Role.users()),
        Permission.delete(Role.users())
      ]
    );
    
    console.log(`✅ Collection created: ${collectionConfig.name}`);
    
    // Add all attributes
    for (const attr of collectionConfig.attributes) {
      await createAttribute(config.databaseId, collectionConfig.id, attr);
    }
    
    console.log(`🎉 ${collectionConfig.name} setup complete!`);
    
  } catch (error) {
    if (error.message.includes('already exists')) {
      console.log(`⚠️  Collection ${collectionConfig.name} already exists, adding missing attributes...`);
      
      // Still try to add attributes in case some are missing
      for (const attr of collectionConfig.attributes) {
        await createAttribute(config.databaseId, collectionConfig.id, attr);
      }
    } else {
      console.error(`❌ Error with ${collectionConfig.name}:`, error.message);
    }
  }
}

async function setupDatabase() {
  console.log('\n🎯 Starting database setup...\n');
  
  try {
    // Test the connection first
    await databases.get(config.databaseId);
    console.log('✅ Database connection successful\n');
    
    // Create all collections
    for (const collection of collections) {
      await createCollection(collection);
      // Wait between collections
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
    
    console.log('\n🎊 DATABASE SETUP COMPLETE!');
    console.log('\n✅ Collections created:');
    collections.forEach(c => console.log(`   • ${c.name} (${c.id})`));
    
    console.log('\n🚀 Next steps:');
    console.log('1. Restart your KotaPay app');
    console.log('2. The balance cards should now show REAL data!');
    console.log('3. No more "Collection not found" errors');
    
  } catch (error) {
    console.error('❌ Setup failed:', error.message);
    if (error.message.includes('API key')) {
      console.log('💡 Make sure your API key has the correct permissions');
    }
  }
}

// Check if node-appwrite is installed
try {
  require('node-appwrite');
  setupDatabase();
} catch (error) {
  console.log('❌ Missing dependency: node-appwrite');
  console.log('📦 Installing node-appwrite...\n');
  
  const { execSync } = require('child_process');
  try {
    execSync('npm install node-appwrite', { stdio: 'inherit' });
    console.log('\n✅ Installation complete, running setup...\n');
    setupDatabase();
  } catch (installError) {
    console.error('❌ Failed to install node-appwrite');
    console.log('📦 Please run manually: npm install node-appwrite');
    console.log('Then run: node create-database-tables.js');
  }
}
