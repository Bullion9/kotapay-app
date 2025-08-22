import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from '@react-navigation/native';
import { ChevronDown, ChevronLeft, CreditCard, Landmark, Search, X } from 'lucide-react-native';
import React, { useState, useEffect } from 'react';
import {
    Alert,
    FlatList,
    KeyboardAvoidingView,
    Modal,
    Platform,
    SafeAreaView,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
    ActivityIndicator,
} from 'react-native';
import type { PaymentMethod } from '../services/PaymentMethodService';
import { borderRadius, colors, iconSizes, spacing, typography } from '../theme';
import { usePaystack } from '../hooks/usePaystack';

interface Bank {
  id: string;
  name: string;
  code: string;
}

const AddPaymentMethodScreen: React.FC = () => {
  const navigation = useNavigation();
  const { getBanks, loadingBanks, banks, resolveAccount, resolvingAccount } = usePaystack();
  
  const [type, setType] = useState<'card' | 'bank'>('card');
  const [nickname, setNickname] = useState('');
  const [cardNumber, setCardNumber] = useState('');
  const [expiryDate, setExpiryDate] = useState('');
  const [cardholderName, setCardholderName] = useState('');
  const [cardBrand, setCardBrand] = useState<string>('');
  const [showBankModal, setShowBankModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredBanks, setFilteredBanks] = useState<Bank[]>([]);
  const [accountNumber, setAccountNumber] = useState('');
  const [bankName, setBankName] = useState('');
  const [bankCode, setBankCode] = useState('');
  const [accountName, setAccountName] = useState('');

  // Load banks from Paystack API on component mount
  useEffect(() => {
    getBanks();
  }, [getBanks]);

  // Update filtered banks when banks data changes
  useEffect(() => {
    if (banks && banks.length > 0) {
      const banksData = banks.map((bank: any, index: number) => ({
        id: `bank_${index}_${bank.code || 'no_code'}_${bank.name.replace(/\s+/g, '_').toLowerCase()}`,
        name: bank.name,
        code: bank.code,
      }));
      setFilteredBanks(banksData);
    }
  }, [banks]);

  // Auto-fetch account name when account number and bank code are available
  useEffect(() => {
    const fetchAccountName = async () => {
      if (accountNumber.length === 10 && bankCode && accountNumber.match(/^\d{10}$/)) {
        try {
          console.log('Fetching account name for:', accountNumber, 'Bank code:', bankCode);
          const response = await resolveAccount(accountNumber, bankCode);
          console.log('Account resolution response:', response);
          if (response.status && response.data && response.data.account_name) {
            console.log('Setting account name to:', response.data.account_name);
            setAccountName(response.data.account_name);
          }
        } catch (error) {
          console.log('Failed to resolve account name:', error);
          // Don't show error to user for account resolution failure
        }
      } else {
        // Clear account name if account number is invalid
        if (accountName && (!accountNumber || accountNumber.length !== 10)) {
          setAccountName('');
        }
      }
    };

    const timeoutId = setTimeout(fetchAccountName, 500); // Debounce for 500ms
    return () => clearTimeout(timeoutId);
  }, [accountNumber, bankCode, resolveAccount, accountName]);

  const handleBack = () => {
    navigation.goBack();
  };

  // Function to detect card type based on card number
  const detectCardType = (number: string): string => {
    const cleanNumber = number.replace(/\s/g, '');
    
    // Visa: starts with 4
    if (/^4/.test(cleanNumber)) {
      return 'visa';
    }
    
    // MasterCard: starts with 5 or 2221-2720
    if (/^5[1-5]/.test(cleanNumber) || /^2(22[1-9]|2[3-9]|[3-6]|7[0-1]|720)/.test(cleanNumber)) {
      return 'mastercard';
    }
    
    // American Express: starts with 34 or 37
    if (/^3[47]/.test(cleanNumber)) {
      return 'amex';
    }
    
    // Discover: starts with 6011, 622126-622925, 644-649, or 65
    if (/^6011|^622(12[6-9]|1[3-9]|[2-8]|9[01]|92[0-5])|^64[4-9]|^65/.test(cleanNumber)) {
      return 'discover';
    }
    
    // Diners Club: starts with 300-305, 36, or 38
    if (/^3(0[0-5]|[68])/.test(cleanNumber)) {
      return 'diners';
    }
    
    // JCB: starts with 35, 2131, or 1800
    if (/^35|^2131|^1800/.test(cleanNumber)) {
      return 'jcb';
    }
    
    return '';
  };

  // Function to format card number with spaces
  const formatCardNumber = (number: string): string => {
    const cleanNumber = number.replace(/\s/g, '');
    const cardType = detectCardType(cleanNumber);
    
    // American Express: 4-6-5 format
    if (cardType === 'amex') {
      return cleanNumber.replace(/(\d{4})(\d{6})(\d{5})/, '$1 $2 $3');
    }
    
    // All others: 4-4-4-4 format
    return cleanNumber.replace(/(\d{4})(?=\d)/g, '$1 ');
  };

  // Handle card number input with formatting and type detection
  const handleCardNumberChange = (text: string) => {
    const cleanNumber = text.replace(/\s/g, '');
    
    // Limit to 16 digits for most cards, 15 for Amex
    const maxLength = detectCardType(cleanNumber) === 'amex' ? 15 : 16;
    const limitedNumber = cleanNumber.slice(0, maxLength);
    
    const formattedNumber = formatCardNumber(limitedNumber);
    setCardNumber(formattedNumber);
    
    // Detect and set card brand
    const brand = detectCardType(limitedNumber);
    setCardBrand(brand);
  };

  // Function to format expiry date MM/YY
  const formatExpiryDate = (text: string): string => {
    const cleanText = text.replace(/\D/g, '');
    if (cleanText.length >= 2) {
      return `${cleanText.slice(0, 2)}/${cleanText.slice(2, 4)}`;
    }
    return cleanText;
  };

  const handleExpiryDateChange = (text: string) => {
    const formatted = formatExpiryDate(text);
    setExpiryDate(formatted);
  };

  // Get card brand display name
  const getCardBrandName = (brand: string): string => {
    const brandNames: Record<string, string> = {
      visa: 'Visa',
      mastercard: 'MasterCard',
      amex: 'American Express',
      discover: 'Discover',
      diners: 'Diners Club',
      jcb: 'JCB',
    };
    return brandNames[brand] || '';
  };

  const handleBankSearch = (text: string) => {
    setSearchQuery(text);
    if (banks && banks.length > 0) {
      const banksData = banks.map((bank: any, index: number) => ({
        id: `bank_${index}_${bank.code || 'no_code'}_${bank.name.replace(/\s+/g, '_').toLowerCase()}`,
        name: bank.name,
        code: bank.code,
      }));
      const filtered = banksData.filter(bank => 
        bank.name.toLowerCase().includes(text.toLowerCase())
      );
      setFilteredBanks(filtered);
    }
  };

  const handleBankSelect = (bank: Bank) => {
    setBankName(bank.name);
    setBankCode(bank.code);
    setShowBankModal(false);
    setSearchQuery('');
    // Reset to full banks list
    if (banks && banks.length > 0) {
      const banksData = banks.map((bank: any, index: number) => ({
        id: `bank_${index}_${bank.code || 'no_code'}_${bank.name.replace(/\s+/g, '_').toLowerCase()}`,
        name: bank.name,
        code: bank.code,
      }));
      setFilteredBanks(banksData);
    }
  };

  const handleShowBankModal = () => {
    setSearchQuery('');
    if (banks && banks.length > 0) {
      const banksData = banks.map((bank: any, index: number) => ({
        id: `bank_${index}_${bank.code || 'no_code'}_${bank.name.replace(/\s+/g, '_').toLowerCase()}`,
        name: bank.name,
        code: bank.code,
      }));
      setFilteredBanks(banksData);
    }
    setShowBankModal(true);
  };

  const handleCloseBankModal = () => {
    setShowBankModal(false);
    setSearchQuery('');
    if (banks && banks.length > 0) {
      const banksData = banks.map((bank: any, index: number) => ({
        id: `bank_${index}_${bank.code || 'no_code'}_${bank.name.replace(/\s+/g, '_').toLowerCase()}`,
        name: bank.name,
        code: bank.code,
      }));
      setFilteredBanks(banksData);
    }
  };

  const handleSubmit = async () => {
    try {
      if (type === 'card') {
        if (!nickname || !cardNumber || !expiryDate || !cardholderName) {
          Alert.alert('Error', 'Please fill in all fields');
          return;
        }
      } else {
        if (!nickname || !accountNumber || !bankName || !accountName) {
          Alert.alert('Error', 'Please fill in all fields');
          return;
        }
      }

      // Get existing payment methods
      const savedMethods = await AsyncStorage.getItem('paymentMethods');
      const existingMethods: PaymentMethod[] = savedMethods ? JSON.parse(savedMethods) : [];

      // Create new payment method
      const newMethod: PaymentMethod = {
        id: Date.now().toString(),
        type,
        nickname,
        ...(type === 'card'
          ? {
              cardNumber,
              expiryDate,
              cardholderName,
              brand: cardBrand || 'unknown', // Use detected card brand
            }
          : {
              accountNumber,
              bankName,
              accountName,
            }),
      };

      // Save updated list
      const updatedMethods = [...existingMethods, newMethod];
      await AsyncStorage.setItem('paymentMethods', JSON.stringify(updatedMethods));

      // Navigate back
      navigation.goBack();
    } catch (error) {
      console.error('Error saving payment method:', error);
      Alert.alert('Error', 'Failed to save payment method');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={handleBack} style={styles.backButton}>
          <ChevronLeft size={iconSizes.sm} color={colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Add Payment Method</Text>
        <View style={styles.placeholder} />
      </View>

      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardAvoidingView}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 88 : 0}
      >
        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Method Type Selection */}
        <View style={styles.typeSelection}>
          <TouchableOpacity
            style={[styles.typeButton, type === 'card' && styles.typeButtonSelected]}
            onPress={() => setType('card')}
          >
            <CreditCard size={iconSizes.md} color={type === 'card' ? colors.white : colors.text} />
            <Text style={[styles.typeButtonText, type === 'card' && styles.typeButtonTextSelected]}>
              Card
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.typeButton, type === 'bank' && styles.typeButtonSelected]}
            onPress={() => setType('bank')}
          >
            <Landmark size={iconSizes.md} color={type === 'bank' ? colors.white : colors.text} />
            <Text style={[styles.typeButtonText, type === 'bank' && styles.typeButtonTextSelected]}>
              Bank Account
            </Text>
          </TouchableOpacity>
        </View>

        <View style={styles.form}>
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Nickname</Text>
            <TextInput
              style={styles.input}
              value={nickname}
              onChangeText={setNickname}
              placeholder="e.g., Primary Card"
            />
          </View>

          {type === 'card' ? (
            <>
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Card Number</Text>
                <TextInput
                  style={styles.input}
                  value={cardNumber}
                  onChangeText={handleCardNumberChange}
                  placeholder="1234 5678 9012 3456"
                  keyboardType="numeric"
                />
                {cardBrand && (
                  <Text style={styles.cardBrandText}>
                    {getCardBrandName(cardBrand)} detected
                  </Text>
                )}
              </View>
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Expiry Date</Text>
                <TextInput
                  style={styles.input}
                  value={expiryDate}
                  onChangeText={handleExpiryDateChange}
                  placeholder="MM/YY"
                  keyboardType="numeric"
                  maxLength={5}
                />
              </View>
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Cardholder Name</Text>
                <TextInput
                  style={styles.input}
                  value={cardholderName}
                  onChangeText={setCardholderName}
                  placeholder="John Doe"
                  autoCapitalize="words"
                />
              </View>
            </>
          ) : (
            <>
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Account Number</Text>
                <TextInput
                  style={styles.input}
                  value={accountNumber}
                  onChangeText={setAccountNumber}
                  placeholder="0123456789"
                  keyboardType="numeric"
                />
              </View>
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Bank Name</Text>
                <TouchableOpacity 
                  style={[styles.input, styles.bankSelector]} 
                  onPress={handleShowBankModal}
                >
                  <Text style={[
                    styles.bankSelectorText,
                    !bankName && styles.bankSelectorPlaceholder
                  ]}>
                    {bankName || "Select your bank"}
                  </Text>
                  <ChevronDown size={20} color={colors.text} />
                </TouchableOpacity>
              </View>
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Account Name</Text>
                <View style={styles.accountNameContainer}>
                  <TextInput
                    style={[
                      styles.input,
                      resolvingAccount && styles.inputDisabled,
                      accountName && bankCode && accountNumber.length === 10 && styles.inputReadOnly
                    ]}
                    value={accountName}
                    onChangeText={setAccountName}
                    placeholder={resolvingAccount ? "Fetching account name..." : "John Doe"}
                    editable={!resolvingAccount && !(accountName && bankCode && accountNumber.length === 10)}
                  />
                  {resolvingAccount && (
                    <ActivityIndicator 
                      size="small" 
                      color={colors.primary} 
                      style={styles.accountNameLoader}
                    />
                  )}
                </View>
              </View>
            </>
          )}
        </View>
        </ScrollView>

        <View style={styles.footer}>
          <TouchableOpacity style={styles.submitButton} onPress={handleSubmit}>
            <Text style={styles.submitButtonText}>Add Payment Method</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>

      {/* Bank Selection Modal */}
      <Modal
        visible={showBankModal}
        animationType="slide"
        transparent={true}
        onRequestClose={handleCloseBankModal}
      >
        <KeyboardAvoidingView 
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.modalContainer}
          keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
        >
          <TouchableOpacity 
            style={styles.modalBackdrop} 
            activeOpacity={1} 
            onPress={handleCloseBankModal}
          >
            <View style={styles.modalContent}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Select Bank</Text>
                <TouchableOpacity 
                  style={styles.closeButton}
                  onPress={handleCloseBankModal}
                >
                  <X size={24} color={colors.text} />
                </TouchableOpacity>
              </View>

              <View style={styles.searchContainer}>
                <Search size={20} color={colors.secondaryText} />
                <TextInput
                  style={styles.searchInput}
                  placeholder="Search banks"
                  value={searchQuery}
                  onChangeText={handleBankSearch}
                  placeholderTextColor={colors.secondaryText}
                  autoCapitalize="none"
                  autoCorrect={false}
                  returnKeyType="search"
                />
              </View>

              {loadingBanks ? (
                <View style={styles.loadingContainer}>
                  <ActivityIndicator size="large" color={colors.primary} />
                  <Text style={styles.loadingText}>Loading banks...</Text>
                </View>
              ) : (
                <FlatList
                  data={filteredBanks}
                  keyExtractor={(item, index) => `${item.code}_${item.slug}_${index}`}
                  renderItem={({ item }) => (
                    <TouchableOpacity
                      style={styles.bankItem}
                    onPress={() => handleBankSelect(item)}
                  >
                    <Text style={styles.bankItemText}>{item.name}</Text>
                  </TouchableOpacity>
                )}
                ListEmptyComponent={() => (
                  <View style={styles.noResults}>
                    <Text style={styles.noResultsText}>No banks found</Text>
                    <Text style={styles.noResultsSubText}>Try a different search term</Text>
                  </View>
                )}
                keyboardShouldPersistTaps="handled"
                contentContainerStyle={styles.bankList}
              />
              )}
            </View>
          </TouchableOpacity>
        </KeyboardAvoidingView>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  bankSelector: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  bankSelectorText: {
    ...typography.body,
    color: colors.text,
  },
  bankSelectorPlaceholder: {
    color: colors.secondaryText,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'transparent',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: colors.white,
    borderTopLeftRadius: borderRadius.large,
    borderTopRightRadius: borderRadius.large,
    maxHeight: '90%',
  },
  bankList: {
    flexGrow: 1,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  modalTitle: {
    ...typography.h3,
    color: colors.text,
  },
  closeButton: {
    padding: spacing.xs,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.light,
    margin: spacing.lg,
    paddingHorizontal: spacing.md,
    borderRadius: borderRadius.medium,
  },
  searchInput: {
    ...typography.body,
    flex: 1,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.sm,
    color: colors.text,
  },
  bankItem: {
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  bankItemText: {
    ...typography.body,
    color: colors.text,
  },
  noResults: {
    padding: spacing.xl,
    alignItems: 'center',
  },
  noResultsText: {
    ...typography.body,
    color: colors.text,
    marginBottom: spacing.xs,
  },
  noResultsSubText: {
    ...typography.caption,
    color: colors.secondaryText,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: spacing.lg,
  },
  headerTitle: {
    ...typography.h3,
    color: colors.text,
  },
  backButton: {
    padding: spacing.sm,
    borderRadius: borderRadius.small,
  },
  placeholder: {
    width: 40,
  },
  keyboardAvoidingView: {
    flex: 1,
  },
  content: {
    flex: 1,
    padding: spacing.lg,
  },
  cardBrandText: {
    ...typography.caption,
    color: colors.primary,
    marginTop: spacing.xs,
    fontWeight: '600',
  },
  typeSelection: {
    flexDirection: 'row',
    gap: spacing.md,
    marginBottom: spacing.xl,
  },
  typeButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.lg,
    borderRadius: borderRadius.medium,
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.border,
    gap: spacing.sm,
  },
  typeButtonSelected: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  typeButtonText: {
    ...typography.body,
    color: colors.text,
  },
  typeButtonTextSelected: {
    color: colors.white,
  },
  form: {
    gap: spacing.lg,
  },
  inputGroup: {
    gap: spacing.xs,
  },
  label: {
    ...typography.caption,
    color: colors.secondaryText,
    marginLeft: spacing.xs,
  },
  input: {
    backgroundColor: colors.white,
    borderRadius: borderRadius.medium,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
    ...typography.body,
  },
  footer: {
    padding: spacing.lg,
  },
  submitButton: {
    backgroundColor: colors.primary,
    padding: spacing.md,
    borderRadius: borderRadius.medium,
    alignItems: 'center',
  },
  submitButtonText: {
    ...typography.body,
    color: colors.white,
    fontWeight: '600',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.xl,
  },
  loadingText: {
    ...typography.body,
    color: colors.secondaryText,
    marginTop: spacing.md,
  },
  accountNameContainer: {
    position: 'relative',
  },
  accountNameLoader: {
    position: 'absolute',
    right: spacing.md,
    top: '50%',
    transform: [{ translateY: -10 }],
  },
  inputDisabled: {
    backgroundColor: colors.background,
    opacity: 0.7,
  },
  inputReadOnly: {
    backgroundColor: '#f8f9fa',
    color: colors.secondaryText,
  },
});

export default AddPaymentMethodScreen;
