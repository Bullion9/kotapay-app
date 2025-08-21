import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Modal,
  Animated,
  Alert,
  Keyboard,
  Platform,
  ScrollView,
  SafeAreaView,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import {
  ChevronLeft,
  X,
  Scan,
} from 'lucide-react-native';
import { RootStackParamList } from '../types';
import { spacing, borderRadius, shadows } from '../theme';
import PinEntryModal from '../components/PinEntryModal';

type SendScreenNavigationProp = StackNavigationProp<RootStackParamList>;

interface Contact {
  id: string;
  name: string;
  phone: string;
  avatar?: string;
}

interface SendScreenProps {
  visible: boolean;
  onClose: () => void;
}

const SendScreen: React.FC<SendScreenProps> = ({ visible, onClose }) => {
  const navigation = useNavigation<SendScreenNavigationProp>();
  
  // State management
  const [amount, setAmount] = useState('');
  const [selectedContact, setSelectedContact] = useState<Contact | null>(null);
  const [note, setNote] = useState('');
  const [showPinModal, setShowPinModal] = useState(false);
  const [showContactModal, setShowContactModal] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [errors, setErrors] = useState<{amount?: string; recipient?: string}>({});
  
  // Animation references
  const underlineAnimation = useRef(new Animated.Value(0)).current;
  const buttonScaleAnimation = useRef(new Animated.Value(1)).current;
  const recipientCardAnimation = useRef(new Animated.Value(0)).current;
  const successAnimation = useRef(new Animated.Value(0)).current;
  
  // Mock contacts data
  const mockContacts: Contact[] = [
    { id: '1', name: 'John Doe', phone: '+234 801 234 5678' },
    { id: '2', name: 'Jane Smith', phone: '+234 802 345 6789' },
    { id: '3', name: 'Mike Johnson', phone: '+234 803 456 7890' },
    { id: '4', name: 'Sarah Wilson', phone: '+234 804 567 8901' },
  ];
  
  // Calculate fee (example: ₦25 for amounts over ₦1000)
  const calculateFee = (amount: string): number => {
    const numAmount = parseFloat(amount || '0');
    return numAmount > 1000 ? 25 : 0;
  };
  
  // Validation
  const validateAmount = (value: string): string | undefined => {
    const numValue = parseFloat(value);
    if (!value || numValue <= 0) return 'Enter a valid amount';
    if (numValue > 100000) return 'Insufficient balance';
    return undefined;
  };
  
  const validateRecipient = (): string | undefined => {
    if (!selectedContact) return 'Choose a recipient';
    return undefined;
  };
  
  // Form validation
  const isFormValid = (): boolean => {
    const amountError = validateAmount(amount);
    const recipientError = validateRecipient();
    
    setErrors({
      amount: amountError,
      recipient: recipientError,
    });
    
    return !amountError && !recipientError;
  };
  
  // Animations
  const animateUnderline = (focused: boolean) => {
    Animated.timing(underlineAnimation, {
      toValue: focused ? 1 : 0,
      duration: 200,
      useNativeDriver: false,
    }).start();
  };
  
  const animateButton = useCallback((enabled: boolean) => {
    Animated.spring(buttonScaleAnimation, {
      toValue: enabled ? 1.02 : 1,
      useNativeDriver: true,
      tension: 300,
      friction: 10,
    }).start();
  }, [buttonScaleAnimation]);
  
  const animateRecipientCard = useCallback(() => {
    Animated.timing(recipientCardAnimation, {
      toValue: 1,
      duration: 300,
      useNativeDriver: true,
    }).start();
  }, [recipientCardAnimation]);
  
  const showSuccessAnimation = () => {
    setShowSuccess(true);
    Animated.sequence([
      Animated.timing(successAnimation, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.delay(1000),
      Animated.timing(successAnimation, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start(() => {
      setShowSuccess(false);
      onClose();
    });
  };
  
  // Handlers
  const handleAmountChange = (value: string) => {
    // Only allow numbers and decimal point
    const numericValue = value.replace(/[^0-9.]/g, '');
    setAmount(numericValue);
    
    // Clear amount error when user starts typing
    if (errors.amount) {
      setErrors(prev => ({ ...prev, amount: undefined }));
    }
  };
  
  const handleContactSelect = (contact: Contact) => {
    setSelectedContact(contact);
    setShowContactModal(false);
    animateRecipientCard();
    
    // Clear recipient error
    if (errors.recipient) {
      setErrors(prev => ({ ...prev, recipient: undefined }));
    }
  };
  
  const handleContinue = () => {
    if (isFormValid()) {
      Keyboard.dismiss();
      setShowPinModal(true);
    }
  };
  
  const handlePinVerified = async (pin: string) => {
    setShowPinModal(false);
    
    try {
      // Mock transaction processing
      await new Promise<void>(resolve => setTimeout(resolve, 1000));
      
      // Show success animation
      showSuccessAnimation();
      
      // Reset form
      setAmount('');
      setSelectedContact(null);
      setNote('');
      setErrors({});
    } catch {
      Alert.alert('Transaction Failed', 'Please try again later.');
    }
  };
  
  const handleQRScan = () => {
    // Navigate to QR scanner
    onClose();
    navigation.navigate('QRScanner');
  };
  
  const handleClose = () => {
    setAmount('');
    setSelectedContact(null);
    setNote('');
    setErrors({});
    onClose();
  };
  
  // Effects
  useEffect(() => {
    const formValid = amount && selectedContact && !errors.amount && !errors.recipient;
    animateButton(!!formValid);
  }, [amount, selectedContact, errors, animateButton]);
  
  useEffect(() => {
    if (selectedContact) {
      animateRecipientCard();
    }
  }, [selectedContact, animateRecipientCard]);
  
  // Get initials for avatar
  const getInitials = (name: string): string => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };
  
  // Render Contact Modal
  const renderContactModal = () => (
    <Modal
      visible={showContactModal}
      animationType={Platform.OS === 'ios' ? 'slide' : 'fade'}
      presentationStyle="pageSheet"
      onRequestClose={() => setShowContactModal(false)}
    >
      <SafeAreaView style={styles.contactModalContainer}>
        <View style={styles.contactModalHeader}>
          <TouchableOpacity onPress={() => setShowContactModal(false)}>
            <Text style={styles.contactModalCancel}>Cancel</Text>
          </TouchableOpacity>
          <Text style={styles.contactModalTitle}>Choose Recipient</Text>
          <View style={styles.contactModalSpacer} />
        </View>
        
        <ScrollView style={styles.contactList}>
          {mockContacts.map((contact) => (
            <TouchableOpacity
              key={contact.id}
              style={styles.contactItem}
              onPress={() => handleContactSelect(contact)}
            >
              <View style={styles.contactAvatar}>
                <Text style={styles.contactAvatarText}>{getInitials(contact.name)}</Text>
              </View>
              <View style={styles.contactInfo}>
                <Text style={styles.contactName}>{contact.name}</Text>
                <Text style={styles.contactPhone}>{contact.phone}</Text>
              </View>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </SafeAreaView>
    </Modal>
  );
  
  return (
    <Modal
      visible={visible}
      animationType={Platform.OS === 'ios' ? 'slide' : 'fade'}
      presentationStyle="fullScreen"
      onRequestClose={handleClose}
    >
      <SafeAreaView style={styles.container}>
        {/* Header Bar */}
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={handleClose}>
            <ChevronLeft size={24} color="#000" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Send Money</Text>
          <TouchableOpacity style={styles.closeButton} onPress={handleClose}>
            <X size={24} color="#000" />
          </TouchableOpacity>
        </View>
        
        <ScrollView style={styles.content} keyboardShouldPersistTaps="handled">
          {/* Amount Panel */}
          <View style={styles.amountPanel}>
            <View style={styles.amountInputContainer}>
              <Text style={styles.currencySymbol}>₦</Text>
              <TextInput
                style={styles.amountInput}
                value={amount}
                onChangeText={handleAmountChange}
                placeholder="0.00"
                keyboardType="numeric"
                autoFocus
                onFocus={() => animateUnderline(true)}
                onBlur={() => animateUnderline(false)}
              />
            </View>
            <Animated.View
              style={[
                styles.amountUnderline,
                {
                  transform: [{
                    scaleX: underlineAnimation.interpolate({
                      inputRange: [0, 1],
                      outputRange: [0, 1],
                    }),
                  }],
                },
              ]}
            />
            {errors.amount && (
              <Text style={styles.errorText}>{errors.amount}</Text>
            )}
          </View>
          
          {/* Recipient Card */}
          <Animated.View
            style={[
              styles.recipientCard,
              {
                opacity: selectedContact ? recipientCardAnimation : 1,
                transform: [{
                  translateY: selectedContact ? recipientCardAnimation.interpolate({
                    inputRange: [0, 1],
                    outputRange: [10, 0],
                  }) : 0,
                }],
              },
            ]}
          >
            <TouchableOpacity
              style={styles.recipientSelector}
              onPress={() => setShowContactModal(true)}
            >
              {selectedContact ? (
                <View style={styles.selectedRecipient}>
                  <View style={styles.recipientAvatar}>
                    <Text style={styles.recipientAvatarText}>
                      {getInitials(selectedContact.name)}
                    </Text>
                  </View>
                  <View style={styles.recipientInfo}>
                    <Text style={styles.recipientName}>{selectedContact.name}</Text>
                    <Text style={styles.recipientPhone}>{selectedContact.phone}</Text>
                  </View>
                </View>
              ) : (
                <Text style={styles.recipientPlaceholder}>Choose recipient</Text>
              )}
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.qrButton} onPress={handleQRScan}>
              <Scan size={20} color="#06402B" />
            </TouchableOpacity>
            
            {errors.recipient && (
              <Text style={styles.errorText}>{errors.recipient}</Text>
            )}
          </Animated.View>
          
          {/* Note Field */}
          <View style={styles.noteContainer}>
            <TextInput
              style={styles.noteInput}
              value={note}
              onChangeText={setNote}
              placeholder="What's this for?"
              autoCapitalize="sentences"
              maxLength={50}
            />
          </View>
          
          {/* Summary Strip */}
          {calculateFee(amount) > 0 && (
            <View style={styles.summaryStrip}>
              <Text style={styles.feeText}>Fee: ₦{calculateFee(amount)}</Text>
            </View>
          )}
        </ScrollView>
        
        {/* Primary Button */}
        <View style={styles.buttonContainer}>
          <Animated.View style={{ transform: [{ scale: buttonScaleAnimation }] }}>
            <TouchableOpacity
              style={[
                styles.continueButton,
                (!amount || !selectedContact) && styles.continueButtonDisabled,
              ]}
              onPress={handleContinue}
              disabled={!amount || !selectedContact}
            >
              <Text style={styles.continueButtonText}>Continue</Text>
            </TouchableOpacity>
          </Animated.View>
        </View>
        
        {/* Contact Modal */}
        {renderContactModal()}
        
        {/* PIN Entry Modal */}
        <PinEntryModal
          visible={showPinModal}
          onClose={() => setShowPinModal(false)}
          onPinEntered={handlePinVerified}
          title="Enter PIN to Send Money"
          subtitle={`Send ₦${parseFloat(amount || '0').toLocaleString()} to ${selectedContact?.name}`}
          allowBiometric={true}
        />
        
        {/* Success Overlay */}
        {showSuccess && (
          <Animated.View
            style={[
              styles.successOverlay,
              {
                opacity: successAnimation,
                transform: [{
                  scale: successAnimation.interpolate({
                    inputRange: [0, 1],
                    outputRange: [0.8, 1],
                  }),
                }],
              },
            ]}
          >
            <View style={styles.successContainer}>
              <View style={styles.successIcon}>
                <Text style={styles.successCheckmark}>✓</Text>
              </View>
              <Text style={styles.successText}>Money Sent!</Text>
            </View>
          </Animated.View>
        )}
      </SafeAreaView>
    </Modal>
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
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    backgroundColor: '#FFF0F5',
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
  closeButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    flex: 1,
    paddingHorizontal: spacing.lg,
  },
  amountPanel: {
    marginBottom: spacing.xl,
  },
  amountInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.lg,
  },
  currencySymbol: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#000',
    marginRight: spacing.sm,
  },
  amountInput: {
    flex: 1,
    fontSize: 32,
    fontWeight: 'bold',
    color: '#000',
  },
  amountUnderline: {
    height: 2,
    backgroundColor: '#06402B',
    marginTop: spacing.xs,
  },
  errorText: {
    fontSize: 12,
    color: '#EA3B52',
    marginTop: spacing.xs,
  },
  recipientCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: borderRadius.medium,
    padding: spacing.lg,
    marginBottom: spacing.lg,
    ...shadows.small,
    elevation: 2,
  },
  recipientSelector: {
    marginBottom: spacing.sm,
  },
  selectedRecipient: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  recipientAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#06402B',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  recipientAvatarText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  recipientInfo: {
    flex: 1,
  },
  recipientName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000',
    marginBottom: 2,
  },
  recipientPhone: {
    fontSize: 14,
    color: '#666',
  },
  recipientPlaceholder: {
    fontSize: 14,
    color: '#999',
    paddingVertical: spacing.md,
  },
  qrButton: {
    position: 'absolute',
    right: spacing.lg,
    top: spacing.lg,
    width: 48,
    height: 48,
    alignItems: 'center',
    justifyContent: 'center',
  },
  noteContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: borderRadius.medium,
    marginBottom: spacing.lg,
    ...shadows.small,
    elevation: 2,
  },
  noteInput: {
    padding: spacing.lg,
    fontSize: 14,
    color: '#000',
  },
  summaryStrip: {
    paddingVertical: spacing.sm,
    alignItems: 'center',
  },
  feeText: {
    fontSize: 12,
    color: '#666',
  },
  buttonContainer: {
    padding: spacing.lg,
    backgroundColor: '#FFF0F5',
  },
  continueButton: {
    backgroundColor: '#06402B',
    borderRadius: 12,
    paddingVertical: spacing.lg,
    alignItems: 'center',
    justifyContent: 'center',
    ...shadows.small,
  },
  continueButtonDisabled: {
    opacity: 0.5,
  },
  continueButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  // Contact Modal Styles
  contactModalContainer: {
    flex: 1,
    backgroundColor: '#FFF0F5',
  },
  contactModalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5EA',
  },
  contactModalCancel: {
    fontSize: 16,
    color: '#06402B',
  },
  contactModalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000',
  },
  contactModalSpacer: {
    width: 60,
  },
  contactList: {
    flex: 1,
    padding: spacing.lg,
  },
  contactItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: borderRadius.medium,
    padding: spacing.lg,
    marginBottom: spacing.sm,
    ...shadows.small,
    elevation: 2,
  },
  contactAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#06402B',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  contactAvatarText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  contactInfo: {
    flex: 1,
  },
  contactName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000',
    marginBottom: 2,
  },
  contactPhone: {
    fontSize: 14,
    color: '#666',
  },
  // Success Overlay Styles
  successOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  successContainer: {
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: borderRadius.large,
    padding: spacing.xl,
    marginHorizontal: spacing.xl,
  },
  successIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#A8E4A0',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.lg,
  },
  successCheckmark: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  successText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#000',
  },
});

export default SendScreen;
