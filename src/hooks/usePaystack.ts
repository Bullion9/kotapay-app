import { useCallback, useState } from 'react';
import PaystackServiceInstance, { PaymentData, TransferRecipientData } from '../services/PaystackService';
import { handleApiError, retryWithBackoff } from '../utils/apiError';

export interface UsePaystackReturn {
  // Loading states
  loading: boolean;
  initializingPayment: boolean;
  verifyingPayment: boolean;
  loadingBanks: boolean;
  resolvingAccount: boolean;
  loadingBillsServices: boolean;
  payingBill: boolean;
  purchasingAirtime: boolean;
  loadingDataPlans: boolean;
  purchasingData: boolean;
  loadingElectricity: boolean;
  payingElectricity: boolean;
  loadingCableTV: boolean;
  payingCableTV: boolean;
  loadingBetting: boolean;
  fundingBetting: boolean;
  loadingVirtualCards: boolean;
  managingVirtualCard: boolean;
  generatingQR: boolean;
  processingQRPayment: boolean;
  loadingPaymentRequests: boolean;
  creatingPaymentRequest: boolean;
  loadingReceipts: boolean;
  loadingContacts: boolean;
  managingContact: boolean;
  loadingKYC: boolean;
  submittingKYC: boolean;
  loadingPaymentMethods: boolean;
  managingPaymentMethod: boolean;
  initiatingTopup: boolean;
  initiatingWithdrawal: boolean;
  
  // Data
  banks: any[];
  billsServices: any[];
  dataPlans: any[];
  networkDataPlans: any[];
  electricityProviders: any[];
  cableTVProviders: any[];
  bettingProviders: any[];
  virtualCards: any[];
  paymentRequests: any[];
  contacts: any[];
  paymentMethods: any[];
  
  // Core Payment Methods
  initializePayment: (data: PaymentData) => Promise<any>;
  verifyPayment: (reference: string) => Promise<any>;
  getBanks: () => Promise<void>;
  resolveAccount: (accountNumber: string, bankCode: string) => Promise<any>;
  createTransferRecipient: (data: TransferRecipientData) => Promise<any>;
  initiateTransfer: (data: any) => Promise<any>;
  getTransactions: (params?: any) => Promise<any>;
  getFilteredTransactions: (filters: any) => Promise<any>;
  exportTransactions: (format: 'csv' | 'excel' | 'pdf', filters?: any) => Promise<Blob>;
  checkHealth: () => Promise<any>;
  
  // Bills & Utilities
  getBillsServices: (country?: string) => Promise<void>;
  getBillCategories: (serviceId: string) => Promise<any>;
  validateBillCustomer: (serviceId: string, customerId: string, billType?: string) => Promise<any>;
  payBill: (data: any) => Promise<any>;
  getBillPayments: (params?: any) => Promise<any>;
  purchaseAirtime: (data: any) => Promise<any>;
  buyAirtime: (data: any) => Promise<any>;
  
  // Electricity Services
  getElectricityProviders: () => Promise<void>;
  validateElectricityMeter: (providerId: string, meterNumber: string, meterType: 'prepaid' | 'postpaid') => Promise<any>;
  payElectricityBill: (data: any) => Promise<any>;
  
  // Cable TV Services
  getCableTVProviders: () => Promise<void>;
  getCableTVPlans: (providerId: string) => Promise<any>;
  validateCableTVCustomer: (providerId: string, smartCardNumber: string) => Promise<any>;
  payCableTVSubscription: (data: any) => Promise<any>;
  
  // Betting Services
  getBettingProviders: () => Promise<void>;
  validateBettingCustomer: (providerId: string, customerId: string) => Promise<any>;
  fundBettingWallet: (data: any) => Promise<any>;
  
  // Virtual Cards
  getVirtualCards: () => Promise<void>;
  createVirtualCard: (data: any) => Promise<any>;
  getVirtualCard: (cardId: string) => Promise<any>;
  fundVirtualCard: (cardId: string, amount: number) => Promise<any>;
  toggleVirtualCardStatus: (cardId: string, action: 'freeze' | 'unfreeze') => Promise<any>;
  
  // QR Code Services
  generateQRCode: (data: any) => Promise<any>;
  getQRCode: (qrId: string) => Promise<any>;
  processQRPayment: (qrCode: string, data: any) => Promise<any>;
  
  // Payment Requests
  createPaymentRequest: (data: any) => Promise<any>;
  getPaymentRequests: (params?: any) => Promise<void>;
  getPaymentRequest: (requestId: string) => Promise<any>;
  cancelPaymentRequest: (requestId: string) => Promise<any>;
  
  // Receipts & Documentation
  generateReceipt: (transactionId: string) => Promise<any>;
  getReceipt: (receiptId: string) => Promise<any>;
  downloadReceiptPDF: (receiptId: string) => Promise<Blob>;
  
  // Contact Management
  getContacts: () => Promise<void>;
  addContact: (data: any) => Promise<any>;
  updateContact: (contactId: string, data: any) => Promise<any>;
  deleteContact: (contactId: string) => Promise<any>;
  
  // KYC & Identity Verification
  getKYCStatus: (customer: string) => Promise<any>;
  submitKYCDocuments: (data: any) => Promise<any>;
  verifyIdentity: (data: any) => Promise<any>;
  
  // Payment Methods
  getPaymentMethods: (customer: string) => Promise<void>;
  addPaymentMethod: (data: any) => Promise<any>;
  removePaymentMethod: (methodId: string) => Promise<any>;
  setDefaultPaymentMethod: (customer: string, methodId: string) => Promise<any>;
  
  // Top-up & Add Money
  getTopupMethods: () => Promise<any>;
  initiateTopup: (data: any) => Promise<any>;
  
  // Cashout & Withdrawal
  getWithdrawalMethods: () => Promise<any>;
  initiateWithdrawal: (data: any) => Promise<any>;
  getWithdrawalStatus: (reference: string) => Promise<any>;
  
  // Data Plans
  getAllDataPlans: () => Promise<void>;
  getDataPlansByNetwork: (network: 'mtn' | 'glo' | 'airtel' | '9mobile') => Promise<any>;
  purchaseDataPlan: (data: any) => Promise<any>;
  buyDataPlan: (data: any) => Promise<any>;
  getPopularDataPlans: () => Promise<void>;
  getDataPlansByPriceRange: (minPrice: number, maxPrice: number) => Promise<any>;
  getDataPlansByValidity: (validityType: 'daily' | 'weekly' | 'monthly' | 'yearly') => Promise<any>;
  getDataPurchaseHistory: (params?: any) => Promise<any>;
  
  // Error handling
  error: string | null;
  clearError: () => void;
}

export const usePaystack = (): UsePaystackReturn => {
  // Core loading states
  const [loading, setLoading] = useState(false);
  const [initializingPayment, setInitializingPayment] = useState(false);
  const [verifyingPayment, setVerifyingPayment] = useState(false);
  const [loadingBanks, setLoadingBanks] = useState(false);
  const [resolvingAccount, setResolvingAccount] = useState(false);
  
  // Bills & Utilities loading states
  const [loadingBillsServices, setLoadingBillsServices] = useState(false);
  const [payingBill, setPayingBill] = useState(false);
  const [purchasingAirtime, setPurchasingAirtime] = useState(false);
  const [loadingDataPlans, setLoadingDataPlans] = useState(false);
  const [purchasingData, setPurchasingData] = useState(false);
  
  // Electricity loading states
  const [loadingElectricity, setLoadingElectricity] = useState(false);
  const [payingElectricity, setPayingElectricity] = useState(false);
  
  // Cable TV loading states
  const [loadingCableTV, setLoadingCableTV] = useState(false);
  const [payingCableTV, setPayingCableTV] = useState(false);
  
  // Betting loading states
  const [loadingBetting, setLoadingBetting] = useState(false);
  const [fundingBetting, setFundingBetting] = useState(false);
  
  // Virtual Cards loading states
  const [loadingVirtualCards, setLoadingVirtualCards] = useState(false);
  const [managingVirtualCard, setManagingVirtualCard] = useState(false);
  
  // QR Code loading states
  const [generatingQR, setGeneratingQR] = useState(false);
  const [processingQRPayment, setProcessingQRPayment] = useState(false);
  
  // Payment Requests loading states
  const [loadingPaymentRequests, setLoadingPaymentRequests] = useState(false);
  const [creatingPaymentRequest, setCreatingPaymentRequest] = useState(false);
  
  // Receipts loading states
  const [loadingReceipts, setLoadingReceipts] = useState(false);
  
  // Contacts loading states
  const [loadingContacts, setLoadingContacts] = useState(false);
  const [managingContact, setManagingContact] = useState(false);
  
  // KYC loading states
  const [loadingKYC, setLoadingKYC] = useState(false);
  const [submittingKYC, setSubmittingKYC] = useState(false);
  
  // Payment Methods loading states
  const [loadingPaymentMethods, setLoadingPaymentMethods] = useState(false);
  const [managingPaymentMethod, setManagingPaymentMethod] = useState(false);
  
  // Topup & Withdrawal loading states
  const [initiatingTopup, setInitiatingTopup] = useState(false);
  const [initiatingWithdrawal, setInitiatingWithdrawal] = useState(false);
  
  // Data states
  const [banks, setBanks] = useState<any[]>([]);
  const [billsServices, setBillsServices] = useState<any[]>([]);
  const [dataPlans, setDataPlans] = useState<any[]>([]);
  const [networkDataPlans, setNetworkDataPlans] = useState<any[]>([]);
  const [electricityProviders, setElectricityProviders] = useState<any[]>([]);
  const [cableTVProviders, setCableTVProviders] = useState<any[]>([]);
  const [bettingProviders, setBettingProviders] = useState<any[]>([]);
  const [virtualCards, setVirtualCards] = useState<any[]>([]);
  const [paymentRequests, setPaymentRequests] = useState<any[]>([]);
  const [contacts, setContacts] = useState<any[]>([]);
  const [paymentMethods, setPaymentMethods] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const checkHealth = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await retryWithBackoff(() => PaystackServiceInstance.checkHealth());
      console.log('Backend health check:', response);
      return response;
    } catch (err) {
      const errorMessage = handleApiError(err);
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, []);

  const initializePayment = useCallback(async (data: PaymentData) => {
    try {
      setInitializingPayment(true);
      setError(null);
      
      const response = await retryWithBackoff(() => PaystackServiceInstance.initializePayment(data));
      console.log('Payment initialized:', response);
      return response;
    } catch (err) {
      const errorMessage = handleApiError(err);
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setInitializingPayment(false);
    }
  }, []);

  const verifyPayment = useCallback(async (reference: string) => {
    try {
      setVerifyingPayment(true);
      setError(null);
      
      const response = await retryWithBackoff(() => PaystackServiceInstance.verifyPayment(reference));
      console.log('Payment verified:', response);
      return response;
    } catch (err) {
      const errorMessage = handleApiError(err);
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setVerifyingPayment(false);
    }
  }, []);

  const getBanks = useCallback(async () => {
    try {
      setLoadingBanks(true);
      setError(null);
      
      const response = await retryWithBackoff(() => PaystackServiceInstance.getBanks());
      setBanks((response as any).data || []);
      console.log('Banks loaded:', (response as any).data?.length);
    } catch (err) {
      const errorMessage = handleApiError(err);
      setError(errorMessage);
      setBanks([]);
    } finally {
      setLoadingBanks(false);
    }
  }, []);

  const resolveAccount = useCallback(async (accountNumber: string, bankCode: string) => {
    try {
      setResolvingAccount(true);
      setError(null);
      
      const response = await retryWithBackoff(() => 
        PaystackServiceInstance.resolveAccount(accountNumber, bankCode)
      );
      console.log('Account resolved:', response);
      return response;
    } catch (err) {
      const errorMessage = handleApiError(err);
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setResolvingAccount(false);
    }
  }, []);

  const createTransferRecipient = useCallback(async (data: TransferRecipientData) => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await retryWithBackoff(() => PaystackServiceInstance.createTransferRecipient(data));
      console.log('Transfer recipient created:', response);
      return response;
    } catch (err) {
      const errorMessage = handleApiError(err);
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, []);

  const initiateTransfer = useCallback(async (data: any) => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await retryWithBackoff(() => PaystackServiceInstance.initiateTransfer(data));
      console.log('Transfer initiated:', response);
      return response;
    } catch (err) {
      const errorMessage = handleApiError(err);
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, []);

  const getTransactions = useCallback(async (params?: any) => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await retryWithBackoff(() => PaystackServiceInstance.getTransactions(params));
      console.log('Transactions loaded:', response);
      return response;
    } catch (err) {
      const errorMessage = handleApiError(err);
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, []);

  // Bills & Utilities methods
  const getBillsServices = useCallback(async (country: string = 'NG') => {
    try {
      setLoadingBillsServices(true);
      setError(null);
      
      const response = await retryWithBackoff(() => PaystackServiceInstance.getBillServices());
      setBillsServices((response as any).data || []);
      console.log('Bills services loaded:', (response as any).data?.length);
    } catch (err) {
      const errorMessage = handleApiError(err);
      setError(errorMessage);
      console.error('Failed to load bills services:', errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoadingBillsServices(false);
    }
  }, []);

  const getBillCategories = useCallback(async (serviceId: string) => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await retryWithBackoff(() => PaystackServiceInstance.getBillCategories(serviceId));
      console.log('Bill categories loaded:', response);
      return response;
    } catch (err) {
      const errorMessage = handleApiError(err);
      setError(errorMessage);
      console.error('Failed to load bill categories:', errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, []);

  const validateBillCustomer = useCallback(async (serviceId: string, customerId: string, billType?: string) => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await retryWithBackoff(() => 
        PaystackServiceInstance.validateBillCustomer(serviceId, customerId, billType)
      );
      console.log('Customer validation successful:', response);
      return response;
    } catch (err) {
      const errorMessage = handleApiError(err);
      setError(errorMessage);
      console.error('Customer validation failed:', errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, []);

  const payBill = useCallback(async (data: any) => {
    try {
      setPayingBill(true);
      setError(null);
      
      const response = await retryWithBackoff(() => PaystackServiceInstance.payBill(data));
      console.log('Bill payment successful:', response);
      return response;
    } catch (err) {
      const errorMessage = handleApiError(err);
      setError(errorMessage);
      console.error('Bill payment failed:', errorMessage);
      throw new Error(errorMessage);
    } finally {
      setPayingBill(false);
    }
  }, []);

  const getBillPayments = useCallback(async (params?: any) => {
    try {
      setLoading(true);
      setError(null);
      
      // For now, we'll use getTransactions as a fallback
      const response = await retryWithBackoff(() => PaystackServiceInstance.getTransactions(params));
      console.log('Bill payments loaded:', response);
      return response;
    } catch (err) {
      const errorMessage = handleApiError(err);
      setError(errorMessage);
      console.error('Failed to load bill payments:', errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, []);

  const purchaseAirtime = useCallback(async (data: any) => {
    try {
      setPurchasingAirtime(true);
      setError(null);
      
      const response = await retryWithBackoff(() => PaystackServiceInstance.payBill(data));
      console.log('Airtime purchase successful:', response);
      return response;
    } catch (err) {
      const errorMessage = handleApiError(err);
      setError(errorMessage);
      console.error('Airtime purchase failed:', errorMessage);
      throw new Error(errorMessage);
    } finally {
      setPurchasingAirtime(false);
    }
  }, []);

  const buyAirtime = useCallback(async (data: any) => {
    try {
      setPurchasingAirtime(true);
      setError(null);
      
      const response = await retryWithBackoff(() => PaystackServiceInstance.payBill(data));
      console.log('Airtime purchase successful:', response);
      return response;
    } catch (err) {
      const errorMessage = handleApiError(err);
      setError(errorMessage);
      console.error('Airtime purchase failed:', errorMessage);
      throw new Error(errorMessage);
    } finally {
      setPurchasingAirtime(false);
    }
  }, []);

  // Electricity Services
  const getElectricityProviders = useCallback(async () => {
    try {
      setLoadingElectricity(true);
      setError(null);
      
      const response = await retryWithBackoff(() => PaystackServiceInstance.getElectricityProviders());
      setElectricityProviders((response as any).data || []);
      console.log('Electricity providers loaded:', (response as any).data?.length);
    } catch (err) {
      const errorMessage = handleApiError(err);
      setError(errorMessage);
      console.error('Failed to load electricity providers:', errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoadingElectricity(false);
    }
  }, []);

  const validateElectricityMeter = useCallback(async (
    providerId: string, 
    meterNumber: string, 
    meterType: 'prepaid' | 'postpaid'
  ) => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await retryWithBackoff(() => 
        PaystackServiceInstance.validateElectricityMeter(providerId, meterNumber, meterType)
      );
      console.log('Electricity meter validation successful:', response);
      return response;
    } catch (err) {
      const errorMessage = handleApiError(err);
      setError(errorMessage);
      console.error('Electricity meter validation failed:', errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, []);

  const payElectricityBill = useCallback(async (data: any) => {
    try {
      setPayingElectricity(true);
      setError(null);
      
      const response = await retryWithBackoff(() => PaystackServiceInstance.payElectricityBill(data));
      console.log('Electricity bill payment successful:', response);
      return response;
    } catch (err) {
      const errorMessage = handleApiError(err);
      setError(errorMessage);
      console.error('Electricity bill payment failed:', errorMessage);
      throw new Error(errorMessage);
    } finally {
      setPayingElectricity(false);
    }
  }, []);

  // Cable TV Services
  const getCableTVProviders = useCallback(async () => {
    try {
      setLoadingCableTV(true);
      setError(null);
      
      const response = await retryWithBackoff(() => PaystackServiceInstance.getCableTVProviders());
      setCableTVProviders((response as any).data || []);
      console.log('Cable TV providers loaded:', (response as any).data?.length);
    } catch (err) {
      const errorMessage = handleApiError(err);
      setError(errorMessage);
      console.error('Failed to load cable TV providers:', errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoadingCableTV(false);
    }
  }, []);

  const getCableTVPlans = useCallback(async (providerId: string) => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await retryWithBackoff(() => PaystackServiceInstance.getCableTVPlans(providerId));
      console.log('Cable TV plans loaded:', response);
      return response;
    } catch (err) {
      const errorMessage = handleApiError(err);
      setError(errorMessage);
      console.error('Failed to load cable TV plans:', errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, []);

  const validateCableTVCustomer = useCallback(async (providerId: string, smartCardNumber: string) => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await retryWithBackoff(() => 
        PaystackServiceInstance.validateCableTVCustomer(providerId, smartCardNumber)
      );
      console.log('Cable TV customer validation successful:', response);
      return response;
    } catch (err) {
      const errorMessage = handleApiError(err);
      setError(errorMessage);
      console.error('Cable TV customer validation failed:', errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, []);

  const payCableTVSubscription = useCallback(async (data: any) => {
    try {
      setPayingCableTV(true);
      setError(null);
      
      const response = await retryWithBackoff(() => PaystackServiceInstance.payCableTVSubscription(data));
      console.log('Cable TV subscription payment successful:', response);
      return response;
    } catch (err) {
      const errorMessage = handleApiError(err);
      setError(errorMessage);
      console.error('Cable TV subscription payment failed:', errorMessage);
      throw new Error(errorMessage);
    } finally {
      setPayingCableTV(false);
    }
  }, []);

  // Betting Services
  const getBettingProviders = useCallback(async () => {
    try {
      setLoadingBetting(true);
      setError(null);
      
      const response = await retryWithBackoff(() => PaystackServiceInstance.getBettingProviders());
      setBettingProviders((response as any).data || []);
      console.log('Betting providers loaded:', (response as any).data?.length);
    } catch (err) {
      const errorMessage = handleApiError(err);
      setError(errorMessage);
      console.error('Failed to load betting providers:', errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoadingBetting(false);
    }
  }, []);

  const validateBettingCustomer = useCallback(async (providerId: string, customerId: string) => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await retryWithBackoff(() => 
        PaystackServiceInstance.validateBettingCustomer(providerId, customerId)
      );
      console.log('Betting customer validation successful:', response);
      return response;
    } catch (err) {
      const errorMessage = handleApiError(err);
      setError(errorMessage);
      console.error('Betting customer validation failed:', errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, []);

  const fundBettingWallet = useCallback(async (data: any) => {
    try {
      setFundingBetting(true);
      setError(null);
      
      const response = await retryWithBackoff(() => PaystackServiceInstance.fundBettingWallet(data));
      console.log('Betting wallet funding successful:', response);
      return response;
    } catch (err) {
      const errorMessage = handleApiError(err);
      setError(errorMessage);
      console.error('Betting wallet funding failed:', errorMessage);
      throw new Error(errorMessage);
    } finally {
      setFundingBetting(false);
    }
  }, []);

  // Virtual Cards
  const getVirtualCards = useCallback(async () => {
    try {
      setLoadingVirtualCards(true);
      setError(null);
      
      const response = await retryWithBackoff(() => PaystackServiceInstance.getVirtualCards());
      setVirtualCards((response as any).data || []);
      console.log('Virtual cards loaded:', (response as any).data?.length);
    } catch (err) {
      const errorMessage = handleApiError(err);
      setError(errorMessage);
      console.error('Failed to load virtual cards:', errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoadingVirtualCards(false);
    }
  }, []);

  const createVirtualCard = useCallback(async (data: any) => {
    try {
      setManagingVirtualCard(true);
      setError(null);
      
      const response = await retryWithBackoff(() => PaystackServiceInstance.createVirtualCard(data));
      console.log('Virtual card created:', response);
      return response;
    } catch (err) {
      const errorMessage = handleApiError(err);
      setError(errorMessage);
      console.error('Virtual card creation failed:', errorMessage);
      throw new Error(errorMessage);
    } finally {
      setManagingVirtualCard(false);
    }
  }, []);

  const getVirtualCard = useCallback(async (cardId: string) => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await retryWithBackoff(() => PaystackServiceInstance.getVirtualCard(cardId));
      console.log('Virtual card details loaded:', response);
      return response;
    } catch (err) {
      const errorMessage = handleApiError(err);
      setError(errorMessage);
      console.error('Failed to load virtual card details:', errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, []);

  const fundVirtualCard = useCallback(async (cardId: string, amount: number) => {
    try {
      setManagingVirtualCard(true);
      setError(null);
      
      const response = await retryWithBackoff(() => PaystackServiceInstance.fundVirtualCard(cardId, amount));
      console.log('Virtual card funded:', response);
      return response;
    } catch (err) {
      const errorMessage = handleApiError(err);
      setError(errorMessage);
      console.error('Virtual card funding failed:', errorMessage);
      throw new Error(errorMessage);
    } finally {
      setManagingVirtualCard(false);
    }
  }, []);

  const toggleVirtualCardStatus = useCallback(async (cardId: string, action: 'freeze' | 'unfreeze') => {
    try {
      setManagingVirtualCard(true);
      setError(null);
      
      const response = await retryWithBackoff(() => PaystackServiceInstance.toggleVirtualCardStatus(cardId, action));
      console.log(`Virtual card ${action}d:`, response);
      return response;
    } catch (err) {
      const errorMessage = handleApiError(err);
      setError(errorMessage);
      console.error(`Virtual card ${action} failed:`, errorMessage);
      throw new Error(errorMessage);
    } finally {
      setManagingVirtualCard(false);
    }
  }, []);

  // QR Code Services
  const generateQRCode = useCallback(async (data: any) => {
    try {
      setGeneratingQR(true);
      setError(null);
      
      const response = await retryWithBackoff(() => PaystackServiceInstance.generateQRCode(data));
      console.log('QR code generated:', response);
      return response;
    } catch (err) {
      const errorMessage = handleApiError(err);
      setError(errorMessage);
      console.error('QR code generation failed:', errorMessage);
      throw new Error(errorMessage);
    } finally {
      setGeneratingQR(false);
    }
  }, []);

  const getQRCode = useCallback(async (qrId: string) => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await retryWithBackoff(() => PaystackServiceInstance.getQRCode(qrId));
      console.log('QR code details loaded:', response);
      return response;
    } catch (err) {
      const errorMessage = handleApiError(err);
      setError(errorMessage);
      console.error('Failed to load QR code details:', errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, []);

  const processQRPayment = useCallback(async (qrCode: string, data: any) => {
    try {
      setProcessingQRPayment(true);
      setError(null);
      
      const response = await retryWithBackoff(() => PaystackServiceInstance.processQRPayment(qrCode, data));
      console.log('QR payment processed:', response);
      return response;
    } catch (err) {
      const errorMessage = handleApiError(err);
      setError(errorMessage);
      console.error('QR payment processing failed:', errorMessage);
      throw new Error(errorMessage);
    } finally {
      setProcessingQRPayment(false);
    }
  }, []);

  // Payment Requests
  const createPaymentRequest = useCallback(async (data: any) => {
    try {
      setCreatingPaymentRequest(true);
      setError(null);
      
      const response = await retryWithBackoff(() => PaystackServiceInstance.createPaymentRequest(data));
      console.log('Payment request created:', response);
      return response;
    } catch (err) {
      const errorMessage = handleApiError(err);
      setError(errorMessage);
      console.error('Payment request creation failed:', errorMessage);
      throw new Error(errorMessage);
    } finally {
      setCreatingPaymentRequest(false);
    }
  }, []);

  const getPaymentRequests = useCallback(async (params?: any) => {
    try {
      setLoadingPaymentRequests(true);
      setError(null);
      
      const response = await retryWithBackoff(() => PaystackServiceInstance.getPaymentRequests(params));
      setPaymentRequests((response as any).data || []);
      console.log('Payment requests loaded:', (response as any).data?.length);
    } catch (err) {
      const errorMessage = handleApiError(err);
      setError(errorMessage);
      console.error('Failed to load payment requests:', errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoadingPaymentRequests(false);
    }
  }, []);

  const getPaymentRequest = useCallback(async (requestId: string) => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await retryWithBackoff(() => PaystackServiceInstance.getPaymentRequest(requestId));
      console.log('Payment request details loaded:', response);
      return response;
    } catch (err) {
      const errorMessage = handleApiError(err);
      setError(errorMessage);
      console.error('Failed to load payment request details:', errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, []);

  const cancelPaymentRequest = useCallback(async (requestId: string) => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await retryWithBackoff(() => PaystackServiceInstance.cancelPaymentRequest(requestId));
      console.log('Payment request cancelled:', response);
      return response;
    } catch (err) {
      const errorMessage = handleApiError(err);
      setError(errorMessage);
      console.error('Payment request cancellation failed:', errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, []);

  // Receipts & Documentation
  const generateReceipt = useCallback(async (transactionId: string) => {
    try {
      setLoadingReceipts(true);
      setError(null);
      
      const response = await retryWithBackoff(() => PaystackServiceInstance.generateReceipt(transactionId));
      console.log('Receipt generated:', response);
      return response;
    } catch (err) {
      const errorMessage = handleApiError(err);
      setError(errorMessage);
      console.error('Receipt generation failed:', errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoadingReceipts(false);
    }
  }, []);

  const getReceipt = useCallback(async (receiptId: string) => {
    try {
      setLoadingReceipts(true);
      setError(null);
      
      const response = await retryWithBackoff(() => PaystackServiceInstance.getReceipt(receiptId));
      console.log('Receipt loaded:', response);
      return response;
    } catch (err) {
      const errorMessage = handleApiError(err);
      setError(errorMessage);
      console.error('Failed to load receipt:', errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoadingReceipts(false);
    }
  }, []);

  const downloadReceiptPDF = useCallback(async (receiptId: string) => {
    try {
      setLoadingReceipts(true);
      setError(null);
      
      const response = await retryWithBackoff(() => PaystackServiceInstance.downloadReceiptPDF(receiptId));
      console.log('Receipt PDF downloaded');
      return response;
    } catch (err) {
      const errorMessage = handleApiError(err);
      setError(errorMessage);
      console.error('Receipt PDF download failed:', errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoadingReceipts(false);
    }
  }, []);

  // Contact Management
  const getContacts = useCallback(async () => {
    try {
      setLoadingContacts(true);
      setError(null);
      
      const response = await retryWithBackoff(() => PaystackServiceInstance.getContacts());
      setContacts((response as any).data || []);
      console.log('Contacts loaded:', (response as any).data?.length);
    } catch (err) {
      const errorMessage = handleApiError(err);
      setError(errorMessage);
      console.error('Failed to load contacts:', errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoadingContacts(false);
    }
  }, []);

  const addContact = useCallback(async (data: any) => {
    try {
      setManagingContact(true);
      setError(null);
      
      const response = await retryWithBackoff(() => PaystackServiceInstance.addContact(data));
      console.log('Contact added:', response);
      return response;
    } catch (err) {
      const errorMessage = handleApiError(err);
      setError(errorMessage);
      console.error('Contact addition failed:', errorMessage);
      throw new Error(errorMessage);
    } finally {
      setManagingContact(false);
    }
  }, []);

  const updateContact = useCallback(async (contactId: string, data: any) => {
    try {
      setManagingContact(true);
      setError(null);
      
      const response = await retryWithBackoff(() => PaystackServiceInstance.updateContact(contactId, data));
      console.log('Contact updated:', response);
      return response;
    } catch (err) {
      const errorMessage = handleApiError(err);
      setError(errorMessage);
      console.error('Contact update failed:', errorMessage);
      throw new Error(errorMessage);
    } finally {
      setManagingContact(false);
    }
  }, []);

  const deleteContact = useCallback(async (contactId: string) => {
    try {
      setManagingContact(true);
      setError(null);
      
      const response = await retryWithBackoff(() => PaystackServiceInstance.deleteContact(contactId));
      console.log('Contact deleted:', response);
      return response;
    } catch (err) {
      const errorMessage = handleApiError(err);
      setError(errorMessage);
      console.error('Contact deletion failed:', errorMessage);
      throw new Error(errorMessage);
    } finally {
      setManagingContact(false);
    }
  }, []);

  // KYC & Identity Verification
  const getKYCStatus = useCallback(async (customer: string) => {
    try {
      setLoadingKYC(true);
      setError(null);
      
      const response = await retryWithBackoff(() => PaystackServiceInstance.getKYCStatus(customer));
      console.log('KYC status loaded:', response);
      return response;
    } catch (err) {
      const errorMessage = handleApiError(err);
      setError(errorMessage);
      console.error('Failed to load KYC status:', errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoadingKYC(false);
    }
  }, []);

  const submitKYCDocuments = useCallback(async (data: any) => {
    try {
      setSubmittingKYC(true);
      setError(null);
      
      const response = await retryWithBackoff(() => PaystackServiceInstance.submitKYCDocuments(data));
      console.log('KYC documents submitted:', response);
      return response;
    } catch (err) {
      const errorMessage = handleApiError(err);
      setError(errorMessage);
      console.error('KYC documents submission failed:', errorMessage);
      throw new Error(errorMessage);
    } finally {
      setSubmittingKYC(false);
    }
  }, []);

  const verifyIdentity = useCallback(async (data: any) => {
    try {
      setSubmittingKYC(true);
      setError(null);
      
      const response = await retryWithBackoff(() => PaystackServiceInstance.verifyIdentity(data));
      console.log('Identity verification completed:', response);
      return response;
    } catch (err) {
      const errorMessage = handleApiError(err);
      setError(errorMessage);
      console.error('Identity verification failed:', errorMessage);
      throw new Error(errorMessage);
    } finally {
      setSubmittingKYC(false);
    }
  }, []);

  // Payment Methods
  const getPaymentMethods = useCallback(async (customer: string) => {
    try {
      setLoadingPaymentMethods(true);
      setError(null);
      
      const response = await retryWithBackoff(() => PaystackServiceInstance.getPaymentMethods(customer));
      setPaymentMethods((response as any).data || []);
      console.log('Payment methods loaded:', (response as any).data?.length);
    } catch (err) {
      const errorMessage = handleApiError(err);
      setError(errorMessage);
      console.error('Failed to load payment methods:', errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoadingPaymentMethods(false);
    }
  }, []);

  const addPaymentMethod = useCallback(async (data: any) => {
    try {
      setManagingPaymentMethod(true);
      setError(null);
      
      const response = await retryWithBackoff(() => PaystackServiceInstance.addPaymentMethod(data));
      console.log('Payment method added:', response);
      return response;
    } catch (err) {
      const errorMessage = handleApiError(err);
      setError(errorMessage);
      console.error('Payment method addition failed:', errorMessage);
      throw new Error(errorMessage);
    } finally {
      setManagingPaymentMethod(false);
    }
  }, []);

  const removePaymentMethod = useCallback(async (methodId: string) => {
    try {
      setManagingPaymentMethod(true);
      setError(null);
      
      const response = await retryWithBackoff(() => PaystackServiceInstance.removePaymentMethod(methodId));
      console.log('Payment method removed:', response);
      return response;
    } catch (err) {
      const errorMessage = handleApiError(err);
      setError(errorMessage);
      console.error('Payment method removal failed:', errorMessage);
      throw new Error(errorMessage);
    } finally {
      setManagingPaymentMethod(false);
    }
  }, []);

  const setDefaultPaymentMethod = useCallback(async (customer: string, methodId: string) => {
    try {
      setManagingPaymentMethod(true);
      setError(null);
      
      const response = await retryWithBackoff(() => PaystackServiceInstance.setDefaultPaymentMethod(customer, methodId));
      console.log('Default payment method set:', response);
      return response;
    } catch (err) {
      const errorMessage = handleApiError(err);
      setError(errorMessage);
      console.error('Setting default payment method failed:', errorMessage);
      throw new Error(errorMessage);
    } finally {
      setManagingPaymentMethod(false);
    }
  }, []);

  // Advanced Transaction Management
  const getFilteredTransactions = useCallback(async (filters: any) => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await retryWithBackoff(() => PaystackServiceInstance.getFilteredTransactions(filters));
      console.log('Filtered transactions loaded:', response);
      return response;
    } catch (err) {
      const errorMessage = handleApiError(err);
      setError(errorMessage);
      console.error('Failed to load filtered transactions:', errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, []);

  const exportTransactions = useCallback(async (format: 'csv' | 'excel' | 'pdf', filters?: any) => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await retryWithBackoff(() => PaystackServiceInstance.exportTransactions(format, filters));
      console.log('Transactions exported');
      return response;
    } catch (err) {
      const errorMessage = handleApiError(err);
      setError(errorMessage);
      console.error('Transactions export failed:', errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, []);

  // Top-up & Add Money
  const getTopupMethods = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await retryWithBackoff(() => PaystackServiceInstance.getTopupMethods());
      console.log('Topup methods loaded:', response);
      return response;
    } catch (err) {
      const errorMessage = handleApiError(err);
      setError(errorMessage);
      console.error('Failed to load topup methods:', errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, []);

  const initiateTopup = useCallback(async (data: any) => {
    try {
      setInitiatingTopup(true);
      setError(null);
      
      const response = await retryWithBackoff(() => PaystackServiceInstance.initiateTopup(data));
      console.log('Topup initiated:', response);
      return response;
    } catch (err) {
      const errorMessage = handleApiError(err);
      setError(errorMessage);
      console.error('Topup initiation failed:', errorMessage);
      throw new Error(errorMessage);
    } finally {
      setInitiatingTopup(false);
    }
  }, []);

  // Cashout & Withdrawal
  const getWithdrawalMethods = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await retryWithBackoff(() => PaystackServiceInstance.getWithdrawalMethods());
      console.log('Withdrawal methods loaded:', response);
      return response;
    } catch (err) {
      const errorMessage = handleApiError(err);
      setError(errorMessage);
      console.error('Failed to load withdrawal methods:', errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, []);

  const initiateWithdrawal = useCallback(async (data: any) => {
    try {
      setInitiatingWithdrawal(true);
      setError(null);
      
      const response = await retryWithBackoff(() => PaystackServiceInstance.initiateWithdrawal(data));
      console.log('Withdrawal initiated:', response);
      return response;
    } catch (err) {
      const errorMessage = handleApiError(err);
      setError(errorMessage);
      console.error('Withdrawal initiation failed:', errorMessage);
      throw new Error(errorMessage);
    } finally {
      setInitiatingWithdrawal(false);
    }
  }, []);

  const getWithdrawalStatus = useCallback(async (reference: string) => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await retryWithBackoff(() => PaystackServiceInstance.getWithdrawalStatus(reference));
      console.log('Withdrawal status loaded:', response);
      return response;
    } catch (err) {
      const errorMessage = handleApiError(err);
      setError(errorMessage);
      console.error('Failed to load withdrawal status:', errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, []);

  // Data Plans Methods
  const getAllDataPlans = useCallback(async () => {
    try {
      setLoadingDataPlans(true);
      setError(null);
      
      // For now, use getBillServices to get data plan services
      const response = await retryWithBackoff(() => PaystackServiceInstance.getBillServices());
      
      // Extract data plan services
      const dataServices = (response as any).data?.filter((service: any) => 
        service.name?.toLowerCase().includes('data') || 
        service.category?.toLowerCase().includes('data')
      ) || [];
      
      setDataPlans(dataServices);
      setNetworkDataPlans(dataServices);
      
      console.log('All data plans loaded:', dataServices);
    } catch (err) {
      const errorMessage = handleApiError(err);
      setError(errorMessage);
      console.error('Failed to load data plans:', errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoadingDataPlans(false);
    }
  }, []);

  const getDataPlansByNetwork = useCallback(async (network: 'mtn' | 'glo' | 'airtel' | '9mobile') => {
    try {
      setLoadingDataPlans(true);
      setError(null);
      
      const response = await retryWithBackoff(() => PaystackServiceInstance.getBillServices());
      // Filter by network from the response
      const networkPlans = (response as any).data?.filter((service: any) => 
        service.name?.toLowerCase().includes(network.toLowerCase()) &&
        (service.name?.toLowerCase().includes('data') || service.category?.toLowerCase().includes('data'))
      ) || [];
      
      console.log(`${network.toUpperCase()} data plans loaded:`, networkPlans);
      return { data: networkPlans };
    } catch (err) {
      const errorMessage = handleApiError(err);
      setError(errorMessage);
      console.error(`Failed to load ${network} data plans:`, errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoadingDataPlans(false);
    }
  }, []);

  const purchaseDataPlan = useCallback(async (data: any) => {
    try {
      setPurchasingData(true);
      setError(null);
      
      const response = await retryWithBackoff(() => PaystackServiceInstance.payBill(data));
      console.log('Data plan purchase successful:', response);
      return response;
    } catch (err) {
      const errorMessage = handleApiError(err);
      setError(errorMessage);
      console.error('Data plan purchase failed:', errorMessage);
      throw new Error(errorMessage);
    } finally {
      setPurchasingData(false);
    }
  }, []);

  const buyDataPlan = useCallback(async (data: any) => {
    try {
      setPurchasingData(true);
      setError(null);
      
      const response = await retryWithBackoff(() => PaystackServiceInstance.payBill(data));
      console.log('Smart data plan purchase successful:', response);
      return response;
    } catch (err) {
      const errorMessage = handleApiError(err);
      setError(errorMessage);
      console.error('Smart data plan purchase failed:', errorMessage);
      throw new Error(errorMessage);
    } finally {
      setPurchasingData(false);
    }
  }, []);

  const getPopularDataPlans = useCallback(async () => {
    try {
      setLoadingDataPlans(true);
      setError(null);
      
      const response = await retryWithBackoff(() => PaystackServiceInstance.getBillServices());
      // Extract popular data plans (could be first few from each network)
      const popularPlans = (response as any).data?.filter((service: any) => 
        service.name?.toLowerCase().includes('data') || 
        service.category?.toLowerCase().includes('data')
      ).slice(0, 10) || [];
      
      setDataPlans(popularPlans);
      console.log('Popular data plans loaded:', popularPlans);
    } catch (err) {
      const errorMessage = handleApiError(err);
      setError(errorMessage);
      console.error('Failed to load popular data plans:', errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoadingDataPlans(false);
    }
  }, []);

  const getDataPlansByPriceRange = useCallback(async (minPrice: number, maxPrice: number) => {
    try {
      setLoadingDataPlans(true);
      setError(null);
      
      const response = await retryWithBackoff(() => PaystackServiceInstance.getBillServices());
      // Filter by price range
      const filteredPlans = (response as any).data?.filter((service: any) => 
        (service.name?.toLowerCase().includes('data') || service.category?.toLowerCase().includes('data')) &&
        service.price >= minPrice && service.price <= maxPrice
      ) || [];
      
      console.log(`Data plans in price range ₦${minPrice}-₦${maxPrice} loaded:`, filteredPlans);
      return { data: filteredPlans };
    } catch (err) {
      const errorMessage = handleApiError(err);
      setError(errorMessage);
      console.error(`Failed to load data plans in price range ₦${minPrice}-₦${maxPrice}:`, errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoadingDataPlans(false);
    }
  }, []);

  const getDataPlansByValidity = useCallback(async (validityType: 'daily' | 'weekly' | 'monthly' | 'yearly') => {
    try {
      setLoadingDataPlans(true);
      setError(null);
      
      const response = await retryWithBackoff(() => PaystackServiceInstance.getBillServices());
      // Filter by validity type
      const filteredPlans = (response as any).data?.filter((service: any) => 
        (service.name?.toLowerCase().includes('data') || service.category?.toLowerCase().includes('data')) &&
        service.validity?.toLowerCase().includes(validityType.toLowerCase())
      ) || [];
      
      console.log(`${validityType} data plans loaded:`, filteredPlans);
      return { data: filteredPlans };
    } catch (err) {
      const errorMessage = handleApiError(err);
      setError(errorMessage);
      console.error(`Failed to load ${validityType} data plans:`, errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoadingDataPlans(false);
    }
  }, []);

  const getDataPurchaseHistory = useCallback(async (params?: any) => {
    try {
      setLoading(true);
      setError(null);
      
      // Use getTransactions as fallback for data purchase history
      const response = await retryWithBackoff(() => PaystackServiceInstance.getTransactions(params));
      console.log('Data purchase history loaded:', response);
      return response;
    } catch (err) {
      const errorMessage = handleApiError(err);
      setError(errorMessage);
      console.error('Failed to load data purchase history:', errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    // Loading states
    loading,
    initializingPayment,
    verifyingPayment,
    loadingBanks,
    resolvingAccount,
    loadingBillsServices,
    payingBill,
    purchasingAirtime,
    loadingDataPlans,
    purchasingData,
    loadingElectricity,
    payingElectricity,
    loadingCableTV,
    payingCableTV,
    loadingBetting,
    fundingBetting,
    loadingVirtualCards,
    managingVirtualCard,
    generatingQR,
    processingQRPayment,
    loadingPaymentRequests,
    creatingPaymentRequest,
    loadingReceipts,
    loadingContacts,
    managingContact,
    loadingKYC,
    submittingKYC,
    loadingPaymentMethods,
    managingPaymentMethod,
    initiatingTopup,
    initiatingWithdrawal,
    
    // Data
    banks,
    billsServices,
    dataPlans,
    networkDataPlans,
    electricityProviders,
    cableTVProviders,
    bettingProviders,
    virtualCards,
    paymentRequests,
    contacts,
    paymentMethods,
    
    // Core Payment Methods
    initializePayment,
    verifyPayment,
    getBanks,
    resolveAccount,
    createTransferRecipient,
    initiateTransfer,
    getTransactions,
    getFilteredTransactions,
    exportTransactions,
    checkHealth,
    
    // Bills & Utilities
    getBillsServices,
    getBillCategories,
    validateBillCustomer,
    payBill,
    getBillPayments,
    purchaseAirtime,
    buyAirtime,
    
    // Electricity Services
    getElectricityProviders,
    validateElectricityMeter,
    payElectricityBill,
    
    // Cable TV Services
    getCableTVProviders,
    getCableTVPlans,
    validateCableTVCustomer,
    payCableTVSubscription,
    
    // Betting Services
    getBettingProviders,
    validateBettingCustomer,
    fundBettingWallet,
    
    // Virtual Cards
    getVirtualCards,
    createVirtualCard,
    getVirtualCard,
    fundVirtualCard,
    toggleVirtualCardStatus,
    
    // QR Code Services
    generateQRCode,
    getQRCode,
    processQRPayment,
    
    // Payment Requests
    createPaymentRequest,
    getPaymentRequests,
    getPaymentRequest,
    cancelPaymentRequest,
    
    // Receipts & Documentation
    generateReceipt,
    getReceipt,
    downloadReceiptPDF,
    
    // Contact Management
    getContacts,
    addContact,
    updateContact,
    deleteContact,
    
    // KYC & Identity Verification
    getKYCStatus,
    submitKYCDocuments,
    verifyIdentity,
    
    // Payment Methods
    getPaymentMethods,
    addPaymentMethod,
    removePaymentMethod,
    setDefaultPaymentMethod,
    
    // Top-up & Add Money
    getTopupMethods,
    initiateTopup,
    
    // Cashout & Withdrawal
    getWithdrawalMethods,
    initiateWithdrawal,
    getWithdrawalStatus,
    
    // Data Plans
    getAllDataPlans,
    getDataPlansByNetwork,
    purchaseDataPlan,
    buyDataPlan,
    getPopularDataPlans,
    getDataPlansByPriceRange,
    getDataPlansByValidity,
    getDataPurchaseHistory,
    
    // Error handling
    error,
    clearError,
  };
};
