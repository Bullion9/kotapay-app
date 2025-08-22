# 💰 KotaPay Payment Request System

> **Complete implementation of payment links, QR codes, and payment request lifecycle management**

## 📋 Overview

The KotaPay Payment Request System implements your specified requirements:
- **Payment Links** → unique URLs with expiry & amount
- **QR Codes** → encode user-id + amount + note  
- **Requests** → create "pending" records with auto-reminders after 24h

## 🎯 Core Features

### **Payment Links**
✅ **Unique URL Generation** - Cryptographically secure 32-character tokens  
✅ **Expiry Management** - Configurable expiry times (default 72 hours)  
✅ **Amount Encoding** - Fixed amounts embedded in the link  
✅ **Shareable URLs** - `https://kotapay.app/pay/{token}` format  

### **QR Codes**
✅ **User ID Encoding** - Requester's user identifier  
✅ **Amount & Note** - Payment amount and description  
✅ **Request Metadata** - Request ID, timestamp, version  
✅ **Instant Processing** - Scan-to-pay functionality  

### **Request Management**
✅ **Pending Records** - Database-tracked payment requests  
✅ **24h Auto-Reminders** - Automatic notification system  
✅ **Status Tracking** - pending → paid → expired → cancelled  
✅ **Expiry Handling** - Automatic cleanup of expired requests  

## 🚀 Implementation Files

| File | Purpose | Lines | Status |
|------|---------|-------|--------|
| `PaymentRequestService.ts` | Core payment request logic | 750+ | ✅ Complete |
| `notifications.ts` | Payment-specific notifications | 150+ | ✅ Enhanced |
| `KotaPayExamples.ts` | Usage examples & demos | 100+ | ✅ Updated |

## 📱 Usage Examples

### **1. Create Payment Link**
```typescript
import PaymentRequestService from './PaymentRequestService';
const paymentService = new PaymentRequestService();

const paymentLink = await paymentService.createPaymentLink({
  requesterId: 'user_123',
  amount: 5000,
  description: 'Split dinner bill',
  type: 'link',
  expiryHours: 48 // 2 days
});

console.log('Payment URL:', paymentLink.linkUrl);
// Output: https://kotapay.app/pay/a1b2c3d4e5f6...
```

### **2. Generate QR Code**
```typescript
const qrRequest = await paymentService.createQRPaymentRequest({
  requesterId: 'user_456',
  amount: 2500,
  description: 'Coffee money',
  type: 'qr',
  expiryHours: 24
});

// QR data contains:
const qrData = JSON.parse(qrRequest.qrData);
console.log('QR Code Data:', {
  userId: qrData.userId,
  amount: qrData.amount,
  note: qrData.note,
  requestId: qrData.requestId
});
```

### **3. Direct Payment Request**
```typescript
const directRequest = await paymentService.createDirectPaymentRequest({
  requesterId: 'user_789',
  payerId: 'user_101',
  amount: 7500,
  description: 'Uber ride fare',
  type: 'direct',
  expiryHours: 72
});

// Automatically sends notification to payer
// Sets up 24h reminder system
```

### **4. Process Payments**
```typescript
// Pay via link
const payment = await paymentService.processPaymentLink(
  'a1b2c3d4e5f6...', // link token
  'payer_user_id'
);

// Pay via QR scan
const qrPayment = await paymentService.processQRPayment(
  qrDataString, // scanned QR data
  'payer_user_id'
);
```

## 🔗 Payment Link Architecture

### **URL Structure**
```
https://kotapay.app/pay/{32-character-token}

Example:
https://kotapay.app/pay/a1b2c3d4e5f67890123456789abcdef0
```

### **Link Data**
```typescript
interface PaymentLinkData {
  token: string;               // Unique link token
  amount: number;              // Amount to pay
  description: string;         // Payment description
  requesterName: string;       // Who is requesting
  expiresAt: string;           // Expiry timestamp
}
```

### **Security Features**
- ✅ **Crypto-secure tokens** using `expo-crypto`
- ✅ **Expiry validation** prevents stale link usage
- ✅ **Single-use enforcement** (status tracking)
- ✅ **KYC limit validation** before link creation

## 📱 QR Code Format

### **QR Data Structure**
```typescript
interface QRCodeData {
  userId: string;              // Requester user ID
  amount: number;              // Amount to pay
  note: string;                // Payment note
  requestId: string;           // Payment request ID
  timestamp: number;           // Creation timestamp
  version: string;             // QR code version (1.0)
}
```

### **Example QR Data**
```json
{
  "userId": "user_456",
  "amount": 2500,
  "note": "Coffee and snacks",
  "requestId": "req_123abc",
  "timestamp": 1692700800000,
  "version": "1.0"
}
```

### **QR Processing**
1. **Scan QR Code** → Extract JSON data
2. **Validate Structure** → Check required fields
3. **Find Request** → Look up by requestId
4. **Verify Data** → Match amount & user ID
5. **Process Payment** → Execute wallet transfer
6. **Update Status** → Mark as paid

## ⏰ Request Lifecycle

### **Status Flow**
```
pending → paid
       → expired
       → cancelled
```

### **Lifecycle Events**
| Event | Trigger | Action |
|-------|---------|--------|
| **Created** | User creates request | Status: pending, Start reminder timer |
| **24h Reminder** | Auto-scheduler | Send notification to payer |
| **48h Reminder** | Auto-scheduler | Second reminder notification |
| **72h Reminder** | Auto-scheduler | Final reminder (max 3 total) |
| **Payment** | Payer completes | Status: paid, Send success notifications |
| **Expiry** | Time exceeded | Status: expired, Stop reminders |
| **Cancel** | Requester cancels | Status: cancelled, Notify payer |

### **Auto-Reminder System**
```typescript
// Reminder schedule (configurable)
const REMINDER_DELAY_HOURS = 24;  // 24h after creation
const MAX_REMINDERS = 3;          // Maximum 3 reminders
const REMINDER_INTERVAL = 24;     // Every 24h

// Example reminder flow:
// Day 0: Request created
// Day 1: First reminder sent
// Day 2: Second reminder sent  
// Day 3: Final reminder sent
// Day 4: Request expires (if not paid)
```

## 💳 Payment Processing

### **Payment via Link**
1. **Link Validation** → Check token exists & not expired
2. **KYC Validation** → Verify payer's transaction limits  
3. **Balance Check** → Ensure sufficient wallet funds
4. **Transfer Execution** → Process wallet-to-wallet transfer
5. **Status Update** → Mark request as paid
6. **Notifications** → Send success messages to both parties

### **Payment via QR**
1. **QR Scanning** → Extract and parse JSON data
2. **Request Lookup** → Find payment request by ID
3. **Data Verification** → Match amounts and user IDs
4. **Payment Processing** → Same as link payment flow
5. **Completion** → Update status and notify

### **Transaction Integration**
```typescript
// Integrates with existing WalletService
const transaction = await this.wallet.sendMoney({
  recipientId: paymentRequest.requesterId,
  amount: paymentRequest.amount,
  description: `Payment: ${paymentRequest.description}`,
  fundingSource: 'wallet',
  pin: userPin // Provided by payer
});

// Links payment request to wallet transaction
paymentRequest.transactionId = transaction.transactionId;
```

## 📊 Database Schema

### **Payment Requests Collection**
```typescript
interface PaymentRequest {
  id: string;
  requesterId: string;          // Who is requesting
  requesterName: string;        // Display name
  payerId?: string;            // Who should pay (optional)
  payerName?: string;          // Payer display name
  amount: number;              // Amount in Naira
  description: string;         // Payment description
  type: 'link' | 'qr' | 'direct';
  status: 'pending' | 'paid' | 'expired' | 'cancelled';
  createdAt: string;           // ISO timestamp
  expiresAt: string;           // ISO timestamp
  paidAt?: string;             // Payment completion
  transactionId?: string;      // Wallet transaction ref
  
  // Link-specific fields
  linkToken?: string;          // Unique URL token
  linkUrl?: string;            // Full shareable URL
  
  // QR-specific fields  
  qrData?: string;             // Encoded QR string
  qrImageUrl?: string;         // Generated QR image
  
  // Reminder tracking
  reminderSentAt?: string;     // Last reminder time
  reminderCount: number;       // Number of reminders sent
}
```

## 🔔 Notification System

### **Payment Notifications**
- 🔗 **Link Created**: "Payment link ready to share"
- 💰 **Request Received**: "Payment request from John Doe"
- ✅ **Payment Completed**: "Payment received from Jane"
- 💸 **Payment Sent**: "Payment sent to John"
- ❌ **Request Cancelled**: "Payment request cancelled"
- 🔔 **Reminders**: "Payment still pending (Reminder 2)"

### **Smart Reminders**
```typescript
// Reminder content varies by count
Reminder 1: "Gentle reminder: Payment request pending"
Reminder 2: "Second reminder: Please complete payment"  
Reminder 3: "Final reminder: Payment request expires soon"
```

## 🛡️ Security & Validation

### **Security Features**
- ✅ **Secure Token Generation** - 256-bit entropy
- ✅ **Expiry Enforcement** - Time-based validity
- ✅ **KYC Integration** - Tier-based limits
- ✅ **Request Ownership** - Only requester can cancel
- ✅ **Data Validation** - QR code integrity checks

### **Input Validation**
- ✅ **Amount Limits** - Must be > 0 and within KYC tiers
- ✅ **Description Length** - Max 200 characters
- ✅ **Expiry Bounds** - Min 1 hour, max 7 days
- ✅ **User Existence** - Validate requester & payer IDs

### **Error Handling**
```typescript
// Common error scenarios
- "Payment link not found or expired"
- "Amount exceeds your Tier X limit"
- "Insufficient wallet balance"
- "QR code data mismatch"
- "You can only cancel your own requests"
```

## 📈 Analytics & Monitoring

### **Key Metrics**
- 📊 **Request Creation Rate** - Links/QR/Direct per day
- ⏱️ **Payment Completion Time** - Average time to pay
- 🎯 **Completion Rate** - % of requests that get paid
- 💰 **Average Request Amount** - Mean payment size
- 🔔 **Reminder Effectiveness** - Payment rate after reminders

### **Admin Dashboard Views**
```typescript
// Request statistics
{
  totalRequests: 1234,
  pendingRequests: 45,
  completedToday: 89,
  averageAmount: 8750,
  completionRate: 78.5,
  
  // By type
  linkRequests: 567,
  qrRequests: 456, 
  directRequests: 211
}
```

## 🔧 Configuration

### **Service Configuration**
```typescript
private readonly COLLECTION_ID = 'payment_requests';
private readonly DEFAULT_EXPIRY_HOURS = 72;
private readonly REMINDER_DELAY_HOURS = 24;
private readonly MAX_REMINDERS = 3;
private readonly BASE_URL = 'https://kotapay.app/pay';
```

### **Customizable Settings**
- ⚙️ **Default Expiry** - How long links/QR codes last
- ⚙️ **Reminder Schedule** - When to send reminders  
- ⚙️ **Max Reminders** - Limit spam prevention
- ⚙️ **Base URL** - Your app's payment domain

## 🚀 Integration Guide

### **1. Install Dependencies**
```bash
npm install expo-crypto
```

### **2. Import Service**
```typescript
import PaymentRequestService from './services/PaymentRequestService';
const paymentService = new PaymentRequestService();
```

### **3. Create Payment UI**
```typescript
// Payment link button
const createLink = async () => {
  const link = await paymentService.createPaymentLink({
    requesterId: currentUser.id,
    amount: parseFloat(amountInput),
    description: descriptionInput,
    type: 'link'
  });
  
  // Share link
  Share.share({
    message: `Pay me ₦${amount}: ${link.linkUrl}`,
    url: link.linkUrl
  });
};

// QR code generation
const generateQR = async () => {
  const qrRequest = await paymentService.createQRPaymentRequest({
    requesterId: currentUser.id,
    amount: parseFloat(amountInput),
    description: descriptionInput,
    type: 'qr'
  });
  
  // Display QR code with qrRequest.qrData
  setQrData(qrRequest.qrData);
};
```

### **4. Handle Deep Links**
```typescript
// Handle payment link clicks
const handlePaymentLink = async (url: string) => {
  const token = url.split('/').pop();
  
  // Show payment confirmation
  const request = await paymentService.getPaymentRequestByToken(token);
  if (request) {
    showPaymentConfirmation(request);
  }
};
```

## 🎯 Real-World Usage

### **Social Payments**
- 🍕 **Split Bills** - Generate link, share in group chat
- ☕ **Coffee Runs** - QR code on table for quick payments
- 🚗 **Ride Sharing** - Send direct request to passengers
- 🎁 **Gift Collections** - Public payment link for contributions

### **Business Use Cases**
- 🛒 **E-commerce** - Generate payment links for orders
- 📱 **POS Systems** - QR codes for in-store payments
- 📄 **Invoicing** - Email payment links to customers
- 🎫 **Event Tickets** - QR-based payment collection

### **Benefits Over Traditional Methods**
- ⚡ **Instant** - No bank delays for wallet-to-wallet
- 💰 **Low Cost** - Zero fees for internal transfers
- 📱 **Mobile-First** - Designed for smartphone usage
- 🔗 **Shareable** - Works with any messaging app
- 🎯 **Trackable** - Full lifecycle visibility

This complete Payment Request system provides the exact functionality you specified: payment links with expiry, QR codes with user data, and pending requests with auto-reminders. It's fully integrated with your existing KotaPay wallet and KYC systems! 🚀
