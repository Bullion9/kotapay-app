/**
 * 💰 KotaPay Payment Request Service
 * 
 * Handles payment links, QR codes, and payment request lifecycle
 * - Payment Link generation with expiry & amount
 * - QR Code encoding (user-id + amount + note)
 * - Request lifecycle (pending → paid/expired)
 * - Auto-reminders after 24h
 */

import AppwriteService from './AppwriteService';
import { notificationService } from './notifications';
import { walletService } from './WalletService';
import { kycService } from './KYCService';
import { ID, Query } from 'appwrite';
import * as Crypto from 'expo-crypto';

// 📋 Payment Request Types
export interface PaymentRequest {
  id: string;
  requesterId: string;          // Who is requesting payment
  requesterName: string;        // Display name
  requesterPhone?: string;      // For contact
  payerId?: string;            // Who should pay (optional for public links)
  payerName?: string;          // Payer display name
  amount: number;              // Amount in Naira
  description: string;         // Payment description/note
  type: 'link' | 'qr' | 'direct'; // Request type
  status: 'pending' | 'paid' | 'expired' | 'cancelled';
  createdAt: string;           // ISO timestamp
  expiresAt: string;           // ISO timestamp
  paidAt?: string;             // Payment completion timestamp
  transactionId?: string;      // Reference to completed transaction
  metadata?: Record<string, any>; // Additional data
  
  // Payment Link specific
  linkToken?: string;          // Unique URL token
  linkUrl?: string;            // Full shareable URL
  
  // QR Code specific
  qrData?: string;             // Encoded QR string
  qrImageUrl?: string;         // Generated QR image URL
  
  // Reminder tracking
  reminderSentAt?: string;     // When reminder was sent
  reminderCount: number;       // Number of reminders sent
}

export interface CreatePaymentRequestParams {
  requesterId: string;
  payerId?: string;            // Optional for public payment links
  amount: number;
  description: string;
  type: 'link' | 'qr' | 'direct';
  expiryHours?: number;        // Default 72 hours
  metadata?: Record<string, any>;
}

export interface QRCodeData {
  userId: string;              // Requester user ID
  amount: number;              // Amount to pay
  note: string;                // Payment note
  requestId: string;           // Payment request ID
  timestamp: number;           // Creation timestamp
  version: string;             // QR code version for compatibility
}

export interface PaymentLinkData {
  token: string;               // Unique link token
  amount: number;              // Amount to pay
  description: string;         // Payment description
  requesterName: string;       // Who is requesting
  expiresAt: string;           // Expiry timestamp
}

class PaymentRequestService {
  private appwrite: typeof AppwriteService;
  private notifications: typeof notificationService;
  private wallet: typeof walletService;
  private kyc: typeof kycService;
  
  private readonly COLLECTION_ID = 'payment_requests';
  private readonly DEFAULT_EXPIRY_HOURS = 72;
  private readonly REMINDER_DELAY_HOURS = 24;
  private readonly MAX_REMINDERS = 3;
  private readonly BASE_URL = 'https://kotapay.app/pay'; // Your app's payment URL

  constructor() {
    this.appwrite = AppwriteService;
    this.notifications = notificationService;
    this.wallet = walletService;
    this.kyc = kycService;
  }

  // 🔗 Payment Link Generation
  async createPaymentLink(params: CreatePaymentRequestParams): Promise<PaymentRequest> {
    try {
      // Generate unique link token
      const linkToken = await this.generateSecureToken();
      const expiryHours = params.expiryHours || this.DEFAULT_EXPIRY_HOURS;
      const expiresAt = new Date(Date.now() + expiryHours * 60 * 60 * 1000).toISOString();
      
      // Get requester details
      const requester = await this.appwrite.getUserById(params.requesterId);
      if (!requester) {
        throw new Error('Requester not found');
      }

      // Validate KYC limits for the request amount
      const limitCheck = await this.kyc.checkTransactionLimits(params.requesterId, params.amount);
      if (!limitCheck.canProceed) {
        throw new Error(`Amount exceeds your Tier ${limitCheck.currentTier} limit. ${limitCheck.reason}`);
      }

      // Create payment request
      const paymentRequest: Omit<PaymentRequest, 'id'> = {
        requesterId: params.requesterId,
        requesterName: `${requester.firstName} ${requester.lastName}`,
        requesterPhone: requester.phone,
        payerId: params.payerId,
        payerName: params.payerId ? await this.getPayerName(params.payerId) : undefined,
        amount: params.amount,
        description: params.description,
        type: 'link',
        status: 'pending',
        createdAt: new Date().toISOString(),
        expiresAt,
        reminderCount: 0,
        linkToken,
        linkUrl: `${this.BASE_URL}/${linkToken}`,
        metadata: params.metadata
      };

      // Save to database
      const document = await this.appwrite.createDocument(
        this.COLLECTION_ID,
        ID.unique(),
        paymentRequest
      );

      const savedRequest = { id: document.$id, ...paymentRequest };

      // Schedule reminder if direct request
      if (params.payerId) {
        await this.scheduleReminder(savedRequest.id);
      }

      // Send notification to requester
      await this.notifications.sendPaymentLinkCreatedNotification(
        params.requesterId,
        savedRequest.linkUrl!,
        params.amount,
        params.description
      );

      // Send notification to payer if specified
      if (params.payerId) {
        await this.notifications.sendPaymentRequestNotification(
          params.payerId,
          requester.firstName,
          params.amount,
          params.description,
          savedRequest.linkUrl!
        );
      }

      return savedRequest;

    } catch (error) {
      console.error('Error creating payment link:', error);
      throw error;
    }
  }

  // 📱 QR Code Generation
  async createQRPaymentRequest(params: CreatePaymentRequestParams): Promise<PaymentRequest> {
    try {
      const expiryHours = params.expiryHours || this.DEFAULT_EXPIRY_HOURS;
      const expiresAt = new Date(Date.now() + expiryHours * 60 * 60 * 1000).toISOString();
      
      // Get requester details
      const requester = await this.appwrite.getUserById(params.requesterId);
      if (!requester) {
        throw new Error('Requester not found');
      }

      // Validate KYC limits
      const limitCheck = await this.kyc.checkTransactionLimits(params.requesterId, params.amount);
      if (!limitCheck.canProceed) {
        throw new Error(`Amount exceeds your Tier ${limitCheck.currentTier} limit. ${limitCheck.reason}`);
      }

      // Create payment request first
      const paymentRequest: Omit<PaymentRequest, 'id'> = {
        requesterId: params.requesterId,
        requesterName: `${requester.firstName} ${requester.lastName}`,
        requesterPhone: requester.phone,
        payerId: params.payerId,
        payerName: params.payerId ? await this.getPayerName(params.payerId) : undefined,
        amount: params.amount,
        description: params.description,
        type: 'qr',
        status: 'pending',
        createdAt: new Date().toISOString(),
        expiresAt,
        reminderCount: 0,
        metadata: params.metadata
      };

      // Save to get ID
      const document = await this.appwrite.createDocument(
        this.COLLECTION_ID,
        ID.unique(),
        paymentRequest
      );

      // Generate QR code data
      const qrData: QRCodeData = {
        userId: params.requesterId,
        amount: params.amount,
        note: params.description,
        requestId: document.$id,
        timestamp: Date.now(),
        version: '1.0'
      };

      const qrString = JSON.stringify(qrData);
      
      // Update with QR data
      await this.appwrite.updateDocument(
        this.COLLECTION_ID,
        document.$id,
        { qrData: qrString }
      );

      const savedRequest: PaymentRequest = {
        id: document.$id,
        ...paymentRequest,
        qrData: qrString
      };

      // Schedule reminder if direct request
      if (params.payerId) {
        await this.scheduleReminder(savedRequest.id);
      }

      // Send notification
      await this.notifications.sendQRPaymentRequestNotification(
        params.requesterId,
        params.amount,
        params.description
      );

      return savedRequest;

    } catch (error) {
      console.error('Error creating QR payment request:', error);
      throw error;
    }
  }

  // 💸 Direct Payment Request
  async createDirectPaymentRequest(params: CreatePaymentRequestParams): Promise<PaymentRequest> {
    if (!params.payerId) {
      throw new Error('Payer ID is required for direct payment requests');
    }

    try {
      const expiryHours = params.expiryHours || this.DEFAULT_EXPIRY_HOURS;
      const expiresAt = new Date(Date.now() + expiryHours * 60 * 60 * 1000).toISOString();
      
      // Get requester details
      const requester = await this.appwrite.getUserById(params.requesterId);
      if (!requester) {
        throw new Error('Requester not found');
      }

      // Get payer details
      const payer = await this.appwrite.getUserById(params.payerId);
      if (!payer) {
        throw new Error('Payer not found');
      }

      // Validate KYC limits
      const limitCheck = await this.kyc.checkTransactionLimits(params.requesterId, params.amount);
      if (!limitCheck.canProceed) {
        throw new Error(`Amount exceeds your Tier ${limitCheck.currentTier} limit. ${limitCheck.reason}`);
      }

      // Create payment request
      const paymentRequest: Omit<PaymentRequest, 'id'> = {
        requesterId: params.requesterId,
        requesterName: `${requester.firstName} ${requester.lastName}`,
        requesterPhone: requester.phone,
        payerId: params.payerId,
        payerName: `${payer.firstName} ${payer.lastName}`,
        amount: params.amount,
        description: params.description,
        type: 'direct',
        status: 'pending',
        createdAt: new Date().toISOString(),
        expiresAt,
        reminderCount: 0,
        metadata: params.metadata
      };

      // Save to database
      const document = await this.appwrite.createDocument(
        this.COLLECTION_ID,
        ID.unique(),
        paymentRequest
      );

      const savedRequest = { id: document.$id, ...paymentRequest };

      // Schedule reminder
      await this.scheduleReminder(savedRequest.id);

      // Send notifications
      await this.notifications.sendDirectPaymentRequestNotification(
        params.payerId,
        requester.firstName,
        params.amount,
        params.description
      );

      await this.notifications.sendPaymentRequestSentNotification(
        params.requesterId,
        payer.firstName,
        params.amount,
        params.description
      );

      return savedRequest;

    } catch (error) {
      console.error('Error creating direct payment request:', error);
      throw error;
    }
  }

  // 💳 Process Payment via Link
  async processPaymentLink(linkToken: string, payerId: string): Promise<PaymentRequest> {
    try {
      // Find payment request by link token
      const requests = await this.appwrite.listDocuments(
        this.COLLECTION_ID,
        [Query.equal('linkToken', linkToken), Query.equal('status', 'pending')]
      );

      if (requests.documents.length === 0) {
        throw new Error('Payment link not found or already processed');
      }

      const request = requests.documents[0] as any;
      const paymentRequest: PaymentRequest = { id: request.$id, ...request };

      // Check if expired
      if (new Date(paymentRequest.expiresAt) < new Date()) {
        await this.expirePaymentRequest(paymentRequest.id);
        throw new Error('Payment link has expired');
      }

      // Get payer details
      const payer = await this.appwrite.getUserById(payerId);
      if (!payer) {
        throw new Error('Payer not found');
      }

      // Process the payment
      const transaction = await this.wallet.sendMoney({
        recipientId: paymentRequest.requesterId,
        amount: paymentRequest.amount,
        description: `Payment: ${paymentRequest.description}`,
        fundingSource: 'wallet',
        pin: '0000' // Would be provided by user in real app
      });

      // Update payment request status
      await this.appwrite.updateDocument(
        this.COLLECTION_ID,
        paymentRequest.id,
        {
          status: 'paid',
          paidAt: new Date().toISOString(),
          payerId: payerId,
          payerName: `${payer.firstName} ${payer.lastName}`,
          transactionId: transaction.transactionId
        }
      );

      const finalRequest: PaymentRequest = {
        ...paymentRequest,
        status: 'paid',
        paidAt: new Date().toISOString(),
        payerId: payerId,
        payerName: `${payer.firstName} ${payer.lastName}`,
        transactionId: transaction.transactionId
      };

      // Send success notifications
      await this.notifications.sendPaymentReceivedNotification(
        paymentRequest.requesterId,
        payer.firstName,
        paymentRequest.amount,
        paymentRequest.description
      );

      await this.notifications.sendPaymentSentNotification(
        payerId,
        paymentRequest.requesterName,
        paymentRequest.amount,
        paymentRequest.description
      );

      return finalRequest;

    } catch (error) {
      console.error('Error processing payment link:', error);
      throw error;
    }
  }

  // 📱 Process QR Code Payment
  async processQRPayment(qrData: string, payerId: string): Promise<PaymentRequest> {
    try {
      // Parse QR code data
      const parsedData: QRCodeData = JSON.parse(qrData);
      
      // Validate QR code structure
      if (!parsedData.requestId || !parsedData.userId || !parsedData.amount) {
        throw new Error('Invalid QR code format');
      }

      // Find payment request
      const request = await this.appwrite.getDocument(this.COLLECTION_ID, parsedData.requestId);
      const paymentRequest: PaymentRequest = { 
        id: request.$id, 
        requesterId: request.requesterId,
        requesterName: request.requesterName,
        requesterPhone: request.requesterPhone,
        payerId: request.payerId,
        payerName: request.payerName,
        amount: request.amount,
        description: request.description,
        type: request.type,
        status: request.status,
        createdAt: request.createdAt,
        expiresAt: request.expiresAt,
        paidAt: request.paidAt,
        transactionId: request.transactionId,
        metadata: request.metadata,
        linkToken: request.linkToken,
        linkUrl: request.linkUrl,
        qrData: request.qrData,
        qrImageUrl: request.qrImageUrl,
        reminderSentAt: request.reminderSentAt,
        reminderCount: request.reminderCount || 0
      };

      // Validate request
      if (paymentRequest.status !== 'pending') {
        throw new Error('Payment request already processed or expired');
      }

      if (new Date(paymentRequest.expiresAt) < new Date()) {
        await this.expirePaymentRequest(paymentRequest.id);
        throw new Error('QR code has expired');
      }

      // Verify QR data matches request
      if (paymentRequest.amount !== parsedData.amount || 
          paymentRequest.requesterId !== parsedData.userId) {
        throw new Error('QR code data mismatch');
      }

      // Get payer details
      const payer = await this.appwrite.getUserById(payerId);
      if (!payer) {
        throw new Error('Payer not found');
      }

      // Process the payment
      const transaction = await this.wallet.sendMoney({
        recipientId: paymentRequest.requesterId,
        amount: paymentRequest.amount,
        description: `QR Payment: ${paymentRequest.description}`,
        fundingSource: 'wallet',
        pin: '0000' // Would be provided by user in real app
      });

      // Update payment request
      await this.appwrite.updateDocument(
        this.COLLECTION_ID,
        paymentRequest.id,
        {
          status: 'paid',
          paidAt: new Date().toISOString(),
          payerId: payerId,
          payerName: `${payer.firstName} ${payer.lastName}`,
          transactionId: transaction.transactionId
        }
      );

      const finalRequest: PaymentRequest = {
        ...paymentRequest,
        status: 'paid',
        paidAt: new Date().toISOString(),
        payerId: payerId,
        payerName: `${payer.firstName} ${payer.lastName}`,
        transactionId: transaction.transactionId
      };

      // Send notifications
      await this.notifications.sendPaymentReceivedNotification(
        paymentRequest.requesterId,
        payer.firstName,
        paymentRequest.amount,
        paymentRequest.description
      );

      await this.notifications.sendPaymentSentNotification(
        payerId,
        paymentRequest.requesterName,
        paymentRequest.amount,
        paymentRequest.description
      );

      return finalRequest;

    } catch (error) {
      console.error('Error processing QR payment:', error);
      throw error;
    }
  }

  // 📋 Get Payment Requests
  async getPaymentRequests(userId: string, type?: 'sent' | 'received'): Promise<PaymentRequest[]> {
    try {
      let queries = [];
      
      if (type === 'sent') {
        queries.push(Query.equal('requesterId', userId));
      } else if (type === 'received') {
        queries.push(Query.equal('payerId', userId));
      } else {
        // Get both sent and received
        const sentRequests = await this.appwrite.listDocuments(
          this.COLLECTION_ID,
          [Query.equal('requesterId', userId), Query.orderDesc('createdAt')]
        );
        
        const receivedRequests = await this.appwrite.listDocuments(
          this.COLLECTION_ID,
          [Query.equal('payerId', userId), Query.orderDesc('createdAt')]
        );

        const allRequests = [
          ...sentRequests.documents.map(doc => this.convertDocumentToPaymentRequest(doc)),
          ...receivedRequests.documents.map(doc => this.convertDocumentToPaymentRequest(doc))
        ];

        // Sort by creation date
        return allRequests.sort((a, b) => 
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
      }

      queries.push(Query.orderDesc('createdAt'));
      
      const result = await this.appwrite.listDocuments(this.COLLECTION_ID, queries);
      return result.documents.map(doc => this.convertDocumentToPaymentRequest(doc));

    } catch (error) {
      console.error('Error fetching payment requests:', error);
      throw error;
    }
  }

  // ❌ Cancel Payment Request
  async cancelPaymentRequest(requestId: string, userId: string): Promise<PaymentRequest> {
    try {
      const request = await this.appwrite.getDocument(this.COLLECTION_ID, requestId);
      const paymentRequest = this.convertDocumentToPaymentRequest(request);

      // Verify ownership
      if (paymentRequest.requesterId !== userId) {
        throw new Error('You can only cancel your own payment requests');
      }

      // Check if can be cancelled
      if (paymentRequest.status !== 'pending') {
        throw new Error('Can only cancel pending payment requests');
      }

      // Update status
      await this.appwrite.updateDocument(
        this.COLLECTION_ID,
        requestId,
        { status: 'cancelled' }
      );

      const finalRequest: PaymentRequest = {
        ...paymentRequest,
        status: 'cancelled'
      };

      // Send notification to payer if it was a direct request
      if (paymentRequest.payerId) {
        await this.notifications.sendPaymentRequestCancelledNotification(
          paymentRequest.payerId,
          paymentRequest.requesterName,
          paymentRequest.amount,
          paymentRequest.description
        );
      }

      return finalRequest;

    } catch (error) {
      console.error('Error cancelling payment request:', error);
      throw error;
    }
  }

  // ⏰ Auto-Reminder System
  async scheduleReminder(requestId: string): Promise<void> {
    // Note: In a real app, you'd use a proper job scheduler like AWS Lambda, Vercel Cron, or background tasks
    // For demo purposes, we'll simulate with setTimeout
    setTimeout(async () => {
      await this.sendReminder(requestId);
    }, this.REMINDER_DELAY_HOURS * 60 * 60 * 1000);
  }

  private async sendReminder(requestId: string): Promise<void> {
    try {
      const request = await this.appwrite.getDocument(this.COLLECTION_ID, requestId);
      const paymentRequest = this.convertDocumentToPaymentRequest(request);

      // Check if still pending and not expired
      if (paymentRequest.status !== 'pending' || 
          new Date(paymentRequest.expiresAt) < new Date()) {
        return;
      }

      // Check reminder limits
      if (paymentRequest.reminderCount >= this.MAX_REMINDERS) {
        return;
      }

      // Send reminder notification
      if (paymentRequest.payerId) {
        await this.notifications.sendPaymentReminderNotification(
          paymentRequest.payerId,
          paymentRequest.requesterName,
          paymentRequest.amount,
          paymentRequest.description,
          paymentRequest.reminderCount + 1
        );

        // Update reminder count
        await this.appwrite.updateDocument(
          this.COLLECTION_ID,
          requestId,
          {
            reminderSentAt: new Date().toISOString(),
            reminderCount: paymentRequest.reminderCount + 1
          }
        );

        // Schedule next reminder if under limit
        if (paymentRequest.reminderCount + 1 < this.MAX_REMINDERS) {
          setTimeout(async () => {
            await this.sendReminder(requestId);
          }, this.REMINDER_DELAY_HOURS * 60 * 60 * 1000);
        }
      }

    } catch (error) {
      console.error('Error sending reminder:', error);
    }
  }

  // 🕐 Expire Old Requests
  async expirePaymentRequest(requestId: string): Promise<void> {
    try {
      await this.appwrite.updateDocument(
        this.COLLECTION_ID,
        requestId,
        { status: 'expired' }
      );
    } catch (error) {
      console.error('Error expiring payment request:', error);
    }
  }

  // 🔍 Get Payment Request by Token
  async getPaymentRequestByToken(linkToken: string): Promise<PaymentRequest | null> {
    try {
      const requests = await this.appwrite.listDocuments(
        this.COLLECTION_ID,
        [Query.equal('linkToken', linkToken)]
      );

      if (requests.documents.length === 0) {
        return null;
      }

      const request = requests.documents[0];
      return this.convertDocumentToPaymentRequest(request);

    } catch (error) {
      console.error('Error fetching payment request by token:', error);
      return null;
    }
  }

  // 🔧 Helper Methods
  private convertDocumentToPaymentRequest(doc: any): PaymentRequest {
    return {
      id: doc.$id,
      requesterId: doc.requesterId,
      requesterName: doc.requesterName,
      requesterPhone: doc.requesterPhone,
      payerId: doc.payerId,
      payerName: doc.payerName,
      amount: doc.amount,
      description: doc.description,
      type: doc.type,
      status: doc.status,
      createdAt: doc.createdAt,
      expiresAt: doc.expiresAt,
      paidAt: doc.paidAt,
      transactionId: doc.transactionId,
      metadata: doc.metadata,
      linkToken: doc.linkToken,
      linkUrl: doc.linkUrl,
      qrData: doc.qrData,
      qrImageUrl: doc.qrImageUrl,
      reminderSentAt: doc.reminderSentAt,
      reminderCount: doc.reminderCount || 0
    };
  }

  private async generateSecureToken(): Promise<string> {
    const randomBytes = await Crypto.getRandomBytesAsync(32);
    return Array.from(randomBytes)
      .map(byte => byte.toString(16).padStart(2, '0'))
      .join('')
      .substring(0, 32); // 32 character token
  }

  private async getPayerName(payerId: string): Promise<string | undefined> {
    try {
      const payer = await this.appwrite.getUserById(payerId);
      return payer ? `${payer.firstName} ${payer.lastName}` : undefined;
    } catch {
      return undefined;
    }
  }

  // 🧹 Cleanup Expired Requests (run periodically)
  async cleanupExpiredRequests(): Promise<number> {
    try {
      const now = new Date().toISOString();
      const expiredRequests = await this.appwrite.listDocuments(
        this.COLLECTION_ID,
        [
          Query.equal('status', 'pending'),
          Query.lessThan('expiresAt', now)
        ]
      );

      let expiredCount = 0;
      for (const request of expiredRequests.documents) {
        await this.expirePaymentRequest(request.$id);
        expiredCount++;
      }

      return expiredCount;

    } catch (error) {
      console.error('Error cleaning up expired requests:', error);
      return 0;
    }
  }
}

export default PaymentRequestService;
