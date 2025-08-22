import { ArrowDownLeft, ArrowUpRight } from 'lucide-react-native';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { colors, spacing, typography } from '../theme';

export interface CardTransaction {
  id: string;
  type: 'credit' | 'debit';
  amount: number;
  merchant: string;
  date: string;
  category: string;
  status: 'completed' | 'pending' | 'failed';
}

interface Props {
  transaction: CardTransaction;
}

const CardTransactionRow: React.FC<Props> = ({ transaction }) => {
  const getIcon = () => {
    return transaction.type === 'credit' ? 
      <ArrowDownLeft size={24} color={colors.success} /> :
      <ArrowUpRight size={24} color={colors.error} />;
  };

  const getAmountColor = () => {
    return transaction.type === 'credit' ? colors.success : colors.error;
  };

  const getStatusColor = () => {
    switch (transaction.status) {
      case 'completed':
        return colors.success;
      case 'pending':
        return colors.warning;
      case 'failed':
        return colors.error;
      default:
        return colors.text;
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.iconContainer}>
        {getIcon()}
      </View>
      <View style={styles.details}>
        <Text style={styles.merchant}>{transaction.merchant}</Text>
        <Text style={styles.category}>{transaction.category}</Text>
      </View>
      <View style={styles.rightContent}>
        <Text style={[styles.amount, { color: getAmountColor() }]}>
          {transaction.type === 'credit' ? '+' : '-'}₦{transaction.amount.toLocaleString()}
        </Text>
        <Text style={[styles.status, { color: getStatusColor() }]}>
          {transaction.status.charAt(0).toUpperCase() + transaction.status.slice(1)}
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.light,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  details: {
    flex: 1,
  },
  merchant: {
    ...typography.body,
    color: colors.text,
    fontWeight: '600',
  },
  category: {
    ...typography.small,
    color: colors.secondaryText,
  },
  rightContent: {
    alignItems: 'flex-end',
  },
  amount: {
    ...typography.body,
    fontWeight: '600',
  },
  status: {
    ...typography.small,
    marginTop: 2,
  },
});

export default CardTransactionRow;
