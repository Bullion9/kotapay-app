import React, { createContext, useState, useContext, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

export interface AppSettings {
  language: string;
  currencyFormat: string;
  darkMode: boolean;
  soundEnabled: boolean;
  timeFormat24h: boolean;
}

interface SettingsContextType {
  settings: AppSettings;
  updateSettings: (newSettings: Partial<AppSettings>) => Promise<void>;
  formatCurrency: (amount: number) => string;
  translate: (key: string) => string;
}

const defaultSettings: AppSettings = {
  language: 'en',
  currencyFormat: 'NGN',
  darkMode: false,
  soundEnabled: true,
  timeFormat24h: false,
};

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

    // Navigation
    'nav.home': 'Home',
    'nav.cards': 'Cards',
    'nav.contacts': 'Contacts',
    'nav.history': 'History',
    'nav.profile': 'Profile',

    // Transactions
    'transaction.send': 'Send Money',
    'transaction.receive': 'Receive Money',
    'transaction.request': 'Request Money',
    'transaction.status.pending': 'Pending',
    'transaction.status.completed': 'Completed',
    'transaction.status.failed': 'Failed',

    // Settings
    'settings.title': 'Settings',
    'settings.language': 'Language',
    'settings.currency': 'Currency Format',
    'settings.darkMode': 'Dark Mode',
    'settings.sound': 'Sound',
    'settings.timeFormat': '24-hour Time',
  },
  yo: {
    // Common
    'common.cancel': 'Fagilee',
    'common.save': 'Fipamọ',
    'common.edit': 'Ṣatunkọ',
    'common.delete': 'Pare',
    'common.back': 'Pada',
    'common.next': 'Tẹle',
    'common.done': 'Ṣe',

    // Navigation
    'nav.home': 'Ile',
    'nav.cards': 'Kaadi',
    'nav.contacts': 'Awọn Olubasọrọ',
    'nav.history': 'Itan',
    'nav.profile': 'Profaili',

    // Add more Yoruba translations
  },
  ha: {
    // Common
    'common.cancel': 'Soke',
    'common.save': 'Ajiye',
    'common.edit': 'Gyara',
    'common.delete': 'Share',
    'common.back': 'Koma',
    'common.next': 'Na gaba',
    'common.done': 'An gama',

    // Add more Hausa translations
  },
  ig: {
    // Common
    'common.cancel': 'Kwụsị',
    'common.save': 'Chekwa',
    'common.edit': 'Dezie',
    'common.delete': 'Hichapụ',
    'common.back': 'Azụ',
    'common.next': "Gaa n'ihu",
    'common.done': 'Emela',

    // Add more Igbo translations
  },
  pcm: {
    // Common
    'common.cancel': 'Cancel am',
    'common.save': 'Save am',
    'common.edit': 'Change am',
    'common.delete': 'Comot am',
    'common.back': 'Go back',
    'common.next': 'Next one',
    'common.done': 'Don finish',

    // Add more Pidgin translations
  },
};

const currencyFormatters: Record<string, (amount: number) => string> = {
  NGN: (amount: number) => `₦${amount.toLocaleString('en-NG')}`,
  USD: (amount: number) => `$${amount.toLocaleString('en-US')}`,
  GBP: (amount: number) => `£${amount.toLocaleString('en-GB')}`,
  EUR: (amount: number) => `€${amount.toLocaleString('de-DE')}`,
  GHS: (amount: number) => `₵${amount.toLocaleString('en-GH')}`,
};

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

export const SettingsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [settings, setSettings] = useState<AppSettings>(defaultSettings);

  // Load settings from AsyncStorage on mount
  useEffect(() => {
    const loadSettings = async () => {
      try {
        const savedSettings = await AsyncStorage.getItem('appSettings');
        if (savedSettings) {
          setSettings(JSON.parse(savedSettings));
        }
      } catch (error) {
        console.error('Error loading settings:', error);
      }
    };

    loadSettings();
  }, []);

  // Update settings and save to AsyncStorage
  const updateSettings = async (newSettings: Partial<AppSettings>) => {
    try {
      const updatedSettings = { ...settings, ...newSettings };
      await AsyncStorage.setItem('appSettings', JSON.stringify(updatedSettings));
      setSettings(updatedSettings);
    } catch (error) {
      console.error('Error saving settings:', error);
    }
  };

  // Format currency based on selected format
  const formatCurrency = (amount: number): string => {
    const formatter = currencyFormatters[settings.currencyFormat];
    return formatter ? formatter(amount) : currencyFormatters.NGN(amount);
  };

  // Translate text based on selected language
  const translate = (key: string): string => {
    const languageTranslations = translations[settings.language] || translations.en;
    return languageTranslations[key] || translations.en[key] || key;
  };

  return (
    <SettingsContext.Provider value={{ settings, updateSettings, formatCurrency, translate }}>
      {children}
    </SettingsContext.Provider>
  );
};

export const useSettings = () => {
  const context = useContext(SettingsContext);
  if (context === undefined) {
    throw new Error('useSettings must be used within a SettingsProvider');
  }
  return context;
};
