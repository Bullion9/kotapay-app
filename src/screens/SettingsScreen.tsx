import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Switch,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  Mail,
  Globe,
  Shield,
  Moon,
  Info,
  MessageCircle,
  ChevronRight,
  Fingerprint,
  Lock,
  Smartphone,
  Palette,
  MessageSquare,
  Users,
  HeadphonesIcon,
  RefreshCw,
} from 'lucide-react-native';
import { colors, spacing, typography, borderRadius, shadows, iconSizes } from '../theme';

interface SettingsItemProps {
  icon: React.ComponentType<any>;
  title: string;
  subtitle?: string;
  onPress?: () => void;
  showChevron?: boolean;
  rightComponent?: React.ReactNode;
  iconColor?: string;
}

interface Currency {
  code: string;
  name: string;
  symbol: string;
}

interface Language {
  code: string;
  name: string;
}

const SettingsScreen: React.FC = () => {
  // State for toggles
  const [pushNotifications, setPushNotifications] = useState(true);
  const [emailNotifications, setEmailNotifications] = useState(false);
  const [biometricsEnabled, setBiometricsEnabled] = useState(true);
  const [darkModeEnabled, setDarkModeEnabled] = useState(false);
  
  // State for selections
  const [selectedCurrency, setSelectedCurrency] = useState<Currency>({
    code: 'NGN',
    name: 'Nigerian Naira',
    symbol: '₦'
  });
  
  const [selectedLanguage, setSelectedLanguage] = useState<Language>({
    code: 'en',
    name: 'English'
  });

  const [darkMode, setDarkMode] = useState(false);

  const currencies: Currency[] = [
    { code: 'NGN', name: 'Nigerian Naira', symbol: '₦' },
    { code: 'USD', name: 'US Dollar', symbol: '$' },
    { code: 'EUR', name: 'Euro', symbol: '€' },
    { code: 'GBP', name: 'British Pound', symbol: '£' },
    { code: 'JPY', name: 'Japanese Yen', symbol: '¥' },
    { code: 'CAD', name: 'Canadian Dollar', symbol: 'C$' },
  ];

  const languages: Language[] = [
    { code: 'en', name: 'English' },
    { code: 'es', name: 'Spanish' },
    { code: 'fr', name: 'French' },
    { code: 'de', name: 'German' },
    { code: 'zh', name: 'Chinese' },
  ];

  const handleCurrencyChange = () => {
    Alert.alert(
      'Select Currency',
      'Choose your preferred currency',
      [
        ...currencies.map(currency => ({
          text: `${currency.symbol} ${currency.name}`,
          onPress: () => setSelectedCurrency(currency),
        })),
        { text: 'Cancel', style: 'cancel' as const }
      ]
    );
  };

  const handleLanguageChange = () => {
    Alert.alert(
      'Select Language',
      'Choose your preferred language',
      [
        ...languages.map(language => ({
          text: language.name,
          onPress: () => setSelectedLanguage(language),
        })),
        { text: 'Cancel', style: 'cancel' as const }
      ]
    );
  };

  const handleSecuritySettings = () => {
    Alert.alert('Security Settings', 'Navigate to detailed security settings');
  };

  const handleAbout = () => {
    Alert.alert('About KotaPay', 'Version 1.0.0\n\nA secure and simple payment app for all your financial needs.');
  };

  const handleSupport = () => {
    Alert.alert(
      'Help & Support',
      'How would you like to get help?',
      [
        { text: 'Email Support', onPress: () => Alert.alert('Email', 'Opening email client...') },
        { text: 'Live Chat', onPress: () => Alert.alert('Chat', 'Opening chat support...') },
        { text: 'FAQ', onPress: () => Alert.alert('FAQ', 'Opening FAQ section...') },
        { text: 'Cancel', style: 'cancel' },
      ]
    );
  };

  const handleSuggestionBox = () => {
    Alert.prompt(
      'Suggestion Box',
      'We value your feedback! Please share your suggestions or ideas to help us improve KotaPay.',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Submit',
          onPress: (text) => {
            if (text && text.trim()) {
              Alert.alert('Thank You!', 'Your suggestion has been submitted. We appreciate your feedback!');
            }
          },
        },
      ],
      'plain-text',
      '',
      'What would you like to suggest?'
    );
  };

  const handleReferFriend = () => {
    Alert.alert(
      'Refer a Friend',
      'Invite your friends to KotaPay and earn rewards!',
      [
        { text: 'Share via SMS', onPress: () => Alert.alert('SMS', 'Opening SMS with referral link...') },
        { text: 'Share via Email', onPress: () => Alert.alert('Email', 'Opening email with referral link...') },
        { text: 'Copy Link', onPress: () => Alert.alert('Copied!', 'Referral link copied to clipboard') },
        { text: 'Cancel', style: 'cancel' },
      ]
    );
  };

  const handleContactSupport = () => {
    Alert.alert(
      'Contact Support',
      'Need help? Choose how you\'d like to contact us.',
      [
        { text: 'Phone Support', onPress: () => Alert.alert('Phone', 'Calling support: +1-800-KOTAPAY') },
        { text: 'Email Support', onPress: () => Alert.alert('Email', 'Opening email: support@kotapay.com') },
        { text: 'Live Chat', onPress: () => Alert.alert('Chat', 'Opening live chat...') },
        { text: 'Cancel', style: 'cancel' },
      ]
    );
  };

  const handleAppUpdate = () => {
    Alert.alert(
      'App Update',
      'Check for the latest version of KotaPay',
      [
        { text: 'Check for Updates', onPress: () => Alert.alert('Update', 'You have the latest version!') },
        { text: 'Cancel', style: 'cancel' },
      ]
    );
  };

  const SettingsItem: React.FC<SettingsItemProps> = ({
    icon: Icon,
    title,
    subtitle,
    onPress,
    showChevron = true,
    rightComponent,
    iconColor = colors.primary,
  }) => (
    <TouchableOpacity 
      style={styles.settingsItem} 
      onPress={onPress}
      disabled={!onPress && !rightComponent}
    >
      <View style={styles.settingsItemLeft}>
        <View style={[styles.settingsItemIcon, { backgroundColor: `${iconColor}15` }]}>
          <Icon size={iconSizes.md} color={iconColor} />
        </View>
        <View style={styles.settingsItemContent}>
          <Text style={styles.settingsItemTitle}>{title}</Text>
          {subtitle && (
            <Text style={styles.settingsItemSubtitle}>{subtitle}</Text>
          )}
        </View>
      </View>
      <View style={styles.settingsItemRight}>
        {rightComponent}
        {showChevron && onPress && (
          <ChevronRight size={iconSizes.sm} color={colors.secondaryText} />
        )}
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Settings</Text>
        </View>

        {/* Notifications */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Notifications</Text>
          <View style={styles.sectionContent}>
            <SettingsItem
              icon={Mail}
              title="Push Notifications"
              subtitle={pushNotifications ? 'Enabled' : 'Disabled'}
              showChevron={false}
              rightComponent={
                <Switch
                  value={pushNotifications}
                  onValueChange={setPushNotifications}
                  trackColor={{ false: colors.border, true: colors.primary }}
                  thumbColor={colors.white}
                />
              }
            />
            <SettingsItem
              icon={Mail}
              title="Email Notifications"
              subtitle={emailNotifications ? 'Enabled' : 'Disabled'}
              showChevron={false}
              rightComponent={
                <Switch
                  value={emailNotifications}
                  onValueChange={setEmailNotifications}
                  trackColor={{ false: colors.border, true: colors.primary }}
                  thumbColor={colors.white}
                />
              }
            />
          </View>
        </View>

        {/* Preferences */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Preferences</Text>
          <View style={styles.sectionContent}>
            <SettingsItem
              icon={Globe}
              title="Currency"
              subtitle={`${selectedCurrency.symbol} ${selectedCurrency.name}`}
              onPress={handleCurrencyChange}
              iconColor={colors.success}
            />
            <SettingsItem
              icon={Globe}
              title="Language"
              subtitle={selectedLanguage.name}
              onPress={handleLanguageChange}
              iconColor={colors.warning}
            />
            <SettingsItem
              icon={Palette}
              title="Theme"
              subtitle={darkMode ? "Dark Mode" : "Light Mode"}
              showChevron={false}
              rightComponent={
                <Switch
                  value={darkMode}
                  onValueChange={setDarkMode}
                  trackColor={{ false: '#E5E5E5', true: colors.primary }}
                  thumbColor={darkMode ? '#FFFFFF' : '#F4F3F4'}
                />
              }
              iconColor={colors.primary}
            />
            <SettingsItem
              icon={Moon}
              title="Dark Mode"
              subtitle={darkModeEnabled ? 'Enabled' : 'Disabled'}
              showChevron={false}
              rightComponent={
                <Switch
                  value={darkModeEnabled}
                  onValueChange={setDarkModeEnabled}
                  trackColor={{ false: colors.border, true: colors.primary }}
                  thumbColor={colors.white}
                />
              }
              iconColor={colors.accent}
            />
          </View>
        </View>

        {/* Security */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Security</Text>
          <View style={styles.sectionContent}>
            <SettingsItem
              icon={Fingerprint}
              title="Biometric Authentication"
              subtitle={biometricsEnabled ? 'Enabled' : 'Disabled'}
              showChevron={false}
              rightComponent={
                <Switch
                  value={biometricsEnabled}
                  onValueChange={setBiometricsEnabled}
                  trackColor={{ false: colors.border, true: colors.primary }}
                  thumbColor={colors.white}
                />
              }
              iconColor={colors.primary}
            />
            <SettingsItem
              icon={Lock}
              title="Change PIN"
              subtitle="Update your security PIN"
              onPress={() => Alert.alert('Change PIN', 'Navigate to PIN change screen')}
              iconColor={colors.error}
            />
            <SettingsItem
              icon={Shield}
              title="Security Settings"
              subtitle="Advanced security options"
              onPress={handleSecuritySettings}
              iconColor={colors.accent}
            />
          </View>
        </View>

        {/* Device */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Device</Text>
          <View style={styles.sectionContent}>
            <SettingsItem
              icon={Smartphone}
              title="Device Management"
              subtitle="Manage trusted devices"
              onPress={() => Alert.alert('Device Management', 'Navigate to device management')}
              iconColor={colors.warning}
            />
          </View>
        </View>

        {/* Support */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Support</Text>
          <View style={styles.sectionContent}>
            <SettingsItem
              icon={MessageCircle}
              title="Help & Support"
              subtitle="Get help with your account"
              onPress={handleSupport}
              iconColor={colors.success}
            />
            <SettingsItem
              icon={Info}
              title="About"
              subtitle="App version and information"
              onPress={handleAbout}
              iconColor={colors.primary}
            />
          </View>
        </View>

        {/* Feedback & Community */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Feedback & Community</Text>
          <View style={styles.sectionContent}>
            <SettingsItem
              icon={MessageSquare}
              title="Suggestion Box"
              subtitle="Share your ideas to improve KotaPay"
              onPress={handleSuggestionBox}
              iconColor={colors.accent}
            />
            <SettingsItem
              icon={Users}
              title="Refer a Friend"
              subtitle="Invite friends and earn rewards"
              onPress={handleReferFriend}
              iconColor={colors.success}
            />
          </View>
        </View>

        {/* Additional Support */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Additional Support</Text>
          <View style={styles.sectionContent}>
            <SettingsItem
              icon={HeadphonesIcon}
              title="Contact Support"
              subtitle="Get direct help from our team"
              onPress={handleContactSupport}
              iconColor={colors.primary}
            />
            <SettingsItem
              icon={RefreshCw}
              title="App Updates"
              subtitle="Check for latest version"
              onPress={handleAppUpdate}
              iconColor={colors.warning}
            />
          </View>
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
  header: {
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  headerTitle: {
    ...typography.h2,
    color: colors.text,
    fontWeight: '600',
  },
  section: {
    marginTop: spacing.xl,
  },
  sectionTitle: {
    fontSize: 18,
    color: colors.text,
    fontWeight: '600',
    marginBottom: spacing.md,
    paddingHorizontal: spacing.xl,
  },
  sectionContent: {
    backgroundColor: colors.white,
    marginHorizontal: spacing.xl,
    borderRadius: borderRadius.large,
    ...shadows.small,
  },
  settingsItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  settingsItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  settingsItemIcon: {
    width: 45,
    height: 45,
    borderRadius: 22.5,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  settingsItemContent: {
    flex: 1,
  },
  settingsItemTitle: {
    ...typography.body,
    color: colors.text,
    fontWeight: '600',
    marginBottom: 2,
  },
  settingsItemSubtitle: {
    ...typography.caption,
    color: colors.secondaryText,
  },
  settingsItemRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  bottomSpacing: {
    height: spacing.xxl,
  },
});

export default SettingsScreen;
