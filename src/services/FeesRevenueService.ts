/**
 * KotaPay Fees & Revenue Management Service
 * 
 * Manages transaction fees, revenue calculation, and fee splitting
 */

export interface FeeStructure {
  serviceType: 'wallet_to_wallet' | 'wallet_to_bank_instant' | 'card_topup' | 'bill_payment' | 'airtime_purchase';
  feeType: 'fixed' | 'percentage' | 'tiered';
  amount?: number; // Fixed fee amount in kobo
  percentage?: number; // Percentage fee (e.g., 1.5 for 1.5%)
  minFee?: number; // Minimum fee in kobo
  maxFee?: number; // Maximum fee in kobo
  revenueShare?: RevenueShare;
}

export interface RevenueShare {
  kotapay: number; // Percentage going to KotaPay
  partner: number; // Percentage going to partner (bank/payment processor)
  partnerName: string; // Name of the partner
}

export interface FeeCalculationResult {
  transactionAmount: number;
  feeAmount: number;
  totalAmount: number;
  revenueBreakdown: {
    kotapayRevenue: number;
    partnerRevenue: number;
    partnerName: string;
  };
  feeDescription: string;
}

export interface RevenueRecord {
  id: string;
  transactionId: string;
  serviceType: string;
  transactionAmount: number;
  feeAmount: number;
  kotapayRevenue: number;
  partnerRevenue: number;
  partnerName: string;
  date: string;
  status: 'pending' | 'settled' | 'disputed';
}

class FeesRevenueService {
  private feeStructures: Map<string, FeeStructure> = new Map();

  constructor() {
    this.initializeFeeStructures();
  }

  private initializeFeeStructures(): void {
    // Wallet-to-wallet transfers - Free
    this.feeStructures.set('wallet_to_wallet', {
      serviceType: 'wallet_to_wallet',
      feeType: 'fixed',
      amount: 0,
      revenueShare: {
        kotapay: 100,
        partner: 0,
        partnerName: 'none'
      }
    });

    // Wallet-to-bank instant transfers - ₦25 fixed fee
    this.feeStructures.set('wallet_to_bank_instant', {
      serviceType: 'wallet_to_bank_instant',
      feeType: 'fixed',
      amount: 2500, // ₦25 in kobo
      revenueShare: {
        kotapay: 60, // 60% to KotaPay
        partner: 40, // 40% to bank
        partnerName: 'partner_bank'
      }
    });

    // Card top-up - 1.5% fee
    this.feeStructures.set('card_topup', {
      serviceType: 'card_topup',
      feeType: 'percentage',
      percentage: 1.5,
      minFee: 1000, // Minimum ₦10
      maxFee: 200000, // Maximum ₦2000
      revenueShare: {
        kotapay: 30, // 30% to KotaPay (interchange share)
        partner: 70, // 70% to payment processor
        partnerName: 'paystack'
      }
    });

    // Bill payment - Tiered fees
    this.feeStructures.set('bill_payment', {
      serviceType: 'bill_payment',
      feeType: 'fixed',
      amount: 5000, // ₦50 convenience fee
      revenueShare: {
        kotapay: 80,
        partner: 20,
        partnerName: 'bill_aggregator'
      }
    });

    // Airtime purchase - Free to encourage usage
    this.feeStructures.set('airtime_purchase', {
      serviceType: 'airtime_purchase',
      feeType: 'fixed',
      amount: 0,
      revenueShare: {
        kotapay: 100,
        partner: 0,
        partnerName: 'telecom_provider'
      }
    });

    console.log('📊 Fee structures initialized:', Array.from(this.feeStructures.keys()));
  }

  calculateFee(serviceType: string, transactionAmount: number): FeeCalculationResult {
    const feeStructure = this.feeStructures.get(serviceType);
    
    if (!feeStructure) {
      throw new Error(`Fee structure not found for service type: ${serviceType}`);
    }

    let feeAmount = 0;
    let feeDescription = '';

    switch (feeStructure.feeType) {
      case 'fixed':
        feeAmount = feeStructure.amount || 0;
        feeDescription = feeAmount === 0 
          ? 'Free transaction' 
          : `Fixed fee: ₦${(feeAmount / 100).toFixed(2)}`;
        break;

      case 'percentage':
        const percentageFee = (transactionAmount * (feeStructure.percentage || 0)) / 100;
        feeAmount = Math.max(
          feeStructure.minFee || 0,
          Math.min(percentageFee, feeStructure.maxFee || percentageFee)
        );
        feeDescription = `${feeStructure.percentage}% fee (min ₦${((feeStructure.minFee || 0) / 100).toFixed(2)}, max ₦${((feeStructure.maxFee || 0) / 100).toFixed(2)})`;
        break;

      case 'tiered':
        // Implement tiered fee logic based on amount ranges
        feeAmount = this.calculateTieredFee(transactionAmount);
        feeDescription = 'Tiered fee based on amount';
        break;

      default:
        throw new Error(`Unsupported fee type: ${feeStructure.feeType}`);
    }

    // Calculate revenue breakdown
    const kotapayRevenue = (feeAmount * (feeStructure.revenueShare?.kotapay || 100)) / 100;
    const partnerRevenue = (feeAmount * (feeStructure.revenueShare?.partner || 0)) / 100;

    return {
      transactionAmount,
      feeAmount,
      totalAmount: transactionAmount + feeAmount,
      revenueBreakdown: {
        kotapayRevenue,
        partnerRevenue,
        partnerName: feeStructure.revenueShare?.partnerName || 'none'
      },
      feeDescription
    };
  }

  private calculateTieredFee(amount: number): number {
    // Tiered fee structure example:
    // 0 - 10,000: ₦10
    // 10,001 - 50,000: ₦25
    // 50,001+: ₦50
    
    if (amount <= 1000000) { // ₦10,000
      return 1000; // ₦10
    } else if (amount <= 5000000) { // ₦50,000
      return 2500; // ₦25
    } else {
      return 5000; // ₦50
    }
  }

  async recordRevenue(transactionId: string, feeCalculation: FeeCalculationResult, serviceType: string): Promise<RevenueRecord> {
    const revenueRecord: RevenueRecord = {
      id: `rev_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      transactionId,
      serviceType,
      transactionAmount: feeCalculation.transactionAmount,
      feeAmount: feeCalculation.feeAmount,
      kotapayRevenue: feeCalculation.revenueBreakdown.kotapayRevenue,
      partnerRevenue: feeCalculation.revenueBreakdown.partnerRevenue,
      partnerName: feeCalculation.revenueBreakdown.partnerName,
      date: new Date().toISOString(),
      status: 'pending'
    };

    // In production, save to database
    console.log('💰 Revenue recorded:', {
      id: revenueRecord.id,
      kotapayRevenue: `₦${(revenueRecord.kotapayRevenue / 100).toFixed(2)}`,
      partnerRevenue: `₦${(revenueRecord.partnerRevenue / 100).toFixed(2)}`,
      partner: revenueRecord.partnerName
    });

    return revenueRecord;
  }

  getRevenueAnalytics(dateFrom: string, dateTo: string): {
    totalRevenue: number;
    kotapayRevenue: number;
    partnerRevenue: number;
    transactionCount: number;
    revenueByService: Map<string, number>;
  } {
    // Mock analytics - in production, query from database
    const mockAnalytics = {
      totalRevenue: 125000, // ₦1,250
      kotapayRevenue: 87500, // ₦875
      partnerRevenue: 37500, // ₦375
      transactionCount: 150,
      revenueByService: new Map([
        ['wallet_to_bank_instant', 75000], // ₦750
        ['card_topup', 35000], // ₦350
        ['bill_payment', 15000] // ₦150
      ])
    };

    console.log('📈 Revenue Analytics:', {
      period: `${dateFrom} to ${dateTo}`,
      total: `₦${(mockAnalytics.totalRevenue / 100).toFixed(2)}`,
      kotapay: `₦${(mockAnalytics.kotapayRevenue / 100).toFixed(2)}`,
      partners: `₦${(mockAnalytics.partnerRevenue / 100).toFixed(2)}`
    });

    return mockAnalytics;
  }

  updateFeeStructure(serviceType: string, newStructure: Partial<FeeStructure>): void {
    const currentStructure = this.feeStructures.get(serviceType);
    
    if (!currentStructure) {
      throw new Error(`Service type not found: ${serviceType}`);
    }

    const updatedStructure = { ...currentStructure, ...newStructure };
    this.feeStructures.set(serviceType, updatedStructure);
    
    console.log(`💼 Fee structure updated for ${serviceType}:`, updatedStructure);
  }

  getAllFeeStructures(): FeeStructure[] {
    return Array.from(this.feeStructures.values());
  }

  estimateTransactionCost(serviceType: string, amount: number): {
    fee: number;
    total: number;
    description: string;
  } {
    const calculation = this.calculateFee(serviceType, amount);
    
    return {
      fee: calculation.feeAmount,
      total: calculation.totalAmount,
      description: calculation.feeDescription
    };
  }

  // Partner revenue settlement
  async processPartnerPayouts(partner: string, dateFrom: string, dateTo: string): Promise<{
    totalAmount: number;
    transactionCount: number;
    payoutReference: string;
  }> {
    // Mock partner payout processing
    const mockPayout = {
      totalAmount: 37500, // ₦375
      transactionCount: 50,
      payoutReference: `payout_${partner}_${Date.now()}`
    };

    console.log(`💸 Partner payout processed for ${partner}:`, {
      amount: `₦${(mockPayout.totalAmount / 100).toFixed(2)}`,
      transactions: mockPayout.transactionCount,
      reference: mockPayout.payoutReference
    });

    return mockPayout;
  }
}

export const feesRevenueService = new FeesRevenueService();
export default feesRevenueService;
