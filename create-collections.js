#!/usr/bin/env node

/**
 * KotaPay Database Collections Creator
 * 
 * This script helps create the required Appwrite collections for KotaPay.
 * Run this from your backend folder or any Node.js environment with Appwrite access.
 * 
 * Usage:
 *   node create-collections.js
 * 
 * Requirements:
 *   - npm install node-appwrite
 *   - Set APPWRITE_API_KEY environment variable
 */

const { Client, Databases, Permission, Role } = require('node-appwrite');

// Configuration
const config = {
  endpoint: 'https://nyc.cloud.appwrite.io/v1',
  projectId: '689dc4200011a5bd1658',
  databaseId: '68a6fbd8003e42a7bc5f',
  apiKey: process.env.APPWRITE_API_KEY || ''
};

if (!config.apiKey) {
  console.error('❌ Error: APPWRITE_API_KEY environment variable is required');
  console.log('   Set it with: export APPWRITE_API_KEY=your_api_key');
  process.exit(1);
}

// Initialize Appwrite
const client = new Client()
  .setEndpoint(config.endpoint)
  .setProject(config.projectId)
  .setKey(config.apiKey);

const databases = new Databases(client);

// Collection schemas
const collections = {
  users: {
    name: 'Users',
    permissions: [
      Permission.read(Role.any()),
      Permission.create(Role.users()),
      Permission.update(Role.users()),
      Permission.delete(Role.users())
    ],
    attributes: [
      { key: 'userId', type: 'string', size: 255, required: true },
      { key: 'firstName', type: 'string', size: 255, required: true },
      { key: 'lastName', type: 'string', size: 255, required: true },
      { key: 'email', type: 'string', size: 255, required: true },
      { key: 'phone', type: 'string', size: 20, required: false },
      { key: 'dateOfBirth', type: 'string', size: 20, required: false },
      { key: 'address', type: 'string', size: 500, required: false },
      { key: 'city', type: 'string', size: 100, required: false },
      { key: 'state', type: 'string', size: 100, required: false },
      { key: 'country', type: 'string', size: 100, required: false, default: 'Nigeria' },
      { key: 'profileImage', type: 'string', size: 500, required: false },
      { key: 'kycStatus', type: 'enum', elements: ['pending', 'verified', 'rejected'], required: true, default: 'pending' },
      { key: 'kycTier', type: 'integer', required: true, default: 1 },
      { key: 'accountBalance', type: 'float', required: false, default: 0 },
      { key: 'walletBalance', type: 'float', required: false, default: 0 },
      { key: 'monthlySpent', type: 'float', required: false, default: 0 },
      { key: 'createdAt', type: 'datetime', required: true },
      { key: 'updatedAt', type: 'datetime', required: true }
    ],
    indexes: [
      { key: 'userId_idx', type: 'key', attributes: ['userId'] },
      { key: 'email_idx', type: 'key', attributes: ['email'] }
    ]
  },

  transactions: {
    name: 'Transactions',
    permissions: [
      Permission.read(Role.any()),
      Permission.create(Role.users()),
      Permission.update(Role.users())
    ],
    attributes: [
      { key: 'userId', type: 'string', size: 255, required: true },
      { key: 'type', type: 'enum', elements: ['debit', 'credit'], required: true },
      { key: 'amount', type: 'float', required: true },
      { key: 'description', type: 'string', size: 500, required: false },
      { key: 'reference', type: 'string', size: 255, required: true },
      { key: 'status', type: 'enum', elements: ['pending', 'successful', 'failed'], required: true, default: 'pending' },
      { key: 'recipientId', type: 'string', size: 255, required: false },
      { key: 'recipientName', type: 'string', size: 255, required: false },
      { key: 'recipientAccount', type: 'string', size: 255, required: false },
      { key: 'recipientBank', type: 'string', size: 255, required: false },
      { key: 'paystackReference', type: 'string', size: 255, required: false },
      { key: 'createdAt', type: 'datetime', required: true },
      { key: 'updatedAt', type: 'datetime', required: true }
    ],
    indexes: [
      { key: 'userId_idx', type: 'key', attributes: ['userId'] },
      { key: 'reference_idx', type: 'key', attributes: ['reference'] }
    ]
  },

  kyc_documents: {
    name: 'KYC Documents',
    permissions: [
      Permission.read(Role.any()),
      Permission.create(Role.users()),
      Permission.update(Role.users())
    ],
    attributes: [
      { key: 'userId', type: 'string', size: 255, required: true },
      { key: 'documentType', type: 'enum', elements: ['bvn', 'nin', 'passport', 'drivers_license', 'voters_card'], required: true },
      { key: 'documentNumber', type: 'string', size: 255, required: true },
      { key: 'documentUrl', type: 'string', size: 500, required: false },
      { key: 'fileName', type: 'string', size: 255, required: false },
      { key: 'verificationStatus', type: 'enum', elements: ['pending', 'verified', 'rejected'], required: true, default: 'pending' },
      { key: 'rejectionReason', type: 'string', size: 500, required: false },
      { key: 'tierLevel', type: 'integer', required: true },
      { key: 'uploadedAt', type: 'datetime', required: true },
      { key: 'verifiedAt', type: 'datetime', required: false },
      { key: 'expiresAt', type: 'datetime', required: false }
    ],
    indexes: [
      { key: 'userId_idx', type: 'key', attributes: ['userId'] },
      { key: 'documentType_idx', type: 'key', attributes: ['documentType'] }
    ]
  },

  payment_requests: {
    name: 'Payment Requests',
    permissions: [
      Permission.read(Role.any()),
      Permission.create(Role.users()),
      Permission.update(Role.users())
    ],
    attributes: [
      { key: 'requestId', type: 'string', size: 255, required: true },
      { key: 'requesterId', type: 'string', size: 255, required: true },
      { key: 'payerId', type: 'string', size: 255, required: false },
      { key: 'description', type: 'string', size: 500, required: true },
      { key: 'reference', type: 'string', size: 255, required: true },
      { key: 'amount', type: 'float', required: true },
      { key: 'currency', type: 'string', size: 10, required: true, default: 'NGN' },
      { key: 'status', type: 'enum', elements: ['pending', 'paid', 'expired', 'cancelled'], required: true, default: 'pending' },
      { key: 'type', type: 'enum', elements: ['one_time', 'recurring'], required: true, default: 'one_time' },
      { key: 'createdAt', type: 'datetime', required: true },
      { key: 'expiresAt', type: 'datetime', required: false },
      { key: 'paidAt', type: 'datetime', required: false },
      { key: 'paymentLink', type: 'string', size: 500, required: false },
      { key: 'qrCode', type: 'string', size: 500, required: false },
      { key: 'transactionId', type: 'string', size: 255, required: false }
    ],
    indexes: [
      { key: 'requestId_idx', type: 'key', attributes: ['requestId'] },
      { key: 'requester_idx', type: 'key', attributes: ['requesterId'] },
      { key: 'status_idx', type: 'key', attributes: ['status'] }
    ]
  },

  virtual_cards: {
    name: 'Virtual Cards',
    permissions: [
      Permission.read(Role.any()),
      Permission.create(Role.users()),
      Permission.update(Role.users())
    ],
    attributes: [
      { key: 'cardId', type: 'string', size: 255, required: true },
      { key: 'userId', type: 'string', size: 255, required: true },
      { key: 'cardNumber', type: 'string', size: 20, required: true },
      { key: 'cardHolderName', type: 'string', size: 255, required: true },
      { key: 'expiryMonth', type: 'string', size: 2, required: true },
      { key: 'expiryYear', type: 'string', size: 4, required: true },
      { key: 'cvv', type: 'string', size: 4, required: true },
      { key: 'cardType', type: 'enum', elements: ['debit', 'credit'], required: true, default: 'debit' },
      { key: 'balance', type: 'float', required: true, default: 0 },
      { key: 'isActive', type: 'boolean', required: true, default: true },
      { key: 'createdAt', type: 'datetime', required: true },
      { key: 'updatedAt', type: 'datetime', required: true }
    ],
    indexes: [
      { key: 'cardId_idx', type: 'key', attributes: ['cardId'] },
      { key: 'userId_idx', type: 'key', attributes: ['userId'] }
    ]
  },

  beneficiaries: {
    name: 'Beneficiaries',
    permissions: [
      Permission.read(Role.any()),
      Permission.create(Role.users()),
      Permission.update(Role.users())
    ],
    attributes: [
      { key: 'userId', type: 'string', size: 255, required: true },
      { key: 'beneficiaryId', type: 'string', size: 255, required: true },
      { key: 'name', type: 'string', size: 255, required: true },
      { key: 'accountNumber', type: 'string', size: 20, required: true },
      { key: 'bankName', type: 'string', size: 255, required: true },
      { key: 'bankCode', type: 'string', size: 10, required: true },
      { key: 'isVerified', type: 'boolean', required: true, default: false },
      { key: 'createdAt', type: 'datetime', required: true },
      { key: 'updatedAt', type: 'datetime', required: true }
    ],
    indexes: [
      { key: 'userId_idx', type: 'key', attributes: ['userId'] }
    ]
  }
};

// Helper function to wait
const wait = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// Create collections
async function createCollections() {
  console.log('🚀 KotaPay Database Setup Starting...\n');
  
  for (const [collectionId, schema] of Object.entries(collections)) {
    try {
      console.log(`📁 Creating collection: ${collectionId}`);
      
      // Create collection
      await databases.createCollection(
        config.databaseId,
        collectionId,
        schema.name,
        schema.permissions
      );
      
      console.log(`✅ Collection '${collectionId}' created`);
      
      // Wait a bit for collection to be ready
      await wait(1000);
      
      // Add attributes
      for (const attr of schema.attributes) {
        try {
          if (attr.type === 'string') {
            await databases.createStringAttribute(
              config.databaseId,
              collectionId,
              attr.key,
              attr.size || 255,
              attr.required || false,
              attr.default
            );
          } else if (attr.type === 'integer') {
            await databases.createIntegerAttribute(
              config.databaseId,
              collectionId,
              attr.key,
              attr.required || false,
              undefined,
              undefined,
              attr.default
            );
          } else if (attr.type === 'float') {
            await databases.createFloatAttribute(
              config.databaseId,
              collectionId,
              attr.key,
              attr.required || false,
              undefined,
              undefined,
              attr.default
            );
          } else if (attr.type === 'boolean') {
            await databases.createBooleanAttribute(
              config.databaseId,
              collectionId,
              attr.key,
              attr.required || false,
              attr.default
            );
          } else if (attr.type === 'datetime') {
            await databases.createDatetimeAttribute(
              config.databaseId,
              collectionId,
              attr.key,
              attr.required || false,
              attr.default
            );
          } else if (attr.type === 'enum') {
            await databases.createEnumAttribute(
              config.databaseId,
              collectionId,
              attr.key,
              attr.elements,
              attr.required || false,
              attr.default
            );
          }
          
          console.log(`  ✅ Added attribute: ${attr.key} (${attr.type})`);
          await wait(500); // Wait between attributes
          
        } catch (attrError) {
          console.error(`  ❌ Failed to add attribute ${attr.key}:`, attrError.message);
        }
      }
      
      // Add indexes
      for (const index of schema.indexes) {
        try {
          await databases.createIndex(
            config.databaseId,
            collectionId,
            index.key,
            index.type,
            index.attributes
          );
          console.log(`  ✅ Added index: ${index.key}`);
          await wait(500);
        } catch (indexError) {
          console.error(`  ❌ Failed to add index ${index.key}:`, indexError.message);
        }
      }
      
      console.log(`🎉 Collection '${collectionId}' setup complete\n`);
      
    } catch (error) {
      if (error.code === 409) {
        console.log(`⚠️  Collection '${collectionId}' already exists\n`);
      } else {
        console.error(`❌ Failed to create collection '${collectionId}':`, error.message);
      }
    }
  }
  
  console.log('🎉 KotaPay database setup completed!');
  console.log('\n✅ Your collections are ready for use');
  console.log('💡 Test the connection using the "Setup DB" button in your app');
}

// Run the setup
createCollections().catch(console.error);
