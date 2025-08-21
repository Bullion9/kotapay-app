import React, { useState, useEffect } from 'react';
import {
  SafeAreaView,
  ScrollView,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Image,
  Alert,
} from 'react-native';
import {
  CheckCircle,
  UploadCloud,
  ChevronLeft,
} from 'lucide-react-native';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import * as ImagePicker from 'expo-image-picker';
import { theme } from '../theme';
import { ProfileParamList } from '../types';

const { colors, spacing, borderRadius } = theme;

type KycNavigationProp = StackNavigationProp<ProfileParamList, 'KycLimits'>;

interface Tier {
  name: string;
  limit: number;
  currency: string;
  status: 'current' | 'pending' | 'locked';
}

interface DocItem {
  uri: string | null;
  status: 'pending' | 'uploaded';
}

const KycLimitsScreen: React.FC = () => {
  const navigation = useNavigation<KycNavigationProp>();
  
  const [tier] = useState<Tier>({
    name: 'Tier 1',
    limit: 50000,
    currency: '₦',
    status: 'current',
  });
  const [progress, setProgress] = useState(0.66);
  const [docs, setDocs] = useState<{
    idFront: DocItem;
    idBack: DocItem;
    selfie: DocItem;
  }>({
    idFront: { uri: null, status: 'pending' },
    idBack: { uri: null, status: 'pending' },
    selfie: { uri: null, status: 'pending' },
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const pickImage = async (key: keyof typeof docs) => {
    try {
      const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
      
      if (permissionResult.granted === false) {
        Alert.alert('Permission required', 'Permission to access camera roll is required!');
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: 'images',
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        setDocs((prev) => ({
          ...prev,
          [key]: { uri: result.assets[0].uri, status: 'uploaded' },
        }));
      }
    } catch {
      Alert.alert('Error', 'Failed to pick image');
    }
  };

  const tiers = [
    { 
      name: 'Tier 1', 
      limit: 50000, 
      status: 'current', 
      currency: '₦',
      dailyTransactions: 5,
      monthlyLimit: 200000,
      requirements: 'Basic verification'
    },
    { 
      name: 'Tier 2', 
      limit: 500000, 
      status: 'locked', 
      currency: '₦',
      dailyTransactions: 20,
      monthlyLimit: 2000000,
      requirements: 'ID verification + Selfie'
    },
    { 
      name: 'Tier 3', 
      limit: 2000000, 
      status: 'locked', 
      currency: '₦',
      dailyTransactions: 50,
      monthlyLimit: 10000000,
      requirements: 'Full KYC + Address verification'
    },
  ];

  useEffect(() => {
    const done = Object.values(docs).filter((d: DocItem) => d.uri).length;
    setProgress(done / 3);
  }, [docs]);

  const allUploaded = Object.values(docs).every((d: DocItem) => d.uri);

  const handleSubmitForReview = () => {
    if (!allUploaded) {
      Alert.alert('Incomplete Documents', 'Please upload all required documents before submitting.');
      return;
    }

    Alert.alert(
      'Submit KYC Application',
      'Are you sure you want to submit your KYC application for review? This action cannot be undone.',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Submit',
          onPress: () => {
            setIsSubmitting(true);
            
            // Generate submission ID
            const submissionId = `KYC${Date.now().toString().slice(-8)}${Math.random().toString(36).substr(2, 4).toUpperCase()}`;
            
            // Count uploaded documents
            const documentsCount = Object.values(docs).filter((d: DocItem) => d.uri).length;
            
            // Simulate a brief delay before navigation
            setTimeout(() => {
              setIsSubmitting(false);
              navigation.navigate('KycProcessingScreen', {
                documentsCount,
                targetTier: 'Tier 2',
                submissionId,
              });
            }, 500);
          },
        },
      ]
    );
  };

  const getDocumentLabel = (key: string) => {
    switch (key) {
      case 'idFront':
        return 'Government ID (Front)';
      case 'idBack':
        return 'Government ID (Back)';
      case 'selfie':
        return 'Selfie with ID';
      default:
        return key;
    }
  };

  const getDocumentDescription = (key: string) => {
    switch (key) {
      case 'idFront':
        return 'Clear photo of front side';
      case 'idBack':
        return 'Clear photo of back side';
      case 'selfie':
        return 'Hold your ID next to your face';
      default:
        return '';
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <ChevronLeft size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>KYC & Limits</Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView contentContainerStyle={styles.scroll}>
        {/* New Tier Dashboard Button */}
        <TouchableOpacity 
          style={styles.dashboardButton}
          onPress={() => navigation.navigate('TierDashboard')}
        >
          <View style={styles.dashboardButtonContent}>
            <Text style={styles.dashboardButtonTitle}>🚀 New Unified Tier Dashboard</Text>
            <Text style={styles.dashboardButtonSubtitle}>
              Ultra-professional KYC experience with Apple-grade design
            </Text>
          </View>
          <Text style={styles.dashboardButtonArrow}>→</Text>
        </TouchableOpacity>

        {/* Legacy Notice */}
        <View style={styles.legacyNotice}>
          <Text style={styles.legacyNoticeText}>
            ⚠️ This screen will be deprecated. Please use the new Tier Dashboard above for the complete KYC experience.
          </Text>
        </View>

        {/* Tier Progress */}
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Account Tiers</Text>
          <Text style={styles.sectionSubtitle}>
            Complete KYC verification to unlock higher transaction limits
          </Text>
          
          {tiers.map((t, index) => (
            <View key={t.name} style={[
              styles.tierCard,
              t.status === 'current' && styles.tierCardActive
            ]}>
              <View style={styles.tierHeader}>
                <View style={styles.tierTitleRow}>
                  <Text style={[
                    styles.tierName,
                    t.status === 'current' && styles.tierNameActive
                  ]}>
                    {t.name}
                  </Text>
                  {t.status === 'current' && (
                    <View style={styles.currentBadge}>
                      <Text style={styles.currentBadgeText}>Current</Text>
                    </View>
                  )}
                </View>
                <Text style={styles.tierLimit}>
                  {t.currency} {t.limit.toLocaleString()} daily limit
                </Text>
              </View>
              
              <View style={styles.tierDetails}>
                <Text style={styles.tierDetailText}>
                  • {t.dailyTransactions} transactions per day
                </Text>
                <Text style={styles.tierDetailText}>
                  • {t.currency} {t.monthlyLimit.toLocaleString()} monthly limit
                </Text>
                <Text style={styles.tierDetailText}>
                  • {t.requirements}
                </Text>
              </View>
              
              {t.status !== 'current' && (
                <TouchableOpacity 
                  style={styles.upgradeButton}
                  onPress={() => {
                    navigation.navigate('TierDashboard');
                  }}
                >
                  <Text style={styles.upgradeButtonText}>
                    {t.name === 'Tier 1' ? 'Start Verification' : `Upgrade to ${t.name}`}
                  </Text>
                </TouchableOpacity>
              )}
              
              {t.status === 'current' && index < tiers.length - 1 && (
                <TouchableOpacity 
                  style={styles.upgradeButton}
                  onPress={() => {
                    navigation.navigate('TierDashboard');
                  }}
                >
                  <Text style={styles.upgradeButtonText}>
                    Upgrade to {tiers[index + 1].name}
                  </Text>
                </TouchableOpacity>
              )}
            </View>
          ))}
          
          <View style={styles.progressBar}>
            <View style={[styles.progressFill, { width: `${progress * 100}%` }]} />
          </View>
        </View>

        {/* Documents */}
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Upload Documents</Text>
          <Text style={styles.sectionSubtitle}>
            Please upload clear, high-quality photos of the following documents:
          </Text>
          {(['idFront', 'idBack', 'selfie'] as const).map((key, index) => (
            <TouchableOpacity
              key={key}
              style={[
                styles.docRow,
                index === 2 && styles.lastDocRow
              ]}
              onPress={() => pickImage(key)}
            >
              {docs[key].uri ? (
                <Image source={{ uri: docs[key].uri! }} style={styles.thumb} />
              ) : (
                <View style={styles.uploadPlaceholder}>
                  <UploadCloud size={32} color={colors.secondaryText} />
                </View>
              )}
              <View style={styles.docText}>
                <Text style={styles.docLabel}>
                  {getDocumentLabel(key)}
                </Text>
                <Text style={styles.docDescription}>
                  {getDocumentDescription(key)}
                </Text>
                <Text style={[
                  styles.docStatus,
                  docs[key].uri && styles.docStatusUploaded
                ]}>
                  {docs[key].uri ? 'Uploaded' : 'Tap to upload'}
                </Text>
              </View>
              {docs[key].uri && <CheckCircle size={20} color={colors.success} />}
            </TouchableOpacity>
          ))}
        </View>

        {/* Limits Table */}
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Current Transaction Limits</Text>
          <Text style={styles.sectionSubtitle}>
            Your current {tier.name} limits and restrictions
          </Text>
          
          {[
            { label: 'Daily Send Limit', value: `₦ ${tier.limit.toLocaleString()}` },
            { label: 'Daily Receive Limit', value: `₦ ${tier.limit.toLocaleString()}` },
            { label: 'Monthly Limit', value: `₦ ${(tier.limit * 4).toLocaleString()}` },
            { label: 'Wallet Maximum', value: `₦ ${(tier.limit * 2).toLocaleString()}` },
            { label: 'Daily Transactions', value: '5 transactions' },
            { label: 'Withdrawal Limit', value: `₦ ${(tier.limit * 0.8).toLocaleString()}` }
          ].map((item, index) => (
            <View key={item.label} style={[
              styles.limitRow,
              index === 5 && styles.lastLimitRow
            ]}>
              <Text style={styles.limitLabel}>{item.label}</Text>
              <Text style={styles.limitValue}>{item.value}</Text>
            </View>
          ))}
          
          <View style={styles.upgradeNotice}>
            <Text style={styles.upgradeNoticeText}>
              💡 Complete KYC verification to increase these limits significantly
            </Text>
          </View>
        </View>

        {/* Submit Button */}
        <TouchableOpacity
          style={[
            styles.cta, 
            !allUploaded && styles.disabled,
            isSubmitting && styles.submitting
          ]}
          disabled={!allUploaded || isSubmitting}
          onPress={handleSubmitForReview}
        >
          <Text style={styles.ctaText}>
            {isSubmitting ? 'Submitting...' : 'Submit for Review'}
          </Text>
        </TouchableOpacity>

        {/* Progress Info */}
        <View style={styles.progressInfo}>
          <Text style={styles.progressText}>
            {Object.values(docs).filter((d: DocItem) => d.uri).length} of 3 documents uploaded
          </Text>
          {allUploaded && (
            <Text style={styles.readyText}>
              ✅ Ready for submission
            </Text>
          )}
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
    fontWeight: '600',
    color: colors.text,
    flex: 1,
    textAlign: 'center',
    marginRight: 40,
  },
  headerSpacer: {
    width: 40,
  },
  scroll: {
    padding: spacing.lg,
  },
  card: {
    backgroundColor: colors.white,
    borderRadius: borderRadius.large,
    padding: spacing.lg,
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginBottom: spacing.md,
  },
  sectionSubtitle: {
    fontSize: 14,
    color: colors.secondaryText,
    marginBottom: spacing.lg,
    lineHeight: 20,
  },
  tierRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing.md,
  },
  tierItem: {
    alignItems: 'center',
    flex: 1,
  },
  tierCard: {
    backgroundColor: colors.light,
    borderRadius: borderRadius.medium,
    padding: spacing.lg,
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  tierCardActive: {
    backgroundColor: colors.primaryTransparent,
    borderColor: colors.primary,
  },
  tierHeader: {
    marginBottom: spacing.md,
  },
  tierTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.xs,
  },
  tierName: {
    fontSize: 16,
    color: colors.text,
    fontWeight: '600',
  },
  tierNameActive: {
    color: colors.primary,
  },
  currentBadge: {
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.small,
  },
  currentBadgeText: {
    color: colors.white,
    fontSize: 12,
    fontWeight: '600',
  },
  tierLimit: {
    fontSize: 14,
    color: colors.text,
    fontWeight: '500',
  },
  tierDetails: {
    marginBottom: spacing.md,
  },
  tierDetailText: {
    fontSize: 13,
    color: colors.secondaryText,
    marginBottom: spacing.xs,
  },
  upgradeButton: {
    backgroundColor: colors.primary,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: borderRadius.small,
    alignSelf: 'flex-start',
  },
  upgradeButtonText: {
    color: colors.white,
    fontSize: 13,
    fontWeight: '500',
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
    width: 48,
    height: 48,
    borderRadius: 8,
    backgroundColor: colors.light,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.md,
  },
  thumb: {
    width: 48,
    height: 48,
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
  limitRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  lastLimitRow: {
    borderBottomWidth: 0,
  },
  limitLabel: {
    fontSize: 14,
    color: colors.text,
  },
  limitValue: {
    fontSize: 14,
    color: colors.primary,
    fontWeight: '600',
  },
  upgradeNotice: {
    backgroundColor: '#FFF4E6',
    borderWidth: 1,
    borderColor: '#FFE4B5',
    borderRadius: 8,
    padding: 12,
    marginTop: 16,
  },
  upgradeNoticeText: {
    fontSize: 13,
    color: '#B8860B',
    textAlign: 'center',
    lineHeight: 18,
  },
  cta: {
    backgroundColor: colors.primary,
    borderRadius: borderRadius.medium,
    paddingVertical: spacing.lg,
    alignItems: 'center',
    marginTop: spacing.md,
  },
  disabled: {
    backgroundColor: colors.secondaryText,
  },
  submitting: {
    backgroundColor: colors.border,
    opacity: 0.7,
  },
  ctaText: {
    color: colors.white,
    fontSize: 16,
    fontWeight: '600',
  },
  progressInfo: {
    alignItems: 'center',
    marginTop: spacing.lg,
  },
  progressText: {
    fontSize: 14,
    color: colors.secondaryText,
    marginBottom: spacing.sm,
  },
  readyText: {
    fontSize: 14,
    color: colors.success,
    fontWeight: '500',
  },
  dashboardButton: {
    backgroundColor: '#06402B',
    borderRadius: borderRadius.medium,
    padding: spacing.lg,
    marginBottom: spacing.lg,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 2,
  },
  dashboardButtonContent: {
    flex: 1,
  },
  dashboardButtonTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.white,
    marginBottom: 4,
  },
  dashboardButtonSubtitle: {
    fontSize: 13,
    color: '#A8E4A0',
    lineHeight: 18,
  },
  dashboardButtonArrow: {
    fontSize: 20,
    color: colors.white,
    marginLeft: spacing.md,
  },
  legacyNotice: {
    backgroundColor: '#FFF4E6',
    borderWidth: 1,
    borderColor: '#FFE4B5',
    borderRadius: borderRadius.medium,
    padding: spacing.md,
    marginBottom: spacing.lg,
  },
  legacyNoticeText: {
    fontSize: 13,
    color: '#B8860B',
    textAlign: 'center',
    lineHeight: 18,
  },
});

export default KycLimitsScreen;