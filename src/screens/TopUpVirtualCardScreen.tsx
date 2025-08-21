import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  Animated,
  ActivityIndicator,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import {
  ChevronLeft,
  Landmark,
  Banknote,
  CheckCircle,
  Info,
} from 'lucide-react-native';
import { colors, spacing, borderRadius, shadows, globalStyles } from '../theme';
import PinEntryModal from '../components/PinEntryModal';
import LoadingOverlay from '../components/LoadingOverlay';
import LoadingSpinner from '../components/LoadingSpinner';
import { useLoading } from '../hooks/useLoading';

type RootStackParamList = {
  VirtualCardDetailScreen: { cardId: string };
};

type NavigationProp = StackNavigationProp<RootStackParamList>;

interface FundingSource {
  id: string;
  type: 'wallet' | 'bank';
  name: string;
  balance?: number;
  accountNumber?: string;
  icon: React.ComponentType<any>;
}

interface FeePreview {
  amount: number;
  fee: number;
  total: number;
  processingTime: string;
}

interface VirtualCard {
  id: string;
  nickname: string;
  balance: number;
  spendLimit: number;
}

const TopUpVirtualCardScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProp>();
  const route = useRoute();
  const { cardId } = route.params as { cardId: string };
  
  // States
  const [amount, setAmount] = useState('');
  const [selectedSource, setSelectedSource] = useState<FundingSource | null>(null);
  const [feePreview, setFeePreview] = useState<FeePreview | null>(null);
  const [loadingFees, setLoadingFees] = useState(false);
  const [showPinModal, setShowPinModal] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [quickAmountLoading, setQuickAmountLoading] = useState(false);
  
  // Loading state management
  const {
    isLoading,
    loadingState,
    loadingMessage,
    startLoading,
    setProcessing,
    setConfirming,
    setError,
    stopLoading,
  } = useLoading();
  
  // Focus states
  const [isAmountFocused, setIsAmountFocused] = useState(false);
  
  // Refs
  const amountInputRef = useRef<TextInput>(null);
  
  // Animation
  const successScale = useRef(new Animated.Value(0)).current;
  const successOpacity = useRef(new Animated.Value(0)).current;
  
  // Mock card data (would come from API/context)
  const [cardData] = useState<VirtualCard>({
    id: cardId,
    nickname: 'Shopping Card',
    balance: 25000,
    spendLimit: 50000,
  });
  
  // Available funding sources
  const fundingSources: FundingSource[] = [
    {
      id: 'main-wallet',
      type: 'wallet',
      name: 'Main Wallet',
      balance: 150000,
      icon: Landmark,
    },
    {
      id: 'gtbank',
      type: 'bank',
      name: 'GTBank ****1234',
      accountNumber: '0123456789',
      icon: Banknote,
    },
    {
      id: 'access-bank',
      type: 'bank',
      name: 'Access Bank ****5678',
      accountNumber: '0987654321',
      icon: Banknote,
    },
  ];
  
  // Quick amount suggestions
  const quickAmounts = [5000, 10000, 20000, 50000];
  
  const remainingLimit = cardData.spendLimit - cardData.balance;
  
  // Calculate fees using mock API function
  const calculateFees = async (topUpAmount: number, source: FundingSource) => {
    setLoadingFees(true);
    
    try {
      // Mock API call to server function
      await new Promise<void>(resolve => setTimeout(resolve, 1000));
      
      // Mock fee calculation
      let fee = 0;
      if (source.type === 'bank') {
        fee = Math.max(100, topUpAmount * 0.015); // 1.5% or ₦100 minimum for bank transfers
      } else {
        fee = 0; // No fee for wallet transfers
      }
      
      const total = topUpAmount + fee;
      const processingTime = source.type === 'bank' ? '5-10 minutes' : 'Instant';
      
      setFeePreview({
        amount: topUpAmount,
        fee,
        total,
        processingTime,
      });
    } catch (error) {
      console.error('Fee calculation failed:', error);
      Alert.alert('Error', 'Failed to calculate fees. Please try again.');
    } finally {
      setLoadingFees(false);
    }
  };
  
  // Handle amount change
  const handleAmountChange = (text: string) => {
    const numericValue = text.replace(/[^0-9]/g, '');
    const amount = parseInt(numericValue) || 0;
    
    if (amount <= remainingLimit) {
      setAmount(numericValue);
      setFeePreview(null);
      
      // Auto-calculate fees if source is selected
      if (selectedSource && amount > 0) {
        calculateFees(amount, selectedSource);
      }
    } else {
      Alert.alert(
        'Amount Exceeds Limit',
        `Maximum top-up amount is ₦${remainingLimit.toLocaleString()}`
      );
    }
  };
  
  // Handle quick amount selection with silent loading animation
  const handleQuickAmount = async (quickAmount: number) => {
    if (quickAmount > remainingLimit) {
      Alert.alert(
        'Amount Exceeds Limit',
        `Maximum top-up amount is ₦${remainingLimit.toLocaleString()}`
      );
      return;
    }

    setQuickAmountLoading(true);
    
    // Simulate processing time for amount selection
    await new Promise<void>(resolve => setTimeout(resolve, 400));
    
    // Set the amount after loading
    setAmount(quickAmount.toString());
    setFeePreview(null);
    
    if (selectedSource) {
      calculateFees(quickAmount, selectedSource);
    }
    
    setQuickAmountLoading(false);
  };
  
  // Handle source selection
  const handleSourceSelection = (source: FundingSource) => {
    setSelectedSource(source);
    setFeePreview(null);
    
    const topUpAmount = parseInt(amount) || 0;
    if (topUpAmount > 0) {
      calculateFees(topUpAmount, source);
    }
  };
  
  // Validate form
  const validateForm = () => {
    const topUpAmount = parseInt(amount) || 0;
    
    if (topUpAmount === 0) {
      Alert.alert('Invalid Amount', 'Please enter a valid amount');
      return false;
    }
    
    if (!selectedSource) {
      Alert.alert('Select Source', 'Please select a funding source');
      return false;
    }
    
    if (selectedSource.type === 'wallet' && selectedSource.balance && topUpAmount > selectedSource.balance) {
      Alert.alert('Insufficient Balance', 'Your wallet balance is insufficient');
      return false;
    }
    
    return true;
  };
  
  // Handle top-up confirmation
  const handleTopUp = () => {
    if (!validateForm()) return;
    setShowPinModal(true);
  };
  
  // Handle PIN verification
  const handlePinVerified = async () => {
    setShowPinModal(false);
    
    try {
      const topUpAmount = parseInt(amount);
      
      // Manual loading sequence that ends before confirmation animation
      startLoading('Processing top-up...');
      
      // Processing phase
      await new Promise<void>(resolve => setTimeout(resolve, 500));
      setProcessing('Adding funds to card...');
      
      // Confirming phase  
      await new Promise<void>(resolve => setTimeout(resolve, 800));
      setConfirming('Confirming transaction...');
      
      // Mock API call
      await new Promise<void>(resolve => setTimeout(resolve, 1000));
      
      // Stop loading completely before showing confirmation animation
      stopLoading();
      
      // Small delay to ensure loading overlay disappears
      await new Promise<void>(resolve => setTimeout(resolve, 200));
      
      // Now show separate success animation
      showSuccessAnimation();
      
      // Mock push notification
      await sendTopUpNotification(topUpAmount);
      
      // Auto dismiss and navigate back
      setTimeout(() => {
        setShowSuccess(false);
        navigation.navigate('VirtualCardDetailScreen', { cardId });
      }, 2000);
      
    } catch (error) {
      console.error('Top-up failed:', error);
      setError('Top-up Failed. Please try again later.');
    }
  };

  // Success animation
  const showSuccessAnimation = () => {
    setShowSuccess(true);
    successScale.setValue(0);
    successOpacity.setValue(0);
    
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
  };
  
  // Mock push notification
  const sendTopUpNotification = async (amount: number) => {
    // This would integrate with your notification service
    console.log(`Virtual card topped up with ₦${amount.toLocaleString()}`);
  };
  
  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={globalStyles.backButton} onPress={() => navigation.goBack()}>
          <ChevronLeft size={24} color={colors.primary} />
        </TouchableOpacity>
        <View style={styles.headerPlaceholder} />
        <Text style={styles.headerTitle}>Top-Up Virtual Card</Text>
        <View style={styles.headerPlaceholder} />
      </View>
      
      <ScrollView 
        style={styles.content} 
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* Card Info */}
        <View style={styles.cardInfo}>
          <Text style={styles.cardNickname}>{cardData.nickname}</Text>
          <Text style={styles.cardBalance}>
            Current Balance: ₦{cardData.balance.toLocaleString()}
          </Text>
          <Text style={styles.remainingLimit}>
            Remaining Limit: ₦{remainingLimit.toLocaleString()}
          </Text>
        </View>
        
        {/* Amount Input */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Enter Amount</Text>
          
          <TouchableOpacity
            style={[
              styles.amountInputContainer,
              isAmountFocused && styles.amountInputContainerFocused
            ]}
            activeOpacity={1}
            onPress={() => {
              // Focus the TextInput when container is pressed
              amountInputRef.current?.focus();
            }}
          >
            <Text style={styles.currencySymbol}>₦</Text>
            <TextInput
              ref={amountInputRef}
              style={styles.amountInput}
              placeholder="0"
              placeholderTextColor={colors.placeholder}
              value={amount}
              onChangeText={handleAmountChange}
              onFocus={() => setIsAmountFocused(true)}
              onBlur={() => setIsAmountFocused(false)}
              keyboardType="numeric"
              returnKeyType="done"
              maxLength={10}
              autoCapitalize="none"
              autoCorrect={false}
              selectTextOnFocus={true}
              editable={true}
              blurOnSubmit={true}
            />
          </TouchableOpacity>
          
          {/* Quick Amounts */}
          <View style={styles.quickAmounts}>
            {quickAmounts.map((quickAmount) => (
              <TouchableOpacity
                key={quickAmount}
                style={[
                  styles.quickAmountButton,
                  parseInt(amount) === quickAmount && styles.quickAmountButtonSelected,
                  quickAmount > remainingLimit && styles.quickAmountButtonDisabled,
                  quickAmountLoading && styles.quickAmountButtonDisabled,
                ]}
                onPress={() => handleQuickAmount(quickAmount)}
                disabled={quickAmount > remainingLimit || quickAmountLoading}
              >
                <Text style={[
                  styles.quickAmountText,
                  parseInt(amount) === quickAmount && styles.quickAmountTextSelected,
                  quickAmount > remainingLimit && styles.quickAmountTextDisabled,
                ]}>
                  ₦{(quickAmount / 1000)}k
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
        
        {/* Source Selector */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Select Funding Source</Text>
          
          {fundingSources.map((source) => {
            const IconComponent = source.icon;
            const isSelected = selectedSource?.id === source.id;
            
            return (
              <TouchableOpacity
                key={source.id}
                style={[
                  styles.sourceOption,
                  isSelected && styles.sourceOptionSelected,
                ]}
                onPress={() => handleSourceSelection(source)}
              >
                <View style={styles.sourceIcon}>
                  <IconComponent size={24} color={isSelected ? colors.white : '#06402B'} />
                </View>
                
                <View style={styles.sourceInfo}>
                  <Text style={[
                    styles.sourceName,
                    isSelected && styles.sourceNameSelected,
                  ]}>
                    {source.name}
                  </Text>
                  
                  {source.balance && (
                    <Text style={[
                      styles.sourceBalance,
                      isSelected && styles.sourceBalanceSelected,
                    ]}>
                      Balance: ₦{source.balance.toLocaleString()}
                    </Text>
                  )}
                </View>
                
                {isSelected && (
                  <CheckCircle size={20} color={colors.white} />
                )}
              </TouchableOpacity>
            );
          })}
        </View>
        
        {/* Fee Preview */}
        {loadingFees && (
          <View style={styles.feePreviewContainer}>
            <ActivityIndicator size="small" color="#06402B" />
            <Text style={styles.loadingFeesText}>Calculating fees...</Text>
          </View>
        )}
        
        {feePreview && (
          <View style={styles.feePreviewContainer}>
            <View style={styles.feePreviewHeader}>
              <Info size={20} color="#06402B" />
              <Text style={styles.feePreviewTitle}>Fee Preview</Text>
            </View>
            
            <View style={styles.feeRow}>
              <Text style={styles.feeLabel}>Top-up Amount</Text>
              <Text style={styles.feeValue}>₦{feePreview.amount.toLocaleString()}</Text>
            </View>
            
            <View style={styles.feeRow}>
              <Text style={styles.feeLabel}>Processing Fee</Text>
              <Text style={styles.feeValue}>
                {feePreview.fee === 0 ? 'Free' : `₦${feePreview.fee.toLocaleString()}`}
              </Text>
            </View>
            
            <View style={[styles.feeRow, styles.feeRowTotal]}>
              <Text style={styles.feeLabelTotal}>Total Amount</Text>
              <Text style={styles.feeValueTotal}>₦{feePreview.total.toLocaleString()}</Text>
            </View>
            
            <View style={styles.processingTime}>
              <Text style={styles.processingTimeText}>
                Processing Time: {feePreview.processingTime}
              </Text>
            </View>
          </View>
        )}
      </ScrollView>
      
      {/* Bottom Button */}
      <View style={styles.bottomContainer}>
        <TouchableOpacity
          style={[
            styles.topUpButton,
            (!selectedSource || !amount || isLoading) && styles.topUpButtonDisabled,
          ]}
          onPress={handleTopUp}
          disabled={!selectedSource || !amount || isLoading}
        >
          {isLoading ? (
            <ActivityIndicator color={colors.white} />
          ) : (
            <Text style={styles.topUpButtonText}>
              Top-Up {amount ? `₦${parseInt(amount).toLocaleString()}` : 'Card'}
            </Text>
          )}
        </TouchableOpacity>
      </View>
      
      {/* PIN Entry Modal */}
      <PinEntryModal
        visible={showPinModal}
        onClose={() => setShowPinModal(false)}
        onPinEntered={handlePinVerified}
        title="Verify PIN"
        subtitle={`Confirm top-up of ₦${parseInt(amount || '0').toLocaleString()}`}
        allowBiometric={true}
      />
      
      {/* Success Animation */}
      {showSuccess && (
        <View style={styles.successOverlay}>
          <Animated.View
            style={[
              styles.successContainer,
              {
                opacity: successOpacity,
                transform: [{ scale: successScale }],
              },
            ]}
          >
            <CheckCircle size={60} color="#A8E4A0" />
            <Text style={styles.successText}>Top-Up Successful!</Text>
            <Text style={styles.successSubtext}>
              ₦{parseInt(amount).toLocaleString()} added to {cardData.nickname}
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

      {/* Simple Quick Amount Loading */}
      {quickAmountLoading && (
        <View style={styles.quickAmountLoadingOverlay}>
          <View style={styles.quickAmountLoadingContainer}>
            <LoadingSpinner size={40} color={colors.primary} />
          </View>
        </View>
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
    paddingHorizontal: spacing.lg,
  },
  cardInfo: {
    backgroundColor: colors.white,
    borderRadius: borderRadius.medium,
    padding: spacing.lg,
    marginTop: spacing.lg,
    marginBottom: spacing.xl,
    ...shadows.small,
  },
  cardNickname: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
    marginBottom: spacing.xs,
  },
  cardBalance: {
    fontSize: 14,
    color: colors.secondaryText,
    marginBottom: spacing.xs,
  },
  remainingLimit: {
    fontSize: 14,
    color: '#06402B',
    fontWeight: '500',
  },
  section: {
    marginBottom: spacing.xl,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginBottom: spacing.md,
  },
  amountInputContainer: {
    flexDirection: 'row',
    alignItems: 'baseline',
    backgroundColor: colors.white,
    borderRadius: borderRadius.medium,
    borderWidth: 2,
    borderColor: 'transparent',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    marginBottom: spacing.md,
  },
  amountInputContainerFocused: {
    borderColor: '#06402B',
    ...shadows.medium,
  },
  currencySymbol: {
    fontSize: 18,
    fontWeight: '600',
    color: '#06402B',
    marginRight: spacing.xs,
  },
  amountInput: {
    flex: 1,
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
    paddingVertical: 2,
  },
  quickAmounts: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  quickAmountButton: {
    flex: 1,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.sm,
    backgroundColor: colors.white,
    borderRadius: borderRadius.small,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    marginHorizontal: 2,
  },
  quickAmountButtonSelected: {
    backgroundColor: '#06402B',
    borderColor: '#06402B',
  },
  quickAmountButtonDisabled: {
    backgroundColor: '#F5F5F5',
    borderColor: '#E0E0E0',
  },
  quickAmountText: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.text,
  },
  quickAmountTextSelected: {
    color: colors.white,
  },
  quickAmountTextDisabled: {
    color: '#A0A0A0',
  },
  sourceOption: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.white,
    borderRadius: borderRadius.medium,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.lg,
    marginBottom: spacing.md,
    ...shadows.small,
  },
  sourceOptionSelected: {
    backgroundColor: '#06402B',
    borderColor: '#06402B',
  },
  sourceIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#F0F8F0',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  sourceInfo: {
    flex: 1,
  },
  sourceName: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 4,
  },
  sourceNameSelected: {
    color: colors.white,
  },
  sourceBalance: {
    fontSize: 14,
    color: colors.secondaryText,
  },
  sourceBalanceSelected: {
    color: 'rgba(255, 255, 255, 0.8)',
  },
  feePreviewContainer: {
    backgroundColor: colors.white,
    borderRadius: borderRadius.medium,
    padding: spacing.lg,
    marginBottom: spacing.xl,
    ...shadows.small,
  },
  feePreviewHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  feePreviewTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#06402B',
    marginLeft: spacing.sm,
  },
  loadingFeesText: {
    fontSize: 14,
    color: colors.secondaryText,
    marginLeft: spacing.sm,
  },
  feeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  feeRowTotal: {
    borderBottomWidth: 0,
    paddingTop: spacing.md,
    borderTopWidth: 2,
    borderTopColor: '#06402B',
  },
  feeLabel: {
    fontSize: 14,
    color: colors.secondaryText,
  },
  feeLabelTotal: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
  },
  feeValue: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.text,
  },
  feeValueTotal: {
    fontSize: 18,
    fontWeight: '700',
    color: '#06402B',
  },
  processingTime: {
    marginTop: spacing.md,
    padding: spacing.sm,
    backgroundColor: '#F0F8F0',
    borderRadius: borderRadius.small,
  },
  processingTimeText: {
    fontSize: 12,
    color: '#06402B',
    textAlign: 'center',
    fontStyle: 'italic',
  },
  bottomContainer: {
    padding: spacing.lg,
    backgroundColor: 'transparent',
    borderTopWidth: 0,
  },
  topUpButton: {
    backgroundColor: '#06402B',
    borderRadius: borderRadius.medium,
    paddingVertical: spacing.md,
    alignItems: 'center',
  },
  topUpButtonDisabled: {
    backgroundColor: colors.border,
  },
  topUpButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.white,
  },
  modalOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  pinModal: {
    backgroundColor: colors.white,
    borderRadius: borderRadius.large,
    padding: spacing.xl,
    marginHorizontal: spacing.xl,
    alignItems: 'center',
  },
  pinModalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
    marginBottom: spacing.sm,
  },
  pinModalSubtitle: {
    fontSize: 14,
    color: colors.secondaryText,
    textAlign: 'center',
    marginBottom: spacing.xl,
  },
  pinModalButtons: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  pinModalButton: {
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    borderRadius: borderRadius.medium,
    minWidth: 100,
    alignItems: 'center',
  },
  pinModalCancelButton: {
    backgroundColor: colors.border,
  },
  pinModalConfirmButton: {
    backgroundColor: '#06402B',
  },
  pinModalCancelText: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.text,
  },
  pinModalConfirmText: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.white,
  },
  successOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  successContainer: {
    backgroundColor: colors.white,
    borderRadius: borderRadius.large,
    padding: spacing.xl,
    alignItems: 'center',
    marginHorizontal: spacing.xl,
  },
  successText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#06402B',
    textAlign: 'center',
    marginTop: spacing.md,
  },
  successSubtext: {
    fontSize: 14,
    color: colors.secondaryText,
    textAlign: 'center',
    marginTop: spacing.xs,
  },
  quickAmountLoadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 999,
  },
  quickAmountLoadingContainer: {
    backgroundColor: colors.white,
    borderRadius: borderRadius.large,
    padding: spacing.xl,
    alignItems: 'center',
    justifyContent: 'center',
    ...shadows.medium,
  },
});

export default TopUpVirtualCardScreen;
