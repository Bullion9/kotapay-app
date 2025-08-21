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
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import {
  ChevronLeft,
  Landmark,
  Phone,
  MapPin,
  Download,
  CheckCircle,
} from 'lucide-react-native';
import { RootStackParamList } from '../types';
import { colors, spacing, shadows, borderRadius, iconSizes, globalStyles } from '../theme';
import { EyeIcon } from '../components/icons';
import { useSettings } from '../contexts/SettingsContext';
import { 
  cashOutService, 
  CashOutMethod as PayoutMethod, 
  CashOutTransaction 
} from '../services/CashOutService';
import PinEntryModal from '../components/PinEntryModal';
import LoadingOverlay from '../components/LoadingOverlay';
import LoadingIcon from '../components/icons/LoadingIcon';
import { useLoading } from '../hooks/useLoading';
import { notificationService } from '../services/notifications';

type CashOutScreenNavigationProp = StackNavigationProp<RootStackParamList>;

interface LocalPayoutMethod extends PayoutMethod {
  icon: React.ComponentType<any>;
}

const CashOutScreen: React.FC = () => {
  const navigation = useNavigation<CashOutScreenNavigationProp>();
  const { formatCurrency } = useSettings();
  
  // Loading state management
  const {
    isLoading,
    loadingState,
    loadingMessage,
    startLoading,
    setProcessing,
    setConfirming,
    stopLoading,
  } = useLoading();
  
  // State management
  const [amount, setAmount] = useState('');
  const [selectedMethod, setSelectedMethod] = useState<LocalPayoutMethod | null>(null);
  const [showBalance, setShowBalance] = useState(false);
  const [showPinModal, setShowPinModal] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [transaction, setTransaction] = useState<CashOutTransaction | null>(null);
  const [isAmountFocused, setIsAmountFocused] = useState(false);
  
  // Mock user balance and tier limit
  const userBalance = 15000;
  const tierLimit = 50000; // Daily cash-out limit
  
  // Payout methods configuration
  const payoutMethods: LocalPayoutMethod[] = [
    {
      id: 'bank_transfer',
      name: 'Bank Transfer',
      icon: Landmark,
      fee: 50,
      processingTime: '1-2 business days',
      description: 'Direct transfer to your bank account',
      isAvailable: true,
      limits: {
        min: 100,
        max: 100000,
        daily: 50000,
      },
    },
    {
      id: 'mobile_money',
      name: 'Mobile Money',
      icon: Phone,
      fee: 25,
      processingTime: 'Instant',
      description: 'Transfer to your mobile money wallet',
      isAvailable: true,
      limits: {
        min: 50,
        max: 25000,
        daily: 25000,
      },
    },
    {
      id: 'agent_pickup',
      name: 'Agent Pickup',
      icon: MapPin,
      fee: 75,
      processingTime: '30 minutes',
      description: 'Collect cash from nearest agent location',
      isAvailable: true,
      limits: {
        min: 100,
        max: 10000,
        daily: 10000,
      },
    },
  ];

  // Calculate total amount including fees
  const calculateTotal = () => {
    const baseAmount = parseFloat(amount) || 0;
    const fee = selectedMethod?.fee || 0;
    return baseAmount + fee;
  };

  // Validate amount
  const validateAmount = () => {
    const numAmount = parseFloat(amount);
    if (!numAmount || numAmount <= 0) {
      Alert.alert('Invalid Amount', 'Please enter a valid amount');
      return false;
    }
    if (numAmount > userBalance) {
      Alert.alert('Insufficient Funds', 'Amount exceeds your available balance');
      return false;
    }
    if (numAmount > tierLimit) {
      Alert.alert('Limit Exceeded', `Daily cash-out limit is ₦${tierLimit.toLocaleString()}`);
      return false;
    }
    return true;
  };

  // Handle cash-out initiation
  const handleCashOut = () => {
    if (!validateAmount() || !selectedMethod) {
      Alert.alert('Error', 'Please select a payout method');
      return;
    }
    setShowPinModal(true);
  };

  // Handle PIN verification and transaction processing
  const handlePinVerified = async (enteredPin: string) => {
    setShowPinModal(false);

    try {
      let newTransaction: CashOutTransaction;
      
      // Manual loading control
      startLoading('Initializing cash out...');
      
      // Processing phase
      await new Promise<void>(resolve => setTimeout(resolve, 500));
      setProcessing('Processing withdrawal...');
      
      // Confirming phase
      await new Promise<void>(resolve => setTimeout(resolve, 800));
      setConfirming('Confirming transaction...');
      
      // Execute operation
      await new Promise<void>(resolve => setTimeout(resolve, 1000));
      
      // Process cash-out using the service
      newTransaction = await cashOutService.processCashOut(
        parseFloat(amount),
        selectedMethod?.id || '',
        {}, // Account details would be collected in a real implementation
        enteredPin
      );

      setTransaction(newTransaction);

      // Stop loading before success animation
      stopLoading();

      // After loading is complete, start success animation
      setShowSuccess(true);

      // Send push notification
      if (selectedMethod) {
        await notificationService.sendMoneySentNotification({
          transactionId: newTransaction.reference,
          amount: parseFloat(amount),
          currency: '₦',
          senderName: 'You',
          recipientName: selectedMethod.name,
          message: 'Cash-out initiated',
        });
      }
    } catch (err) {
      console.error('Transaction error:', err);
      Alert.alert('Error', 'Failed to process cash-out. Please try again.');
    }
  };

  // Download receipt
  const downloadReceipt = () => {
    Alert.alert('Receipt', 'Receipt download started');
  };

  // Reset to initial state
  const resetForm = () => {
    setAmount('');
    setSelectedMethod(null);
    setShowSuccess(false);
    setTransaction(null);
  };

  // Success Screen Component
  const SuccessScreen = () => (
    <View style={styles.successContainer}>
      <View style={styles.successIcon}>
        <CheckCircle size={40} color={colors.white} />
      </View>
      
      <Text style={styles.successTitle}>Cash-Out Initiated!</Text>
      <Text style={styles.successSubtitle}>
        Your cash-out request has been submitted successfully
      </Text>
      
      <View style={styles.transactionCard}>
        <View style={styles.transactionRow}>
          <Text style={styles.transactionLabel}>Amount</Text>
          <Text style={styles.transactionValue}>₦{transaction?.amount.toLocaleString()}</Text>
        </View>
        <View style={styles.transactionRow}>
          <Text style={styles.transactionLabel}>Fee</Text>
                        <Text style={styles.transactionValue}>{formatCurrency(transaction?.fee || 0)}</Text>
        </View>
        <View style={styles.transactionRow}>
          <Text style={styles.transactionLabel}>Method</Text>
          <Text style={styles.transactionValue}>{transaction?.method?.name}</Text>
        </View>
        <View style={styles.transactionRow}>
          <Text style={styles.transactionLabel}>Reference</Text>
          <Text style={styles.transactionValue}>{transaction?.reference}</Text>
        </View>
        <View style={styles.transactionRow}>
          <Text style={styles.transactionLabel}>Status</Text>
          <Text style={[styles.transactionValue, styles.pendingStatus]}>
            {transaction?.status.toUpperCase()}
          </Text>
        </View>
      </View>
      
      <TouchableOpacity style={styles.downloadButton} onPress={downloadReceipt}>
        <Download size={iconSizes.sm} color={colors.primary} />
        <Text style={styles.downloadText}>Download Receipt</Text>
      </TouchableOpacity>
      
      <TouchableOpacity style={styles.doneButton} onPress={resetForm}>
        <Text style={styles.doneButtonText}>Done</Text>
      </TouchableOpacity>
    </View>
  );

  // PIN Entry Modal Component (placeholder - would import actual PinEntryModal)
  const PinModal = () => (
    <PinEntryModal
      visible={showPinModal}
      onClose={() => setShowPinModal(false)}
      onPinEntered={handlePinVerified}
      title="Enter PIN"
      subtitle="Confirm your transaction PIN to proceed with cash-out"
      allowBiometric={true}
    />
  );

  if (showSuccess) {
    return (
      <SafeAreaView style={styles.container}>
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
          <Text style={styles.headerTitle}>Cash-Out</Text>
        </View>
        
        <View style={styles.headerRight} />
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>

        {/* Balance Card */}
        <View style={styles.balanceCard}>
          <View style={styles.balanceHeader}>
            <Text style={styles.balanceLabel}>Available Balance</Text>
            <TouchableOpacity onPress={() => setShowBalance(!showBalance)}>
              <EyeIcon 
                size={iconSizes.sm} 
                color={colors.white} 
                filled={!showBalance}
              />
            </TouchableOpacity>
          </View>
          <Text style={styles.balanceAmount}>
            {showBalance ? formatCurrency(userBalance) : '••••••'}
          </Text>
          <Text style={styles.balanceSubtext}>
            Daily limit: {formatCurrency(tierLimit)}
          </Text>
        </View>

        {/* Amount Input */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Enter Amount</Text>
          <View style={[styles.amountInputContainer, isAmountFocused && styles.amountInputContainerFocused]}>
            <Text style={styles.currencySymbol}>₦</Text>
            <TextInput
              style={styles.amountInput}
              value={amount}
              onChangeText={setAmount}
              placeholder="0.00"
              keyboardType="numeric"
              placeholderTextColor={colors.secondaryText}
              onFocus={() => setIsAmountFocused(true)}
              onBlur={() => setIsAmountFocused(false)}
            />
          </View>
          {amount && parseFloat(amount) > tierLimit && (
            <Text style={styles.warningText}>
              Amount exceeds daily limit of {formatCurrency(tierLimit)}
            </Text>
          )}
        </View>

        {/* Payout Methods */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Select Payout Method</Text>
          {payoutMethods.map((method) => (
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
                  color={selectedMethod?.id === method.id ? colors.primary : colors.secondaryText} 
                />
              </View>
              <View style={styles.methodInfo}>
                <Text style={styles.methodName}>{method.name}</Text>
                <Text style={styles.methodDescription}>{method.description}</Text>
                <Text style={styles.methodTime}>{method.processingTime}</Text>
              </View>
              <View style={styles.methodFee}>
                <Text style={styles.feeAmount}>{formatCurrency(method.fee)}</Text>
                <Text style={styles.feeLabel}>Fee</Text>
              </View>
            </TouchableOpacity>
          ))}
        </View>

        {/* Fee Preview */}
        {amount && selectedMethod && (
          <View style={styles.feePreview}>
            <Text style={styles.feePreviewTitle}>Transaction Summary</Text>
            <View style={styles.feeRow}>
              <Text style={styles.feeLabel}>Amount</Text>
              <Text style={styles.feeValue}>{formatCurrency(parseFloat(amount) || 0)}</Text>
            </View>
            <View style={styles.feeRow}>
              <Text style={styles.feeLabel}>Processing Fee</Text>
              <Text style={styles.feeValue}>{formatCurrency(selectedMethod.fee)}</Text>
            </View>
            <View style={[styles.feeRow, styles.totalRow]}>
              <Text style={styles.totalLabel}>Total</Text>
              <Text style={styles.totalValue}>{formatCurrency(calculateTotal())}</Text>
            </View>
          </View>
        )}
      </ScrollView>

      {/* Action Button */}
      <View style={styles.footer}>
        <TouchableOpacity
          style={[
            styles.cashOutButton,
            (!amount || !selectedMethod || isLoading) && styles.disabledButton,
          ]}
          onPress={handleCashOut}
          disabled={!amount || !selectedMethod || isLoading}
        >
          {isLoading ? (
            <LoadingIcon size={24} strokeWidth={3} />
          ) : (
            <Text style={styles.cashOutButtonText}>
              Cash-Out {amount ? formatCurrency(parseFloat(amount)) : formatCurrency(0)}
            </Text>
          )}
        </TouchableOpacity>
      </View>

      <PinModal />
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
  headerCenter: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerLeft: {
    width: 56, // Slightly larger to accommodate back button + padding
    alignItems: 'flex-start',
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
  amountInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.white,
    borderRadius: borderRadius.medium,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    ...shadows.small,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  amountInputContainerFocused: {
    borderColor: '#06402B',
    ...shadows.medium,
  },
  currencySymbol: {
    fontSize: 24,
    fontWeight: '600',
    color: colors.text,
    marginRight: spacing.sm,
  },
  amountInput: {
    flex: 1,
    fontSize: 24,
    fontWeight: '600',
    color: colors.text,
  },
  warningText: {
    fontSize: 12,
    color: colors.error,
    marginTop: spacing.xs,
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
    borderColor: colors.primary,
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
    color: colors.primary,
    fontWeight: '500',
  },
  methodFee: {
    alignItems: 'flex-end',
  },
  feeAmount: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
  },
  feeLabel: {
    fontSize: 12,
    color: colors.secondaryText,
  },
  feePreview: {
    backgroundColor: colors.white,
    borderRadius: borderRadius.medium,
    padding: spacing.lg,
    marginBottom: spacing.lg,
    ...shadows.small,
  },
  feePreviewTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginBottom: spacing.md,
  },
  feeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing.sm,
  },
  feeValue: {
    fontSize: 14,
    color: colors.text,
  },
  totalRow: {
    borderTopWidth: 1,
    borderTopColor: colors.border,
    paddingTop: spacing.sm,
    marginTop: spacing.sm,
  },
  totalLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
  },
  totalValue: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
  },
  footer: {
    padding: spacing.md,
    backgroundColor: 'transparent',
    borderTopWidth: 0,
  },
  cashOutButton: {
    backgroundColor: colors.primary,
    borderRadius: borderRadius.medium,
    paddingVertical: spacing.lg,
    alignItems: 'center',
  },
  disabledButton: {
    backgroundColor: colors.secondaryText,
  },
  cashOutButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.white,
  },
  // Success Screen Styles
  successContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.xl,
  },
  successIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: colors.success,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.lg,
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
  transactionCard: {
    backgroundColor: colors.white,
    borderRadius: borderRadius.large,
    padding: spacing.lg,
    width: '100%',
    marginBottom: spacing.lg,
    ...shadows.medium,
  },
  transactionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing.sm,
  },
  transactionLabel: {
    fontSize: 14,
    color: colors.secondaryText,
  },
  transactionValue: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
  },
  pendingStatus: {
    color: colors.warning,
  },
  downloadButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.card,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.medium,
    marginBottom: spacing.lg,
  },
  downloadText: {
    fontSize: 16,
    color: colors.primary,
    fontWeight: '600',
    marginLeft: spacing.sm,
  },
  doneButton: {
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.medium,
  },
  doneButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.white,
  },
});

export default CashOutScreen;
