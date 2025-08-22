import { StackNavigationProp } from '@react-navigation/stack';
import {
    ChevronDown,
    ChevronLeft,
    ChevronUp,
    HelpCircle,
    Search,
} from 'lucide-react-native';
import React, { useState } from 'react';
import {
    SafeAreaView,
    ScrollView,
    StatusBar,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { borderRadius, colors, shadows, spacing } from '../theme';
import { ProfileParamList } from '../types';

interface FAQScreenProps {
  navigation: StackNavigationProp<ProfileParamList, 'FAQ'>;
}

interface FAQItem {
  id: string;
  question: string;
  answer: string;
  category: string;
}

const FAQScreen: React.FC<FAQScreenProps> = ({ navigation }) => {
  const [expandedItems, setExpandedItems] = useState<string[]>([]);

  const faqData: FAQItem[] = [
    {
      id: '1',
      question: 'How do I create a KotaPay account?',
      answer: 'To create your KotaPay account, download the app, tap "Sign Up", enter your phone number, and follow the verification steps. You\'ll need to provide basic information and verify your identity.',
      category: 'Account',
    },
    {
      id: '2',
      question: 'What are the transaction limits?',
      answer: 'Transaction limits depend on your verification tier:\n• Tier 1: ₦50,000 daily\n• Tier 2: ₦200,000 daily\n• Tier 3: ₦1,000,000 daily\n\nUpgrade your tier by completing KYC verification.',
      category: 'Transactions',
    },
    {
      id: '3',
      question: 'How do I add money to my wallet?',
      answer: 'You can fund your KotaPay wallet through:\n• Bank transfer\n• Debit card\n• USSD codes\n• Bank branches\n• Agent locations\n\nAll funding methods are secure and instant.',
      category: 'Wallet',
    },
    {
      id: '4',
      question: 'Is KotaPay secure?',
      answer: 'Yes! KotaPay uses bank-level security including:\n• 256-bit SSL encryption\n• Two-factor authentication\n• Biometric login\n• Real-time fraud monitoring\n• Licensed by CBN',
      category: 'Security',
    },
    {
      id: '5',
      question: 'How do I transfer money?',
      answer: 'To send money:\n1. Open KotaPay app\n2. Tap "Send Money"\n3. Enter recipient details\n4. Enter amount\n5. Confirm with PIN/biometrics\n6. Transaction completed!',
      category: 'Transactions',
    },
    {
      id: '6',
      question: 'What bills can I pay?',
      answer: 'KotaPay supports payment for:\n• Electricity (NEPA, AEDC, EKEDC, etc.)\n• Cable TV (DStv, GOtv, Startimes)\n• Internet (MTN, Airtel, Glo, 9mobile)\n• Education (WAEC, JAMB, school fees)\n• Government services',
      category: 'Bills',
    },
    {
      id: '7',
      question: 'How do I buy airtime and data?',
      answer: 'To purchase airtime/data:\n1. Tap "Airtime & Data"\n2. Select network provider\n3. Choose airtime or data bundle\n4. Enter phone number\n5. Confirm payment\n\nYou can also set up auto-renewal for data plans.',
      category: 'Airtime',
    },
    {
      id: '8',
      question: 'What if I forget my PIN?',
      answer: 'If you forget your PIN:\n1. Tap "Forgot PIN" on login screen\n2. Verify with SMS OTP\n3. Set new 4-digit PIN\n4. Confirm new PIN\n\nYou can also reset PIN in Settings > Security.',
      category: 'Account',
    },
    {
      id: '9',
      question: 'How do I contact customer support?',
      answer: 'Reach our support team via:\n• In-app chat (24/7)\n• WhatsApp: +234 123 456 7890\n• Email: support@kotapay.com\n• Call: 0700-KOTAPAY\n• Social media: @KotaPayNG',
      category: 'Support',
    },
    {
      id: '10',
      question: 'Are there transaction fees?',
      answer: 'KotaPay fees are competitive:\n• Wallet to wallet: Free\n• Bank transfers: ₦10\n• Bill payments: Free\n• Airtime/Data: Free\n• Card funding: 1.5%\n\nNo hidden charges, transparent pricing.',
      category: 'Fees',
    },
  ];

  const toggleExpanded = (itemId: string) => {
    setExpandedItems(prev => 
      prev.includes(itemId) 
        ? prev.filter(id => id !== itemId)
        : [...prev, itemId]
    );
  };

  const renderFAQItem = ({ item }: { item: FAQItem }) => {
    const isExpanded = expandedItems.includes(item.id);
    
    return (
      <View key={item.id} style={styles.faqItem}>
        <TouchableOpacity 
          style={styles.faqHeader}
          onPress={() => toggleExpanded(item.id)}
          activeOpacity={0.7}
        >
          <View style={styles.faqHeaderContent}>
            <View style={styles.questionContainer}>
              <HelpCircle size={20} color={colors.primary} style={styles.questionIcon} />
              <Text style={styles.question}>{item.question}</Text>
            </View>
            <View style={styles.expandIcon}>
              {isExpanded ? (
                <ChevronUp size={20} color={colors.secondaryText} />
              ) : (
                <ChevronDown size={20} color={colors.secondaryText} />
              )}
            </View>
          </View>
        </TouchableOpacity>
        
        {isExpanded && (
          <View style={styles.answerContainer}>
            <Text style={styles.answer}>{item.answer}</Text>
            <View style={styles.categoryTag}>
              <Text style={styles.categoryText}>{item.category}</Text>
            </View>
          </View>
        )}
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.background} />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <ChevronLeft size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Frequently Asked Questions</Text>
        <View style={styles.headerSpacer} />
      </View>

      {/* Search Header */}
      <View style={styles.searchHeader}>
        <View style={styles.searchContainer}>
          <Search size={20} color={colors.secondaryText} />
          <Text style={styles.searchPlaceholder}>Search FAQs...</Text>
        </View>
        <Text style={styles.subtitle}>
          Find quick answers to common questions about KotaPay
        </Text>
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.content}>
          {/* FAQ Items */}
          <View style={styles.faqList}>
            {faqData.map((item) => renderFAQItem({ item }))}
          </View>

          {/* Contact Support Section */}
          <View style={styles.supportSection}>
            <Text style={styles.supportTitle}>Still need help?</Text>
            <Text style={styles.supportSubtitle}>
              Cannot find what you are looking for? Our support team is here to help.
            </Text>
            <TouchableOpacity 
              style={styles.supportButton}
              onPress={() => navigation.navigate('HelpSupport')}
            >
              <Text style={styles.supportButtonText}>Contact Support</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.bottomSpacing} />
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

  // Search Header
  searchHeader: {
    padding: spacing.lg,
    backgroundColor: colors.background,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.white,
    borderRadius: borderRadius.medium,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    marginBottom: spacing.sm,
    borderWidth: 1,
    borderColor: colors.border,
    ...shadows.small,
  },
  searchPlaceholder: {
    marginLeft: spacing.sm,
    color: colors.secondaryText,
    fontSize: 16,
  },
  subtitle: {
    fontSize: 14,
    color: colors.secondaryText,
    textAlign: 'center',
    lineHeight: 20,
  },
  
  scrollView: {
    flex: 1,
  },
  content: {
    paddingHorizontal: spacing.lg,
  },
  
  // FAQ List
  faqList: {
    marginTop: spacing.lg,
  },
  faqItem: {
    backgroundColor: colors.white,
    borderRadius: borderRadius.medium,
    marginBottom: spacing.md,
    overflow: 'hidden',
    ...shadows.small,
    borderWidth: 1,
    borderColor: colors.border,
  },
  faqHeader: {
    padding: spacing.lg,
  },
  faqHeaderContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  questionContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    flex: 1,
    marginRight: spacing.md,
  },
  questionIcon: {
    marginRight: spacing.sm,
    marginTop: 2,
  },
  question: {
    fontSize: 16,
    fontWeight: '500',
    color: colors.text,
    flex: 1,
    lineHeight: 22,
  },
  expandIcon: {
    marginLeft: spacing.sm,
  },
  
  // Answer styles
  answerContainer: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.lg,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    backgroundColor: colors.light,
  },
  answer: {
    fontSize: 14,
    color: colors.text,
    lineHeight: 20,
    marginBottom: spacing.md,
  },
  categoryTag: {
    alignSelf: 'flex-start',
    backgroundColor: colors.primaryTransparent,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.small,
  },
  categoryText: {
    fontSize: 12,
    color: colors.primary,
    fontWeight: '500',
  },
  
  // Support Section
  supportSection: {
    marginTop: spacing.xl,
    padding: spacing.xl,
    backgroundColor: colors.white,
    borderRadius: borderRadius.large,
    alignItems: 'center',
    ...shadows.medium,
    borderWidth: 1,
    borderColor: colors.border,
  },
  supportTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: colors.text,
    marginBottom: spacing.sm,
    textAlign: 'center',
  },
  supportSubtitle: {
    fontSize: 14,
    color: colors.secondaryText,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: spacing.lg,
  },
  supportButton: {
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.medium,
    ...shadows.small,
  },
  supportButtonText: {
    color: colors.white,
    fontSize: 16,
    fontWeight: '600',
  },
  
  bottomSpacing: {
    height: spacing.xl,
  },
});

export default FAQScreen;
