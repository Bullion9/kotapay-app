import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  Alert,
  Vibration,
  Animated
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { ArrowLeft, Shield, Fingerprint, Check, X } from 'lucide-react-native';
import { RootStackParamList } from '../types';
import { useAuth } from '../contexts/AuthContext';
import { globalStyles, colors, spacing, iconSizes, shadows } from '../theme';

type CreateAccountPinScreenNavigationProp = StackNavigationProp<RootStackParamList, 'CreateAccountPin'>;

const CreateAccountPinScreen: React.FC = () => {
  const navigation = useNavigation<CreateAccountPinScreenNavigationProp>();
  const { updatePin, user } = useAuth();
  const [pin, setPin] = useState('');
  const [confirmPin, setConfirmPin] = useState('');
  const [step, setStep] = useState<'setup' | 'confirm'>('setup');
  const [isLoading, setIsLoading] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [showError, setShowError] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // Animation values
  const fadeAnim = useState(new Animated.Value(0))[0];
  const scaleAnim = useState(new Animated.Value(0.5))[0];

  const handleNumberPress = (number: string) => {
    // Add haptic feedback vibration for each number input
    Vibration.vibrate(50);
    
    if (step === 'setup') {
      if (pin.length < 4) {
        setPin(pin + number);
        if (pin.length === 3) {
          setTimeout(() => {
            setStep('confirm');
          }, 500);
        }
      }
    } else {
      if (confirmPin.length < 4) {
        setConfirmPin(confirmPin + number);
        if (confirmPin.length === 3) {
          setTimeout(() => {
            validatePin(confirmPin + number);
          }, 500);
        }
      }
    }
  };

  const handleDelete = () => {
    // Add haptic feedback vibration for delete action
    Vibration.vibrate(30);
    
    if (step === 'setup') {
      setPin(pin.slice(0, -1));
    } else {
      setConfirmPin(confirmPin.slice(0, -1));
    }
  };

  const validatePin = async (enteredConfirmPin: string) => {
    if (pin === enteredConfirmPin) {
      setIsLoading(true);
      try {
        await updatePin('', pin); // Empty current PIN for new setup
        Vibration.vibrate([0, 100, 50, 100]);
        showSuccessAnimation();
      } catch (error: any) {
        console.error('PIN creation failed:', error);
        const errorMessage = error.message || 'Failed to create PIN. Please try again.';
        showErrorAnimation(errorMessage);
      } finally {
        setIsLoading(false);
      }
    } else {
      showErrorAnimation('PINs do not match. Please try again.');
    }
  };

  const resetPin = () => {
    setPin('');
    setConfirmPin('');
    setStep('setup');
    setShowError(false);
    setErrorMessage('');
  };

  const showSuccessAnimation = () => {
    setShowSuccess(true);
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        tension: 100,
        friction: 8,
        useNativeDriver: true,
      }),
    ]).start(() => {
      // Navigate to main app after success animation
      setTimeout(() => {
        // Reset navigation stack and go to main app
        navigation.reset({
          index: 0,
          routes: [{ name: 'MainTabs' }],
        });
      }, 1500);
    });
  };

  const showErrorAnimation = (message: string) => {
    setErrorMessage(message);
    setShowError(true);
    Vibration.vibrate([0, 200, 100, 200]);
    
    // Hide error after 3 seconds and reset
    setTimeout(() => {
      setShowError(false);
      resetPin();
    }, 3000);
  };

  const handleBiometric = () => {
    // In a real app, you would implement biometric authentication here
    Alert.alert('Biometric Authentication', 'Face ID / Touch ID would be implemented here');
  };

  const currentPin = step === 'setup' ? pin : confirmPin;
  const pinLength = 4;

  return (
    <SafeAreaView style={[globalStyles.container, styles.container]}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity 
          style={globalStyles.backButton}
          onPress={() => navigation.goBack()}
        >
          <ArrowLeft size={iconSizes.md} color={colors.text} />
        </TouchableOpacity>
      </View>

      {/* Content */}
      <View style={styles.content}>
        {/* Icon */}
        <View style={styles.iconContainer}>
          <Shield size={64} color={colors.primary} />
        </View>

        {/* Title and Description */}
        <View style={styles.titleContainer}>
          <Text style={styles.welcomeText}>
            Welcome, {user?.name || 'User'}!
          </Text>
          <Text style={styles.title}>
            {step === 'setup' ? 'Create Your PIN' : 'Confirm Your PIN'}
          </Text>
          <Text style={styles.description}>
            {step === 'setup' 
              ? 'Create a 4-digit PIN to secure your account' 
              : 'Enter your PIN again to confirm'
            }
          </Text>
        </View>

        {/* PIN Dots */}
        <View style={styles.pinContainer}>
          {Array.from({ length: pinLength }).map((_, index) => (
            <View
              key={index}
              style={[
                styles.pinDot,
                currentPin.length > index && styles.pinDotFilled,
              ]}
            />
          ))}
        </View>

        {/* Keypad */}
        <View style={styles.keypad}>
          {/* Row 1 */}
          <View style={styles.keypadRow}>
            {['1', '2', '3'].map((number) => (
              <TouchableOpacity
                key={number}
                style={styles.keypadButton}
                onPress={() => handleNumberPress(number)}
                disabled={isLoading}
              >
                <Text style={styles.keypadButtonText}>{number}</Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Row 2 */}
          <View style={styles.keypadRow}>
            {['4', '5', '6'].map((number) => (
              <TouchableOpacity
                key={number}
                style={styles.keypadButton}
                onPress={() => handleNumberPress(number)}
                disabled={isLoading}
              >
                <Text style={styles.keypadButtonText}>{number}</Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Row 3 */}
          <View style={styles.keypadRow}>
            {['7', '8', '9'].map((number) => (
              <TouchableOpacity
                key={number}
                style={styles.keypadButton}
                onPress={() => handleNumberPress(number)}
                disabled={isLoading}
              >
                <Text style={styles.keypadButtonText}>{number}</Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Row 4 */}
          <View style={styles.keypadRow}>
            <TouchableOpacity
              style={[styles.keypadButton, styles.biometricButton]}
              onPress={handleBiometric}
              disabled={isLoading}
            >
              <Fingerprint size={iconSizes.md} color={colors.white} />
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.keypadButton}
              onPress={() => handleNumberPress('0')}
              disabled={isLoading}
            >
              <Text style={styles.keypadButtonText}>0</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.keypadButton}
              onPress={handleDelete}
              disabled={isLoading}
            >
              <Text style={styles.deleteButtonText}>⌫</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Progress Indicator */}
        <View style={styles.progressContainer}>
          <View style={[styles.progressDot, step === 'setup' && styles.progressDotActive]} />
          <View style={[styles.progressDot, step === 'confirm' && styles.progressDotActive]} />
        </View>
      </View>

      {/* Success Overlay */}
      {showSuccess && (
        <Animated.View style={[
          styles.overlay,
          styles.successOverlay,
          {
            opacity: fadeAnim,
            transform: [{ scale: scaleAnim }]
          }
        ]}>
          <View style={styles.overlayContent}>
            <View style={styles.successIcon}>
              <Check size={48} color={colors.white} />
            </View>
            <Text style={styles.overlayTitle}>Success!</Text>
            <Text style={styles.overlayMessage}>Your PIN has been created successfully</Text>
          </View>
        </Animated.View>
      )}

      {/* Error Overlay */}
      {showError && (
        <View style={[styles.overlay, styles.errorOverlay]}>
          <View style={styles.overlayContent}>
            <View style={styles.errorIcon}>
              <X size={48} color={colors.white} />
            </View>
            <Text style={styles.overlayTitle}>Failed!</Text>
            <Text style={styles.overlayMessage}>{errorMessage}</Text>
          </View>
        </View>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.xl,
  },
  iconContainer: {
    marginBottom: spacing.xl,
  },
  titleContainer: {
    alignItems: 'center',
    marginBottom: spacing.xl,
  },
  welcomeText: {
    fontSize: 22,
    fontWeight: '600',
    color: colors.primary,
    marginBottom: spacing.md,
    textAlign: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: spacing.sm,
    textAlign: 'center',
  },
  description: {
    fontSize: 16,
    color: colors.secondaryText,
    textAlign: 'center',
    lineHeight: 24,
  },
  pinContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.xl * 2,
    gap: spacing.lg,
  },
  pinDot: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: colors.border,
    borderWidth: 2,
    borderColor: colors.border,
  },
  pinDotFilled: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  keypad: {
    alignItems: 'center',
    marginBottom: spacing.xl,
  },
  keypadRow: {
    flexDirection: 'row',
    marginBottom: spacing.lg,
    gap: spacing.xl,
  },
  keypadButton: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: colors.white,
    alignItems: 'center',
    justifyContent: 'center',
    ...shadows.medium,
  },
  biometricButton: {
    backgroundColor: colors.seaGreen, // Use the sea green color from your theme
  },
  keypadButtonText: {
    fontSize: 28,
    fontWeight: '600',
    color: colors.text,
  },
  deleteButtonText: {
    fontSize: 24,
    color: colors.secondaryText,
  },
  progressContainer: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  progressDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.border,
  },
  progressDotActive: {
    backgroundColor: colors.primary,
  },
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  successOverlay: {
    backgroundColor: 'rgba(6, 64, 43, 0.95)', // Sea green with opacity
  },
  errorOverlay: {
    backgroundColor: 'rgba(234, 59, 82, 0.95)', // Error red with opacity
  },
  overlayContent: {
    alignItems: 'center',
    paddingHorizontal: spacing.xl,
  },
  successIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.lg,
  },
  errorIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.lg,
  },
  overlayTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.white,
    marginBottom: spacing.sm,
  },
  overlayMessage: {
    fontSize: 16,
    color: colors.white,
    textAlign: 'center',
    opacity: 0.9,
  },
});

export default CreateAccountPinScreen;
