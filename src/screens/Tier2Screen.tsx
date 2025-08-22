import { RouteProp } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import * as ImagePicker from 'expo-image-picker';
import { ArrowLeft, CheckCircle, CreditCard, FileText, MapPin, UploadCloud } from 'lucide-react-native';
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

type Tier2ScreenNavigationProp = StackNavigationProp<ProfileParamList, 'Tier2'>;
type Tier2ScreenRouteProp = RouteProp<ProfileParamList, 'Tier2'>;

interface Props {
  navigation: Tier2ScreenNavigationProp;
  route: Tier2ScreenRouteProp;
}

interface Document {
  uri: string | null;
  name: string;
}

const Tier2Screen: React.FC<Props> = ({ navigation }) => {
  const [documents, setDocuments] = useState<{
    idCard: Document;
    proofOfAddress: Document;
    bankStatement: Document;
  }>({
    idCard: { uri: null, name: '' },
    proofOfAddress: { uri: null, name: '' },
    bankStatement: { uri: null, name: '' },
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  const pickImage = async (type: keyof typeof documents) => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.8,
    });

    if (!result.canceled) {
      setDocuments(prev => ({
        ...prev,
        [type]: {
          uri: result.assets[0].uri,
          name: result.assets[0].fileName || `${String(type)}.jpg`,
        },
      }));
    }
  };

  const getDocumentInfo = (type: keyof typeof documents) => {
    const info = {
      idCard: {
        title: 'Government ID Card',
        description: 'Valid government-issued ID (National ID, Driver\'s License, or Passport)',
        icon: CreditCard,
      },
      proofOfAddress: {
        title: 'Proof of Address',
        description: 'Utility bill, bank statement, or lease agreement (less than 3 months old)',
        icon: MapPin,
      },
      bankStatement: {
        title: 'Bank Statement',
        description: 'Recent bank statement showing your financial activity (last 3 months)',
        icon: FileText,
      },
    };
    return info[type];
  };

  const isFormValid = () => {
    return (Object.values(documents) as Document[]).every(doc => doc.uri);
  };

  const handleSubmit = async () => {
    if (!isFormValid()) {
      Alert.alert('Incomplete Documents', 'Please upload all required documents.');
      return;
    }

    setIsSubmitting(true);
    
    // Navigate to processing screen
    navigation.navigate('Tier2Processing', {
      submissionData: {
        documents,
        submissionId: `T2-${Date.now()}`,
      },
    });
  };

  const progress = (Object.values(documents) as Document[]).filter(doc => doc.uri).length / Object.keys(documents).length;

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <ArrowLeft size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={styles.title}>Tier 2 Verification</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Progress */}
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Enhanced Account Verification</Text>
          <Text style={styles.sectionSubtitle}>
            Complete enhanced verification to unlock Tier 2 benefits
          </Text>
          
          <View style={styles.benefitsList}>
            <View style={styles.benefitItem}>
              <CheckCircle size={16} color={colors.success} />
              <Text style={styles.benefitText}>Daily limit: ₦200,000</Text>
            </View>
            <View style={styles.benefitItem}>
              <CheckCircle size={16} color={colors.success} />
              <Text style={styles.benefitText}>Monthly limit: ₦1,000,000</Text>
            </View>
            <View style={styles.benefitItem}>
              <CheckCircle size={16} color={colors.success} />
              <Text style={styles.benefitText}>Virtual card creation</Text>
            </View>
            <View style={styles.benefitItem}>
              <CheckCircle size={16} color={colors.success} />
              <Text style={styles.benefitText}>International transfers</Text>
            </View>
          </View>
          
          <View style={styles.progressContainer}>
            <Text style={styles.progressText}>
              {Math.round(progress * 100)}% Complete ({(Object.values(documents) as Document[]).filter(doc => doc.uri).length}/3 documents)
            </Text>
            <View style={styles.progressBar}>
              <View style={[styles.progressFill, { width: `${progress * 100}%` }]} />
            </View>
          </View>
        </View>

        {/* Documents */}
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Required Documents</Text>
          <Text style={styles.sectionSubtitle}>
            Upload clear, high-quality photos of all required documents
          </Text>
          
          {(Object.keys(documents) as (keyof typeof documents)[]).map((key, index) => {
            const docInfo = getDocumentInfo(key);
            const IconComponent = docInfo.icon;
            const isLast = index === Object.keys(documents).length - 1;
            
            return (
              <TouchableOpacity
                key={key}
                style={[
                  styles.docRow,
                  isLast && styles.lastDocRow
                ]}
                onPress={() => pickImage(key)}
              >
                {documents[key].uri ? (
                  <Image source={{ uri: documents[key].uri! }} style={styles.thumb} />
                ) : (
                  <View style={styles.uploadPlaceholder}>
                    <IconComponent size={24} color={colors.secondaryText} />
                  </View>
                )}
                
                <View style={styles.docText}>
                  <Text style={styles.docLabel}>{docInfo.title}</Text>
                  <Text style={styles.docDescription}>{docInfo.description}</Text>
                  <Text style={[
                    styles.docStatus,
                    documents[key].uri && styles.docStatusUploaded
                  ]}>
                    {documents[key].uri ? 'Document uploaded' : 'Tap to upload'}
                  </Text>
                </View>
                
                <View style={styles.docAction}>
                  {documents[key].uri ? (
                    <CheckCircle size={20} color={colors.success} />
                  ) : (
                    <UploadCloud size={20} color={colors.secondaryText} />
                  )}
                </View>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Requirements */}
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Document Requirements</Text>
          <View style={styles.requirementsList}>
            <Text style={styles.requirementItem}>• Documents must be clear and readable</Text>
            <Text style={styles.requirementItem}>• All four corners must be visible</Text>
            <Text style={styles.requirementItem}>• No glare or shadows on the document</Text>
            <Text style={styles.requirementItem}>• Documents must be valid and not expired</Text>
            <Text style={styles.requirementItem}>• Bank statements must be from the last 3 months</Text>
          </View>
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
            After submission, verification typically takes 2-3 business days
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
  requirementsList: {
    marginTop: spacing.sm,
  },
  requirementItem: {
    fontSize: 13,
    color: colors.secondaryText,
    marginBottom: spacing.xs,
    lineHeight: 18,
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

export default Tier2Screen;
