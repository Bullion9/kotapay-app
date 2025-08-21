import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  TextInput,
  Alert,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { ChevronLeft } from 'lucide-react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { colors, spacing, borderRadius, shadows, globalStyles } from '../theme';
import PinEntryModal from '../components/PinEntryModal';
import { CardStackParamList } from '../types/navigation';

type WithdrawalScreenNavigationProp = StackNavigationProp<CardStackParamList, 'WithdrawalScreen'>;

interface RouteParams {
  cardId: string;
  availableBalance: number;
  cardNickname: string;
}

const WithdrawalScreen: React.FC = () => {
  const navigation = useNavigation<WithdrawalScreenNavigationProp>();
  const route = useRoute();
  const { availableBalance, cardNickname } = route.params as RouteParams;

  const [amount, setAmount] = useState('');
  const [isAmountFocused, setIsAmountFocused] = useState(false);
  const [showPinModal, setShowPinModal] = useState(false);

  const handleConfirm = () => {
    const withdrawalAmount = parseInt(amount.replace(/[^0-9]/g, '')) || 0;
    
    if (withdrawalAmount <= 0) {
      Alert.alert('Invalid Amount', 'Please enter a valid withdrawal amount');
      return;
    }

    if (withdrawalAmount > availableBalance) {
      Alert.alert('Insufficient Balance', `You can only withdraw up to ₦${availableBalance.toLocaleString()}`);
      return;
    }

    if (withdrawalAmount < 1000) {
      Alert.alert('Minimum Amount', 'Minimum withdrawal amount is ₦1,000');
      return;
    }

    // Show PIN modal for authentication
    setShowPinModal(true);
  };

  const handlePinEntered = async (pin: string) => {
    console.log('PIN entered, starting withdrawal process...');
    setShowPinModal(false);
    
    try {
      const withdrawalAmount = parseInt(amount.replace(/[^0-9]/g, ''));
      console.log('Withdrawal amount:', withdrawalAmount);
      
      // Validate PIN first
      if (pin !== '1234') { // Mock PIN validation
        throw new Error('Invalid PIN');
      }
      
      // Generate transaction ID
      const transactionId = `WD${Date.now().toString().slice(-8)}${Math.random().toString(36).substr(2, 4).toUpperCase()}`;
      console.log('Generated transaction ID:', transactionId);
      
      // Navigate to processing screen immediately
      console.log('Navigating to WithdrawalProcessingScreen...');
      navigation.navigate('WithdrawalProcessingScreen', {
        amount: withdrawalAmount,
        cardNickname: cardNickname || 'Virtual Card',
        transactionId: transactionId,
      });
      console.log('Navigation completed successfully');

    } catch (error) {
      console.error('Withdrawal error:', error);
      Alert.alert(
        'Withdrawal Failed', 
        error instanceof Error ? error.message : 'An unexpected error occurred. Please try again.',
        [
          {
            text: 'OK',
            onPress: () => setShowPinModal(false)
          }
        ]
      );
    }
  };

  const handlePinModalClose = () => {
    setShowPinModal(false);
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView 
        style={styles.keyboardAvoidingView}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity style={globalStyles.backButton} onPress={() => navigation.goBack()}>
            <ChevronLeft size={24} color={colors.primary} />
          </TouchableOpacity>
          <View style={styles.headerPlaceholder} />
          <Text style={styles.headerTitle}>Withdraw Funds</Text>
          <View style={styles.headerPlaceholder} />
        </View>

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {/* Available Balance */}
          <View style={styles.balanceContainer}>
            <Text style={styles.balanceLabel}>Available Balance</Text>
            <Text style={styles.balanceAmount}>₦{availableBalance.toLocaleString()}</Text>
          </View>

          {/* Amount Input */}
          <View style={styles.inputSection}>
            <Text style={styles.inputLabel}>Enter Withdrawal Amount</Text>
            
            <View style={[
              styles.inputWrapper,
              isAmountFocused && styles.inputWrapperFocused
            ]}>
              <Text style={styles.currencySymbol}>₦</Text>
              <TextInput
                style={styles.amountInput}
                value={amount}
                onChangeText={(text) => {
                  // Allow only numbers
                  const numericValue = text.replace(/[^0-9]/g, '');
                  setAmount(numericValue);
                }}
                onFocus={() => setIsAmountFocused(true)}
                onBlur={() => setIsAmountFocused(false)}
                keyboardType="numeric"
                placeholder="Enter amount"
                placeholderTextColor={colors.secondaryText}
                autoFocus={true}
                selectTextOnFocus={true}
                returnKeyType="done"
                editable={true}
                multiline={false}
              />
            </View>

            {amount && (
              <View style={styles.formattedAmountContainer}>
                <Text style={styles.formattedAmountLabel}>Amount to withdraw:</Text>
                <Text style={styles.formattedAmount}>
                  ₦{parseInt(amount).toLocaleString()}
                </Text>
              </View>
            )}
          </View>

          {/* Info Card */}
          <View style={styles.infoCard}>
            <Text style={styles.infoTitle}>Withdrawal Information</Text>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Processing time:</Text>
              <Text style={styles.infoValue}>Instant</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Destination:</Text>
              <Text style={styles.infoValue}>KotaPay Wallet</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Minimum amount:</Text>
              <Text style={styles.infoValue}>₦1,000</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Transaction fee:</Text>
              <Text style={styles.infoValue}>Free</Text>
            </View>
          </View>
        </ScrollView>

        {/* Bottom Action */}
        <View style={styles.bottomContainer}>
          <TouchableOpacity
            style={[
              styles.withdrawButton,
              (!amount || parseInt(amount) <= 0) && styles.withdrawButtonDisabled
            ]}
            onPress={handleConfirm}
            disabled={!amount || parseInt(amount) <= 0}
          >
            <Text style={styles.withdrawButtonText}>
              Withdraw {amount && `₦${parseInt(amount).toLocaleString()}`}
            </Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>

      {/* PIN Entry Modal */}
      <PinEntryModal
        visible={showPinModal}
        onClose={handlePinModalClose}
        onPinEntered={handlePinEntered}
        title="Confirm Withdrawal"
        subtitle="Enter your PIN to confirm the withdrawal"
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  keyboardAvoidingView: {
    flex: 1,
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
  balanceContainer: {
    alignItems: 'center',
    marginBottom: spacing.xl,
    paddingVertical: spacing.lg,
  },
  balanceLabel: {
    fontSize: 16,
    color: colors.secondaryText,
    marginBottom: spacing.sm,
  },
  balanceAmount: {
    fontSize: 32,
    fontWeight: '700',
    color: colors.primary,
  },
  inputSection: {
    marginBottom: spacing.xl,
  },
  inputLabel: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
    marginBottom: spacing.lg,
    textAlign: 'center',
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.white,
    borderRadius: borderRadius.large,
    borderWidth: 2,
    borderColor: colors.border,
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.lg,
    ...shadows.small,
  },
  inputWrapperFocused: {
    borderColor: colors.primary,
    ...shadows.large,
  },
  currencySymbol: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.text,
    marginRight: spacing.md,
  },
  amountInput: {
    flex: 1,
    fontSize: 24,
    fontWeight: '700',
    color: colors.text,
    padding: 0,
    textAlign: 'center',
  },
  formattedAmountContainer: {
    alignItems: 'center',
    marginTop: spacing.lg,
    padding: spacing.md,
    backgroundColor: colors.light,
    borderRadius: borderRadius.medium,
  },
  formattedAmountLabel: {
    fontSize: 14,
    color: colors.secondaryText,
    marginBottom: spacing.xs,
  },
  formattedAmount: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.primary,
  },
  infoCard: {
    backgroundColor: colors.white,
    borderRadius: borderRadius.large,
    padding: spacing.xl,
    marginBottom: spacing.xl,
    ...shadows.medium,
  },
  infoTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
    marginBottom: spacing.lg,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  infoLabel: {
    fontSize: 14,
    color: colors.secondaryText,
  },
  infoValue: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
  },
  bottomContainer: {
    padding: spacing.lg,
  },
  withdrawButton: {
    backgroundColor: colors.primary,
    borderRadius: borderRadius.large,
    paddingVertical: spacing.lg,
    alignItems: 'center',
    ...shadows.medium,
  },
  withdrawButtonDisabled: {
    backgroundColor: colors.border,
  },
  withdrawButtonText: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.white,
  },
});

export default WithdrawalScreen;
