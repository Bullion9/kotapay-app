import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { Alert, Vibration } from 'react-native';

export interface PreferenceSettings {
  darkMode: boolean;
  soundEnabled: boolean;
  language: string;
  timeFormat24h: boolean;
  currencyFormat: string;
  hapticFeedback: boolean;
}

interface PreferencesContextType {
  settings: PreferenceSettings;
  updateSettings: (newSettings: Partial<PreferenceSettings>) => Promise<void>;
  updateSetting: (key: keyof PreferenceSettings, value: any) => Promise<void>;
  formatCurrency: (amount: number, currency?: string) => string;
  formatTime: (date: Date) => string;
  formatDate: (date: Date) => string;
  translate: (key: string) => string;
  playSound: (soundType: 'success' | 'error' | 'notification' | 'button') => Promise<void>;
  triggerHaptic: (type: 'light' | 'medium' | 'heavy' | 'success' | 'warning' | 'error') => Promise<void>;
  isLoading: boolean;
}

const STORAGE_KEY = 'kotapay_preferences';

const defaultSettings: PreferenceSettings = {
  darkMode: false,
  soundEnabled: true,
  language: 'en',
  timeFormat24h: false,
  currencyFormat: 'NGN',
  hapticFeedback: true,
};

// Enhanced translations with more comprehensive coverage
const translations: Record<string, Record<string, string>> = {
  en: {
    // Common
    'common.cancel': 'Cancel',
    'common.save': 'Save',
    'common.edit': 'Edit',
    'common.delete': 'Delete',
    'common.back': 'Back',
    'common.next': 'Next',
    'common.done': 'Done',
    'common.yes': 'Yes',
    'common.no': 'No',
    'common.ok': 'OK',
    'common.loading': 'Loading...',
    'common.error': 'Error',
    'common.success': 'Success',
    'common.warning': 'Warning',
    'common.info': 'Information',

    // Navigation
    'nav.home': 'Home',
    'nav.cards': 'Cards',
    'nav.contacts': 'Contacts',
    'nav.history': 'History',
    'nav.profile': 'Profile',
    'nav.settings': 'Settings',
    'nav.preferences': 'Preferences',

    // Transactions
    'transaction.send': 'Send Money',
    'transaction.receive': 'Receive Money',
    'transaction.request': 'Request Money',
    'transaction.status.pending': 'Pending',
    'transaction.status.completed': 'Completed',
    'transaction.status.failed': 'Failed',
    'transaction.amount': 'Amount',
    'transaction.recipient': 'Recipient',
    'transaction.date': 'Date',
    'transaction.time': 'Time',

    // Settings & Preferences
    'settings.title': 'Settings',
    'settings.language': 'Language',
    'settings.currency': 'Currency Format',
    'settings.darkMode': 'Dark Mode',
    'settings.sound': 'Sound',
    'settings.timeFormat': '24-hour Time',
    'settings.hapticFeedback': 'Haptic Feedback',
    'settings.notifications': 'Notifications',

    // Profile
    'profile.personalInfo': 'Personal Information',
    'profile.accountSettings': 'Account Settings',
    'profile.security': 'Security Settings',
    'profile.paymentMethods': 'Payment Methods',
    'profile.help': 'Help & Support',
    'profile.signOut': 'Sign Out',

    // Time formats
    'time.am': 'AM',
    'time.pm': 'PM',
    'time.today': 'Today',
    'time.yesterday': 'Yesterday',
    'time.tomorrow': 'Tomorrow',

    // Currency
    'currency.naira': 'Nigerian Naira',
    'currency.dollar': 'US Dollar',
    'currency.pound': 'British Pound',
    'currency.euro': 'Euro',
    'currency.cedi': 'Ghanaian Cedi',
  },
  yo: {
    // Common (Yoruba)
    'common.cancel': 'Fagilee',
    'common.save': 'Fipamọ',
    'common.edit': 'Ṣatunkọ',
    'common.delete': 'Pare',
    'common.back': 'Pada',
    'common.next': 'Tẹle',
    'common.done': 'Ṣe',
    'common.yes': 'Bẹẹni',
    'common.no': 'Rara',
    'common.ok': 'O dara',
    'common.loading': 'N ṣiṣẹ...',
    'common.error': 'Aṣiṣe',
    'common.success': 'Aṣeyọri',
    'common.warning': 'Ikilọ',

    // Navigation
    'nav.home': 'Ile',
    'nav.cards': 'Kaadi',
    'nav.contacts': 'Awọn Olubasọrọ',
    'nav.history': 'Itan',
    'nav.profile': 'Profaili',
    'nav.settings': 'Eto',
    'nav.preferences': 'Awọn aṣayan',

    // Settings
    'settings.language': 'Ede',
    'settings.currency': 'Owo ilu',
    'settings.darkMode': 'Ipo dudu',
    'settings.sound': 'Ariwo',
    'settings.timeFormat': 'Akoko wakati 24',
  },
  ha: {
    // Common (Hausa)
    'common.cancel': 'Soke',
    'common.save': 'Ajiye',
    'common.edit': 'Gyara',
    'common.delete': 'Share',
    'common.back': 'Koma',
    'common.next': 'Na gaba',
    'common.done': 'An gama',
    'common.yes': 'Eh',
    'common.no': "A'a",
    'common.ok': 'To',
    'common.loading': 'Ana lodawa...',
    'common.error': 'Kuskure',
    'common.success': 'Nasara',

    // Navigation
    'nav.home': 'Gida',
    'nav.cards': 'Katuna',
    'nav.contacts': 'Abokan hulda',
    'nav.history': 'Tarihi',
    'nav.profile': 'Bayani',
    'nav.settings': 'Saiti',

    // Settings
    'settings.language': 'Harshe',
    'settings.currency': 'Nau\'in kudi',
    'settings.darkMode': 'Yanayin duhu',
    'settings.sound': 'Sauti',
  },
  ig: {
    // Common (Igbo)
    'common.cancel': 'Kwụsị',
    'common.save': 'Chekwa',
    'common.edit': 'Dezie',
    'common.delete': 'Hichapụ',
    'common.back': 'Azụ',
    'common.next': "Gaa n'ihu",
    'common.done': 'Emela',
    'common.yes': 'Ee',
    'common.no': 'Mba',
    'common.ok': 'O di mma',
    'common.loading': 'Na-ebu...',
    'common.error': 'Njehie',
    'common.success': 'Ihe ịga nke ọma',

    // Navigation
    'nav.home': 'Ụlọ',
    'nav.cards': 'Kaadị',
    'nav.contacts': 'Ndị enyi',
    'nav.history': 'Akụkọ',
    'nav.profile': 'Profaịlụ',
    'nav.settings': 'Ntọala',

    // Settings
    'settings.language': 'Asụsụ',
    'settings.currency': 'Ego',
    'settings.darkMode': 'Ọnọdụ gbara ọchịchịrị',
    'settings.sound': 'Ụda',
  },
  pcm: {
    // Common (Nigerian Pidgin)
    'common.cancel': 'Cancel am',
    'common.save': 'Save am',
    'common.edit': 'Change am',
    'common.delete': 'Comot am',
    'common.back': 'Go back',
    'common.next': 'Next one',
    'common.done': 'Don finish',
    'common.yes': 'Yes',
    'common.no': 'No',
    'common.ok': 'Okay',
    'common.loading': 'Dey load...',
    'common.error': 'Problem',
    'common.success': 'E work',

    // Navigation
    'nav.home': 'House',
    'nav.cards': 'Card dem',
    'nav.contacts': 'People wey I sabi',
    'nav.history': 'Wetin don happen',
    'nav.profile': 'My profile',
    'nav.settings': 'Settings',

    // Settings
    'settings.language': 'Language',
    'settings.currency': 'Money type',
    'settings.darkMode': 'Dark mode',
    'settings.sound': 'Sound',
  },
};

// Currency formatters with proper localization
const currencyFormatters: Record<string, (amount: number) => string> = {
  NGN: (amount: number) => `₦${amount.toLocaleString('en-NG', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
  USD: (amount: number) => `$${amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
  GBP: (amount: number) => `£${amount.toLocaleString('en-GB', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
  EUR: (amount: number) => `€${amount.toLocaleString('de-DE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
  GHS: (amount: number) => `₵${amount.toLocaleString('en-GH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
};

const PreferencesContext = createContext<PreferencesContextType | undefined>(undefined);

export const PreferencesProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [settings, setSettings] = useState<PreferenceSettings>(defaultSettings);
  const [isLoading, setIsLoading] = useState(true);

  // Load settings from AsyncStorage on mount
  useEffect(() => {
    const loadSettings = async () => {
      try {
        const savedSettings = await AsyncStorage.getItem(STORAGE_KEY);
        if (savedSettings) {
          const parsedSettings = JSON.parse(savedSettings);
          setSettings({ ...defaultSettings, ...parsedSettings });
        }
      } catch (error) {
        console.error('Error loading preferences:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadSettings();
  }, []);

  // Update settings and save to AsyncStorage
  const updateSettings = useCallback(async (newSettings: Partial<PreferenceSettings>) => {
    try {
      const updatedSettings = { ...settings, ...newSettings };
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updatedSettings));
      setSettings(updatedSettings);
    } catch (error) {
      console.error('Error saving preferences:', error);
      Alert.alert('Error', 'Failed to save preferences');
    }
  }, [settings]);

  // Update a single setting
  const updateSetting = useCallback(async (key: keyof PreferenceSettings, value: any) => {
    await updateSettings({ [key]: value });
  }, [updateSettings]);

  // Format currency based on selected format
  const formatCurrency = useCallback((amount: number, currency?: string): string => {
    const currencyCode = currency || settings.currencyFormat;
    const formatter = currencyFormatters[currencyCode];
    return formatter ? formatter(amount) : currencyFormatters.NGN(amount);
  }, [settings.currencyFormat]);

  // Format time based on 24h setting
  const formatTime = useCallback((date: Date): string => {
    const options: Intl.DateTimeFormatOptions = {
      hour: 'numeric',
      minute: '2-digit',
      hour12: !settings.timeFormat24h,
    };
    return date.toLocaleTimeString([], options);
  }, [settings.timeFormat24h]);

  // Format date based on language setting
  const formatDate = useCallback((date: Date): string => {
    const locale = settings.language === 'en' ? 'en-US' : settings.language;
    const options: Intl.DateTimeFormatOptions = {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    };
    return date.toLocaleDateString(locale, options);
  }, [settings.language]);

  // Translate text based on selected language
  const translate = useCallback((key: string): string => {
    const languageTranslations = translations[settings.language] || translations.en;
    return languageTranslations[key] || translations.en[key] || key;
  }, [settings.language]);

  // Play sound using vibration as substitute
  const playSound = useCallback(async (soundType: 'success' | 'error' | 'notification' | 'button'): Promise<void> => {
    if (!settings.soundEnabled) return;

    try {
      switch (soundType) {
        case 'success':
          Vibration.vibrate([0, 100, 50, 100]);
          break;
        case 'error':
          Vibration.vibrate([0, 200, 100, 200]);
          break;
        case 'notification':
          Vibration.vibrate(100);
          break;
        case 'button':
          Vibration.vibrate(50);
          break;
      }
    } catch (error) {
      console.error('Error playing sound:', error);
    }
  }, [settings.soundEnabled]);

  // Trigger haptic feedback using vibration
  const triggerHaptic = useCallback(async (type: 'light' | 'medium' | 'heavy' | 'success' | 'warning' | 'error'): Promise<void> => {
    if (!settings.hapticFeedback) return;

    try {
      switch (type) {
        case 'light':
          Vibration.vibrate(30);
          break;
        case 'medium':
          Vibration.vibrate(50);
          break;
        case 'heavy':
          Vibration.vibrate(100);
          break;
        case 'success':
          Vibration.vibrate([0, 50, 30, 50]);
          break;
        case 'warning':
          Vibration.vibrate([0, 100, 50, 100, 50, 100]);
          break;
        case 'error':
          Vibration.vibrate([0, 200, 100, 200]);
          break;
      }
    } catch (error) {
      console.error('Error triggering haptic:', error);
    }
  }, [settings.hapticFeedback]);

  const value: PreferencesContextType = {
    settings,
    updateSettings,
    updateSetting,
    formatCurrency,
    formatTime,
    formatDate,
    translate,
    playSound,
    triggerHaptic,
    isLoading,
  };

  return (
    <PreferencesContext.Provider value={value}>
      {children}
    </PreferencesContext.Provider>
  );
};

export const usePreferences = (): PreferencesContextType => {
  const context = useContext(PreferencesContext);
  if (context === undefined) {
    throw new Error('usePreferences must be used within a PreferencesProvider');
  }
  return context;
};
