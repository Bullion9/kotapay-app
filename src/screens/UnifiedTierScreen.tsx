import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ArrowLeft, CheckCircle, UploadCloud, User, Phone, Mail, FileText, CreditCard, MapPin, Building, DollarSign, Briefcase } from 'lucide-react-native';
import * as ImagePicker from 'expo-image-picker';
import { StackNavigationProp } from '@react-navigation/stack';
import { RouteProp } from '@react-navigation/native';
import { theme } from '../theme';
import { ProfileParamList } from '../types';

const { colors, spacing, borderRadius } = theme;

type UnifiedTierScreenNavigationProp = StackNavigationProp<ProfileParamList, 'UnifiedTier'>;
type UnifiedTierScreenRouteProp = RouteProp<ProfileParamList, 'UnifiedTier'>;

interface Props {
  navigation: UnifiedTierScreenNavigationProp;
  route: UnifiedTierScreenRouteProp;
}

interface Document {
  uri: string | null;
  name: string;
}

interface BasicInfo {
  phone: string;
  email: string;
  fullName: string;
}

interface TierConfig {
  id: string;
  name: string;
  title: string;
  subtitle: string;
  benefits: string[];
  documents: {
    key: string;
    title: string;
    description: string;
    icon: any;
  }[];
  requiresBasicInfo: boolean;
  processingRoute: 'UnifiedProcessing';
  processingTime: string;
  limits: {
    daily: number;
    monthly: number;
  };
}

const tierConfigs: Record<string, TierConfig> = {
  tier1: {
    id: 'tier1',
    name: 'Tier 1',
    title: 'Basic Account Verification',
    subtitle: 'Complete basic verification to unlock Tier 1 benefits',
    benefits: [
      'Daily limit: ₦50,000',
      'Monthly limit: ₦200,000',
      'Basic wallet features'
    ],
    documents: [
      {
        key: 'profilePhoto',
        title: 'Profile Photo',
        description: 'Clear, recent photo of yourself',
        icon: User
      }
    ],
    requiresBasicInfo: true,
    processingRoute: 'UnifiedProcessing',
    processingTime: '1-2 business days',
    limits: { daily: 50000, monthly: 200000 }
  },
  tier2: {
    id: 'tier2',
    name: 'Tier 2',
    title: 'Enhanced Account Verification',
    subtitle: 'Complete enhanced verification to unlock Tier 2 benefits',
    benefits: [
      'Daily limit: ₦200,000',
      'Monthly limit: ₦1,000,000',
      'Virtual card creation',
      'International transfers'
    ],
    documents: [
      {
        key: 'idCard',
        title: 'Government ID Card',
        description: 'Valid government-issued ID (National ID, Driver\'s License, or Passport)',
        icon: CreditCard
      },
      {
        key: 'proofOfAddress',
        title: 'Proof of Address',
        description: 'Utility bill, bank statement, or lease agreement (less than 3 months old)',
        icon: MapPin
      },
      {
        key: 'bankStatement',
        title: 'Bank Statement',
        description: 'Recent bank statement showing your financial activity (last 3 months)',
        icon: FileText
      }
    ],
    requiresBasicInfo: false,
    processingRoute: 'UnifiedProcessing',
    processingTime: '2-3 business days',
    limits: { daily: 200000, monthly: 1000000 }
  },
  tier3: {
    id: 'tier3',
    name: 'Tier 3',
    title: 'Business Account Verification',
    subtitle: 'Complete business verification to unlock premium Tier 3 benefits',
    benefits: [
      'Daily limit: ₦1,000,000',
      'Monthly limit: ₦10,000,000',
      'Business banking features',
      'Multi-currency support',
      'Priority customer support',
      'Advanced analytics & reporting'
    ],
    documents: [
      {
        key: 'businessRegistration',
        title: 'Business Registration',
        description: 'Certificate of Incorporation or Business Registration document',
        icon: Building
      },
      {
        key: 'taxCertificate',
        title: 'Tax Certificate',
        description: 'Valid tax clearance certificate or TIN registration',
        icon: FileText
      },
      {
        key: 'financialStatements',
        title: 'Financial Statements',
        description: 'Audited financial statements for the last 2 years',
        icon: DollarSign
      },
      {
        key: 'directorId',
        title: 'Director\'s ID',
        description: 'Valid ID of company director or authorized signatory',
        icon: Briefcase
      },
      {
        key: 'proofOfIncome',
        title: 'Proof of Income',
        description: 'Bank statements, invoices, or income verification documents',
        icon: FileText
      }
    ],
    requiresBasicInfo: false,
    processingRoute: 'UnifiedProcessing',
    processingTime: '3-5 business days',
    limits: { daily: 1000000, monthly: 10000000 }
  }
};

const UnifiedTierScreen: React.FC<Props> = ({ navigation, route }) => {
  const tierLevel = route.params?.tierLevel || 'tier1';
  const config = tierConfigs[tierLevel];

  const [basicInfo] = useState<BasicInfo>({
    phone: '',
    email: '',
    fullName: '',
  });

  const [documents, setDocuments] = useState<Record<string, Document>>(() => {
    const initialDocs: Record<string, Document> = {};
    config.documents.forEach(doc => {
      initialDocs[doc.key] = { uri: null, name: '' };
    });
    return initialDocs;
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  const pickImage = async (documentKey: string) => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: documentKey === 'profilePhoto' ? [1, 1] : [4, 3],
      quality: 0.8,
    });

    if (!result.canceled) {
      setDocuments(prev => ({
        ...prev,
        [documentKey]: {
          uri: result.assets[0].uri,
          name: result.assets[0].fileName || `${documentKey}.jpg`,
        },
      }));
    }
  };

  const isFormValid = () => {
    const documentsValid = (Object.values(documents) as Document[]).every(doc => doc.uri);
    const basicInfoValid = !config.requiresBasicInfo || (
      basicInfo.phone.length >= 10 &&
      basicInfo.email.includes('@') &&
      basicInfo.fullName.length >= 2
    );
    return documentsValid && basicInfoValid;
  };

  const handleSubmit = async () => {
    if (!isFormValid()) {
      Alert.alert(
        'Incomplete Information', 
        `Please ${config.requiresBasicInfo ? 'fill all fields and ' : ''}upload all required documents.`
      );
      return;
    }

    setIsSubmitting(true);
    
    navigation.navigate(config.processingRoute, {
      submissionData: {
        tierLevel,
        basicInfo: config.requiresBasicInfo ? basicInfo : undefined,
        documents,
        submissionId: `${config.id.toUpperCase()}-${Date.now()}`,
      },
    });
  };

  const uploadedCount = (Object.values(documents) as Document[]).filter(doc => doc.uri).length;
  const totalDocs = config.documents.length;
  const progress = uploadedCount / totalDocs;

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <ArrowLeft size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={styles.title}>{config.name} Verification</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Benefits */}
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>{config.title}</Text>
          <Text style={styles.sectionSubtitle}>{config.subtitle}</Text>
          
          <View style={styles.benefitsList}>
            {config.benefits.map((benefit, index) => (
              <View key={index} style={styles.benefitItem}>
                <CheckCircle size={16} color={colors.success} />
                <Text style={styles.benefitText}>{benefit}</Text>
              </View>
            ))}
          </View>
          
          <View style={styles.progressContainer}>
            <Text style={styles.progressText}>
              {Math.round(progress * 100)}% Complete ({uploadedCount}/{totalDocs} documents)
            </Text>
            <View style={styles.progressBar}>
              <View style={[styles.progressFill, { width: `${progress * 100}%` }]} />
            </View>
          </View>
        </View>

        {/* Basic Information (Tier 1 only) */}
        {config.requiresBasicInfo && (
          <View style={styles.card}>
            <Text style={styles.sectionTitle}>Basic Information</Text>
            <Text style={styles.sectionSubtitle}>
              Provide your basic details for account verification
            </Text>
            
            <TouchableOpacity style={styles.inputGroup}>
              <View style={styles.inputIcon}>
                <User size={20} color={colors.secondaryText} />
              </View>
              <Text style={styles.inputLabel}>Full Name</Text>
              <Text style={styles.inputValue}>
                {basicInfo.fullName || 'Tap to enter your full name'}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.inputGroup}>
              <View style={styles.inputIcon}>
                <Phone size={20} color={colors.secondaryText} />
              </View>
              <Text style={styles.inputLabel}>Phone Number</Text>
              <Text style={styles.inputValue}>
                {basicInfo.phone || 'Tap to enter your phone number'}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.inputGroup}>
              <View style={styles.inputIcon}>
                <Mail size={20} color={colors.secondaryText} />
              </View>
              <Text style={styles.inputLabel}>Email Address</Text>
              <Text style={styles.inputValue}>
                {basicInfo.email || 'Tap to enter your email address'}
              </Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Documents */}
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>
            {config.id === 'tier1' ? 'Upload Photo' : 'Required Documents'}
          </Text>
          <Text style={styles.sectionSubtitle}>
            Upload clear, high-quality photos of {config.id === 'tier1' ? 'your profile photo' : 'all required documents'}
          </Text>
          
          {config.documents.map((docConfig, index) => {
            const IconComponent = docConfig.icon;
            const isLast = index === config.documents.length - 1;
            const doc = documents[docConfig.key];
            
            if (config.id === 'tier1') {
              return (
                <TouchableOpacity
                  key={docConfig.key}
                  style={styles.photoUpload}
                  onPress={() => pickImage(docConfig.key)}
                >
                  {doc.uri ? (
                    <>
                      <Image 
                        source={{ uri: doc.uri }} 
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
              );
            }
            
            return (
              <TouchableOpacity
                key={docConfig.key}
                style={[
                  styles.docRow,
                  isLast && styles.lastDocRow
                ]}
                onPress={() => pickImage(docConfig.key)}
              >
                {doc.uri ? (
                  <Image source={{ uri: doc.uri }} style={styles.thumb} />
                ) : (
                  <View style={styles.uploadPlaceholder}>
                    <IconComponent size={24} color={colors.secondaryText} />
                  </View>
                )}
                
                <View style={styles.docText}>
                  <Text style={styles.docLabel}>{docConfig.title}</Text>
                  <Text style={styles.docDescription}>{docConfig.description}</Text>
                  <Text style={[
                    styles.docStatus,
                    doc.uri && styles.docStatusUploaded
                  ]}>
                    {doc.uri ? 'Document uploaded' : 'Tap to upload'}
                  </Text>
                </View>
                
                <View style={styles.docAction}>
                  {doc.uri ? (
                    <CheckCircle size={20} color={colors.success} />
                  ) : (
                    <UploadCloud size={20} color={colors.secondaryText} />
                  )}
                </View>
              </TouchableOpacity>
            );
          })}
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
            {isSubmitting ? 'Submitting...' : `Submit for ${config.name} Verification`}
          </Text>
        </TouchableOpacity>

        <View style={styles.footer}>
          <Text style={styles.footerText}>
            After submission, verification typically takes {config.processingTime}
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
  progressContainer: {
    marginTop: spacing.sm,
  },
  progressText: {
    fontSize: 14,
    color: colors.text,
    fontWeight: '500',
    marginBottom: spacing.sm,
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
  docRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  lastDocRow: {
    borderBottomWidth: 0,
  },
  uploadPlaceholder: {
    width: 60,
    height: 45,
    borderRadius: 8,
    backgroundColor: colors.light,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
    borderStyle: 'dashed',
  },
  thumb: {
    width: 60,
    height: 45,
    borderRadius: 8,
    marginRight: spacing.md,
  },
  docText: {
    flex: 1,
  },
  docLabel: {
    fontSize: 14,
    color: colors.text,
    fontWeight: '500',
  },
  docDescription: {
    fontSize: 12,
    color: colors.secondaryText,
    marginTop: spacing.xs,
    lineHeight: 16,
  },
  docStatus: {
    fontSize: 12,
    color: colors.secondaryText,
    marginTop: spacing.xs,
  },
  docStatusUploaded: {
    color: colors.success,
    fontWeight: '500',
  },
  docAction: {
    marginLeft: spacing.sm,
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

export default UnifiedTierScreen;
