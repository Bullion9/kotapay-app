import {
    ChevronRight,
    Fingerprint,
    Globe,
    Lock,
    Mail,
    Palette,
    Shield,
    Smartphone,
} from 'lucide-react-native';
import React, { useState } from 'react';
import {
    Alert,
    ScrollView,
    StyleSheet,
    Switch,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '../contexts/ThemeContext';
import { borderRadius, iconSizes, shadows, spacing, typography } from '../theme';

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
  const { themeMode, setThemeMode, colors } = useTheme();
  
  // State for toggles
  const [pushNotifications, setPushNotifications] = useState(true);
  const [emailNotifications, setEmailNotifications] = useState(false);
  const [biometricsEnabled, setBiometricsEnabled] = useState(true);
  
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

  const handleThemeChange = () => {
    Alert.alert(
      'Select Theme',
      'Choose your preferred theme',
      [
        { 
          text: 'Light', 
          onPress: () => setThemeMode('light'),
          style: themeMode === 'light' ? 'default' : undefined
        },
        { 
          text: 'Dark', 
          onPress: () => setThemeMode('dark'),
          style: themeMode === 'dark' ? 'default' : undefined
        },
        { 
          text: 'System', 
          onPress: () => setThemeMode('system'),
          style: themeMode === 'system' ? 'default' : undefined
        },
        { text: 'Cancel', style: 'cancel' }
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
      backgroundColor: colors.card,
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
              subtitle={themeMode === 'dark' ? "Dark" : themeMode === 'light' ? "Light" : `System`}
              onPress={handleThemeChange}
              iconColor={colors.primary}
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
              onPress={() => Alert.alert('Security Settings', 'Navigate to detailed security settings')}
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

        <View style={styles.bottomSpacing} />
      </ScrollView>
    </SafeAreaView>
  );
};

export default SettingsScreen;
