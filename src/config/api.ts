// API Configuration
const API_CONFIG = {
  baseURL: process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3000/api',
  healthURL: process.env.EXPO_PUBLIC_BACKEND_HEALTH || 'http://localhost:3000/health',
  paystackURL: process.env.EXPO_PUBLIC_PAYSTACK_API_URL || 'https://api.paystack.co',
  timeout: parseInt(process.env.EXPO_PUBLIC_API_TIMEOUT || '10000'),
  retryAttempts: parseInt(process.env.EXPO_PUBLIC_API_RETRY_ATTEMPTS || '3'),
  retryDelay: parseInt(process.env.EXPO_PUBLIC_API_RETRY_DELAY || '1000'),
  environment: process.env.EXPO_PUBLIC_ENVIRONMENT || 'development',
};

// Appwrite Configuration
export const APPWRITE_CONFIG = {
  endpoint: process.env.EXPO_PUBLIC_APPWRITE_ENDPOINT || 'https://cloud.appwrite.io/v1',
  projectId: process.env.EXPO_PUBLIC_APPWRITE_PROJECT_ID || '675b34f600151bb4bb8c',
  databaseId: process.env.EXPO_PUBLIC_APPWRITE_DATABASE_ID || 'kotapay-db',
  
  // Collection IDs
  collections: {
    users: process.env.EXPO_PUBLIC_APPWRITE_USER_COLLECTION_ID || 'users',
    transactions: process.env.EXPO_PUBLIC_APPWRITE_TRANSACTIONS_COLLECTION_ID || 'transactions',
    kycDocuments: process.env.EXPO_PUBLIC_APPWRITE_KYC_COLLECTION_ID || 'kyc_documents',
    paymentRequests: process.env.EXPO_PUBLIC_APPWRITE_PAYMENT_REQUESTS_COLLECTION_ID || 'payment_requests',
    virtualCards: process.env.EXPO_PUBLIC_APPWRITE_VIRTUAL_CARDS_COLLECTION_ID || 'virtual_cards',
    beneficiaries: process.env.EXPO_PUBLIC_APPWRITE_BENEFICIARIES_COLLECTION_ID || 'beneficiaries',
    splitBills: process.env.EXPO_PUBLIC_APPWRITE_SPLIT_BILLS_COLLECTION_ID || 'split_bills',
    chatThreads: process.env.EXPO_PUBLIC_APPWRITE_CHAT_THREADS_COLLECTION_ID || 'chat_threads',
    chatMessages: process.env.EXPO_PUBLIC_APPWRITE_CHAT_MESSAGES_COLLECTION_ID || 'chat_messages',
    revenueRecords: process.env.EXPO_PUBLIC_APPWRITE_REVENUE_RECORDS_COLLECTION_ID || 'revenue_records',
    securityEvents: process.env.EXPO_PUBLIC_APPWRITE_SECURITY_EVENTS_COLLECTION_ID || 'security_events',
  },
  
  storageId: process.env.EXPO_PUBLIC_APPWRITE_STORAGE_ID || 'default',
};

// Paystack Configuration
export const PAYSTACK_CONFIG = {
  publicKey: process.env.EXPO_PUBLIC_PAYSTACK_PUBLIC_KEY || '',
  apiUrl: process.env.EXPO_PUBLIC_PAYSTACK_API_URL || 'https://api.paystack.co',
};

// Debug Configuration
export const DEBUG_CONFIG = {
  api: process.env.EXPO_PUBLIC_DEBUG_API === 'true',
  appwrite: process.env.EXPO_PUBLIC_DEBUG_APPWRITE === 'true',
  notifications: process.env.EXPO_PUBLIC_DEBUG_NOTIFICATIONS === 'true',
};

// Headers configuration
export const API_HEADERS = {
  'Content-Type': 'application/json',
  'Accept': 'application/json',
};

// Rate limiting configuration
export const RATE_LIMIT = {
  maxRequests: 100,
  windowMs: 15 * 60 * 1000, // 15 minutes
};

export default API_CONFIG;
