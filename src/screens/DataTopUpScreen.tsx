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
  Image,
  RefreshControl,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  ChevronLeft,
  Phone,
  CheckCircle,
  Users,
  Wifi,
} from 'lucide-react-native';
import { colors } from '../theme';

// Import network provider logos
const mtnLogo = require('../../logo/MTN.png');
const gloLogo = require('../../logo/Glo.png');
const airtelLogo = require('../../logo/Airtel.png');
const nineMobileLogo = require('../../logo/9mobile.png');

interface DataProvider {
  id: string;
  name: string;
  color: string;
  logo: any;
}

interface DataPlan {
  id: string;
  name: string;
  size: string;
  price: number;
  validity: string;
}

interface Contact {
  id: string;
  name: string;
  phoneNumber: string;
  network?: string;
}

const DataTopUpScreen: React.FC = () => {
  const navigation = useNavigation();
  
  const [phoneNumber, setPhoneNumber] = useState('');
  const [selectedProvider, setSelectedProvider] = useState<DataProvider | null>(null);
  const [selectedPlan, setSelectedPlan] = useState<DataPlan | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [showContacts, setShowContacts] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const providers: DataProvider[] = [
    { id: 'mtn', name: 'MTN', color: '#FFCC00', logo: mtnLogo },
    { id: 'glo', name: 'Glo', color: '#008E00', logo: gloLogo },
    { id: 'airtel', name: 'Airtel', color: '#FF0000', logo: airtelLogo },
    { id: '9mobile', name: '9mobile', color: '#00B04F', logo: nineMobileLogo },
  ];

  // Mock recent contacts for demo
  const recentContacts: Contact[] = [
    { id: '1', name: 'John Doe', phoneNumber: '08012345678', network: 'MTN' },
    { id: '2', name: 'Jane Smith', phoneNumber: '08098765432', network: 'Glo' },
    { id: '3', name: 'Mike Johnson', phoneNumber: '08087654321', network: 'Airtel' },
  ];

  // Mock data plans
  const getDataPlans = (providerId: string): DataPlan[] => {
    const plans = {
      mtn: [
        { id: '1', name: 'MTN 1GB', size: '1GB', price: 300, validity: '30 days' },
        { id: '2', name: 'MTN 2GB', size: '2GB', price: 500, validity: '30 days' },
        { id: '3', name: 'MTN 5GB', size: '5GB', price: 1200, validity: '30 days' },
        { id: '4', name: 'MTN 10GB', size: '10GB', price: 2000, validity: '30 days' },
      ],
      glo: [
        { id: '1', name: 'Glo 1GB', size: '1GB', price: 350, validity: '30 days' },
        { id: '2', name: 'Glo 2GB', size: '2GB', price: 600, validity: '30 days' },
        { id: '3', name: 'Glo 5GB', size: '5GB', price: 1300, validity: '30 days' },
        { id: '4', name: 'Glo 10GB', size: '10GB', price: 2200, validity: '30 days' },
      ],
      airtel: [
        { id: '1', name: 'Airtel 1GB', size: '1GB', price: 320, validity: '30 days' },
        { id: '2', name: 'Airtel 2GB', size: '2GB', price: 550, validity: '30 days' },
        { id: '3', name: 'Airtel 5GB', size: '5GB', price: 1250, validity: '30 days' },
        { id: '4', name: 'Airtel 10GB', size: '10GB', price: 2100, validity: '30 days' },
      ],
      '9mobile': [
        { id: '1', name: '9mobile 1GB', size: '1GB', price: 340, validity: '30 days' },
        { id: '2', name: '9mobile 2GB', size: '2GB', price: 580, validity: '30 days' },
        { id: '3', name: '9mobile 5GB', size: '5GB', price: 1280, validity: '30 days' },
        { id: '4', name: '9mobile 10GB', size: '10GB', price: 2150, validity: '30 days' },
      ],
    };
    
    return plans[providerId as keyof typeof plans] || [];
  };

  const detectNetwork = (phone: string): DataProvider | null => {
    if (!phone) return null;
    
    const mtnPrefixes = ['0803', '0806', '0703', '0706', '0813', '0816', '0810', '0814', '0903', '0906', '0913', '0916'];
    const gloPrefixes = ['0805', '0807', '0705', '0815', '0811', '0905', '0915'];
    const airtelPrefixes = ['0802', '0808', '0708', '0812', '0701', '0902', '0907', '0901', '0912'];
    const nineMobilePrefixes = ['0809', '0818', '0817', '0909', '0908'];

    const prefix = phone.substring(0, 4);
    
    if (mtnPrefixes.includes(prefix)) return providers[0];
    if (gloPrefixes.includes(prefix)) return providers[1];
    if (airtelPrefixes.includes(prefix)) return providers[2];
    if (nineMobilePrefixes.includes(prefix)) return providers[3];
    
    return null;
  };

  const handlePhoneNumberChange = (text: string) => {
    // Remove any non-digit characters
    const cleaned = text.replace(/\D/g, '');
    
    // Limit to 11 digits
    if (cleaned.length <= 11) {
      setPhoneNumber(cleaned);
      
      // Auto-detect network when phone number is complete
      if (cleaned.length >= 4) {
        const network = detectNetwork(cleaned);
        if (network) {
          setSelectedProvider(network);
          setSelectedPlan(null); // Reset plan when provider changes
        }
      }
    }
  };

  const formatPhoneNumber = (phone: string) => {
    if (phone.length <= 4) return phone;
    if (phone.length <= 7) return `${phone.slice(0, 4)} ${phone.slice(4)}`;
    return `${phone.slice(0, 4)} ${phone.slice(4, 7)} ${phone.slice(7)}`;
  };

  const onRefresh = async () => {
    setRefreshing(true);
    // Simulate refresh delay
    setTimeout(() => {
      setRefreshing(false);
    }, 1000);
  };

  const selectContact = (contact: Contact) => {
    setPhoneNumber(contact.phoneNumber);
    const network = detectNetwork(contact.phoneNumber);
    if (network) {
      setSelectedProvider(network);
      setSelectedPlan(null);
    }
    setShowContacts(false);
  };

  const selectProvider = (provider: DataProvider) => {
    setSelectedProvider(provider);
    setSelectedPlan(null); // Reset plan when provider changes
  };

  const handlePurchase = async () => {
    if (!phoneNumber || !selectedProvider || !selectedPlan) {
      Alert.alert('Error', 'Please fill in all required fields');
      return;
    }

    if (phoneNumber.length !== 11) {
      Alert.alert('Error', 'Please enter a valid 11-digit phone number');
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
      Alert.alert('Error', 'Failed to purchase data. Please try again.');
    }
  };

  const isFormValid = phoneNumber.length === 11 && selectedProvider && selectedPlan;

  if (showSuccess) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.successContainer}>
          <CheckCircle size={80} color={colors.success} />
          <Text style={styles.successTitle}>Data Purchase Successful!</Text>
          <Text style={styles.successMessage}>
            {selectedPlan?.size} data bundle has been sent to {formatPhoneNumber(phoneNumber)}
          </Text>
          <Text style={styles.successNetwork}>via {selectedProvider?.name}</Text>
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
          <Text style={styles.headerTitle}>Buy Data</Text>
          <View style={styles.placeholder} />
        </View>

        <ScrollView 
          style={styles.content} 
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
        >
          {/* Phone Number Input */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Phone Number</Text>
            <View style={styles.phoneInputContainer}>
              <View style={styles.phoneInputWrapper}>
                <Phone size={20} color={colors.secondaryText} style={styles.phoneIcon} />
                <TextInput
                  style={styles.phoneInput}
                  value={formatPhoneNumber(phoneNumber)}
                  onChangeText={handlePhoneNumberChange}
                  placeholder="Enter phone number"
                  keyboardType="numeric"
                  maxLength={13} // Formatted length
                />
                <TouchableOpacity 
                  style={styles.contactsButton}
                  onPress={() => setShowContacts(!showContacts)}
                >
                  <Users size={20} color={colors.primary} />
                </TouchableOpacity>
              </View>
            </View>

            {/* Network Detection */}
            {selectedProvider && (
              <View style={styles.networkDetected}>
                <Image source={selectedProvider.logo} style={styles.networkLogo} />
                <Text style={styles.networkName}>{selectedProvider.name} detected</Text>
              </View>
            )}

            {/* Recent Contacts */}
            {showContacts && (
              <View style={styles.contactsList}>
                <Text style={styles.contactsTitle}>Recent Contacts</Text>
                {recentContacts.map(contact => (
                  <TouchableOpacity
                    key={contact.id}
                    style={styles.contactItem}
                    onPress={() => selectContact(contact)}
                  >
                    <View style={styles.contactInfo}>
                      <Text style={styles.contactName}>{contact.name}</Text>
                      <Text style={styles.contactPhone}>{contact.phoneNumber}</Text>
                    </View>
                    {contact.network && (
                      <Text style={styles.contactNetwork}>{contact.network}</Text>
                    )}
                  </TouchableOpacity>
                ))}
              </View>
            )}
          </View>

          {/* Network Provider Selection */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Network Provider</Text>
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
                  <Image source={provider.logo} style={styles.providerLogo} />
                  <Text style={styles.providerName}>{provider.name}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Data Plans */}
          {selectedProvider && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Select Data Plan</Text>
              <View style={styles.plansContainer}>
                {getDataPlans(selectedProvider.id).map((plan) => (
                  <TouchableOpacity
                    key={plan.id}
                    style={[
                      styles.planCard,
                      selectedPlan?.id === plan.id && styles.planCardSelected
                    ]}
                    onPress={() => setSelectedPlan(plan)}
                  >
                    <View style={styles.planInfo}>
                      <View style={styles.planHeader}>
                        <Wifi size={20} color={colors.primary} />
                        <Text style={styles.planSize}>{plan.size}</Text>
                      </View>
                      <Text style={styles.planName}>{plan.name}</Text>
                      <Text style={styles.planValidity}>Valid for {plan.validity}</Text>
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

        {/* Purchase Button */}
        <View style={styles.footer}>
          <TouchableOpacity
            style={[styles.purchaseButton, !isFormValid && styles.purchaseButtonDisabled]}
            onPress={handlePurchase}
            disabled={!isFormValid || isLoading}
          >
            {isLoading ? (
              <ActivityIndicator color={colors.white} />
            ) : (
              <>
                <Text style={styles.purchaseButtonText}>
                  Purchase Data {selectedPlan && `(₦${selectedPlan.price})`}
                </Text>
                <View style={styles.discountBadge}>
                  <Text style={styles.discountText}>2% OFF</Text>
                </View>
              </>
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
  phoneInputContainer: {
    marginBottom: 12,
  },
  phoneInputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.card,
    borderRadius: 12,
    paddingHorizontal: 16,
    height: 56,
    borderWidth: 1,
    borderColor: colors.border,
  },
  phoneIcon: {
    marginRight: 12,
  },
  phoneInput: {
    flex: 1,
    fontSize: 16,
    color: colors.text,
  },
  contactsButton: {
    padding: 4,
  },
  networkDetected: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
    padding: 12,
    backgroundColor: colors.successTransparent,
    borderRadius: 8,
  },
  networkLogo: {
    width: 24,
    height: 24,
    marginRight: 8,
  },
  networkName: {
    fontSize: 14,
    color: colors.success,
    fontWeight: '500',
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
  contactPhone: {
    fontSize: 12,
    color: colors.secondaryText,
    marginTop: 2,
  },
  contactNetwork: {
    fontSize: 12,
    color: colors.primary,
    fontWeight: '500',
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
  providerLogo: {
    width: 40,
    height: 40,
    marginBottom: 8,
  },
  providerName: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.text,
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
  planHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  planSize: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text,
    marginLeft: 8,
  },
  planName: {
    fontSize: 14,
    color: colors.text,
    marginBottom: 4,
  },
  planValidity: {
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
  purchaseButton: {
    backgroundColor: colors.primary,
    borderRadius: 12,
    height: 56,
    alignItems: 'center',
    justifyContent: 'center',
  },
  purchaseButtonDisabled: {
    backgroundColor: colors.border,
  },
  purchaseButtonText: {
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
  successNetwork: {
    fontSize: 14,
    color: colors.secondaryText,
    marginTop: 8,
  },
  successPrice: {
    fontSize: 14,
    color: colors.secondaryText,
    marginTop: 4,
  },
  discountBadge: {
    position: 'absolute',
    top: -8,
    right: 12,
    backgroundColor: '#FF4757',
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 1,
  },
  discountText: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
});

export default DataTopUpScreen;
