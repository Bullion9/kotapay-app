import { useNavigation } from '@react-navigation/native';
import {
    CheckCircle,
    ChevronLeft,
    Landmark,
    MapPin,
    Phone,
} from 'lucide-react-native';
import React, { useState } from 'react';
import {
    ActivityIndicator,
    Alert,
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
import PinEntryModal from '../components/PinEntryModal';
import { colors } from '../theme';

interface CashOutMethod {
  id: string;
  name: string;
  description: string;
  icon: any;
  fee: number;
}

const CashOutScreen: React.FC = () => {
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();
  
  // State
  const [amount, setAmount] = useState('');
  const [selectedMethod, setSelectedMethod] = useState<CashOutMethod | null>(null);
  const [showPinModal, setShowPinModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [amountFocused, setAmountFocused] = useState(false);

  // Mock user balance
  const userBalance = 15000;

  // Cash-out methods
  const cashOutMethods: CashOutMethod[] = [
    {
      id: 'bank_transfer',
      name: 'Bank Transfer',
      description: 'Transfer to your bank account',
      icon: Landmark,
      fee: 50,
    },
    {
      id: 'mobile_money',
      name: 'Mobile Money',
      description: 'Transfer to mobile wallet',
      icon: Phone,
      fee: 25,
    },
    {
      id: 'agent_pickup',
      name: 'Agent Pickup',
      description: 'Collect cash from agent',
      icon: MapPin,
      fee: 75,
    },
  ];

  // Validate amount
  const validateAmount = () => {
    const numAmount = parseFloat(amount);
    if (isNaN(numAmount) || numAmount <= 0) {
      Alert.alert('Error', 'Please enter a valid amount');
      return false;
    }
    if (numAmount < 100) {
      Alert.alert('Error', 'Minimum cash-out amount is ₦100');
      return false;
    }
    if (numAmount > userBalance) {
      Alert.alert('Error', 'Amount exceeds your available balance');
      return false;
    }
    return true;
  };

  // Handle continue button press
  const handleContinue = () => {
    if (!validateAmount() || !selectedMethod) {
      Alert.alert('Error', 'Please select a cash-out method');
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
        `Cash-out of ₦${amount} initiated successfully via ${selectedMethod?.name}`
      );
    } catch {
      setLoading(false);
      Alert.alert('Error', 'Cash-out failed. Please try again.');
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
      <Text style={styles.successTitle}>Cash-Out Initiated!</Text>
      <Text style={styles.successMessage}>
        Your cash-out request of ₦{amount} has been submitted successfully via {selectedMethod?.name}.
      </Text>
      <TouchableOpacity
        style={styles.doneButton}
        onPress={() => {
          setShowSuccess(false);
          setAmount('');
          setSelectedMethod(null);
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
          <Text style={styles.headerTitle}>Cash-Out</Text>
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
        <Text style={styles.headerTitle}>Cash-Out</Text>
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

          {/* Cash-Out Methods */}
          <View style={styles.methodsSection}>
            <Text style={styles.sectionTitle}>Select Cash-Out Method</Text>
            {cashOutMethods.map((method) => (
              <TouchableOpacity
                key={method.id}
                style={[
                  styles.methodCard,
                  selectedMethod?.id === method.id && styles.selectedMethodCard,
                ]}
                onPress={() => setSelectedMethod(method)}
              >
                <View style={styles.methodIcon}>
                  <method.icon size={24} color={selectedMethod?.id === method.id ? colors.primary : colors.secondaryText} />
                </View>
                <View style={styles.methodInfo}>
                  <Text style={styles.methodName}>{method.name}</Text>
                  <Text style={styles.methodDescription}>{method.description}</Text>
                  <Text style={styles.methodFee}>Fee: ₦{method.fee}</Text>
                </View>
                {selectedMethod?.id === method.id && (
                  <CheckCircle size={20} color={colors.primary} />
                )}
              </TouchableOpacity>
            ))}
          </View>

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
                  <Text style={styles.summaryLabel}>Fee</Text>
                  <Text style={styles.summaryValue}>₦{selectedMethod.fee}</Text>
                </View>
                <View style={[styles.summaryRow, styles.totalRow]}>
                  <Text style={styles.totalLabel}>Total</Text>
                  <Text style={styles.totalValue}>₦{(parseFloat(amount || '0') + selectedMethod.fee).toLocaleString()}</Text>
                </View>
              </View>
            </View>
          )}
        </ScrollView>

        {/* Fixed Continue Button */}
        <View style={[styles.buttonContainer, { paddingBottom: Math.max(insets.bottom, 20) }]}>
          <TouchableOpacity
            style={[
              styles.continueButton,
              (!amount || !selectedMethod || loading) && styles.disabledButton,
            ]}
            onPress={handleContinue}
            disabled={!amount || !selectedMethod || loading}
          >
            {loading ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <Text style={styles.continueButtonText}>
                Continue
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
          subtitle={`Confirm cash-out of ₦${amount}`}
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
    marginBottom: 4,
  },
  methodFee: {
    fontSize: 12,
    color: colors.primary,
    fontWeight: '500',
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
  totalRow: {
    borderTopWidth: 1,
    borderTopColor: colors.border,
    paddingTop: 12,
    marginTop: 12,
    marginBottom: 0,
  },
  totalLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
  },
  totalValue: {
    fontSize: 16,
    fontWeight: '600',
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

export default CashOutScreen;