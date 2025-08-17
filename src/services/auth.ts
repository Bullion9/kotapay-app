import { User } from '../types';

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

  async login(email: string, password: string): Promise<User> {
    // Simulate API call
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        if (email === 'demo@kotapay.com' && password === 'password') {
          const user: User = {
            id: '1',
            name: 'Demo User',
            email: email,
            phone: '+1234567890',
            balance: 1000.00,
            isVerified: true,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          };
          resolve(user);
        } else {
          reject(new Error('Invalid credentials'));
        }
      }, 1000);
    });
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
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
        resolve(user);
      }, 1000);
    });
  }

  async getCurrentUser(): Promise<User | null> {
    // Simulate getting current user from storage/API
    return new Promise((resolve) => {
      setTimeout(() => {
        // For demo purposes, return null (not logged in)
        resolve(null);
      }, 500);
    });
  }

  async logout(): Promise<void> {
    // Simulate logout
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve();
      }, 500);
    });
  }

  async updateUser(userData: Partial<User>): Promise<User> {
    // Simulate user update
    return new Promise((resolve) => {
      setTimeout(() => {
        const updatedUser: User = {
          id: '1',
          name: userData.name || 'Demo User',
          email: userData.email || 'demo@kotapay.com',
          phone: userData.phone,
          balance: userData.balance || 1000.00,
          isVerified: userData.isVerified ?? true,
          createdAt: new Date().toISOString(),
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
