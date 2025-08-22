# 🛠️ KotaPay Database Setup Guide

## ❌ **Current Issue**
```
ERROR [AppwriteException: Collection with the requested ID could not be found.]
```

## ✅ **Solution: Create Appwrite Collections**

You need to manually create the required collections in your Appwrite Console. Here's how:

### **Step 1: Open Appwrite Console**
1. Go to your Appwrite Console: `https://cloud.appwrite.io/console`
2. Select your KotaPay project
3. Navigate to **Databases** → Select your database

### **Step 2: Create Required Collections**

Create these **6 collections** with these exact names:

#### **1. users**
- **Collection ID**: `users`
- **Name**: `Users`
- **Permissions**: Default (Read/Write for authenticated users)

#### **2. transactions** 
- **Collection ID**: `transactions`
- **Name**: `Transactions`
- **Permissions**: Default (Read/Write for authenticated users)

#### **3. kyc_documents**
- **Collection ID**: `kyc_documents` 
- **Name**: `KYC Documents`
- **Permissions**: Default (Read/Write for authenticated users)

#### **4. payment_requests**
- **Collection ID**: `payment_requests`
- **Name**: `Payment Requests` 
- **Permissions**: Default (Read/Write for authenticated users)

#### **5. virtual_cards**
- **Collection ID**: `virtual_cards`
- **Name**: `Virtual Cards`
- **Permissions**: Default (Read/Write for authenticated users)

#### **6. beneficiaries**
- **Collection ID**: `beneficiaries`
- **Name**: `Beneficiaries`
- **Permissions**: Default (Read/Write for authenticated users)

### **Step 3: Add Basic Attributes**

For each collection, add these **minimum required attributes**:

#### **users collection:**
```
userId          | String  | Required | Size: 50
firstName       | String  | Required | Size: 100  
lastName        | String  | Required | Size: 100
phone           | String  | Required | Size: 20
kycStatus       | Enum    | Required | Values: pending,verified,rejected | Default: pending
walletBalance   | Float   | Optional | Default: 0
createdAt       | DateTime| Required
updatedAt       | DateTime| Required
```

#### **transactions collection:**
```
userId          | String  | Required | Size: 50
type            | Enum    | Required | Values: debit,credit
amount          | Float   | Required
description     | String  | Required | Size: 255
reference       | String  | Required | Size: 100
status          | Enum    | Required | Values: pending,successful,failed | Default: pending
createdAt       | DateTime| Required
updatedAt       | DateTime| Required
```

#### **kyc_documents collection:**
```
userId          | String  | Required | Size: 50
documentType    | Enum    | Required | Values: government_id,selfie,address_proof
verificationStatus | Enum | Required | Values: pending,verified,rejected | Default: pending
tier            | Integer | Required | Default: 1
createdAt       | DateTime| Required
updatedAt       | DateTime| Required
```

#### **payment_requests collection:**
```
requesterId     | String  | Required | Size: 50
requesterName   | String  | Required | Size: 100
amount          | Float   | Required
description     | String  | Required | Size: 255
type            | Enum    | Required | Values: link,qr,direct
status          | Enum    | Required | Values: pending,paid,expired,cancelled | Default: pending
createdAt       | DateTime| Required
expiresAt       | DateTime| Required
reminderCount   | Integer | Optional | Default: 0
```

#### **virtual_cards collection:**
```
userId          | String  | Required | Size: 50
cardNumber      | String  | Required | Size: 19
cardName        | String  | Required | Size: 100
status          | Enum    | Required | Values: active,frozen,terminated | Default: active
createdAt       | DateTime| Required
updatedAt       | DateTime| Required
```

#### **beneficiaries collection:**
```
userId          | String  | Required | Size: 50
beneficiaryName | String  | Required | Size: 100
accountNumber   | String  | Required | Size: 50
bankName        | String  | Required | Size: 100
createdAt       | DateTime| Required
updatedAt       | DateTime| Required
```

### **Step 4: Test Your Setup**

After creating the collections:

1. **Restart your Expo app**
2. **Tap the new "Setup DB" button** on home screen to verify
3. **Try "Test KYC"** button to test the collections
4. **Check console output** for success/error messages

### **Quick Setup Tips:**

1. **Collection Names**: Use exact names listed above
2. **Attributes**: Start with minimum required attributes, add more later
3. **Permissions**: Use default permissions for now
4. **Indexes**: Appwrite will create basic indexes automatically

### **Alternative: Use Appwrite CLI**

If you prefer command line:

```bash
# Install Appwrite CLI
npm install -g appwrite-cli

# Login to your account
appwrite login

# Create collections via CLI
appwrite databases createCollection \
  --databaseId="your-database-id" \
  --collectionId="users" \
  --name="Users"
```

### **Verification**

Once setup is complete, you should see:
```
✅ KYC profile created - Current Tier: 1
📱 OTP sent: 123456
✅ Phone verified: true
```

Instead of:
```
❌ Collection with the requested ID could not be found
```

## 🚀 **Ready to Test!**

After database setup, your KotaPay app will be fully functional with:
- ✅ **User onboarding & KYC**
- ✅ **Wallet transactions** 
- ✅ **Payment requests & QR codes**
- ✅ **Authentication & tokens**

**Happy testing!** 🎉
