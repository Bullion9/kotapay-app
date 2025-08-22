import { API_HEADERS } from '../config/api';

// ==================== COMPREHENSIVE PAYSTACK API TYPES ====================
// Based on https://paystack.com/docs/ - All features implementation

// Core Payment Types
export interface PaymentData {
  email: string;
  amount: number; // Amount in kobo (100 = ₦1)
  currency?: string; // Default: "NGN"
  reference?: string; // Optional: auto-generated if not provided
  callback_url?: string;
  metadata?: Record<string, any>;
  channels?: string[]; // Payment channels
  split_code?: string;
  subaccount?: string;
}

export interface TransferRecipientData {
  type: "nuban" | "mobile_money";
  name: string;
  account_number: string;
  bank_code: string;
  currency?: string; // Default: "NGN"
  description?: string;
  metadata?: Record<string, any>;
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

// ==================== BILLS & UTILITIES TYPES ====================
export interface BillService {
  service_id: string;
  name: string;
  service_type: string;
  category: string;
  has_fixed_price: boolean;
  description: string;
  product_code: string;
  biller_id: string;
  convenience_fee: number;
  available: boolean;
  country: string;
}

export interface BillPaymentData {
  country: string;
  customer: string;
  amount: number;
  recurrence: string;
  type: string;
  reference?: string;
  biller_name: string;
  product_id: string;
  subscription_type?: string;
  metadata?: Record<string, any>;
}

export interface BillCustomerValidation {
  country: string;
  customer: string;
  type: string;
}

// ==================== AIRTIME TYPES ====================
export interface AirtimeData {
  country: string;
  customer: string; // Phone number
  amount: number; // Amount in kobo
  recurrence: string;
  reference?: string;
}

// ==================== DATA PLANS TYPES ====================
export interface DataPlan {
  plan_id: string;
  name: string;
  price: number;
  data_value: string;
  validity: string;
  network: 'mtn' | 'glo' | 'airtel' | '9mobile';
  plan_type: 'data' | 'voice' | 'sms' | 'combo';
  service_id: string;
}

export interface DataPurchaseData {
  phone: string;
  plan_id: string;
  amount: number;
  network?: string;
  data_value?: string;
  validity?: string;
  metadata?: any;
}

export interface NetworkDataPlans {
  network: string;
  service_id: string;
  plans: DataPlan[];
}

// ==================== ELECTRICITY TYPES ====================
export interface ElectricityService {
  service_id: string;
  name: string;
  category: 'prepaid' | 'postpaid';
  description: string;
  convenience_fee: number;
  available: boolean;
}

export interface ElectricityPaymentData {
  country: string;
  customer: string; // Meter number
  amount: number;
  type: string;
  recurrence: string;
  biller_name: string;
  product_id: string;
  reference?: string;
  metadata?: Record<string, any>;
}

// ==================== CABLE TV TYPES ====================
export interface CableTVService {
  service_id: string;
  name: string;
  packages: CableTVPackage[];
  description: string;
  convenience_fee: number;
  available: boolean;
}

export interface CableTVPackage {
  package_id: string;
  name: string;
  price: number;
  description: string;
  validity: string;
}

export interface CableTVPaymentData {
  country: string;
  customer: string; // Decoder number
  amount: number;
  type: string;
  recurrence: string;
  biller_name: string;
  product_id: string;
  package?: string;
  reference?: string;
  metadata?: Record<string, any>;
}

// ==================== BETTING TYPES ====================
export interface BettingService {
  service_id: string;
  name: string;
  logo: string;
  description: string;
  convenience_fee: number;
  available: boolean;
}

export interface BettingPaymentData {
  country: string;
  customer: string; // Betting account ID
  amount: number;
  type: string;
  recurrence: string;
  biller_name: string;
  product_id: string;
  reference?: string;
  metadata?: Record<string, any>;
}

// ==================== CUSTOMER & KYC TYPES ====================
export interface CustomerData {
  email: string;
  first_name?: string;
  last_name?: string;
  phone?: string;
  metadata?: Record<string, any>;
}

export interface KYCData {
  country: string;
  type: 'business' | 'individual';
  account_number?: string;
  bank_code?: string;
  first_name?: string;
  last_name?: string;
  bvn?: string;
  metadata?: Record<string, any>;
}

export interface IdentityValidation {
  country: string;
  type: 'bvn' | 'bank_account';
  value: string;
  first_name?: string;
  last_name?: string;
  account_number?: string;
  bank_code?: string;
}

// ==================== VIRTUAL CARDS TYPES ====================
export interface VirtualCardData {
  customer: string;
  amount: number;
  debit_currency?: string;
  callback_url?: string;
  metadata?: Record<string, any>;
}

export interface VirtualCardResponse {
  success: true;
  data: {
    id: string;
    customer: string;
    account_id: string;
    last4: string;
    exp_month: string;
    exp_year: string;
    cvv: string;
    amount: number;
    currency: string;
    status: string;
    created_at: string;
    updated_at: string;
  };
}

// ==================== QR CODE TYPES ====================
export interface QRCodeData {
  name: string;
  description?: string;
  amount?: number;
  split_code?: string;
  type: 'fixed' | 'dynamic';
}

export interface QRCodeResponse {
  success: true;
  data: {
    qr_code: string; // Base64 encoded QR code image
    qr_string: string; // QR code text
    reference: string;
  };
}

// ==================== PAYMENT REQUEST TYPES ====================
export interface PaymentRequestData {
  customer: string;
  amount: number;
  currency?: string;
  due_date?: string;
  description?: string;
  line_items?: {
    name: string;
    amount: number;
    quantity?: number;
  }[];
  tax?: {
    name: string;
    amount: number;
  }[];
  invoice_number?: string;
  split_code?: string;
  send_notification?: boolean;
  draft?: boolean;
}

// ==================== RECEIPT TYPES ====================
export interface ReceiptData {
  transaction_reference: string;
  customer_email?: string;
  send_email?: boolean;
  template?: 'default' | 'minimal' | 'detailed';
}

export interface ReceiptResponse {
  success: true;
  data: {
    receipt_url: string;
    receipt_number: string;
    download_url: string;
  };
}

// ==================== CONTACT/BENEFICIARY TYPES ====================
export interface ContactData {
  name: string;
  email?: string;
  phone?: string;
  account_number?: string;
  bank_code?: string;
  bank_name?: string;
  type: 'bank' | 'wallet' | 'mobile_money';
  metadata?: Record<string, any>;
}

// ==================== TRANSACTION HISTORY TYPES ====================
export interface TransactionFilter {
  customer?: string;
  status?: 'failed' | 'success' | 'abandoned';
  from?: string;
  to?: string;
  amount?: number;
  currency?: string;
  page?: number;
  perPage?: number;
}

export interface TransactionHistoryResponse {
  success: true;
  data: {
    id: number;
    domain: string;
    status: string;
    reference: string;
    amount: number;
    message: string;
    gateway_response: string;
    paid_at: string;
    created_at: string;
    channel: string;
    currency: string;
    ip_address: string;
    metadata: any;
    fees: number;
    customer: any;
    authorization: any;
  }[];
  meta: {
    total: number;
    skipped: number;
    perPage: number;
    page: number;
    pageCount: number;
  };
}

// ==================== PAYMENT METHODS TYPES ====================
export interface PaymentMethod {
  authorization_code: string;
  card_type: string;
  last4: string;
  exp_month: string;
  exp_year: string;
  bin: string;
  bank: string;
  channel: string;
  signature: string;
  reusable: boolean;
  country_code: string;
  account_name: string;
}

// ==================== RESPONSE TYPES ====================
export interface PaystackResponse<T = any> {
  success: boolean;
  message: string;
  data: T;
  meta?: any;
}

export interface DataPlansResponse {
  success: true;
  data: NetworkDataPlans[];
}

export interface DataPurchaseResponse {
  success: true;
  data: {
    reference: string;
    amount: number;
    fee: number;
    currency: string;
    status: string;
    customer: string;
    service: string;
    phone: string;
    plan_id: string;
    data_value: string;
    validity: string;
    metadata: any;
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
  status: boolean;
  message: string;
  data: {
    account_number: string;
    account_name: string;
    bank_id: number;
  };
}

export interface ApiError {
  success: false;
  error: string;
  code?: string;
  details?: string;
}

class PaystackService {
  private baseURL = 'https://api.paystack.co';
  private secretKey = process.env.EXPO_PUBLIC_PAYSTACK_SECRET_KEY || '';
  
  // Helper method to get headers
  private getHeaders(): Record<string, string> {
    return {
      ...API_HEADERS,
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${this.secretKey}`,
    };
  }
  
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
          ...this.getHeaders(),
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

  // Health check - Test Paystack API connectivity
  async checkHealth(): Promise<any> {
    try {
      const response = await fetch(`${this.baseURL}/bank`, {
        method: 'GET',
        headers: {
          ...API_HEADERS,
          'Authorization': `Bearer ${this.secretKey}`,
        },
      });
      return await response.json();
    } catch (error) {
      console.error('Paystack API health check failed:', error);
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

    return this.makeRequest<PaymentResponse>('/transaction/initialize', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  // Verify payment
  async verifyPayment(reference: string): Promise<VerificationResponse> {
    // Ensure reference is provided and not empty
    if (!reference || reference.trim() === '') {
      throw new Error('Payment reference is required for verification');
    }
    
    console.log('PaystackService: Verifying payment with reference:', reference);
    
    // Clean the reference (remove any extra characters)
    const cleanReference = reference.trim();
    
    console.log('PaystackService: Making API request to verify:', cleanReference);
    
    return this.makeRequest<VerificationResponse>(`/transaction/verify/${cleanReference}`);
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
    const endpoint = queryString ? `/bank?${queryString}` : '/bank';
    
    return this.makeRequest<{ success: true; data: Bank[] }>(endpoint);
  }

  // Resolve account details
  async resolveAccount(
    accountNumber: string, 
    bankCode: string
  ): Promise<AccountResolutionResponse> {
    return this.makeRequest<AccountResolutionResponse>(
      `/bank/resolve?account_number=${accountNumber}&bank_code=${bankCode}`
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

    return this.makeRequest('/transferrecipient', {
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

    return this.makeRequest('/transfer', {
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
    const endpoint = queryString ? `/transaction?${queryString}` : '/transaction';
    
    return this.makeRequest<TransactionHistoryResponse>(endpoint);
  }

  // Get single transaction
  async getTransaction(id: string): Promise<{
    success: true;
    data: any;
  }> {
    return this.makeRequest(`/transaction/${id}`);
  }

  // Note: Webhook signature validation should be done on the backend
  // This is kept here for reference but not recommended for production use
  validateWebhookSignature(payload: string, signature: string, secret: string): boolean {
    // Webhook validation should be handled by the backend for security
    console.warn('Webhook validation should be handled on the backend');
    return false;
  }

  // ================ BILLS & UTILITIES ================
  // NOTE: Paystack doesn't directly provide bills payment APIs.
  // These endpoints should be integrated with third-party bill payment providers
  // like VTPass, Flutterwave Bills, or other service providers.

  // Get all bill services (requires third-party integration)
  async getBillServices(): Promise<{ success: true; data: BillService[] }> {
    // TODO: Integrate with actual bills service provider (VTPass, Flutterwave, etc.)
    throw new Error('Bills service integration required. Please integrate with VTPass or similar provider.');
  }

  // Get bill categories (requires third-party integration)
  async getBillCategories(serviceId: string): Promise<{ success: true; data: any[] }> {
    // TODO: Integrate with actual bills service provider (VTPass, Flutterwave, etc.)
    throw new Error('Bills service integration required. Please integrate with VTPass or similar provider.');
  }

  // Validate bill customer
  async validateBillCustomer(serviceId: string, customerId: string, billType?: string): Promise<{
    success: true;
    data: {
      customer_name: string;
      customer_id: string;
      available_plans?: any[];
    };
  }> {
    const params = new URLSearchParams({
      service_id: serviceId,
      customer_id: customerId,
    });
    if (billType) params.append('bill_type', billType);

    return this.makeRequest<{
      success: true;
      data: {
        customer_name: string;
        customer_id: string;
        available_plans?: any[];
      };
    }>(`/paystack/bills/validate?${params.toString()}`);
  }

  // Pay bill
  async payBill(data: {
    customer: string;
    amount: number;
    service_id: string;
    customer_id: string;
    variation_code?: string;
    phone?: string;
    reference?: string;
  }): Promise<{
    success: true;
    data: {
      reference: string;
      trans_id: string;
      status: string;
      amount: number;
      fee: number;
      customer_name: string;
    };
  }> {
    if (!data.reference) {
      data.reference = `bill_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }

    return this.makeRequest('/paystack/bills/pay', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  // ================ ELECTRICITY SERVICES ================

  // Get electricity providers
  async getElectricityProviders(): Promise<{ success: true; data: ElectricityService[] }> {
    return this.makeRequest<{ success: true; data: ElectricityService[] }>('/paystack/bills/electricity/providers');
  }

  // Validate electricity meter
  async validateElectricityMeter(
    providerId: string, 
    meterNumber: string, 
    meterType: 'prepaid' | 'postpaid'
  ): Promise<{
    success: true;
    data: {
      customer_name: string;
      customer_id: string;
      address: string;
      tariff_code: string;
    };
  }> {
    const params = new URLSearchParams({
      service_id: providerId,
      customer_id: meterNumber,
      bill_type: meterType,
    });

    return this.makeRequest<{
      success: true;
      data: {
        customer_name: string;
        customer_id: string;
        address: string;
        tariff_code: string;
      };
    }>(`/paystack/bills/electricity/validate?${params.toString()}`);
  }

  // Pay electricity bill
  async payElectricityBill(data: {
    customer: string;
    amount: number;
    service_id: string;
    meter_number: string;
    meter_type: 'prepaid' | 'postpaid';
    phone?: string;
    reference?: string;
  }): Promise<{
    success: true;
    data: {
      reference: string;
      trans_id: string;
      status: string;
      amount: number;
      fee: number;
      customer_name: string;
      token?: string;
      units?: string;
    };
  }> {
    if (!data.reference) {
      data.reference = `electricity_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }

    return this.makeRequest('/paystack/bills/electricity/pay', {
      method: 'POST',
      body: JSON.stringify({
        customer: data.customer,
        amount: data.amount,
        service_id: data.service_id,
        customer_id: data.meter_number,
        variation_code: data.meter_type,
        phone: data.phone,
        reference: data.reference,
      }),
    });
  }

  // ================ CABLE TV SERVICES ================

  // Get cable TV providers
  async getCableTVProviders(): Promise<{ success: true; data: CableTVService[] }> {
    return this.makeRequest<{ success: true; data: CableTVService[] }>('/paystack/bills/cabletv/providers');
  }

  // Get cable TV plans
  async getCableTVPlans(providerId: string): Promise<{ success: true; data: any[] }> {
    return this.makeRequest<{ success: true; data: any[] }>(`/paystack/bills/cabletv/${providerId}/plans`);
  }

  // Validate cable TV customer
  async validateCableTVCustomer(providerId: string, smartCardNumber: string): Promise<{
    success: true;
    data: {
      customer_name: string;
      customer_id: string;
      due_date?: string;
      invoice_period?: string;
    };
  }> {
    const params = new URLSearchParams({
      service_id: providerId,
      customer_id: smartCardNumber,
    });

    return this.makeRequest<{
      success: true;
      data: {
        customer_name: string;
        customer_id: string;
        due_date?: string;
        invoice_period?: string;
      };
    }>(`/paystack/bills/cabletv/validate?${params.toString()}`);
  }

  // Pay cable TV subscription
  async payCableTVSubscription(data: {
    customer: string;
    service_id: string;
    smartcard_number: string;
    variation_code: string;
    phone?: string;
    reference?: string;
  }): Promise<{
    success: true;
    data: {
      reference: string;
      trans_id: string;
      status: string;
      amount: number;
      fee: number;
      customer_name: string;
    };
  }> {
    if (!data.reference) {
      data.reference = `cabletv_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }

    return this.makeRequest('/paystack/bills/cabletv/pay', {
      method: 'POST',
      body: JSON.stringify({
        customer: data.customer,
        service_id: data.service_id,
        customer_id: data.smartcard_number,
        variation_code: data.variation_code,
        phone: data.phone,
        reference: data.reference,
      }),
    });
  }

  // ================ BETTING SERVICES ================

  // Get betting providers
  async getBettingProviders(): Promise<{ success: true; data: BettingService[] }> {
    return this.makeRequest<{ success: true; data: BettingService[] }>('/paystack/bills/betting/providers');
  }

  // Validate betting customer
  async validateBettingCustomer(providerId: string, customerId: string): Promise<{
    success: true;
    data: {
      customer_name: string;
      customer_id: string;
    };
  }> {
    const params = new URLSearchParams({
      service_id: providerId,
      customer_id: customerId,
    });

    return this.makeRequest<{
      success: true;
      data: {
        customer_name: string;
        customer_id: string;
      };
    }>(`/paystack/bills/betting/validate?${params.toString()}`);
  }

  // Fund betting wallet
  async fundBettingWallet(data: {
    customer: string;
    amount: number;
    service_id: string;
    customer_id: string;
    phone?: string;
    reference?: string;
  }): Promise<{
    success: true;
    data: {
      reference: string;
      trans_id: string;
      status: string;
      amount: number;
      fee: number;
      customer_name: string;
    };
  }> {
    if (!data.reference) {
      data.reference = `betting_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }

    return this.makeRequest('/paystack/bills/betting/fund', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  // ================ VIRTUAL CARDS ================

  // Get virtual cards
  async getVirtualCards(): Promise<{ success: true; data: VirtualCardData[] }> {
    return this.makeRequest<{ success: true; data: VirtualCardData[] }>('/virtualcard');
  }

  // Create virtual card
  async createVirtualCard(data: {
    customer: string;
    amount: number;
    currency?: string;
    reference?: string;
  }): Promise<{
    success: true;
    data: VirtualCardData;
  }> {
    if (!data.reference) {
      data.reference = `vcard_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }
    if (!data.currency) {
      data.currency = 'NGN';
    }

    return this.makeRequest('/virtualcard', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  // Get virtual card details
  async getVirtualCard(cardId: string): Promise<{
    success: true;
    data: VirtualCardData;
  }> {
    return this.makeRequest<{
      success: true;
      data: VirtualCardData;
    }>(`/virtualcard/${cardId}`);
  }

  // Fund virtual card
  async fundVirtualCard(cardId: string, amount: number): Promise<{
    success: true;
    data: {
      reference: string;
      status: string;
      amount: number;
    };
  }> {
    return this.makeRequest(`/virtualcard/${cardId}/fund`, {
      method: 'POST',
      body: JSON.stringify({ amount }),
    });
  }

  // Freeze/Unfreeze virtual card
  async toggleVirtualCardStatus(cardId: string, action: 'freeze' | 'unfreeze'): Promise<{
    success: true;
    data: {
      status: string;
    };
  }> {
    return this.makeRequest(`/virtualcard/${cardId}/${action}`, {
      method: 'POST',
    });
  }

  // ================ QR CODE SERVICES ================

  // Generate QR code for payment
  async generateQRCode(data: {
    amount: number;
    reference?: string;
    description?: string;
    customer?: string;
  }): Promise<{
    success: true;
    data: QRCodeData;
  }> {
    if (!data.reference) {
      data.reference = `qr_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }

    return this.makeRequest('/paystack/qr/generate', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  // Get QR code details
  async getQRCode(qrId: string): Promise<{
    success: true;
    data: QRCodeData;
  }> {
    return this.makeRequest<{
      success: true;
      data: QRCodeData;
    }>(`/paystack/qr/${qrId}`);
  }

  // Process QR code payment
  async processQRPayment(qrCode: string, data: {
    customer: string;
    amount?: number;
    pin?: string;
  }): Promise<{
    success: true;
    data: {
      reference: string;
      status: string;
      amount: number;
      recipient: string;
    };
  }> {
    return this.makeRequest('/paystack/qr/pay', {
      method: 'POST',
      body: JSON.stringify({
        qr_code: qrCode,
        ...data,
      }),
    });
  }

  // ================ PAYMENT REQUESTS ================

  // Create payment request
  async createPaymentRequest(data: {
    customer: string;
    amount: number;
    description: string;
    due_date?: string;
    reference?: string;
    send_notification?: boolean;
  }): Promise<{
    success: true;
    data: PaymentRequestData;
  }> {
    if (!data.reference) {
      data.reference = `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }

    return this.makeRequest('/paymentrequest', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  // Get payment requests
  async getPaymentRequests(params?: {
    status?: string;
    page?: number;
    perPage?: number;
  }): Promise<{
    success: true;
    data: PaymentRequestData[];
    meta: {
      total: number;
      page: number;
      perPage: number;
    };
  }> {
    const searchParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) {
          searchParams.append(key, value.toString());
        }
      });
    }

    const queryString = searchParams.toString();
    const endpoint = queryString ? `/paymentrequest?${queryString}` : '/paymentrequest';
    
    return this.makeRequest(endpoint);
  }

  // Get single payment request
  async getPaymentRequest(requestId: string): Promise<{
    success: true;
    data: PaymentRequestData;
  }> {
    return this.makeRequest<{
      success: true;
      data: PaymentRequestData;
    }>(`/paymentrequest/${requestId}`);
  }

  // Cancel payment request
  async cancelPaymentRequest(requestId: string): Promise<{
    success: true;
    message: string;
  }> {
    return this.makeRequest(`/paymentrequest/${requestId}`, {
      method: 'POST',
    });
  }

  // ================ RECEIPTS & DOCUMENTATION ================

  // Generate receipt
  async generateReceipt(transactionId: string): Promise<{
    success: true;
    data: ReceiptData;
  }> {
    return this.makeRequest<{
      success: true;
      data: ReceiptData;
    }>(`/paystack/receipts/generate/${transactionId}`);
  }

  // Get receipt
  async getReceipt(receiptId: string): Promise<{
    success: true;
    data: ReceiptData;
  }> {
    return this.makeRequest<{
      success: true;
      data: ReceiptData;
    }>(`/paystack/receipts/${receiptId}`);
  }

  // Download receipt PDF
  async downloadReceiptPDF(receiptId: string): Promise<Blob> {
    const response = await fetch(`${this.baseURL}/paystack/receipts/${receiptId}/pdf`, {
      headers: this.getHeaders(),
    });

    if (!response.ok) {
      throw new Error(`Failed to download receipt: ${response.statusText}`);
    }

    return response.blob();
  }

  // ================ CONTACT MANAGEMENT ================

  // Get contacts
  async getContacts(): Promise<{
    success: true;
    data: ContactData[];
  }> {
    return this.makeRequest<{
      success: true;
      data: ContactData[];
    }>('/paystack/contacts');
  }

  // Add contact
  async addContact(data: {
    name: string;
    phone?: string;
    email?: string;
    bank_code?: string;
    account_number?: string;
    account_name?: string;
  }): Promise<{
    success: true;
    data: ContactData;
  }> {
    return this.makeRequest('/paystack/contacts/add', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  // Update contact
  async updateContact(contactId: string, data: {
    name?: string;
    phone?: string;
    email?: string;
    bank_code?: string;
    account_number?: string;
    account_name?: string;
  }): Promise<{
    success: true;
    data: ContactData;
  }> {
    return this.makeRequest(`/paystack/contacts/${contactId}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  // Delete contact
  async deleteContact(contactId: string): Promise<{
    success: true;
    message: string;
  }> {
    return this.makeRequest(`/paystack/contacts/${contactId}`, {
      method: 'DELETE',
    });
  }

  // ================ KYC & IDENTITY VERIFICATION ================

  // Get KYC status
  async getKYCStatus(customer: string): Promise<{
    success: true;
    data: KYCData;
  }> {
    return this.makeRequest<{
      success: true;
      data: KYCData;
    }>(`/paystack/kyc/status/${customer}`);
  }

  // Submit KYC documents
  async submitKYCDocuments(data: {
    customer: string;
    document_type: 'nin' | 'bvn' | 'drivers_license' | 'passport' | 'voters_card';
    document_number: string;
    document_image?: string; // Base64 encoded image
    selfie_image?: string; // Base64 encoded image
  }): Promise<{
    success: true;
    data: {
      reference: string;
      status: string;
      verification_url?: string;
    };
  }> {
    return this.makeRequest('/paystack/kyc/submit', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  // Verify identity
  async verifyIdentity(data: {
    customer: string;
    identity_type: 'nin' | 'bvn' | 'account_number';
    identity_value: string;
    bank_code?: string; // Required for account_number verification
  }): Promise<{
    success: true;
    data: IdentityValidation;
  }> {
    return this.makeRequest('/paystack/identity/verify', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  // ================ PAYMENT METHODS ================

  // Get saved payment methods
  async getPaymentMethods(customer: string): Promise<{
    success: true;
    data: PaymentMethod[];
  }> {
    return this.makeRequest<{
      success: true;
      data: PaymentMethod[];
    }>(`/paystack/payment-methods/${customer}`);
  }

  // Add payment method
  async addPaymentMethod(data: {
    customer: string;
    type: 'card' | 'bank_account' | 'ussd';
    card_number?: string;
    expiry_month?: string;
    expiry_year?: string;
    cvv?: string;
    bank_code?: string;
    account_number?: string;
    ussd_code?: string;
  }): Promise<{
    success: true;
    data: PaymentMethod;
  }> {
    return this.makeRequest('/paystack/payment-methods/add', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  // Remove payment method
  async removePaymentMethod(methodId: string): Promise<{
    success: true;
    message: string;
  }> {
    return this.makeRequest(`/paystack/payment-methods/${methodId}`, {
      method: 'DELETE',
    });
  }

  // Set default payment method
  async setDefaultPaymentMethod(customer: string, methodId: string): Promise<{
    success: true;
    message: string;
  }> {
    return this.makeRequest('/paystack/payment-methods/set-default', {
      method: 'POST',
      body: JSON.stringify({
        customer,
        method_id: methodId,
      }),
    });
  }

  // ================ ADVANCED TRANSACTION MANAGEMENT ================

  // Get filtered transactions
  async getFilteredTransactions(filters: TransactionFilter): Promise<TransactionHistoryResponse> {
    const searchParams = new URLSearchParams();
    
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        if (Array.isArray(value)) {
          value.forEach(v => searchParams.append(key, v.toString()));
        } else {
          searchParams.append(key, value.toString());
        }
      }
    });

    const queryString = searchParams.toString();
    const endpoint = queryString ? `/paystack/transactions/filtered?${queryString}` : '/paystack/transactions/filtered';
    
    return this.makeRequest<TransactionHistoryResponse>(endpoint);
  }

  // Export transactions
  async exportTransactions(format: 'csv' | 'excel' | 'pdf', filters?: TransactionFilter): Promise<Blob> {
    const searchParams = new URLSearchParams({ format });
    
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          searchParams.append(key, value.toString());
        }
      });
    }

    const response = await fetch(`${this.baseURL}/paystack/transactions/export?${searchParams.toString()}`, {
      headers: this.getHeaders(),
    });

    if (!response.ok) {
      throw new Error(`Failed to export transactions: ${response.statusText}`);
    }

    return response.blob();
  }

  // ================ TOP-UP & ADD MONEY ================

  // Get topup methods
  async getTopupMethods(): Promise<{
    success: true;
    data: {
      method: string;
      name: string;
      fee: number;
      minimum: number;
      maximum: number;
      available: boolean;
    }[];
  }> {
    return this.makeRequest('/paystack/topup/methods');
  }

  // Initiate wallet topup
  async initiateTopup(data: {
    customer: string;
    amount: number;
    method: 'card' | 'bank_transfer' | 'ussd' | 'qr_code';
    payment_method_id?: string;
    reference?: string;
  }): Promise<{
    success: true;
    data: {
      reference: string;
      authorization_url?: string;
      access_code?: string;
      display_text?: string;
      qr_code?: string;
    };
  }> {
    if (!data.reference) {
      data.reference = `topup_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }

    return this.makeRequest('/paystack/topup/initiate', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  // ================ CASHOUT & WITHDRAWAL ================

  // Get withdrawal methods
  async getWithdrawalMethods(): Promise<{
    success: true;
    data: {
      method: string;
      name: string;
      fee: number;
      minimum: number;
      maximum: number;
      processing_time: string;
      available: boolean;
    }[];
  }> {
    return this.makeRequest('/paystack/withdrawal/methods');
  }

  // Initiate withdrawal
  async initiateWithdrawal(data: {
    customer: string;
    amount: number;
    method: 'bank_transfer' | 'card' | 'mobile_money';
    destination: string; // recipient_code for bank_transfer, card_id for card
    narration?: string;
    reference?: string;
  }): Promise<{
    success: true;
    data: {
      reference: string;
      transfer_code: string;
      status: string;
      amount: number;
      fee: number;
      recipient: string;
    };
  }> {
    if (!data.reference) {
      data.reference = `withdrawal_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }

    return this.makeRequest('/paystack/withdrawal/initiate', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  // Check withdrawal status
  async getWithdrawalStatus(reference: string): Promise<{
    success: true;
    data: {
      reference: string;
      status: string;
      amount: number;
      fee: number;
      recipient: string;
      created_at: string;
      completed_at?: string;
      failure_reason?: string;
    };
  }> {
    return this.makeRequest<{
      success: true;
      data: {
        reference: string;
        status: string;
        amount: number;
        fee: number;
        recipient: string;
        created_at: string;
        completed_at?: string;
        failure_reason?: string;
      };
    }>(`/paystack/withdrawal/status/${reference}`);
  }
}

export default new PaystackService();
