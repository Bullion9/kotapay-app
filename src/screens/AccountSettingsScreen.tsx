import { StackNavigationProp } from '@react-navigation/stack';
import {
    ChevronLeft,
    ChevronRight,
    FileText,
    Lock,
    Settings,
    UserCheck,
} from 'lucide-react-native';
import React from 'react';
import {
    SafeAreaView,
    ScrollView,
    StatusBar,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
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
}

interface AccountSettingsScreenProps {
  navigation: StackNavigationProp<ProfileParamList, 'AccountSettings'>;
}

const AccountSettingsScreen: React.FC<AccountSettingsScreenProps> = ({ navigation }) => {
  // Render menu item
  const renderMenuItem = ({ icon, title, subtitle, onPress, showArrow = true, isFirst = false, isLast = false }: MenuItemProps) => (
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
          <Text style={styles.menuTitle}>{title}</Text>
          {subtitle && <Text style={styles.menuSubtitle}>{subtitle}</Text>}
        </View>
      </View>
      {showArrow && <ChevronRight size={20} color={colors.secondaryText} />}
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.background} />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <ChevronLeft size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Account Settings</Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.section}>
          {renderMenuItem({
            icon: <UserCheck size={20} color={colors.primary} />,
            title: 'KYC & Limits',
            subtitle: 'Identity verification and transaction limits',
            onPress: () => navigation.navigate('TierDashboard'),
            isFirst: true,
          })}

          {renderMenuItem({
            icon: <FileText size={20} color={colors.primary} />,
            title: 'Document Center',
            subtitle: 'Manage uploaded documents and certificates',
            onPress: () => navigation.navigate('DocumentCenter'),
          })}

          {renderMenuItem({
            icon: <Settings size={20} color={colors.primary} />,
            title: 'Account Information',
            subtitle: 'View and update account details',
            onPress: () => navigation.navigate('AccountInformation'),
          })}

          {renderMenuItem({
            icon: <Lock size={20} color={colors.error} />,
            title: 'Freeze Account',
            subtitle: 'Temporarily disable account access',
            onPress: () => navigation.navigate('FreezeAccount'),
          })}

          {renderMenuItem({
            icon: <FileText size={20} color={colors.primary} />,
            title: 'Account Statements',
            subtitle: 'Download transaction statements',
            onPress: () => navigation.navigate('AccountStatements'),
            isLast: true,
          })}
        </View>

        <View style={styles.bottomSpacing} />
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  
  // Header styles
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    backgroundColor: colors.background,
  },
  backButton: {
    padding: spacing.sm,
    marginLeft: -spacing.sm,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
    flex: 1,
    textAlign: 'center',
    marginRight: 40,
  },
  headerSpacer: {
    width: 40,
  },
  
  scrollView: {
    flex: 1,
  },
  
  // Section styles
  section: {
    marginTop: spacing.lg,
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
  menuSubtitle: {
    fontSize: 14,
    color: colors.secondaryText,
  },
  
  bottomSpacing: {
    height: spacing.xl,
  },
});

export default AccountSettingsScreen;
