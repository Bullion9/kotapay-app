import { databases } from './AppwriteService';
import { APPWRITE_CONFIG } from '../config/api';
import { Query } from 'appwrite';

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

interface ComplianceCheckResult {
  allowed: boolean;
  issues: string[];
  amlResult?: AMLScreeningResult;
  dailyLimitCheck?: any;
  monthlyLimitCheck?: any;
}

class ComplianceService {
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
    this.amlApiUrl = process.env.AML_API_URL || 'https://api.aml-provider.com/v1';
    this.amlApiKey = process.env.AML_API_KEY || '';
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

      // Call third-party AML API (mock implementation)
      const amlResponse = await this.callAMLAPI({
        transaction_id: request.transactionId,
        amount: request.amount,
        sender: request.senderDetails,
        recipient: request.recipientDetails,
        timestamp: new Date().toISOString()
      });

      const result: AMLScreeningResult = {
        status: amlResponse.risk_level === 'high' ? 'blocked' : 
                amlResponse.risk_level === 'medium' ? 'flagged' : 'clear',
        riskScore: amlResponse.risk_score || 0,
        flags: amlResponse.flags || [],
        reference: amlResponse.reference || `aml_${Date.now()}`,
        details: amlResponse
      };

      // Log to security events
      await this.logSecurityEvent(request.userId, 'aml_screening', {
        transactionId: request.transactionId,
        amount: request.amount,
        result: result.status,
        riskScore: result.riskScore
      });

      return result;
    } catch (error) {
      console.error('AML screening failed:', error);
      
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
      const dailyLimit = this.getDailyLimitByTier(userTier);
      const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
      
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

      const currentSpent = transactions.documents.reduce((total, txn) => {
        return total + (txn.amount || 0);
      }, 0);

      const remainingLimit = Math.max(0, dailyLimit - currentSpent);
      const allowed = (currentSpent + amount) <= dailyLimit;

      return {
        allowed,
        currentSpent,
        dailyLimit,
        remainingLimit
      };
    } catch (error) {
      console.error('Daily limit check failed:', error);
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
   * Run comprehensive compliance check
   */
  async runComplianceCheck(
    userId: string,
    transactionId: string,
    amount: number,
    userTier: string,
    senderDetails: any,
    recipientDetails: any
  ): Promise<ComplianceCheckResult> {
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

      // Allow flagged transactions but block others with issues
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
   * Log security event
   */
  private async logSecurityEvent(userId: string, eventType: string, metadata: any): Promise<void> {
    try {
      await databases.createDocument(
        APPWRITE_CONFIG.databaseId,
        APPWRITE_CONFIG.collections.securityEvents,
        `${eventType}_${userId}_${Date.now()}`,
        {
          userId,
          eventType,
          description: `Security event: ${eventType}`,
          severity: 'medium',
          metadata: JSON.stringify(metadata),
          ipAddress: 'app_client',
          timestamp: new Date().toISOString()
        }
      );
    } catch (error) {
      console.error('Failed to log security event:', error);
    }
  }

  /**
   * Call external AML API (mock implementation)
   */
  private async callAMLAPI(data: any): Promise<any> {
    // Mock response for development
    const riskScore = Math.min(data.amount / 1000000, 100); // Score based on amount
    
    return {
      risk_level: data.amount > 10000000 ? 'medium' : 'low', // ₦100k threshold
      risk_score: riskScore,
      flags: data.amount > 10000000 ? ['high_value'] : [],
      reference: `mock_aml_${Date.now()}`
    };
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

export const complianceService = new ComplianceService();
export default ComplianceService;
