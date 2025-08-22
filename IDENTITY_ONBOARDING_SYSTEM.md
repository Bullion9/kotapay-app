# 🆔 KotaPay Identity & Onboarding System

> **Complete implementation of KYC levels, authentication, and secure token management**

## 📋 Overview

The KotaPay Identity & Onboarding system implements a **3-tier KYC verification** process with **JWT token authentication** and **device binding** for maximum security.

## 🎯 KYC Tier System

### **Tier 1 - Basic (₦5k monthly cap)**
| Requirement | Description | Status |
|-------------|-------------|---------|
| **Phone Verification** | OTP verification via SMS | Required |
| **Basic Information** | Full name + date of birth | Required |

**Unlocks**: ₦5,000 monthly limit, ₦2,000 daily limit

### **Tier 2 - Standard (₦50k monthly cap)**
| Requirement | Description | Status |
|-------------|-------------|---------|
| **Government ID** | National ID/Passport/Driver's License (front + back) | Required |
| **Selfie Verification** | Face matching with government ID | Required |

**Unlocks**: ₦50,000 monthly limit, ₦20,000 daily limit

### **Tier 3 - Premium (₦500k monthly cap)**
| Requirement | Description | Status |
|-------------|-------------|---------|
| **Address Proof** | Utility bill/Bank statement (max 3 months old) | Required |

**Unlocks**: ₦500,000 monthly limit, ₦100,000 daily limit

## 🔐 Authentication Architecture

### **JWT Token Structure**
```typescript
interface TokenPayload {
  userId: string;           // Unique user identifier
  email: string;           // User email
  phone: string;           // Verified phone number
  kycTier: 1 | 2 | 3;     // Current verification tier
  permissions: string[];   // User permissions array
  iat: number;            // Issued at timestamp
  exp: number;            // Expiration timestamp
}
```

### **Secure Token Storage**
- ✅ **Access Token**: Stored in `expo-secure-store` with encryption
- ✅ **Refresh Token**: Separate secure storage for token renewal
- ✅ **Device Binding**: Tokens tied to specific device fingerprints
- ✅ **Auto-Refresh**: Automatic token renewal 5 minutes before expiry

## 📱 Implementation Files

### **Core Services**
1. **`KYCService.ts`** - Complete KYC tier management
2. **`AuthTokenService.ts`** - JWT token handling & refresh logic
3. **`useAuth.ts`** - React hook for authentication state
4. **`KotaPayExamples.ts`** - Updated with identity scenarios

## 🚀 Usage Examples

### **1. User Registration & Tier 1**
```typescript
import { useAuth } from '../hooks/useAuth';

const { register, sendOTP, verifyOTP, updateBasicInfo } = useAuth();

// Step 1: Register user
await register({
  firstName: 'John',
  lastName: 'Doe',
  email: 'john@example.com',
  phone: '+2348012345678',
  password: 'secure_password',
  confirmPassword: 'secure_password'
});

// Step 2: Verify phone (Tier 1)
const otpCode = await sendOTP('+2348012345678', 'registration');
await verifyOTP({
  phoneNumber: '+2348012345678',
  otpCode: '123456',
  purpose: 'registration'
});

// Step 3: Complete basic info (Tier 1)
await updateBasicInfo({
  firstName: 'John',
  lastName: 'Doe',
  dateOfBirth: '1990-01-01'
});

// ✅ Tier 1 Complete: ₦5k monthly limit unlocked
```

### **2. Tier 2 Upgrade (ID + Selfie)**
```typescript
// Upload government ID
const idDocumentId = await uploadGovernmentID({
  frontImage: frontImageFile,
  backImage: backImageFile,
  documentType: 'national_id',
  documentNumber: 'NIN12345678901',
  expiryDate: '2030-12-31'
});

// Upload selfie for face matching
const selfieDocumentId = await uploadSelfie(selfieImageFile);

// ✅ Tier 2 Complete: ₦50k monthly limit unlocked
```

### **3. Tier 3 Upgrade (Address Proof)**
```typescript
// Upload address verification
const addressDocumentId = await uploadAddressProof({
  proofImage: utilityBillFile,
  documentType: 'utility_bill',
  address: {
    street: '123 Lagos Street',
    city: 'Lagos',
    state: 'Lagos State',
    country: 'Nigeria',
    postalCode: '100001'
  }
});

// ✅ Tier 3 Complete: ₦500k monthly limit unlocked
```

### **4. Transaction Limit Validation**
```typescript
// Check if user can perform transaction
const limitCheck = await checkTransactionLimits(75000);

if (limitCheck.canProceed) {
  // Process transaction
  console.log(`Monthly remaining: ₦${limitCheck.monthlyRemaining}`);
} else {
  // Show tier upgrade suggestion
  console.log(`Blocked: ${limitCheck.reason}`);
  console.log(`Current tier: ${limitCheck.currentTier}`);
}
```

## 🔒 Security Features

### **Device Binding**
- ✅ Tokens tied to unique device fingerprints
- ✅ Prevents token theft and replay attacks
- ✅ Login notifications for new devices

### **Token Security**
- ✅ **Short-lived access tokens** (1 hour expiry)
- ✅ **Secure refresh mechanism** with rotation
- ✅ **Automatic logout** on security threats
- ✅ **Permission-based authorization**

### **Fraud Prevention**
- ✅ **OTP rate limiting** (max attempts per phone)
- ✅ **Document verification** via AI/manual review
- ✅ **Face matching** for selfie verification
- ✅ **Address validation** against government databases

## 📊 Verification Process

### **Document Verification Pipeline**
```typescript
// AI-powered verification workflow
1. Upload → 2. AI Analysis → 3. Manual Review → 4. Approval/Rejection

// Success rates (configurable)
- Government ID: 90% auto-approval
- Selfie matching: 85% auto-approval  
- Address proof: 80% auto-approval
```

### **Verification Timeframes**
- **Phone OTP**: Instant
- **Basic Info**: Instant
- **Government ID**: 2-5 minutes (AI + manual backup)
- **Selfie**: 1-3 minutes (face matching algorithm)
- **Address Proof**: 3-10 minutes (address validation)

## 🎯 Integration with Wallet System

### **KYC-Aware Transactions**
```typescript
// Before every transaction
const limitCheck = await kycService.checkTransactionLimits(userId, amount);

if (!limitCheck.canProceed) {
  // Show tier upgrade flow
  await notificationService.sendKYCTierUpgradeNotification(
    limitCheck.currentTier + 1,
    nextTierLimit
  );
}
```

### **Smart Notifications**
- 🎉 **Tier completion**: "Tier 2 unlocked! Monthly limit: ₦50k"
- ⚠️ **Limit warnings**: "80% of monthly limit used"  
- 📈 **Upgrade prompts**: "Upgrade to Tier 3 for ₦500k limit"
- 🔒 **Security alerts**: "New login from iPhone 12"

## 🛡️ Compliance & Auditing

### **Regulatory Compliance**
- ✅ **KYC/AML requirements** for Nigerian financial services
- ✅ **Data protection** compliant with NDPR
- ✅ **Audit trails** for all verification activities
- ✅ **Document retention** policies

### **Risk Management**
- ✅ **Tier-based limits** prevent money laundering
- ✅ **Identity verification** reduces fraud
- ✅ **Transaction monitoring** flags suspicious activity
- ✅ **Device tracking** prevents account takeovers

## 📱 User Experience

### **Onboarding Flow**
```
1. Registration (email + password)
     ↓
2. Phone verification (OTP)
     ↓  
3. Basic info (name + DOB)
     ↓
4. ✅ Tier 1 Complete (₦5k limit)
     ↓
5. Upload ID + Selfie (optional)
     ↓
6. ✅ Tier 2 Complete (₦50k limit)
     ↓
7. Upload address proof (optional)
     ↓
8. ✅ Tier 3 Complete (₦500k limit)
```

### **Progressive Upgrade**
- 🎯 **Smart prompts** when users hit limits
- 📸 **In-app camera** for document capture
- ⚡ **Real-time verification** status updates
- 🎉 **Celebration animations** for tier completions

## 🔧 Configuration

### **Environment Variables**
```bash
# JWT Configuration
JWT_SECRET=your_jwt_secret_key
JWT_EXPIRES_IN=3600
REFRESH_TOKEN_EXPIRES_IN=2592000

# Verification Services
TWILIO_SID=your_twilio_sid
TWILIO_TOKEN=your_twilio_token
AI_VERIFICATION_API_KEY=your_ai_api_key

# Appwrite Configuration
APPWRITE_ENDPOINT=your_appwrite_endpoint
APPWRITE_PROJECT_ID=your_project_id
APPWRITE_DATABASE_ID=your_database_id
```

## 📈 Monitoring & Analytics

### **Key Metrics**
- 📊 **KYC completion rates** by tier
- ⏱️ **Verification processing times**
- 🎯 **Document approval/rejection rates**
- 💰 **Transaction limits utilization**
- 🔐 **Authentication success/failure rates**

### **Alerting**
- 🚨 **High rejection rates** for manual review
- ⚠️ **Unusual login patterns** for security teams
- 📈 **Tier upgrade trends** for business insights

This complete Identity & Onboarding system provides **bank-grade security** with **seamless user experience**, perfectly aligned with your KotaPay architecture! 🚀
