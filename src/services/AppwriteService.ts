import { Account, Client, Databases, Functions, ID, ImageGravity, Query, Storage } from 'appwrite';
import { APPWRITE_CONFIG } from '../config/api';

// Initialize Appwrite Client for client-side operations
const client = new Client()
  .setEndpoint(APPWRITE_CONFIG.endpoint)
  .setProject(APPWRITE_CONFIG.projectId);

// For database operations, we'll use a different approach since React Native client
// doesn't support API keys directly. We'll handle auth through user sessions.

// Initialize Services
export const account = new Account(client);
export const databases = new Databases(client);
export const storage = new Storage(client);
export const functions = new Functions(client);

// Types
export interface User {
  $id: string;
  email: string;
  name: string;
  phone?: string;
  emailVerification: boolean;
  phoneVerification: boolean;
  prefs: Record<string, any>;
  registration: string;
  status: boolean;
}

export interface UserDocument {
  $id: string;
  userId: string;
  firstName: string;
  lastName: string;
  email: string; // Email field for the user
  phone: string;
  dateOfBirth?: string;
  address?: string;
  city?: string;
  state?: string;
  country?: string;
  profileImage?: string;
  kycStatus?: 'pending' | 'verified' | 'rejected'; // Make optional
  accountBalance?: number; // Legacy field - make optional
  walletBalance: number; // New field for stored-value wallet
  createdAt: string;
  updatedAt: string;
}

export interface Transaction {
  $id: string;
  userId: string;
  type: 'debit' | 'credit';
  amount: number;
  description: string;
  reference: string;
  status: 'pending' | 'successful' | 'failed';
  recipientId?: string;
  recipientName?: string;
  recipientAccount?: string;
  recipientBank?: string;
  paystackReference?: string;
  createdAt: string;
  updatedAt: string;
}

// Collections
export const COLLECTIONS = {
  USERS: 'users',
  TRANSACTIONS: 'transactions',
  VIRTUAL_CARDS: 'virtual_cards',
  BENEFICIARIES: 'beneficiaries',
  KYC_DOCUMENTS: 'kyc_documents',
};

class AppwriteService {
  // Authentication Methods
  async createAccount(email: string, password: string, name: string) {
    try {
      const response = await account.create(ID.unique(), email, password, name);
      return response;
    } catch (error) {
      console.error('Error creating account:', error);
      throw error;
    }
  }

  async signIn(email: string, password: string) {
    try {
      const session = await account.createEmailPasswordSession(email, password);
      return session;
    } catch (error) {
      console.error('Error signing in:', error);
      throw error;
    }
  }

  async signOut() {
    try {
      await account.deleteSession('current');
    } catch (error) {
      console.error('Error signing out:', error);
      throw error;
    }
  }

  async getCurrentUser(): Promise<User | null> {
    try {
      const user = await account.get();
      return user as User;
    } catch (error) {
      console.error('Error getting current user:', error);
      return null;
    }
  }

  async updatePassword(newPassword: string, oldPassword: string) {
    try {
      return await account.updatePassword(newPassword, oldPassword);
    } catch (error) {
      console.error('Error updating password:', error);
      throw error;
    }
  }

  async sendPasswordRecovery(email: string) {
    try {
      return await account.createRecovery(
        email,
        'https://your-app-domain.com/reset-password'
      );
    } catch (error) {
      console.error('Error sending password recovery:', error);
      throw error;
    }
  }

  async verifyPasswordRecovery(userId: string, secret: string, newPassword: string) {
    try {
      return await account.updateRecovery(userId, secret, newPassword);
    } catch (error) {
      console.error('Error verifying password recovery:', error);
      throw error;
    }
  }

  // User Profile Methods
  async createUserProfile(userData: Omit<UserDocument, '$id' | 'createdAt' | 'updatedAt'>) {
    try {
      const response = await databases.createDocument(
        APPWRITE_CONFIG.databaseId,
        COLLECTIONS.USERS,
        ID.unique(),
        {
          ...userData,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        }
      );
      return response as unknown as UserDocument;
    } catch (error) {
      console.error('Error creating user profile:', error);
      throw error;
    }
  }

  async getUserProfile(userId: string): Promise<UserDocument | null> {
    try {
      const response = await databases.listDocuments(
        APPWRITE_CONFIG.databaseId,
        COLLECTIONS.USERS,
        [Query.equal('userId', userId)]
      );
      return (response.documents[0] as unknown as UserDocument) || null;
    } catch (error) {
      console.error('Error getting user profile:', error);
      return null;
    }
  }

  async updateUserProfile(documentId: string, updates: Partial<Omit<UserDocument, '$id'>>) {
    try {
      const response = await databases.updateDocument(
        APPWRITE_CONFIG.databaseId,
        COLLECTIONS.USERS,
        documentId,
        {
          ...updates,
          updatedAt: new Date().toISOString(),
        }
      );
      return response as unknown as UserDocument;
    } catch (error) {
      console.error('Error updating user profile:', error);
      throw error;
    }
  }

  // Transaction Methods
  async createTransaction(transactionData: Omit<Transaction, '$id' | 'createdAt' | 'updatedAt'>) {
    try {
      const response = await databases.createDocument(
        APPWRITE_CONFIG.databaseId,
        COLLECTIONS.TRANSACTIONS,
        ID.unique(),
        {
          ...transactionData,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        }
      );
      return response as unknown as Transaction;
    } catch (error) {
      console.error('Error creating transaction:', error);
      throw error;
    }
  }

  async getUserTransactions(userId: string, limit = 50, offset = 0): Promise<Transaction[]> {
    try {
      const response = await databases.listDocuments(
        APPWRITE_CONFIG.databaseId,
        COLLECTIONS.TRANSACTIONS,
        [
          Query.equal('userId', userId),
          Query.orderDesc('createdAt'),
          Query.limit(limit),
          Query.offset(offset),
        ]
      );
      return response.documents as unknown as Transaction[];
    } catch (error) {
      console.error('Error getting user transactions:', error);
      return [];
    }
  }

  async updateTransaction(transactionId: string, updates: Partial<Omit<Transaction, '$id'>>) {
    try {
      const response = await databases.updateDocument(
        APPWRITE_CONFIG.databaseId,
        COLLECTIONS.TRANSACTIONS,
        transactionId,
        {
          ...updates,
          updatedAt: new Date().toISOString(),
        }
      );
      return response as unknown as Transaction;
    } catch (error) {
      console.error('Error updating transaction:', error);
      throw error;
    }
  }

  // File Upload Methods
  async uploadFile(file: File, bucketId?: string) {
    try {
      const response = await storage.createFile(
        bucketId || APPWRITE_CONFIG.storageId,
        ID.unique(),
        file
      );
      return response;
    } catch (error) {
      console.error('Error uploading file:', error);
      throw error;
    }
  }

  async getFilePreview(fileId: string, bucketId?: string) {
    try {
      return storage.getFilePreview(
        bucketId || APPWRITE_CONFIG.storageId,
        fileId,
        300, // width
        300, // height
        ImageGravity.Center, // gravity
        80 // quality
      );
    } catch (error) {
      console.error('Error getting file preview:', error);
      throw error;
    }
  }

  async deleteFile(fileId: string, bucketId?: string) {
    try {
      await storage.deleteFile(bucketId || APPWRITE_CONFIG.storageId, fileId);
    } catch (error) {
      console.error('Error deleting file:', error);
      throw error;
    }
  }

  // Functions Methods
  async executeFunction(functionId: string, data?: object) {
    try {
      const response = await functions.createExecution(
        functionId,
        JSON.stringify(data || {}),
        false
      );
      return response;
    } catch (error) {
      console.error('Error executing function:', error);
      throw error;
    }
  }

  // Generic Document Methods
  async createDocument(collectionId: string, documentId: string, data: any) {
    try {
      const response = await databases.createDocument(
        APPWRITE_CONFIG.databaseId,
        collectionId,
        documentId,
        data
      );
      return response;
    } catch (error) {
      console.error('Error creating document:', error);
      throw error;
    }
  }

  async getDocument(collectionId: string, documentId: string) {
    try {
      const response = await databases.getDocument(
        APPWRITE_CONFIG.databaseId,
        collectionId,
        documentId
      );
      return response;
    } catch (error) {
      console.error('Error getting document:', error);
      throw error;
    }
  }

  async updateDocument(collectionId: string, documentId: string, data: any) {
    try {
      const response = await databases.updateDocument(
        APPWRITE_CONFIG.databaseId,
        collectionId,
        documentId,
        data
      );
      return response;
    } catch (error) {
      console.error('Error updating document:', error);
      throw error;
    }
  }

  async deleteDocument(collectionId: string, documentId: string) {
    try {
      await databases.deleteDocument(
        APPWRITE_CONFIG.databaseId,
        collectionId,
        documentId
      );
    } catch (error) {
      console.error('Error deleting document:', error);
      throw error;
    }
  }

  async listDocuments(collectionId: string, queries?: string[]) {
    try {
      const response = await databases.listDocuments(
        APPWRITE_CONFIG.databaseId,
        collectionId,
        queries || []
      );
      return response;
    } catch (error) {
      console.error('Error listing documents:', error);
      throw error;
    }
  }

  async getUserById(userId: string): Promise<UserDocument | null> {
    try {
      const response = await databases.listDocuments(
        APPWRITE_CONFIG.databaseId,
        COLLECTIONS.USERS,
        [Query.equal('userId', userId)]
      );
      return (response.documents[0] as unknown as UserDocument) || null;
    } catch (error) {
      console.error('Error getting user by ID:', error);
      return null;
    }
  }

  async getUserByEmail(email: string): Promise<UserDocument | null> {
    try {
      const response = await databases.listDocuments(
        APPWRITE_CONFIG.databaseId,
        COLLECTIONS.USERS,
        [Query.equal('email', email)]
      );
      return (response.documents[0] as unknown as UserDocument) || null;
    } catch (error) {
      console.error('Error getting user by email:', error);
      return null;
    }
  }

  // Real-time Subscriptions
  subscribeToCollection(collectionId: string, callback: (payload: any) => void) {
    return client.subscribe(
      `databases.${APPWRITE_CONFIG.databaseId}.collections.${collectionId}.documents`,
      callback
    );
  }

  subscribeToDocument(collectionId: string, documentId: string, callback: (payload: unknown) => void) {
    return client.subscribe(
      `databases.${APPWRITE_CONFIG.databaseId}.collections.${collectionId}.documents.${documentId}`,
      callback
    );
  }
}

export default new AppwriteService();
