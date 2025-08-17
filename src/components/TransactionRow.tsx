import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { ArrowUp, ArrowDown, CreditCard, FileText } from 'lucide-react-native';

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
}

const TransactionRow: React.FC<TransactionRowProps> = ({ transaction }) => {
  const getTypeConfig = (type: string) => {
    switch (type) {
      case 'sent':
        return { bg: '#EA3B52', icon: ArrowUp, label: 'Sent' };
      case 'received':
        return { bg: '#A8E4A0', icon: ArrowDown, label: 'Received' };
      case 'topup':
        return { bg: '#06402B', icon: CreditCard, label: 'Top-up' };
      case 'bill':
        return { bg: '#3E3D29', icon: FileText, label: 'Bill Payment' };
      default:
        return { bg: '#A3AABE', icon: FileText, label: 'Transaction' };
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'success':
        return '#A8E4A0';
      case 'pending':
        return '#b9f1ff';
      case 'failed':
        return '#EA3B52';
      default:
        return '#A3AABE';
    }
  };

  const getAmountColor = (type: string) => {
    switch (type) {
      case 'sent':
      case 'bill':
        return '#EA3B52';
      case 'received':
      case 'topup':
        return '#A8E4A0';
      default:
        return '#000d10';
    }
  };

  const formatAmount = (amount: number, currency: string, type: string) => {
    const prefix = type === 'sent' || type === 'bill' ? '−' : '+';
    return `${prefix}${currency}${amount.toLocaleString()}`;
  };

  const formatTimeAgo = (date: Date) => {
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffMins < 60) {
      return `${diffMins} min ago`;
    } else if (diffHours < 24) {
      return `${diffHours} h ago`;
    } else {
      return `${diffDays} d ago`;
    }
  };

  const typeConfig = getTypeConfig(transaction.type);
  const IconComponent = typeConfig.icon;

  return (
    <View style={styles.container}>
      {/* Left - Icon Circle */}
      <View style={[styles.iconCircle, { backgroundColor: typeConfig.bg }]}>
        <IconComponent size={20} color="white" />
      </View>

      {/* Middle - Details */}
      <View style={styles.middle}>
        <Text style={styles.counterparty}>{transaction.counterparty}</Text>
        <Text style={styles.subtitle}>
          {typeConfig.label} • {formatTimeAgo(transaction.timestamp)}
        </Text>
      </View>

      {/* Right - Amount and Status */}
      <View style={styles.right}>
        <Text style={[styles.amount, { color: getAmountColor(transaction.type) }]}>
          {formatAmount(transaction.amount, transaction.currency, transaction.type)}
        </Text>
        <View style={[styles.statusDot, { backgroundColor: getStatusColor(transaction.status) }]} />
      </View>
    </View>
  );
};

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
    fontWeight: 'bold',
    color: '#000d10',
    marginBottom: 2,
  },
  subtitle: {
    fontSize: 12,
    color: '#A3AABE',
  },
  right: {
    alignItems: 'flex-end',
    justifyContent: 'center',
  },
  amount: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
});

export default TransactionRow;
