import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { CreditCard, Trash2, Plus, ChevronLeft } from 'lucide-react-native';
import { colors, spacing, typography, borderRadius, shadows, iconSizes } from '../theme';
import DeleteCardModal from '../components/DeleteCardModal';

export interface PaymentMethod {
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

const PaymentMethodsScreen: React.FC = () => {
  const navigation = useNavigation();
  const [isLoading, setIsLoading] = useState(true);
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedMethod, setSelectedMethod] = useState<PaymentMethod | null>(null);

  // Load payment methods from AsyncStorage on mount
  useEffect(() => {
    const loadPaymentMethods = async () => {
      try {
        const savedMethods = await AsyncStorage.getItem('paymentMethods');
        if (savedMethods) {
          try {
            const parsedMethods = JSON.parse(savedMethods);
            if (Array.isArray(parsedMethods)) {
              setPaymentMethods(parsedMethods);
            } else {
              console.error('Saved payment methods is not an array');
              setPaymentMethods([]);
            }
          } catch (parseError) {
            console.error('Error parsing payment methods:', parseError);
            setPaymentMethods([]);
          }
        }
      } catch (error) {
        console.error('Error loading payment methods:', error);
        Alert.alert('Error', 'Failed to load payment methods');
      } finally {
        setIsLoading(false);
      }
    };

    loadPaymentMethods();
  }, []);

  // Save payment methods whenever they change
  useEffect(() => {
    const savePaymentMethods = async () => {
      try {
        await AsyncStorage.setItem('paymentMethods', JSON.stringify(paymentMethods));
      } catch (error) {
        console.error('Error saving payment methods:', error);
        Alert.alert('Error', 'Failed to save payment methods');
      }
    };

    savePaymentMethods();
  }, [paymentMethods]);

  const handleDeleteMethod = async (method: PaymentMethod) => {
    setSelectedMethod(method);
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    if (!selectedMethod) return;

    try {
      const updatedMethods = paymentMethods.filter(method => method.id !== selectedMethod.id);
      setPaymentMethods(updatedMethods);
      setShowDeleteModal(false);
      setSelectedMethod(null);
    } catch (error) {
      console.error('Error deleting payment method:', error);
      Alert.alert('Error', 'Failed to delete payment method');
    }
  };

  const renderPaymentMethod = (method: PaymentMethod) => (
    <View key={method.id} style={styles.methodCard}>
      <View style={styles.methodInfo}>
        <CreditCard size={24} color={colors.primary} />
        <View style={styles.methodDetails}>
          <Text style={styles.methodName}>{method.nickname}</Text>
          <Text style={styles.methodNumber}>
            {method.type === 'card' 
              ? `Card ending in ${method.cardNumber?.slice(-4)}`
              : `Account ending in ${method.accountNumber?.slice(-4)}`
            }
          </Text>
        </View>
      </View>
      <TouchableOpacity
        style={styles.deleteButton}
        onPress={() => handleDeleteMethod(method)}
      >
        <Trash2 size={20} color={colors.error} />
      </TouchableOpacity>
    </View>
  );

  const handleAddPaymentMethod = () => {
    navigation.navigate('AddPaymentMethod');
  };

  const handleBack = () => {
    navigation.goBack();
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={handleBack} style={styles.backButton}>
          <ChevronLeft size={iconSizes.sm} color={colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Payment Methods</Text>
        <TouchableOpacity onPress={handleAddPaymentMethod} style={styles.addButton}>
          <Plus size={iconSizes.sm} color={colors.text} />
        </TouchableOpacity>
      </View>

      {isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      ) : (
        <ScrollView contentContainerStyle={styles.content}>
          {paymentMethods.length > 0 ? (
            <View style={styles.methodsList}>
              {paymentMethods.map(renderPaymentMethod)}
            </View>
          ) : (
            <View style={styles.emptyState}>
              <Text style={styles.emptyTitle}>No Payment Methods</Text>
              <Text style={styles.emptyText}>
                Add a card or bank account to get started
              </Text>
              <TouchableOpacity 
                style={styles.addPaymentButton}
                onPress={handleAddPaymentMethod}
              >
                <Plus size={iconSizes.sm} color={colors.white} />
                <Text style={styles.addPaymentButtonText}>Add Payment Method</Text>
              </TouchableOpacity>
            </View>
          )}
        </ScrollView>
      )}

      <DeleteCardModal
        visible={showDeleteModal}
        onClose={() => {
          setShowDeleteModal(false);
          setSelectedMethod(null);
        }}
        cardId={selectedMethod?.id || ''}
        cardNickname={selectedMethod?.nickname || ''}
        onPinRequired={() => {
          confirmDelete();
          setShowDeleteModal(false);
        }}
      />
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
    padding: spacing.lg,
    backgroundColor: colors.white,
    ...shadows.small,
  },
  headerTitle: {
    ...typography.h3,
    color: colors.text,
  },
  backButton: {
    padding: spacing.sm,
    borderRadius: borderRadius.small,
  },
  addButton: {
    padding: spacing.sm,
    borderRadius: borderRadius.small,
  },
  content: {
    padding: spacing.lg,
    flexGrow: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  methodsList: {
    gap: spacing.md,
  },
  addPaymentButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.primary,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.xl,
    borderRadius: borderRadius.medium,
    marginTop: spacing.xl,
    ...shadows.small,
  },
  addPaymentButtonText: {
    ...typography.body,
    color: colors.white,
    marginLeft: spacing.sm,
    fontWeight: '600',
  },
  methodCard: {
    backgroundColor: colors.white,
    borderRadius: borderRadius.medium,
    padding: spacing.lg,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    ...shadows.medium,
  },
  methodInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  methodDetails: {
    gap: spacing.xs,
  },
  methodName: {
    ...typography.h3,
    color: colors.text,
  },
  methodNumber: {
    ...typography.caption,
    color: colors.secondaryText,
  },
  deleteButton: {
    padding: spacing.sm,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: spacing.md,
  },
  emptyTitle: {
    ...typography.h3,
    color: colors.text,
  },
  emptyText: {
    ...typography.caption,
    color: colors.secondaryText,
    textAlign: 'center',
  },
});

export default PaymentMethodsScreen;
