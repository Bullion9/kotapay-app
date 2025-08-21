import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  RefreshControl,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  ChevronLeft,
  Tv,
  CheckCircle,
  Users,
} from 'lucide-react-native';
import { colors } from '../theme';

interface CableProvider {
  id: string;
  name: string;
  logo: string;
  color: string;
}

interface CablePlan {
  id: string;
  name: string;
  price: number;
  duration: string;
  channels: string;
}

interface Contact {
  id: string;
  name: string;
  smartCardNumber: string;
  provider?: string;
}

const CableTVScreen: React.FC = () => {
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();
  
  const [refreshing, setRefreshing] = useState(false);
  const [smartCardNumber, setSmartCardNumber] = useState('');
  const [customerName, setCustomerName] = useState('');
  const [selectedProvider, setSelectedProvider] = useState<CableProvider | null>(null);
  const [selectedPlan, setSelectedPlan] = useState<CablePlan | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isValidating, setIsValidating] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [showContacts, setShowContacts] = useState(false);

  const onRefresh = React.useCallback(() => {
    setRefreshing(true);
    // Reset form or reload data
    setSmartCardNumber('');
    setCustomerName('');
    setSelectedProvider(null);
    setSelectedPlan(null);
    setTimeout(() => {
      setRefreshing(false);
    }, 1000);
  }, []);

  const providers: CableProvider[] = [
    { id: 'dstv', name: 'DStv', logo: '📺', color: '#FFD700' },
    { id: 'gotv', name: 'GOtv', logo: '📡', color: '#00A651' },
    { id: 'startimes', name: 'StarTimes', logo: '⭐', color: '#E31E24' },
    { id: 'showmax', name: 'Showmax', logo: '🎬', color: '#FF6B35' },
  ];

  // Mock recent contacts for demo
  const recentContacts: Contact[] = [
    { id: '1', name: 'Home Subscription', smartCardNumber: '1234567890', provider: 'DStv' },
    { id: '2', name: 'Office Cable', smartCardNumber: '9876543210', provider: 'GOtv' },
    { id: '3', name: 'Family Plan', smartCardNumber: '5555666677', provider: 'StarTimes' },
  ];

  // Mock cable plans
  const getCablePlans = (providerId: string): CablePlan[] => {
    const plans = {
      dstv: [
        { id: '1', name: 'DStv Access', price: 2150, duration: '1 month', channels: '90+ channels' },
        { id: '2', name: 'DStv Family', price: 4000, duration: '1 month', channels: '120+ channels' },
        { id: '3', name: 'DStv Compact', price: 7900, duration: '1 month', channels: '175+ channels' },
        { id: '4', name: 'DStv Premium', price: 18400, duration: '1 month', channels: '220+ channels' },
      ],
      gotv: [
        { id: '1', name: 'GOtv Lite', price: 410, duration: '1 month', channels: '15+ channels' },
        { id: '2', name: 'GOtv Value', price: 1520, duration: '1 month', channels: '45+ channels' },
        { id: '3', name: 'GOtv Plus', price: 2700, duration: '1 month', channels: '65+ channels' },
        { id: '4', name: 'GOtv Max', price: 4850, duration: '1 month', channels: '95+ channels' },
      ],
      startimes: [
        { id: '1', name: 'Nova Bouquet', price: 900, duration: '1 month', channels: '35+ channels' },
        { id: '2', name: 'Basic Bouquet', price: 1700, duration: '1 month', channels: '50+ channels' },
        { id: '3', name: 'Smart Bouquet', price: 2200, duration: '1 month', channels: '65+ channels' },
        { id: '4', name: 'Classic Bouquet', price: 2500, duration: '1 month', channels: '75+ channels' },
      ],
      showmax: [
        { id: '1', name: 'Mobile Plan', price: 1200, duration: '1 month', channels: 'Mobile only' },
        { id: '2', name: 'Standard Plan', price: 2900, duration: '1 month', channels: 'All devices' },
        { id: '3', name: 'Pro Plan', price: 4900, duration: '1 month', channels: 'HD + Sports' },
      ],
    };
    
    return plans[providerId as keyof typeof plans] || [];
  };

  const handleSmartCardChange = async (text: string) => {
    // Remove any non-digit characters
    const cleaned = text.replace(/\D/g, '');
    
    // Limit to 12 digits (typical smart card number length)
    if (cleaned.length <= 12) {
      setSmartCardNumber(cleaned);
      setCustomerName(''); // Reset customer name when card number changes
      
      // Auto-validate when number is complete (10+ digits)
      if (cleaned.length >= 10) {
        await validateSmartCard(cleaned);
      }
    }
  };

  const validateSmartCard = async (cardNumber: string) => {
    if (!selectedProvider || cardNumber.length < 10) return;
    
    try {
      setIsValidating(true);
      
      // Mock API call to validate smart card
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Mock customer name based on card number
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
      Alert.alert('Error', 'Failed to validate smart card number');
    } finally {
      setIsValidating(false);
    }
  };

  const selectContact = (contact: Contact) => {
    setSmartCardNumber(contact.smartCardNumber);
    const provider = providers.find(p => p.name === contact.provider);
    if (provider) {
      setSelectedProvider(provider);
      setSelectedPlan(null);
      validateSmartCard(contact.smartCardNumber);
    }
    setShowContacts(false);
  };

  const selectProvider = (provider: CableProvider) => {
    setSelectedProvider(provider);
    setSelectedPlan(null); // Reset plan when provider changes
    setCustomerName(''); // Reset customer name
    
    // Re-validate if we have a card number
    if (smartCardNumber.length >= 10) {
      validateSmartCard(smartCardNumber);
    }
  };

  const handleSubscription = async () => {
    if (!smartCardNumber || !selectedProvider || !selectedPlan || !customerName) {
      Alert.alert('Error', 'Please fill in all required fields and validate smart card');
      return;
    }

    if (smartCardNumber.length < 10) {
      Alert.alert('Error', 'Please enter a valid smart card number');
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
      Alert.alert('Error', 'Failed to process subscription. Please try again.');
    }
  };

  const isFormValid = smartCardNumber.length >= 10 && selectedProvider && selectedPlan && customerName;

  if (showSuccess) {
    return (
      <SafeAreaView style={[styles.container, { paddingTop: insets.top }]}>
        <View style={styles.successContainer}>
          <CheckCircle size={80} color={colors.success} />
          <Text style={styles.successTitle}>Subscription Successful!</Text>
          <Text style={styles.successMessage}>
            {selectedPlan?.name} subscription has been activated for
          </Text>
          <Text style={styles.successCustomer}>{customerName}</Text>
          <Text style={styles.successProvider}>via {selectedProvider?.name}</Text>
          <Text style={styles.successPrice}>Amount: ₦{selectedPlan?.price}</Text>
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
          <Text style={styles.headerTitle}>Cable TV</Text>
          <View style={styles.placeholder} />
        </View>

        <ScrollView 
          style={styles.content} 
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
        >
          {/* Cable Provider Selection */}
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
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Smart Card Number Input */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Smart Card Number</Text>
            <View style={styles.cardInputContainer}>
              <View style={styles.cardInputWrapper}>
                <Tv size={20} color={colors.secondaryText} style={styles.cardIcon} />
                <TextInput
                  style={styles.cardInput}
                  value={smartCardNumber}
                  onChangeText={handleSmartCardChange}
                  placeholder="Enter smart card number"
                  keyboardType="numeric"
                  maxLength={12}
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
                  <Text style={styles.validatingText}>Validating smart card...</Text>
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
                <Text style={styles.contactsTitle}>Recent Subscriptions</Text>
                {recentContacts.map(contact => (
                  <TouchableOpacity
                    key={contact.id}
                    style={styles.contactItem}
                    onPress={() => selectContact(contact)}
                  >
                    <View style={styles.contactInfo}>
                      <Text style={styles.contactName}>{contact.name}</Text>
                      <Text style={styles.contactCard}>{contact.smartCardNumber}</Text>
                    </View>
                    {contact.provider && (
                      <Text style={styles.contactNetwork}>{contact.provider}</Text>
                    )}
                  </TouchableOpacity>
                ))}
              </View>
            )}
          </View>

          {/* Subscription Plans */}
          {selectedProvider && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Select Plan</Text>
              <View style={styles.plansContainer}>
                {getCablePlans(selectedProvider.id).map((plan) => (
                  <TouchableOpacity
                    key={plan.id}
                    style={[
                      styles.planCard,
                      selectedPlan?.id === plan.id && styles.planCardSelected
                    ]}
                    onPress={() => setSelectedPlan(plan)}
                  >
                    <View style={styles.planInfo}>
                      <Text style={styles.planName}>{plan.name}</Text>
                      <Text style={styles.planChannels}>{plan.channels}</Text>
                      <Text style={styles.planDuration}>Valid for {plan.duration}</Text>
                    </View>
                    <View style={styles.planPricing}>
                      <Text style={styles.planPrice}>₦{plan.price}</Text>
                    </View>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          )}

          <View style={styles.bottomPadding} />
        </ScrollView>

        {/* Subscribe Button */}
        <View style={styles.footer}>
          <TouchableOpacity
            style={[styles.subscribeButton, !isFormValid && styles.subscribeButtonDisabled]}
            onPress={handleSubscription}
            disabled={!isFormValid || isLoading}
          >
            {isLoading ? (
              <ActivityIndicator color={colors.white} />
            ) : (
              <Text style={styles.subscribeButtonText}>
                Subscribe {selectedPlan && `(₦${selectedPlan.price})`}
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
  providerEmoji: {
    fontSize: 32,
    marginBottom: 8,
  },
  providerName: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.text,
  },
  cardInputContainer: {
    marginBottom: 12,
  },
  cardInputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.card,
    borderRadius: 12,
    paddingHorizontal: 16,
    height: 56,
    borderWidth: 1,
    borderColor: colors.border,
  },
  cardIcon: {
    marginRight: 12,
  },
  cardInput: {
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
  contactCard: {
    fontSize: 12,
    color: colors.secondaryText,
    marginTop: 2,
  },
  contactNetwork: {
    fontSize: 12,
    color: colors.primary,
    fontWeight: '500',
  },
  plansContainer: {
    gap: 12,
  },
  planCard: {
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.border,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  planCardSelected: {
    borderColor: colors.primary,
    backgroundColor: colors.primaryTransparent,
  },
  planInfo: {
    flex: 1,
  },
  planName: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 4,
  },
  planChannels: {
    fontSize: 14,
    color: colors.text,
    marginBottom: 4,
  },
  planDuration: {
    fontSize: 12,
    color: colors.secondaryText,
  },
  planPricing: {
    alignItems: 'flex-end',
  },
  planPrice: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.primary,
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
  subscribeButton: {
    backgroundColor: colors.primary,
    borderRadius: 12,
    height: 56,
    alignItems: 'center',
    justifyContent: 'center',
  },
  subscribeButtonDisabled: {
    backgroundColor: colors.border,
  },
  subscribeButtonText: {
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
  successPrice: {
    fontSize: 14,
    color: colors.secondaryText,
    marginTop: 4,
  },
});

export default CableTVScreen;
