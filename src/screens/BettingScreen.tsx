import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  TextInput,
  Alert,
  Modal,
  Animated,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import {
  ArrowLeft,
  ChevronDown,
  AlertTriangle,
  Shield,
  Check,
  CheckCircle,
} from 'lucide-react-native';
import { RootStackParamList } from '../types';
import { colors, spacing, shadows, borderRadius, iconSizes } from '../theme';
import PinEntryModal from '../components/PinEntryModal';
import { billNotificationService } from '../services/billNotifications';
import { useToast } from '../components/ToastProvider';

type BettingScreenNavigationProp = StackNavigationProp<RootStackParamList>;

interface BettingProvider {
  id: string;
  name: string;
  color: string;
  fieldType: 'bookingCode' | 'userId';
  fieldLabel: string;
  placeholder: string;
}

const BettingScreen: React.FC = () => {
  const navigation = useNavigation<BettingScreenNavigationProp>();

  // Provider list as specified
  const providerList: BettingProvider[] = [
    {
      id: 'bet9ja',
      name: 'Bet9ja',
      color: '#00A651',
      fieldType: 'bookingCode',
      fieldLabel: 'Booking Code',
      placeholder: 'Enter booking code',
    },
    {
      id: 'sportybet',
      name: 'SportyBet',
      color: '#FF6B35',
      fieldType: 'userId',
      fieldLabel: 'User ID',
      placeholder: 'Enter your User ID',
    },
    {
      id: 'nairabet',
      name: 'NairaBet',
      color: '#1E3A8A',
      fieldType: 'userId',
      fieldLabel: 'User ID',
      placeholder: 'Enter your User ID',
    },
    {
      id: '1xbet',
      name: '1xBet',
      color: '#1E40AF',
      fieldType: 'userId',
      fieldLabel: 'User ID',
      placeholder: 'Enter your User ID',
    },
    {
      id: 'betking',
      name: 'BetKing',
      color: '#DC2626',
      fieldType: 'bookingCode',
      fieldLabel: 'Booking Code',
      placeholder: 'Enter booking code',
    },
  ];

  // State management
  const [selectedProvider, setSelectedProvider] = useState<BettingProvider | null>(null);
  const [showProviderModal, setShowProviderModal] = useState(false);
  const [fieldValue, setFieldValue] = useState('');
  const [amount, setAmount] = useState('');
  const [showPinModal, setShowPinModal] = useState(false);
  const [showAgeConfirmation, setShowAgeConfirmation] = useState(false);
  const [ageConfirmed, setAgeConfirmed] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  
  // Animation state for success feedback  
  const animationValue = useRef(new Animated.Value(0)).current;

  // Toast hook
  const { showToast } = useToast();

  // Validation functions
  const validateForm = (): boolean => {
    if (!selectedProvider) {
      Alert.alert('Error', 'Please select a betting provider');
      return false;
    }
    if (!fieldValue.trim()) {
      Alert.alert('Error', `Please enter your ${selectedProvider.fieldLabel.toLowerCase()}`);
      return false;
    }
    if (!amount || parseFloat(amount) <= 0) {
      Alert.alert('Error', 'Please enter a valid amount');
      return false;
    }
    if (parseFloat(amount) < 100) {
      Alert.alert('Error', 'Minimum funding amount is ₦100');
      return false;
    }
    if (parseFloat(amount) > 500000) {
      Alert.alert('Error', 'Maximum funding amount is ₦500,000');
      return false;
    }
    return true;
  };

  // Handle continue button press
  const handleContinue = () => {
    if (!validateForm()) return;
    
    // Show age confirmation if not already confirmed
    if (!ageConfirmed) {
      setShowAgeConfirmation(true);
      return;
    }
    
    setShowPinModal(true);
  };

  // Handle age confirmation
  const handleAgeConfirmation = (confirmed: boolean) => {
    setShowAgeConfirmation(false);
    if (confirmed) {
      setAgeConfirmed(true);
      setShowPinModal(true);
    }
  };

  // Handle PIN verification and transaction processing
  const handlePinVerified = async (enteredPin: string) => {
    setShowPinModal(false);
    setLoading(true);

    const transactionId = `betting_${Date.now()}`;
    const transactionAmount = parseFloat(amount);

    try {
      // Show pending notification
      showToast('warning', 'Processing betting account funding...', 2000);
      
      // Send pending notification
      await billNotificationService.sendBillPaymentPendingNotification({
        transactionId,
        billType: 'betting',
        provider: selectedProvider?.name || 'Provider',
        amount: transactionAmount,
        accountNumber: fieldValue,
      });

      // Mock transaction processing
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Send success notification
      await billNotificationService.sendBettingFundingSuccessNotification({
        transactionId,
        provider: selectedProvider?.name || 'Provider',
        accountId: fieldValue,
        amount: transactionAmount,
      });

      // Show success toast
      showToast('success', 'Betting account funded successfully!');

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
      
      // Send failure notification
      await billNotificationService.sendBillPaymentFailedNotification({
        transactionId,
        billType: 'betting',
        provider: selectedProvider?.name || 'Provider',
        amount: transactionAmount,
        accountNumber: fieldValue,
      }, 'Network error occurred');

      // Show error toast
      showToast('error', 'Betting account funding failed. Please try again.');
      
      Alert.alert('❌ Transaction Failed', 'Please try again later.');
    } finally {
      setLoading(false);
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
            <View style={[styles.providerDot, { backgroundColor: selectedProvider.color }]} />
            <Text style={styles.providerSelectorText}>{selectedProvider.name}</Text>
          </>
        ) : (
          <Text style={styles.providerSelectorPlaceholder}>Select betting provider</Text>
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
          {providerList.map((provider) => (
            <TouchableOpacity
              key={provider.id}
              style={styles.providerOption}
              onPress={() => {
                setSelectedProvider(provider);
                setFieldValue('');
                setShowProviderModal(false);
              }}
            >
              <View style={styles.providerOptionContent}>
                <View style={[styles.providerDot, { backgroundColor: provider.color }]} />
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

  // Age confirmation modal
  const AgeConfirmationModal: React.FC = () => (
    <Modal
      visible={showAgeConfirmation}
      animationType="fade"
      transparent
      onRequestClose={() => setShowAgeConfirmation(false)}
    >
      <View style={styles.ageModalOverlay}>
        <View style={styles.ageModalContent}>
          <View style={styles.ageModalIcon}>
            <Shield size={iconSizes.xl} color={colors.primary} />
          </View>
          
          <Text style={styles.ageModalTitle}>Age Verification Required</Text>
          <Text style={styles.ageModalText}>
            You must be 18 years or older to fund betting accounts. Are you 18 years or older?
          </Text>
          
          <View style={styles.ageModalButtons}>
            <TouchableOpacity
              style={[styles.ageModalButton, styles.ageModalButtonCancel]}
              onPress={() => handleAgeConfirmation(false)}
            >
              <Text style={styles.ageModalButtonTextCancel}>No</Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={[styles.ageModalButton, styles.ageModalButtonConfirm]}
              onPress={() => handleAgeConfirmation(true)}
            >
              <Text style={styles.ageModalButtonTextConfirm}>Yes, I&apos;m 18+</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <ArrowLeft size={iconSizes.md} color={colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Sports Betting</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Gambling Responsibly Banner */}
        <View style={styles.warningBanner}>
          <AlertTriangle size={iconSizes.md} color={colors.white} />
          <Text style={styles.warningText}>Gambling responsibly</Text>
        </View>

        {/* Provider Selection */}
        <View style={styles.section}>
          <ProviderSelector />
        </View>

        {/* Field Input (Booking Code or User ID) */}
        {selectedProvider && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>{selectedProvider.fieldLabel}</Text>
            <TextInput
              style={styles.input}
              placeholder={selectedProvider.placeholder}
              value={fieldValue}
              onChangeText={setFieldValue}
              autoCapitalize="none"
              autoCorrect={false}
            />
          </View>
        )}

        {/* Amount Input */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Amount to Fund</Text>
          <View style={styles.amountInputContainer}>
            <Text style={styles.currencySymbol}>₦</Text>
            <TextInput
              style={styles.amountInput}
              placeholder="0.00"
              value={amount}
              onChangeText={setAmount}
              keyboardType="numeric"
            />
          </View>
          <Text style={styles.amountHint}>Minimum: ₦100 • Maximum: ₦500,000</Text>
        </View>

        {/* Information Section */}
        <View style={styles.infoSection}>
          <Text style={styles.infoTitle}>Important Information</Text>
          <View style={styles.infoItem}>
            <Text style={styles.infoBullet}>•</Text>
            <Text style={styles.infoText}>Funds will be credited instantly to your betting account</Text>
          </View>
          <View style={styles.infoItem}>
            <Text style={styles.infoBullet}>•</Text>
            <Text style={styles.infoText}>You must be 18 years or older to proceed</Text>
          </View>
          <View style={styles.infoItem}>
            <Text style={styles.infoBullet}>•</Text>
            <Text style={styles.infoText}>Please gamble responsibly and within your means</Text>
          </View>
          <View style={styles.infoItem}>
            <Text style={styles.infoBullet}>•</Text>
            <Text style={styles.infoText}>Transaction fees may apply depending on the provider</Text>
          </View>
        </View>
      </ScrollView>

      {/* Continue Button */}
      <View style={styles.footer}>
        <TouchableOpacity
          style={[
            styles.continueButton,
            (!selectedProvider || !fieldValue || !amount || loading) && styles.continueButtonDisabled
          ]}
          onPress={handleContinue}
          disabled={!selectedProvider || !fieldValue || !amount || loading}
        >
          <Text style={styles.continueButtonText}>
            {loading ? 'Processing...' : 'Continue'}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Modals */}
      <ProviderModal />
      <AgeConfirmationModal />
      
      {/* PIN Entry Modal */}
      <PinEntryModal
        visible={showPinModal}
        onClose={() => setShowPinModal(false)}
        onPinEntered={handlePinVerified}
        title="Enter PIN to Confirm"
        subtitle={`Fund ₦${parseFloat(amount || '0').toLocaleString()} to ${selectedProvider?.name}`}
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
            <Text style={styles.successTitle}>Funding Successful!</Text>
            <Text style={styles.successSubtitle}>
              ₦{parseFloat(amount || '0').toLocaleString()} funded to {selectedProvider?.name}
            </Text>
          </Animated.View>
        </View>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFF0F5',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    backgroundColor: '#FFF0F5',
  },
  backButton: {
    padding: spacing.xs,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: colors.text,
  },
  placeholder: {
    width: iconSizes.md + spacing.xs * 2,
  },
  content: {
    flex: 1,
    padding: spacing.lg,
  },
  warningBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.danger,
    padding: spacing.md,
    borderRadius: borderRadius.medium,
    marginBottom: spacing.lg,
  },
  warningText: {
    color: colors.white,
    fontSize: 16,
    fontWeight: '600',
    marginLeft: spacing.sm,
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
  providerDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: spacing.sm,
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
  input: {
    backgroundColor: colors.white,
    borderRadius: borderRadius.medium,
    borderWidth: 1,
    borderColor: colors.borderBills,
    padding: spacing.lg,
    fontSize: 16,
    color: colors.text,
    ...shadows.billsCard,
    elevation: 2,
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
  },
  providerOptionText: {
    fontSize: 16,
    color: colors.text,
    fontWeight: '500',
  },
  // Age Confirmation Modal
  ageModalOverlay: {
    flex: 1,
    backgroundColor: colors.overlay,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.xl,
  },
  ageModalContent: {
    backgroundColor: colors.white,
    borderRadius: borderRadius.large,
    padding: spacing.xl,
    alignItems: 'center',
    width: '100%',
    maxWidth: 400,
    ...shadows.large,
  },
  ageModalIcon: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: colors.primaryTransparent,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.lg,
  },
  ageModalTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.text,
    textAlign: 'center',
    marginBottom: spacing.sm,
  },
  ageModalText: {
    fontSize: 16,
    color: colors.secondaryText,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: spacing.xl,
  },
  ageModalButtons: {
    flexDirection: 'row',
    width: '100%',
    gap: spacing.md,
  },
  ageModalButton: {
    flex: 1,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.medium,
    alignItems: 'center',
    justifyContent: 'center',
  },
  ageModalButtonCancel: {
    backgroundColor: colors.disabled,
    borderWidth: 1,
    borderColor: colors.border,
  },
  ageModalButtonConfirm: {
    backgroundColor: colors.primary,
  },
  ageModalButtonTextCancel: {
    color: colors.text,
    fontSize: 16,
    fontWeight: '600',
  },
  ageModalButtonTextConfirm: {
    color: colors.white,
    fontSize: 16,
    fontWeight: '600',
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

export default BettingScreen;
