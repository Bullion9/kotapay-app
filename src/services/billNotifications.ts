import { notificationService } from './notifications';
import { Alert } from 'react-native';

export interface BillPaymentPayload {
  transactionId: string;
  billType: 'airtime' | 'data' | 'electricity' | 'water' | 'cable' | 'betting';
  provider: string;
  amount: number;
  accountNumber: string;
  currency?: string;
}

export interface BillNotificationResult {
  success: boolean;
  transactionId: string;
  message: string;
}

class BillNotificationService {
  async sendBillPaymentPendingNotification(payload: BillPaymentPayload): Promise<void> {
    const { transactionId, billType, provider, amount, currency = '₦' } = payload;
    
    await notificationService.scheduleNotification({
      title: '⏳ Payment Processing',
      body: `Your ${billType} payment of ${currency}${amount.toLocaleString()} to ${provider} is being processed...`,
      data: {
        type: 'money_sent',
        transactionId,
        amount,
        currency,
        senderName: 'You',
        recipientName: provider,
        message: `${billType} payment processing`,
      },
      icon: '⏳',
    });
  }

  async sendBillPaymentSuccessNotification(payload: BillPaymentPayload): Promise<BillNotificationResult> {
    const { transactionId, billType, provider, amount, currency = '₦' } = payload;
    
    try {
      // Send push notification
      await notificationService.scheduleNotification({
        title: '✅ Payment Successful!',
        body: `${currency}${amount.toLocaleString()} ${billType} payment to ${provider} completed successfully`,
        data: {
          type: 'money_sent',
          transactionId,
          amount,
          currency,
          senderName: 'You',
          recipientName: provider,
          message: `${billType} payment successful`,
        },
        icon: '✅',
      });

      // Generate receipt message
      const receiptMessage = this.generateReceiptMessage(payload);

      return {
        success: true,
        transactionId,
        message: receiptMessage,
      };
    } catch (error) {
      console.error('Error sending success notification:', error);
      throw error;
    }
  }

  async sendBillPaymentFailedNotification(payload: BillPaymentPayload, errorReason?: string): Promise<BillNotificationResult> {
    const { transactionId, billType, provider, amount, currency = '₦' } = payload;
    
    try {
      // Send push notification
      await notificationService.scheduleNotification({
        title: '❌ Payment Failed',
        body: `${currency}${amount.toLocaleString()} ${billType} payment to ${provider} failed. ${errorReason || 'Please try again.'}`,
        data: {
          type: 'money_sent',
          transactionId,
          amount,
          currency,
          senderName: 'You',
          recipientName: provider,
          message: `${billType} payment failed`,
        },
        icon: '❌',
      });

      return {
        success: false,
        transactionId,
        message: errorReason || 'Payment failed. Please try again.',
      };
    } catch (error) {
      console.error('Error sending failure notification:', error);
      throw error;
    }
  }

  async sendAirtimeTopUpSuccessNotification(payload: {
    transactionId: string;
    provider: string;
    phoneNumber: string;
    amount: number;
    bonus?: string;
  }): Promise<void> {
    const { transactionId, provider, phoneNumber, amount, bonus } = payload;
    
    await notificationService.scheduleNotification({
      title: '📱 Airtime Top-up Successful!',
      body: `₦${amount.toLocaleString()} airtime sent to ${phoneNumber} (${provider})${bonus ? `. ${bonus}` : ''}`,
      data: {
        type: 'money_sent',
        transactionId,
        amount,
        currency: '₦',
        senderName: 'You',
        recipientName: phoneNumber,
        message: `Airtime top-up successful`,
      },
      icon: '📱',
    });
  }

  async sendBettingFundingSuccessNotification(payload: {
    transactionId: string;
    provider: string;
    accountId: string;
    amount: number;
  }): Promise<void> {
    const { transactionId, provider, accountId, amount } = payload;
    
    await notificationService.scheduleNotification({
      title: '🎯 Betting Account Funded!',
      body: `₦${amount.toLocaleString()} successfully added to your ${provider} account (${accountId})`,
      data: {
        type: 'money_sent',
        transactionId,
        amount,
        currency: '₦',
        senderName: 'You',
        recipientName: provider,
        message: `Betting account funding successful`,
      },
      icon: '🎯',
    });
  }

  private generateReceiptMessage(payload: BillPaymentPayload): string {
    const { billType, provider, amount, accountNumber, currency = '₦' } = payload;
    
    const billTypeDisplay = billType.charAt(0).toUpperCase() + billType.slice(1);
    const timestamp = new Date().toLocaleString();
    
    return `${billTypeDisplay} Payment Successful!\n\n` +
           `Provider: ${provider}\n` +
           `Amount: ${currency}${amount.toLocaleString()}\n` +
           `Account: ${accountNumber}\n` +
           `Date: ${timestamp}\n\n` +
           `Transaction completed successfully. Receipt has been saved to your transaction history.`;
  }

  // Helper method to show appropriate alert based on bill type
  showBillPaymentAlert(
    result: BillNotificationResult, 
    billType: string, 
    onSuccess?: () => void,
    onRetry?: () => void
  ): void {
    if (result.success) {
      Alert.alert(
        '✅ Payment Successful!',
        result.message,
        [
          {
            text: 'Done',
            onPress: onSuccess,
            style: 'default'
          }
        ]
      );
    } else {
      Alert.alert(
        '❌ Payment Failed',
        result.message,
        [
          {
            text: 'Cancel',
            style: 'cancel'
          },
          {
            text: 'Try Again',
            onPress: onRetry,
            style: 'default'
          }
        ]
      );
    }
  }
}

export const billNotificationService = new BillNotificationService();
export default billNotificationService;
