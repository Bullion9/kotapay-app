/**
 * DATABASE SETUP REFERENCE
 * 
 * This file contains the database schema definitions for KotaPay.
 * Since Appwrite collections must be created manually through the Console,
 * this serves as a reference for the required structure.
 * 
 * Follow the DATABASE_SETUP_GUIDE.md for step-by-step instructions.
 * 
 * NOTE: This is a reference-only file to avoid TypeScript compilation errors.
 * The Appwrite SDK methods used for collection creation require server-side 
 * permissions and are not available in the client SDK version. 
 * Use the Appwrite Console instead.
 */

// Database Configuration
export const APPWRITE_CONFIG = {
  databaseId: process.env.EXPO_PUBLIC_APPWRITE_DATABASE_ID || 'kotapay-db',
};

export const COLLECTIONS = {
  USERS: 'users',
  TRANSACTIONS: 'transactions', 
  KYC_DOCUMENTS: 'kyc_documents',
  PAYMENT_REQUESTS: 'payment_requests',
  VIRTUAL_CARDS: 'virtual_cards',
  BENEFICIARIES: 'beneficiaries'
};

/*
 * COLLECTION SCHEMAS FOR MANUAL CREATION
 * 
 * Use these as reference when creating collections in Appwrite Console.
 * Each collection needs the attributes and indexes listed below.
 */

export const USERS_SCHEMA = {
  collectionId: 'users',
  name: 'Users',
  attributes: [
    { key: 'userId', type: 'string', size: 255, required: true },
    { key: 'name', type: 'string', size: 255, required: true },
    { key: 'email', type: 'string', size: 255, required: true },
    { key: 'phone', type: 'string', size: 20, required: false },
    { key: 'address', type: 'string', size: 500, required: false },
    { key: 'dateOfBirth', type: 'string', size: 20, required: false },
    { key: 'nationality', type: 'string', size: 100, required: false },
    { key: 'bvn', type: 'string', size: 20, required: false },
    { key: 'nin', type: 'string', size: 20, required: false },
    { key: 'kycTier', type: 'enum', elements: ['1', '2', '3'], required: true, default: '1' },
    { key: 'walletBalance', type: 'float', required: false, default: 0 },
    { key: 'monthlySpent', type: 'float', required: false, default: 0 },
    { key: 'createdAt', type: 'datetime', required: true },
    { key: 'updatedAt', type: 'datetime', required: true }
  ],
  indexes: [
    { key: 'userId_idx', type: 'key', attributes: ['userId'] },
    { key: 'email_idx', type: 'key', attributes: ['email'] }
  ]
};

export const TRANSACTIONS_SCHEMA = {
  collectionId: 'transactions',
  name: 'Transactions',
  attributes: [
    { key: 'transactionId', type: 'string', size: 255, required: true },
    { key: 'type', type: 'enum', elements: ['send', 'receive', 'topup', 'withdraw'], required: true },
    { key: 'amount', type: 'float', required: true },
    { key: 'currency', type: 'string', size: 10, required: true, default: 'NGN' },
    { key: 'description', type: 'string', size: 500, required: false },
    { key: 'status', type: 'enum', elements: ['pending', 'completed', 'failed', 'cancelled'], required: true, default: 'pending' },
    { key: 'senderUserId', type: 'string', size: 255, required: false },
    { key: 'recipientUserId', type: 'string', size: 255, required: false },
    { key: 'paymentMethod', type: 'string', size: 100, required: false },
    { key: 'reference', type: 'string', size: 255, required: true },
    { key: 'paymentGatewayRef', type: 'string', size: 255, required: false },
    { key: 'createdAt', type: 'datetime', required: true },
    { key: 'updatedAt', type: 'datetime', required: true }
  ],
  indexes: [
    { key: 'transactionId_idx', type: 'key', attributes: ['transactionId'] },
    { key: 'sender_idx', type: 'key', attributes: ['senderUserId'] },
    { key: 'recipient_idx', type: 'key', attributes: ['recipientUserId'] }
  ]
};

export const KYC_DOCUMENTS_SCHEMA = {
  collectionId: 'kyc_documents',
  name: 'KYC Documents',
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
};

export const PAYMENT_REQUESTS_SCHEMA = {
  collectionId: 'payment_requests',
  name: 'Payment Requests',
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
    { key: 'transactionId', type: 'string', size: 255, required: false },
    { key: 'metadata', type: 'string', size: 1000, required: false },
    { key: 'notificationChannels', type: 'string', size: 200, required: false },
    { key: 'lastNotificationSent', type: 'datetime', required: false },
    { key: 'notificationCount', type: 'integer', required: false, default: 0 }
  ],
  indexes: [
    { key: 'requestId_idx', type: 'key', attributes: ['requestId'] },
    { key: 'requester_idx', type: 'key', attributes: ['requesterId'] },
    { key: 'payer_idx', type: 'key', attributes: ['payerId'] },
    { key: 'status_idx', type: 'key', attributes: ['status'] }
  ]
};

export const VIRTUAL_CARDS_SCHEMA = {
  collectionId: 'virtual_cards',
  name: 'Virtual Cards',
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
};

export const BENEFICIARIES_SCHEMA = {
  collectionId: 'beneficiaries',
  name: 'Beneficiaries',
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
};

// Export all schemas for easy reference
export const ALL_SCHEMAS = {
  USERS_SCHEMA,
  TRANSACTIONS_SCHEMA,
  KYC_DOCUMENTS_SCHEMA,
  PAYMENT_REQUESTS_SCHEMA,
  VIRTUAL_CARDS_SCHEMA,
  BENEFICIARIES_SCHEMA
};

/*
 * INSTRUCTIONS FOR MANUAL SETUP:
 * 
 * 1. Open Appwrite Console
 * 2. Navigate to Databases > Create Database (ID: kotapay-db)
 * 3. For each schema above, create a collection with the specified attributes
 * 4. Set appropriate permissions for each collection
 * 5. Create the indexes as specified
 * 
 * See DATABASE_SETUP_GUIDE.md for detailed step-by-step instructions.
 */

export default {
  COLLECTIONS,
  APPWRITE_CONFIG,
  ALL_SCHEMAS
};
