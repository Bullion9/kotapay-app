import AsyncStorage from '@react-native-async-storage/async-storage';
import { StackNavigationProp } from '@react-navigation/stack';
import {
    Calendar,
    CheckCircle,
    ChevronLeft,
    Edit,
    Mail,
    MapPin,
    Phone,
    Save,
    Shield,
    User,
    X,
} from 'lucide-react-native';
import React, { useEffect, useState } from 'react';
import {
    Alert,
    KeyboardAvoidingView,
    Modal,
    Platform,
    SafeAreaView,
    ScrollView,
    StatusBar,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';
import { colors as globalColors } from '../theme';
import { ProfileParamList } from '../types';

// Ultra-Professional Color Palette
const colors = {
  canvas: globalColors.background, // Use app's background color instead of white
  seaGreen: '#06402B',
  mint: '#A8E4A0',
  muted: '#A3AABE',
  coral: '#EA3B52',
  text: '#1A1A1A',
  textLight: '#666666',
  shadow: 'rgba(0, 0, 0, 0.1)',
  background: globalColors.background,
  border: '#E5E7EB',
};

interface UserProfile {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  address: string;
  dateOfBirth: string;
  accountNumber: string;
  joinDate: string;
  kycLevel: number;
  isVerified: boolean;
}

interface AccountInformationScreenProps {
  navigation: StackNavigationProp<ProfileParamList, 'AccountInformation'>;
}

const AccountInformationScreen: React.FC<AccountInformationScreenProps> = ({ navigation }) => {
  const [profile, setProfile] = useState<UserProfile>({
    firstName: 'John',
    lastName: 'Doe',
    email: 'john.doe@example.com',
    phone: '+234 812 345 6789',
    address: '123 Lagos Street, Victoria Island, Lagos',
    dateOfBirth: '1990-01-15',
    accountNumber: 'KP' + Math.random().toString().substr(2, 8),
    joinDate: '2024-01-15',
    kycLevel: 2,
    isVerified: true,
  });

  const [editingField, setEditingField] = useState<string | null>(null);
  const [editValue, setEditValue] = useState('');
  const [isEditModalVisible, setIsEditModalVisible] = useState(false);

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      const savedProfile = await AsyncStorage.getItem('userProfile');
      if (savedProfile) {
        setProfile(JSON.parse(savedProfile));
      }
    } catch (error) {
      console.error('Error loading profile:', error);
    }
  };

  const saveProfile = async (updatedProfile: UserProfile) => {
    try {
      await AsyncStorage.setItem('userProfile', JSON.stringify(updatedProfile));
      setProfile(updatedProfile);
    } catch (error) {
      console.error('Error saving profile:', error);
      Alert.alert('Error', 'Failed to save profile changes');
    }
  };

  const startEditing = (field: string, currentValue: string) => {
    setEditingField(field);
    setEditValue(currentValue);
    setIsEditModalVisible(true);
  };

  const saveEdit = () => {
    if (!editingField) return;

    const updatedProfile = {
      ...profile,
      [editingField]: editValue,
    };

    saveProfile(updatedProfile);
    setIsEditModalVisible(false);
    setEditingField(null);
    setEditValue('');

    Alert.alert('Success', 'Profile updated successfully');
  };

  const cancelEdit = () => {
    setIsEditModalVisible(false);
    setEditingField(null);
    setEditValue('');
  };

  const getFieldLabel = (field: string) => {
    const labels: { [key: string]: string } = {
      firstName: 'First Name',
      lastName: 'Last Name',
      email: 'Email Address',
      phone: 'Phone Number',
      address: 'Address',
      dateOfBirth: 'Date of Birth',
    };
    return labels[field] || field;
  };

  const isFieldEditable = (field: string) => {
    // Some fields might be locked based on KYC status
    const nonEditableFields = ['email', 'dateOfBirth']; // Example restrictions
    return !nonEditableFields.includes(field) || !profile.isVerified;
  };

  const renderInfoCard = (
    icon: React.ReactNode,
    label: string,
    value: string,
    field?: string,
    isSecure?: boolean
  ) => (
    <View style={styles.infoCard}>
      <View style={styles.infoHeader}>
        <View style={styles.infoIconContainer}>
          {icon}
        </View>
        <View style={styles.infoTextContainer}>
          <Text style={styles.infoLabel}>{label}</Text>
          <Text style={styles.infoValue}>
            {isSecure ? value.replace(/./g, '*') : value}
          </Text>
        </View>
        {field && isFieldEditable(field) && (
          <TouchableOpacity 
            style={styles.editButton}
            onPress={() => startEditing(field, value)}
          >
            <Edit size={16} color={colors.seaGreen} />
          </TouchableOpacity>
        )}
      </View>
      
      {field && !isFieldEditable(field) && (
        <View style={styles.lockBadge}>
          <Shield size={12} color={colors.seaGreen} />
          <Text style={styles.lockBadgeText}>Verified & Locked</Text>
        </View>
      )}
    </View>
  );

  const renderStatCard = (title: string, value: string, subtitle?: string) => (
    <View style={styles.statCard}>
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statTitle}>{title}</Text>
      {subtitle && <Text style={styles.statSubtitle}>{subtitle}</Text>}
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.canvas} />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <ChevronLeft size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Account Information</Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Profile Summary */}
        <View style={styles.profileSummary}>
          <View style={styles.avatarContainer}>
            <User size={32} color={colors.canvas} />
          </View>
          <Text style={styles.profileName}>
            {profile.firstName} {profile.lastName}
          </Text>
          <View style={styles.verificationBadge}>
            <CheckCircle size={16} color={colors.seaGreen} />
            <Text style={styles.verificationText}>Tier {profile.kycLevel} Verified</Text>
          </View>
        </View>

        {/* Account Stats */}
        <View style={styles.statsContainer}>
          {renderStatCard(
            'Account Number',
            profile.accountNumber,
            'KotaPay ID'
          )}
          {renderStatCard(
            'Member Since',
            new Date(profile.joinDate).toLocaleDateString('en-US', { 
              month: 'short', 
              year: 'numeric' 
            }),
            'Join Date'
          )}
          {renderStatCard(
            'KYC Level',
            `Tier ${profile.kycLevel}`,
            'Verification Status'
          )}
        </View>

        {/* Personal Information */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Personal Information</Text>
          
          {renderInfoCard(
            <User size={20} color={colors.seaGreen} />,
            'First Name',
            profile.firstName,
            'firstName'
          )}
          
          {renderInfoCard(
            <User size={20} color={colors.seaGreen} />,
            'Last Name',
            profile.lastName,
            'lastName'
          )}
          
          {renderInfoCard(
            <Calendar size={20} color={colors.seaGreen} />,
            'Date of Birth',
            new Date(profile.dateOfBirth).toLocaleDateString(),
            'dateOfBirth'
          )}
        </View>

        {/* Contact Information */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Contact Information</Text>
          
          {renderInfoCard(
            <Mail size={20} color={colors.seaGreen} />,
            'Email Address',
            profile.email,
            'email'
          )}
          
          {renderInfoCard(
            <Phone size={20} color={colors.seaGreen} />,
            'Phone Number',
            profile.phone,
            'phone'
          )}
          
          {renderInfoCard(
            <MapPin size={20} color={colors.seaGreen} />,
            'Address',
            profile.address,
            'address'
          )}
        </View>

        {/* Security Note */}
        <View style={styles.securityNote}>
          <Shield size={20} color={colors.seaGreen} />
          <View style={styles.securityNoteText}>
            <Text style={styles.securityNoteTitle}>Account Security</Text>
            <Text style={styles.securityNoteSubtitle}>
              Some fields are locked after verification for security purposes. 
              Contact support if you need to update verified information.
            </Text>
          </View>
        </View>

        <View style={styles.bottomSpacing} />
      </ScrollView>

      {/* Edit Modal */}
      <Modal
        visible={isEditModalVisible}
        transparent={true}
        animationType="slide"
        onRequestClose={cancelEdit}
      >
        <KeyboardAvoidingView 
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.modalOverlay}
        >
          <View style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>
                Edit {editingField ? getFieldLabel(editingField) : ''}
              </Text>
              <TouchableOpacity 
                style={styles.modalCloseButton}
                onPress={cancelEdit}
              >
                <X size={24} color={colors.text} />
              </TouchableOpacity>
            </View>
            
            <View style={styles.modalContent}>
              <Text style={styles.inputLabel}>
                {editingField ? getFieldLabel(editingField) : ''}
              </Text>
              <TextInput
                style={styles.textInput}
                value={editValue}
                onChangeText={setEditValue}
                placeholder={`Enter ${editingField ? getFieldLabel(editingField).toLowerCase() : ''}`}
                multiline={editingField === 'address'}
                numberOfLines={editingField === 'address' ? 3 : 1}
                autoFocus
              />
              
              <View style={styles.modalActions}>
                <TouchableOpacity 
                  style={styles.cancelButton}
                  onPress={cancelEdit}
                >
                  <Text style={styles.cancelButtonText}>Cancel</Text>
                </TouchableOpacity>
                
                <TouchableOpacity 
                  style={styles.saveButton}
                  onPress={saveEdit}
                >
                  <Save size={16} color={colors.canvas} />
                  <Text style={styles.saveButtonText}>Save</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>
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
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: colors.canvas,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  backButton: {
    padding: 8,
    marginLeft: -8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
    flex: 1,
    textAlign: 'center',
    marginRight: 40,
  },
  headerSpacer: {
    width: 40,
  },
  scrollView: {
    flex: 1,
  },
  profileSummary: {
    backgroundColor: colors.canvas,
    alignItems: 'center',
    paddingVertical: 32,
    marginBottom: 16,
  },
  avatarContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: colors.seaGreen,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  profileName: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 8,
  },
  verificationBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.mint,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  verificationText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.seaGreen,
    marginLeft: 4,
  },
  statsContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  statCard: {
    flex: 1,
    backgroundColor: colors.canvas,
    padding: 16,
    marginHorizontal: 4,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  statValue: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.seaGreen,
    marginBottom: 4,
  },
  statTitle: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.text,
    textAlign: 'center',
  },
  statSubtitle: {
    fontSize: 10,
    color: colors.textLight,
    textAlign: 'center',
    marginTop: 2,
  },
  section: {
    paddingHorizontal: 16,
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 16,
  },
  infoCard: {
    backgroundColor: colors.canvas,
    padding: 16,
    marginBottom: 12,
    borderRadius: 12,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  infoHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  infoIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(6, 64, 43, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  infoTextContainer: {
    flex: 1,
  },
  infoLabel: {
    fontSize: 12,
    fontWeight: '500',
    color: colors.textLight,
    marginBottom: 4,
  },
  infoValue: {
    fontSize: 16,
    fontWeight: '500',
    color: colors.text,
  },
  editButton: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: 'rgba(6, 64, 43, 0.1)',
  },
  lockBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    backgroundColor: colors.mint,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginTop: 8,
  },
  lockBadgeText: {
    fontSize: 10,
    fontWeight: '500',
    color: colors.seaGreen,
    marginLeft: 4,
  },
  securityNote: {
    flexDirection: 'row',
    backgroundColor: colors.canvas,
    margin: 16,
    padding: 16,
    borderRadius: 12,
    borderLeftWidth: 4,
    borderLeftColor: colors.seaGreen,
  },
  securityNoteText: {
    flex: 1,
    marginLeft: 12,
  },
  securityNoteTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 4,
  },
  securityNoteSubtitle: {
    fontSize: 12,
    color: colors.textLight,
    lineHeight: 16,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContainer: {
    backgroundColor: colors.canvas,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingBottom: 34, // Safe area padding
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
  },
  modalCloseButton: {
    padding: 4,
  },
  modalContent: {
    padding: 20,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.text,
    marginBottom: 8,
  },
  textInput: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: colors.text,
    backgroundColor: colors.background,
    marginBottom: 20,
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  cancelButton: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    marginRight: 8,
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
  },
  saveButton: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 12,
    borderRadius: 8,
    backgroundColor: colors.seaGreen,
    marginLeft: 8,
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.canvas,
    marginLeft: 4,
  },
  bottomSpacing: {
    height: 32,
  },
});

export default AccountInformationScreen;
