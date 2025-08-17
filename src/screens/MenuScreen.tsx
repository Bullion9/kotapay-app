import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
} from 'react-native';
import {
  Settings,
  Mail,
  CreditCard,
  Shield,
  Users,
  Gift,
  Smartphone,
  Globe,
  HelpCircle,
  HeadphonesIcon,
  FileText,
  Eye,
  LogOut,
  ChevronRight,
  Lock,
} from 'lucide-react-native';
import { colors, spacing, typography, borderRadius, shadows, iconSizes } from '../theme';

interface MenuItemProps {
  icon: React.ComponentType<any>;
  title: string;
  subtitle?: string;
  onPress: () => void;
  showChevron?: boolean;
  danger?: boolean;
}

const MenuScreen: React.FC = () => {
  const menuSections = [
    {
      title: 'Account',
      items: [
        {
          icon: Settings,
          title: 'Account Settings',
          subtitle: 'Manage your account preferences',
          onPress: () => {/* Navigate to Account Settings */},
        },
        {
          icon: CreditCard,
          title: 'Payment Methods',
          subtitle: 'Manage cards and bank accounts',
          onPress: () => {/* Navigate to Payment Methods */},
        },
        {
          icon: Mail,
          title: 'Notifications',
          subtitle: 'Push notifications and alerts',
          onPress: () => {/* Navigate to Notifications */},
        },
        {
          icon: Shield,
          title: 'Security & Privacy',
          subtitle: 'PIN, biometrics, and privacy settings',
          onPress: () => {/* Navigate to Security */},
        },
      ],
    },
    {
      title: 'Features',
      items: [
        {
          icon: Users,
          title: 'Invite Friends',
          subtitle: 'Share KotaPay and earn rewards',
          onPress: () => {/* Navigate to Invite Friends */},
        },
        {
          icon: Gift,
          title: 'Rewards',
          subtitle: 'View your rewards and cashback',
          onPress: () => {/* Navigate to Rewards */},
        },
        {
          icon: Smartphone,
          title: 'Mobile Top-up',
          subtitle: 'Recharge your mobile phone',
          onPress: () => {/* Navigate to Mobile Top-up */},
        },
        {
          icon: Globe,
          title: 'International',
          subtitle: 'Send money worldwide',
          onPress: () => {/* Navigate to International */},
        },
      ],
    },
    {
      title: 'Support',
      items: [
        {
          icon: HelpCircle,
          title: 'Help Center',
          subtitle: 'FAQs and support articles',
          onPress: () => {/* Navigate to Help Center */},
        },
        {
          icon: HeadphonesIcon,
          title: 'Contact Support',
          subtitle: 'Chat with our support team',
          onPress: () => {/* Navigate to Contact Support */},
        },
        {
          icon: FileText,
          title: 'Terms & Privacy',
          subtitle: 'Legal documents and policies',
          onPress: () => {/* Navigate to Terms */},
        },
      ],
    },
    {
      title: 'Advanced',
      items: [
        {
          icon: Eye,
          title: 'Transaction Limits',
          subtitle: 'View and manage spending limits',
          onPress: () => {/* Navigate to Transaction Limits */},
        },
        {
          icon: Lock,
          title: 'App Lock',
          subtitle: 'Secure your app with PIN or biometrics',
          onPress: () => {/* Navigate to App Lock */},
        },
        {
          icon: LogOut,
          title: 'Sign Out',
          subtitle: 'Log out of your account',
          onPress: () => {/* Handle Sign Out */},
          danger: true,
        },
      ],
    },
  ];

  const MenuItem: React.FC<MenuItemProps> = ({ 
    icon: Icon, 
    title, 
    subtitle, 
    onPress, 
    showChevron = true,
    danger = false 
  }) => (
    <TouchableOpacity style={styles.menuItem} onPress={onPress}>
      <View style={styles.menuItemLeft}>
        <View style={[styles.menuIcon, danger && styles.menuIconDanger]}>
          <Icon 
            size={iconSizes.md} 
            color={danger ? colors.error : colors.primary} 
          />
        </View>
        <View style={styles.menuItemContent}>
          <Text style={[styles.menuItemTitle, danger && styles.menuItemTitleDanger]}>
            {title}
          </Text>
          {subtitle && (
            <Text style={styles.menuItemSubtitle}>{subtitle}</Text>
          )}
        </View>
      </View>
      {showChevron && (
        <ChevronRight 
          size={iconSizes.sm} 
          color={colors.secondaryText} 
        />
      )}
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={styles.title}>Menu</Text>
          <Text style={styles.subtitle}>Settings and preferences</Text>
        </View>

        {menuSections.map((section, sectionIndex) => (
          <View key={sectionIndex} style={styles.section}>
            <Text style={styles.sectionTitle}>{section.title}</Text>
            <View style={styles.sectionCard}>
              {section.items.map((item, itemIndex) => (
                <React.Fragment key={itemIndex}>
                  <MenuItem {...item} />
                  {itemIndex < section.items.length - 1 && (
                    <View style={styles.divider} />
                  )}
                </React.Fragment>
              ))}
            </View>
          </View>
        ))}

        <View style={styles.footer}>
          <Text style={styles.footerText}>KotaPay v1.0.0</Text>
          <Text style={styles.footerSubtext}>
            Secure payments made simple
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    padding: spacing.xl,
    paddingBottom: spacing.lg,
  },
  title: {
    ...typography.h2,
    color: colors.text,
    marginBottom: spacing.xs,
  },
  subtitle: {
    ...typography.caption,
    color: colors.secondaryText,
  },
  section: {
    marginBottom: spacing.xl,
    paddingHorizontal: spacing.xl,
  },
  sectionTitle: {
    ...typography.body,
    color: colors.text,
    fontWeight: '600',
    marginBottom: spacing.md,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    fontSize: 12,
  },
  sectionCard: {
    backgroundColor: colors.white,
    borderRadius: borderRadius.medium,
    ...shadows.small,
    overflow: 'hidden',
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: spacing.lg,
    backgroundColor: colors.white,
  },
  menuItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  menuIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.primaryTransparent,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.lg,
  },
  menuIconDanger: {
    backgroundColor: colors.errorTransparent,
  },
  menuItemContent: {
    flex: 1,
  },
  menuItemTitle: {
    ...typography.body,
    color: colors.text,
    fontWeight: '600',
    marginBottom: 2,
  },
  menuItemTitleDanger: {
    color: colors.error,
  },
  menuItemSubtitle: {
    ...typography.caption,
    color: colors.secondaryText,
  },
  divider: {
    height: 1,
    backgroundColor: colors.border,
    marginLeft: spacing.lg + 40 + spacing.lg, // Icon width + icon margin
  },
  footer: {
    padding: spacing.xl,
    paddingTop: spacing.lg,
    alignItems: 'center',
  },
  footerText: {
    ...typography.caption,
    color: colors.secondaryText,
    fontWeight: '600',
    marginBottom: spacing.xs,
  },
  footerSubtext: {
    ...typography.small,
    color: colors.secondaryText,
    textAlign: 'center',
  },
});

export default MenuScreen;
