import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { ChevronLeft, Info, Shield } from 'lucide-react-native';
import React, { useEffect, useState } from 'react';
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

interface LimitPreset {
  amount: number;
  label: string;
  description: string;
}

const TransactionLimitScreen: React.FC = () => {
  const navigation = useNavigation<StackNavigationProp<ProfileParamList>>();
  const [limit, setLimit] = useState('');
  const [currentLimit, setCurrentLimit] = useState(100000);
  const [isLoading, setIsLoading] = useState(false);
  const [loadingPresets, setLoadingPresets] = useState(true);

  const limitPresets: LimitPreset[] = [
    { amount: 50000, label: '₦50,000', description: 'Basic daily limit' },
    { amount: 100000, label: '₦100,000', description: 'Standard daily limit' },
    { amount: 500000, label: '₦500,000', description: 'Premium daily limit' },
    { amount: 1000000, label: '₦1,000,000', description: 'VIP daily limit' },
  ];

  useEffect(() => {
    loadCurrentLimit();
  }, []);

  const loadCurrentLimit = async () => {
    try {
      const savedLimit = await AsyncStorage.getItem('transactionLimit');
      if (savedLimit) {
        const limitValue = parseInt(savedLimit);
        setCurrentLimit(limitValue);
        setLimit(limitValue.toString());
      }
    } catch (error) {
      console.error('Error loading transaction limit:', error);
    } finally {
      setLoadingPresets(false);
    }
  };

  const handleBack = () => {
    navigation.goBack();
  };

  const handleSubmit = async () => {
    const limitValue = parseInt(limit.replace(/,/g, ''));
    
    if (!limitValue || limitValue < 1000) {
      Alert.alert('Invalid Amount', 'Minimum transaction limit is ₦1,000');
      return;
    }

    if (limitValue > 5000000) {
      Alert.alert('Invalid Amount', 'Maximum transaction limit is ₦5,000,000');
      return;
    }

    setIsLoading(true);

    try {
      await AsyncStorage.setItem('transactionLimit', limitValue.toString());
      await AsyncStorage.setItem('transactionLimitLastUpdated', new Date().toISOString());

      // Update security settings
      const securitySettings = await AsyncStorage.getItem('securitySettings');
      if (securitySettings) {
        const settings = JSON.parse(securitySettings);
        settings.transactionLimit = limitValue;
        await AsyncStorage.setItem('securitySettings', JSON.stringify(settings));
      }

      Alert.alert(
        'Success',
        `Transaction limit updated to ₦${limitValue.toLocaleString()}`,
        [
          {
            text: 'OK',
            onPress: () => navigation.goBack(),
          },
        ]
      );
    } catch (error) {
      console.error('Error updating transaction limit:', error);
      Alert.alert('Error', 'Failed to update transaction limit. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const formatAmount = (value: string) => {
    const number = value.replace(/\D/g, '');
    return number.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  };

  const handleChangeAmount = (value: string) => {
    setLimit(value.replace(/,/g, ''));
  };

  const handlePresetSelect = (amount: number) => {
    setLimit(amount.toString());
  };

  const isFormValid = limit && parseInt(limit.replace(/,/g, '')) >= 1000;

  if (loadingPresets) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={handleBack} style={styles.backButton}>
          <ChevronLeft size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Transaction Limit</Text>
        <View style={styles.placeholder} />
      </View>

      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardAvoidingView}
      >
        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {/* Current Limit Info */}
          <View style={styles.currentLimitCard}>
            <View style={styles.currentLimitHeader}>
              <Shield size={24} color={colors.primary} />
              <Text style={styles.currentLimitTitle}>Current Daily Limit</Text>
            </View>
            <Text style={styles.currentLimitAmount}>₦{currentLimit.toLocaleString()}</Text>
            <Text style={styles.currentLimitDescription}>
              Maximum amount you can transfer per day
            </Text>
          </View>

          {/* Quick Presets */}
          <View style={styles.presetsSection}>
            <Text style={styles.sectionTitle}>Quick Presets</Text>
            <View style={styles.presetsGrid}>
              {limitPresets.map((preset) => (
                <TouchableOpacity
                  key={preset.amount}
                  style={[
                    styles.presetCard,
                    parseInt(limit) === preset.amount && styles.presetCardActive,
                  ]}
                  onPress={() => handlePresetSelect(preset.amount)}
                >
                  <Text style={[
                    styles.presetAmount,
                    parseInt(limit) === preset.amount && styles.presetAmountActive,
                  ]}>
                    {preset.label}
                  </Text>
                  <Text style={[
                    styles.presetDescription,
                    parseInt(limit) === preset.amount && styles.presetDescriptionActive,
                  ]}>
                    {preset.description}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Custom Amount */}
          <View style={styles.inputSection}>
            <Text style={styles.sectionTitle}>Custom Amount</Text>
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Daily Transaction Limit</Text>
              <View style={styles.amountContainer}>
                <Text style={styles.currency}>₦</Text>
                <TextInput
                  style={styles.input}
                  value={formatAmount(limit)}
                  onChangeText={handleChangeAmount}
                  keyboardType="numeric"
                  placeholder="0.00"
                  placeholderTextColor={colors.secondaryText}
                />
              </View>
              <Text style={styles.helper}>
                Minimum: ₦1,000 • Maximum: ₦5,000,000
              </Text>
            </View>
          </View>

          {/* Security Info */}
          <View style={styles.securityInfo}>
            <View style={styles.infoHeader}>
              <Info size={20} color={colors.primary} />
              <Text style={styles.infoTitle}>Security Information</Text>
            </View>
            <Text style={styles.infoText}>• This limit applies to all transfers and payments</Text>
            <Text style={styles.infoText}>• You can change this limit anytime</Text>
            <Text style={styles.infoText}>• Higher limits may require additional verification</Text>
            <Text style={styles.infoText}>• Limits reset daily at midnight</Text>
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
              <Text style={styles.submitButtonText}>Set Limit</Text>
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  currentLimitCard: {
    backgroundColor: colors.white,
    padding: spacing.xl,
    borderRadius: borderRadius.large,
    marginBottom: spacing.xl,
    borderLeftWidth: 4,
    borderLeftColor: colors.primary,
  },
  currentLimitHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  currentLimitTitle: {
    ...typography.body,
    color: colors.text,
    fontWeight: '600',
    marginLeft: spacing.sm,
  },
  currentLimitAmount: {
    ...typography.h2,
    color: colors.primary,
    fontWeight: 'bold',
    marginBottom: spacing.sm,
  },
  currentLimitDescription: {
    ...typography.caption,
    color: colors.secondaryText,
  },
  sectionTitle: {
    ...typography.body,
    color: colors.text,
    fontWeight: '600',
    marginBottom: spacing.md,
  },
  presetsSection: {
    marginBottom: spacing.xl,
  },
  presetsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.md,
  },
  presetCard: {
    flex: 1,
    minWidth: '45%',
    backgroundColor: colors.white,
    padding: spacing.lg,
    borderRadius: borderRadius.medium,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
  },
  presetCardActive: {
    borderColor: colors.primary,
    backgroundColor: colors.primary,
  },
  presetAmount: {
    ...typography.body,
    color: colors.text,
    fontWeight: '600',
    marginBottom: spacing.xs,
  },
  presetAmountActive: {
    color: colors.white,
  },
  presetDescription: {
    ...typography.caption,
    color: colors.secondaryText,
    textAlign: 'center',
  },
  presetDescriptionActive: {
    color: colors.white,
  },
  inputSection: {
    marginBottom: spacing.xl,
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
  amountContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: borderRadius.medium,
    paddingHorizontal: spacing.lg,
  },
  currency: {
    fontSize: 24,
    color: colors.text,
    marginRight: spacing.sm,
    fontWeight: '600',
  },
  input: {
    flex: 1,
    padding: spacing.lg,
    color: colors.text,
    fontSize: 24,
    fontWeight: '600',
  },
  helper: {
    ...typography.caption,
    color: colors.secondaryText,
    marginTop: spacing.sm,
  },
  securityInfo: {
    backgroundColor: colors.white,
    padding: spacing.lg,
    borderRadius: borderRadius.medium,
    marginBottom: spacing.xl,
    borderLeftWidth: 4,
    borderLeftColor: colors.primary,
  },
  infoHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  infoTitle: {
    ...typography.body,
    color: colors.text,
    fontWeight: '600',
    marginLeft: spacing.sm,
  },
  infoText: {
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

export default TransactionLimitScreen;
