import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { createContext, useContext, useEffect, useState } from 'react';
import { Appearance, StatusBar } from 'react-native';
import { ColorScheme, getColors } from './colors';
import { animations, borderRadius, iconSizes, shadows, spacing, typography } from './index';

interface ThemeContextType {
  colors: ColorScheme;
  isDark: boolean;
  toggleTheme: () => void;
  setTheme: (isDark: boolean) => void;
  spacing: typeof spacing;
  borderRadius: typeof borderRadius;
  typography: typeof typography;
  shadows: typeof shadows;
  iconSizes: typeof iconSizes;
  animations: typeof animations;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

interface ThemeProviderProps {
  children: React.ReactNode;
  initialDarkMode?: boolean;
}

export const ThemeProvider: React.FC<ThemeProviderProps> = ({ 
  children, 
  initialDarkMode 
}) => {
  const [isDark, setIsDark] = useState(initialDarkMode ?? false);
  const [isInitialized, setIsInitialized] = useState(false);

  // Load theme preference from storage
  useEffect(() => {
    const loadThemePreference = async () => {
      try {
        const savedSettings = await AsyncStorage.getItem('appSettings');
        if (savedSettings) {
          const settings = JSON.parse(savedSettings);
          setIsDark(settings.darkMode ?? false);
        } else {
          // Use system preference if no saved setting
          const systemIsDark = Appearance.getColorScheme() === 'dark';
          setIsDark(systemIsDark);
        }
      } catch (error) {
        console.error('Error loading theme preference:', error);
        // Fallback to system preference
        const systemIsDark = Appearance.getColorScheme() === 'dark';
        setIsDark(systemIsDark);
      } finally {
        setIsInitialized(true);
      }
    };

    loadThemePreference();
  }, []);

  // Listen to system theme changes
  useEffect(() => {
    const subscription = Appearance.addChangeListener(({ colorScheme }) => {
      // Only auto-update if user hasn't manually set a preference
      AsyncStorage.getItem('appSettings').then((savedSettings) => {
        if (!savedSettings) {
          setIsDark(colorScheme === 'dark');
        }
      });
    });

    return () => subscription?.remove();
  }, []);

  // Update status bar when theme changes
  useEffect(() => {
    if (isInitialized) {
      StatusBar.setBarStyle(isDark ? 'light-content' : 'dark-content', true);
    }
  }, [isDark, isInitialized]);

  const toggleTheme = async () => {
    const newIsDark = !isDark;
    setIsDark(newIsDark);
    
    // Save to storage
    try {
      const savedSettings = await AsyncStorage.getItem('appSettings');
      const settings = savedSettings ? JSON.parse(savedSettings) : {};
      const updatedSettings = { ...settings, darkMode: newIsDark };
      await AsyncStorage.setItem('appSettings', JSON.stringify(updatedSettings));
    } catch (error) {
      console.error('Error saving theme preference:', error);
    }
  };

  const setTheme = async (newIsDark: boolean) => {
    setIsDark(newIsDark);
    
    // Save to storage
    try {
      const savedSettings = await AsyncStorage.getItem('appSettings');
      const settings = savedSettings ? JSON.parse(savedSettings) : {};
      const updatedSettings = { ...settings, darkMode: newIsDark };
      await AsyncStorage.setItem('appSettings', JSON.stringify(updatedSettings));
    } catch (error) {
      console.error('Error saving theme preference:', error);
    }
  };

  const colors = getColors(isDark);

  const value: ThemeContextType = {
    colors,
    isDark,
    toggleTheme,
    setTheme,
    spacing,
    borderRadius,
    typography,
    shadows,
    iconSizes,
    animations,
  };

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = (): ThemeContextType => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};
