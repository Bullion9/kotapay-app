import { RouteProp } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import * as ImagePicker from 'expo-image-picker';
import { ArrowLeft, CheckCircle, Mail, Phone, UploadCloud, User } from 'lucide-react-native';
import React, { useState } from 'react';
import {
    Alert,
    Image,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { theme } from '../theme';
import { ProfileParamList } from '../types';

const { colors, spacing, borderRadius } = theme;

type Tier1ScreenNavigationProp = StackNavigationProp<ProfileParamList, 'Tier1'>;
type Tier1ScreenRouteProp = RouteProp<ProfileParamList, 'Tier1'>;

interface Props {
  navigation: Tier1ScreenNavigationProp;
  route: Tier1ScreenRouteProp;
}

interface BasicInfo {
  phone: string;
  email: string;
  fullName: string;
}

interface Document {
  uri: string | null;
  name: string;
}

const Tier1Screen: React.FC<Props> = ({ navigation }) => {
  const [basicInfo] = useState<BasicInfo>({
    phone: '',
    email: '',
    fullName: '',
  });
  
  const [documents, setDocuments] = useState<{
    profilePhoto: Document;
  }>({
    profilePhoto: { uri: null, name: '' },
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  const pickImage = async (type: 'profilePhoto') => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled) {
      setDocuments(prev => ({
        ...prev,
        [type]: {
          uri: result.assets[0].uri,
          name: result.assets[0].fileName || `${type}.jpg`,
        },
      }));
    }
  };

  const isFormValid = () => {
    return (
      basicInfo.phone.length >= 10 &&
      basicInfo.email.includes('@') &&
      basicInfo.fullName.length >= 2 &&
      documents.profilePhoto.uri
    );
  };

  const handleSubmit = async () => {
    if (!isFormValid()) {
      Alert.alert('Incomplete Information', 'Please fill all fields and upload your profile photo.');
      return;
    }

    setIsSubmitting(true);
    
    // Navigate to processing screen
    navigation.navigate('Tier1Processing', {
      submissionData: {
        basicInfo,
        documents,
        submissionId: `T1-${Date.now()}`,
      },
    });
  };

  const progress = isFormValid() ? 1 : 0.3;

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <ArrowLeft size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={styles.title}>Tier 1 Verification</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Progress */}
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Basic Account Verification</Text>
          <Text style={styles.sectionSubtitle}>
            Complete basic verification to unlock Tier 1 benefits
          </Text>
          
          <View style={styles.benefitsList}>
            <View style={styles.benefitItem}>
              <CheckCircle size={16} color={colors.success} />
              <Text style={styles.benefitText}>Daily limit: ₦50,000</Text>
            </View>
            <View style={styles.benefitItem}>
              <CheckCircle size={16} color={colors.success} />
              <Text style={styles.benefitText}>Monthly limit: ₦200,000</Text>
            </View>
            <View style={styles.benefitItem}>
              <CheckCircle size={16} color={colors.success} />
              <Text style={styles.benefitText}>Basic wallet features</Text>
            </View>
          </View>
          
          <View style={styles.progressBar}>
            <View style={[styles.progressFill, { width: `${progress * 100}%` }]} />
          </View>
        </View>

        {/* Basic Information */}
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Basic Information</Text>
          <Text style={styles.sectionSubtitle}>
            Provide your basic details for account verification
          </Text>
          
          <View style={styles.inputGroup}>
            <View style={styles.inputIcon}>
              <User size={20} color={colors.secondaryText} />
            </View>
            <Text style={styles.inputLabel}>Full Name</Text>
            <Text style={styles.inputValue}>
              {basicInfo.fullName || 'Tap to enter your full name'}
            </Text>
          </View>

          <View style={styles.inputGroup}>
            <View style={styles.inputIcon}>
              <Phone size={20} color={colors.secondaryText} />
            </View>
            <Text style={styles.inputLabel}>Phone Number</Text>
            <Text style={styles.inputValue}>
              {basicInfo.phone || 'Tap to enter your phone number'}
            </Text>
          </View>

          <View style={styles.inputGroup}>
            <View style={styles.inputIcon}>
              <Mail size={20} color={colors.secondaryText} />
            </View>
            <Text style={styles.inputLabel}>Email Address</Text>
            <Text style={styles.inputValue}>
              {basicInfo.email || 'Tap to enter your email address'}
            </Text>
          </View>
        </View>

        {/* Profile Photo */}
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Profile Photo</Text>
          <Text style={styles.sectionSubtitle}>
            Upload a clear photo of yourself for account verification
          </Text>
          
          <TouchableOpacity
            style={styles.photoUpload}
            onPress={() => pickImage('profilePhoto')}
          >
            {documents.profilePhoto.uri ? (
              <>
                <Image 
                  source={{ uri: documents.profilePhoto.uri }} 
                  style={styles.uploadedPhoto} 
                />
                <View style={styles.uploadedOverlay}>
                  <CheckCircle size={24} color={colors.success} />
                  <Text style={styles.uploadedText}>Photo Uploaded</Text>
                </View>
              </>
            ) : (
              <>
                <UploadCloud size={48} color={colors.secondaryText} />
                <Text style={styles.uploadText}>Tap to upload photo</Text>
                <Text style={styles.uploadSubtext}>Clear, recent photo required</Text>
              </>
            )}
          </TouchableOpacity>
        </View>

        {/* Submit Button */}
        <TouchableOpacity
          style={[
            styles.submitButton,
            !isFormValid() && styles.submitButtonDisabled,
            isSubmitting && styles.submitButtonSubmitting,
          ]}
          onPress={handleSubmit}
          disabled={!isFormValid() || isSubmitting}
        >
          <Text style={styles.submitButtonText}>
            {isSubmitting ? 'Submitting...' : 'Submit for Verification'}
          </Text>
        </TouchableOpacity>

        <View style={styles.footer}>
          <Text style={styles.footerText}>
            After submission, verification typically takes 1-2 business days
          </Text>
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
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
  },
  card: {
    backgroundColor: colors.white,
    marginHorizontal: spacing.lg,
    marginTop: spacing.lg,
    padding: spacing.lg,
    borderRadius: borderRadius.medium,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginBottom: spacing.sm,
  },
  sectionSubtitle: {
    fontSize: 14,
    color: colors.secondaryText,
    marginBottom: spacing.lg,
    lineHeight: 20,
  },
  benefitsList: {
    marginBottom: spacing.lg,
  },
  benefitItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  benefitText: {
    fontSize: 14,
    color: colors.text,
    marginLeft: spacing.sm,
  },
  progressBar: {
    height: 6,
    backgroundColor: colors.light,
    borderRadius: 3,
  },
  progressFill: {
    height: 6,
    backgroundColor: colors.primary,
    borderRadius: 3,
  },
  inputGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    marginBottom: spacing.sm,
  },
  inputIcon: {
    marginRight: spacing.md,
  },
  inputLabel: {
    fontSize: 14,
    color: colors.text,
    fontWeight: '500',
    flex: 1,
  },
  inputValue: {
    fontSize: 14,
    color: colors.secondaryText,
    flex: 2,
    textAlign: 'right',
  },
  photoUpload: {
    height: 200,
    borderWidth: 2,
    borderColor: colors.border,
    borderStyle: 'dashed',
    borderRadius: borderRadius.medium,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.light,
    position: 'relative',
  },
  uploadedPhoto: {
    width: '100%',
    height: '100%',
    borderRadius: borderRadius.medium,
  },
  uploadedOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: borderRadius.medium,
  },
  uploadedText: {
    color: colors.white,
    fontSize: 14,
    fontWeight: '500',
    marginTop: spacing.sm,
  },
  uploadText: {
    fontSize: 16,
    color: colors.text,
    fontWeight: '500',
    marginTop: spacing.sm,
  },
  uploadSubtext: {
    fontSize: 12,
    color: colors.secondaryText,
    marginTop: spacing.xs,
  },
  submitButton: {
    backgroundColor: colors.primary,
    marginHorizontal: spacing.lg,
    marginTop: spacing.xl,
    paddingVertical: spacing.lg,
    borderRadius: borderRadius.medium,
    alignItems: 'center',
  },
  submitButtonDisabled: {
    backgroundColor: colors.border,
  },
  submitButtonSubmitting: {
    backgroundColor: colors.secondaryText,
    opacity: 0.7,
  },
  submitButtonText: {
    color: colors.white,
    fontSize: 16,
    fontWeight: '600',
  },
  footer: {
    padding: spacing.lg,
    alignItems: 'center',
  },
  footerText: {
    fontSize: 12,
    color: colors.secondaryText,
    textAlign: 'center',
    lineHeight: 18,
  },
});

export default Tier1Screen;
