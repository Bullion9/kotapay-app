const { Client, Databases, Permission, Role } = require('node-appwrite');

// Check for API key
const apiKey = process.env.APPWRITE_API_KEY || process.argv[2];
if (!apiKey) {
  console.error('❌ Error: API key required');
  console.log('Usage: APPWRITE_API_KEY=your_key node setup-database.js');
  console.log('   or: node setup-database.js your_api_key');
  console.log('\n💡 Get your API key from: https://cloud.appwrite.io/project-675b34f600151bb4bb8c/settings/keys');
  process.exit(1);
}

// Initialize Appwrite client
const client = new Client()
  .setEndpoint('https://cloud.appwrite.io/v1')
  .setProject('675b34f600151bb4bb8c') 
  .setKey(apiKey);

const databases = new Databases(client);
const databaseId = 'kotapay-db';

async function setupDatabase() {
  try {
    console.log('🚀 Starting KotaPay database setup...\n');

    // Collection configurations
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
      // Social Features Collections
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
          { key: 'description', type: 'string', size: 500, required: false },
          { key: 'totalAmount', type: 'integer', required: true },
          { key: 'participants', type: 'string', size: 2000, required: true }, // JSON array
          { key: 'status', type: 'string', size: 20, required: true, default: 'active' },
          { key: 'dueDate', type: 'datetime', required: false },
          { key: 'completedAt', type: 'datetime', required: false },
          { key: 'splitType', type: 'string', size: 20, required: true, default: 'equal' },
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
          { key: 'participants', type: 'string', size: 500, required: true }, // JSON array
          { key: 'transactionId', type: 'string', size: 50, required: false },
          { key: 'splitBillId', type: 'string', size: 50, required: false },
          { key: 'lastMessage', type: 'string', size: 500, required: false },
          { key: 'lastMessageAt', type: 'datetime', required: false },
          { key: 'isActive', type: 'boolean', required: false, default: true },
          { key: 'threadType', type: 'string', size: 20, required: true, default: 'transaction' },
          { key: 'metadata', type: 'string', size: 1000, required: false }
        ],
        indexes: [
          { key: 'transactionId', type: 'key', attributes: ['transactionId'] },
          { key: 'splitBillId', type: 'key', attributes: ['splitBillId'] },
          { key: 'threadType', type: 'key', attributes: ['threadType'] }
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
          { key: 'senderId', type: 'string', size: 50, required: true },
          { key: 'message', type: 'string', size: 2000, required: true },
          { key: 'messageType', type: 'string', size: 20, required: true, default: 'text' },
          { key: 'isEdited', type: 'boolean', required: false, default: false },
          { key: 'editedAt', type: 'datetime', required: false },
          { key: 'readBy', type: 'string', size: 500, required: false }, // JSON array
          { key: 'metadata', type: 'string', size: 1000, required: false }
        ],
        indexes: [
          { key: 'threadId', type: 'key', attributes: ['threadId'] },
          { key: 'senderId', type: 'key', attributes: ['senderId'] }
        ]
      },
      {
        id: 'revenue_records',
        name: 'Revenue Records',
        permissions: [
          Permission.read(Role.users()),
          Permission.create(Role.users())
        ],
        attributes: [
          { key: 'transactionId', type: 'string', size: 50, required: true },
          { key: 'feeAmount', type: 'integer', required: true },
          { key: 'kotaPayRevenue', type: 'integer', required: true },
          { key: 'partnerRevenue', type: 'integer', required: false, default: 0 },
          { key: 'revenueType', type: 'string', size: 30, required: true },
          { key: 'partnerId', type: 'string', size: 50, required: false },
          { key: 'settlementStatus', type: 'string', size: 20, required: true, default: 'pending' },
          { key: 'settlementDate', type: 'datetime', required: false },
          { key: 'metadata', type: 'string', size: 1000, required: false }
        ],
        indexes: [
          { key: 'transactionId', type: 'unique', attributes: ['transactionId'] },
          { key: 'revenueType', type: 'key', attributes: ['revenueType'] },
          { key: 'settlementStatus', type: 'key', attributes: ['settlementStatus'] }
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
          { key: 'userId', type: 'string', size: 50, required: true },
          { key: 'eventType', type: 'string', size: 50, required: true },
          { key: 'description', type: 'string', size: 500, required: true },
          { key: 'severity', type: 'string', size: 20, required: true },
          { key: 'ipAddress', type: 'string', size: 45, required: false },
          { key: 'userAgent', type: 'string', size: 500, required: false },
          { key: 'deviceId', type: 'string', size: 100, required: false },
          { key: 'riskScore', type: 'integer', required: false },
          { key: 'actionTaken', type: 'string', size: 200, required: false },
          { key: 'metadata', type: 'string', size: 1000, required: false }
        ],
        indexes: [
          { key: 'userId', type: 'key', attributes: ['userId'] },
          { key: 'eventType', type: 'key', attributes: ['eventType'] },
          { key: 'severity', type: 'key', attributes: ['severity'] }
        ]
      },
      {
        id: 'audit_logs',
        name: 'Audit Logs',
        permissions: [
          Permission.read(Role.users()),
          Permission.create(Role.users())
        ],
        attributes: [
          { key: 'eventId', type: 'string', size: 50, required: true },
          { key: 'userId', type: 'string', size: 50, required: true },
          { key: 'eventType', type: 'string', size: 50, required: true },
          { key: 'description', type: 'string', size: 500, required: true },
          { key: 'severity', type: 'string', size: 20, required: true },
          { key: 'ipAddress', type: 'string', size: 45, required: false },
          { key: 'userAgent', type: 'string', size: 500, required: false },
          { key: 'deviceId', type: 'string', size: 100, required: false },
          { key: 'metadata', type: 'string', size: 2000, required: false },
          { key: 'hash', type: 'string', size: 64, required: true },
          { key: 'timestamp', type: 'datetime', required: true }
        ],
        indexes: [
          { key: 'eventId', type: 'unique', attributes: ['eventId'] },
          { key: 'userId', type: 'key', attributes: ['userId'] },
          { key: 'eventType', type: 'key', attributes: ['eventType'] },
          { key: 'severity', type: 'key', attributes: ['severity'] },
          { key: 'hash', type: 'key', attributes: ['hash'] }
        ]
      }
    ];

    // Create collections one by one
    for (const collection of collections) {
      console.log(`📁 Creating collection: ${collection.name}...`);
      
      try {
        // Create the collection
        await databases.createCollection(
          databaseId,
          collection.id,
          collection.name,
          collection.permissions
        );
        console.log(`✅ Collection "${collection.name}" created successfully`);

        // Add attributes
        for (const attr of collection.attributes) {
          try {
            if (attr.type === 'string') {
              await databases.createStringAttribute(
                databaseId,
                collection.id,
                attr.key,
                attr.size,
                attr.required,
                attr.default
              );
            } else if (attr.type === 'integer') {
              await databases.createIntegerAttribute(
                databaseId,
                collection.id,
                attr.key,
                attr.required,
                undefined, // min
                undefined, // max
                attr.default
              );
            } else if (attr.type === 'boolean') {
              await databases.createBooleanAttribute(
                databaseId,
                collection.id,
                attr.key,
                attr.required,
                attr.default
              );
            } else if (attr.type === 'datetime') {
              await databases.createDatetimeAttribute(
                databaseId,
                collection.id,
                attr.key,
                attr.required,
                attr.default
              );
            }
            console.log(`  ➕ Added attribute: ${attr.key}`);
          } catch (attrError) {
            console.log(`  ⚠️  Attribute ${attr.key} might already exist: ${attrError.message}`);
          }
        }

        // Wait a bit for attributes to be ready
        await new Promise(resolve => setTimeout(resolve, 2000));

        // Add indexes
        for (const index of collection.indexes) {
          try {
            await databases.createIndex(
              databaseId,
              collection.id,
              index.key,
              index.type,
              index.attributes
            );
            console.log(`  🔍 Added index: ${index.key}`);
          } catch (indexError) {
            console.log(`  ⚠️  Index ${index.key} might already exist: ${indexError.message}`);
          }
        }

        console.log(`✅ Collection "${collection.name}" setup complete\n`);
      } catch (error) {
        if (error.code === 409) {
          console.log(`⚠️  Collection "${collection.name}" already exists\n`);
        } else {
          console.error(`❌ Error creating collection "${collection.name}":`, error.message);
        }
      }
    }

    console.log('🎉 Database setup completed!');
    console.log('\n📊 Summary:');
    console.log(`   Database: ${databaseId}`);
    console.log(`   Collections: ${collections.length}`);
    console.log('   ✅ All KotaPay collections are ready for use!');

  } catch (error) {
    console.error('❌ Database setup failed:', error);
  }
}

// Run the setup
setupDatabase();
