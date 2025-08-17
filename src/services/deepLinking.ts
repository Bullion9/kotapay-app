import * as Linking from 'expo-linking';
import { NavigationContainerRef } from '@react-navigation/native';

interface DeepLinkHandler {
  navigationRef: NavigationContainerRef<any> | null;
}

class DeepLinkService implements DeepLinkHandler {
  public navigationRef: NavigationContainerRef<any> | null = null;

  setNavigationRef(ref: NavigationContainerRef<any>) {
    this.navigationRef = ref;
  }

  async initialize() {
    // Handle app opening from notification when app is closed
    const initialUrl = await Linking.getInitialURL();
    if (initialUrl) {
      this.handleDeepLink(initialUrl);
    }

    // Handle app opening from notification when app is in background
    const subscription = Linking.addEventListener('url', (event) => {
      this.handleDeepLink(event.url);
    });

    return subscription;
  }

  private handleDeepLink(url: string) {
    if (!this.navigationRef) {
      console.warn('Navigation ref not set, cannot handle deep link:', url);
      return;
    }

    try {
      const parsed = Linking.parse(url);
      
      if (parsed.hostname === 'transaction' && parsed.path) {
        const transactionId = parsed.path.replace('/', '');
        const type = parsed.queryParams?.type as string;
        
        this.navigateToTransactionDetail(transactionId, type);
      }
    } catch (error) {
      console.error('Error parsing deep link:', error);
    }
  }

  private navigateToTransactionDetail(transactionId: string, type?: string) {
    if (!this.navigationRef) return;

    // Create mock transaction data based on the ID and type
    const mockTransaction = {
      id: transactionId,
      type: this.getTransactionType(type),
      amount: 25.50,
      currency: '$',
      status: type === 'request_received' ? 'pending' : 'completed',
      date: new Date().toLocaleDateString(),
      time: new Date().toLocaleTimeString(),
      contactName: type?.includes('received') ? 'John Doe' : 'Jane Smith',
      contactPhone: '+1 (555) 123-4567',
      message: 'Coffee money ☕',
      reference: `REF-${transactionId.slice(-6).toUpperCase()}`,
    };

    // Navigate to the History tab first, then open the modal
    this.navigationRef.navigate('History', {
      screen: 'TransactionHistory',
      params: {
        openTransactionDetail: true,
        transaction: mockTransaction,
      },
    });
  }

  private getTransactionType(type?: string): 'sent' | 'received' | 'request_sent' | 'request_received' {
    switch (type) {
      case 'money_sent':
        return 'sent';
      case 'money_received':
        return 'received';
      case 'request_received':
        return 'request_received';
      case 'request_accepted':
        return 'sent'; // Request was accepted, so money was sent
      default:
        return 'received';
    }
  }

  // Helper method to create deep link URLs
  createTransactionUrl(transactionId: string, type: string): string {
    return `kotapay://transaction/${transactionId}?type=${type}`;
  }
}

export const deepLinkService = new DeepLinkService();
export default deepLinkService;
