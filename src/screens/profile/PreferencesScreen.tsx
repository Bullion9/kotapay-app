import * as Haptics from 'expo-haptics';
import {
    Bell,
    ChevronLeft,
    ChevronRight,
    DollarSign,
    Languages,
    Mail,
    Moon,
    Phone,
    Sun,
} from 'lucide-react-native';
import React, { useState } from 'react';
import {
    Alert,
    SafeAreaView,
    ScrollView,
    StatusBar,
    StyleSheet,
    Switch,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';

const PreferencesScreen: React.FC = () => {
  const [settings, setSettings] = useState({
    currency: '₦',
    language: 'English',
    darkMode: false,
    notifications: {
      push: true,
      email: true,
      sms: false,
    },
  });

  const handleToggleChange = async (key: string, value: boolean) => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    
    if (key.startsWith('notifications.')) {
      const notificationKey = key.split('.')[1];
      setSettings(prev => ({
        ...prev,
        notifications: { ...prev.notifications, [notificationKey]: value }
      }));
    } else {
      setSettings(prev => ({ ...prev, [key]: value }));
    }
  };

  const handleCurrencyChange = async () => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    Alert.alert(
      'Change Currency',
      'Select your preferred currency',
      [
        { text: 'Nigerian Naira (₦)', onPress: () => updateCurrency('₦') },
        { text: 'US Dollar ($)', onPress: () => updateCurrency('$') },
        { text: 'Euro (€)', onPress: () => updateCurrency('€') },
        { text: 'Cancel', style: 'cancel' },
      ]
    );
  };

  const handleLanguageChange = async () => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    Alert.alert(
      'Change Language',
      'Select your preferred language',
      [
        { text: 'English', onPress: () => updateLanguage('English') },
        { text: 'Yoruba', onPress: () => updateLanguage('Yoruba') },
        { text: 'Hausa', onPress: () => updateLanguage('Hausa') },
        { text: 'Igbo', onPress: () => updateLanguage('Igbo') },
        { text: 'Cancel', style: 'cancel' },
      ]
    );
  };

  const updateCurrency = (currency: string) => {
    setSettings(prev => ({ ...prev, currency }));
  };

  const updateLanguage = (language: string) => {
    setSettings(prev => ({ ...prev, language }));
  };

  const goBack = async () => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    console.log('Going back to profile');
  };

  const renderActionRow = (
    icon: React.ReactNode,
    label: string,
    onPress: () => void,
    subtitle?: string
  ) => (
    <TouchableOpacity
      style={styles.actionRow}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View style={styles.rowLeft}>
        {icon}
        <View style={styles.rowText}>
          <Text style={styles.rowLabel}>{label}</Text>
          {subtitle && <Text style={styles.rowSubtitle}>{subtitle}</Text>}
        </View>
      </View>
      <ChevronRight size={20} color="#A3AABE" />
    </TouchableOpacity>
  );

  const renderToggleRow = (
    icon: React.ReactNode,
    label: string,
    value: boolean,
    onToggle: (value: boolean) => void,
    subtitle?: string
  ) => (
    <View style={styles.toggleRow}>
      <View style={styles.rowLeft}>
        {icon}
        <View style={styles.rowText}>
          <Text style={styles.rowLabel}>{label}</Text>
          {subtitle && <Text style={styles.rowSubtitle}>{subtitle}</Text>}
        </View>
      </View>
      <Switch
        value={value}
        onValueChange={onToggle}
        trackColor={{ false: '#E5E5E5', true: '#A8E4A0' }}
        thumbColor={value ? '#06402B' : '#FFFFFF'}
        ios_backgroundColor="#E5E5E5"
      />
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFF0F5" />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={goBack}>
          <ChevronLeft size={24} color="#06402B" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Preferences</Text>
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.content}>
          <Text style={styles.description}>
            Customize your app experience with personalized settings and preferences.
          </Text>

          {/* App Settings */}
          <View style={styles.card}>
            <Text style={styles.cardTitle}>App Settings</Text>
            {renderActionRow(
              <DollarSign size={20} color="#06402B" />,
              'Currency',
              handleCurrencyChange,
              settings.currency
            )}
            {renderActionRow(
              <Languages size={20} color="#06402B" />,
              'Language',
              handleLanguageChange,
              settings.language
            )}
            {renderToggleRow(
              settings.darkMode ? (
                <Moon size={20} color="#06402B" />
              ) : (
                <Sun size={20} color="#06402B" />
              ),
              'Dark Mode',
              settings.darkMode,
              (value) => handleToggleChange('darkMode', value)
            )}
          </View>

          {/* Notifications */}
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Notifications</Text>
            {renderToggleRow(
              <Bell size={20} color="#06402B" />,
              'Push Notifications',
              settings.notifications.push,
              (value) => handleToggleChange('notifications.push', value),
              'Receive notifications on your device'
            )}
            {renderToggleRow(
              <Mail size={20} color="#06402B" />,
              'Email Notifications',
              settings.notifications.email,
              (value) => handleToggleChange('notifications.email', value),
              'Receive notifications via email'
            )}
            {renderToggleRow(
              <Phone size={20} color="#06402B" />,
              'SMS Notifications',
              settings.notifications.sms,
              (value) => handleToggleChange('notifications.sms', value),
              'Receive notifications via SMS'
            )}
          </View>

          {/* Information */}
          <View style={styles.infoNote}>
            <Bell size={16} color="#06402B" />
            <Text style={styles.infoText}>
              You can change these preferences anytime. Some notifications are required for security purposes.
            </Text>
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
  actionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F5F5F5',
    minHeight: 48,
  },
  toggleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F5F5F5',
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
  infoNote: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#F0F8F0',
    padding: 12,
    borderRadius: 8,
    marginTop: 16,
  },
  infoText: {
    fontSize: 12,
    color: '#06402B',
    marginLeft: 8,
    flex: 1,
    lineHeight: 16,
  },
});

export default PreferencesScreen;
