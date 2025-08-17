import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  TextInput,
  ScrollView,
  Alert,
  ActivityIndicator,
  Animated,
} from 'react-native';
import {
  QrCode,
  Users,
  Check,
  X,
  Clock,
  ChevronRight,
  UserPlus,
  ChevronLeft,
} from 'lucide-react-native';
import { colors, spacing, borderRadius, shadows, typography, iconSizes, globalStyles } from '../theme';
import { EyeIcon } from '../components/icons';
import PinEntryModal from '../components/PinEntryModal';
import { notificationService } from '../services/notifications';

interface Contact {
  id: string;
  name: string;
  phone: string;
  email?: string;
  avatar?: string;
  isRegistered: boolean;
}

interface SendMoneyScreenProps {
  navigation: any;
  route: any;
}

type Step = 'amount' | 'contact' | 'confirm' | 'result';
type TransactionStatus = 'success' | 'failed' | 'pending';

const SendMoneyScreen: React.FC<SendMoneyScreenProps> = ({ navigation, route }) => {
  const [currentStep, setCurrentStep] = useState<Step>('amount');
  const [amount, setAmount] = useState('');
  const [selectedContact, setSelectedContact] = useState<Contact | null>(null);
  const [showPinModal, setShowPinModal] = useState(false);
  const [transactionStatus, setTransactionStatus] = useState<TransactionStatus>('pending');
  const [isProcessing, setIsProcessing] = useState(false);
  const [description, setDescription] = useState('');
  const [showSuccess, setShowSuccess] = useState(false);
  const [notificationSent, setNotificationSent] = useState(false);
  const [showManualEntry, setShowManualEntry] = useState(false);
  const [manualName, setManualName] = useState('');
  const [manualPhone, setManualPhone] = useState('');
  const [manualEmail, setManualEmail] = useState('');
  const [showBalance, setShowBalance] = useState(false);
  const [isAmountFocused, setIsAmountFocused] = useState(false);
  const [isDescriptionFocused, setIsDescriptionFocused] = useState(false);

  // Mock user balance (same as TopUpScreen)
  const userBalance = 450000;

  const animationValue = useRef(new Animated.Value(0)).current;

  // Handle QR scan results
  useEffect(() => {
    if (route.params?.scannedData) {
      const scannedData = route.params.scannedData;
      
      // Parse QR data and set contact/amount
      try {
        const qrData = JSON.parse(scannedData);
        
        if (qrData.userId) {
          // Create a contact from scanned user data
          const scannedContact: Contact = {
            id: qrData.userId,
            name: qrData.name || 'Unknown User',
            phone: qrData.phone || 'Unknown',
            email: qrData.email,
            isRegistered: true,
          };
          setSelectedContact(scannedContact);
        }
        
        if (qrData.amount) {
          setAmount(qrData.amount.toString());
        }
        
        // Move to contact step if we got user data, or stay on amount step
        if (qrData.userId && currentStep === 'contact') {
          setCurrentStep('confirm');
        } else if (qrData.userId) {
          setCurrentStep('contact');
        }
        
      } catch (error) {
        // If not JSON, treat as plain text (maybe a phone number)
        console.log('QR scan result:', scannedData);
        console.error('Error parsing QR data:', error);
        Alert.alert('QR Code Scanned', `Scanned: ${scannedData}`);
      }
      
      // Clear the scanned data from route params
      navigation.setParams({ scannedData: undefined });
    }
  }, [route.params?.scannedData, currentStep, navigation]);

  // Reset transaction state
  const resetTransactionState = () => {
    setShowSuccess(false);
    setNotificationSent(false);
    setTransactionStatus('pending');
    setIsProcessing(false);
    animationValue.setValue(0);
  };

  const handleQRScan = () => {
    navigation.navigate('QRScanner');
  };

  const handleManualEntry = () => {
    setShowManualEntry(true);
  };

  const handleManualContactAdd = () => {
    if (!manualName.trim() || !manualPhone.trim()) {
      Alert.alert('Error', 'Please enter at least name and phone number');
      return;
    }

    const newContact: Contact = {
      id: Date.now().toString(),
      name: manualName.trim(),
      phone: manualPhone.trim(),
      email: manualEmail.trim() || undefined,
      isRegistered: false,
    };

    setSelectedContact(newContact);
    setShowManualEntry(false);
    // Clear manual entry fields
    setManualName('');
    setManualPhone('');
    setManualEmail('');
  };

  const handleCancelManualEntry = () => {
    setShowManualEntry(false);
    setManualName('');
    setManualPhone('');
    setManualEmail('');
  };

  // Mock contacts data
  const contacts: Contact[] = [
    {
      id: '1',
      name: 'John Doe',
      phone: '+1234567890',
      email: 'john@example.com',
      isRegistered: true,
    },
    {
      id: '2',
      name: 'Jane Smith',
      phone: '+1234567891',
      email: 'jane@example.com',
      isRegistered: true,
    },
    {
      id: '3',
      name: 'Bob Wilson',
      phone: '+1234567892',
      isRegistered: false,
    },
  ];

  const stepTitles = {
    amount: 'Enter Amount',
    contact: 'Select Recipient', 
    confirm: 'Confirm Details',
    result: 'Transaction Status',
  };

  const handleNext = () => {
    switch (currentStep) {
      case 'amount':
        if (!amount || parseFloat(amount) <= 0) {
          Alert.alert('Error', 'Please enter a valid amount');
          return;
        }
        if (parseFloat(amount) > userBalance) {
          Alert.alert('Insufficient Balance', `You can only send up to ₦${userBalance.toLocaleString()} from your current balance.`);
          return;
        }
        setCurrentStep('contact');
        break;
      case 'contact':
        if (!selectedContact) {
          Alert.alert('Error', 'Please select a recipient');
          return;
        }
        setCurrentStep('confirm');
        break;
      case 'confirm':
        resetTransactionState(); // Reset before starting new transaction
        setShowPinModal(true);
        break;
    }
  };

  const handleBack = () => {
    switch (currentStep) {
      case 'amount':
        navigation.goBack();
        break;
      case 'contact':
        setCurrentStep('amount');
        break;
      case 'confirm':
        setCurrentStep('contact');
        break;
      case 'result':
        resetTransactionState(); // Reset when going back from result
        navigation.goBack();
        break;
    }
  };

  // Handle PIN verification and transaction processing
  const handlePinVerified = async (enteredPin: string) => {
    setShowPinModal(false);
    setIsProcessing(true);
    setCurrentStep('result');

    try {
      // Simulate transaction processing
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Always successful (like TopUp/CashOut) to prevent glitching
      // For testing failures, change this to: Math.random() > 0.8 ? 'success' : 'failed'
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
      
      // Send notification only once
      if (selectedContact && !notificationSent) {
        setNotificationSent(true);
        notificationService.sendMoneySentNotification({
          transactionId: `tx_${Date.now()}`,
          amount: parseFloat(amount),
          currency: '₦',
          senderName: 'You',
          recipientName: selectedContact.name,
        }).catch(error => {
          console.error('Failed to send notification:', error);
        });
      }
      
    } catch (error) {
      console.error('Transaction error:', error);
      setTransactionStatus('failed');
      setIsProcessing(false);
    }
  };

  const renderStepIndicator = () => {
    const steps = ['amount', 'contact', 'confirm', 'result'];
    const currentIndex = steps.indexOf(currentStep);

    return (
      <View style={styles.stepIndicator}>
        {steps.map((step, index) => (
          <View key={step} style={styles.stepContainer}>
            <View
              style={[
                styles.stepCircle,
                index <= currentIndex && styles.stepCircleActive,
              ]}
            >
              <Text
                style={[
                  styles.stepNumber,
                  index <= currentIndex && styles.stepNumberActive,
                ]}
              >
                {index + 1}
              </Text>
            </View>
            {index < steps.length - 1 && (
              <View
                style={[
                  styles.stepLine,
                  index < currentIndex && styles.stepLineActive,
                ]}
              />
            )}
          </View>
        ))}
      </View>
    );
  };

  const renderAmountStep = () => (
    <View style={styles.stepContent}>
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
        <TouchableOpacity 
          onPress={() => {
            if (showBalance && userBalance > 0) {
              setAmount(userBalance.toString());
            }
          }}
          disabled={!showBalance}
        >
          <Text style={styles.balanceAmount}>
            {showBalance ? `₦${userBalance.toLocaleString()}` : '••••••'}
          </Text>
        </TouchableOpacity>
        <Text style={styles.balanceSubtext}>
          Available for spending{showBalance ? ' • Tap amount to use full balance' : ''}
        </Text>
      </View>

      <View style={styles.amountContainer}>
        <Text style={styles.inputLabel}>Amount</Text>
        <View style={[styles.currencyContainer, isAmountFocused && styles.currencyContainerFocused]}>
          <Text style={styles.nairaSign}>₦</Text>
          <TextInput
            style={styles.amountInput}
            value={amount}
            onChangeText={setAmount}
            placeholder="0.00"
            placeholderTextColor={colors.placeholder}
            keyboardType="numeric"
            autoFocus
            onFocus={() => setIsAmountFocused(true)}
            onBlur={() => setIsAmountFocused(false)}
          />
        </View>
      </View>
      
      <View style={styles.descriptionContainer}>
        <Text style={styles.inputLabel}>For</Text>
        <TextInput
          style={[styles.descriptionInput, isDescriptionFocused && styles.descriptionInputFocused]}
          value={description}
          onChangeText={setDescription}
          placeholder="What's this for?"
          placeholderTextColor={colors.placeholder}
          multiline
          onFocus={() => setIsDescriptionFocused(true)}
          onBlur={() => setIsDescriptionFocused(false)}
        />
      </View>

      <View style={styles.quickAmountsContainer}>
        <Text style={styles.quickAmountsLabel}>Top Up</Text>
        <View style={styles.quickAmounts}>
          {[100, 500, 1000, 5000].map((quickAmount) => (
            <TouchableOpacity
              key={quickAmount}
              style={styles.quickAmountButton}
              onPress={() => setAmount(quickAmount.toString())}
            >
              <Text style={styles.quickAmountText}>₦{quickAmount.toLocaleString()}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <View style={styles.infoCard}>
        <Text style={styles.infoTitle}>Send Money</Text>
        <Text style={styles.infoText}>
          Send money instantly to friends and family. They&apos;ll receive a notification and the money immediately.
        </Text>
      </View>

      <View style={styles.suggestionsContainer}>
        <Text style={styles.suggestionsLabel}>or pick any of the options below</Text>
        <View style={styles.suggestionsGrid}>
          {[
            'Coffee',
            'Lunch',
            'Gas',
            'Groceries',
            'Dinner',
            'Movie',
          ].map((suggestion) => (
            <TouchableOpacity
              key={suggestion}
              style={styles.suggestionCard}
              onPress={() => {
                setDescription(suggestion);
              }}
            >
              <Text style={styles.suggestionCardText}>{suggestion}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>
    </View>
  );

  const renderContactStep = () => (
    <View style={styles.stepContent}>
      {!showManualEntry ? (
        <>
          <View style={styles.contactOptions}>
            <TouchableOpacity
              style={styles.optionButton}
              onPress={handleQRScan}
            >
              <QrCode size={iconSizes.lg} color={colors.primary} />
              <Text style={styles.optionText}>Scan QR Code</Text>
              <ChevronRight size={iconSizes.sm} color={colors.secondaryText} />
            </TouchableOpacity>
            
            <TouchableOpacity
              style={styles.optionButton}
              onPress={handleManualEntry}
            >
              <UserPlus size={iconSizes.lg} color={colors.primary} />
              <Text style={styles.optionText}>Add New Contact</Text>
              <ChevronRight size={iconSizes.sm} color={colors.secondaryText} />
            </TouchableOpacity>
          </View>

          <Text style={styles.sectionTitle}>Recent Contacts</Text>
          <ScrollView style={styles.contactsList}>
            {contacts.map((contact) => (
              <TouchableOpacity
                key={contact.id}
                style={[
                  styles.contactItem,
                  selectedContact?.id === contact.id && styles.contactItemSelected,
                ]}
                onPress={() => setSelectedContact(contact)}
              >
                <View style={styles.contactAvatar}>
                  <Users size={iconSizes.md} color={colors.white} />
                </View>
                <View style={styles.contactInfo}>
                  <Text style={styles.contactName}>{contact.name}</Text>
                  <Text style={styles.contactPhone}>{contact.phone}</Text>
                </View>
                <View style={styles.contactStatus}>
                  {contact.isRegistered && (
                    <View style={styles.registeredBadge}>
                      <Check size={iconSizes.xs} color={colors.white} />
                    </View>
                  )}
                </View>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </>
      ) : (
        <View style={styles.manualEntryContainer}>
          <Text style={styles.manualEntryTitle}>Add New Contact</Text>
          
          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>Full Name *</Text>
            <TextInput
              style={styles.input}
              value={manualName}
              onChangeText={setManualName}
              placeholder="Enter full name"
              placeholderTextColor={colors.placeholder}
            />
          </View>
          
          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>Phone Number *</Text>
            <TextInput
              style={styles.input}
              value={manualPhone}
              onChangeText={setManualPhone}
              placeholder="+1234567890"
              placeholderTextColor={colors.placeholder}
              keyboardType="phone-pad"
            />
          </View>
          
          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>Email (Optional)</Text>
            <TextInput
              style={styles.input}
              value={manualEmail}
              onChangeText={setManualEmail}
              placeholder="email@example.com"
              placeholderTextColor={colors.placeholder}
              keyboardType="email-address"
              autoCapitalize="none"
            />
          </View>
          
          <View style={styles.manualEntryButtons}>
            <TouchableOpacity
              style={styles.cancelButton}
              onPress={handleCancelManualEntry}
            >
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={styles.addButton}
              onPress={handleManualContactAdd}
            >
              <Text style={styles.addButtonText}>Add Contact</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
    </View>
  );

  const renderConfirmStep = () => (
    <View style={styles.stepContent}>
      <View style={styles.confirmCard}>
        <Text style={styles.confirmTitle}>Transaction Details</Text>
        
        <View style={styles.confirmRow}>
          <Text style={styles.confirmLabel}>Amount</Text>
          <Text style={styles.confirmValue}>₦{amount}</Text>
        </View>
        
        <View style={styles.confirmRow}>
          <Text style={styles.confirmLabel}>To</Text>
          <Text style={styles.confirmValue}>{selectedContact?.name}</Text>
        </View>
        
        <View style={styles.confirmRow}>
          <Text style={styles.confirmLabel}>Phone</Text>
          <Text style={styles.confirmValue}>{selectedContact?.phone}</Text>
        </View>
        
        {description && (
          <View style={styles.confirmRow}>
            <Text style={styles.confirmLabel}>Description</Text>
            <Text style={styles.confirmValue}>{description}</Text>
          </View>
        )}
        
        <View style={styles.confirmRow}>
          <Text style={styles.confirmLabel}>Fee</Text>
          <Text style={styles.confirmValue}>₦0.00</Text>
        </View>
        
        <View style={[styles.confirmRow, styles.confirmTotal]}>
          <Text style={styles.confirmTotalLabel}>Total</Text>
          <Text style={styles.confirmTotalValue}>₦{amount}</Text>
        </View>
      </View>
    </View>
  );

  const renderResultStep = () => {
    const statusConfig = {
      success: {
        icon: Check,
        color: colors.success,
        title: 'Transaction Successful!',
        subtitle: `₦${amount} sent to ${selectedContact?.name}`,
      },
      failed: {
        icon: X,
        color: colors.error,
        title: 'Transaction Failed',
        subtitle: 'Please try again or contact support',
      },
      pending: {
        icon: Clock,
        color: colors.warning,
        title: 'Transaction Pending',
        subtitle: 'Your transaction is being processed',
      },
    };

    const config = statusConfig[transactionStatus];
    const IconComponent = config.icon;

    return (
      <View style={styles.stepContent}>
        {isProcessing ? (
          <View style={styles.processingContainer}>
            <ActivityIndicator size="large" color={colors.primary} />
            <Text style={styles.processingText}>Processing transaction...</Text>
          </View>
        ) : (
          <Animated.View
            style={[
              styles.resultContainer,
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
              <IconComponent size={iconSizes.xxl} color={colors.white} />
            </View>
            <Text style={styles.resultTitle}>{config.title}</Text>
            <Text style={styles.resultSubtitle}>{config.subtitle}</Text>
            
            {transactionStatus === 'success' && (
              <TouchableOpacity
                style={styles.doneButton}
                onPress={() => navigation.navigate('MainTabs')}
              >
                <Text style={styles.doneButtonText}>Done</Text>
              </TouchableOpacity>
            )}
            
            {transactionStatus === 'failed' && (
              <TouchableOpacity
                style={styles.retryButton}
                onPress={() => {
                  resetTransactionState();
                  setShowPinModal(true);
                }}
              >
                <Text style={styles.retryButtonText}>Try Again</Text>
              </TouchableOpacity>
            )}
          </Animated.View>
        )}
      </View>
    );
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 'amount':
        return renderAmountStep();
      case 'contact':
        return renderContactStep();
      case 'confirm':
        return renderConfirmStep();
      case 'result':
        return renderResultStep();
      default:
        return null;
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={globalStyles.backButton} onPress={handleBack}>
          <ChevronLeft size={iconSizes.md} color={colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{stepTitles[currentStep]}</Text>
        <View style={styles.headerSpacer} />
      </View>

      {renderStepIndicator()}
      
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {renderStepContent()}
      </ScrollView>

      {currentStep !== 'result' && (
        <View style={styles.footer}>
          <TouchableOpacity
            style={[
              styles.nextButton,
              (!amount && currentStep === 'amount') ||
              (!selectedContact && currentStep === 'contact') ||
              (currentStep === 'amount' && amount && parseFloat(amount) > userBalance)
                ? styles.nextButtonDisabled
                : {},
            ]}
            onPress={handleNext}
            disabled={
              (!amount && currentStep === 'amount') ||
              (!selectedContact && currentStep === 'contact') ||
              (currentStep === 'amount' && amount && parseFloat(amount) > userBalance)
            }
          >
            <Text style={styles.nextButtonText}>
              {currentStep === 'amount' && amount && parseFloat(amount) > userBalance
                ? 'Insufficient Balance'
                : 'Continue'}
            </Text>
          </TouchableOpacity>
        </View>
      )}

      {/* PIN Entry Modal */}
      <PinEntryModal
        visible={showPinModal}
        onClose={() => setShowPinModal(false)}
        onPinEntered={handlePinVerified}
        title="Enter PIN to Send Money"
        subtitle={`Send ₦${parseFloat(amount || '0').toLocaleString()} to ${selectedContact?.name}`}
        allowBiometric={true}
      />
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
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.md,
    paddingTop: spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    backgroundColor: '#FFF0F5',
  },
  headerTitle: {
    ...typography.h3,
    color: colors.text,
  },
  headerSpacer: {
    width: 40,
  },
  stepIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.lg,
    paddingHorizontal: spacing.xl,
  },
  stepContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  stepCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.disabled,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepCircleActive: {
    backgroundColor: colors.primary,
  },
  stepNumber: {
    ...typography.caption,
    color: colors.secondaryText,
  },
  stepNumberActive: {
    color: colors.white,
  },
  stepLine: {
    width: 24,
    height: 2,
    backgroundColor: colors.disabled,
    marginHorizontal: spacing.xs,
  },
  stepLineActive: {
    backgroundColor: colors.primary,
  },
  content: {
    flex: 1,
  },
  stepContent: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.lg,
  },
  // Balance Card Styles
  balanceCard: {
    marginHorizontal: 0,
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
  // Amount Step Styles
  amountContainer: {
    marginBottom: spacing.sm,
  },
  currencyContainer: {
    flexDirection: 'row',
    alignItems: 'baseline',
    backgroundColor: colors.white,
    borderRadius: borderRadius.medium,
    padding: spacing.md,
    ...shadows.small,
    minHeight: 60,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  currencyContainerFocused: {
    borderColor: '#06402B',
    ...shadows.medium,
  },
  nairaSign: {
    ...typography.h2,
    color: '#06402B',
    includeFontPadding: false,
    marginTop: 4,
  },
  amountInput: {
    ...typography.h2,
    color: colors.text,
    marginLeft: spacing.sm,
    flex: 1,
    textAlign: 'left',
    includeFontPadding: false,
    paddingVertical: 0,
    textAlignVertical: 'center',
  },
  descriptionContainer: {
    marginBottom: spacing.sm,
  },
  inputLabel: {
    ...typography.body,
    color: colors.text,
    marginBottom: spacing.sm,
  },
  descriptionInput: {
    backgroundColor: colors.white,
    borderRadius: borderRadius.medium,
    padding: spacing.lg,
    ...typography.body,
    color: colors.text,
    minHeight: 80,
    textAlignVertical: 'top',
    ...shadows.small,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  descriptionInputFocused: {
    borderColor: '#06402B',
    ...shadows.medium,
  },
  quickAmounts: {
    flexDirection: 'row',
    gap: spacing.sm,
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  quickAmountsContainer: {
    marginBottom: spacing.sm,
  },
  quickAmountsLabel: {
    ...typography.body,
    color: colors.text,
    marginBottom: spacing.sm,
  },
  quickAmountButton: {
    backgroundColor: colors.white,
    borderRadius: borderRadius.medium,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.sm,
    ...shadows.small,
    flex: 1,
    minWidth: 80,
    maxWidth: 100,
    alignItems: 'center',
  },
  quickAmountText: {
    ...typography.body,
    color: colors.primary,
  },
  // Suggestions Styles
  suggestionsContainer: {
    marginBottom: spacing.sm,
  },
  suggestionsLabel: {
    ...typography.body,
    color: colors.text,
    marginBottom: spacing.sm,
  },
  suggestions: {
    flexDirection: 'row',
    gap: spacing.sm,
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  suggestionButton: {
    backgroundColor: colors.white,
    borderRadius: borderRadius.medium,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.md,
    ...shadows.small,
    alignItems: 'center',
    flex: 1,
    minWidth: 70,
    maxWidth: 100,
  },
  suggestionText: {
    ...typography.caption,
    color: colors.text,
    textAlign: 'center',
  },
  // Grid suggestions styles
  suggestionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  suggestionCard: {
    backgroundColor: colors.white,
    borderRadius: borderRadius.medium,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.sm,
    ...shadows.small,
    alignItems: 'center',
    justifyContent: 'center',
    width: '48%',
    minHeight: 50,
  },
  suggestionCardText: {
    ...typography.body,
    color: colors.text,
    textAlign: 'center',
  },
  // Info Card Styles
  infoCard: {
    backgroundColor: colors.accent,
    borderRadius: borderRadius.medium,
    padding: spacing.md,
    marginBottom: spacing.sm,
  },
  infoTitle: {
    ...typography.body,
    color: colors.primary,
    marginBottom: spacing.sm,
  },
  infoText: {
    ...typography.caption,
    color: colors.text,
    lineHeight: 18,
  },
  // Contact Step Styles
  contactOptions: {
    marginBottom: spacing.md,
  },
  optionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.white,
    borderRadius: borderRadius.medium,
    padding: spacing.lg,
    ...shadows.small,
  },
  optionText: {
    ...typography.body,
    color: colors.text,
    flex: 1,
    marginLeft: spacing.lg,
  },
  sectionTitle: {
    ...typography.h3,
    color: colors.text,
    marginBottom: spacing.lg,
  },
  contactsList: {
    maxHeight: 300,
  },
  contactItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.white,
    borderRadius: borderRadius.medium,
    padding: spacing.lg,
    marginBottom: spacing.sm,
    ...shadows.small,
  },
  contactItemSelected: {
    borderWidth: 2,
    borderColor: colors.primary,
  },
  contactAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.lg,
  },
  contactInfo: {
    flex: 1,
  },
  contactName: {
    ...typography.body,
    color: colors.text,
    marginBottom: 2,
  },
  contactPhone: {
    ...typography.caption,
    color: colors.secondaryText,
  },
  contactStatus: {
    alignItems: 'center',
  },
  registeredBadge: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: colors.success,
    alignItems: 'center',
    justifyContent: 'center',
  },
  // Manual Entry Styles
  manualEntryContainer: {
    backgroundColor: colors.white,
    borderRadius: borderRadius.large,
    padding: spacing.xl,
    ...shadows.medium,
  },
  manualEntryTitle: {
    ...typography.h3,
    color: colors.text,
    marginBottom: spacing.xl,
    textAlign: 'center',
  },
  inputContainer: {
    marginBottom: spacing.lg,
  },
  input: {
    backgroundColor: colors.background,
    borderRadius: borderRadius.medium,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    ...typography.body,
    color: colors.text,
    borderWidth: 1,
    borderColor: colors.border,
  },
  manualEntryButtons: {
    flexDirection: 'row',
    gap: spacing.md,
    marginTop: spacing.lg,
  },
  cancelButton: {
    flex: 1,
    backgroundColor: colors.background,
    borderRadius: borderRadius.medium,
    paddingVertical: spacing.md,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
  },
  cancelButtonText: {
    ...typography.body,
    color: colors.secondaryText,
  },
  addButton: {
    flex: 1,
    backgroundColor: colors.primary,
    borderRadius: borderRadius.medium,
    paddingVertical: spacing.md,
    alignItems: 'center',
  },
  addButtonText: {
    ...typography.body,
    color: colors.white,
  },
  // Confirm Step Styles
  confirmCard: {
    backgroundColor: colors.white,
    borderRadius: borderRadius.large,
    padding: spacing.xl,
    ...shadows.medium,
  },
  confirmTitle: {
    ...typography.h3,
    color: colors.text,
    marginBottom: spacing.xl,
    textAlign: 'center',
  },
  confirmRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  confirmLabel: {
    ...typography.body,
    color: colors.secondaryText,
  },
  confirmValue: {
    ...typography.body,
    color: colors.text,
  },
  confirmTotal: {
    borderBottomWidth: 0,
    paddingTop: spacing.lg,
    borderTopWidth: 2,
    borderTopColor: colors.primary,
  },
  confirmTotalLabel: {
    ...typography.h3,
    color: colors.text,
  },
  confirmTotalValue: {
    ...typography.h3,
    color: colors.primary,
  },
  // Result Step Styles
  processingContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.xxxl,
  },
  processingText: {
    ...typography.body,
    color: colors.text,
    marginTop: spacing.lg,
  },
  resultContainer: {
    alignItems: 'center',
    paddingVertical: spacing.xxxl,
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
    ...typography.h2,
    color: colors.text,
    marginBottom: spacing.sm,
    textAlign: 'center',
  },
  resultSubtitle: {
    ...typography.body,
    color: colors.secondaryText,
    textAlign: 'center',
    marginBottom: spacing.xl,
  },
  doneButton: {
    backgroundColor: colors.primary,
    borderRadius: borderRadius.medium,
    paddingVertical: spacing.lg,
    paddingHorizontal: spacing.xxl,
    ...shadows.small,
  },
  doneButtonText: {
    ...typography.body,
    color: colors.white,
  },
  retryButton: {
    backgroundColor: colors.error,
    borderRadius: borderRadius.medium,
    paddingVertical: spacing.lg,
    paddingHorizontal: spacing.xxl,
    ...shadows.small,
  },
  retryButtonText: {
    ...typography.body,
    color: colors.white,
  },
  // Footer Styles
  footer: {
    padding: spacing.xl,
  },
  nextButton: {
    backgroundColor: colors.primary,
    borderRadius: borderRadius.medium,
    paddingVertical: spacing.lg,
    alignItems: 'center',
  },
  nextButtonDisabled: {
    backgroundColor: colors.disabled,
    opacity: 0.6,
  },
  nextButtonText: {
    ...typography.body,
    color: colors.white,
  },
});

export default SendMoneyScreen;
