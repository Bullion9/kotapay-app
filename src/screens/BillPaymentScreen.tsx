import React, { useState, useEffect, useCallback, useRef } from 'react';
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
  Modal,
} from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import {
  ChevronLeft,
  ArrowLeft,
  Search,
  CreditCard,
  CheckCircle,
  Zap,
  Users,
  QrCode,
} from 'lucide-react-native';
import { RootStackParamList } from '../types';
import { colors, spacing, shadows, borderRadius, iconSizes } from '../theme';
import { ProviderGridSkeleton, BouquetListSkeleton } from '../components/LoadingSkeleton';
import { billNotificationService } from '../services/billNotifications';
import { useToast } from '../components/ToastProvider';
import PinEntryModal from '../components/PinEntryModal';

type BillPaymentScreenNavigationProp = StackNavigationProp<RootStackParamList>;
type BillPaymentScreenRouteProp = RouteProp<RootStackParamList, 'BillPayment'>;

interface Provider {
  id: string;
  name: string;
  isAvailable: boolean;
}

interface Package {
  id: string;
  name: string;
  amount: number;
  description: string;
  validity?: string;
}

interface PaymentForm {
  provider: Provider | null;
  package: Package | null;
  accountNumber: string;
  amount: string;
  customAmount: boolean;
}

interface Contact {
  id: string;
  name: string;
  phone: string;
  provider?: string;
}

const BillPaymentScreen: React.FC = () => {
  const navigation = useNavigation<BillPaymentScreenNavigationProp>();
  const route = useRoute<BillPaymentScreenRouteProp>();
  
  const { category, title } = route.params;
  
  const [currentStep, setCurrentStep] = useState<'provider' | 'package' | 'details' | 'review'>('provider');
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [providersLoading, setProvidersLoading] = useState(true);
  const [packagesLoading, setPackagesLoading] = useState(false);
  const [inputFocused, setInputFocused] = useState(false);
  const [paymentForm, setPaymentForm] = useState<PaymentForm>({
    provider: null,
    package: null,
    accountNumber: '',
    amount: '',
    customAmount: false,
  });

  // Toast hook
  const { showToast } = useToast();

  // PIN Modal state
  const [showPinModal, setShowPinModal] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Animation values
  const processingRotation = useRef(new Animated.Value(0)).current;
  const successScale = useRef(new Animated.Value(0)).current;
  const successOpacity = useRef(new Animated.Value(0)).current;
  
  // Timeout tracking for cleanup
  const timeoutRefs = useRef<NodeJS.Timeout[]>([]);

  // Animation functions (defined early to avoid dependency issues)
  const resetAnimations = useCallback(() => {
    processingRotation.setValue(0);
    successScale.setValue(0);
    successOpacity.setValue(0);
    setShowSuccess(false);
    
    // Clear any pending timeouts
    timeoutRefs.current.forEach(timeout => clearTimeout(timeout));
    timeoutRefs.current = [];
  }, [processingRotation, successScale, successOpacity]);

  // State for providers and packages
  const [providers, setProviders] = useState<Provider[]>([]);
  const [packages, setPackages] = useState<Package[]>([]);
  const [showContactModal, setShowContactModal] = useState(false);

  // Mock contact data for data/internet plans
  const mockContacts: Contact[] = [
    { id: '1', name: 'John Doe', phone: '08012345678', provider: 'mtn' },
    { id: '2', name: 'Jane Smith', phone: '08123456789', provider: 'mtn' },
    { id: '3', name: 'Mike Johnson', phone: '07098765432', provider: 'glo' },
    { id: '4', name: 'Sarah Wilson', phone: '08034567890', provider: 'airtel' },
    { id: '5', name: 'David Brown', phone: '09012345678', provider: '9mobile' },
  ];

  // Auto-detect provider based on phone number
  const detectProviderFromPhone = (phone: string): string | null => {
    const cleaned = phone.replace(/\D/g, '');
    if (cleaned.length < 4) return null;

    const prefix = cleaned.slice(0, 4);
    
    // MTN prefixes
    if (['0803', '0806', '0813', '0816', '0903', '0906', '0913', '0916'].some(p => prefix.startsWith(p))) {
      return 'mtn-data';
    }
    
    // GLO prefixes
    if (['0805', '0807', '0815', '0811', '0905', '0915'].some(p => prefix.startsWith(p))) {
      return 'glo-data';
    }
    
    // Airtel prefixes
    if (['0802', '0808', '0812', '0701', '0902', '0907', '0912'].some(p => prefix.startsWith(p))) {
      return 'airtel-data';
    }
    
    return null;
  };

  // Handle contact selection for internet/data
  const handleContactSelect = (contact: Contact) => {
    setPaymentForm(prev => ({ ...prev, accountNumber: contact.phone }));
    
    // Auto-detect provider from phone number
    const detectedProviderId = detectProviderFromPhone(contact.phone);
    if (detectedProviderId && category === 'internet') {
      const detectedProvider = providers.find(p => p.id === detectedProviderId);
      if (detectedProvider) {
        setPaymentForm(prev => ({ ...prev, provider: detectedProvider }));
      }
    }
    
    setShowContactModal(false);
  };

  const handleQRScan = () => {
    navigation.navigate('QRScanner');
  };

  // Cleanup function to reset states
  const resetPaymentStates = useCallback(() => {
    setLoading(false);
    setIsProcessing(false);
    setShowSuccess(false);
    setIsSubmitting(false);
    setShowPinModal(false);
    resetAnimations();
  }, [resetAnimations]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      resetPaymentStates();
    };
  }, [resetPaymentStates]);

  // Handle QR scan results for meter/account numbers
  useEffect(() => {
    if (route.params?.scannedData) {
      const scannedData = route.params.scannedData;
      
      // Try to extract account/meter number from QR data
      try {
        const qrData = JSON.parse(scannedData);
        
        if (qrData.accountNumber || qrData.meterNumber) {
          const accountNumber = qrData.accountNumber || qrData.meterNumber;
          setPaymentForm(prev => ({ ...prev, accountNumber }));
          Alert.alert('QR Code Scanned', `Account number set: ${accountNumber}`);
        } else if (qrData.billData) {
          // Handle structured bill data
          const { accountNumber, amount } = qrData.billData;
          setPaymentForm(prev => ({ 
            ...prev, 
            accountNumber,
            amount: amount?.toString() || prev.amount 
          }));
          Alert.alert('Bill Data Scanned', `Account: ${accountNumber}`);
        }
        
      } catch {
        // If not JSON, treat as plain text (maybe just an account number)
        const cleanedData = scannedData.trim();
        if (cleanedData.length > 0) {
          setPaymentForm(prev => ({ ...prev, accountNumber: cleanedData }));
          Alert.alert('QR Code Scanned', `Account number set: ${cleanedData}`);
        }
      }
      
      // Clear the scanned data from route params
      navigation.setParams({ scannedData: undefined });
    }
  }, [route.params?.scannedData, navigation]);

  const loadProviders = useCallback(() => {
    setProvidersLoading(true);
    
    // Simulate API call delay
    setTimeout(() => {
      // Mock providers based on category
      const mockProviders: Record<string, Provider[]> = {
        electricity: [
          { id: 'ekedc', name: 'Eko Electricity Distribution Company', isAvailable: true },
          { id: 'ikedc', name: 'Ikeja Electric', isAvailable: true },
          { id: 'kedco', name: 'Kano Electricity Distribution Company', isAvailable: true },
          { id: 'phed', name: 'Port Harcourt Electricity Distribution', isAvailable: true },
        ],
        airtime: [
          { id: 'mtn', name: 'MTN Nigeria', isAvailable: true },
          { id: 'glo', name: 'Globacom Limited', isAvailable: true },
          { id: 'airtel', name: 'Airtel Nigeria', isAvailable: true },
          { id: '9mobile', name: '9mobile', isAvailable: true },
        ],
        internet: [
          { id: 'mtn-data', name: 'MTN Data', isAvailable: true },
          { id: 'glo-data', name: 'Glo Data', isAvailable: true },
          { id: 'airtel-data', name: 'Airtel Data', isAvailable: true },
          { id: 'smile', name: 'Smile Communications', isAvailable: true },
        ],
        betting: [
          { id: 'bet9ja', name: 'Bet9ja', isAvailable: true },
          { id: 'sportybet', name: 'SportyBet', isAvailable: true },
          { id: 'betking', name: 'BetKing', isAvailable: true },
          { id: 'nairabet', name: 'NairaBet', isAvailable: true },
          { id: '1xbet', name: '1xBet', isAvailable: true },
          { id: 'betway', name: 'Betway', isAvailable: true },
        ],
        water: [
          { id: 'lagoswater', name: 'Lagos Water Corporation', isAvailable: true },
          { id: 'abujawater', name: 'FCT Water Board', isAvailable: true },
          { id: 'kadwater', name: 'Kaduna State Water Board', isAvailable: true },
        ],
        cable: [
          { id: 'dstv', name: 'DStv', isAvailable: true },
          { id: 'gotv', name: 'GOtv', isAvailable: true },
          { id: 'startimes', name: 'StarTimes', isAvailable: true },
        ],
      };
      
      setProviders(mockProviders[category] || []);
      setProvidersLoading(false);
    }, 1500); // 1.5 second delay to show skeleton
  }, [category]);

  useEffect(() => {
    loadProviders();
  }, [loadProviders]);

  const loadPackages = (providerId: string) => {
    setPackagesLoading(true);
    
    // Simulate API call delay
    setTimeout(() => {
      // Mock packages based on provider and category
      const mockPackages: Record<string, Package[]> = {
        mtn: [
          { id: 'mtn-100', name: '₦100 Airtime', amount: 100, description: 'Basic airtime top-up' },
          { id: 'mtn-200', name: '₦200 Airtime', amount: 200, description: 'Standard airtime top-up' },
          { id: 'mtn-500', name: '₦500 Airtime', amount: 500, description: 'Premium airtime top-up' },
          { id: 'mtn-custom', name: 'Custom Amount', amount: 0, description: 'Enter your preferred amount' },
        ],
        'mtn-data': [
          { id: 'mtn-1gb', name: '1GB Data', amount: 350, description: '1GB - Valid for 30 days', validity: '30 days' },
          { id: 'mtn-2gb', name: '2GB Data', amount: 700, description: '2GB - Valid for 30 days', validity: '30 days' },
          { id: 'mtn-5gb', name: '5GB Data', amount: 1500, description: '5GB - Valid for 30 days', validity: '30 days' },
          { id: 'mtn-10gb', name: '10GB Data', amount: 3000, description: '10GB - Valid for 30 days', validity: '30 days' },
        ],
        ekedc: [
          { id: 'ekedc-custom', name: 'Custom Amount', amount: 0, description: 'Enter the amount to pay' },
        ],
        bet9ja: [
          { id: 'bet9ja-500', name: '₦500 Funding', amount: 500, description: 'Fund your Bet9ja account' },
          { id: 'bet9ja-1000', name: '₦1,000 Funding', amount: 1000, description: 'Fund your Bet9ja account' },
          { id: 'bet9ja-2000', name: '₦2,000 Funding', amount: 2000, description: 'Fund your Bet9ja account' },
          { id: 'bet9ja-5000', name: '₦5,000 Funding', amount: 5000, description: 'Fund your Bet9ja account' },
          { id: 'bet9ja-custom', name: 'Custom Amount', amount: 0, description: 'Enter your preferred amount' },
        ],
        sportybet: [
          { id: 'sportybet-500', name: '₦500 Funding', amount: 500, description: 'Fund your SportyBet account' },
          { id: 'sportybet-1000', name: '₦1,000 Funding', amount: 1000, description: 'Fund your SportyBet account' },
          { id: 'sportybet-2000', name: '₦2,000 Funding', amount: 2000, description: 'Fund your SportyBet account' },
          { id: 'sportybet-5000', name: '₦5,000 Funding', amount: 5000, description: 'Fund your SportyBet account' },
          { id: 'sportybet-custom', name: 'Custom Amount', amount: 0, description: 'Enter your preferred amount' },
        ],
        betking: [
          { id: 'betking-500', name: '₦500 Funding', amount: 500, description: 'Fund your BetKing account' },
          { id: 'betking-1000', name: '₦1,000 Funding', amount: 1000, description: 'Fund your BetKing account' },
          { id: 'betking-2000', name: '₦2,000 Funding', amount: 2000, description: 'Fund your BetKing account' },
          { id: 'betking-5000', name: '₦5,000 Funding', amount: 5000, description: 'Fund your BetKing account' },
          { id: 'betking-custom', name: 'Custom Amount', amount: 0, description: 'Enter your preferred amount' },
        ],
        dstv: [
          { id: 'dstv-compact', name: 'DStv Compact', amount: 9000, description: 'Monthly subscription', validity: '30 days' },
          { id: 'dstv-premium', name: 'DStv Premium', amount: 21000, description: 'Monthly subscription', validity: '30 days' },
          { id: 'dstv-family', name: 'DStv Family', amount: 4000, description: 'Monthly subscription', validity: '30 days' },
        ],
      };
      
      setPackages(mockPackages[providerId] || []);
      setPackagesLoading(false);
    }, 1000); // 1 second delay to show skeleton
  };

  const filteredProviders = providers.filter(provider =>
    provider.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleProviderSelect = (provider: Provider) => {
    setPaymentForm(prev => ({ ...prev, provider }));
    setCurrentStep('package');
    loadPackages(provider.id);
  };

  const handlePackageSelect = (pkg: Package) => {
    setPaymentForm(prev => ({ ...prev, package: pkg }));
    setCurrentStep('details');
  };

  // Animation functions
  const startProcessingAnimation = useCallback(() => {
    processingRotation.setValue(0);
    Animated.loop(
      Animated.timing(processingRotation, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: true,
      })
    ).start();
  }, [processingRotation]);

  const showSuccessAnimation = useCallback(() => {
    setShowSuccess(true);
    successScale.setValue(0);
    successOpacity.setValue(0);
    
    // Use the same animation as SendMoneyScreen
    Animated.spring(successScale, {
      toValue: 1,
      useNativeDriver: true,
      tension: 100,
      friction: 8,
    }).start();
    
    Animated.timing(successOpacity, {
      toValue: 1,
      duration: 300,
      useNativeDriver: true,
    }).start();
  }, [successScale, successOpacity]);

  // PIN verification handler
  const handlePinVerified = async (pin: string) => {
    console.log('PIN verified:', pin);
    if (isProcessing || loading || isSubmitting) return; // Prevent double execution
    
    setIsSubmitting(true);
    setIsProcessing(true);
    startProcessingAnimation();
    
    // Hide PIN modal after a short delay to show processing
    const timeout = setTimeout(() => {
      setShowPinModal(false);
      proceedWithPayment();
    }, 1500);
    timeoutRefs.current.push(timeout);
  };

  // Modified payment handler to show PIN modal
  const handlePayment = async () => {
    if (!validateForm() || loading || isProcessing || isSubmitting) return; // Prevent double execution
    setShowPinModal(true);
  };

  // Actual payment processing
  const proceedWithPayment = async () => {
    if (!validateForm() || loading) return; // Prevent double execution
    
    setLoading(true);
    const transactionId = `bill_${Date.now()}`;
    const billAmount = paymentForm.customAmount ? parseFloat(paymentForm.amount) : paymentForm.package?.amount || 0;
    
    try {
      // Show pending notification
      showToast('warning', 'Processing bill payment...', 2000);
      
      // Send pending notification
      await billNotificationService.sendBillPaymentPendingNotification({
        transactionId,
        billType: category as any,
        provider: paymentForm.provider?.name || 'Provider',
        amount: billAmount,
        accountNumber: paymentForm.accountNumber,
      });

      // Mock API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Send success notification
      await billNotificationService.sendBillPaymentSuccessNotification({
        transactionId,
        billType: category as any,
        provider: paymentForm.provider?.name || 'Provider',
        amount: billAmount,
        accountNumber: paymentForm.accountNumber,
      });

      // Show success toast
      showToast('success', 'Bill payment successful!');
      
      // Show success animation and stop processing
      setIsProcessing(false);
      showSuccessAnimation();
      
      // Auto dismiss after 2 seconds like other screens
      const timeout = setTimeout(() => {
        setIsSubmitting(false);
        resetAnimations();
        navigation.goBack();
      }, 2000);
      timeoutRefs.current.push(timeout);
    } catch (err) {
      console.error('Payment failed:', err);
      setIsProcessing(false);
      setIsSubmitting(false);
      setShowSuccess(false);
      resetAnimations();
      
      // Send failure notification
      await billNotificationService.sendBillPaymentFailedNotification({
        transactionId,
        billType: category as any,
        provider: paymentForm.provider?.name || 'Provider',
        amount: billAmount,
        accountNumber: paymentForm.accountNumber,
      }, 'Network error occurred');

      // Show error toast
      showToast('error', 'Bill payment failed. Please try again.');
      
      Alert.alert('❌ Payment Failed', 'Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const validateForm = (): boolean => {
    if (!paymentForm.provider) {
      Alert.alert('Error', 'Please select a provider');
      return false;
    }
    
    if (!paymentForm.package) {
      Alert.alert('Error', 'Please select a package');
      return false;
    }
    
    if (!paymentForm.accountNumber.trim()) {
      const fieldName = category === 'electricity' ? 'meter number' : 
                       category === 'betting' ? 'account ID/username' :
                       category === 'cable' ? 'smart card number' :
                       category === 'water' ? 'account number' :
                       'phone number';
      Alert.alert('Error', `Please enter your ${fieldName}`);
      return false;
    }
    
    if (paymentForm.customAmount && (!paymentForm.amount || parseFloat(paymentForm.amount) <= 0)) {
      Alert.alert('Error', 'Please enter a valid amount');
      return false;
    }
    
    return true;
  };

  const renderProviderStep = () => (
    <View style={styles.stepContainer}>
      
      <View style={styles.searchContainer}>
        <Search size={iconSizes.sm} color={colors.secondaryText} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search providers..."
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholderTextColor={colors.placeholder}
        />
      </View>
      
      <ScrollView style={styles.providersList}>
        {providersLoading ? (
          <ProviderGridSkeleton />
        ) : (
          filteredProviders.map((provider) => (
            <TouchableOpacity
              key={provider.id}
              style={styles.providerItem}
              onPress={() => handleProviderSelect(provider)}
            >
              <View style={styles.providerInfo}>
                <Text style={styles.providerName}>{provider.name}</Text>
                <Text style={styles.providerStatus}>
                  {provider.isAvailable ? 'Available' : 'Coming Soon'}
                </Text>
              </View>
              <ArrowLeft size={iconSizes.sm} color={colors.secondaryText} style={{ transform: [{ rotate: '180deg' }] }} />
            </TouchableOpacity>
          ))
        )}
      </ScrollView>
    </View>
  );

  const renderPackageStep = () => (
    <View style={styles.stepContainer}>
      <Text style={styles.stepTitle}>Select Package</Text>
      <Text style={styles.stepSubtitle}>Provider: {paymentForm.provider?.name}</Text>
      
      <ScrollView style={styles.packagesList}>
        {packagesLoading ? (
          <BouquetListSkeleton />
        ) : (
          packages.map((pkg) => (
          <TouchableOpacity
            key={pkg.id}
            style={styles.packageItem}
            onPress={() => handlePackageSelect(pkg)}
          >
            <View style={styles.packageInfo}>
              <Text style={styles.packageName}>{pkg.name}</Text>
              <Text style={styles.packageDescription}>{pkg.description}</Text>
              {pkg.validity && (
                <Text style={styles.packageValidity}>Valid for {pkg.validity}</Text>
              )}
            </View>
            {pkg.amount > 0 && (
              <Text style={styles.packageAmount}>₦{pkg.amount.toLocaleString()}</Text>
            )}
          </TouchableOpacity>
          ))
        )}
      </ScrollView>
    </View>
  );

  const renderDetailsStep = () => (
    <View style={styles.stepContainer}>
      <Text style={styles.stepTitle}>Payment Details</Text>
      
      <View style={styles.formGroup}>
        <Text style={styles.label}>
          {category === 'electricity' ? 'Meter Number' : 
           category === 'betting' ? 'Account ID/Username' :
           category === 'cable' ? 'Smart Card Number' :
           category === 'water' ? 'Account Number' :
           'Phone Number'}
        </Text>
        {category === 'internet' ? (
          <View style={styles.phoneInputContainer}>
            <TextInput
              style={[
                styles.phoneInput,
                inputFocused && styles.inputFocused
              ]}
              placeholder="Enter phone number"
              value={paymentForm.accountNumber}
              onChangeText={(text) => setPaymentForm(prev => ({ ...prev, accountNumber: text }))}
              onFocus={() => setInputFocused(true)}
              onBlur={() => setInputFocused(false)}
              keyboardType="phone-pad"
              placeholderTextColor={colors.placeholder}
            />
            <TouchableOpacity
              style={styles.contactButton}
              onPress={() => setShowContactModal(true)}
            >
              <Users size={iconSizes.md} color={colors.primary} />
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.qrButton}
              onPress={handleQRScan}
            >
              <QrCode size={iconSizes.md} color={colors.primary} />
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.phoneInputContainer}>
            <TextInput
              style={[
                styles.phoneInput,
                inputFocused && styles.inputFocused
              ]}
              placeholder={
                category === 'electricity' ? 'Enter meter number' : 
                category === 'betting' ? 'Enter your account ID/username' :
                category === 'cable' ? 'Enter smart card number' :
                category === 'water' ? 'Enter account number' :
                'Enter phone number'
              }
              value={paymentForm.accountNumber}
              onChangeText={(text) => setPaymentForm(prev => ({ ...prev, accountNumber: text }))}
              onFocus={() => setInputFocused(true)}
              onBlur={() => setInputFocused(false)}
              keyboardType={category === 'electricity' || category === 'cable' || category === 'water' ? 'default' : 'phone-pad'}
              placeholderTextColor={colors.placeholder}
            />
            {(category === 'electricity' || category === 'cable' || category === 'water') && (
              <TouchableOpacity
                style={styles.qrButton}
                onPress={handleQRScan}
              >
                <QrCode size={iconSizes.md} color={colors.primary} />
              </TouchableOpacity>
            )}
          </View>
        )}
      </View>
      
      {paymentForm.customAmount && (
        <View style={styles.formGroup}>
          <Text style={styles.label}>Amount</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter amount"
            value={paymentForm.amount}
            onChangeText={(text) => setPaymentForm(prev => ({ ...prev, amount: text }))}
            keyboardType="numeric"
            placeholderTextColor={colors.placeholder}
          />
        </View>
      )}
      
      <TouchableOpacity
        style={styles.continueButton}
        onPress={() => setCurrentStep('review')}
      >
        <Text style={styles.continueButtonText}>Continue to Review</Text>
      </TouchableOpacity>
    </View>
  );

  const renderReviewStep = () => (
    <View style={styles.stepContainer}>
      <Text style={styles.stepTitle}>Review Payment</Text>
      
      <View style={styles.reviewCard}>
        <View style={styles.reviewItem}>
          <Text style={styles.reviewLabel}>Provider</Text>
          <Text style={styles.reviewValue}>{paymentForm.provider?.name}</Text>
        </View>
        
        <View style={styles.reviewItem}>
          <Text style={styles.reviewLabel}>Package</Text>
          <Text style={styles.reviewValue}>{paymentForm.package?.name}</Text>
        </View>
        
        <View style={styles.reviewItem}>
          <Text style={styles.reviewLabel}>
            {category === 'electricity' ? 'Meter Number' : 
             category === 'betting' ? 'Account ID' :
             category === 'cable' ? 'Smart Card Number' :
             category === 'water' ? 'Account Number' :
             'Phone Number'}
          </Text>
          <Text style={styles.reviewValue}>{paymentForm.accountNumber}</Text>
        </View>
        
        <View style={styles.reviewItem}>
          <Text style={styles.reviewLabel}>Amount</Text>
          <Text style={styles.reviewAmount}>₦{parseFloat(paymentForm.amount || '0').toLocaleString()}</Text>
        </View>
      </View>
      
      <TouchableOpacity
        style={[styles.payButton, (loading || isProcessing || isSubmitting) && styles.payButtonDisabled]}
        onPress={handlePayment}
        disabled={loading || isProcessing || isSubmitting}
      >
        {(loading || isProcessing || isSubmitting) ? (
          <ActivityIndicator color={colors.white} />
        ) : (
          <>
            <CreditCard size={iconSizes.sm} color={colors.white} />
            <Text style={styles.payButtonText}>Pay Now</Text>
          </>
        )}
      </TouchableOpacity>
    </View>
  );

  const renderCurrentStep = () => {
    switch (currentStep) {
      case 'provider':
        return renderProviderStep();
      case 'package':
        return renderPackageStep();
      case 'details':
        return renderDetailsStep();
      case 'review':
        return renderReviewStep();
      default:
        return renderProviderStep();
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => {
            if (currentStep === 'provider') {
              navigation.goBack();
            } else {
              // Go back to previous step
              const steps = ['provider', 'package', 'details', 'review'];
              const currentIndex = steps.indexOf(currentStep);
              if (currentIndex > 0) {
                setCurrentStep(steps[currentIndex - 1] as typeof currentStep);
              }
            }
          }}
        >
          <ChevronLeft size={24} color="#000d10" />
        </TouchableOpacity>
        
        <View style={styles.headerPlaceholder} />
        <Text style={styles.headerTitle}>{title}</Text>
        <View style={styles.headerPlaceholder} />
      </View>

      {/* Progress Indicator */}
      <View style={styles.progressContainer}>
        {['provider', 'package', 'details', 'review'].map((step, index) => (
          <View
            key={step}
            style={[
              styles.progressStep,
              step === currentStep && styles.progressStepActive,
              ['provider', 'package', 'details', 'review'].indexOf(currentStep) > index && styles.progressStepCompleted,
            ]}
          />
        ))}
      </View>

      {/* Content */}
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {renderCurrentStep()}
      </ScrollView>

      {/* Processing Overlay */}
      {isProcessing && (
        <View style={styles.processingOverlay}>
          <View style={styles.processingContainer}>
            <Animated.View
              style={[
                styles.processingIcon,
                {
                  transform: [
                    {
                      rotate: processingRotation.interpolate({
                        inputRange: [0, 1],
                        outputRange: ['0deg', '360deg'],
                      }),
                    },
                  ],
                },
              ]}
            >
              <Zap size={40} color={colors.primaryBills} />
            </Animated.View>
            <Text style={styles.processingText}>Processing Payment...</Text>
          </View>
        </View>
      )}

      {/* Success Animation */}
      {showSuccess && (
        <View style={styles.processingOverlay}>
          <Animated.View
            style={[
              styles.successContainer,
              {
                opacity: successOpacity.interpolate({
                  inputRange: [0, 1],
                  outputRange: [0.7, 1],
                }),
                transform: [
                  {
                    scale: successScale.interpolate({
                      inputRange: [0, 1],
                      outputRange: [0.9, 1],
                    }),
                  },
                ],
              },
            ]}
          >
            <CheckCircle size={60} color={colors.success} />
            <Text style={styles.successText}>Payment Successful!</Text>
          </Animated.View>
        </View>
      )}

      {/* PIN Entry Modal */}
      <PinEntryModal
        key={`pin-modal-${showPinModal ? Date.now() : 'closed'}`}
        visible={showPinModal}
        onClose={() => {
          setShowPinModal(false);
          setIsProcessing(false);
          setIsSubmitting(false);
          resetAnimations();
        }}
        onPinEntered={handlePinVerified}
        title="Enter your PIN"
        subtitle="Authorize this bill payment"
        allowBiometric={true}
      />

      {/* Contact Selection Modal for Internet Data */}
      {category === 'internet' && (
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
                const detectedProviderId = detectProviderFromPhone(contact.phone);
                const detectedProvider = detectedProviderId 
                  ? providers.find(p => p.id === detectedProviderId)
                  : null;
                
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
                      <View style={styles.providerBadge}>
                        <Text style={styles.providerBadgeText}>{detectedProvider.name}</Text>
                      </View>
                    )}
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          </SafeAreaView>
        </Modal>
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
  progressContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.md,
  },
  progressStep: {
    flex: 1,
    height: 4,
    backgroundColor: colors.disabled,
    marginHorizontal: 2,
    borderRadius: 2,
  },
  progressStepActive: {
    backgroundColor: colors.seaGreen,
  },
  progressStepCompleted: {
    backgroundColor: colors.success,
  },
  content: {
    flex: 1,
    padding: spacing.md,
  },
  stepContainer: {
    flex: 1,
  },
  stepTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.text,
    marginBottom: spacing.xs,
  },
  stepSubtitle: {
    fontSize: 16,
    color: colors.secondaryText,
    marginBottom: spacing.lg,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.white,
    borderRadius: borderRadius.medium,
    paddingHorizontal: spacing.md,
    marginBottom: spacing.lg,
    ...shadows.small,
    elevation: 2,
  },
  searchInput: {
    flex: 1,
    paddingVertical: spacing.md,
    paddingLeft: spacing.sm,
    fontSize: 16,
    color: colors.text,
  },
  providersList: {
    flex: 1,
  },
  providerItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.white,
    borderRadius: borderRadius.medium,
    padding: spacing.md,
    marginBottom: spacing.sm,
    ...shadows.billsCard,
    elevation: 2,
  },
  providerInfo: {
    flex: 1,
  },
  providerName: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginBottom: spacing.xs,
  },
  providerStatus: {
    fontSize: 14,
    color: colors.success,
  },
  packagesList: {
    flex: 1,
  },
  packageItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.white,
    borderRadius: borderRadius.medium,
    padding: spacing.md,
    marginBottom: spacing.sm,
    ...shadows.billsCard,
    elevation: 2,
  },
  packageInfo: {
    flex: 1,
  },
  packageName: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginBottom: spacing.xs,
  },
  packageDescription: {
    fontSize: 14,
    color: colors.secondaryText,
    marginBottom: spacing.xs,
  },
  packageValidity: {
    fontSize: 12,
    color: colors.success,
  },
  packageAmount: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.primaryBills,
  },
  formGroup: {
    marginBottom: spacing.lg,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginBottom: spacing.sm,
  },
  input: {
    backgroundColor: colors.white,
    borderRadius: borderRadius.medium,
    borderWidth: 1,
    borderColor: colors.borderBills,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    fontSize: 16,
    color: colors.text,
    ...shadows.billsCard,
    elevation: 2,
  },
  inputFocused: {
    borderColor: colors.borderFocusBills,
  },
  continueButton: {
    backgroundColor: colors.primaryBills,
    borderRadius: borderRadius.medium,
    paddingVertical: spacing.lg,
    alignItems: 'center',
    marginTop: spacing.xl,
  },
  continueButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.white,
  },
  reviewCard: {
    backgroundColor: colors.white,
    borderRadius: borderRadius.medium,
    padding: spacing.lg,
    marginBottom: spacing.xl,
    ...shadows.billsCard,
    elevation: 2,
  },
  reviewItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  reviewLabel: {
    fontSize: 16,
    color: colors.secondaryText,
  },
  reviewValue: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    textAlign: 'right',
    flex: 1,
    marginLeft: spacing.md,
  },
  reviewAmount: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.primaryBills,
  },
  payButton: {
    backgroundColor: colors.seaGreen,
    borderRadius: borderRadius.medium,
    paddingVertical: spacing.lg,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
  },
  payButtonDisabled: {
    backgroundColor: colors.disabled,
  },
  payButtonText: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.white,
  },
  processingOverlay: {
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
  processingContainer: {
    alignItems: 'center',
    backgroundColor: colors.white,
    borderRadius: borderRadius.large,
    padding: spacing.xl,
    marginHorizontal: spacing.xl,
  },
  processingIcon: {
    marginBottom: spacing.md,
  },
  processingText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    textAlign: 'center',
  },
  successContainer: {
    position: 'absolute',
    alignItems: 'center',
    backgroundColor: colors.white,
    borderRadius: borderRadius.large,
    padding: spacing.xl,
    marginHorizontal: spacing.xl,
  },
  successText: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.success,
    textAlign: 'center',
    marginTop: spacing.md,
  },
  phoneInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.borderBills,
    borderRadius: borderRadius.small,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  phoneInput: {
    flex: 1,
    fontSize: 16,
    color: colors.text,
    paddingVertical: spacing.xs,
  },
  contactButton: {
    padding: 8,
    marginLeft: spacing.sm,
  },
  qrButton: {
    padding: 8,
    marginLeft: spacing.sm,
  },
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
    borderBottomColor: colors.borderBills,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
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
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderRadius: borderRadius.small,
    marginLeft: spacing.md,
  },
  providerBadgeText: {
    fontSize: 12,
    fontWeight: '500',
    color: colors.white,
  },
});

export default BillPaymentScreen;
