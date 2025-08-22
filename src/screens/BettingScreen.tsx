import { useNavigation } from '@react-navigation/native';
import {
    CheckCircle,
    ChevronLeft,
    Trophy,
    Users,
} from 'lucide-react-native';
import React, { useRef, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    Animated,
    Image,
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

// Import betting provider logos using PNG files (converted from JPG)
const bet9jaLogo = require('../assets/betting-logos/bet9ja.png');
const sportybetLogo = require('../assets/betting-logos/sportybet.png');
const nairabetLogo = require('../assets/betting-logos/nairabet.png');
const oneXBetLogo = require('../assets/betting-logos/1xbet.png');
const betwayLogo = require('../assets/betting-logos/betway.png');
const merrybetLogo = require('../assets/betting-logos/merrybet.png');

interface BettingProvider {
  id: string;
  name: string;
  logo: any;
  color: string;
  minAmount: number;
}

interface Contact {
  id: string;
  name: string;
  userId: string;
  provider?: string;
}

const BettingScreen: React.FC = () => {
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();
  
  const [refreshing, setRefreshing] = useState(false);
  const [userId, setUserId] = useState('');
  const [amount, setAmount] = useState('');
  const [customerName, setCustomerName] = useState('');
  const [selectedProvider, setSelectedProvider] = useState<BettingProvider | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isValidating, setIsValidating] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [showContacts, setShowContacts] = useState(false);
  const [spinningButton, setSpinningButton] = useState<string | null>(null);
  
  const spinValue = useRef(new Animated.Value(0)).current;

  const onRefresh = React.useCallback(() => {
    setRefreshing(true);
    // Reset form or reload data
    setUserId('');
    setAmount('');
    setCustomerName('');
    setSelectedProvider(null);
    setTimeout(() => {
      setRefreshing(false);
    }, 1000);
  }, []);

  const providers: BettingProvider[] = [
    { id: 'bet9ja', name: 'Bet9ja', logo: bet9jaLogo, color: '#00A651', minAmount: 100 },
    { id: 'sportybet', name: 'SportyBet', logo: sportybetLogo, color: '#FF6B35', minAmount: 100 },
    { id: 'nairabet', name: 'NairaBet', logo: nairabetLogo, color: '#FFB84D', minAmount: 100 },
    { id: '1xbet', name: '1xBet', logo: oneXBetLogo, color: '#E31E24', minAmount: 100 },
    { id: 'betway', name: 'Betway', logo: betwayLogo, color: '#4169E1', minAmount: 100 },
    { id: 'merrybet', name: 'MerryBet', logo: merrybetLogo, color: '#32CD32', minAmount: 100 },
  ];

  const quickAmounts = ['500', '1000', '2000', '3000', '5000', '10000', '15000', '20000', '25000', '50000'];

  // Mock recent contacts for demo
  const recentContacts: Contact[] = [
    { id: '1', name: 'Personal Account', userId: 'BET123456', provider: 'Bet9ja' },
    { id: '2', name: 'Gaming Profile', userId: 'SPT789012', provider: 'SportyBet' },
    { id: '3', name: 'Main Wallet', userId: 'NAI345678', provider: 'NairaBet' },
  ];

  const handleUserIdChange = async (text: string) => {
    // Remove spaces and convert to uppercase for consistency
    const cleaned = text.replace(/\s/g, '').toUpperCase();
    
    if (cleaned.length <= 20) {
      setUserId(cleaned);
      setCustomerName(''); // Reset customer name when user ID changes
      
      // Auto-validate when ID seems complete (6+ characters)
      if (cleaned.length >= 6 && selectedProvider) {
        await validateUserId(cleaned);
      }
    }
  };

  const validateUserId = async (id: string) => {
    if (!selectedProvider || id.length < 6) return;
    
    try {
      setIsValidating(true);
      
      // Mock API call to validate user ID
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Mock customer name based on user ID
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
      Alert.alert('Error', 'Failed to validate user ID');
    } finally {
      setIsValidating(false);
    }
  };

  const selectContact = (contact: Contact) => {
    setUserId(contact.userId);
    const provider = providers.find(p => p.name === contact.provider);
    if (provider) {
      setSelectedProvider(provider);
      validateUserId(contact.userId);
    }
    setShowContacts(false);
  };

  const selectProvider = (provider: BettingProvider) => {
    setSelectedProvider(provider);
    setCustomerName(''); // Reset customer name
    
    // Re-validate if we have a user ID
    if (userId.length >= 6) {
      validateUserId(userId);
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

  const handleFundWallet = async () => {
    if (!userId || !amount || !selectedProvider || !customerName) {
      Alert.alert('Error', 'Please fill in all required fields and validate user ID');
      return;
    }

    if (userId.length < 6) {
      Alert.alert('Error', 'Please enter a valid user ID');
      return;
    }

    const amountNum = parseInt(amount);
    if (isNaN(amountNum) || amountNum < selectedProvider.minAmount) {
      Alert.alert('Error', `Minimum funding amount for ${selectedProvider.name} is ₦${selectedProvider.minAmount}`);
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
      Alert.alert('Error', 'Failed to fund wallet. Please try again.');
    }
  };

  const isFormValid = userId.length >= 6 && amount && selectedProvider && customerName;

  if (showSuccess) {
    return (
      <SafeAreaView style={[styles.container, { paddingTop: insets.top }]}>
        <View style={styles.successContainer}>
          <CheckCircle size={80} color={colors.success} />
          <Text style={styles.successTitle}>Wallet Funded Successfully!</Text>
          <Text style={styles.successMessage}>
            ₦{amount} has been added to your {selectedProvider?.name} wallet
          </Text>
          <Text style={styles.successCustomer}>{customerName}</Text>
          <Text style={styles.successUserId}>User ID: {userId}</Text>
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
          <Text style={styles.headerTitle}>Fund Betting Wallet</Text>
          <View style={styles.placeholder} />
        </View>

        <ScrollView 
          style={styles.content} 
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
        >
          {/* Betting Provider Selection */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Select Betting Platform</Text>
            <View style={[styles.providersGrid, styles.providersContainer]}>
              {providers.map((provider) => (
                <TouchableOpacity
                  key={provider.id}
                  style={styles.providerItem}
                  onPress={() => selectProvider(provider)}
                  activeOpacity={0.7}
                >
                  <View style={styles.providerLogoWrapper}>
                    <View style={[styles.providerLogoContainer, { backgroundColor: provider.color + '20' }]}>
                      <Image source={provider.logo} style={styles.providerLogo} resizeMode="cover" />
                    </View>
                    {selectedProvider?.id === provider.id && (
                      <View style={styles.checkmarkContainer}>
                        <CheckCircle size={18} color="#4CAF50" fill="#4CAF50" />
                      </View>
                    )}
                  </View>
                  <Text style={styles.providerName}>{provider.name}</Text>
                  <Text style={styles.providerMin}>Min: ₦{provider.minAmount}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* User ID Input */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>User ID</Text>
            <View style={styles.userIdInputContainer}>
              <View style={styles.userIdInputWrapper}>
                <Trophy size={20} color={colors.secondaryText} style={styles.userIdIcon} />
                <TextInput
                  style={styles.userIdInput}
                  value={userId}
                  onChangeText={handleUserIdChange}
                  placeholder="Enter your user ID"
                  autoCapitalize="characters"
                  maxLength={20}
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
                  <Text style={styles.validatingText}>Validating user ID...</Text>
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
                <Text style={styles.contactsTitle}>Recent Betting Accounts</Text>
                {recentContacts.map(contact => (
                  <TouchableOpacity
                    key={contact.id}
                    style={styles.contactItem}
                    onPress={() => selectContact(contact)}
                  >
                    <View style={styles.contactInfo}>
                      <Text style={styles.contactName}>{contact.name}</Text>
                      <Text style={styles.contactUserId}>{contact.userId}</Text>
                    </View>
                    <View style={styles.contactDetails}>
                      {contact.provider && (
                        <Text style={styles.contactProvider}>{contact.provider}</Text>
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
              placeholder={selectedProvider ? `Minimum ₦${selectedProvider.minAmount}` : 'Enter amount'}
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

          {/* Info Box */}
          {selectedProvider && (
            <View style={styles.infoBox}>
              <Text style={styles.infoTitle}>💡 Quick Info</Text>
              <Text style={styles.infoText}>
                • Minimum funding: ₦{selectedProvider.minAmount}
              </Text>
              <Text style={styles.infoText}>
                • Instant wallet funding
              </Text>
              <Text style={styles.infoText}>
                • Secure transactions
              </Text>
            </View>
          )}

          <View style={styles.bottomPadding} />
        </ScrollView>

        {/* Fund Button */}
        <View style={styles.footer}>
          <TouchableOpacity
            style={[styles.fundButton, !isFormValid && styles.fundButtonDisabled]}
            onPress={handleFundWallet}
            disabled={!isFormValid || isLoading}
          >
            {isLoading ? (
              <ActivityIndicator color={colors.white} />
            ) : (
              <Text style={styles.fundButtonText}>
                Fund Wallet {amount && `(₦${amount})`}
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
    marginVertical: 8,
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  providersContainer: {
    paddingHorizontal: 8,
    gap: 8,
    justifyContent: 'space-between',
  },
  providerItem: {
    width: '30%',
    alignItems: 'center',
    marginBottom: 16,
  },
  providerLogoWrapper: {
    position: 'relative',
    marginBottom: 8,
  },
  providerLogoContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  checkmarkContainer: {
    position: 'absolute',
    top: -8,
    right: -8,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  providerLogo: {
    width: 40,
    height: 40,
  },
  providerName: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.text,
    textAlign: 'center',
    marginBottom: 2,
  },
  providerMin: {
    fontSize: 11,
    color: colors.secondaryText,
    fontWeight: '500',
  },
  userIdInputContainer: {
    marginBottom: 12,
  },
  userIdInputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.card,
    borderRadius: 12,
    paddingHorizontal: 16,
    height: 56,
    borderWidth: 1,
    borderColor: colors.border,
  },
  userIdIcon: {
    marginRight: 12,
  },
  userIdInput: {
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
  contactUserId: {
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
  infoBox: {
    backgroundColor: colors.primaryTransparent,
    borderRadius: 12,
    padding: 16,
    marginTop: 16,
  },
  infoTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.primary,
    marginBottom: 8,
  },
  infoText: {
    fontSize: 12,
    color: colors.text,
    marginBottom: 4,
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
  fundButton: {
    backgroundColor: colors.primary,
    borderRadius: 12,
    height: 56,
    alignItems: 'center',
    justifyContent: 'center',
  },
  fundButtonDisabled: {
    backgroundColor: colors.border,
  },
  fundButtonText: {
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
    marginTop: 8,
  },
  successUserId: {
    fontSize: 14,
    color: colors.secondaryText,
    marginTop: 4,
  },
});

export default BettingScreen;
