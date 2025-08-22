import { useNavigation } from '@react-navigation/native';
import {
    CheckCircle,
    ChevronLeft,
    Users,
    Zap,
} from 'lucide-react-native';
import React, { useRef, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    Animated,
    KeyboardAvoidingView,
    Platform,
    RefreshControl,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors } from '../theme';

interface ElectricityProvider {
  id: string;
  name: string;
  logo: string;
  color: string;
  type: 'prepaid' | 'postpaid';
}

interface Contact {
  id: string;
  name: string;
  meterNumber: string;
  provider?: string;
  type?: 'prepaid' | 'postpaid';
}

const ElectricityBillScreen: React.FC = () => {
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();
  
  const [refreshing, setRefreshing] = useState(false);
  const [meterNumber, setMeterNumber] = useState('');
  const [amount, setAmount] = useState('');
  const [customerName, setCustomerName] = useState('');
  const [selectedProvider, setSelectedProvider] = useState<ElectricityProvider | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isValidating, setIsValidating] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [showContacts, setShowContacts] = useState(false);
  const [spinningButton, setSpinningButton] = useState<string | null>(null);
  
  const spinValue = useRef(new Animated.Value(0)).current;

  const onRefresh = React.useCallback(() => {
    setRefreshing(true);
    // Reset form or reload data
    setMeterNumber('');
    setAmount('');
    setCustomerName('');
    setSelectedProvider(null);
    setTimeout(() => {
      setRefreshing(false);
    }, 1000);
  }, []);

  const providers: ElectricityProvider[] = [
    { id: 'aedc', name: 'AEDC', logo: '⚡', color: '#FFB84D', type: 'prepaid' },
    { id: 'eko', name: 'Eko Electric', logo: '🔌', color: '#00A651', type: 'prepaid' },
    { id: 'ikeja', name: 'Ikeja Electric', logo: '💡', color: '#E31E24', type: 'prepaid' },
    { id: 'ibadan', name: 'IBEDC', logo: '⚡', color: '#4169E1', type: 'prepaid' },
    { id: 'kano', name: 'KEDCO', logo: '🔆', color: '#FF6B35', type: 'prepaid' },
    { id: 'port', name: 'PHED', logo: '⚡', color: '#32CD32', type: 'prepaid' },
  ];

  const quickAmounts = ['1000', '2000', '3000', '5000', '10000', '15000', '20000', '25000', '30000', '50000'];

  // Mock recent contacts for demo
  const recentContacts: Contact[] = [
    { id: '1', name: 'Home Meter', meterNumber: '12345678901', provider: 'Eko Electric', type: 'prepaid' },
    { id: '2', name: 'Office Building', meterNumber: '98765432109', provider: 'Ikeja Electric', type: 'prepaid' },
    { id: '3', name: 'Shop Meter', meterNumber: '55556666777', provider: 'AEDC', type: 'prepaid' },
  ];

  const handleMeterNumberChange = async (text: string) => {
    // Remove any non-digit characters
    const cleaned = text.replace(/\D/g, '');
    
    // Limit to 11 digits (typical meter number length)
    if (cleaned.length <= 11) {
      setMeterNumber(cleaned);
      setCustomerName(''); // Reset customer name when meter number changes
      
      // Auto-validate when number is complete (10+ digits)
      if (cleaned.length >= 10 && selectedProvider) {
        await validateMeterNumber(cleaned);
      }
    }
  };

  const validateMeterNumber = async (meter: string) => {
    if (!selectedProvider || meter.length < 10) return;
    
    try {
      setIsValidating(true);
      
      // Mock API call to validate meter number
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Mock customer name based on meter number
      const mockNames = [
        'John Doe',
        'Jane Smith',
        'Michael Johnson',
        'Sarah Williams',
        'David Brown',
        'Mary Wilson',
        'Robert Davis'
      ];
      
      const name = mockNames[Math.floor(Math.random() * mockNames.length)];
      setCustomerName(name);
      
    } catch {
      Alert.alert('Error', 'Failed to validate meter number');
    } finally {
      setIsValidating(false);
    }
  };

  const selectContact = (contact: Contact) => {
    setMeterNumber(contact.meterNumber);
    const provider = providers.find(p => p.name === contact.provider);
    if (provider) {
      setSelectedProvider(provider);
      validateMeterNumber(contact.meterNumber);
    }
    setShowContacts(false);
  };

  const selectProvider = (provider: ElectricityProvider) => {
    setSelectedProvider(provider);
    setCustomerName(''); // Reset customer name
    
    // Re-validate if we have a meter number
    if (meterNumber.length >= 10) {
      validateMeterNumber(meterNumber);
    }
  };

  const selectQuickAmount = (quickAmount: string) => {
    setSpinningButton(quickAmount);
    
    // Reset and start spin animation
    spinValue.setValue(0);
    Animated.timing(spinValue, {
      toValue: 1,
      duration: 600,
      useNativeDriver: true,
    }).start(() => {
      setSpinningButton(null);
    });
    
    setAmount(quickAmount);
  };

  const handlePayment = async () => {
    if (!meterNumber || !amount || !selectedProvider || !customerName) {
      Alert.alert('Error', 'Please fill in all required fields and validate meter number');
      return;
    }

    if (meterNumber.length < 10) {
      Alert.alert('Error', 'Please enter a valid meter number');
      return;
    }

    const amountNum = parseInt(amount);
    if (isNaN(amountNum) || amountNum < 100) {
      Alert.alert('Error', 'Minimum electricity payment is ₦100');
      return;
    }

    try {
      setIsLoading(true);
      
      // Mock API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      setIsLoading(false);
      setShowSuccess(true);
      
      // Auto-dismiss success after 3 seconds
      setTimeout(() => {
        setShowSuccess(false);
        navigation.goBack();
      }, 3000);
      
    } catch {
      setIsLoading(false);
      Alert.alert('Error', 'Failed to process payment. Please try again.');
    }
  };

  const isFormValid = meterNumber.length >= 10 && amount && selectedProvider && customerName;

  if (showSuccess) {
    return (
      <SafeAreaView style={[styles.container, { paddingTop: insets.top }]}>
        <View style={styles.successContainer}>
          <CheckCircle size={80} color={colors.success} />
          <Text style={styles.successTitle}>Payment Successful!</Text>
          <Text style={styles.successMessage}>
            ₦{amount} electricity payment has been processed for
          </Text>
          <Text style={styles.successCustomer}>{customerName}</Text>
          <Text style={styles.successProvider}>via {selectedProvider?.name}</Text>
          <Text style={styles.successMeter}>Meter: {meterNumber}</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView 
        style={styles.keyboardContainer}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity 
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <ChevronLeft size={24} color={colors.text} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Electricity Bill</Text>
          <View style={styles.placeholder} />
        </View>

        <ScrollView 
          style={styles.content} 
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
        >
          {/* Electricity Provider Selection */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Select Provider</Text>
            <View style={styles.providersGrid}>
              {providers.map((provider) => (
                <TouchableOpacity
                  key={provider.id}
                  style={[
                    styles.providerCard,
                    selectedProvider?.id === provider.id && styles.providerCardSelected
                  ]}
                  onPress={() => selectProvider(provider)}
                >
                  <Text style={styles.providerEmoji}>{provider.logo}</Text>
                  <Text style={styles.providerName}>{provider.name}</Text>
                  <Text style={styles.providerType}>{provider.type}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Meter Number Input */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Meter Number</Text>
            <View style={styles.meterInputContainer}>
              <View style={styles.meterInputWrapper}>
                <Zap size={20} color={colors.secondaryText} style={styles.meterIcon} />
                <TextInput
                  style={styles.meterInput}
                  value={meterNumber}
                  onChangeText={handleMeterNumberChange}
                  placeholder="Enter meter number"
                  keyboardType="numeric"
                  maxLength={11}
                />
                <TouchableOpacity 
                  style={styles.contactsButton}
                  onPress={() => setShowContacts(!showContacts)}
                >
                  <Users size={20} color={colors.primary} />
                </TouchableOpacity>
              </View>
              
              {isValidating && (
                <View style={styles.validatingContainer}>
                  <ActivityIndicator size="small" color={colors.primary} />
                  <Text style={styles.validatingText}>Validating meter number...</Text>
                </View>
              )}
              
              {customerName && !isValidating && (
                <View style={styles.customerDetected}>
                  <CheckCircle size={16} color={colors.success} />
                  <Text style={styles.customerName}>Customer: {customerName}</Text>
                </View>
              )}
            </View>

            {/* Recent Contacts */}
            {showContacts && (
              <View style={styles.contactsList}>
                <Text style={styles.contactsTitle}>Recent Bills</Text>
                {recentContacts.map(contact => (
                  <TouchableOpacity
                    key={contact.id}
                    style={styles.contactItem}
                    onPress={() => selectContact(contact)}
                  >
                    <View style={styles.contactInfo}>
                      <Text style={styles.contactName}>{contact.name}</Text>
                      <Text style={styles.contactMeter}>{contact.meterNumber}</Text>
                    </View>
                    <View style={styles.contactDetails}>
                      {contact.provider && (
                        <Text style={styles.contactProvider}>{contact.provider}</Text>
                      )}
                      {contact.type && (
                        <Text style={styles.contactType}>{contact.type}</Text>
                      )}
                    </View>
                  </TouchableOpacity>
                ))}
              </View>
            )}
          </View>

          {/* Amount Input */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Amount</Text>
            <TextInput
              style={styles.amountInput}
              value={amount}
              onChangeText={setAmount}
              placeholder="Enter amount"
              keyboardType="numeric"
            />

            {/* Quick Amount Buttons */}
            <View style={styles.quickAmountsContainer}>
              <Text style={styles.quickAmountsTitle}>Quick amounts</Text>
              <View style={styles.quickAmounts}>
                {quickAmounts.map((quickAmount) => {
                  const isSpinning = spinningButton === quickAmount;
                  const spin = spinValue.interpolate({
                    inputRange: [0, 1],
                    outputRange: ['0deg', '360deg'],
                  });

                  return (
                    <TouchableOpacity
                      key={quickAmount}
                      style={[
                        styles.quickAmountButton,
                        amount === quickAmount && styles.quickAmountButtonSelected
                      ]}
                      onPress={() => selectQuickAmount(quickAmount)}
                    >
                      <Animated.View
                        style={[
                          { transform: [{ rotate: isSpinning ? spin : '0deg' }] }
                        ]}
                      >
                        <Text style={[
                          styles.quickAmountText,
                          amount === quickAmount && styles.quickAmountTextSelected
                        ]}>
                          ₦{quickAmount}
                        </Text>
                      </Animated.View>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>
          </View>

          <View style={styles.bottomPadding} />
        </ScrollView>

        {/* Pay Button */}
        <View style={styles.footer}>
          <TouchableOpacity
            style={[styles.payButton, !isFormValid && styles.payButtonDisabled]}
            onPress={handlePayment}
            disabled={!isFormValid || isLoading}
          >
            {isLoading ? (
              <ActivityIndicator color={colors.white} />
            ) : (
              <Text style={styles.payButtonText}>
                Pay Electricity Bill {amount && `(₦${amount})`}
              </Text>
            )}
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  keyboardContainer: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#FFF0F5',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5EA',
  },
  backButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#000',
  },
  placeholder: {
    width: 40,
    height: 40,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  section: {
    marginTop: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 12,
  },
  providersGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  providerCard: {
    width: '31%',
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: 8,
  },
  providerCardSelected: {
    borderColor: colors.primary,
    backgroundColor: colors.primaryTransparent,
  },
  providerEmoji: {
    fontSize: 24,
    marginBottom: 4,
  },
  providerName: {
    fontSize: 12,
    fontWeight: '500',
    color: colors.text,
    textAlign: 'center',
  },
  providerType: {
    fontSize: 10,
    color: colors.secondaryText,
    marginTop: 2,
  },
  meterInputContainer: {
    marginBottom: 12,
  },
  meterInputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.card,
    borderRadius: 12,
    paddingHorizontal: 16,
    height: 56,
    borderWidth: 1,
    borderColor: colors.border,
  },
  meterIcon: {
    marginRight: 12,
  },
  meterInput: {
    flex: 1,
    fontSize: 16,
    color: colors.text,
  },
  contactsButton: {
    padding: 4,
  },
  validatingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
    padding: 12,
    backgroundColor: colors.primaryTransparent,
    borderRadius: 8,
  },
  validatingText: {
    fontSize: 14,
    color: colors.primary,
    marginLeft: 8,
  },
  customerDetected: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
    padding: 12,
    backgroundColor: colors.successTransparent,
    borderRadius: 8,
  },
  customerName: {
    fontSize: 14,
    color: colors.success,
    fontWeight: '500',
    marginLeft: 8,
  },
  contactsList: {
    marginTop: 12,
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.border,
  },
  contactsTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 12,
  },
  contactItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  contactInfo: {
    flex: 1,
  },
  contactName: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.text,
  },
  contactMeter: {
    fontSize: 12,
    color: colors.secondaryText,
    marginTop: 2,
  },
  contactDetails: {
    alignItems: 'flex-end',
  },
  contactProvider: {
    fontSize: 12,
    color: colors.primary,
    fontWeight: '500',
  },
  contactType: {
    fontSize: 10,
    color: colors.secondaryText,
    marginTop: 2,
  },
  amountInput: {
    backgroundColor: colors.card,
    borderRadius: 12,
    paddingHorizontal: 16,
    height: 56,
    fontSize: 16,
    color: colors.text,
    borderWidth: 1,
    borderColor: colors.border,
  },
  quickAmountsContainer: {
    marginTop: 16,
  },
  quickAmountsTitle: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.secondaryText,
    marginBottom: 8,
  },
  quickAmounts: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  quickAmountButton: {
    width: '18%',
    paddingHorizontal: 8,
    paddingVertical: 8,
    backgroundColor: colors.card,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    marginBottom: 8,
  },
  quickAmountButtonSelected: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  quickAmountText: {
    fontSize: 14,
    color: colors.text,
    fontWeight: '500',
  },
  quickAmountTextSelected: {
    color: colors.white,
  },
  bottomPadding: {
    height: 100,
  },
  footer: {
    padding: 20,
    backgroundColor: colors.background,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  payButton: {
    backgroundColor: colors.primary,
    borderRadius: 12,
    height: 56,
    alignItems: 'center',
    justifyContent: 'center',
  },
  payButtonDisabled: {
    backgroundColor: colors.border,
  },
  payButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.white,
  },
  successContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  successTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.success,
    marginTop: 24,
    textAlign: 'center',
  },
  successMessage: {
    fontSize: 16,
    color: colors.text,
    textAlign: 'center',
    marginTop: 12,
    lineHeight: 24,
  },
  successCustomer: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginTop: 4,
  },
  successProvider: {
    fontSize: 14,
    color: colors.secondaryText,
    marginTop: 8,
  },
  successMeter: {
    fontSize: 14,
    color: colors.secondaryText,
    marginTop: 4,
  },
});

export default ElectricityBillScreen;
