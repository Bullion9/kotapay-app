import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  FlatList,
  RefreshControl,
} from 'react-native';
import { ChevronLeft, Inbox } from 'lucide-react-native';
import { useNavigation } from '@react-navigation/native';
import TransactionRow from '../components/TransactionRow';

interface Transaction {
  id: string;
  type: 'sent' | 'received' | 'topup' | 'bill';
  counterparty: string;
  amount: number;
  currency: string;
  status: 'success' | 'pending' | 'failed';
  timestamp: Date;
}

const TransactionHistoryScreen: React.FC = () => {
  const navigation = useNavigation();
  const [refreshing, setRefreshing] = useState(false);
  const [transactions] = useState<Transaction[]>([
    {
      id: '1',
      type: 'received',
      counterparty: 'John Doe',
      amount: 5000,
      currency: '₦',
      status: 'success',
      timestamp: new Date(Date.now() - 1000 * 60 * 30), // 30 minutes ago
    },
    {
      id: '2',
      type: 'sent',
      counterparty: 'Sarah Johnson',
      amount: 1200,
      currency: '₦',
      status: 'success',
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2), // 2 hours ago
    },
    {
      id: '3',
      type: 'bill',
      counterparty: 'PHCN Electric',
      amount: 850,
      currency: '₦',
      status: 'pending',
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 4), // 4 hours ago
    },
    {
      id: '4',
      type: 'topup',
      counterparty: 'Bank Transfer',
      amount: 10000,
      currency: '₦',
      status: 'success',
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24), // 1 day ago
    },
    {
      id: '5',
      type: 'sent',
      counterparty: 'Mike Chen',
      amount: 3500,
      currency: '₦',
      status: 'failed',
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2), // 2 days ago
    },
  ]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    // Simulate API call
    setTimeout(() => {
      setRefreshing(false);
    }, 1000);
  }, []);

  const loadMore = () => {
    // Load next 50 transactions
    console.log('Loading more transactions...');
  };

  const renderTransaction = ({ item }: { item: Transaction }) => (
    <TransactionRow transaction={item} />
  );

  const renderSeparator = () => (
    <View style={styles.separator} />
  );

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <Inbox size={64} color="#A3AABE" />
      <Text style={styles.emptyText}>No transactions yet</Text>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <ChevronLeft size={24} color="#000d10" />
        </TouchableOpacity>
        <Text style={styles.title}>History</Text>
        <View style={styles.placeholder} />
      </View>

      {/* Transactions List */}
      <FlatList
        data={transactions}
        keyExtractor={(item) => item.id}
        renderItem={renderTransaction}
        ItemSeparatorComponent={renderSeparator}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor="#06402B"
            colors={['#06402B']}
          />
        }
        onEndReached={loadMore}
        onEndReachedThreshold={0.3}
        ListEmptyComponent={renderEmptyState}
        style={styles.list}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFF0F5',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#FFF0F5',
  },
  backButton: {
    padding: 8,
  },
  title: {
    fontSize: 18,
    fontWeight: '500',
    color: '#000d10',
    fontFamily: 'Poppins-Medium',
  },
  placeholder: {
    width: 40, // Same width as back button for centering
  },
  list: {
    flex: 1,
  },
  separator: {
    height: 1,
    backgroundColor: '#E5E5E5',
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 100,
  },
  emptyText: {
    fontSize: 14,
    color: '#A3AABE',
    marginTop: 16,
  },
});

export default TransactionHistoryScreen;
