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
  Platform,
} from 'react-native';
import {
  User,
  ShieldCheck,
  ArrowUpCircle,
  ArrowDownCircle,
  CreditCard,
  ChevronRight,
  Shield,
  Fingerprint,
  Bell,
  Sun,
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
} from 'lucide-react-native';
import * as ImagePicker from 'expo-image-picker';
// @ts-ignore
import * as Haptics from 'expo-haptics';

interface StatItem {
  icon: React.ReactNode;
  label: string;
  value: string;
}

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

  // Stats data
  const stats: StatItem[] = [
    {
      icon: <ArrowUpCircle size={20} color="#06402B" />,
      label: 'Sent',
      value: '₦2.4M',
    },
    {
      icon: <ArrowDownCircle size={20} color="#06402B" />,
      label: 'Received',
      value: '₦1.8M',
    },
    {
      icon: <CreditCard size={20} color="#06402B" />,
      label: 'Cards',
      value: '3',
    },
  ];

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

  // Animation on mount
  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 400,
        useNativeDriver: true,
      }),
    ]).start();
  }, [fadeAnim, slideAnim]);

  // Handle avatar change
  const handleAvatarPress = async () => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    
    Alert.alert(
      'Change Profile Picture',
      'Choose an option',
      [
        { text: 'Camera', onPress: () => openImagePicker('camera') },
        { text: 'Gallery', onPress: () => openImagePicker('gallery') },
        { text: 'Cancel', style: 'cancel' },
      ]
    );
  };

  const openImagePicker = async (source: 'camera' | 'gallery') => {
    const permissionResult = source === 'camera' 
      ? await ImagePicker.requestCameraPermissionsAsync()
      : await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (!permissionResult.granted) {
      Alert.alert('Permission Required', 'Please grant camera/gallery permissions to continue.');
      return;
    }

    const result = source === 'camera'
      ? await ImagePicker.launchCameraAsync({
          mediaTypes: ImagePicker.MediaTypeOptions.Images,
          allowsEditing: true,
          aspect: [1, 1],
          quality: 0.8,
        })
      : await ImagePicker.launchImageLibraryAsync({
          mediaTypes: ImagePicker.MediaTypeOptions.Images,
          allowsEditing: true,
          aspect: [1, 1],
          quality: 0.8,
        });

    if (!result.canceled && result.assets[0]) {
      setUserData(prev => ({ ...prev, avatar: result.assets[0].uri }));
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }
  };

  // Handle toggle changes
  const handleToggleChange = async (key: string, value: boolean) => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    
    if (key === 'biometrics' || key === 'twoFactor' || key === 'darkMode') {
      setSettings(prev => ({ ...prev, [key]: value }));
    } else if (key.startsWith('notifications.')) {
      const notificationKey = key.split('.')[1];
      setSettings(prev => ({
        ...prev,
        notifications: { ...prev.notifications, [notificationKey]: value }
      }));
    }
  };

  // Handle logout
  const handleLogout = () => {
    Alert.alert(
      'Sign Out',
      'Are you sure you want to sign out?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Sign Out',
          style: 'destructive',
          onPress: () => {
            console.log('Logging out...');
          },
        },
      ]
    );
  };

  // Handle delete account
  const handleDeleteAccount = () => {
    Alert.alert(
      'Delete Account',
      'This action cannot be undone. All your data will be permanently deleted.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            Alert.alert(
              'Final Confirmation',
              'Type "DELETE" to confirm account deletion',
              [
                { text: 'Cancel', style: 'cancel' },
                {
                  text: 'Confirm Delete',
                  style: 'destructive',
                  onPress: () => console.log('Account deleted'),
                },
              ]
            );
          },
        },
      ]
    );
  };

  // Render methods
  const renderHeader = () => (
    <View style={styles.headerContainer}>
      {/* Cover gradient background */}
      <View style={styles.coverGradient} />
      
      {/* Avatar and user info */}
      <View style={styles.userInfoContainer}>
        <TouchableOpacity style={styles.avatarContainer} onPress={handleAvatarPress}>
          {userData.avatar ? (
            <Image source={{ uri: userData.avatar }} style={styles.avatar} />
          ) : (
            <View style={styles.avatarPlaceholder}>
              <User size={40} color="#06402B" />
            </View>
          )}
          <View style={styles.cameraOverlay}>
            <Camera size={16} color="#FFFFFF" />
          </View>
        </TouchableOpacity>

        <View style={styles.userTextContainer}>
          <View style={styles.nameContainer}>
            <Text style={styles.displayName}>{userData.displayName}</Text>
            {userData.isVerified && (
              <ShieldCheck size={20} color="#06402B" style={styles.verifiedBadge} />
            )}
          </View>
          <Text style={styles.username}>{userData.username}</Text>
          <Text style={styles.phone}>{userData.phone}</Text>
        </View>
      </View>
    </View>
  );

  const renderQuickStats = () => (
    <View style={styles.statsContainer}>
      {stats.map((stat, index) => (
        <View key={index} style={styles.statItem}>
          {stat.icon}
          <Text style={styles.statValue}>{stat.value}</Text>
          <Text style={styles.statLabel}>{stat.label}</Text>
        </View>
      ))}
    </View>
  );

  const renderCard = (title: string, children: React.ReactNode) => (
    <View 
      style={[
        styles.card,
      ]}
    >
      <Text style={styles.cardTitle}>{title}</Text>
      {children}
    </View>
  );

  const renderEditableRow = (item: EditableRow, onPress: () => void) => (
    <TouchableOpacity key={item.label} style={styles.editableRow} onPress={onPress}>
      <View style={styles.rowLeft}>
        {item.icon}
        <View style={styles.rowText}>
          <Text style={styles.rowLabel}>{item.label}</Text>
          <Text style={styles.rowValue}>{item.value}</Text>
        </View>
      </View>
      <View style={styles.rowRight}>
        {item.verified && <UserCheck size={16} color="#06402B" />}
        <ChevronRight size={20} color="#A3AABE" />
      </View>
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

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#06402B" />
      
      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Header Banner */}
        {renderHeader()}

        {/* Quick Stats */}
        {renderQuickStats()}

        {/* Personal Information Card */}
        {renderCard(
          'Personal Information',
          <View>
            {personalInfo.map((item) =>
              renderEditableRow(item, () => console.log(`Edit ${item.label}`))
            )}
          </View>
        )}

        {/* Security Card */}
        {renderCard(
          'Security',
          <View>
            {renderActionRow(
              <Shield size={20} color="#06402B" />,
              'Change PIN',
              () => console.log('Change PIN'),
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
            {renderActionRow(
              <LogOut size={20} color="#EA3B52" />,
              'Sign Out Everywhere',
              () => console.log('Sign out everywhere'),
              'End all active sessions',
              true
            )}
          </View>
        )}

        {/* Preferences Card */}
        {renderCard(
          'Preferences',
          <View>
            {renderActionRow(
              <DollarSign size={20} color="#06402B" />,
              'Currency',
              () => console.log('Change currency'),
              settings.currency
            )}
            {renderActionRow(
              <Languages size={20} color="#06402B" />,
              'Language',
              () => console.log('Change language'),
              settings.language
            )}
            {renderToggleRow(
              settings.darkMode ? (
                <Moon size={20} color="#06402B" />
              ) : (
                <Sun size={20} color="#06402B" />
              ),
              'Dark Mode',
              settings.darkMode,
              (value) => handleToggleChange('darkMode', value)
            )}
            {renderToggleRow(
              <Bell size={20} color="#06402B" />,
              'Push Notifications',
              settings.notifications.push,
              (value) => handleToggleChange('notifications.push', value)
            )}
            {renderToggleRow(
              <Mail size={20} color="#06402B" />,
              'Email Notifications',
              settings.notifications.email,
              (value) => handleToggleChange('notifications.email', value)
            )}
            {renderToggleRow(
              <Phone size={20} color="#06402B" />,
              'SMS Notifications',
              settings.notifications.sms,
              (value) => handleToggleChange('notifications.sms', value)
            )}
          </View>
        )}

        {/* Banking & Cards Card */}
        {renderCard(
          'Banking & Cards',
          <View>
            {renderActionRow(
              <PiggyBank size={20} color="#06402B" />,
              'Linked Bank Accounts',
              () => console.log('Manage bank accounts'),
              '**** **** **** 1234'
            )}
            {renderActionRow(
              <CreditCard size={20} color="#06402B" />,
              'Virtual Cards',
              () => console.log('Open VirtualCardHub'),
              '3 active cards'
            )}
            {renderActionRow(
              <Settings size={20} color="#06402B" />,
              'Account Settings',
              () => console.log('Account settings'),
              'KYC & Limits'
            )}
          </View>
        )}

        {/* Support & Legal Card */}
        {renderCard(
          'Support & Legal',
          <View>
            {renderActionRow(
              <HelpCircle size={20} color="#06402B" />,
              'Contact Support',
              () => console.log('Contact support'),
              'Chat or email us'
            )}
            <View style={styles.versionContainer}>
              <Text style={styles.versionText}>KotaPay v1.2.3 (Build 456)</Text>
            </View>
          </View>
        )}

        {/* Danger Zone Card */}
        {renderCard(
          'Danger Zone',
          <View>
            <TouchableOpacity style={styles.dangerButton} onPress={handleLogout}>
              <LogOut size={20} color="#FFFFFF" />
              <Text style={styles.dangerButtonText}>Log Out</Text>
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.dangerButtonOutline} onPress={handleDeleteAccount}>
              <Trash2 size={20} color="#EA3B52" />
              <Text style={styles.dangerButtonOutlineText}>Delete Account</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Bottom spacing */}
        <View style={styles.bottomSpacing} />
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFF0F5',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 20,
  },
  
  // Header styles
  headerContainer: {
    position: 'relative',
    height: 200,
    marginBottom: 20,
  },
  coverGradient: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 140,
    backgroundColor: '#06402B',
    shadowColor: '#A8E4A0',
    shadowOffset: { width: 0, height: 20 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
  },
  userInfoContainer: {
    position: 'absolute',
    top: 80,
    left: 0,
    right: 0,
    alignItems: 'center',
  },
  avatarContainer: {
    position: 'relative',
    marginBottom: 12,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 4,
    borderColor: '#FFFFFF',
  },
  avatarPlaceholder: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 4,
    borderColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  cameraOverlay: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#06402B',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  userTextContainer: {
    alignItems: 'center',
  },
  nameContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  displayName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#06402B',
  },
  verifiedBadge: {
    marginLeft: 8,
  },
  username: {
    fontSize: 14,
    color: '#A3AABE',
    marginBottom: 2,
  },
  phone: {
    fontSize: 14,
    color: '#A3AABE',
  },
  
  // Stats styles
  statsContainer: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    marginHorizontal: 16,
    marginBottom: 20,
    borderRadius: 12,
    paddingVertical: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#06402B',
    marginTop: 8,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#A3AABE',
  },
  
  // Card styles
  card: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: 16,
    marginBottom: 16,
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '500',
    color: '#06402B',
    marginBottom: 16,
  },
  
  // Row styles
  editableRow: {
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
  actionRow: {
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
  rowRight: {
    flexDirection: 'row',
    alignItems: 'center',
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
  rowValue: {
    fontSize: 14,
    color: '#A3AABE',
    marginTop: 2,
  },
  rowSubtitle: {
    fontSize: 12,
    color: '#A3AABE',
    marginTop: 2,
  },
  dangerText: {
    color: '#EA3B52',
  },
  
  // Version styles
  versionContainer: {
    paddingVertical: 12,
    alignItems: 'center',
  },
  versionText: {
    fontSize: 12,
    color: '#A3AABE',
  },
  
  // Danger zone styles
  dangerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#EA3B52',
    borderRadius: 8,
    paddingVertical: 12,
    marginBottom: 12,
    minHeight: 48,
  },
  dangerButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 8,
  },
  dangerButtonOutline: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#EA3B52',
    borderRadius: 8,
    paddingVertical: 12,
    minHeight: 48,
  },
  dangerButtonOutlineText: {
    color: '#EA3B52',
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 8,
  },
  
  bottomSpacing: {
    height: 20,
  },
});

export default ProfileScreen;
