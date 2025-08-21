import { useNavigation } from '@react-navigation/native';
import {
  AlertTriangle,
  ArrowLeft,
  ChevronRight,
  Fingerprint,
  LogOut,
  Shield,
} from 'lucide-react-native';
import React, { useState } from 'react';
import {
  Alert,
  Platform,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Switch,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useAuth } from '../../contexts/AuthContext';
// @ts-ignore
import * as Haptics from 'expo-haptics';

const SecurityScreen: React.FC = () => {
  const navigation = useNavigation();
  const { logout } = useAuth();
  
  const [settings, setSettings] = useState({
    biometrics: true,
    twoFactor: false,
  });

  const handleToggleChange = async (key: string, value: boolean) => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  const handleChangePIN = async () => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    Alert.alert(
      'Change PIN',
      'You will be redirected to set a new 4-digit PIN',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Continue', onPress: () => console.log('Change PIN flow') },
      ]
    );
  };

  const handleSignOutEverywhere = async () => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    Alert.alert(
      'Sign Out Everywhere',
      'This will end all active sessions on all devices. You will need to sign in again.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Sign Out',
          style: 'destructive',
          onPress: async () => {
            try {
              await logout();
              // Navigation will be handled automatically by the auth state change
            } catch {
              Alert.alert('Error', 'Failed to sign out. Please try again.');
            }
          },
        },
      ]
    );
  };

  const goBack = async () => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    navigation.goBack();
  };

  const renderActionRow = (
    icon: React.ReactNode,
    label: string,
    onPress: () => void,
    subtitle?: string,
    danger?: boolean
  ) => (
    <TouchableOpacity
      style={styles.actionRow}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View style={styles.rowLeft}>
        {icon}
        <View style={styles.rowText}>
          <Text style={[styles.rowLabel, danger && styles.dangerText]}>{label}</Text>
          {subtitle && <Text style={styles.rowSubtitle}>{subtitle}</Text>}
        </View>
      </View>
      <ChevronRight size={20} color={danger ? '#EA3B52' : '#A3AABE'} />
    </TouchableOpacity>
  );

  const renderToggleRow = (
    icon: React.ReactNode,
    label: string,
    value: boolean,
    onToggle: (value: boolean) => void,
    subtitle?: string
  ) => (
    <View style={styles.toggleRow}>
      <View style={styles.rowLeft}>
        {icon}
        <View style={styles.rowText}>
          <Text style={styles.rowLabel}>{label}</Text>
          {subtitle && <Text style={styles.rowSubtitle}>{subtitle}</Text>}
        </View>
      </View>
      <Switch
        value={value}
        onValueChange={onToggle}
        trackColor={{ false: '#E5E5E5', true: '#A8E4A0' }}
        thumbColor={value ? '#06402B' : '#FFFFFF'}
        ios_backgroundColor="#E5E5E5"
      />
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFF0F5" />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={goBack}>
          <ArrowLeft size={24} color="#06402B" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Security</Text>
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.content}>
          <Text style={styles.description}>
            Manage your account security settings to keep your money and personal information safe.
          </Text>

          {/* Authentication Section */}
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Authentication</Text>
            {renderActionRow(
              <Shield size={20} color="#06402B" />,
              'Change PIN',
              handleChangePIN,
              '4-digit security code'
            )}
            {renderToggleRow(
              <Fingerprint size={20} color="#06402B" />,
              'Biometric Authentication',
              settings.biometrics,
              (value) => handleToggleChange('biometrics', value),
              Platform.OS === 'ios' ? 'Face ID' : 'Fingerprint'
            )}
            {renderToggleRow(
              <Shield size={20} color="#06402B" />,
              'Two-Factor Authentication',
              settings.twoFactor,
              (value) => handleToggleChange('twoFactor', value)
            )}
          </View>

          {/* Session Management Section */}
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Session Management</Text>
            {renderActionRow(
              <LogOut size={20} color="#EA3B52" />,
              'Sign Out Everywhere',
              handleSignOutEverywhere,
              'End all active sessions',
              true
            )}
          </View>

          {/* Security Tips */}
          <View style={styles.securityTip}>
            <AlertTriangle size={16} color="#FF8C00" />
            <Text style={styles.securityTipText}>
              Enable biometric authentication and two-factor authentication for maximum security.
            </Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFF0F5',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#FFF0F5',
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  backButton: {
    padding: 8,
    marginRight: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#06402B',
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: 16,
  },
  description: {
    fontSize: 14,
    color: '#A3AABE',
    marginBottom: 24,
    lineHeight: 20,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#06402B',
    marginBottom: 16,
  },
  actionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F5F5F5',
    minHeight: 48,
  },
  toggleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F5F5F5',
    minHeight: 48,
  },
  rowLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  rowText: {
    marginLeft: 12,
    flex: 1,
  },
  rowLabel: {
    fontSize: 14,
    color: '#06402B',
    fontWeight: '500',
  },
  rowSubtitle: {
    fontSize: 12,
    color: '#A3AABE',
    marginTop: 2,
  },
  dangerText: {
    color: '#EA3B52',
  },
  securityTip: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#FFF8E1',
    padding: 12,
    borderRadius: 8,
    marginTop: 16,
  },
  securityTipText: {
    fontSize: 12,
    color: '#FF8C00',
    marginLeft: 8,
    flex: 1,
    lineHeight: 16,
  },
});

export default SecurityScreen;
