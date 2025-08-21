import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  Alert,
} from 'react-native';
import {
  CreditCard,
  Plus,
  Eye,
  EyeOff,
  Settings,
  Lock,
  MoreHorizontal,
  ChevronLeft,
} from 'lucide-react-native';
import { colors, spacing, typography, borderRadius, shadows, iconSizes, globalStyles } from '../theme';
import { useNavigation } from '@react-navigation/native';
import PinEntryModal from '../components/PinEntryModal';
import LoadingOverlay from '../components/LoadingOverlay';
import CardTransactionRow, { CardTransaction } from '../components/CardTransactionRow';
import { useLoading } from '../hooks/useLoading';

const CardScreen: React.FC = () => {
  const navigation = useNavigation();
  const [showCardNumber, setShowCardNumber] = React.useState(false);
  const [showBalance, setShowBalance] = React.useState(false);
  const [showPinModal, setShowPinModal] = React.useState(false);
  const [pinModalAction, setPinModalAction] = React.useState<'viewCard' | 'freezeCard' | 'addCard' | 'settings' | null>(null);

  // Loading state management
  const {
    isLoading,
    loadingState,
    loadingMessage,
    executeWithLoading,
  } = useLoading();

  const cards = [
    {
      id: '1',
      type: 'Virtual',
      last4: '4532',
      balance: 1234.56,
      isActive: true,
      color: '#06402B',
    },
    {
      id: '2',
      type: 'Physical',
      last4: '8901',
      balance: 567.89,
      isActive: false,
      color: '#000d10',
    },
  ];

  // Calculate total balance across all cards
  const totalBalance = cards.reduce((sum, card) => sum + card.balance, 0);

  // Mock transaction data
  const transactions: CardTransaction[] = [
    {
      id: '1',
      type: 'debit',
      amount: 25000,
      merchant: 'Amazon',
      date: '2025-08-19',
      category: 'Online Shopping',
      status: 'completed'
    },
    {
      id: '2',
      type: 'debit',
      amount: 15000,
      merchant: 'Shoprite',
      date: '2025-08-18',
      category: 'Groceries',
      status: 'completed'
    },
    {
      id: '3',
      type: 'credit',
      amount: 50000,
      merchant: 'Refund - Jumia',
      date: '2025-08-17',
      category: 'Refund',
      status: 'completed'
    },
    {
      id: '4',
      type: 'debit',
      amount: 5000,
      merchant: 'Netflix',
      date: '2025-08-16',
      category: 'Entertainment',
      status: 'pending'
    }
  ];

  const handlePinVerified = (pin: string) => {
    setShowPinModal(false);
    
    switch (pinModalAction) {
      case 'viewCard':
        setShowCardNumber(!showCardNumber);
        break;
      case 'freezeCard':
        Alert.alert(
          'Freeze Card',
          'Are you sure you want to freeze this card? You can unfreeze it later.',
          [
            { text: 'Cancel', style: 'cancel' },
            { text: 'Freeze', style: 'destructive', onPress: handleFreezeCard },
          ]
        );
        break;
      case 'addCard':
        handleAddCard();
        break;
      case 'settings':
        handleCardSettings();
        break;
    }
    setPinModalAction(null);
  };

  const requirePinForAction = (action: 'viewCard' | 'freezeCard' | 'addCard' | 'settings') => {
    setPinModalAction(action);
    setShowPinModal(true);
  };

  const toggleCardNumber = () => requirePinForAction('viewCard');

  const handleFreezeCard = async () => {
    try {
      await executeWithLoading(
        async () => {
          // Simulate API call to freeze card
          await new Promise<void>(resolve => setTimeout(resolve, 1500));
          
          Alert.alert('Success', 'Card has been frozen successfully');
        },
        {
          loading: 'Freezing card...',
          processing: 'Processing request...',
          confirming: 'Confirming changes...',
          success: 'Card frozen successfully!',
          error: 'Failed to freeze card',
        }
      );
    } catch (error) {
      console.error('Failed to freeze card:', error);
      Alert.alert('Error', 'Failed to freeze card. Please try again.');
    }
  };

  const handleAddCard = () => {
    Alert.alert('Add Card', 'Navigate to add new card screen');
    // Navigate to add card screen
  };

  const handleCardSettings = () => {
    Alert.alert('Card Settings', 'Navigate to card settings screen');
    // Navigate to card settings screen
  };

  const renderCard = (card: typeof cards[0]) => (
    <View key={card.id} style={[styles.card, { backgroundColor: card.color }]}>
      <View style={styles.cardHeader}>
        <Text style={styles.cardType}>{card.type} Card</Text>
        <TouchableOpacity onPress={toggleCardNumber}>
          {showCardNumber ? (
            <EyeOff size={iconSizes.sm} color={colors.white} />
          ) : (
            <Eye size={iconSizes.sm} color={colors.white} />
          )}
        </TouchableOpacity>
      </View>
      
      <View style={styles.cardBody}>
        <Text style={styles.cardNumber}>
          {showCardNumber ? `•••• •••• •••• ${card.last4}` : '•••• •••• •••• ••••'}
        </Text>
        <View style={styles.cardRow}>
          <View>
            <Text style={styles.cardLabel}>Balance</Text>
            <Text style={styles.cardBalance}>₦{card.balance.toFixed(2)}</Text>
          </View>
          <View style={styles.cardActions}>
            <TouchableOpacity style={styles.cardActionButton}>
              <Settings size={iconSizes.sm} color={colors.white} />
            </TouchableOpacity>
            <TouchableOpacity style={styles.cardActionButton}>
              <Lock size={iconSizes.sm} color={colors.white} />
            </TouchableOpacity>
            <TouchableOpacity style={styles.cardActionButton}>
              <MoreHorizontal size={iconSizes.sm} color={colors.white} />
            </TouchableOpacity>
          </View>
        </View>
      </View>
      
      <View style={styles.cardFooter}>
        <Text style={styles.cardStatus}>
          {card.isActive ? 'Active' : 'Inactive'}
        </Text>
        <View style={styles.cardLogo}>
          <CreditCard size={iconSizes.lg} color={colors.white} />
        </View>
      </View>
    </View>
  );

  const quickActions = [
    {
      title: 'Add Card',
      icon: Plus,
      color: '#06402B',
      onPress: () => requirePinForAction('addCard'),
    },
    {
      title: 'Freeze Card',
      icon: Lock,
      color: colors.error,
      onPress: () => requirePinForAction('freezeCard'),
    },
    {
      title: 'Card Settings',
      icon: Settings,
      color: '#000d10',
      onPress: () => requirePinForAction('settings'),
    },
  ];

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={globalStyles.backButton} onPress={() => navigation.goBack()}>
          <ChevronLeft size={24} color={colors.primary} />
        </TouchableOpacity>
        <View style={styles.headerPlaceholder} />
        <Text style={styles.headerTitle}>My Cards</Text>
        <View style={styles.headerPlaceholder} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Balance Card */}
        <View style={styles.balanceCard}>
          <View style={styles.balanceHeader}>
            <Text style={styles.balanceLabel}>Total Card Balance</Text>
            <TouchableOpacity onPress={() => setShowBalance(!showBalance)}>
              {showBalance ? (
                <EyeOff size={iconSizes.sm} color={colors.white} />
              ) : (
                <Eye size={iconSizes.sm} color={colors.white} />
              )}
            </TouchableOpacity>
          </View>
          <Text style={styles.balanceAmount}>
            {showBalance ? `₦${totalBalance.toFixed(2)}` : '••••••'}
          </Text>
          <Text style={styles.balanceSubtext}>
            Across {cards.length} cards
          </Text>
        </View>

        <View style={styles.content}>
          <Text style={styles.subtitle}>Manage your payment cards</Text>
        </View>

        <View style={styles.cardsContainer}>
          {cards.map(renderCard)}
        </View>

        <View style={styles.actionsContainer}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>
          <View style={styles.actionsGrid}>
            {quickActions.map((action, index) => (
              <TouchableOpacity key={index} style={styles.actionCard} onPress={action.onPress}>
                <View style={[styles.actionIcon, { backgroundColor: action.color }]}>
                  <action.icon size={iconSizes.lg} color={colors.white} />
                </View>
                <Text style={styles.actionTitle}>{action.title}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={styles.transactionContainer}>
          <Text style={styles.sectionTitle}>Transaction History</Text>
          <View style={styles.transactionCard}>
            {transactions.map((transaction) => (
              <CardTransactionRow key={transaction.id} transaction={transaction} />
            ))}
          </View>
        </View>
      </ScrollView>

      {/* PIN Entry Modal */}
      <PinEntryModal
        visible={showPinModal}
        onClose={() => {
          setShowPinModal(false);
          setPinModalAction(null);
        }}
        onPinEntered={handlePinVerified}
        title="Verify PIN"
        subtitle={
          pinModalAction === 'viewCard' ? 'Enter PIN to view card details' :
          pinModalAction === 'freezeCard' ? 'Enter PIN to freeze card' :
          pinModalAction === 'addCard' ? 'Enter PIN to add new card' :
          pinModalAction === 'settings' ? 'Enter PIN to access card settings' :
          'Enter your PIN to continue'
        }
        allowBiometric={true}
      />
      
      {/* Loading Overlay */}
      <LoadingOverlay
        visible={isLoading}
        type={loadingState}
        message={loadingMessage}
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
    backgroundColor: '#FFF0F5',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.lg,
    paddingTop: spacing.xl,
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
  // Balance Card Styles
  balanceCard: {
    marginHorizontal: spacing.xl,
    marginBottom: spacing.xl,
    padding: spacing.xl,
    borderRadius: borderRadius.xl,
    backgroundColor: colors.primary,
    ...shadows.medium,
  },
  balanceHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  balanceLabel: {
    fontSize: 14,
    color: colors.white,
    opacity: 0.8,
  },
  balanceAmount: {
    fontSize: 36,
    fontWeight: 'normal',
    color: colors.white,
    marginBottom: spacing.xs,
  },
  balanceSubtext: {
    fontSize: 12,
    color: colors.white,
    opacity: 0.7,
  },
  content: {
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.lg,
    paddingBottom: spacing.md,
  },
  subtitle: {
    ...typography.caption,
    color: colors.secondaryText,
    textAlign: 'center',
  },
  cardsContainer: {
    paddingHorizontal: spacing.xl,
    gap: spacing.lg,
  },
  card: {
    borderRadius: borderRadius.large,
    padding: spacing.xl,
    ...shadows.medium,
    minHeight: 200,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  cardType: {
    ...typography.body,
    color: colors.white,
    fontWeight: '600',
  },
  cardBody: {
    flex: 1,
  },
  cardNumber: {
    ...typography.h3,
    color: colors.white,
    letterSpacing: 2,
    marginBottom: spacing.lg,
  },
  cardRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
  },
  cardLabel: {
    ...typography.small,
    color: colors.white,
    opacity: 0.8,
    marginBottom: spacing.xs,
  },
  cardBalance: {
    ...typography.h3,
    color: colors.white,
    fontWeight: 'bold',
  },
  cardActions: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  cardActionButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: spacing.lg,
  },
  cardStatus: {
    ...typography.caption,
    color: colors.white,
    fontWeight: '600',
  },
  cardLogo: {
    opacity: 0.7,
  },
  actionsContainer: {
    padding: spacing.xl,
  },
  sectionTitle: {
    ...typography.h3,
    color: colors.text,
    marginBottom: spacing.lg,
  },
  actionsGrid: {
    flexDirection: 'row',
    gap: spacing.lg,
  },
  actionCard: {
    flex: 1,
    backgroundColor: colors.white,
    borderRadius: borderRadius.medium,
    padding: spacing.lg,
    alignItems: 'center',
    ...shadows.small,
    borderWidth: 1,
    borderColor: colors.border,
  },
  actionIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.md,
  },
  actionTitle: {
    ...typography.caption,
    color: colors.text,
    textAlign: 'center',
    fontWeight: '600',
  },
  transactionContainer: {
    padding: spacing.xl,
    paddingTop: 0,
  },
  transactionCard: {
    backgroundColor: colors.white,
    borderRadius: borderRadius.medium,
    padding: spacing.lg,
    ...shadows.small,
  },
});

export default CardScreen;
