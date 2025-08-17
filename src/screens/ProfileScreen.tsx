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
  Share,
  Clipboard,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
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
  UserCheck,
  Copy,
  Share2,
  FileText,
  Building2,
  Gift,
  MessageCircle,
  Lock,
  Eye,
  Smartphone,
} from 'lucide-react-native';
import * as ImagePicker from 'expo-image-picker';
// @ts-ignore
import * as Haptics from 'expo-haptics';

interface StatChip {
  icon: React.ReactNode;
  label: string;
  value: string;
  color: string;
}

interface EditableRow {
  icon: React.ReactNode;
  label: string;
  value: string;
  type: 'text' | 'email' | 'phone' | 'date';
  verified?: boolean;
}

interface BankAccount {
  id: string;
  bankName: string;
  maskedNumber: string;
  logo: string;
}

const ProfileScreen: React.FC = () => {
  // Animation values
  const [fadeAnim] = useState(new Animated.Value(0));
  const [cardAnimations] = useState([
    new Animated.Value(50),
    new Animated.Value(50),
    new Animated.Value(50),
    new Animated.Value(50),
    new Animated.Value(50),
    new Animated.Value(50),
    new Animated.Value(50),
    new Animated.Value(50),
    new Animated.Value(50),
  ]);
  
  // User data state
  const [userData, setUserData] = useState({
    displayName: 'Sarah Johnson',
    username: '@sarah_j',
    userId: 'KP-789456123',
    phone: '+234 801 234 5678',
    email: 'sarah@example.com',
    dateOfBirth: '1995-06-15',
    avatar: null as string | null,
    isVerified: true,
    kycTier: 2,
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

  // Stats data - comprehensive quick stats
  const stats: StatChip[] = [
    {
      icon: <ArrowUpCircle size={16} color="#06402B" />,
      label: 'Total Sent',
      value: '₦2.4M',
      color: '#A8E4A0',
    },
    {
      icon: <ArrowDownCircle size={16} color="#06402B" />,
      label: 'Received',
      value: '₦1.8M',
      color: '#A8E4A0',
    },
    {
      icon: <CreditCard size={16} color="#06402B" />,
      label: 'Virtual Cards',
      value: '3',
      color: '#A8E4A0',
    },
    {
      icon: <Gift size={16} color="#06402B" />,
      label: 'Referral Earnings',
      value: '₦45K',
      color: '#A8E4A0',
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

  // Bank accounts data
  const [bankAccounts] = useState<BankAccount[]>([
    {
      id: '1',
      bankName: 'GTBank',
      maskedNumber: '**** **** **** 1234',
      logo: '🏦',
    },
    {
      id: '2',
      bankName: 'Access Bank',
      maskedNumber: '**** **** **** 5678',
      logo: '🏦',
    },
  ]);

  // Animation on mount with staggered effect
  useEffect(() => {
    // Hero banner fade-in
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 400,
      useNativeDriver: true,
    }).start();

    // Staggered card animations
    const animations = cardAnimations.map((anim, index) =>
      Animated.timing(anim, {
        toValue: 0,
        duration: 300,
        delay: index * 40,
        useNativeDriver: true,
      })
    );

    Animated.parallel(animations).start();
  }, [fadeAnim, cardAnimations]);

  // Handle avatar change with cross-fade animation
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
      // Show success toast
      Alert.alert('Success', 'Profile picture updated!');
    }
  };

  // Handle copy user ID
  const handleCopyUserId = async () => {
    await Clipboard.setStringAsync(userData.userId);
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    Alert.alert('Copied', 'User ID copied to clipboard');
  };

  // Handle toggle changes with haptic feedback
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
    
    // Show success feedback
    setTimeout(() => {
      Alert.alert('Updated', 'Settings saved successfully');
    }, 150);
  };

  // Handle referral sharing
  const handleReferralShare = async () => {
    const referralCode = 'SARAH789';
    const shareMessage = `Join KotaPay using my referral code: ${referralCode} and get ₦500 bonus! Download: https://kotapay.app`;
    
    try {
      await Share.share({
        message: shareMessage,
        title: 'Join KotaPay',
      });
    } catch (error) {
      console.error('Error sharing:', error);
    }
  };

  // Handle logout with confirmation
  const handleLogout = () => {
    Alert.alert(
      'Sign Out',
      'Are you sure you want to sign out? This will clear all local data.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Sign Out',
          style: 'destructive',
          onPress: () => {
            // Clear tokens & biometric keys
            console.log('Logging out...');
          },
        },
      ]
    );
  };

  // Handle delete account with double-confirmation + OTP
  const handleDeleteAccount = () => {
    Alert.alert(
      'Delete Account',
      'This action will permanently delete your account after 30 days. You can restore it during this period.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Continue',
          style: 'destructive',
          onPress: () => {
            Alert.alert(
              'Final Confirmation',
              'Type "DELETE" to confirm account deletion. An OTP will be sent to verify.',
              [
                { text: 'Cancel', style: 'cancel' },
                {
                  text: 'Send OTP',
                  style: 'destructive',
                  onPress: () => console.log('Send OTP for account deletion'),
                },
              ]
            );
          },
        },
      ]
    );
  };

  // Render methods
  const renderHeroBanner = () => (
    <Animated.View 
      style={[
        styles.headerContainer,
        { opacity: fadeAnim }
      ]}
    >
      {/* Cover gradient background with 30% opacity */}
      <LinearGradient
        colors={['rgba(6, 64, 43, 0.3)', 'rgba(168, 228, 160, 0.3)']}
        style={styles.coverGradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      />
      
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
            {userData.isVerified && userData.kycTier >= 2 && (
              <ShieldCheck size={20} color="#06402B" style={styles.verifiedBadge} />
            )}
          </View>
          <Text style={styles.username}>{userData.username}</Text>
          <TouchableOpacity style={styles.copyIdChip} onPress={handleCopyUserId}>
            <Copy size={12} color="#06402B" />
            <Text style={styles.copyIdText}>Copy ID</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Animated.View>
  );

  const renderQuickStats = () => (
    <Animated.View 
      style={[
        styles.statsContainer,
        { transform: [{ translateY: cardAnimations[0] }] }
      ]}
    >
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.statsScrollContent}>
        {stats.map((stat, index) => (
          <View key={index} style={[styles.statChip, { backgroundColor: stat.color }]}>
            {stat.icon}
            <Text style={styles.statValue}>{stat.value}</Text>
            <Text style={styles.statLabel}>{stat.label}</Text>
          </View>
        ))}
      </ScrollView>
    </Animated.View>
  );

  const renderCard = (title: string, children: React.ReactNode, animationIndex: number) => (
    <Animated.View 
      style={[
        styles.card,
        { transform: [{ translateY: cardAnimations[animationIndex] }] }
      ]}
    >
      <Text style={styles.cardTitle}>{title}</Text>
      {children}
    </Animated.View>
  );

  const renderEditableRow = (item: EditableRow, onPress: () => void) => (
    <TouchableOpacity 
      key={item.label} 
      style={styles.editableRow} 
      onPress={onPress}
      activeOpacity={0.7}
    >
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
        style={styles.switch}
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
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
      
      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* A. Hero Banner */}
        {renderHeroBanner()}

        {/* B. Quick Stats Chips */}
        {renderQuickStats()}

        {/* C. Personal Details Card */}
        {renderCard(
          'Personal Details',
          <View>
            {personalInfo.map((item) =>
              renderEditableRow(item, () => console.log(`Edit ${item.label}`))
            )}
          </View>,
          1
        )}

        {/* D. Security Card */}
        {renderCard(
          'Security',
          <View>
            {renderActionRow(
              <Lock size={20} color="#06402B" />,
              'Change 6-digit PIN',
              () => console.log('Change PIN'),
              'Update your security PIN'
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
              (value) => handleToggleChange('twoFactor', value),
              'SMS / Authenticator'
            )}
            {renderActionRow(
              <LogOut size={20} color="#EA3B52" />,
              'Sign out everywhere',
              () => console.log('Sign out everywhere'),
              'End all active sessions',
              true
            )}
          </View>,
          2
        )}

        {/* E. Preferences Card */}
        {renderCard(
          'Preferences',
          <View>
            {renderActionRow(
              <DollarSign size={20} color="#06402B" />,
              'Currency',
              () => console.log('Change currency'),
              `${settings.currency} - Nigerian Naira`
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
              <Smartphone size={20} color="#06402B" />,
              'SMS Notifications',
              settings.notifications.sms,
              (value) => handleToggleChange('notifications.sms', value)
            )}
          </View>,
          3
        )}

        {/* F. Banking & Cards Card */}
        {renderCard(
          'Banking & Cards',
          <View>
            {bankAccounts.map((account, index) => (
              <TouchableOpacity key={account.id} style={styles.bankAccountRow}>
                <View style={styles.rowLeft}>
                  <Text style={styles.bankLogo}>{account.logo}</Text>
                  <View style={styles.rowText}>
                    <Text style={styles.rowLabel}>{account.bankName}</Text>
                    <Text style={styles.rowValue}>{account.maskedNumber}</Text>
                  </View>
                </View>
                <ChevronRight size={20} color="#A3AABE" />
              </TouchableOpacity>
            ))}
            {renderActionRow(
              <CreditCard size={20} color="#06402B" />,
              'Virtual Cards',
              () => console.log('Manage virtual cards'),
              '3 active cards'
            )}
            {renderActionRow(
              <Building2 size={20} color="#06402B" />,
              'Add new bank account',
              () => console.log('Add bank account')
            )}
          </View>,
          4
        )}

        {/* G. Refer & Earn Card */}
        {renderCard(
          'Refer & Earn',
          <View>
            <View style={styles.referralContainer}>
              <Text style={styles.referralCodeLabel}>Your referral code</Text>
              <TouchableOpacity style={styles.referralCodeChip}>
                <Text style={styles.referralCode}>SARAH789</Text>
                <Copy size={16} color="#06402B" />
              </TouchableOpacity>
            </View>
            <TouchableOpacity style={styles.shareButton} onPress={handleReferralShare}>
              <Share2 size={20} color="#FFFFFF" />
              <Text style={styles.shareButtonText}>Share referral link</Text>
            </TouchableOpacity>
            <View style={styles.progressContainer}>
              <Text style={styles.progressLabel}>Earned bonuses: ₦45,000</Text>
              <View style={styles.progressBar}>
                <View style={[styles.progressFill, { width: '75%' }]} />
              </View>
              <Text style={styles.progressSubtext}>3 of 5 referrals for next bonus</Text>
            </View>
          </View>,
          5
        )}

        {/* H. Support & Legal Card */}
        {renderCard(
          'Support & Legal',
          <View>
            {renderActionRow(
              <MessageCircle size={20} color="#06402B" />,
              'Contact Support',
              () => console.log('Contact support'),
              'In-app chat or email'
            )}
            {renderActionRow(
              <HelpCircle size={20} color="#06402B" />,
              'FAQ',
              () => console.log('Open FAQ')
            )}
            {renderActionRow(
              <FileText size={20} color="#06402B" />,
              'Terms of Service',
              () => console.log('Open terms')
            )}
            {renderActionRow(
              <Eye size={20} color="#06402B" />,
              'Privacy Policy',
              () => console.log('Open privacy')
            )}
            <View style={styles.versionContainer}>
              <Text style={styles.versionText}>KotaPay v1.2.3 (Build 456)</Text>
            </View>
          </View>,
          6
        )}

        {/* I. Danger Zone Card */}
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
          </View>,
          7
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
    backgroundColor: '#FFFFFF',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 20,
  },
  
  // A. Hero Banner styles
  headerContainer: {
    position: 'relative',
    height: 240,
    marginBottom: 20,
  },
  coverGradient: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 160,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
  },
  userInfoContainer: {
    position: 'absolute',
    top: 100,
    left: 0,
    right: 0,
    alignItems: 'center',
  },
  avatarContainer: {
    position: 'relative',
    marginBottom: 16,
  },
  avatar: {
    width: 96,
    height: 96,
    borderRadius: 48,
    borderWidth: 4,
    borderColor: '#FFFFFF',
  },
  avatarPlaceholder: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 4,
    borderColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  cameraOverlay: {
    position: 'absolute',
    bottom: 2,
    right: 2,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#06402B',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
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
    marginBottom: 8,
  },
  copyIdChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#A8E4A0',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  copyIdText: {
    fontSize: 12,
    color: '#06402B',
    marginLeft: 4,
    fontWeight: '500',
  },
  
  // B. Quick Stats styles
  statsContainer: {
    marginHorizontal: 16,
    marginBottom: 20,
  },
  statsScrollContent: {
    paddingHorizontal: 4,
  },
  statChip: {
    alignItems: 'center',
    backgroundColor: '#A8E4A0',
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 20,
    marginHorizontal: 4,
    minWidth: 100,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  statValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#06402B',
    marginTop: 8,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 11,
    color: '#06402B',
    textAlign: 'center',
    opacity: 0.8,
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
    fontWeight: '600',
    color: '#06402B',
    marginBottom: 16,
  },
  
  // Row styles (≥ 48px hit targets)
  editableRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F5F5F5',
    minHeight: 48,
  },
  toggleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F5F5F5',
    minHeight: 48,
  },
  actionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F5F5F5',
    minHeight: 48,
  },
  bankAccountRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
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
  bankLogo: {
    fontSize: 20,
    width: 20,
  },
  switch: {
    transform: [{ scaleX: 0.9 }, { scaleY: 0.9 }],
  },
  
  // G. Refer & Earn styles
  referralContainer: {
    marginBottom: 16,
  },
  referralCodeLabel: {
    fontSize: 14,
    color: '#A3AABE',
    marginBottom: 8,
  },
  referralCodeChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8F9FA',
    borderWidth: 1,
    borderColor: '#E5E5E5',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    justifyContent: 'space-between',
  },
  referralCode: {
    fontSize: 16,
    fontWeight: '600',
    color: '#06402B',
    letterSpacing: 1,
  },
  shareButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#06402B',
    borderRadius: 8,
    paddingVertical: 12,
    marginBottom: 16,
  },
  shareButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 8,
  },
  progressContainer: {
    backgroundColor: '#F8F9FA',
    borderRadius: 8,
    padding: 12,
  },
  progressLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#06402B',
    marginBottom: 8,
  },
  progressBar: {
    height: 6,
    backgroundColor: '#E5E5E5',
    borderRadius: 3,
    marginBottom: 6,
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#A8E4A0',
    borderRadius: 3,
  },
  progressSubtext: {
    fontSize: 12,
    color: '#A3AABE',
  },
  
  // Version styles
  versionContainer: {
    paddingVertical: 12,
    alignItems: 'center',
    borderBottomWidth: 0,
  },
  versionText: {
    fontSize: 12,
    color: '#A3AABE',
  },
  
  // I. Danger zone styles
  dangerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#EA3B52',
    borderRadius: 8,
    paddingVertical: 14,
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
    paddingVertical: 14,
    minHeight: 48,
  },
  dangerButtonOutlineText: {
    color: '#EA3B52',
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 8,
  },
  
  bottomSpacing: {
    height: 40,
  },
});

export default ProfileScreen;
