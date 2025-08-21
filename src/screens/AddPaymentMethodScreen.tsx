import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  Modal,
  FlatList,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { CreditCard, ChevronLeft, Landmark, Search, ChevronDown, X } from 'lucide-react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { colors, spacing, typography, borderRadius, iconSizes } from '../theme';
import type { PaymentMethod } from '../services/PaymentMethodService';

// Nigerian banks list
const NIGERIAN_BANKS = [
  { id: '1', name: 'Access Bank' },
  { id: '2', name: 'First Bank of Nigeria' },
  { id: '3', name: 'Guaranty Trust Bank (GTBank)' },
  { id: '4', name: 'United Bank for Africa (UBA)' },
  { id: '5', name: 'Zenith Bank' },
  { id: '6', name: 'Fidelity Bank' },
  { id: '7', name: 'Union Bank' },
  { id: '8', name: 'Sterling Bank' },
  { id: '9', name: 'Ecobank Nigeria' },
  { id: '10', name: 'First City Monument Bank (FCMB)' },
  { id: '11', name: 'Stanbic IBTC Bank' },
  { id: '12', name: 'Unity Bank' },
  { id: '13', name: 'Wema Bank' },
  { id: '14', name: 'Heritage Bank' },
  { id: '15', name: 'Keystone Bank' },
  { id: '16', name: 'Polaris Bank' },
  { id: '17', name: 'Standard Chartered Bank' },
  { id: '18', name: 'Providus Bank' },
  { id: '19', name: 'Jaiz Bank' },
  { id: '20', name: 'SunTrust Bank' },
];

const AddPaymentMethodScreen: React.FC = () => {
  const navigation = useNavigation();
  const [type, setType] = useState<'card' | 'bank'>('card');
  const [nickname, setNickname] = useState('');
  const [cardNumber, setCardNumber] = useState('');
  const [expiryDate, setExpiryDate] = useState('');
  const [cardholderName, setCardholderName] = useState('');
  const [cardBrand, setCardBrand] = useState<string>('');
  const [showBankModal, setShowBankModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredBanks, setFilteredBanks] = useState(NIGERIAN_BANKS);
  const [accountNumber, setAccountNumber] = useState('');
  const [bankName, setBankName] = useState('');
  const [accountName, setAccountName] = useState('');

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
    const filtered = NIGERIAN_BANKS.filter(bank => 
      bank.name.toLowerCase().includes(text.toLowerCase())
    );
    setFilteredBanks(filtered);
  };

  const handleBankSelect = (bank: typeof NIGERIAN_BANKS[0]) => {
    setBankName(bank.name);
    setShowBankModal(false);
    setSearchQuery('');
    setFilteredBanks(NIGERIAN_BANKS);
  };

  const handleShowBankModal = () => {
    setSearchQuery('');
    setFilteredBanks(NIGERIAN_BANKS);
    setShowBankModal(true);
  };

  const handleCloseBankModal = () => {
    setShowBankModal(false);
    setSearchQuery('');
    setFilteredBanks(NIGERIAN_BANKS);
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
                <TextInput
                  style={styles.input}
                  value={accountName}
                  onChangeText={setAccountName}
                  placeholder="John Doe"
                />
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

              <FlatList
                data={filteredBanks}
                keyExtractor={(item) => item.id}
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
});

export default AddPaymentMethodScreen;
