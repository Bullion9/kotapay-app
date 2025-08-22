import React, { useState, useCallback, useEffect } from 'react';
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
  const [showDateFilter, setShowDateFilter] = useState(false);
  const [showAmountFilter, setShowAmountFilter] = useState(false);
  const [showStatusFilter, setShowStatusFilter] = useState(false);
  const [selectedSort, setSelectedSort] = useState('All');
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [filteredTransactions, setFilteredTransactions] = useState<Transaction[]>([]);
  
  // Filter states
  const [selectedDateRange, setSelectedDateRange] = useState('All Time');
  const [selectedAmountRange, setSelectedAmountRange] = useState('All Amounts');
  const [selectedStatus, setSelectedStatus] = useState('All Status');
  const [hasActiveFilters, setHasActiveFilters] = useState(false);

  const loadInitialTransactions = useCallback(async () => {
    try {
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const mockTransactions: Transaction[] = [
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
        {
          id: '6',
          type: 'bill',
          counterparty: 'MTN Airtime',
          amount: 1000,
          currency: '₦',
          status: 'success',
          timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24 * 3), // 3 days ago
        },
        {
          id: '7',
          type: 'received',
          counterparty: 'Alice Cooper',
          amount: 7500,
          currency: '₦',
          status: 'success',
          timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24 * 5), // 5 days ago
        },
        {
          id: '8',
          type: 'topup',
          counterparty: 'Card Payment',
          amount: 15000,
          currency: '₦',
          status: 'success',
          timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24 * 7), // 1 week ago
        },
      ];
      
      setTransactions(mockTransactions);
    } catch (error) {
      console.error('Error loading transactions:', error);
    }
  }, []);

  const applyFilters = useCallback(() => {
    let filtered = [...transactions];

    // Filter by type/sort
    if (selectedSort !== 'All') {
      const typeMap: { [key: string]: string } = {
        'Sent': 'sent',
        'Received': 'received',
        'Bills': 'bill',
        'Top-ups': 'topup'
      };
      const filterType = typeMap[selectedSort];
      if (filterType) {
        filtered = filtered.filter(t => t.type === filterType);
      }
    }

    // Filter by date range
    if (selectedDateRange !== 'All Time') {
      const now = new Date();
      const filterMap: { [key: string]: number } = {
        'Today': 1,
        'Last 7 days': 7,
        'Last 30 days': 30,
        'Last 90 days': 90
      };
      const days = filterMap[selectedDateRange];
      if (days) {
        const cutoffDate = new Date(now.getTime() - days * 24 * 60 * 60 * 1000);
        filtered = filtered.filter(t => t.timestamp >= cutoffDate);
      }
    }

    // Filter by amount range
    if (selectedAmountRange !== 'All Amounts') {
      const rangeMap: { [key: string]: { min: number; max: number } } = {
        'Under ₦1,000': { min: 0, max: 1000 },
        '₦1,000 - ₦5,000': { min: 1000, max: 5000 },
        '₦5,000 - ₦10,000': { min: 5000, max: 10000 },
        'Above ₦10,000': { min: 10000, max: Infinity }
      };
      const range = rangeMap[selectedAmountRange];
      if (range) {
        filtered = filtered.filter(t => t.amount > range.min && t.amount <= range.max);
      }
    }

    // Filter by status
    if (selectedStatus !== 'All Status') {
      const statusMap: { [key: string]: string } = {
        'Successful': 'success',
        'Pending': 'pending',
        'Failed': 'failed'
      };
      const filterStatus = statusMap[selectedStatus];
      if (filterStatus) {
        filtered = filtered.filter(t => t.status === filterStatus);
      }
    }

    // Check if any filters are active
    const hasFilters = selectedSort !== 'All' || 
                      selectedDateRange !== 'All Time' || 
                      selectedAmountRange !== 'All Amounts' || 
                      selectedStatus !== 'All Status';
    
    setHasActiveFilters(hasFilters);
    setFilteredTransactions(filtered);
  }, [transactions, selectedSort, selectedDateRange, selectedAmountRange, selectedStatus]);

  // Initialize with mock data - replace with API call
  useEffect(() => {
    loadInitialTransactions();
  }, [loadInitialTransactions]);

  // Filter transactions when filters change
  useEffect(() => {
    applyFilters();
  }, [applyFilters]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      await loadInitialTransactions();
    } finally {
      setRefreshing(false);
    }
  }, [loadInitialTransactions]);

  const loadMore = useCallback(() => {
    // Load next 50 transactions
    console.log('Loading more transactions...');
  }, []);

  const handleFilterPress = useCallback(() => {
    setShowFilterModal(true);
  }, []);

  const handleDateFilterPress = useCallback(() => {
    setShowFilterModal(false);
    setShowDateFilter(true);
  }, []);

  const handleAmountFilterPress = useCallback(() => {
    setShowFilterModal(false);
    setShowAmountFilter(true);
  }, []);

  const handleStatusFilterPress = useCallback(() => {
    setShowFilterModal(false);
    setShowStatusFilter(true);
  }, []);

  const handleResetFilters = useCallback(() => {
    setSelectedDateRange('All Time');
    setSelectedAmountRange('All Amounts');
    setSelectedStatus('All Status');
    setSelectedSort('All');
    setShowFilterModal(false);
  }, []);

  const handleDateSelect = (dateRange: string) => {
    setSelectedDateRange(dateRange);
    setShowDateFilter(false);
  };

  const handleAmountSelect = (amountRange: string) => {
    setSelectedAmountRange(amountRange);
    setShowAmountFilter(false);
  };

  const handleStatusSelect = (status: string) => {
    setSelectedStatus(status);
    setShowStatusFilter(false);
  };

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
      {/* Header */}
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
        
        <TouchableOpacity style={[
          styles.filterButton,
          hasActiveFilters && styles.filterButtonActive
        ]} onPress={handleFilterPress}>
          <Text style={[
            styles.filterButtonText,
            hasActiveFilters && styles.filterButtonTextActive
          ]}>Filter</Text>
          <Filter size={16} color={hasActiveFilters ? "#FFFFFF" : "#06402B"} strokeWidth={2} />
        </TouchableOpacity>
      </View>

      {/* Transaction Summary */}
      {filteredTransactions.length > 0 && (
        <View style={styles.summaryContainer}>
          <Text style={styles.summaryText}>
            {filteredTransactions.length} transaction{filteredTransactions.length !== 1 ? 's' : ''}
            {selectedSort !== 'All' && ` (${selectedSort.toLowerCase()})`}
          </Text>
        </View>
      )}

      {/* Transactions List */}
      <View style={styles.content}>
        <FlatList
          data={filteredTransactions}
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
            
            <TouchableOpacity 
              style={styles.modalOption}
              onPress={handleDateFilterPress}
            >
              <Text style={styles.modalOptionText}>Date Range</Text>
              <Text style={styles.modalOptionValue}>{selectedDateRange}</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={styles.modalOption}
              onPress={handleAmountFilterPress}
            >
              <Text style={styles.modalOptionText}>Amount Range</Text>
              <Text style={styles.modalOptionValue}>{selectedAmountRange}</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={styles.modalOption}
              onPress={handleStatusFilterPress}
            >
              <Text style={styles.modalOptionText}>Status</Text>
              <Text style={styles.modalOptionValue}>{selectedStatus}</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={[styles.modalOption, styles.resetOption]}
              onPress={handleResetFilters}
            >
              <Text style={styles.resetOptionText}>Reset Filters</Text>
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

      {/* Date Filter Modal */}
      <Modal
        visible={showDateFilter}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowDateFilter(false)}
      >
        <Pressable 
          style={styles.modalOverlay}
          onPress={() => setShowDateFilter(false)}
        >
          <View style={styles.bottomSheet}>
            <View style={styles.modalHandle} />
            <Text style={styles.modalTitle}>Date Range</Text>
            
            {['All Time', 'Today', 'Last 7 days', 'Last 30 days', 'Last 90 days'].map((dateRange) => (
              <TouchableOpacity
                key={dateRange}
                style={styles.modalOption}
                onPress={() => handleDateSelect(dateRange)}
              >
                <Text style={[
                  styles.modalOptionText,
                  selectedDateRange === dateRange && styles.selectedOptionText
                ]}>
                  {dateRange}
                </Text>
                {selectedDateRange === dateRange && (
                  <Check size={20} color="#06402B" />
                )}
              </TouchableOpacity>
            ))}
          </View>
        </Pressable>
      </Modal>

      {/* Amount Filter Modal */}
      <Modal
        visible={showAmountFilter}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowAmountFilter(false)}
      >
        <Pressable 
          style={styles.modalOverlay}
          onPress={() => setShowAmountFilter(false)}
        >
          <View style={styles.bottomSheet}>
            <View style={styles.modalHandle} />
            <Text style={styles.modalTitle}>Amount Range</Text>
            
            {['All Amounts', 'Under ₦1,000', '₦1,000 - ₦5,000', '₦5,000 - ₦10,000', 'Above ₦10,000'].map((amountRange) => (
              <TouchableOpacity
                key={amountRange}
                style={styles.modalOption}
                onPress={() => handleAmountSelect(amountRange)}
              >
                <Text style={[
                  styles.modalOptionText,
                  selectedAmountRange === amountRange && styles.selectedOptionText
                ]}>
                  {amountRange}
                </Text>
                {selectedAmountRange === amountRange && (
                  <Check size={20} color="#06402B" />
                )}
              </TouchableOpacity>
            ))}
          </View>
        </Pressable>
      </Modal>

      {/* Status Filter Modal */}
      <Modal
        visible={showStatusFilter}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowStatusFilter(false)}
      >
        <Pressable 
          style={styles.modalOverlay}
          onPress={() => setShowStatusFilter(false)}
        >
          <View style={styles.bottomSheet}>
            <View style={styles.modalHandle} />
            <Text style={styles.modalTitle}>Status</Text>
            
            {['All Status', 'Successful', 'Pending', 'Failed'].map((status) => (
              <TouchableOpacity
                key={status}
                style={styles.modalOption}
                onPress={() => handleStatusSelect(status)}
              >
                <Text style={[
                  styles.modalOptionText,
                  selectedStatus === status && styles.selectedOptionText
                ]}>
                  {status}
                </Text>
                {selectedStatus === status && (
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
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  filterButtonActive: {
    backgroundColor: '#06402B',
    borderColor: '#06402B',
  },
  filterButtonText: {
    fontSize: 16,
    color: '#06402B',
    fontWeight: '500',
    marginRight: 6,
  },
  filterButtonTextActive: {
    color: '#FFFFFF',
  },
  content: {
    flex: 1,
    backgroundColor: '#FFF0F5',
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
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
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
  summaryContainer: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: '#FFF0F5',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5E5',
  },
  summaryText: {
    fontSize: 14,
    color: '#666666',
    fontStyle: 'italic',
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
  modalOptionValue: {
    fontSize: 15,
    color: '#666666',
    fontStyle: 'italic',
  },
  resetOption: {
    borderBottomWidth: 0,
    marginTop: 10,
  },
  resetOptionText: {
    fontSize: 17,
    color: '#FF3B30',
    fontWeight: '600',
  },
  selectedOptionText: {
    color: '#007AFF',
    fontWeight: '600',
  },
});

export default TransactionHistoryScreen;
