/**
 * KotaPay Color System - Updated Professional Payment App Colors
 * Re-export from the new theme system
 */

import { colors } from '../src/theme';

export { colors as Colors } from '../src/theme';

// For backward compatibility, also export as the old structure
export const OldColors = {
  light: {
    text: colors.text,
    background: colors.background,
    card: colors.card,
    border: colors.border,
    tint: colors.primary,
    primary: colors.primary,
    secondary: colors.seaGreen,
    accent: colors.accent,
    error: colors.error,
    success: colors.success,
    warning: colors.accent,
    info: colors.primary,
    muted: colors.secondaryText,
    icon: colors.secondaryText,
    tabIconDefault: colors.secondaryText,
    tabIconSelected: colors.primary,
  },
  dark: {
    text: colors.white,
    background: colors.primary,
    card: colors.darkOlive,
    border: colors.secondaryText,
    tint: colors.accent,
    primary: colors.accent,
    secondary: colors.seaGreen,
    accent: colors.accent,
    error: colors.error,
    success: colors.success,
    warning: colors.accent,
    info: colors.accent,
    muted: colors.secondaryText,
    icon: colors.secondaryText,
    tabIconDefault: colors.secondaryText,
    tabIconSelected: colors.accent,
  },
};
