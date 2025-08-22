import { databases } from './AppwriteService';
import { APPWRITE_CONFIG } from '../config/api';
import { Query } from 'appwrite';
import { digestStringAsync, CryptoDigestAlgorithm } from 'expo-crypto';

interface AMLScreeningRequest {
  userId: string;
  transactionId: string;
  amount: number;
  recipientDetails: {
    name: string;
    accountNumber?: string;
    bankCode?: string;
    phoneNumber?: string;
  };
  senderDetails: {
    name: string;
    phoneNumber: string;
    address?: string;
  };
}

interface AMLScreeningResult {
  status: 'clear' | 'flagged' | 'blocked';
  riskScore: number;
  flags: string[];
  reference: string;
  details?: any;
}

interface AuditLogEntry {
  eventId: string;
  userId: string;
  eventType: string;
  description: string;
  metadata: any;
  ipAddress?: string;
  userAgent?: string;
  timestamp: Date;
  severity: 'low' | 'medium' | 'high' | 'critical';
  hash: string; // For immutability verification
}

class ComplianceService {
  private databases = databases;
  private amlApiUrl: string;
  private amlApiKey: string;

  // Compliance thresholds
  private readonly AML_THRESHOLD = 5000000; // ₦50,000 in kobo
  private readonly DAILY_LIMIT_TIER1 = 5000000; // ₦50,000
  private readonly DAILY_LIMIT_TIER2 = 20000000; // ₦200,000
  private readonly DAILY_LIMIT_TIER3 = 100000000; // ₦1,000,000
  private readonly MONTHLY_LIMIT_TIER1 = 100000000; // ₦1,000,000
  private readonly MONTHLY_LIMIT_TIER2 = 500000000; // ₦5,000,000
  private readonly MONTHLY_LIMIT_TIER3 = 2000000000; // ₦20,000,000

  constructor() {
    // AML API configuration (replace with actual service)
    this.amlApiUrl = process.env.AML_API_URL || 'https://api.aml-provider.com/v1';
    this.amlApiKey = process.env.AML_API_KEY || '';
  }

  /**
   * Generate unique ID for events
   */
  private generateId(): string {
    return `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * AML Screening for transactions ≥ ₦50,000
   */
  async performAMLScreening(request: AMLScreeningRequest): Promise<AMLScreeningResult> {
    try {
      console.log(`🔍 AML Screening for transaction: ${request.transactionId} (₦${request.amount / 100})`);

      // Skip if below threshold
      if (request.amount < this.AML_THRESHOLD) {
        return {
          status: 'clear',
          riskScore: 0,
          flags: [],
          reference: `aml_${Date.now()}_skip`,
          details: { reason: 'Below AML threshold' }
        };
      }

      // Call third-party AML API
      const amlResponse = await this.callAMLAPI({
        transaction_id: request.transactionId,
        amount: request.amount,
        sender: request.senderDetails,
        recipient: request.recipientDetails,
        timestamp: new Date().toISOString()
      });

      // Process AML response
      const result: AMLScreeningResult = {
        status: amlResponse.risk_level === 'high' ? 'blocked' : 
                amlResponse.risk_level === 'medium' ? 'flagged' : 'clear',
        riskScore: amlResponse.risk_score || 0,
        flags: amlResponse.flags || [],
        reference: amlResponse.reference || `aml_${Date.now()}`,
        details: amlResponse
      };

      // Log AML screening
      await this.createAuditLog({
        eventId: this.generateId(),
        userId: request.userId,
        eventType: 'aml_screening',
        description: `AML screening completed: ${result.status}`,
        metadata: {
          transactionId: request.transactionId,
          amount: request.amount,
          riskScore: result.riskScore,
          flags: result.flags,
          amlReference: result.reference
        },
        severity: result.status === 'blocked' ? 'critical' : 
                 result.status === 'flagged' ? 'high' : 'low',
        timestamp: new Date()
      });

      return result;
    } catch (error) {
      console.error('AML screening failed:', error);
      
      // Fail-safe: flag for manual review
      return {
        status: 'flagged',
        riskScore: 50,
        flags: ['aml_api_error'],
        reference: `aml_error_${Date.now()}`,
        details: { error: error instanceof Error ? error.message : 'Unknown error' }
      };
    }
  }

  /**
   * Check daily spending limits with rolling window
   */
  async checkDailyLimit(userId: string, amount: number, userTier: string): Promise<{
    allowed: boolean;
    currentSpent: number;
    dailyLimit: number;
    remainingLimit: number;
  }> {
    try {
      // Get user's daily limit based on tier
      const dailyLimit = this.getDailyLimitByTier(userTier);
      
      // Calculate rolling 24-hour window
      const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
      
      // Query transactions in the last 24 hours
      const transactions = await databases.listDocuments(
        APPWRITE_CONFIG.databaseId,
        APPWRITE_CONFIG.collections.transactions,
        [
          Query.equal('userId', userId),
          Query.equal('status', 'completed'),
          Query.greaterThan('$createdAt', twentyFourHoursAgo.toISOString()),
          Query.contains('type', ['transfer', 'bank_transfer', 'bill_payment'])
        ]
      );

      // Calculate total spent in last 24 hours
      const currentSpent = transactions.documents.reduce((total, txn) => {
        return total + (txn.amount || 0);
      }, 0);

      const remainingLimit = Math.max(0, dailyLimit - currentSpent);
      const allowed = (currentSpent + amount) <= dailyLimit;

      // Log limit check
      await this.createAuditLog({
        eventId: crypto.randomUUID(),
        userId,
        eventType: 'daily_limit_check',
        description: `Daily limit check: ${allowed ? 'ALLOWED' : 'BLOCKED'}`,
        metadata: {
          amount,
          currentSpent,
          dailyLimit,
          remainingLimit,
          userTier,
          transactionCount: transactions.documents.length
        },
        severity: allowed ? 'low' : 'medium',
        timestamp: new Date()
      });

      return {
        allowed,
        currentSpent,
        dailyLimit,
        remainingLimit
      };
    } catch (error) {
      console.error('Daily limit check failed:', error);
      // Fail-safe: block transaction
      return {
        allowed: false,
        currentSpent: 0,
        dailyLimit: 0,
        remainingLimit: 0
      };
    }
  }

  /**
   * Check monthly spending limits
   */
  async checkMonthlyLimit(userId: string, amount: number, userTier: string): Promise<{
    allowed: boolean;
    currentSpent: number;
    monthlyLimit: number;
    remainingLimit: number;
  }> {
    try {
      const monthlyLimit = this.getMonthlyLimitByTier(userTier);
      
      // Calculate current month window
      const now = new Date();
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      
      const transactions = await databases.listDocuments(
        APPWRITE_CONFIG.databaseId,
        APPWRITE_CONFIG.collections.transactions,
        [
          Query.equal('userId', userId),
          Query.equal('status', 'completed'),
          Query.greaterThan('$createdAt', startOfMonth.toISOString()),
          Query.contains('type', ['transfer', 'bank_transfer', 'bill_payment'])
        ]
      );

      const currentSpent = transactions.documents.reduce((total, txn) => {
        return total + (txn.amount || 0);
      }, 0);

      const remainingLimit = Math.max(0, monthlyLimit - currentSpent);
      const allowed = (currentSpent + amount) <= monthlyLimit;

      return {
        allowed,
        currentSpent,
        monthlyLimit,
        remainingLimit
      };
    } catch (error) {
      console.error('Monthly limit check failed:', error);
      return {
        allowed: false,
        currentSpent: 0,
        monthlyLimit: 0,
        remainingLimit: 0
      };
    }
  }

  /**
   * Create immutable audit log entry
   */
  async createAuditLog(entry: Omit<AuditLogEntry, 'hash'>): Promise<string> {
    try {
      // Create hash for immutability
      const dataToHash = JSON.stringify({
        eventId: entry.eventId,
        userId: entry.userId,
        eventType: entry.eventType,
        description: entry.description,
        metadata: entry.metadata,
        timestamp: entry.timestamp.toISOString()
      });
      
      const hash = await digestStringAsync(CryptoDigestAlgorithm.SHA256, dataToHash);
      
      const auditEntry = {
        ...entry,
        hash,
        timestamp: entry.timestamp.toISOString()
      };

      await this.databases.createDocument(
        APPWRITE_CONFIG.databaseId,
        'audit_logs', // Need to add this collection
        entry.eventId,
        auditEntry
      );

      return hash;
    } catch (error) {
      console.error('Failed to create audit log:', error);
      throw error;
    }
  }

  /**
   * Verify audit log integrity
   */
  async verifyAuditLogIntegrity(eventId: string): Promise<boolean> {
    try {
      const log = await this.databases.getDocument(
        APPWRITE_CONFIG.databaseId,
        'audit_logs',
        eventId
      );

      // Recreate hash
      const dataToHash = JSON.stringify({
        eventId: log.eventId,
        userId: log.userId,
        eventType: log.eventType,
        description: log.description,
        metadata: log.metadata,
        timestamp: log.timestamp
      });

      const expectedHash = await digestStringAsync(CryptoDigestAlgorithm.SHA256, dataToHash);
      
      return log.hash === expectedHash;
    } catch (error) {
      console.error('Audit log verification failed:', error);
      return false;
    }
  }

  /**
   * Run comprehensive compliance check
   */
  async runComplianceCheck(
    userId: string,
    transactionId: string,
    amount: number,
    userTier: string,
    senderDetails: any,
    recipientDetails: any
  ): Promise<{
    allowed: boolean;
    issues: string[];
    amlResult?: AMLScreeningResult;
    dailyLimitCheck?: any;
    monthlyLimitCheck?: any;
  }> {
    const issues: string[] = [];

    try {
      // 1. Daily limit check
      const dailyLimitCheck = await this.checkDailyLimit(userId, amount, userTier);
      if (!dailyLimitCheck.allowed) {
        issues.push(`Daily limit exceeded. Remaining: ₦${dailyLimitCheck.remainingLimit / 100}`);
      }

      // 2. Monthly limit check
      const monthlyLimitCheck = await this.checkMonthlyLimit(userId, amount, userTier);
      if (!monthlyLimitCheck.allowed) {
        issues.push(`Monthly limit exceeded. Remaining: ₦${monthlyLimitCheck.remainingLimit / 100}`);
      }

      // 3. AML screening for large transactions
      let amlResult: AMLScreeningResult | undefined;
      if (amount >= this.AML_THRESHOLD) {
        amlResult = await this.performAMLScreening({
          userId,
          transactionId,
          amount,
          senderDetails,
          recipientDetails
        });

        if (amlResult.status === 'blocked') {
          issues.push('Transaction blocked by AML screening');
        } else if (amlResult.status === 'flagged') {
          issues.push('Transaction flagged for manual review');
        }
      }

      const allowed = issues.length === 0 || (amlResult?.status === 'flagged' && issues.length === 1);

      return {
        allowed,
        issues,
        amlResult,
        dailyLimitCheck,
        monthlyLimitCheck
      };
    } catch (error) {
      console.error('Compliance check failed:', error);
      return {
        allowed: false,
        issues: ['Compliance check failed - transaction blocked for safety'],
      };
    }
  }

  /**
   * Call external AML API
   */
  private async callAMLAPI(data: any): Promise<any> {
    if (!this.amlApiKey) {
      // Mock response for development
      return {
        risk_level: data.amount > 10000000 ? 'medium' : 'low', // ₦100k threshold
        risk_score: Math.min(data.amount / 1000000, 100), // Score based on amount
        flags: data.amount > 10000000 ? ['high_value'] : [],
        reference: `mock_aml_${Date.now()}`
      };
    }

    const response = await fetch(`${this.amlApiUrl}/screen`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.amlApiKey}`,
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      throw new Error(`AML API error: ${response.status}`);
    }

    return response.json();
  }

  /**
   * Get daily limit based on user tier
   */
  private getDailyLimitByTier(tier: string): number {
    switch (tier) {
      case 'tier1': return this.DAILY_LIMIT_TIER1;
      case 'tier2': return this.DAILY_LIMIT_TIER2;
      case 'tier3': return this.DAILY_LIMIT_TIER3;
      default: return this.DAILY_LIMIT_TIER1;
    }
  }

  /**
   * Get monthly limit based on user tier
   */
  private getMonthlyLimitByTier(tier: string): number {
    switch (tier) {
      case 'tier1': return this.MONTHLY_LIMIT_TIER1;
      case 'tier2': return this.MONTHLY_LIMIT_TIER2;
      case 'tier3': return this.MONTHLY_LIMIT_TIER3;
      default: return this.MONTHLY_LIMIT_TIER1;
    }
  }
}

export default ComplianceService;
