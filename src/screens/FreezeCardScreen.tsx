import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  Alert,
  Animated,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import {
  ChevronLeft,
  Snowflake,
  Shield,
  AlertTriangle,
  CreditCard,
  CheckCircle,
} from 'lucide-react-native';
import { colors, spacing, borderRadius, shadows } from '../theme';

const FreezeCardScreen: React.FC = () => {
  const navigation = useNavigation();
  const [selectedReason, setSelectedReason] = useState<string | null>(null);
  const [showSuccess, setShowSuccess] = useState(false);
  
  // Animation refs
  const successScale = useRef(new Animated.Value(0)).current;
  const successOpacity = useRef(new Animated.Value(0)).current;
  
  const reasons = [
    { id: 'security', label: 'Security Concern', icon: Shield },
    { id: 'lost', label: 'Card Lost/Stolen', icon: AlertTriangle },
    { id: 'temporary', label: 'Temporary Block', icon: Snowflake },
  ];

  const handleFreezeCard = async () => {
    if (!selectedReason) {
      Alert.alert('Select Reason', 'Please select a reason for freezing your card');
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
          <Text style={styles.headerTitle}>Freeze Card</Text>
          <View style={styles.placeholder} />
        </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Card Preview */}
        <View style={styles.cardSection}>
          <View style={styles.virtualCard}>
            <View style={styles.cardHeader}>
              <Text style={styles.cardName}>Virtual Card</Text>
              <CreditCard size={24} color={colors.white} />
            </View>

            <View style={styles.cardNumber}>
              <Text style={styles.cardNumberText}>•••• •••• •••• 9012</Text>
            </View>

            <View style={styles.cardDetails}>
              <View>
                <Text style={styles.cardLabel}>BALANCE</Text>
                <Text style={styles.balanceAmount}>₦25,000</Text>
              </View>
              <View style={styles.cardStatus}>
                <Text style={styles.cardLabel}>STATUS</Text>
                <Text style={styles.statusText}>Active</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Info Section */}
        <View style={styles.infoSection}>
          <View style={styles.infoCard}>
            <Snowflake size={24} color={colors.primary} />
            <Text style={styles.infoTitle}>Freeze Your Card</Text>
            <Text style={styles.infoText}>
              Temporarily disable your card to prevent unauthorized transactions. 
              You can unfreeze it anytime from this screen.
            </Text>
          </View>
        </View>

        {/* Reason Selection */}
        <View style={styles.reasonSection}>
          <Text style={styles.sectionTitle}>Select Reason</Text>
          
          {reasons.map((reason) => {
            const IconComponent = reason.icon;
            const isSelected = selectedReason === reason.id;
            
            return (
              <TouchableOpacity
                key={reason.id}
                style={[
                  styles.reasonOption,
                  isSelected && styles.reasonOptionSelected
                ]}
                onPress={() => setSelectedReason(reason.id)}
              >
                <View style={[
                  styles.reasonIcon,
                  isSelected && styles.reasonIconSelected
                ]}>
                  <IconComponent 
                    size={20} 
                    color={isSelected ? colors.white : colors.primary} 
                  />
                </View>
                <Text style={[
                  styles.reasonText,
                  isSelected && styles.reasonTextSelected
                ]}>
                  {reason.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        <View style={styles.bottomPadding} />
      </ScrollView>

      {/* Freeze Button */}
      <View style={styles.bottomContainer}>
        <TouchableOpacity
          style={[
            styles.freezeButton,
            !selectedReason && styles.freezeButtonDisabled
          ]}
          onPress={handleFreezeCard}
          disabled={!selectedReason}
        >
          <Snowflake size={20} color={colors.white} />
          <Text style={styles.freezeButtonText}>Freeze Card</Text>
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
            <Text style={styles.successText}>Card Frozen Successfully!</Text>
            <Text style={styles.successSubtext}>
              Your virtual card has been temporarily frozen for security
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
  cardStatus: {
    alignItems: 'flex-end',
  },
  balanceAmount: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.white,
  },
  statusText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#4CAF50',
  },
  infoSection: {
    paddingHorizontal: spacing.xl,
    marginBottom: spacing.lg,
  },
  infoCard: {
    backgroundColor: colors.background,
    borderRadius: borderRadius.medium,
    padding: spacing.lg,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
  },
  infoTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
    marginTop: spacing.sm,
    marginBottom: spacing.xs,
  },
  infoText: {
    fontSize: 14,
    color: colors.secondaryText,
    textAlign: 'center',
    lineHeight: 20,
  },
  reasonSection: {
    paddingHorizontal: spacing.xl,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginBottom: spacing.md,
  },
  reasonOption: {
    backgroundColor: colors.background,
    borderRadius: borderRadius.medium,
    padding: spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.sm,
    borderWidth: 2,
    borderColor: colors.border,
  },
  reasonOptionSelected: {
    backgroundColor: '#F0F9FF',
    borderColor: colors.primary,
  },
  reasonIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.background,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
    borderWidth: 1,
    borderColor: colors.primary,
  },
  reasonIconSelected: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  reasonText: {
    fontSize: 16,
    fontWeight: '500',
    color: colors.text,
    flex: 1,
  },
  reasonTextSelected: {
    color: colors.primary,
    fontWeight: '600',
  },
  bottomContainer: {
    padding: spacing.xl,
    backgroundColor: colors.background,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  freezeButton: {
    backgroundColor: '#FF6B6B',
    borderRadius: borderRadius.medium,
    paddingVertical: spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
  },
  freezeButtonDisabled: {
    backgroundColor: colors.border,
  },
  freezeButtonText: {
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
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000,
  },
  successContainer: {
    backgroundColor: colors.background,
    borderRadius: 20,
    padding: 32,
    alignItems: 'center',
    marginHorizontal: 40,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 10,
    },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 10,
  },
  successText: {
    fontSize: 20,
    fontWeight: '600',
    color: colors.text,
    marginTop: 16,
    marginBottom: 8,
    textAlign: 'center',
  },
  successSubtext: {
    fontSize: 14,
    color: colors.secondaryText,
    textAlign: 'center',
    lineHeight: 20,
  },
});

export default FreezeCardScreen;
