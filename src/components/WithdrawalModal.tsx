import { ArrowDown, X } from 'lucide-react-native';
import React, { useState } from 'react';
import {
    Alert,
    Modal,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';
import { borderRadius, colors, shadows, spacing } from '../theme';

interface Props {
  visible: boolean;
  onClose: () => void;
  onConfirm: (amount: number) => void;
  availableBalance: number;
  cardNickname: string;
}

const WithdrawalModal: React.FC<Props> = ({
  visible,
  onClose,
  onConfirm,
  availableBalance,
  cardNickname,
}) => {
  const [amount, setAmount] = useState('');
  const [isAmountFocused, setIsAmountFocused] = useState(false);

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

    onConfirm(withdrawalAmount);
    setAmount('');
  };

  const handleClose = () => {
    setAmount('');
    onClose();
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={handleClose}
    >
      <View style={styles.overlay}>
        <View style={styles.modalContainer}>
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.iconContainer}>
              <ArrowDown size={24} color={colors.primary} />
            </View>
            <TouchableOpacity onPress={handleClose} style={styles.closeButton}>
              <X size={24} color={colors.text} />
            </TouchableOpacity>
          </View>

          {/* Title */}
          <Text style={styles.title}>Withdraw Funds</Text>
          <Text style={styles.subtitle}>
            From {cardNickname}
          </Text>

          {/* Available Balance */}
          <View style={styles.balanceContainer}>
            <Text style={styles.balanceLabel}>Available Balance</Text>
            <Text style={styles.balanceAmount}>₦{availableBalance.toLocaleString()}</Text>
          </View>

          {/* Amount Input */}
          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>Withdrawal Amount</Text>
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
                autoFocus={false}
                selectTextOnFocus={true}
                returnKeyType="done"
                editable={true}
                multiline={false}
              />
            </View>
            {amount && (
              <Text style={styles.formattedAmount}>
                ₦{parseInt(amount).toLocaleString()}
              </Text>
            )}
          </View>

          {/* Action Buttons */}
          <View style={styles.actionButtons}>
            <TouchableOpacity
              style={styles.cancelButton}
              onPress={handleClose}
            >
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={[
                styles.confirmButton,
                (!amount || parseInt(amount) <= 0) && styles.confirmButtonDisabled
              ]}
              onPress={handleConfirm}
              disabled={!amount || parseInt(amount) <= 0}
            >
              <Text style={styles.confirmButtonText}>Withdraw</Text>
            </TouchableOpacity>
          </View>

          {/* Note */}
          <Text style={styles.note}>
            Funds will be transferred to your main KotaPay wallet
          </Text>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
  },
  modalContainer: {
    backgroundColor: colors.white,
    borderRadius: borderRadius.large,
    padding: spacing.xl,
    width: '100%',
    maxWidth: 400,
    ...shadows.large,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.primary + '20',
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeButton: {
    padding: spacing.sm,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.text,
    textAlign: 'center',
    marginBottom: spacing.xs,
  },
  subtitle: {
    fontSize: 16,
    color: colors.secondaryText,
    textAlign: 'center',
    marginBottom: spacing.xl,
  },
  balanceContainer: {
    backgroundColor: colors.light,
    borderRadius: borderRadius.medium,
    padding: spacing.lg,
    alignItems: 'center',
    marginBottom: spacing.xl,
  },
  balanceLabel: {
    fontSize: 14,
    color: colors.secondaryText,
    marginBottom: spacing.xs,
  },
  balanceAmount: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.primary,
  },
  inputContainer: {
    marginBottom: spacing.xl,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginBottom: spacing.sm,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.white,
    borderRadius: borderRadius.medium,
    borderWidth: 2,
    borderColor: colors.border,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  inputWrapperFocused: {
    borderColor: colors.primary,
    ...shadows.medium,
  },
  currencySymbol: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
    marginRight: spacing.sm,
  },
  amountInput: {
    flex: 1,
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
    padding: 0,
  },
  formattedAmount: {
    fontSize: 14,
    color: colors.secondaryText,
    marginTop: spacing.xs,
    textAlign: 'center',
    fontStyle: 'italic',
  },
  actionButtons: {
    flexDirection: 'row',
    gap: spacing.md,
    marginBottom: spacing.lg,
  },
  cancelButton: {
    flex: 1,
    backgroundColor: colors.white,
    borderRadius: borderRadius.medium,
    borderWidth: 1,
    borderColor: colors.border,
    paddingVertical: spacing.md,
    alignItems: 'center',
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
  },
  confirmButton: {
    flex: 1,
    backgroundColor: colors.primary,
    borderRadius: borderRadius.medium,
    paddingVertical: spacing.md,
    alignItems: 'center',
  },
  confirmButtonDisabled: {
    backgroundColor: colors.border,
  },
  confirmButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.white,
  },
  note: {
    fontSize: 12,
    color: colors.secondaryText,
    textAlign: 'center',
    fontStyle: 'italic',
  },
});

export default WithdrawalModal;
