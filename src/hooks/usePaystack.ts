import { useCallback, useState } from 'react';
import PaystackService, { PaymentData, TransferRecipientData } from '../services/PaystackService';
import { handleApiError, retryWithBackoff } from '../utils/apiError';

export interface UsePaystackReturn {
  // Loading states
  loading: boolean;
  initializingPayment: boolean;
  verifyingPayment: boolean;
  loadingBanks: boolean;
  resolvingAccount: boolean;
  
  // Data
  banks: any[];
  
  // Methods
  initializePayment: (data: PaymentData) => Promise<any>;
  verifyPayment: (reference: string) => Promise<any>;
  getBanks: () => Promise<void>;
  resolveAccount: (accountNumber: string, bankCode: string) => Promise<any>;
  createTransferRecipient: (data: TransferRecipientData) => Promise<any>;
  initiateTransfer: (data: any) => Promise<any>;
  getTransactions: (params?: any) => Promise<any>;
  checkHealth: () => Promise<any>;
  
  // Error handling
  error: string | null;
  clearError: () => void;
}

export const usePaystack = (): UsePaystackReturn => {
  const [loading, setLoading] = useState(false);
  const [initializingPayment, setInitializingPayment] = useState(false);
  const [verifyingPayment, setVerifyingPayment] = useState(false);
  const [loadingBanks, setLoadingBanks] = useState(false);
  const [resolvingAccount, setResolvingAccount] = useState(false);
  const [banks, setBanks] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const checkHealth = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await retryWithBackoff(() => PaystackService.checkHealth());
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
      
      const response = await retryWithBackoff(() => PaystackService.initializePayment(data));
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
      
      const response = await retryWithBackoff(() => PaystackService.verifyPayment(reference));
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
      
      const response = await retryWithBackoff(() => PaystackService.getBanks());
      setBanks(response.data || []);
      console.log('Banks loaded:', response.data?.length);
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
        PaystackService.resolveAccount(accountNumber, bankCode)
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
      
      const response = await retryWithBackoff(() => PaystackService.createTransferRecipient(data));
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
      
      const response = await retryWithBackoff(() => PaystackService.initiateTransfer(data));
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
      
      const response = await retryWithBackoff(() => PaystackService.getTransactions(params));
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

  return {
    // Loading states
    loading,
    initializingPayment,
    verifyingPayment,
    loadingBanks,
    resolvingAccount,
    
    // Data
    banks,
    
    // Methods
    initializePayment,
    verifyPayment,
    getBanks,
    resolveAccount,
    createTransferRecipient,
    initiateTransfer,
    getTransactions,
    checkHealth,
    
    // Error handling
    error,
    clearError,
  };
};
