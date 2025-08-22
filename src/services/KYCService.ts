/**
 * KYC Service - Identity & Onboarding Management
 * Implements KotaPay's 3-tier verification system
 */

import AppwriteService from './AppwriteService';
import { notificationService } from './notifications';
import * as SecureStore from 'expo-secure-store';

export interface KYCTier {
  level: 1 | 2 | 3;
  name: string;
  monthlyLimit: number;
  dailyLimit: number;
  requirements: KYCRequirement[];
  status: 'locked' | 'pending' | 'verified' | 'rejected';
  verifiedAt?: string;
}

export interface KYCRequirement {
  id: string;
  type: 'phone' | 'basic_info' | 'government_id' | 'selfie' | 'address_proof';
  label: string;
  description: string;
  status: 'pending' | 'submitted' | 'verified' | 'rejected';
  isRequired: boolean;
  submittedAt?: string;
  verifiedAt?: string;
  rejectionReason?: string;
  documentUrl?: string;
}

export interface KYCDocument {
  id: string;
  type: 'national_id' | 'passport' | 'drivers_license' | 'selfie' | 'utility_bill' | 'bank_statement';
  frontImageUrl?: string;
  backImageUrl?: string;
  selfieUrl?: string;
  documentNumber?: string;
  expiryDate?: string;
  status: 'pending' | 'verified' | 'rejected';
  uploadedAt: string;
  verifiedAt?: string;
  rejectionReason?: string;
}

export interface UserKYCProfile {
  userId: string;
  currentTier: 1 | 2 | 3;
  phoneNumber: string;
  phoneVerified: boolean;
  firstName: string;
  lastName: string;
  dateOfBirth?: string;
  address?: {
    street: string;
    city: string;
    state: string;
    country: string;
    postalCode: string;
  };
  documents: KYCDocument[];
  tiers: KYCTier[];
  monthlySpent: number;
  dailySpent: number;
  lastSpentUpdate: string;
  createdAt: string;
  updatedAt: string;
}

export interface OTPVerification {
  phone: string;
  code: string;
  purpose: 'registration' | 'login' | 'transaction' | 'kyc_upgrade';
  expiresAt: string;
  verified: boolean;
}

class KYCService {
  private readonly TIER_DEFINITIONS: Omit<KYCTier, 'status' | 'verifiedAt'>[] = [
    {
      level: 1,
      name: 'Tier 1 - Basic',
      monthlyLimit: 5000,
      dailyLimit: 2000,
      requirements: [
        {
          id: 'phone_verification',
          type: 'phone',
          label: 'Phone Verification',
          description: 'Verify your phone number with OTP',
          status: 'pending',
          isRequired: true
        },
        {
          id: 'basic_info',
          type: 'basic_info',
          label: 'Basic Information',
          description: 'Provide your full name and date of birth',
          status: 'pending',
          isRequired: true
        }
      ]
    },
    {
      level: 2,
      name: 'Tier 2 - Standard',
      monthlyLimit: 50000,
      dailyLimit: 20000,
      requirements: [
        {
          id: 'government_id',
          type: 'government_id',
          label: 'Government ID',
          description: 'Upload front and back of valid government ID',
          status: 'pending',
          isRequired: true
        },
        {
          id: 'selfie_verification',
          type: 'selfie',
          label: 'Selfie Verification',
          description: 'Take a selfie for identity confirmation',
          status: 'pending',
          isRequired: true
        }
      ]
    },
    {
      level: 3,
      name: 'Tier 3 - Premium',
      monthlyLimit: 500000,
      dailyLimit: 100000,
      requirements: [
        {
          id: 'address_proof',
          type: 'address_proof',
          label: 'Address Verification',
          description: 'Upload utility bill or bank statement (max 3 months old)',
          status: 'pending',
          isRequired: true
        }
      ]
    }
  ];

  // Initialize KYC profile for new user
  async initializeKYCProfile(userId: string, phoneNumber: string): Promise<UserKYCProfile> {
    try {
      const profile: UserKYCProfile = {
        userId,
        currentTier: 1,
        phoneNumber,
        phoneVerified: false,
        firstName: '',
        lastName: '',
        documents: [],
        tiers: this.TIER_DEFINITIONS.map(tier => ({
          ...tier,
          status: tier.level === 1 ? 'pending' : 'locked'
        })),
        monthlySpent: 0,
        dailySpent: 0,
        lastSpentUpdate: new Date().toISOString(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      // Save to Appwrite
      await AppwriteService.createUserProfile({
        userId,
        firstName: '',
        lastName: '',
        phone: phoneNumber,
        kycStatus: 'pending',
        accountBalance: 0,
        walletBalance: 0
      });

      return profile;
    } catch (error) {
      console.error('Error initializing KYC profile:', error);
      throw error;
    }
  }

  // Send OTP for phone verification
  async sendOTP(phoneNumber: string, purpose: OTPVerification['purpose'] = 'registration'): Promise<string> {
    try {
      // Generate 6-digit OTP
      const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
      const expiresAt = new Date(Date.now() + 10 * 60 * 1000).toISOString(); // 10 minutes

      const otp: OTPVerification = {
        phone: phoneNumber,
        code: otpCode,
        purpose,
        expiresAt,
        verified: false
      };

      // Store OTP securely (in production, use secure backend storage)
      await SecureStore.setItemAsync(`otp_${phoneNumber}`, JSON.stringify(otp));

      // In production, integrate with SMS provider (Twilio, etc.)
      console.log(`📱 OTP sent to ${phoneNumber}: ${otpCode}`);
      
      // Mock SMS sending
      await this.mockSendSMS(phoneNumber, `Your KotaPay verification code is: ${otpCode}. Valid for 10 minutes.`);

      return otpCode; // Remove this in production
    } catch (error) {
      console.error('Error sending OTP:', error);
      throw error;
    }
  }

  // Verify OTP and complete phone verification
  async verifyOTP(phoneNumber: string, enteredCode: string): Promise<boolean> {
    try {
      const storedOTPData = await SecureStore.getItemAsync(`otp_${phoneNumber}`);
      if (!storedOTPData) {
        throw new Error('No OTP found for this phone number');
      }

      const storedOTP: OTPVerification = JSON.parse(storedOTPData);

      // Check if OTP expired
      if (new Date() > new Date(storedOTP.expiresAt)) {
        await SecureStore.deleteItemAsync(`otp_${phoneNumber}`);
        throw new Error('OTP has expired');
      }

      // Verify OTP code
      if (storedOTP.code !== enteredCode) {
        throw new Error('Invalid OTP code');
      }

      // Mark as verified and clean up
      storedOTP.verified = true;
      await SecureStore.deleteItemAsync(`otp_${phoneNumber}`);

      // Update user profile
      const userProfile = await this.getUserKYCProfile(phoneNumber);
      if (userProfile) {
        await this.updateRequirementStatus(userProfile.userId, 'phone_verification', 'verified');
      }

      console.log('✅ Phone verification successful');
      return true;
    } catch (error) {
      console.error('Error verifying OTP:', error);
      throw error;
    }
  }

  // Update basic information (Tier 1 requirement)
  async updateBasicInfo(userId: string, info: {
    firstName: string;
    lastName: string;
    dateOfBirth: string;
  }): Promise<void> {
    try {
      // Update user profile
      await AppwriteService.updateUserProfile(userId, {
        firstName: info.firstName,
        lastName: info.lastName,
        dateOfBirth: info.dateOfBirth
      });

      // Mark basic info as completed
      await this.updateRequirementStatus(userId, 'basic_info', 'verified');

      // Check if Tier 1 is complete
      await this.checkTierCompletion(userId, 1);

      console.log('✅ Basic information updated');
    } catch (error) {
      console.error('Error updating basic info:', error);
      throw error;
    }
  }

  // Upload government ID (Tier 2 requirement)
  async uploadGovernmentID(userId: string, documents: {
    frontImage: File | string;
    backImage: File | string;
    documentType: 'national_id' | 'passport' | 'drivers_license';
    documentNumber: string;
    expiryDate?: string;
  }): Promise<string> {
    try {
      // Upload images to Appwrite storage
      const frontImageUrl = await this.uploadDocument(documents.frontImage, `${userId}_id_front`);
      const backImageUrl = await this.uploadDocument(documents.backImage, `${userId}_id_back`);

      const document: KYCDocument = {
        id: `doc_${Date.now()}`,
        type: documents.documentType,
        frontImageUrl,
        backImageUrl,
        documentNumber: documents.documentNumber,
        expiryDate: documents.expiryDate,
        status: 'pending',
        uploadedAt: new Date().toISOString()
      };

      // Mark requirement as submitted
      await this.updateRequirementStatus(userId, 'government_id', 'submitted');

      // In production, trigger AI/manual verification process
      await this.triggerDocumentVerification(userId, document);

      console.log('📄 Government ID uploaded for verification');
      return document.id;
    } catch (error) {
      console.error('Error uploading government ID:', error);
      throw error;
    }
  }

  // Upload selfie (Tier 2 requirement)
  async uploadSelfie(userId: string, selfieImage: File | string): Promise<string> {
    try {
      const selfieUrl = await this.uploadDocument(selfieImage, `${userId}_selfie`);

      const document: KYCDocument = {
        id: `selfie_${Date.now()}`,
        type: 'selfie',
        selfieUrl,
        status: 'pending',
        uploadedAt: new Date().toISOString()
      };

      // Mark requirement as submitted
      await this.updateRequirementStatus(userId, 'selfie_verification', 'submitted');

      // In production, trigger face matching verification
      await this.triggerSelfieVerification(userId, document);

      console.log('🤳 Selfie uploaded for verification');
      return document.id;
    } catch (error) {
      console.error('Error uploading selfie:', error);
      throw error;
    }
  }

  // Upload address proof (Tier 3 requirement)
  async uploadAddressProof(userId: string, documents: {
    proofImage: File | string;
    documentType: 'utility_bill' | 'bank_statement';
    address: {
      street: string;
      city: string;
      state: string;
      country: string;
      postalCode: string;
    };
  }): Promise<string> {
    try {
      const proofImageUrl = await this.uploadDocument(documents.proofImage, `${userId}_address_proof`);

      const document: KYCDocument = {
        id: `address_${Date.now()}`,
        type: documents.documentType,
        frontImageUrl: proofImageUrl,
        status: 'pending',
        uploadedAt: new Date().toISOString()
      };

      // Update user address
      await AppwriteService.updateUserProfile(userId, {
        address: documents.address.street,
        city: documents.address.city,
        state: documents.address.state,
        country: documents.address.country
      });

      // Mark requirement as submitted
      await this.updateRequirementStatus(userId, 'address_proof', 'submitted');

      // In production, trigger address verification
      await this.triggerAddressVerification(userId, document);

      console.log('🏠 Address proof uploaded for verification');
      return document.id;
    } catch (error) {
      console.error('Error uploading address proof:', error);
      throw error;
    }
  }

  // Check if user can perform transaction based on limits
  async checkTransactionLimits(userId: string, amount: number): Promise<{
    canProceed: boolean;
    reason?: string;
    currentTier: number;
    monthlyRemaining: number;
    dailyRemaining: number;
  }> {
    try {
      const profile = await this.getUserKYCProfile(userId);
      if (!profile) {
        throw new Error('User KYC profile not found');
      }

      const currentTier = profile.tiers.find(t => t.level === profile.currentTier);
      if (!currentTier) {
        throw new Error('Current tier not found');
      }

      // Calculate remaining limits
      const monthlyRemaining = currentTier.monthlyLimit - profile.monthlySpent;
      const dailyRemaining = currentTier.dailyLimit - profile.dailySpent;

      // Check monthly limit
      if (amount > monthlyRemaining) {
        return {
          canProceed: false,
          reason: `Transaction exceeds monthly limit. Remaining: ₦${monthlyRemaining.toLocaleString()}`,
          currentTier: profile.currentTier,
          monthlyRemaining,
          dailyRemaining
        };
      }

      // Check daily limit
      if (amount > dailyRemaining) {
        return {
          canProceed: false,
          reason: `Transaction exceeds daily limit. Remaining: ₦${dailyRemaining.toLocaleString()}`,
          currentTier: profile.currentTier,
          monthlyRemaining,
          dailyRemaining
        };
      }

      return {
        canProceed: true,
        currentTier: profile.currentTier,
        monthlyRemaining,
        dailyRemaining
      };
    } catch (error) {
      console.error('Error checking transaction limits:', error);
      throw error;
    }
  }

  // Update spent amounts after transaction
  async updateSpentAmounts(userId: string, amount: number): Promise<void> {
    try {
      const profile = await this.getUserKYCProfile(userId);
      if (!profile) return;

      // Reset daily spent if it's a new day
      const lastUpdate = new Date(profile.lastSpentUpdate);
      const now = new Date();
      const isNewDay = lastUpdate.getDate() !== now.getDate() || 
                      lastUpdate.getMonth() !== now.getMonth() || 
                      lastUpdate.getFullYear() !== now.getFullYear();

      // Reset monthly spent if it's a new month
      const isNewMonth = lastUpdate.getMonth() !== now.getMonth() || 
                        lastUpdate.getFullYear() !== now.getFullYear();

      const updatedProfile: Partial<UserKYCProfile> = {
        dailySpent: isNewDay ? amount : profile.dailySpent + amount,
        monthlySpent: isNewMonth ? amount : profile.monthlySpent + amount,
        lastSpentUpdate: now.toISOString(),
        updatedAt: now.toISOString()
      };

      // Update profile (mock - in production, update in Appwrite)
      console.log('💰 Updated spending limits:', updatedProfile);
    } catch (error) {
      console.error('Error updating spent amounts:', error);
    }
  }

  // Get user's KYC profile
  async getUserKYCProfile(userIdOrPhone: string): Promise<UserKYCProfile | null> {
    try {
      // Mock implementation - in production, fetch from Appwrite
      const mockProfile: UserKYCProfile = {
        userId: 'user123',
        currentTier: 1,
        phoneNumber: '+2348012345678',
        phoneVerified: true,
        firstName: 'John',
        lastName: 'Doe',
        documents: [],
        tiers: this.TIER_DEFINITIONS.map(tier => ({
          ...tier,
          status: tier.level === 1 ? 'verified' : tier.level === 2 ? 'pending' : 'locked'
        })),
        monthlySpent: 2500,
        dailySpent: 500,
        lastSpentUpdate: new Date().toISOString(),
        createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
        updatedAt: new Date().toISOString()
      };

      return mockProfile;
    } catch (error) {
      console.error('Error getting KYC profile:', error);
      return null;
    }
  }

  // Private helper methods
  private async updateRequirementStatus(
    userId: string, 
    requirementId: string, 
    status: KYCRequirement['status']
  ): Promise<void> {
    // Mock implementation - update requirement status in Appwrite
    console.log(`📝 Updated requirement ${requirementId} to ${status} for user ${userId}`);
  }

  private async checkTierCompletion(userId: string, tierLevel: number): Promise<void> {
    try {
      const profile = await this.getUserKYCProfile(userId);
      if (!profile) return;

      const tier = profile.tiers.find(t => t.level === tierLevel);
      if (!tier) return;

      // Check if all requirements are verified
      const allVerified = tier.requirements.every(req => req.status === 'verified');

      if (allVerified && tier.status !== 'verified') {
        // Upgrade tier
        tier.status = 'verified';
        tier.verifiedAt = new Date().toISOString();

        // Update current tier if this is the next tier
        if (tierLevel === profile.currentTier + 1) {
          profile.currentTier = tierLevel as 1 | 2 | 3;
        }

        // Unlock next tier
        const nextTier = profile.tiers.find(t => t.level === tierLevel + 1);
        if (nextTier && nextTier.status === 'locked') {
          nextTier.status = 'pending';
        }

        // Send notification
        await notificationService.sendKYCTierUpgradeNotification(
          tierLevel as 1 | 2 | 3,
          tier.monthlyLimit
        );

        console.log(`🎉 Tier ${tierLevel} completed! Monthly limit: ₦${tier.monthlyLimit.toLocaleString()}`);
      }
    } catch (error) {
      console.error('Error checking tier completion:', error);
    }
  }

  private async uploadDocument(file: File | string, fileName: string): Promise<string> {
    try {
      // Mock file upload - in production, use Appwrite storage
      const mockUrl = `https://storage.kotapay.com/documents/${fileName}.jpg`;
      console.log(`📤 Uploaded document: ${mockUrl}`);
      return mockUrl;
    } catch (error) {
      console.error('Error uploading document:', error);
      throw error;
    }
  }

  private async triggerDocumentVerification(userId: string, document: KYCDocument): Promise<void> {
    // Mock AI/manual verification process
    setTimeout(async () => {
      // Simulate verification result (90% success rate)
      const isVerified = Math.random() > 0.1;
      
      if (isVerified) {
        await this.updateRequirementStatus(userId, 'government_id', 'verified');
        await this.checkTierCompletion(userId, 2);
        console.log('✅ Government ID verified');
      } else {
        await this.updateRequirementStatus(userId, 'government_id', 'rejected');
        console.log('❌ Government ID rejected - please resubmit');
      }
    }, 3000); // 3 second verification delay
  }

  private async triggerSelfieVerification(userId: string, document: KYCDocument): Promise<void> {
    // Mock face matching verification
    setTimeout(async () => {
      const isVerified = Math.random() > 0.15; // 85% success rate
      
      if (isVerified) {
        await this.updateRequirementStatus(userId, 'selfie_verification', 'verified');
        await this.checkTierCompletion(userId, 2);
        console.log('✅ Selfie verification successful');
      } else {
        await this.updateRequirementStatus(userId, 'selfie_verification', 'rejected');
        console.log('❌ Selfie verification failed - please retake');
      }
    }, 2000);
  }

  private async triggerAddressVerification(userId: string, document: KYCDocument): Promise<void> {
    // Mock address verification
    setTimeout(async () => {
      const isVerified = Math.random() > 0.2; // 80% success rate
      
      if (isVerified) {
        await this.updateRequirementStatus(userId, 'address_proof', 'verified');
        await this.checkTierCompletion(userId, 3);
        console.log('✅ Address verification successful');
      } else {
        await this.updateRequirementStatus(userId, 'address_proof', 'rejected');
        console.log('❌ Address verification failed - document may be too old or unclear');
      }
    }, 5000); // Longer verification for address
  }

  private async mockSendSMS(phoneNumber: string, message: string): Promise<void> {
    // Mock SMS sending - in production, integrate with Twilio, etc.
    console.log(`📱 SMS to ${phoneNumber}: ${message}`);
  }
}

export const kycService = new KYCService();
export default kycService;
