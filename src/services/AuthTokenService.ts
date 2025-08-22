/**
 * Authentication Token Service
 * Handles JWT tokens and refresh tokens stored in SecureStore
 */

import * as SecureStore from 'expo-secure-store';
import { jwtDecode } from 'jwt-decode';

export interface TokenPayload {
  userId: string;
  email: string;
  phone: string;
  kycTier: 1 | 2 | 3;
  permissions: string[];
  iat: number;
  exp: number;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  expiresAt: number;
}

export interface LoginCredentials {
  email: string;
  password: string;
  deviceId: string;
}

export interface RefreshTokenResponse {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
}

class AuthTokenService {
  private readonly ACCESS_TOKEN_KEY = 'kotapay_access_token';
  private readonly REFRESH_TOKEN_KEY = 'kotapay_refresh_token';
  private readonly TOKEN_EXPIRY_KEY = 'kotapay_token_expiry';
  private readonly DEVICE_ID_KEY = 'kotapay_device_id';

  // Store tokens securely
  async storeTokens(tokens: AuthTokens): Promise<void> {
    try {
      await Promise.all([
        SecureStore.setItemAsync(this.ACCESS_TOKEN_KEY, tokens.accessToken),
        SecureStore.setItemAsync(this.REFRESH_TOKEN_KEY, tokens.refreshToken),
        SecureStore.setItemAsync(this.TOKEN_EXPIRY_KEY, tokens.expiresAt.toString())
      ]);

      console.log('✅ Tokens stored securely');
    } catch (error) {
      console.error('Error storing tokens:', error);
      throw error;
    }
  }

  // Get access token
  async getAccessToken(): Promise<string | null> {
    try {
      const token = await SecureStore.getItemAsync(this.ACCESS_TOKEN_KEY);
      
      if (!token) {
        return null;
      }

      // Check if token is expired
      if (await this.isTokenExpired()) {
        console.log('🔄 Access token expired, attempting refresh...');
        const refreshed = await this.refreshAccessToken();
        return refreshed ? await SecureStore.getItemAsync(this.ACCESS_TOKEN_KEY) : null;
      }

      return token;
    } catch (error) {
      console.error('Error getting access token:', error);
      return null;
    }
  }

  // Get refresh token
  async getRefreshToken(): Promise<string | null> {
    try {
      return await SecureStore.getItemAsync(this.REFRESH_TOKEN_KEY);
    } catch (error) {
      console.error('Error getting refresh token:', error);
      return null;
    }
  }

  // Check if token is expired
  async isTokenExpired(): Promise<boolean> {
    try {
      const expiryStr = await SecureStore.getItemAsync(this.TOKEN_EXPIRY_KEY);
      if (!expiryStr) return true;

      const expiry = parseInt(expiryStr, 10);
      const now = Date.now();
      
      // Add 5-minute buffer
      return now >= (expiry - 5 * 60 * 1000);
    } catch (error) {
      console.error('Error checking token expiry:', error);
      return true;
    }
  }

  // Decode JWT token payload
  async getTokenPayload(): Promise<TokenPayload | null> {
    try {
      const token = await this.getAccessToken();
      if (!token) return null;

      const decoded = jwtDecode<TokenPayload>(token);
      return decoded;
    } catch (error) {
      console.error('Error decoding token:', error);
      return null;
    }
  }

  // Refresh access token using refresh token
  async refreshAccessToken(): Promise<boolean> {
    try {
      const refreshToken = await this.getRefreshToken();
      if (!refreshToken) {
        console.log('❌ No refresh token available');
        return false;
      }

      // Call refresh endpoint (mock implementation)
      const response = await this.callRefreshEndpoint(refreshToken);
      
      if (response.success) {
        await this.storeTokens({
          accessToken: response.data.accessToken,
          refreshToken: response.data.refreshToken,
          expiresAt: Date.now() + (response.data.expiresIn * 1000)
        });

        console.log('✅ Token refreshed successfully');
        return true;
      } else {
        console.log('❌ Token refresh failed');
        await this.clearTokens();
        return false;
      }
    } catch (error) {
      console.error('Error refreshing token:', error);
      await this.clearTokens();
      return false;
    }
  }

  // Login and get tokens
  async login(credentials: LoginCredentials): Promise<AuthTokens | null> {
    try {
      // Store device ID for device binding
      await SecureStore.setItemAsync(this.DEVICE_ID_KEY, credentials.deviceId);

      // Call login endpoint (mock implementation)
      const response = await this.callLoginEndpoint(credentials);
      
      if (response.success) {
        const tokens: AuthTokens = {
          accessToken: response.data.accessToken,
          refreshToken: response.data.refreshToken,
          expiresAt: Date.now() + (response.data.expiresIn * 1000)
        };

        await this.storeTokens(tokens);
        console.log('✅ Login successful');
        return tokens;
      } else {
        console.log('❌ Login failed:', response.message);
        return null;
      }
    } catch (error) {
      console.error('Error during login:', error);
      return null;
    }
  }

  // Logout and clear tokens
  async logout(): Promise<void> {
    try {
      // Call logout endpoint to invalidate tokens on server
      const accessToken = await this.getAccessToken();
      if (accessToken) {
        await this.callLogoutEndpoint(accessToken);
      }

      await this.clearTokens();
      console.log('✅ Logged out successfully');
    } catch (error) {
      console.error('Error during logout:', error);
      // Clear tokens anyway
      await this.clearTokens();
    }
  }

  // Clear all stored tokens
  async clearTokens(): Promise<void> {
    try {
      await Promise.all([
        SecureStore.deleteItemAsync(this.ACCESS_TOKEN_KEY),
        SecureStore.deleteItemAsync(this.REFRESH_TOKEN_KEY),
        SecureStore.deleteItemAsync(this.TOKEN_EXPIRY_KEY)
      ]);

      console.log('🗑️ Tokens cleared');
    } catch (error) {
      console.error('Error clearing tokens:', error);
    }
  }

  // Check if user is authenticated
  async isAuthenticated(): Promise<boolean> {
    try {
      const token = await this.getAccessToken();
      return !!token;
    } catch (error) {
      console.error('Error checking authentication:', error);
      return false;
    }
  }

  // Get device ID for device binding
  async getDeviceId(): Promise<string | null> {
    try {
      return await SecureStore.getItemAsync(this.DEVICE_ID_KEY);
    } catch (error) {
      console.error('Error getting device ID:', error);
      return null;
    }
  }

  // Validate token permissions for specific actions
  async hasPermission(permission: string): Promise<boolean> {
    try {
      const payload = await this.getTokenPayload();
      if (!payload) return false;

      return payload.permissions.includes(permission) || payload.permissions.includes('admin');
    } catch (error) {
      console.error('Error checking permission:', error);
      return false;
    }
  }

  // Get user's KYC tier from token
  async getKYCTier(): Promise<1 | 2 | 3 | null> {
    try {
      const payload = await this.getTokenPayload();
      return payload?.kycTier || null;
    } catch (error) {
      console.error('Error getting KYC tier:', error);
      return null;
    }
  }

  // Private helper methods
  private async callLoginEndpoint(credentials: LoginCredentials): Promise<{
    success: boolean;
    data?: {
      accessToken: string;
      refreshToken: string;
      expiresIn: number;
    };
    message?: string;
  }> {
    // Mock login API call
    console.log('🔐 Calling login endpoint...');
    
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Mock successful login
    if (credentials.email && credentials.password) {
      return {
        success: true,
        data: {
          accessToken: this.generateMockJWT(credentials.email),
          refreshToken: this.generateMockRefreshToken(),
          expiresIn: 3600 // 1 hour
        }
      };
    } else {
      return {
        success: false,
        message: 'Invalid credentials'
      };
    }
  }

  private async callRefreshEndpoint(refreshToken: string): Promise<{
    success: boolean;
    data?: {
      accessToken: string;
      refreshToken: string;
      expiresIn: number;
    };
  }> {
    // Mock refresh API call
    console.log('🔄 Calling refresh endpoint...');
    
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 500));

    // Mock successful refresh (90% success rate)
    if (Math.random() > 0.1) {
      return {
        success: true,
        data: {
          accessToken: this.generateMockJWT('user@kotapay.com'),
          refreshToken: this.generateMockRefreshToken(),
          expiresIn: 3600
        }
      };
    } else {
      return {
        success: false
      };
    }
  }

  private async callLogoutEndpoint(accessToken: string): Promise<void> {
    // Mock logout API call
    console.log('👋 Calling logout endpoint...');
    
    // In production, call actual logout endpoint to invalidate tokens
    await new Promise(resolve => setTimeout(resolve, 300));
  }

  private generateMockJWT(email: string): string {
    // Mock JWT generation - in production, this comes from your backend
    const header = { alg: 'HS256', typ: 'JWT' };
    const payload: TokenPayload = {
      userId: 'user123',
      email,
      phone: '+2348012345678',
      kycTier: 2,
      permissions: ['send_money', 'receive_money', 'view_transactions'],
      iat: Math.floor(Date.now() / 1000),
      exp: Math.floor(Date.now() / 1000) + 3600 // 1 hour
    };

    // In production, use proper JWT signing
    const encodedHeader = btoa(JSON.stringify(header));
    const encodedPayload = btoa(JSON.stringify(payload));
    const signature = btoa('mock_signature');

    return `${encodedHeader}.${encodedPayload}.${signature}`;
  }

  private generateMockRefreshToken(): string {
    // Mock refresh token generation
    return `refresh_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
}

export const authTokenService = new AuthTokenService();
export default authTokenService;
