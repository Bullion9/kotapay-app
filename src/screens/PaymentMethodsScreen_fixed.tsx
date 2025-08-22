import { StackNavigationProp } from '@react-navigation/stack';
import {
    ArrowLeft,
    Building2,
    CheckCircle,
    CreditCard,
    Eye,
    EyeOff,
    Lock,
    Plus,
    Trash2,
    X,
} from 'lucide-react-native';
import React, { useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    KeyboardAvoidingView,
    Modal,
    Platform,
    SafeAreaView,
    ScrollView,
    StatusBar,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';
import { useAuth } from '../contexts/AuthContext';
import { borderRadius, colors, shadows, spacing } from '../theme';
import { ProfileParamList } from '../types';

interface PaymentMethod {
  id: string;
  type: 'card' | 'bank';
  cardNumber?: string;
  expiryDate?: string;
  cardholderName?: string;
  accountNumber?: string;
  bankName?: string;
  accountName?: string;
  nickname: string;
  brand?: string;
}

type PaymentMethodsScreenProps = {
  navigation: StackNavigationProp<ProfileParamList, 'PaymentMethods'>;
};

const PaymentMethodsScreen: React.FC<PaymentMethodsScreenProps> = ({ navigation }) => {
  const { user } = useAuth();
  const [showCardNumbers, setShowCardNumbers] = useState(false);
  const [showAddCardModal, setShowAddCardModal] = useState(false);
  const [showAddBankModal, setShowAddBankModal] = useState(false);
  const [showAddMethodModal, setShowAddMethodModal] = useState(false);
  const [showBankListModal, setShowBankListModal] = useState(false);
  const [showPinModal, setShowPinModal] = useState(false);
  const [showLoading, setShowLoading] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [pin, setPin] = useState('');

  // List of popular Nigerian banks
  const nigerianBanks: string[] = [
    'Access Bank',
    'First Bank of Nigeria',
    'Guaranty Trust Bank (GTBank)',
    'United Bank for Africa (UBA)',
    'Zenith Bank',
    'Fidelity Bank',
    'Union Bank of Nigeria',
    'Stanbic IBTC Bank',
    'Sterling Bank',
    'Polaris Bank',
    'Wema Bank',
    'FCMB',
    'Heritage Bank',
    'Keystone Bank',
    'Unity Bank',
    'Jaiz Bank',
    'Suntrust Bank',
    'Providus Bank',
    'Parallex Bank',
    'Coronation Bank',
  ];

  // Form states for adding card
  const [cardForm, setCardForm] = useState({
    cardNumber: '',
    expiryDate: '',
    cvv: '',
    cardholderName: '',
    nickname: '',
  });
  
  // Form states for adding bank
  const [bankForm, setBankForm] = useState({
    accountNumber: '',
    bankName: '',
    accountName: '',
    nickname: '',
  });

  // Mock payment methods with full information
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([
    {
      id: '1',
      type: 'card',
      cardNumber: '4532123456781234',
      expiryDate: '12/25',
      cardholderName: user?.name || 'John Doe',
      nickname: 'Primary Card',
      brand: 'visa',
    },
    {
      id: '2',
      type: 'bank',
      accountNumber: '1234567890',
      bankName: 'GTBank',
      accountName: user?.name || 'John Doe',
      nickname: 'Salary Account',
    },
  ]);

  const handleAddCard = async () => {
    setShowPinModal(true);
  };

  const handleAddBank = async () => {
    setShowPinModal(true);
  };

  const handlePinVerification = async () => {
    if (pin.length !== 4) {
      Alert.alert('Error', 'Please enter a 4-digit PIN');
      return;
    }

    setShowPinModal(false);
    setShowLoading(true);

    // Simulate API call
    setTimeout(() => {
      setShowLoading(false);
      setShowConfirmation(true);

      // Add the payment method after confirmation
      const isCard = showAddCardModal;
      
      if (isCard) {
        const newCard = {
          id: Date.now().toString(),
          type: 'card' as const,
          cardNumber: cardForm.cardNumber,
          expiryDate: cardForm.expiryDate,
          cardholderName: cardForm.cardholderName,
          nickname: cardForm.nickname || 'My Card',
          brand: 'visa',
        };
        setPaymentMethods(prev => [...prev, newCard]);
        setCardForm({
          cardNumber: '',
          expiryDate: '',
          cvv: '',
          cardholderName: '',
          nickname: '',
        });
      } else {
        const newBank = {
          id: Date.now().toString(),
          type: 'bank' as const,
          accountNumber: bankForm.accountNumber,
          bankName: bankForm.bankName,
          accountName: bankForm.accountName,
          nickname: bankForm.nickname || 'My Account',
        };
        setPaymentMethods(prev => [...prev, newBank]);
        setBankForm({
          accountNumber: '',
          bankName: '',
          accountName: '',
          nickname: '',
        });
      }

      setPin('');

      // Hide confirmation after 2 seconds
      setTimeout(() => {
        setShowConfirmation(false);
        setShowAddCardModal(false);
        setShowAddBankModal(false);
        setShowAddMethodModal(false);
      }, 2000);
    }, 2000);
  };

  const formatCardNumber = (text: string) => {
    const cleaned = text.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    const matches = cleaned.match(/\d{4,16}/g);
    const match = matches && matches[0] || '';
    const parts = [];
    
    for (let i = 0, len = match.length; i < len; i += 4) {
      parts.push(match.substring(i, i + 4));
    }
    
    if (parts.length) {
      return parts.join(' ');
    } else {
      return text;
    }
  };

  const formatExpiryDate = (text: string) => {
    const cleaned = text.replace(/\D/g, '');
    const formatted = cleaned.replace(/(\d{2})(\d)/, '$1/$2');
    return formatted.substring(0, 5);
  };

  const getCardIcon = (brand: string) => {
    switch (brand?.toLowerCase()) {
      case 'visa':
        return <CreditCard size={20} color={colors.primary} />;
      case 'mastercard':
        return <CreditCard size={20} color={colors.seaGreen} />;
      default:
        return <CreditCard size={20} color={colors.secondaryText} />;
    }
  };

  const deletePaymentMethod = (id: string) => {
    Alert.alert(
      'Delete Payment Method',
      'Are you sure you want to delete this payment method?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            setPaymentMethods(prev => prev.filter(method => method.id !== id));
          },
        },
      ]
    );
  };

  const selectBank = (bankName: string) => {
    setBankForm(prev => ({ ...prev, bankName }));
    setShowBankListModal(false);
  };

  const renderPaymentMethod = (method: PaymentMethod) => (
    <View key={method.id} style={styles.paymentMethodCard}>
      <View style={styles.paymentMethodHeader}>
        <View style={styles.paymentMethodIcon}>
          {method.type === 'card' ? (
            getCardIcon(method.brand || 'default')
          ) : (
            <Building2 size={20} color={colors.primary} />
          )}
        </View>
        <View style={styles.paymentMethodInfo}>
          <Text style={styles.paymentMethodNickname}>{method.nickname}</Text>
          <Text style={styles.paymentMethodDetails}>
            {method.type === 'card' 
              ? `${showCardNumbers ? method.cardNumber : `****${method.cardNumber?.slice(-4)}`} • ${method.expiryDate}`
              : `${method.bankName} • ${showCardNumbers ? method.accountNumber : `****${method.accountNumber?.slice(-4)}`}`
            }
          </Text>
          {method.type === 'card' && (
            <Text style={styles.paymentMethodSubDetails}>
              {method.cardholderName}
            </Text>
          )}
          {method.type === 'bank' && (
            <Text style={styles.paymentMethodSubDetails}>
              {method.accountName}
            </Text>
          )}
        </View>
        <TouchableOpacity
          style={styles.deleteButton}
          onPress={() => deletePaymentMethod(method.id)}
        >
          <Trash2 size={16} color={colors.white} />
          <Text style={styles.deleteButtonText}>Delete</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderAddMethodModal = () => (
    <Modal
      visible={showAddMethodModal}
      transparent={true}
      animationType="slide"
      onRequestClose={() => setShowAddMethodModal(false)}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.halfScreenModal}>
          <View style={styles.modalHandle} />
          
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Add Payment Method</Text>
            <TouchableOpacity
              style={styles.modalCloseButton}
              onPress={() => setShowAddMethodModal(false)}
            >
              <X size={24} color={colors.text} />
            </TouchableOpacity>
          </View>

          <View style={styles.methodOptions}>
            <TouchableOpacity
              style={styles.methodOption}
              onPress={() => {
                setShowAddMethodModal(false);
                setShowAddCardModal(true);
              }}
            >
              <View style={styles.methodIcon}>
                <CreditCard size={24} color={colors.primary} />
              </View>
              <Text style={styles.methodText}>Add Card</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.methodOption}
              onPress={() => {
                setShowAddMethodModal(false);
                setShowAddBankModal(true);
              }}
            >
              <View style={styles.methodIcon}>
                <Building2 size={24} color={colors.primary} />
              </View>
              <Text style={styles.methodText}>Add Bank Account</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );

  const renderAddCardModal = () => (
    <Modal
      visible={showAddCardModal}
      transparent={true}
      animationType="slide"
      onRequestClose={() => setShowAddCardModal(false)}
    >
      <View style={styles.modalOverlay}>
        <KeyboardAvoidingView 
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'} 
          style={styles.keyboardView}
        >
          <View style={styles.halfScreenModal}>
            <View style={styles.modalHandle} />
            
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Add New Card</Text>
              <TouchableOpacity
                style={styles.modalCloseButton}
                onPress={() => setShowAddCardModal(false)}
              >
                <X size={24} color={colors.text} />
              </TouchableOpacity>
            </View>

            <ScrollView 
              style={styles.modalContent}
              keyboardShouldPersistTaps="handled"
            >
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Card Number</Text>
                <TextInput
                  style={styles.input}
                  value={cardForm.cardNumber}
                  onChangeText={(text) => setCardForm(prev => ({ ...prev, cardNumber: formatCardNumber(text) }))}
                  placeholder="1234 5678 9012 3456"
                  placeholderTextColor={colors.secondaryText}
                  keyboardType="numeric"
                  maxLength={19}
                  returnKeyType="next"
                />
              </View>

              <View style={styles.inputRow}>
                <View style={[styles.inputGroup, { flex: 1, marginRight: spacing.sm }]}>
                  <Text style={styles.inputLabel}>Expiry Date</Text>
                  <TextInput
                    style={styles.input}
                    value={cardForm.expiryDate}
                    onChangeText={(text) => setCardForm(prev => ({ ...prev, expiryDate: formatExpiryDate(text) }))}
                    placeholder="MM/YY"
                    placeholderTextColor={colors.secondaryText}
                    keyboardType="numeric"
                    maxLength={5}
                    returnKeyType="next"
                  />
                </View>
                <View style={[styles.inputGroup, { flex: 1 }]}>
                  <Text style={styles.inputLabel}>CVV</Text>
                  <TextInput
                    style={styles.input}
                    value={cardForm.cvv}
                    onChangeText={(text) => setCardForm(prev => ({ ...prev, cvv: text.replace(/\D/g, '') }))}
                    placeholder="123"
                    placeholderTextColor={colors.secondaryText}
                    keyboardType="numeric"
                    maxLength={4}
                    secureTextEntry
                    returnKeyType="next"
                  />
                </View>
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Cardholder Name</Text>
                <TextInput
                  style={styles.input}
                  value={cardForm.cardholderName}
                  onChangeText={(text) => setCardForm(prev => ({ ...prev, cardholderName: text }))}
                  placeholder={user?.name || "John Doe"}
                  placeholderTextColor={colors.secondaryText}
                  autoCapitalize="words"
                  returnKeyType="next"
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Nickname (Optional)</Text>
                <TextInput
                  style={styles.input}
                  value={cardForm.nickname}
                  onChangeText={(text) => setCardForm(prev => ({ ...prev, nickname: text }))}
                  placeholder="Primary Card"
                  placeholderTextColor={colors.secondaryText}
                  returnKeyType="done"
                />
              </View>
            </ScrollView>

            <View style={styles.modalFooter}>
              <TouchableOpacity
                style={[styles.button, styles.addButton]}
                onPress={handleAddCard}
                disabled={showLoading || !cardForm.cardNumber || !cardForm.expiryDate || !cardForm.cvv || !cardForm.cardholderName}
              >
                <Text style={styles.addButtonText}>
                  {showLoading ? 'Adding...' : 'Add Card'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
      </View>
    </Modal>
  );

  const renderAddBankModal = () => (
    <Modal
      visible={showAddBankModal}
      transparent={true}
      animationType="slide"
      onRequestClose={() => setShowAddBankModal(false)}
    >
      <View style={styles.modalOverlay}>
        <KeyboardAvoidingView 
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'} 
          style={styles.keyboardView}
        >
          <View style={styles.halfScreenModal}>
            <View style={styles.modalHandle} />
            
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Add Bank Account</Text>
              <TouchableOpacity
                style={styles.modalCloseButton}
                onPress={() => setShowAddBankModal(false)}
              >
                <X size={24} color={colors.text} />
              </TouchableOpacity>
            </View>

            <ScrollView 
              style={styles.modalContent}
              keyboardShouldPersistTaps="handled"
            >
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Account Number</Text>
                <TextInput
                  style={styles.input}
                  value={bankForm.accountNumber}
                  onChangeText={(text) => setBankForm(prev => ({ ...prev, accountNumber: text.replace(/\D/g, '') }))}
                  placeholder="1234567890"
                  placeholderTextColor={colors.secondaryText}
                  keyboardType="numeric"
                  maxLength={10}
                  returnKeyType="next"
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Bank Name</Text>
                <TouchableOpacity
                  style={[styles.input, styles.bankSelector]}
                  onPress={() => setShowBankListModal(true)}
                >
                  <Text style={[
                    styles.bankSelectorText,
                    !bankForm.bankName && styles.bankSelectorPlaceholder
                  ]}>
                    {bankForm.bankName || 'Select Bank'}
                  </Text>
                  <Building2 size={20} color={colors.secondaryText} />
                </TouchableOpacity>
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Account Name</Text>
                <TextInput
                  style={styles.input}
                  value={bankForm.accountName}
                  onChangeText={(text) => setBankForm(prev => ({ ...prev, accountName: text }))}
                  placeholder={user?.name || "John Doe"}
                  placeholderTextColor={colors.secondaryText}
                  autoCapitalize="words"
                  returnKeyType="next"
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Nickname (Optional)</Text>
                <TextInput
                  style={styles.input}
                  value={bankForm.nickname}
                  onChangeText={(text) => setBankForm(prev => ({ ...prev, nickname: text }))}
                  placeholder="Salary Account"
                  placeholderTextColor={colors.secondaryText}
                  returnKeyType="done"
                />
              </View>
            </ScrollView>

            <View style={styles.modalFooter}>
              <TouchableOpacity
                style={[styles.button, styles.addButton]}
                onPress={handleAddBank}
                disabled={showLoading || !bankForm.accountNumber || !bankForm.bankName || !bankForm.accountName}
              >
                <Text style={styles.addButtonText}>
                  {showLoading ? 'Adding...' : 'Add Bank Account'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
      </View>
    </Modal>
  );

  const renderBankListModal = () => (
    <Modal
      visible={showBankListModal}
      transparent={true}
      animationType="slide"
      onRequestClose={() => setShowBankListModal(false)}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.halfScreenModal}>
          <View style={styles.modalHandle} />
          
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Select Bank</Text>
            <TouchableOpacity
              style={styles.modalCloseButton}
              onPress={() => setShowBankListModal(false)}
            >
              <X size={24} color={colors.text} />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.bankList}>
            {nigerianBanks.map((bank, index) => (
              <TouchableOpacity
                key={index}
                style={styles.bankListItem}
                onPress={() => selectBank(bank)}
              >
                <View style={styles.bankIcon}>
                  <Building2 size={20} color={colors.primary} />
                </View>
                <Text style={styles.bankListItemText}>{bank}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.background} />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <ArrowLeft size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Payment Methods</Text>
        <TouchableOpacity
          style={styles.eyeToggle}
          onPress={() => setShowCardNumbers(!showCardNumbers)}
        >
          {showCardNumbers ? (
            <Eye size={24} color={colors.primary} />
          ) : (
            <EyeOff size={24} color={colors.secondaryText} />
          )}
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Payment Methods */}
        <View style={styles.section}>
          {paymentMethods.map(renderPaymentMethod)}
        </View>
      </ScrollView>

      {/* Floating Action Button */}
      <TouchableOpacity
        style={styles.floatingActionButton}
        onPress={() => setShowAddMethodModal(true)}
      >
        <Plus size={24} color={colors.white} />
      </TouchableOpacity>

      {renderAddMethodModal()}
      {renderAddCardModal()}
      {renderAddBankModal()}
      {renderBankListModal()}

      {/* Pin Verification Modal */}
      {showPinModal && (
        <Modal
          visible={showPinModal}
          transparent={true}
          animationType="slide"
          onRequestClose={() => setShowPinModal(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.pinModal}>
              <View style={styles.modalHandle} />
              
              <View style={styles.pinModalHeader}>
                <Lock size={24} color={colors.primary} />
                <Text style={styles.pinModalTitle}>Enter PIN</Text>
                <Text style={styles.pinModalSubtitle}>Enter your 4-digit PIN to confirm</Text>
              </View>

              <TextInput
                style={styles.pinInput}
                value={pin}
                onChangeText={setPin}
                placeholder="Enter 4-digit PIN"
                placeholderTextColor={colors.secondaryText}
                secureTextEntry={true}
                keyboardType="numeric"
                maxLength={4}
                textAlign="center"
                autoFocus={true}
              />

              <View style={styles.pinModalButtons}>
                <TouchableOpacity
                  style={[styles.pinButton, styles.pinButtonSecondary]}
                  onPress={() => {
                    setShowPinModal(false);
                    setPin('');
                  }}
                >
                  <Text style={styles.pinButtonSecondaryText}>Cancel</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.pinButton, styles.pinButtonPrimary]}
                  onPress={handlePinVerification}
                  disabled={pin.length !== 4}
                >
                  <Text style={styles.pinButtonPrimaryText}>Verify</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
      )}

      {/* Loading Animation */}
      {showLoading && (
        <View style={styles.loadingOverlay}>
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={colors.primary} />
            <Text style={styles.loadingText}>Processing...</Text>
          </View>
        </View>
      )}

      {/* Confirmation Animation */}
      {showConfirmation && (
        <View style={styles.confirmationOverlay}>
          <View style={styles.confirmationContainer}>
            <CheckCircle size={60} color={colors.success} />
            <Text style={styles.confirmationText}>Success!</Text>
            <Text style={styles.confirmationSubtext}>Payment method added</Text>
          </View>
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
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    backgroundColor: colors.background,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  backButton: {
    padding: spacing.xs,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: colors.text,
  },
  eyeToggle: {
    padding: spacing.xs,
  },
  content: {
    flex: 1,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
  },
  section: {
    marginBottom: spacing.xl,
  },
  paymentMethodCard: {
    backgroundColor: colors.card,
    borderRadius: borderRadius.large,
    padding: spacing.xxl,
    marginBottom: spacing.lg,
    ...shadows.card,
  },
  paymentMethodHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  paymentMethodIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.background,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.lg,
  },
  paymentMethodInfo: {
    flex: 1,
  },
  paymentMethodNickname: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginBottom: spacing.sm,
  },
  paymentMethodDetails: {
    fontSize: 14,
    color: colors.secondaryText,
  },
  paymentMethodSubDetails: {
    fontSize: 12,
    color: colors.secondaryText,
    marginTop: spacing.sm,
    fontStyle: 'italic',
  },
  deleteButton: {
    backgroundColor: colors.error,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.xl,
    minWidth: 80,
    ...shadows.small,
  },
  deleteButtonText: {
    color: colors.white,
    fontSize: 13,
    fontWeight: '500',
    marginLeft: spacing.sm,
  },
  floatingActionButton: {
    position: 'absolute',
    bottom: spacing.xl,
    right: spacing.xl,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    ...shadows.large,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: colors.overlay,
    justifyContent: 'flex-end',
  },
  halfScreenModal: {
    backgroundColor: colors.white,
    borderTopLeftRadius: borderRadius.large,
    borderTopRightRadius: borderRadius.large,
    maxHeight: '80%',
    minHeight: '50%',
  },
  keyboardView: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  modalHandle: {
    width: 40,
    height: 4,
    backgroundColor: colors.border,
    borderRadius: 2,
    alignSelf: 'center',
    marginTop: spacing.sm,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
  },
  modalCloseButton: {
    padding: spacing.xs,
  },
  modalContent: {
    flex: 1,
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.lg,
  },
  modalFooter: {
    padding: spacing.xl,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  methodOptions: {
    padding: spacing.xl,
  },
  methodOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.lg,
    paddingHorizontal: spacing.md,
    backgroundColor: colors.background,
    borderRadius: borderRadius.medium,
    marginBottom: spacing.md,
  },
  methodIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.white,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
    ...shadows.small,
  },
  methodText: {
    fontSize: 16,
    fontWeight: '500',
    color: colors.text,
  },
  inputGroup: {
    marginBottom: spacing.lg,
  },
  inputRow: {
    flexDirection: 'row',
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.text,
    marginBottom: spacing.sm,
  },
  input: {
    backgroundColor: colors.background,
    borderRadius: borderRadius.medium,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    fontSize: 16,
    color: colors.text,
    borderWidth: 1,
    borderColor: colors.border,
  },
  bankSelector: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  bankSelectorText: {
    fontSize: 16,
    color: colors.text,
  },
  bankSelectorPlaceholder: {
    color: colors.secondaryText,
  },
  bankList: {
    flex: 1,
    paddingHorizontal: spacing.xl,
  },
  bankListItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  bankIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.background,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  bankListItemText: {
    fontSize: 16,
    color: colors.text,
    fontWeight: '500',
  },
  button: {
    borderRadius: borderRadius.medium,
    paddingVertical: spacing.lg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  addButton: {
    backgroundColor: colors.primary,
    ...shadows.small,
  },
  addButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.white,
  },

  // Pin Modal Styles
  pinModal: {
    backgroundColor: colors.white,
    borderTopLeftRadius: borderRadius.large,
    borderTopRightRadius: borderRadius.large,
    paddingTop: spacing.md,
    paddingHorizontal: spacing.xl,
    paddingBottom: spacing.xxl,
    minHeight: 300,
    alignItems: 'center',
  },
  pinModalHeader: {
    alignItems: 'center',
    marginBottom: spacing.xl,
  },
  pinModalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.text,
    marginTop: spacing.sm,
    marginBottom: spacing.xs,
  },
  pinModalSubtitle: {
    fontSize: 14,
    color: colors.secondaryText,
    textAlign: 'center',
  },
  pinInput: {
    backgroundColor: colors.background,
    borderRadius: borderRadius.medium,
    paddingVertical: spacing.lg,
    paddingHorizontal: spacing.xl,
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.text,
    textAlign: 'center',
    marginBottom: spacing.xl,
    width: 120,
    letterSpacing: 8,
  },
  pinModalButtons: {
    flexDirection: 'row',
    gap: spacing.md,
    width: '100%',
  },
  pinButton: {
    flex: 1,
    paddingVertical: spacing.lg,
    borderRadius: borderRadius.medium,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pinButtonPrimary: {
    backgroundColor: colors.primary,
  },
  pinButtonSecondary: {
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.border,
  },
  pinButtonPrimaryText: {
    color: colors.white,
    fontSize: 16,
    fontWeight: '600',
  },
  pinButtonSecondaryText: {
    color: colors.text,
    fontSize: 16,
    fontWeight: '500',
  },

  // Loading Animation Styles
  loadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000,
  },
  loadingContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    marginTop: spacing.md,
    fontSize: 16,
    color: colors.text,
    fontWeight: '500',
  },

  // Confirmation Animation Styles
  confirmationOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000,
  },
  confirmationContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.white,
    borderRadius: borderRadius.large,
    padding: spacing.xxl,
    ...shadows.large,
  },
  confirmationText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.text,
    marginTop: spacing.lg,
    marginBottom: spacing.sm,
  },
  confirmationSubtext: {
    fontSize: 16,
    color: colors.secondaryText,
    textAlign: 'center',
  },
});

export default PaymentMethodsScreen;
