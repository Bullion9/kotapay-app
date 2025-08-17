import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  Animated,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import {
  ChevronLeft,
  Shield,
  RefreshCw,
  Briefcase,
  Calendar,
  Search,
  CheckCircle,
} from 'lucide-react-native';
import { colors, spacing, borderRadius, shadows, globalStyles } from '../theme';
import PinEntryModal from '../components/PinEntryModal';

type RootStackParamList = {
  VirtualCardDetailScreen: { cardId: string };
};

type NavigationProp = StackNavigationProp<RootStackParamList>;

interface CardType {
  id: 'single-use' | 'recurring' | 'multi-use';
  title: string;
  description: string;
  icon: React.ComponentType<any>;
  color: string;
}

interface Merchant {
  id: string;
  name: string;
  category: string;
}

const CreateVirtualCardScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProp>();
  
  // Step management
  const [currentStep, setCurrentStep] = useState<1 | 2 | 3>(1);
  
  // Form data
  const [selectedCardType, setSelectedCardType] = useState<CardType | null>(null);
  const [spendLimit, setSpendLimit] = useState(50000); // Default ₦50,000
  const [validityMonths, setValidityMonths] = useState(6); // Default 6 months
  const [selectedMerchant, setSelectedMerchant] = useState<Merchant | null>(null);
  const [merchantSearch, setMerchantSearch] = useState('');
  const [showMerchantDropdown, setShowMerchantDropdown] = useState(false);
  
  // Focus states
  const [isAmountFocused, setIsAmountFocused] = useState(false);
  const [isMerchantFocused, setIsMerchantFocused] = useState(false);
  
  // States
  const [loading, setLoading] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [showPinModal, setShowPinModal] = useState(false);
  
  // Animation
  const successScale = useRef(new Animated.Value(0)).current;
  const successOpacity = useRef(new Animated.Value(0)).current;
  
  // Mock user tier limit (this would come from user context)
  const userTierLimit = 500000; // ₦500,000
  
  // Card types
  const cardTypes: CardType[] = [
    {
      id: 'single-use',
      title: 'Single-use Card',
      description: 'Perfect for one-time purchases with automatic expiry',
      icon: Shield,
      color: '#06402B',
    },
    {
      id: 'recurring',
      title: 'Recurring Subscription',
      description: 'Ideal for monthly subscriptions and recurring payments',
      icon: RefreshCw,
      color: '#A8E4A0',
    },
    {
      id: 'multi-use',
      title: 'Multi-use Budget',
      description: 'Flexible card for multiple transactions within budget',
      icon: Briefcase,
      color: '#000d10',
    },
  ];
  
  // Mock merchants
  const merchants: Merchant[] = [
    { id: '1', name: 'Netflix', category: 'Entertainment' },
    { id: '2', name: 'Spotify', category: 'Music' },
    { id: '3', name: 'Amazon', category: 'E-commerce' },
    { id: '4', name: 'Uber', category: 'Transportation' },
    { id: '5', name: 'Jumia', category: 'E-commerce' },
    { id: '6', name: 'DStv', category: 'Entertainment' },
  ];
  
  const filteredMerchants = merchants.filter(merchant =>
    merchant.name.toLowerCase().includes(merchantSearch.toLowerCase())
  );
  
  // Generate mock card details
  const generateCardDetails = () => {
    const pan = `4532 ${Math.random().toString().slice(2, 6)} ${Math.random().toString().slice(2, 6)} ${Math.random().toString().slice(2, 6)}`;
    const cvv = Math.random().toString().slice(2, 5);
    const expiryDate = new Date();
    expiryDate.setMonth(expiryDate.getMonth() + validityMonths);
    const expiry = `${String(expiryDate.getMonth() + 1).padStart(2, '0')}/${String(expiryDate.getFullYear()).slice(-2)}`;
    
    return { pan, cvv, expiry };
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
  
  const handleCreateCard = async () => {
    if (!selectedCardType) return;
    
    // Show PIN modal for verification
    setShowPinModal(true);
  };

  const handlePinVerified = async () => {
    setShowPinModal(false);
    setLoading(true);
    
    try {
      // Mock API call to Appwrite function
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Show success animation
      showSuccessAnimation();
      
      // Navigate after animation
      setTimeout(() => {
        setShowSuccess(false);
        navigation.navigate('VirtualCardDetailScreen', { cardId: 'new-card-id' });
      }, 2000);
      
    } catch (err) {
      console.error('Failed to create card:', err);
      Alert.alert('Error', 'Failed to create virtual card. Please try again.');
    } finally {
      setLoading(false);
    }
  };
  
  const renderStepIndicator = () => (
    <View style={styles.stepIndicator}>
      {[1, 2, 3].map((step) => (
        <View key={step} style={styles.stepContainer}>
          <View style={[
            styles.stepCircle,
            currentStep >= step && styles.stepCircleActive
          ]}>
            <Text style={[
              styles.stepNumber,
              currentStep >= step && styles.stepNumberActive
            ]}>
              {step}
            </Text>
          </View>
          {step < 3 && (
            <View style={[
              styles.stepLine,
              currentStep > step && styles.stepLineActive
            ]} />
          )}
        </View>
      ))}
    </View>
  );
  
  const renderStep1 = () => (
    <View style={styles.stepContent}>
      <Text style={styles.stepTitle}>Choose Card Type</Text>
      <Text style={styles.stepSubtitle}>Select the type of virtual card you need</Text>
      
      <View style={styles.cardTypesContainer}>
        {cardTypes.map((cardType) => {
          const IconComponent = cardType.icon;
          const isSelected = selectedCardType?.id === cardType.id;
          
          return (
            <TouchableOpacity
              key={cardType.id}
              style={[
                styles.cardTypeOption,
                isSelected && styles.cardTypeOptionSelected,
                { borderColor: isSelected ? cardType.color : colors.border }
              ]}
              onPress={() => setSelectedCardType(cardType)}
            >
              <View style={[styles.cardTypeIcon, { backgroundColor: cardType.color }]}>
                <IconComponent size={24} color={colors.white} />
              </View>
              <View style={styles.cardTypeContent}>
                <Text style={styles.cardTypeTitle}>{cardType.title}</Text>
                <Text style={styles.cardTypeDescription}>{cardType.description}</Text>
              </View>
              {isSelected && (
                <CheckCircle size={20} color={cardType.color} />
              )}
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
  
  const renderStep2 = () => (
    <View style={styles.stepContent}>
      <Text style={styles.stepTitle}>Set Controls</Text>
      <Text style={styles.stepSubtitle}>Configure spending limits and validity</Text>
      
      {/* Spend Limit */}
      <View style={styles.controlSection}>
        <Text style={styles.controlLabel}>Spend Limit</Text>
        <Text style={styles.controlValue}>₦{spendLimit.toLocaleString()}</Text>
        
        <View style={styles.amountButtons}>
          {[50000, 100000, 200000, 500000].map((amount) => (
            <TouchableOpacity
              key={amount}
              style={[
                styles.amountButton,
                spendLimit === amount && styles.amountButtonSelected
              ]}
              onPress={() => setSpendLimit(amount)}
            >
              <Text style={[
                styles.amountButtonText,
                spendLimit === amount && styles.amountButtonTextSelected
              ]}>
                ₦{(amount / 1000)}k
              </Text>
            </TouchableOpacity>
          ))}
        </View>
        
        <TextInput
          style={[
            styles.customAmountInput,
            isAmountFocused && styles.customAmountInputFocused
          ]}
          placeholder="Enter custom amount"
          value={spendLimit.toString()}
          onChangeText={(text) => {
            const amount = parseInt(text.replace(/[^0-9]/g, '')) || 0;
            if (amount <= userTierLimit) {
              setSpendLimit(amount);
            }
          }}
          onFocus={() => setIsAmountFocused(true)}
          onBlur={() => setIsAmountFocused(false)}
          keyboardType="numeric"
        />
        
        <Text style={styles.limitNote}>
          Maximum allowed: ₦{userTierLimit.toLocaleString()}
        </Text>
      </View>
      
      {/* Validity Period */}
      <View style={styles.controlSection}>
        <Text style={styles.controlLabel}>Validity Period</Text>
        <View style={styles.validityOptions}>
          {[1, 3, 6, 12].map((months) => (
            <TouchableOpacity
              key={months}
              style={[
                styles.validityOption,
                validityMonths === months && styles.validityOptionSelected
              ]}
              onPress={() => setValidityMonths(months)}
            >
              <Calendar size={16} color={validityMonths === months ? colors.white : colors.secondaryText} />
              <Text style={[
                styles.validityOptionText,
                validityMonths === months && styles.validityOptionTextSelected
              ]}>
                {months} month{months > 1 ? 's' : ''}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>
      
      {/* Merchant Lock (Optional) */}
      <View style={styles.controlSection}>
        <Text style={styles.controlLabel}>Merchant Lock (Optional)</Text>
        <TouchableOpacity
          style={[
            styles.merchantSelector,
            isMerchantFocused && styles.merchantSelectorFocused
          ]}
          onPress={() => setShowMerchantDropdown(!showMerchantDropdown)}
        >
          <Search size={20} color={colors.secondaryText} />
          <TextInput
            style={styles.merchantInput}
            placeholder="Search merchant to lock card"
            value={selectedMerchant ? selectedMerchant.name : merchantSearch}
            onChangeText={setMerchantSearch}
            onFocus={() => {
              setIsMerchantFocused(true);
              setShowMerchantDropdown(true);
            }}
            onBlur={() => setIsMerchantFocused(false)}
          />
        </TouchableOpacity>
        
        {showMerchantDropdown && (
          <View style={styles.merchantDropdown}>
            {filteredMerchants.map((merchant) => (
              <TouchableOpacity
                key={merchant.id}
                style={styles.merchantOption}
                onPress={() => {
                  setSelectedMerchant(merchant);
                  setMerchantSearch('');
                  setShowMerchantDropdown(false);
                }}
              >
                <Text style={styles.merchantName}>{merchant.name}</Text>
                <Text style={styles.merchantCategory}>{merchant.category}</Text>
              </TouchableOpacity>
            ))}
          </View>
        )}
      </View>
    </View>
  );
  
  const renderStep3 = () => {
    const cardDetails = generateCardDetails();
    
    return (
      <View style={styles.stepContent}>
        <Text style={styles.stepTitle}>Review & Issue</Text>
        <Text style={styles.stepSubtitle}>Review your virtual card details</Text>
        
        {/* Card Preview */}
        <View style={[styles.cardPreview, { backgroundColor: selectedCardType?.color || '#06402B' }]}>
          <View style={styles.cardPreviewHeader}>
            <Text style={styles.cardPreviewType}>{selectedCardType?.title}</Text>
            <Text style={styles.cardPreviewBank}>KotaPay</Text>
          </View>
          
          <View style={styles.cardPreviewContent}>
            <Text style={styles.cardPreviewPAN}>{cardDetails.pan}</Text>
            
            <View style={styles.cardPreviewDetails}>
              <View>
                <Text style={styles.cardPreviewLabel}>EXPIRES</Text>
                <Text style={styles.cardPreviewValue}>{cardDetails.expiry}</Text>
              </View>
              <View>
                <Text style={styles.cardPreviewLabel}>CVV</Text>
                <Text style={styles.cardPreviewValue}>{cardDetails.cvv}</Text>
              </View>
            </View>
          </View>
        </View>
        
        {/* Summary */}
        <View style={styles.summaryCard}>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Spend Limit</Text>
            <Text style={styles.summaryValue}>₦{spendLimit.toLocaleString()}</Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Validity</Text>
            <Text style={styles.summaryValue}>{validityMonths} months</Text>
          </View>
          {selectedMerchant && (
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Merchant Lock</Text>
              <Text style={styles.summaryValue}>{selectedMerchant.name}</Text>
            </View>
          )}
        </View>
      </View>
    );
  };
  
  const canProceed = () => {
    switch (currentStep) {
      case 1:
        return selectedCardType !== null;
      case 2:
        return spendLimit > 0 && validityMonths > 0;
      case 3:
        return true;
      default:
        return false;
    }
  };
  
  const handleNext = () => {
    if (currentStep < 3) {
      setCurrentStep((currentStep + 1) as 1 | 2 | 3);
    } else {
      handleCreateCard();
    }
  };
  
  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep((currentStep - 1) as 1 | 2 | 3);
    } else {
      navigation.goBack();
    }
  };
  
  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={globalStyles.backButton} onPress={handleBack}>
          <ChevronLeft size={24} color={colors.primary} />
        </TouchableOpacity>
        <View style={styles.headerPlaceholder} />
        <Text style={styles.headerTitle}>Create Virtual Card</Text>
        <View style={styles.headerPlaceholder} />
      </View>
      
      {/* Step Indicator */}
      {renderStepIndicator()}
      
      {/* Content */}
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {currentStep === 1 && renderStep1()}
        {currentStep === 2 && renderStep2()}
        {currentStep === 3 && renderStep3()}
      </ScrollView>
      
      {/* Bottom Button */}
      <View style={styles.bottomContainer}>
        <TouchableOpacity
          style={[
            styles.nextButton,
            !canProceed() && styles.nextButtonDisabled,
            loading && styles.nextButtonDisabled
          ]}
          onPress={handleNext}
          disabled={!canProceed() || loading}
        >
          <Text style={styles.nextButtonText}>
            {currentStep === 3 ? (loading ? 'Creating...' : 'Create Card') : 'Next'}
          </Text>
        </TouchableOpacity>
      </View>
      
      {/* PIN Entry Modal */}
      <PinEntryModal
        visible={showPinModal}
        onClose={() => setShowPinModal(false)}
        onPinEntered={handlePinVerified}
        title="Verify PIN"
        subtitle="Enter your PIN to create virtual card"
        allowBiometric={true}
      />
      
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
            <CheckCircle size={60} color="#A8E4A0" />
            <Text style={styles.successText}>Card Created Successfully!</Text>
          </Animated.View>
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
    backgroundColor: '#FFF0F5',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.lg,
    paddingTop: spacing.xl,
  },
  backButton: {
    padding: 8,
  },
  headerPlaceholder: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000d10',
    textAlign: 'center',
  },
  stepIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.lg,
    paddingHorizontal: spacing.lg,
  },
  stepContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  stepCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepCircleActive: {
    backgroundColor: '#06402B',
  },
  stepNumber: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.secondaryText,
  },
  stepNumberActive: {
    color: colors.white,
  },
  stepLine: {
    width: 40,
    height: 2,
    backgroundColor: colors.border,
    marginHorizontal: spacing.sm,
  },
  stepLineActive: {
    backgroundColor: '#06402B',
  },
  content: {
    flex: 1,
    paddingHorizontal: spacing.lg,
  },
  stepContent: {
    paddingVertical: spacing.lg,
  },
  stepTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.text,
    marginBottom: spacing.xs,
  },
  stepSubtitle: {
    fontSize: 16,
    color: colors.secondaryText,
    marginBottom: spacing.xl,
  },
  cardTypesContainer: {
    gap: spacing.md,
  },
  cardTypeOption: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.lg,
    backgroundColor: colors.white,
    borderRadius: borderRadius.medium,
    borderWidth: 2,
    borderColor: colors.border,
    ...shadows.small,
  },
  cardTypeOptionSelected: {
    borderWidth: 2,
  },
  cardTypeIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  cardTypeContent: {
    flex: 1,
  },
  cardTypeTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 4,
  },
  cardTypeDescription: {
    fontSize: 14,
    color: colors.secondaryText,
  },
  controlSection: {
    marginBottom: spacing.xl,
  },
  controlLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginBottom: spacing.sm,
  },
  controlValue: {
    fontSize: 20,
    fontWeight: '700',
    color: '#06402B',
    marginBottom: spacing.md,
  },
  amountButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing.md,
  },
  amountButton: {
    flex: 1,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.xs,
    backgroundColor: colors.white,
    borderRadius: borderRadius.small,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    marginHorizontal: 2,
  },
  amountButtonSelected: {
    backgroundColor: '#06402B',
    borderColor: '#06402B',
  },
  amountButtonText: {
    fontSize: 12,
    fontWeight: '500',
    color: colors.text,
  },
  amountButtonTextSelected: {
    color: colors.white,
  },
  customAmountInput: {
    padding: spacing.md,
    backgroundColor: colors.white,
    borderRadius: borderRadius.medium,
    borderWidth: 1,
    borderColor: colors.border,
    fontSize: 16,
    color: colors.text,
    marginBottom: spacing.sm,
  },
  customAmountInputFocused: {
    borderColor: '#06402B',
    ...shadows.medium,
  },
  limitNote: {
    fontSize: 12,
    color: colors.secondaryText,
    fontStyle: 'italic',
  },
  validityOptions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  validityOption: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.sm,
    backgroundColor: colors.white,
    borderRadius: borderRadius.medium,
    borderWidth: 1,
    borderColor: colors.border,
    marginHorizontal: 2,
  },
  validityOptionSelected: {
    backgroundColor: '#06402B',
    borderColor: '#06402B',
  },
  validityOptionText: {
    fontSize: 12,
    fontWeight: '500',
    color: colors.text,
    marginLeft: 4,
  },
  validityOptionTextSelected: {
    color: colors.white,
  },
  slider: {
    width: '100%',
    height: 40,
  },
  sliderThumb: {
    backgroundColor: '#06402B',
    width: 20,
    height: 20,
  },
  sliderLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: spacing.xs,
  },
  sliderLabel: {
    fontSize: 12,
    color: colors.secondaryText,
  },
  validitySelector: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.md,
    backgroundColor: colors.white,
    borderRadius: borderRadius.medium,
    borderWidth: 1,
    borderColor: colors.border,
  },
  validityText: {
    flex: 1,
    fontSize: 16,
    color: colors.text,
    marginLeft: spacing.sm,
  },
  merchantSelector: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.md,
    backgroundColor: colors.white,
    borderRadius: borderRadius.medium,
    borderWidth: 1,
    borderColor: colors.border,
  },
  merchantSelectorFocused: {
    borderColor: '#06402B',
    ...shadows.medium,
  },
  merchantInput: {
    flex: 1,
    fontSize: 16,
    color: colors.text,
    marginLeft: spacing.sm,
  },
  merchantDropdown: {
    backgroundColor: colors.white,
    borderRadius: borderRadius.medium,
    borderWidth: 1,
    borderColor: colors.border,
    marginTop: spacing.xs,
    ...shadows.medium,
  },
  merchantOption: {
    padding: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  merchantName: {
    fontSize: 16,
    fontWeight: '500',
    color: colors.text,
  },
  merchantCategory: {
    fontSize: 12,
    color: colors.secondaryText,
    marginTop: 2,
  },
  cardPreview: {
    height: 200,
    borderRadius: borderRadius.large,
    padding: spacing.lg,
    marginBottom: spacing.xl,
    justifyContent: 'space-between',
    ...shadows.medium,
  },
  cardPreviewHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  cardPreviewType: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.white,
    opacity: 0.9,
  },
  cardPreviewBank: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.white,
  },
  cardPreviewContent: {
    justifyContent: 'flex-end',
  },
  cardPreviewPAN: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.white,
    marginBottom: spacing.lg,
    letterSpacing: 2,
  },
  cardPreviewDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  cardPreviewLabel: {
    fontSize: 10,
    fontWeight: '500',
    color: colors.white,
    opacity: 0.7,
    marginBottom: 4,
  },
  cardPreviewValue: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.white,
  },
  summaryCard: {
    backgroundColor: colors.white,
    borderRadius: borderRadius.medium,
    padding: spacing.lg,
    ...shadows.small,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  summaryLabel: {
    fontSize: 14,
    color: colors.secondaryText,
  },
  summaryValue: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
  },
  bottomContainer: {
    padding: spacing.lg,
    backgroundColor: colors.white,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  nextButton: {
    backgroundColor: '#06402B',
    borderRadius: borderRadius.medium,
    paddingVertical: spacing.md,
    alignItems: 'center',
  },
  nextButtonDisabled: {
    backgroundColor: colors.border,
  },
  nextButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.white,
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
    backgroundColor: colors.white,
    borderRadius: borderRadius.large,
    padding: spacing.xl,
    alignItems: 'center',
    marginHorizontal: spacing.xl,
  },
  successText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#06402B',
    textAlign: 'center',
    marginTop: spacing.md,
  },
});

export default CreateVirtualCardScreen;
