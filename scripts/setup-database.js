/**
 * KotaPay Database Setup Script
 * 
 * Creates all required Appwrite collections with proper schemas
 */

import { Client, Databases, Permission, Role } from 'appwrite';

const client = new Client()
  .setEndpoint(process.env.EXPO_PUBLIC_APPWRITE_ENDPOINT || 'https://nyc.cloud.appwrite.io/v1')
  .setProject(process.env.EXPO_PUBLIC_APPWRITE_PROJECT_ID || '689dc4200011a5bd1658')
  .setKey(process.env.APPWRITE_API_KEY || ''); // Server API key needed for database operations

const databases = new Databases(client);
const databaseId = process.env.EXPO_PUBLIC_APPWRITE_DATABASE_ID || '68a6fbd8003e42a7bc5f';

// Collection schemas
const collections = [
  {
    id: 'users',
    name: 'Users',
    permissions: [
      Permission.read(Role.any()),
      Permission.create(Role.users()),
      Permission.update(Role.users()),
      Permission.delete(Role.users())
    ],
    attributes: [
      { key: 'email', type: 'string', size: 255, required: true },
      { key: 'firstName', type: 'string', size: 100, required: true },
      { key: 'lastName', type: 'string', size: 100, required: true },
      { key: 'phoneNumber', type: 'string', size: 20, required: true },
      { key: 'hashedPhoneNumber', type: 'string', size: 64, required: false },
      { key: 'dateOfBirth', type: 'string', size: 20, required: false },
      { key: 'address', type: 'string', size: 500, required: false },
      { key: 'isVerified', type: 'boolean', required: false, default: false },
      { key: 'kycStatus', type: 'string', size: 20, required: false, default: 'pending' },
      { key: 'walletBalance', type: 'integer', required: false, default: 0 },
      { key: 'pin', type: 'string', size: 255, required: false },
      { key: 'profileImage', type: 'string', size: 500, required: false },
      { key: 'tier', type: 'string', size: 20, required: false, default: 'tier1' },
      { key: 'dailyLimit', type: 'integer', required: false, default: 5000000 },
      { key: 'monthlyLimit', type: 'integer', required: false, default: 100000000 },
      { key: 'isActive', type: 'boolean', required: false, default: true },
      { key: 'lastLoginAt', type: 'datetime', required: false },
      { key: 'deviceId', type: 'string', size: 100, required: false },
      { key: 'fcmToken', type: 'string', size: 500, required: false }
    ],
    indexes: [
      { key: 'email', type: 'unique', attributes: ['email'] },
      { key: 'phoneNumber', type: 'unique', attributes: ['phoneNumber'] },
      { key: 'hashedPhoneNumber', type: 'key', attributes: ['hashedPhoneNumber'] }
    ]
  },
  {
    id: 'transactions',
    name: 'Transactions',
    permissions: [
      Permission.read(Role.users()),
      Permission.create(Role.users()),
      Permission.update(Role.users())
    ],
    attributes: [
      { key: 'userId', type: 'string', size: 50, required: true },
      { key: 'type', type: 'string', size: 20, required: true },
      { key: 'amount', type: 'integer', required: true },
      { key: 'fee', type: 'integer', required: false, default: 0 },
      { key: 'description', type: 'string', size: 500, required: true },
      { key: 'reference', type: 'string', size: 100, required: true },
      { key: 'status', type: 'string', size: 20, required: true },
      { key: 'recipientId', type: 'string', size: 50, required: false },
      { key: 'recipientName', type: 'string', size: 200, required: false },
      { key: 'bankCode', type: 'string', size: 10, required: false },
      { key: 'accountNumber', type: 'string', size: 20, required: false },
      { key: 'paystackReference', type: 'string', size: 100, required: false },
      { key: 'bankReference', type: 'string', size: 100, required: false },
      { key: 'category', type: 'string', size: 50, required: false },
      { key: 'metadata', type: 'string', size: 2000, required: false },
      { key: 'balanceBefore', type: 'integer', required: false },
      { key: 'balanceAfter', type: 'integer', required: false },
      { key: 'settlementDate', type: 'datetime', required: false },
      { key: 'riskScore', type: 'integer', required: false },
      { key: 'deviceInfo', type: 'string', size: 500, required: false }
    ],
    indexes: [
      { key: 'reference', type: 'unique', attributes: ['reference'] },
      { key: 'userId', type: 'key', attributes: ['userId'] },
      { key: 'status', type: 'key', attributes: ['status'] },
      { key: 'type', type: 'key', attributes: ['type'] },
      { key: 'paystackReference', type: 'key', attributes: ['paystackReference'] }
    ]
  },
  {
    id: 'kyc_documents',
    name: 'KYC Documents',
    permissions: [
      Permission.read(Role.users()),
      Permission.create(Role.users()),
      Permission.update(Role.users())
    ],
    attributes: [
      { key: 'userId', type: 'string', size: 50, required: true },
      { key: 'documentType', type: 'string', size: 50, required: true },
      { key: 'documentNumber', type: 'string', size: 100, required: true },
      { key: 'documentUrl', type: 'string', size: 500, required: true },
      { key: 'status', type: 'string', size: 20, required: true, default: 'pending' },
      { key: 'verificationNotes', type: 'string', size: 1000, required: false },
      { key: 'verifiedBy', type: 'string', size: 50, required: false },
      { key: 'verifiedAt', type: 'datetime', required: false },
      { key: 'expiryDate', type: 'datetime', required: false },
      { key: 'isExpired', type: 'boolean', required: false, default: false }
    ],
    indexes: [
      { key: 'userId', type: 'key', attributes: ['userId'] },
      { key: 'documentType', type: 'key', attributes: ['documentType'] },
      { key: 'status', type: 'key', attributes: ['status'] }
    ]
  },
  {
    id: 'payment_requests',
    name: 'Payment Requests',
    permissions: [
      Permission.read(Role.users()),
      Permission.create(Role.users()),
      Permission.update(Role.users())
    ],
    attributes: [
      { key: 'requesterId', type: 'string', size: 50, required: true },
      { key: 'payerId', type: 'string', size: 50, required: true },
      { key: 'amount', type: 'integer', required: true },
      { key: 'description', type: 'string', size: 500, required: true },
      { key: 'status', type: 'string', size: 20, required: true, default: 'pending' },
      { key: 'reference', type: 'string', size: 100, required: true },
      { key: 'transactionId', type: 'string', size: 50, required: false },
      { key: 'dueDate', type: 'datetime', required: false },
      { key: 'paidAt', type: 'datetime', required: false },
      { key: 'declinedAt', type: 'datetime', required: false },
      { key: 'declineReason', type: 'string', size: 500, required: false },
      { key: 'metadata', type: 'string', size: 1000, required: false }
    ],
    indexes: [
      { key: 'reference', type: 'unique', attributes: ['reference'] },
      { key: 'requesterId', type: 'key', attributes: ['requesterId'] },
      { key: 'payerId', type: 'key', attributes: ['payerId'] },
      { key: 'status', type: 'key', attributes: ['status'] }
    ]
  },
  {
    id: 'virtual_cards',
    name: 'Virtual Cards',
    permissions: [
      Permission.read(Role.users()),
      Permission.create(Role.users()),
      Permission.update(Role.users())
    ],
    attributes: [
      { key: 'userId', type: 'string', size: 50, required: true },
      { key: 'cardId', type: 'string', size: 100, required: true },
      { key: 'cardNumber', type: 'string', size: 20, required: true },
      { key: 'cardName', type: 'string', size: 100, required: true },
      { key: 'expiryMonth', type: 'string', size: 2, required: true },
      { key: 'expiryYear', type: 'string', size: 4, required: true },
      { key: 'cvv', type: 'string', size: 4, required: true },
      { key: 'status', type: 'string', size: 20, required: true, default: 'active' },
      { key: 'type', type: 'string', size: 20, required: true },
      { key: 'brand', type: 'string', size: 20, required: true },
      { key: 'currency', type: 'string', size: 3, required: true, default: 'NGN' },
      { key: 'balance', type: 'integer', required: false, default: 0 },
      { key: 'spendingLimit', type: 'integer', required: false },
      { key: 'monthlySpent', type: 'integer', required: false, default: 0 },
      { key: 'isFrozen', type: 'boolean', required: false, default: false },
      { key: 'isDeleted', type: 'boolean', required: false, default: false },
      { key: 'metadata', type: 'string', size: 1000, required: false }
    ],
    indexes: [
      { key: 'cardId', type: 'unique', attributes: ['cardId'] },
      { key: 'userId', type: 'key', attributes: ['userId'] },
      { key: 'status', type: 'key', attributes: ['status'] },
      { key: 'cardNumber', type: 'key', attributes: ['cardNumber'] }
    ]
  },
  {
    id: 'beneficiaries',
    name: 'Beneficiaries',
    permissions: [
      Permission.read(Role.users()),
      Permission.create(Role.users()),
      Permission.update(Role.users()),
      Permission.delete(Role.users())
    ],
    attributes: [
      { key: 'userId', type: 'string', size: 50, required: true },
      { key: 'name', type: 'string', size: 200, required: true },
      { key: 'bankName', type: 'string', size: 100, required: true },
      { key: 'bankCode', type: 'string', size: 10, required: true },
      { key: 'accountNumber', type: 'string', size: 20, required: true },
      { key: 'accountName', type: 'string', size: 200, required: true },
      { key: 'isVerified', type: 'boolean', required: false, default: false },
      { key: 'isActive', type: 'boolean', required: false, default: true },
      { key: 'lastUsed', type: 'datetime', required: false },
      { key: 'usageCount', type: 'integer', required: false, default: 0 },
      { key: 'metadata', type: 'string', size: 500, required: false }
    ],
    indexes: [
      { key: 'userId', type: 'key', attributes: ['userId'] },
      { key: 'bankCode', type: 'key', attributes: ['bankCode'] },
      { key: 'accountNumber', type: 'key', attributes: ['accountNumber'] }
    ]
  },
  {
    id: 'split_bills',
    name: 'Split Bills',
    permissions: [
      Permission.read(Role.users()),
      Permission.create(Role.users()),
      Permission.update(Role.users())
    ],
    attributes: [
      { key: 'creatorId', type: 'string', size: 50, required: true },
      { key: 'title', type: 'string', size: 200, required: true },
      { key: 'description', type: 'string', size: 1000, required: false },
      { key: 'totalAmount', type: 'integer', required: true },
      { key: 'status', type: 'string', size: 20, required: true, default: 'active' },
      { key: 'members', type: 'string', size: 5000, required: true }, // JSON array
      { key: 'completedAt', type: 'datetime', required: false },
      { key: 'metadata', type: 'string', size: 1000, required: false }
    ],
    indexes: [
      { key: 'creatorId', type: 'key', attributes: ['creatorId'] },
      { key: 'status', type: 'key', attributes: ['status'] }
    ]
  },
  {
    id: 'chat_threads',
    name: 'Chat Threads',
    permissions: [
      Permission.read(Role.users()),
      Permission.create(Role.users()),
      Permission.update(Role.users())
    ],
    attributes: [
      { key: 'transactionId', type: 'string', size: 50, required: true },
      { key: 'participants', type: 'string', size: 500, required: true }, // JSON array
      { key: 'lastMessageId', type: 'string', size: 50, required: false },
      { key: 'unreadCount', type: 'integer', required: false, default: 0 },
      { key: 'isActive', type: 'boolean', required: false, default: true },
      { key: 'metadata', type: 'string', size: 1000, required: false }
    ],
    indexes: [
      { key: 'transactionId', type: 'unique', attributes: ['transactionId'] }
    ]
  },
  {
    id: 'chat_messages',
    name: 'Chat Messages',
    permissions: [
      Permission.read(Role.users()),
      Permission.create(Role.users()),
      Permission.update(Role.users())
    ],
    attributes: [
      { key: 'threadId', type: 'string', size: 50, required: true },
      { key: 'transactionId', type: 'string', size: 50, required: true },
      { key: 'senderId', type: 'string', size: 50, required: true },
      { key: 'senderName', type: 'string', size: 200, required: true },
      { key: 'message', type: 'string', size: 2000, required: true },
      { key: 'messageType', type: 'string', size: 30, required: false, default: 'text' },
      { key: 'status', type: 'string', size: 20, required: false, default: 'sent' },
      { key: 'readBy', type: 'string', size: 500, required: false }, // JSON array
      { key: 'metadata', type: 'string', size: 1000, required: false }
    ],
    indexes: [
      { key: 'threadId', type: 'key', attributes: ['threadId'] },
      { key: 'transactionId', type: 'key', attributes: ['transactionId'] },
      { key: 'senderId', type: 'key', attributes: ['senderId'] }
    ]
  },
  {
    id: 'revenue_records',
    name: 'Revenue Records',
    permissions: [
      Permission.read(Role.users()),
      Permission.create(Role.users()),
      Permission.update(Role.users())
    ],
    attributes: [
      { key: 'transactionId', type: 'string', size: 50, required: true },
      { key: 'serviceType', type: 'string', size: 50, required: true },
      { key: 'transactionAmount', type: 'integer', required: true },
      { key: 'feeAmount', type: 'integer', required: true },
      { key: 'kotapayRevenue', type: 'integer', required: true },
      { key: 'partnerRevenue', type: 'integer', required: true },
      { key: 'partnerName', type: 'string', size: 100, required: true },
      { key: 'status', type: 'string', size: 20, required: true, default: 'pending' },
      { key: 'settlementDate', type: 'datetime', required: false },
      { key: 'metadata', type: 'string', size: 1000, required: false }
    ],
    indexes: [
      { key: 'transactionId', type: 'unique', attributes: ['transactionId'] },
      { key: 'serviceType', type: 'key', attributes: ['serviceType'] },
      { key: 'partnerName', type: 'key', attributes: ['partnerName'] },
      { key: 'status', type: 'key', attributes: ['status'] }
    ]
  },
  {
    id: 'security_events',
    name: 'Security Events',
    permissions: [
      Permission.read(Role.users()),
      Permission.create(Role.users())
    ],
    attributes: [
      { key: 'userId', type: 'string', size: 50, required: false },
      { key: 'eventType', type: 'string', size: 50, required: true },
      { key: 'severity', type: 'string', size: 20, required: true },
      { key: 'description', type: 'string', size: 1000, required: true },
      { key: 'ipAddress', type: 'string', size: 50, required: false },
      { key: 'userAgent', type: 'string', size: 500, required: false },
      { key: 'deviceId', type: 'string', size: 100, required: false },
      { key: 'transactionId', type: 'string', size: 50, required: false },
      { key: 'riskScore', type: 'integer', required: false },
      { key: 'metadata', type: 'string', size: 2000, required: false },
      { key: 'resolved', type: 'boolean', required: false, default: false },
      { key: 'resolvedBy', type: 'string', size: 50, required: false }
    ],
    indexes: [
      { key: 'userId', type: 'key', attributes: ['userId'] },
      { key: 'eventType', type: 'key', attributes: ['eventType'] },
      { key: 'severity', type: 'key', attributes: ['severity'] },
      { key: 'resolved', type: 'key', attributes: ['resolved'] }
    ]
  }
];

async function createCollection(collectionConfig) {
  try {
    console.log(`📦 Creating collection: ${collectionConfig.name}`);
    
    // Create collection
    await databases.createCollection(
      databaseId,
      collectionConfig.id,
      collectionConfig.name,
      collectionConfig.permissions
    );
    
    console.log(`✅ Collection '${collectionConfig.name}' created`);
    
    // Add attributes
    for (const attr of collectionConfig.attributes) {
      try {
        switch (attr.type) {
          case 'string':
            await databases.createStringAttribute(
              databaseId,
              collectionConfig.id,
              attr.key,
              attr.size,
              attr.required,
              attr.default
            );
            break;
          case 'integer':
            await databases.createIntegerAttribute(
              databaseId,
              collectionConfig.id,
              attr.key,
              attr.required,
              attr.min,
              attr.max,
              attr.default
            );
            break;
          case 'boolean':
            await databases.createBooleanAttribute(
              databaseId,
              collectionConfig.id,
              attr.key,
              attr.required,
              attr.default
            );
            break;
          case 'datetime':
            await databases.createDatetimeAttribute(
              databaseId,
              collectionConfig.id,
              attr.key,
              attr.required,
              attr.default
            );
            break;
        }
        console.log(`  ✓ Attribute '${attr.key}' added`);
        
        // Small delay to avoid rate limiting
        await new Promise(resolve => setTimeout(resolve, 100));
      } catch (error) {
        console.log(`  ⚠️ Attribute '${attr.key}' may already exist or failed:`, error.message);
      }
    }
    
    // Add indexes
    if (collectionConfig.indexes) {
      for (const index of collectionConfig.indexes) {
        try {
          await databases.createIndex(
            databaseId,
            collectionConfig.id,
            index.key,
            index.type,
            index.attributes
          );
          console.log(`  ✓ Index '${index.key}' added`);
          
          // Small delay to avoid rate limiting
          await new Promise(resolve => setTimeout(resolve, 100));
        } catch (error) {
          console.log(`  ⚠️ Index '${index.key}' may already exist or failed:`, error.message);
        }
      }
    }
    
    console.log(`🎉 Collection '${collectionConfig.name}' setup completed\n`);
    
  } catch (error) {
    if (error.message.includes('already exists')) {
      console.log(`  ⚠️ Collection '${collectionConfig.name}' already exists, skipping\n`);
    } else {
      console.error(`❌ Failed to create collection '${collectionConfig.name}':`, error.message);
    }
  }
}

export async function setupDatabase() {
  console.log('🚀 Starting KotaPay Database Setup...\n');
  console.log('Database Configuration:');
  console.log(`  Endpoint: ${client.config.endpoint}`);
  console.log(`  Project: ${client.config.project}`);
  console.log(`  Database: ${databaseId}\n`);
  
  try {
    // Test database connection
    await databases.get(databaseId);
    console.log('✅ Database connection successful\n');
    
    // Create all collections
    for (const collection of collections) {
      await createCollection(collection);
      
      // Longer delay between collections to avoid rate limiting
      await new Promise(resolve => setTimeout(resolve, 500));
    }
    
    console.log('🎉 Database setup completed successfully!');
    console.log(`Created ${collections.length} collections with all attributes and indexes.`);
    
  } catch (error) {
    console.error('❌ Database setup failed:', error.message);
    console.log('\nPlease check:');
    console.log('1. Your Appwrite endpoint is correct');
    console.log('2. Your project ID is valid');
    console.log('3. Your database ID exists');
    console.log('4. You have proper permissions');
  }
}

// Run setup if called directly
setupDatabase();
