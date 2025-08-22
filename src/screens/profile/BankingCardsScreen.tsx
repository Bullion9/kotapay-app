import * as Haptics from 'expo-haptics';
import {
    ArrowLeft,
    ChevronRight,
    CreditCard,
    Eye,
    MoreHorizontal,
    PiggyBank,
    Plus,
    Settings,
} from 'lucide-react-native';
import React, { memo, useCallback } from 'react';
import {
    Alert,
    SafeAreaView,
    ScrollView,
    StatusBar,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';

interface BankAccount {
  id: string;
  bankName: string;
  accountNumber: string;
  accountType: string;
  isDefault: boolean;
}

interface VirtualCard {
  id: string;
  cardName: string;
  lastFour: string;
  status: string;
  balance: string;
}

interface BankAccountItemProps {
  account: BankAccount;
  onPress: (account: BankAccount) => void;
}

interface VirtualCardItemProps {
  card: VirtualCard;
  onPress: (card: VirtualCard) => void;
}

interface ActionButtonProps {
  icon: React.ReactNode;
  label: string;
  onPress: () => void;
  primary?: boolean;
}

const BankingCardsScreen: React.FC = () => {
  const bankAccounts = [
    {
      id: '1',
      bankName: 'First Bank Nigeria',
      accountNumber: '**** **** **** 1234',
      accountType: 'Savings',
      isDefault: true,
    },
    {
      id: '2',
      bankName: 'GTBank',
      accountNumber: '**** **** **** 5678',
      accountType: 'Current',
      isDefault: false,
    },
  ];

  const virtualCards = [
    {
      id: '1',
      cardName: 'Online Shopping Card',
      lastFour: '4521',
      status: 'Active',
      balance: '₦50,000',
    },
    {
      id: '2',
      cardName: 'Subscription Card',
      lastFour: '8901',
      status: 'Active',
      balance: '₦25,000',
    },
    {
      id: '3',
      cardName: 'Travel Card',
      lastFour: '2345',
      status: 'Paused',
      balance: '₦0',
    },
  ];

  const handleAddBankAccount = useCallback(async () => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    console.log('Add bank account');
  }, []);

  const handleCreateVirtualCard = useCallback(async () => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    console.log('Create virtual card');
  }, []);

  const handleAccountSettings = useCallback(async () => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    console.log('Account settings');
  }, []);

  const handleBankAccountPress = useCallback(async (account: BankAccount) => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    Alert.alert(
      account.bankName,
      `Account: ${account.accountNumber}\nType: ${account.accountType}`,
      [
        { text: 'View Details', onPress: () => console.log('View bank details') },
        { text: 'Remove', style: 'destructive', onPress: () => console.log('Remove bank') },
        { text: 'Cancel', style: 'cancel' },
      ]
    );
  }, []);

  const handleVirtualCardPress = useCallback(async (card: VirtualCard) => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    console.log('Open virtual card details');
  }, []);

  const goBack = useCallback(async () => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    console.log('Going back to profile');
  }, []);

const BankAccountItem = memo<BankAccountItemProps>(({ account, onPress }) => {
  BankAccountItem.displayName = 'BankAccountItem';
  return (
    <TouchableOpacity
      style={styles.listItem}
      onPress={() => onPress(account)}
    >
      <View style={styles.itemLeft}>
        <View style={styles.iconContainer}>
          <PiggyBank size={20} color="#06402B" />
        </View>
        <View style={styles.itemText}>
          <Text style={styles.itemTitle}>{account.bankName}</Text>
          <Text style={styles.itemSubtitle}>
            {account.accountNumber} • {account.accountType}
          </Text>
          {account.isDefault && (
            <Text style={styles.defaultBadge}>Default Account</Text>
          )}
        </View>
      </View>
      <MoreHorizontal size={20} color="#A3AABE" />
    </TouchableOpacity>
  );
});

const VirtualCardItem = memo<VirtualCardItemProps>(({ card, onPress }) => {
  VirtualCardItem.displayName = 'VirtualCardItem';
  return (
    <TouchableOpacity
      style={styles.listItem}
      onPress={() => onPress(card)}
    >
      <View style={styles.itemLeft}>
        <View style={styles.iconContainer}>
          <CreditCard size={20} color="#06402B" />
        </View>
        <View style={styles.itemText}>
          <Text style={styles.itemTitle}>{card.cardName}</Text>
          <Text style={styles.itemSubtitle}>
            •••• {card.lastFour} • {card.status}
          </Text>
          <Text style={styles.balanceText}>{card.balance}</Text>
        </View>
      </View>
      <Eye size={20} color="#A3AABE" />
    </TouchableOpacity>
  );
});

const ActionButton = memo<ActionButtonProps>(({ icon, label, onPress, primary }) => {
  ActionButton.displayName = 'ActionButton';
  return (
    <TouchableOpacity
      style={[styles.actionButton, primary && styles.primaryButton]}
      onPress={onPress}
    >
      {icon}
      <Text style={[styles.actionButtonText, primary && styles.primaryButtonText]}>
        {label}
      </Text>
    </TouchableOpacity>
  );
});

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFF0F5" />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={goBack}>
          <ArrowLeft size={24} color="#06402B" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Banking & Cards</Text>
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.content}>
          <Text style={styles.description}>
            Manage your linked bank accounts and virtual cards for secure transactions.
          </Text>

          {/* Quick Actions */}
          <View style={styles.quickActions}>
            <ActionButton
              icon={<Plus size={20} color="#FFFFFF" />}
              label="Add Bank Account"
              onPress={handleAddBankAccount}
              primary
            />
            <ActionButton
              icon={<CreditCard size={20} color="#06402B" />}
              label="Create Virtual Card"
              onPress={handleCreateVirtualCard}
            />
          </View>

          {/* Linked Bank Accounts */}
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Linked Bank Accounts</Text>
            {bankAccounts.map(account => (
              <BankAccountItem
                key={account.id}
                account={account}
                onPress={handleBankAccountPress}
              />
            ))}
          </View>

          {/* Virtual Cards */}
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Virtual Cards</Text>
            {virtualCards.map(card => (
              <VirtualCardItem
                key={card.id}
                card={card}
                onPress={handleVirtualCardPress}
              />
            ))}
          </View>

          {/* Account Settings */}
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Account Management</Text>
            <TouchableOpacity style={styles.settingsRow} onPress={handleAccountSettings}>
              <View style={styles.rowLeft}>
                <Settings size={20} color="#06402B" />
                <View style={styles.rowText}>
                  <Text style={styles.rowLabel}>Account Settings</Text>
                  <Text style={styles.rowSubtitle}>KYC verification and spending limits</Text>
                </View>
              </View>
              <ChevronRight size={20} color="#A3AABE" />
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFF0F5',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#FFF0F5',
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  backButton: {
    padding: 8,
    marginRight: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#06402B',
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: 16,
  },
  description: {
    fontSize: 14,
    color: '#A3AABE',
    marginBottom: 24,
    lineHeight: 20,
  },
  quickActions: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 24,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: '#E5E5E5',
  },
  primaryButton: {
    backgroundColor: '#06402B',
    borderColor: '#06402B',
  },
  actionButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#06402B',
    marginLeft: 8,
  },
  primaryButtonText: {
    color: '#FFFFFF',
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
    backgroundColor: '#F0F8F0',
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
  defaultBadge: {
    fontSize: 10,
    color: '#06402B',
    backgroundColor: '#A8E4A0',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
    marginTop: 4,
    alignSelf: 'flex-start',
  },
  balanceText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#06402B',
    marginTop: 2,
  },
  settingsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    minHeight: 48,
  },
  rowLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  rowText: {
    marginLeft: 12,
    flex: 1,
  },
  rowLabel: {
    fontSize: 14,
    color: '#06402B',
    fontWeight: '500',
  },
  rowSubtitle: {
    fontSize: 12,
    color: '#A3AABE',
    marginTop: 2,
  },
});

BankingCardsScreen.displayName = 'BankingCardsScreen';
export default memo(BankingCardsScreen);
