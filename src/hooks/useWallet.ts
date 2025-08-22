import { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import WalletService, { WalletBalance } from '../services/WalletService';
import AppwriteService from '../services/AppwriteService';

interface UseWalletResult {
  balance: WalletBalance | null;
  loading: boolean;
  error: string | null;
  refreshBalance: () => Promise<void>;
}

export const useWallet = (): UseWalletResult => {
  const { user } = useAuth();
  const [balance, setBalance] = useState<WalletBalance | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refreshBalance = async () => {
    if (!user) {
      setError('User not authenticated');
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
      // Get the user ID with proper fallback handling
      let userId = user.id || (user as any).$id;
      
      // For demo user, try to get real user from database first
      if (user.email === 'demo@kotapay.com' || userId === '1' || userId === 'demo_user') {
        console.log('🎯 Demo user detected, attempting database lookup...');
        
        try {
          // Try to find the real demo user in the database
          const demoUserFromDB = await AppwriteService.getUserByEmail('demo@kotapay.com');
          if (demoUserFromDB) {
            userId = demoUserFromDB.userId;
            console.log('✅ Found demo user in database with ID:', userId);
          } else {
            console.log('⚠️  Demo user not found in database, using fallback ID');
            userId = 'demo_user';
          }
        } catch {
          console.log('📡 Database not accessible, using fallback demo ID');
          userId = 'demo_user';
        }
      }
      
      // Initialize wallet service
      await WalletService.initialize(userId);
      
      // Get current balance
      const currentBalance = await WalletService.getWalletBalance();
      setBalance(currentBalance);
      
      console.log('💰 Wallet balance loaded:', currentBalance);
      
    } catch (err) {
      console.error('Error fetching wallet balance:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch balance');
      
      // Fallback to mock mode on error
      console.log('🎭 Database error, enabling mock mode...');
      WalletService.enableMockMode();
      try {
        const mockBalance = await WalletService.getWalletBalance();
        setBalance(mockBalance);
        setError(null);
        console.log('🎭 Mock balance loaded successfully');
      } catch (mockError) {
        console.error('Even mock mode failed:', mockError);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refreshBalance();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  return {
    balance,
    loading,
    error,
    refreshBalance,
  };
};

export default useWallet;
