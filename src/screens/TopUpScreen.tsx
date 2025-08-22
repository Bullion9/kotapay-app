import { useNavigation } from '@react-navigation/native';
import {
    CheckCircle,
    ChevronDown,
    ChevronLeft,
    CreditCard,
    Smartphone,
    X
} from 'lucide-react-native';
import React, { useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    Animated,
    KeyboardAvoidingView,
    Modal,
    Platform,
    RefreshControl,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import * as WebBrowser from 'expo-web-browser';
import PinEntryModal from '../components/PinEntryModal';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import { useWallet } from '../hooks/useWallet';
import { usePaystack } from '../hooks/usePaystack';
import { notificationService } from '../services/notifications';
import WalletService from '../services/WalletService';
import { colors } from '../theme';

interface PaymentMethod {
  id: string;
  name: string;
  description: string;
  icon: any;
}

interface Currency {
  code: string;
  symbol: string;
}

const TopUpScreen: React.FC = () => {
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();
  const { user } = useAuth();
  const { refreshBalance } = useWallet();
  const { initializePayment, verifyPayment } = usePaystack();
  
  // State
  const [amount, setAmount] = useState('');
  const [selectedMethod, setSelectedMethod] = useState<PaymentMethod | null>(null);
  const [showPinModal, setShowPinModal] = useState(false);
  const [showCurrencyModal, setShowCurrencyModal] = useState(false);
  const [selectedCurrency, setSelectedCurrency] = useState<Currency>({ code: 'NGN', symbol: '₦' });
  const [loading, setLoading] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [successAnimation] = useState(new Animated.Value(0));
  const [refreshing, setRefreshing] = useState(false);
  const [amountFocused, setAmountFocused] = useState(false);

  // Payment methods
  const paymentMethods: PaymentMethod[] = [
    {
      id: 'card',
      name: 'Debit/Credit Card',
      description: 'Pay with your bank card',
      icon: CreditCard,
    },
    {
      id: 'ussd',
      name: 'USSD Code',
      description: 'Pay with USSD *737#',
      icon: Smartphone,
    },
  ];

  // Currencies
  const currencies: Currency[] = [
    { code: 'NGN', symbol: '₦' },
    { code: 'USD', symbol: '$' },
    { code: 'GBP', symbol: '£' },
  ];

  // Validate amount
  const validateAmount = () => {
    const numAmount = parseFloat(amount);
    if (isNaN(numAmount) || numAmount <= 0) {
      Alert.alert('Error', 'Please enter a valid amount');
      return false;
    }
    if (numAmount < 100) {
      Alert.alert('Error', 'Minimum top-up amount is ₦100');
      return false;
    }
    if (numAmount > 500000) {
      Alert.alert('Error', 'Maximum top-up amount is ₦500,000');
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

  // Handle PIN verification and launch Paystack payment
  const handlePinVerified = async (enteredPin: string) => {
    setShowPinModal(false);
    setLoading(true);
    
    if (!user) {
      Alert.alert('Error', 'User not authenticated');
      setLoading(false);
      return;
    }

    try {
      const topUpAmount = parseFloat(amount);
      const amountInKobo = topUpAmount * 100; // Convert to kobo for Paystack

      // Initialize Paystack payment to get authorization URL
      const paymentData = {
        email: user.email || 'demo@kotapay.com',
        amount: amountInKobo,
        currency: 'NGN',
        metadata: {
          userId: user?.id || (user as any)?.$id || 'demo_user',
          purpose: 'wallet_topup',
          paymentMethod: selectedMethod?.name || 'Card'
        }
      };

      console.log('🚀 Initializing Paystack payment:', paymentData);
      
      const paymentResponse = await initializePayment(paymentData);
      
      if (paymentResponse.status && paymentResponse.data) {
        console.log('✅ Payment initialized:', paymentResponse.data.reference);
        
        // Open Paystack payment page in browser
        const authUrl = paymentResponse.data.authorization_url;
        const result = await WebBrowser.openBrowserAsync(authUrl, {
          presentationStyle: WebBrowser.WebBrowserPresentationStyle.FORM_SHEET,
          controlsColor: colors.primary,
        });

        if (result.type === 'cancel') {
          Alert.alert('Payment Cancelled', 'You cancelled the payment process.');
          setLoading(false);
          return;
        }

        // For demo purposes, we'll wait a moment and then verify the payment
        // In production, you'd implement proper callback handling
        setTimeout(async () => {
          await verifyAndProcessPayment(paymentResponse.data.reference);
        }, 3000);
        
      } else {
        throw new Error('Failed to initialize payment');
      }
    } catch (error) {
      console.error('Payment initialization error:', error);
      Alert.alert('Error', 'Failed to initialize payment. Please try again.');
      setLoading(false);
    }
  };

  // Verify and process payment
  const verifyAndProcessPayment = async (reference: string) => {
    try {
      console.log('🔄 Verifying payment:', reference);
      
      const verificationResult = await verifyPayment(reference);
      
      if (verificationResult.status && verificationResult.data.status === 'success') {
        await handlePaymentSuccess({ reference });
      } else {
        // Payment might still be pending, ask user to confirm
        Alert.alert(
          'Payment Status',
          'We couldn\'t verify your payment automatically. Did you complete the payment successfully?',
          [
            { text: 'No, I cancelled', style: 'cancel', onPress: () => setLoading(false) },
            { text: 'Yes, I paid', onPress: () => handlePaymentSuccess({ reference }) }
          ]
        );
      }
    } catch (error) {
      console.error('Payment verification error:', error);
      Alert.alert(
        'Payment Verification',
        'Unable to verify payment automatically. If you completed the payment, it will be processed shortly.',
        [{ text: 'OK', onPress: () => setLoading(false) }]
      );
    }
  };

  // Handle successful payment
  const handlePaymentSuccess = async (response: any) => {
    setLoading(true);
    
    try {
      console.log('💳 Payment successful:', response);
      
      // Verify payment with Paystack backend
      const verificationResult = await verifyPayment(response.transactionRef?.reference || response.reference);
      
      if (verificationResult.status && verificationResult.data.status === 'success') {
        console.log('✅ Payment verified successfully');
        
        const topUpAmount = parseFloat(amount);
        const userId = user?.id || (user as any)?.$id || 'demo_user';
        const transactionRef = response.transactionRef?.reference || response.reference;

        try {
          // Initialize wallet service and process top-up
          await WalletService.initialize(userId);
          
          await WalletService.processTopUpSuccess(transactionRef, topUpAmount, {
            paymentMethod: selectedMethod?.name || 'Card',
            gateway: 'Paystack Live',
            currency: selectedCurrency.symbol,
            paystackReference: transactionRef,
            amount: topUpAmount
          });

          // Refresh the wallet balance
          await refreshBalance();

          console.log('✅ Wallet top-up processed successfully:', { amount: topUpAmount, ref: transactionRef });
        } catch (walletError) {
          console.error('Wallet update error:', walletError);
          // Continue with success flow even if wallet update fails
        }

        // Start success animation
        setShowSuccess(true);
        
        successAnimation.setValue(0);
        Animated.spring(successAnimation, {
          toValue: 1,
          useNativeDriver: true,
          tension: 100,
          friction: 8,
        }).start();

        // Send success notification
        if (selectedMethod) {
          await notificationService.sendMoneyReceivedNotification({
            transactionId: transactionRef,
            amount: topUpAmount,
            currency: selectedCurrency.symbol,
            senderName: 'Paystack',
            recipientName: 'Your Wallet',
            message: `₦${topUpAmount.toLocaleString()} added to your wallet successfully`,
          });
        }

        // Auto-navigate after success animation
        setTimeout(() => {
          setShowSuccess(false);
          try {
            navigation.navigate('TransactionHistoryScreen' as never);
          } catch (navError) {
            console.warn('Navigation error:', navError);
          }
        }, 2500);
        
      } else {
        throw new Error('Payment verification failed');
      }
    } catch (error) {
      console.error('Payment processing error:', error);
      Alert.alert('Error', 'Payment verification failed. Please contact support if money was deducted.');
    } finally {
      setLoading(false);
    }
  };

  // Handle pull to refresh
  const onRefresh = async () => {
    setRefreshing(true);
    try {
      // Simulate refresh data loading
      await new Promise(resolve => setTimeout(resolve, 1500));
      // You can add actual data refresh logic here
      console.log('Data refreshed');
    } catch (error) {
      console.error('Refresh error:', error);
    } finally {
      setRefreshing(false);
    }
  };

  // Success screen component
  const SuccessScreen = () => (
    <Animated.View style={[styles.successContainer, {
      transform: [{
        scale: successAnimation.interpolate({
          inputRange: [0, 1],
          outputRange: [0.8, 1],
        })
      }]
    }]}>
      <View style={styles.successIcon}>
        <CheckCircle size={80} color={colors.success} />
      </View>
      <Text style={styles.successTitle}>Top-up Successful!</Text>
      <Text style={styles.successAmount}>
        {selectedCurrency.symbol}{parseFloat(amount).toLocaleString()}
      </Text>
      <Text style={styles.successSubtitle}>
        Your wallet has been topped up successfully
      </Text>
      <TouchableOpacity
        style={styles.doneButton}
        onPress={() => navigation.goBack()}
      >
        <Text style={styles.doneButtonText}>Done</Text>
      </TouchableOpacity>
    </Animated.View>
  );

  if (showSuccess) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
        {/* Fixed Header */}
        <View style={styles.header}>
          <View style={styles.placeholder} />
          <Text style={styles.headerTitle}>Top-up Complete</Text>
          <View style={styles.placeholder} />
        </View>
        
        {/* Success Content */}
        <View style={styles.successContentWrapper}>
          <SuccessScreen />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Fixed Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <ChevronLeft size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Top Up Wallet</Text>
        <View style={styles.placeholder} />
      </View>

      <KeyboardAvoidingView 
        style={styles.keyboardAvoidingView}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
      >
        {/* Scrollable Content */}
        <ScrollView 
          style={styles.scrollContent} 
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
        >

        {/* Amount Input Section */}
        <View style={styles.amountSection}>
          <Text style={styles.sectionTitle}>Enter Amount</Text>
          
          <View style={[
            styles.amountContainer,
            amountFocused && styles.amountContainerFocused
          ]}>
            <View style={styles.currencySelector}>
              <Text style={styles.currencySymbol}>{selectedCurrency.symbol}</Text>
              <TouchableOpacity 
                style={styles.currencyButton}
                onPress={() => setShowCurrencyModal(true)}
              >
                <Text style={styles.currencyCode}>{selectedCurrency.code}</Text>
                <ChevronDown size={16} color={colors.secondaryText} />
              </TouchableOpacity>
            </View>
            <TextInput
              style={styles.amountInput}
              placeholder="0.00"
              value={amount}
              onChangeText={setAmount}
              onFocus={() => setAmountFocused(true)}
              onBlur={() => setAmountFocused(false)}
              keyboardType="numeric"
              placeholderTextColor="#ccc"
              maxLength={10}
            />
          </View>
        </View>

        {/* Payment Methods */}
        <View style={styles.methodsSection}>
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
                <method.icon size={24} color={selectedMethod?.id === method.id ? colors.primary : colors.secondaryText} />
              </View>
              <View style={styles.methodInfo}>
                <Text style={styles.methodName}>{method.name}</Text>
                <Text style={styles.methodDescription}>{method.description}</Text>
              </View>
              {selectedMethod?.id === method.id && (
                <CheckCircle size={20} color={colors.primary} />
              )}
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>

        {/* Fixed Continue Button */}
        <View style={[styles.buttonContainer, { paddingBottom: Math.max(insets.bottom, 20) }]}>
          <TouchableOpacity
            style={[
              styles.continueButton,
              (!amount || !selectedMethod || loading) && styles.disabledButton,
            ]}
            onPress={handleContinue}
            disabled={!amount || !selectedMethod || loading}
          >
            {loading ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <Text style={styles.continueButtonText}>
                Continue
              </Text>
            )}
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>

      {/* PIN Modal */}
      {showPinModal && (
        <PinEntryModal
          visible={showPinModal}
          onClose={() => setShowPinModal(false)}
          onPinEntered={handlePinVerified}
          title="Enter Transaction PIN"
          subtitle={`Confirm top-up of ${selectedCurrency.symbol}${amount}`}
        />
      )}

      {/* Currency Selection Modal */}
      {showCurrencyModal && (
        <Modal
          visible={showCurrencyModal}
          transparent
          animationType="slide"
          onRequestClose={() => setShowCurrencyModal(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.currencyModal}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Select Currency</Text>
                <TouchableOpacity onPress={() => setShowCurrencyModal(false)}>
                  <X size={24} color="#000" />
                </TouchableOpacity>
              </View>
              <ScrollView>
                {currencies.map((currency) => (
                  <TouchableOpacity
                    key={currency.code}
                    style={styles.currencyOption}
                    onPress={() => {
                      setSelectedCurrency(currency);
                      setShowCurrencyModal(false);
                    }}
                  >
                    <Text style={styles.currencyOptionText}>
                      {currency.symbol} {currency.code}
                    </Text>
                    {selectedCurrency.code === currency.code && (
                      <CheckCircle size={20} color="#4CAF50" />
                    )}
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
          </View>
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
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 20,
    backgroundColor: colors.background,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  scrollContent: {
    flex: 1,
  },
  keyboardAvoidingView: {
    flex: 1,
  },
  buttonContainer: {
    paddingHorizontal: 20,
    paddingTop: 20,
    backgroundColor: colors.background,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 5,
  },
  successContentWrapper: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.card,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: colors.border,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.text,
  },
  placeholder: {
    width: 40,
    height: 40,
  },
  amountSection: {
    paddingHorizontal: 20,
    marginBottom: 30,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 15,
    color: colors.text,
  },
  amountContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    paddingHorizontal: 15,
    height: 56,
    backgroundColor: colors.card,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 1,
  },
  amountContainerFocused: {
    borderColor: colors.primary,
    borderWidth: 2,
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  currencySelector: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingRight: 15,
    borderRightWidth: 1,
    borderRightColor: colors.border,
  },
  currencySymbol: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.text,
    marginRight: 5,
  },
  currencyButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  currencyCode: {
    fontSize: 14,
    color: colors.secondaryText,
    marginRight: 5,
  },
  amountInput: {
    flex: 1,
    fontSize: 18,
    color: colors.text,
    paddingLeft: 15,
  },
  methodsSection: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  methodCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    marginBottom: 12,
    backgroundColor: colors.card,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  selectedMethodCard: {
    borderColor: colors.primary,
    borderWidth: 2,
    backgroundColor: colors.accentTransparent,
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 3,
  },
  methodIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.primaryTransparent,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 15,
  },
  methodInfo: {
    flex: 1,
  },
  methodName: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 4,
  },
  methodDescription: {
    fontSize: 14,
    color: colors.secondaryText,
  },
  continueButton: {
    backgroundColor: colors.success,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  disabledButton: {
    backgroundColor: '#ccc',
  },
  continueButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  currencyModal: {
    backgroundColor: colors.card,
    borderRadius: 20,
    padding: 20,
    width: '80%',
    maxHeight: '60%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.text,
  },
  currencyOption: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  currencyOptionText: {
    fontSize: 16,
    color: colors.text,
  },
  successContainer: {
    alignItems: 'center',
    padding: 40,
  },
  successIcon: {
    marginBottom: 30,
  },
  successTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 10,
    textAlign: 'center',
  },
  successAmount: {
    fontSize: 32,
    fontWeight: 'bold',
    color: colors.success,
    marginBottom: 10,
  },
  successSubtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 40,
  },
  doneButton: {
    backgroundColor: colors.success,
    paddingHorizontal: 40,
    paddingVertical: 15,
    borderRadius: 12,
  },
  doneButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
});

export default TopUpScreen;
