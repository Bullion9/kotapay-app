import React, { useMemo, useCallback } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { ArrowUp, ArrowDown, CreditCard, FileText, Receipt } from 'lucide-react-native';
import { useSettings } from '../contexts/SettingsContext';

interface Transaction {
  id: string;
  type: 'sent' | 'received' | 'topup' | 'bill';
  counterparty: string;
  amount: number;
  currency: string;
  status: 'success' | 'pending' | 'failed';
  timestamp: Date;
}

interface TransactionRowProps {
  transaction: Transaction;
  onReceiptPress?: (transaction: Transaction) => void;
}

// Memoize type configurations to avoid recreating objects
const TYPE_CONFIGS = {
  sent: { bg: '#EA3B52', icon: ArrowUp, label: 'Sent' },
  received: { bg: '#A8E4A0', icon: ArrowDown, label: 'Received' },
  topup: { bg: '#06402B', icon: CreditCard, label: 'Top-up' },
  bill: { bg: '#3E3D29', icon: FileText, label: 'Bill Payment' },
  default: { bg: '#A3AABE', icon: FileText, label: 'Transaction' }
} as const;

const STATUS_COLORS = {
  success: '#A8E4A0',
  pending: '#FFB84D',
  failed: '#EA3B52',
  default: '#A3AABE'
} as const;

const AMOUNT_COLORS = {
  sent: '#EA3B52',
  bill: '#EA3B52',
  received: '#A8E4A0',
  topup: '#A8E4A0',
  default: '#000000'
} as const;

const TransactionRow: React.FC<TransactionRowProps> = React.memo(({ transaction, onReceiptPress }) => {
  // Memoize expensive calculations
  const typeConfig = useMemo(() => 
    TYPE_CONFIGS[transaction.type as keyof typeof TYPE_CONFIGS] || TYPE_CONFIGS.default, 
    [transaction.type]
  );

  const statusColor = useMemo(() => 
    STATUS_COLORS[transaction.status as keyof typeof STATUS_COLORS] || STATUS_COLORS.default,
    [transaction.status]
  );

  const amountColor = useMemo(() => 
    AMOUNT_COLORS[transaction.type as keyof typeof AMOUNT_COLORS] || AMOUNT_COLORS.default,
    [transaction.type]
  );

  const { formatCurrency } = useSettings();

  const formattedAmount = useMemo(() => {
    const sign = transaction.type === 'sent' || transaction.type === 'bill' ? '-' : '+';
    return `${sign}${formatCurrency(transaction.amount, transaction.currency)}`;
  }, [transaction.amount, transaction.currency, transaction.type, formatCurrency]);

  const timeAgo = useMemo(() => {
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - transaction.timestamp.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    
    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return `${diffInHours}h ago`;
    
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 7) return `${diffInDays}d ago`;
    
    return transaction.timestamp.toLocaleDateString();
  }, [transaction.timestamp]);

  const handleReceiptPress = useCallback(() => {
    onReceiptPress?.(transaction);
  }, [onReceiptPress, transaction]);

  const handleRowPress = useCallback(() => {
    onReceiptPress?.(transaction);
  }, [onReceiptPress, transaction]);

  const IconComponent = typeConfig.icon;

  return (
    <TouchableOpacity 
      style={styles.container}
      onPress={handleRowPress}
      activeOpacity={0.7}
    >
      {/* Left - Icon Circle */}
      <View style={[styles.iconCircle, { backgroundColor: typeConfig.bg }]}>
        <IconComponent size={20} color="white" />
      </View>

      {/* Middle - Details */}
      <View style={styles.middle}>
        <Text style={styles.counterparty}>{transaction.counterparty}</Text>
        <Text style={styles.subtitle}>
          {typeConfig.label} • {timeAgo}
        </Text>
      </View>

      {/* Right - Amount, Status, and Receipt Icon */}
      <View style={styles.right}>
        <View style={styles.amountContainer}>
          <Text style={[styles.amount, { color: amountColor }]}>
            {formattedAmount}
          </Text>
          <View style={[styles.statusDot, { backgroundColor: statusColor }]} />
        </View>
        {onReceiptPress && (
          <TouchableOpacity 
            style={styles.receiptButton}
            onPress={handleReceiptPress}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Receipt size={16} color="#06402B" />
          </TouchableOpacity>
        )}
      </View>
    </TouchableOpacity>
  );
});

// Add display name for debugging
TransactionRow.displayName = 'TransactionRow';

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 72,
    paddingHorizontal: 16,
    backgroundColor: 'white',
  },
  iconCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  middle: {
    flex: 1,
    justifyContent: 'center',
  },
  counterparty: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000000',
    marginBottom: 2,
  },
  subtitle: {
    fontSize: 14,
    color: '#A3AABE',
  },
  right: {
    alignItems: 'flex-end',
    justifyContent: 'center',
    minWidth: 80,
  },
  amountContainer: {
    alignItems: 'flex-end',
    marginBottom: 4,
  },
  amount: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 2,
  },
  receiptButton: {
    padding: 4,
    borderRadius: 12,
    backgroundColor: 'rgba(6, 64, 43, 0.1)',
    marginTop: 4,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
});

export default TransactionRow;
