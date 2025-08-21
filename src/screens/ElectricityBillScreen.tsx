import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  TextInput,
  Modal,
  Alert,
  Animated,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import {
  ChevronLeft,
  ChevronDown,
  Check,
  CheckCircle,
  Zap,
} from 'lucide-react-native';
import { RootStackParamList } from '../types';
import { colors, spacing, shadows, borderRadius, iconSizes } from '../theme';
import PinEntryModal from '../components/PinEntryModal';
import LoadingOverlay from '../components/LoadingOverlay';
import PageLoadingOverlay from '../components/PageLoadingOverlay';
import LoadingSpinner from '../components/LoadingSpinner';
import { useLoading } from '../hooks/useLoading';
import { usePageLoading } from '../hooks/usePageLoading';
import { billNotificationService } from '../services/billNotifications';
import { useToast } from '../components/ToastProvider';

type ElectricityBillScreenNavigationProp = StackNavigationProp<RootStackParamList>;

interface ElectricityProvider {
  id: string;
  name: string;
  color: string;
  logo: string;
}

interface QuickAmount {
  value: number;
  label: string;
  popular?: boolean;
}

const ElectricityBillScreen: React.FC = () => {
  const navigation = useNavigation<ElectricityBillScreenNavigationProp>();

  // Electricity providers
  const electricityProviders: ElectricityProvider[] = [
    {
      id: 'eko',
      name: 'Eko Electricity (EKEDC)',
      color: '#FF6B35',
      logo: 'EKO',
    },
    {
      id: 'ikeja',
      name: 'Ikeja Electric (IE)',
      color: '#1E90FF',
      logo: 'IE',
    },
    {
      id: 'abuja',
      name: 'Abuja Electricity (AEDC)',
      color: '#32CD32',
      logo: 'AEDC',
    },
    {
      id: 'kano',
      name: 'Kano Electricity (KEDCO)',
      color: '#FFD700',
      logo: 'KEDCO',
    },
    {
      id: 'portharcourt',
      name: 'Port Harcourt Electric (PHED)',
      color: '#8A2BE2',
      logo: 'PHED',
    },
  ];

  // Quick amounts for electricity bills
  const quickAmounts: QuickAmount[] = [
    { value: 1000, label: '₦1,000' },
    { value: 2000, label: '₦2,000' },
    { value: 5000, label: '₦5,000', popular: true },
    { value: 10000, label: '₦10,000', popular: true },
    { value: 15000, label: '₦15,000' },
    { value: 20000, label: '₦20,000' },
  ];

  // State management
  const [selectedProvider, setSelectedProvider] = useState<ElectricityProvider | null>(null);
  const [showProviderModal, setShowProviderModal] = useState(false);
  const [meterNumber, setMeterNumber] = useState('');
  const [customerName, setCustomerName] = useState('');
  const [amount, setAmount] = useState('');
  const [selectedQuickAmount, setSelectedQuickAmount] = useState<number | null>(null);
  const [showPinModal, setShowPinModal] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  
  // Loading state management
  const { isLoading, loadingState, loadingMessage, setConfirming, setError, stopLoading } = useLoading();

  // Page loading state management
  const { isPageLoading } = usePageLoading({ duration: 800 });
  
  // Animation state for success feedback  
  const animationValue = useRef(new Animated.Value(0)).current;

  // Toast hook
  const { showToast } = useToast();

  // Validation functions
  const validateMeterNumber = (number: string): boolean => {
    // Meter numbers are typically 11 digits
    const cleanNumber = number.replace(/\s/g, '');
    return cleanNumber.length === 11 && /^\d+$/.test(cleanNumber);
  };

  const validateForm = (): boolean => {
    if (!selectedProvider) {
      Alert.alert('Error', 'Please select an electricity provider');
      return false;
    }
    if (!meterNumber.trim()) {
      Alert.alert('Error', 'Please enter your meter number');
      return false;
    }
    if (!validateMeterNumber(meterNumber)) {
      Alert.alert('Error', 'Please enter a valid 11-digit meter number');
      return false;
    }
    if (!amount || parseFloat(amount) <= 0) {
      Alert.alert('Error', 'Please enter a valid amount');
      return false;
    }
    if (parseFloat(amount) < 500) {
      Alert.alert('Error', 'Minimum electricity bill payment is ₦500');
      return false;
    }
    if (parseFloat(amount) > 100000) {
      Alert.alert('Error', 'Maximum electricity bill payment is ₦100,000');
      return false;
    }
    return true;
  };

  // Format meter number as user types
  const formatMeterNumber = (text: string): string => {
    const cleaned = text.replace(/\D/g, '');
    const truncated = cleaned.slice(0, 11);
    
    // Format as XXXXX XXXXXX
    if (truncated.length >= 6) {
      return truncated.replace(/(\d{5})(\d{0,6})/, '$1 $2').trim();
    }
    return truncated;
  };

  // Handle meter number input with verification
  const handleMeterNumberChange = async (text: string) => {
    const formatted = formatMeterNumber(text);
    setMeterNumber(formatted);
    
    // Auto-verify when meter number is complete
    if (formatted.replace(/\s/g, '').length === 11) {
      setIsVerifying(true);
      
      // Simulate verification
      await new Promise<void>(resolve => setTimeout(resolve, 300));
      
      // Mock customer name based on meter number
      const mockNames = ['John Doe', 'Jane Smith', 'Mike Johnson', 'Sarah Wilson', 'David Brown'];
      const randomName = mockNames[Math.floor(Math.random() * mockNames.length)];
      setCustomerName(randomName);
      
      setIsVerifying(false);
    } else {
      setCustomerName('');
    }
  };

  // Handle quick amount selection
  const handleQuickAmountPress = (quickAmount: QuickAmount) => {
    setAmount(quickAmount.value.toString());
    setSelectedQuickAmount(quickAmount.value);
  };

  // Handle custom amount input
  const handleAmountChange = (text: string) => {
    setAmount(text);
    setSelectedQuickAmount(null); // Clear quick amount selection
  };

  // Handle continue button press
  const handleContinue = () => {
    if (!validateForm() || showPinModal) return;
    setShowPinModal(true);
  };

  // Handle PIN verification and transaction processing
  const handlePinVerified = async (enteredPin: string) => {
    setShowPinModal(false);

    const transactionId = `electricity_${Date.now()}`;
    const transactionAmount = parseFloat(amount);

    try {
      // Start confirming phase directly (skip loading)
      setConfirming('Confirming electricity bill payment...');
      
      // Send pending notification
      showToast('warning', 'Processing electricity bill payment...', 2000);
      
      await billNotificationService.sendBillPaymentPendingNotification({
        transactionId,
        billType: 'electricity',
        provider: selectedProvider?.name || 'Provider',
        amount: transactionAmount,
        accountNumber: meterNumber,
      });

      // Mock transaction processing
      await new Promise<void>(resolve => setTimeout(resolve, 2000));
      
      // Send success notification
      await billNotificationService.sendBillPaymentSuccessNotification({
        transactionId,
        billType: 'electricity',
        provider: selectedProvider?.name || 'Provider',
        amount: transactionAmount,
        accountNumber: meterNumber,
      });

      // End loading before success animation
      stopLoading();

      // Show success toast
      showToast('success', 'Electricity bill payment successful!');

      // Show animated success feedback
      setShowSuccess(true);
      animationValue.setValue(0);
      Animated.spring(animationValue, {
        toValue: 1,
        useNativeDriver: true,
        tension: 100,
        friction: 8,
      }).start();

      // Auto dismiss after 2 seconds
      setTimeout(() => {
        setShowSuccess(false);
        navigation.navigate('MainTabs');
      }, 2000);
    } catch (error) {
      console.error('Transaction failed:', error);
      
      setError('Electricity bill payment failed');
      
      await billNotificationService.sendBillPaymentFailedNotification({
        transactionId,
        billType: 'electricity',
        provider: selectedProvider?.name || 'Provider',
        amount: transactionAmount,
        accountNumber: meterNumber,
      }, 'Network error occurred');

      showToast('error', 'Electricity bill payment failed. Please try again.');
      Alert.alert('❌ Transaction Failed', 'Please try again later.');
    }
  };

  // Provider selection component
  const ProviderSelector: React.FC = () => (
    <TouchableOpacity
      style={[
        styles.providerSelector,
        selectedProvider && { borderColor: selectedProvider.color }
      ]}
      onPress={() => setShowProviderModal(true)}
    >
      <View style={styles.providerSelectorContent}>
        {selectedProvider ? (
          <>
            <View style={[styles.providerLogo, { backgroundColor: selectedProvider.color }]}>
              <Text style={styles.providerLogoText}>{selectedProvider.logo}</Text>
            </View>
            <Text style={styles.providerSelectorText}>{selectedProvider.name}</Text>
          </>
        ) : (
          <Text style={styles.providerSelectorPlaceholder}>Select electricity provider</Text>
        )}
      </View>
      <ChevronDown size={iconSizes.md} color={colors.secondaryText} />
    </TouchableOpacity>
  );

  // Provider modal component
  const ProviderModal: React.FC = () => (
    <Modal
      visible={showProviderModal}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={() => setShowProviderModal(false)}
    >
      <SafeAreaView style={styles.modalContainer}>
        <View style={styles.modalHeader}>
          <TouchableOpacity onPress={() => setShowProviderModal(false)}>
            <Text style={styles.modalCancelText}>Cancel</Text>
          </TouchableOpacity>
          <Text style={styles.modalTitle}>Select Provider</Text>
          <View style={styles.modalSpacer} />
        </View>
        
        <ScrollView style={styles.modalContent}>
          {electricityProviders.map((provider) => (
            <TouchableOpacity
              key={provider.id}
              style={styles.providerOption}
              onPress={() => {
                setSelectedProvider(provider);
                setShowProviderModal(false);
              }}
            >
              <View style={styles.providerOptionContent}>
                <View style={[styles.providerLogo, { backgroundColor: provider.color }]}>
                  <Text style={styles.providerLogoText}>{provider.logo}</Text>
                </View>
                <Text style={styles.providerOptionText}>{provider.name}</Text>
              </View>
              {selectedProvider?.id === provider.id && (
                <Check size={iconSizes.md} color={colors.success} />
              )}
            </TouchableOpacity>
          ))}
        </ScrollView>
      </SafeAreaView>
    </Modal>
  );

  // Quick amount button component
  const QuickAmountButton: React.FC<{ quickAmount: QuickAmount }> = ({ quickAmount }) => (
    <TouchableOpacity
      style={[
        styles.quickAmountButton,
        selectedQuickAmount === quickAmount.value && styles.quickAmountButtonSelected,
        quickAmount.popular && styles.quickAmountButtonPopular
      ]}
      onPress={() => handleQuickAmountPress(quickAmount)}
    >
      {quickAmount.popular && (
        <View style={styles.popularBadge}>
          <Text style={styles.popularBadgeText}>POPULAR</Text>
        </View>
      )}
      <Text
        style={[
          styles.quickAmountText,
          selectedQuickAmount === quickAmount.value && styles.quickAmountTextSelected
        ]}
      >
        {quickAmount.label}
      </Text>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <ChevronLeft size={24} color="#000d10" />
        </TouchableOpacity>
        <View style={styles.headerPlaceholder} />
        <Text style={styles.headerTitle}>Electricity</Text>
        <View style={styles.headerPlaceholder} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Electricity Provider Selection */}
        <View style={styles.section}>
          <ProviderSelector />
        </View>

        {/* Meter Number Input */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Meter Number</Text>
          <View style={styles.meterInputContainer}>
            <Zap size={iconSizes.md} color={colors.secondaryText} />
            <TextInput
              style={styles.meterInput}
              placeholder="12345 678901"
              value={meterNumber}
              onChangeText={handleMeterNumberChange}
              keyboardType="numeric"
              maxLength={12} // For formatted number: XXXXX XXXXXX
            />
            {isVerifying && (
              <View style={styles.verifyingIndicator}>
                <LoadingSpinner size={20} color={colors.primary} />
              </View>
            )}
          </View>
          {customerName && (
            <View style={styles.customerInfo}>
              <Text style={styles.customerLabel}>Customer Name:</Text>
              <Text style={styles.customerName}>{customerName}</Text>
            </View>
          )}
        </View>

        {/* Quick Amount Buttons */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Quick Amount</Text>
          <View style={styles.quickAmountsGrid}>
            {quickAmounts.map((quickAmount) => (
              <QuickAmountButton key={quickAmount.value} quickAmount={quickAmount} />
            ))}
          </View>
        </View>

        {/* Custom Amount Input */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Or Enter Amount</Text>
          <View style={styles.amountInputContainer}>
            <Text style={styles.currencySymbol}>₦</Text>
            <TextInput
              style={styles.amountInput}
              placeholder="0.00"
              value={amount}
              onChangeText={handleAmountChange}
              keyboardType="numeric"
            />
          </View>
          <Text style={styles.amountHint}>Minimum: ₦500 • Maximum: ₦100,000</Text>
        </View>

        {/* Information Section */}
        <View style={styles.infoSection}>
          <Text style={styles.infoTitle}>Transaction Details</Text>
          <View style={styles.infoItem}>
            <Text style={styles.infoBullet}>•</Text>
            <Text style={styles.infoText}>Payment will be processed instantly</Text>
          </View>
          <View style={styles.infoItem}>
            <Text style={styles.infoBullet}>•</Text>
            <Text style={styles.infoText}>Units will be credited to your meter</Text>
          </View>
          <View style={styles.infoItem}>
            <Text style={styles.infoBullet}>•</Text>
            <Text style={styles.infoText}>No additional charges apply</Text>
          </View>
        </View>
      </ScrollView>

      {/* Continue Button */}
      <View style={styles.footer}>
        <TouchableOpacity
          style={[
            styles.continueButton,
            (!selectedProvider || !meterNumber || !amount || isLoading || showPinModal) && styles.continueButtonDisabled
          ]}
          onPress={handleContinue}
          disabled={!selectedProvider || !meterNumber || !amount || isLoading || showPinModal}
        >
          <Text style={styles.continueButtonText}>
            {isLoading ? 'Processing...' : 'Continue'}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Modals */}
      <ProviderModal />
      
      {/* PIN Entry Modal */}
      <PinEntryModal
        visible={showPinModal}
        onClose={() => setShowPinModal(false)}
        onPinEntered={handlePinVerified}
        title="Enter PIN to Confirm"
        subtitle={`Pay ₦${parseFloat(amount || '0').toLocaleString()} electricity bill for ${meterNumber} (${selectedProvider?.name})`}
        allowBiometric={true}
      />

      {/* Success Animation Overlay */}
      {showSuccess && (
        <View style={styles.successOverlay}>
          <Animated.View
            style={[
              styles.successContainer,
              {
                opacity: animationValue.interpolate({
                  inputRange: [0, 1],
                  outputRange: [0.7, 1],
                }),
                transform: [
                  {
                    scale: animationValue.interpolate({
                      inputRange: [0, 1],
                      outputRange: [0.9, 1],
                    }),
                  },
                ],
              },
            ]}
          >
            <View style={styles.successIcon}>
              <CheckCircle size={60} color={colors.white} />
            </View>
            <Text style={styles.successTitle}>Payment Successful!</Text>
            <Text style={styles.successSubtitle}>
              ₦{parseFloat(amount || '0').toLocaleString()} electricity bill paid for {meterNumber}
            </Text>
          </Animated.View>
        </View>
      )}
      
      {/* Loading Overlay */}
      <LoadingOverlay
        visible={isLoading}
        type={loadingState}
        message={loadingMessage}
      />

      {/* Page Loading Overlay */}
      <PageLoadingOverlay visible={isPageLoading} />    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFF0F5',
  },
  header: {
    backgroundColor: '#FFF0F5',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.lg,
    paddingTop: spacing.xl,
  },
  backButton: {
    padding: 8,
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
  content: {
    flex: 1,
    padding: spacing.lg,
  },
  section: {
    marginBottom: spacing.xl,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginBottom: spacing.sm,
  },
  providerSelector: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: spacing.lg,
    backgroundColor: colors.white,
    borderRadius: borderRadius.medium,
    borderWidth: 1,
    borderColor: colors.borderBills,
    ...shadows.billsCard,
    elevation: 2,
  },
  providerSelectorContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  providerLogo: {
    width: 40,
    height: 40,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.sm,
  },
  providerLogoText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: colors.white,
  },
  providerSelectorText: {
    fontSize: 16,
    color: colors.text,
    fontWeight: '500',
    flex: 1,
  },
  providerSelectorPlaceholder: {
    fontSize: 16,
    color: colors.secondaryText,
  },
  meterInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.white,
    borderRadius: borderRadius.medium,
    borderWidth: 1,
    borderColor: colors.borderBills,
    paddingHorizontal: spacing.lg,
    ...shadows.billsCard,
    elevation: 2,
  },
  meterInput: {
    flex: 1,
    padding: spacing.lg,
    fontSize: 16,
    color: colors.text,
    marginLeft: spacing.sm,
  },
  verifyingIndicator: {
    padding: spacing.sm,
  },
  customerInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: spacing.sm,
    padding: spacing.sm,
    backgroundColor: colors.successTransparent,
    borderRadius: borderRadius.small,
  },
  customerLabel: {
    fontSize: 14,
    color: colors.secondaryText,
    marginRight: spacing.sm,
  },
  customerName: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.success,
  },
  quickAmountsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  quickAmountButton: {
    width: '30%',
    backgroundColor: colors.white,
    borderRadius: borderRadius.medium,
    borderWidth: 1,
    borderColor: colors.borderBills,
    padding: spacing.md,
    marginBottom: spacing.sm,
    alignItems: 'center',
    ...shadows.billsCard,
    elevation: 2,
    position: 'relative',
  },
  quickAmountButtonSelected: {
    borderColor: colors.primary,
    backgroundColor: colors.primaryTransparent,
  },
  quickAmountButtonPopular: {
    borderColor: colors.success,
  },
  popularBadge: {
    position: 'absolute',
    top: -8,
    right: -5,
    backgroundColor: colors.success,
    paddingHorizontal: spacing.xs,
    paddingVertical: 2,
    borderRadius: borderRadius.small,
  },
  popularBadgeText: {
    fontSize: 8,
    fontWeight: '700',
    color: colors.white,
  },
  quickAmountText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
  },
  quickAmountTextSelected: {
    color: colors.primary,
  },
  amountInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.white,
    borderRadius: borderRadius.medium,
    borderWidth: 1,
    borderColor: colors.borderBills,
    paddingHorizontal: spacing.lg,
    ...shadows.billsCard,
    elevation: 2,
  },
  currencySymbol: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
    marginRight: spacing.sm,
  },
  amountInput: {
    flex: 1,
    padding: spacing.lg,
    fontSize: 16,
    color: colors.text,
  },
  amountHint: {
    fontSize: 14,
    color: colors.secondaryText,
    marginTop: spacing.xs,
  },
  infoSection: {
    backgroundColor: colors.white,
    borderRadius: borderRadius.medium,
    padding: spacing.lg,
    ...shadows.small,
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginBottom: spacing.md,
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: spacing.sm,
  },
  infoBullet: {
    fontSize: 16,
    color: colors.secondaryText,
    marginRight: spacing.sm,
    marginTop: 2,
  },
  infoText: {
    flex: 1,
    fontSize: 14,
    color: colors.secondaryText,
    lineHeight: 20,
  },
  footer: {
    padding: spacing.lg,
    backgroundColor: colors.background,
  },
  continueButton: {
    backgroundColor: colors.primaryBills,
    borderRadius: borderRadius.medium,
    paddingVertical: spacing.lg,
    alignItems: 'center',
    justifyContent: 'center',
    ...shadows.billsCard,
    elevation: 2,
  },
  continueButtonDisabled: {
    backgroundColor: colors.disabled,
    opacity: 0.6,
  },
  continueButtonText: {
    color: colors.white,
    fontSize: 16,
    fontWeight: '600',
  },
  // Modal Styles
  modalContainer: {
    flex: 1,
    backgroundColor: colors.background,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  modalCancelText: {
    fontSize: 16,
    color: colors.primary,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
  },
  modalSpacer: {
    width: 60,
  },
  modalContent: {
    flex: 1,
    padding: spacing.lg,
  },
  providerOption: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: spacing.lg,
    backgroundColor: colors.white,
    borderRadius: borderRadius.medium,
    marginBottom: spacing.sm,
    ...shadows.small,
  },
  providerOptionContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  providerOptionText: {
    fontSize: 16,
    color: colors.text,
    fontWeight: '500',
    flex: 1,
  },
  successOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  successContainer: {
    alignItems: 'center',
    backgroundColor: colors.white,
    borderRadius: borderRadius.large,
    padding: spacing.xl,
    marginHorizontal: spacing.xl,
  },
  successIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#A8E4A0',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.lg,
  },
  successTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.text,
    textAlign: 'center',
    marginBottom: spacing.sm,
  },
  successSubtitle: {
    fontSize: 16,
    color: colors.secondaryText,
    textAlign: 'center',
    lineHeight: 22,
  },
});

export default ElectricityBillScreen;
