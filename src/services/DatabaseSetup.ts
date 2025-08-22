/**
 * KotaPay Database Setup Helper
 * 
 * This service provides database setup instructions and test functions for KotaPay.
 * Collections must be created manually through the Appwrite Console.
 */

import { databases } from './AppwriteService';
import { APPWRITE_CONFIG } from '../config/api';

// Required collections for KotaPay
export const REQUIRED_COLLECTIONS = [
  'users',
  'transactions',
  'kyc_documents',
  'payment_requests',
  'virtual_cards',
  'beneficiaries'
];

class DatabaseSetupService {
  // Test database connection
  async testConnection(): Promise<boolean> {
    try {
      // Try to list documents from a collection to test connection
      await databases.listDocuments(APPWRITE_CONFIG.databaseId, 'users', []);
      return true;
    } catch (error) {
      console.error('Database connection test failed:', error);
      return false;
    }
  }

  // Check which collections exist
  async checkCollections(): Promise<{ exists: string[]; missing: string[] }> {
    const exists: string[] = [];
    const missing: string[] = [];

    for (const collectionId of REQUIRED_COLLECTIONS) {
      try {
        await databases.listDocuments(APPWRITE_CONFIG.databaseId, collectionId, []);
        exists.push(collectionId);
        console.log(`✅ Collection '${collectionId}' exists`);
      } catch {
        missing.push(collectionId);
        console.log(`❌ Collection '${collectionId}' missing`);
      }
    }

    return { exists, missing };
  }

  // Get database setup instructions
  getSetupInstructions(): string[] {
    return [
      '📋 KotaPay Database Setup Instructions',
      '',
      '1. Open Appwrite Console: https://cloud.appwrite.io/',
      '2. Navigate to your project: Kota pay',
      '3. Go to Databases section',
      '4. Select database: kotapay-db (68a6fbd8003e42a7bc5f)',
      '',
      '5. Create the following collections:',
      '',
      '   📁 users',
      '   - Attributes: userId, firstName, lastName, email, phone, walletBalance, kycTier, etc.',
      '   - Permissions: Read/Write for authenticated users',
      '',
      '   📁 transactions', 
      '   - Attributes: userId, type, amount, description, reference, status, etc.',
      '   - Permissions: Read/Write for authenticated users',
      '',
      '   📁 kyc_documents',
      '   - Attributes: userId, documentType, documentNumber, verificationStatus, etc.',
      '   - Permissions: Read/Write for authenticated users',
      '',
      '   📁 payment_requests',
      '   - Attributes: requestId, requesterId, amount, description, status, etc.',
      '   - Permissions: Read/Write for authenticated users',
      '',
      '   📁 virtual_cards',
      '   - Attributes: cardId, userId, cardNumber, balance, isActive, etc.',
      '   - Permissions: Read/Write for authenticated users',
      '',
      '   📁 beneficiaries',
      '   - Attributes: userId, name, accountNumber, bankName, isVerified, etc.',
      '   - Permissions: Read/Write for authenticated users',
      '',
      '6. After creating collections, test connection using the "Setup DB" button',
      '',
      '📚 For detailed schema, see: DATABASE_SETUP_GUIDE.md'
    ];
  }

  // Display setup status
  async displaySetupStatus(): Promise<void> {
    console.log('\n🔧 KotaPay Database Setup Status\n');
    console.log('================================');
    
    // Test connection
    console.log('🔗 Testing connection...');
    const connected = await this.testConnection();
    console.log(`Connection: ${connected ? '✅ Success' : '❌ Failed'}`);
    
    if (!connected) {
      console.log('\n❌ Cannot connect to database. Check your configuration:');
      console.log(`  Project ID: ${APPWRITE_CONFIG.projectId}`);
      console.log(`  Database ID: ${APPWRITE_CONFIG.databaseId}`);
      console.log(`  Endpoint: ${APPWRITE_CONFIG.endpoint}`);
      return;
    }

    // Check collections
    console.log('\n📂 Checking collections...');
    const { exists, missing } = await this.checkCollections();
    
    console.log(`\n✅ Found: ${exists.length}/${REQUIRED_COLLECTIONS.length} collections`);
    if (exists.length > 0) {
      exists.forEach(name => console.log(`  ✅ ${name}`));
    }
    
    if (missing.length > 0) {
      console.log(`\n❌ Missing: ${missing.length} collections`);
      missing.forEach(name => console.log(`  ❌ ${name}`));
      
      console.log('\n📋 Setup Instructions:');
      console.log('To create missing collections, follow these steps:');
      console.log('1. Open Appwrite Console');
      console.log('2. Go to Databases > kotapay-db');
      console.log('3. Create collections with proper attributes');
      console.log('4. See DATABASE_SETUP_GUIDE.md for detailed schema');
    } else {
      console.log('\n🎉 All collections are ready!');
      console.log('✅ Database setup is complete');
    }
  }

  // Create a test user to verify everything works
  async createTestUser(): Promise<boolean> {
    try {
      const testUserData = {
        userId: 'test_user_' + Date.now(),
        firstName: 'Test',
        lastName: 'User',
        email: 'test@kotapay.com',
        phone: '+234800000000',
        walletBalance: 10000,
        kycTier: 1,
        kycStatus: 'verified',
        monthlySpent: 0,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      await databases.createDocument(
        APPWRITE_CONFIG.databaseId,
        'users',
        'unique()',
        testUserData
      );

      console.log('✅ Test user created successfully!');
      console.log('🎉 Database is working correctly');
      return true;
    } catch (error) {
      console.error('❌ Failed to create test user:', error);
      return false;
    }
  }

  // Run complete setup verification
  async runSetupVerification(): Promise<boolean> {
    console.log('\n🧪 Running Database Setup Verification\n');
    console.log('=====================================');

    await this.displaySetupStatus();
    
    const { missing } = await this.checkCollections();
    
    if (missing.length > 0) {
      console.log('\n❌ Setup incomplete - missing collections');
      console.log('\n📖 Instructions:');
      this.getSetupInstructions().forEach(line => console.log(line));
      return false;
    }

    console.log('\n🧪 Testing database operations...');
    const testResult = await this.createTestUser();
    
    if (testResult) {
      console.log('\n🎉 Database setup verification PASSED!');
      console.log('✅ KotaPay is ready to use the real database');
      return true;
    } else {
      console.log('\n❌ Database setup verification FAILED!');
      console.log('🔧 Check collection permissions and attributes');
      return false;
    }
  }
}

export default new DatabaseSetupService();

// Export for direct use
export { DatabaseSetupService };
