import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import { Sun, Moon, Monitor } from 'lucide-react-native';
import { useTheme } from '../contexts/ThemeContext';
import { spacing, borderRadius, shadows } from '../theme';

export const ThemeToggle: React.FC = () => {
  const { themeMode, setThemeMode, colors } = useTheme();

  const ThemeModeButton = ({ mode, label, icon: Icon }) => (
    <TouchableOpacity
      style={[
        styles.modeButton,
        {
          backgroundColor: themeMode === mode ? colors.primary : colors.card,
          borderColor: colors.border,
        },
      ]}
      onPress={() => setThemeMode(mode)}
    >
      <Icon
        size={20}
        color={themeMode === mode ? colors.white : colors.text}
      />
      <Text
        style={[
          styles.modeLabel,
          {
            color: themeMode === mode ? colors.white : colors.text,
          },
        ]}
      >
        {label}
      </Text>
    </TouchableOpacity>
  );

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Text style={[styles.title, { color: colors.text }]}>Theme</Text>
      <View style={styles.buttonGroup}>
        <ThemeModeButton mode="light" label="Light" icon={Sun} />
        <ThemeModeButton mode="dark" label="Dark" icon={Moon} />
        <ThemeModeButton mode="system" label="System" icon={Monitor} />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: spacing.lg,
    borderRadius: borderRadius.large,
    ...shadows.small,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: spacing.md,
  },
  buttonGroup: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  modeButton: {
    flex: 1,
    flexDirection: 'column',
    alignItems: 'center',
    padding: spacing.md,
    borderRadius: borderRadius.medium,
    borderWidth: 1,
    gap: spacing.xs,
  },
  modeLabel: {
    fontSize: 12,
    fontWeight: '500',
  },
});
