import API_CONFIG, { API_HEADERS } from '../config/api';

// Types for Paystack API - Updated based on your backend API
export interface PaymentData {
  email: string;
  amount: number; // Amount in kobo (100 = ₦1)
  currency?: string; // Default: "NGN"
  reference?: string; // Optional: auto-generated if not provided
  callback_url?: string;
  metadata?: Record<string, any>;
}

export interface TransferRecipientData {
  type: "nuban" | "mobile_money";
  name: string;
  account_number: string;
  bank_code: string;
  currency?: string; // Default: "NGN"
}

export interface TransferData {
  source: string; // Usually "balance"
  amount: number; // Amount in kobo
  recipient: string; // Recipient code from create-transfer-recipient
  reason?: string;
  currency?: string; // Default: "NGN"
  reference?: string; // Optional: auto-generated if not provided
}

export interface Bank {
  name: string;
  slug: string;
  code: string;
  longcode: string;
  gateway: string;
  pay_with_bank: boolean;
  active: boolean;
  country: string;
  currency: string;
  type: string;
}

export interface PaymentResponse {
  success: true;
  data: {
    authorization_url: string;
    access_code: string;
    reference: string;
  };
}

export interface VerificationResponse {
  success: true;
  data: {
    status: string;
    reference: string;
    amount: number;
    currency: string;
    transaction_date: string;
    customer: {
      email: string;
    };
    // Additional fields from Paystack
    id?: number;
    domain?: string;
    message?: string;
    gateway_response?: string;
    paid_at?: string;
    created_at?: string;
    channel?: string;
    ip_address?: string;
    metadata?: any;
    log?: any;
    fees?: number;
    authorization?: any;
    plan?: any;
    requested_amount?: number;
  };
}

export interface AccountResolutionResponse {
  success: true;
  data: {
    account_number: string;
    account_name: string;
    bank_id: number;
  };
}

export interface TransactionHistoryResponse {
  success: true;
  data: any[];
  meta: {
    total: number;
    skipped: number;
    perPage: number;
    page: number;
    pageCount: number;
  };
}

export interface ApiError {
  success: false;
  error: string;
  code?: string;
  details?: string;
}

class PaystackService {
  private baseURL = API_CONFIG.baseURL;
  
  // Helper method for making API requests with error handling
  private async makeRequest<T>(
    endpoint: string, 
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseURL}${endpoint}`;
    
    try {
      const response = await fetch(url, {
        ...options,
        headers: {
          ...API_HEADERS,
          ...options.headers,
        },
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          errorData.message || 
          `HTTP ${response.status}: ${response.statusText}`
        );
      }

      return await response.json();
    } catch (error) {
      console.error(`API Request failed for ${endpoint}:`, error);
      throw error;
    }
  }

  // Health check
  async checkHealth(): Promise<any> {
    try {
      const response = await fetch(API_CONFIG.healthURL);
      return await response.json();
    } catch (error) {
      console.error('Health check failed:', error);
      throw error;
    }
  }

  // Initialize payment
  async initializePayment(data: PaymentData): Promise<PaymentResponse> {
    // Generate reference if not provided
    if (!data.reference) {
      data.reference = `kotapay_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }
    
    // Default currency to NGN
    if (!data.currency) {
      data.currency = 'NGN';
    }

    return this.makeRequest<PaymentResponse>('/paystack/initialize', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  // Verify payment
  async verifyPayment(reference: string): Promise<VerificationResponse> {
    return this.makeRequest<VerificationResponse>(`/paystack/verify/${reference}`);
  }

  // Get all banks
  async getBanks(params?: {
    country?: string;
    use_cursor?: boolean;
  }): Promise<{ success: true; data: Bank[] }> {
    const searchParams = new URLSearchParams();
    
    if (params?.country) {
      searchParams.append('country', params.country);
    }
    if (params?.use_cursor !== undefined) {
      searchParams.append('use_cursor', params.use_cursor.toString());
    }

    const queryString = searchParams.toString();
    const endpoint = queryString ? `/paystack/banks?${queryString}` : '/paystack/banks';
    
    return this.makeRequest<{ success: true; data: Bank[] }>(endpoint);
  }

  // Resolve account details
  async resolveAccount(
    accountNumber: string, 
    bankCode: string
  ): Promise<AccountResolutionResponse> {
    return this.makeRequest<AccountResolutionResponse>(
      `/paystack/resolve-account?account_number=${accountNumber}&bank_code=${bankCode}`
    );
  }

  // Create transfer recipient
  async createTransferRecipient(data: TransferRecipientData): Promise<{
    success: true;
    data: {
      active: boolean;
      createdAt: string;
      currency: string;
      domain: string;
      id: number;
      integration: number;
      name: string;
      recipient_code: string;
      type: string;
      updatedAt: string;
      is_deleted: boolean;
      details: {
        authorization_code: null;
        account_number: string;
        account_name: string;
        bank_code: string;
        bank_name: string;
      };
    };
  }> {
    // Default currency to NGN
    if (!data.currency) {
      data.currency = 'NGN';
    }

    return this.makeRequest('/paystack/create-transfer-recipient', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  // Initiate transfer
  async initiateTransfer(data: TransferData): Promise<{
    success: true;
    data: {
      reference: string;
      integration: number;
      domain: string;
      amount: number;
      currency: string;
      source: string;
      reason: string;
      recipient: number;
      status: string;
      transfer_code: string;
      id: number;
      createdAt: string;
      updatedAt: string;
    };
  }> {
    // Generate reference if not provided
    if (!data.reference) {
      data.reference = `transfer_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }
    
    // Default currency to NGN
    if (!data.currency) {
      data.currency = 'NGN';
    }

    return this.makeRequest('/paystack/initiate-transfer', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  // Get transaction history
  async getTransactions(params?: {
    page?: number;
    perPage?: number;
    customer?: string;
    status?: string;
    from?: string;
    to?: string;
  }): Promise<TransactionHistoryResponse> {
    const searchParams = new URLSearchParams();
    
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) {
          searchParams.append(key, value.toString());
        }
      });
    }

    const queryString = searchParams.toString();
    const endpoint = queryString ? `/paystack/transactions?${queryString}` : '/paystack/transactions';
    
    return this.makeRequest<TransactionHistoryResponse>(endpoint);
  }

  // Get single transaction
  async getTransaction(id: string): Promise<{
    success: true;
    data: any;
  }> {
    return this.makeRequest(`/paystack/transaction/${id}`);
  }

  // Note: Webhook signature validation should be done on the backend
  // This is kept here for reference but not recommended for production use
  validateWebhookSignature(payload: string, signature: string, secret: string): boolean {
    // Webhook validation should be handled by the backend for security
    console.warn('Webhook validation should be handled on the backend');
    return false;
  }
}

export default new PaystackService();
