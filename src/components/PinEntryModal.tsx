import {
    Delete,
    Fingerprint,
    Lock,
    X,
} from 'lucide-react-native';
import React, { useEffect, useState } from 'react';
import {
    Modal,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLoading } from '../hooks/useLoading';
import { borderRadius, colors, iconSizes, shadows, spacing } from '../theme';
import LoadingOverlay from './LoadingOverlay';

interface PinEntryModalProps {
  visible: boolean;
  onClose: () => void;
  onPinEntered: (pin: string) => void;
  title?: string;
  subtitle?: string;
  allowBiometric?: boolean;
  maxAttempts?: number;
}

const PinEntryModal: React.FC<PinEntryModalProps> = ({
  visible,
  onClose,
  onPinEntered,
  title = "Enter PIN",
  subtitle = "Enter your 4-digit PIN to continue",
  allowBiometric = false,
  maxAttempts = 3,
}) => {
  const [pin, setPin] = useState('');
  const [attempts, setAttempts] = useState(0);
  const [isError, setIsError] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Enhanced loading states
  const { isLoading, setConfirming, stopLoading } = useLoading();

  // Reset state when modal opens/closes
  useEffect(() => {
    if (visible) {
      setPin('');
      setAttempts(0);
      setIsError(false);
      setIsSubmitting(false);
      stopLoading(); // Reset loading state
    }
  }, [visible, stopLoading]);

  // Handle PIN completion with enhanced loading
  useEffect(() => {
    if (pin.length === 4 && !isSubmitting) {
      setIsSubmitting(true);
      setConfirming();
      
      // Simulate PIN verification with loading phases
      setTimeout(() => {
        stopLoading();
        onPinEntered(pin);
      }, 1200);
    }
  }, [pin, onPinEntered, isSubmitting, setConfirming, stopLoading]);

  const handleNumberPress = (number: string) => {
    if (pin.length < 4 && !isSubmitting) {
      setPin(prev => prev + number);
      setIsError(false);
    }
  };

  const handleDelete = () => {
    if (!isSubmitting) {
      setPin(prev => prev.slice(0, -1));
      setIsError(false);
    }
  };

  const handleBiometric = () => {
    // Mock biometric authentication - in real app, use react-native-biometrics
    console.log('Biometric authentication triggered');
    // For now, just simulate successful biometric auth
    onPinEntered('biometric');
  };

  const renderPinDots = () => (
    <View style={styles.pinContainer}>
      {[0, 1, 2, 3].map((index) => (
        <View
          key={index}
          style={[
            styles.pinDot,
            pin.length > index && styles.pinDotFilled,
            isError && styles.pinDotError,
          ]}
        />
      ))}
    </View>
  );

  const renderNumberPad = () => {
    const numbers = ['1', '2', '3', '4', '5', '6', '7', '8', '9', 'biometric', '0', 'delete'];
    
    return (
      <View style={styles.numberPad}>
        {numbers.map((item, index) => {
          if (item === 'biometric') {
            return (
              <TouchableOpacity
                key={index}
                style={[
                  styles.numberButton, 
                  allowBiometric ? styles.biometricButton : styles.numberButtonDisabled
                ]}
                onPress={allowBiometric ? handleBiometric : undefined}
                disabled={!allowBiometric}
              >
                <Fingerprint 
                  size={iconSizes.lg} 
                  color={allowBiometric ? colors.white : colors.secondaryText} 
                />
              </TouchableOpacity>
            );
          }
          
          if (item === 'delete') {
            return (
              <TouchableOpacity
                key={index}
                style={styles.numberButton}
                onPress={handleDelete}
                disabled={pin.length === 0}
              >
                <Delete 
                  size={iconSizes.md} 
                  color={pin.length === 0 ? colors.secondaryText : colors.text} 
                />
              </TouchableOpacity>
            );
          }
          
          return (
            <TouchableOpacity
              key={index}
              style={styles.numberButton}
              onPress={() => handleNumberPress(item)}
            >
              <Text style={styles.numberButtonText}>{item}</Text>
            </TouchableOpacity>
          );
        })}
      </View>
    );
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <SafeAreaView style={styles.modalContainer}>
          {/* Header */}
          <View style={styles.header}>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <X size={iconSizes.md} color={colors.text} />
            </TouchableOpacity>
          </View>

          {/* Content */}
          <View style={styles.content}>
            {/* Lock Icon */}
            <View style={styles.iconContainer}>
              <Lock size={32} color={colors.primary} />
            </View>

            {/* Title and Subtitle */}
            <Text style={styles.title}>{title}</Text>
            <Text style={styles.subtitle}>{subtitle}</Text>

            {/* Error Message */}
            {isError && (
              <Text style={styles.errorText}>
                Incorrect PIN. {maxAttempts - attempts - 1} attempts remaining.
              </Text>
            )}

            {/* PIN Dots */}
            {renderPinDots()}
          </View>

          {/* Number Pad */}
          {renderNumberPad()}
        </SafeAreaView>
      </View>
      
      {/* Loading Overlay */}
      <LoadingOverlay 
        isVisible={isLoading}
        title="Verifying PIN..."
        subtitle="Please wait while we verify your PIN"
      />
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContainer: {
    backgroundColor: colors.background,
    borderTopLeftRadius: borderRadius.xl,
    borderTopRightRadius: borderRadius.xl,
    minHeight: '70%',
    paddingBottom: spacing.xl,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  closeButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.card,
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    alignItems: 'center',
    paddingHorizontal: spacing.xl,
    paddingBottom: spacing.xl,
  },
  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: colors.white,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.lg,
    ...shadows.medium,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.text,
    textAlign: 'center',
    marginBottom: spacing.sm,
  },
  subtitle: {
    fontSize: 16,
    color: colors.secondaryText,
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: spacing.xl,
  },
  errorText: {
    fontSize: 14,
    color: colors.error,
    textAlign: 'center',
    marginBottom: spacing.md,
  },
  pinContainer: {
    flexDirection: 'row',
    gap: spacing.lg,
    marginBottom: spacing.xl,
  },
  pinDot: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: colors.border,
    backgroundColor: colors.white,
  },
  pinDotFilled: {
    backgroundColor: colors.primaryBills || colors.primary,
    borderColor: colors.primaryBills || colors.primary,
  },
  pinDotError: {
    backgroundColor: '#EA3B52', // Bills error color
    borderColor: '#EA3B52',
  },
  numberPad: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    paddingHorizontal: spacing.xl,
    gap: spacing.md,
  },
  numberButton: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: colors.white,
    alignItems: 'center',
    justifyContent: 'center',
    ...shadows.small,
  },
  numberButtonDisabled: {
    opacity: 0.5,
  },
  biometricButton: {
    backgroundColor: '#06402B', // Sea green to match app theme
  },
  numberButtonText: {
    fontSize: 24,
    fontWeight: '600',
    color: colors.text,
  },
});

export default PinEntryModal;
