export interface TransactionData {
  id: string;
  type: 'SENT' | 'RECEIVED' | 'BILL_PAYMENT' | 'CARD_TOP_UP' | 'WITHDRAW' | 'PAY_WITH_LINK' | 'VIRTUAL_CARD' | 'REQUEST';
  amount: number;
  currency: string;
  status: 'SUCCESS' | 'PENDING' | 'FAILED';
  date: string;
  time: string;
  from: string;
  to: string;
  note?: string;
  fee: number;
  total: number;
  cardLastFour?: string;
  cardValidUntil?: string;
  billProvider?: string;
  billMeter?: string;
  biometricAuth: boolean;
}

export interface ReceiptData extends TransactionData {
  receiptId: string;
  generatedAt: string;
  appVersion: string;
  buildNumber: string;
}

class ReceiptService {
  private baseUrl = 'https://api.kotapay.com'; // Replace with your actual API base URL

  /**
   * Generate a receipt for a transaction
   */
  async generateReceipt(transactionId: string): Promise<ReceiptData> {
    try {
      const response = await fetch(`${this.baseUrl}/receipt/${transactionId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          // Add authentication headers as needed
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch receipt data');
      }

      const receiptData: ReceiptData = await response.json();
      return receiptData;
    } catch (error) {
      console.error('Error generating receipt:', error);
      throw error;
    }
  }

  /**
   * Download receipt as PDF
   */
  async downloadReceiptPDF(transactionId: string): Promise<string> {
    try {
      const response = await fetch(`${this.baseUrl}/receipt/${transactionId}/pdf`, {
        method: 'GET',
        headers: {
          // Add authentication headers as needed
        },
      });

      if (!response.ok) {
        throw new Error('Failed to download PDF');
      }

      // For React Native, you'd typically use a file system library
      // to save the PDF to device storage
      return 'PDF downloaded successfully';
    } catch (error) {
      console.error('Error downloading PDF:', error);
      throw error;
    }
  }

  /**
   * Create a mock receipt for demo purposes
   */
  createMockReceipt(type: string, amount: number): ReceiptData {
    const transactionId = this.generateTransactionId();
    const now = new Date();
    
    return {
      id: transactionId,
      receiptId: `RCP${transactionId}`,
      type: type as any,
      amount,
      currency: '₦',
      status: 'SUCCESS',
      date: now.toLocaleDateString('en-GB', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
      }),
      time: now.toLocaleTimeString('en-GB', {
        hour: '2-digit',
        minute: '2-digit',
        timeZoneName: 'short',
      }),
      from: type === 'RECEIVED' ? 'John Doe' : 'Your Wallet',
      to: type === 'SENT' ? 'Jane Smith' : 'Your Wallet',
      note: this.getMockNote(type),
      fee: type === 'SENT' || type === 'WITHDRAW' ? 25.00 : 0.00,
      total: amount + (type === 'SENT' || type === 'WITHDRAW' ? 25.00 : 0.00),
      cardLastFour: type === 'VIRTUAL_CARD' ? '1234' : undefined,
      cardValidUntil: type === 'VIRTUAL_CARD' ? '07/27' : undefined,
      billProvider: type === 'BILL_PAYMENT' ? 'IKEJA Electric' : undefined,
      billMeter: type === 'BILL_PAYMENT' ? '5678' : undefined,
      biometricAuth: Math.random() > 0.5,
      generatedAt: now.toISOString(),
      appVersion: '2.1.0',
      buildNumber: '2025.08.17',
    };
  }

  /**
   * Generate a mock transaction ID
   */
  private generateTransactionId(): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let result = '';
    for (let i = 0; i < 12; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  }

  /**
   * Get mock note based on transaction type
   */
  private getMockNote(type: string): string | undefined {
    const notes = {
      SENT: 'Dinner split',
      RECEIVED: 'Payment for services',
      BILL_PAYMENT: 'Monthly electricity bill',
      CARD_TOP_UP: 'Virtual card top-up',
      WITHDRAW: 'Cash withdrawal',
      PAY_WITH_LINK: 'Online purchase',
      VIRTUAL_CARD: 'Card creation',
      REQUEST: 'Money request',
    };
    
    return notes[type as keyof typeof notes];
  }

  /**
   * Report an issue with a receipt
   */
  async reportIssue(transactionId: string, issueDescription: string): Promise<void> {
    try {
      const response = await fetch(`${this.baseUrl}/receipt/${transactionId}/report`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          // Add authentication headers as needed
        },
        body: JSON.stringify({
          transactionId,
          issueDescription,
          reportedAt: new Date().toISOString(),
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to report issue');
      }
    } catch (error) {
      console.error('Error reporting issue:', error);
      throw error;
    }
  }

  /**
   * Get deep link for receipt
   */
  getReceiptDeepLink(transactionId: string): string {
    return `kotapay://receipt/${transactionId}`;
  }

  /**
   * Validate receipt data
   */
  validateReceiptData(receipt: ReceiptData): boolean {
    return !!(
      receipt.id &&
      receipt.type &&
      receipt.amount &&
      receipt.currency &&
      receipt.status &&
      receipt.date &&
      receipt.time &&
      receipt.from &&
      receipt.to
    );
  }
}

export const receiptService = new ReceiptService();
