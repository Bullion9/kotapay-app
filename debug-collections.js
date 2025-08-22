#!/usr/bin/env node

/**
 * Debug Database Collections
 * Check what collections exist and their status
 */

const { Client, Databases } = require('node-appwrite');

// Your Appwrite Configuration
const config = {
  endpoint: 'https://nyc.cloud.appwrite.io/v1',
  projectId: '689dc4200011a5bd1658',
  databaseId: '68a6fbd8003e42a7bc5f',
  apiKey: 'standard_0bd3713af516c78ff667780730f1ab9d833d79befd1ece7b59c4f986f69d7a126b08e4b44a6311c634e96e7a77d207d181353429af9bc10c4a85fa4e63e194c073af0688093bb9215cb32d396ac496644a9c0fdd09319cdf79a5087456a5ad2fdd637acfef3c83c10b956167a0e7713fce0f386447be858c63efa036e94e2c1e'
};

console.log('🔍 Debugging Database Collections...');

// Initialize Appwrite
const client = new Client()
  .setEndpoint(config.endpoint)
  .setProject(config.projectId)
  .setKey(config.apiKey);

const databases = new Databases(client);

async function debugCollections() {
  try {
    console.log('\n📊 Checking available collections...');
    
    const collections = ['users', 'transactions', 'kyc_documents', 'payment_requests', 'virtual_cards', 'beneficiaries'];
    
    for (const collectionId of collections) {
      try {
        const result = await databases.listDocuments(config.databaseId, collectionId);
        console.log(`✅ ${collectionId}: ${result.documents.length} documents`);
        
        if (result.documents.length > 0) {
          console.log(`   Sample document keys:`, Object.keys(result.documents[0]));
        }
      } catch (error) {
        console.log(`❌ ${collectionId}: ${error.message}`);
      }
    }
    
  } catch (error) {
    console.error('\n❌ Error during collection debug:', error.message);
  }
}

debugCollections();
