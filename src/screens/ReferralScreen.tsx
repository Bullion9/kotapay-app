import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  Alert,
  StatusBar,
  Clipboard,
  Modal,
} from 'react-native';
import { StackNavigationProp } from '@react-navigation/stack';
import { ProfileParamList } from '../types';
import { useAuth } from '../contexts/AuthContext';
import {
  X,
  Info,
  ChevronLeft,
  Gift,
  Copy,
  Users,
  User,
} from 'lucide-react-native';
import { colors, spacing, borderRadius, shadows, globalStyles } from '../theme';

interface ReferralScreenProps {
  navigation: StackNavigationProp<ProfileParamList, 'ReferralProgram'>;
}

const ReferralScreen: React.FC<ReferralScreenProps> = ({ navigation }) => {
  const { user } = useAuth();
  const [showHowItWorksModal, setShowHowItWorksModal] = useState(false);

  // Simple user data
  const [userData] = useState({
    name: user?.name || 'John Doe',
    email: user?.email || 'john.doe@email.com',
    phone: user?.phone || '+234 123 456 7890',
    referralCode: 'JOHN2024',
  });

  // Referral data
  const [referralData] = useState({
    totalReferrals: 12,
    totalEarnings: 15000,
    referrals: [
      { id: '1', name: 'John Doe', date: '2024-12-15', reward: 1000, status: 'completed' },
      { id: '2', name: 'Jane Smith', date: '2024-12-10', reward: 1000, status: 'completed' },
      { id: '3', name: 'Mike Johnson', date: '2024-12-08', reward: 1000, status: 'pending' },
      { id: '4', name: 'Lisa Wilson', date: '2024-12-05', reward: 1000, status: 'completed' },
      { id: '5', name: 'David Brown', date: '2024-12-02', reward: 1000, status: 'completed' },
      { id: '6', name: 'Emily Clark', date: '2024-11-28', reward: 1000, status: 'completed' },
      { id: '7', name: 'Michael Davis', date: '2024-11-25', reward: 1000, status: 'completed' },
      { id: '8', name: 'Sarah Wilson', date: '2024-11-20', reward: 1000, status: 'completed' },
      { id: '9', name: 'James Anderson', date: '2024-11-18', reward: 1000, status: 'completed' },
      { id: '10', name: 'Anna Taylor', date: '2024-11-15', reward: 1000, status: 'completed' },
      { id: '11', name: 'Robert Miller', date: '2024-11-12', reward: 1000, status: 'completed' },
      { id: '12', name: 'Linda Garcia', date: '2024-11-10', reward: 1000, status: 'completed' },
    ],
  });

  // Handle copy referral code
  const handleCopyReferralCode = async () => {
    try {
      await Clipboard.setString(userData.referralCode);
      Alert.alert('Copied!', 'Referral code copied to clipboard');
    } catch {
      Alert.alert('Error', 'Failed to copy referral code');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.background} />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={globalStyles.backButton}
          onPress={() => navigation.goBack()}
        >
          <ChevronLeft size={24} color={colors.primary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Referral Program</Text>
        <TouchableOpacity
          style={styles.infoButton}
          onPress={() => setShowHowItWorksModal(true)}
        >
          <Info size={24} color={colors.primary} />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Referral Code Card */}
        <View style={styles.referralSection}>
          <View style={styles.referralCard}>
            <View style={styles.referralHeader}>
              <Gift size={24} color={colors.primary} />
              <Text style={styles.referralTitle}>Your Referral Code</Text>
            </View>
            <View style={styles.referralCodeContainer}>
              <Text style={styles.referralCode}>{userData.referralCode}</Text>
              <TouchableOpacity style={styles.copyButton} onPress={handleCopyReferralCode}>
                <Copy size={16} color={colors.primary} />
                <Text style={styles.copyButtonText}>Copy</Text>
              </TouchableOpacity>
            </View>
            <Text style={styles.referralDescription}>
              Share your code and earn ₦1,000 for each successful referral!
            </Text>
          </View>
        </View>

        {/* Referrals History Card */}
        <View style={styles.referralHistorySection}>
          <View style={styles.referralHistoryCard}>
            <View style={styles.referralHistoryHeader}>
              <Users size={24} color={colors.primary} />
              <Text style={styles.referralHistoryTitle}>Referrals History</Text>
            </View>
            
            {/* Stats Row */}
            <View style={styles.statsRow}>
              <View style={styles.statItem}>
                <Text style={styles.statNumber}>{referralData.totalReferrals}</Text>
                <Text style={styles.statLabel}>Total Referrals</Text>
              </View>
              <View style={styles.statDivider} />
              <View style={styles.statItem}>
                <Text style={styles.statNumber}>₦{referralData.totalEarnings.toLocaleString()}</Text>
                <Text style={styles.statLabel}>Total Earnings</Text>
              </View>
            </View>

            {/* All Referrals List */}
            <View style={styles.allReferrals}>
              <Text style={styles.allReferralsTitle}>All Referrals</Text>
              {referralData.referrals.map((referral) => (
                <View key={referral.id} style={styles.referralItem}>
                  <View style={styles.referralItemLeft}>
                    <View style={styles.referralAvatar}>
                      <User size={16} color={colors.primary} />
                    </View>
                    <View style={styles.referralInfo}>
                      <Text style={styles.referralName}>{referral.name}</Text>
                      <Text style={styles.referralDate}>{referral.date}</Text>
                    </View>
                  </View>
                  <View style={styles.referralItemRight}>
                    <Text style={styles.referralReward}>₦{referral.reward.toLocaleString()}</Text>
                    <View style={[
                      styles.statusBadge,
                      referral.status === 'completed' ? styles.statusCompleted : styles.statusPending
                    ]}>
                      <Text style={[
                        styles.statusText,
                        referral.status === 'completed' ? styles.statusTextCompleted : styles.statusTextPending
                      ]}>
                        {referral.status === 'completed' ? 'Paid' : 'Pending'}
                      </Text>
                    </View>
                  </View>
                </View>
              ))}
            </View>
          </View>
        </View>

        <View style={styles.bottomSpacing} />
      </ScrollView>

      {/* How It Works Modal */}
      <Modal
        visible={showHowItWorksModal}
        animationType="fade"
        transparent={true}
        onRequestClose={() => setShowHowItWorksModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>How It Works</Text>
              <TouchableOpacity
                style={styles.modalCloseButton}
                onPress={() => setShowHowItWorksModal(false)}
              >
                <X size={24} color={colors.text} />
              </TouchableOpacity>
            </View>
            
            <View style={styles.modalBody}>
              <View style={styles.stepContainer}>
                <View style={styles.step}>
                  <View style={styles.stepNumber}>
                    <Text style={styles.stepNumberText}>1</Text>
                  </View>
                  <View style={styles.stepContent}>
                    <Text style={styles.stepTitle}>Share Your Code</Text>
                    <Text style={styles.stepText}>Share your unique referral code with friends and family through social media, messaging, or in person</Text>
                  </View>
                </View>
                
                <View style={styles.step}>
                  <View style={styles.stepNumber}>
                    <Text style={styles.stepNumberText}>2</Text>
                  </View>
                  <View style={styles.stepContent}>
                    <Text style={styles.stepTitle}>They Sign Up</Text>
                    <Text style={styles.stepText}>Your friends download KotaPay and sign up using your referral code during registration</Text>
                  </View>
                </View>
                
                <View style={styles.step}>
                  <View style={styles.stepNumber}>
                    <Text style={styles.stepNumberText}>3</Text>
                  </View>
                  <View style={styles.stepContent}>
                    <Text style={styles.stepTitle}>Both Earn Rewards</Text>
                    <Text style={styles.stepText}>When they make their first transaction of ₦100 or more, both of you earn ₦1,000 instantly!</Text>
                  </View>
                </View>
              </View>
              
              <View style={styles.modalNote}>
                <Text style={styles.modalNoteText}>
                  💡 <Text style={styles.modalNoteBold}>Pro Tip:</Text> There&apos;s no limit to how many friends you can refer. The more you share, the more you earn!
                </Text>
              </View>
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
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    backgroundColor: colors.background,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
    flex: 1,
    textAlign: 'center',
  },
  headerSpacer: {
    width: 40,
  },
  infoButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scrollView: {
    flex: 1,
  },
  referralSection: {
    marginHorizontal: spacing.lg,
    marginTop: spacing.lg,
  },
  referralCard: {
    backgroundColor: colors.white,
    borderRadius: borderRadius.large,
    padding: spacing.lg,
    ...shadows.small,
  },
  referralHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  referralTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
    marginLeft: spacing.sm,
  },
  referralCodeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.light,
    borderRadius: borderRadius.medium,
    padding: spacing.md,
    marginBottom: spacing.md,
  },
  referralCode: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.primary,
    letterSpacing: 2,
  },
  copyButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.primaryTransparent,
    borderRadius: borderRadius.small,
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.sm,
  },
  copyButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.primary,
    marginLeft: spacing.xs,
  },
  referralDescription: {
    fontSize: 14,
    color: colors.secondaryText,
    textAlign: 'center',
    lineHeight: 20,
  },
  referralHistorySection: {
    marginHorizontal: spacing.lg,
    marginTop: spacing.lg,
  },
  referralHistoryCard: {
    backgroundColor: colors.white,
    borderRadius: borderRadius.large,
    padding: spacing.lg,
    ...shadows.small,
  },
  referralHistoryHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  referralHistoryTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
    marginLeft: spacing.sm,
  },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.lg,
    backgroundColor: colors.light,
    borderRadius: borderRadius.medium,
    padding: spacing.md,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.primary,
    marginBottom: spacing.xs,
  },
  statLabel: {
    fontSize: 12,
    color: colors.secondaryText,
    textAlign: 'center',
  },
  statDivider: {
    width: 1,
    height: 40,
    backgroundColor: colors.border,
    marginHorizontal: spacing.md,
  },
  allReferrals: {
    marginTop: spacing.sm,
  },
  allReferralsTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginBottom: spacing.md,
  },
  referralItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  referralItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  referralAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.light,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.sm,
  },
  referralInfo: {
    flex: 1,
  },
  referralName: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.text,
    marginBottom: 2,
  },
  referralDate: {
    fontSize: 12,
    color: colors.secondaryText,
  },
  referralItemRight: {
    alignItems: 'flex-end',
  },
  referralReward: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.primary,
    marginBottom: spacing.xs,
  },
  statusBadge: {
    paddingHorizontal: spacing.xs,
    paddingVertical: 2,
    borderRadius: borderRadius.small,
  },
  statusCompleted: {
    backgroundColor: colors.successTransparent,
  },
  statusPending: {
    backgroundColor: colors.accentTransparent,
  },
  statusText: {
    fontSize: 10,
    fontWeight: '500',
  },
  statusTextCompleted: {
    color: colors.success,
  },
  statusTextPending: {
    color: colors.accent,
  },
  bottomSpacing: {
    height: spacing.xl,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.lg,
  },
  modalContent: {
    backgroundColor: colors.white,
    borderRadius: borderRadius.large,
    padding: spacing.lg,
    width: '100%',
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
  },
  modalCloseButton: {
    padding: spacing.xs,
  },
  modalBody: {
    gap: spacing.md,
  },
  step: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.md,
  },
  stepNumber: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 2,
  },
  stepNumberText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: colors.white,
  },
  stepContent: {
    flex: 1,
  },
  stepTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 4,
  },
  stepDescription: {
    fontSize: 14,
    color: colors.secondaryText,
    lineHeight: 20,
  },
  modalNote: {
    backgroundColor: '#F0F8FF',
    padding: spacing.md,
    borderRadius: borderRadius.medium,
    marginTop: spacing.md,
  },
  modalNoteBold: {
    fontWeight: 'bold',
    color: colors.primary,
  },
  stepContainer: {
    gap: spacing.lg,
  },
  stepText: {
    fontSize: 14,
    color: colors.secondaryText,
    lineHeight: 20,
  },
  modalNoteText: {
    fontSize: 13,
    color: colors.secondaryText,
    textAlign: 'center',
    fontStyle: 'italic',
  },
});

export default ReferralScreen;
