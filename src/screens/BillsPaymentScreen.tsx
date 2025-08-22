import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
  TextInput,
  ActivityIndicator,
  RefreshControl,
  Modal,
  FlatList
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import PaystackServiceInstance from '../services/PaystackService';

// Utility functions
const toKobo = (amount: number): number => Math.round(amount * 100);
const formatAmount = (amount: number): string => `₦${(amount / 100).toLocaleString()}`;
const formatDirectAmount = (amount: number): string => `₦${amount.toLocaleString()}`;

interface BillService {
  service_id: string;
  name: string;
  service_type: 'postpaid' | 'prepaid';
  categories: {
    identifier: string;
    name: string;
    default_amount?: number;
    product_type: string;
  }[];
}

interface BillCategory {
  identifier: string;
  name: string;
  default_amount?: number;
  product_type: string;
}

interface PaymentFormData {
  customer: string;
  amount: string;
  phone: string;
  meter_number: string;
  bill_reference: string;
  service_id: string;
  subscription_type: string;
}

const BILL_TYPES = [
  {
    id: 'electricity',
    name: '⚡ Electricity',
    icon: 'flash',
    color: '#FFA500',
    description: 'Pay your electricity bills'
  },
  {
    id: 'cable',
    name: '📺 Cable TV',
    icon: 'tv',
    color: '#8A2BE2',
    description: 'DSTV, GOtv, Startimes subscriptions'
  },
  {
    id: 'internet',
    name: '🌐 Internet',
    icon: 'wifi',
    color: '#4169E1',
    description: 'Internet data subscriptions'
  },
  {
    id: 'airtime',
    name: '📱 Airtime',
    icon: 'phone-portrait',
    color: '#32CD32',
    description: 'Mobile airtime top-up'
  },
  {
    id: 'water',
    name: '💧 Water',
    icon: 'water',
    color: '#1E90FF',
    description: 'Water utility bills'
  },
  {
    id: 'waste',
    name: '🗑️ Waste',
    icon: 'trash',
    color: '#CD853F',
    description: 'Waste management fees'
  }
];

export default function BillsPaymentScreen() {
  const [billServices, setBillServices] = useState<BillService[]>([]);
  const [selectedBillType, setSelectedBillType] = useState<string>('');
  const [selectedService, setSelectedService] = useState<BillService | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<BillCategory | null>(null);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [showServiceModal, setShowServiceModal] = useState(false);
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [paymentForm, setPaymentForm] = useState<PaymentFormData>({
    customer: '',
    amount: '',
    phone: '',
    meter_number: '',
    bill_reference: '',
    service_id: '',
    subscription_type: ''
  });
  const [validationResult, setValidationResult] = useState<any>(null);
  const [recentPayments, setRecentPayments] = useState<any[]>([]);

  useEffect(() => {
    loadBillServices();
    loadRecentPayments();
  }, []);

  const loadBillServices = async () => {
    try {
      setLoading(true);
      const response = await PaystackServiceInstance.getBillServices();
      setBillServices(response.data);
    } catch (error) {
      console.error('Failed to load bill services:', error);
      Alert.alert('Error', 'Failed to load bill services');
    } finally {
      setLoading(false);
    }
  };

  const loadRecentPayments = async () => {
    try {
      const response = await PaystackServiceInstance.getTransactions({
        page: 1,
        perPage: 5
      });
      setRecentPayments(response.data);
    } catch (error) {
      console.error('Failed to load recent payments:', error);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await Promise.all([loadBillServices(), loadRecentPayments()]);
    setRefreshing(false);
  };

  const selectBillType = (billType: string) => {
    setSelectedBillType(billType);
    setSelectedService(null);
    setSelectedCategory(null);
    setValidationResult(null);
    
    // Filter services based on bill type
    const filteredServices = billServices.filter(service => {
      const serviceName = service.name.toLowerCase();
      switch (billType) {
        case 'electricity':
          return serviceName.includes('electric') || serviceName.includes('power') || serviceName.includes('disco');
        case 'cable':
          return serviceName.includes('dstv') || serviceName.includes('gotv') || serviceName.includes('startimes') || serviceName.includes('cable');
        case 'internet':
          return serviceName.includes('internet') || serviceName.includes('data') || serviceName.includes('wifi');
        case 'water':
          return serviceName.includes('water');
        case 'waste':
          return serviceName.includes('waste') || serviceName.includes('sanitation');
        default:
          return true;
      }
    });

    if (filteredServices.length > 0) {
      setShowServiceModal(true);
    } else {
      Alert.alert('Notice', `No ${billType} services available at the moment`);
    }
  };

  const selectService = (service: BillService) => {
    setSelectedService(service);
    setPaymentForm(prev => ({ ...prev, service_id: service.service_id }));
    setShowServiceModal(false);
    
    if (service.categories.length > 0) {
      setShowCategoryModal(true);
    }
  };

  const selectCategory = (category: BillCategory) => {
    setSelectedCategory(category);
    setPaymentForm(prev => ({
      ...prev,
      subscription_type: category.identifier,
      amount: category.default_amount ? (category.default_amount / 100).toString() : prev.amount
    }));
    setShowCategoryModal(false);
  };

  const validateCustomer = async () => {
    if (!selectedService) return;

    try {
      setLoading(true);
      const serviceId = selectedService.service_id;
      const customerId = paymentForm.bill_reference || paymentForm.meter_number;
      const billType = paymentForm.subscription_type;

      const result = await PaystackServiceInstance.validateBillCustomer(serviceId, customerId, billType);
      setValidationResult(result.data);
      Alert.alert('✅ Customer Validated', `Customer: ${result.data.customer_name}`);
    } catch (error) {
      Alert.alert('Validation Failed', 'Unable to validate customer details');
      console.error('Validation error:', error);
    } finally {
      setLoading(false);
    }
  };

  const processPayment = async () => {
    if (!selectedService || !paymentForm.customer || !paymentForm.amount) {
      Alert.alert('Error', 'Please fill in all required fields');
      return;
    }

    try {
      setLoading(true);
      
      let paymentData;
      
      if (selectedBillType === 'airtime') {
        // Handle airtime purchase
        paymentData = await PaystackServiceInstance.payBill({
          customer: 'customer_id',
          service_id: selectedService.service_id,
          customer_id: paymentForm.phone,
          amount: toKobo(parseFloat(paymentForm.amount))
        });
      } else {
        // Handle bill payment
        const billData = {
          customer: 'customer_id',
          service_id: selectedService.service_id,
          amount: toKobo(parseFloat(paymentForm.amount)),
          customer_id: paymentForm.bill_reference || paymentForm.meter_number,
          variation_code: paymentForm.subscription_type,
          phone: paymentForm.phone,
        };

        paymentData = await PaystackServiceInstance.payBill(billData);
      }

      Alert.alert(
        '✅ Payment Successful',
        `Reference: ${paymentData.data.reference}\nAmount: ${formatAmount(paymentData.data.amount)}`,
        [
          {
            text: 'OK',
            onPress: () => {
              // Reset form
              setPaymentForm({
                customer: '',
                amount: '',
                phone: '',
                meter_number: '',
                bill_reference: '',
                service_id: '',
                subscription_type: ''
              });
              setSelectedService(null);
              setSelectedCategory(null);
              setSelectedBillType('');
              setValidationResult(null);
              loadRecentPayments();
            }
          }
        ]
      );

    } catch (error) {
      Alert.alert('Payment Failed', error instanceof Error ? error.message : 'Unknown error occurred');
      console.error('Payment error:', error);
    } finally {
      setLoading(false);
    }
  };

  const getFilteredServices = () => {
    if (!selectedBillType) return billServices;
    
    return billServices.filter(service => {
      const serviceName = service.name.toLowerCase();
      switch (selectedBillType) {
        case 'electricity':
          return serviceName.includes('electric') || serviceName.includes('power') || serviceName.includes('disco');
        case 'cable':
          return serviceName.includes('dstv') || serviceName.includes('gotv') || serviceName.includes('startimes') || serviceName.includes('cable');
        case 'internet':
          return serviceName.includes('internet') || serviceName.includes('data') || serviceName.includes('wifi');
        case 'water':
          return serviceName.includes('water');
        case 'waste':
          return serviceName.includes('waste') || serviceName.includes('sanitation');
        default:
          return true;
      }
    });
  };

  const renderBillTypeCard = (billType: any) => (
    <TouchableOpacity
      key={billType.id}
      style={[styles.billTypeCard, selectedBillType === billType.id && styles.selectedCard]}
      onPress={() => selectBillType(billType.id)}
    >
      <View style={[styles.billTypeIcon, { backgroundColor: billType.color }]}>
        <Ionicons name={billType.icon as any} size={24} color="white" />
      </View>
      <Text style={styles.billTypeName}>{billType.name}</Text>
      <Text style={styles.billTypeDescription}>{billType.description}</Text>
    </TouchableOpacity>
  );

  const renderPaymentForm = () => (
    <View style={styles.paymentForm}>
      <Text style={styles.sectionTitle}>Payment Details</Text>
      
      {selectedService && (
        <View style={styles.selectedServiceInfo}>
          <Text style={styles.selectedServiceText}>
            Service: {selectedService.name}
          </Text>
          {selectedCategory && (
            <Text style={styles.selectedCategoryText}>
              Plan: {selectedCategory.name}
            </Text>
          )}
        </View>
      )}

      <View style={styles.inputGroup}>
        <Text style={styles.inputLabel}>Customer Email/ID *</Text>
        <TextInput
          style={styles.input}
          value={paymentForm.customer}
          onChangeText={(text) => setPaymentForm(prev => ({ ...prev, customer: text }))}
          placeholder="Enter customer email or ID"
          keyboardType="email-address"
        />
      </View>

      {selectedBillType === 'airtime' && (
        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>Phone Number *</Text>
          <TextInput
            style={styles.input}
            value={paymentForm.phone}
            onChangeText={(text) => setPaymentForm(prev => ({ ...prev, phone: text }))}
            placeholder="08012345678"
            keyboardType="phone-pad"
          />
        </View>
      )}

      {selectedBillType === 'electricity' && (
        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>Meter Number *</Text>
          <TextInput
            style={styles.input}
            value={paymentForm.meter_number}
            onChangeText={(text) => setPaymentForm(prev => ({ ...prev, meter_number: text }))}
            placeholder="Enter meter number"
            keyboardType="numeric"
          />
        </View>
      )}

      {['cable', 'internet', 'water', 'waste'].includes(selectedBillType) && (
        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>
            {selectedBillType === 'cable' ? 'Decoder/Card Number' : 
             selectedBillType === 'water' ? 'Bill Reference' : 'Reference Number'} *
          </Text>
          <TextInput
            style={styles.input}
            value={paymentForm.bill_reference}
            onChangeText={(text) => setPaymentForm(prev => ({ ...prev, bill_reference: text }))}
            placeholder={`Enter ${selectedBillType === 'cable' ? 'decoder number' : 'reference'}`}
            keyboardType="numeric"
          />
        </View>
      )}

      <View style={styles.inputGroup}>
        <Text style={styles.inputLabel}>Amount (₦) *</Text>
        <TextInput
          style={styles.input}
          value={paymentForm.amount}
          onChangeText={(text) => setPaymentForm(prev => ({ ...prev, amount: text }))}
          placeholder="0.00"
          keyboardType="numeric"
        />
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.inputLabel}>Phone Number (Optional)</Text>
        <TextInput
          style={styles.input}
          value={paymentForm.phone}
          onChangeText={(text) => setPaymentForm(prev => ({ ...prev, phone: text }))}
          placeholder="08012345678"
          keyboardType="phone-pad"
        />
      </View>

      {selectedBillType !== 'airtime' && (
        <TouchableOpacity
          style={styles.validateButton}
          onPress={validateCustomer}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator size="small" color="white" />
          ) : (
            <>
              <Ionicons name="checkmark-circle" size={20} color="white" />
              <Text style={styles.validateButtonText}>Validate Customer</Text>
            </>
          )}
        </TouchableOpacity>
      )}

      {validationResult && (
        <View style={styles.validationResult}>
          <Text style={styles.validationTitle}>✅ Customer Details</Text>
          <Text style={styles.validationText}>Name: {validationResult.customer_name}</Text>
          {validationResult.address && (
            <Text style={styles.validationText}>Address: {validationResult.address}</Text>
          )}
          {validationResult.outstanding_balance && (
            <Text style={styles.validationText}>
              Outstanding: {formatAmount(validationResult.outstanding_balance)}
            </Text>
          )}
        </View>
      )}

      <TouchableOpacity
        style={styles.payButton}
        onPress={processPayment}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator size="small" color="white" />
        ) : (
          <>
            <Ionicons name="card" size={20} color="white" />
            <Text style={styles.payButtonText}>
              Pay {paymentForm.amount ? formatAmount(toKobo(parseFloat(paymentForm.amount))) : ''}
            </Text>
          </>
        )}
      </TouchableOpacity>
    </View>
  );

  const renderRecentPayments = () => (
    <View style={styles.recentSection}>
      <Text style={styles.sectionTitle}>Recent Payments</Text>
      {recentPayments.length === 0 ? (
        <Text style={styles.emptyText}>No recent payments</Text>
      ) : (
        recentPayments.map((payment, index) => (
          <View key={index} style={styles.paymentCard}>
            <View style={styles.paymentHeader}>
              <Text style={styles.paymentService}>{payment.service || 'Bill Payment'}</Text>
              <Text style={styles.paymentAmount}>
                {formatAmount(payment.amount)}
              </Text>
            </View>
            <Text style={styles.paymentReference}>Ref: {payment.reference}</Text>
            <Text style={styles.paymentStatus}>Status: {payment.status}</Text>
          </View>
        ))
      )}
    </View>
  );

  return (
    <ScrollView
      style={styles.container}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      {/* Header */}
      <View style={styles.header}>
        <Ionicons name="receipt" size={32} color="#007bff" />
        <Text style={styles.title}>Bills Payment</Text>
        <Text style={styles.subtitle}>Pay your bills with ease</Text>
      </View>

      {/* Bill Types */}
      <View style={styles.billTypesSection}>
        <Text style={styles.sectionTitle}>Select Bill Type</Text>
        <View style={styles.billTypesGrid}>
          {BILL_TYPES.map(renderBillTypeCard)}
        </View>
      </View>

      {/* Payment Form */}
      {selectedService && renderPaymentForm()}

      {/* Recent Payments */}
      {renderRecentPayments()}

      {/* Service Selection Modal */}
      <Modal
        visible={showServiceModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowServiceModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Select Service Provider</Text>
              <TouchableOpacity onPress={() => setShowServiceModal(false)}>
                <Ionicons name="close" size={24} color="#666" />
              </TouchableOpacity>
            </View>
            <FlatList
              data={getFilteredServices()}
              keyExtractor={(item) => item.service_id}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={styles.serviceItem}
                  onPress={() => selectService(item)}
                >
                  <Text style={styles.serviceName}>{item.name}</Text>
                  <Text style={styles.serviceType}>{item.service_type}</Text>
                </TouchableOpacity>
              )}
            />
          </View>
        </View>
      </Modal>

      {/* Category Selection Modal */}
      <Modal
        visible={showCategoryModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowCategoryModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Select Plan/Package</Text>
              <TouchableOpacity onPress={() => setShowCategoryModal(false)}>
                <Ionicons name="close" size={24} color="#666" />
              </TouchableOpacity>
            </View>
            <FlatList
              data={selectedService?.categories || []}
              keyExtractor={(item) => item.identifier}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={styles.categoryItem}
                  onPress={() => selectCategory(item)}
                >
                  <Text style={styles.categoryName}>{item.name}</Text>
                  {item.default_amount && (
                    <Text style={styles.categoryAmount}>
                      {formatDirectAmount(item.default_amount)}
                    </Text>
                  )}
                </TouchableOpacity>
              )}
            />
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    padding: 20,
  },
  header: {
    alignItems: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 10,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    marginTop: 5,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 15,
  },
  billTypesSection: {
    marginBottom: 20,
  },
  billTypesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  billTypeCard: {
    width: '48%',
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 15,
    marginBottom: 10,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  selectedCard: {
    borderColor: '#007bff',
  },
  billTypeIcon: {
    width: 50,
    height: 50,
    borderRadius: 25,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  billTypeName: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'center',
    marginBottom: 5,
  },
  billTypeDescription: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
  },
  paymentForm: {
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 20,
    marginBottom: 20,
  },
  selectedServiceInfo: {
    backgroundColor: '#f8f9fa',
    padding: 10,
    borderRadius: 8,
    marginBottom: 15,
  },
  selectedServiceText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333',
  },
  selectedCategoryText: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  },
  inputGroup: {
    marginBottom: 15,
  },
  inputLabel: {
    fontSize: 14,
    color: '#666',
    marginBottom: 5,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: '#f9f9f9',
  },
  validateButton: {
    backgroundColor: '#28a745',
    padding: 12,
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 15,
  },
  validateButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 8,
  },
  validationResult: {
    backgroundColor: '#d4edda',
    padding: 12,
    borderRadius: 8,
    marginBottom: 15,
    borderLeftWidth: 4,
    borderLeftColor: '#28a745',
  },
  validationTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#155724',
    marginBottom: 5,
  },
  validationText: {
    fontSize: 12,
    color: '#155724',
    marginBottom: 2,
  },
  payButton: {
    backgroundColor: '#007bff',
    padding: 15,
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  payButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 8,
  },
  recentSection: {
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 20,
    marginBottom: 20,
  },
  emptyText: {
    textAlign: 'center',
    color: '#666',
    fontStyle: 'italic',
  },
  paymentCard: {
    backgroundColor: '#f8f9fa',
    padding: 12,
    borderRadius: 8,
    marginBottom: 10,
  },
  paymentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 5,
  },
  paymentService: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333',
  },
  paymentAmount: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#28a745',
  },
  paymentReference: {
    fontSize: 12,
    color: '#666',
    marginBottom: 2,
  },
  paymentStatus: {
    fontSize: 12,
    color: '#666',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 20,
    width: '90%',
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  serviceItem: {
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  serviceName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  serviceType: {
    fontSize: 14,
    color: '#666',
    marginTop: 2,
  },
  categoryItem: {
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  categoryName: {
    fontSize: 16,
    color: '#333',
  },
  categoryAmount: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#28a745',
  },
});
