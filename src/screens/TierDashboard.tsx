import AsyncStorage from '@react-native-async-storage/async-storage';
import { RouteProp } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import * as ImagePicker from 'expo-image-picker';
import * as Notifications from 'expo-notifications';
import {
    ArrowDown,
    ArrowUp,
    CheckCircle,
    ChevronLeft,
    CreditCard,
    Eye,
    MessageCircle,
    Phone,
    Shield,
    Trash2,
    Upload,
    Wallet,
    X
} from 'lucide-react-native';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
    Alert,
    Animated,
    Dimensions,
    Image,
    KeyboardAvoidingView,
    Modal,
    Platform,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors as globalColors } from '../theme';
import { ProfileParamList } from '../types';

const { width } = Dimensions.get('window');

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
};

type TierDashboardNavigationProp = StackNavigationProp<ProfileParamList, 'TierDashboard'>;
type TierDashboardRouteProp = RouteProp<ProfileParamList, 'TierDashboard'>;

interface Props {
  navigation: TierDashboardNavigationProp;
  route: TierDashboardRouteProp;
}

interface TierData {
  id: number;
  name: string;
  dailySend: number;
  dailyReceive: number;
  walletCap: number;
  virtualCards: number;
  requirements: RequirementItem[];
  status: 'current' | 'available' | 'locked';
}

interface RequirementItem {
  id: string;
  label: string;
  icon: any;
  status: 'pending' | 'approved' | 'rejected';
  required: boolean;
}

interface Document {
  id: string;
  name: string;
  uri: string;
  type: string;
  uploadProgress: number;
}

const TierDashboard: React.FC<Props> = ({ navigation }) => {
  const [selectedTier, setSelectedTier] = useState<number>(1);
  const [documents, setDocuments] = useState<Document[]>([]);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [submittedTiers, setSubmittedTiers] = useState<Set<number>>(new Set());
  const [currentUserTier, setCurrentUserTier] = useState<number>(1); // Track user's actual tier
  const [previewVisible, setPreviewVisible] = useState<boolean>(false);
  const [selectedDocument, setSelectedDocument] = useState<Document | null>(null);
  const [kycData, setKycData] = useState<{
    phoneVerified: boolean;
    basicInfoComplete: boolean;
    documentsUploaded: { [key: string]: boolean };
    tierStatus: { [key: number]: 'pending' | 'approved' | 'rejected' };
  }>({
    phoneVerified: true, // Assuming user is already logged in
    basicInfoComplete: true,
    documentsUploaded: {},
    tierStatus: { 1: 'approved' } // Tier 1 is automatically approved for logged-in users
  });
  
  // Animations
  const progressAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const pillAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Configure notifications on component mount
    const initializeNotifications = async () => {
      try {
        Notifications.setNotificationHandler({
          handleNotification: async () => ({
            shouldShowBanner: true,
            shouldShowList: true,
            shouldPlaySound: true,
            shouldSetBadge: true,
          }),
        });
        console.log('Notifications initialized successfully');
      } catch (error) {
        console.log('Notifications initialization failed (development mode):', error);
      }
    };

    initializeNotifications();

    // Load persistent KYC data
    loadKYCData();

    // Listen for navigation focus to handle returning from processing screen
    const unsubscribe = navigation.addListener('focus', () => {
      // Check if user should be auto-progressed (can be triggered by external factors)
      // This would typically be connected to your server API to check actual KYC status
      loadKYCData();
    });

    return unsubscribe;
  }, [navigation]);

  // Persistent storage functions
  const saveKYCData = async (data: typeof kycData) => {
    try {
      await AsyncStorage.setItem('kycData', JSON.stringify(data));
      await AsyncStorage.setItem('currentUserTier', currentUserTier.toString());
      await AsyncStorage.setItem('documents', JSON.stringify(documents));
    } catch (error) {
      console.error('Error saving KYC data:', error);
    }
  };

  const loadKYCData = async () => {
    try {
      const savedKycData = await AsyncStorage.getItem('kycData');
      const savedTier = await AsyncStorage.getItem('currentUserTier');
      const savedDocuments = await AsyncStorage.getItem('documents');

      if (savedKycData) {
        setKycData(JSON.parse(savedKycData));
      }
      if (savedTier) {
        const tier = parseInt(savedTier, 10);
        setCurrentUserTier(tier);
        setSelectedTier(tier);
      }
      if (savedDocuments) {
        setDocuments(JSON.parse(savedDocuments));
      }
    } catch (error) {
      console.error('Error loading KYC data:', error);
    }
  };

  // Function to check if a specific requirement is met
  const isRequirementMet = useCallback((requirementId: string, tierLevel: number): boolean => {
    switch (requirementId) {
      case 'phone':
        return kycData.phoneVerified;
      case 'basic':
        return kycData.basicInfoComplete;
      case 'id_front':
        return kycData.documentsUploaded.id_front || documents.some(doc => doc.type === 'id_front');
      case 'id_back':
        return kycData.documentsUploaded.id_back || documents.some(doc => doc.type === 'id_back');
      case 'address':
        return kycData.documentsUploaded.address || documents.some(doc => doc.type === 'address');
      default:
        return false;
    }
  }, [kycData, documents]);

  // Function to update KYC data and save to storage
  const updateKYCData = async (updates: Partial<typeof kycData>) => {
    const newKycData = { ...kycData, ...updates };
    setKycData(newKycData);
    await saveKYCData(newKycData);
  };

  // Function to check if a tier is fully completed
  const isTierCompleted = (tierLevel: number): boolean => {
    const tier = tierData.find(t => t.id === tierLevel);
    if (!tier) return false;
    
    return tier.requirements.every(req => req.status === 'approved');
  };

  // Function to validate tier upgrade eligibility
  const validateTierUpgrade = (tierLevel: number): { canUpgrade: boolean; missingRequirements: string[] } => {
    const tier = tierData.find(t => t.id === tierLevel);
    if (!tier) return { canUpgrade: false, missingRequirements: ['Invalid tier'] };
    
    const missingRequirements = tier.requirements
      .filter(req => req.status !== 'approved')
      .map(req => req.label);
    
    return {
      canUpgrade: missingRequirements.length === 0,
      missingRequirements
    };
  };
  const progressToNextTier = async (completedTier: number) => {
    console.log(`🚀 Starting progression from Tier ${completedTier} to Tier ${completedTier + 1}`);
    
    const nextTier = completedTier + 1;
    if (nextTier <= 3) {
      // Update states immediately
      setCurrentUserTier(nextTier);
      setSelectedTier(nextTier);
      
      console.log(`✅ Updated to Tier ${nextTier}`);
      
      // Update KYC data to mark tier as approved
      try {
        await updateKYCData({
          tierStatus: {
            ...kycData.tierStatus,
            [completedTier]: 'approved',
            [nextTier]: 'pending'
          }
        });
        console.log('📊 KYC data updated successfully');
      } catch (error) {
        console.error('❌ Error updating KYC data:', error);
      }
      
      // Animate to the next tier with celebration effect
      Animated.sequence([
        Animated.timing(scaleAnim, {
          toValue: 1.1,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(scaleAnim, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        })
      ]).start();

      // Show celebration alert immediately (no delay)
      Alert.alert(
        '🎉 Tier Upgraded!',
        `Congratulations! You've been automatically upgraded to Tier ${nextTier}. You now have access to higher limits and more features!`,
        [
          {
            text: 'Explore New Limits',
            onPress: () => {
              // Animate pill selection to new tier
              Animated.timing(pillAnim, {
                toValue: nextTier - 1,
                duration: 500,
                useNativeDriver: true,
              }).start();
            }
          }
        ]
      );
    } else {
      console.log('🏆 Maximum tier reached');
      Alert.alert('Maximum Tier', 'You have reached the highest tier available!');
    }
  };

  const tierData: TierData[] = useMemo(() => [
    {
      id: 1,
      name: 'Tier 1',
      dailySend: 50000,
      dailyReceive: 50000,
      walletCap: 50000,
      virtualCards: 1,
      status: currentUserTier >= 1 ? 'current' : 'locked',
      requirements: [
        { id: 'phone', label: 'Phone Verification', icon: Phone, status: isRequirementMet('phone', 1) ? 'approved' : 'pending', required: true },
        { id: 'basic', label: 'Basic Information', icon: CheckCircle, status: isRequirementMet('basic', 1) ? 'approved' : 'pending', required: true },
      ]
    },
    {
      id: 2,
      name: 'Tier 2',
      dailySend: 200000,
      dailyReceive: 200000,
      walletCap: 200000,
      virtualCards: 3,
      status: currentUserTier >= 2 ? 'current' : (currentUserTier === 1 ? 'available' : 'locked'),
      requirements: [
        { id: 'phone', label: 'Phone Verification', icon: Phone, status: isRequirementMet('phone', 2) ? 'approved' : 'pending', required: true },
        { id: 'basic', label: 'Basic Information', icon: CheckCircle, status: isRequirementMet('basic', 2) ? 'approved' : 'pending', required: true },
        { id: 'id_front', label: 'Government ID (Front)', icon: CreditCard, status: isRequirementMet('id_front', 2) ? 'approved' : 'pending', required: true },
        { id: 'id_back', label: 'Government ID (Back)', icon: CreditCard, status: isRequirementMet('id_back', 2) ? 'approved' : 'pending', required: true },
      ]
    },
    {
      id: 3,
      name: 'Tier 3',
      dailySend: 1000000,
      dailyReceive: -1, // Unlimited
      walletCap: 1000000,
      virtualCards: 5,
      status: currentUserTier >= 3 ? 'current' : (currentUserTier >= 2 || documents.length >= 2 ? 'available' : 'locked'),
      requirements: [
        { id: 'phone', label: 'Phone Verification', icon: Phone, status: isRequirementMet('phone', 3) ? 'approved' : 'pending', required: true },
        { id: 'basic', label: 'Basic Information', icon: CheckCircle, status: isRequirementMet('basic', 3) ? 'approved' : 'pending', required: true },
        { id: 'id_front', label: 'Government ID (Front)', icon: CreditCard, status: isRequirementMet('id_front', 3) ? 'approved' : 'pending', required: true },
        { id: 'id_back', label: 'Government ID (Back)', icon: CreditCard, status: isRequirementMet('id_back', 3) ? 'approved' : 'pending', required: true },
        { id: 'address', label: 'Address Proof', icon: Wallet, status: isRequirementMet('address', 3) ? 'approved' : 'pending', required: true },
      ]
    }
  ], [currentUserTier, documents.length, isRequirementMet]);

  const currentTier = tierData.find(t => t.id === selectedTier)!;
  const completedRequirements = currentTier.requirements.filter(r => r.status === 'approved').length;
  const totalRequirements = currentTier.requirements.length;
  const completionPercentage = (completedRequirements / totalRequirements) * 100;

  useEffect(() => {
    // Animate progress ring
    Animated.timing(progressAnim, {
      toValue: completionPercentage / 100,
      duration: 800,
      useNativeDriver: false,
    }).start();

    // Animate pill selection
    Animated.timing(pillAnim, {
      toValue: selectedTier - 1,
      duration: 200,
      useNativeDriver: true,
    }).start();
  }, [selectedTier, completionPercentage, progressAnim, pillAnim]);

  // Push notification functions
  const scheduleKYCNotification = async (tierLevel: number, action: 'submitted' | 'approved' | 'rejected') => {
    try {
      // Skip notifications in development if projectId issues
      if (__DEV__) {
        console.log(`[DEV] Would send notification: Tier ${tierLevel} ${action}`);
        return;
      }

      const { status } = await Notifications.getPermissionsAsync();
      if (status !== 'granted') {
        const { status: newStatus } = await Notifications.requestPermissionsAsync();
        if (newStatus !== 'granted') {
          console.log('Notification permissions not granted');
          return;
        }
      }

      let title = '';
      let body = '';
      
      switch (action) {
        case 'submitted':
          title = '� Tier Upgrade Submitted';
          body = `Your Tier ${tierLevel} upgrade request has been submitted and is being reviewed.`;
          break;
        case 'approved':
          title = '✅ KYC Approved!';
          body = `Congratulations! Your Tier ${tierLevel} verification has been approved. Enjoy higher limits!`;
          break;
        case 'rejected':
          title = '❌ KYC Review Required';
          body = `Your Tier ${tierLevel} document needs attention. Please upload a clearer image.`;
          break;
      }

      await Notifications.scheduleNotificationAsync({
        content: {
          title,
          body,
          sound: 'default',
          data: { tierLevel, action },
        },
        trigger: action === 'submitted' ? { seconds: 2 } : { seconds: 30 }, // Submitted immediate, approval/rejection after 30s for demo
      });
    } catch (error) {
      console.log('Notification scheduling failed (development mode):', error);
    }
  };

  const formatAmount = (amount: number) => {
    if (amount === -1) return 'Unlimited';
    if (amount >= 1000000) return `₦${(amount / 1000000).toFixed(1)}M`;
    if (amount >= 1000) return `₦${(amount / 1000).toFixed(0)}K`;
    return `₦${amount.toLocaleString()}`;
  };

  const pickDocument = async () => {
    // Prevent multiple rapid uploads
    if (isSubmitting) {
      Alert.alert('Please Wait', 'A document is currently being uploaded. Please wait for it to complete.');
      return;
    }

    // Show document type selection based on current tier
    const documentTypes = selectedTier === 2 
      ? [
          { label: 'Government ID (Front)', value: 'id_front' },
          { label: 'Government ID (Back)', value: 'id_back' }
        ]
      : selectedTier === 3
      ? [
          { label: 'Government ID (Front)', value: 'id_front' },
          { label: 'Government ID (Back)', value: 'id_back' },
          { label: 'Address Proof', value: 'address' }
        ]
      : [];

    if (documentTypes.length === 0) {
      Alert.alert('Info', 'No documents required for Tier 1.');
      return;
    }

    // For simplicity, we'll auto-select the next required document
    const nextRequiredType = documentTypes.find(type => 
      !isRequirementMet(type.value, selectedTier)
    );

    if (!nextRequiredType) {
      Alert.alert('Complete', 'All required documents have been uploaded for this tier.');
      return;
    }

    setIsSubmitting(true);

    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: 'images',
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
      });

      if (!result.canceled) {
        const newDoc: Document = {
          id: Date.now().toString(),
          name: nextRequiredType.label,
          uri: result.assets[0].uri,
          type: nextRequiredType.value as any,
          uploadProgress: 0,
        };

        setDocuments(prev => [...prev, newDoc]);
        
        // Update KYC data to mark this document as uploaded
        await updateKYCData({
          documentsUploaded: {
            ...kycData.documentsUploaded,
            [nextRequiredType.value]: true
          }
        });
        
        // Simulate upload progress
        const progressInterval = setInterval(() => {
          setDocuments(prev => prev.map(doc => 
            doc.id === newDoc.id 
              ? { ...doc, uploadProgress: Math.min(doc.uploadProgress + 20, 100) }
              : doc
          ));
        }, 200);

        setTimeout(async () => {
          clearInterval(progressInterval);
          setDocuments(prev => prev.map(doc => 
            doc.id === newDoc.id 
              ? { ...doc, uploadProgress: 100 }
              : doc
          ));
          
          // Show success feedback with tier progression info
          const currentDocCount = documents.length + 1;
          let upgradeMessage = '';
          
          if (currentDocCount >= 2 && selectedTier < 2) {
            upgradeMessage = '\n🎉 You can now access Tier 2 limits!';
          } else if (currentDocCount >= 3 && selectedTier < 3) {
            upgradeMessage = '\n🎉 You can now access Tier 3 limits!';
          }
          
          Alert.alert(
            '✅ Document Uploaded Successfully',
            `Your document has been uploaded and is being reviewed.${upgradeMessage}`,
            [{ text: 'Continue', style: 'default' }]
          );

          // Demo: Schedule approval notification after a delay
          setTimeout(() => {
            scheduleKYCNotification(selectedTier, 'approved');
          }, 10000); // 10 seconds for demo

          setIsSubmitting(false);
        }, 1000);
      } else {
        setIsSubmitting(false);
      }
    } catch (error) {
      console.error('Error picking document:', error);
      setIsSubmitting(false);
      Alert.alert('Error', 'Failed to upload document. Please try again.');
    }
  };

  const deleteDocument = (docId: string) => {
    // Check if the current tier has been submitted
    if (submittedTiers.has(selectedTier)) {
      Alert.alert(
        'Cannot Delete Document',
        'Documents cannot be deleted after tier submission. The documents are currently under review.',
        [{ text: 'OK', style: 'default' }]
      );
      return;
    }

    // Show confirmation for non-submitted documents
    Alert.alert(
      'Delete Document',
      'Are you sure you want to delete this document? This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Delete', 
          style: 'destructive',
          onPress: () => {
            setDocuments(prev => prev.filter(doc => doc.id !== docId));
          }
        }
      ]
    );
  };

  const previewDocument = (doc: Document) => {
    setSelectedDocument(doc);
    setPreviewVisible(true);
  };

  const closePreview = () => {
    setPreviewVisible(false);
    setSelectedDocument(null);
  };

  const getUpgradeButtonText = () => {
    if (isSubmitting) {
      return 'Processing...';
    }
    if (submittedTiers.has(selectedTier)) {
      return 'Already Submitted - Under Review';
    }
    
    const validation = validateTierUpgrade(selectedTier);
    if (!validation.canUpgrade) {
      if (validation.missingRequirements.length === 1) {
        return `Upload ${validation.missingRequirements[0]}`;
      } else {
        return `Complete ${validation.missingRequirements.length} Requirements`;
      }
    }
    
    if (selectedTier === 1) {
      return isTierCompleted(1) ? 'Upgrade to Tier 2' : 'Complete Tier 1';
    } else if (selectedTier === 2) {
      return isTierCompleted(2) ? 'Upgrade to Tier 3' : 'Complete Tier 2';
    } else {
      return isTierCompleted(3) ? 'Complete Tier 3 Verification' : 'Complete All Requirements';
    }
  };

  const canUpgrade = () => {
    if (isSubmitting || submittedTiers.has(selectedTier)) return false;
    
    // Simplified upgrade logic for better user experience
    if (selectedTier === 1) {
      // Tier 1 is always available (phone + basic info are pre-approved)
      return true;
    } else if (selectedTier === 2) {
      // Can upgrade to Tier 2 if we have at least some documents
      return documents.length >= 1;
    } else if (selectedTier === 3) {
      // Can upgrade to Tier 3 if we have sufficient documents
      return documents.length >= 2;
    }
    
    return false;
  };

  const unlockNextTier = async () => {
    if (!canUpgrade()) {
      return;
    }

    setIsSubmitting(true);

    Animated.sequence([
      Animated.timing(scaleAnim, {
        toValue: 0.95,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 100,
        useNativeDriver: true,
      })
    ]).start();

    Alert.alert(
      'Tier Upgrade',
      `Ready to unlock ${currentTier.name}?`,
      [
        { 
          text: 'Cancel', 
          style: 'cancel',
          onPress: () => setIsSubmitting(false)
        },
        { 
          text: 'Continue', 
          onPress: async () => {
            try {
              // Mark tier as submitted to prevent double submission
              setSubmittedTiers(prev => new Set(prev).add(selectedTier));
              
              // Schedule notification for submission
              await scheduleKYCNotification(selectedTier, 'submitted');
              
              // Show immediate success message
              Alert.alert('Success!', `Tier ${selectedTier} submitted successfully! You will be automatically upgraded in 2 seconds.`);
              
              // Simulate processing delay then auto-approve for demo (shorter delay for testing)
              setTimeout(async () => {
                try {
                  // Schedule approval notification
                  await scheduleKYCNotification(selectedTier, 'approved');
                  
                  // Automatically progress to next tier
                  await progressToNextTier(selectedTier);
                  
                } catch (error) {
                  console.error('Error with auto-progression:', error);
                  Alert.alert('Error', 'Auto-progression failed, but your tier was submitted successfully.');
                }
              }, 2000); // 2-second delay for faster testing
              
              // Navigate to processing
              navigation.navigate('KycProcessingScreen', {
                submissionData: { tierLevel: `tier${selectedTier}` }
              });
              
              setIsSubmitting(false);
            } catch (error) {
              console.error('Error submitting tier upgrade:', error);
              setIsSubmitting(false);
              // Remove from submitted tiers if there was an error
              setSubmittedTiers(prev => {
                const newSet = new Set(prev);
                newSet.delete(selectedTier);
                return newSet;
              });
              Alert.alert('Error', 'Failed to submit tier upgrade. Please try again.');
            }
          }
        }
      ]
    );
  };

  const pillTranslateX = pillAnim.interpolate({
    inputRange: [0, 1, 2],
    outputRange: [0, (width - 80) / 3, 2 * (width - 80) / 3],
  });

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <ChevronLeft size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>KYC & Limits</Text>
        <View style={{ width: 24 }} />
      </View>

      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardAvoidingView}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
      >
        <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Tier Progress Indicator */}
        <View style={styles.tierProgressIndicator}>
          <Text style={styles.progressIndicatorTitle}>Your KYC Journey</Text>
          <View style={styles.progressSteps}>
            {tierData.map((tier, index) => {
              const isCompleted = currentUserTier > tier.id;
              const isCurrent = currentUserTier === tier.id;
              
              return (
                <View key={tier.id} style={styles.progressStep}>
                  <View style={[
                    styles.progressStepCircle,
                    isCurrent && styles.progressStepCurrent,
                    isCompleted && styles.progressStepCompleted
                  ]}>
                    {isCompleted ? (
                      <CheckCircle size={16} color="#fff" />
                    ) : (
                      <Text style={[
                        styles.progressStepNumber,
                        (isCurrent || isCompleted) && styles.progressStepNumberCompleted
                      ]}>
                        {tier.id}
                      </Text>
                    )}
                  </View>
                  <Text style={styles.progressStepLabel}>{tier.name}</Text>
                  {index < tierData.length - 1 && (
                    <View style={[
                      styles.progressConnector,
                      (isCurrent || isCompleted) && styles.progressConnectorActive
                    ]} />
                  )}
                </View>
              );
            })}
          </View>
        </View>

        {/* KYC Status Summary */}
        <View style={styles.statusSummary}>
          <Text style={styles.statusTitle}>Your KYC Status</Text>
          <View style={styles.statusGrid}>
            <View style={styles.statusItem}>
              <View style={[styles.statusIcon, { backgroundColor: currentUserTier >= 1 ? colors.seaGreen : colors.muted }]}>
                {currentUserTier >= 1 ? <CheckCircle size={16} color="#fff" /> : <Text style={styles.statusNumber}>1</Text>}
              </View>
              <Text style={styles.statusLabel}>Tier 1 {currentUserTier >= 1 ? 'Complete' : 'Pending'}</Text>
            </View>
            <View style={styles.statusItem}>
              <View style={[styles.statusIcon, { backgroundColor: currentUserTier >= 2 ? colors.seaGreen : colors.muted }]}>
                {currentUserTier >= 2 ? <CheckCircle size={16} color="#fff" /> : <Text style={styles.statusNumber}>2</Text>}
              </View>
              <Text style={styles.statusLabel}>Tier 2 {currentUserTier >= 2 ? 'Complete' : 'Pending'}</Text>
            </View>
            <View style={styles.statusItem}>
              <View style={[styles.statusIcon, { backgroundColor: currentUserTier >= 3 ? colors.seaGreen : colors.muted }]}>
                {currentUserTier >= 3 ? <CheckCircle size={16} color="#fff" /> : <Text style={styles.statusNumber}>3</Text>}
              </View>
              <Text style={styles.statusLabel}>Tier 3 {currentUserTier >= 3 ? 'Complete' : 'Pending'}</Text>
            </View>
          </View>
          <Text style={styles.statusDescription}>
            Current Tier: {currentUserTier} • Next Goal: {currentUserTier === 3 ? 'All tiers complete!' : `Tier ${currentUserTier + 1}`}
          </Text>
        </View>

        {/* Hero Tier Selector */}
        <View style={styles.tierSelectorContainer}>
          <View style={styles.tierSelector}>
            <Animated.View 
              style={[
                styles.activePill,
                { transform: [{ translateX: pillTranslateX }] }
              ]} 
            />
            {tierData.map((tier) => (
              <TouchableOpacity
                key={tier.id}
                style={styles.tierPill}
                onPress={() => setSelectedTier(tier.id)}
              >
                <Text 
                  style={[
                    styles.tierPillText,
                    selectedTier === tier.id && styles.tierPillTextActive
                  ]}
                >
                  {tier.name}
                </Text>
                {tier.status === 'current' && (
                  <View style={styles.currentBadge}>
                    <Text style={styles.currentBadgeText}>Current</Text>
                  </View>
                )}
                {tier.status === 'locked' && (
                  <View style={styles.lockedBadge}>
                    <Text style={styles.lockedBadgeText}>Locked</Text>
                  </View>
                )}
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Tier Snapshot Card */}
        <Animated.View style={[styles.snapshotCard, { transform: [{ scale: scaleAnim }] }]}>
          <View style={styles.progressSection}>
            <View style={styles.progressRing}>
              <Animated.View
                style={[
                  styles.progressFill,
                  {
                    transform: [{
                      rotate: progressAnim.interpolate({
                        inputRange: [0, 1],
                        outputRange: ['0deg', '360deg'],
                      })
                    }]
                  }
                ]}
              />
              <View style={styles.progressCenter}>
                <Text style={styles.progressPercentage}>
                  {Math.round(completionPercentage)}%
                </Text>
                <Text style={styles.progressLabel}>Complete</Text>
              </View>
            </View>
          </View>

          <View style={styles.limitsGrid}>
            <View style={styles.limitItem}>
              <ArrowUp size={16} color={colors.seaGreen} />
              <Text style={styles.limitLabel}>Daily Send</Text>
              <Text style={styles.limitValue}>{formatAmount(currentTier.dailySend)}</Text>
            </View>
            <View style={styles.limitItem}>
              <ArrowDown size={16} color={colors.seaGreen} />
              <Text style={styles.limitLabel}>Daily Receive</Text>
              <Text style={styles.limitValue}>{formatAmount(currentTier.dailyReceive)}</Text>
            </View>
            <View style={styles.limitItem}>
              <Wallet size={16} color={colors.seaGreen} />
              <Text style={styles.limitLabel}>Wallet Cap</Text>
              <Text style={styles.limitValue}>{formatAmount(currentTier.walletCap)}</Text>
            </View>
            <View style={styles.limitItem}>
              <CreditCard size={16} color={colors.seaGreen} />
              <Text style={styles.limitLabel}>Virtual Cards</Text>
              <Text style={styles.limitValue}>{currentTier.virtualCards}</Text>
            </View>
          </View>
        </Animated.View>

        {/* Requirements Checklist */}
        <View style={styles.requirementsCard}>
          <Text style={styles.sectionTitle}>Requirements</Text>
          {currentTier.requirements.map((req) => {
            const IconComponent = req.icon;
            return (
              <View key={req.id} style={styles.requirementRow}>
                <IconComponent size={20} color={colors.muted} />
                <Text style={styles.requirementLabel}>{req.label}</Text>
                <View style={[
                  styles.statusChip,
                  req.status === 'approved' && styles.statusApproved,
                  req.status === 'rejected' && styles.statusRejected,
                ]}>
                  <Text style={[
                    styles.statusText,
                    req.status === 'approved' && styles.statusTextApproved,
                    req.status === 'rejected' && styles.statusTextRejected,
                  ]}>
                    {req.status === 'approved' ? 'Approved' : 
                     req.status === 'rejected' ? 'Rejected' : 'Pending'}
                  </Text>
                </View>
              </View>
            );
          })}
        </View>

        {/* Document Upload Strip */}
        <View style={styles.documentCard}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Documents</Text>
            {submittedTiers.has(selectedTier) && (
              <View style={styles.protectionBadge}>
                <Shield size={14} color={colors.seaGreen} />
                <Text style={styles.protectionBadgeText}>Protected</Text>
              </View>
            )}
          </View>
          
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.documentStrip}>
            <TouchableOpacity 
              style={[
                styles.uploadButton,
                isSubmitting && styles.uploadButtonDisabled
              ]} 
              onPress={pickDocument}
              disabled={isSubmitting}
            >
              <Upload size={24} color={isSubmitting ? colors.muted : colors.seaGreen} />
              <Text style={[
                styles.uploadButtonText,
                isSubmitting && styles.uploadButtonTextDisabled
              ]}>
                {isSubmitting ? 'Uploading...' : 'Upload'}
              </Text>
            </TouchableOpacity>
            
            {documents.map((doc) => (
              <View key={doc.id} style={styles.documentThumbnail}>
                <Image source={{ uri: doc.uri }} style={styles.thumbnailImage} />
                {doc.uploadProgress < 100 && (
                  <View style={styles.uploadOverlay}>
                    <View style={[styles.uploadProgressBar, { width: `${doc.uploadProgress}%` }]} />
                  </View>
                )}
                <View style={styles.thumbnailActions}>
                  <TouchableOpacity 
                    style={styles.thumbnailAction}
                    onPress={() => previewDocument(doc)}
                  >
                    <Eye size={12} color={colors.canvas} />
                  </TouchableOpacity>
                  <TouchableOpacity 
                    style={[
                      styles.thumbnailAction,
                      submittedTiers.has(selectedTier) && styles.thumbnailActionDisabled
                    ]}
                    onPress={() => deleteDocument(doc.id)}
                    disabled={submittedTiers.has(selectedTier)}
                  >
                    <Trash2 
                      size={12} 
                      color={submittedTiers.has(selectedTier) ? colors.muted : colors.coral} 
                    />
                  </TouchableOpacity>
                </View>
              </View>
            ))}
          </ScrollView>
        </View>

        {/* Spacer for sticky button */}
        <View style={{ height: 120 }} />

        {/* Demo Section - Remove in production */}
        <View style={styles.demoSection}>
          <Text style={styles.demoTitle}>🧪 Development Testing</Text>
          <TouchableOpacity 
            style={styles.demoButton}
            onPress={() => {
              Alert.alert(
                'Demo Auto-Progression',
                `This will immediately progress from Tier ${selectedTier} to Tier ${selectedTier + 1}`,
                [
                  { text: 'Cancel', style: 'cancel' },
                  { 
                    text: 'Test Progression', 
                    onPress: async () => {
                      try {
                        Alert.alert('Demo Started', 'Tier progression will happen in 1 second...');
                        await scheduleKYCNotification(selectedTier, 'approved');
                        setTimeout(async () => {
                          await progressToNextTier(selectedTier);
                        }, 1000);
                      } catch (error) {
                        console.error('Demo progression error:', error);
                        Alert.alert('Demo Error', 'Failed to test progression.');
                      }
                    }
                  }
                ]
              );
            }}
          >
            <Text style={styles.demoButtonText}>Test Auto-Progression</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
      </KeyboardAvoidingView>

      {/* Action Row (Sticky) */}
      <View style={styles.actionRow}>
        <TouchableOpacity 
          style={[
            styles.unlockButton,
            !canUpgrade() && styles.unlockButtonDisabled
          ]}
          onPress={unlockNextTier}
          disabled={!canUpgrade()}
        >
          <Text style={[
            styles.unlockButtonText,
            !canUpgrade() && styles.unlockButtonTextDisabled
          ]}>
            {getUpgradeButtonText()}
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.supportButton}>
          <MessageCircle size={16} color={colors.seaGreen} />
          <Text style={styles.supportButtonText}>Contact Support</Text>
        </TouchableOpacity>
      </View>

      {/* Document Preview Modal */}
      <Modal
        visible={previewVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={closePreview}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.previewContainer}>
            <View style={styles.previewHeader}>
              <Text style={styles.previewTitle}>
                {selectedDocument?.name || 'Document Preview'}
              </Text>
              <TouchableOpacity 
                style={styles.closeButton}
                onPress={closePreview}
              >
                <X size={16} color="#fff" />
              </TouchableOpacity>
            </View>
            
            <View style={styles.previewContent}>
              {selectedDocument ? (
                <>
                  <Image 
                    source={{ uri: selectedDocument.uri }}
                    style={styles.previewImage}
                    resizeMode="contain"
                    onError={() => {
                      Alert.alert('Error', 'Failed to load document image');
                      closePreview();
                    }}
                  />
                  <Text style={styles.documentInfo}>
                    Type: {selectedDocument.type} • Uploaded: {new Date(selectedDocument.uploadProgress || Date.now()).toLocaleDateString()}
                  </Text>
                </>
              ) : (
                <Text style={styles.noDocumentText}>No document selected</Text>
              )}
            </View>
            
            <View style={styles.previewFooter}>
              <TouchableOpacity 
                style={styles.previewButton}
                onPress={closePreview}
              >
                <Text style={styles.previewButtonText}>Close</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.canvas,
  },
  keyboardAvoidingView: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
  },
  scrollView: {
    flex: 1,
  },
  tierSelectorContainer: {
    paddingHorizontal: 20,
    paddingTop: 24,
  },
  tierSelector: {
    flexDirection: 'row',
    backgroundColor: globalColors.background,
    borderRadius: 12,
    padding: 4,
    position: 'relative',
  },
  activePill: {
    position: 'absolute',
    top: 4,
    left: 4,
    width: (width - 80) / 3,
    height: 40,
    backgroundColor: colors.seaGreen,
    borderRadius: 8,
  },
  tierPill: {
    flex: 1,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  tierPillText: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.textLight,
  },
  tierPillTextActive: {
    color: colors.canvas,
  },
  currentBadge: {
    position: 'absolute',
    top: -8,
    right: 8,
    backgroundColor: colors.seaGreen,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
  },
  currentBadgeText: {
    fontSize: 8,
    fontWeight: '600',
    color: colors.canvas,
  },
  lockedBadge: {
    position: 'absolute',
    top: -8,
    right: 8,
    backgroundColor: colors.coral,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
  },
  lockedBadgeText: {
    fontSize: 8,
    fontWeight: '600',
    color: colors.canvas,
  },
  snapshotCard: {
    backgroundColor: colors.canvas,
    marginHorizontal: 20,
    marginTop: 24,
    padding: 24,
    borderRadius: 12,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 8,
    elevation: 2,
  },
  progressSection: {
    alignItems: 'center',
    marginBottom: 24,
  },
  progressRing: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 8,
    borderColor: '#F0F0F0',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
    overflow: 'hidden',
  },
  progressFill: {
    position: 'absolute',
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 8,
    borderColor: colors.seaGreen,
    borderTopColor: 'transparent',
    borderRightColor: 'transparent',
  },
  progressCenter: {
    alignItems: 'center',
  },
  progressPercentage: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.seaGreen,
  },
  progressLabel: {
    fontSize: 12,
    color: colors.muted,
    marginTop: 2,
  },
  limitsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  limitItem: {
    width: '48%',
    alignItems: 'center',
    marginBottom: 16,
  },
  limitLabel: {
    fontSize: 12,
    color: colors.muted,
    marginTop: 4,
    marginBottom: 2,
  },
  limitValue: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
  },
  requirementsCard: {
    backgroundColor: colors.canvas,
    marginHorizontal: 20,
    marginTop: 16,
    padding: 20,
    borderRadius: 12,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 8,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  protectionBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.mint,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  protectionBadgeText: {
    fontSize: 12,
    fontWeight: '500',
    color: colors.seaGreen,
    marginLeft: 4,
  },
  requirementRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  requirementLabel: {
    flex: 1,
    fontSize: 14,
    color: colors.text,
    marginLeft: 12,
  },
  statusChip: {
    backgroundColor: globalColors.background,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusApproved: {
    backgroundColor: colors.mint,
  },
  statusRejected: {
    backgroundColor: '#FFE5E5',
  },
  statusText: {
    fontSize: 12,
    fontWeight: '500',
    color: colors.muted,
  },
  statusTextApproved: {
    color: colors.seaGreen,
  },
  statusTextRejected: {
    color: colors.coral,
  },
  documentCard: {
    backgroundColor: colors.canvas,
    marginHorizontal: 20,
    marginTop: 16,
    padding: 20,
    borderRadius: 12,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 8,
    elevation: 2,
  },
  documentStrip: {
    marginTop: 12,
  },
  uploadButton: {
    width: 80,
    height: 80,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: colors.seaGreen,
    borderStyle: 'dashed',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  uploadButtonDisabled: {
    borderColor: colors.muted,
    opacity: 0.6,
  },
  uploadButtonText: {
    fontSize: 12,
    color: colors.seaGreen,
    fontWeight: '500',
    marginTop: 4,
  },
  uploadButtonTextDisabled: {
    color: colors.muted,
  },
  documentThumbnail: {
    width: 80,
    height: 80,
    borderRadius: 8,
    marginRight: 12,
    position: 'relative',
  },
  thumbnailImage: {
    width: 80,
    height: 80,
    borderRadius: 8,
  },
  uploadOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 4,
    backgroundColor: globalColors.background,
    borderBottomLeftRadius: 8,
    borderBottomRightRadius: 8,
  },
  uploadProgressBar: {
    height: 4,
    backgroundColor: colors.seaGreen,
    borderBottomLeftRadius: 8,
    borderBottomRightRadius: 8,
  },
  thumbnailActions: {
    position: 'absolute',
    top: 4,
    right: 4,
    flexDirection: 'row',
  },
  thumbnailAction: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 4,
  },
  thumbnailActionDisabled: {
    backgroundColor: 'rgba(0,0,0,0.3)',
    opacity: 0.5,
  },
  actionRow: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: colors.canvas,
    paddingHorizontal: 20,
    paddingVertical: 16,
    paddingBottom: 32,
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 1,
    shadowRadius: 8,
    elevation: 8,
  },
  unlockButton: {
    backgroundColor: colors.seaGreen,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 12,
  },
  unlockButtonDisabled: {
    backgroundColor: colors.muted,
  },
  unlockButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.canvas,
  },
  unlockButtonTextDisabled: {
    color: colors.canvas,
  },
  supportButton: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  supportButtonText: {
    fontSize: 14,
    color: colors.seaGreen,
    marginLeft: 8,
    fontWeight: '500',
  },
  tierProgressIndicator: {
    backgroundColor: colors.canvas,
    marginHorizontal: 20,
    marginTop: 16,
    padding: 20,
    borderRadius: 12,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 8,
    elevation: 2,
  },
  progressIndicatorTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 16,
    textAlign: 'center',
  },
  progressSteps: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    position: 'relative',
  },
  progressStep: {
    alignItems: 'center',
    flex: 1,
  },
  progressStepCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: globalColors.background,
    borderWidth: 2,
    borderColor: colors.muted,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  progressStepCurrent: {
    borderColor: colors.seaGreen,
    backgroundColor: colors.mint,
  },
  progressStepCompleted: {
    backgroundColor: colors.seaGreen,
    borderColor: colors.seaGreen,
  },
  progressStepNumber: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.muted,
  },
  progressStepNumberCompleted: {
    color: colors.canvas,
  },
  progressStepLabel: {
    fontSize: 12,
    color: colors.muted,
    textAlign: 'center',
  },
  progressConnector: {
    position: 'absolute',
    top: 20,
    left: '60%',
    right: '-60%',
    height: 2,
    backgroundColor: globalColors.background,
    zIndex: -1,
  },
  progressConnectorActive: {
    backgroundColor: colors.seaGreen,
  },
  demoSection: {
    marginHorizontal: 20,
    marginVertical: 16,
    padding: 16,
    backgroundColor: '#FFF9E6',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#FFE066',
  },
  demoTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#B8860B',
    marginBottom: 12,
    textAlign: 'center',
  },
  demoButton: {
    backgroundColor: '#FFE066',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    alignItems: 'center',
  },
  demoButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#B8860B',
  },
  statusSummary: {
    marginHorizontal: 20,
    marginBottom: 20,
    padding: 20,
    backgroundColor: globalColors.background,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E8E8E8',
  },
  statusTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 16,
    textAlign: 'center',
  },
  statusGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  statusItem: {
    alignItems: 'center',
    flex: 1,
  },
  statusIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  statusNumber: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
  statusLabel: {
    fontSize: 12,
    fontWeight: '500',
    color: colors.textLight,
    textAlign: 'center',
  },
  statusDescription: {
    fontSize: 14,
    color: colors.textLight,
    textAlign: 'center',
    fontStyle: 'italic',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  previewContainer: {
    width: width * 0.9,
    height: '80%',
    backgroundColor: '#fff',
    borderRadius: 16,
    overflow: 'hidden',
  },
  previewHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#E8E8E8',
    backgroundColor: globalColors.background,
  },
  previewTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
    flex: 1,
  },
  closeButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.coral,
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  previewContent: {
    flex: 1,
    padding: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  previewImage: {
    width: '100%',
    height: '85%',
    borderRadius: 8,
  },
  documentInfo: {
    fontSize: 12,
    color: colors.textLight,
    textAlign: 'center',
    marginTop: 12,
    paddingHorizontal: 16,
  },
  noDocumentText: {
    fontSize: 16,
    color: colors.textLight,
    textAlign: 'center',
  },
  previewFooter: {
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: '#E8E8E8',
    backgroundColor: globalColors.background,
  },
  previewButton: {
    backgroundColor: colors.seaGreen,
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    alignItems: 'center',
  },
  previewButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default TierDashboard;
