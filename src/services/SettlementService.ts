/**
 * KotaPay Settlement & Reconciliation Service
 * 
 * Implements comprehensive settlement and reconciliation features:
 * - Internal ledger management
 * - Bank reconciliation with external statements
 * - Chargeback handling and auto-refunds
 * - Settlement status tracking
 */

import AppwriteService from './AppwriteService';
import { notificationService } from './notifications';
import { walletService } from './WalletService';

export interface LedgerEntry {
  id: string;
  from: string; // userId or 'bank' or 'external'
  to: string;   // userId or 'bank' or 'external'
  amount: number;
  fee: number;
  status: 'pending' | 'completed' | 'failed' | 'reversed';
  type: 'wallet_to_wallet' | 'wallet_to_bank' | 'bank_to_wallet' | 'topup' | 'withdrawal' | 'chargeback';
  reference: string;
  bankReference?: string;
  paystackReference?: string;
  settlementDate?: string;
  createdAt: string;
  updatedAt: string;
}

export interface BankStatement {
  id: string;
  bankReference: string;
  amount: number;
  type: 'credit' | 'debit';
  description: string;
  valueDate: string;
  processingDate: string;
  accountNumber: string;
  status: 'settled' | 'pending' | 'failed';
}

export interface ReconciliationResult {
  totalProcessed: number;
  matched: number;
  unmatched: number;
  discrepancies: number;
  matchedEntries: {
    ledgerEntry: LedgerEntry;
    bankStatement: BankStatement;
    status: 'matched' | 'amount_mismatch' | 'date_mismatch';
  }[];
  unmatchedLedger: LedgerEntry[];
  unmatchedBank: BankStatement[];
}

export interface ChargebackRequest {
  id: string;
  originalTransactionId: string;
  amount: number;
  reason: string;
  disputeDate: string;
  bankReference: string;
  status: 'pending' | 'processed' | 'rejected';
  autoRefunded: boolean;
  refundTransactionId?: string;
  createdAt: string;
}

class SettlementService {
  // Internal Ledger Management
  async createLedgerEntry(entry: Omit<LedgerEntry, 'id' | 'createdAt' | 'updatedAt'>): Promise<LedgerEntry> {
    try {
      const ledgerEntry: LedgerEntry = {
        ...entry,
        id: `ledger_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      // In production, save to transactions collection
      console.log('📊 Ledger entry created:', ledgerEntry);
      
      // Mock storage for development
      await this.saveLedgerEntry(ledgerEntry);
      
      return ledgerEntry;
    } catch (error) {
      console.error('Error creating ledger entry:', error);
      throw error;
    }
  }

  private async saveLedgerEntry(entry: LedgerEntry): Promise<void> {
    try {
      // Save to Appwrite transactions collection
      await AppwriteService.createTransaction({
        userId: entry.from,
        type: entry.amount > 0 ? 'credit' : 'debit',
        amount: Math.abs(entry.amount),
        description: `${entry.type} - ${entry.reference}`,
        reference: entry.reference,
        status: entry.status === 'completed' ? 'successful' : entry.status === 'failed' ? 'failed' : 'pending',
        recipientId: entry.to !== 'bank' && entry.to !== 'external' ? entry.to : undefined,
        paystackReference: entry.paystackReference
      });
    } catch (error) {
      console.error('Error saving ledger entry to database:', error);
      // Fallback to local storage for development
    }
  }

  async getLedgerEntries(filters?: {
    userId?: string;
    status?: string;
    dateFrom?: string;
    dateTo?: string;
    type?: string;
  }): Promise<LedgerEntry[]> {
    try {
      // Mock implementation - in production, query from database with filters
      const mockEntries: LedgerEntry[] = [
        {
          id: 'ledger_001',
          from: 'user123',
          to: 'user456',
          amount: 5000,
          fee: 0,
          status: 'completed',
          type: 'wallet_to_wallet',
          reference: 'tx_internal_001',
          createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
          updatedAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()
        },
        {
          id: 'ledger_002',
          from: 'user123',
          to: 'bank',
          amount: 10000,
          fee: 25,
          status: 'pending',
          type: 'wallet_to_bank',
          reference: 'tx_external_001',
          paystackReference: 'ps_ref_001',
          createdAt: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(),
          updatedAt: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString()
        }
      ];

      // Apply filters
      let filteredEntries = mockEntries;
      
      if (filters?.userId) {
        filteredEntries = filteredEntries.filter(e => e.from === filters.userId || e.to === filters.userId);
      }
      
      if (filters?.status) {
        filteredEntries = filteredEntries.filter(e => e.status === filters.status);
      }
      
      if (filters?.type) {
        filteredEntries = filteredEntries.filter(e => e.type === filters.type);
      }

      return filteredEntries;
    } catch (error) {
      console.error('Error getting ledger entries:', error);
      return [];
    }
  }

  async updateLedgerEntryStatus(entryId: string, status: LedgerEntry['status'], bankReference?: string): Promise<void> {
    try {
      console.log(`📝 Updating ledger entry ${entryId} status to ${status}`);
      
      // In production, update in database
      if (bankReference) {
        console.log(`🏦 Bank reference: ${bankReference}`);
      }

      // Trigger notifications based on status change
      if (status === 'completed') {
        await notificationService.sendSettlementNotification(
          entryId,
          0, // amount would come from database
          '₦',
          'external'
        );
      }
    } catch (error) {
      console.error('Error updating ledger entry status:', error);
    }
  }

  // Bank Reconciliation
  async performReconciliation(bankStatements: BankStatement[]): Promise<ReconciliationResult> {
    console.log('🔄 Starting bank reconciliation process...');
    
    try {
      // Get pending external transactions from ledger
      const pendingTransactions = await this.getLedgerEntries({
        status: 'pending',
        type: 'wallet_to_bank'
      });

      const result: ReconciliationResult = {
        totalProcessed: bankStatements.length,
        matched: 0,
        unmatched: 0,
        discrepancies: 0,
        matchedEntries: [],
        unmatchedLedger: [...pendingTransactions],
        unmatchedBank: [...bankStatements]
      };

      // Match ledger entries with bank statements
      for (const ledgerEntry of pendingTransactions) {
        const matchingStatement = bankStatements.find(statement => 
          statement.bankReference === ledgerEntry.paystackReference ||
          statement.description.includes(ledgerEntry.reference) ||
          (Math.abs(statement.amount - ledgerEntry.amount) < 1) // Allow small rounding differences
        );

        if (matchingStatement) {
          let matchStatus: 'matched' | 'amount_mismatch' | 'date_mismatch' = 'matched';
          
          // Check for discrepancies
          if (Math.abs(matchingStatement.amount - ledgerEntry.amount) > 0.01) {
            matchStatus = 'amount_mismatch';
            result.discrepancies++;
          }

          result.matchedEntries.push({
            ledgerEntry,
            bankStatement: matchingStatement,
            status: matchStatus
          });

          // Remove from unmatched lists
          result.unmatchedLedger = result.unmatchedLedger.filter(e => e.id !== ledgerEntry.id);
          result.unmatchedBank = result.unmatchedBank.filter(s => s.id !== matchingStatement.id);

          // Update ledger entry status
          await this.updateLedgerEntryStatus(
            ledgerEntry.id, 
            'completed',
            matchingStatement.bankReference
          );

          result.matched++;
          
          console.log(`✅ Matched: ${ledgerEntry.reference} with ${matchingStatement.bankReference}`);
        }
      }

      result.unmatched = result.unmatchedLedger.length + result.unmatchedBank.length;

      console.log('📊 Reconciliation completed:', {
        total: result.totalProcessed,
        matched: result.matched,
        unmatched: result.unmatched,
        discrepancies: result.discrepancies
      });

      // Send reconciliation report
      await this.sendReconciliationReport(result);

      return result;
    } catch (error) {
      console.error('Error during reconciliation:', error);
      throw error;
    }
  }

  private async sendReconciliationReport(result: ReconciliationResult): Promise<void> {
    const reportData = {
      date: new Date().toISOString().split('T')[0],
      summary: {
        totalProcessed: result.totalProcessed,
        matched: result.matched,
        unmatched: result.unmatched,
        discrepancies: result.discrepancies,
        successRate: `${((result.matched / result.totalProcessed) * 100).toFixed(1)}%`
      },
      details: result
    };

    console.log('📧 Reconciliation report:', reportData);
    
    // In production, send to finance team
    await notificationService.sendEmailNotification({
      transactionId: 'reconciliation_report',
      emailSubject: 'Daily Reconciliation Report',
      senderName: 'KotaPay Settlement System',
      message: `Reconciliation completed: ${result.matched}/${result.totalProcessed} transactions matched`
    });
  }

  // Chargeback Handling
  async processChargeback(chargebackData: {
    originalTransactionId: string;
    amount: number;
    reason: string;
    bankReference: string;
  }): Promise<ChargebackRequest> {
    console.log('🔄 Processing chargeback:', chargebackData);

    try {
      const chargeback: ChargebackRequest = {
        id: `chargeback_${Date.now()}`,
        originalTransactionId: chargebackData.originalTransactionId,
        amount: chargebackData.amount,
        reason: chargebackData.reason,
        disputeDate: new Date().toISOString(),
        bankReference: chargebackData.bankReference,
        status: 'pending',
        autoRefunded: false,
        createdAt: new Date().toISOString()
      };

      // Find original transaction
      const originalTransaction = await this.findTransactionByReference(chargebackData.originalTransactionId);
      
      if (originalTransaction) {
        // Auto-refund to user's wallet
        const refundResult = await this.processAutoRefund(originalTransaction, chargeback);
        
        if (refundResult.success) {
          chargeback.autoRefunded = true;
          chargeback.refundTransactionId = refundResult.transactionId;
          chargeback.status = 'processed';
          
          console.log('✅ Chargeback auto-refunded successfully');
          
          // Create reversal ledger entry
          await this.createLedgerEntry({
            from: 'bank',
            to: originalTransaction.from,
            amount: chargebackData.amount,
            fee: 0,
            status: 'completed',
            type: 'chargeback',
            reference: `chargeback_${chargeback.id}`,
            bankReference: chargebackData.bankReference
          });

          // Send notification to user
          await notificationService.sendChargebackNotification(
            chargebackData.originalTransactionId,
            chargebackData.amount,
            chargebackData.reason
          );
        } else {
          chargeback.status = 'rejected';
          console.error('❌ Auto-refund failed:', refundResult.error);
        }
      } else {
        chargeback.status = 'rejected';
        console.error('❌ Original transaction not found');
      }

      // Save chargeback record
      await this.saveChargebackRecord(chargeback);

      return chargeback;
    } catch (error) {
      console.error('Error processing chargeback:', error);
      throw error;
    }
  }

  private async findTransactionByReference(reference: string): Promise<LedgerEntry | null> {
    try {
      const entries = await this.getLedgerEntries();
      return entries.find(e => e.reference === reference) || null;
    } catch (error) {
      console.error('Error finding transaction:', error);
      return null;
    }
  }

  private async processAutoRefund(
    originalTransaction: LedgerEntry, 
    chargeback: ChargebackRequest
  ): Promise<{ success: boolean; transactionId?: string; error?: string }> {
    try {
      // Credit user's wallet with refund amount
      const refundTransaction = await AppwriteService.createTransaction({
        userId: originalTransaction.from,
        type: 'credit',
        amount: chargeback.amount,
        description: `Chargeback refund for ${originalTransaction.reference}`,
        reference: `refund_${chargeback.id}`,
        status: 'successful'
      });

      // Update user's wallet balance
      await walletService.handlePaymentWebhook(
        `chargeback_${chargeback.id}`,
        'success'
      );

      console.log('💰 Auto-refund processed successfully');
      
      return {
        success: true,
        transactionId: refundTransaction.$id
      };
    } catch (error) {
      console.error('Auto-refund failed:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  private async saveChargebackRecord(chargeback: ChargebackRequest): Promise<void> {
    try {
      // In production, save to dedicated chargebacks collection
      console.log('💾 Chargeback record saved:', chargeback.id);
      
      // For now, log to console and store locally
      await this.logSecurityEvent('chargeback_processed', chargeback);
    } catch (error) {
      console.error('Error saving chargeback record:', error);
    }
  }

  private async logSecurityEvent(eventType: string, details: any): Promise<void> {
    const securityEvent = {
      eventType,
      timestamp: new Date().toISOString(),
      details,
      severity: eventType.includes('chargeback') ? 'high' : 'medium'
    };
    
    console.log('🔒 Security event logged:', securityEvent);
  }

  // Settlement Status Tracking
  async getSettlementStatus(reference: string): Promise<{
    status: 'pending' | 'processing' | 'settled' | 'failed';
    estimatedSettlement?: string;
    actualSettlement?: string;
    bankReference?: string;
  }> {
    try {
      const entries = await this.getLedgerEntries();
      const entry = entries.find(e => e.reference === reference);
      
      if (!entry) {
        return { status: 'failed' };
      }

      let status: 'pending' | 'processing' | 'settled' | 'failed';
      switch (entry.status) {
        case 'pending':
          status = 'pending';
          break;
        case 'completed':
          status = 'settled';
          break;
        case 'failed':
          status = 'failed';
          break;
        default:
          status = 'processing';
      }

      return {
        status,
        estimatedSettlement: entry.settlementDate,
        actualSettlement: entry.status === 'completed' ? entry.updatedAt : undefined,
        bankReference: entry.bankReference
      };
    } catch (error) {
      console.error('Error getting settlement status:', error);
      return { status: 'failed' };
    }
  }

  // Cron Job Functions (to be called by scheduled tasks)
  async runNightlyReconciliation(): Promise<void> {
    console.log('🌙 Starting nightly reconciliation...');
    
    try {
      // Mock bank statements - in production, fetch from bank API
      const mockBankStatements: BankStatement[] = [
        {
          id: 'bank_001',
          bankReference: 'ps_ref_001',
          amount: 10000,
          type: 'debit',
          description: 'PAYSTACK TRANSFER tx_external_001',
          valueDate: new Date().toISOString(),
          processingDate: new Date().toISOString(),
          accountNumber: '1234567890',
          status: 'settled'
        }
      ];

      await this.performReconciliation(mockBankStatements);
      
      console.log('✅ Nightly reconciliation completed successfully');
    } catch (error) {
      console.error('❌ Nightly reconciliation failed:', error);
      
      // Send alert to operations team
      await notificationService.sendSecurityAlert(
        'reconciliation_failed',
        'Nightly reconciliation process failed',
        { error: error instanceof Error ? error.message : 'Unknown error' }
      );
    }
  }

  async processSettlementQueue(): Promise<void> {
    console.log('⚡ Processing settlement queue...');
    
    try {
      const pendingTransactions = await this.getLedgerEntries({
        status: 'pending',
        type: 'wallet_to_bank'
      });

      for (const transaction of pendingTransactions) {
        // Check if settlement window has passed (next business day)
        const settlementDate = new Date(transaction.createdAt);
        settlementDate.setDate(settlementDate.getDate() + 1);
        
        if (new Date() >= settlementDate) {
          console.log(`⏰ Processing settlement for ${transaction.reference}`);
          
          // In production, trigger bank transfer via payment provider
          // For now, simulate successful settlement
          await this.updateLedgerEntryStatus(transaction.id, 'completed');
        }
      }
      
      console.log('✅ Settlement queue processed');
    } catch (error) {
      console.error('❌ Settlement queue processing failed:', error);
    }
  }
}

export const settlementService = new SettlementService();
export default settlementService;
