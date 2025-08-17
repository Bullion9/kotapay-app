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
  type: 'money_received' | 'money_sent' | 'request_received' | 'request_accepted' | 'email_notification';
  transactionId: string;
  amount?: number;
  currency?: string;
  senderName?: string;
  recipientName?: string;
  message?: string;
  emailSubject?: string;
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
      },
      icon: '💰',
    });
  }

  async sendMoneySentNotification(payload: TransactionNotificationPayload): Promise<void> {
    const { transactionId, amount, currency, recipientName } = payload;
    
    await this.scheduleNotification({
      title: '💸 Money Sent!',
      body: `You sent ${currency}${amount.toFixed(2)} to ${recipientName}`,
      data: {
        type: 'money_sent',
        transactionId,
        amount,
        currency,
        recipientName,
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
}

export const notificationService = new NotificationService();
export default notificationService;
