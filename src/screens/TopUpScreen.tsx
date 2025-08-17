import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  TextInput,
  Alert,
  ActivityIndicator,
  Animated,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import {
  ChevronLeft,
  CreditCard,
  Landmark,
  Store,
  CheckCircle,
  ChevronDown,
} from 'lucide-react-native';
import { RootStackParamList } from '../types';
import { colors, spacing, shadows, borderRadius, iconSizes, globalStyles } from '../theme';
import { EyeIcon } from '../components/icons';
import PinEntryModal from '../components/PinEntryModal';
import { notificationService } from '../services/notifications';

type TopUpScreenNavigationProp = StackNavigationProp<RootStackParamList>;

interface PaymentMethod {
  id: string;
  name: string;
  description: string;
  icon: React.ComponentType<any>;
  processingTime: string;
  isAvailable: boolean;
}

interface Currency {
  code: string;
  symbol: string;
  name: string;
}

const TopUpScreen: React.FC = () => {
  const navigation = useNavigation<TopUpScreenNavigationProp>();
  
  // State management
  const [amount, setAmount] = useState('');
  const [selectedMethod, setSelectedMethod] = useState<PaymentMethod | null>(null);
  const [selectedCurrency, setSelectedCurrency] = useState<Currency>({ 
    code: 'NGN', 
    symbol: '₦', 
    name: 'Nigerian Naira' 
  });
  const [showBalance, setShowBalance] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showPinModal, setShowPinModal] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [showCurrencyPicker, setShowCurrencyPicker] = useState(false);
  const [successAnimation] = useState(new Animated.Value(0));
  const [slideAnimation] = useState(new Animated.Value(0));
  const [isAmountFocused, setIsAmountFocused] = useState(false);
  
  // Mock user balance
  const userBalance = 450000;
  
  // Available currencies
  const currencies: Currency[] = [
    { code: 'NGN', symbol: '₦', name: 'Nigerian Naira' },
    { code: 'USD', symbol: '$', name: 'US Dollar' },
    { code: 'EUR', symbol: '€', name: 'Euro' },
    { code: 'GBP', symbol: '£', name: 'British Pound' },
  ];
  
  // Payment methods
  const paymentMethods: PaymentMethod[] = [
    {
      id: 'card',
      name: 'Debit/Credit Card',
      description: 'Add money using your debit or credit card',
      icon: CreditCard,
      processingTime: 'Instant',
      isAvailable: true,
    },
    {
      id: 'bank_transfer',
      name: 'Bank Transfer',
      description: 'Transfer money from your bank account',
      icon: Landmark,
      processingTime: '1-2 business days',
      isAvailable: true,
    },
    {
      id: 'agent_deposit',
      name: 'Agent Deposit',
      description: 'Deposit cash at any authorized agent location',
      icon: Store,
      processingTime: 'Instant',
      isAvailable: true,
    },
  ];

  // Validate amount
  const validateAmount = () => {
    const numAmount = parseFloat(amount);
    if (!numAmount || numAmount <= 0) {
      Alert.alert('Invalid Amount', 'Please enter a valid amount');
      return false;
    }
    if (numAmount < 1000) {
      Alert.alert('Minimum Amount', 'Minimum top-up amount is ₦1,000');
      return false;
    }
    if (numAmount > 1000000) {
      Alert.alert('Maximum Amount', 'Maximum top-up amount is ₦1,000,000 per transaction');
      return false;
    }
    return true;
  };

  // Handle continue button press
  const handleContinue = () => {
    if (!validateAmount() || !selectedMethod) {
      Alert.alert('Error', 'Please enter an amount and select a payment method');
      return;
    }
    setShowPinModal(true);
  };

  // Handle PIN verification and transaction processing
  const handlePinVerified = async (enteredPin: string) => {
    setShowPinModal(false);
    setLoading(true);

    try {
      // Mock transaction processing
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Start success animation
      setShowSuccess(true);
      
      // Ensure animation starts immediately
      successAnimation.setValue(0);
      Animated.spring(successAnimation, {
        toValue: 1,
        useNativeDriver: true,
        tension: 100,
        friction: 8,
      }).start();

      // Send push notification
      if (selectedMethod) {
        await notificationService.sendMoneyReceivedNotification({
          transactionId: `topup-${Date.now()}`,
          amount: parseFloat(amount),
          currency: selectedCurrency.symbol,
          senderName: selectedMethod.name,
          recipientName: 'Your Wallet',
          message: 'Top-up successful',
        });
      }
    } catch (err) {
      console.error('Transaction error:', err);
      Alert.alert('Error', 'Failed to process top-up. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Reset form
  const resetForm = () => {
    setAmount('');
    setSelectedMethod(null);
    setShowSuccess(false);
    successAnimation.setValue(0);
    navigation.goBack();
  };

  // Show currency picker with animation
  const showCurrencyPickerModal = () => {
    setShowCurrencyPicker(true);
    slideAnimation.setValue(0);
    Animated.spring(slideAnimation, {
      toValue: 1,
      useNativeDriver: true,
      tension: 100,
      friction: 8,
    }).start();
  };

  // Hide currency picker with animation
  const hideCurrencyPickerModal = () => {
    Animated.timing(slideAnimation, {
      toValue: 0,
      duration: 250,
      useNativeDriver: true,
    }).start(() => {
      setShowCurrencyPicker(false);
    });
  };

  // Success Screen Component
  const SuccessScreen = () => (
    <View style={styles.successContainer}>
      <Animated.View 
        style={[
          styles.successIcon,
          {
            transform: [{
              rotate: successAnimation.interpolate({
                inputRange: [0, 1],
                outputRange: ['0deg', '360deg'],
              })
            }]
          }
        ]}
      >
        <CheckCircle size={48} color={colors.white} />
      </Animated.View>
      
      <Text style={styles.successTitle}>Top-Up Successful!</Text>
      <Text style={styles.successSubtitle}>
        {selectedCurrency.symbol}{parseFloat(amount || '0').toLocaleString()} has been added to your wallet
      </Text>
      
      <View style={styles.successDetails}>
        <View style={styles.successRow}>
          <Text style={styles.successLabel}>Amount</Text>
          <Text style={styles.successValue}>
            {selectedCurrency.symbol}{parseFloat(amount || '0').toLocaleString()}
          </Text>
        </View>
        <View style={styles.successRow}>
          <Text style={styles.successLabel}>Method</Text>
          <Text style={styles.successValue}>{selectedMethod?.name || 'N/A'}</Text>
        </View>
        <View style={styles.successRow}>
          <Text style={styles.successLabel}>Processing Time</Text>
          <Text style={styles.successValue}>{selectedMethod?.processingTime || 'N/A'}</Text>
        </View>
      </View>
      
      <TouchableOpacity style={styles.doneButton} onPress={resetForm}>
        <Text style={styles.doneButtonText}>Done</Text>
      </TouchableOpacity>
    </View>
  );

  // PIN Modal Component
  const PinModal = () => (
    <PinEntryModal
      visible={showPinModal}
      onClose={() => setShowPinModal(false)}
      onPinEntered={handlePinVerified}
      title="Enter PIN"
      subtitle="Confirm your transaction PIN to proceed with top-up"
      allowBiometric={true}
    />
  );

  if (showSuccess) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
        <SuccessScreen />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={globalStyles.backButton}>
            <ChevronLeft size={24} color={colors.primary} />
          </TouchableOpacity>
        </View>
        
        <View style={styles.headerCenter}>
          <Text style={styles.headerTitle}>Add Money</Text>
        </View>
        
        <View style={styles.headerRight} />
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>

        {/* Balance Card */}
        <View style={styles.balanceCard}>
          <View style={styles.balanceHeader}>
            <Text style={styles.balanceLabel}>Current Wallet Balance</Text>
            <TouchableOpacity onPress={() => setShowBalance(!showBalance)}>
              <EyeIcon 
                size={iconSizes.sm} 
                color={colors.white} 
                filled={!showBalance}
              />
            </TouchableOpacity>
          </View>
          <Text style={styles.balanceAmount}>
            {showBalance ? `₦${userBalance.toLocaleString()}` : '••••••'}
          </Text>
          <Text style={styles.balanceSubtext}>
            Available for spending
          </Text>
        </View>

        {/* Amount Input */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Enter Amount</Text>
          <View style={styles.amountContainer}>
            <TouchableOpacity 
              style={styles.currencySelector}
              onPress={showCurrencyPickerModal}
            >
              <Text style={styles.currencySymbol}>{selectedCurrency.symbol}</Text>
              <Text style={styles.currencyCode}>{selectedCurrency.code}</Text>
              <ChevronDown size={iconSizes.sm} color={colors.secondaryText} />
            </TouchableOpacity>
            <TextInput
              style={[
                styles.amountInput,
                amount && { borderColor: colors.seaGreen },
                isAmountFocused && styles.amountInputFocused
              ]}
              value={amount}
              onChangeText={setAmount}
              placeholder="0"
              keyboardType="numeric"
              placeholderTextColor={colors.placeholder}
              onFocus={() => setIsAmountFocused(true)}
              onBlur={() => setIsAmountFocused(false)}
            />
          </View>
        </View>

        {/* Payment Methods */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Select Payment Method</Text>
          {paymentMethods.map((method) => (
            <TouchableOpacity
              key={method.id}
              style={[
                styles.methodCard,
                selectedMethod?.id === method.id && styles.selectedMethodCard,
              ]}
              onPress={() => setSelectedMethod(method)}
            >
              <View style={styles.methodIcon}>
                <method.icon 
                  size={iconSizes.md} 
                  color={selectedMethod?.id === method.id ? colors.seaGreen : colors.secondaryText} 
                />
              </View>
              <View style={styles.methodInfo}>
                <Text style={styles.methodName}>{method.name}</Text>
                <Text style={styles.methodDescription}>{method.description}</Text>
                <Text style={styles.methodTime}>{method.processingTime}</Text>
              </View>
              {selectedMethod?.id === method.id && (
                <CheckCircle size={iconSizes.sm} color={colors.seaGreen} />
              )}
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>

      {/* Continue Button */}
      <View style={styles.footer}>
        <TouchableOpacity
          style={[
            styles.continueButton,
            (!amount || !selectedMethod || loading) && styles.disabledButton,
          ]}
          onPress={handleContinue}
          disabled={!amount || !selectedMethod || loading}
        >
          {loading ? (
            <ActivityIndicator color={colors.white} />
          ) : (
            <Text style={styles.continueButtonText}>
              Continue with {selectedCurrency.symbol}{amount ? parseFloat(amount).toLocaleString() : '0'}
            </Text>
          )}
        </TouchableOpacity>
      </View>

      <PinModal />
      
      {/* Currency Picker Bottom Sheet */}
      {showCurrencyPicker && (
        <View style={styles.currencyPickerOverlay}>
          <TouchableOpacity 
            style={styles.currencyPickerBackdrop} 
            onPress={hideCurrencyPickerModal}
          />
          <Animated.View 
            style={[
              styles.currencyBottomSheet,
              {
                transform: [{
                  translateY: slideAnimation.interpolate({
                    inputRange: [0, 1],
                    outputRange: [300, 0],
                  })
                }]
              }
            ]}
          >
            <View style={styles.bottomSheetHandle} />
            <Text style={styles.currencyPickerTitle}>Select Currency</Text>
            {currencies.map((currency) => (
              <TouchableOpacity
                key={currency.code}
                style={[
                  styles.currencyOption,
                  selectedCurrency.code === currency.code && styles.currencyOptionSelected,
                ]}
                onPress={() => {
                  setSelectedCurrency(currency);
                  hideCurrencyPickerModal();
                }}
              >
                <Text style={styles.currencySymbol}>{currency.symbol}</Text>
                <View style={styles.currencyInfo}>
                  <Text style={styles.currencyCode}>{currency.code}</Text>
                  <Text style={styles.currencyName}>{currency.name}</Text>
                </View>
                {selectedCurrency.code === currency.code && (
                  <CheckCircle size={iconSizes.sm} color={colors.seaGreen} />
                )}
              </TouchableOpacity>
            ))}
          </Animated.View>
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
  scrollView: {
    flex: 1,
  },
  header: {
    backgroundColor: '#FFF0F5',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.lg,
    paddingTop: spacing.xl,
  },
  headerLeft: {
    width: 56, // Slightly larger to accommodate back button + padding
    alignItems: 'flex-start',
    justifyContent: 'center',
  },
  headerCenter: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerRight: {
    width: 56, // Same width as left side for perfect centering
  },
  headerPlaceholder: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000d10',
    textAlign: 'center',
  },
  balanceCard: {
    marginHorizontal: spacing.lg,
    marginBottom: spacing.xl,
    padding: spacing.xl,
    borderRadius: borderRadius.xl,
    backgroundColor: colors.primary,
    ...shadows.medium,
  },
  balanceHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  balanceLabel: {
    fontSize: 14,
    color: colors.white,
    opacity: 0.8,
  },
  balanceAmount: {
    fontSize: 36,
    fontWeight: 'normal',
    color: colors.white,
    marginBottom: spacing.xs,
  },
  balanceSubtext: {
    fontSize: 12,
    color: colors.white,
    opacity: 0.7,
  },
  section: {
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.lg,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginBottom: spacing.md,
  },
  amountContainer: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  currencySelector: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.white,
    borderRadius: borderRadius.medium,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    gap: spacing.xs,
    ...shadows.small,
  },
  currencySymbol: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
  },
  currencyCode: {
    fontSize: 14,
    color: colors.secondaryText,
  },
  amountInput: {
    flex: 1,
    backgroundColor: colors.white,
    borderRadius: borderRadius.medium,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
    borderWidth: 2,
    borderColor: 'transparent',
    ...shadows.small,
  },
  amountInputFocused: {
    borderColor: '#06402B',
    ...shadows.medium,
  },
  methodCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.white,
    borderRadius: borderRadius.medium,
    padding: spacing.md,
    marginBottom: spacing.sm,
    borderWidth: 2,
    borderColor: 'transparent',
    ...shadows.small,
  },
  selectedMethodCard: {
    borderColor: colors.seaGreen,
  },
  methodIcon: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: colors.card,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.md,
  },
  methodInfo: {
    flex: 1,
  },
  methodName: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginBottom: spacing.xs,
  },
  methodDescription: {
    fontSize: 12,
    color: colors.secondaryText,
    marginBottom: spacing.xs,
  },
  methodTime: {
    fontSize: 11,
    color: colors.seaGreen,
    fontWeight: '500',
  },
  footer: {
    padding: spacing.lg,
    backgroundColor: 'transparent',
    borderTopWidth: 0,
  },
  continueButton: {
    backgroundColor: colors.seaGreen,
    borderRadius: borderRadius.medium,
    paddingVertical: spacing.lg,
    alignItems: 'center',
  },
  disabledButton: {
    backgroundColor: colors.disabled,
  },
  continueButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.white,
  },
  // Currency Picker Styles
  currencyPickerOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  currencyPickerBackdrop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  currencyBottomSheet: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: colors.white,
    borderTopLeftRadius: borderRadius.large,
    borderTopRightRadius: borderRadius.large,
    padding: spacing.lg,
    paddingBottom: spacing.xl + 20, // Extra padding for safe area
    maxHeight: '70%',
    ...shadows.large,
  },
  bottomSheetHandle: {
    width: 40,
    height: 4,
    backgroundColor: colors.border,
    borderRadius: 2,
    alignSelf: 'center',
    marginBottom: spacing.lg,
  },
  currencyPickerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
    marginBottom: spacing.lg,
    textAlign: 'center',
  },
  currencyOption: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.md,
    borderRadius: borderRadius.medium,
    marginBottom: spacing.xs,
  },
  currencyOptionSelected: {
    backgroundColor: colors.accentTransparent,
  },
  currencyInfo: {
    flex: 1,
    marginLeft: spacing.md,
  },
  currencyName: {
    fontSize: 12,
    color: colors.secondaryText,
  },
  // Success Screen Styles
  successContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.xl,
    backgroundColor: colors.background,
  },
  successIcon: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: colors.success,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.xl,
  },
  successTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: spacing.sm,
    textAlign: 'center',
  },
  successSubtitle: {
    fontSize: 16,
    color: colors.secondaryText,
    textAlign: 'center',
    marginBottom: spacing.xl,
  },
  successDetails: {
    backgroundColor: colors.white,
    borderRadius: borderRadius.large,
    padding: spacing.lg,
    width: '100%',
    marginBottom: spacing.xl,
    ...shadows.medium,
  },
  successRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing.md,
  },
  successLabel: {
    fontSize: 14,
    color: colors.secondaryText,
  },
  successValue: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
  },
  doneButton: {
    backgroundColor: colors.seaGreen,
    paddingHorizontal: spacing.xxl,
    paddingVertical: spacing.lg,
    borderRadius: borderRadius.medium,
  },
  doneButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.white,
  },
});

export default TopUpScreen;
