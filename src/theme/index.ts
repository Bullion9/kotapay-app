import { StyleSheet, Platform } from 'react-native';

/**
 * KotaPay Global Theme System
 * Professional payment app design with consistent colors, typography, and spacing
 */

// Color Palette
export const colors = {
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
  primaryBills: '#06402B',     // Primary color for bills screens
  darkOlive: '#3E3D29',
  
  // Functional Colors
  border: '#E5E5EA',
  borderBills: '#A3AABE',      // Bills screen border color
  borderFocusBills: '#b9f1ff', // Bills screen focus border color
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

// Spacing Scale (4px base unit)
export const spacing = {
  xs: 4,    // 4px
  sm: 8,    // 8px
  md: 12,   // 12px
  lg: 16,   // 16px
  xl: 24,   // 24px
  xxl: 32,  // 32px
  xxxl: 48, // 48px
} as const;

// Border Radius Scale
export const borderRadius = {
  small: 8,   // 8px
  medium: 12, // 12px
  large: 16,  // 16px
  xl: 20,     // 20px
  round: 999, // Fully rounded
} as const;

// Typography Scale
export const typography = {
  h1: {
    fontSize: 32,
    fontWeight: 'bold' as const,
    lineHeight: 40,
    letterSpacing: -0.5,
  },
  h2: {
    fontSize: 24,
    fontWeight: 'bold' as const,
    lineHeight: 32,
    letterSpacing: -0.3,
  },
  h3: {
    fontSize: 20,
    fontWeight: '600' as const,
    lineHeight: 28,
    letterSpacing: -0.2,
  },
  body: {
    fontSize: 16,
    fontWeight: 'normal' as const,
    lineHeight: 24,
    letterSpacing: 0,
  },
  caption: {
    fontSize: 14,
    fontWeight: 'normal' as const,
    lineHeight: 20,
    letterSpacing: 0.1,
  },
  small: {
    fontSize: 12,
    fontWeight: 'normal' as const,
    lineHeight: 16,
    letterSpacing: 0.1,
  },
} as const;

// Shadow/Elevation Styles
export const shadows = {
  none: {
    shadowColor: 'transparent',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0,
    shadowRadius: 0,
    elevation: 0,
  },
  small: {
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  medium: {
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 4,
  },
  large: {
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 8,
  },
  card: {
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  billsCard: {
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 2,  // Elevation 2 for bills provider cards
  },
} as const;

// Theme Object
export const theme = {
  colors,
  spacing,
  borderRadius,
  typography,
  shadows,
} as const;

// Global Styles
export const globalStyles = StyleSheet.create({
  // Container Styles
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  safeContainer: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    flex: 1,
    padding: spacing.lg,
  },
  
  // Card Styles
  card: {
    backgroundColor: colors.card,
    borderRadius: borderRadius.medium,
    padding: spacing.lg,
    ...shadows.card,
  },
  cardElevated: {
    backgroundColor: colors.card,
    borderRadius: borderRadius.large,
    padding: spacing.xl,
    ...shadows.medium,
  },
  
  // Button Styles
  button: {
    backgroundColor: colors.primary,
    borderRadius: borderRadius.medium,
    paddingVertical: spacing.lg,
    paddingHorizontal: spacing.xl,
    alignItems: 'center',
    justifyContent: 'center',
    ...shadows.small,
  },
  buttonPrimary: {
    backgroundColor: colors.primary,
  },
  buttonSecondary: {
    backgroundColor: colors.accent,
    borderWidth: 1,
    borderColor: colors.primary,
  },
  buttonSuccess: {
    backgroundColor: colors.success,
  },
  buttonDanger: {
    backgroundColor: colors.error,
  },
  buttonDisabled: {
    backgroundColor: colors.disabled,
    opacity: 0.6,
  },
  buttonText: {
    color: colors.white,
    fontSize: typography.body.fontSize,
    fontWeight: '600',
    textAlign: 'center',
  },
  buttonTextSecondary: {
    color: colors.primary,
  },
  
  // Input Styles
  input: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: borderRadius.medium,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    fontSize: typography.body.fontSize,
    backgroundColor: colors.white,
    color: colors.text,
  },
  inputFocused: {
    borderColor: colors.primary,
    borderWidth: 2,
    ...shadows.small,
  },
  inputError: {
    borderColor: colors.error,
    borderWidth: 2,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.white,
    borderRadius: borderRadius.medium,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: spacing.lg,
    ...shadows.small,
  },
  inputWrapperFocused: {
    borderColor: colors.primary,
    borderWidth: 2,
  },
  inputIcon: {
    marginRight: spacing.sm,
  },
  inputField: {
    flex: 1,
    paddingVertical: spacing.md,
    fontSize: typography.body.fontSize,
    color: colors.text,
  },
  
  // Text Styles
  text: {
    color: colors.text,
    fontSize: typography.body.fontSize,
    lineHeight: typography.body.lineHeight,
  },
  textSecondary: {
    color: colors.secondaryText,
    fontSize: typography.caption.fontSize,
    lineHeight: typography.caption.lineHeight,
  },
  textError: {
    color: colors.error,
    fontSize: typography.caption.fontSize,
  },
  textSuccess: {
    color: colors.success,
    fontSize: typography.caption.fontSize,
  },
  textCenter: {
    textAlign: 'center',
  },
  textBold: {
    fontWeight: 'bold',
  },
  
  // Layout Styles
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  rowSpaceBetween: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  column: {
    flexDirection: 'column',
  },
  center: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  centerHorizontal: {
    alignItems: 'center',
  },
  centerVertical: {
    justifyContent: 'center',
  },
  
  // Spacing Utilities
  marginXs: { margin: spacing.xs },
  marginSm: { margin: spacing.sm },
  marginMd: { margin: spacing.md },
  marginLg: { margin: spacing.lg },
  marginXl: { margin: spacing.xl },
  marginXxl: { margin: spacing.xxl },
  
  paddingXs: { padding: spacing.xs },
  paddingSm: { padding: spacing.sm },
  paddingMd: { padding: spacing.md },
  paddingLg: { padding: spacing.lg },
  paddingXl: { padding: spacing.xl },
  paddingXxl: { padding: spacing.xxl },
  
  // Divider
  divider: {
    height: 1,
    backgroundColor: colors.border,
    marginVertical: spacing.md,
  },
  dividerThick: {
    height: 2,
    backgroundColor: colors.border,
    marginVertical: spacing.lg,
  },
  
  // Special KotaPay Components
  balanceCard: {
    backgroundColor: colors.primary,
    borderRadius: borderRadius.large,
    padding: spacing.xl,
    ...shadows.medium,
  },
  actionCard: {
    backgroundColor: colors.white,
    borderRadius: borderRadius.medium,
    padding: spacing.lg,
    alignItems: 'center',
    ...shadows.small,
    borderWidth: 1,
    borderColor: colors.border,
  },
  logoContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    ...shadows.medium,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.white,
    alignItems: 'center',
    justifyContent: 'center',
    ...shadows.small,
    borderWidth: 1,
    borderColor: colors.border,
  },
});

// Icon Size Constants (for Lucide icons)
export const iconSizes = {
  xs: 16,
  sm: 20,
  md: 24,
  lg: 28,
  xl: 32,
  xxl: 40,
} as const;

// Animation Durations
export const animations = {
  fast: 150,
  normal: 250,
  slow: 350,
} as const;

// Platform-specific adjustments
export const platformStyles = {
  ...Platform.select({
    ios: {
      statusBarHeight: 44,
      headerHeight: 88,
    },
    android: {
      statusBarHeight: 24,
      headerHeight: 56,
    },
    default: {
      statusBarHeight: 0,
      headerHeight: 60,
    },
  }),
};

export default theme;
