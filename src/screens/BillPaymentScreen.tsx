import { useNavigation, useRoute } from '@react-navigation/native';
import {
    CheckCircle,
    ChevronLeft,
    CreditCard,
    Users,
} from 'lucide-react-native';
import React, { useState } from 'react';
import {
    ActivityIndicator,
    Alert,
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

interface Provider {
  id: string;
  name: string;
  logo: string;
  isAvailable: boolean;
}

interface Package {
  id: string;
  name: string;
  amount: number;
  description: string;
  validity?: string;
}

interface Contact {
  id: string;
  name: string;
  accountNumber: string;
  provider?: string;
}

type BillPaymentParams = {
  billType?: string;
};

const BillPaymentScreen: React.FC = () => {
  const navigation = useNavigation();
  const route = useRoute<{ params?: BillPaymentParams }>();
  const insets = useSafeAreaInsets();
  
  // Get bill type from route params or default to 'general'
  const billType = route.params?.billType || 'general';
  
  const [refreshing, setRefreshing] = useState(false);
  const [accountNumber, setAccountNumber] = useState('');
  const [customerName, setCustomerName] = useState('');
  const [selectedProvider, setSelectedProvider] = useState<Provider | null>(null);
  const [selectedPackage, setSelectedPackage] = useState<Package | null>(null);
  const [customAmount, setCustomAmount] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isValidating, setIsValidating] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [showContacts, setShowContacts] = useState(false);

  const onRefresh = React.useCallback(() => {
    setRefreshing(true);
    // Reset form or reload data
    setAccountNumber('');
    setCustomerName('');
    setSelectedProvider(null);
    setSelectedPackage(null);
    setCustomAmount('');
    setTimeout(() => {
      setRefreshing(false);
    }, 1000);
  }, []);

  // Mock providers based on bill type
  const getProviders = (type: string): Provider[] => {
    const providerMap = {
      water: [
        { id: 'lagoswater', name: 'Lagos Water Corp', logo: '💧', isAvailable: true },
        { id: 'abujawater', name: 'FCT Water Board', logo: '🚰', isAvailable: true },
        { id: 'ibadanwater', name: 'Oyo State Water', logo: '💧', isAvailable: true },
      ],
      internet: [
        { id: 'mtn_internet', name: 'MTN Internet', logo: '🌐', isAvailable: true },
        { id: 'airtel_internet', name: 'Airtel Internet', logo: '📶', isAvailable: true },
        { id: 'swift', name: 'Swift Networks', logo: '⚡', isAvailable: true },
        { id: 'spectranet', name: 'Spectranet', logo: '📡', isAvailable: true },
      ],
      general: [
        { id: 'government', name: 'Government Services', logo: '🏛️', isAvailable: true },
        { id: 'insurance', name: 'Insurance Companies', logo: '🛡️', isAvailable: true },
        { id: 'waste', name: 'Waste Management', logo: '🗑️', isAvailable: true },
        { id: 'security', name: 'Security Services', logo: '🔒', isAvailable: true },
      ],
    };
    
    return providerMap[type as keyof typeof providerMap] || providerMap.general;
  };

  // Mock packages based on provider
  const getPackages = (providerId: string): Package[] => {
    const packageMap = {
      lagoswater: [
        { id: '1', name: 'Basic Plan', amount: 2000, description: 'Monthly water bill', validity: '30 days' },
        { id: '2', name: 'Family Plan', amount: 3500, description: 'Family water usage', validity: '30 days' },
        { id: '3', name: 'Commercial Plan', amount: 7500, description: 'Business water bill', validity: '30 days' },
      ],
      mtn_internet: [
        { id: '1', name: '10GB Plan', amount: 2000, description: '10GB monthly internet', validity: '30 days' },
        { id: '2', name: '25GB Plan', amount: 4500, description: '25GB monthly internet', validity: '30 days' },
        { id: '3', name: '50GB Plan', amount: 8000, description: '50GB monthly internet', validity: '30 days' },
      ],
      government: [
        { id: '1', name: 'Driver\'s License', amount: 6350, description: 'License renewal fee' },
        { id: '2', name: 'Vehicle Registration', amount: 13350, description: 'Vehicle papers' },
        { id: '3', name: 'Tax Payment', amount: 0, description: 'Custom amount', validity: 'Varies' },
      ],
    };
    
    return packageMap[providerId as keyof typeof packageMap] || [
      { id: '1', name: 'Standard Payment', amount: 0, description: 'Custom amount payment' },
    ];
  };

  const providers = getProviders(billType);

  // Mock recent contacts
  const recentContacts: Contact[] = [
    { id: '1', name: 'Home Account', accountNumber: '1234567890', provider: providers[0]?.name },
    { id: '2', name: 'Office Account', accountNumber: '9876543210', provider: providers[1]?.name },
    { id: '3', name: 'Personal Service', accountNumber: '5555666677', provider: providers[2]?.name },
  ];

  const handleAccountNumberChange = async (text: string) => {
    const cleaned = text.replace(/\D/g, '');
    
    if (cleaned.length <= 15) {
      setAccountNumber(cleaned);
      setCustomerName('');
      
      if (cleaned.length >= 8 && selectedProvider) {
        await validateAccount(cleaned);
      }
    }
  };

  const validateAccount = async (account: string) => {
    if (!selectedProvider || account.length < 8) return;
    
    try {
      setIsValidating(true);
      
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      const mockNames = [
        'John Doe',
        'Jane Smith',
        'Michael Johnson',
        'Sarah Williams',
        'David Brown'
      ];
      
      const name = mockNames[Math.floor(Math.random() * mockNames.length)];
      setCustomerName(name);
      
    } catch {
      Alert.alert('Error', 'Failed to validate account number');
    } finally {
      setIsValidating(false);
    }
  };

  const selectContact = (contact: Contact) => {
    setAccountNumber(contact.accountNumber);
    const provider = providers.find(p => p.name === contact.provider);
    if (provider) {
      setSelectedProvider(provider);
      setSelectedPackage(null);
      validateAccount(contact.accountNumber);
    }
    setShowContacts(false);
  };

  const selectProvider = (provider: Provider) => {
    setSelectedProvider(provider);
    setSelectedPackage(null);
    setCustomerName('');
    
    if (accountNumber.length >= 8) {
      validateAccount(accountNumber);
    }
  };

  const handlePayment = async () => {
    if (!accountNumber || !selectedProvider) {
      Alert.alert('Error', 'Please fill in all required fields');
      return;
    }

    const amount = selectedPackage?.amount || parseInt(customAmount);
    if (!amount || amount < 100) {
      Alert.alert('Error', 'Please select a package or enter a valid amount (minimum ₦100)');
      return;
    }

    try {
      setIsLoading(true);
      
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      setIsLoading(false);
      setShowSuccess(true);
      
      setTimeout(() => {
        setShowSuccess(false);
        navigation.goBack();
      }, 3000);
      
    } catch {
      setIsLoading(false);
      Alert.alert('Error', 'Failed to process payment. Please try again.');
    }
  };

  const isFormValid = accountNumber.length >= 8 && selectedProvider && 
    (selectedPackage || customAmount);

  const getScreenTitle = () => {
    switch (billType) {
      case 'water': return 'Water Bills';
      case 'internet': return 'Internet Bills';
      case 'general': return 'Bill Payment';
      default: return 'Bill Payment';
    }
  };

  if (showSuccess) {
    const amount = selectedPackage?.amount || parseInt(customAmount);
    
    return (
      <SafeAreaView style={[styles.container, { paddingTop: insets.top }]}>
        <View style={styles.successContainer}>
          <CheckCircle size={80} color={colors.success} />
          <Text style={styles.successTitle}>Payment Successful!</Text>
          <Text style={styles.successMessage}>
            ₦{amount} payment has been processed
          </Text>
          {customerName && (
            <Text style={styles.successCustomer}>for {customerName}</Text>
          )}
          <Text style={styles.successProvider}>via {selectedProvider?.name}</Text>
          <Text style={styles.successAccount}>Account: {accountNumber}</Text>
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
          <Text style={styles.headerTitle}>{getScreenTitle()}</Text>
          <View style={styles.placeholder} />
        </View>

        <ScrollView 
          style={styles.content} 
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
        >
          {/* Provider Selection */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Select Provider</Text>
            <View style={styles.providersGrid}>
              {providers.map((provider) => (
                <TouchableOpacity
                  key={provider.id}
                  style={[
                    styles.providerCard,
                    selectedProvider?.id === provider.id && styles.providerCardSelected,
                    !provider.isAvailable && styles.providerCardDisabled
                  ]}
                  onPress={() => provider.isAvailable && selectProvider(provider)}
                  disabled={!provider.isAvailable}
                >
                  <Text style={styles.providerEmoji}>{provider.logo}</Text>
                  <Text style={[
                    styles.providerName,
                    !provider.isAvailable && styles.providerNameDisabled
                  ]}>
                    {provider.name}
                  </Text>
                  {!provider.isAvailable && (
                    <Text style={styles.comingSoon}>Coming Soon</Text>
                  )}
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Account Number Input */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Account/Reference Number</Text>
            <View style={styles.accountInputContainer}>
              <View style={styles.accountInputWrapper}>
                <CreditCard size={20} color={colors.secondaryText} style={styles.accountIcon} />
                <TextInput
                  style={styles.accountInput}
                  value={accountNumber}
                  onChangeText={handleAccountNumberChange}
                  placeholder="Enter account number"
                  keyboardType="numeric"
                  maxLength={15}
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
                  <Text style={styles.validatingText}>Validating account...</Text>
                </View>
              )}
              
              {customerName && !isValidating && (
                <View style={styles.customerDetected}>
                  <CheckCircle size={16} color={colors.success} />
                  <Text style={styles.customerName}>Account: {customerName}</Text>
                </View>
              )}
            </View>

            {/* Recent Contacts */}
            {showContacts && (
              <View style={styles.contactsList}>
                <Text style={styles.contactsTitle}>Recent Accounts</Text>
                {recentContacts.map(contact => (
                  <TouchableOpacity
                    key={contact.id}
                    style={styles.contactItem}
                    onPress={() => selectContact(contact)}
                  >
                    <View style={styles.contactInfo}>
                      <Text style={styles.contactName}>{contact.name}</Text>
                      <Text style={styles.contactAccount}>{contact.accountNumber}</Text>
                    </View>
                    {contact.provider && (
                      <Text style={styles.contactProvider}>{contact.provider}</Text>
                    )}
                  </TouchableOpacity>
                ))}
              </View>
            )}
          </View>

          {/* Package Selection */}
          {selectedProvider && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Select Package</Text>
              <View style={styles.packagesContainer}>
                {getPackages(selectedProvider.id).map((pkg) => (
                  <TouchableOpacity
                    key={pkg.id}
                    style={[
                      styles.packageCard,
                      selectedPackage?.id === pkg.id && styles.packageCardSelected
                    ]}
                    onPress={() => {
                      setSelectedPackage(pkg);
                      if (pkg.amount === 0) {
                        setCustomAmount('');
                      } else {
                        setCustomAmount('');
                      }
                    }}
                  >
                    <View style={styles.packageInfo}>
                      <Text style={styles.packageName}>{pkg.name}</Text>
                      <Text style={styles.packageDescription}>{pkg.description}</Text>
                      {pkg.validity && (
                        <Text style={styles.packageValidity}>Valid for {pkg.validity}</Text>
                      )}
                    </View>
                    <View style={styles.packagePricing}>
                      {pkg.amount > 0 ? (
                        <Text style={styles.packagePrice}>₦{pkg.amount}</Text>
                      ) : (
                        <Text style={styles.customAmountLabel}>Custom</Text>
                      )}
                    </View>
                  </TouchableOpacity>
                ))}
              </View>

              {/* Custom Amount Input */}
              {selectedPackage?.amount === 0 && (
                <View style={styles.customAmountContainer}>
                  <Text style={styles.customAmountTitle}>Enter Amount</Text>
                  <TextInput
                    style={styles.customAmountInput}
                    value={customAmount}
                    onChangeText={setCustomAmount}
                    placeholder="Enter custom amount"
                    keyboardType="numeric"
                  />
                </View>
              )}
            </View>
          )}

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
                Pay Bill {(selectedPackage?.amount || customAmount) && 
                  `(₦${selectedPackage?.amount || customAmount})`}
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
    gap: 12,
  },
  providerCard: {
    width: '48%',
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
  },
  providerCardSelected: {
    borderColor: colors.primary,
    backgroundColor: colors.primaryTransparent,
  },
  providerCardDisabled: {
    opacity: 0.5,
  },
  providerEmoji: {
    fontSize: 32,
    marginBottom: 8,
  },
  providerName: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.text,
    textAlign: 'center',
  },
  providerNameDisabled: {
    color: colors.secondaryText,
  },
  comingSoon: {
    fontSize: 10,
    color: colors.secondaryText,
    marginTop: 4,
  },
  accountInputContainer: {
    marginBottom: 12,
  },
  accountInputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.card,
    borderRadius: 12,
    paddingHorizontal: 16,
    height: 56,
    borderWidth: 1,
    borderColor: colors.border,
  },
  accountIcon: {
    marginRight: 12,
  },
  accountInput: {
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
  contactAccount: {
    fontSize: 12,
    color: colors.secondaryText,
    marginTop: 2,
  },
  contactProvider: {
    fontSize: 12,
    color: colors.primary,
    fontWeight: '500',
  },
  packagesContainer: {
    gap: 12,
  },
  packageCard: {
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.border,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  packageCardSelected: {
    borderColor: colors.primary,
    backgroundColor: colors.primaryTransparent,
  },
  packageInfo: {
    flex: 1,
  },
  packageName: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 4,
  },
  packageDescription: {
    fontSize: 14,
    color: colors.text,
    marginBottom: 4,
  },
  packageValidity: {
    fontSize: 12,
    color: colors.secondaryText,
  },
  packagePricing: {
    alignItems: 'flex-end',
  },
  packagePrice: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.primary,
  },
  customAmountLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.primary,
  },
  customAmountContainer: {
    marginTop: 16,
  },
  customAmountTitle: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.text,
    marginBottom: 8,
  },
  customAmountInput: {
    backgroundColor: colors.card,
    borderRadius: 12,
    paddingHorizontal: 16,
    height: 56,
    fontSize: 16,
    color: colors.text,
    borderWidth: 1,
    borderColor: colors.border,
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
  successAccount: {
    fontSize: 14,
    color: colors.secondaryText,
    marginTop: 4,
  },
});

export default BillPaymentScreen;
