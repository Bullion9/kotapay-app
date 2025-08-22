import { databases } from './AppwriteService';
import { APPWRITE_CONFIG } from '../config/api';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface QueuedTransaction {
  id: string;
  userId: string;
  type: 'transfer' | 'bank_transfer' | 'bill_payment';
  amount: number;
  recipientId?: string;
  recipientDetails?: any;
  description: string;
  metadata?: any;
  attempts: number;
  maxAttempts: number;
  createdAt: Date;
  scheduledAt?: Date;
  lastAttemptAt?: Date;
  status: 'queued' | 'processing' | 'failed' | 'completed';
  failureReason?: string;
}

interface TopUpAndSendFlow {
  originalTransactionId: string;
  requiredAmount: number;
  currentBalance: number;
  topUpAmount: number;
  status: 'initiated' | 'topup_pending' | 'topup_completed' | 'sending' | 'completed' | 'failed';
  createdAt: Date;
  expiresAt: Date;
}

interface IdempotencyCheck {
  key: string;
  transactionId: string;
  userId: string;
  createdAt: Date;
  expiresAt: Date;
}

class EdgeCaseHandler {
  private readonly QUEUE_STORAGE_KEY = 'kota_transaction_queue';
  private readonly TOPUP_FLOWS_KEY = 'kota_topup_flows';
  private readonly IDEMPOTENCY_KEY = 'kota_idempotency_keys';
  private readonly MAX_RETRY_ATTEMPTS = 3;
  private readonly RETRY_DELAY_BASE = 2000; // 2 seconds
  private readonly TOPUP_FLOW_TIMEOUT = 10 * 60 * 1000; // 10 minutes
  private readonly IDEMPOTENCY_TIMEOUT = 5 * 60 * 1000; // 5 minutes

  /**
   * Handle insufficient wallet balance - offer "top-up & send" flow
   */
  async handleInsufficientBalance(
    userId: string,
    requiredAmount: number,
    currentBalance: number,
    originalTransaction: any
  ): Promise<{
    flowId: string;
    topUpAmount: number;
    message: string;
    actions: string[];
  }> {
    try {
      console.log(`💳 Insufficient balance: Need ₦${requiredAmount / 100}, Have ₦${currentBalance / 100}`);

      const topUpAmount = requiredAmount - currentBalance + 50000; // Add ₦500 buffer
      const flowId = `topup_${userId}_${Date.now()}`;

      const topUpFlow: TopUpAndSendFlow = {
        originalTransactionId: originalTransaction.id,
        requiredAmount,
        currentBalance,
        topUpAmount,
        status: 'initiated',
        createdAt: new Date(),
        expiresAt: new Date(Date.now() + this.TOPUP_FLOW_TIMEOUT)
      };

      // Store the top-up flow
      await this.storeTopUpFlow(flowId, topUpFlow);

      // Log the event
      await this.logEdgeCaseEvent(userId, 'insufficient_balance', {
        requiredAmount,
        currentBalance,
        topUpAmount,
        flowId
      });

      return {
        flowId,
        topUpAmount,
        message: `Insufficient balance. Top up ₦${topUpAmount / 100} to complete transaction.`,
        actions: ['topup_with_card', 'topup_with_bank', 'cancel_transaction']
      };
    } catch (error) {
      console.error('Failed to handle insufficient balance:', error);
      throw error;
    }
  }

  /**
   * Complete top-up and send flow
   */
  async completeTopUpAndSend(flowId: string, topUpTransactionId: string): Promise<{
    success: boolean;
    originalTransactionId?: string;
    message: string;
  }> {
    try {
      const flow = await this.getTopUpFlow(flowId);
      if (!flow) {
        return {
          success: false,
          message: 'Top-up flow not found or expired'
        };
      }

      // Check if flow has expired
      if (new Date() > flow.expiresAt) {
        await this.removeTopUpFlow(flowId);
        return {
          success: false,
          message: 'Top-up flow has expired. Please start again.'
        };
      }

      // Update flow status
      flow.status = 'topup_completed';
      await this.storeTopUpFlow(flowId, flow);

      // Process the original transaction
      flow.status = 'sending';
      await this.storeTopUpFlow(flowId, flow);

      // Here you would integrate with your transaction service
      // For now, we'll simulate success
      flow.status = 'completed';
      await this.storeTopUpFlow(flowId, flow);

      // Clean up
      await this.removeTopUpFlow(flowId);

      return {
        success: true,
        originalTransactionId: flow.originalTransactionId,
        message: 'Top-up completed and transaction sent successfully!'
      };
    } catch (error) {
      console.error('Failed to complete top-up and send:', error);
      return {
        success: false,
        message: 'Failed to complete transaction. Please try again.'
      };
    }
  }

  /**
   * Queue transaction for offline retry
   */
  async queueOfflineTransaction(
    userId: string,
    transactionData: any,
    retryWhenOnline: boolean = true
  ): Promise<string> {
    try {
      const queueId = `queue_${userId}_${Date.now()}`;
      
      const queuedTransaction: QueuedTransaction = {
        id: queueId,
        userId,
        type: transactionData.type,
        amount: transactionData.amount,
        recipientId: transactionData.recipientId,
        recipientDetails: transactionData.recipientDetails,
        description: transactionData.description,
        metadata: transactionData.metadata,
        attempts: 0,
        maxAttempts: this.MAX_RETRY_ATTEMPTS,
        createdAt: new Date(),
        status: 'queued'
      };

      // Store in queue
      await this.addToQueue(queuedTransaction);

      // Log the event
      await this.logEdgeCaseEvent(userId, 'transaction_queued', {
        queueId,
        transactionType: transactionData.type,
        amount: transactionData.amount,
        retryWhenOnline
      });

      console.log(`📥 Transaction queued: ${queueId}`);
      
      if (retryWhenOnline) {
        // Start retry mechanism (in a real app, this would be handled by a background service)
        this.scheduleRetry(queueId);
      }

      return queueId;
    } catch (error) {
      console.error('Failed to queue transaction:', error);
      throw error;
    }
  }

  /**
   * Process queued transactions when back online
   */
  async processQueuedTransactions(userId: string): Promise<{
    processed: number;
    successful: number;
    failed: number;
    details: any[];
  }> {
    try {
      const queue = await this.getQueue();
      const userTransactions = queue.filter(txn => txn.userId === userId && txn.status === 'queued');

      let successful = 0;
      let failed = 0;
      const details: any[] = [];

      for (const txn of userTransactions) {
        try {
          txn.status = 'processing';
          txn.attempts += 1;
          txn.lastAttemptAt = new Date();

          await this.updateQueueItem(txn);

          // Simulate transaction processing (integrate with your transaction service)
          const success = await this.simulateTransactionProcessing(txn);

          if (success) {
            txn.status = 'completed';
            successful++;
            details.push({
              id: txn.id,
              status: 'success',
              amount: txn.amount,
              description: txn.description
            });
          } else {
            if (txn.attempts >= txn.maxAttempts) {
              txn.status = 'failed';
              txn.failureReason = 'Max retry attempts exceeded';
              failed++;
            } else {
              txn.status = 'queued';
              // Schedule next retry
              this.scheduleRetry(txn.id, txn.attempts);
            }
            
            details.push({
              id: txn.id,
              status: 'failed',
              amount: txn.amount,
              description: txn.description,
              reason: txn.failureReason || 'Processing failed'
            });
          }

          await this.updateQueueItem(txn);
        } catch (error) {
          console.error(`Failed to process queued transaction ${txn.id}:`, error);
          failed++;
        }
      }

      // Clean up completed/failed transactions
      await this.cleanupQueue();

      return {
        processed: userTransactions.length,
        successful,
        failed,
        details
      };
    } catch (error) {
      console.error('Failed to process queued transactions:', error);
      return {
        processed: 0,
        successful: 0,
        failed: 0,
        details: []
      };
    }
  }

  /**
   * Prevent duplicate QR scan transactions using idempotency key
   */
  async checkIdempotency(
    userId: string,
    qrData: string,
    amount: number
  ): Promise<{
    isDuplicate: boolean;
    existingTransactionId?: string;
    message?: string;
  }> {
    try {
      // Create idempotency key from QR data and amount
      const idempotencyKey = `qr_${this.hashString(qrData)}_${amount}_${userId}`;

      const existingCheck = await this.getIdempotencyCheck(idempotencyKey);

      if (existingCheck && new Date() < existingCheck.expiresAt) {
        console.log(`🔄 Duplicate QR scan detected: ${idempotencyKey}`);
        
        // Log duplicate attempt
        await this.logEdgeCaseEvent(userId, 'duplicate_qr_scan', {
          qrData,
          amount,
          existingTransactionId: existingCheck.transactionId,
          idempotencyKey
        });

        return {
          isDuplicate: true,
          existingTransactionId: existingCheck.transactionId,
          message: 'This QR code was already scanned recently. Please check your transaction history.'
        };
      }

      return {
        isDuplicate: false
      };
    } catch (error) {
      console.error('Idempotency check failed:', error);
      // Fail safe: allow transaction but log the error
      return {
        isDuplicate: false
      };
    }
  }

  /**
   * Create idempotency record
   */
  async createIdempotencyRecord(
    userId: string,
    qrData: string,
    amount: number,
    transactionId: string
  ): Promise<void> {
    try {
      const idempotencyKey = `qr_${this.hashString(qrData)}_${amount}_${userId}`;
      
      const check: IdempotencyCheck = {
        key: idempotencyKey,
        transactionId,
        userId,
        createdAt: new Date(),
        expiresAt: new Date(Date.now() + this.IDEMPOTENCY_TIMEOUT)
      };

      await this.storeIdempotencyCheck(idempotencyKey, check);
    } catch (error) {
      console.error('Failed to create idempotency record:', error);
    }
  }

  // Private helper methods

  private async addToQueue(transaction: QueuedTransaction): Promise<void> {
    const queue = await this.getQueue();
    queue.push(transaction);
    await AsyncStorage.setItem(this.QUEUE_STORAGE_KEY, JSON.stringify(queue));
  }

  private async getQueue(): Promise<QueuedTransaction[]> {
    try {
      const queueData = await AsyncStorage.getItem(this.QUEUE_STORAGE_KEY);
      return queueData ? JSON.parse(queueData) : [];
    } catch {
      return [];
    }
  }

  private async updateQueueItem(transaction: QueuedTransaction): Promise<void> {
    const queue = await this.getQueue();
    const index = queue.findIndex(txn => txn.id === transaction.id);
    if (index !== -1) {
      queue[index] = transaction;
      await AsyncStorage.setItem(this.QUEUE_STORAGE_KEY, JSON.stringify(queue));
    }
  }

  private async cleanupQueue(): Promise<void> {
    const queue = await this.getQueue();
    const activeQueue = queue.filter(txn => 
      txn.status === 'queued' || txn.status === 'processing'
    );
    await AsyncStorage.setItem(this.QUEUE_STORAGE_KEY, JSON.stringify(activeQueue));
  }

  private async storeTopUpFlow(flowId: string, flow: TopUpAndSendFlow): Promise<void> {
    const flows = await this.getTopUpFlows();
    flows[flowId] = flow;
    await AsyncStorage.setItem(this.TOPUP_FLOWS_KEY, JSON.stringify(flows));
  }

  private async getTopUpFlow(flowId: string): Promise<TopUpAndSendFlow | null> {
    const flows = await this.getTopUpFlows();
    return flows[flowId] || null;
  }

  private async getTopUpFlows(): Promise<Record<string, TopUpAndSendFlow>> {
    try {
      const flowsData = await AsyncStorage.getItem(this.TOPUP_FLOWS_KEY);
      return flowsData ? JSON.parse(flowsData) : {};
    } catch {
      return {};
    }
  }

  private async removeTopUpFlow(flowId: string): Promise<void> {
    const flows = await this.getTopUpFlows();
    delete flows[flowId];
    await AsyncStorage.setItem(this.TOPUP_FLOWS_KEY, JSON.stringify(flows));
  }

  private async storeIdempotencyCheck(key: string, check: IdempotencyCheck): Promise<void> {
    const checks = await this.getIdempotencyChecks();
    checks[key] = check;
    await AsyncStorage.setItem(this.IDEMPOTENCY_KEY, JSON.stringify(checks));
  }

  private async getIdempotencyCheck(key: string): Promise<IdempotencyCheck | null> {
    const checks = await this.getIdempotencyChecks();
    return checks[key] || null;
  }

  private async getIdempotencyChecks(): Promise<Record<string, IdempotencyCheck>> {
    try {
      const checksData = await AsyncStorage.getItem(this.IDEMPOTENCY_KEY);
      return checksData ? JSON.parse(checksData) : {};
    } catch {
      return {};
    }
  }

  private scheduleRetry(queueId: string, attemptNumber: number = 0): void {
    const delay = this.RETRY_DELAY_BASE * Math.pow(2, attemptNumber); // Exponential backoff
    
    setTimeout(async () => {
      try {
        const queue = await this.getQueue();
        const transaction = queue.find(txn => txn.id === queueId);
        
        if (transaction && transaction.status === 'queued') {
          // In a real app, this would trigger the retry mechanism
          console.log(`🔄 Retrying transaction: ${queueId}`);
        }
      } catch (error) {
        console.error(`Failed to retry transaction ${queueId}:`, error);
      }
    }, delay);
  }

  private async simulateTransactionProcessing(transaction: QueuedTransaction): Promise<boolean> {
    // Simulate network delay and random success/failure
    await new Promise(resolve => setTimeout(resolve, 1000));
    return Math.random() > 0.3; // 70% success rate
  }

  private hashString(input: string): string {
    let hash = 0;
    for (let i = 0; i < input.length; i++) {
      const char = input.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return Math.abs(hash).toString(36);
  }

  private async logEdgeCaseEvent(userId: string, eventType: string, metadata: any): Promise<void> {
    try {
      await databases.createDocument(
        APPWRITE_CONFIG.databaseId,
        APPWRITE_CONFIG.collections.securityEvents,
        `edge_${eventType}_${userId}_${Date.now()}`,
        {
          userId,
          eventType: `edge_case_${eventType}`,
          description: `Edge case handled: ${eventType}`,
          severity: 'medium',
          metadata: JSON.stringify(metadata),
          ipAddress: 'app_client',
          timestamp: new Date().toISOString()
        }
      );
    } catch (error) {
      console.error('Failed to log edge case event:', error);
    }
  }
}

export const edgeCaseHandler = new EdgeCaseHandler();
export default EdgeCaseHandler;
