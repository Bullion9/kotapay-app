import type { NavigationProp } from '@react-navigation/native';
import { useNavigation } from '@react-navigation/native';
import {
    ArrowUpRight,
    BarChart3,
    Bell,
    Camera,
    ChevronLeft,
    CreditCard,
    DollarSign,
    Eye,
    FileText,
    HelpCircle,
    Key,
    Lock,
    Mail,
    MessageCircle,
    Settings,
    Shield,
    TrendingUp,
    User,
    UserCheck,
} from 'lucide-react-native';
import React, { useState } from 'react';
import {
    Alert,
    SafeAreaView,
    ScrollView,
    StyleSheet,
    Switch,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';

interface SettingsItemProps {
  icon: React.ComponentType<any>;
  title: string;
  subtitle?: string;
  onPress?: () => void;
  showArrow?: boolean;
  rightComponent?: React.ReactNode;
  iconColor?: string;
  iconBackgroundColor?: string;
}

type RootStackParamList = {
  ProfileSettings: undefined;
  NotificationSettings: undefined;
  SecuritySettings: undefined;
  HelpSupport: undefined;
  TermsPrivacy: undefined;
};

const SettingsMainScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();
  
  // Notification states
  const [pushNotifications, setPushNotifications] = useState(true);
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [smsNotifications, setSmsNotifications] = useState(false);
  
  // Security states
  const [biometricEnabled, setBiometricEnabled] = useState(true);
  const [autoLockEnabled, setAutoLockEnabled] = useState(true);

  const SettingsItem: React.FC<SettingsItemProps> = ({
    icon: Icon,
    title,
    subtitle,
    onPress,
    showArrow = true,
    rightComponent,
    iconColor = '#06402B',
    iconBackgroundColor = '#06402B15',
  }) => (
    <TouchableOpacity 
      style={styles.settingsItem}
      onPress={onPress}
      activeOpacity={0.7}
      disabled={!onPress}
    >
      <View style={styles.itemLeft}>
        <View style={[styles.iconContainer, { backgroundColor: iconBackgroundColor }]}>
          <Icon size={24} color={iconColor} />
        </View>
        <View style={styles.itemText}>
          <Text style={styles.itemTitle}>{title}</Text>
          {subtitle && <Text style={styles.itemSubtitle}>{subtitle}</Text>}
        </View>
      </View>
      <View style={styles.itemRight}>
        {rightComponent}
        {showArrow && onPress && (
          <ArrowUpRight size={20} color="#A3AABE" />
        )}
      </View>
    </TouchableOpacity>
  );

  const handleProfileSettings = () => {
    // Navigate to profile settings or show profile options
    Alert.alert(
      'Account Profile',
      'Manage your KotaPay account',
      [
        {
          text: 'Personal Information',
          onPress: () => Alert.alert('Personal Info', 'Update your name, address, and identity details')
        },
        {
          text: 'KYC Verification',
          onPress: () => Alert.alert('KYC Verification', 'Complete or update your identity verification')
        },
        {
          text: 'Account Limits',
          onPress: () => Alert.alert('Account Limits', 'View your transaction and balance limits')
        },
        {
          text: 'Profile Picture',
          onPress: () => Alert.alert('Profile Picture', 'Update your profile photo')
        },
        { text: 'Cancel', style: 'cancel' }
      ]
    );
  };

  const handleNotificationSettings = () => {
    // This will be handled by the inline notification toggles
  };

  const handleSecuritySettings = () => {
    Alert.alert(
      'Security & Privacy',
      'Protect your KotaPay account',
      [
        {
          text: 'Transaction PIN',
          onPress: () => Alert.alert('Transaction PIN', 'Change your 4-digit transaction PIN')
        },
        {
          text: 'Two-Factor Authentication',
          onPress: () => Alert.alert('2FA Setup', 'Enable SMS or app-based 2FA for transactions')
        },
        {
          text: 'Biometric Login',
          onPress: () => Alert.alert('Biometric Security', 'Setup fingerprint or face unlock')
        },
        {
          text: 'Device Management',
          onPress: () => Alert.alert('Trusted Devices', 'Manage devices that can access your account')
        },
        {
          text: 'Session Management',
          onPress: () => Alert.alert('Active Sessions', 'View and logout from other devices')
        },
        { text: 'Cancel', style: 'cancel' }
      ]
    );
  };

  const handleHelpSupport = () => {
    Alert.alert(
      'Help & Support',
      'Get assistance with KotaPay',
      [
        {
          text: 'Transaction Issues',
          onPress: () => Alert.alert('Transaction Help', 'Report failed or disputed transactions')
        },
        {
          text: 'Card Problems',
          onPress: () => Alert.alert('Card Support', 'Issues with virtual card creation or usage')
        },
        {
          text: 'Account Recovery',
          onPress: () => Alert.alert('Account Recovery', 'Recover forgotten PIN or locked account')
        },
        {
          text: 'Live Chat Support',
          onPress: () => Alert.alert('Live Chat', 'Chat with KotaPay customer support')
        },
        {
          text: 'Call Support',
          onPress: () => Alert.alert('Phone Support', 'Call our 24/7 support line')
        },
        {
          text: 'Submit Feedback',
          onPress: () => Alert.alert('Feedback', 'Share your thoughts about KotaPay')
        },
        { text: 'Cancel', style: 'cancel' }
      ]
    );
  };

  const handleTermsPrivacy = () => {
    Alert.alert(
      'Legal & Compliance',
      'KotaPay legal documents',
      [
        {
          text: 'Terms of Service',
          onPress: () => Alert.alert('Terms of Service', 'KotaPay service agreement and user terms')
        },
        {
          text: 'Privacy Policy',
          onPress: () => Alert.alert('Privacy Policy', 'How KotaPay protects and uses your data')
        },
        {
          text: 'Card Terms & Conditions',
          onPress: () => Alert.alert('Card Terms', 'Virtual card usage terms and conditions')
        },
        {
          text: 'Transaction Fees',
          onPress: () => Alert.alert('Fee Schedule', 'Current transaction and service fees')
        },
        {
          text: 'Compliance & Regulations',
          onPress: () => Alert.alert('Compliance', 'KotaPay regulatory compliance information')
        },
        { text: 'Cancel', style: 'cancel' }
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
          <ChevronLeft size={24} color="#06402B" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Settings</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Main Settings */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Account Settings</Text>
          <View style={styles.card}>
            <SettingsItem
              icon={UserCheck}
              title="Account Profile"
              subtitle="Personal info, KYC verification, limits"
              onPress={handleProfileSettings}
              iconColor="#06402B"
              iconBackgroundColor="#06402B15"
            />

            <SettingsItem
              icon={Bell}
              title="Notification Preferences"
              subtitle="Transaction alerts, security notifications"
              onPress={handleNotificationSettings}
              iconColor="#FF9500"
              iconBackgroundColor="#FF950015"
            />

            <SettingsItem
              icon={Shield}
              title="Security & Privacy"
              subtitle="PIN, 2FA, biometric, device management"
              onPress={handleSecuritySettings}
              iconColor="#007AFF"
              iconBackgroundColor="#007AFF15"
            />

            <SettingsItem
              icon={HelpCircle}
              title="Help & Support"
              subtitle="Transaction help, live chat, account recovery"
              onPress={handleHelpSupport}
              iconColor="#34C759"
              iconBackgroundColor="#34C75915"
            />

            <SettingsItem
              icon={FileText}
              title="Legal & Compliance"
              subtitle="Terms, privacy, card conditions, fees"
              onPress={handleTermsPrivacy}
              iconColor="#8E8E93"
              iconBackgroundColor="#8E8E9315"
            />
          </View>
        </View>

        {/* Quick Toggles - Notifications */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Transaction Notifications</Text>
          <View style={styles.card}>
            <SettingsItem
              icon={Bell}
              title="Transaction Alerts"
              subtitle={pushNotifications ? 'Get notified of all transactions' : 'Transaction alerts disabled'}
              showArrow={false}
              rightComponent={
                <Switch
                  value={pushNotifications}
                  onValueChange={setPushNotifications}
                  trackColor={{ false: '#E5E5E5', true: '#06402B' }}
                  thumbColor="#FFFFFF"
                />
              }
              iconColor="#FF9500"
              iconBackgroundColor="#FF950015"
            />

            <SettingsItem
              icon={Mail}
              title="Email Receipts"
              subtitle={emailNotifications ? 'Send transaction receipts to email' : 'Email receipts disabled'}
              showArrow={false}
              rightComponent={
                <Switch
                  value={emailNotifications}
                  onValueChange={setEmailNotifications}
                  trackColor={{ false: '#E5E5E5', true: '#06402B' }}
                  thumbColor="#FFFFFF"
                />
              }
              iconColor="#007AFF"
              iconBackgroundColor="#007AFF15"
            />

            <SettingsItem
              icon={MessageCircle}
              title="Security Alerts"
              subtitle={smsNotifications ? 'SMS alerts for security events' : 'Security SMS alerts off'}
              showArrow={false}
              rightComponent={
                <Switch
                  value={smsNotifications}
                  onValueChange={setSmsNotifications}
                  trackColor={{ false: '#E5E5E5', true: '#06402B' }}
                  thumbColor="#FFFFFF"
                />
              }
              iconColor="#34C759"
              iconBackgroundColor="#34C75915"
            />
          </View>
        </View>

        {/* Quick Toggles - Security */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Security Preferences</Text>
          <View style={styles.card}>
            <SettingsItem
              icon={Lock}
              title="Biometric Authentication"
              subtitle={biometricEnabled ? 'Fingerprint/Face ID for app access' : 'Biometric authentication disabled'}
              showArrow={false}
              rightComponent={
                <Switch
                  value={biometricEnabled}
                  onValueChange={setBiometricEnabled}
                  trackColor={{ false: '#E5E5E5', true: '#06402B' }}
                  thumbColor="#FFFFFF"
                />
              }
              iconColor="#007AFF"
              iconBackgroundColor="#007AFF15"
            />

            <SettingsItem
              icon={Key}
              title="Transaction PIN Required"
              subtitle={autoLockEnabled ? 'PIN required for all transactions' : 'PIN not required for small amounts'}
              showArrow={false}
              rightComponent={
                <Switch
                  value={autoLockEnabled}
                  onValueChange={setAutoLockEnabled}
                  trackColor={{ false: '#E5E5E5', true: '#06402B' }}
                  thumbColor="#FFFFFF"
                />
              }
              iconColor="#FF9500"
              iconBackgroundColor="#FF950015"
            />

            <SettingsItem
              icon={Eye}
              title="Change Transaction PIN"
              subtitle="Update your 4-digit transaction PIN"
              onPress={() => Alert.alert('Change PIN', 'Navigate to PIN change screen for transactions')}
              iconColor="#FF3B30"
              iconBackgroundColor="#FF3B3015"
            />
          </View>
        </View>

        {/* Profile Quick Actions */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Account Management</Text>
          <View style={styles.card}>
            <SettingsItem
              icon={User}
              title="Personal Information"
              subtitle="Update name, address, and contact details"
              onPress={() => Alert.alert('Personal Info', 'Navigate to personal information screen')}
              iconColor="#06402B"
              iconBackgroundColor="#06402B15"
            />

            <SettingsItem
              icon={Camera}
              title="Identity Verification"
              subtitle="Upload ID documents for KYC verification"
              onPress={() => Alert.alert('KYC Verification', 'Complete identity verification process')}
              iconColor="#FF9500"
              iconBackgroundColor="#FF950015"
            />

            <SettingsItem
              icon={BarChart3}
              title="Account Limits"
              subtitle="View and upgrade transaction limits"
              onPress={() => Alert.alert('Account Limits', 'Current: ₦500,000 daily limit')}
              iconColor="#34C759"
              iconBackgroundColor="#34C75915"
            />

            <SettingsItem
              icon={DollarSign}
              title="Transaction History"
              subtitle="View detailed transaction records"
              onPress={() => Alert.alert('Transaction History', 'Navigate to full transaction history')}
              iconColor="#007AFF"
              iconBackgroundColor="#007AFF15"
            />
          </View>
        </View>

        {/* Financial Settings */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Financial Settings</Text>
          <View style={styles.card}>
            <SettingsItem
              icon={CreditCard}
              title="Virtual Card Settings"
              subtitle="Manage your virtual cards and limits"
              onPress={() => Alert.alert('Card Settings', 'Configure virtual card preferences')}
              iconColor="#06402B"
              iconBackgroundColor="#06402B15"
            />

            <SettingsItem
              icon={TrendingUp}
              title="Spending Analytics"
              subtitle="View spending patterns and budgets"
              onPress={() => Alert.alert('Analytics', 'View your spending insights')}
              iconColor="#FF9500"
              iconBackgroundColor="#FF950015"
            />

            <SettingsItem
              icon={Settings}
              title="Payment Preferences"
              subtitle="Default payment methods and settings"
              onPress={() => Alert.alert('Payment Settings', 'Configure payment preferences')}
              iconColor="#8E8E93"
              iconBackgroundColor="#8E8E9315"
            />
          </View>
        </View>

        <View style={styles.bottomPadding} />
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5E5',
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F8F9FA',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#E5E5E5',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#06402B',
  },
  placeholder: {
    width: 40,
  },
  content: {
    flex: 1,
  },
  section: {
    paddingHorizontal: 20,
    marginTop: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#06402B',
    marginBottom: 12,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  settingsItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F5F5F5',
    minHeight: 72,
  },
  itemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  itemText: {
    flex: 1,
  },
  itemTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: '#06402B',
    marginBottom: 2,
  },
  itemSubtitle: {
    fontSize: 14,
    color: '#A3AABE',
    lineHeight: 18,
  },
  itemRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  bottomPadding: {
    height: 32,
  },
});

export default SettingsMainScreen;
