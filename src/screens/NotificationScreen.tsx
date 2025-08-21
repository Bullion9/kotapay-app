import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  FlatList,
  RefreshControl,
  ScrollView,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { 
  ChevronLeft,
  Mail, 
  Check,
  Trash2,
} from 'lucide-react-native';
// @ts-ignore
import * as Haptics from 'expo-haptics';
import { colors, spacing, borderRadius, iconSizes, globalStyles } from '../theme';

interface Notification {
  id: string;
  title: string;
  message: string;
  timestamp: Date;
  read: boolean;
  type: 'transaction' | 'system' | 'promotional' | 'security';
  icon: string;
}

const NotificationScreen: React.FC = () => {
  const navigation = useNavigation<StackNavigationProp<any>>();
  const [refreshing, setRefreshing] = useState(false);
  
  const [notifications, setNotifications] = useState<Notification[]>([
    {
      id: '1',
      title: 'Money Received',
      message: 'You received ₦250.00 from John Doe',
      timestamp: new Date(Date.now() - 1000 * 60 * 30), // 30 minutes ago
      read: false,
      type: 'transaction',
      icon: '💰',
    },
    {
      id: '2',
      title: 'Payment Request',
      message: 'Sarah Johnson requested ₦75.00 for dinner',
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2), // 2 hours ago
      read: false,
      type: 'transaction',
      icon: '📥',
    },
    {
      id: '3',
      title: 'Security Alert',
      message: 'New device logged into your account',
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 4), // 4 hours ago
      read: true,
      type: 'security',
      icon: '🔒',
    },
    {
      id: '4',
      title: 'Virtual Card Created',
      message: 'Your new virtual card ending in 4532 is ready',
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24), // 1 day ago
      read: true,
      type: 'system',
      icon: '💳',
    },
    {
      id: '5',
      title: 'Weekly Cashback',
      message: 'You earned ₦12.50 in cashback this week!',
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2), // 2 days ago
      read: true,
      type: 'promotional',
      icon: '🎁',
    },
  ]);

  const [filter, setFilter] = useState<'all' | 'unread'>('all');

  // Simulated refresh function to fetch new notifications
  const onRefresh = async () => {
    setRefreshing(true);
    
    // Haptic feedback when refresh starts
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    
    // Simulate network request delay
    await new Promise<void>(resolve => setTimeout(resolve, 1500));
    
    // Simulate adding new notifications
    const newNotifications: Notification[] = [
      {
        id: `new-${Date.now()}`,
        title: 'Payment Successful',
        message: 'Your payment of ₦1,200.00 to MTN was successful',
        timestamp: new Date(),
        read: false,
        type: 'transaction',
        icon: '✅',
      },
      {
        id: `new-${Date.now() + 1}`,
        title: 'Account Update',
        message: 'Your profile information has been updated successfully',
        timestamp: new Date(Date.now() - 1000 * 60 * 5), // 5 minutes ago
        read: false,
        type: 'system',
        icon: '👤',
      },
    ];
    
    // Add new notifications to the beginning of the list
    setNotifications(prev => [...newNotifications, ...prev]);
    
    // Haptic feedback when refresh completes
    await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    
    setRefreshing(false);
  };

  const formatTimestamp = (timestamp: Date): string => {
    const now = new Date();
    const diffMs = now.getTime() - timestamp.getTime();
    const diffMins = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffMins < 60) {
      return `${diffMins}m ago`;
    } else if (diffHours < 24) {
      return `${diffHours}h ago`;
    } else {
      return `${diffDays}d ago`;
    }
  };

  const markAsRead = (id: string) => {
    setNotifications(prev =>
      prev.map(notif =>
        notif.id === id ? { ...notif, read: true } : notif
      )
    );
  };

  const markAllAsRead = () => {
    setNotifications(prev =>
      prev.map(notif => ({ ...notif, read: true }))
    );
  };

  const deleteNotification = (id: string) => {
    setNotifications(prev => prev.filter(notif => notif.id !== id));
  };

  const filteredNotifications = filter === 'all' 
    ? notifications 
    : notifications.filter(n => !n.read);

  const unreadCount = notifications.filter(n => !n.read).length;

  const getTypeColor = (type: string): string => {
    switch (type) {
      case 'transaction': return colors.primary;
      case 'security': return colors.error;
      case 'promotional': return colors.success;
      case 'system': return colors.accent;
      default: return colors.primary;
    }
  };

  const renderNotificationItem = ({ item }: { item: Notification }) => (
    <TouchableOpacity
      style={[styles.notificationItem, !item.read && styles.unreadItem]}
      onPress={() => markAsRead(item.id)}
      activeOpacity={0.7}
    >
      <View style={styles.notificationLeft}>
        <View style={[styles.iconContainer, { backgroundColor: getTypeColor(item.type) + '20' }]}>
          <Text style={styles.notificationIcon}>{item.icon}</Text>
        </View>
        <View style={styles.notificationContent}>
          <Text style={[styles.notificationTitle, !item.read && styles.unreadTitle]}>
            {item.title}
          </Text>
          <Text style={styles.notificationMessage}>{item.message}</Text>
          <Text style={styles.notificationTime}>{formatTimestamp(item.timestamp)}</Text>
        </View>
      </View>
      
      <View style={styles.notificationRight}>
        {!item.read && <View style={styles.unreadDot} />}
        <TouchableOpacity
          style={styles.deleteButton}
          onPress={(e) => {
            e.stopPropagation();
            deleteNotification(item.id);
          }}
        >
          <Trash2 size={16} color={colors.secondaryText} />
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={globalStyles.backButton}
          onPress={() => navigation.goBack()}
        >
          <ChevronLeft size={24} color={colors.primary} />
        </TouchableOpacity>
        
        <View style={styles.headerCenter}>
          <Text style={styles.headerTitle}>Notifications</Text>
          {unreadCount > 0 && (
            <Text style={styles.headerSubtitle}>{unreadCount} unread</Text>
          )}
        </View>

        <TouchableOpacity
          style={styles.markAllButton}
          onPress={markAllAsRead}
          disabled={unreadCount === 0}
        >
          <Check size={iconSizes.md} color={unreadCount > 0 ? colors.primary : colors.secondaryText} />
        </TouchableOpacity>
      </View>

      {/* Filter Tabs */}
      <View style={styles.filterContainer}>
        <TouchableOpacity
          style={[styles.filterTab, filter === 'all' && styles.activeFilterTab]}
          onPress={() => setFilter('all')}
        >
          <Text style={[styles.filterText, filter === 'all' && styles.activeFilterText]}>
            All ({notifications.length})
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[styles.filterTab, filter === 'unread' && styles.activeFilterTab]}
          onPress={() => setFilter('unread')}
        >
          <Text style={[styles.filterText, filter === 'unread' && styles.activeFilterText]}>
            Unread ({unreadCount})
          </Text>
        </TouchableOpacity>
      </View>

      {/* Notifications List */}
      {filteredNotifications.length > 0 ? (
        <FlatList
          data={filteredNotifications}
          renderItem={renderNotificationItem}
          keyExtractor={(item) => item.id}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.listContainer}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor={colors.primary}
              colors={[colors.primary]}
              progressBackgroundColor={colors.background}
            />
          }
        />
      ) : (
        <ScrollView
          contentContainerStyle={styles.emptyContainer}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor={colors.primary}
              colors={[colors.primary]}
              progressBackgroundColor={colors.background}
            />
          }
        >
          <Mail size={64} color={colors.secondaryText} />
          <Text style={styles.emptyTitle}>
            {filter === 'unread' ? 'No unread notifications' : 'No notifications'}
          </Text>
          <Text style={styles.emptyMessage}>
            {filter === 'unread' 
              ? 'All caught up! Check back later for new notifications.'
              : 'When you receive notifications, they will appear here.'
            }
          </Text>
          <Text style={styles.pullToRefreshHint}>
            Pull down to refresh
          </Text>
        </ScrollView>
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
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  headerCenter: {
    flex: 1,
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
  },
  headerSubtitle: {
    fontSize: 14,
    color: colors.secondaryText,
    marginTop: 2,
  },
  markAllButton: {
    padding: spacing.xs,
  },
  filterContainer: {
    flexDirection: 'row',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  filterTab: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    marginRight: spacing.md,
    borderRadius: borderRadius.medium,
    backgroundColor: colors.card,
  },
  activeFilterTab: {
    backgroundColor: colors.primary,
  },
  filterText: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.secondaryText,
  },
  activeFilterText: {
    color: colors.white,
  },
  listContainer: {
    paddingVertical: spacing.sm,
  },
  notificationItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    backgroundColor: colors.background,
  },
  unreadItem: {
    backgroundColor: colors.card,
  },
  notificationLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  notificationIcon: {
    fontSize: 20,
  },
  notificationContent: {
    flex: 1,
  },
  notificationTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: colors.text,
    marginBottom: 2,
  },
  unreadTitle: {
    fontWeight: '600',
  },
  notificationMessage: {
    fontSize: 14,
    color: colors.secondaryText,
    marginBottom: 4,
  },
  notificationTime: {
    fontSize: 12,
    color: colors.secondaryText,
  },
  notificationRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.primary,
    marginRight: spacing.sm,
  },
  deleteButton: {
    padding: spacing.xs,
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.xl,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
    marginTop: spacing.lg,
    marginBottom: spacing.sm,
  },
  emptyMessage: {
    fontSize: 14,
    color: colors.secondaryText,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: spacing.md,
  },
  pullToRefreshHint: {
    fontSize: 12,
    color: colors.primary,
    textAlign: 'center',
    fontStyle: 'italic',
  },
});

export default NotificationScreen;
