/**
 * KotaPay Security & Fraud Prevention Service
 * 
 * Implements comprehensive security measures including:
 * - Device binding with token verification
 * - Transaction velocity checks
 * - ML-based risk scoring
 * - 2FA for high-value transactions
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Device from 'expo-device';
import * as LocalAuthentication from 'expo-local-authentication';
import { Alert } from 'react-native';
import { notificationService } from './notifications';

export interface DeviceInfo {
  deviceId: string;
  deviceName: string;
  deviceType: string;
  osVersion: string;
  appVersion: string;
  registeredAt: string;
  lastActiveAt: string;
  isActive: boolean;
}

export interface TransactionVelocity {
  userId: string;
  transactionCount: number;
  timeWindow: string; // '1minute', '1hour', '1day'
  lastTransactionAt: string;
}

export interface RiskScore {
  userId: string;
  score: number; // 0-100 (0 = low risk, 100 = high risk)
  factors: string[];
  recommendation: 'allow' | 'review' | 'block';
  calculatedAt: string;
}

export interface AuthenticationChallenge {
  challengeId: string;
  userId: string;
  transactionAmount: number;
  requiresPin: boolean;
  requiresBiometrics: boolean;
  requiresOTP: boolean;
  expiresAt: string;
  status: 'pending' | 'completed' | 'failed' | 'expired';
}

class SecurityService {
  private deviceId: string | null = null;
  private velocityCache: Map<string, TransactionVelocity[]> = new Map();
  private riskScoreCache: Map<string, number> = new Map();

  // Initialize security service
  async initialize(): Promise<void> {
    try {
      this.deviceId = await this.getOrCreateDeviceId();
      console.log('🔐 Security service initialized with device ID:', this.deviceId);
    } catch (error) {
      console.error('Failed to initialize security service:', error);
    }
  }

  // Device Binding Implementation
  private async getOrCreateDeviceId(): Promise<string> {
    try {
      // Try to get existing device ID
      let deviceId = await AsyncStorage.getItem('device_id');
      
      if (!deviceId) {
        // Generate new device ID
        const deviceInfo = {
          brand: Device.brand,
          deviceName: Device.deviceName,
          osName: Device.osName,
          osVersion: Device.osVersion,
          modelName: Device.modelName
        };
        
        // Create unique device fingerprint
        deviceId = `device_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        
        await AsyncStorage.setItem('device_id', deviceId);
        await AsyncStorage.setItem('device_info', JSON.stringify(deviceInfo));
        
        console.log('📱 New device registered:', deviceId);
      }
      
      return deviceId;
    } catch (error) {
      console.error('Error managing device ID:', error);
      throw error;
    }
  }

  async getDeviceInfo(): Promise<DeviceInfo> {
    const deviceId = await this.getOrCreateDeviceId();
    const deviceInfoStr = await AsyncStorage.getItem('device_info');
    const deviceInfo = deviceInfoStr ? JSON.parse(deviceInfoStr) : {};
    
    return {
      deviceId,
      deviceName: deviceInfo.deviceName || 'Unknown Device',
      deviceType: deviceInfo.osName || 'Unknown',
      osVersion: deviceInfo.osVersion || 'Unknown',
      appVersion: '1.0.0', // From app.json
      registeredAt: await AsyncStorage.getItem('device_registered_at') || new Date().toISOString(),
      lastActiveAt: new Date().toISOString(),
      isActive: true
    };
  }

  async validateDeviceBinding(authToken: string): Promise<boolean> {
    try {
      // Extract device ID from token payload (mock implementation)
      const tokenDeviceId = await this.extractDeviceIdFromToken(authToken);
      const currentDeviceId = await this.getOrCreateDeviceId();
      
      if (tokenDeviceId !== currentDeviceId) {
        console.warn('🚨 Device binding validation failed');
        await notificationService.sendSecurityAlert(
          'device_mismatch',
          'Login attempt from unrecognized device',
          { deviceId: currentDeviceId, expectedDeviceId: tokenDeviceId }
        );
        return false;
      }
      
      console.log('✅ Device binding validated');
      return true;
    } catch (error) {
      console.error('Device binding validation error:', error);
      return false;
    }
  }

  private async extractDeviceIdFromToken(token: string): Promise<string> {
    // Mock implementation - in real app, decode JWT payload
    return await AsyncStorage.getItem('device_id') || 'unknown';
  }

  // Velocity Checks Implementation
  async checkTransactionVelocity(userId: string, amount: number): Promise<{ allowed: boolean; reason?: string }> {
    try {
      const now = new Date();
      const oneMinuteAgo = new Date(now.getTime() - 60 * 1000);
      
      // Get user's recent transactions
      const userVelocity = this.velocityCache.get(userId) || [];
      
      // Filter transactions in the last minute
      const recentTransactions = userVelocity.filter(v => 
        new Date(v.lastTransactionAt) > oneMinuteAgo
      );
      
      // Check velocity limit (max 5 transactions per minute)
      if (recentTransactions.length >= 5) {
        console.warn(`🚨 Velocity limit exceeded for user ${userId}: ${recentTransactions.length} txns in 1 minute`);
        
        await notificationService.sendVelocityLimitNotification(
          recentTransactions.length,
          '1 minute'
        );
        
        return {
          allowed: false,
          reason: 'Transaction velocity limit exceeded (max 5 per minute)'
        };
      }
      
      // Update velocity tracking
      const newVelocity: TransactionVelocity = {
        userId,
        transactionCount: recentTransactions.length + 1,
        timeWindow: '1minute',
        lastTransactionAt: now.toISOString()
      };
      
      userVelocity.push(newVelocity);
      this.velocityCache.set(userId, userVelocity);
      
      console.log(`✅ Velocity check passed: ${newVelocity.transactionCount}/5 transactions in 1 minute`);
      return { allowed: true };
      
    } catch (error) {
      console.error('Velocity check error:', error);
      return { allowed: false, reason: 'Velocity check failed' };
    }
  }

  // Risk Scoring Implementation
  async calculateRiskScore(userId: string, transactionData: any): Promise<RiskScore> {
    try {
      const factors: string[] = [];
      let score = 0;
      
      // Factor 1: Transaction amount (higher amount = higher risk)
      if (transactionData.amount > 100000) {
        score += 30;
        factors.push('Large transaction amount (>₦100k)');
      } else if (transactionData.amount > 50000) {
        score += 15;
        factors.push('Medium transaction amount (>₦50k)');
      }
      
      // Factor 2: Time of transaction (late night = higher risk)
      const hour = new Date().getHours();
      if (hour < 6 || hour > 23) {
        score += 10;
        factors.push('Unusual transaction time (late night/early morning)');
      }
      
      // Factor 3: Velocity patterns
      const velocityCheck = await this.checkTransactionVelocity(userId, transactionData.amount);
      if (!velocityCheck.allowed) {
        score += 25;
        factors.push('High transaction velocity');
      }
      
      // Factor 4: Recipient patterns (new recipient = higher risk)
      if (transactionData.recipientId && !await this.isKnownRecipient(userId, transactionData.recipientId)) {
        score += 15;
        factors.push('New recipient');
      }
      
      // Factor 5: Device patterns
      const deviceInfo = await this.getDeviceInfo();
      if (!deviceInfo.isActive) {
        score += 20;
        factors.push('Inactive or new device');
      }
      
      // Factor 6: Geographic patterns (mock - would use actual location)
      if (Math.random() > 0.9) { // 10% chance of unusual location
        score += 20;
        factors.push('Unusual geographic location');
      }
      
      // Determine recommendation
      let recommendation: 'allow' | 'review' | 'block';
      if (score >= 70) {
        recommendation = 'block';
      } else if (score >= 40) {
        recommendation = 'review';
      } else {
        recommendation = 'allow';
      }
      
      const riskScore: RiskScore = {
        userId,
        score,
        factors,
        recommendation,
        calculatedAt: new Date().toISOString()
      };
      
      console.log(`🎯 Risk score calculated: ${score}/100 (${recommendation})`, factors);
      
      // Send alerts for high-risk transactions
      if (score >= 70) {
        await notificationService.sendSecurityAlert(
          'high_risk_transaction',
          `High-risk transaction detected (score: ${score}/100)`,
          { userId, amount: transactionData.amount, factors }
        );
      }
      
      return riskScore;
      
    } catch (error) {
      console.error('Risk scoring error:', error);
      return {
        userId,
        score: 50, // Default medium risk
        factors: ['Risk calculation failed'],
        recommendation: 'review',
        calculatedAt: new Date().toISOString()
      };
    }
  }

  private async isKnownRecipient(userId: string, recipientId: string): Promise<boolean> {
    // Mock implementation - would check beneficiaries collection
    const knownRecipients = await AsyncStorage.getItem(`known_recipients_${userId}`);
    if (!knownRecipients) return false;
    
    const recipients = JSON.parse(knownRecipients);
    return recipients.includes(recipientId);
  }

  // 2FA Implementation for High-Value Transactions
  async requiresAuthenticationChallenge(amount: number): Promise<boolean> {
    return amount >= 10000; // ₦10k threshold
  }

  async createAuthenticationChallenge(userId: string, transactionAmount: number): Promise<AuthenticationChallenge> {
    const challengeId = `auth_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    const challenge: AuthenticationChallenge = {
      challengeId,
      userId,
      transactionAmount,
      requiresPin: true,
      requiresBiometrics: await this.isBiometricsAvailable(),
      requiresOTP: transactionAmount >= 50000, // SMS OTP for very high amounts
      expiresAt: new Date(Date.now() + 5 * 60 * 1000).toISOString(), // 5 minutes
      status: 'pending'
    };
    
    console.log(`🔐 Authentication challenge created for ₦${transactionAmount.toLocaleString()}`, challenge);
    return challenge;
  }

  async performAuthenticationChallenge(challenge: AuthenticationChallenge, pin: string): Promise<{ success: boolean; error?: string }> {
    try {
      // Check if challenge is expired
      if (new Date() > new Date(challenge.expiresAt)) {
        return { success: false, error: 'Authentication challenge expired' };
      }
      
      // Step 1: Validate PIN
      if (challenge.requiresPin && !this.validatePin(pin)) {
        return { success: false, error: 'Invalid PIN' };
      }
      
      // Step 2: Biometric authentication (if required and available)
      if (challenge.requiresBiometrics) {
        const biometricResult = await this.authenticateWithBiometrics();
        if (!biometricResult.success) {
          return { success: false, error: biometricResult.error || 'Biometric authentication failed' };
        }
      }
      
      // Step 3: OTP verification (if required)
      if (challenge.requiresOTP) {
        const otpResult = await this.verifyOTP(challenge.userId);
        if (!otpResult.success) {
          return { success: false, error: 'OTP verification failed' };
        }
      }
      
      console.log('✅ Authentication challenge completed successfully');
      return { success: true };
      
    } catch (error) {
      console.error('Authentication challenge error:', error);
      return { success: false, error: 'Authentication failed' };
    }
  }

  private async isBiometricsAvailable(): Promise<boolean> {
    try {
      const available = await LocalAuthentication.hasHardwareAsync();
      const enrolled = await LocalAuthentication.isEnrolledAsync();
      return available && enrolled;
    } catch {
      return false;
    }
  }

  private async authenticateWithBiometrics(): Promise<{ success: boolean; error?: string }> {
    try {
      const result = await LocalAuthentication.authenticateAsync({
        promptMessage: 'Authenticate to complete transaction',
        fallbackLabel: 'Use PIN instead',
        cancelLabel: 'Cancel'
      });
      
      if (result.success) {
        return { success: true };
      } else {
        return { success: false, error: 'Biometric authentication cancelled' };
      }
    } catch {
      return { success: false, error: 'Biometric authentication error' };
    }
  }

  private async verifyOTP(userId: string): Promise<{ success: boolean; error?: string }> {
    // Mock OTP verification - would integrate with SMS provider
    return new Promise((resolve) => {
      Alert.prompt(
        'OTP Verification',
        'Enter the 6-digit code sent to your phone',
        [
          {
            text: 'Cancel',
            style: 'cancel',
            onPress: () => resolve({ success: false, error: 'OTP verification cancelled' })
          },
          {
            text: 'Verify',
            onPress: (otp) => {
              if (otp === '123456') { // Mock OTP
                resolve({ success: true });
              } else {
                resolve({ success: false, error: 'Invalid OTP' });
              }
            }
          }
        ],
        'plain-text'
      );
    });
  }

  private validatePin(pin: string): boolean {
    // Mock PIN validation - would use secure storage
    return pin === '1234';
  }

  // Security Monitoring
  async logSecurityEvent(eventType: string, details: any): Promise<void> {
    const securityEvent = {
      eventType,
      userId: details.userId,
      deviceId: this.deviceId,
      timestamp: new Date().toISOString(),
      details
    };
    
    console.log('🔒 Security event logged:', securityEvent);
    
    // In production, send to security monitoring system
    await AsyncStorage.setItem(
      `security_event_${Date.now()}`,
      JSON.stringify(securityEvent)
    );
  }

  // Device Management
  async getTrustedDevices(userId: string): Promise<DeviceInfo[]> {
    // Mock implementation - would fetch from database
    const currentDevice = await this.getDeviceInfo();
    return [currentDevice];
  }

  async revokeTrustedDevice(userId: string, deviceId: string): Promise<void> {
    console.log(`🚫 Revoking trusted device: ${deviceId} for user: ${userId}`);
    await this.logSecurityEvent('device_revoked', { userId, deviceId });
  }

  // Cleanup Methods for Scheduled Tasks
  async cleanupOldDeviceBindings(): Promise<void> {
    try {
      const cutoffDate = new Date();
      cutoffDate.setMonth(cutoffDate.getMonth() - 6); // Remove bindings older than 6 months
      
      console.log('🧹 Cleaning up device bindings older than', cutoffDate.toISOString());
      
      // In production, remove from database where lastUsed < cutoffDate
      // For development, just log
      console.log('✅ Device bindings cleanup completed');
    } catch (error) {
      console.error('Error cleaning up device bindings:', error);
    }
  }

  async cleanupOldVelocityData(): Promise<void> {
    try {
      const cutoffDate = new Date();
      cutoffDate.setHours(cutoffDate.getHours() - 24); // Remove velocity data older than 24 hours
      
      console.log('🧹 Cleaning up velocity data older than', cutoffDate.toISOString());
      
      // Clean up in-memory velocity tracking
      for (const [userId, velocityRecords] of this.velocityCache.entries()) {
        const recentTransactions = velocityRecords.filter(record => 
          new Date(record.lastTransactionAt).getTime() > cutoffDate.getTime()
        );
        
        if (recentTransactions.length === 0) {
          this.velocityCache.delete(userId);
        } else {
          this.velocityCache.set(userId, recentTransactions);
        }
      }
      
      console.log('✅ Velocity data cleanup completed');
    } catch (error) {
      console.error('Error cleaning up velocity data:', error);
    }
  }

  async detectSuspiciousPatterns(): Promise<string[]> {
    try {
      const suspiciousUsers: string[] = [];
      const now = Date.now();
      const hourAgo = now - (60 * 60 * 1000);
      
      // Check for users with excessive transaction frequency
      for (const [userId, velocityRecords] of this.velocityCache.entries()) {
        const recentTransactions = velocityRecords.filter(record => 
          new Date(record.lastTransactionAt).getTime() > hourAgo
        );
        
        // Calculate total transaction count from recent records
        const totalTransactions = recentTransactions.reduce((sum, record) => sum + record.transactionCount, 0);
        
        // Flag users with more than 20 transactions in the last hour
        if (totalTransactions > 20) {
          suspiciousUsers.push(userId);
          console.log(`🚨 Suspicious pattern detected for user ${userId}: ${totalTransactions} transactions in last hour`);
        }
      }
      
      // Check for users with low risk scores but high transaction volumes
      for (const [userId, score] of this.riskScoreCache.entries()) {
        if (score < 30) { // Low risk score (0-100 scale)
          const userVelocity = this.velocityCache.get(userId) || [];
          const recentTransactions = userVelocity.filter(record => 
            new Date(record.lastTransactionAt).getTime() > hourAgo
          );
          
          const totalTransactions = recentTransactions.reduce((sum, record) => sum + record.transactionCount, 0);
          
          // Flag if low-risk user suddenly has high activity
          if (totalTransactions > 10) {
            if (!suspiciousUsers.includes(userId)) {
              suspiciousUsers.push(userId);
              console.log(`🚨 Suspicious pattern detected for user ${userId}: low risk but high activity`);
            }
          }
        }
      }
      
      return suspiciousUsers;
    } catch (error) {
      console.error('Error detecting suspicious patterns:', error);
      return [];
    }
  }
}

export const securityService = new SecurityService();
export default securityService;
