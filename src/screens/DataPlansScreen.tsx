import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  RefreshControl,
  FlatList,
  ActivityIndicator,
} from 'react-native';
import { useTheme } from '../contexts/ThemeContext';
import { usePaystack } from '../hooks/usePaystack';
import { DataPlan } from '../services/PaystackService';

interface DataPlansScreenProps {
  navigation: any;
}

const DataPlansScreen: React.FC<DataPlansScreenProps> = ({ navigation }) => {
  const { theme } = useTheme();
  const {
    dataPlans,
    networkDataPlans,
    loadingDataPlans,
    purchasingData,
    getAllDataPlans,
    getDataPlansByNetwork,
    getPopularDataPlans,
    getDataPlansByPriceRange,
    getDataPlansByValidity,
    buyDataPlan,
    error,
    clearError,
  } = usePaystack();

  const [selectedNetwork, setSelectedNetwork] = useState<'mtn' | 'glo' | 'airtel' | '9mobile' | 'all'>('all');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [selectedPlan, setSelectedPlan] = useState<DataPlan | null>(null);
  const [filterType, setFilterType] = useState<'all' | 'popular' | 'price' | 'validity'>('all');
  const [priceRange, setPriceRange] = useState({ min: 0, max: 10000 });
  const [validityFilter, setValidityFilter] = useState<'daily' | 'weekly' | 'monthly' | 'yearly'>('monthly');
  const [refreshing, setRefreshing] = useState(false);

  const loadData = useCallback(async () => {
    try {
      await getAllDataPlans();
    } catch (error) {
      console.error('Error loading data plans:', error);
    }
  }, [getAllDataPlans]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const onRefresh = async () => {
    setRefreshing(true);
    try {
      await loadData();
    } finally {
      setRefreshing(false);
    }
  };

  const handleNetworkFilter = async (network: 'mtn' | 'glo' | 'airtel' | '9mobile' | 'all') => {
    setSelectedNetwork(network);
    clearError();
    
    if (network === 'all') {
      await getAllDataPlans();
    } else {
      try {
        await getDataPlansByNetwork(network);
      } catch (error) {
        console.error(`Error loading ${network} plans:`, error);
      }
    }
  };

  const handleFilterChange = async (newFilter: 'all' | 'popular' | 'price' | 'validity') => {
    setFilterType(newFilter);
    clearError();

    try {
      switch (newFilter) {
        case 'all':
          await getAllDataPlans();
          break;
        case 'popular':
          await getPopularDataPlans();
          break;
        case 'price':
          await getDataPlansByPriceRange(priceRange.min, priceRange.max);
          break;
        case 'validity':
          await getDataPlansByValidity(validityFilter);
          break;
      }
    } catch (error) {
      console.error(`Error applying ${newFilter} filter:`, error);
    }
  };

  const handlePurchase = async () => {
    if (!selectedPlan || !phoneNumber) {
      Alert.alert('Error', 'Please select a plan and enter phone number');
      return;
    }

    if (!isValidPhoneNumber(phoneNumber)) {
      Alert.alert('Error', 'Please enter a valid Nigerian phone number');
      return;
    }

    try {
      const purchaseData = {
        phone: phoneNumber,
        plan_id: selectedPlan.plan_id,
        amount: selectedPlan.price,
        network: selectedPlan.network,
        data_value: selectedPlan.data_value,
        validity: selectedPlan.validity,
      };

      const response = await buyDataPlan(purchaseData);
      
      Alert.alert(
        'Success!',
        `Data plan purchased successfully!\nReference: ${response.data.reference}`,
        [
          {
            text: 'OK',
            onPress: () => {
              setSelectedPlan(null);
              setPhoneNumber('');
            },
          },
        ]
      );
    } catch (error) {
      Alert.alert('Purchase Failed', error.message || 'Failed to purchase data plan');
    }
  };

  const isValidPhoneNumber = (phone: string): boolean => {
    const phoneRegex = /^(\+234|234|0)?[789][01]\d{8}$/;
    return phoneRegex.test(phone.replace(/\s+/g, ''));
  };

  const autoDetectNetwork = (phone: string) => {
    const cleanPhone = phone.replace(/\s+/g, '').replace(/^\+234|^234|^0/, '');
    if (cleanPhone.length >= 3) {
      const prefix = cleanPhone.substring(0, 3);
      
      // MTN prefixes
      if (['803', '806', '813', '814', '816', '903', '906', '913', '916'].includes(prefix)) {
        setSelectedNetwork('mtn');
        handleNetworkFilter('mtn');
      }
      // Glo prefixes
      else if (['805', '807', '811', '815', '905', '915'].includes(prefix)) {
        setSelectedNetwork('glo');
        handleNetworkFilter('glo');
      }
      // Airtel prefixes
      else if (['802', '808', '812', '901', '902', '904', '907', '912'].includes(prefix)) {
        setSelectedNetwork('airtel');
        handleNetworkFilter('airtel');
      }
      // 9mobile prefixes
      else if (['809', '817', '818', '908', '909'].includes(prefix)) {
        setSelectedNetwork('9mobile');
        handleNetworkFilter('9mobile');
      }
    }
  };

  const renderNetworkButton = (network: 'mtn' | 'glo' | 'airtel' | '9mobile' | 'all', label: string) => (
    <TouchableOpacity
      style={[
        styles.networkButton,
        { backgroundColor: selectedNetwork === network ? theme.primary : theme.surface },
        { borderColor: theme.primary },
      ]}
      onPress={() => handleNetworkFilter(network)}
    >
      <Text
        style={[
          styles.networkButtonText,
          { color: selectedNetwork === network ? theme.surface : theme.primary },
        ]}
      >
        {label}
      </Text>
    </TouchableOpacity>
  );

  const renderFilterButton = (filter: 'all' | 'popular' | 'price' | 'validity', label: string) => (
    <TouchableOpacity
      style={[
        styles.filterButton,
        { backgroundColor: filterType === filter ? theme.primary : theme.surface },
        { borderColor: theme.primary },
      ]}
      onPress={() => handleFilterChange(filter)}
    >
      <Text
        style={[
          styles.filterButtonText,
          { color: filterType === filter ? theme.surface : theme.primary },
        ]}
      >
        {label}
      </Text>
    </TouchableOpacity>
  );

  const renderDataPlan = ({ item }: { item: DataPlan }) => (
    <TouchableOpacity
      style={[
        styles.planCard,
        { backgroundColor: theme.surface, borderColor: theme.border },
        selectedPlan?.plan_id === item.plan_id && { borderColor: theme.primary, borderWidth: 2 },
      ]}
      onPress={() => setSelectedPlan(item)}
    >
      <View style={styles.planHeader}>
        <Text style={[styles.planName, { color: theme.text }]}>{item.name}</Text>
        <Text style={[styles.planNetwork, { color: theme.primary }]}>{item.network.toUpperCase()}</Text>
      </View>
      
      <View style={styles.planDetails}>
        <Text style={[styles.planData, { color: theme.text }]}>{item.data_value}</Text>
        <Text style={[styles.planValidity, { color: theme.textSecondary }]}>{item.validity}</Text>
      </View>
      
      <View style={styles.planFooter}>
        <Text style={[styles.planPrice, { color: theme.primary }]}>₦{item.price.toLocaleString()}</Text>
        <Text style={[styles.planType, { color: theme.textSecondary }]}>{item.plan_type}</Text>
      </View>
    </TouchableOpacity>
  );

  const getFilteredPlans = () => {
    if (selectedNetwork === 'all') {
      return dataPlans;
    }
    
    const networkGroup = networkDataPlans.find(group => group.network === selectedNetwork);
    return networkGroup ? networkGroup.plans : [];
  };

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: theme.background }]}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
    >
      {/* Header */}
      <View style={styles.header}>
        <Text style={[styles.title, { color: theme.text }]}>Data Plans</Text>
        <Text style={[styles.subtitle, { color: theme.textSecondary }]}>
          Purchase data plans for all Nigerian networks
        </Text>
      </View>

      {/* Phone Number Input */}
      <View style={styles.inputSection}>
        <Text style={[styles.inputLabel, { color: theme.text }]}>Phone Number</Text>
        <TextInput
          style={[
            styles.phoneInput,
            { backgroundColor: theme.surface, color: theme.text, borderColor: theme.border },
          ]}
          placeholder="Enter phone number (e.g., 08012345678)"
          placeholderTextColor={theme.textSecondary}
          value={phoneNumber}
          onChangeText={(text) => {
            setPhoneNumber(text);
            if (text.length >= 4) {
              autoDetectNetwork(text);
            }
          }}
          keyboardType="phone-pad"
        />
      </View>

      {/* Network Filter */}
      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: theme.text }]}>Select Network</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.networkButtons}>
          {renderNetworkButton('all', 'All')}
          {renderNetworkButton('mtn', 'MTN')}
          {renderNetworkButton('glo', 'Glo')}
          {renderNetworkButton('airtel', 'Airtel')}
          {renderNetworkButton('9mobile', '9mobile')}
        </ScrollView>
      </View>

      {/* Filter Options */}
      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: theme.text }]}>Filter Plans</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterButtons}>
          {renderFilterButton('all', 'All Plans')}
          {renderFilterButton('popular', 'Popular')}
          {renderFilterButton('price', 'By Price')}
          {renderFilterButton('validity', 'By Validity')}
        </ScrollView>
      </View>

      {/* Additional Filter Controls */}
      {filterType === 'price' && (
        <View style={styles.priceRangeSection}>
          <Text style={[styles.inputLabel, { color: theme.text }]}>Price Range</Text>
          <View style={styles.priceInputs}>
            <TextInput
              style={[styles.priceInput, { backgroundColor: theme.surface, color: theme.text, borderColor: theme.border }]}
              placeholder="Min"
              value={priceRange.min.toString()}
              onChangeText={(text) => setPriceRange(prev => ({ ...prev, min: parseInt(text) || 0 }))}
              keyboardType="numeric"
            />
            <Text style={[styles.priceToText, { color: theme.text }]}>to</Text>
            <TextInput
              style={[styles.priceInput, { backgroundColor: theme.surface, color: theme.text, borderColor: theme.border }]}
              placeholder="Max"
              value={priceRange.max.toString()}
              onChangeText={(text) => setPriceRange(prev => ({ ...prev, max: parseInt(text) || 10000 }))}
              keyboardType="numeric"
            />
          </View>
        </View>
      )}

      {filterType === 'validity' && (
        <View style={styles.validitySection}>
          <Text style={[styles.inputLabel, { color: theme.text }]}>Validity Period</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {(['daily', 'weekly', 'monthly', 'yearly'] as const).map((validity) => (
              <TouchableOpacity
                key={validity}
                style={[
                  styles.validityButton,
                  { backgroundColor: validityFilter === validity ? theme.primary : theme.surface },
                  { borderColor: theme.primary },
                ]}
                onPress={() => setValidityFilter(validity)}
              >
                <Text
                  style={[
                    styles.validityButtonText,
                    { color: validityFilter === validity ? theme.surface : theme.primary },
                  ]}
                >
                  {validity.charAt(0).toUpperCase() + validity.slice(1)}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      )}

      {/* Error Display */}
      {error && (
        <View style={[styles.errorContainer, { backgroundColor: '#ffebee' }]}>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      )}

      {/* Loading State */}
      {loadingDataPlans && (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.primary} />
          <Text style={[styles.loadingText, { color: theme.text }]}>Loading data plans...</Text>
        </View>
      )}

      {/* Plans List */}
      {!loadingDataPlans && (
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>
            Available Plans ({getFilteredPlans().length})
          </Text>
          <FlatList
            data={getFilteredPlans()}
            renderItem={renderDataPlan}
            keyExtractor={(item) => item.plan_id}
            scrollEnabled={false}
            contentContainerStyle={styles.plansList}
          />
        </View>
      )}

      {/* Selected Plan Summary */}
      {selectedPlan && (
        <View style={[styles.selectedPlanSection, { backgroundColor: theme.surface, borderColor: theme.border }]}>
          <Text style={[styles.selectedPlanTitle, { color: theme.text }]}>Selected Plan</Text>
          <View style={styles.selectedPlanDetails}>
            <Text style={[styles.selectedPlanName, { color: theme.primary }]}>{selectedPlan.name}</Text>
            <Text style={[styles.selectedPlanInfo, { color: theme.text }]}>
              {selectedPlan.data_value} • {selectedPlan.validity} • ₦{selectedPlan.price.toLocaleString()}
            </Text>
            <Text style={[styles.selectedPlanNetwork, { color: theme.textSecondary }]}>
              {selectedPlan.network.toUpperCase()} Network
            </Text>
          </View>
        </View>
      )}

      {/* Purchase Button */}
      <TouchableOpacity
        style={[
          styles.purchaseButton,
          { backgroundColor: theme.primary },
          (!selectedPlan || !phoneNumber || purchasingData) && styles.purchaseButtonDisabled,
        ]}
        onPress={handlePurchase}
        disabled={!selectedPlan || !phoneNumber || purchasingData}
      >
        {purchasingData ? (
          <ActivityIndicator color={theme.surface} />
        ) : (
          <Text style={[styles.purchaseButtonText, { color: theme.surface }]}>
            Purchase Data Plan
          </Text>
        )}
      </TouchableOpacity>

      <View style={styles.bottomPadding} />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    padding: 20,
    paddingBottom: 10,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  subtitle: {
    fontSize: 14,
  },
  inputSection: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
  },
  phoneInput: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    paddingHorizontal: 20,
    marginBottom: 10,
  },
  networkButtons: {
    paddingHorizontal: 20,
  },
  networkButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    marginRight: 10,
  },
  networkButtonText: {
    fontSize: 14,
    fontWeight: '600',
  },
  filterButtons: {
    paddingHorizontal: 20,
  },
  filterButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    marginRight: 10,
  },
  filterButtonText: {
    fontSize: 14,
    fontWeight: '600',
  },
  priceRangeSection: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  priceInputs: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  priceInput: {
    flex: 1,
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
  },
  priceToText: {
    marginHorizontal: 10,
    fontSize: 16,
  },
  validitySection: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  validityButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    marginRight: 10,
  },
  validityButtonText: {
    fontSize: 14,
    fontWeight: '600',
  },
  errorContainer: {
    marginHorizontal: 20,
    padding: 12,
    borderRadius: 8,
    marginBottom: 20,
  },
  errorText: {
    color: '#c62828',
    fontSize: 14,
    textAlign: 'center',
  },
  loadingContainer: {
    alignItems: 'center',
    padding: 40,
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
  },
  plansList: {
    paddingHorizontal: 20,
  },
  planCard: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  planHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  planName: {
    fontSize: 16,
    fontWeight: '600',
    flex: 1,
  },
  planNetwork: {
    fontSize: 12,
    fontWeight: 'bold',
    backgroundColor: 'rgba(0,122,255,0.1)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  planDetails: {
    marginBottom: 8,
  },
  planData: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 2,
  },
  planValidity: {
    fontSize: 14,
  },
  planFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  planPrice: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  planType: {
    fontSize: 12,
    textTransform: 'capitalize',
  },
  selectedPlanSection: {
    marginHorizontal: 20,
    borderWidth: 1,
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
  },
  selectedPlanTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
  },
  selectedPlanDetails: {
    gap: 4,
  },
  selectedPlanName: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  selectedPlanInfo: {
    fontSize: 16,
  },
  selectedPlanNetwork: {
    fontSize: 14,
  },
  purchaseButton: {
    marginHorizontal: 20,
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 20,
  },
  purchaseButtonDisabled: {
    opacity: 0.5,
  },
  purchaseButtonText: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  bottomPadding: {
    height: 20,
  },
});

export default DataPlansScreen;
