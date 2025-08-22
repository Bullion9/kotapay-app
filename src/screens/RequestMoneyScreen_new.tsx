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
  Share,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  ChevronLeft,
  Users,
  QrCode,
  MessageSquare,
  CheckCircle,
  Copy,
  ShareIcon,
} from 'lucide-react-native';
import { colors } from '../theme';

interface Contact {
  id: string;
  name: string;
  phone: string;
  isRegistered: boolean;
}

interface RequestMethod {
  id: string;
  name: string;
  description: string;
  icon: any;
}

const RequestMoneyScreen: React.FC = () => {
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();
  
  // State
  const [amount, setAmount] = useState('');
  const [selectedContact, setSelectedContact] = useState<Contact | null>(null);
  const [selectedMethod, setSelectedMethod] = useState<RequestMethod | null>(null);
  const [note, setNote] = useState('');
  const [loading, setLoading] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [amountFocused, setAmountFocused] = useState(false);
  const [noteFocused, setNoteFocused] = useState(false);
  const [requestLink, setRequestLink] = useState('');

  // Mock recent contacts
  const recentContacts: Contact[] = [
    { id: '1', name: 'John Doe', phone: '+234801234567', isRegistered: true },
    { id: '2', name: 'Jane Smith', phone: '+234802345678', isRegistered: true },
    { id: '3', name: 'Mike Johnson', phone: '+234803456789', isRegistered: false },
  ];

  // Request methods
  const requestMethods: RequestMethod[] = [
    {
      id: 'contact',
      name: 'From Contact',
      description: 'Request from someone in your contacts',
      icon: Users,
    },
    {
      id: 'qr_code',
      name: 'Generate QR Code',
      description: 'Create QR code for others to scan',
      icon: QrCode,
    },
    {
      id: 'link',
      name: 'Share Link',
      description: 'Send request via message or email',
      icon: MessageSquare,
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
      Alert.alert('Error', 'Minimum request amount is ₦50');
      return false;
    }
    return true;
  };

  // Handle method selection
  const handleMethodSelect = (method: RequestMethod) => {
    setSelectedMethod(method);
  };

  // Handle contact selection
  const handleContactSelect = (contact: Contact) => {
    setSelectedContact(contact);
  };

  // Generate request link
  const generateRequestLink = () => {
    const baseUrl = 'https://kotapay.app/request';
    const params = new URLSearchParams({
      amount: amount,
      note: note || '',
      from: 'user123', // Mock user ID
    });
    return `${baseUrl}?${params.toString()}`;
  };

  // Handle continue button press
  const handleContinue = () => {
    if (!validateAmount()) return;
    
    if (!selectedMethod) {
      Alert.alert('Error', 'Please select a request method');
      return;
    }
    
    if (selectedMethod.id === 'contact' && !selectedContact) {
      Alert.alert('Error', 'Please select a contact');
      return;
    }
    
    setLoading(true);
    
    // Simulate processing
    setTimeout(() => {
      const link = generateRequestLink();
      setRequestLink(link);
      setLoading(false);
      setShowSuccess(true);
      
      Alert.alert(
        'Success',
        `Money request created successfully${selectedContact ? ` for ${selectedContact.name}` : ''}`
      );
    }, 1500);
  };

  // Handle share request
  const handleShare = async () => {
    try {
      await Share.share({
        message: `Hi! I'm requesting ₦${amount}${note ? ` for ${note}` : ''}. Please send via KotaPay: ${requestLink}`,
        title: 'Money Request',
      });
    } catch {
      Alert.alert('Error', 'Failed to share request');
    }
  };

  // Handle copy link
  const handleCopyLink = () => {
    // Note: In a real app, you'd use Clipboard from react-native-clipboard
    Alert.alert('Copied!', 'Request link copied to clipboard');
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
      <Text style={styles.successTitle}>Request Created!</Text>
      <Text style={styles.successMessage}>
        Your request for ₦{amount} has been created successfully.
        {note && ` Note: ${note}`}
      </Text>
      
      {/* Request Actions */}
      <View style={styles.requestActions}>
        <TouchableOpacity style={styles.actionButton} onPress={handleShare}>
          <ShareIcon size={20} color={colors.primary} />
          <Text style={styles.actionButtonText}>Share Request</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.actionButton} onPress={handleCopyLink}>
          <Copy size={20} color={colors.primary} />
          <Text style={styles.actionButtonText}>Copy Link</Text>
        </TouchableOpacity>
      </View>
      
      <TouchableOpacity
        style={styles.doneButton}
        onPress={() => {
          setShowSuccess(false);
          setAmount('');
          setSelectedContact(null);
          setSelectedMethod(null);
          setNote('');
          setRequestLink('');
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
          <Text style={styles.headerTitle}>Request Money</Text>
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
        <Text style={styles.headerTitle}>Request Money</Text>
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

          {/* Note Input Section */}
          <View style={styles.noteSection}>
            <Text style={styles.sectionTitle}>Note (Optional)</Text>
            
            <View style={[
              styles.noteContainer,
              noteFocused && styles.noteContainerFocused
            ]}>
              <TextInput
                style={styles.noteInput}
                placeholder="What's this request for?"
                value={note}
                onChangeText={setNote}
                onFocus={() => setNoteFocused(true)}
                onBlur={() => setNoteFocused(false)}
                placeholderTextColor="#ccc"
                maxLength={100}
                multiline
              />
            </View>
          </View>

          {/* Request Methods */}
          <View style={styles.methodsSection}>
            <Text style={styles.sectionTitle}>Select Request Method</Text>
            {requestMethods.map((method) => (
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

          {/* Request Summary */}
          {amount && selectedMethod && (
            <View style={styles.summarySection}>
              <Text style={styles.sectionTitle}>Request Summary</Text>
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
                    <Text style={styles.summaryLabel}>From</Text>
                    <Text style={styles.summaryValue}>{selectedContact.name}</Text>
                  </View>
                )}
                {note && (
                  <View style={styles.summaryRow}>
                    <Text style={styles.summaryLabel}>Note</Text>
                    <Text style={styles.summaryValue}>{note}</Text>
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
                Create Request
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
  amountSection: {
    marginVertical: 24,
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
  noteSection: {
    marginBottom: 24,
  },
  noteContainer: {
    backgroundColor: colors.white,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderWidth: 2,
    borderColor: 'transparent',
    minHeight: 80,
  },
  noteContainerFocused: {
    borderColor: colors.primary,
  },
  noteInput: {
    fontSize: 16,
    color: colors.text,
    textAlignVertical: 'top',
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
  requestActions: {
    flexDirection: 'row',
    marginBottom: 32,
    gap: 16,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.card,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 12,
    gap: 8,
  },
  actionButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.primary,
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

export default RequestMoneyScreen;
