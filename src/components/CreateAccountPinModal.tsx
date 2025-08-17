import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  Dimensions,
  Animated,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ChevronLeft, Check } from 'lucide-react-native';
import { colors, spacing, borderRadius, shadows, globalStyles } from '../theme';

const { width: screenWidth } = Dimensions.get('window');
const MODAL_MAX_WIDTH = Math.min(screenWidth - 32, 380);

interface CreateAccountPinModalProps {
  visible: boolean;
  onClose: () => void;
  onPinCreated: (pin: string) => void;
  userName?: string;
}

type PinStep = 'create' | 'confirm';

const CreateAccountPinModal: React.FC<CreateAccountPinModalProps> = ({
  visible,
  onClose,
  onPinCreated,
  userName = 'User',
}) => {
  const [currentStep, setCurrentStep] = useState<PinStep>('create');
  const [pin, setPin] = useState('');
  const [confirmPin, setConfirmPin] = useState('');
  const [originalPin, setOriginalPin] = useState('');
  const [isError, setIsError] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [showSuccess, setShowSuccess] = useState(false);

  // Animation values
  const shakeAnim = useState(new Animated.Value(0))[0];
  const successOpacity = useState(new Animated.Value(0))[0];

  // Reset state when modal opens/closes
  useEffect(() => {
    if (visible) {
      setCurrentStep('create');
      setPin('');
      setConfirmPin('');
      setOriginalPin('');
      setIsError(false);
      setErrorMessage('');
      setShowSuccess(false);
      successOpacity.setValue(0);
    }
  }, [visible, successOpacity]);

  const shake = () => {
    Animated.sequence([
      Animated.timing(shakeAnim, { toValue: 10, duration: 100, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: -10, duration: 100, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: 10, duration: 100, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: 0, duration: 100, useNativeDriver: true }),
    ]).start();
  };

  const showSuccessAnimation = () => {
    setShowSuccess(true);
    Animated.timing(successOpacity, {
      toValue: 1,
      duration: 300,
      useNativeDriver: true,
    }).start(() => {
      setTimeout(() => {
        onPinCreated(originalPin);
      }, 1000);
    });
  };

  const handleNumberPress = (number: string) => {
    if (isError) {
      setIsError(false);
      setErrorMessage('');
    }

    const currentPinValue = currentStep === 'create' ? pin : confirmPin;
    
    if (currentPinValue.length < 6) {
      const newPin = currentPinValue + number;
      
      if (currentStep === 'create') {
        setPin(newPin);
        if (newPin.length === 6) {
          // Move to confirm step
          setTimeout(() => {
            setOriginalPin(newPin);
            setCurrentStep('confirm');
            setPin('');
          }, 200);
        }
      } else {
        setConfirmPin(newPin);
        if (newPin.length === 6) {
          // Check if PINs match
          if (newPin === originalPin) {
            showSuccessAnimation();
          } else {
            setIsError(true);
            setErrorMessage('PINs do not match. Please try again.');
            shake();
            setTimeout(() => {
              setCurrentStep('create');
              setPin('');
              setConfirmPin('');
              setOriginalPin('');
              setIsError(false);
              setErrorMessage('');
            }, 2000);
          }
        }
      }
    }
  };

  const handleDelete = () => {
    if (currentStep === 'create') {
      setPin(prev => prev.slice(0, -1));
    } else {
      setConfirmPin(prev => prev.slice(0, -1));
    }
    
    if (isError) {
      setIsError(false);
      setErrorMessage('');
    }
  };

  const handleClose = () => {
    setCurrentStep('create');
    setPin('');
    setConfirmPin('');
    setOriginalPin('');
    setIsError(false);
    setErrorMessage('');
    setShowSuccess(false);
    onClose();
  };

  const getCurrentPin = () => currentStep === 'create' ? pin : confirmPin;
  const getCurrentTitle = () => currentStep === 'create' ? 'Create Your PIN' : 'Confirm Your PIN';
  const getCurrentSubtitle = () => currentStep === 'create' 
    ? 'Create a 6-digit PIN to secure your account' 
    : 'Enter your PIN again to confirm';

  const keypadNumbers = [
    ['1', '2', '3'],
    ['4', '5', '6'],
    ['7', '8', '9'],
    ['', '0', 'delete'],
  ];

  if (!visible) return null;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={handleClose}
    >
      <View style={styles.overlay}>
        <SafeAreaView style={styles.container}>
          <Animated.View style={[
            styles.modalContent,
            { transform: [{ translateX: shakeAnim }] }
          ]}>
            {/* Header */}
            <View style={styles.header}>
              <TouchableOpacity style={globalStyles.backButton} onPress={handleClose}>
                <ChevronLeft size={24} color={colors.primary} />
              </TouchableOpacity>
            </View>

            {/* Title and Subtitle */}
            <View style={styles.titleContainer}>
              <Text style={styles.title}>{getCurrentTitle()}</Text>
              <Text style={styles.subtitle}>{getCurrentSubtitle()}</Text>
              <Text style={styles.welcomeText}>Welcome, {userName}!</Text>
            </View>

            {/* Error Message */}
            {errorMessage ? (
              <View style={styles.errorContainer}>
                <Text style={styles.errorText}>{errorMessage}</Text>
              </View>
            ) : null}

            {/* PIN Dots */}
            <View style={styles.pinContainer}>
              {Array.from({ length: 6 }).map((_, index) => (
                <View
                  key={index}
                  style={[
                    styles.pinDot,
                    getCurrentPin().length > index && styles.pinDotFilled,
                    isError && styles.pinDotError,
                  ]}
                />
              ))}
            </View>

            {/* Keypad */}
            <View style={styles.keypad}>
              {keypadNumbers.map((row, rowIndex) => (
                <View key={rowIndex} style={styles.keypadRow}>
                  {row.map((key, keyIndex) => (
                    <TouchableOpacity
                      key={keyIndex}
                      style={[
                        styles.keypadButton,
                        key === '' && styles.keypadButtonEmpty,
                      ]}
                      onPress={() => {
                        if (key === 'delete') {
                          handleDelete();
                        } else if (key !== '') {
                          handleNumberPress(key);
                        }
                      }}
                      disabled={key === ''}
                    >
                      <View style={[
                        styles.keypadButtonInner,
                        key === '' && styles.keypadButtonEmpty,
                      ]}>
                        {key === 'delete' ? (
                          <Text style={styles.keypadDeleteText}>⌫</Text>
                        ) : (
                          <Text style={styles.keypadText}>{key}</Text>
                        )}
                      </View>
                    </TouchableOpacity>
                  ))}
                </View>
              ))}
            </View>
          </Animated.View>

          {/* Success Overlay */}
          {showSuccess && (
            <Animated.View style={[styles.successOverlay, { opacity: successOpacity }]}>
              <View style={styles.successIcon}>
                <Check size={48} color={colors.white} />
              </View>
              <Text style={styles.successText}>PIN Created Successfully!</Text>
            </Animated.View>
          )}
        </SafeAreaView>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  container: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: colors.white,
    borderTopLeftRadius: borderRadius.xl,
    borderTopRightRadius: borderRadius.xl,
    paddingBottom: spacing.xl,
    maxWidth: MODAL_MAX_WIDTH,
    alignSelf: 'center',
    width: '100%',
    ...shadows.large,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
    paddingBottom: spacing.sm,
  },
  titleContainer: {
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.xl,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: spacing.xs,
  },
  subtitle: {
    fontSize: 16,
    color: colors.secondaryText,
    textAlign: 'center',
    marginBottom: spacing.sm,
  },
  welcomeText: {
    fontSize: 18,
    color: colors.primary,
    fontWeight: '600',
  },
  errorContainer: {
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.md,
  },
  errorText: {
    color: colors.error,
    fontSize: 14,
    textAlign: 'center',
  },
  pinContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.xl,
    gap: spacing.md,
  },
  pinDot: {
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: colors.border,
    borderWidth: 2,
    borderColor: colors.border,
  },
  pinDotFilled: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  pinDotError: {
    backgroundColor: colors.error,
    borderColor: colors.error,
  },
  keypad: {
    paddingHorizontal: spacing.lg,
  },
  keypadRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: spacing.md,
    gap: spacing.lg,
  },
  keypadButton: {
    width: 72,
    height: 72,
    alignItems: 'center',
    justifyContent: 'center',
  },
  keypadButtonInner: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: colors.background,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: colors.border,
  },
  keypadButtonEmpty: {
    backgroundColor: 'transparent',
    borderColor: 'transparent',
  },
  keypadText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.text,
  },
  keypadDeleteText: {
    fontSize: 20,
    color: colors.secondaryText,
  },
  successOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(6, 64, 43, 0.95)',
    alignItems: 'center',
    justifyContent: 'center',
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
  successText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.white,
    textAlign: 'center',
  },
});

export default CreateAccountPinModal;