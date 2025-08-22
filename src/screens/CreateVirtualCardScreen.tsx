import { useNavigation } from '@react-navigation/native';
import {
    CheckCircle,
    ChevronLeft,
    CreditCard,
    Plus,
} from 'lucide-react-native';
import React, { useRef, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    Animated,
    KeyboardAvoidingView,
    Platform,
    SafeAreaView,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';
import { borderRadius, colors, shadows, spacing } from '../theme';

const CreateVirtualCardScreen: React.FC = () => {
  const navigation = useNavigation();
  const [cardName, setCardName] = useState('');
  const [spendLimit, setSpendLimit] = useState('');
  const [cardNameFocused, setCardNameFocused] = useState(false);
  const [spendLimitFocused, setSpendLimitFocused] = useState(false);
  const [loadingQuickAmount, setLoadingQuickAmount] = useState<number | null>(null);
  const [showSuccess, setShowSuccess] = useState(false);
  
  // Animation refs
  const successScale = useRef(new Animated.Value(0)).current;
  const successOpacity = useRef(new Animated.Value(0)).current;
  const spinValue = useRef(new Animated.Value(0)).current;
  
  const handleCreateCard = async () => {
    if (!cardName.trim()) {
      Alert.alert('Error', 'Please enter a card name');
      return;
    }
    if (!spendLimit || parseInt(spendLimit) <= 0) {
      Alert.alert('Error', 'Please enter a valid spend limit');
      return;
    }
    
    // Show success animation
    showSuccessAnimation();
    
    // Auto dismiss after 2 seconds
    setTimeout(() => {
      setShowSuccess(false);
      navigation.goBack();
    }, 2000);
  };

  const showSuccessAnimation = () => {
    setShowSuccess(true);
    successScale.setValue(0);
    successOpacity.setValue(0);
    
    Animated.spring(successScale, {
      toValue: 1,
      useNativeDriver: true,
      tension: 100,
      friction: 8,
    }).start();
    
    Animated.timing(successOpacity, {
      toValue: 1,
      duration: 300,
      useNativeDriver: true,
    }).start();
  };

  const handleQuickAmount = async (amount: number) => {
    setLoadingQuickAmount(amount);
    
    // Start spinning animation
    Animated.loop(
      Animated.timing(spinValue, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: true,
      })
    ).start();
    
    // Simulate loading
    await new Promise(resolve => setTimeout(resolve, 800));
    
    // Stop spinning and set amount
    spinValue.setValue(0);
    setSpendLimit(amount.toString());
    setLoadingQuickAmount(null);
  };

  const quickAmounts = [25000, 50000, 100000, 250000];

  const spin = spinValue.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  return (
    <KeyboardAvoidingView 
      style={{ flex: 1 }} 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <SafeAreaView style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity 
            style={styles.backButton} 
            onPress={() => navigation.goBack()}
          >
            <ChevronLeft size={24} color={colors.primary} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Create Card</Text>
          <View style={styles.placeholder} />
        </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Card Preview */}
        <View style={styles.cardSection}>
          <View style={styles.virtualCard}>
            <View style={styles.cardHeader}>
              <Text style={styles.cardName}>{cardName || 'New Virtual Card'}</Text>
              <CreditCard size={24} color={colors.white} />
            </View>

            <View style={styles.cardNumber}>
              <Text style={styles.cardNumberText}>•••• •••• •••• ••••</Text>
            </View>

            <View style={styles.cardDetails}>
              <View>
                <Text style={styles.cardLabel}>SPEND LIMIT</Text>
                <Text style={styles.balanceAmount}>
                  ₦{parseInt(spendLimit || '0').toLocaleString()}
                </Text>
              </View>
              <View style={styles.cardBalance}>
                <Text style={styles.cardLabel}>STATUS</Text>
                <Text style={styles.statusText}>Ready to Create</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Form Section */}
        <View style={styles.formSection}>
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Card Name</Text>
            <TextInput
              style={[
                styles.textInput,
                cardNameFocused && styles.textInputFocused
              ]}
              placeholder="Enter card name"
              value={cardName}
              onChangeText={setCardName}
              onFocus={() => setCardNameFocused(true)}
              onBlur={() => setCardNameFocused(false)}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Spend Limit</Text>
            <TextInput
              style={[
                styles.amountInput,
                spendLimitFocused && styles.amountInputFocused
              ]}
              placeholder="Enter spend limit"
              value={spendLimit}
              onChangeText={setSpendLimit}
              onFocus={() => setSpendLimitFocused(true)}
              onBlur={() => setSpendLimitFocused(false)}
              keyboardType="numeric"
            />
            
            <View style={styles.quickAmounts}>
              {quickAmounts.map((amount) => (
                <TouchableOpacity
                  key={amount}
                  style={[
                    styles.amountButton,
                    parseInt(spendLimit) === amount && styles.amountButtonSelected,
                    loadingQuickAmount === amount && styles.amountButtonLoading
                  ]}
                  onPress={() => handleQuickAmount(amount)}
                  disabled={loadingQuickAmount !== null}
                >
                  {loadingQuickAmount === amount ? (
                    <Animated.View style={{ transform: [{ rotate: spin }] }}>
                      <ActivityIndicator size="small" color={colors.white} />
                    </Animated.View>
                  ) : (
                    <Text style={[
                      styles.amountButtonText,
                      parseInt(spendLimit) === amount && styles.amountButtonTextSelected
                    ]}>
                      ₦{(amount / 1000)}k
                    </Text>
                  )}
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </View>

        <View style={styles.bottomPadding} />
      </ScrollView>

      {/* Create Button */}
      <View style={styles.bottomContainer}>
        <TouchableOpacity
          style={[
            styles.createButton,
            (!cardName.trim() || !spendLimit || parseInt(spendLimit) <= 0) && styles.createButtonDisabled
          ]}
          onPress={handleCreateCard}
          disabled={!cardName.trim() || !spendLimit || parseInt(spendLimit) <= 0}
        >
          <Plus size={20} color={colors.white} />
          <Text style={styles.createButtonText}>Create Virtual Card</Text>
        </TouchableOpacity>
      </View>

      {/* Success Animation */}
      {showSuccess && (
        <View style={styles.successOverlay}>
          <Animated.View
            style={[
              styles.successContainer,
              {
                opacity: successOpacity,
                transform: [{ scale: successScale }],
              },
            ]}
          >
            <CheckCircle size={60} color="#4CAF50" />
            <Text style={styles.successText}>Card Created Successfully!</Text>
            <Text style={styles.successSubtext}>
              {cardName} is ready to use
            </Text>
          </Animated.View>
        </View>
      )}
    </SafeAreaView>
    </KeyboardAvoidingView>
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
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5E5',
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.background,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: colors.border,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.text,
  },
  placeholder: {
    width: 40,
    height: 40,
  },
  content: {
    flex: 1,
  },
  cardSection: {
    padding: spacing.xl,
  },
  virtualCard: {
    backgroundColor: '#06402B',
    borderRadius: borderRadius.xl,
    padding: spacing.xl,
    minHeight: 200,
    ...shadows.large,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.xl,
  },
  cardName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.white,
  },
  cardNumber: {
    marginBottom: spacing.xl,
  },
  cardNumberText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.white,
    letterSpacing: 2,
  },
  cardDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
  },
  cardLabel: {
    fontSize: 10,
    color: colors.white,
    opacity: 0.8,
    marginBottom: spacing.xs,
  },
  cardValue: {
    fontSize: 14,
    fontWeight: 'bold',
    color: colors.white,
  },
  cardBalance: {
    alignItems: 'flex-end',
  },
  balanceAmount: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.white,
  },
  formSection: {
    paddingHorizontal: spacing.xl,
    gap: spacing.lg,
  },
  inputGroup: {
    marginBottom: spacing.lg,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginBottom: spacing.sm,
  },
  textInput: {
    backgroundColor: '#FFFFFF',
    borderRadius: borderRadius.medium,
    padding: spacing.md,
    fontSize: 16,
    borderWidth: 2,
    borderColor: colors.border,
    ...shadows.small,
  },
  textInputFocused: {
    borderColor: colors.primary,
    ...shadows.medium,
  },
  amountInput: {
    backgroundColor: '#FFFFFF',
    borderRadius: borderRadius.medium,
    padding: spacing.md,
    fontSize: 18,
    fontWeight: '600',
    borderWidth: 2,
    borderColor: colors.border,
    textAlign: 'center',
    ...shadows.small,
  },
  amountInputFocused: {
    borderColor: colors.primary,
    ...shadows.medium,
  },
  quickAmounts: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginTop: spacing.md,
  },
  amountButton: {
    flex: 1,
    paddingVertical: spacing.sm,
    backgroundColor: '#FFFFFF',
    borderRadius: borderRadius.medium,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
    minHeight: 40,
    justifyContent: 'center',
  },
  amountButtonSelected: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  amountButtonLoading: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  amountButtonText: {
    fontSize: 12,
    fontWeight: '500',
    color: colors.text,
  },
  amountButtonTextSelected: {
    color: colors.white,
  },
  bottomContainer: {
    padding: spacing.xl,
    backgroundColor: colors.background,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  createButton: {
    backgroundColor: colors.primary,
    borderRadius: borderRadius.medium,
    paddingVertical: spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
  },
  createButtonDisabled: {
    backgroundColor: colors.border,
  },
  createButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.white,
  },
  bottomPadding: {
    height: 50,
  },
  successOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  successContainer: {
    backgroundColor: colors.background,
    borderRadius: borderRadius.large,
    padding: spacing.xl,
    alignItems: 'center',
    marginHorizontal: spacing.xl,
    ...shadows.large,
  },
  successText: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.primary,
    textAlign: 'center',
    marginTop: spacing.md,
  },
  successSubtext: {
    fontSize: 14,
    color: colors.secondaryText,
    textAlign: 'center',
    marginTop: spacing.xs,
  },
});

export default CreateVirtualCardScreen;
