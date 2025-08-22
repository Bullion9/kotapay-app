import * as Haptics from 'expo-haptics';
import {
    ArrowLeft,
    Clock,
    ExternalLink,
    FileText,
    HelpCircle,
    Mail,
    MessageCircle,
    Phone,
    Shield,
} from 'lucide-react-native';
import React from 'react';
import {
    Alert,
    Linking,
    SafeAreaView,
    ScrollView,
    StatusBar,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';

const SupportLegalScreen: React.FC = () => {
  const supportOptions = [
    {
      icon: <MessageCircle size={20} color="#06402B" />,
      title: 'Live Chat',
      subtitle: 'Chat with our support team',
      action: () => console.log('Open live chat'),
      available: true,
    },
    {
      icon: <Mail size={20} color="#06402B" />,
      title: 'Email Support',
      subtitle: 'support@kotapay.com',
      action: () => Linking.openURL('mailto:support@kotapay.com'),
      available: true,
    },
    {
      icon: <Phone size={20} color="#06402B" />,
      title: 'Phone Support',
      subtitle: '+234 800 KOTA PAY',
      action: () => Linking.openURL('tel:+2348005682729'),
      available: false,
    },
  ];

  const faqSections = [
    {
      title: 'Account & Security',
      questions: ['How to reset my PIN?', 'Enable two-factor authentication', 'Account verification'],
    },
    {
      title: 'Payments & Transfers',
      questions: ['Transfer limits', 'Failed transactions', 'Payment methods'],
    },
    {
      title: 'Virtual Cards',
      questions: ['Create virtual card', 'Card security', 'International payments'],
    },
  ];

  const legalDocuments = [
    {
      icon: <Shield size={20} color="#06402B" />,
      title: 'Privacy Policy',
      subtitle: 'How we protect your personal data',
      lastUpdated: 'Updated Dec 2024',
      action: () => console.log('Open privacy policy'),
    },
    {
      icon: <FileText size={20} color="#06402B" />,
      title: 'Terms of Service',
      subtitle: 'App usage guidelines and conditions',
      lastUpdated: 'Updated Dec 2024',
      action: () => console.log('Open terms of service'),
    },
    {
      icon: <FileText size={20} color="#06402B" />,
      title: 'User Agreement',
      subtitle: 'Your rights and responsibilities',
      lastUpdated: 'Updated Nov 2024',
      action: () => console.log('Open user agreement'),
    },
  ];

  const handleContactSupport = async (option: any) => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    
    if (!option.available) {
      Alert.alert(
        'Service Unavailable',
        'Phone support is currently unavailable. Please use live chat or email.',
        [{ text: 'OK' }]
      );
      return;
    }
    
    option.action();
  };

  const handleFAQPress = async () => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    console.log('Open FAQ section');
  };

  const goBack = async () => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    console.log('Going back to profile');
  };

  const renderSupportOption = (option: any, index: number) => (
    <TouchableOpacity
      key={index}
      style={[styles.listItem, !option.available && styles.disabledItem]}
      onPress={() => handleContactSupport(option)}
    >
      <View style={styles.itemLeft}>
        <View style={[styles.iconContainer, !option.available && styles.disabledIcon]}>
          {option.icon}
        </View>
        <View style={styles.itemText}>
          <Text style={[styles.itemTitle, !option.available && styles.disabledText]}>
            {option.title}
          </Text>
          <Text style={styles.itemSubtitle}>{option.subtitle}</Text>
          {!option.available && (
            <Text style={styles.unavailableText}>Currently unavailable</Text>
          )}
        </View>
      </View>
      <ExternalLink size={16} color={option.available ? "#A3AABE" : "#E5E5E5"} />
    </TouchableOpacity>
  );

  const renderFAQSection = (section: any, index: number) => (
    <TouchableOpacity
      key={index}
      style={styles.faqSection}
      onPress={handleFAQPress}
    >
      <Text style={styles.faqTitle}>{section.title}</Text>
      <Text style={styles.faqPreview}>
        {section.questions.slice(0, 2).join(' • ')}
        {section.questions.length > 2 && ' • ...'}
      </Text>
    </TouchableOpacity>
  );

  const renderLegalDocument = (document: any, index: number) => (
    <TouchableOpacity
      key={index}
      style={styles.listItem}
      onPress={document.action}
    >
      <View style={styles.itemLeft}>
        <View style={styles.iconContainer}>
          {document.icon}
        </View>
        <View style={styles.itemText}>
          <Text style={styles.itemTitle}>{document.title}</Text>
          <Text style={styles.itemSubtitle}>{document.subtitle}</Text>
          <Text style={styles.lastUpdated}>{document.lastUpdated}</Text>
        </View>
      </View>
      <ExternalLink size={16} color="#A3AABE" />
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFF0F5" />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={goBack}>
          <ArrowLeft size={24} color="#06402B" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Support & Legal</Text>
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.content}>
          <Text style={styles.description}>
            Get help with your account or find important legal information about KotaPay.
          </Text>

          {/* Contact Support */}
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Contact Support</Text>
            <Text style={styles.cardSubtitle}>Our support team is here to help you 24/7</Text>
            {supportOptions.map(renderSupportOption)}
          </View>

          {/* FAQ Preview */}
          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <HelpCircle size={20} color="#06402B" />
              <Text style={styles.cardTitle}>Frequently Asked Questions</Text>
            </View>
            {faqSections.map(renderFAQSection)}
            <TouchableOpacity style={styles.viewAllButton} onPress={handleFAQPress}>
              <Text style={styles.viewAllText}>View All FAQs</Text>
              <ExternalLink size={16} color="#06402B" />
            </TouchableOpacity>
          </View>

          {/* Legal Documents */}
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Legal & Compliance</Text>
            <Text style={styles.cardSubtitle}>Important documents and policies</Text>
            {legalDocuments.map(renderLegalDocument)}
          </View>

          {/* Support Hours */}
          <View style={styles.supportHours}>
            <Clock size={16} color="#06402B" />
            <Text style={styles.supportHoursText}>
              Support is available 24/7 via chat and email. Phone support: Mon-Fri 9AM-6PM WAT
            </Text>
          </View>

          {/* App Version */}
          <View style={styles.versionContainer}>
            <Text style={styles.versionText}>KotaPay v1.2.3 (Build 456)</Text>
            <Text style={styles.versionDate}>Released December 2024</Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFF0F5',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#FFF0F5',
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  backButton: {
    padding: 8,
    marginRight: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#06402B',
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: 16,
  },
  description: {
    fontSize: 14,
    color: '#A3AABE',
    marginBottom: 24,
    lineHeight: 20,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#06402B',
    marginLeft: 8,
  },
  cardSubtitle: {
    fontSize: 12,
    color: '#A3AABE',
    marginBottom: 16,
  },
  listItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F5F5F5',
    minHeight: 60,
  },
  disabledItem: {
    opacity: 0.6,
  },
  itemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F0F8F0',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  disabledIcon: {
    backgroundColor: '#F5F5F5',
  },
  itemText: {
    flex: 1,
  },
  itemTitle: {
    fontSize: 14,
    fontWeight: '500',
    color: '#06402B',
  },
  disabledText: {
    color: '#A3AABE',
  },
  itemSubtitle: {
    fontSize: 12,
    color: '#A3AABE',
    marginTop: 2,
  },
  unavailableText: {
    fontSize: 10,
    color: '#EA3B52',
    marginTop: 2,
  },
  lastUpdated: {
    fontSize: 10,
    color: '#06402B',
    marginTop: 2,
  },
  faqSection: {
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F5F5F5',
  },
  faqTitle: {
    fontSize: 14,
    fontWeight: '500',
    color: '#06402B',
  },
  faqPreview: {
    fontSize: 12,
    color: '#A3AABE',
    marginTop: 4,
  },
  viewAllButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 12,
    paddingVertical: 8,
  },
  viewAllText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#06402B',
    marginRight: 8,
  },
  supportHours: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#F0F8F0',
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
  },
  supportHoursText: {
    fontSize: 12,
    color: '#06402B',
    marginLeft: 8,
    flex: 1,
    lineHeight: 16,
  },
  versionContainer: {
    alignItems: 'center',
    paddingVertical: 16,
  },
  versionText: {
    fontSize: 12,
    color: '#A3AABE',
    fontWeight: '500',
  },
  versionDate: {
    fontSize: 10,
    color: '#A3AABE',
    marginTop: 2,
  },
});

export default SupportLegalScreen;
