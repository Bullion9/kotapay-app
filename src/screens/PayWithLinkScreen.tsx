import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  Dimensions,
  Platform,
  KeyboardAvoidingView,
  Animated,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRoute, useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import {
  Shield,
  Lock,
  HelpCircle,
  FileText,
  Download,
  CheckCircle,
  AlertTriangle,
  X,
  Banknote,
  University,
  PiggyBank,
  Check,
  Clock,
} from 'lucide-react-native';
import { RootStackParamList } from '../types';
import { useAuth } from '../contexts/AuthContext';
import { colors, spacing, shadows, globalStyles } from '../theme';
import PinEntryModal from '../components/PinEntryModal';

type PayWithLinkScreenNavigationProp = StackNavigationProp<RootStackParamList>;

interface PaymentLink {
  id: string;
  recipientId: string;
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
  icon: React.ComponentType<any>;
  description: string;
  requiresAuth: boolean;
}

const { width: screenWidth } = Dimensions.get('window');
const maxWidth = Math.min(screenWidth - 32, 480);

const PayWithLinkScreen: React.FC = () => {
  const navigation = useNavigation<PayWithLinkScreenNavigationProp>();
  const route = useRoute();
  const { user } = useAuth();
  
  // Extract linkId from route params
  const linkId = (route.params as any)?.linkId || 'demo-link-123';
  
  // State management
  const [paymentLink, setPaymentLink] = useState<PaymentLink | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [tipAmount, setTipAmount] = useState(0);
  const [payerName, setPayerName] = useState(user?.name || '');
  const [payerEmail, setPayerEmail] = useState(user?.email || '');
  const [selectedMethod, setSelectedMethod] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [linkStatus, setLinkStatus] = useState<'active' | 'expired' | 'paid'>('active');
  const [showPinModal, setShowPinModal] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [transactionStatus, setTransactionStatus] = useState<'success' | 'failed' | 'pending'>('pending');

  const animationValue = useRef(new Animated.Value(0)).current;

  // Reset animation state
  const resetAnimationState = () => {
    setShowSuccess(false);
    animationValue.setValue(0);
  };

  // Payment methods
  const paymentMethods: PaymentMethod[] = [
    {
      id: 'card',
      name: 'Card',
      icon: Banknote,
      description: 'Debit/Credit',
      requiresAuth: false,
    },
    {
      id: 'transfer',
      name: 'Transfer',
      icon: University,
      description: 'Bank account',
      requiresAuth: false,
    },
    {
      id: 'wallet',
      name: 'Wallet',
      icon: PiggyBank,
      description: 'KotaPay balance',
      requiresAuth: true,
    },
  ];

  // Load payment link data
  useEffect(() => {
    const loadPaymentLink = async () => {
      try {
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Mock payment link data
        const mockLink: PaymentLink = {
          id: linkId,
          recipientId: 'user-123',
          recipientName: 'John Doe',
          amount: 5000,
          currency: '₦',
          note: 'Payment for freelance design work',
          expiry: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours from now
          paid: false,
          allowTips: true,
          maxTip: 500,
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
        setIsLoading(false);
      }
    };

    loadPaymentLink();
  }, [linkId, navigation]);

  const handleMethodSelection = (methodId: string) => {
    // Reset any previous success state
    resetAnimationState();
    
    // Validate form before proceeding with payment
    if (!payerName.trim()) {
      Alert.alert('Name Required', 'Please enter your full name to continue.');
      return;
    }
    
    if (!payerEmail.trim() || !payerEmail.includes('@')) {
      Alert.alert('Email Required', 'Please enter a valid email address to continue.');
      return;
    }
    
    if (linkStatus !== 'active') {
      Alert.alert('Payment Unavailable', 'This payment link is no longer active.');
      return;
    }
    
    // Set selected method and show PIN modal for payment confirmation
    setSelectedMethod(methodId);
    setShowPinModal(true);
  };

  const handlePinVerified = async (pin: string) => {
    // PIN verified successfully, proceed with payment
    setShowPinModal(false);
    
    // Process the payment
    setIsProcessing(true);
    setTransactionStatus('pending');
    
    try {
      // Simulate payment processing
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Payment successful
      setTransactionStatus('success');
      setIsProcessing(false);
      
      // Start success animation
      setShowSuccess(true);
      animationValue.setValue(0);
      Animated.spring(animationValue, {
        toValue: 1,
        useNativeDriver: true,
        tension: 100,
        friction: 8,
      }).start();
      
    } catch {
      setTransactionStatus('failed');
      setIsProcessing(false);
    }
  };

  const renderPinModal = () => {
    const selectedPaymentMethod = paymentMethods.find(method => method.id === selectedMethod);
    const methodName = selectedPaymentMethod?.name || 'Payment Method';
    
    return (
      <PinEntryModal
        visible={showPinModal}
        onClose={() => !isProcessing && setShowPinModal(false)}
        onPinEntered={handlePinVerified}
        title={isProcessing ? "Processing Payment..." : "Enter PIN to Pay"}
        subtitle={isProcessing 
          ? "Please wait while we process your payment..."
          : `Pay ${paymentLink?.currency}${getTotalAmount().toLocaleString()} to ${paymentLink?.recipientName} via ${methodName}`
        }
        allowBiometric={!isProcessing}
      />
    );
  };

  const getTotalAmount = () => {
    return (paymentLink?.amount || 0) + tipAmount;
  };

  const renderStatusBanner = () => {
    if (linkStatus === 'paid') {
      return (
        <View style={[styles.statusBanner, styles.successBanner]}>
          <CheckCircle size={20} color="#FFFFFF" />
          <Text style={styles.statusText}>Paid ✓</Text>
          <TouchableOpacity style={styles.receiptButton}>
            <Text style={styles.receiptButtonText}>Download Receipt</Text>
          </TouchableOpacity>
        </View>
      );
    }

    if (linkStatus === 'expired') {
      return (
        <View style={[styles.statusBanner, styles.errorBanner]}>
          <AlertTriangle size={20} color="#FFFFFF" />
          <Text style={styles.statusText}>This link is no longer active</Text>
        </View>
      );
    }

    return null;
  };

  const renderSimpleHeader = () => (
    <View style={styles.simpleHeader}>
      <TouchableOpacity style={globalStyles.backButton} onPress={() => navigation.goBack()}>
        <X size={24} color={colors.primary} />
      </TouchableOpacity>
      
      <View style={styles.headerContent}>
        <Text style={styles.headerTitle}>
          Pay {paymentLink?.recipientName || 'Merchant'}
        </Text>
        <Text style={styles.headerSubtitle}>
          Secure, instant, no app required
        </Text>
      </View>
    </View>
  );

  const renderAmountPanel = () => (
    <View style={styles.amountPanel}>
      <Text style={styles.amountLabel}>Amount</Text>
      <Text style={styles.amountValue}>
        {paymentLink?.currency}{paymentLink?.amount?.toLocaleString()}
      </Text>
      
      {paymentLink?.note && (
        <Text style={styles.paymentNote}>{paymentLink.note}</Text>
      )}

      {paymentLink?.allowTips && (
        <View style={styles.tipSection}>
          <Text style={styles.tipLabel}>Add tip (optional)</Text>
          <View style={styles.tipSlider}>
            {[0, 100, 250, 500].map((tip) => (
              <TouchableOpacity
                key={tip}
                style={[
                  styles.tipOption,
                  tipAmount === tip && styles.tipOptionSelected,
                ]}
                onPress={() => setTipAmount(tip)}
              >
                <Text style={[
                  styles.tipOptionText,
                  tipAmount === tip && styles.tipOptionTextSelected,
                ]}>
                  {tip === 0 ? 'No tip' : `₦${tip}`}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
          
          {tipAmount > 0 && (
            <Text style={styles.totalAmount}>
              Total: {paymentLink?.currency}{getTotalAmount().toLocaleString()}
            </Text>
          )}
        </View>
      )}
    </View>
  );

  const renderPayerInfoCard = () => (
    <View style={styles.payerInfoCard}>
      <Text style={styles.cardTitle}>Your Information</Text>
      
      <View style={styles.inputGroup}>
        <Text style={styles.inputLabel}>Full Name</Text>
        <TextInput
          style={styles.textInput}
          value={payerName}
          onChangeText={setPayerName}
          placeholder="Enter your full name"
          placeholderTextColor="#9CA3AF"
        />
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.inputLabel}>Email Address</Text>
        <TextInput
          style={styles.textInput}
          value={payerEmail}
          onChangeText={setPayerEmail}
          placeholder="your@email.com"
          placeholderTextColor="#9CA3AF"
          keyboardType="email-address"
          autoCapitalize="none"
        />
      </View>
    </View>
  );

  const renderPaymentMethodSelector = () => (
    <View style={styles.paymentMethodCard}>
      <Text style={styles.cardTitle}>Choose Payment Method</Text>
      <Text style={styles.paymentMethodSubtitle}>
        Select a payment method. You&apos;ll enter your PIN to confirm the payment.
      </Text>
      
      <View style={styles.methodGrid}>
        {paymentMethods.map((method) => {
          const IconComponent = method.icon;
          const isSelected = selectedMethod === method.id;
          const isDisabled = method.requiresAuth && !user;
          
          return (
            <TouchableOpacity
              key={method.id}
              style={[
                styles.methodOptionCompact,
                isSelected && styles.methodOptionSelected,
                isDisabled && styles.methodOptionDisabled,
              ]}
              onPress={() => !isDisabled && handleMethodSelection(method.id)}
              disabled={isDisabled}
            >
              <IconComponent 
                size={24} 
                color={isSelected ? '#FFFFFF' : isDisabled ? '#9CA3AF' : '#06402B'} 
              />
              <Text style={[
                styles.methodNameCompact,
                isSelected && styles.methodNameSelected,
                isDisabled && styles.methodNameDisabled,
              ]}>
                {method.name}
              </Text>
              <Text style={[
                styles.methodDescriptionCompact,
                isSelected && styles.methodDescriptionSelected,
                isDisabled && styles.methodDescriptionDisabled,
              ]}>
                {method.description}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );

  const renderSecurityBadges = () => (
    <View style={styles.securityBadges}>
      <View style={styles.badge}>
        <Shield size={16} color="#06402B" />
        <Text style={styles.badgeText}>PCI-DSS</Text>
      </View>
      <View style={styles.badge}>
        <Lock size={16} color="#06402B" />
        <Text style={styles.badgeText}>SSL Secure</Text>
      </View>
      <View style={styles.badge}>
        <Shield size={16} color="#06402B" />
        <Text style={styles.badgeText}>Fraud Protection</Text>
      </View>
    </View>
  );

  const renderFooterLinks = () => (
    <View style={styles.footerLinks}>
      <TouchableOpacity style={styles.footerLink}>
        <HelpCircle size={16} color="#06402B" />
        <Text style={styles.footerLinkText}>Need help?</Text>
      </TouchableOpacity>
      
      <TouchableOpacity style={styles.footerLink}>
        <FileText size={16} color="#06402B" />
        <Text style={styles.footerLinkText}>Terms & Privacy</Text>
      </TouchableOpacity>
      
      <TouchableOpacity style={styles.footerLink}>
        <Download size={16} color="#06402B" />
        <Text style={styles.footerLinkText}>Download KotaPay</Text>
      </TouchableOpacity>
    </View>
  );

  const renderResultOverlay = () => {
    if (!showSuccess && !isProcessing) return null;

    const statusConfig = {
      success: {
        icon: Check,
        color: '#10B981',
        title: 'Payment Successful!',
        subtitle: `₦${getTotalAmount().toLocaleString()} paid to ${paymentLink?.recipientName}`,
      },
      failed: {
        icon: X,
        color: '#EA3B52',
        title: 'Payment Failed',
        subtitle: 'Please try again or use a different payment method',
      },
      pending: {
        icon: Clock,
        color: '#F59E0B',
        title: 'Processing Payment',
        subtitle: 'Please wait while we process your payment',
      },
    };

    const config = statusConfig[transactionStatus];
    const IconComponent = config.icon;

    return (
      <View style={styles.resultOverlay}>
        <View style={styles.resultContainer}>
          {isProcessing ? (
            <View style={styles.processingContainer}>
              <View style={styles.processingSpinner}>
                <Text style={styles.processingDots}>●●●</Text>
              </View>
              <Text style={styles.processingText}>Processing payment...</Text>
            </View>
          ) : (
            <Animated.View
              style={[
                styles.resultContent,
                showSuccess && transactionStatus === 'success' && {
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
              <View style={[styles.resultIcon, { backgroundColor: config.color }]}>
                <IconComponent size={48} color="#FFFFFF" />
              </View>
              <Text style={styles.resultTitle}>{config.title}</Text>
              <Text style={styles.resultSubtitle}>{config.subtitle}</Text>
              
              {transactionStatus === 'success' && (
                <View style={styles.resultButtons}>
                  <TouchableOpacity
                    style={styles.doneButton}
                    onPress={() => navigation.goBack()}
                  >
                    <Text style={styles.doneButtonText}>Done</Text>
                  </TouchableOpacity>
                  
                  <TouchableOpacity
                    style={styles.resultReceiptButton}
                    onPress={() => {
                      // Navigate to transactions and highlight the recent payment
                      navigation.navigate('Transactions');
                    }}
                  >
                    <Text style={styles.resultReceiptButtonText}>View Receipt</Text>
                  </TouchableOpacity>
                </View>
              )}
              
              {transactionStatus === 'failed' && (
                <TouchableOpacity
                  style={styles.retryButton}
                  onPress={() => {
                    setShowSuccess(false);
                    setTransactionStatus('pending');
                    animationValue.setValue(0);
                    setShowPinModal(true);
                  }}
                >
                  <Text style={styles.retryButtonText}>Try Again</Text>
                </TouchableOpacity>
              )}
            </Animated.View>
          )}
        </View>
      </View>
    );
  };

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Loading payment link...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView 
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        {renderStatusBanner()}
        {renderSimpleHeader()}
        
        <ScrollView 
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.contentContainer}>
            {renderAmountPanel()}
            {linkStatus === 'active' && (
              <>
                {renderPayerInfoCard()}
                {renderPaymentMethodSelector()}
                {renderSecurityBadges()}
              </>
            )}
            {renderFooterLinks()}
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
      
      {renderPinModal()}
      {renderResultOverlay()}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFF0F5',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
    color: '#6B7280',
  },
  statusBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    gap: spacing.sm,
  },
  successBanner: {
    backgroundColor: '#10B981',
  },
  errorBanner: {
    backgroundColor: '#EA3B52',
  },
  statusText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
    flex: 1,
  },
  receiptButton: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 8,
  },
  receiptButtonText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  simpleHeader: {
    backgroundColor: '#FFF0F5', // Match app background
    paddingTop: spacing.lg,
    paddingBottom: spacing.lg,
    paddingHorizontal: spacing.lg,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.md,
    ...shadows.small,
  },
  headerContent: {
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#111827',
    textAlign: 'center',
    marginBottom: spacing.xs,
  },
  headerSubtitle: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: spacing.xl,
  },
  contentContainer: {
    paddingHorizontal: spacing.lg,
    alignItems: 'center',
    maxWidth: maxWidth,
    width: '100%',
    alignSelf: 'center',
  },
  amountPanel: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: spacing.xl,
    marginTop: spacing.lg,
    width: '100%',
    ...shadows.medium,
    alignItems: 'center',
  },
  amountLabel: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: spacing.xs,
  },
  amountValue: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#06402B',
    marginBottom: spacing.sm,
  },
  paymentNote: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
    marginBottom: spacing.lg,
  },
  tipSection: {
    width: '100%',
    alignItems: 'center',
  },
  tipLabel: {
    fontSize: 14,
    color: '#374151',
    marginBottom: spacing.sm,
  },
  tipSlider: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginBottom: spacing.sm,
  },
  tipOption: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#D1D5DB',
    backgroundColor: '#FFFFFF',
  },
  tipOptionSelected: {
    backgroundColor: '#06402B',
    borderColor: '#06402B',
  },
  tipOptionText: {
    fontSize: 12,
    color: '#374151',
    fontWeight: '500',
  },
  tipOptionTextSelected: {
    color: '#FFFFFF',
  },
  totalAmount: {
    fontSize: 16,
    fontWeight: '600',
    color: '#06402B',
  },
  payerInfoCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: spacing.xl,
    marginTop: spacing.lg,
    width: '100%',
    ...shadows.medium,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
    marginBottom: spacing.lg,
  },
  paymentMethodSubtitle: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: spacing.lg,
    textAlign: 'center',
  },
  methodGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: spacing.sm,
  },
  inputGroup: {
    marginBottom: spacing.lg,
  },
  inputLabel: {
    fontSize: 14,
    color: '#374151',
    marginBottom: spacing.xs,
    fontWeight: '500',
  },
  textInput: {
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 8,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    fontSize: 16,
    backgroundColor: '#FFFFFF',
    minHeight: 48,
  },
  paymentMethodCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: spacing.lg,
    marginTop: spacing.lg,
    width: '100%',
    ...shadows.medium,
  },
  methodOptionCompact: {
    width: '30%', // Three per row for better spacing
    alignItems: 'center',
    padding: spacing.lg,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#D1D5DB',
    backgroundColor: '#FFFFFF',
    minHeight: 100,
    justifyContent: 'center',
  },
  methodOptionSelected: {
    backgroundColor: '#06402B',
    borderColor: '#06402B',
  },
  methodOptionDisabled: {
    opacity: 0.5,
  },
  methodNameCompact: {
    fontSize: 14, // Increased from 12
    fontWeight: '600',
    color: '#111827',
    marginTop: spacing.sm, // Increased margin
    textAlign: 'center',
  },
  methodNameSelected: {
    color: '#FFFFFF',
  },
  methodNameDisabled: {
    color: '#9CA3AF',
  },
  methodDescriptionCompact: {
    fontSize: 11, // Increased from 10
    color: '#6B7280',
    marginTop: 4, // Increased margin
    textAlign: 'center',
  },
  methodDescriptionSelected: {
    color: 'rgba(255, 255, 255, 0.8)',
  },
  methodDescriptionDisabled: {
    color: '#9CA3AF',
  },
  securityBadges: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: spacing.lg,
    marginTop: spacing.lg,
    paddingVertical: spacing.md,
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  badgeText: {
    fontSize: 12,
    color: '#06402B',
    fontWeight: '500',
  },
  footerLinks: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: spacing.xl,
    paddingTop: spacing.lg,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    width: '100%',
  },
  footerLink: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  footerLinkText: {
    fontSize: 12,
    color: '#06402B',
    fontWeight: '500',
  },
  // Result Overlay Styles
  resultOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  resultContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: spacing.xxl,
    margin: spacing.xl,
    maxWidth: 320,
    width: '90%',
    alignItems: 'center',
  },
  processingContainer: {
    alignItems: 'center',
    paddingVertical: spacing.xl,
  },
  processingSpinner: {
    marginBottom: spacing.lg,
  },
  processingDots: {
    fontSize: 24,
    color: '#06402B',
    letterSpacing: 4,
  },
  processingText: {
    fontSize: 16,
    color: '#6B7280',
    fontWeight: '500',
  },
  resultContent: {
    alignItems: 'center',
    width: '100%',
  },
  resultIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.xl,
  },
  resultTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: spacing.sm,
    textAlign: 'center',
  },
  resultSubtitle: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
    marginBottom: spacing.xl,
    lineHeight: 24,
  },
  resultButtons: {
    width: '100%',
    gap: spacing.md,
  },
  doneButton: {
    backgroundColor: '#06402B',
    borderRadius: 12,
    paddingVertical: spacing.lg,
    alignItems: 'center',
  },
  doneButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  resultReceiptButton: {
    backgroundColor: '#F3F4F6',
    borderRadius: 12,
    paddingVertical: spacing.lg,
    alignItems: 'center',
  },
  resultReceiptButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#06402B',
  },
  retryButton: {
    backgroundColor: '#EA3B52',
    borderRadius: 12,
    paddingVertical: spacing.lg,
    paddingHorizontal: spacing.xl,
    alignItems: 'center',
  },
  retryButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
});

export default PayWithLinkScreen;
