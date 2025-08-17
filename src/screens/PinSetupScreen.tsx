import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  Alert,
  Vibration 
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { ArrowLeft, Shield, Check } from 'lucide-react-native';
import { RootStackParamList } from '../types';
import { useAuth } from '../contexts/AuthContext';
import { globalStyles, colors, spacing, iconSizes, shadows, borderRadius } from '../theme';

type PinSetupScreenNavigationProp = StackNavigationProp<RootStackParamList, 'PinSetup'>;

const PinSetupScreen: React.FC = () => {
  const navigation = useNavigation<PinSetupScreenNavigationProp>();
  const { updatePin } = useAuth();
  const [pin, setPin] = useState('');
  const [confirmPin, setConfirmPin] = useState('');
  const [step, setStep] = useState<'setup' | 'confirm'>('setup');
  const [isLoading, setIsLoading] = useState(false);

  const handleNumberPress = (number: string) => {
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
    if (step === 'setup') {
      setPin(pin.slice(0, -1));
    } else {
      setConfirmPin(confirmPin.slice(0, -1));
    }
  };

  const validatePin = async (fullConfirmPin: string) => {
    if (pin !== fullConfirmPin) {
      Vibration.vibrate(200);
      Alert.alert('PIN Mismatch', 'The PINs do not match. Please try again.', [
        {
          text: 'OK',
          onPress: () => {
            setStep('setup');
            setPin('');
            setConfirmPin('');
          }
        }
      ]);
      return;
    }

    setIsLoading(true);
    try {
      await updatePin('', pin); // Empty current PIN for new setup
      Alert.alert('Success', 'Your PIN has been set successfully!', [
        {
          text: 'Continue',
          onPress: () => navigation.replace('MainTabs')
        }
      ]);
    } catch {
      Alert.alert('Error', 'Failed to set PIN. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const renderPinDots = () => {
    const currentPin = step === 'setup' ? pin : confirmPin;
    return (
      <View style={styles.pinContainer}>
        {[0, 1, 2, 3].map((index) => (
          <View
            key={index}
            style={[
              styles.pinDot,
              {
                backgroundColor: index < currentPin.length ? colors.primary : colors.border
              }
            ]}
          />
        ))}
      </View>
    );
  };

  const renderNumberPad = () => {
    const numbers = [
      ['1', '2', '3'],
      ['4', '5', '6'],
      ['7', '8', '9'],
      ['', '0', 'delete']
    ];

    return (
      <View style={styles.numberPad}>
        {numbers.map((row, rowIndex) => (
          <View key={rowIndex} style={styles.numberRow}>
            {row.map((item, itemIndex) => {
              if (item === '') {
                return <View key={itemIndex} style={styles.numberButton} />;
              }
              
              if (item === 'delete') {
                return (
                  <TouchableOpacity
                    key={itemIndex}
                    style={styles.numberButton}
                    onPress={handleDelete}
                  >
                    <ArrowLeft size={iconSizes.md} color={colors.text} />
                  </TouchableOpacity>
                );
              }

              return (
                <TouchableOpacity
                  key={itemIndex}
                  style={styles.numberButton}
                  onPress={() => handleNumberPress(item)}
                >
                  <Text style={styles.numberText}>{item}</Text>
                </TouchableOpacity>
              );
            })}
          </View>
        ))}
      </View>
    );
  };

  return (
    <SafeAreaView style={[globalStyles.container, styles.container]}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <ArrowLeft size={iconSizes.md} color={colors.text} />
        </TouchableOpacity>
      </View>

      {/* Content */}
      <View style={styles.content}>
        {/* Icon */}
        <View style={styles.iconContainer}>
          {step === 'setup' ? (
            <Shield size={48} color={colors.primary} />
          ) : (
            <Check size={48} color={colors.success} />
          )}
        </View>

        {/* Title and Subtitle */}
        <Text style={styles.title}>
          {step === 'setup' ? 'Create Your PIN' : 'Confirm Your PIN'}
        </Text>
        <Text style={styles.subtitle}>
          {step === 'setup' 
            ? 'Create a 4-digit PIN to secure your KotaPay account'
            : 'Please enter your PIN again to confirm'
          }
        </Text>

        {/* PIN Dots */}
        {renderPinDots()}

        {/* Security Note */}
        {step === 'setup' && (
          <View style={styles.securityNote}>
            <Shield size={iconSizes.sm} color={colors.secondaryText} />
            <Text style={styles.securityText}>
              Your PIN will be used to authorize transactions
            </Text>
          </View>
        )}
      </View>

      {/* Number Pad */}
      {renderNumberPad()}

      {/* Loading State */}
      {isLoading && (
        <View style={styles.loadingOverlay}>
          <Text style={styles.loadingText}>Setting up your PIN...</Text>
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
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.md,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.white,
    alignItems: 'center',
    justifyContent: 'center',
    ...shadows.small,
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.xl,
  },
  iconContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: colors.white,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.xl,
    ...shadows.medium,
  },
  title: {
    fontSize: 28,
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
    marginBottom: spacing.xxl,
    paddingHorizontal: spacing.md,
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
  },
  securityNote: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.white,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.medium,
    gap: spacing.sm,
  },
  securityText: {
    fontSize: 14,
    color: colors.secondaryText,
    flex: 1,
  },
  numberPad: {
    paddingHorizontal: spacing.xl,
    paddingBottom: spacing.xl,
  },
  numberRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing.md,
  },
  numberButton: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: colors.white,
    alignItems: 'center',
    justifyContent: 'center',
    ...shadows.small,
  },
  numberText: {
    fontSize: 24,
    fontWeight: '600',
    color: colors.text,
  },
  loadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    fontSize: 16,
    color: colors.white,
    fontWeight: '500',
  },
});

export default PinSetupScreen;
