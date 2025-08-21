// API Configuration
const API_CONFIG = {
  baseURL: process.env.EXPO_PUBLIC_API_BASE_URL || 'https://api.paystack.co',
  healthURL: process.env.EXPO_PUBLIC_HEALTH_CHECK_URL || 'https://api.paystack.co/status',
  timeout: 10000, // 10 seconds
  retryAttempts: 3,
  retryDelay: 1000, // 1 second
};

// Appwrite Configuration
export const APPWRITE_CONFIG = {
  endpoint: process.env.EXPO_PUBLIC_APPWRITE_ENDPOINT || 'https://cloud.appwrite.io/v1',
  projectId: process.env.EXPO_PUBLIC_APPWRITE_PROJECT_ID || '',
  databaseId: process.env.EXPO_PUBLIC_APPWRITE_DATABASE_ID || '',
  userCollectionId: process.env.EXPO_PUBLIC_APPWRITE_USER_COLLECTION_ID || '',
  storageId: process.env.EXPO_PUBLIC_APPWRITE_STORAGE_ID || '',
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
