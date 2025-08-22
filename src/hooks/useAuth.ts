/**
 * Authentication Hook
 * Integrates KYC system with JWT token management
 */

import { useState, useEffect, useCallback } from 'react';
import { authTokenService, TokenPayload } from '../services/AuthTokenService';
import { kycService, UserKYCProfile } from '../services/KYCService';
import { notificationService } from '../services/notifications';

export interface AuthState {
  isAuthenticated: boolean;
  isLoading: boolean;
  user: TokenPayload | null;
  kycProfile: UserKYCProfile | null;
  error: string | null;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface OTPVerificationRequest {
  phoneNumber: string;
  otpCode: string;
  purpose: 'registration' | 'login' | 'transaction' | 'kyc_upgrade';
}

export interface RegistrationRequest {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  password: string;
  confirmPassword: string;
}

export interface UseAuthReturn {
  // State
  auth: AuthState;
  
  // Authentication methods
  login: (credentials: LoginRequest) => Promise<boolean>;
  logout: () => Promise<void>;
  register: (data: RegistrationRequest) => Promise<boolean>;
  
  // OTP methods
  sendOTP: (phoneNumber: string, purpose?: 'registration' | 'login' | 'transaction' | 'kyc_upgrade') => Promise<string>;
  verifyOTP: (request: OTPVerificationRequest) => Promise<boolean>;
  
  // KYC methods
  updateBasicInfo: (info: { firstName: string; lastName: string; dateOfBirth: string }) => Promise<void>;
  uploadGovernmentID: (documents: {
    frontImage: File | string;
    backImage: File | string;
    documentType: 'national_id' | 'passport' | 'drivers_license';
    documentNumber: string;
    expiryDate?: string;
  }) => Promise<string>;
  uploadSelfie: (selfieImage: File | string) => Promise<string>;
  uploadAddressProof: (documents: {
    proofImage: File | string;
    documentType: 'utility_bill' | 'bank_statement';
    address: {
      street: string;
      city: string;
      state: string;
      country: string;
      postalCode: string;
    };
  }) => Promise<string>;
  
  // Transaction validation
  checkTransactionLimits: (amount: number) => Promise<{
    canProceed: boolean;
    reason?: string;
    currentTier: number;
    monthlyRemaining: number;
    dailyRemaining: number;
  }>;
  
  // Utility methods
  refreshAuth: () => Promise<void>;
  hasPermission: (permission: string) => Promise<boolean>;
  getKYCTier: () => 1 | 2 | 3 | null;
}

export const useAuth = (): UseAuthReturn => {
  const [auth, setAuth] = useState<AuthState>({
    isAuthenticated: false,
    isLoading: true,
    user: null,
    kycProfile: null,
    error: null
  });

  // Generate device ID for device binding
  const generateDeviceId = useCallback((): string => {
    // In production, use a more sophisticated device fingerprinting
    return `device_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }, []);

  // Initialize authentication state
  const initializeAuth = useCallback(async () => {
    try {
      setAuth(prev => ({ ...prev, isLoading: true, error: null }));

      const isAuthenticated = await authTokenService.isAuthenticated();
      
      if (isAuthenticated) {
        const user = await authTokenService.getTokenPayload();
        const kycProfile = user ? await kycService.getUserKYCProfile(user.userId) : null;
        
        setAuth({
          isAuthenticated: true,
          isLoading: false,
          user,
          kycProfile,
          error: null
        });
      } else {
        setAuth({
          isAuthenticated: false,
          isLoading: false,
          user: null,
          kycProfile: null,
          error: null
        });
      }
    } catch (error) {
      console.error('Error initializing auth:', error);
      setAuth({
        isAuthenticated: false,
        isLoading: false,
        user: null,
        kycProfile: null,
        error: 'Failed to initialize authentication'
      });
    }
  }, []);

  // Login user
  const login = useCallback(async (credentials: LoginRequest): Promise<boolean> => {
    try {
      setAuth(prev => ({ ...prev, isLoading: true, error: null }));

      const deviceId = generateDeviceId();
      const tokens = await authTokenService.login({
        ...credentials,
        deviceId
      });

      if (tokens) {
        const user = await authTokenService.getTokenPayload();
        const kycProfile = user ? await kycService.getUserKYCProfile(user.userId) : null;

        setAuth({
          isAuthenticated: true,
          isLoading: false,
          user,
          kycProfile,
          error: null
        });

        // Send login notification
        if (user) {
          await notificationService.scheduleNotification({
            title: '👋 Welcome back!',
            body: `Logged in successfully from ${deviceId}`,
            data: {
              type: 'email_notification',
              transactionId: `login_${Date.now()}`,
              senderName: 'KotaPay Security',
              emailSubject: 'Login Notification'
            },
            icon: '🔐'
          });
        }

        return true;
      } else {
        setAuth(prev => ({
          ...prev,
          isLoading: false,
          error: 'Invalid credentials'
        }));
        return false;
      }
    } catch (error) {
      console.error('Login error:', error);
      setAuth(prev => ({
        ...prev,
        isLoading: false,
        error: 'Login failed. Please try again.'
      }));
      return false;
    }
  }, [generateDeviceId]);

  // Register new user
  const register = useCallback(async (data: RegistrationRequest): Promise<boolean> => {
    try {
      setAuth(prev => ({ ...prev, isLoading: true, error: null }));

      // Validate passwords match
      if (data.password !== data.confirmPassword) {
        setAuth(prev => ({
          ...prev,
          isLoading: false,
          error: 'Passwords do not match'
        }));
        return false;
      }

      // Initialize KYC profile
      await kycService.initializeKYCProfile('new_user_' + Date.now(), data.phone);

      // Mock user registration - in production, call your backend
      console.log('📝 Registering user:', data);
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Auto-login after registration
      const loginSuccess = await login({
        email: data.email,
        password: data.password
      });

      if (loginSuccess) {
        // Send welcome notification
        await notificationService.scheduleNotification({
          title: '🎉 Welcome to KotaPay!',
          body: 'Your account has been created successfully',
          data: {
            type: 'email_notification',
            transactionId: `registration_${Date.now()}`,
            senderName: 'KotaPay Team',
            emailSubject: 'Welcome to KotaPay'
          },
          icon: '🎉'
        });

        // Prompt for phone verification
        await notificationService.scheduleNotification({
          title: '📱 Verify Your Phone',
          body: 'Complete phone verification to unlock Tier 1 features',
          data: {
            type: 'kyc_tier_upgraded',
            transactionId: `phone_verify_prompt_${Date.now()}`,
            kycTier: 1
          },
          icon: '📱'
        });
      }

      return loginSuccess;
    } catch (error) {
      console.error('Registration error:', error);
      setAuth(prev => ({
        ...prev,
        isLoading: false,
        error: 'Registration failed. Please try again.'
      }));
      return false;
    }
  }, [login]);

  // Send OTP
  const sendOTP = useCallback(async (
    phoneNumber: string, 
    purpose: 'registration' | 'login' | 'transaction' | 'kyc_upgrade' = 'registration'
  ): Promise<string> => {
    try {
      const otpCode = await kycService.sendOTP(phoneNumber, purpose);
      
      // Send notification about OTP
      await notificationService.scheduleNotification({
        title: '📱 OTP Sent',
        body: `Verification code sent to ${phoneNumber}`,
        data: {
          type: 'email_notification',
          transactionId: `otp_${Date.now()}`,
          senderName: 'KotaPay Security',
          emailSubject: 'OTP Verification'
        },
        icon: '📱'
      });

      return otpCode;
    } catch (error) {
      console.error('Error sending OTP:', error);
      throw error;
    }
  }, []);

  // Verify OTP
  const verifyOTP = useCallback(async (request: OTPVerificationRequest): Promise<boolean> => {
    try {
      const isVerified = await kycService.verifyOTP(request.phoneNumber, request.otpCode);
      
      if (isVerified && auth.user) {
        // Refresh KYC profile
        const updatedProfile = await kycService.getUserKYCProfile(auth.user.userId);
        setAuth(prev => ({
          ...prev,
          kycProfile: updatedProfile
        }));

        // Send success notification
        await notificationService.scheduleNotification({
          title: '✅ Phone Verified!',
          body: 'Your phone number has been verified successfully',
          data: {
            type: 'kyc_tier_upgraded',
            transactionId: `phone_verified_${Date.now()}`,
            kycTier: 1
          },
          icon: '✅'
        });
      }

      return isVerified;
    } catch (error) {
      console.error('Error verifying OTP:', error);
      throw error;
    }
  }, [auth.user]);

  // Update basic information
  const updateBasicInfo = useCallback(async (info: {
    firstName: string;
    lastName: string;
    dateOfBirth: string;
  }) => {
    if (!auth.user) throw new Error('User not authenticated');

    try {
      await kycService.updateBasicInfo(auth.user.userId, info);
      
      // Refresh KYC profile
      const updatedProfile = await kycService.getUserKYCProfile(auth.user.userId);
      setAuth(prev => ({
        ...prev,
        kycProfile: updatedProfile
      }));
    } catch (error) {
      console.error('Error updating basic info:', error);
      throw error;
    }
  }, [auth.user]);

  // Upload government ID
  const uploadGovernmentID = useCallback(async (documents: {
    frontImage: File | string;
    backImage: File | string;
    documentType: 'national_id' | 'passport' | 'drivers_license';
    documentNumber: string;
    expiryDate?: string;
  }): Promise<string> => {
    if (!auth.user) throw new Error('User not authenticated');

    try {
      const documentId = await kycService.uploadGovernmentID(auth.user.userId, documents);
      
      // Refresh KYC profile
      const updatedProfile = await kycService.getUserKYCProfile(auth.user.userId);
      setAuth(prev => ({
        ...prev,
        kycProfile: updatedProfile
      }));

      return documentId;
    } catch (error) {
      console.error('Error uploading government ID:', error);
      throw error;
    }
  }, [auth.user]);

  // Upload selfie
  const uploadSelfie = useCallback(async (selfieImage: File | string): Promise<string> => {
    if (!auth.user) throw new Error('User not authenticated');

    try {
      const documentId = await kycService.uploadSelfie(auth.user.userId, selfieImage);
      
      // Refresh KYC profile
      const updatedProfile = await kycService.getUserKYCProfile(auth.user.userId);
      setAuth(prev => ({
        ...prev,
        kycProfile: updatedProfile
      }));

      return documentId;
    } catch (error) {
      console.error('Error uploading selfie:', error);
      throw error;
    }
  }, [auth.user]);

  // Upload address proof
  const uploadAddressProof = useCallback(async (documents: {
    proofImage: File | string;
    documentType: 'utility_bill' | 'bank_statement';
    address: {
      street: string;
      city: string;
      state: string;
      country: string;
      postalCode: string;
    };
  }): Promise<string> => {
    if (!auth.user) throw new Error('User not authenticated');

    try {
      const documentId = await kycService.uploadAddressProof(auth.user.userId, documents);
      
      // Refresh KYC profile
      const updatedProfile = await kycService.getUserKYCProfile(auth.user.userId);
      setAuth(prev => ({
        ...prev,
        kycProfile: updatedProfile
      }));

      return documentId;
    } catch (error) {
      console.error('Error uploading address proof:', error);
      throw error;
    }
  }, [auth.user]);

  // Check transaction limits
  const checkTransactionLimits = useCallback(async (amount: number) => {
    if (!auth.user) {
      throw new Error('User not authenticated');
    }

    return await kycService.checkTransactionLimits(auth.user.userId, amount);
  }, [auth.user]);

  // Logout user
  const logout = useCallback(async () => {
    try {
      await authTokenService.logout();
      setAuth({
        isAuthenticated: false,
        isLoading: false,
        user: null,
        kycProfile: null,
        error: null
      });
    } catch (error) {
      console.error('Logout error:', error);
      // Force logout even if API call fails
      setAuth({
        isAuthenticated: false,
        isLoading: false,
        user: null,
        kycProfile: null,
        error: null
      });
    }
  }, []);

  // Refresh authentication state
  const refreshAuth = useCallback(async () => {
    await initializeAuth();
  }, [initializeAuth]);

  // Check permissions
  const hasPermission = useCallback(async (permission: string): Promise<boolean> => {
    return await authTokenService.hasPermission(permission);
  }, []);

  // Get KYC tier
  const getKYCTier = useCallback((): 1 | 2 | 3 | null => {
    return auth.kycProfile?.currentTier || null;
  }, [auth.kycProfile]);

  // Initialize on mount
  useEffect(() => {
    initializeAuth();
  }, [initializeAuth]);

  return {
    auth,
    login,
    logout,
    register,
    sendOTP,
    verifyOTP,
    updateBasicInfo,
    uploadGovernmentID,
    uploadSelfie,
    uploadAddressProof,
    checkTransactionLimits,
    refreshAuth,
    hasPermission,
    getKYCTier
  };
};
