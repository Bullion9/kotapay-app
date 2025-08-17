import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  FlatList,
  RefreshControl,
  Modal,
  Pressable,
} from 'react-native';
import { ChevronLeft, Inbox, ChevronDown, Check, Filter } from 'lucide-react-native';
import { useNavigation } from '@react-navigation/native';
import { colors, globalStyles } from '../theme';
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
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [showSortModal, setShowSortModal] = useState(false);
  const [selectedSort, setSelectedSort] = useState('All');
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

  const loadMore = useCallback(() => {
    // Load next 50 transactions
    console.log('Loading more transactions...');
  }, []);

  const handleFilterPress = useCallback(() => {
    setShowFilterModal(true);
  }, []);

  const handleAllPress = useCallback(() => {
    setShowSortModal(true);
  }, []);

  const handleSortSelect = (sort: string) => {
    setSelectedSort(sort);
    setShowSortModal(false);
  };

  const getItemLayout = useCallback((data: any, index: number) => ({
    length: 72, // Approximate height of each transaction row
    offset: 72 * index,
    index,
  }), []);

  const keyExtractor = useCallback((item: Transaction) => item.id, []);

  const handleReceiptPress = useCallback((transaction: Transaction) => {
    // Convert Transaction to TransactionData format for ReceiptGenerator
    const mappedTransaction = {
      id: transaction.id,
      type: transaction.type === 'sent' ? 'SENT' as const :
            transaction.type === 'received' ? 'RECEIVED' as const :
            transaction.type === 'topup' ? 'CARD_TOP_UP' as const :
            transaction.type === 'bill' ? 'BILL_PAYMENT' as const :
            'SENT' as const,
      amount: transaction.amount,
      currency: transaction.currency,
      status: transaction.status === 'success' ? 'SUCCESS' as const :
              transaction.status === 'pending' ? 'PENDING' as const :
              transaction.status === 'failed' ? 'FAILED' as const :
              'SUCCESS' as const,
      date: transaction.timestamp.toLocaleDateString(),
      time: transaction.timestamp.toLocaleTimeString(),
      from: transaction.type === 'sent' || transaction.type === 'bill' ? 'You' : transaction.counterparty,
      to: transaction.type === 'sent' || transaction.type === 'bill' ? transaction.counterparty : 'You',
      note: `${transaction.type === 'sent' ? 'Payment to' : 
               transaction.type === 'received' ? 'Payment from' :
               transaction.type === 'topup' ? 'Account top-up via' :
               'Bill payment to'} ${transaction.counterparty}`,
      fee: 0, // Default fee, could be calculated based on transaction type
      total: transaction.amount,
      biometricAuth: true // Default to true for security
    };
    
    // Navigate to receipt screen with mapped transaction data
    navigation.navigate('Receipt', { transaction: mappedTransaction });
  }, [navigation]);

  const renderTransaction = useCallback(({ item }: { item: Transaction }) => (
    <TransactionRow 
      transaction={item} 
      onReceiptPress={handleReceiptPress}
    />
  ), [handleReceiptPress]);

  const renderSeparator = useCallback(() => (
    <View style={styles.separator} />
  ), []);

  const renderEmptyState = useCallback(() => (
    <View style={styles.emptyState}>
      <Inbox size={64} color="#A3AABE" />
      <Text style={styles.emptyText}>No transactions yet</Text>
    </View>
  ), []);

  return (
    <SafeAreaView style={styles.container}>
      {/* Authentic iOS Mail Header */}
      <View style={styles.header}>
        <TouchableOpacity 
          style={globalStyles.backButton}
          onPress={() => navigation.goBack()}
        >
          <ChevronLeft size={24} color={colors.primary} />
        </TouchableOpacity>
        
        <View style={styles.headerCenter}>
          <Text style={styles.title}>Transaction History</Text>
        </View>

        <View style={styles.placeholder} />
      </View>

      {/* All Button and Filter Row */}
      <View style={styles.allButtonContainer}>
        <TouchableOpacity style={styles.allButton} onPress={handleAllPress}>
          <Text style={styles.allText}>{selectedSort}</Text>
          <ChevronDown size={16} color="#06402B" strokeWidth={2} />
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.filterButton} onPress={handleFilterPress}>
          <Text style={styles.filterButtonText}>Filter</Text>
          <Filter size={16} color="#06402B" strokeWidth={2} />
        </TouchableOpacity>
      </View>

      {/* Transactions List */}
      <View style={styles.content}>
        <FlatList
          data={transactions}
          keyExtractor={keyExtractor}
          renderItem={renderTransaction}
          getItemLayout={getItemLayout}
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
          removeClippedSubviews={true}
          maxToRenderPerBatch={15}
          updateCellsBatchingPeriod={50}
          initialNumToRender={15}
          windowSize={10}
          legacyImplementation={false}
          disableVirtualization={false}
        />
      </View>

      {/* Filter Modal */}
      <Modal
        visible={showFilterModal}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowFilterModal(false)}
      >
        <Pressable 
          style={styles.modalOverlay}
          onPress={() => setShowFilterModal(false)}
        >
          <View style={styles.bottomSheet}>
            <View style={styles.modalHandle} />
            <Text style={styles.modalTitle}>Filter</Text>
            
            <TouchableOpacity style={styles.modalOption}>
              <Text style={styles.modalOptionText}>Date Range</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.modalOption}>
              <Text style={styles.modalOptionText}>Amount Range</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.modalOption}>
              <Text style={styles.modalOptionText}>Status</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.modalOption}>
              <Text style={styles.modalOptionText}>Reset Filters</Text>
            </TouchableOpacity>
          </View>
        </Pressable>
      </Modal>

      {/* Sort Modal (All button) */}
      <Modal
        visible={showSortModal}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowSortModal(false)}
      >
        <Pressable 
          style={styles.modalOverlay}
          onPress={() => setShowSortModal(false)}
        >
          <View style={styles.bottomSheet}>
            <View style={styles.modalHandle} />
            <Text style={styles.modalTitle}>Sort by</Text>
            
            {['All', 'Sent', 'Received', 'Bills', 'Top-ups'].map((sort) => (
              <TouchableOpacity
                key={sort}
                style={styles.modalOption}
                onPress={() => handleSortSelect(sort)}
              >
                <Text style={[
                  styles.modalOptionText,
                  selectedSort === sort && styles.selectedOptionText
                ]}>
                  {sort}
                </Text>
                {selectedSort === sort && (
                  <Check size={20} color="#06402B" />
                )}
              </TouchableOpacity>
            ))}
          </View>
        </Pressable>
      </Modal>
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
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5E5',
    backgroundColor: '#FFF0F5',
  },
  headerCenter: {
    flex: 1,
    alignItems: 'center',
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: '#06402B',
  },
  filterButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#E5E5E5',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  filterButtonText: {
    fontSize: 16,
    color: '#06402B',
    fontWeight: '500',
    marginRight: 6,
  },
  content: {
    flex: 1,
    backgroundColor: '#FFF0F5', // Same as NotificationScreen
  },
  allButtonContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5E5',
  },
  allButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#E5E5E5',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  placeholder: {
    width: 40,
  },
  allText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#06402B',
    marginRight: 6,
  },
  filterContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5E5',
  },
  filterTab: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginRight: 12,
    borderRadius: 8,
    backgroundColor: '#F5F5F5',
  },
  activeFilterTab: {
    backgroundColor: '#06402B',
  },
  filterText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#666666',
  },
  activeFilterText: {
    color: '#FFFFFF',
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
  // Modal styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  bottomSheet: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingTop: 8,
    paddingBottom: 34,
    minHeight: 200,
  },
  modalHandle: {
    width: 36,
    height: 4,
    backgroundColor: '#C7C7CC',
    borderRadius: 2,
    alignSelf: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 17,
    fontWeight: '600',
    color: '#000000',
    textAlign: 'center',
    marginBottom: 20,
  },
  modalOption: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 0.5,
    borderBottomColor: '#E5E5E5',
  },
  modalOptionText: {
    fontSize: 17,
    color: '#000000',
  },
  selectedOptionText: {
    color: '#007AFF',
    fontWeight: '600',
  },
});

export default TransactionHistoryScreen;
