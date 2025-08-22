/**
 * KotaPay Database Setup - Web Console Commands
 * 
 * Copy and paste these commands into your Appwrite console or use with API key
 */

// Database Setup Commands for Appwrite Console
const setupCommands = {
  // 1. Users Collection
  users: {
    id: 'users',
    name: 'Users',
    permissions: ['read("any")', 'create("users")', 'update("users")', 'delete("users")'],
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

  // 2. Transactions Collection
  transactions: {
    id: 'transactions',
    name: 'Transactions',
    permissions: ['read("users")', 'create("users")', 'update("users")'],
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

  // 3. KYC Documents Collection  
  kyc_documents: {
    id: 'kyc_documents',
    name: 'KYC Documents',
    permissions: ['read("users")', 'create("users")', 'update("users")'],
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

  // 4. Payment Requests Collection
  payment_requests: {
    id: 'payment_requests',
    name: 'Payment Requests',
    permissions: ['read("users")', 'create("users")', 'update("users")'],
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

  // 5. Virtual Cards Collection
  virtual_cards: {
    id: 'virtual_cards',
    name: 'Virtual Cards',
    permissions: ['read("users")', 'create("users")', 'update("users")'],
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

  // 6. Beneficiaries Collection
  beneficiaries: {
    id: 'beneficiaries',
    name: 'Beneficiaries',
    permissions: ['read("users")', 'create("users")', 'update("users")', 'delete("users")'],
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
  }
};

console.log('📋 KotaPay Database Setup Guide');
console.log('================================\n');

console.log('🔧 Manual Setup Instructions:');
console.log('1. Go to https://cloud.appwrite.io/');
console.log('2. Navigate to your project: Kota pay');
console.log('3. Go to Databases > kotapay-db');
console.log('4. Create the following collections:\n');

Object.entries(setupCommands).forEach(([key, config]) => {
  console.log(`📁 Collection: ${config.name} (ID: ${config.id})`);
  console.log(`   Attributes: ${config.attributes.length} fields`);
  console.log(`   Indexes: ${config.indexes.length} indexes`);
  console.log('');
});

console.log('💡 Or use the automated script with API key:');
console.log('   APPWRITE_API_KEY=your_api_key node setup-database.js');

export { setupCommands };
