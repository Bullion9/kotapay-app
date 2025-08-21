/**
 * Virtual Card Security Service
 * Handles PCI-DSS compliant card management with tokenization
 */

interface CardSecurityConfig {
  maxDeclinedAttempts: number;
  autoExpiryEnabled: boolean;
  tokenizationEnabled: boolean;
}

interface CardToken {
  tokenId: string;
  cardId: string;
  maskedPan: string;
  expiryDate: string;
  status: 'active' | 'frozen' | 'expired' | 'blocked';
  createdAt: string;
  lastActivityAt: string;
  declinedAttempts: number;
}

interface SecurityEvent {
  id: string;
  cardId: string;
  eventType: 'declined_transaction' | 'auto_freeze' | 'auto_expire' | 'manual_freeze';
  timestamp: string;
  metadata: Record<string, any>;
}

class VirtualCardSecurityService {
  private static instance: VirtualCardSecurityService;
  private config: CardSecurityConfig = {
    maxDeclinedAttempts: 3,
    autoExpiryEnabled: true,
    tokenizationEnabled: true,
  };

  private constructor() {}

  static getInstance(): VirtualCardSecurityService {
    if (!VirtualCardSecurityService.instance) {
      VirtualCardSecurityService.instance = new VirtualCardSecurityService();
    }
    return VirtualCardSecurityService.instance;
  }

  /**
   * Generate dynamic gradient colors based on cardId (tokenized)
   * Ensures consistent visual appearance without exposing sensitive data
   */
  generateCardGradient(cardId: string): { colors: string[]; angle: number } {
    // Create deterministic hash from tokenized cardId
    let hash = 0;
    for (let i = 0; i < cardId.length; i++) {
      hash = ((hash << 5) - hash + cardId.charCodeAt(i)) & 0xffffffff;
    }

    // Generate consistent variations of sea-green (#06402B) and ice-glow (#b9f1ffe)
    const baseHue = 152; // Base green hue
    const hueVariation = (Math.abs(hash) % 30) - 15; // ±15 degree variation
    const saturation = 70 + (Math.abs(hash) % 20); // 70-90% saturation
    
    const darkLightness = 15 + (Math.abs(hash) % 10); // 15-25% for dark color
    const lightLightness = 85 + (Math.abs(hash) % 15); // 85-100% for light color
    
    const angle = 45 + (Math.abs(hash) % 90); // 45-135 degree angle

    return {
      colors: [
        `hsl(${baseHue + hueVariation}, ${saturation}%, ${darkLightness}%)`,
        `hsl(${baseHue + hueVariation + 20}, ${saturation - 10}%, ${lightLightness}%)`,
      ],
      angle,
    };
  }

  /**
   * Tokenize sensitive card data for secure storage/transmission
   * Never expose full PAN/CVV in logs or client-side code
   */
  tokenizeCard(cardData: {
    pan: string;
    cvv: string;
    expiryDate: string;
    cardholderName: string;
  }): CardToken {
    const tokenId = this.generateSecureToken();
    const maskedPan = this.maskPAN(cardData.pan);

    // In real implementation, sensitive data would be sent to secure server
    console.log(`Card tokenization request - Token: ${tokenId}, Masked PAN: ${maskedPan}`);
    
    return {
      tokenId,
      cardId: tokenId, // Use token as cardId
      maskedPan,
      expiryDate: cardData.expiryDate,
      status: 'active',
      createdAt: new Date().toISOString(),
      lastActivityAt: new Date().toISOString(),
      declinedAttempts: 0,
    };
  }

  /**
   * Handle declined transaction and auto-freeze logic
   */
  async handleDeclinedTransaction(cardId: string, reason: string): Promise<{
    shouldFreeze: boolean;
    remainingAttempts: number;
    securityEvent: SecurityEvent;
  }> {
    // Log security event (using tokenized cardId only)
    const securityEvent: SecurityEvent = {
      id: this.generateSecureToken(),
      cardId: this.maskCardId(cardId),
      eventType: 'declined_transaction',
      timestamp: new Date().toISOString(),
      metadata: {
        reason,
        tokenizedOnly: true,
      },
    };

    console.log(`Security event logged: ${securityEvent.id} for card ${securityEvent.cardId}`);

    // In real implementation, get current declined attempts from secure server
    const currentAttempts = await this.getCurrentDeclinedAttempts(cardId);
    const newAttempts = currentAttempts + 1;
    const shouldFreeze = newAttempts >= this.config.maxDeclinedAttempts;

    if (shouldFreeze) {
      await this.autoFreezeCard(cardId, 'Too many declined attempts');
    }

    return {
      shouldFreeze,
      remainingAttempts: Math.max(0, this.config.maxDeclinedAttempts - newAttempts),
      securityEvent,
    };
  }

  /**
   * Auto-freeze card due to security concerns
   */
  private async autoFreezeCard(cardId: string, reason: string): Promise<void> {
    const securityEvent: SecurityEvent = {
      id: this.generateSecureToken(),
      cardId: this.maskCardId(cardId),
      eventType: 'auto_freeze',
      timestamp: new Date().toISOString(),
      metadata: {
        reason,
        automatic: true,
      },
    };

    console.log(`Auto-freeze triggered: ${securityEvent.id} for card ${securityEvent.cardId}`);
    
    // In real implementation, call API function to freeze card
    // await this.callApiFunction('freezeCard', { cardId, reason });
  }

  /**
   * Schedule auto-expiry for cards at validity date
   * This would typically be handled by a server-side scheduled function
   */
  scheduleAutoExpiry(cardId: string, expiryDate: string): void {
    const expiryTime = new Date(expiryDate).getTime();
    const now = Date.now();
    const timeUntilExpiry = expiryTime - now;

    if (timeUntilExpiry > 0) {
      console.log(`Auto-expiry scheduled for card ${this.maskCardId(cardId)} in ${Math.round(timeUntilExpiry / (1000 * 60 * 60 * 24))} days`);
      
      // In real implementation, this would be handled by server-side scheduled functions
      // setTimeout(() => {
      //   this.autoExpireCard(cardId);
      // }, timeUntilExpiry);
    }
  }

  /**
   * Get PCI-DSS compliant card display data
   * Returns only non-sensitive, tokenized information
   */
  getCardDisplayData(cardToken: CardToken): {
    displayPan: string;
    maskedCvv: string;
    expiryDate: string;
    canShowDetails: boolean;
  } {
    return {
      displayPan: cardToken.maskedPan,
      maskedCvv: '***', // Never expose CVV
      expiryDate: cardToken.expiryDate,
      canShowDetails: cardToken.status === 'active',
    };
  }

  /**
   * Validate card operations with security checks
   */
  validateCardOperation(
    cardId: string,
    operation: 'view_details' | 'freeze' | 'unfreeze' | 'delete'
  ): { allowed: boolean; reason?: string } {
    const maskedCardId = this.maskCardId(cardId);
    console.log(`Validating ${operation} operation for card ${maskedCardId}`);

    // Add security validations here
    // e.g., rate limiting, user authentication, etc.
    
    return { allowed: true };
  }

  // Private utility methods
  private generateSecureToken(): string {
    const timestamp = Date.now().toString();
    const randomBytes = Math.random().toString(36).substring(2);
    return `tok_${timestamp}_${randomBytes}`;
  }

  private maskPAN(pan: string): string {
    const cleaned = pan.replace(/\s/g, '');
    if (cleaned.length < 8) return cleaned;
    
    const first4 = cleaned.substring(0, 4);
    const last4 = cleaned.substring(cleaned.length - 4);
    const middle = '*'.repeat(cleaned.length - 8);
    
    return `${first4}${middle}${last4}`;
  }

  private maskCardId(cardId: string): string {
    if (cardId.length <= 8) return cardId;
    return `${cardId.substring(0, 8)}...`;
  }

  private async getCurrentDeclinedAttempts(cardId: string): Promise<number> {
    // Mock implementation - would query secure server
    console.log(`Fetching declined attempts for card ${this.maskCardId(cardId)}`);
    return Math.floor(Math.random() * 2); // Mock 0-2 current attempts
  }
}

// Error state colors
export const SECURITY_COLORS = {
  error: '#EA3B52',
  success: '#A8E4A0',
  warning: '#F57C00',
  info: '#1976D2',
  seaGreen: '#06402B',
  iceGlow: '#b9f1ffe',
} as const;

// Typography constants for cards
export const CARD_TYPOGRAPHY = {
  fontFamily: 'System', // Use system font for consistency
  fontSize: {
    nickname: 16,
    pan: 14,
    expiry: 12,
    status: 10,
  },
  fontWeight: {
    nickname: '600',
    pan: '400',
    expiry: '400',
    status: '700',
  },
  color: {
    onDark: '#FFFFFF',
    onLight: '#000000',
    overlay: 'rgba(255, 255, 255, 0.12)', // 12% blur overlay
  },
} as const;

export default VirtualCardSecurityService;
