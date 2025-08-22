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
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import {
  ChevronLeft,
  ArrowUpCircle,
  CreditCard,
  Wallet,
  CheckCircle,
} from 'lucide-react-native';
import { colors, spacing, borderRadius, shadows } from '../theme';

const WithdrawCardScreen: React.FC = () => {
  const navigation = useNavigation();
  const [amount, setAmount] = useState('');
  const [isFocused, setIsFocused] = useState(false);
  const [loadingQuickAmount, setLoadingQuickAmount] = useState<number | null>(null);
  const [showSuccess, setShowSuccess] = useState(false);
  const cardBalance = 25000;
  
  // Animation refs
  const successScale = useRef(new Animated.Value(0)).current;
  const successOpacity = useRef(new Animated.Value(0)).current;
  const spinValue = useRef(new Animated.Value(0)).current;
  
  const handleWithdraw = async () => {
    const withdrawAmount = parseInt(amount) || 0;
    
    if (withdrawAmount <= 0) {
      Alert.alert('Error', 'Please enter a valid amount');
      return;
    }
    
    if (withdrawAmount > cardBalance) {
      Alert.alert('Error', 'Insufficient card balance');
      return;
    }
    
    // Show success animation
    showSuccessAnimation();
    
    // Auto dismiss after 2 seconds
    setTimeout(() => {
      setShowSuccess(false);
      navigation.goBack();
    }, 2000);
  };

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

  const handleQuickAmount = async (quickAmount: number) => {
    setLoadingQuickAmount(quickAmount);
    
    // Start spinning animation
    Animated.loop(
      Animated.timing(spinValue, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: true,
      })
    ).start();
    
    // Simulate loading
    await new Promise(resolve => setTimeout(resolve, 800));
    
    // Stop spinning and set amount
    spinValue.setValue(0);
    setAmount(quickAmount.toString());
    setLoadingQuickAmount(null);
  };

  const quickAmounts = [5000, 10000, 15000, cardBalance];

  const spin = spinValue.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  return (
    <KeyboardAvoidingView 
      style={{ flex: 1 }} 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <SafeAreaView style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity 
            style={styles.backButton} 
            onPress={() => navigation.goBack()}
          >
            <ChevronLeft size={24} color={colors.primary} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Withdraw</Text>
          <View style={styles.placeholder} />
        </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Card Preview */}
        <View style={styles.cardSection}>
          <View style={styles.virtualCard}>
            <View style={styles.cardHeader}>
              <Text style={styles.cardName}>Virtual Card</Text>
              <CreditCard size={24} color={colors.white} />
            </View>

            <View style={styles.cardNumber}>
              <Text style={styles.cardNumberText}>•••• •••• •••• 9012</Text>
            </View>

            <View style={styles.cardDetails}>
              <View>
                <Text style={styles.cardLabel}>AVAILABLE BALANCE</Text>
                <Text style={styles.balanceAmount}>₦{cardBalance.toLocaleString()}</Text>
              </View>
              <View style={styles.cardBalance}>
                <Text style={styles.cardLabel}>AFTER WITHDRAWAL</Text>
                <Text style={styles.balanceAmount}>
                  ₦{(cardBalance - (parseInt(amount) || 0)).toLocaleString()}
                </Text>
              </View>
            </View>
          </View>
        </View>

        {/* Amount Input */}
        <View style={styles.formSection}>
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Withdrawal Amount</Text>
            <TextInput
              style={[
                styles.amountInput,
                isFocused && styles.amountInputFocused
              ]}
              placeholder="Enter amount"
              value={amount}
              onChangeText={setAmount}
              onFocus={() => setIsFocused(true)}
              onBlur={() => setIsFocused(false)}
              keyboardType="numeric"
            />
            
            <View style={styles.quickAmounts}>
              {quickAmounts.map((quickAmount) => (
                <TouchableOpacity
                  key={quickAmount}
                  style={[
                    styles.amountButton,
                    parseInt(amount) === quickAmount && styles.amountButtonSelected,
                    loadingQuickAmount === quickAmount && styles.amountButtonLoading
                  ]}
                  onPress={() => handleQuickAmount(quickAmount)}
                  disabled={loadingQuickAmount !== null}
                >
                  {loadingQuickAmount === quickAmount ? (
                    <Animated.View style={{ transform: [{ rotate: spin }] }}>
                      <ActivityIndicator size="small" color={colors.white} />
                    </Animated.View>
                  ) : (
                    <Text style={[
                      styles.amountButtonText,
                      parseInt(amount) === quickAmount && styles.amountButtonTextSelected
                    ]}>
                      {quickAmount === cardBalance ? 'All' : `₦${(quickAmount / 1000)}k`}
                    </Text>
                  )}
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Destination */}
          <View style={styles.destinationSection}>
            <Text style={styles.inputLabel}>Transfer To</Text>
            <TouchableOpacity style={styles.destinationCard}>
              <View style={styles.destinationIcon}>
                <Wallet size={20} color={colors.primary} />
              </View>
              <View style={styles.destinationInfo}>
                <Text style={styles.destinationName}>Main Wallet</Text>
                <Text style={styles.destinationBalance}>Current: ₦150,000</Text>
              </View>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.bottomPadding} />
      </ScrollView>

      {/* Withdraw Button */}
      <View style={styles.bottomContainer}>
        <TouchableOpacity
          style={[
            styles.withdrawButton,
            (!amount || parseInt(amount) <= 0 || parseInt(amount) > cardBalance) && styles.withdrawButtonDisabled
          ]}
          onPress={handleWithdraw}
          disabled={!amount || parseInt(amount) <= 0 || parseInt(amount) > cardBalance}
        >
          <ArrowUpCircle size={20} color={colors.white} />
          <Text style={styles.withdrawButtonText}>
            Withdraw ₦{parseInt(amount || '0').toLocaleString()}
          </Text>
        </TouchableOpacity>
      </View>

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
            <CheckCircle size={60} color="#4CAF50" />
            <Text style={styles.successText}>Withdrawal Successful!</Text>
            <Text style={styles.successSubtext}>
              ₦{parseInt(amount || '0').toLocaleString()} transferred to your main wallet
            </Text>
          </Animated.View>
        </View>
      )}
    </SafeAreaView>
    </KeyboardAvoidingView>
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
    paddingVertical: spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5E5',
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.background,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: colors.border,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.text,
  },
  placeholder: {
    width: 40,
    height: 40,
  },
  content: {
    flex: 1,
  },
  cardSection: {
    padding: spacing.xl,
  },
  virtualCard: {
    backgroundColor: '#06402B',
    borderRadius: borderRadius.xl,
    padding: spacing.xl,
    minHeight: 200,
    ...shadows.large,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.xl,
  },
  cardName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.white,
  },
  cardNumber: {
    marginBottom: spacing.xl,
  },
  cardNumberText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.white,
    letterSpacing: 2,
  },
  cardDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
  },
  cardLabel: {
    fontSize: 10,
    color: colors.white,
    opacity: 0.8,
    marginBottom: spacing.xs,
  },
  cardBalance: {
    alignItems: 'flex-end',
  },
  balanceAmount: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.white,
  },
  formSection: {
    paddingHorizontal: spacing.xl,
    gap: spacing.lg,
  },
  inputGroup: {
    marginBottom: spacing.lg,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginBottom: spacing.sm,
  },
  amountInput: {
    backgroundColor: '#FFFFFF',
    borderRadius: borderRadius.medium,
    padding: spacing.md,
    fontSize: 18,
    fontWeight: '600',
    borderWidth: 2,
    borderColor: colors.border,
    textAlign: 'center',
    ...shadows.small,
  },
  amountInputFocused: {
    borderColor: colors.primary,
    ...shadows.medium,
  },
  quickAmounts: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginTop: spacing.md,
  },
  amountButton: {
    flex: 1,
    paddingVertical: spacing.sm,
    backgroundColor: '#FFFFFF',
    borderRadius: borderRadius.medium,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
    minHeight: 40,
    justifyContent: 'center',
  },
  amountButtonSelected: {
    backgroundColor: colors.warning,
    borderColor: colors.warning,
  },
  amountButtonLoading: {
    backgroundColor: colors.warning,
    borderColor: colors.warning,
  },
  amountButtonText: {
    fontSize: 12,
    fontWeight: '500',
    color: colors.text,
  },
  amountButtonTextSelected: {
    color: colors.white,
  },
  destinationSection: {
    marginBottom: spacing.lg,
  },
  destinationCard: {
    backgroundColor: colors.background,
    borderRadius: borderRadius.medium,
    padding: spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
    ...shadows.small,
  },
  destinationIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F0F8F0',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  destinationInfo: {
    flex: 1,
  },
  destinationName: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
  },
  destinationBalance: {
    fontSize: 12,
    color: colors.secondaryText,
    marginTop: 2,
  },
  bottomContainer: {
    padding: spacing.xl,
    backgroundColor: colors.background,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  withdrawButton: {
    backgroundColor: colors.warning,
    borderRadius: borderRadius.medium,
    paddingVertical: spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
  },
  withdrawButtonDisabled: {
    backgroundColor: colors.border,
  },
  withdrawButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.white,
  },
  bottomPadding: {
    height: 50,
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
    backgroundColor: colors.background,
    borderRadius: borderRadius.large,
    padding: spacing.xl,
    alignItems: 'center',
    marginHorizontal: spacing.xl,
    ...shadows.large,
  },
  successText: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.warning,
    textAlign: 'center',
    marginTop: spacing.md,
  },
  successSubtext: {
    fontSize: 14,
    color: colors.secondaryText,
    textAlign: 'center',
    marginTop: spacing.xs,
  },
});

export default WithdrawCardScreen;
