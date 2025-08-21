import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { CreditCard, Trash2, Plus, ChevronLeft, Star } from 'lucide-react-native';
import { colors, spacing, typography, borderRadius, shadows, iconSizes } from '../theme';
import DeleteCardModal from '../components/DeleteCardModal';
import PaymentMethodService, { PaymentMethod } from '../services/PaymentMethodService';

const PaymentMethodsScreen: React.FC = () => {
  const navigation = useNavigation();
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedMethod, setSelectedMethod] = useState<PaymentMethod | null>(null);

  // Load payment methods from service
  const loadPaymentMethods = async (showRefresh = false) => {
    try {
      if (showRefresh) {
        setIsRefreshing(true);
      } else {
        setIsLoading(true);
      }

      const methods = await PaymentMethodService.getPaymentMethods();
      setPaymentMethods(methods);
    } catch (error) {
      console.error('Error loading payment methods:', error);
      Alert.alert('Error', 'Failed to load payment methods');
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  // Reload when screen comes into focus
  useFocusEffect(
    useCallback(() => {
      loadPaymentMethods();
    }, [])
  );

  // Pull to refresh
  const handleRefresh = () => {
    loadPaymentMethods(true);
  };

  const handleDeleteMethod = async (method: PaymentMethod) => {
    setSelectedMethod(method);
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    if (!selectedMethod) return;

    try {
      await PaymentMethodService.deletePaymentMethod(selectedMethod.id);
      await loadPaymentMethods(); // Reload after deletion
      setShowDeleteModal(false);
      setSelectedMethod(null);
      
      Alert.alert('Success', 'Payment method deleted successfully');
    } catch (error) {
      console.error('Error deleting payment method:', error);
      Alert.alert('Error', 'Failed to delete payment method');
    }
  };

  const handleSetDefault = async (method: PaymentMethod) => {
    try {
      await PaymentMethodService.setDefaultPaymentMethod(method.id);
      await loadPaymentMethods(); // Reload to show updated default
      Alert.alert('Success', 'Default payment method updated');
    } catch (error) {
      console.error('Error setting default payment method:', error);
      Alert.alert('Error', 'Failed to update default payment method');
    }
  };

  const renderPaymentMethod = (method: PaymentMethod) => (
    <View key={method.id} style={styles.methodCard}>
      <View style={styles.methodInfo}>
        <View style={styles.iconContainer}>
          <CreditCard size={24} color={colors.primary} />
          {method.isDefault && (
            <View style={styles.defaultBadge}>
              <Star size={12} color={colors.white} fill={colors.primary} />
            </View>
          )}
        </View>
        <View style={styles.methodDetails}>
          <View style={styles.methodHeader}>
            <Text style={styles.methodName}>{method.nickname}</Text>
            {method.isDefault && (
              <Text style={styles.defaultText}>Default</Text>
            )}
          </View>
          <Text style={styles.methodNumber}>
            {PaymentMethodService.formatDisplayText(method)}
          </Text>
          {method.lastUsed && (
            <Text style={styles.lastUsedText}>
              Last used: {new Date(method.lastUsed).toLocaleDateString()}
            </Text>
          )}
        </View>
      </View>
      <View style={styles.methodActions}>
        {!method.isDefault && (
          <TouchableOpacity
            style={styles.setDefaultButton}
            onPress={() => handleSetDefault(method)}
          >
            <Text style={styles.setDefaultText}>Set Default</Text>
          </TouchableOpacity>
        )}
        <TouchableOpacity
          style={styles.deleteButton}
          onPress={() => handleDeleteMethod(method)}
        >
          <Trash2 size={20} color={colors.error} />
        </TouchableOpacity>
      </View>
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
        <ScrollView 
          contentContainerStyle={styles.content}
          refreshControl={
            <RefreshControl
              refreshing={isRefreshing}
              onRefresh={handleRefresh}
              colors={[colors.primary]}
            />
          }
        >
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
    backgroundColor: colors.background,
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
    backgroundColor: colors.background,
    borderRadius: borderRadius.medium,
    padding: spacing.lg,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: colors.border,
  },
  methodInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: spacing.md,
  },
  iconContainer: {
    position: 'relative',
  },
  defaultBadge: {
    position: 'absolute',
    top: -4,
    right: -4,
    backgroundColor: colors.primary,
    borderRadius: 8,
    width: 16,
    height: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  methodDetails: {
    flex: 1,
    gap: spacing.xs,
  },
  methodHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  defaultText: {
    ...typography.caption,
    color: colors.primary,
    fontWeight: '600',
  },
  lastUsedText: {
    ...typography.caption,
    color: colors.secondaryText,
    fontSize: 12,
  },
  methodActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  setDefaultButton: {
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.sm,
    backgroundColor: colors.primaryTransparent,
    borderRadius: borderRadius.small,
  },
  setDefaultText: {
    ...typography.caption,
    color: colors.primary,
    fontWeight: '600',
    fontSize: 12,
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
