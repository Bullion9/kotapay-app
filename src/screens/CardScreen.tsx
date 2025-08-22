import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  Alert,
  Modal,
} from 'react-native';
import {
  Plus,
  Eye,
  EyeOff,
  Copy,
  Settings,
  ChevronLeft,
  ArrowDownLeft,
  TrendingUp,
  ShoppingBag,
  ArrowUpRight,
  CreditCard,
  Lock,
  X,
  UserCheck,
  Bell,
  HelpCircle,
  FileText,
  Shield,
} from 'lucide-react-native';
import { colors, spacing, borderRadius, shadows } from '../theme';
import { useNavigation } from '@react-navigation/native';
import type { NavigationProp } from '@react-navigation/native';

type RootStackParamList = {
  VirtualCardHub: undefined;
  CreateVirtualCardScreen: undefined;
  VirtualCardDetailScreen: { cardId: string };
  ProfileMain: undefined;
  Notifications: undefined;
  SecuritySettings: undefined;
  HelpSupport: undefined;
  Settings: undefined;
  TermsPrivacy: undefined;
};

const CardScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();
  const [showCardNumber, setShowCardNumber] = useState(false);
  const [showSettingsModal, setShowSettingsModal] = useState(false);

  const currentCard = {
    id: '1',
    name: 'Virtual Card',
    type: 'Virtual',
    number: '4532 1234 5678 9012',
    cvv: '123',
    expiry: '12/27',
    balance: 25000.00,
    isActive: true,
    color: '#06402B',
  };

  // Recent transactions data - Simple merged transaction data
  const recentTransactions = [
    {
      id: '1',
      type: 'purchase',
      description: 'Amazon Online Purchase',
      amount: -2500,
      date: 'Today, 2:30 PM',
      icon: ShoppingBag,
      iconColor: '#000000',
    },
    {
      id: '2',
      type: 'topup',
      description: 'Card Top Up',
      amount: +10000,
      date: 'Yesterday, 4:15 PM',
      icon: TrendingUp,
      iconColor: '#000000',
    },
    {
      id: '3',
      type: 'purchase',
      description: 'Netflix Subscription',
      amount: -1200,
      date: '2 days ago, 6:00 PM',
      icon: ShoppingBag,
      iconColor: '#000000',
    },
    {
      id: '4',
      type: 'purchase',
      description: 'Spotify Premium',
      amount: -800,
      date: '3 days ago, 11:20 AM',
      icon: ShoppingBag,
      iconColor: '#000000',
    },
    {
      id: '5',
      type: 'purchase',
      description: 'Uber Ride',
      amount: -5500,
      date: '4 days ago, 9:45 AM',
      icon: ShoppingBag,
      iconColor: '#000000',
    },
    {
      id: '6',
      type: 'purchase',
      description: 'Coffee Shop',
      amount: -1800,
      date: '5 days ago, 7:30 AM',
      icon: ShoppingBag,
      iconColor: '#000000',
    },
  ];

  const handleCopyCardNumber = () => {
    Alert.alert('Copied!', 'Card number copied to clipboard');
  };

  const handleCreateCard = () => {
    navigation.navigate('CreateVirtualCardScreen');
  };

  const handleCardSettings = () => {
    setShowSettingsModal(true);
  };

  const handleSettingsOption = (option: string) => {
    setShowSettingsModal(false);
    
    switch (option) {
      case 'profile':
        navigation.navigate('ProfileMain');
        break;
      case 'notifications':
        navigation.navigate('Notifications');
        break;
      case 'security':
        navigation.navigate('SecuritySettings');
        break;
      case 'help':
        navigation.navigate('HelpSupport');
        break;
      case 'terms':
        navigation.navigate('TermsPrivacy');
        break;
      default:
        break;
    }
  };

  const handleTopUp = () => {
    navigation.navigate('TopUpVirtualCardScreen' as never);
  };

  const handleFreezeCard = () => {
    navigation.navigate('FreezeCardScreen' as never);
  };

  const handleWithdraw = () => {
    navigation.navigate('WithdrawCardScreen' as never);
  };

  const handleViewAllTransactions = () => {
    // Navigate to transaction history screen
    navigation.navigate('TransactionHistoryScreen' as never, { cardId: currentCard.id });
  };

  const handleTransactionPress = (transactionId: string) => {
    // Navigate to transaction details or show transaction modal
    Alert.alert(
      'Transaction Details',
      `View details for transaction ID: ${transactionId}`,
      [
        { text: 'View Receipt', onPress: () => console.log('View receipt for:', transactionId) },
        { text: 'OK', style: 'default' }
      ]
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton} 
          onPress={() => navigation.goBack()}
        >
          <ChevronLeft size={24} color={colors.primary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Virtual Cards</Text>
        <TouchableOpacity 
          style={styles.settingsButton}
          onPress={handleCardSettings}
        >
          <Settings size={24} color={colors.primary} />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Card Display */}
        <View style={styles.cardSection}>
          <View style={[styles.virtualCard, { backgroundColor: currentCard.color }]}>
            <View style={styles.cardHeader}>
              <Text style={styles.cardName}>{currentCard.name}</Text>
              <TouchableOpacity
                onPress={() => setShowCardNumber(!showCardNumber)}
                style={styles.eyeButton}
              >
                {showCardNumber ? (
                  <EyeOff size={20} color={colors.white} />
                ) : (
                  <Eye size={20} color={colors.white} />
                )}
              </TouchableOpacity>
            </View>

            <View style={styles.cardNumber}>
              <Text style={styles.cardNumberText}>
                {showCardNumber ? currentCard.number : '•••• •••• •••• ••••'}
              </Text>
              <TouchableOpacity 
                onPress={handleCopyCardNumber}
                style={styles.copyButton}
              >
                <Copy size={16} color={colors.white} />
              </TouchableOpacity>
            </View>

            <View style={styles.cardDetails}>
              <View>
                <Text style={styles.cardLabel}>VALID THRU</Text>
                <Text style={styles.cardValue}>{currentCard.expiry}</Text>
              </View>
              <View>
                <Text style={styles.cardLabel}>CVV</Text>
                <Text style={styles.cardValue}>
                  {showCardNumber ? currentCard.cvv : '•••'}
                </Text>
              </View>
              <View style={styles.cardBalance}>
                <Text style={styles.cardLabel}>BALANCE</Text>
                <Text style={styles.balanceAmount}>₦{currentCard.balance.toLocaleString()}</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Quick Actions */}
        <View style={styles.actionsSection}>
          <View style={styles.actionsGrid}>
            <TouchableOpacity 
              style={styles.actionCard}
              onPress={handleCreateCard}
            >
              <View style={[styles.actionIcon, { backgroundColor: '#FFFFFF' }]}>
                <Plus size={22} color="#000000" />
              </View>
              <Text style={styles.actionLabel}>Create</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.actionCard}
              onPress={handleTopUp}
            >
              <View style={[styles.actionIcon, { backgroundColor: '#FFFFFF' }]}>
                <CreditCard size={22} color="#000000" />
              </View>
              <Text style={styles.actionLabel}>Top Up</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.actionCard}
              onPress={handleFreezeCard}
            >
              <View style={[styles.actionIcon, { backgroundColor: '#FFFFFF' }]}>
                <Lock size={22} color="#000000" />
              </View>
              <Text style={styles.actionLabel}>Freeze</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.actionCard}
              onPress={handleWithdraw}
            >
              <View style={[styles.actionIcon, { backgroundColor: '#FFFFFF' }]}>
                <ArrowDownLeft size={22} color="#000000" />
              </View>
              <Text style={styles.actionLabel}>Withdraw</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Recent Transactions - Profile Card Style */}
        <View style={styles.transactionsSection}>
          <Text style={styles.sectionTitle}>Recent Transactions</Text>
          <View style={styles.card}>
            {recentTransactions.map((transaction) => {
              const IconComponent = transaction.icon;
              return (
                <TouchableOpacity 
                  key={transaction.id} 
                  style={styles.listItem}
                  onPress={() => handleTransactionPress(transaction.id)}
                  activeOpacity={0.7}
                >
                  <View style={styles.itemLeft}>
                    <View style={[styles.iconContainer, { backgroundColor: '#FFFFFF' }]}>
                      <IconComponent size={20} color={transaction.iconColor} />
                    </View>
                    <View style={styles.itemText}>
                      <Text style={styles.itemTitle}>{transaction.description}</Text>
                      <Text style={styles.itemSubtitle}>{transaction.date}</Text>
                    </View>
                  </View>
                  <Text style={[
                    styles.transactionAmount,
                    { color: transaction.amount > 0 ? '#4CAF50' : '#FF6B6B' }
                  ]}>
                    {transaction.amount > 0 ? '+' : ''}₦{Math.abs(transaction.amount).toLocaleString()}
                  </Text>
                </TouchableOpacity>
              );
            })}
            
            {/* View All Transactions Button */}
            <TouchableOpacity 
              style={styles.viewAllButton}
              onPress={handleViewAllTransactions}
              activeOpacity={0.7}
            >
              <Text style={styles.viewAllText}>View All Transactions</Text>
              <ArrowUpRight size={16} color={colors.primary} />
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.bottomPadding} />
      </ScrollView>

      {/* Settings Modal */}
      <Modal
        visible={showSettingsModal}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowSettingsModal(false)}
      >
        <TouchableOpacity 
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setShowSettingsModal(false)}
        >
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Settings</Text>
              <TouchableOpacity 
                onPress={() => setShowSettingsModal(false)}
                style={styles.closeButton}
              >
                <X size={24} color="#666" />
              </TouchableOpacity>
            </View>

            <View style={styles.settingsList}>
              <TouchableOpacity 
                style={styles.settingsItem}
                onPress={() => handleSettingsOption('profile')}
              >
                <UserCheck size={20} color="#06402B" />
                <Text style={styles.settingsText}>Profile Settings</Text>
                <ArrowUpRight size={16} color="#A3AABE" />
              </TouchableOpacity>

              <TouchableOpacity 
                style={styles.settingsItem}
                onPress={() => handleSettingsOption('notifications')}
              >
                <Bell size={20} color="#06402B" />
                <Text style={styles.settingsText}>Notifications</Text>
                <ArrowUpRight size={16} color="#A3AABE" />
              </TouchableOpacity>

              <TouchableOpacity 
                style={styles.settingsItem}
                onPress={() => handleSettingsOption('security')}
              >
                <Shield size={20} color="#06402B" />
                <Text style={styles.settingsText}>Security & Privacy</Text>
                <ArrowUpRight size={16} color="#A3AABE" />
              </TouchableOpacity>

              <TouchableOpacity 
                style={styles.settingsItem}
                onPress={() => handleSettingsOption('help')}
              >
                <HelpCircle size={20} color="#06402B" />
                <Text style={styles.settingsText}>Help & Support</Text>
                <ArrowUpRight size={16} color="#A3AABE" />
              </TouchableOpacity>

              <TouchableOpacity 
                style={styles.settingsItem}
                onPress={() => handleSettingsOption('terms')}
              >
                <FileText size={20} color="#06402B" />
                <Text style={styles.settingsText}>Terms & Privacy</Text>
                <ArrowUpRight size={16} color="#A3AABE" />
              </TouchableOpacity>
            </View>
          </View>
        </TouchableOpacity>
      </Modal>
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
  settingsButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.background,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: colors.border,
  },
  content: {
    flex: 1,
  },
  cardSection: {
    padding: spacing.xl,
  },
  virtualCard: {
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
  eyeButton: {
    padding: spacing.sm,
  },
  cardNumber: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.xl,
  },
  cardNumberText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.white,
    letterSpacing: 2,
  },
  copyButton: {
    padding: spacing.sm,
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
  actionsSection: {
    paddingHorizontal: spacing.xl,
    marginBottom: spacing.xl,
  },
  actionsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: spacing.sm,
  },
  actionCard: {
    flex: 1,
    backgroundColor: 'transparent',
    padding: spacing.md,
    alignItems: 'center',
  },
  actionIcon: {
    width: 50,
    height: 50,
    borderRadius: 25,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.xs,
    borderWidth: 1,
    borderColor: '#E5E5E5',
  },
  actionLabel: {
    fontSize: 11,
    fontWeight: '500',
    color: colors.text,
    textAlign: 'center',
  },
  transactionsSection: {
    paddingHorizontal: spacing.xl,
    marginBottom: spacing.xl,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
    marginBottom: spacing.md,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#06402B',
    marginBottom: 16,
  },
  listItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F5F5F5',
    minHeight: 60,
  },
  itemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  itemText: {
    flex: 1,
  },
  itemTitle: {
    fontSize: 14,
    fontWeight: '500',
    color: '#06402B',
  },
  itemSubtitle: {
    fontSize: 12,
    color: '#A3AABE',
    marginTop: 2,
  },
  transactionAmount: {
    fontSize: 14,
    fontWeight: '600',
  },
  viewAllButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F8F9FA',
    borderRadius: borderRadius.medium,
    padding: spacing.md,
    marginTop: spacing.md,
    borderWidth: 1,
    borderColor: '#E5E5E5',
  },
  viewAllText: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.primary,
    marginRight: spacing.xs,
  },
  bottomPadding: {
    height: 100,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingTop: spacing.lg,
    paddingBottom: spacing.xl,
    paddingHorizontal: spacing.xl,
    maxHeight: '70%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.lg,
    paddingBottom: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5E5',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#06402B',
  },
  closeButton: {
    padding: spacing.xs,
  },
  settingsList: {
    gap: spacing.sm,
  },
  settingsItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.md,
    backgroundColor: '#F8F9FA',
    borderRadius: borderRadius.medium,
    borderWidth: 1,
    borderColor: '#E5E5E5',
  },
  settingsText: {
    flex: 1,
    fontSize: 16,
    fontWeight: '500',
    color: '#06402B',
    marginLeft: spacing.md,
  },
});

export default CardScreen;
