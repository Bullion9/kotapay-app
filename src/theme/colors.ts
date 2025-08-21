/**
 * Color Definitions for Light and Dark Themes
 */

export const lightColors = {
  // Core Brand Colors
  primary: '#000d10',
  accent: '#b9f1ff',
  
  // Status Colors
  success: '#A8E4A0',
  error: '#EA3B52',
  warning: '#FFB84D',
  danger: '#8B0000',
  
  // Background Colors
  light: '#F0FFF0',
  background: '#FFF0F5',
  white: '#FFFFFF',
  
  // Text Colors
  text: '#000000',
  secondaryText: '#A3AABE',
  
  // Nature Colors
  seaGreen: '#06402B',
  primaryBills: '#06402B',
  darkOlive: '#3E3D29',
  
  // Functional Colors
  border: '#E5E5EA',
  borderBills: '#A3AABE',
  borderFocusBills: '#b9f1ff',
  card: '#FFFFFF',
  disabled: '#F2F2F7',
  placeholder: '#C7C7CC',
  overlay: 'rgba(0, 0, 0, 0.5)',
  
  // Transparent Variants
  primaryTransparent: 'rgba(0, 13, 16, 0.1)',
  accentTransparent: 'rgba(185, 241, 255, 0.1)',
  successTransparent: 'rgba(168, 228, 160, 0.1)',
  errorTransparent: 'rgba(234, 59, 82, 0.1)',
} as const;

export const darkColors = {
  // Core Brand Colors (adjusted for dark mode)
  primary: '#b9f1ff',
  accent: '#000d10',
  
  // Status Colors (enhanced for dark mode)
  success: '#4ADE80',
  error: '#EF4444',
  warning: '#F59E0B',
  danger: '#DC2626',
  
  // Background Colors
  light: '#1F2937',
  background: '#111827',
  white: '#1F2937',
  
  // Text Colors
  text: '#F9FAFB',
  secondaryText: '#9CA3AF',
  
  // Nature Colors
  seaGreen: '#34D399',
  primaryBills: '#34D399',
  darkOlive: '#6B7280',
  
  // Functional Colors
  border: '#374151',
  borderBills: '#4B5563',
  borderFocusBills: '#b9f1ff',
  card: '#1F2937',
  disabled: '#374151',
  placeholder: '#6B7280',
  overlay: 'rgba(0, 0, 0, 0.7)',
  
  // Transparent Variants
  primaryTransparent: 'rgba(185, 241, 255, 0.1)',
  accentTransparent: 'rgba(0, 13, 16, 0.1)',
  successTransparent: 'rgba(74, 222, 128, 0.1)',
  errorTransparent: 'rgba(239, 68, 68, 0.1)',
} as const;

export type ColorScheme = {
  primary: string;
  accent: string;
  success: string;
  error: string;
  warning: string;
  danger: string;
  light: string;
  background: string;
  white: string;
  text: string;
  secondaryText: string;
  seaGreen: string;
  primaryBills: string;
  darkOlive: string;
  border: string;
  borderBills: string;
  borderFocusBills: string;
  card: string;
  disabled: string;
  placeholder: string;
  overlay: string;
  primaryTransparent: string;
  accentTransparent: string;
  successTransparent: string;
  errorTransparent: string;
};

export const getColors = (isDark: boolean): ColorScheme => {
  return isDark ? darkColors : lightColors;
};
