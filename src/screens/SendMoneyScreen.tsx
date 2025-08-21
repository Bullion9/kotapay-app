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
  RefreshControl,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  ChevronLeft,
  Users,
  QrCode,
  UserPlus,
  CheckCircle,
} from 'lucide-react-native';
import PinEntryModal from '../components/PinEntryModal';
import { colors } from '../theme';

interface Contact {
  id: string;
  name: string;
  phone: string;
  isRegistered: boolean;
}

interface SendMethod {
  id: string;
  name: string;
  description: string;
  icon: any;
}

const SendMoneyScreen: React.FC = () => {
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();
  
  // State
  const [amount, setAmount] = useState('');
  const [selectedContact, setSelectedContact] = useState<Contact | null>(null);
  const [selectedMethod, setSelectedMethod] = useState<SendMethod | null>(null);
  const [description, setDescription] = useState('');
  const [showPinModal, setShowPinModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [amountFocused, setAmountFocused] = useState(false);
  const [descriptionFocused, setDescriptionFocused] = useState(false);

  // Mock user balance
  const userBalance = 450000;

  // Mock recent contacts
  const recentContacts: Contact[] = [
    { id: '1', name: 'John Doe', phone: '+234801234567', isRegistered: true },
    { id: '2', name: 'Jane Smith', phone: '+234802345678', isRegistered: true },
    { id: '3', name: 'Mike Johnson', phone: '+234803456789', isRegistered: false },
  ];

  // Send methods
  const sendMethods: SendMethod[] = [
    {
      id: 'contact',
      name: 'To Contact',
      description: 'Send to someone in your contacts',
      icon: Users,
    },
    {
      id: 'qr_code',
      name: 'Scan QR Code',
      description: 'Scan recipient\'s QR code',
      icon: QrCode,
    },
    {
      id: 'new_contact',
      name: 'New Contact',
      description: 'Send to someone new',
      icon: UserPlus,
    },
  ];

  // Validate amount
  const validateAmount = () => {
    const numAmount = parseFloat(amount);
    if (isNaN(numAmount) || numAmount <= 0) {
      Alert.alert('Error', 'Please enter a valid amount');
      return false;
    }
    if (numAmount < 50) {
      Alert.alert('Error', 'Minimum send amount is ₦50');
      return false;
    }
    if (numAmount > userBalance) {
      Alert.alert('Error', 'Amount exceeds your available balance');
      return false;
    }
    return true;
  };

  // Handle method selection
  const handleMethodSelect = (method: SendMethod) => {
    setSelectedMethod(method);
    
    if (method.id === 'qr_code') {
      navigation.navigate('QRScanner');
      return;
    }
    
    if (method.id === 'new_contact') {
      navigation.navigate('AddContact');
      return;
    }
    
    // For contacts method, we'll show contact selection in the same screen
  };

  // Handle contact selection
  const handleContactSelect = (contact: Contact) => {
    setSelectedContact(contact);
  };

  // Handle continue button press
  const handleContinue = () => {
    if (!validateAmount()) return;
    
    if (!selectedMethod) {
      Alert.alert('Error', 'Please select a send method');
      return;
    }
    
    if (selectedMethod.id === 'contact' && !selectedContact) {
      Alert.alert('Error', 'Please select a contact');
      return;
    }
    
    setShowPinModal(true);
  };

  // Handle PIN verification
  const handlePinVerified = async (pin: string) => {
    setShowPinModal(false);
    setLoading(true);

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      setLoading(false);
      setShowSuccess(true);
      
      // Show success notification
      Alert.alert(
        'Success',
        `₦${amount} sent successfully${selectedContact ? ` to ${selectedContact.name}` : ''}`
      );
    } catch {
      setLoading(false);
      Alert.alert('Error', 'Send money failed. Please try again.');
    }
  };

  // Pull to refresh
  const onRefresh = async () => {
    setRefreshing(true);
    await new Promise(resolve => setTimeout(resolve, 1000));
    setRefreshing(false);
  };

  // Success Screen Component
  const SuccessScreen = () => (
    <View style={styles.successContainer}>
      <View style={styles.successIcon}>
        <CheckCircle size={60} color={colors.primary} />
      </View>
      <Text style={styles.successTitle}>Money Sent!</Text>
      <Text style={styles.successMessage}>
        ₦{amount} has been sent successfully{selectedContact ? ` to ${selectedContact.name}` : ''}.
        {description && ` Note: ${description}`}
      </Text>
      <TouchableOpacity
        style={styles.doneButton}
        onPress={() => {
          setShowSuccess(false);
          setAmount('');
          setSelectedContact(null);
          setSelectedMethod(null);
          setDescription('');
          navigation.goBack();
        }}
      >
        <Text style={styles.doneButtonText}>Done</Text>
      </TouchableOpacity>
    </View>
  );

  if (showSuccess) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <View style={styles.placeholder} />
          <Text style={styles.headerTitle}>Send Money</Text>
          <View style={styles.placeholder} />
        </View>
        
        <View style={styles.successContentWrapper}>
          <SuccessScreen />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Fixed Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <ChevronLeft size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Send Money</Text>
        <View style={styles.placeholder} />
      </View>

      <KeyboardAvoidingView 
        style={styles.keyboardAvoidingView}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
      >
        {/* Scrollable Content */}
        <ScrollView 
          style={styles.scrollContent} 
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
        >
          {/* Balance Display */}
          <View style={styles.balanceSection}>
            <Text style={styles.balanceLabel}>Available Balance</Text>
            <Text style={styles.balanceAmount}>₦{userBalance.toLocaleString()}</Text>
          </View>

          {/* Amount Input Section */}
          <View style={styles.amountSection}>
            <Text style={styles.sectionTitle}>Enter Amount</Text>
            
            <View style={[
              styles.amountContainer,
              amountFocused && styles.amountContainerFocused
            ]}>
              <Text style={styles.currencySymbol}>₦</Text>
              <TextInput
                style={styles.amountInput}
                placeholder="0.00"
                value={amount}
                onChangeText={setAmount}
                onFocus={() => setAmountFocused(true)}
                onBlur={() => setAmountFocused(false)}
                keyboardType="numeric"
                placeholderTextColor="#ccc"
                maxLength={10}
              />
            </View>
          </View>

          {/* Description Input Section */}
          <View style={styles.descriptionSection}>
            <Text style={styles.sectionTitle}>Description (Optional)</Text>
            
            <View style={[
              styles.descriptionContainer,
              descriptionFocused && styles.descriptionContainerFocused
            ]}>
              <TextInput
                style={styles.descriptionInput}
                placeholder="What's this for?"
                value={description}
                onChangeText={setDescription}
                onFocus={() => setDescriptionFocused(true)}
                onBlur={() => setDescriptionFocused(false)}
                placeholderTextColor="#ccc"
                maxLength={50}
              />
            </View>
          </View>

          {/* Send Methods */}
          <View style={styles.methodsSection}>
            <Text style={styles.sectionTitle}>Select Send Method</Text>
            {sendMethods.map((method) => (
              <TouchableOpacity
                key={method.id}
                style={[
                  styles.methodCard,
                  selectedMethod?.id === method.id && styles.selectedMethodCard,
                ]}
                onPress={() => handleMethodSelect(method)}
              >
                <View style={styles.methodIcon}>
                  <method.icon size={24} color={selectedMethod?.id === method.id ? colors.primary : colors.secondaryText} />
                </View>
                <View style={styles.methodInfo}>
                  <Text style={styles.methodName}>{method.name}</Text>
                  <Text style={styles.methodDescription}>{method.description}</Text>
                </View>
                {selectedMethod?.id === method.id && (
                  <CheckCircle size={20} color={colors.primary} />
                )}
              </TouchableOpacity>
            ))}
          </View>

          {/* Recent Contacts (when contact method is selected) */}
          {selectedMethod?.id === 'contact' && (
            <View style={styles.contactsSection}>
              <Text style={styles.sectionTitle}>Recent Contacts</Text>
              {recentContacts.map((contact) => (
                <TouchableOpacity
                  key={contact.id}
                  style={[
                    styles.contactCard,
                    selectedContact?.id === contact.id && styles.selectedContactCard,
                  ]}
                  onPress={() => handleContactSelect(contact)}
                >
                  <View style={styles.contactAvatar}>
                    <Text style={styles.contactAvatarText}>
                      {contact.name.charAt(0).toUpperCase()}
                    </Text>
                  </View>
                  <View style={styles.contactInfo}>
                    <Text style={styles.contactName}>{contact.name}</Text>
                    <Text style={styles.contactPhone}>{contact.phone}</Text>
                    <Text style={[
                      styles.contactStatus,
                      contact.isRegistered ? styles.registeredStatus : styles.unregisteredStatus
                    ]}>
                      {contact.isRegistered ? 'KotaPay User' : 'Not on KotaPay'}
                    </Text>
                  </View>
                  {selectedContact?.id === contact.id && (
                    <CheckCircle size={20} color={colors.primary} />
                  )}
                </TouchableOpacity>
              ))}
            </View>
          )}

          {/* Transaction Summary */}
          {amount && selectedMethod && (
            <View style={styles.summarySection}>
              <Text style={styles.sectionTitle}>Transaction Summary</Text>
              <View style={styles.summaryCard}>
                <View style={styles.summaryRow}>
                  <Text style={styles.summaryLabel}>Amount</Text>
                  <Text style={styles.summaryValue}>₦{parseFloat(amount || '0').toLocaleString()}</Text>
                </View>
                <View style={styles.summaryRow}>
                  <Text style={styles.summaryLabel}>Method</Text>
                  <Text style={styles.summaryValue}>{selectedMethod.name}</Text>
                </View>
                {selectedContact && (
                  <View style={styles.summaryRow}>
                    <Text style={styles.summaryLabel}>Recipient</Text>
                    <Text style={styles.summaryValue}>{selectedContact.name}</Text>
                  </View>
                )}
                {description && (
                  <View style={styles.summaryRow}>
                    <Text style={styles.summaryLabel}>Description</Text>
                    <Text style={styles.summaryValue}>{description}</Text>
                  </View>
                )}
              </View>
            </View>
          )}
        </ScrollView>

        {/* Fixed Continue Button */}
        <View style={[styles.buttonContainer, { paddingBottom: Math.max(insets.bottom, 20) }]}>
          <TouchableOpacity
            style={[
              styles.continueButton,
              (!amount || !selectedMethod || loading || (selectedMethod.id === 'contact' && !selectedContact)) && styles.disabledButton,
            ]}
            onPress={handleContinue}
            disabled={!amount || !selectedMethod || loading || (selectedMethod.id === 'contact' && !selectedContact)}
          >
            {loading ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <Text style={styles.continueButtonText}>
                Send Money
              </Text>
            )}
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>

      {/* PIN Modal */}
      {showPinModal && (
        <PinEntryModal
          visible={showPinModal}
          onClose={() => setShowPinModal(false)}
          onPinEntered={handlePinVerified}
          title="Enter Transaction PIN"
          subtitle={`Confirm sending ₦${amount}${selectedContact ? ` to ${selectedContact.name}` : ''}`}
        />
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 16,
    backgroundColor: colors.background,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    flex: 1,
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
    textAlign: 'center',
    marginRight: 40, // Offset for back button
  },
  placeholder: {
    width: 40,
  },
  keyboardAvoidingView: {
    flex: 1,
  },
  scrollContent: {
    flex: 1,
    paddingHorizontal: 16,
  },
  balanceSection: {
    backgroundColor: colors.primary,
    borderRadius: 12,
    padding: 20,
    marginVertical: 16,
    alignItems: 'center',
  },
  balanceLabel: {
    fontSize: 14,
    color: colors.white,
    opacity: 0.8,
    marginBottom: 8,
  },
  balanceAmount: {
    fontSize: 32,
    fontWeight: 'bold',
    color: colors.white,
  },
  amountSection: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 12,
  },
  amountContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.white,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  amountContainerFocused: {
    borderColor: colors.primary,
  },
  currencySymbol: {
    fontSize: 20,
    fontWeight: '600',
    color: colors.text,
    marginRight: 8,
  },
  amountInput: {
    flex: 1,
    fontSize: 20,
    fontWeight: '600',
    color: colors.text,
  },
  descriptionSection: {
    marginBottom: 24,
  },
  descriptionContainer: {
    backgroundColor: colors.white,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  descriptionContainerFocused: {
    borderColor: colors.primary,
  },
  descriptionInput: {
    fontSize: 16,
    color: colors.text,
  },
  methodsSection: {
    marginBottom: 24,
  },
  methodCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.white,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  selectedMethodCard: {
    borderColor: colors.primary,
  },
  methodIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.card,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  methodInfo: {
    flex: 1,
  },
  methodName: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 4,
  },
  methodDescription: {
    fontSize: 14,
    color: colors.secondaryText,
  },
  contactsSection: {
    marginBottom: 24,
  },
  contactCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.white,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  selectedContactCard: {
    borderColor: colors.primary,
  },
  contactAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  contactAvatarText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.white,
  },
  contactInfo: {
    flex: 1,
  },
  contactName: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 4,
  },
  contactPhone: {
    fontSize: 14,
    color: colors.secondaryText,
    marginBottom: 4,
  },
  contactStatus: {
    fontSize: 12,
    fontWeight: '500',
  },
  registeredStatus: {
    color: colors.primary,
  },
  unregisteredStatus: {
    color: colors.secondaryText,
  },
  summarySection: {
    marginBottom: 24,
  },
  summaryCard: {
    backgroundColor: colors.white,
    borderRadius: 12,
    padding: 16,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  summaryLabel: {
    fontSize: 14,
    color: colors.secondaryText,
  },
  summaryValue: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.text,
  },
  buttonContainer: {
    paddingHorizontal: 16,
    paddingTop: 16,
    backgroundColor: colors.background,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  continueButton: {
    backgroundColor: colors.primary,
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
  },
  disabledButton: {
    opacity: 0.5,
  },
  continueButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.white,
  },
  successContentWrapper: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  successContainer: {
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  successIcon: {
    marginBottom: 24,
  },
  successTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 16,
    textAlign: 'center',
  },
  successMessage: {
    fontSize: 16,
    color: colors.secondaryText,
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 32,
  },
  doneButton: {
    backgroundColor: colors.primary,
    paddingHorizontal: 32,
    paddingVertical: 16,
    borderRadius: 12,
  },
  doneButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.white,
  },
});

export default SendMoneyScreen;
