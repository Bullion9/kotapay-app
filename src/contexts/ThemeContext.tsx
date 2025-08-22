import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { createContext, useContext, useEffect, useState } from 'react';
import { useColorScheme } from 'react-native';
import { darkColors, lightColors } from '../constants/Colors';

// Define theme types
type ThemeMode = 'light' | 'dark' | 'system';

  type Colors = typeof lightColors;
  
  interface ThemeContextType {
    themeMode: ThemeMode;
    setThemeMode: (mode: ThemeMode) => void;
    isDarkMode: boolean;
    colors: Colors;
    toggleTheme: () => void;
    soundEnabled: boolean;
    setSoundEnabled: (enabled: boolean) => void;
    hapticFeedback: boolean;
    setHapticFeedback: (enabled: boolean) => void;
  }const ThemeContext = createContext<ThemeContextType>({
  themeMode: 'system',
  setThemeMode: () => {},
  isDarkMode: false,
  colors: lightColors,
  toggleTheme: () => {},
  soundEnabled: true,
  setSoundEnabled: () => {},
  hapticFeedback: true,
  setHapticFeedback: () => {},
});

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

interface ThemeProviderProps {
  children: React.ReactNode;
}

export const ThemeProvider: React.FC<ThemeProviderProps> = ({ children }) => {
  const systemColorScheme = useColorScheme();
  const [themeMode, setThemeModeState] = useState<ThemeMode>('system');
  const [soundEnabled, setSoundEnabledState] = useState<boolean>(true);
  const [hapticFeedback, setHapticFeedbackState] = useState<boolean>(true);

  // Load saved theme and settings on mount
  useEffect(() => {
    const loadSavedSettings = async () => {
      try {
        const savedTheme = await AsyncStorage.getItem('theme');
        const savedSoundEnabled = await AsyncStorage.getItem('soundEnabled');
        const savedHapticFeedback = await AsyncStorage.getItem('hapticFeedback');
        
        console.log('Loaded saved theme:', savedTheme);
        if (savedTheme && ['light', 'dark', 'system'].includes(savedTheme)) {
          setThemeModeState(savedTheme as ThemeMode);
        }
        
        if (savedSoundEnabled !== null) {
          setSoundEnabledState(savedSoundEnabled === 'true');
        }
        
        if (savedHapticFeedback !== null) {
          setHapticFeedbackState(savedHapticFeedback === 'true');
        }
      } catch (error) {
        console.error('Failed to load settings:', error);
      }
    };
    loadSavedSettings();
  }, []);

  // Calculate isDarkMode based on theme mode and system preference
  const isDarkMode = React.useMemo(() => {
    const shouldUseDark = themeMode === 'system'
      ? systemColorScheme === 'dark'
      : themeMode === 'dark';
    console.log('isDarkMode calculation:', {
      themeMode,
      systemColorScheme,
      shouldUseDark
    });
    return shouldUseDark;
  }, [themeMode, systemColorScheme]);

  const setThemeMode = async (mode: ThemeMode) => {
    try {
      await AsyncStorage.setItem('theme', mode);
      setThemeModeState(mode);
      console.log('Theme changed to:', mode);
    } catch (error) {
      console.error('Failed to save theme:', error);
    }
  };

  const setSoundEnabled = async (enabled: boolean) => {
    try {
      await AsyncStorage.setItem('soundEnabled', enabled.toString());
      setSoundEnabledState(enabled);
      console.log('Sound enabled changed to:', enabled);
    } catch (error) {
      console.error('Failed to save sound setting:', error);
    }
  };

  const setHapticFeedback = async (enabled: boolean) => {
    try {
      await AsyncStorage.setItem('hapticFeedback', enabled.toString());
      setHapticFeedbackState(enabled);
      console.log('Haptic feedback changed to:', enabled);
    } catch (error) {
      console.error('Failed to save haptic setting:', error);
    }
  };

  // Log theme changes
  useEffect(() => {
    console.log('Current theme mode:', themeMode);
    console.log('System color scheme:', systemColorScheme);
    console.log('Is dark mode:', isDarkMode);
  }, [themeMode, systemColorScheme, isDarkMode]);

  // Select colors based on dark mode
  const colors = React.useMemo(() => {
    return isDarkMode ? darkColors : lightColors;
  }, [isDarkMode]);

  const toggleTheme = async () => {
    const nextTheme: ThemeMode = 
      themeMode === 'system' ? 'light' :
      themeMode === 'light' ? 'dark' : 'system';
    await setThemeMode(nextTheme);
  };

  const value = {
    themeMode,
    setThemeMode,
    isDarkMode,
    colors,
    toggleTheme,
    soundEnabled,
    setSoundEnabled,
    hapticFeedback,
    setHapticFeedback,
  };

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
};

export default ThemeContext;
