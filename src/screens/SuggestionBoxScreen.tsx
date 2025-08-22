import { useFocusEffect } from '@react-navigation/native';
import * as ImagePicker from 'expo-image-picker';
import {
    ChevronLeft,
    Paperclip,
    Send,
    X,
} from 'lucide-react-native';
import React, { useEffect, useRef, useState } from 'react';
import {
    Alert,
    KeyboardAvoidingView,
    Platform,
    Image as RNImage,
    SafeAreaView,
    ScrollView,
    StatusBar,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';
import { borderRadius, colors, shadows, spacing } from '../theme';

interface SuggestionBoxScreenProps {
  navigation: any;
}

const SuggestionBoxScreen: React.FC<SuggestionBoxScreenProps> = ({ navigation }) => {
  const [description, setDescription] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const [attachments, setAttachments] = useState<string[]>([]);
  const textInputRef = useRef<TextInput>(null);

  const handlePhotoUpload = async () => {
    try {
      // Request permission to access media library
      const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
      
      if (permissionResult.granted === false) {
        Alert.alert(
          'Permission Required',
          'Please allow access to your photo library to attach images to your suggestion.'
        );
        return;
      }

      // Show options for camera or photo library
      Alert.alert(
        'Add Photo',
        'Choose an option to add a photo to your suggestion',
        [
          {
            text: 'Camera',
            onPress: async () => {
              const cameraPermission = await ImagePicker.requestCameraPermissionsAsync();
              if (cameraPermission.granted) {
                openCamera();
              } else {
                Alert.alert('Permission Required', 'Please allow camera access to take photos.');
              }
            }
          },
          {
            text: 'Photo Library',
            onPress: () => openPhotoLibrary()
          },
          { text: 'Cancel', style: 'cancel' }
        ]
      );
    } catch {
      Alert.alert('Error', 'Failed to access photo library');
    }
  };

  const openCamera = async () => {
    try {
      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        setAttachments(prev => [...prev, result.assets[0].uri]);
      }
    } catch {
      Alert.alert('Error', 'Failed to take photo');
    }
  };

  const openPhotoLibrary = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
        allowsMultipleSelection: true,
      });

      if (!result.canceled && result.assets) {
        const newImages = result.assets.map(asset => asset.uri);
        setAttachments(prev => [...prev, ...newImages]);
      }
    } catch {
      Alert.alert('Error', 'Failed to select photos');
    }
  };

  const removeAttachment = (index: number) => {
    setAttachments(prev => prev.filter((_, i) => i !== index));
  };

  useEffect(() => {
    // Auto-focus the text input when screen loads with a delay
    const focusTimer = setTimeout(() => {
      textInputRef.current?.focus();
    }, 300);

    return () => clearTimeout(focusTimer);
  }, []);

  // Also focus when screen comes into focus (e.g., when navigating back)
  useFocusEffect(
    React.useCallback(() => {
      const focusTimer = setTimeout(() => {
        textInputRef.current?.focus();
      }, 200);

      return () => clearTimeout(focusTimer);
    }, [])
  );

  const handleSubmit = async () => {
    if (!description.trim()) {
      Alert.alert('Enter Description', 'Please provide a description');
      return;
    }

    setIsSubmitting(true);

    try {
      // Simulate API call
      await new Promise<void>(resolve => setTimeout(resolve, 2000));
      
      Alert.alert(
        'Suggestion Submitted!',
        'Thank you for your feedback. We review all suggestions and will get back to you if needed.',
        [
          {
            text: 'OK',
            onPress: () => {
              // Reset form
              setDescription('');
              navigation.goBack();
            }
          }
        ]
      );
    } catch {
      Alert.alert('Error', 'Failed to submit suggestion. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const isFormValid = description.trim();

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.background} />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <ChevronLeft size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Suggestion Box</Text>
        <View style={styles.headerSpacer} />
      </View>

      <KeyboardAvoidingView 
        style={styles.keyboardAvoidingView}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 20}
      >
        <ScrollView 
          style={styles.scrollView} 
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollViewContent}
        >
          {/* Description Input */}
          <View style={[styles.section, { marginTop: spacing.xl }]}>
            <TextInput
              ref={textInputRef}
              style={[
                styles.descriptionInput,
                isFocused && styles.descriptionInputFocused
              ]}
              placeholder="Please provide detailed information about your suggestion, feedback, or issue..."
              value={description}
              onChangeText={setDescription}
              onFocus={() => setIsFocused(true)}
              onBlur={() => setIsFocused(false)}
              multiline
              numberOfLines={10}
              maxLength={1000}
              textAlignVertical="top"
              placeholderTextColor={colors.secondaryText}
              autoFocus={true}
            />
            <Text style={styles.characterCount}>{description.length}/1000</Text>
            
            {/* Photo Upload Button */}
            <TouchableOpacity style={styles.photoUploadButton} onPress={handlePhotoUpload}>
              <View style={styles.photoUploadContent}>
                <Paperclip size={20} color={colors.primary} />
                <Text style={styles.photoUploadText}>Add Photo</Text>
              </View>
            </TouchableOpacity>

            {/* Show attachments if any */}
            {attachments.length > 0 && (
              <View style={styles.attachmentsContainer}>
                <Text style={styles.attachmentsTitle}>Attachments ({attachments.length})</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.attachmentsScroll}>
                  {attachments.map((attachment, index) => (
                    <View key={index} style={styles.attachmentItem}>
                      <RNImage source={{ uri: attachment }} style={styles.attachmentImage} />
                      <TouchableOpacity 
                        style={styles.removeButton} 
                        onPress={() => removeAttachment(index)}
                      >
                        <X size={16} color={colors.white} />
                      </TouchableOpacity>
                    </View>
                  ))}
                </ScrollView>
              </View>
            )}
          </View>

          <View style={styles.bottomSpacing} />
        </ScrollView>

        {/* Submit Button - Fixed at bottom */}
        <View style={styles.submitSection}>
          <TouchableOpacity
            style={[
              styles.submitButton,
              !isFormValid && styles.submitButtonDisabled,
              isSubmitting && styles.submitButtonLoading,
            ]}
            onPress={handleSubmit}
            disabled={!isFormValid || isSubmitting}
          >
            <Send size={20} color={colors.white} />
            <Text style={styles.submitButtonText}>
              {isSubmitting ? 'Submitting...' : 'Submit Suggestion'}
            </Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  
  // Header styles
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    backgroundColor: colors.background,
  },
  backButton: {
    padding: spacing.sm,
    marginLeft: -spacing.sm,
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
  
  scrollViewContent: {
    flexGrow: 1,
  },
  
  keyboardAvoidingView: {
    flex: 1,
  },
  
  // Introduction section
  introSection: {
    padding: spacing.lg,
    backgroundColor: colors.white,
    marginHorizontal: spacing.md,
    marginTop: spacing.md,
    borderRadius: borderRadius.large,
    ...shadows.small,
  },
  introTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: colors.text,
    marginBottom: spacing.sm,
    textAlign: 'center',
  },
  introText: {
    fontSize: 14,
    color: colors.secondaryText,
    lineHeight: 20,
    textAlign: 'center',
  },
  
  // Section styles
  section: {
    marginHorizontal: spacing.md,
    marginTop: spacing.lg,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginBottom: spacing.md,
  },
  
  // Categories grid
  categoriesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  categoryCard: {
    width: '48%',
    backgroundColor: colors.white,
    borderRadius: borderRadius.medium,
    padding: spacing.md,
    marginBottom: spacing.md,
    borderWidth: 2,
    borderColor: colors.border,
    position: 'relative',
    ...shadows.small,
  },
  selectedCategoryCard: {
    borderWidth: 2,
  },
  categoryIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  categoryTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
    marginBottom: spacing.xs,
  },
  categorySubtitle: {
    fontSize: 12,
    color: colors.secondaryText,
    lineHeight: 16,
  },
  selectedIndicator: {
    position: 'absolute',
    top: spacing.sm,
    right: spacing.sm,
  },
  
  // Input styles
  titleInput: {
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: borderRadius.medium,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    fontSize: 16,
    color: colors.text,
    ...shadows.small,
  },
  descriptionInput: {
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: borderRadius.medium,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    fontSize: 16,
    color: colors.text,
    minHeight: 200,
    ...shadows.small,
  },
  descriptionInputFocused: {
    borderColor: colors.primary,
    borderWidth: 2,
    shadowColor: colors.primary,
    shadowOffset: {
      width: 0,
      height: 0,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  characterCount: {
    fontSize: 12,
    color: colors.secondaryText,
    textAlign: 'right',
    marginTop: spacing.xs,
  },
  
  // Photo Upload styles
  photoUploadButton: {
    marginTop: spacing.md,
    borderWidth: 1,
    borderColor: colors.primary,
    borderRadius: borderRadius.medium,
    borderStyle: 'dashed',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    backgroundColor: `${colors.primary}05`,
  },
  photoUploadContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  photoUploadText: {
    fontSize: 14,
    color: colors.primary,
    fontWeight: '500',
    marginLeft: spacing.sm,
  },
  
  // Attachments styles
  attachmentsContainer: {
    marginTop: spacing.md,
  },
  attachmentsTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
    marginBottom: spacing.sm,
  },
  attachmentsScroll: {
    flexDirection: 'row',
  },
  attachmentItem: {
    position: 'relative',
    marginRight: spacing.sm,
    borderRadius: borderRadius.medium,
    overflow: 'hidden',
  },
  attachmentImage: {
    width: 80,
    height: 80,
    borderRadius: borderRadius.medium,
  },
  removeButton: {
    position: 'absolute',
    top: 4,
    right: 4,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    borderRadius: 12,
    width: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  
  // Preview section
  previewSection: {
    marginHorizontal: spacing.md,
    marginTop: spacing.lg,
  },
  previewCard: {
    backgroundColor: colors.white,
    borderRadius: borderRadius.medium,
    padding: spacing.md,
    borderWidth: 2,
    ...shadows.small,
  },
  previewHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  previewIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.md,
  },
  previewText: {
    flex: 1,
  },
  previewCategory: {
    fontSize: 12,
    color: colors.secondaryText,
    marginBottom: spacing.xs,
  },
  previewTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: colors.text,
  },
  previewDescription: {
    fontSize: 14,
    color: colors.secondaryText,
    lineHeight: 20,
  },
  
  // Submit section
  submitSection: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    backgroundColor: colors.background,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  submitButton: {
    backgroundColor: colors.primary,
    borderRadius: borderRadius.medium,
    paddingVertical: spacing.lg,
    paddingHorizontal: spacing.xl,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    ...shadows.medium,
  },
  submitButtonDisabled: {
    backgroundColor: colors.secondaryText,
  },
  submitButtonLoading: {
    opacity: 0.7,
  },
  submitButtonText: {
    color: colors.white,
    fontSize: 16,
    fontWeight: '600',
    marginLeft: spacing.sm,
  },
  
  bottomSpacing: {
    height: spacing.xl + 80, // Extra space for fixed submit button
  },
});

export default SuggestionBoxScreen;
