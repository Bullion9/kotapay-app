import AsyncStorage from '@react-native-async-storage/async-storage';
import { StackNavigationProp } from '@react-navigation/stack';
import {
    AlertTriangle,
    ChevronLeft,
    Clock,
    Info,
    Lock,
    Shield,
    Unlock,
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
  background: globalColors.background, // Use app's background color
  border: '#E5E7EB',
  warning: '#F59E0B',
  success: '#10B981',
};

interface FreezeStatus {
  isFrozen: boolean;
  freezeDate?: string;
  freezeReason?: string;
  scheduledUnfreeze?: string;
  freezeType: 'temporary' | 'permanent' | 'none';
}

interface FreezeAccountScreenProps {
  navigation: StackNavigationProp<ProfileParamList, 'FreezeAccount'>;
}

const FreezeAccountScreen: React.FC<FreezeAccountScreenProps> = ({ navigation }) => {
  const [freezeStatus, setFreezeStatus] = useState<FreezeStatus>({
    isFrozen: false,
    freezeType: 'none',
  });
  const [isConfirmModalVisible, setIsConfirmModalVisible] = useState(false);
  const [freezeReason, setFreezeReason] = useState('');
  const [freezeDuration, setFreezeDuration] = useState('7'); // days
  const [selectedFreezeType, setSelectedFreezeType] = useState<'temporary' | 'permanent'>('temporary');

  useEffect(() => {
    loadFreezeStatus();
  }, []);

  const loadFreezeStatus = async () => {
    try {
      const savedStatus = await AsyncStorage.getItem('freezeStatus');
      if (savedStatus) {
        setFreezeStatus(JSON.parse(savedStatus));
      }
    } catch (error) {
      console.error('Error loading freeze status:', error);
    }
  };

  const saveFreezeStatus = async (status: FreezeStatus) => {
    try {
      await AsyncStorage.setItem('freezeStatus', JSON.stringify(status));
      setFreezeStatus(status);
    } catch (error) {
      console.error('Error saving freeze status:', error);
      Alert.alert('Error', 'Failed to update account status');
    }
  };

  const freezeAccount = () => {
    if (!freezeReason.trim()) {
      Alert.alert('Error', 'Please provide a reason for freezing your account');
      return;
    }

    const freezeDate = new Date().toISOString();
    let scheduledUnfreeze;

    if (selectedFreezeType === 'temporary') {
      const unfreezeDate = new Date();
      unfreezeDate.setDate(unfreezeDate.getDate() + parseInt(freezeDuration));
      scheduledUnfreeze = unfreezeDate.toISOString();
    }

    const newStatus: FreezeStatus = {
      isFrozen: true,
      freezeDate,
      freezeReason: freezeReason.trim(),
      scheduledUnfreeze,
      freezeType: selectedFreezeType,
    };

    saveFreezeStatus(newStatus);
    setIsConfirmModalVisible(false);
    setFreezeReason('');

    Alert.alert(
      'Account Frozen',
      `Your account has been ${selectedFreezeType === 'temporary' ? 'temporarily' : 'permanently'} frozen. You will receive a confirmation email shortly.`,
      [{ text: 'OK', style: 'default' }]
    );
  };

  const unfreezeAccount = () => {
    Alert.alert(
      'Unfreeze Account',
      'Are you sure you want to unfreeze your account? This will restore full access to all features.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Unfreeze',
          style: 'default',
          onPress: () => {
            const newStatus: FreezeStatus = {
              isFrozen: false,
              freezeType: 'none',
            };
            saveFreezeStatus(newStatus);
            Alert.alert('Success', 'Your account has been unfrozen successfully');
          },
        },
      ]
    );
  };

  const requestUnfreeze = () => {
    Alert.alert(
      'Request Account Unfreeze',
      'Your unfreeze request has been submitted. Our support team will review it within 24-48 hours and contact you via email.',
      [{ text: 'OK', style: 'default' }]
    );
  };

  const showFreezeOptions = () => {
    setIsConfirmModalVisible(true);
  };

  const renderFreezeTypeOption = (
    type: 'temporary' | 'permanent',
    title: string,
    description: string,
    icon: React.ReactNode
  ) => (
    <TouchableOpacity
      style={[
        styles.freezeTypeOption,
        selectedFreezeType === type && styles.freezeTypeOptionSelected,
      ]}
      onPress={() => setSelectedFreezeType(type)}
    >
      <View style={styles.freezeTypeIcon}>
        {icon}
      </View>
      <View style={styles.freezeTypeContent}>
        <Text style={[
          styles.freezeTypeTitle,
          selectedFreezeType === type && styles.freezeTypeTextSelected,
        ]}>
          {title}
        </Text>
        <Text style={[
          styles.freezeTypeDescription,
          selectedFreezeType === type && styles.freezeTypeDescriptionSelected,
        ]}>
          {description}
        </Text>
      </View>
      <View style={[
        styles.radioButton,
        selectedFreezeType === type && styles.radioButtonSelected,
      ]}>
        {selectedFreezeType === type && (
          <View style={styles.radioButtonInner} />
        )}
      </View>
    </TouchableOpacity>
  );

  const renderInfoCard = (
    icon: React.ReactNode,
    title: string,
    description: string,
    color: string
  ) => (
    <View style={[styles.infoCard, { borderLeftColor: color }]}>
      <View style={[styles.infoCardIcon, { backgroundColor: color + '20' }]}>
        {icon}
      </View>
      <View style={styles.infoCardContent}>
        <Text style={styles.infoCardTitle}>{title}</Text>
        <Text style={styles.infoCardDescription}>{description}</Text>
      </View>
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
        <Text style={styles.headerTitle}>Account Security</Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Current Status */}
        <View style={styles.statusCard}>
          <View style={styles.statusHeader}>
            <View style={[
              styles.statusIcon,
              { backgroundColor: freezeStatus.isFrozen ? colors.coral + '20' : colors.success + '20' }
            ]}>
              {freezeStatus.isFrozen ? (
                <Lock size={24} color={colors.coral} />
              ) : (
                <Unlock size={24} color={colors.success} />
              )}
            </View>
            <View style={styles.statusContent}>
              <Text style={styles.statusTitle}>
                Account Status: {freezeStatus.isFrozen ? 'Frozen' : 'Active'}
              </Text>
              <Text style={styles.statusSubtitle}>
                {freezeStatus.isFrozen
                  ? 'Your account is currently frozen'
                  : 'Your account is active and fully functional'
                }
              </Text>
            </View>
          </View>

          {freezeStatus.isFrozen && (
            <View style={styles.freezeDetails}>
              <View style={styles.freezeDetailRow}>
                <Text style={styles.freezeDetailLabel}>Frozen On:</Text>
                <Text style={styles.freezeDetailValue}>
                  {freezeStatus.freezeDate 
                    ? new Date(freezeStatus.freezeDate).toLocaleDateString()
                    : 'Unknown'
                  }
                </Text>
              </View>
              
              {freezeStatus.freezeReason && (
                <View style={styles.freezeDetailRow}>
                  <Text style={styles.freezeDetailLabel}>Reason:</Text>
                  <Text style={styles.freezeDetailValue}>{freezeStatus.freezeReason}</Text>
                </View>
              )}
              
              <View style={styles.freezeDetailRow}>
                <Text style={styles.freezeDetailLabel}>Type:</Text>
                <Text style={styles.freezeDetailValue}>
                  {freezeStatus.freezeType === 'temporary' ? 'Temporary' : 'Permanent'}
                </Text>
              </View>

              {freezeStatus.scheduledUnfreeze && (
                <View style={styles.freezeDetailRow}>
                  <Text style={styles.freezeDetailLabel}>Auto-Unfreeze:</Text>
                  <Text style={styles.freezeDetailValue}>
                    {new Date(freezeStatus.scheduledUnfreeze).toLocaleDateString()}
                  </Text>
                </View>
              )}
            </View>
          )}
        </View>

        {/* Information Cards */}
        <View style={styles.infoSection}>
          {renderInfoCard(
            <Shield size={20} color={colors.seaGreen} />,
            'Enhanced Security',
            'Freezing your account provides an additional layer of security against unauthorized access.',
            colors.seaGreen
          )}
          
          {renderInfoCard(
            <Clock size={20} color={colors.warning} />,
            'Temporary Freeze',
            'Set a specific duration for the freeze. Your account will automatically unfreeze after the period.',
            colors.warning
          )}
          
          {renderInfoCard(
            <AlertTriangle size={20} color={colors.coral} />,
            'Permanent Freeze',
            'Requires manual intervention to unfreeze. Contact support when you want to reactivate.',
            colors.coral
          )}
        </View>

        {/* Action Buttons */}
        <View style={styles.actionSection}>
          {!freezeStatus.isFrozen ? (
            <TouchableOpacity 
              style={styles.freezeButton}
              onPress={showFreezeOptions}
            >
              <Lock size={20} color={colors.canvas} />
              <Text style={styles.freezeButtonText}>Freeze Account</Text>
            </TouchableOpacity>
          ) : (
            <View style={styles.unfreezeActions}>
              {freezeStatus.freezeType === 'temporary' ? (
                <TouchableOpacity 
                  style={styles.unfreezeButton}
                  onPress={unfreezeAccount}
                >
                  <Unlock size={20} color={colors.canvas} />
                  <Text style={styles.unfreezeButtonText}>Unfreeze Now</Text>
                </TouchableOpacity>
              ) : (
                <TouchableOpacity 
                  style={styles.requestButton}
                  onPress={requestUnfreeze}
                >
                  <Info size={20} color={colors.canvas} />
                  <Text style={styles.requestButtonText}>Request Unfreeze</Text>
                </TouchableOpacity>
              )}
            </View>
          )}
        </View>

        <View style={styles.bottomSpacing} />
      </ScrollView>

      {/* Freeze Confirmation Modal */}
      <Modal
        visible={isConfirmModalVisible}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setIsConfirmModalVisible(false)}
      >
        <KeyboardAvoidingView 
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.modalOverlay}
        >
          <View style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Freeze Account</Text>
              <TouchableOpacity 
                style={styles.modalCloseButton}
                onPress={() => setIsConfirmModalVisible(false)}
              >
                <X size={24} color={colors.text} />
              </TouchableOpacity>
            </View>
            
            <ScrollView style={styles.modalContent}>
              {/* Freeze Type Selection */}
              <Text style={styles.sectionTitle}>Select Freeze Type</Text>
              
              {renderFreezeTypeOption(
                'temporary',
                'Temporary Freeze',
                'Automatically unfreeze after a set period',
                <Clock size={20} color={selectedFreezeType === 'temporary' ? colors.canvas : colors.warning} />
              )}
              
              {renderFreezeTypeOption(
                'permanent',
                'Permanent Freeze',
                'Requires manual intervention to unfreeze',
                <Lock size={20} color={selectedFreezeType === 'permanent' ? colors.canvas : colors.coral} />
              )}

              {/* Duration Input for Temporary Freeze */}
              {selectedFreezeType === 'temporary' && (
                <View style={styles.durationSection}>
                  <Text style={styles.inputLabel}>Freeze Duration (Days)</Text>
                  <TextInput
                    style={styles.durationInput}
                    value={freezeDuration}
                    onChangeText={setFreezeDuration}
                    keyboardType="numeric"
                    placeholder="Enter number of days"
                  />
                </View>
              )}

              {/* Reason Input */}
              <View style={styles.reasonSection}>
                <Text style={styles.inputLabel}>Reason for Freezing *</Text>
                <TextInput
                  style={styles.reasonInput}
                  value={freezeReason}
                  onChangeText={setFreezeReason}
                  placeholder="Please provide a reason for freezing your account"
                  multiline
                  numberOfLines={3}
                />
              </View>

              {/* Warning */}
              <View style={styles.warningCard}>
                <AlertTriangle size={20} color={colors.coral} />
                <Text style={styles.warningText}>
                  Warning: Freezing your account will temporarily disable all transactions, 
                  transfers, and account access until unfrozen.
                </Text>
              </View>

              {/* Confirm Button */}
              <TouchableOpacity 
                style={styles.confirmButton}
                onPress={freezeAccount}
              >
                <Lock size={20} color={colors.canvas} />
                <Text style={styles.confirmButtonText}>Confirm Freeze</Text>
              </TouchableOpacity>
            </ScrollView>
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
  statusCard: {
    backgroundColor: colors.canvas,
    margin: 16,
    padding: 20,
    borderRadius: 16,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  statusHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  statusContent: {
    flex: 1,
  },
  statusTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 4,
  },
  statusSubtitle: {
    fontSize: 14,
    color: colors.textLight,
  },
  freezeDetails: {
    marginTop: 20,
    paddingTop: 20,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  freezeDetailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  freezeDetailLabel: {
    fontSize: 14,
    color: colors.textLight,
    fontWeight: '500',
  },
  freezeDetailValue: {
    fontSize: 14,
    color: colors.text,
    fontWeight: '500',
  },
  infoSection: {
    paddingHorizontal: 16,
  },
  infoCard: {
    flexDirection: 'row',
    backgroundColor: colors.canvas,
    padding: 16,
    marginBottom: 12,
    borderRadius: 12,
    borderLeftWidth: 4,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  infoCardIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  infoCardContent: {
    flex: 1,
  },
  infoCardTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 4,
  },
  infoCardDescription: {
    fontSize: 12,
    color: colors.textLight,
    lineHeight: 16,
  },
  actionSection: {
    paddingHorizontal: 16,
    marginTop: 8,
  },
  freezeButton: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.coral,
    paddingVertical: 16,
    borderRadius: 12,
  },
  freezeButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.canvas,
    marginLeft: 8,
  },
  unfreezeActions: {
    gap: 12,
  },
  unfreezeButton: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.success,
    paddingVertical: 16,
    borderRadius: 12,
  },
  unfreezeButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.canvas,
    marginLeft: 8,
  },
  requestButton: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.seaGreen,
    paddingVertical: 16,
    borderRadius: 12,
  },
  requestButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.canvas,
    marginLeft: 8,
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
    maxHeight: '90%',
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
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 16,
  },
  freezeTypeOption: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  freezeTypeOptionSelected: {
    borderColor: colors.seaGreen,
    backgroundColor: colors.mint + '20',
  },
  freezeTypeIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.background,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  freezeTypeContent: {
    flex: 1,
  },
  freezeTypeTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 4,
  },
  freezeTypeTextSelected: {
    color: colors.seaGreen,
  },
  freezeTypeDescription: {
    fontSize: 14,
    color: colors.textLight,
  },
  freezeTypeDescriptionSelected: {
    color: colors.seaGreen,
  },
  radioButton: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: colors.border,
    justifyContent: 'center',
    alignItems: 'center',
  },
  radioButtonSelected: {
    borderColor: colors.seaGreen,
  },
  radioButtonInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: colors.seaGreen,
  },
  durationSection: {
    marginTop: 20,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.text,
    marginBottom: 8,
  },
  durationInput: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: colors.text,
    backgroundColor: colors.background,
  },
  reasonSection: {
    marginTop: 20,
  },
  reasonInput: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: colors.text,
    backgroundColor: colors.background,
    textAlignVertical: 'top',
    minHeight: 80,
  },
  warningCard: {
    flexDirection: 'row',
    backgroundColor: colors.coral + '10',
    padding: 16,
    marginTop: 20,
    borderRadius: 12,
    borderLeftWidth: 4,
    borderLeftColor: colors.coral,
  },
  warningText: {
    fontSize: 14,
    color: colors.coral,
    marginLeft: 12,
    lineHeight: 20,
    flex: 1,
  },
  confirmButton: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.coral,
    paddingVertical: 16,
    borderRadius: 12,
    marginTop: 24,
  },
  confirmButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.canvas,
    marginLeft: 8,
  },
  bottomSpacing: {
    height: 32,
  },
});

export default FreezeAccountScreen;
