import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  TextInput,
  ScrollView,
  Alert,
  Share,
  Animated,
} from 'react-native';
import {
  Users,
  MessageSquare,
  QrCode,
  Send,
  Check,
  Copy,
  ShareIcon,
  ChevronRight,
  UserPlus,
  ChevronLeft,
} from 'lucide-react-native';
import { colors, spacing, typography, borderRadius, shadows, iconSizes } from '../theme';
import { notificationService } from '../services/notifications';

interface Contact {
  id: string;
  name: string;
  phone: string;
  email?: string;
  avatar?: string;
  isRegistered: boolean;
}

interface RequestMoneyScreenProps {
  navigation: any;
  route: any;
}

type Step = 'amount' | 'contact' | 'note' | 'generate' | 'sent';

const RequestMoneyScreen: React.FC<RequestMoneyScreenProps> = ({ navigation, route }) => {
  const [currentStep, setCurrentStep] = useState<Step>('amount');
  const [amount, setAmount] = useState('');
  const [selectedContact, setSelectedContact] = useState<Contact | null>(null);
  const [note, setNote] = useState('');
  const [requestMethod, setRequestMethod] = useState<'qr' | 'direct' | null>(null);
  const [requestId, setRequestId] = useState<string>('');
  const [showManualEntry, setShowManualEntry] = useState(false);
  const [manualName, setManualName] = useState('');
  const [manualPhone, setManualPhone] = useState('');
  const [manualEmail, setManualEmail] = useState('');

  const animationValue = useRef(new Animated.Value(0)).current;

  // Handle QR scan results
  useEffect(() => {
    if (route.params?.scannedData) {
      const scannedData = route.params.scannedData;
      
      // Parse QR data and set contact
      try {
        const qrData = JSON.parse(scannedData);
        
        if (qrData.userId) {
          // Create a contact from scanned user data
          const scannedContact: Contact = {
            id: qrData.userId,
            name: qrData.name || 'Unknown User',
            phone: qrData.phone || 'Unknown',
            email: qrData.email,
            isRegistered: true,
          };
          setSelectedContact(scannedContact);
          
          // Move to next step if we got user data
          if (currentStep === 'contact') {
            setCurrentStep('note');
          }
        }
        
      } catch (error) {
        // If not JSON, treat as plain text (maybe a phone number)
        console.log('QR scan result:', scannedData);
        console.error('Error parsing QR data:', error);
        Alert.alert('QR Code Scanned', `Scanned: ${scannedData}`);
      }
      
      // Clear the scanned data from route params
      navigation.setParams({ scannedData: undefined });
    }
  }, [route.params?.scannedData, currentStep, navigation]);

  // Mock contacts data
  const contacts: Contact[] = [
    {
      id: '1',
      name: 'John Doe',
      phone: '+1234567890',
      email: 'john@example.com',
      isRegistered: true,
    },
    {
      id: '2',
      name: 'Jane Smith',
      phone: '+1234567891',
      email: 'jane@example.com',
      isRegistered: true,
    },
    {
      id: '3',
      name: 'Bob Wilson',
      phone: '+1234567892',
      isRegistered: false,
    },
  ];

  const handleQRScan = () => {
    navigation.navigate('QRScanner');
  };

  const handleManualEntry = () => {
    setShowManualEntry(true);
  };

  const handleManualContactAdd = () => {
    if (!manualName.trim() || !manualPhone.trim()) {
      Alert.alert('Error', 'Please enter at least name and phone number');
      return;
    }

    const newContact: Contact = {
      id: Date.now().toString(),
      name: manualName.trim(),
      phone: manualPhone.trim(),
      email: manualEmail.trim() || undefined,
      isRegistered: false,
    };

    setSelectedContact(newContact);
    setShowManualEntry(false);
    // Clear manual entry fields
    setManualName('');
    setManualPhone('');
    setManualEmail('');
  };

  const handleCancelManualEntry = () => {
    setShowManualEntry(false);
    setManualName('');
    setManualPhone('');
    setManualEmail('');
  };

  const stepTitles = {
    amount: 'Request Amount',
    contact: 'Select Contact',
    note: 'Add Note',
    generate: 'Send Request',
    sent: 'Request Sent',
  };

  const handleNext = () => {
    switch (currentStep) {
      case 'amount':
        if (!amount || parseFloat(amount) <= 0) {
          Alert.alert('Error', 'Please enter a valid amount');
          return;
        }
        setCurrentStep('contact');
        break;
      case 'contact':
        if (!selectedContact) {
          Alert.alert('Error', 'Please select a contact');
          return;
        }
        setCurrentStep('note');
        break;
      case 'note':
        setCurrentStep('generate');
        break;
      case 'generate':
        if (requestMethod === 'direct') {
          sendDirectRequest();
        } else if (requestMethod === 'qr') {
          generateQRRequest();
        }
        break;
    }
  };

  const handleBack = () => {
    switch (currentStep) {
      case 'amount':
        navigation.goBack();
        break;
      case 'contact':
        setCurrentStep('amount');
        break;
      case 'note':
        setCurrentStep('contact');
        break;
      case 'generate':
        setCurrentStep('note');
        break;
      case 'sent':
        navigation.goBack();
        break;
    }
  };

  const sendDirectRequest = async () => {
    // Generate unique request ID
    const newRequestId = `REQ_${Date.now()}`;
    setRequestId(newRequestId);
    setCurrentStep('sent');
    
    // Animate success
    Animated.sequence([
      Animated.timing(animationValue, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }),
      Animated.timing(animationValue, {
        toValue: 0,
        duration: 500,
        useNativeDriver: true,
      }),
    ]).start();

    // Send push notification to recipient
    sendPushNotification(newRequestId);
  };

  const generateQRRequest = async () => {
    // Generate unique request ID for QR
    const newRequestId = `QR_${Date.now()}`;
    setRequestId(newRequestId);
    setCurrentStep('sent');
    
    // Animate success
    Animated.sequence([
      Animated.timing(animationValue, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }),
      Animated.timing(animationValue, {
        toValue: 0,
        duration: 500,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const sendPushNotification = async (reqId: string) => {
    try {
      if (selectedContact) {
        await notificationService.sendRequestReceivedNotification({
          transactionId: reqId,
          amount: parseFloat(amount),
          currency: '₦',
          senderName: 'You',
          recipientName: selectedContact.name,
          message: 'Payment request',
        });
      }
    } catch (error) {
      console.error('Failed to send notification:', error);
    }
  };

  const copyRequestLink = () => {
    const requestLink = `kotapay://request/${requestId}`;
    // In a real app, you'd copy to clipboard
    console.log('Copying link:', requestLink);
    Alert.alert('Copied!', 'Request link copied to clipboard');
  };

  const shareRequest = async () => {
    try {
      const requestLink = `kotapay://request/${requestId}`;
      const message = `${selectedContact?.name}, I'm requesting ₦${amount}${note ? ` for ${note}` : ''}. Pay me using this link: ${requestLink}`;
      
      await Share.share({
        message,
        title: 'KotaPay Money Request',
      });
    } catch (error) {
      console.error('Error sharing request:', error);
    }
  };

  const renderStepIndicator = () => {
    const steps = ['amount', 'contact', 'note', 'generate', 'sent'];
    const currentIndex = steps.indexOf(currentStep);

    return (
      <View style={styles.stepIndicator}>
        {steps.map((step, index) => (
          <View key={step} style={styles.stepContainer}>
            <View
              style={[
                styles.stepCircle,
                index <= currentIndex && styles.stepCircleActive,
              ]}
            >
              <Text
                style={[
                  styles.stepNumber,
                  index <= currentIndex && styles.stepNumberActive,
                ]}
              >
                {index + 1}
              </Text>
            </View>
            {index < steps.length - 1 && (
              <View
                style={[
                  styles.stepLine,
                  index < currentIndex && styles.stepLineActive,
                ]}
              />
            )}
          </View>
        ))}
      </View>
    );
  };

  const renderAmountStep = () => (
    <View style={styles.stepContent}>
      <View style={styles.amountContainer}>
        <View style={styles.currencyContainer}>
          <Text style={styles.nairaSign}>₦</Text>
          <TextInput
            style={styles.amountInput}
            value={amount}
            onChangeText={setAmount}
            placeholder="0.00"
            placeholderTextColor={colors.placeholder}
            keyboardType="numeric"
            autoFocus
          />
        </View>
      </View>
      
      <View style={styles.descriptionContainer}>
        <Text style={styles.inputLabel}>Amount</Text>
        <TextInput
          style={styles.descriptionInput}
          value={note}
          onChangeText={setNote}
          placeholder="What's this request for?"
          placeholderTextColor={colors.placeholder}
          multiline
        />
      </View>

      <View style={styles.infoCard}>
        <Text style={styles.infoTitle}>Request Money</Text>
        <Text style={styles.infoText}>
          Send a payment request to someone. They&apos;ll receive a notification and can pay you instantly.
        </Text>
      </View>

      <View style={styles.suggestionsContainer}>
        <Text style={styles.suggestionsLabel}>Quick Amount</Text>
        <View style={styles.suggestionsGrid}>
          {[100, 500, 1000, 5000, 10000, 20000].map((amount) => (
            <TouchableOpacity
              key={amount}
              style={styles.suggestionCard}
              onPress={() => {
                setAmount(amount.toString());
              }}
            >
              <Text style={styles.suggestionCardText}>₦{amount.toLocaleString()}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>
    </View>
  );

  const renderContactStep = () => (
    <View style={styles.stepContent}>
      {!showManualEntry ? (
        <>
          <View style={styles.contactOptions}>
            <TouchableOpacity
              style={styles.optionButton}
              onPress={handleQRScan}
            >
              <QrCode size={iconSizes.lg} color={colors.primary} />
              <Text style={styles.optionText}>Scan QR Code</Text>
              <ChevronRight size={iconSizes.sm} color={colors.secondaryText} />
            </TouchableOpacity>
            
            <TouchableOpacity
              style={styles.optionButton}
              onPress={handleManualEntry}
            >
              <UserPlus size={iconSizes.lg} color={colors.primary} />
              <Text style={styles.optionText}>Add New Contact</Text>
              <ChevronRight size={iconSizes.sm} color={colors.secondaryText} />
            </TouchableOpacity>
          </View>

          <Text style={styles.sectionTitle}>Select who to request money from</Text>
          <ScrollView style={styles.contactsList}>
            {contacts.map((contact) => (
              <TouchableOpacity
                key={contact.id}
                style={[
                  styles.contactItem,
                  selectedContact?.id === contact.id && styles.contactItemSelected,
                ]}
                onPress={() => setSelectedContact(contact)}
              >
                <View style={styles.contactAvatar}>
                  <Users size={iconSizes.md} color={colors.white} />
                </View>
                <View style={styles.contactInfo}>
                  <Text style={styles.contactName}>{contact.name}</Text>
                  <Text style={styles.contactPhone}>{contact.phone}</Text>
                </View>
                <View style={styles.contactStatus}>
                  {contact.isRegistered && (
                    <View style={styles.registeredBadge}>
                      <Check size={iconSizes.xs} color={colors.white} />
                    </View>
                  )}
                  <ChevronRight size={iconSizes.sm} color={colors.secondaryText} />
                </View>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </>
      ) : (
        <View style={styles.manualEntryContainer}>
          <Text style={styles.manualEntryTitle}>Add New Contact</Text>
          
          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>Full Name *</Text>
            <TextInput
              style={styles.input}
              value={manualName}
              onChangeText={setManualName}
              placeholder="Enter full name"
              placeholderTextColor={colors.placeholder}
            />
          </View>
          
          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>Phone Number *</Text>
            <TextInput
              style={styles.input}
              value={manualPhone}
              onChangeText={setManualPhone}
              placeholder="+1234567890"
              placeholderTextColor={colors.placeholder}
              keyboardType="phone-pad"
            />
          </View>
          
          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>Email (Optional)</Text>
            <TextInput
              style={styles.input}
              value={manualEmail}
              onChangeText={setManualEmail}
              placeholder="email@example.com"
              placeholderTextColor={colors.placeholder}
              keyboardType="email-address"
              autoCapitalize="none"
            />
          </View>
          
          <View style={styles.manualEntryButtons}>
            <TouchableOpacity
              style={styles.cancelButton}
              onPress={handleCancelManualEntry}
            >
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={styles.addButton}
              onPress={handleManualContactAdd}
            >
              <Text style={styles.addButtonText}>Add Contact</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
    </View>
  );

  const renderNoteStep = () => (
    <View style={styles.stepContent}>
      <View style={styles.noteContainer}>
        <MessageSquare size={iconSizes.lg} color={colors.primary} />
        <Text style={styles.noteTitle}>Add a note (optional)</Text>
        <Text style={styles.noteSubtitle}>
          Let {selectedContact?.name} know what this request is for
        </Text>
      </View>

      <TextInput
        style={styles.noteInput}
        value={note}
        onChangeText={setNote}
        placeholder="e.g., Dinner last night, Movie tickets, etc."
        placeholderTextColor={colors.placeholder}
        multiline
        maxLength={200}
      />

      <Text style={styles.characterCount}>{note.length}/200</Text>
    </View>
  );

  const renderGenerateStep = () => (
    <View style={styles.stepContent}>
      <View style={styles.summaryCard}>
        <Text style={styles.summaryTitle}>Request Summary</Text>
        
        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>Amount</Text>
          <Text style={styles.summaryValue}>₦{amount}</Text>
        </View>
        
        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>From</Text>
          <Text style={styles.summaryValue}>{selectedContact?.name}</Text>
        </View>
        
        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>Phone</Text>
          <Text style={styles.summaryValue}>{selectedContact?.phone}</Text>
        </View>
        
        {note && (
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Note</Text>
            <Text style={styles.summaryValue}>{note}</Text>
          </View>
        )}
      </View>

      <View style={styles.methodContainer}>
        <Text style={styles.methodTitle}>How would you like to send this request?</Text>
        
        <TouchableOpacity
          style={[
            styles.methodOption,
            requestMethod === 'direct' && styles.methodOptionSelected,
          ]}
          onPress={() => setRequestMethod('direct')}
        >
          <Send size={iconSizes.md} color={colors.primary} />
          <View style={styles.methodContent}>
            <Text style={styles.methodText}>Send Direct Request</Text>
            <Text style={styles.methodSubtext}>
              Send a notification directly to {selectedContact?.name}
            </Text>
          </View>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.methodOption,
            requestMethod === 'qr' && styles.methodOptionSelected,
          ]}
          onPress={() => setRequestMethod('qr')}
        >
          <QrCode size={iconSizes.md} color={colors.primary} />
          <View style={styles.methodContent}>
            <Text style={styles.methodText}>Generate QR Code</Text>
            <Text style={styles.methodSubtext}>
              Create a QR code to share with anyone
            </Text>
          </View>
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderSentStep = () => (
    <View style={styles.stepContent}>
      <Animated.View
        style={[
          styles.sentContainer,
          {
            opacity: animationValue.interpolate({
              inputRange: [0, 1],
              outputRange: [1, 0.5],
            }),
            transform: [
              {
                scale: animationValue.interpolate({
                  inputRange: [0, 1],
                  outputRange: [1, 1.1],
                }),
              },
            ],
          },
        ]}
      >
        <View style={styles.sentIcon}>
          <Check size={iconSizes.xxl} color={colors.white} />
        </View>
        <Text style={styles.sentTitle}>Request Sent!</Text>
        <Text style={styles.sentSubtitle}>
          {requestMethod === 'direct'
            ? `${selectedContact?.name} will receive a notification about your ₦${amount} request`
            : `Your QR code is ready to share for ₦${amount}`}
        </Text>

        {requestMethod === 'qr' && (
          <View style={styles.qrContainer}>
            <View style={styles.qrPlaceholder}>
              <QrCode size={iconSizes.xxl} color={colors.primary} />
              <Text style={styles.qrText}>QR Code</Text>
              <Text style={styles.qrId}>{requestId}</Text>
            </View>
          </View>
        )}

        <View style={styles.actionButtons}>
          {requestMethod === 'qr' && (
            <>
              <TouchableOpacity style={styles.actionButton} onPress={copyRequestLink}>
                <Copy size={iconSizes.sm} color={colors.primary} />
                <Text style={styles.actionButtonText}>Copy Link</Text>
              </TouchableOpacity>
              
              <TouchableOpacity style={styles.actionButton} onPress={shareRequest}>
                <ShareIcon size={iconSizes.sm} color={colors.primary} />
                <Text style={styles.actionButtonText}>Share</Text>
              </TouchableOpacity>
            </>
          )}
        </View>

        <TouchableOpacity
          style={styles.doneButton}
          onPress={() => navigation.navigate('MainTabs')}
        >
          <Text style={styles.doneButtonText}>Done</Text>
        </TouchableOpacity>
      </Animated.View>
    </View>
  );

  const renderStepContent = () => {
    switch (currentStep) {
      case 'amount':
        return renderAmountStep();
      case 'contact':
        return renderContactStep();
      case 'note':
        return renderNoteStep();
      case 'generate':
        return renderGenerateStep();
      case 'sent':
        return renderSentStep();
      default:
        return null;
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={handleBack}>
          <ChevronLeft size={iconSizes.md} color={colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{stepTitles[currentStep]}</Text>
        <View style={styles.headerSpacer} />
      </View>

      {renderStepIndicator()}
      
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {renderStepContent()}
      </ScrollView>

      {currentStep !== 'sent' && (
        <View style={styles.footer}>
          <TouchableOpacity
            style={[
              styles.nextButton,
              (!amount && currentStep === 'amount') ||
              (!selectedContact && currentStep === 'contact') ||
              (!requestMethod && currentStep === 'generate')
                ? styles.nextButtonDisabled
                : {},
            ]}
            onPress={handleNext}
            disabled={
              (!amount && currentStep === 'amount') ||
              (!selectedContact && currentStep === 'contact') ||
              (!requestMethod && currentStep === 'generate')
            }
          >
            <Text style={styles.nextButtonText}>
              {currentStep === 'generate' ? 'Send Request' : 'Continue'}
            </Text>
          </TouchableOpacity>
        </View>
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
    justifyContent: 'space-between',
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.lg,
    paddingTop: spacing.xl,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    backgroundColor: '#FFF0F5',
  },
  backButton: {
    padding: spacing.xs,
  },
  headerTitle: {
    ...typography.h3,
    color: colors.text,
    fontWeight: '600',
  },
  headerSpacer: {
    width: 40,
  },
  stepIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.xl,
    paddingHorizontal: spacing.xl,
  },
  stepContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  stepCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.disabled,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepCircleActive: {
    backgroundColor: colors.primary,
  },
  stepNumber: {
    ...typography.caption,
    color: colors.secondaryText,
    fontWeight: '600',
  },
  stepNumberActive: {
    color: colors.white,
  },
  stepLine: {
    width: 24,
    height: 2,
    backgroundColor: colors.disabled,
    marginHorizontal: spacing.xs,
  },
  stepLineActive: {
    backgroundColor: colors.primary,
  },
  content: {
    flex: 1,
  },
  stepContent: {
    padding: spacing.xl,
  },
  // Amount Step Styles
  amountContainer: {
    alignItems: 'center',
    marginBottom: spacing.xl,
  },
  currencyContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.white,
    borderRadius: borderRadius.medium,
    padding: spacing.lg,
    ...shadows.small,
    maxWidth: 280,
    alignSelf: 'center',
  },
  nairaSign: {
    ...typography.h2,
    color: colors.primary,
    fontWeight: 'bold',
  },
  amountInput: {
    ...typography.h2,
    color: colors.text,
    marginLeft: spacing.sm,
    minWidth: 150,
    textAlign: 'center',
  },
  descriptionContainer: {
    marginBottom: spacing.xl,
  },
  descriptionInput: {
    backgroundColor: colors.white,
    borderRadius: borderRadius.medium,
    padding: spacing.lg,
    ...typography.body,
    color: colors.text,
    minHeight: 80,
    textAlignVertical: 'top',
    ...shadows.small,
  },
  quickAmounts: {
    flexDirection: 'row',
    gap: spacing.sm,
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  quickAmountsContainer: {
    marginBottom: spacing.xl,
  },
  quickAmountsLabel: {
    ...typography.body,
    color: colors.text,
    fontWeight: '600',
    marginBottom: spacing.sm,
  },
  quickAmountButton: {
    backgroundColor: colors.white,
    borderRadius: borderRadius.medium,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.md,
    ...shadows.small,
    flex: 1,
    minWidth: 60,
    maxWidth: 80,
    alignItems: 'center',
  },
  quickAmountText: {
    ...typography.body,
    color: colors.primary,
    fontWeight: '600',
  },
  // Quick suggestions styles
  suggestionsContainer: {
    marginTop: spacing.xl,
    marginBottom: spacing.xl,
  },
  suggestionsLabel: {
    ...typography.body,
    color: colors.text,
    fontWeight: '600',
    marginBottom: spacing.sm,
  },
  suggestionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  suggestionCard: {
    backgroundColor: colors.white,
    borderRadius: borderRadius.medium,
    paddingVertical: spacing.lg,
    paddingHorizontal: spacing.md,
    ...shadows.small,
    alignItems: 'center',
    justifyContent: 'center',
    width: '48%',
    minHeight: 60,
  },
  suggestionCardText: {
    ...typography.body,
    color: colors.text,
    fontWeight: '600',
    textAlign: 'center',
  },
  infoCard: {
    backgroundColor: colors.accent,
    borderRadius: borderRadius.medium,
    padding: spacing.lg,
  },
  infoTitle: {
    ...typography.body,
    color: colors.primary,
    fontWeight: '600',
    marginBottom: spacing.sm,
  },
  infoText: {
    ...typography.caption,
    color: colors.primary,
    lineHeight: 20,
  },
  // Contact Step Styles
  sectionTitle: {
    ...typography.h3,
    color: colors.text,
    fontWeight: '600',
    marginBottom: spacing.lg,
  },
  contactsList: {
    maxHeight: 400,
  },
  contactItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.white,
    borderRadius: borderRadius.medium,
    padding: spacing.lg,
    marginBottom: spacing.sm,
    ...shadows.small,
  },
  contactItemSelected: {
    borderWidth: 2,
    borderColor: colors.primary,
  },
  contactAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.lg,
  },
  contactInfo: {
    flex: 1,
  },
  contactName: {
    ...typography.body,
    color: colors.text,
    fontWeight: '600',
    marginBottom: 2,
  },
  contactPhone: {
    ...typography.caption,
    color: colors.secondaryText,
  },
  contactStatus: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  registeredBadge: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: colors.success,
    alignItems: 'center',
    justifyContent: 'center',
  },
  // Contact Options Styles
  contactOptions: {
    marginBottom: spacing.xl,
  },
  optionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.white,
    borderRadius: borderRadius.medium,
    padding: spacing.lg,
    ...shadows.small,
  },
  optionText: {
    ...typography.body,
    color: colors.text,
    fontWeight: '600',
    flex: 1,
    marginLeft: spacing.lg,
  },
  // Manual Entry Styles
  manualEntryContainer: {
    backgroundColor: colors.white,
    borderRadius: borderRadius.large,
    padding: spacing.xl,
    ...shadows.medium,
  },
  manualEntryTitle: {
    ...typography.h3,
    color: colors.text,
    fontWeight: '600',
    marginBottom: spacing.xl,
    textAlign: 'center',
  },
  inputContainer: {
    marginBottom: spacing.lg,
  },
  inputLabel: {
    ...typography.body,
    color: colors.text,
    fontWeight: '600',
    marginBottom: spacing.sm,
  },
  input: {
    backgroundColor: colors.background,
    borderRadius: borderRadius.medium,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    ...typography.body,
    color: colors.text,
    borderWidth: 1,
    borderColor: colors.border,
  },
  manualEntryButtons: {
    flexDirection: 'row',
    gap: spacing.md,
    marginTop: spacing.lg,
  },
  cancelButton: {
    flex: 1,
    backgroundColor: colors.background,
    borderRadius: borderRadius.medium,
    paddingVertical: spacing.md,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
  },
  cancelButtonText: {
    ...typography.body,
    color: colors.secondaryText,
    fontWeight: '600',
  },
  addButton: {
    flex: 1,
    backgroundColor: colors.primary,
    borderRadius: borderRadius.medium,
    paddingVertical: spacing.md,
    alignItems: 'center',
  },
  addButtonText: {
    ...typography.body,
    color: colors.white,
    fontWeight: '600',
  },
  // Note Step Styles
  noteContainer: {
    alignItems: 'center',
    marginBottom: spacing.xl,
  },
  noteTitle: {
    ...typography.h3,
    color: colors.text,
    fontWeight: '600',
    marginTop: spacing.lg,
    marginBottom: spacing.sm,
  },
  noteSubtitle: {
    ...typography.body,
    color: colors.secondaryText,
    textAlign: 'center',
  },
  noteInput: {
    backgroundColor: colors.white,
    borderRadius: borderRadius.medium,
    padding: spacing.lg,
    ...typography.body,
    color: colors.text,
    minHeight: 100,
    textAlignVertical: 'top',
    ...shadows.small,
    marginBottom: spacing.sm,
  },
  characterCount: {
    ...typography.caption,
    color: colors.secondaryText,
    textAlign: 'right',
    marginBottom: spacing.xl,
  },
  suggestionContainer: {
    marginTop: spacing.lg,
  },
  suggestionTitle: {
    ...typography.body,
    color: colors.text,
    fontWeight: '600',
    marginBottom: spacing.md,
  },
  suggestionButtons: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  // Generate Step Styles
  summaryCard: {
    backgroundColor: colors.white,
    borderRadius: borderRadius.large,
    padding: spacing.xl,
    marginBottom: spacing.xl,
    ...shadows.medium,
  },
  summaryTitle: {
    ...typography.h3,
    color: colors.text,
    fontWeight: '600',
    marginBottom: spacing.lg,
    textAlign: 'center',
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  summaryLabel: {
    ...typography.body,
    color: colors.secondaryText,
  },
  summaryValue: {
    ...typography.body,
    color: colors.text,
    fontWeight: '600',
  },
  methodContainer: {
    marginBottom: spacing.xl,
  },
  methodTitle: {
    ...typography.body,
    color: colors.text,
    fontWeight: '600',
    marginBottom: spacing.lg,
  },
  methodOption: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.white,
    borderRadius: borderRadius.medium,
    padding: spacing.lg,
    marginBottom: spacing.md,
    ...shadows.small,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  methodOptionSelected: {
    borderColor: colors.primary,
  },
  methodContent: {
    flex: 1,
    marginLeft: spacing.lg,
  },
  methodText: {
    ...typography.body,
    color: colors.text,
    fontWeight: '600',
    marginBottom: 2,
  },
  methodSubtext: {
    ...typography.caption,
    color: colors.secondaryText,
  },
  // Sent Step Styles
  sentContainer: {
    alignItems: 'center',
    paddingVertical: spacing.xxxl,
  },
  sentIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: colors.success,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.xl,
  },
  sentTitle: {
    ...typography.h2,
    color: colors.text,
    fontWeight: 'bold',
    marginBottom: spacing.sm,
    textAlign: 'center',
  },
  sentSubtitle: {
    ...typography.body,
    color: colors.secondaryText,
    textAlign: 'center',
    marginBottom: spacing.xl,
    paddingHorizontal: spacing.lg,
  },
  qrContainer: {
    marginBottom: spacing.xl,
  },
  qrPlaceholder: {
    width: 200,
    height: 200,
    backgroundColor: colors.white,
    borderRadius: borderRadius.medium,
    alignItems: 'center',
    justifyContent: 'center',
    ...shadows.medium,
  },
  qrText: {
    ...typography.body,
    color: colors.text,
    fontWeight: '600',
    marginTop: spacing.sm,
  },
  qrId: {
    ...typography.caption,
    color: colors.secondaryText,
    marginTop: spacing.xs,
  },
  actionButtons: {
    flexDirection: 'row',
    gap: spacing.lg,
    marginBottom: spacing.xl,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.white,
    borderRadius: borderRadius.medium,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    ...shadows.small,
  },
  actionButtonText: {
    ...typography.body,
    color: colors.primary,
    fontWeight: '600',
    marginLeft: spacing.sm,
  },
  doneButton: {
    backgroundColor: colors.primary,
    borderRadius: borderRadius.medium,
    paddingVertical: spacing.lg,
    paddingHorizontal: spacing.xxl,
    ...shadows.small,
  },
  doneButtonText: {
    ...typography.body,
    color: colors.white,
    fontWeight: '600',
  },
  // Footer Styles
  footer: {
    padding: spacing.xl,
  },
  nextButton: {
    backgroundColor: colors.primary,
    borderRadius: borderRadius.medium,
    paddingVertical: spacing.lg,
    alignItems: 'center',
  },
  nextButtonDisabled: {
    backgroundColor: colors.disabled,
    opacity: 0.6,
  },
  nextButtonText: {
    ...typography.body,
    color: colors.white,
    fontWeight: '600',
  },
});

export default RequestMoneyScreen;
