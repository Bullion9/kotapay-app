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
  CreditCard,
} from 'lucide-react-native';
import { RootStackParamList } from '../types';
import { colors, spacing, shadows, borderRadius, iconSizes } from '../theme';
import PinEntryModal from '../components/PinEntryModal';
import LoadingOverlay from '../components/LoadingOverlay';
import LoadingSpinner from '../components/LoadingSpinner';
import { useLoading } from '../hooks/useLoading';
import { billNotificationService } from '../services/billNotifications';
import { useToast } from '../components/ToastProvider';

type CableTVScreenNavigationProp = StackNavigationProp<RootStackParamList>;

interface CableProvider {
  id: string;
  name: string;
  color: string;
  logo: string;
}

interface CablePlan {
  id: string;
  name: string;
  amount: number;
  duration: string;
  features: string[];
  popular?: boolean;
}

const CableTVScreen: React.FC = () => {
  const navigation = useNavigation<CableTVScreenNavigationProp>();

  // Cable TV providers
  const cableProviders: CableProvider[] = [
    {
      id: 'dstv',
      name: 'DSTV',
      color: '#FFD700',
      logo: 'DStv',
    },
    {
      id: 'gotv',
      name: 'GOtv',
      color: '#FF6B35',
      logo: 'GOtv',
    },
    {
      id: 'startimes',
      name: 'Startimes',
      color: '#1E90FF',
      logo: 'Star',
    },
  ];

  // Cable TV plans
  const cablePlans: CablePlan[] = [
    {
      id: '1',
      name: 'DStv Padi',
      amount: 2950,
      duration: '1 month',
      features: ['Local channels', 'Sports', 'Movies'],
    },
    {
      id: '2',
      name: 'DStv Yanga',
      amount: 4200,
      duration: '1 month',
      features: ['Local channels', 'Sports', 'Movies', 'Kids channels'],
      popular: true,
    },
    {
      id: '3',
      name: 'DStv Confam',
      amount: 7400,
      duration: '1 month',
      features: ['All Yanga channels', 'Premium sports', 'International news'],
    },
    {
      id: '4',
      name: 'GOtv Smallie',
      amount: 1500,
      duration: '1 month',
      features: ['Local channels', 'Basic entertainment'],
    },
    {
      id: '5',
      name: 'GOtv Jinja',
      amount: 2700,
      duration: '1 month',
      features: ['Extended local channels', 'Sports', 'Movies'],
    },
    {
      id: '6',
      name: 'Startimes Basic',
      amount: 1200,
      duration: '1 month',
      features: ['Local channels', 'News', 'Educational'],
    },
  ];

  // State management
  const [selectedProvider, setSelectedProvider] = useState<CableProvider | null>(null);
  const [showProviderModal, setShowProviderModal] = useState(false);
  const [smartCardNumber, setSmartCardNumber] = useState('');
  const [customerName, setCustomerName] = useState('');
  const [selectedPlan, setSelectedPlan] = useState<CablePlan | null>(null);
  const [showPinModal, setShowPinModal] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  
  // Loading state management
  const { isLoading, loadingState, loadingMessage, setConfirming, setError, stopLoading } = useLoading();
  
  // Animation state for success feedback  
  const animationValue = useRef(new Animated.Value(0)).current;

  // Toast hook
  const { showToast } = useToast();

  // Validation functions
  const validateSmartCardNumber = (number: string): boolean => {
    // Smart card numbers are typically 10-12 digits
    const cleanNumber = number.replace(/\s/g, '');
    return cleanNumber.length >= 10 && cleanNumber.length <= 12 && /^\d+$/.test(cleanNumber);
  };

  const validateForm = (): boolean => {
    if (!selectedProvider) {
      Alert.alert('Error', 'Please select a cable TV provider');
      return false;
    }
    if (!smartCardNumber.trim()) {
      Alert.alert('Error', 'Please enter your smart card number');
      return false;
    }
    if (!validateSmartCardNumber(smartCardNumber)) {
      Alert.alert('Error', 'Please enter a valid smart card number (10-12 digits)');
      return false;
    }
    if (!selectedPlan) {
      Alert.alert('Error', 'Please select a subscription plan');
      return false;
    }
    return true;
  };

  // Format smart card number as user types
  const formatSmartCardNumber = (text: string): string => {
    const cleaned = text.replace(/\D/g, '');
    const truncated = cleaned.slice(0, 12);
    
    // Format as XXXX XXXX XXXX
    if (truncated.length >= 9) {
      return truncated.replace(/(\d{4})(\d{4})(\d{0,4})/, '$1 $2 $3').trim();
    } else if (truncated.length >= 5) {
      return truncated.replace(/(\d{4})(\d{0,4})/, '$1 $2').trim();
    }
    return truncated;
  };

  // Handle smart card number input with verification
  const handleSmartCardNumberChange = async (text: string) => {
    const formatted = formatSmartCardNumber(text);
    setSmartCardNumber(formatted);
    
    // Auto-verify when smart card number is complete
    if (formatted.replace(/\s/g, '').length >= 10) {
      setIsVerifying(true);
      
      // Simulate verification
      await new Promise<void>(resolve => setTimeout(resolve, 300));
      
      // Mock customer name based on smart card number
      const mockNames = ['John Doe', 'Jane Smith', 'Mike Johnson', 'Sarah Wilson', 'David Brown'];
      const randomName = mockNames[Math.floor(Math.random() * mockNames.length)];
      setCustomerName(randomName);
      
      setIsVerifying(false);
    } else {
      setCustomerName('');
    }
  };

  // Handle cable plan selection
  const handlePlanSelect = (plan: CablePlan) => {
    setSelectedPlan(plan);
  };

  // Handle continue button press
  const handleContinue = () => {
    if (!validateForm() || showPinModal) return;
    setShowPinModal(true);
  };

  // Handle PIN verification and transaction processing
  const handlePinVerified = async (enteredPin: string) => {
    setShowPinModal(false);

    const transactionId = `cable_${Date.now()}`;
    const transactionAmount = selectedPlan?.amount || 0;

    try {
      // Start confirming phase directly (skip loading)
      setConfirming('Confirming cable TV subscription...');
      
      // Send pending notification
      showToast('warning', 'Processing cable TV subscription...', 2000);
      
      await billNotificationService.sendBillPaymentPendingNotification({
        transactionId,
        billType: 'cable',
        provider: selectedProvider?.name || 'Provider',
        amount: transactionAmount,
        accountNumber: smartCardNumber,
      });

      // Mock transaction processing
      await new Promise<void>(resolve => setTimeout(resolve, 2000));
      
      // Send success notification
      await billNotificationService.sendBillPaymentSuccessNotification({
        transactionId,
        billType: 'cable',
        provider: selectedProvider?.name || 'Provider',
        amount: transactionAmount,
        accountNumber: smartCardNumber,
      });

      // End loading before success animation
      stopLoading();

      // Show success toast
      showToast('success', 'Cable TV subscription successful!');

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
      
      setError('Cable TV subscription failed');
      
      await billNotificationService.sendBillPaymentFailedNotification({
        transactionId,
        billType: 'cable',
        provider: selectedProvider?.name || 'Provider',
        amount: transactionAmount,
        accountNumber: smartCardNumber,
      }, 'Network error occurred');

      showToast('error', 'Cable TV subscription failed. Please try again.');
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
          <Text style={styles.providerSelectorPlaceholder}>Select cable TV provider</Text>
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
          {cableProviders.map((provider) => (
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

  // Cable plan card component
  const PlanCard: React.FC<{ plan: CablePlan }> = ({ plan }) => (
    <TouchableOpacity
      style={[
        styles.planCard,
        selectedPlan?.id === plan.id && styles.planCardSelected,
        plan.popular && styles.planCardPopular
      ]}
      onPress={() => handlePlanSelect(plan)}
    >
      {plan.popular && (
        <View style={styles.popularBadge}>
          <Text style={styles.popularBadgeText}>POPULAR</Text>
        </View>
      )}
      <Text
        style={[
          styles.planName,
          selectedPlan?.id === plan.id && styles.planNameSelected
        ]}
      >
        {plan.name}
      </Text>
      <Text
        style={[
          styles.planAmount,
          selectedPlan?.id === plan.id && styles.planAmountSelected
        ]}
      >
        ₦{plan.amount.toLocaleString()}
      </Text>
      <Text style={styles.planDuration}>{plan.duration}</Text>
      <View style={styles.planFeatures}>
        {plan.features.map((feature, index) => (
          <Text key={index} style={styles.planFeature}>• {feature}</Text>
        ))}
      </View>
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
        <Text style={styles.headerTitle}>Cable TV</Text>
        <View style={styles.headerPlaceholder} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Cable TV Provider Selection */}
        <View style={styles.section}>
          <ProviderSelector />
        </View>

        {/* Smart Card Number Input */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Smart Card Number</Text>
          <View style={styles.smartCardInputContainer}>
            <CreditCard size={iconSizes.md} color={colors.secondaryText} />
            <TextInput
              style={styles.smartCardInput}
              placeholder="1234 5678 9012"
              value={smartCardNumber}
              onChangeText={handleSmartCardNumberChange}
              keyboardType="numeric"
              maxLength={14} // For formatted number: XXXX XXXX XXXX
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

        {/* Subscription Plans */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Select Subscription Plan</Text>
          <View style={styles.plansContainer}>
            {cablePlans.map((plan) => (
              <PlanCard key={plan.id} plan={plan} />
            ))}
          </View>
        </View>

        {/* Information Section */}
        <View style={styles.infoSection}>
          <Text style={styles.infoTitle}>Transaction Details</Text>
          <View style={styles.infoItem}>
            <Text style={styles.infoBullet}>•</Text>
            <Text style={styles.infoText}>Subscription will be activated instantly</Text>
          </View>
          <View style={styles.infoItem}>
            <Text style={styles.infoBullet}>•</Text>
            <Text style={styles.infoText}>Valid for the selected period</Text>
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
            (!selectedProvider || !smartCardNumber || !selectedPlan || isLoading || showPinModal) && styles.continueButtonDisabled
          ]}
          onPress={handleContinue}
          disabled={!selectedProvider || !smartCardNumber || !selectedPlan || isLoading || showPinModal}
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
        subtitle={`Subscribe to ${selectedPlan?.name} for ${smartCardNumber} (${selectedProvider?.name}) - ₦${selectedPlan?.amount.toLocaleString()}`}
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
            <Text style={styles.successTitle}>Subscription Successful!</Text>
            <Text style={styles.successSubtitle}>
              {selectedPlan?.name} activated for {smartCardNumber}
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
    </SafeAreaView>
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
    fontSize: 14,
    fontWeight: 'bold',
    color: colors.white,
  },
  providerSelectorText: {
    fontSize: 16,
    color: colors.text,
    fontWeight: '500',
  },
  providerSelectorPlaceholder: {
    fontSize: 16,
    color: colors.secondaryText,
  },
  smartCardInputContainer: {
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
  smartCardInput: {
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
  plansContainer: {
    gap: spacing.md,
  },
  planCard: {
    backgroundColor: colors.white,
    borderRadius: borderRadius.medium,
    borderWidth: 1,
    borderColor: colors.borderBills,
    padding: spacing.lg,
    ...shadows.billsCard,
    elevation: 2,
    position: 'relative',
  },
  planCardSelected: {
    borderColor: colors.primary,
    backgroundColor: colors.primaryTransparent,
  },
  planCardPopular: {
    borderColor: colors.success,
  },
  popularBadge: {
    position: 'absolute',
    top: -8,
    right: spacing.md,
    backgroundColor: colors.success,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.small,
  },
  popularBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: colors.white,
  },
  planName: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text,
    marginBottom: spacing.xs,
  },
  planNameSelected: {
    color: colors.primary,
  },
  planAmount: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginBottom: spacing.xs,
  },
  planAmountSelected: {
    color: colors.primary,
  },
  planDuration: {
    fontSize: 14,
    color: colors.secondaryText,
    marginBottom: spacing.sm,
  },
  planFeatures: {
    gap: spacing.xs,
  },
  planFeature: {
    fontSize: 12,
    color: colors.secondaryText,
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
  },
  providerOptionText: {
    fontSize: 16,
    color: colors.text,
    fontWeight: '500',
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

export default CableTVScreen;
