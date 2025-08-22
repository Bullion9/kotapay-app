import * as Notifications from 'expo-notifications';
import * as Linking from 'expo-linking';
import { Platform } from 'react-native';

// Configure notification behavior
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

export interface NotificationData extends Record<string, unknown> {
  type: 'money_received' | 'money_sent' | 'request_received' | 'request_accepted' | 'email_notification' | 
        'kyc_tier_upgraded' | 'transaction_failed' | 'settlement_completed' | 'fraud_alert' | 
        'daily_limit_reached' | 'bank_transfer_pending' | 'chargeback_processed' | 'wallet_topup';
  transactionId: string;
  amount?: number;
  currency?: string;
  senderName?: string;
  recipientName?: string;
  message?: string;
  emailSubject?: string;
  settlementType?: 'internal' | 'external' | 'bank';
  kycTier?: 1 | 2 | 3;
  riskScore?: number;
  estimatedSettlement?: string;
}

export interface TransactionNotificationPayload {
  transactionId: string;
  amount: number;
  currency: string;
  senderName: string;
  recipientName: string;
  message?: string;
}

class NotificationService {
  private expoPushToken: string | null = null;

  async initialize(): Promise<void> {
    try {
      // Request permissions
      const { status: existingStatus } = await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;

      if (existingStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }

      if (finalStatus !== 'granted') {
        console.warn('Push notification permissions not granted');
        return;
      }

      // Get push token (handle projectId error gracefully for Expo Go)
      try {
        const token = await Notifications.getExpoPushTokenAsync();
        this.expoPushToken = token.data;
        console.log('Expo push token obtained successfully');
      } catch (tokenError) {
        console.warn('Could not get Expo push token (expected in Expo Go):', tokenError);
        // Continue without push token - local notifications will still work
      }

      // Set notification channel for Android
      if (Platform.OS === 'android') {
        await Notifications.setNotificationChannelAsync('default', {
          name: 'KotaPay Transactions',
          importance: Notifications.AndroidImportance.MAX,
          vibrationPattern: [0, 250, 250, 250],
          lightColor: '#b9f1ff',
          sound: 'default',
        });
      }

      // Handle notification responses (when user taps notification)
      this.setupNotificationResponseListener();

      console.log('Notifications initialized successfully');

    } catch (error) {
      console.error('Error initializing notifications:', error);
      throw error;
    }
  }

  private setupNotificationResponseListener(): void {
    Notifications.addNotificationResponseReceivedListener(response => {
      const data = response.notification.request.content.data as unknown as NotificationData;
      
      if (data?.transactionId) {
        // Deep link to transaction detail modal
        this.handleDeepLink(data);
      }
    });
  }

  private handleDeepLink(data: NotificationData): void {
    const url = `kotapay://transaction/${data.transactionId}?type=${data.type}`;
    Linking.openURL(url).catch(err => {
      console.error('Failed to open deep link:', err);
    });
  }

  async sendMoneyReceivedNotification(payload: TransactionNotificationPayload): Promise<void> {
    const { transactionId, amount, currency, senderName } = payload;
    
    await this.scheduleNotification({
      title: '💰 Money Received!',
      body: `You received ${currency}${amount.toFixed(2)} from ${senderName}`,
      data: {
        type: 'money_received',
        transactionId,
        amount,
        currency,
        senderName,
        settlementType: 'internal', // Instant wallet-to-wallet
      },
      icon: '💰',
    });
  }

  async sendMoneySentNotification(payload: TransactionNotificationPayload & { 
    settlementType?: 'internal' | 'external' | 'bank';
    estimatedSettlement?: string;
  }): Promise<void> {
    const { transactionId, amount, currency, recipientName, settlementType = 'internal', estimatedSettlement } = payload;
    
    const settlementMessage = settlementType === 'internal' 
      ? '' 
      : estimatedSettlement 
        ? ` (Settlement: ${estimatedSettlement})`
        : ' (Processing via bank)';
    
    await this.scheduleNotification({
      title: '💸 Money Sent!',
      body: `You sent ${currency}${amount.toFixed(2)} to ${recipientName}${settlementMessage}`,
      data: {
        type: 'money_sent',
        transactionId,
        amount,
        currency,
        recipientName,
        settlementType,
        estimatedSettlement,
      },
      icon: '💸',
    });
  }

  async sendRequestReceivedNotification(payload: TransactionNotificationPayload): Promise<void> {
    const { transactionId, amount, currency, senderName, message } = payload;
    
    await this.scheduleNotification({
      title: '📥 Payment Request',
      body: `${senderName} requested ${currency}${amount.toFixed(2)}${message ? ` - ${message}` : ''}`,
      data: {
        type: 'request_received',
        transactionId,
        amount,
        currency,
        senderName,
        message,
      },
      icon: '📥',
    });
  }

  async sendRequestAcceptedNotification(payload: TransactionNotificationPayload): Promise<void> {
    const { transactionId, amount, currency, recipientName } = payload;
    
    await this.scheduleNotification({
      title: '✅ Request Accepted!',
      body: `${recipientName} accepted your request for ${currency}${amount.toFixed(2)}`,
      data: {
        type: 'request_accepted',
        transactionId,
        amount,
        currency,
        recipientName,
      },
      icon: '✅',
    });
  }

  async sendEmailNotification(payload: { 
    transactionId: string; 
    emailSubject: string; 
    senderName: string; 
    message?: string; 
  }): Promise<void> {
    const { transactionId, emailSubject, senderName, message } = payload;
    
    await this.scheduleNotification({
      title: '📧 New Email Notification',
      body: `${emailSubject} from ${senderName}${message ? ` - ${message}` : ''}`,
      data: {
        type: 'email_notification',
        transactionId,
        senderName,
        emailSubject,
        message,
      },
      icon: '📧',
    });
  }

  // KYC & Compliance Notifications
  async sendKYCTierUpgradeNotification(newTier: 1 | 2 | 3, newLimit: number): Promise<void> {
    const tierMessages = {
      1: 'Phone verified! Monthly limit: ₦5,000',
      2: 'ID & selfie verified! Monthly limit: ₦50,000',
      3: 'Address verified! Monthly limit: ₦500,000'
    };

    await this.scheduleNotification({
      title: `🎉 KYC Tier ${newTier} Unlocked!`,
      body: tierMessages[newTier],
      data: {
        type: 'kyc_tier_upgraded',
        transactionId: `kyc-${Date.now()}`,
        kycTier: newTier,
        amount: newLimit,
      },
      icon: '🎉',
    });
  }

  async sendDailyLimitReachedNotification(currentSpent: number, dailyLimit: number): Promise<void> {
    await this.scheduleNotification({
      title: '⚠️ Daily Limit Reached',
      body: `You've reached your daily limit of ₦${dailyLimit.toLocaleString()}. Limit resets tomorrow.`,
      data: {
        type: 'daily_limit_reached',
        transactionId: `limit-${Date.now()}`,
        amount: currentSpent,
      },
      icon: '⚠️',
    });
  }

  async sendFraudAlertNotification(transactionId: string, riskScore: number, reason: string): Promise<void> {
    await this.scheduleNotification({
      title: '🚨 Security Alert',
      body: `Suspicious activity detected: ${reason}. Transaction under review.`,
      data: {
        type: 'fraud_alert',
        transactionId,
        riskScore,
        message: reason,
      },
      icon: '🚨',
    });
  }

  // Settlement & Banking Notifications
  async sendSettlementNotification(
    transactionId: string, 
    amount: number, 
    currency: string, 
    settlementType: 'internal' | 'external' | 'bank'
  ): Promise<void> {
    const settlementMessages = {
      internal: 'Instant settlement completed',
      external: 'Bank settlement initiated',
      bank: 'ACH transfer processing'
    };

    await this.scheduleNotification({
      title: '✅ Settlement Update',
      body: `₦${amount.toFixed(2)} - ${settlementMessages[settlementType]}`,
      data: {
        type: 'settlement_completed',
        transactionId,
        amount,
        currency,
        settlementType,
      },
      icon: '✅',
    });
  }

  async sendChargebackNotification(originalTransactionId: string, amount: number, reason: string): Promise<void> {
    await this.scheduleNotification({
      title: '🔄 Chargeback Processed',
      body: `₦${amount.toFixed(2)} refunded to your wallet. Reason: ${reason}`,
      data: {
        type: 'chargeback_processed',
        transactionId: `chargeback-${originalTransactionId}`,
        amount,
        message: reason,
      },
      icon: '🔄',
    });
  }

  async sendTransactionFailedNotification(
    transactionId: string, 
    amount: number, 
    currency: string, 
    reason: string,
    suggestedAction?: string
  ): Promise<void> {
    const actionMessage = suggestedAction ? ` ${suggestedAction}` : '';
    
    await this.scheduleNotification({
      title: '❌ Transaction Failed',
      body: `${currency}${amount.toFixed(2)} transfer failed: ${reason}.${actionMessage}`,
      data: {
        type: 'transaction_failed',
        transactionId,
        amount,
        currency,
        message: reason,
      },
      icon: '❌',
    });
  }

  async scheduleNotification(notification: {
    title: string;
    body: string;
    data: NotificationData;
    icon: string;
  }): Promise<void> {
    try {
      await Notifications.scheduleNotificationAsync({
        content: {
          title: notification.title,
          body: notification.body,
          data: notification.data,
          sound: 'default',
          priority: Notifications.AndroidNotificationPriority.HIGH,
          color: '#b9f1ff',
        },
        trigger: null, // Send immediately
      });
    } catch (error) {
      console.error('Error scheduling notification:', error);
    }
  }

  async cancelAllNotifications(): Promise<void> {
    await Notifications.cancelAllScheduledNotificationsAsync();
  }

  async getBadgeCount(): Promise<number> {
    return await Notifications.getBadgeCountAsync();
  }

  async setBadgeCount(count: number): Promise<void> {
    await Notifications.setBadgeCountAsync(count);
  }

  getExpoPushToken(): string | null {
    return this.expoPushToken;
  }

  // Test notification for development
  async sendTestNotification(): Promise<void> {
    await this.scheduleNotification({
      title: '🧪 Test Notification',
      body: 'This is a test notification from KotaPay',
      data: {
        type: 'money_received',
        transactionId: 'test-123',
      },
      icon: '📧',
    });
  }

  // Wallet & Top-up Notifications
  async sendWalletTopUpNotification(
    transactionId: string, 
    amount: number, 
    currency: string, 
    method: string
  ): Promise<void> {
    await this.scheduleNotification({
      title: '💳 Wallet Top-up Successful',
      body: `${currency}${amount.toFixed(2)} added to your wallet via ${method}`,
      data: {
        type: 'wallet_topup',
        transactionId,
        amount,
        currency,
        message: `Top-up via ${method}`,
      },
      icon: '💳',
    });
  }

  async sendInsufficientFundsNotification(
    attemptedAmount: number, 
    walletBalance: number, 
    currency: string
  ): Promise<void> {
    await this.scheduleNotification({
      title: '💰 Insufficient Funds',
      body: `Cannot send ${currency}${attemptedAmount.toFixed(2)}. Wallet balance: ${currency}${walletBalance.toFixed(2)}. Tap to top up.`,
      data: {
        type: 'transaction_failed',
        transactionId: `insufficient-${Date.now()}`,
        amount: attemptedAmount,
        currency,
        message: 'Insufficient wallet balance',
      },
      icon: '💰',
    });
  }

  // Utility method for KotaPay's velocity and fraud checks
  async sendVelocityLimitNotification(transactionCount: number, timeWindow: string): Promise<void> {
    await this.scheduleNotification({
      title: '⏱️ Transaction Limit Reached',
      body: `You've made ${transactionCount} transactions in ${timeWindow}. Please wait before making another transaction.`,
      data: {
        type: 'daily_limit_reached',
        transactionId: `velocity-${Date.now()}`,
        message: `${transactionCount} transactions in ${timeWindow}`,
      },
      icon: '⏱️',
    });
  }

  // Method to support KotaPay's social features
  async sendBillSplitInviteNotification(
    groupId: string,
    amount: number,
    currency: string,
    organizer: string,
    billDescription: string
  ): Promise<void> {
    await this.scheduleNotification({
      title: '🧾 Bill Split Request',
      body: `${organizer} invited you to split ${currency}${amount.toFixed(2)} for ${billDescription}`,
      data: {
        type: 'request_received',
        transactionId: `split-${groupId}`,
        amount,
        currency,
        senderName: organizer,
        message: `Bill split: ${billDescription}`,
      },
      icon: '🧾',
    });
  }

  // Support for KotaPay's audit and compliance
  async sendAMLScreeningNotification(transactionId: string, status: 'passed' | 'flagged' | 'pending'): Promise<void> {
    const statusMessages = {
      passed: 'Transaction cleared',
      flagged: 'Transaction flagged for review',
      pending: 'AML screening in progress'
    };

    const icons = {
      passed: '✅',
      flagged: '🚨',
      pending: '⏳'
    };

    await this.scheduleNotification({
      title: `${icons[status]} AML Screening ${status === 'passed' ? 'Complete' : 'Update'}`,
      body: statusMessages[status],
      data: {
        type: status === 'passed' ? 'settlement_completed' : status === 'flagged' ? 'fraud_alert' : 'transaction_failed',
        transactionId,
        message: `AML screening ${status}`,
      },
      icon: icons[status],
    });
  }

  // 💰 Payment Request & Link Notifications
  async sendPaymentLinkCreatedNotification(userId: string, paymentUrl: string, amount: number, description: string): Promise<void> {
    await this.scheduleNotification({
      title: '🔗 Payment Link Created',
      body: `₦${amount.toLocaleString()} payment link ready to share`,
      data: {
        type: 'wallet_topup',
        transactionId: 'link_created',
        amount,
        message: description,
      },
      icon: '🔗',
    });
  }

  async sendPaymentRequestNotification(payerId: string, requesterName: string, amount: number, description: string, paymentUrl: string): Promise<void> {
    await this.scheduleNotification({
      title: `💰 Payment Request from ${requesterName}`,
      body: `₦${amount.toLocaleString()} - ${description}`,
      data: {
        type: 'request_received',
        transactionId: 'payment_request',
        amount,
        senderName: requesterName,
        message: description,
      },
      icon: '💰',
    });
  }

  async sendQRPaymentRequestNotification(requesterId: string, amount: number, description: string): Promise<void> {
    await this.scheduleNotification({
      title: '📱 QR Payment Request Created',
      body: `₦${amount.toLocaleString()} QR code ready for scanning`,
      data: {
        type: 'wallet_topup',
        transactionId: 'qr_created',
        amount,
        message: description,
      },
      icon: '📱',
    });
  }

  async sendDirectPaymentRequestNotification(payerId: string, requesterName: string, amount: number, description: string): Promise<void> {
    await this.scheduleNotification({
      title: `💳 Payment Request from ${requesterName}`,
      body: `₦${amount.toLocaleString()} - ${description}`,
      data: {
        type: 'request_received',
        transactionId: 'direct_request',
        amount,
        senderName: requesterName,
        message: description,
      },
      icon: '💳',
    });
  }

  async sendPaymentRequestSentNotification(requesterId: string, payerName: string, amount: number, description: string): Promise<void> {
    await this.scheduleNotification({
      title: `📤 Payment Request Sent`,
      body: `₦${amount.toLocaleString()} request sent to ${payerName}`,
      data: {
        type: 'money_sent',
        transactionId: 'request_sent',
        amount,
        recipientName: payerName,
        message: description,
      },
      icon: '📤',
    });
  }

  async sendPaymentReceivedNotification(requesterId: string, payerName: string, amount: number, description: string): Promise<void> {
    await this.scheduleNotification({
      title: `✅ Payment Received`,
      body: `₦${amount.toLocaleString()} from ${payerName}`,
      data: {
        type: 'money_received',
        transactionId: 'payment_received',
        amount,
        senderName: payerName,
        message: description,
      },
      icon: '✅',
    });
  }

  async sendPaymentSentNotification(payerId: string, requesterName: string, amount: number, description: string): Promise<void> {
    await this.scheduleNotification({
      title: `💸 Payment Sent`,
      body: `₦${amount.toLocaleString()} sent to ${requesterName}`,
      data: {
        type: 'money_sent',
        transactionId: 'payment_sent',
        amount,
        recipientName: requesterName,
        message: description,
      },
      icon: '💸',
    });
  }

  async sendPaymentRequestCancelledNotification(payerId: string, requesterName: string, amount: number, description: string): Promise<void> {
    await this.scheduleNotification({
      title: `❌ Payment Request Cancelled`,
      body: `₦${amount.toLocaleString()} request from ${requesterName} was cancelled`,
      data: {
        type: 'transaction_failed',
        transactionId: 'request_cancelled',
        amount,
        senderName: requesterName,
        message: description,
      },
      icon: '❌',
    });
  }

  async sendPaymentReminderNotification(payerId: string, requesterName: string, amount: number, description: string, reminderCount: number): Promise<void> {
    await this.scheduleNotification({
      title: `🔔 Payment Reminder ${reminderCount > 1 ? `(${reminderCount})` : ''}`,
      body: `₦${amount.toLocaleString()} payment still pending from ${requesterName}`,
      data: {
        type: 'request_received',
        transactionId: 'payment_reminder',
        amount,
        senderName: requesterName,
        message: description,
      },
      icon: '🔔',
    });
  }

  // Security & Fraud Prevention Notifications
  async sendSecurityAlert(alertType: string, message: string, details?: any): Promise<void> {
    await this.scheduleNotification({
      title: `🚨 Security Alert`,
      body: message,
      data: {
        type: 'fraud_alert',
        transactionId: 'security_alert',
        message,
        alertType,
        details: JSON.stringify(details || {}),
      },
      icon: '🚨',
    });
  }

  async sendDeviceSecurityNotification(deviceName: string, location?: string): Promise<void> {
    await this.scheduleNotification({
      title: `📱 New Device Login`,
      body: `Login detected from ${deviceName}${location ? ` in ${location}` : ''}`,
      data: {
        type: 'fraud_alert',
        transactionId: 'device_login',
        message: `New device: ${deviceName}`,
      },
      icon: '📱',
    });
  }

  async sendRiskScoreNotification(score: number, factors: string[]): Promise<void> {
    const riskLevel = score >= 70 ? 'High' : score >= 40 ? 'Medium' : 'Low';
    await this.scheduleNotification({
      title: `🎯 ${riskLevel} Risk Transaction`,
      body: `Risk score: ${score}/100. Additional verification may be required.`,
      data: {
        type: 'fraud_alert',
        transactionId: 'risk_assessment',
        riskScore: score,
        message: `Risk factors: ${factors.join(', ')}`,
      },
      icon: '🎯',
    });
  }

  async sendBiometricAuthNotification(success: boolean): Promise<void> {
    await this.scheduleNotification({
      title: success ? `✅ Biometric Auth Successful` : `❌ Biometric Auth Failed`,
      body: success ? 'Transaction authorized with biometrics' : 'Biometric authentication failed. Please try PIN.',
      data: {
        type: success ? 'money_sent' : 'transaction_failed',
        transactionId: 'biometric_auth',
        message: `Biometric authentication ${success ? 'successful' : 'failed'}`,
      },
      icon: success ? '✅' : '❌',
    });
  }
}

export const notificationService = new NotificationService();
export default notificationService;
