import { useNavigation } from '@react-navigation/native';
import {
    AlertCircle,
    ArrowUpRight,
    ChevronLeft,
    CreditCard,
    Eye,
    FileText,
    Scale,
    Shield,
} from 'lucide-react-native';
import React from 'react';
import {
    Alert,
    SafeAreaView,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { colors } from '../theme';

interface DocumentItemProps {
  icon: React.ComponentType<any>;
  title: string;
  subtitle: string;
  onPress: () => void;
  iconColor?: string;
  iconBackgroundColor?: string;
}

const TermsPrivacyScreen: React.FC = () => {
  const navigation = useNavigation();

  const DocumentItem: React.FC<DocumentItemProps> = ({
    icon: Icon,
    title,
    subtitle,
    onPress,
    iconColor = '#06402B',
    iconBackgroundColor = '#06402B15',
  }) => (
    <TouchableOpacity 
      style={styles.documentItem}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View style={styles.itemLeft}>
        <View style={[styles.iconContainer, { backgroundColor: iconBackgroundColor }]}>
          <Icon size={24} color={iconColor} />
        </View>
        <View style={styles.itemText}>
          <Text style={styles.itemTitle}>{title}</Text>
          <Text style={styles.itemSubtitle}>{subtitle}</Text>
        </View>
      </View>
      <ArrowUpRight size={20} color="#A3AABE" />
    </TouchableOpacity>
  );

  const handleTermsOfService = () => {
    Alert.alert(
      'Terms of Service',
      'KotaPay Terms of Service\n\nBy using KotaPay, you agree to our terms and conditions. This includes:\n\n• Account usage guidelines\n• Transaction policies\n• Service availability\n• User responsibilities\n• Limitation of liability\n\nLast updated: August 2025',
      [
        { text: 'View Full Terms', onPress: () => console.log('Navigate to full terms') },
        { text: 'OK', style: 'default' }
      ]
    );
  };

  const handlePrivacyPolicy = () => {
    Alert.alert(
      'Privacy Policy',
      'KotaPay Privacy Policy\n\nWe protect your personal information:\n\n• Data collection practices\n• Information usage\n• Data sharing policies\n• Security measures\n• Your privacy rights\n• Contact information\n\nLast updated: August 2025',
      [
        { text: 'View Full Policy', onPress: () => console.log('Navigate to full privacy policy') },
        { text: 'OK', style: 'default' }
      ]
    );
  };

  const handleCardTerms = () => {
    Alert.alert(
      'Virtual Card Terms',
      'KotaPay Virtual Card Terms & Conditions\n\n• Card creation and usage\n• Transaction limits and fees\n• Security responsibilities\n• Card freezing and unfreezing\n• International usage\n• Merchant restrictions\n\nLast updated: August 2025',
      [
        { text: 'View Full Terms', onPress: () => console.log('Navigate to card terms') },
        { text: 'OK', style: 'default' }
      ]
    );
  };

  const handleFeeSchedule = () => {
    Alert.alert(
      'Fee Schedule',
      'KotaPay Transaction Fees\n\n• Virtual card creation: Free\n• Domestic transactions: ₦50\n• International transactions: 3.5%\n• ATM withdrawals: ₦100\n• Currency conversion: 2.5%\n• Monthly maintenance: ₦200\n\nEffective: August 2025',
      [
        { text: 'View Detailed Fees', onPress: () => console.log('Navigate to detailed fees') },
        { text: 'OK', style: 'default' }
      ]
    );
  };

  const handleCompliance = () => {
    Alert.alert(
      'Regulatory Compliance',
      'KotaPay Compliance Information\n\n• CBN licensed financial service\n• PCI DSS compliant\n• Anti-money laundering (AML)\n• Know Your Customer (KYC)\n• Data protection compliance\n• International regulations\n\nRegulatory bodies: CBN, NDPC',
      [
        { text: 'View Compliance Details', onPress: () => console.log('Navigate to compliance') },
        { text: 'OK', style: 'default' }
      ]
    );
  };

  const handleCookiePolicy = () => {
    Alert.alert(
      'Cookie Policy',
      'KotaPay Cookie Usage\n\n• Essential cookies for app functionality\n• Analytics for service improvement\n• Personalization preferences\n• Security and fraud prevention\n• Third-party integrations\n\nYou can manage cookie preferences in settings.',
      [
        { text: 'Manage Cookies', onPress: () => console.log('Navigate to cookie settings') },
        { text: 'OK', style: 'default' }
      ]
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton} 
          onPress={() => navigation.goBack()}
        >
          <ChevronLeft size={24} color="#06402B" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Terms & Privacy</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Legal Documents */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Legal Documents</Text>
          <View style={styles.card}>
            <DocumentItem
              icon={FileText}
              title="Terms of Service"
              subtitle="KotaPay service agreement and user terms"
              onPress={handleTermsOfService}
              iconColor="#06402B"
              iconBackgroundColor="#06402B15"
            />

            <DocumentItem
              icon={Shield}
              title="Privacy Policy"
              subtitle="How KotaPay protects and uses your data"
              onPress={handlePrivacyPolicy}
              iconColor="#007AFF"
              iconBackgroundColor="#007AFF15"
            />

            <DocumentItem
              icon={Eye}
              title="Cookie Policy"
              subtitle="Information about cookies and tracking"
              onPress={handleCookiePolicy}
              iconColor="#FF9500"
              iconBackgroundColor="#FF950015"
            />
          </View>
        </View>

        {/* Financial Terms */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Financial Terms</Text>
          <View style={styles.card}>
            <DocumentItem
              icon={CreditCard}
              title="Virtual Card Terms"
              subtitle="Card usage terms and conditions"
              onPress={handleCardTerms}
              iconColor="#06402B"
              iconBackgroundColor="#06402B15"
            />

            <DocumentItem
              icon={Scale}
              title="Fee Schedule"
              subtitle="Current transaction and service fees"
              onPress={handleFeeSchedule}
              iconColor="#34C759"
              iconBackgroundColor="#34C75915"
            />
          </View>
        </View>

        {/* Compliance */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Regulatory Information</Text>
          <View style={styles.card}>
            <DocumentItem
              icon={AlertCircle}
              title="Compliance & Regulations"
              subtitle="CBN licensing and regulatory compliance"
              onPress={handleCompliance}
              iconColor="#8E8E93"
              iconBackgroundColor="#8E8E9315"
            />
          </View>
        </View>

        {/* App Information */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Application Information</Text>
          <View style={styles.appInfo}>
            <Text style={styles.appInfoText}>KotaPay v2.1.0</Text>
            <Text style={styles.appInfoText}>Build 2025.08.21</Text>
            <Text style={styles.appInfoText}>© 2025 KotaPay Limited</Text>
            <Text style={styles.appInfoText}>Licensed by Central Bank of Nigeria</Text>
          </View>
        </View>

        <View style={styles.bottomPadding} />
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
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: colors.background,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.background,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: colors.border,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: colors.seaGreen,
  },
  placeholder: {
    width: 40,
  },
  content: {
    flex: 1,
  },
  section: {
    paddingHorizontal: 20,
    marginTop: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.seaGreen,
    marginBottom: 12,
  },
  card: {
    backgroundColor: colors.white,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  documentItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    minHeight: 72,
  },
  itemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  itemText: {
    flex: 1,
  },
  itemTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: colors.seaGreen,
    marginBottom: 2,
  },
  itemSubtitle: {
    fontSize: 14,
    color: colors.secondaryText,
    lineHeight: 18,
  },
  appInfo: {
    backgroundColor: colors.white,
    borderRadius: 12,
    padding: 20,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  appInfoText: {
    fontSize: 14,
    color: colors.secondaryText,
    marginBottom: 4,
    textAlign: 'center',
  },
  bottomPadding: {
    height: 32,
  },
});

export default TermsPrivacyScreen;
