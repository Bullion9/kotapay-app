import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  TextInput,
  Alert,
  KeyboardAvoidingView,
  Platform,
  Modal,
  Image,
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import * as ImagePicker from 'expo-image-picker';
import {
  User,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Edit3,
  Save,
  X,
  ChevronLeft,
  Camera,
} from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import { theme } from '../theme';
import { useProfileImage } from '../contexts/ProfileImageContext';
import { useAuth } from '../contexts/AuthContext';

const { colors, spacing, borderRadius } = theme;

interface PersonalInformationScreenProps {
  navigation: any;
}

interface UserData {
  name: string;
  email: string;
  phone: string;
  address: string;
  dateOfBirth: string;
  nationality: string;
}

const PersonalInformationScreen: React.FC<PersonalInformationScreenProps> = ({ navigation }) => {
  console.log('🚀 PersonalInformationScreen mounted - ACTUAL FILE BEING USED');
  
  const { profileImage, saveProfileImage, removeProfileImage } = useProfileImage();
  const { user, updateUser } = useAuth();
  
  const [userData, setUserData] = useState<UserData>({
    name: user?.name || 'John Doe',
    email: user?.email || 'john.doe@email.com',
    phone: user?.phone || '+234 123 456 7890',
    address: user?.address || '123 Lagos Street, Victoria Island, Lagos',
    dateOfBirth: user?.dateOfBirth || '15/06/1990',
    nationality: user?.nationality || 'Nigerian',
  });

  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [editData, setEditData] = useState<UserData>(userData);
  const [focusedField, setFocusedField] = useState<keyof UserData | null>(null);
  
  // Date picker state
  const [showDatePicker, setShowDatePicker] = useState<boolean>(false);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date(1990, 5, 15)); // Default date

  const handleEdit = async () => {
    console.log('🎯 Starting edit mode');
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setIsEditing(true);
    setEditData(userData);
    // Auto focus on the first field (name) after a brief delay
    setTimeout(() => setFocusedField('name'), 100);
  };

  const handleSave = async () => {
    console.log('💾 Saving changes:', editData);
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    
    try {
      // Update user data in the auth context
      await updateUser({
        name: editData.name,
        email: editData.email,
        phone: editData.phone,
        address: editData.address,
        dateOfBirth: editData.dateOfBirth,
        nationality: editData.nationality,
      });
      
      setUserData(editData);
      setIsEditing(false);
      setFocusedField(null);
      Alert.alert('Success', 'Information updated successfully');
    } catch (error) {
      console.error('❌ Error updating user data:', error);
      Alert.alert('Error', 'Failed to update information. Please try again.');
    }
  };

  const handleCancel = async () => {
    console.log('❌ Cancelling edit mode');
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setIsEditing(false);
    setEditData(userData);
    setFocusedField(null);
  };

  const updateEditField = (field: keyof UserData, value: string) => {
    setEditData(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  // Date picker handlers
  const showDatePickerModal = async () => {
    console.log('📅 Opening date picker');
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setShowDatePicker(true);
  };

  const onDateChange = (event: any, selected?: Date) => {
    const currentDate = selected || selectedDate;
    setShowDatePicker(Platform.OS === 'ios');
    setSelectedDate(currentDate);
    
    if (selected) {
      const formattedDate = `${currentDate.getDate().toString().padStart(2, '0')}/${(currentDate.getMonth() + 1).toString().padStart(2, '0')}/${currentDate.getFullYear()}`;
      updateEditField('dateOfBirth', formattedDate);
      console.log('📅 Date selected:', formattedDate);
    }
  };

  const closeDatePicker = () => {
    setShowDatePicker(false);
  };

  // Camera and Image Picker Functions
  const requestPermissions = async () => {
    const { status: cameraStatus } = await ImagePicker.requestCameraPermissionsAsync();
    const { status: mediaLibraryStatus } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    
    if (cameraStatus !== 'granted' || mediaLibraryStatus !== 'granted') {
      Alert.alert(
        'Permissions Required',
        'Camera and photo library access are needed to change your profile picture.',
        [{ text: 'OK' }]
      );
      return false;
    }
    return true;
  };

  const selectImageSource = async () => {
    console.log('📸 Opening image source selection');
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    
    const hasPermissions = await requestPermissions();
    if (!hasPermissions) return;

    Alert.alert(
      'Select Image',
      'Choose how you want to select your profile picture',
      [
        {
          text: 'Camera',
          onPress: openCamera,
        },
        {
          text: 'Photo Library',
          onPress: openImageLibrary,
        },
        ...(profileImage ? [{
          text: 'Remove Photo',
          onPress: handleRemoveProfileImage,
          style: 'destructive' as const,
        }] : []),
        {
          text: 'Cancel',
          style: 'cancel' as const,
        },
      ],
      { cancelable: true }
    );
  };

  const openCamera = async () => {
    try {
      console.log('📷 Opening camera');
      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        const imageUri = result.assets[0].uri;
        console.log('📸 Image captured:', imageUri);
        await saveProfileImage(imageUri);
        await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        Alert.alert('Success', 'Profile picture updated successfully!');
      }
    } catch (error) {
      console.error('❌ Camera error:', error);
      Alert.alert('Error', 'Failed to open camera. Please try again.');
    }
  };

  const openImageLibrary = async () => {
    try {
      console.log('🖼️ Opening image library');
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        const imageUri = result.assets[0].uri;
        console.log('🖼️ Image selected:', imageUri);
        await saveProfileImage(imageUri);
        await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        Alert.alert('Success', 'Profile picture updated successfully!');
      }
    } catch (error) {
      console.error('❌ Image library error:', error);
      Alert.alert('Error', 'Failed to open image library. Please try again.');
    }
  };

  const handleRemoveProfileImage = async () => {
    try {
      await removeProfileImage();
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      Alert.alert('Success', 'Profile picture removed successfully!');
    } catch (error) {
      console.error('❌ Error removing profile image:', error);
      Alert.alert('Error', 'Failed to remove profile picture. Please try again.');
    }
  };

  const renderInfoItem = (
    icon: React.ReactNode,
    label: string,
    field: keyof UserData,
    isLast: boolean = false
  ) => {
    const currentValue = isEditing ? editData[field] : userData[field];

    return (
      <View style={[
        styles.infoItem,
        isLast && styles.lastInfoItem
      ]}>
        <View style={styles.infoLeft}>
          <View style={styles.iconContainer}>
            {icon}
          </View>
          <View style={styles.infoContent}>
            <Text style={styles.infoLabel}>{label}</Text>
            {isEditing ? (
              field === 'dateOfBirth' ? (
                <TouchableOpacity
                  style={[
                    styles.datePickerButton,
                    focusedField === field && styles.datePickerButtonFocused
                  ]}
                  onPress={showDatePickerModal}
                  onPressIn={() => setFocusedField(field)}
                  onPressOut={() => setFocusedField(null)}
                >
                  <Text style={styles.datePickerText}>{currentValue}</Text>
                  <Calendar size={16} color={colors.primary} />
                </TouchableOpacity>
              ) : (
                <TextInput
                  style={[
                    styles.editInput,
                    focusedField === field && styles.editInputFocused
                  ]}
                  value={currentValue}
                  onChangeText={(value) => updateEditField(field, value)}
                  onFocus={() => setFocusedField(field)}
                  onBlur={() => setFocusedField(null)}
                  multiline={field === 'address'}
                  numberOfLines={field === 'address' ? 2 : 1}
                  placeholder={`Enter ${label.toLowerCase()}`}
                  autoFocus={field === 'name'}
                  selectionColor={colors.primary}
                  placeholderTextColor={colors.secondaryText}
                />
              )
            ) : (
              <Text style={styles.infoValue}>{currentValue}</Text>
            )}
          </View>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.background} />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <ChevronLeft size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Personal Information</Text>
        <View style={styles.headerActions}>
          {isEditing ? (
            <>
              <TouchableOpacity
                style={styles.headerButton}
                onPress={handleCancel}
              >
                <X size={20} color={colors.text} />
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.headerButton, styles.saveHeaderButton]}
                onPress={handleSave}
              >
                <Save size={20} color={colors.white} />
              </TouchableOpacity>
            </>
          ) : (
            <TouchableOpacity
              style={styles.headerButton}
              onPress={handleEdit}
            >
              <Edit3 size={20} color={colors.primary} />
            </TouchableOpacity>
          )}
        </View>
      </View>

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 80 : 20}
        enabled={true}
      >
        <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Profile Avatar */}
        <View style={styles.avatarSection}>
          <View style={[
            styles.avatarContainer,
            profileImage && styles.avatarContainerWithImage
          ]}>
            {profileImage ? (
              <Image source={{ uri: profileImage }} style={styles.avatarImage} />
            ) : (
              <User size={40} color={colors.primary} />
            )}
          </View>
          <TouchableOpacity style={styles.editAvatarButton} onPress={selectImageSource}>
            <Camera size={16} color={colors.primary} />
            <Text style={styles.editAvatarText}>
              {profileImage ? 'Change Photo' : 'Add Photo'}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Information Items */}
        <View style={styles.infoSection}>
          {renderInfoItem(
            <User size={20} color={colors.primary} />,
            'Full Name',
            'name'
          )}

          {renderInfoItem(
            <Mail size={20} color={colors.primary} />,
            'Email Address',
            'email'
          )}

          {renderInfoItem(
            <Phone size={20} color={colors.primary} />,
            'Phone Number',
            'phone'
          )}

          {renderInfoItem(
            <MapPin size={20} color={colors.primary} />,
            'Address',
            'address'
          )}

          {renderInfoItem(
            <Calendar size={20} color={colors.primary} />,
            'Date of Birth',
            'dateOfBirth'
          )}

          {renderInfoItem(
            <User size={20} color={colors.primary} />,
            'Nationality',
            'nationality',
            true
          )}
        </View>

        <View style={styles.bottomSpacing} />
        </ScrollView>
      </KeyboardAvoidingView>

      {/* Date Picker Modal */}
      {showDatePicker && (
        <Modal
          transparent={true}
          animationType="slide"
          visible={showDatePicker}
          onRequestClose={closeDatePicker}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.datePickerContainer}>
              <View style={styles.datePickerHeader}>
                <TouchableOpacity onPress={closeDatePicker}>
                  <Text style={styles.datePickerCancel}>Cancel</Text>
                </TouchableOpacity>
                <Text style={styles.datePickerTitle}>Select Date of Birth</Text>
                <TouchableOpacity onPress={closeDatePicker}>
                  <Text style={styles.datePickerDone}>Done</Text>
                </TouchableOpacity>
              </View>
              <View style={styles.datePickerWrapper}>
                <DateTimePicker
                  value={selectedDate}
                  mode="date"
                  display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                  onChange={onDateChange}
                  maximumDate={new Date()}
                  minimumDate={new Date(1900, 0, 1)}
                  textColor="#000000"
                  style={styles.datePickerStyle}
                />
              </View>
            </View>
          </View>
        </Modal>
      )}
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
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  backButton: {
    padding: spacing.sm,
  },
  headerTitle: {
    fontSize: 18,
    color: colors.text,
    flex: 1,
    textAlign: 'center',
    fontFamily: 'System',
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: spacing.xs,
  },
  saveHeaderButton: {
    backgroundColor: colors.primary,
  },
  scrollView: {
    flex: 1,
  },
  
  // Avatar Section
  avatarSection: {
    alignItems: 'center',
    paddingVertical: spacing.xl,
    marginHorizontal: spacing.lg,
  },
  avatarContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: colors.light,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.md,
    overflow: 'hidden',
  },
  avatarContainerWithImage: {
    borderWidth: 3,
    borderColor: colors.primary,
  },
  avatarImage: {
    width: 80,
    height: 80,
    borderRadius: 40,
  },
  editAvatarButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderWidth: 1,
    borderColor: colors.primary,
    borderRadius: borderRadius.medium,
  },
  editAvatarText: {
    fontSize: 14,
    color: colors.primary,
    marginLeft: spacing.xs,
    fontFamily: 'System',
  },

  // Info Section
  infoSection: {
    marginHorizontal: spacing.lg,
    backgroundColor: colors.white,
    borderRadius: borderRadius.large,
    borderWidth: 1,
    borderColor: colors.border,
    overflow: 'hidden',
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  lastInfoItem: {
    borderBottomWidth: 0,
  },
  infoLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.light,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.md,
  },
  infoContent: {
    flex: 1,
  },
  infoLabel: {
    fontSize: 14,
    color: colors.secondaryText,
    marginBottom: spacing.xs,
    fontFamily: 'System',
  },
  infoValue: {
    fontSize: 16,
    color: colors.text,
    fontFamily: 'System',
  },
  editInput: {
    fontSize: 16,
    color: colors.text,
    fontFamily: 'System',
    borderWidth: 1,
    borderColor: colors.primary,
    borderRadius: borderRadius.small,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    backgroundColor: colors.background,
  },
  editInputFocused: {
    borderWidth: 2,
    borderColor: colors.primary,
    backgroundColor: colors.white,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  
  // Date Picker Styles
  datePickerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: colors.primary,
    borderRadius: borderRadius.small,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    backgroundColor: colors.background,
  },
  datePickerButtonFocused: {
    borderWidth: 2,
    borderColor: colors.primary,
    backgroundColor: colors.white,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  datePickerText: {
    fontSize: 16,
    color: colors.text,
    fontFamily: 'System',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.75)',
    justifyContent: 'flex-end',
  },
  datePickerContainer: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: borderRadius.large,
    borderTopRightRadius: borderRadius.large,
    paddingBottom: spacing.xl,
    paddingTop: spacing.sm,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 8,
    minHeight: 300,
  },
  datePickerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5E5',
    backgroundColor: '#F8F9FA',
  },
  datePickerTitle: {
    fontSize: 18,
    color: '#1A1A1A',
    fontFamily: 'System',
    fontWeight: '600',
  },
  datePickerCancel: {
    fontSize: 16,
    color: '#666666',
    fontFamily: 'System',
    fontWeight: '500',
  },
  datePickerDone: {
    fontSize: 16,
    color: '#007AFF',
    fontFamily: 'System',
    fontWeight: '600',
  },
  datePickerStyle: {
    backgroundColor: '#FFFFFF',
    color: '#000000',
  },
  datePickerWrapper: {
    backgroundColor: '#FFFFFF',
    paddingVertical: spacing.lg,
    paddingHorizontal: spacing.md,
    alignItems: 'center',
  },
  
  bottomSpacing: {
    height: spacing.xl,
  },
});

export default PersonalInformationScreen;
