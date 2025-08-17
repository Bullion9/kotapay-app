import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  Image,
  Switch,
  Alert,
  StatusBar,
  Animated,
} from 'react-native';
import {
  User,
  ShieldCheck,
  CreditCard,
  ChevronRight,
  Shield,
  Fingerprint,
  Bell,
  Moon,
  HelpCircle,
  LogOut,
  Trash2,
  Camera,
  Mail,
  Phone,
  Calendar,
  DollarSign,
  Languages,
  Settings,
  UserCheck,
  PiggyBank,
  UserCircle,
  Sliders,
  Wallet,
  LifeBuoy,
  AlertTriangle,
} from 'lucide-react-native';
import * as ImagePicker from 'expo-image-picker';
// @ts-ignore
import * as Haptics from 'expo-haptics';

interface EditableRow {
  icon: React.ReactNode;
  label: string;
  value: string;
  type: 'text' | 'email' | 'phone' | 'date';
  verified?: boolean;
}

const ProfileScreen: React.FC = () => {
  // Animation values
  const [fadeAnim] = useState(new Animated.Value(0));
  const [slideAnim] = useState(new Animated.Value(50));
  
  // User data state
  const [userData, setUserData] = useState({
    displayName: 'Sarah Johnson',
    username: '@sarah_j',
    phone: '+234 801 234 5678',
    email: 'sarah@example.com',
    dateOfBirth: '1995-06-15',
    avatar: null as string | null,
    isVerified: true,
  });

  // Settings state
  const [settings, setSettings] = useState({
    biometrics: true,
    twoFactor: false,
    currency: '₦',
    language: 'English',
    darkMode: false,
    notifications: {
      push: true,
      email: true,
      sms: false,
    },
  });

  // Personal information rows
  const personalInfo: EditableRow[] = [
    {
      icon: <User size={20} color="#06402B" />,
      label: 'Full Name',
      value: userData.displayName,
      type: 'text',
    },
    {
      icon: <Mail size={20} color="#06402B" />,
      label: 'Email',
      value: userData.email,
      type: 'email',
      verified: true,
    },
    {
      icon: <Phone size={20} color="#06402B" />,
      label: 'Phone',
      value: userData.phone,
      type: 'phone',
      verified: true,
    },
    {
      icon: <Calendar size={20} color="#06402B" />,
      label: 'Date of Birth',
      value: userData.dateOfBirth,
      type: 'date',
    },
  ];

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 800,
        useNativeDriver: true,
      }),
    ]).start();
  }, [fadeAnim, slideAnim]);

  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Sorry, we need camera roll permissions to make this work!');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 1,
    });

    if (!result.canceled) {
      setUserData(prev => ({ ...prev, avatar: result.assets[0].uri }));
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
  };

  const handleEditPress = (item: EditableRow) => {
    Alert.alert(
      `Edit ${item.label}`,
      `Current value: ${item.value}`,
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Edit', onPress: () => console.log(`Edit ${item.label}`) },
      ]
    );
  };

  const renderSettingRow = (
    icon: React.ReactNode,
    title: string,
    subtitle?: string,
    onPress?: () => void,
    rightElement?: React.ReactNode,
    danger: boolean = false
  ) => (
    <TouchableOpacity
      style={[styles.settingRow, danger && styles.dangerRow]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View style={styles.settingLeft}>
        <View style={[styles.settingIcon, danger && styles.dangerIcon]}>
          {icon}
        </View>
        <View style={styles.settingContent}>
          <Text style={[styles.settingTitle, danger && styles.dangerText]}>
            {title}
          </Text>
          {subtitle && (
            <Text style={styles.settingSubtitle}>{subtitle}</Text>
          )}
        </View>
      </View>
      {rightElement || <ChevronRight size={20} color={danger ? "#E53E3E" : "#666"} />}
    </TouchableOpacity>
  );

  const renderPersonalInfoRow = (item: EditableRow, index: number) => (
    <TouchableOpacity
      key={index}
      style={styles.infoRow}
      onPress={() => handleEditPress(item)}
      activeOpacity={0.7}
    >
      <View style={styles.infoLeft}>
        <View style={styles.infoIcon}>{item.icon}</View>
        <View style={styles.infoContent}>
          <Text style={styles.infoLabel}>{item.label}</Text>
          <Text style={styles.infoValue}>{item.value}</Text>
        </View>
      </View>
      <View style={styles.infoRight}>
        {item.verified && (
          <View style={styles.verifiedBadge}>
            <ShieldCheck size={16} color="#059669" />
          </View>
        )}
        <ChevronRight size={20} color="#06402B" />
      </View>
    </TouchableOpacity>
  );

  const handleLogout = () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Logout', style: 'destructive', onPress: () => console.log('Logout') },
      ]
    );
  };

  const handleDeleteAccount = () => {
    Alert.alert(
      'Delete Account',
      'This action cannot be undone. Are you sure you want to delete your account?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Delete', style: 'destructive', onPress: () => console.log('Delete account') },
      ]
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#F8FAFC" />
      <Animated.View 
        style={[
          styles.content,
          {
            opacity: fadeAnim,
            transform: [{ translateY: slideAnim }],
          },
        ]}
      >
        <ScrollView 
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.headerTitle}>Profile</Text>
          </View>

          {/* Profile Avatar Section */}
          <View style={styles.avatarSection}>
            <TouchableOpacity style={styles.avatarContainer} onPress={pickImage}>
              {userData.avatar ? (
                <Image source={{ uri: userData.avatar }} style={styles.avatar} />
              ) : (
                <View style={styles.defaultAvatar}>
                  <User size={40} color="#06402B" />
                </View>
              )}
              <View style={styles.cameraIcon}>
                <Camera size={16} color="white" />
              </View>
            </TouchableOpacity>
            
            <View style={styles.userInfo}>
              <View style={styles.nameContainer}>
                <Text style={styles.displayName}>{userData.displayName}</Text>
                {userData.isVerified && (
                  <ShieldCheck size={20} color="#059669" style={styles.verifiedIcon} />
                )}
              </View>
              <Text style={styles.username}>{userData.username}</Text>
            </View>
          </View>

          {/* Personal Information Section */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <UserCircle size={24} color="#06402B" />
              <Text style={styles.sectionTitle}>Personal Information</Text>
            </View>
            <View style={styles.sectionContent}>
              {personalInfo.map((item, index) => renderPersonalInfoRow(item, index))}
            </View>
          </View>

          {/* Security & Privacy Section */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Shield size={24} color="#06402B" />
              <Text style={styles.sectionTitle}>Security & Privacy</Text>
            </View>
            <View style={styles.sectionContent}>
              {renderSettingRow(
                <Fingerprint size={20} color="#06402B" />,
                'Biometric Authentication',
                'Use fingerprint or face ID',
                () => {
                  setSettings(prev => ({
                    ...prev,
                    biometrics: !prev.biometrics
                  }));
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                },
                <Switch
                  value={settings.biometrics}
                  onValueChange={(value) => {
                    setSettings(prev => ({ ...prev, biometrics: value }));
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  }}
                  trackColor={{ false: '#E2E8F0', true: '#059669' }}
                  thumbColor={settings.biometrics ? '#fff' : '#fff'}
                />
              )}
              {renderSettingRow(
                <ShieldCheck size={20} color="#06402B" />,
                'Two-Factor Authentication',
                'Add an extra layer of security',
                () => {
                  setSettings(prev => ({
                    ...prev,
                    twoFactor: !prev.twoFactor
                  }));
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                },
                <Switch
                  value={settings.twoFactor}
                  onValueChange={(value) => {
                    setSettings(prev => ({ ...prev, twoFactor: value }));
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  }}
                  trackColor={{ false: '#E2E8F0', true: '#059669' }}
                  thumbColor={settings.twoFactor ? '#fff' : '#fff'}
                />
              )}
              {renderSettingRow(
                <Shield size={20} color="#06402B" />,
                'Change PIN',
                'Update your security PIN'
              )}
            </View>
          </View>

          {/* Preferences Section */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Sliders size={24} color="#06402B" />
              <Text style={styles.sectionTitle}>Preferences</Text>
            </View>
            <View style={styles.sectionContent}>
              {renderSettingRow(
                <DollarSign size={20} color="#06402B" />,
                'Currency',
                settings.currency + ' Nigerian Naira'
              )}
              {renderSettingRow(
                <Languages size={20} color="#06402B" />,
                'Language',
                settings.language
              )}
              {renderSettingRow(
                <Moon size={20} color="#06402B" />,
                'Dark Mode',
                'Enable dark theme',
                () => {
                  setSettings(prev => ({
                    ...prev,
                    darkMode: !prev.darkMode
                  }));
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                },
                <Switch
                  value={settings.darkMode}
                  onValueChange={(value) => {
                    setSettings(prev => ({ ...prev, darkMode: value }));
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  }}
                  trackColor={{ false: '#E2E8F0', true: '#059669' }}
                  thumbColor={settings.darkMode ? '#fff' : '#fff'}
                />
              )}
              {renderSettingRow(
                <Bell size={20} color="#06402B" />,
                'Notifications',
                'Manage your notification preferences'
              )}
            </View>
          </View>

          {/* Banking & Cards Section */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Wallet size={24} color="#06402B" />
              <Text style={styles.sectionTitle}>Banking & Cards</Text>
            </View>
            <View style={styles.sectionContent}>
              {renderSettingRow(
                <CreditCard size={20} color="#06402B" />,
                'Payment Methods',
                'Manage cards and bank accounts'
              )}
              {renderSettingRow(
                <PiggyBank size={20} color="#06402B" />,
                'Savings Goals',
                'Set and track your savings'
              )}
              {renderSettingRow(
                <Settings size={20} color="#06402B" />,
                'Transaction Limits',
                'Manage your spending limits'
              )}
            </View>
          </View>

          {/* Support & Legal Section */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <LifeBuoy size={24} color="#06402B" />
              <Text style={styles.sectionTitle}>Support & Legal</Text>
            </View>
            <View style={styles.sectionContent}>
              {renderSettingRow(
                <HelpCircle size={20} color="#06402B" />,
                'Help Center',
                'Get support and find answers'
              )}
              {renderSettingRow(
                <Mail size={20} color="#06402B" />,
                'Contact Support',
                'Reach out to our team'
              )}
              {renderSettingRow(
                <Shield size={20} color="#06402B" />,
                'Privacy Policy',
                'Learn how we protect your data'
              )}
              {renderSettingRow(
                <UserCheck size={20} color="#06402B" />,
                'Terms of Service',
                'Read our terms and conditions'
              )}
            </View>
          </View>

          {/* Danger Zone */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <AlertTriangle size={24} color="#E53E3E" />
              <Text style={[styles.sectionTitle, styles.dangerText]}>Account Actions</Text>
            </View>
            <View style={styles.sectionContent}>
              {renderSettingRow(
                <LogOut size={20} color="#E53E3E" />,
                'Logout',
                'Sign out of your account',
                handleLogout,
                undefined,
                true
              )}
              {renderSettingRow(
                <Trash2 size={20} color="#E53E3E" />,
                'Delete Account',
                'Permanently delete your account',
                handleDeleteAccount,
                undefined,
                true
              )}
            </View>
          </View>
        </ScrollView>
      </Animated.View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  content: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 100,
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 16,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: '#06402B',
    textAlign: 'center',
  },
  avatarSection: {
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingBottom: 32,
  },
  avatarContainer: {
    position: 'relative',
    marginBottom: 16,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 4,
    borderColor: '#059669',
  },
  defaultAvatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#E6FFFA',
    borderWidth: 4,
    borderColor: '#059669',
    alignItems: 'center',
    justifyContent: 'center',
  },
  cameraIcon: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: '#059669',
    borderRadius: 18,
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    borderColor: '#F8FAFC',
  },
  userInfo: {
    alignItems: 'center',
  },
  nameContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  displayName: {
    fontSize: 24,
    fontWeight: '600',
    color: '#06402B',
  },
  verifiedIcon: {
    marginLeft: 8,
  },
  username: {
    fontSize: 16,
    color: '#64748B',
  },
  section: {
    marginBottom: 24,
    paddingHorizontal: 20,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    paddingHorizontal: 4,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#06402B',
    marginLeft: 12,
  },
  sectionContent: {
    backgroundColor: 'white',
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  settingLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  settingIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F0FDF4',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  settingContent: {
    flex: 1,
  },
  settingTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: '#06402B',
    marginBottom: 2,
  },
  settingSubtitle: {
    fontSize: 14,
    color: '#64748B',
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  infoLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  infoIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F0FDF4',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  infoContent: {
    flex: 1,
  },
  infoLabel: {
    fontSize: 14,
    color: '#64748B',
    marginBottom: 2,
  },
  infoValue: {
    fontSize: 16,
    fontWeight: '500',
    color: '#06402B',
  },
  infoRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  verifiedBadge: {
    marginRight: 8,
  },
  dangerRow: {
    backgroundColor: '#FEF2F2',
  },
  dangerIcon: {
    backgroundColor: '#FEE2E2',
  },
  dangerText: {
    color: '#E53E3E',
  },
});

export default ProfileScreen;
