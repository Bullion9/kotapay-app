import { User } from '../types';
import AppwriteService from './AppwriteService';

// Simple hash function to replace crypto-js (React Native compatible)
const simpleHash = (str: string): string => {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32-bit integer
  }
  return Math.abs(hash).toString(36);
};

class AuthService {
  private storageKey = 'kotapay_user';
  private pinKey = 'kotapay_pin';
  private currentUser: User | null = null;

  async login(email: string, password: string): Promise<User> {
    try {
      // Check if this is the demo account with the correct password
      if (email === 'demo@kotapay.com' && password === 'DemoUser123!') {
        console.log('🎯 Demo user detected, attempting database lookup...');
        
        // Get the real demo user from Appwrite
        const demoProfile = await this.getDemoUserFromDatabase();
        if (demoProfile) {
          this.currentUser = demoProfile;
          console.log('✅ Found demo user in database with ID:', demoProfile.id);
          return demoProfile;
        } else {
          console.log('⚠️ Demo user not found in database, using fallback ID');
          // Fallback to a known demo user ID
          const fallbackUser: User = {
            id: 'demo_fallback_user',
            name: 'Demo User',
            email: email,
            phone: '+234 123 456 7890',
            balance: 50000.00,
            isVerified: true,
            address: '123 Lagos Street, Victoria Island, Lagos',
            dateOfBirth: '15/06/1990',
            nationality: 'Nigerian',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          };
          this.currentUser = fallbackUser;
          return fallbackUser;
        }
      }
      
      // For other credentials, use mock data
      if (email === 'demo@kotapay.com' && password === 'password') {
        const user: User = {
          id: 'demo_user',
          name: 'Demo User',
          email: email,
          phone: '+234 123 456 7890',
          balance: 50000.00,
          isVerified: true,
          address: '123 Lagos Street, Victoria Island, Lagos',
          dateOfBirth: '15/06/1990',
          nationality: 'Nigerian',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
        this.currentUser = user;
        return user;
      } else {
        throw new Error('Invalid credentials');
      }
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  }

  private async getDemoUserFromDatabase(): Promise<User | null> {
    try {
      // Search for demo user by email using AppwriteService
      const demoUser = await AppwriteService.getUserByEmail('demo@kotapay.com');
      
      if (demoUser) {
        // Convert Appwrite user to our User type
        const user: User = {
          id: demoUser.userId, // Use the userId field from Appwrite
          name: `${demoUser.firstName || ''} ${demoUser.lastName || ''}`.trim() || 'Demo User',
          email: demoUser.email, // Now we can use the email field
          phone: demoUser.phone || '',
          balance: demoUser.walletBalance || 0,
          isVerified: demoUser.kycStatus === 'verified' || true, // Default to true for demo
          address: demoUser.address || '',
          dateOfBirth: demoUser.dateOfBirth || '',
          nationality: demoUser.country || 'Nigerian',
          createdAt: demoUser.createdAt,
          updatedAt: demoUser.updatedAt,
        };
        
        console.log('✅ Demo user loaded from database:', user.email, 'Balance:', user.balance);
        return user;
      }
      
      return null;
    } catch (error) {
      console.error('Error fetching demo user from database:', error);
      return null;
    }
  }

  async register(name: string, email: string, password: string, phone?: string): Promise<User> {
    // Simulate API call
    return new Promise((resolve) => {
      setTimeout(() => {
        const user: User = {
          id: Date.now().toString(),
          name,
          email,
          phone,
          balance: 0.00,
          isVerified: false,
          address: '',
          dateOfBirth: '',
          nationality: '',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
        resolve(user);
      }, 1000);
    });
  }

  async getCurrentUser(): Promise<User | null> {
    // Return the currently logged-in user if available
    if (this.currentUser) {
      return this.currentUser;
    }

    // For demo purposes, return a logged-in user if no one is currently logged in
    return new Promise((resolve) => {
      setTimeout(() => {
        const user: User = {
          id: '1',
          name: 'John Doe',
          email: 'john.doe@email.com',
          phone: '+234 123 456 7890',
          balance: 15450.00,
          isVerified: true,
          address: '123 Lagos Street, Victoria Island, Lagos',
          dateOfBirth: '15/06/1990',
          nationality: 'Nigerian',
          createdAt: '2024-01-15T10:30:00Z',
          updatedAt: new Date().toISOString(),
        };
        // Set this as current user if none exists
        if (!this.currentUser) {
          this.currentUser = user;
        }
        resolve(user);
      }, 500);
    });
  }

  async logout(): Promise<void> {
    // Clear current user and simulate logout
    return new Promise((resolve) => {
      setTimeout(() => {
        this.currentUser = null;
        resolve();
      }, 500);
    });
  }

  async deleteAccount(): Promise<void> {
    // Simulate account deletion
    return new Promise((resolve) => {
      setTimeout(() => {
        // In a real app, this would make an API call to delete the user's account
        // and all associated data from the server
        resolve();
      }, 1000);
    });
  }

  async updateUser(userData: Partial<User>): Promise<User> {
    // Simulate user update
    return new Promise((resolve) => {
      setTimeout(() => {
        const updatedUser: User = {
          id: '1',
          name: userData.name || 'John Doe',
          email: userData.email || 'john.doe@email.com',
          phone: userData.phone || '+234 123 456 7890',
          balance: userData.balance || 15450.00,
          isVerified: userData.isVerified ?? true,
          address: userData.address || '123 Lagos Street, Victoria Island, Lagos',
          dateOfBirth: userData.dateOfBirth || '15/06/1990',
          nationality: userData.nationality || 'Nigerian',
          createdAt: '2024-01-15T10:30:00Z',
          updatedAt: new Date().toISOString(),
        };
        resolve(updatedUser);
      }, 500);
    });
  }

  async verifyPin(pin: string): Promise<boolean> {
    // For demo purposes, accept any 4-digit PIN
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve(pin.length === 4 && /^\d+$/.test(pin));
      }, 500);
    });
  }

  async updatePin(currentPin: string, newPin: string): Promise<void> {
    // If currentPin is empty, this is a new PIN setup (no validation needed)
    if (currentPin !== '') {
      const isCurrentPinValid = await this.verifyPin(currentPin);
      if (!isCurrentPinValid) {
        throw new Error('Current PIN is incorrect');
      }
    }

    if (newPin.length !== 4 || !/^\d+$/.test(newPin)) {
      throw new Error('New PIN must be 4 digits');
    }

    // Simulate PIN update
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve();
      }, 500);
    });
  }

  async hashPin(pin: string): Promise<string> {
    return simpleHash(pin);
  }
}

export const authService = new AuthService();
