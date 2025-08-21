import { useState, useCallback } from 'react';

export type LoadingState = 'idle' | 'loading' | 'processing' | 'confirming' | 'success' | 'error';

interface UseLoadingOptions {
  defaultMessage?: string;
  successDuration?: number;
  errorDuration?: number;
}

interface LoadingControls {
  isLoading: boolean;
  loadingState: LoadingState;
  loadingMessage: string;
  startLoading: (message?: string) => void;
  setProcessing: (message?: string) => void;
  setConfirming: (message?: string) => void;
  setSuccess: (message?: string) => void;
  setError: (message?: string) => void;
  stopLoading: () => void;
  executeWithLoading: <T>(
    operation: () => Promise<T>,
    messages?: {
      loading?: string;
      processing?: string;
      confirming?: string;
      success?: string;
      error?: string;
    }
  ) => Promise<T>;
}

export const useLoading = (options: UseLoadingOptions = {}): LoadingControls => {
  const {
    defaultMessage = 'Loading...',
    successDuration = 2000,
    errorDuration = 3000,
  } = options;

  const [loadingState, setLoadingState] = useState<LoadingState>('idle');
  const [loadingMessage, setLoadingMessage] = useState<string>(defaultMessage);

  const isLoading = loadingState !== 'idle';

  const startLoading = useCallback((message?: string) => {
    setLoadingState('loading');
    setLoadingMessage(message || defaultMessage);
  }, [defaultMessage]);

  const setProcessing = useCallback((message?: string) => {
    setLoadingState('processing');
    setLoadingMessage(message || 'Processing...');
  }, []);

  const setConfirming = useCallback((message?: string) => {
    setLoadingState('confirming');
    setLoadingMessage(message || 'Confirming...');
  }, []);

  const setSuccess = useCallback((message?: string) => {
    setLoadingState('success');
    setLoadingMessage(message || 'Success!');
    
    setTimeout(() => {
      setLoadingState('idle');
    }, successDuration);
  }, [successDuration]);

  const setError = useCallback((message?: string) => {
    setLoadingState('error');
    setLoadingMessage(message || 'Something went wrong');
    
    setTimeout(() => {
      setLoadingState('idle');
    }, errorDuration);
  }, [errorDuration]);

  const stopLoading = useCallback(() => {
    setLoadingState('idle');
  }, []);

  const executeWithLoading = useCallback(async <T>(
    operation: () => Promise<T>,
    messages: {
      loading?: string;
      processing?: string;
      confirming?: string;
      success?: string;
      error?: string;
    } = {}
  ): Promise<T> => {
    try {
      // Start loading
      startLoading(messages.loading);
      
      // Optional processing phase
      if (messages.processing) {
        await new Promise(resolve => setTimeout(resolve, 500));
        setProcessing(messages.processing);
      }
      
      // Execute the operation
      const result = await operation();
      
      // Optional confirming phase
      if (messages.confirming) {
        await new Promise(resolve => setTimeout(resolve, 800));
        setConfirming(messages.confirming);
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
      
      // Success
      setSuccess(messages.success);
      
      return result;
    } catch (error) {
      // Error
      setError(messages.error || (error as Error).message);
      throw error;
    }
  }, [startLoading, setProcessing, setConfirming, setSuccess, setError]);

  return {
    isLoading,
    loadingState,
    loadingMessage,
    startLoading,
    setProcessing,
    setConfirming,
    setSuccess,
    setError,
    stopLoading,
    executeWithLoading,
  };
};
