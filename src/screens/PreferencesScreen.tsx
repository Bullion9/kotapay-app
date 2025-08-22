import { useNavigation } from '@react-navigation/native';
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
    Vibrate,
    Volume2,
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
import { useTheme } from '../contexts/ThemeContext';
import { useFeedback } from '../hooks/useFeedback';

const PreferencesScreen: React.FC = () => {
  const { soundEnabled, setSoundEnabled, hapticFeedback, setHapticFeedback, isDarkMode, setThemeMode, colors } = useTheme();
  const feedback = useFeedback();
  const navigation = useNavigation();
  
  const [settings, setSettings] = useState({
    currency: '₦',
    language: 'English',
    notifications: {
      push: true,
      email: true,
      sms: false,
    },
  });

  const goBack = async () => {
    feedback.buttonPress();
    navigation.goBack();
  };

  const handleToggleChange = async (key: string, value: boolean) => {
    // Use feedback system for haptic and sound
    feedback.buttonPress();
    
    if (key === 'darkMode') {
      setThemeMode(value ? 'dark' : 'light');
    } else if (key === 'soundEnabled') {
      setSoundEnabled(value);
    } else if (key === 'hapticFeedback') {
      setHapticFeedback(value);
    } else if (key.startsWith('notifications.')) {
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
    feedback.buttonPress();
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
    feedback.buttonPress();
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

  const renderActionRow = (
    icon: React.ReactNode,
    label: string,
    onPress: () => void,
    subtitle?: string
  ) => (
    <TouchableOpacity
      style={[styles.actionRow, { borderBottomColor: isDarkMode ? colors.border : '#F5F5F5' }]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View style={styles.rowLeft}>
        {icon}
        <View style={styles.rowText}>
          <Text style={[styles.rowLabel, { color: isDarkMode ? colors.text : '#06402B' }]}>{label}</Text>
          {subtitle && <Text style={[styles.rowSubtitle, { color: isDarkMode ? colors.secondaryText : '#A3AABE' }]}>{subtitle}</Text>}
        </View>
      </View>
      <ChevronRight size={20} color={isDarkMode ? colors.secondaryText : '#A3AABE'} />
    </TouchableOpacity>
  );

  const renderToggleRow = (
    icon: React.ReactNode,
    label: string,
    value: boolean,
    onToggle: (value: boolean) => void,
    subtitle?: string
  ) => (
    <View style={[styles.toggleRow, { borderBottomColor: isDarkMode ? colors.border : '#F5F5F5' }]}>
      <View style={styles.rowLeft}>
        {icon}
        <View style={styles.rowText}>
          <Text style={[styles.rowLabel, { color: isDarkMode ? colors.text : '#06402B' }]}>{label}</Text>
          {subtitle && <Text style={[styles.rowSubtitle, { color: isDarkMode ? colors.secondaryText : '#A3AABE' }]}>{subtitle}</Text>}
        </View>
      </View>
      <Switch
        value={value}
        onValueChange={onToggle}
        trackColor={{ 
          false: isDarkMode ? colors.border : '#E5E5E5', 
          true: isDarkMode ? colors.primaryTransparent : '#A8E4A0' 
        }}
        thumbColor={value ? (isDarkMode ? colors.primary : '#06402B') : '#FFFFFF'}
        ios_backgroundColor={isDarkMode ? colors.border : '#E5E5E5'}
      />
    </View>
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: isDarkMode ? colors.background : '#FFF0F5' }]}>
      <StatusBar 
        barStyle={isDarkMode ? "light-content" : "dark-content"} 
        backgroundColor={isDarkMode ? colors.background : '#FFF0F5'} 
      />
      
      {/* Header */}
      <View style={[styles.header, { 
        backgroundColor: isDarkMode ? colors.background : '#FFF0F5',
        borderBottomColor: isDarkMode ? colors.border : '#F0F0F0'
      }]}>
        <TouchableOpacity style={styles.backButton} onPress={goBack}>
          <ChevronLeft size={24} color={isDarkMode ? colors.primary : '#06402B'} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: isDarkMode ? colors.primary : '#06402B' }]}>Preferences</Text>
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.content}>
          <Text style={[styles.description, { color: isDarkMode ? colors.secondaryText : '#A3AABE' }]}>
            Customize your app experience with personalized settings and preferences.
          </Text>

          {/* App Settings */}
          <View style={[styles.card, { backgroundColor: isDarkMode ? colors.card : '#FFFFFF' }]}>
            <Text style={[styles.cardTitle, { color: isDarkMode ? colors.primary : '#06402B' }]}>App Settings</Text>
            {renderToggleRow(
              isDarkMode ? (
                <Moon size={20} color={isDarkMode ? colors.primary : '#06402B'} />
              ) : (
                <Sun size={20} color={isDarkMode ? colors.primary : '#06402B'} />
              ),
              'Dark Mode',
              isDarkMode,
              (value) => handleToggleChange('darkMode', value)
            )}
            {renderToggleRow(
              <Volume2 size={20} color={isDarkMode ? colors.primary : '#06402B'} />,
              'Sound Effects',
              soundEnabled,
              (value) => handleToggleChange('soundEnabled', value),
              'Enable sound effects for app interactions'
            )}
            {renderToggleRow(
              <Vibrate size={20} color={isDarkMode ? colors.primary : '#06402B'} />,
              'Haptic Feedback',
              hapticFeedback,
              (value) => handleToggleChange('hapticFeedback', value),
              'Enable vibration feedback for touches'
            )}
            {renderActionRow(
              <DollarSign size={20} color={isDarkMode ? colors.primary : '#06402B'} />,
              'Currency',
              handleCurrencyChange,
              settings.currency
            )}
            {renderActionRow(
              <Languages size={20} color={isDarkMode ? colors.primary : '#06402B'} />,
              'Language',
              handleLanguageChange,
              settings.language
            )}
          </View>

          {/* Notifications */}
          <View style={[styles.card, { backgroundColor: isDarkMode ? colors.card : '#FFFFFF' }]}>
            <Text style={[styles.cardTitle, { color: isDarkMode ? colors.primary : '#06402B' }]}>Notifications</Text>
            {renderToggleRow(
              <Bell size={20} color={isDarkMode ? colors.primary : '#06402B'} />,
              'Push Notifications',
              settings.notifications.push,
              (value) => handleToggleChange('notifications.push', value),
              'Receive notifications on your device'
            )}
            {renderToggleRow(
              <Mail size={20} color={isDarkMode ? colors.primary : '#06402B'} />,
              'Email Notifications',
              settings.notifications.email,
              (value) => handleToggleChange('notifications.email', value),
              'Receive notifications via email'
            )}
            {renderToggleRow(
              <Phone size={20} color={isDarkMode ? colors.primary : '#06402B'} />,
              'SMS Notifications',
              settings.notifications.sms,
              (value) => handleToggleChange('notifications.sms', value),
              'Receive notifications via SMS'
            )}
          </View>

          {/* Information */}
          <View style={[styles.infoNote, { backgroundColor: isDarkMode ? colors.primaryTransparent : '#F0F8F0' }]}>
            <Bell size={16} color={isDarkMode ? colors.primary : '#06402B'} />
            <Text style={[styles.infoText, { color: isDarkMode ? colors.primary : '#06402B' }]}>
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
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  backButton: {
    padding: 8,
    marginRight: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: 16,
  },
  description: {
    fontSize: 14,
    marginBottom: 24,
    lineHeight: 20,
  },
  card: {
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
    marginBottom: 16,
  },
  actionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
    minHeight: 48,
  },
  toggleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
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
    fontWeight: '500',
  },
  rowSubtitle: {
    fontSize: 12,
    marginTop: 2,
  },
  infoNote: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    padding: 12,
    borderRadius: 8,
    marginTop: 16,
  },
  infoText: {
    fontSize: 12,
    marginLeft: 8,
    flex: 1,
    lineHeight: 16,
  },
});

export default PreferencesScreen;
