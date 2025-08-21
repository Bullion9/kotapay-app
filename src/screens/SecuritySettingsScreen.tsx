import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  Switch,
  Alert,
  ActivityIndicator,
  Platform,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { ProfileParamList } from '../types';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Notifications from 'expo-notifications';
import {
  ChevronLeft,
  KeyRound,
  Fingerprint,
  Bell,
  Eye,
  Shield,
  ChevronRight,
  Globe,
  CheckCircle,
} from 'lucide-react-native';
import { colors, spacing, typography, borderRadius, shadows } from '../theme';

interface SecuritySettings {
  biometricsEnabled: boolean;
  biometricsAvailable: boolean;
  transactionPinEnabled: boolean;
  loginPinEnabled: boolean;
  pushNotificationsEnabled: boolean;
  communicationEnabled: boolean;
  showBalance: boolean;
  transactionLimit: number;
}

const SecuritySettingsScreen: React.FC = () => {
  const navigation = useNavigation<StackNavigationProp<ProfileParamList>>();
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [settings, setSettings] = useState<SecuritySettings>({
    biometricsEnabled: false,
    biometricsAvailable: false,
    transactionPinEnabled: true,
    loginPinEnabled: true,
    pushNotificationsEnabled: true,
    communicationEnabled: true,
    showBalance: true,
    transactionLimit: 100000,
  });

  // Load settings from AsyncStorage on mount
  useEffect(() => {
    const loadSettings = async () => {
      try {
        const savedSettings = await AsyncStorage.getItem('securitySettings');
        if (savedSettings) {
          const parsedSettings = JSON.parse(savedSettings);
          setSettings(prev => ({ ...prev, ...parsedSettings }));
        }
        
        // Check biometric availability
        await checkBiometricAvailability();
        
        // Check notification permissions
        await checkNotificationPermissions();
      } catch (error) {
        console.error('Error loading security settings:', error);
        Alert.alert('Error', 'Failed to load security settings');
      } finally {
        setIsLoading(false);
      }
    };

    loadSettings();
  }, []);

  // Save settings whenever they change
  useEffect(() => {
    const saveSettings = async () => {
      if (!isLoading && !isSaving) {
        setIsSaving(true);
        try {
          await AsyncStorage.setItem('securitySettings', JSON.stringify(settings));
        } catch (error) {
          console.error('Error saving security settings:', error);
          Alert.alert('Error', 'Failed to save security settings');
        } finally {
          setIsSaving(false);
        }
      }
    };

    saveSettings();
  }, [settings, isLoading, isSaving]);

  const checkBiometricAvailability = async () => {
    try {
      // Simulate biometric availability check
      // In a real app, you would use expo-local-authentication or react-native-biometrics
      const isAvailable = Platform.OS === 'ios' || Platform.OS === 'android';
      setSettings(prev => ({ ...prev, biometricsAvailable: isAvailable }));
    } catch (error) {
      console.error('Error checking biometric availability:', error);
      setSettings(prev => ({ ...prev, biometricsAvailable: false }));
    }
  };

  const checkNotificationPermissions = async () => {
    try {
      const { status } = await Notifications.getPermissionsAsync();
      setSettings(prev => ({ 
        ...prev, 
        pushNotificationsEnabled: status === 'granted' 
      }));
    } catch (error) {
      console.error('Error checking notification permissions:', error);
    }
  };

  const handleBack = () => {
    navigation.goBack();
  };

  const handleChangePin = () => {
    navigation.navigate('ChangePin');
  };

  const handleTransactionLimit = () => {
    navigation.navigate('TransactionLimit');
  };

  const handleBiometricsToggle = async () => {
    if (!settings.biometricsAvailable) {
      Alert.alert(
        'Biometrics Unavailable',
        'Biometric authentication is not available on this device'
      );
      return;
    }

    if (!settings.biometricsEnabled) {
      // Enable biometrics
      Alert.alert(
        'Enable Biometric Authentication',
        'This will allow you to use fingerprint or face recognition to access your account.',
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Enable',
            onPress: () => {
              setSettings(prev => ({ ...prev, biometricsEnabled: true }));
              Alert.alert('Success', 'Biometric authentication enabled');
            },
          },
        ]
      );
    } else {
      // Disable biometrics
      Alert.alert(
        'Disable Biometric Authentication',
        'You will need to use your PIN to access your account.',
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Disable',
            style: 'destructive',
            onPress: () => {
              setSettings(prev => ({ ...prev, biometricsEnabled: false }));
              Alert.alert('Success', 'Biometric authentication disabled');
            },
          },
        ]
      );
    }
  };

  const handlePushNotificationsToggle = async () => {
    if (!settings.pushNotificationsEnabled) {
      try {
        const { status } = await Notifications.requestPermissionsAsync();
        if (status === 'granted') {
          setSettings(prev => ({ ...prev, pushNotificationsEnabled: true }));
          Alert.alert('Success', 'Push notifications enabled');
        } else {
          Alert.alert(
            'Permission Denied',
            'Please enable notifications in your device settings to receive alerts.'
          );
        }
      } catch (error) {
        console.error('Error requesting notification permissions:', error);
        Alert.alert('Error', 'Failed to enable push notifications');
      }
    } else {
      Alert.alert(
        'Disable Push Notifications',
        'You will not receive transaction alerts and security notifications.',
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Disable',
            style: 'destructive',
            onPress: () => {
              setSettings(prev => ({ ...prev, pushNotificationsEnabled: false }));
              Alert.alert('Success', 'Push notifications disabled');
            },
          },
        ]
      );
    }
  };

  const handleCommunicationToggle = () => {
    if (!settings.communicationEnabled) {
      Alert.alert(
        'Enable Communication',
        'You will receive important updates about your account and new features.',
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Enable',
            onPress: () => {
              setSettings(prev => ({ ...prev, communicationEnabled: true }));
              Alert.alert('Success', 'Communication preferences updated');
            },
          },
        ]
      );
    } else {
      Alert.alert(
        'Disable Communication',
        'You will only receive essential security and transaction notifications.',
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Disable',
            style: 'destructive',
            onPress: () => {
              setSettings(prev => ({ ...prev, communicationEnabled: false }));
              Alert.alert('Success', 'Communication preferences updated');
            },
          },
        ]
      );
    }
  };

  const handleShowBalanceToggle = () => {
    if (!settings.showBalance) {
      setSettings(prev => ({ ...prev, showBalance: true }));
    } else {
      Alert.alert(
        'Hide Balance',
        'Your account balance will be hidden from the main screen.',
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Hide',
            onPress: () => setSettings(prev => ({ ...prev, showBalance: false })),
          },
        ]
      );
    }
  };

  const handleTransactionPinToggle = () => {
    if (!settings.transactionPinEnabled) {
      Alert.alert(
        'Enable Transaction PIN',
        'You will need to enter your PIN for all transactions.',
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Enable',
            onPress: () => setSettings(prev => ({ ...prev, transactionPinEnabled: true })),
          },
        ]
      );
    } else {
      Alert.alert(
        'Disable Transaction PIN',
        'Transactions will not require PIN verification. This is not recommended for security.',
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Disable',
            style: 'destructive',
            onPress: () => setSettings(prev => ({ ...prev, transactionPinEnabled: false })),
          },
        ]
      );
    }
  };

  const renderSettingItem = (
    icon: React.ReactNode,
    title: string,
    description: string,
    value: boolean,
    onToggle: () => void,
    isFirst = false,
    isLast = false,
    disabled = false,
  ) => (
    <View style={[
      styles.settingCard,
      isFirst && styles.firstItem,
      isLast && styles.lastItem,
      disabled && styles.disabledItem,
    ]}>
      <View style={styles.settingInfo}>
        <View style={[styles.settingIcon, disabled && styles.disabledIcon]}>
          {icon}
        </View>
        <View style={styles.settingDetails}>
          <Text style={[styles.settingTitle, disabled && styles.disabledText]}>{title}</Text>
          <Text style={[styles.settingDescription, disabled && styles.disabledText]}>
            {description}
          </Text>
        </View>
      </View>
      <Switch
        value={value}
        onValueChange={onToggle}
        trackColor={{ false: colors.border, true: colors.primary }}
        thumbColor={colors.white}
        disabled={disabled}
      />
    </View>
  );

  const renderActionItem = (
    icon: React.ReactNode,
    title: string,
    description: string,
    onPress: () => void,
    isFirst = false,
    isLast = false,
  ) => (
    <TouchableOpacity 
      style={[
        styles.settingCard,
        isFirst && styles.firstItem,
        isLast && styles.lastItem,
      ]} 
      onPress={onPress}
    >
      <View style={styles.settingInfo}>
        <View style={styles.settingIcon}>
          {icon}
        </View>
        <View style={styles.settingDetails}>
          <Text style={styles.settingTitle}>{title}</Text>
          <Text style={styles.settingDescription}>{description}</Text>
        </View>
      </View>
      <ChevronRight size={20} color={colors.text} />
    </TouchableOpacity>
  );

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={styles.loadingText}>Loading security settings...</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={handleBack} style={styles.backButton}>
          <ChevronLeft size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Security Settings</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.section}>
          {renderSettingItem(
            <Fingerprint size={24} color={settings.biometricsAvailable ? colors.primary : colors.secondaryText} />,
            'Biometric Authentication',
            settings.biometricsAvailable 
              ? 'Use fingerprint or face ID to secure your account'
              : 'Biometric authentication not available on this device',
            settings.biometricsEnabled,
            handleBiometricsToggle,
            true,
            false,
            !settings.biometricsAvailable
          )}
          {renderActionItem(
            <KeyRound size={24} color={colors.primary} />,
            'Change PIN',
            'Update your transaction and login PIN',
            handleChangePin
          )}
          {renderSettingItem(
            <Eye size={24} color={colors.primary} />,
            'Show Balance',
            'Display account balance in the app',
            settings.showBalance,
            handleShowBalanceToggle
          )}
          {renderSettingItem(
            <Bell size={24} color={colors.primary} />,
            'Push Notifications',
            'Receive alerts for transactions and updates',
            settings.pushNotificationsEnabled,
            handlePushNotificationsToggle
          )}
          {renderSettingItem(
            <Globe size={24} color={colors.primary} />,
            'Communication Preferences',
            'Receive updates about new features and promotions',
            settings.communicationEnabled,
            handleCommunicationToggle
          )}
          {renderActionItem(
            <Shield size={24} color={colors.primary} />,
            'Transaction Limit',
            `Current limit: ₦${settings.transactionLimit.toLocaleString()}`,
            handleTransactionLimit
          )}
          {renderSettingItem(
            <KeyRound size={24} color={colors.primary} />,
            'Transaction PIN',
            'Require PIN for all transactions',
            settings.transactionPinEnabled,
            handleTransactionPinToggle,
            false,
            true
          )}
        </View>

        {/* Security Status */}
        <View style={styles.securityStatus}>
          <Text style={styles.statusTitle}>Security Status</Text>
          <View style={styles.statusList}>
            <View style={styles.statusItem}>
              <CheckCircle size={16} color={settings.transactionPinEnabled ? colors.success : colors.secondaryText} />
              <Text style={[
                styles.statusText,
                !settings.transactionPinEnabled && styles.statusTextInactive
              ]}>
                Transaction PIN {settings.transactionPinEnabled ? 'Enabled' : 'Disabled'}
              </Text>
            </View>
            <View style={styles.statusItem}>
              <CheckCircle size={16} color={settings.biometricsEnabled ? colors.success : colors.secondaryText} />
              <Text style={[
                styles.statusText,
                !settings.biometricsEnabled && styles.statusTextInactive
              ]}>
                Biometric Auth {settings.biometricsEnabled ? 'Enabled' : 'Disabled'}
              </Text>
            </View>
            <View style={styles.statusItem}>
              <CheckCircle size={16} color={settings.pushNotificationsEnabled ? colors.success : colors.secondaryText} />
              <Text style={[
                styles.statusText,
                !settings.pushNotificationsEnabled && styles.statusTextInactive
              ]}>
                Push Notifications {settings.pushNotificationsEnabled ? 'Enabled' : 'Disabled'}
              </Text>
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: spacing.lg,
    backgroundColor: colors.background,
  },
  headerTitle: {
    ...typography.h3,
    color: colors.text,
  },
  backButton: {
    padding: spacing.sm,
    borderRadius: borderRadius.small,
  },
  placeholder: {
    width: 40,
  },
  content: {
    flex: 1,
  },
  section: {
    marginTop: spacing.lg,
    marginBottom: spacing.lg,
    marginHorizontal: spacing.md,
    borderRadius: borderRadius.large,
    overflow: 'hidden',
    ...shadows.small,
  },
  settingCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: spacing.lg,
    backgroundColor: colors.white,
    borderBottomWidth: 1,
    borderBottomColor: '#F5F5F5',
    minHeight: 64,
  },
  firstItem: {
    borderTopLeftRadius: borderRadius.large,
    borderTopRightRadius: borderRadius.large,
  },
  lastItem: {
    borderBottomLeftRadius: borderRadius.large,
    borderBottomRightRadius: borderRadius.large,
    borderBottomWidth: 0,
  },
  disabledItem: {
    opacity: 0.6,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    ...typography.body,
    color: colors.secondaryText,
    marginTop: spacing.md,
  },
  settingInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  settingIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.background,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  disabledIcon: {
    opacity: 0.5,
  },
  settingDetails: {
    flex: 1,
    marginRight: spacing.md,
  },
  settingTitle: {
    ...typography.body,
    color: colors.text,
    fontWeight: '600',
    marginBottom: spacing.xs,
  },
  settingDescription: {
    ...typography.caption,
    color: colors.secondaryText,
  },
  disabledText: {
    opacity: 0.6,
  },
  securityStatus: {
    marginHorizontal: spacing.md,
    marginBottom: spacing.xl,
    backgroundColor: colors.white,
    padding: spacing.lg,
    borderRadius: borderRadius.large,
    borderLeftWidth: 4,
    borderLeftColor: colors.primary,
    ...shadows.small,
  },
  statusTitle: {
    ...typography.body,
    color: colors.text,
    fontWeight: '600',
    marginBottom: spacing.md,
  },
  statusList: {
    gap: spacing.sm,
  },
  statusItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  statusText: {
    ...typography.caption,
    color: colors.text,
    fontWeight: '500',
  },
  statusTextInactive: {
    color: colors.secondaryText,
  },
});

export default SecuritySettingsScreen;
