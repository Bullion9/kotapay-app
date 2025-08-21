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
  Image,
  ImageSourcePropType,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import {
  ChevronLeft,
  ChevronDown,
  Phone,
  Check,
  CheckCircle,
  Users,
} from 'lucide-react-native';
import { RootStackParamList } from '../types';
import { colors, spacing, shadows, borderRadius, iconSizes } from '../theme';
import PinEntryModal from '../components/PinEntryModal';
import LoadingOverlay from '../components/LoadingOverlay';
import PageLoadingOverlay from '../components/PageLoadingOverlay';
import { useLoading } from '../hooks/useLoading';
import { usePageLoading } from '../hooks/usePageLoading';
import { billNotificationService } from '../services/billNotifications';
import { useToast } from '../components/ToastProvider';

// Import network provider logos
const mtnLogo = require('../../logo/MTN.png');
const gloLogo = require('../../logo/Glo.png');
const airtelLogo = require('../../logo/Airtel.png');
const nineMobileLogo = require('../../logo/9mobile.png');

type DataTopUpScreenNavigationProp = StackNavigationProp<RootStackParamList>;

interface DataProvider {
  id: string;
  name: string;
  color: string;
  logo: ImageSourcePropType;
}

interface DataPlan {
  id: string;
  value: string;
  amount: number;
  validity: string;
  bonus?: string;
}

interface Contact {
  id: string;
  name: string;
  phone: string;
  provider?: string;
}

const DataTopUpScreen: React.FC = () => {
  const navigation = useNavigation<DataTopUpScreenNavigationProp>();

  // Provider list
  const providerList: DataProvider[] = [
    {
      id: 'mtn',
      name: 'MTN',
      color: '#FFCC00',
      logo: mtnLogo,
    },
    {
      id: 'glo',
      name: 'GLO',
      color: '#00B04F',
      logo: gloLogo,
    },
    {
      id: 'airtel',
      name: 'AIRTEL',
      color: '#FF0000',
      logo: airtelLogo,
    },
    {
      id: '9mobile',
      name: '9MOBILE',
      color: '#00AA44',
      logo: nineMobileLogo,
    },
  ];

  // Data plans
  const dataPlans: DataPlan[] = [
    { id: '1', value: '100MB', amount: 100, validity: '1 day' },
    { id: '2', value: '350MB', amount: 200, validity: '2 days' },
    { id: '3', value: '1GB', amount: 500, validity: '30 days', bonus: 'Most Popular!' },
    { id: '4', value: '2GB', amount: 1000, validity: '30 days', bonus: 'Best Value!' },
    { id: '5', value: '5GB', amount: 2000, validity: '30 days' },
    { id: '6', value: '10GB', amount: 3500, validity: '30 days' },
  ];

  // State management
  const [selectedProvider, setSelectedProvider] = useState<DataProvider | null>(null);
  const [showProviderModal, setShowProviderModal] = useState(false);
  const [phoneNumber, setPhoneNumber] = useState('');
  const [selectedPlan, setSelectedPlan] = useState<DataPlan | null>(null);
  const [showPinModal, setShowPinModal] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [showContactModal, setShowContactModal] = useState(false);
  
  // Loading state management
  const { isLoading, loadingState, loadingMessage, setConfirming, setError, stopLoading } = useLoading();

  // Page loading state management
  const { isPageLoading } = usePageLoading({ duration: 800 });
  
  // Animation state for success feedback  
  const animationValue = useRef(new Animated.Value(0)).current;

  // Mock contact data
  const mockContacts: Contact[] = [
    { id: '1', name: 'John Doe', phone: '08012345678', provider: 'mtn' },
    { id: '2', name: 'Jane Smith', phone: '08123456789', provider: 'mtn' },
    { id: '3', name: 'Mike Johnson', phone: '07098765432', provider: 'glo' },
    { id: '4', name: 'Sarah Wilson', phone: '08034567890', provider: 'airtel' },
    { id: '5', name: 'David Brown', phone: '09012345678', provider: '9mobile' },
  ];

  // Toast hook
  const { showToast } = useToast();

  // Validation functions
  const validatePhoneNumber = (phone: string): boolean => {
    const phoneRegex = /^(\+234|234|0)?[789][01]\d{8}$/;
    return phoneRegex.test(phone.replace(/\s/g, ''));
  };

  const validateForm = (): boolean => {
    if (!selectedProvider) {
      Alert.alert('Error', 'Please select a network provider');
      return false;
    }
    if (!phoneNumber.trim()) {
      Alert.alert('Error', 'Please enter a phone number');
      return false;
    }
    if (!validatePhoneNumber(phoneNumber)) {
      Alert.alert('Error', 'Please enter a valid Nigerian phone number');
      return false;
    }
    if (!selectedPlan) {
      Alert.alert('Error', 'Please select a data plan');
      return false;
    }
    return true;
  };

  // Format phone number as user types
  const formatPhoneNumber = (text: string): string => {
    const cleaned = text.replace(/\D/g, '');
    const truncated = cleaned.slice(0, 11);
    
    if (truncated.length >= 7) {
      return truncated.replace(/(\d{3})(\d{3})(\d{0,5})/, '$1 $2 $3').trim();
    } else if (truncated.length >= 4) {
      return truncated.replace(/(\d{3})(\d{0,3})/, '$1 $2').trim();
    }
    return truncated;
  };

  // Auto-detect provider based on phone number
  const detectProvider = (phone: string): DataProvider | null => {
    const cleaned = phone.replace(/\D/g, '');
    if (cleaned.length < 4) return null;

    const prefix = cleaned.slice(0, 4);
    
    if (['0803', '0806', '0813', '0816', '0903', '0906', '0913', '0916'].some(p => prefix.startsWith(p))) {
      return providerList.find(p => p.id === 'mtn') || null;
    }
    
    if (['0805', '0807', '0815', '0811', '0905', '0915'].some(p => prefix.startsWith(p))) {
      return providerList.find(p => p.id === 'glo') || null;
    }
    
    if (['0802', '0808', '0812', '0701', '0902', '0907', '0912'].some(p => prefix.startsWith(p))) {
      return providerList.find(p => p.id === 'airtel') || null;
    }
    
    if (['0809', '0817', '0818', '0909', '0908'].some(p => prefix.startsWith(p))) {
      return providerList.find(p => p.id === '9mobile') || null;
    }
    
    return null;
  };

  // Handle contact selection
  const handleContactSelect = (contact: Contact) => {
    setPhoneNumber(contact.phone);
    
    const detectedProvider = detectProvider(contact.phone);
    if (detectedProvider) {
      setSelectedProvider(detectedProvider);
    }
    
    setShowContactModal(false);
  };

  // Handle phone number input
  const handlePhoneNumberChange = (text: string) => {
    const formatted = formatPhoneNumber(text);
    setPhoneNumber(formatted);
    
    if (formatted.replace(/\D/g, '').length >= 4) {
      const detectedProvider = detectProvider(formatted);
      if (detectedProvider && !selectedProvider) {
        setSelectedProvider(detectedProvider);
      }
    }
  };

  // Handle data plan selection
  const handlePlanSelect = (plan: DataPlan) => {
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

    const transactionId = `data_${Date.now()}`;
    const transactionAmount = selectedPlan?.amount || 0;

    try {
      // Start confirming phase directly (skip loading)
      setConfirming('Confirming data purchase...');
      
      // Send pending notification
      showToast('warning', 'Processing data purchase...', 2000);
      
      await billNotificationService.sendBillPaymentPendingNotification({
        transactionId,
        billType: 'data',
        provider: selectedProvider?.name || 'Provider',
        amount: transactionAmount,
        accountNumber: phoneNumber,
      });

      // Mock transaction processing
      await new Promise<void>(resolve => setTimeout(resolve, 2000));
      
      // Send success notification
      await billNotificationService.sendBillPaymentSuccessNotification({
        transactionId,
        billType: 'data',
        provider: selectedProvider?.name || 'Provider',
        amount: transactionAmount,
        accountNumber: phoneNumber,
      });

      // End loading before success animation
      stopLoading();

      // Show success toast
      showToast('success', 'Data purchase successful!');

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
      
      setError('Data purchase failed');
      
      await billNotificationService.sendBillPaymentFailedNotification({
        transactionId,
        billType: 'data',
        provider: selectedProvider?.name || 'Provider',
        amount: transactionAmount,
        accountNumber: phoneNumber,
      }, 'Network error occurred');

      showToast('error', 'Data purchase failed. Please try again.');
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
            <View style={styles.providerLogo}>
              <Image 
                source={selectedProvider.logo} 
                style={styles.providerLogoImage}
                defaultSource={require('../../assets/images/icon.png')}
              />
            </View>
            <Text style={styles.providerSelectorText}>{selectedProvider.name}</Text>
          </>
        ) : (
          <Text style={styles.providerSelectorPlaceholder}>Select network provider</Text>
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
          <Text style={styles.modalTitle}>Select Network</Text>
          <View style={styles.modalSpacer} />
        </View>
        
        <ScrollView style={styles.modalContent}>
          {providerList.map((provider) => (
            <TouchableOpacity
              key={provider.id}
              style={styles.providerOption}
              onPress={() => {
                setSelectedProvider(provider);
                setShowProviderModal(false);
              }}
            >
              <View style={styles.providerOptionContent}>
                <View style={styles.providerLogo}>
                  <Image 
                    source={provider.logo} 
                    style={styles.providerLogoImage}
                    defaultSource={require('../../assets/images/icon.png')}
                  />
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

  // Data plan button component
  const PlanButton: React.FC<{ plan: DataPlan }> = ({ plan }) => (
    <TouchableOpacity
      style={[
        styles.planButton,
        selectedPlan?.id === plan.id && styles.planButtonSelected
      ]}
      onPress={() => handlePlanSelect(plan)}
    >
      <Text
        style={[
          styles.planValue,
          selectedPlan?.id === plan.id && styles.planValueSelected
        ]}
      >
        {plan.value}
      </Text>
      <Text
        style={[
          styles.planAmount,
          selectedPlan?.id === plan.id && styles.planAmountSelected
        ]}
      >
        ₦{plan.amount.toLocaleString()}
      </Text>
      <Text style={styles.planValidity}>{plan.validity}</Text>
      {plan.bonus && (
        <Text style={styles.planBonus}>{plan.bonus}</Text>
      )}
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
        <Text style={styles.headerTitle}>Data</Text>
        <View style={styles.headerPlaceholder} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Network Provider Selection */}
        <View style={styles.section}>
          <ProviderSelector />
        </View>

        {/* Phone Number Input */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Phone Number</Text>
          <View style={styles.phoneInputContainer}>
            <Phone size={iconSizes.md} color={colors.secondaryText} />
            <TextInput
              style={styles.phoneInput}
              placeholder="080 1234 5678"
              value={phoneNumber}
              onChangeText={handlePhoneNumberChange}
              keyboardType="phone-pad"
              maxLength={13}
            />
            <TouchableOpacity
              style={styles.contactButton}
              onPress={() => setShowContactModal(true)}
            >
              <Users size={iconSizes.md} color={colors.primary} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Data Plans */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Select Data Plan</Text>
          <View style={styles.plansGrid}>
            {dataPlans.map((plan) => (
              <PlanButton key={plan.id} plan={plan} />
            ))}
          </View>
        </View>

        {/* Information Section */}
        <View style={styles.infoSection}>
          <Text style={styles.infoTitle}>Transaction Details</Text>
          <View style={styles.infoItem}>
            <Text style={styles.infoBullet}>•</Text>
            <Text style={styles.infoText}>Data will be credited instantly</Text>
          </View>
          <View style={styles.infoItem}>
            <Text style={styles.infoBullet}>•</Text>
            <Text style={styles.infoText}>Valid for the specified period</Text>
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
            (!selectedProvider || !phoneNumber || !selectedPlan || isLoading || showPinModal) && styles.continueButtonDisabled
          ]}
          onPress={handleContinue}
          disabled={!selectedProvider || !phoneNumber || !selectedPlan || isLoading || showPinModal}
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
        subtitle={`Buy ${selectedPlan?.value} data for ${phoneNumber} (${selectedProvider?.name}) - ₦${selectedPlan?.amount.toLocaleString()}`}
        allowBiometric={true}
      />

      {/* Contact Selection Modal */}
      <Modal
        visible={showContactModal}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setShowContactModal(false)}
      >
        <SafeAreaView style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Select Contact</Text>
            <TouchableOpacity
              style={styles.modalCloseButton}
              onPress={() => setShowContactModal(false)}
            >
              <Text style={styles.modalCloseText}>Cancel</Text>
            </TouchableOpacity>
          </View>
          
          <ScrollView style={styles.contactList}>
            {mockContacts.map((contact) => {
              const detectedProvider = detectProvider(contact.phone);
              return (
                <TouchableOpacity
                  key={contact.id}
                  style={styles.contactItem}
                  onPress={() => handleContactSelect(contact)}
                >
                  <View style={styles.contactInfo}>
                    <Text style={styles.contactName}>{contact.name}</Text>
                    <Text style={styles.contactPhone}>{contact.phone}</Text>
                  </View>
                  {detectedProvider && (
                    <View style={[styles.providerBadge, { backgroundColor: detectedProvider.color }]}>
                      <Text style={styles.providerBadgeText}>{detectedProvider.name}</Text>
                    </View>
                  )}
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </SafeAreaView>
      </Modal>

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
            <Text style={styles.successTitle}>Data Purchase Successful!</Text>
            <Text style={styles.successSubtitle}>
              {selectedPlan?.value} data sent to {phoneNumber}
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
      <PageLoadingOverlay visible={isPageLoading} />
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
    overflow: 'hidden',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  providerLogoImage: {
    width: 36,
    height: 36,
    resizeMode: 'contain',
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
  phoneInputContainer: {
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
  phoneInput: {
    flex: 1,
    padding: spacing.lg,
    fontSize: 16,
    color: colors.text,
    marginLeft: spacing.sm,
  },
  contactButton: {
    padding: 8,
    marginLeft: spacing.sm,
  },
  plansGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  planButton: {
    width: '48%',
    backgroundColor: colors.white,
    borderRadius: borderRadius.medium,
    borderWidth: 1,
    borderColor: colors.borderBills,
    padding: spacing.md,
    marginBottom: spacing.sm,
    alignItems: 'center',
    ...shadows.billsCard,
    elevation: 2,
  },
  planButtonSelected: {
    borderColor: colors.primary,
    backgroundColor: colors.primaryTransparent,
  },
  planValue: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text,
    marginBottom: spacing.xs,
  },
  planValueSelected: {
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
  planValidity: {
    fontSize: 12,
    color: colors.secondaryText,
    marginBottom: spacing.xs,
  },
  planBonus: {
    fontSize: 10,
    color: colors.success,
    fontWeight: '500',
    textAlign: 'center',
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
  modalCloseButton: {
    padding: spacing.sm,
  },
  modalCloseText: {
    fontSize: 16,
    color: colors.primary,
    fontWeight: '500',
  },
  contactList: {
    flex: 1,
    paddingHorizontal: spacing.lg,
  },
  contactItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderBills,
  },
  contactInfo: {
    flex: 1,
  },
  contactName: {
    fontSize: 16,
    fontWeight: '500',
    color: colors.text,
    marginBottom: 4,
  },
  contactPhone: {
    fontSize: 14,
    color: colors.secondaryText,
  },
  providerBadge: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: spacing.md,
  },
  providerBadgeText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: colors.white,
  },
});

export default DataTopUpScreen;
