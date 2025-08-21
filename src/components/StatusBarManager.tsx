import React from 'react';
// @ts-ignore
import { StatusBar } from 'expo-status-bar';
import { useTheme } from '../contexts/ThemeContext';

export const StatusBarManager = () => {
  const { isDarkMode } = useTheme();
  return <StatusBar style={isDarkMode ? "light" : "dark"} />;
};
