# KotaPay Database Setup Guide

## Quick Setup Options

### Option 1: Automated Script (Recommended)
If you have Node.js access and can install packages:

1. **Navigate to your project folder:**
   ```bash
   cd /Users/bullionhead/Desktop/kotapay
   ```

2. **Install node-appwrite:**
   ```bash
   npm install node-appwrite
   ```

3. **Get your API key from Appwrite Console:**
   - Go to https://cloud.appwrite.io/
   - Open your project: "Kota pay"
   - Go to Settings > API Keys
   - Create a new API key with Database permissions

4. **Run the setup script:**
   ```bash
   export APPWRITE_API_KEY=your_api_key_here
   node create-collections.js
   ```

### Option 2: Manual Setup (Appwrite Console)
If you prefer to create collections manually:

1. **Open Appwrite Console:** https://cloud.appwrite.io/
2. **Navigate to your project:** "Kota pay"
3. **Go to Databases section**
4. **Select database:** kotapay-db (68a6fbd8003e42a7bc5f)
5. **Create the following collections:**

---

## Collection Schemas

### 1. Users Collection
**Collection ID:** `users`
**Name:** Users

**Attributes:**
- `userId` (String, 255, Required)
- `firstName` (String, 255, Required)
- `lastName` (String, 255, Required)
- `email` (String, 255, Required)
- `phone` (String, 20, Optional)
- `dateOfBirth` (String, 20, Optional)
- `address` (String, 500, Optional)
- `city` (String, 100, Optional)
- `state` (String, 100, Optional)
- `country` (String, 100, Optional, Default: "Nigeria")
- `profileImage` (String, 500, Optional)
- `kycStatus` (Enum: pending, verified, rejected, Required, Default: pending)
- `kycTier` (Integer, Required, Default: 1)
- `accountBalance` (Float, Optional, Default: 0)
- `walletBalance` (Float, Optional, Default: 0)
- `monthlySpent` (Float, Optional, Default: 0)
- `createdAt` (DateTime, Required)
- `updatedAt` (DateTime, Required)

**Indexes:**
- `userId_idx` (Key, userId)
- `email_idx` (Key, email)

**Permissions:**
- Read: Any
- Create: Users
- Update: Users
- Delete: Users

---

### 2. Transactions Collection
**Collection ID:** `transactions`
**Name:** Transactions

**Attributes:**
- `userId` (String, 255, Required)
- `type` (Enum: debit, credit, Required)
- `amount` (Float, Required)
- `description` (String, 500, Optional)
- `reference` (String, 255, Required)
- `status` (Enum: pending, successful, failed, Required, Default: pending)
- `recipientId` (String, 255, Optional)
- `recipientName` (String, 255, Optional)
- `recipientAccount` (String, 255, Optional)
- `recipientBank` (String, 255, Optional)
- `paystackReference` (String, 255, Optional)
- `createdAt` (DateTime, Required)
- `updatedAt` (DateTime, Required)

**Indexes:**
- `userId_idx` (Key, userId)
- `reference_idx` (Key, reference)

**Permissions:**
- Read: Any
- Create: Users
- Update: Users

---

### 3. KYC Documents Collection
**Collection ID:** `kyc_documents`
**Name:** KYC Documents

**Attributes:**
- `userId` (String, 255, Required)
- `documentType` (Enum: bvn, nin, passport, drivers_license, voters_card, Required)
- `documentNumber` (String, 255, Required)
- `documentUrl` (String, 500, Optional)
- `fileName` (String, 255, Optional)
- `verificationStatus` (Enum: pending, verified, rejected, Required, Default: pending)
- `rejectionReason` (String, 500, Optional)
- `tierLevel` (Integer, Required)
- `uploadedAt` (DateTime, Required)
- `verifiedAt` (DateTime, Optional)
- `expiresAt` (DateTime, Optional)

**Indexes:**
- `userId_idx` (Key, userId)
- `documentType_idx` (Key, documentType)

**Permissions:**
- Read: Any
- Create: Users
- Update: Users

---

### 4. Payment Requests Collection
**Collection ID:** `payment_requests`
**Name:** Payment Requests

**Attributes:**
- `requestId` (String, 255, Required)
- `requesterId` (String, 255, Required)
- `payerId` (String, 255, Optional)
- `description` (String, 500, Required)
- `reference` (String, 255, Required)
- `amount` (Float, Required)
- `currency` (String, 10, Required, Default: "NGN")
- `status` (Enum: pending, paid, expired, cancelled, Required, Default: pending)
- `type` (Enum: one_time, recurring, Required, Default: one_time)
- `createdAt` (DateTime, Required)
- `expiresAt` (DateTime, Optional)
- `paidAt` (DateTime, Optional)
- `paymentLink` (String, 500, Optional)
- `qrCode` (String, 500, Optional)
- `transactionId` (String, 255, Optional)

**Indexes:**
- `requestId_idx` (Key, requestId)
- `requester_idx` (Key, requesterId)
- `status_idx` (Key, status)

**Permissions:**
- Read: Any
- Create: Users
- Update: Users

---

### 5. Virtual Cards Collection
**Collection ID:** `virtual_cards`
**Name:** Virtual Cards

**Attributes:**
- `cardId` (String, 255, Required)
- `userId` (String, 255, Required)
- `cardNumber` (String, 20, Required)
- `cardHolderName` (String, 255, Required)
- `expiryMonth` (String, 2, Required)
- `expiryYear` (String, 4, Required)
- `cvv` (String, 4, Required)
- `cardType` (Enum: debit, credit, Required, Default: debit)
- `balance` (Float, Required, Default: 0)
- `isActive` (Boolean, Required, Default: true)
- `createdAt` (DateTime, Required)
- `updatedAt` (DateTime, Required)

**Indexes:**
- `cardId_idx` (Key, cardId)
- `userId_idx` (Key, userId)

**Permissions:**
- Read: Any
- Create: Users
- Update: Users

---

### 6. Beneficiaries Collection
**Collection ID:** `beneficiaries`
**Name:** Beneficiaries

**Attributes:**
- `userId` (String, 255, Required)
- `beneficiaryId` (String, 255, Required)
- `name` (String, 255, Required)
- `accountNumber` (String, 20, Required)
- `bankName` (String, 255, Required)
- `bankCode` (String, 10, Required)
- `isVerified` (Boolean, Required, Default: false)
- `createdAt` (DateTime, Required)
- `updatedAt` (DateTime, Required)

**Indexes:**
- `userId_idx` (Key, userId)

**Permissions:**
- Read: Any
- Create: Users
- Update: Users

---

## Testing Your Setup

After creating the collections:

1. **Open your KotaPay app**
2. **Tap the "Setup DB" button** on the home screen
3. **Check the console** for verification results
4. **If successful**, the app will switch from mock mode to real database mode

## Troubleshooting

### Common Issues:

1. **Permission errors:** Make sure all collections have Read/Create/Update permissions for "Users"
2. **Attribute type errors:** Double-check enum values match exactly (case-sensitive)
3. **Connection errors:** Verify your project ID and database ID in the .env file

### Support:

If you encounter issues:
1. Check the console logs for detailed error messages
2. Verify your Appwrite project configuration
3. Ensure all collection IDs match exactly (case-sensitive)

---

## Next Steps

Once the database is set up:
- ✅ Test wallet transfers (will use real database)
- ✅ Test user authentication and profiles
- ✅ Test payment requests and QR codes
- ✅ All KotaPay features will work with persistent data

Your KotaPay app is now ready for production use! 🎉
