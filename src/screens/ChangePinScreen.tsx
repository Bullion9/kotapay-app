import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { ChevronLeft, Eye, EyeOff, KeyRound, Shield } from 'lucide-react-native';
import React, { useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    KeyboardAvoidingView,
    Platform,
    SafeAreaView,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';
import { borderRadius, colors, spacing, typography } from '../theme';
import { ProfileParamList } from '../types';

const ChangePinScreen: React.FC = () => {
  const navigation = useNavigation<StackNavigationProp<ProfileParamList>>();
  const [currentPin, setCurrentPin] = useState('');
  const [newPin, setNewPin] = useState('');
  const [confirmPin, setConfirmPin] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showCurrentPin, setShowCurrentPin] = useState(false);
  const [showNewPin, setShowNewPin] = useState(false);
  const [showConfirmPin, setShowConfirmPin] = useState(false);
  const [pinType, setPinType] = useState<'transaction' | 'login'>('transaction');

  const handleBack = () => {
    navigation.goBack();
  };

  const validateCurrentPin = async (pin: string): Promise<boolean> => {
    try {
      const storedPin = await AsyncStorage.getItem(`${pinType}Pin`);
      return storedPin === pin;
    } catch (error) {
      console.error('Error validating PIN:', error);
      return false;
    }
  };

  const handleSubmit = async () => {
    if (newPin !== confirmPin) {
      Alert.alert('Error', 'New PIN and confirmation do not match');
      return;
    }

    if (newPin.length !== 4) {
      Alert.alert('Error', 'PIN must be 4 digits');
      return;
    }

    if (newPin === currentPin) {
      Alert.alert('Error', 'New PIN must be different from current PIN');
      return;
    }

    setIsLoading(true);

    try {
      const isCurrentPinValid = await validateCurrentPin(currentPin);
      
      if (!isCurrentPinValid) {
        Alert.alert('Error', 'Current PIN is incorrect');
        setIsLoading(false);
        return;
      }

      // Save new PIN
      await AsyncStorage.setItem(`${pinType}Pin`, newPin);

      // Update last changed timestamp
      await AsyncStorage.setItem(`${pinType}PinLastChanged`, new Date().toISOString());

      Alert.alert(
        'Success', 
        `${pinType === 'transaction' ? 'Transaction' : 'Login'} PIN changed successfully`,
        [
          {
            text: 'OK',
            onPress: () => navigation.goBack(),
          },
        ]
      );
    } catch (error) {
      console.error('Error changing PIN:', error);
      Alert.alert('Error', 'Failed to change PIN. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handlePinTypeChange = (type: 'transaction' | 'login') => {
    setPinType(type);
    setCurrentPin('');
    setNewPin('');
    setConfirmPin('');
  };

  const isFormValid = currentPin.length === 4 && newPin.length === 4 && confirmPin.length === 4;

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={handleBack} style={styles.backButton}>
          <ChevronLeft size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Change PIN</Text>
        <View style={styles.placeholder} />
      </View>

      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardAvoidingView}
      >
        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {/* PIN Type Selection */}
          <View style={styles.pinTypeContainer}>
            <Text style={styles.sectionTitle}>Select PIN Type</Text>
            <View style={styles.pinTypeButtons}>
              <TouchableOpacity
                style={[
                  styles.pinTypeButton,
                  pinType === 'transaction' && styles.pinTypeButtonActive,
                ]}
                onPress={() => handlePinTypeChange('transaction')}
              >
                <Shield size={20} color={pinType === 'transaction' ? colors.white : colors.primary} />
                <Text style={[
                  styles.pinTypeButtonText,
                  pinType === 'transaction' && styles.pinTypeButtonTextActive,
                ]}>
                  Transaction PIN
                </Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={[
                  styles.pinTypeButton,
                  pinType === 'login' && styles.pinTypeButtonActive,
                ]}
                onPress={() => handlePinTypeChange('login')}
              >
                <KeyRound size={20} color={pinType === 'login' ? colors.white : colors.primary} />
                <Text style={[
                  styles.pinTypeButtonText,
                  pinType === 'login' && styles.pinTypeButtonTextActive,
                ]}>
                  Login PIN
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Current PIN */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Current {pinType === 'transaction' ? 'Transaction' : 'Login'} PIN</Text>
            <View style={styles.passwordContainer}>
              <TextInput
                style={styles.input}
                value={currentPin}
                onChangeText={setCurrentPin}
                keyboardType="numeric"
                secureTextEntry={!showCurrentPin}
                maxLength={4}
                placeholder="Enter current PIN"
                placeholderTextColor={colors.secondaryText}
              />
              <TouchableOpacity
                style={styles.eyeButton}
                onPress={() => setShowCurrentPin(!showCurrentPin)}
              >
                {showCurrentPin ? (
                  <EyeOff size={20} color={colors.secondaryText} />
                ) : (
                  <Eye size={20} color={colors.secondaryText} />
                )}
              </TouchableOpacity>
            </View>
          </View>

          {/* New PIN */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>New {pinType === 'transaction' ? 'Transaction' : 'Login'} PIN</Text>
            <View style={styles.passwordContainer}>
              <TextInput
                style={styles.input}
                value={newPin}
                onChangeText={setNewPin}
                keyboardType="numeric"
                secureTextEntry={!showNewPin}
                maxLength={4}
                placeholder="Enter new PIN"
                placeholderTextColor={colors.secondaryText}
              />
              <TouchableOpacity
                style={styles.eyeButton}
                onPress={() => setShowNewPin(!showNewPin)}
              >
                {showNewPin ? (
                  <EyeOff size={20} color={colors.secondaryText} />
                ) : (
                  <Eye size={20} color={colors.secondaryText} />
                )}
              </TouchableOpacity>
            </View>
          </View>

          {/* Confirm PIN */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Confirm New PIN</Text>
            <View style={styles.passwordContainer}>
              <TextInput
                style={styles.input}
                value={confirmPin}
                onChangeText={setConfirmPin}
                keyboardType="numeric"
                secureTextEntry={!showConfirmPin}
                maxLength={4}
                placeholder="Confirm new PIN"
                placeholderTextColor={colors.secondaryText}
              />
              <TouchableOpacity
                style={styles.eyeButton}
                onPress={() => setShowConfirmPin(!showConfirmPin)}
              >
                {showConfirmPin ? (
                  <EyeOff size={20} color={colors.secondaryText} />
                ) : (
                  <Eye size={20} color={colors.secondaryText} />
                )}
              </TouchableOpacity>
            </View>
          </View>

          {/* Security Tips */}
          <View style={styles.securityTips}>
            <Text style={styles.tipsTitle}>Security Tips:</Text>
            <Text style={styles.tipText}>• Use a unique 4-digit PIN</Text>
            <Text style={styles.tipText}>• Avoid common patterns (1234, 0000)</Text>
            <Text style={styles.tipText}>• Don&apos;t share your PIN with anyone</Text>
            <Text style={styles.tipText}>• Change your PIN regularly</Text>
          </View>

          <TouchableOpacity
            style={[
              styles.submitButton,
              (!isFormValid || isLoading) && styles.submitButtonDisabled,
            ]}
            onPress={handleSubmit}
            disabled={!isFormValid || isLoading}
          >
            {isLoading ? (
              <ActivityIndicator size="small" color={colors.white} />
            ) : (
              <Text style={styles.submitButtonText}>Change PIN</Text>
            )}
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
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
    justifyContent: 'space-between',
    padding: spacing.lg,
    backgroundColor: colors.background,
  },
  headerTitle: {
    ...typography.h3,
    color: colors.text,
  },
  backButton: {
    padding: spacing.sm,
    borderRadius: borderRadius.small,
  },
  placeholder: {
    width: 40,
  },
  keyboardAvoidingView: {
    flex: 1,
  },
  content: {
    flex: 1,
    padding: spacing.lg,
  },
  sectionTitle: {
    ...typography.body,
    color: colors.text,
    fontWeight: '600',
    marginBottom: spacing.md,
  },
  pinTypeContainer: {
    marginBottom: spacing.xl,
  },
  pinTypeButtons: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  pinTypeButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.lg,
    borderRadius: borderRadius.medium,
    borderWidth: 1,
    borderColor: colors.primary,
    backgroundColor: colors.white,
    gap: spacing.sm,
  },
  pinTypeButtonActive: {
    backgroundColor: colors.primary,
  },
  pinTypeButtonText: {
    ...typography.caption,
    color: colors.primary,
    fontWeight: '600',
  },
  pinTypeButtonTextActive: {
    color: colors.white,
  },
  inputGroup: {
    marginBottom: spacing.xl,
  },
  label: {
    ...typography.caption,
    color: colors.secondaryText,
    marginBottom: spacing.sm,
    fontWeight: '600',
  },
  passwordContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: borderRadius.medium,
  },
  input: {
    flex: 1,
    padding: spacing.lg,
    color: colors.text,
    fontSize: 16,
  },
  eyeButton: {
    padding: spacing.md,
  },
  securityTips: {
    backgroundColor: colors.white,
    padding: spacing.lg,
    borderRadius: borderRadius.medium,
    marginBottom: spacing.xl,
    borderLeftWidth: 4,
    borderLeftColor: colors.primary,
  },
  tipsTitle: {
    ...typography.body,
    color: colors.text,
    fontWeight: '600',
    marginBottom: spacing.sm,
  },
  tipText: {
    ...typography.caption,
    color: colors.secondaryText,
    marginBottom: spacing.xs,
  },
  submitButton: {
    backgroundColor: colors.primary,
    padding: spacing.lg,
    borderRadius: borderRadius.medium,
    alignItems: 'center',
    marginTop: spacing.lg,
  },
  submitButtonDisabled: {
    opacity: 0.5,
  },
  submitButtonText: {
    color: colors.white,
    fontSize: 16,
    fontWeight: '600',
  },
});

export default ChangePinScreen;
