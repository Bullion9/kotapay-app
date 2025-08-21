import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Alert,
  ActivityIndicator,
  RefreshControl,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  ChevronLeft,
  CreditCard,
  University,
  PiggyBank,
  CheckCircle,
  AlertCircle,
  Banknote,
} from 'lucide-react-native';
import { colors } from '../theme';

interface PaymentLink {
  id: string;
  recipientName: string;
  amount: number;
  currency: string;
  note?: string;
  expiry: Date;
  paid: boolean;
  allowTips: boolean;
  maxTip: number;
}

interface PaymentMethod {
  id: string;
  name: string;
  description: string;
  icon: any;
  requiresAuth: boolean;
}

const PayWithLinkScreen: React.FC = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const insets = useSafeAreaInsets();
  
  // Extract linkId from route params
  const linkId = (route.params as any)?.linkId || 'demo-link-123';
  
  // State
  const [paymentLink, setPaymentLink] = useState<PaymentLink | null>(null);
  const [payerName, setPayerName] = useState('');
  const [payerEmail, setPayerEmail] = useState('');
  const [tipAmount, setTipAmount] = useState('');
  const [selectedMethod, setSelectedMethod] = useState<PaymentMethod | null>(null);
  const [loading, setLoading] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [nameFieldFocused, setNameFieldFocused] = useState(false);
  const [emailFieldFocused, setEmailFieldFocused] = useState(false);
  const [tipFieldFocused, setTipFieldFocused] = useState(false);
  const [linkStatus, setLinkStatus] = useState<'active' | 'expired' | 'paid'>('active');

  // Payment methods
  const paymentMethods: PaymentMethod[] = [
    {
      id: 'card',
      name: 'Debit/Credit Card',
      description: 'Pay with your card',
      icon: CreditCard,
      requiresAuth: false,
    },
    {
      id: 'transfer',
      name: 'Bank Transfer',
      description: 'Direct bank transfer',
      icon: University,
      requiresAuth: false,
    },
    {
      id: 'wallet',
      name: 'KotaPay Wallet',
      description: 'Use wallet balance',
      icon: PiggyBank,
      requiresAuth: true,
    },
  ];

  // Load payment link data from API
  React.useEffect(() => {
    const loadPaymentLink = async () => {
      setLoading(true);
      try {
        // In a real app, this would be an API call like:
        // const response = await fetch(`/api/payment-links/${linkId}`);
        // const linkData = await response.json();
        
        // For now, simulate API call with mock data
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // This mock data would come from your backend based on linkId
        const mockLink: PaymentLink = {
          id: linkId,
          recipientName: 'Demo Recipient', // This would come from the payment link creator
          amount: 1000, // This would be the amount set when the link was created
          currency: '₦',
          note: 'Demo payment link', // This would be the note from the link creator
          expiry: new Date(Date.now() + 24 * 60 * 60 * 1000), // Set when link was created
          paid: false,
          allowTips: true,
          maxTip: 100,
        };

        // Check link status
        const now = new Date();
        if (mockLink.paid) {
          setLinkStatus('paid');
        } else if (mockLink.expiry < now) {
          setLinkStatus('expired');
        } else {
          setLinkStatus('active');
        }

        setPaymentLink(mockLink);
      } catch {
        Alert.alert('Error', 'Failed to load payment link');
        navigation.goBack();
      } finally {
        setLoading(false);
      }
    };

    loadPaymentLink();
  }, [linkId, navigation]);

  // Validate form
  const validateForm = () => {
    if (!payerName.trim()) {
      Alert.alert('Error', 'Please enter your full name');
      return false;
    }
    if (!payerEmail.trim() || !payerEmail.includes('@')) {
      Alert.alert('Error', 'Please enter a valid email address');
      return false;
    }
    if (!selectedMethod) {
      Alert.alert('Error', 'Please select a payment method');
      return false;
    }
    if (tipAmount && parseFloat(tipAmount) > (paymentLink?.maxTip || 0)) {
      Alert.alert('Error', `Tip amount cannot exceed ₦${paymentLink?.maxTip}`);
      return false;
    }
    return true;
  };

  // Handle payment method selection
  const handleMethodSelect = (method: PaymentMethod) => {
    setSelectedMethod(method);
  };

  // Handle payment
  const handlePayment = () => {
    if (!validateForm()) return;
    
    setLoading(true);
    
    // Simulate payment processing
    setTimeout(() => {
      setLoading(false);
      setShowSuccess(true);
      
      Alert.alert(
        'Payment Successful!',
        `Payment of ₦${getTotalAmount().toLocaleString()} has been processed successfully.`
      );
    }, 2000);
  };

  // Calculate total amount
  const getTotalAmount = () => {
    const baseAmount = paymentLink?.amount || 0;
    const tip = parseFloat(tipAmount) || 0;
    return baseAmount + tip;
  };

  // Pull to refresh
  const onRefresh = async () => {
    setRefreshing(true);
    await new Promise(resolve => setTimeout(resolve, 1000));
    setRefreshing(false);
  };

  // Success Screen Component
  const SuccessScreen = () => (
    <View style={styles.successContainer}>
      <View style={styles.successIcon}>
        <CheckCircle size={60} color={colors.primary} />
      </View>
      <Text style={styles.successTitle}>Payment Successful!</Text>
      <Text style={styles.successMessage}>
        Your payment of ₦{getTotalAmount().toLocaleString()} has been processed successfully.
      </Text>
      <Text style={styles.successRecipient}>
        Paid to: {paymentLink?.recipientName}
      </Text>
      
      <TouchableOpacity
        style={styles.doneButton}
        onPress={() => {
          setShowSuccess(false);
          navigation.goBack();
        }}
      >
        <Text style={styles.doneButtonText}>Done</Text>
      </TouchableOpacity>
    </View>
  );

  // Error states
  if (linkStatus === 'paid') {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <ChevronLeft size={24} color={colors.text} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Payment Link</Text>
          <View style={styles.placeholder} />
        </View>
        
        <View style={styles.statusContainer}>
          <CheckCircle size={60} color={colors.primary} />
          <Text style={styles.statusTitle}>Already Paid</Text>
          <Text style={styles.statusMessage}>This payment link has already been paid.</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (linkStatus === 'expired') {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <ChevronLeft size={24} color={colors.text} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Payment Link</Text>
          <View style={styles.placeholder} />
        </View>
        
        <View style={styles.statusContainer}>
          <AlertCircle size={60} color={colors.error} />
          <Text style={styles.statusTitle}>Link Expired</Text>
          <Text style={styles.statusMessage}>This payment link has expired and is no longer valid.</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (showSuccess) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <View style={styles.placeholder} />
          <Text style={styles.headerTitle}>Payment Complete</Text>
          <View style={styles.placeholder} />
        </View>
        
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
        <Text style={styles.headerTitle}>Pay with Link</Text>
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
          {/* Payment Details Section */}
          {paymentLink && (
            <View style={styles.paymentDetailsSection}>
              <Text style={styles.sectionTitle}>Payment Details</Text>
              <View style={styles.paymentDetailsCard}>
                <View style={styles.amountContainer}>
                  <Banknote size={24} color={colors.primary} />
                  <View style={styles.amountInfo}>
                    <Text style={styles.amountText}>
                      {paymentLink.currency}{paymentLink.amount.toLocaleString()}
                    </Text>
                    <Text style={styles.recipientText}>to {paymentLink.recipientName}</Text>
                  </View>
                </View>
                {paymentLink.note && (
                  <View style={styles.noteContainer}>
                    <Text style={styles.noteLabel}>Note:</Text>
                    <Text style={styles.noteText}>{paymentLink.note}</Text>
                  </View>
                )}
              </View>
            </View>
          )}

          {/* Payer Information Section */}
          <View style={styles.payerInfoSection}>
            <Text style={styles.sectionTitle}>Your Information</Text>
            
            <View style={[
              styles.inputContainer,
              nameFieldFocused && styles.inputContainerFocused
            ]}>
              <Text style={styles.inputLabel}>Full Name</Text>
              <TextInput
                style={styles.textInput}
                placeholder="Enter your full name"
                value={payerName}
                onChangeText={setPayerName}
                onFocus={() => setNameFieldFocused(true)}
                onBlur={() => setNameFieldFocused(false)}
                placeholderTextColor="#ccc"
              />
            </View>

            <View style={[
              styles.inputContainer,
              emailFieldFocused && styles.inputContainerFocused
            ]}>
              <Text style={styles.inputLabel}>Email Address</Text>
              <TextInput
                style={styles.textInput}
                placeholder="Enter your email"
                value={payerEmail}
                onChangeText={setPayerEmail}
                onFocus={() => setEmailFieldFocused(true)}
                onBlur={() => setEmailFieldFocused(false)}
                placeholderTextColor="#ccc"
                keyboardType="email-address"
                autoCapitalize="none"
              />
            </View>
          </View>

          {/* Tip Section (if allowed) */}
          {paymentLink?.allowTips && (
            <View style={styles.tipSection}>
              <Text style={styles.sectionTitle}>Add Tip (Optional)</Text>
              <View style={[
                styles.inputContainer,
                tipFieldFocused && styles.inputContainerFocused
              ]}>
                <Text style={styles.inputLabel}>Tip Amount (Max: ₦{paymentLink.maxTip})</Text>
                <View style={styles.tipInputContainer}>
                  <Text style={styles.currencySymbol}>₦</Text>
                  <TextInput
                    style={styles.tipInput}
                    placeholder="0"
                    value={tipAmount}
                    onChangeText={setTipAmount}
                    onFocus={() => setTipFieldFocused(true)}
                    onBlur={() => setTipFieldFocused(false)}
                    keyboardType="numeric"
                    placeholderTextColor="#ccc"
                  />
                </View>
              </View>
            </View>
          )}

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
                onPress={() => handleMethodSelect(method)}
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

          {/* Payment Summary */}
          {paymentLink && (
            <View style={styles.summarySection}>
              <Text style={styles.sectionTitle}>Payment Summary</Text>
              <View style={styles.summaryCard}>
                <View style={styles.summaryRow}>
                  <Text style={styles.summaryLabel}>Amount</Text>
                  <Text style={styles.summaryValue}>₦{paymentLink.amount.toLocaleString()}</Text>
                </View>
                {tipAmount && parseFloat(tipAmount) > 0 && (
                  <View style={styles.summaryRow}>
                    <Text style={styles.summaryLabel}>Tip</Text>
                    <Text style={styles.summaryValue}>₦{parseFloat(tipAmount).toLocaleString()}</Text>
                  </View>
                )}
                <View style={[styles.summaryRow, styles.totalRow]}>
                  <Text style={styles.totalLabel}>Total</Text>
                  <Text style={styles.totalValue}>₦{getTotalAmount().toLocaleString()}</Text>
                </View>
              </View>
            </View>
          )}
        </ScrollView>

        {/* Fixed Pay Button */}
        <View style={[styles.buttonContainer, { paddingBottom: Math.max(insets.bottom, 20) }]}>
          <TouchableOpacity
            style={[
              styles.payButton,
              (!payerName || !payerEmail || !selectedMethod || loading) && styles.disabledButton,
            ]}
            onPress={handlePayment}
            disabled={!payerName || !payerEmail || !selectedMethod || loading}
          >
            {loading ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <Text style={styles.payButtonText}>
                Pay ₦{getTotalAmount().toLocaleString()}
              </Text>
            )}
          </TouchableOpacity>
        </View>
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
    paddingHorizontal: 16,
    paddingVertical: 16,
    backgroundColor: colors.background,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    flex: 1,
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
    textAlign: 'center',
    marginRight: 40, // Offset for back button
  },
  placeholder: {
    width: 40,
  },
  keyboardAvoidingView: {
    flex: 1,
  },
  scrollContent: {
    flex: 1,
    paddingHorizontal: 16,
  },
  paymentDetailsSection: {
    marginVertical: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 12,
  },
  paymentDetailsCard: {
    backgroundColor: colors.white,
    borderRadius: 12,
    padding: 16,
  },
  amountContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  amountInfo: {
    marginLeft: 12,
    flex: 1,
  },
  amountText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.text,
  },
  recipientText: {
    fontSize: 14,
    color: colors.secondaryText,
    marginTop: 4,
  },
  noteContainer: {
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  noteLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.text,
    marginBottom: 4,
  },
  noteText: {
    fontSize: 14,
    color: colors.secondaryText,
  },
  payerInfoSection: {
    marginBottom: 24,
  },
  inputContainer: {
    backgroundColor: colors.white,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  inputContainerFocused: {
    borderColor: colors.primary,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.text,
    marginBottom: 8,
  },
  textInput: {
    fontSize: 16,
    color: colors.text,
  },
  tipSection: {
    marginBottom: 24,
  },
  tipInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  currencySymbol: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginRight: 8,
  },
  tipInput: {
    flex: 1,
    fontSize: 16,
    color: colors.text,
  },
  methodsSection: {
    marginBottom: 24,
  },
  methodCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.white,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  selectedMethodCard: {
    borderColor: colors.primary,
  },
  methodIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.card,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
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
  summarySection: {
    marginBottom: 24,
  },
  summaryCard: {
    backgroundColor: colors.white,
    borderRadius: 12,
    padding: 16,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  summaryLabel: {
    fontSize: 14,
    color: colors.secondaryText,
  },
  summaryValue: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.text,
  },
  totalRow: {
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    marginBottom: 0,
  },
  totalLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
  },
  totalValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.primary,
  },
  buttonContainer: {
    paddingHorizontal: 16,
    paddingTop: 16,
    backgroundColor: colors.background,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  payButton: {
    backgroundColor: colors.primary,
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
  },
  disabledButton: {
    opacity: 0.5,
  },
  payButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.white,
  },
  statusContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  statusTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.text,
    marginTop: 24,
    marginBottom: 16,
    textAlign: 'center',
  },
  statusMessage: {
    fontSize: 16,
    color: colors.secondaryText,
    textAlign: 'center',
    lineHeight: 24,
  },
  successContentWrapper: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  successContainer: {
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  successIcon: {
    marginBottom: 24,
  },
  successTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 16,
    textAlign: 'center',
  },
  successMessage: {
    fontSize: 16,
    color: colors.secondaryText,
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 16,
  },
  successRecipient: {
    fontSize: 14,
    color: colors.primary,
    textAlign: 'center',
    marginBottom: 32,
  },
  doneButton: {
    backgroundColor: colors.primary,
    paddingHorizontal: 32,
    paddingVertical: 16,
    borderRadius: 12,
  },
  doneButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.white,
  },
});

export default PayWithLinkScreen;
