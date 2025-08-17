import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  TouchableOpacity,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import {
  ArrowUpRight,
  ArrowDownLeft,
  Clock,
  CheckCircle,
  AlertCircle,
  Zap,
} from 'lucide-react-native';
import { colors, spacing, borderRadius, shadows } from '../theme';
import { RootStackParamList } from '../types';

interface ActivityItem {
  id: string;
  type: 'transfer_out' | 'transfer_in' | 'bill_payment' | 'card_transaction' | 'top_up';
  title: string;
  subtitle: string;
  amount?: number;
  status: 'pending' | 'completed' | 'failed' | 'processing';
  timestamp: Date;
  icon: React.ComponentType<any>;
}

type ActivityCardNavigationProp = StackNavigationProp<RootStackParamList>;

const ActivityCard: React.FC = () => {
  const navigation = useNavigation<ActivityCardNavigationProp>();
  const [activities, setActivities] = useState<ActivityItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    // Simulate loading recent activities
    const loadActivities = () => {
      const mockActivities: ActivityItem[] = [
        {
          id: '1',
          type: 'transfer_in',
          title: 'Money Received',
          subtitle: 'From John Doe',
          amount: 5000,
          status: 'completed',
          timestamp: new Date(Date.now() - 1000 * 60 * 15), // 15 mins ago
          icon: ArrowDownLeft,
        },
        {
          id: '2',
          type: 'bill_payment',
          title: 'Electricity Bill',
          subtitle: 'PHCN Payment',
          amount: 2500,
          status: 'processing',
          timestamp: new Date(Date.now() - 1000 * 60 * 30), // 30 mins ago
          icon: Zap,
        },
        {
          id: '3',
          type: 'transfer_out',
          title: 'Money Sent',
          subtitle: 'To Sarah Johnson',
          amount: 3000,
          status: 'completed',
          timestamp: new Date(Date.now() - 1000 * 60 * 60), // 1 hour ago
          icon: ArrowUpRight,
        },
        {
          id: '4',
          type: 'transfer_in',
          title: 'Payment Received',
          subtitle: 'From Mike Wilson',
          amount: 1500,
          status: 'completed',
          timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2), // 2 hours ago
          icon: ArrowDownLeft,
        },
        {
          id: '5',
          type: 'bill_payment',
          title: 'Internet Bill',
          subtitle: 'MTN Payment',
          amount: 800,
          status: 'completed',
          timestamp: new Date(Date.now() - 1000 * 60 * 60 * 3), // 3 hours ago
          icon: Zap,
        },
      ];

      setTimeout(() => {
        setActivities(mockActivities);
        setIsLoading(false);
      }, 1000);
    };

    loadActivities();
  }, []);

  // Auto-rotate through activities
  useEffect(() => {
    if (activities.length === 0) return;

    const interval = setInterval(() => {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % activities.length);
    }, 3000); // Change every 3 seconds

    return () => clearInterval(interval);
  }, [activities.length]);

  const getStatusColor = (status: ActivityItem['status']) => {
    switch (status) {
      case 'completed':
        return colors.success;
      case 'pending':
        return colors.warning;
      case 'processing':
        return '#06402B';
      case 'failed':
        return colors.error;
      default:
        return colors.secondaryText;
    }
  };

  const getStatusIcon = (status: ActivityItem['status']) => {
    switch (status) {
      case 'completed':
        return CheckCircle;
      case 'pending':
      case 'processing':
        return Clock;
      case 'failed':
        return AlertCircle;
      default:
        return Clock;
    }
  };

  const formatAmount = (amount: number, type: ActivityItem['type']) => {
    const sign = type === 'transfer_in' || type === 'top_up' ? '+' : '-';
    return `${sign}₦${amount.toLocaleString()}`;
  };

  const formatTime = (timestamp: Date) => {
    const now = new Date();
    const diffMinutes = Math.floor((now.getTime() - timestamp.getTime()) / (1000 * 60));
    
    if (diffMinutes < 60) {
      return `${diffMinutes}m ago`;
    } else if (diffMinutes < 1440) {
      return `${Math.floor(diffMinutes / 60)}h ago`;
    } else {
      return `${Math.floor(diffMinutes / 1440)}d ago`;
    }
  };

  const renderActivityItem = (item: ActivityItem) => {
    const IconComponent = item.icon;
    const StatusIcon = getStatusIcon(item.status);
    const statusColor = getStatusColor(item.status);
    const isPositive = item.type === 'transfer_in' || item.type === 'top_up';

    // Convert ActivityItem to TransactionData format for receipt
    const convertToTransactionData = (activityItem: ActivityItem) => {
      const transactionTypes = {
        'transfer_in': 'RECEIVED',
        'transfer_out': 'SENT',
        'bill_payment': 'BILL_PAYMENT',
        'card_transaction': 'VIRTUAL_CARD',
        'top_up': 'CARD_TOP_UP'
      } as const;

      const statusMap = {
        'completed': 'SUCCESS',
        'pending': 'PENDING',
        'failed': 'FAILED',
        'processing': 'PENDING'
      } as const;

      return {
        id: activityItem.id,
        type: transactionTypes[activityItem.type] || 'SENT',
        amount: activityItem.amount || 0,
        currency: '₦',
        status: statusMap[activityItem.status] || 'SUCCESS',
        date: activityItem.timestamp.toLocaleDateString('en-US', { 
          year: 'numeric', 
          month: 'short', 
          day: 'numeric' 
        }),
        time: activityItem.timestamp.toLocaleTimeString('en-US', { 
          hour: '2-digit', 
          minute: '2-digit',
          hour12: true 
        }),
        from: activityItem.type === 'transfer_in' ? activityItem.subtitle.replace('From ', '') : 'You',
        to: activityItem.type === 'transfer_out' ? activityItem.subtitle.replace('To ', '') : 'You',
        note: activityItem.title,
        fee: activityItem.amount ? Math.max(25, Math.round(activityItem.amount * 0.01)) : 25, // 1% fee with minimum of ₦25
        total: activityItem.amount ? activityItem.amount + Math.max(25, Math.round(activityItem.amount * 0.01)) : 25,
        biometricAuth: true,
        ...(activityItem.type === 'bill_payment' && {
          billProvider: activityItem.subtitle,
          billMeter: `BILL${Math.random().toString().substr(2, 8)}`
        })
      };
    };

    return (
      <TouchableOpacity 
        key={item.id} 
        style={styles.activityItem}
        onPress={() => {
          // Convert activity item to transaction data and navigate to receipt
          const transactionData = convertToTransactionData(item);
          navigation.navigate('Receipt', { transaction: transactionData });
        }}
        activeOpacity={0.7}
      >
        <View style={[styles.iconContainer, { backgroundColor: `${statusColor}15` }]}>
          <IconComponent size={20} color={statusColor} />
        </View>
        
        <View style={styles.activityContent}>
          <View style={styles.activityHeader}>
            <Text style={styles.activityTitle}>{item.title}</Text>
            <View style={styles.statusContainer}>
              <StatusIcon size={12} color={statusColor} />
              <Text style={[styles.statusText, { color: statusColor }]}>
                {item.status}
              </Text>
            </View>
          </View>
          
          <View style={styles.activityFooter}>
            <Text style={styles.activitySubtitle}>{item.subtitle}</Text>
            <Text style={styles.activityTime}>{formatTime(item.timestamp)}</Text>
          </View>
        </View>
        
        {item.amount && (
          <Text style={[
            styles.activityAmount,
            { color: isPositive ? colors.success : colors.text }
          ]}>
            {formatAmount(item.amount, item.type)}
          </Text>
        )}
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Recent Activity</Text>
        <TouchableOpacity 
          style={styles.viewAllButton}
          onPress={() => navigation.navigate('Transactions')}
        >
          <Text style={styles.viewAllText}>View All</Text>
        </TouchableOpacity>
      </View>
      
      {isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="small" color="#06402B" />
          <Text style={styles.loadingText}>Loading activities...</Text>
        </View>
      ) : activities.length > 0 ? (
        <View style={styles.singleActivityContainer}>
          {renderActivityItem(activities[currentIndex])}
        </View>
      ) : (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>No recent activity</Text>
          <Text style={styles.emptySubtext}>Your transactions will appear here</Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.white,
    borderRadius: borderRadius.large,
    padding: spacing.md,
    ...shadows.medium,
    maxHeight: 160, // Increased to accommodate header and activity
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
  },
  viewAllButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  viewAllText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#06402B',
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.lg,
    gap: spacing.sm,
  },
  loadingText: {
    fontSize: 14,
    color: colors.secondaryText,
  },
  activitiesList: {
    maxHeight: 120, // Reduced scrollable area
  },
  singleActivityContainer: {
    minHeight: 60, // Ensure consistent height for single activity
  },
  activityItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.xs,
    borderRadius: borderRadius.medium,
    backgroundColor: 'transparent',
  },
  iconContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.sm,
  },
  activityContent: {
    flex: 1,
  },
  activityHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  activityTitle: {
    fontSize: 15,
    fontWeight: '500',
    color: colors.text,
    flex: 1,
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  statusText: {
    fontSize: 11,
    fontWeight: '500',
    textTransform: 'capitalize',
  },
  activityFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  activitySubtitle: {
    fontSize: 13,
    color: colors.secondaryText,
    flex: 1,
  },
  activityTime: {
    fontSize: 12,
    color: colors.secondaryText,
    fontWeight: '500',
  },
  activityAmount: {
    fontSize: 15,
    fontWeight: '600',
    marginLeft: spacing.sm,
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: spacing.lg,
  },
  emptyText: {
    fontSize: 16,
    fontWeight: '500',
    color: colors.text,
    marginBottom: spacing.xs,
  },
  emptySubtext: {
    fontSize: 14,
    color: colors.secondaryText,
    textAlign: 'center',
  },
});

export default ActivityCard;
