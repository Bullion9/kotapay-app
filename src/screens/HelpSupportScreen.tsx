import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  Linking,
  Alert,
  StatusBar,
} from 'react-native';
import { StackNavigationProp } from '@react-navigation/stack';
import { ProfileParamList } from '../types';
import {
  ChevronLeft,
  MessageSquare,
  ChevronRight,
} from 'lucide-react-native';
import { colors, spacing, borderRadius, shadows } from '../theme';
import CustomerServiceIcon from '../components/icons/CustomerServiceIcon';
import TelegramIcon from '../components/icons/TelegramIcon';
import InstagramIcon from '../components/icons/InstagramIcon';
import TwitterIcon from '../components/icons/TwitterIcon';
import HelpIcon from '../components/icons/HelpIcon';
import CallIcon from '../components/icons/CallIcon';

interface HelpSupportScreenProps {
  navigation: StackNavigationProp<ProfileParamList, 'HelpSupport'>;
}

interface SupportItemProps {
  icon: React.ReactNode;
  title: string;
  subtitle?: string;
  onPress: () => void;
  showArrow?: boolean;
  isFirst?: boolean;
  isLast?: boolean;
}

const HelpSupportScreen: React.FC<HelpSupportScreenProps> = ({ navigation }) => {

  const handlePhoneCall = () => {
    const phoneNumber = '+2349063242300';
    Linking.openURL(`tel:${phoneNumber}`).catch(() => {
      Alert.alert('Error', 'Unable to make phone call');
    });
  };

  const handleTelegram = () => {
    // Replace with your actual Telegram handle/link
    const telegramUrl = 'https://t.me/kotapay_support';
    Linking.openURL(telegramUrl).catch(() => {
      Alert.alert('Error', 'Unable to open Telegram');
    });
  };

  const handleInstagram = () => {
    // Replace with your actual Instagram handle
    const instagramUrl = 'https://instagram.com/kotapay';
    Linking.openURL(instagramUrl).catch(() => {
      Alert.alert('Error', 'Unable to open Instagram');
    });
  };

  const handleTwitter = () => {
    // Replace with your actual Twitter/X handle
    const twitterUrl = 'https://x.com/kotapay';
    Linking.openURL(twitterUrl).catch(() => {
      Alert.alert('Error', 'Unable to open X (Twitter)');
    });
  };

  const handleFAQ = () => {
    navigation.navigate('FAQ');
  };

  const handleChatSupport = () => {
    Alert.alert(
      'Chat with Support',
      'Choose how you would like to contact our support team:',
      [
        {
          text: 'Call Us',
          onPress: handlePhoneCall,
        },
        {
          text: 'Telegram',
          onPress: handleTelegram,
        },
        {
          text: 'Email Us',
          onPress: () => {
            const email = 'support@kotapay.com';
            Linking.openURL(`mailto:${email}`).catch(() => {
              Alert.alert('Error', 'Unable to open email client');
            });
          },
        },
        {
          text: 'Cancel',
          style: 'cancel',
        },
      ]
    );
  };

  const goBack = () => {
    navigation.goBack();
  };

  // Render support item
  const renderSupportItem = ({ icon, title, subtitle, onPress, showArrow = true, isFirst = false, isLast = false }: SupportItemProps) => (
    <TouchableOpacity 
      style={[
        styles.supportItem,
        isFirst && styles.firstSupportItem,
        isLast && styles.lastSupportItem,
      ]} 
      onPress={onPress}
    >
      <View style={styles.supportItemLeft}>
        <View style={styles.iconContainer}>
          {icon}
        </View>
        <View style={styles.textContainer}>
          <Text style={styles.supportTitle}>{title}</Text>
          {subtitle && <Text style={styles.supportSubtitle}>{subtitle}</Text>}
        </View>
      </View>
      {showArrow && <ChevronRight size={20} color={colors.secondaryText} />}
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.background} />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={goBack}>
          <ChevronLeft size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Help & Support</Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Support Header */}
        <View style={styles.supportHeader}>
          <View style={styles.supportIconContainer}>
            <CustomerServiceIcon size={48} color={colors.primary} />
          </View>
        </View>

        {/* Support Options */}
        <View style={styles.section}>
          {renderSupportItem({
            icon: <CallIcon size={20} color={colors.primary} />,
            title: 'Call Us',
            subtitle: '+234 906 324 2300',
            onPress: handlePhoneCall,
            isFirst: true,
          })}

          {renderSupportItem({
            icon: <TelegramIcon size={20} color={colors.primary} />,
            title: 'Telegram',
            subtitle: 'Chat with us on Telegram',
            onPress: handleTelegram,
          })}

          {renderSupportItem({
            icon: <InstagramIcon size={20} color={colors.primary} />,
            title: 'Instagram',
            subtitle: 'Follow us on Instagram',
            onPress: handleInstagram,
          })}

          {renderSupportItem({
            icon: <TwitterIcon size={20} color={colors.primary} />,
            title: 'X (Twitter)',
            subtitle: 'Follow us on X',
            onPress: handleTwitter,
          })}

          {renderSupportItem({
            icon: <HelpIcon size={20} color={colors.primary} />,
            title: 'FAQ',
            subtitle: 'Frequently Asked Questions',
            onPress: handleFAQ,
            isLast: true,
          })}
        </View>

        <View style={styles.bottomSpacing} />
      </ScrollView>

      {/* Floating Chat with Support Button */}
      <View style={styles.floatingButtonContainer}>
        <TouchableOpacity 
          style={styles.chatSupportButton}
          onPress={handleChatSupport}
        >
          <MessageSquare size={20} color={colors.white} />
          <Text style={styles.chatSupportText}>Chat with Support</Text>
        </TouchableOpacity>
      </View>
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
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    backgroundColor: colors.background,
    borderBottomWidth: 0,
  },
  backButton: {
    padding: spacing.xs,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
  },
  headerSpacer: {
    width: 32,
  },
  
  scrollView: {
    flex: 1,
  },
  
  // Support Header styles
  supportHeader: {
    alignItems: 'center',
    paddingVertical: spacing.xl,
    paddingHorizontal: spacing.lg,
    backgroundColor: colors.background,
  },
  supportIconContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: colors.light,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.md,
    ...shadows.small,
  },
  supportHeaderTitle: {
    fontSize: 24,
    fontWeight: '600',
    color: colors.text,
    marginBottom: spacing.xs,
  },
  supportHeaderSubtitle: {
    fontSize: 16,
    color: colors.secondaryText,
    textAlign: 'center',
    lineHeight: 22,
  },
  
  // Section styles
  section: {
    marginBottom: spacing.lg,
    marginHorizontal: spacing.md,
    borderRadius: borderRadius.large,
    overflow: 'hidden',
    ...shadows.small,
  },
  
  // Support item styles
  supportItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    backgroundColor: colors.white,
    borderBottomWidth: 1,
    borderBottomColor: '#F5F5F5',
    minHeight: 64,
  },
  firstSupportItem: {
    borderTopLeftRadius: borderRadius.large,
    borderTopRightRadius: borderRadius.large,
  },
  lastSupportItem: {
    borderBottomLeftRadius: borderRadius.large,
    borderBottomRightRadius: borderRadius.large,
    borderBottomWidth: 0,
  },
  supportItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.light,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.md,
  },
  textContainer: {
    flex: 1,
  },
  supportTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: colors.text,
    marginBottom: spacing.xs,
  },
  supportSubtitle: {
    fontSize: 14,
    color: colors.secondaryText,
  },
  
  // Floating Chat Button
  floatingButtonContainer: {
    position: 'absolute',
    bottom: spacing.xl + spacing.md,
    right: spacing.lg,
  },
  chatSupportButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primary,
    borderRadius: borderRadius.large,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    minHeight: 50,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 8,
  },
  chatSupportText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.white,
    marginLeft: spacing.sm,
  },
  
  bottomSpacing: {
    height: spacing.xl + 80, // Extra space for floating button
  },
});

export default HelpSupportScreen;

