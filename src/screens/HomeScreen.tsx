import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import {
    Copy,
    FileText,
    Mail,
    TestTube,
    Wallet,
    Shield,
    Link,
    CreditCard
} from 'lucide-react-native';
import React, { useState } from 'react';
import {
    Alert,
    Clipboard,
    RefreshControl,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import ActivityCard from '../components/ActivityCard';
import { AvatarImage } from '../components/AvatarImage';
import CarouselAds from '../components/CarouselAds';
import {
    EyeIcon,
    HomeBillsIcon,
    HomeCashOutIcon,
    HomePayLinkIcon,
    HomeQRCodeIcon,
    HomeRequestIcon,
    HomeSendIcon,
    HomeTopUpIcon
} from '../components/icons';
import NotificationMailIcon from '../components/NotificationMailIcon';
import { useAuth } from '../contexts/AuthContext';
import { useWallet } from '../hooks/useWallet';
import { notificationService } from '../services/notifications';
import { kotaPayExamples } from '../services/KotaPayExamples';
import { borderRadius, colors, iconSizes, shadows, spacing } from '../theme';
import { RootStackParamList } from '../types';

type HomeScreenNavigationProp = StackNavigationProp<RootStackParamList>;

const HomeScreen: React.FC = () => {
  const navigation = useNavigation<HomeScreenNavigationProp>();
  const { user } = useAuth();
  const { balance, refreshBalance } = useWallet();
  const [balanceVisible, setBalanceVisible] = useState(true);
  const [accountNumber] = useState('4532 1234 5678 9012');
  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = async () => {
    setRefreshing(true);
    try {
      // Refresh wallet balance from real data
      await refreshBalance();
    } catch (error) {
      console.error('Refresh error:', error);
    } finally {
      setRefreshing(false);
    }
  };

  const copyAccountNumber = () => {
    Clipboard.setString(accountNumber);
  };

  const quickActions = [
    {
      title: 'Send',
      icon: HomeSendIcon,
      color: colors.primary,
      onPress: () => navigation.navigate('SendMoney', {}),
    },
    {
      title: 'Request',
      icon: HomeRequestIcon,
      color: colors.success,
      onPress: () => navigation.navigate('RequestMoney', {}),
    },
    {
      title: 'QR Code',
      icon: HomeQRCodeIcon,
      color: colors.warning,
      onPress: () => navigation.navigate('QRScanner'),
    },
    {
      title: 'Top Up',
      icon: HomeTopUpIcon,
      color: colors.accent,
      onPress: () => navigation.navigate('TopUp'),
    },
    {
      title: 'Cash Out',
      icon: HomeCashOutIcon,
      color: colors.error,
      onPress: () => navigation.navigate('CashOut'),
    },
    // KotaPay Testing Actions
    {
      title: 'Setup DB',
      icon: Shield,
      color: '#DC2626',
      onPress: async () => {
        try {
          Alert.alert('� Database Setup', 'Checking database status...');
          
          // Import the database setup service
          const { default: DatabaseSetup } = await import('../services/DatabaseSetup');
          
          // Run setup verification
          await DatabaseSetup.runSetupVerification();
          
          Alert.alert(
            '📋 Database Setup',
            'Check the console for detailed status and instructions. If collections are missing, create them in Appwrite Console.',
            [
              { text: 'Open Appwrite Console', onPress: () => {} },
              { text: 'OK', style: 'default' }
            ]
          );
        } catch (error) {
          Alert.alert('❌ Setup Failed', `Error: ${error}`);
        }
      },
    },
    {
      title: 'Test Wallet',
      icon: Wallet,
      color: '#10B981',
      onPress: async () => {
        try {
          Alert.alert('🔄 Testing Wallet Logic', 'Running wallet vs bank transfer examples...');
          await kotaPayExamples.walletToWalletTransfer();
          await kotaPayExamples.walletToBankTransfer();
          Alert.alert('✅ Wallet Test Complete', 'Check console for detailed results');
        } catch (error) {
          Alert.alert('❌ Test Failed', `Error: ${error}`);
        }
      },
    },
    {
      title: 'Test KYC',
      icon: Shield,
      color: '#8B5CF6',
      onPress: async () => {
        try {
          Alert.alert('🆔 Testing KYC System', 'Running identity verification examples...');
          await kotaPayExamples.onboardingFlow();
          await kotaPayExamples.kycTierUpgrade();
          Alert.alert('✅ KYC Test Complete', 'Check console for tier progression');
        } catch (error) {
          Alert.alert('❌ Test Failed', `Error: ${error}`);
        }
      },
    },
    {
      title: 'Test Auth',
      icon: CreditCard,
      color: '#F59E0B',
      onPress: async () => {
        try {
          Alert.alert('🔐 Testing Authentication', 'Running JWT token examples...');
          await kotaPayExamples.authenticationFlow();
          await kotaPayExamples.transactionLimitValidation();
          Alert.alert('✅ Auth Test Complete', 'Check console for token details');
        } catch (error) {
          Alert.alert('❌ Test Failed', `Error: ${error}`);
        }
      },
    },
    {
      title: 'Test Requests',
      icon: Link,
      color: '#EF4444',
      onPress: async () => {
        try {
          Alert.alert('💰 Testing Payment Requests', 'Running payment link & QR examples...');
          await kotaPayExamples.paymentRequestFlow();
          Alert.alert('✅ Payment Test Complete', 'Check console for request lifecycle');
        } catch (error) {
          Alert.alert('❌ Test Failed', `Error: ${error}`);
        }
      },
    },
    {
      title: 'Run All Tests',
      icon: TestTube,
      color: '#06B6D4',
      onPress: async () => {
        try {
          Alert.alert('🚀 Full KotaPay Demo', 'Running complete architecture demonstration...');
          await kotaPayExamples.demonstrateKotaPayArchitecture();
          Alert.alert('🎉 Demo Complete!', 'All KotaPay features tested successfully');
        } catch (error) {
          Alert.alert('❌ Demo Failed', `Error: ${error}`);
        }
      },
    },
    // Original Actions
    {
      title: 'Test PIN',
      icon: HomeSendIcon,
      color: colors.accent,
      onPress: () => navigation.navigate('CreateAccountPin'),
    },
    {
      title: 'Receipt',
      icon: FileText,
      color: colors.seaGreen,
      onPress: () => navigation.navigate('Receipt'),
    },
    {
      title: 'Bills',
      icon: HomeBillsIcon,
      color: colors.warning,
      onPress: () => navigation.navigate('BillsHub'),
    },
    {
      title: 'Pay Link',
      icon: HomePayLinkIcon,
      color: '#10B981',
      onPress: () => navigation.navigate('PayWithLink', { linkId: 'demo-link-123' }),
    },
    {
      title: 'Test Notify',
      icon: Mail,
      color: colors.accent,
      onPress: async () => {
        try {
          await notificationService.sendTestNotification();
          // Also test a money received notification
          await notificationService.sendMoneyReceivedNotification({
            transactionId: `test-${Date.now()}`,
            amount: 25.50,
            currency: '$',
            senderName: 'John Doe',
            recipientName: 'You',
          });
          // Test email notification
          await notificationService.sendEmailNotification({
            transactionId: `email-${Date.now()}`,
            emailSubject: 'Payment Confirmation',
            senderName: 'KotaPay Support',
            message: 'Your transaction was successful!',
          });
        } catch (error) {
          console.error('Failed to send test notification:', error);
        }
      },
    },
  ];

  return (
    <SafeAreaView style={styles.container}>
      {/* Sticky Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <TouchableOpacity 
            onPress={() => navigation.navigate('Profile', { 
              screen: 'PersonalInformation' 
            })}
            activeOpacity={0.7}
          >
            <AvatarImage 
              size={50}
              userName={user?.name}
              showInitials={true}
            />
          </TouchableOpacity>
          <View style={styles.greetingContainer}>
            <Text style={styles.greeting}>Good Morning</Text>
            <Text style={styles.userName}>{user?.name || 'User'}</Text>
          </View>
        </View>
        
        <View style={styles.headerRight}>
          <NotificationMailIcon 
            unreadCount={5}
          />
        </View>
      </View>

      {/* Scrollable Content with Pull-to-Refresh */}
      <ScrollView 
        style={styles.scrollContainer}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={colors.primary}
            colors={[colors.primary]}
          />
        }
      >

        {/* Balance Card */}
        <View style={styles.balanceCard}>
          <View style={styles.balanceHeaderCentered}>
            <Text style={styles.balanceLabel}>
              {balance?.pending && balance.pending > 0 
                ? `Available Balance • ${balance.currency}${balance.pending.toLocaleString()} pending`
                : 'Available Balance'
              }
            </Text>
          </View>
          
          <View style={styles.balanceCenter}>
            <Text style={styles.balanceAmount}>
              {balanceVisible ? 
                `${balance?.currency || '₦'}${(balance?.available || 0).toLocaleString()}` : 
                '••••••'
              }
            </Text>
            <TouchableOpacity 
              style={styles.eyeButtonCentered}
              onPress={() => setBalanceVisible(!balanceVisible)}
            >
              <EyeIcon 
                size={iconSizes.md} 
                color={colors.white} 
                filled={!balanceVisible}
              />
            </TouchableOpacity>
          </View>
          
          <TouchableOpacity style={styles.accountNumberContainer} onPress={copyAccountNumber}>
            <Text style={styles.accountNumber}>{accountNumber}</Text>
            <Copy size={iconSizes.xs} color={colors.white} style={styles.copyIcon} />
          </TouchableOpacity>
        </View>

        {/* Quick Actions */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>
          <View style={styles.actionsGrid}>
            {quickActions.map((action, index) => {
              const ActionIcon = action.icon;
              return (
                <TouchableOpacity
                  key={index}
                  style={styles.actionCard}
                  onPress={action.onPress}
                >
                  <View style={[styles.actionIcon, { backgroundColor: `${action.color}15` }]}>
                    <ActionIcon size={iconSizes.md} color={action.color} />
                  </View>
                  <Text style={styles.actionTitle}>{action.title}</Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* Running Activity Card */}
        <View style={styles.activityContainer}>
          <ActivityCard />
        </View>

        {/* Carousel Ads */}
        <View style={styles.carouselContainer}>
          <CarouselAds />
        </View>

        {/* Bottom spacing for FAB */}
        <View style={styles.bottomSpacing} />
      </ScrollView>

      {/* Floating Action Button */}
      <TouchableOpacity 
        style={styles.fab}
        onPress={() => navigation.navigate('SendMoney', {})}
      >
        <HomeSendIcon size={iconSizes.md} color={colors.white} />
      </TouchableOpacity>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollContainer: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.md,
    paddingBottom: spacing.lg,
    backgroundColor: colors.background,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatarContainer: {
    width: 45,
    height: 45,
    borderRadius: 22.5,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  avatarText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.white,
  },
  greetingContainer: {
    flexDirection: 'column',
  },
  greeting: {
    fontSize: 14,
    color: colors.secondaryText,
    marginBottom: 2,
  },
  userName: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  iconButton: {
    position: 'relative',
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.white,
    alignItems: 'center',
    justifyContent: 'center',
    ...shadows.small,
  },
  notificationBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.error,
  },
  balanceCard: {
    marginHorizontal: spacing.xl,
    marginBottom: spacing.xl,
    padding: spacing.xl,
    borderRadius: borderRadius.xl,
    backgroundColor: colors.primary,
    ...shadows.medium,
  },
  carouselContainer: {
    marginHorizontal: spacing.xl,
    marginBottom: spacing.xl,
    height: 200, // Increased from 180px
  },
  activityContainer: {
    marginHorizontal: spacing.xl,
    marginBottom: spacing.xl,
  },
  balanceHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  balanceHeaderCentered: {
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  balanceLabel: {
    fontSize: 14,
    color: colors.white,
    opacity: 0.8,
    textAlign: 'center',
  },
  eyeButton: {
    padding: spacing.xs,
  },
  balanceCenter: {
    alignItems: 'center',
    marginVertical: spacing.sm,
    flexDirection: 'row',
    justifyContent: 'center',
  },
  balanceAmount: {
    fontSize: 36,
    fontWeight: 'normal',
    color: colors.white,
    textAlign: 'center',
    marginRight: spacing.md,
  },
  eyeButtonCentered: {
    padding: spacing.xs,
  },
  accountNumberContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: spacing.md,
  },
  accountNumber: {
    fontSize: 14,
    color: colors.white,
    opacity: 0.8,
    marginRight: spacing.xs,
  },
  copyIcon: {
    opacity: 0.8,
  },
  section: {
    paddingHorizontal: spacing.xl,
    marginBottom: spacing.xl,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: colors.text,
  },
  viewAllText: {
    fontSize: 16,
    color: colors.primary,
    fontWeight: '500',
  },
  actionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.md,
  },
  actionCard: {
    width: '30%',
    minWidth: 100,
    alignItems: 'center',
    padding: spacing.md,
    backgroundColor: colors.white,
    borderRadius: borderRadius.large,
    ...shadows.small,
  },
  actionIcon: {
    width: 50,
    height: 50,
    borderRadius: 25,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.sm,
  },
  actionTitle: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.text,
    textAlign: 'center',
  },
  transactionsList: {
    backgroundColor: colors.white,
    borderRadius: borderRadius.large,
    ...shadows.small,
  },
  transactionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  transactionIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  transactionDetails: {
    flex: 1,
  },
  transactionRecipient: {
    fontSize: 16,
    fontWeight: '500',
    color: colors.text,
    marginBottom: 4,
  },
  transactionMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  transactionDate: {
    fontSize: 12,
    fontWeight: '500',
  },
  transactionAmount: {
    fontSize: 16,
    fontWeight: '600',
  },
  emptyTransactions: {
    alignItems: 'center',
    paddingVertical: spacing.xxl,
    backgroundColor: colors.white,
    borderRadius: borderRadius.large,
  },
  emptyText: {
    fontSize: 16,
    color: colors.secondaryText,
    marginBottom: spacing.xs,
  },
  emptySubtext: {
    fontSize: 14,
    color: colors.secondaryText,
    textAlign: 'center',
  },
  bottomSpacing: {
    height: 100, // Space for FAB
  },
  fab: {
    position: 'absolute',
    bottom: spacing.xl,
    right: spacing.xl,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    ...shadows.medium,
    elevation: 8, // Android shadow
  },
});

export default HomeScreen;
