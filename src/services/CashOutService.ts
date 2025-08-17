export interface CashOutMethod {
  id: string;
  name: string;
  description: string;
  fee: number;
  processingTime: string;
  isAvailable: boolean;
  limits: {
    min: number;
    max: number;
    daily: number;
  };
}

export interface CashOutTransaction {
  id: string;
  userId: string;
  amount: number;
  method: CashOutMethod;
  methodId: string;
  destination: any;
  fee: number;
  netAmount: number;
  status: 'pending' | 'processing' | 'completed' | 'failed' | 'cancelled';
  reference: string;
  createdAt: string;
  updatedAt: string;
  completedAt?: string;
  failureReason?: string;
}

export interface PayoutMethod {
  id: string;
  name: string;
  description: string;
  fee: number;
  processingTime: string;
  isAvailable: boolean;
  limits: {
    min: number;
    max: number;
    daily: number;
  };
}

class CashOutService {
  private transactions: CashOutTransaction[] = [];
  private userLimits = {
    daily: 10000,
    monthly: 50000,
    used: {
      daily: 0,
      monthly: 0,
    },
  };

  // Get available payout methods
  getPayoutMethods(): PayoutMethod[] {
    return [
      {
        id: 'bank_transfer',
        name: 'Bank Transfer',
        description: 'Transfer to your bank account',
        fee: 50,
        processingTime: '1-3 business days',
        isAvailable: true,
        limits: {
          min: 100,
          max: 100000,
          daily: 50000,
        },
      },
      {
        id: 'mobile_money',
        name: 'Mobile Money',
        description: 'Send to mobile money wallet',
        fee: 25,
        processingTime: 'Instant',
        isAvailable: true,
        limits: {
          min: 50,
          max: 25000,
          daily: 25000,
        },
      },
      {
        id: 'agent_pickup',
        name: 'Agent Pickup',
        description: 'Pick up cash from authorized agents',
        fee: 75,
        processingTime: '10-30 minutes',
        isAvailable: true,
        limits: {
          min: 100,
          max: 10000,
          daily: 10000,
        },
      },
    ];
  }

  // Validate cash out request
  async validateCashOut(amount: number, methodId: string): Promise<{
    isValid: boolean;
    error?: string;
  }> {
    // Minimum amount check
    if (amount < 10) {
      return { isValid: false, error: 'Minimum cash out amount is ₦10' };
    }

    // Maximum amount check
    if (amount > 5000) {
      return { isValid: false, error: 'Maximum cash out amount is ₦5,000' };
    }

    // Daily limit check
    if (this.userLimits.used.daily + amount > this.userLimits.daily) {
      return { isValid: false, error: 'Daily cash out limit exceeded' };
    }

    // Monthly limit check
    if (this.userLimits.used.monthly + amount > this.userLimits.monthly) {
      return { isValid: false, error: 'Monthly cash out limit exceeded' };
    }

    // Method availability check
    const method = this.getPayoutMethods().find(m => m.id === methodId);
    if (!method || !method.isAvailable) {
      return { isValid: false, error: 'Selected payout method is not available' };
    }

    return { isValid: true };
  }

  // Calculate fee for cash out
  calculateFee(amount: number, methodId: string): number {
    const method = this.getPayoutMethods().find(m => m.id === methodId);
    if (!method) return 0;

    return method.fee; // Fixed fee for each method
  }

  // Process cash out transaction
  async processCashOut(
    amount: number,
    methodId: string,
    destination: any,
    pin: string
  ): Promise<CashOutTransaction> {
    // Validate request
    const validation = await this.validateCashOut(amount, methodId);
    if (!validation.isValid) {
      throw new Error(validation.error);
    }

    // Validate PIN (mock implementation)
    if (pin !== '1234') {
      throw new Error('Invalid PIN');
    }

    const method = this.getPayoutMethods().find(m => m.id === methodId)!;
    const fee = this.calculateFee(amount, methodId);
    const netAmount = amount - fee;

    // Create transaction
    const transaction: CashOutTransaction = {
      id: `cashout_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      userId: 'user123', // Mock user ID
      amount,
      method: method,
      methodId,
      destination,
      fee,
      netAmount,
      status: 'pending',
      reference: this.generateReference(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    // Store transaction
    this.transactions.push(transaction);

    // Update limits
    this.userLimits.used.daily += amount;
    this.userLimits.used.monthly += amount;

    // Simulate processing
    setTimeout(() => {
      this.updateTransactionStatus(transaction.id, 'processing');
      
      // Simulate completion after delay
      setTimeout(() => {
        this.updateTransactionStatus(transaction.id, 'completed');
      }, 3000);
    }, 1000);

    return transaction;
  }

  // Update transaction status
  private updateTransactionStatus(transactionId: string, status: CashOutTransaction['status']) {
    const transaction = this.transactions.find(t => t.id === transactionId);
    if (transaction) {
      transaction.status = status;
      transaction.updatedAt = new Date().toISOString();
      
      if (status === 'completed') {
        transaction.completedAt = new Date().toISOString();
      }
    }
  }

  // Generate transaction reference
  private generateReference(): string {
    const timestamp = Date.now().toString().slice(-8);
    const random = Math.random().toString(36).substr(2, 4).toUpperCase();
    return `CO${timestamp}${random}`;
  }

  // Get transaction by ID
  getTransaction(transactionId: string): CashOutTransaction | undefined {
    return this.transactions.find(t => t.id === transactionId);
  }

  // Get user's cash out history
  getUserTransactions(userId: string): CashOutTransaction[] {
    return this.transactions.filter(t => t.userId === userId);
  }

  // Get user limits
  getUserLimits() {
    return {
      ...this.userLimits,
      remaining: {
        daily: this.userLimits.daily - this.userLimits.used.daily,
        monthly: this.userLimits.monthly - this.userLimits.used.monthly,
      },
    };
  }
}

// Export singleton instance
export const cashOutService = new CashOutService();
export default CashOutService;
