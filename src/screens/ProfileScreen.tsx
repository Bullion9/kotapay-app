import { StackNavigationProp } from '@react-navigation/stack';
import {
    ChevronRight,
    CreditCard,
    Gift,
    HelpCircle,
    LogOut,
    MessageSquare,
    Settings,
    Shield,
    Trash2,
    User,
    UserCog,
} from 'lucide-react-native';
import React from 'react';
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
import { AvatarImage } from '../components/AvatarImage';
import { useAuth } from '../contexts/AuthContext';
import { borderRadius, colors, shadows, spacing } from '../theme';
import { ProfileParamList } from '../types';

interface MenuItemProps {
  icon: React.ReactNode;
  title: string;
  subtitle?: string;
  onPress: () => void;
  showArrow?: boolean;
  isFirst?: boolean;
  isLast?: boolean;
  variant?: 'default' | 'destructive';
}

interface ProfileScreenProps {
  navigation: StackNavigationProp<ProfileParamList, 'ProfileMain'>;
}

const ProfileScreen: React.FC<ProfileScreenProps> = ({ navigation }) => {
  const { user, logout, deleteAccount } = useAuth();

  // Handle logout
  const handleLogout = () => {
    Alert.alert(
      'Sign Out',
      'Are you sure you want to sign out?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Sign Out', 
          style: 'destructive', 
          onPress: async () => {
            try {
              await logout();
              // Navigation will be handled automatically by the auth state change
            } catch {
              Alert.alert('Error', 'Failed to sign out. Please try again.');
            }
          }
        },
      ]
    );
  };

  // Handle delete account
  const handleDeleteAccount = () => {
    Alert.alert(
      'Delete Account',
      'Are you sure you want to permanently delete your account? This action cannot be undone and all your data will be lost.',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Delete Account', 
          style: 'destructive', 
          onPress: async () => {
            try {
              await deleteAccount();
              Alert.alert('Account Deleted', 'Your account has been successfully deleted.');
              // Navigation will be handled automatically by the auth state change
            } catch {
              Alert.alert('Error', 'Failed to delete account. Please try again.');
            }
          }
        },
      ]
    );
  };

  // Render menu item
  const renderMenuItem = ({ icon, title, subtitle, onPress, showArrow = true, isFirst = false, isLast = false, variant = 'default' }: MenuItemProps) => (
    <TouchableOpacity 
      style={[
        styles.menuItem,
        isFirst && styles.firstMenuItem,
        isLast && styles.lastMenuItem,
      ]} 
      onPress={onPress}
    >
      <View style={styles.menuItemLeft}>
        <View style={styles.iconContainer}>
          {icon}
        </View>
        <View style={styles.textContainer}>
          <Text style={[
            styles.menuTitle,
            variant === 'destructive' && styles.menuTitleDestructive
          ]}>{title}</Text>
          {subtitle && <Text style={[
            styles.menuSubtitle,
            variant === 'destructive' && styles.menuSubtitleDestructive
          ]}>{subtitle}</Text>}
        </View>
      </View>
      {showArrow && <ChevronRight size={20} color={variant === 'destructive' ? colors.error : colors.secondaryText} />}
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.background} />
      
      {/* Header */}
      <View style={styles.navigationHeader}>
        <View style={styles.headerLeft} />
        <Text style={styles.headerTitle}>Profile</Text>
        <View style={styles.headerRight} />
      </View>
      
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Profile Header */}
        <View style={styles.header}>
          <AvatarImage 
            size={80}
            userName={user?.name || 'John Doe'}
            showInitials={true}
          />
          <Text style={styles.userName}>{user?.name || 'John Doe'}</Text>
          <Text style={styles.userEmail}>{user?.email || 'john.doe@email.com'}</Text>
        </View>

        {/* All Menu Items */}
        <View style={styles.section}>
          {renderMenuItem({
            icon: <User size={20} color={colors.primary} />,
            title: 'Personal Information',
            subtitle: 'Update your details, phone, and email',
            onPress: () => navigation.navigate('PersonalInformation'),
            isFirst: true,
          })}

          {renderMenuItem({
            icon: <UserCog size={20} color={colors.primary} />,
            title: 'Account Settings',
            subtitle: 'KYC, limits, and account preferences',
            onPress: () => navigation.navigate('AccountSettings'),
          })}

          {renderMenuItem({
            icon: <Shield size={20} color={colors.primary} />,
            title: 'Security Settings',
            subtitle: 'PIN, biometrics, notifications, and more',
            onPress: () => navigation.navigate('SecuritySettings'),
          })}
          
          {renderMenuItem({
            icon: <CreditCard size={20} color={colors.primary} />,
            title: 'Payment Methods',
            subtitle: 'Cards and bank accounts',
            onPress: () => navigation.navigate('PaymentMethods'),
          })}
          
          {renderMenuItem({
            icon: <Settings size={20} color={colors.primary} />,
            title: 'Preferences',
            subtitle: 'Theme, language, currency, and more',
            onPress: () => navigation.navigate('Preferences'),
          })}

          {renderMenuItem({
            icon: <MessageSquare size={20} color={colors.primary} />,
            title: 'Suggestion Box',
            subtitle: 'Share your feedback and ideas',
            onPress: () => navigation.navigate('SuggestionBox'),
          })}

          {renderMenuItem({
            icon: <HelpCircle size={20} color={colors.primary} />,
            title: 'Contact Support',
            subtitle: 'FAQ and contact us',
            onPress: () => navigation.navigate('HelpSupport'),
          })}

          {renderMenuItem({
            icon: <LogOut size={20} color={colors.error} />,
            title: 'Sign Out',
            onPress: handleLogout,
            variant: 'destructive',
            isLast: true,
          })}
        </View>

        {/* App Info & Copyright */}
        <View style={styles.appInfoSection}>
          <Text style={styles.appLogo}>KotaPay</Text>
          <Text style={styles.appVersion}>App Version 1.0.0</Text>
          <Text style={styles.copyrightText}>
            © 2025 KotaPay Technology Limited.{'\n'}All rights reserved.
          </Text>
        </View>

        {/* Delete Account Section */}
        <View style={styles.deleteAccountSection}>
          <View style={styles.deleteAccountCard}>
            <TouchableOpacity 
              style={styles.deleteAccountButton}
              onPress={handleDeleteAccount}
            >
              <View style={styles.deleteAccountIconContainer}>
                <Trash2 size={20} color={colors.error} />
              </View>
              <View style={styles.deleteAccountTextContainer}>
                <Text style={styles.deleteAccountTitle}>Delete Account</Text>
              </View>
              <ChevronRight size={20} color={colors.error} />
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.bottomSpacingWithFloatingButton} />
      </ScrollView>

      {/* Floating Referral Button */}
      <View style={styles.floatingReferralContainer}>
        <TouchableOpacity 
          style={styles.floatingReferralButton}
          onPress={() => navigation.navigate('ReferralProgram')}
        >
          <Gift size={20} color={colors.white} />
          <Text style={styles.floatingReferralText}>Refer & Earn</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  
  // Navigation Header styles
  navigationHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    backgroundColor: colors.background,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  headerLeft: {
    width: 40,
    alignItems: 'flex-start',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
    flex: 1,
    textAlign: 'center',
  },
  headerRight: {
    width: 40,
  },
  
  scrollView: {
    flex: 1,
  },
  
  // Header styles
  header: {
    alignItems: 'center',
    paddingVertical: spacing.xl,
    paddingHorizontal: spacing.lg,
    backgroundColor: colors.background,
  },
  avatarContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: colors.light,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.md,
    ...shadows.small,
  },
  userName: {
    fontSize: 24,
    fontWeight: '600',
    color: colors.text,
    marginBottom: spacing.xs,
  },
  userEmail: {
    fontSize: 16,
    color: colors.secondaryText,
  },
  
  // Section styles
  section: {
    marginBottom: spacing.lg,
    marginHorizontal: spacing.md,
    borderRadius: borderRadius.large,
    overflow: 'hidden',
    ...shadows.small,
  },
  
  // Menu item styles
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    backgroundColor: colors.white,
    borderBottomWidth: 1,
    borderBottomColor: '#F5F5F5',
    minHeight: 64,
  },
  firstMenuItem: {
    borderTopLeftRadius: borderRadius.large,
    borderTopRightRadius: borderRadius.large,
  },
  lastMenuItem: {
    borderBottomLeftRadius: borderRadius.large,
    borderBottomRightRadius: borderRadius.large,
    borderBottomWidth: 0,
  },
  menuItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.light,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.md,
  },
  textContainer: {
    flex: 1,
  },
  menuTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: colors.text,
    marginBottom: spacing.xs,
  },
  menuTitleDestructive: {
    color: colors.error,
  },
  menuSubtitle: {
    fontSize: 14,
    color: colors.secondaryText,
  },
  menuSubtitleDestructive: {
    color: colors.error,
  },
  
  // App Info section
  appInfoSection: {
    alignItems: 'center',
    marginHorizontal: spacing.lg,
    marginTop: spacing.xl,
    paddingVertical: spacing.lg,
  },
  appLogo: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.primary,
    marginBottom: spacing.xs,
  },
  appVersion: {
    fontSize: 14,
    color: colors.secondaryText,
    marginBottom: spacing.md,
  },
  copyrightText: {
    fontSize: 12,
    color: colors.secondaryText,
    textAlign: 'center',
    lineHeight: 16,
  },
  
  // Floating Referral Button
  floatingReferralContainer: {
    position: 'absolute',
    bottom: 30,
    right: 20,
    zIndex: 1000,
  },
  floatingReferralButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.primary,
    borderRadius: 30,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  floatingReferralText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.white,
    marginLeft: spacing.sm,
  },
  
  // Modal Styles
  modalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: colors.background,
    borderTopLeftRadius: 25,
    borderTopRightRadius: 25,
    maxHeight: '80%',
    paddingTop: spacing.lg,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.md,
    borderBottomWidth: 0,
    borderBottomColor: colors.border,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: colors.text,
  },
  closeButton: {
    padding: spacing.sm,
  },
  modalScrollView: {
    flex: 1,
    paddingBottom: spacing.xl,
  },
  
  // Modal Section Styles
  modalSection: {
    marginHorizontal: spacing.lg,
    marginTop: spacing.lg,
  },
  modalSectionCard: {
    backgroundColor: colors.white,
    borderRadius: borderRadius.large,
    padding: spacing.lg,
    ...shadows.small,
  },
  modalSectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  modalSectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
    marginLeft: spacing.sm,
  },
  
  // Share Button Styles
  shareButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primary,
    borderRadius: borderRadius.medium,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    ...shadows.small,
  },
  shareButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.white,
    marginLeft: spacing.sm,
  },
  
  // Referral Code Styles
  referralCodeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.light,
    borderRadius: borderRadius.medium,
    padding: spacing.md,
    marginBottom: spacing.md,
  },
  referralCode: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.primary,
    letterSpacing: 2,
  },
  copyButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.primaryTransparent,
    borderRadius: borderRadius.small,
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.sm,
  },
  copyButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.primary,
    marginLeft: spacing.xs,
  },
  referralDescription: {
    fontSize: 14,
    color: colors.secondaryText,
    textAlign: 'center',
    lineHeight: 20,
  },
  
  // Stats Row Styles
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.lg,
    backgroundColor: colors.light,
    borderRadius: borderRadius.medium,
    padding: spacing.md,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.primary,
    marginBottom: spacing.xs,
  },
  statLabel: {
    fontSize: 12,
    color: colors.secondaryText,
    textAlign: 'center',
  },
  statDivider: {
    width: 1,
    height: 40,
    backgroundColor: colors.border,
    marginHorizontal: spacing.md,
  },
  
  // Referral Item Styles
  recentReferrals: {
    marginTop: spacing.sm,
  },
  recentReferralsTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginBottom: spacing.md,
  },
  referralItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  referralItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  referralAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.light,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.sm,
  },
  referralInfo: {
    flex: 1,
  },
  referralName: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.text,
    marginBottom: 2,
  },
  referralDate: {
    fontSize: 12,
    color: colors.secondaryText,
  },
  referralItemRight: {
    alignItems: 'flex-end',
  },
  referralReward: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.primary,
    marginBottom: spacing.xs,
  },
  statusBadge: {
    paddingHorizontal: spacing.xs,
    paddingVertical: 2,
    borderRadius: borderRadius.small,
  },
  statusCompleted: {
    backgroundColor: colors.successTransparent,
  },
  statusPending: {
    backgroundColor: colors.accentTransparent,
  },
  statusText: {
    fontSize: 10,
    fontWeight: '500',
  },
  statusTextCompleted: {
    color: colors.success,
  },
  statusTextPending: {
    color: colors.accent,
  },
  viewAllButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: spacing.md,
    paddingVertical: spacing.sm,
  },
  viewAllText: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.primary,
    marginRight: spacing.xs,
  },
  
  // Missing Modal Styles
  headerSpacer: {
    width: 24, // Same width as close button for centering
  },
  modalShareSection: {
    marginHorizontal: spacing.lg,
    marginTop: spacing.lg,
  },
  modalShareButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primary,
    borderRadius: borderRadius.medium,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    ...shadows.small,
  },
  modalShareButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.white,
    marginLeft: spacing.sm,
  },
  modalReferralSection: {
    marginHorizontal: spacing.lg,
    marginTop: spacing.lg,
  },
  modalReferralCard: {
    backgroundColor: colors.white,
    borderRadius: borderRadius.large,
    padding: spacing.lg,
    ...shadows.small,
  },
  modalReferralHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  modalReferralTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
    marginLeft: spacing.sm,
  },
  modalReferralCodeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.light,
    borderRadius: borderRadius.medium,
    padding: spacing.md,
    marginBottom: spacing.md,
  },
  modalReferralCode: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.primary,
    letterSpacing: 2,
  },
  modalCopyButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.primaryTransparent,
    borderRadius: borderRadius.small,
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.sm,
  },
  modalCopyButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.primary,
    marginLeft: spacing.xs,
  },
  modalReferralDescription: {
    fontSize: 14,
    color: colors.secondaryText,
    textAlign: 'center',
    lineHeight: 20,
  },
  modalReferralHistorySection: {
    marginHorizontal: spacing.lg,
    marginTop: spacing.lg,
  },
  modalReferralHistoryCard: {
    backgroundColor: colors.white,
    borderRadius: borderRadius.large,
    padding: spacing.lg,
    ...shadows.small,
  },
  modalReferralHistoryHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  modalReferralHistoryTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
    marginLeft: spacing.sm,
  },
  modalStatsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.lg,
    backgroundColor: colors.light,
    borderRadius: borderRadius.medium,
    padding: spacing.md,
  },
  modalStatItem: {
    flex: 1,
    alignItems: 'center',
  },
  modalStatNumber: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.primary,
    marginBottom: spacing.xs,
  },
  modalStatLabel: {
    fontSize: 12,
    color: colors.secondaryText,
    textAlign: 'center',
  },
  modalStatDivider: {
    width: 1,
    height: 40,
    backgroundColor: colors.border,
    marginHorizontal: spacing.md,
  },
  modalRecentReferrals: {
    marginTop: spacing.sm,
  },
  modalRecentReferralsTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginBottom: spacing.md,
  },
  modalReferralItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  modalReferralItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  modalReferralAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.light,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.sm,
  },
  modalReferralInfo: {
    flex: 1,
  },
  modalReferralName: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.text,
    marginBottom: 2,
  },
  modalReferralDate: {
    fontSize: 12,
    color: colors.secondaryText,
  },
  modalReferralItemRight: {
    alignItems: 'flex-end',
  },
  modalReferralReward: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.primary,
    marginBottom: spacing.xs,
  },
  modalStatusBadge: {
    paddingHorizontal: spacing.xs,
    paddingVertical: 2,
    borderRadius: borderRadius.small,
  },
  modalStatusCompleted: {
    backgroundColor: colors.successTransparent,
  },
  modalStatusPending: {
    backgroundColor: colors.accentTransparent,
  },
  modalStatusText: {
    fontSize: 10,
    fontWeight: '500',
  },
  modalStatusTextCompleted: {
    color: colors.success,
  },
  modalStatusTextPending: {
    color: colors.accent,
  },
  modalViewAllButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: spacing.md,
    paddingVertical: spacing.sm,
  },
  modalViewAllText: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.primary,
    marginRight: spacing.xs,
  },
  modalBottomSpacing: {
    height: spacing.xl,
  },
  
  // Delete Account Section Styles
  deleteAccountSection: {
    marginHorizontal: spacing.lg,
    marginTop: spacing.lg,
    marginBottom: spacing.lg,
  },
  deleteAccountCard: {
    backgroundColor: colors.white,
    borderRadius: borderRadius.large,
    ...shadows.small,
    overflow: 'hidden',
  },
  deleteAccountButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.lg,
    paddingHorizontal: spacing.lg,
    minHeight: 64,
  },
  deleteAccountIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.errorTransparent,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.md,
  },
  deleteAccountTextContainer: {
    flex: 1,
  },
  deleteAccountTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: colors.error,
    marginBottom: spacing.xs,
  },
  
  bottomSpacing: {
    height: spacing.xl,
  },
  bottomSpacingWithFloatingButton: {
    height: spacing.xl + 80, // Extra space for floating button
  },
});

export default ProfileScreen;
