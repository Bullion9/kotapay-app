import React from 'react';
import {
  View,
  Text,
  StyleSheet,
} from 'react-native';
import { ArrowDownLeft, ArrowUpRight } from 'lucide-react-native';
import { colors, spacing, borderRadius, shadows } from '../theme';

interface Transaction {
  id: string;
  type: 'credit' | 'debit';
  amount: number;
  merchant: string;
  date: string;
  status: 'completed' | 'pending' | 'failed';
}

interface Props {
  transactions: Transaction[];
}

const VirtualCardTransactionSection: React.FC<Props> = ({ transactions }) => {
  const renderTransaction = ({ item }: { item: Transaction }) => (
    <View style={styles.transactionItem}>
      <View style={[
        styles.iconContainer,
        { backgroundColor: item.type === 'credit' ? colors.success + '20' : colors.error + '20' }
      ]}>
        {item.type === 'credit' ? (
          <ArrowDownLeft size={20} color={colors.success} />
        ) : (
          <ArrowUpRight size={20} color={colors.error} />
        )}
      </View>
      
      <View style={styles.transactionDetails}>
        <Text style={styles.merchantName}>{item.merchant}</Text>
        <Text style={styles.date}>{item.date}</Text>
      </View>
      
      <View style={styles.amountContainer}>
        <Text style={[
          styles.amount,
          { color: item.type === 'credit' ? colors.success : colors.error }
        ]}>
          {item.type === 'credit' ? '+' : '-'}₦{item.amount.toLocaleString()}
        </Text>
        <Text style={[
          styles.status,
          {
            color: item.status === 'completed' ? colors.success :
                  item.status === 'pending' ? colors.warning :
                  colors.error
          }
        ]}>
          {item.status.charAt(0).toUpperCase() + item.status.slice(1)}
        </Text>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Recent Transactions</Text>
      {transactions.length > 0 ? (
        <View style={styles.transactionsList}>
          {transactions.map((item) => renderTransaction({ item }))}
        </View>
      ) : (
        <View style={styles.emptyState}>
          <Text style={styles.emptyStateText}>No transactions yet</Text>
          <Text style={styles.emptyStateSubtext}>Your transactions will appear here</Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: spacing.lg,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
    marginBottom: spacing.lg,
  },
  transactionsList: {
    gap: spacing.md,
  },
  transactionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.md,
    backgroundColor: colors.white,
    borderRadius: borderRadius.medium,
    ...shadows.small,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.white,
  },
  transactionDetails: {
    flex: 1,
    marginLeft: spacing.md,
  },
  merchantName: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.text,
    marginBottom: 2,
  },
  date: {
    fontSize: 12,
    color: colors.secondaryText,
  },
  amountContainer: {
    alignItems: 'flex-end',
  },
  amount: {
    fontSize: 14,
    fontWeight: '600',
  },
  status: {
    fontSize: 12,
    marginTop: 2,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: spacing.xl,
  },
  emptyStateText: {
    fontSize: 16,
    fontWeight: '500',
    color: colors.text,
    marginBottom: spacing.xs,
  },
  emptyStateSubtext: {
    fontSize: 14,
    color: colors.secondaryText,
    textAlign: 'center',
  },
});

export default VirtualCardTransactionSection;
