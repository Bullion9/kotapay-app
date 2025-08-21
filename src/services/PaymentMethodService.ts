import AsyncStorage from '@react-native-async-storage/async-storage';

export interface PaymentMethod {
  id: string;
  type: 'card' | 'bank';
  cardNumber?: string;
  expiryDate?: string;
  cardholderName?: string;
  accountNumber?: string;
  bankName?: string;
  accountName?: string;
  nickname: string;
  brand?: string;
  isDefault?: boolean;
  isActive?: boolean;
  createdAt?: string;
  lastUsed?: string;
}

export interface PaymentMethodValidation {
  isValid: boolean;
  errors: string[];
}

class PaymentMethodService {
  private static readonly STORAGE_KEY = 'paymentMethods';
  private static readonly DEFAULT_METHOD_KEY = 'defaultPaymentMethod';

  // Get all payment methods
  static async getPaymentMethods(): Promise<PaymentMethod[]> {
    try {
      const savedMethods = await AsyncStorage.getItem(this.STORAGE_KEY);
      if (savedMethods) {
        const parsedMethods = JSON.parse(savedMethods);
        if (Array.isArray(parsedMethods)) {
          return parsedMethods.map(method => ({
            ...method,
            isActive: method.isActive !== false, // Default to true if not specified
          }));
        }
      }
      return [];
    } catch (error) {
      console.error('Error loading payment methods:', error);
      throw new Error('Failed to load payment methods');
    }
  }

  // Save payment methods
  static async savePaymentMethods(methods: PaymentMethod[]): Promise<void> {
    try {
      await AsyncStorage.setItem(this.STORAGE_KEY, JSON.stringify(methods));
    } catch (error) {
      console.error('Error saving payment methods:', error);
      throw new Error('Failed to save payment methods');
    }
  }

  // Add a new payment method
  static async addPaymentMethod(method: Omit<PaymentMethod, 'id' | 'createdAt'>): Promise<PaymentMethod> {
    try {
      const existingMethods = await this.getPaymentMethods();
      
      // Validate the new method
      const validation = this.validatePaymentMethod(method);
      if (!validation.isValid) {
        throw new Error(validation.errors.join(', '));
      }

      // Check for duplicates
      const isDuplicate = existingMethods.some(existing => 
        this.isDuplicateMethod(existing, method)
      );

      if (isDuplicate) {
        throw new Error('Payment method already exists');
      }

      const newMethod: PaymentMethod = {
        ...method,
        id: Date.now().toString(),
        createdAt: new Date().toISOString(),
        isActive: true,
        isDefault: existingMethods.length === 0, // First method is default
      };

      const updatedMethods = [...existingMethods, newMethod];
      await this.savePaymentMethods(updatedMethods);

      return newMethod;
    } catch (error) {
      console.error('Error adding payment method:', error);
      throw error;
    }
  }

  // Update a payment method
  static async updatePaymentMethod(id: string, updates: Partial<PaymentMethod>): Promise<PaymentMethod> {
    try {
      const methods = await this.getPaymentMethods();
      const methodIndex = methods.findIndex(method => method.id === id);
      
      if (methodIndex === -1) {
        throw new Error('Payment method not found');
      }

      const updatedMethod = { ...methods[methodIndex], ...updates };
      methods[methodIndex] = updatedMethod;

      await this.savePaymentMethods(methods);
      return updatedMethod;
    } catch (error) {
      console.error('Error updating payment method:', error);
      throw error;
    }
  }

  // Delete a payment method
  static async deletePaymentMethod(id: string): Promise<void> {
    try {
      const methods = await this.getPaymentMethods();
      const methodToDelete = methods.find(method => method.id === id);
      
      if (!methodToDelete) {
        throw new Error('Payment method not found');
      }

      const updatedMethods = methods.filter(method => method.id !== id);

      // If the deleted method was default, set another as default
      if (methodToDelete.isDefault && updatedMethods.length > 0) {
        updatedMethods[0].isDefault = true;
      }

      await this.savePaymentMethods(updatedMethods);
    } catch (error) {
      console.error('Error deleting payment method:', error);
      throw error;
    }
  }

  // Get default payment method
  static async getDefaultPaymentMethod(): Promise<PaymentMethod | null> {
    try {
      const methods = await this.getPaymentMethods();
      return methods.find(method => method.isDefault) || methods[0] || null;
    } catch (error) {
      console.error('Error getting default payment method:', error);
      return null;
    }
  }

  // Set default payment method
  static async setDefaultPaymentMethod(id: string): Promise<void> {
    try {
      const methods = await this.getPaymentMethods();
      
      // Remove default from all methods
      methods.forEach(method => {
        method.isDefault = method.id === id;
      });

      await this.savePaymentMethods(methods);
    } catch (error) {
      console.error('Error setting default payment method:', error);
      throw error;
    }
  }

  // Mark method as used (update lastUsed)
  static async markAsUsed(id: string): Promise<void> {
    try {
      await this.updatePaymentMethod(id, {
        lastUsed: new Date().toISOString(),
      });
    } catch (error) {
      console.error('Error marking payment method as used:', error);
    }
  }

  // Get active payment methods only
  static async getActivePaymentMethods(): Promise<PaymentMethod[]> {
    try {
      const methods = await this.getPaymentMethods();
      return methods.filter(method => method.isActive);
    } catch (error) {
      console.error('Error getting active payment methods:', error);
      return [];
    }
  }

  // Validate payment method
  static validatePaymentMethod(method: Partial<PaymentMethod>): PaymentMethodValidation {
    const errors: string[] = [];

    if (!method.nickname?.trim()) {
      errors.push('Nickname is required');
    }

    if (!method.type) {
      errors.push('Payment method type is required');
    }

    if (method.type === 'card') {
      if (!method.cardNumber?.trim()) {
        errors.push('Card number is required');
      } else if (!this.isValidCardNumber(method.cardNumber)) {
        errors.push('Invalid card number');
      }

      if (!method.expiryDate?.trim()) {
        errors.push('Expiry date is required');
      } else if (!this.isValidExpiryDate(method.expiryDate)) {
        errors.push('Invalid or expired card');
      }

      if (!method.cardholderName?.trim()) {
        errors.push('Cardholder name is required');
      }
    }

    if (method.type === 'bank') {
      if (!method.accountNumber?.trim()) {
        errors.push('Account number is required');
      } else if (!this.isValidAccountNumber(method.accountNumber)) {
        errors.push('Invalid account number');
      }

      if (!method.bankName?.trim()) {
        errors.push('Bank name is required');
      }

      if (!method.accountName?.trim()) {
        errors.push('Account name is required');
      }
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }

  // Check if method is duplicate
  static isDuplicateMethod(existing: PaymentMethod, newMethod: Partial<PaymentMethod>): boolean {
    if (existing.type !== newMethod.type) {
      return false;
    }

    if (existing.type === 'card' && newMethod.type === 'card') {
      return existing.cardNumber === newMethod.cardNumber;
    }

    if (existing.type === 'bank' && newMethod.type === 'bank') {
      return existing.accountNumber === newMethod.accountNumber && 
             existing.bankName === newMethod.bankName;
    }

    return false;
  }

  // Validate card number using Luhn algorithm
  static isValidCardNumber(cardNumber: string): boolean {
    const cleanNumber = cardNumber.replace(/\s/g, '');
    
    if (!/^\d{13,19}$/.test(cleanNumber)) {
      return false;
    }

    // Luhn algorithm
    let sum = 0;
    let isEven = false;
    
    for (let i = cleanNumber.length - 1; i >= 0; i--) {
      let digit = parseInt(cleanNumber[i]);
      
      if (isEven) {
        digit *= 2;
        if (digit > 9) {
          digit -= 9;
        }
      }
      
      sum += digit;
      isEven = !isEven;
    }
    
    return sum % 10 === 0;
  }

  // Validate expiry date
  static isValidExpiryDate(expiryDate: string): boolean {
    const match = expiryDate.match(/^(\d{2})\/(\d{2})$/);
    if (!match) {
      return false;
    }

    const month = parseInt(match[1]);
    const year = parseInt(match[2]) + 2000;
    
    if (month < 1 || month > 12) {
      return false;
    }

    const currentDate = new Date();
    const currentYear = currentDate.getFullYear();
    const currentMonth = currentDate.getMonth() + 1;
    
    if (year < currentYear || (year === currentYear && month < currentMonth)) {
      return false;
    }

    return true;
  }

  // Validate account number
  static isValidAccountNumber(accountNumber: string): boolean {
    // Nigerian account numbers are typically 10 digits
    return /^\d{10}$/.test(accountNumber);
  }

  // Get payment method statistics
  static async getPaymentMethodStats(): Promise<{
    total: number;
    active: number;
    cards: number;
    banks: number;
    hasDefault: boolean;
  }> {
    try {
      const methods = await this.getPaymentMethods();
      
      return {
        total: methods.length,
        active: methods.filter(m => m.isActive).length,
        cards: methods.filter(m => m.type === 'card').length,
        banks: methods.filter(m => m.type === 'bank').length,
        hasDefault: methods.some(m => m.isDefault),
      };
    } catch (error) {
      console.error('Error getting payment method stats:', error);
      return {
        total: 0,
        active: 0,
        cards: 0,
        banks: 0,
        hasDefault: false,
      };
    }
  }

  // Format display text for payment method
  static formatDisplayText(method: PaymentMethod): string {
    if (method.type === 'card') {
      const lastFour = method.cardNumber?.slice(-4) || '';
      const brand = method.brand ? ` (${method.brand.toUpperCase()})` : '';
      return `Card ending in ${lastFour}${brand}`;
    } else {
      const lastFour = method.accountNumber?.slice(-4) || '';
      return `${method.bankName} ending in ${lastFour}`;
    }
  }

  // Clear all payment methods (for logout/reset)
  static async clearAllPaymentMethods(): Promise<void> {
    try {
      await AsyncStorage.removeItem(this.STORAGE_KEY);
      await AsyncStorage.removeItem(this.DEFAULT_METHOD_KEY);
    } catch (error) {
      console.error('Error clearing payment methods:', error);
      throw error;
    }
  }
}

export default PaymentMethodService;
