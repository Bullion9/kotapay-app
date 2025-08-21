import { useState, useEffect } from 'react';

interface UsePageLoadingProps {
  duration?: number;
  simulateDelay?: boolean;
}

interface UsePageLoadingReturn {
  isPageLoading: boolean;
  setPageLoading: (loading: boolean) => void;
  startPageLoad: () => void;
  finishPageLoad: () => void;
}

export const usePageLoading = ({ 
  duration = 800, 
  simulateDelay = true 
}: UsePageLoadingProps = {}): UsePageLoadingReturn => {
  const [isPageLoading, setIsPageLoading] = useState(true);

  const setPageLoading = (loading: boolean) => {
    setIsPageLoading(loading);
  };

  const startPageLoad = () => {
    setIsPageLoading(true);
  };

  const finishPageLoad = () => {
    if (simulateDelay) {
      // Add a small delay for smooth animation
      setTimeout(() => {
        setIsPageLoading(false);
      }, duration);
    } else {
      setIsPageLoading(false);
    }
  };

  // Automatically finish loading on mount (for most pages)
  useEffect(() => {
    if (simulateDelay) {
      const timer = setTimeout(() => {
        setIsPageLoading(false);
      }, duration);

      return () => clearTimeout(timer);
    } else {
      setIsPageLoading(false);
    }
  }, [duration, simulateDelay]);

  return {
    isPageLoading,
    setPageLoading,
    startPageLoad,
    finishPageLoad,
  };
};
