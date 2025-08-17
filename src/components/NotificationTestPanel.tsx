import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
  Alert,
} from 'react-native';
import {
  Mail,
  Clock,
  CheckCircle,
  ArrowUpRight,
  ArrowDownLeft,
  MessageSquare,
} from 'lucide-react-native';
import { colors } from '../theme';
import { notificationService, TransactionNotificationPayload } from '../services/notifications';

const NotificationTestPanel: React.FC = () => {
  const [isInitialized, setIsInitialized] = useState(false);

  const initializeNotifications = async () => {
    try {
      await notificationService.initialize();
      setIsInitialized(true);
      Alert.alert('Success', 'Notifications initialized successfully!');
    } catch (error) {
      Alert.alert('Error', 'Failed to initialize notifications');
      console.error('Notification init error:', error);
    }
  };

  const sendTestNotification = async (type: 'money_received' | 'money_sent' | 'request_received' | 'request_accepted' | 'email_notification') => {
    if (!isInitialized) {
      Alert.alert('Error', 'Please initialize notifications first');
      return;
    }

    const mockPayload: TransactionNotificationPayload = {
      transactionId: `test-${Date.now()}`,
      amount: 25.50,
      currency: '$',
      senderName: 'John Doe',
      recipientName: 'Jane Smith',
      message: 'Coffee money ☕',
    };

    const mockEmailPayload = {
      transactionId: `email-${Date.now()}`,
      emailSubject: 'Payment Confirmation',
      senderName: 'KotaPay Support',
      message: 'Your recent transaction has been processed',
    };

    try {
      switch (type) {
        case 'money_received':
          await notificationService.sendMoneyReceivedNotification(mockPayload);
          break;
        case 'money_sent':
          await notificationService.sendMoneySentNotification(mockPayload);
          break;
        case 'request_received':
          await notificationService.sendRequestReceivedNotification(mockPayload);
          break;
        case 'request_accepted':
          await notificationService.sendRequestAcceptedNotification(mockPayload);
          break;
        case 'email_notification':
          await notificationService.sendEmailNotification(mockEmailPayload);
          break;
      }
      Alert.alert('Success', `${type.replace(/_/g, ' ')} notification sent!`);
    } catch (error) {
      Alert.alert('Error', 'Failed to send notification');
      console.error('Send notification error:', error);
    }
  };

  const clearAllNotifications = async () => {
    try {
      await notificationService.cancelAllNotifications();
      Alert.alert('Success', 'All notifications cleared!');
    } catch {
      Alert.alert('Error', 'Failed to clear notifications');
    }
  };

  const TestButton = ({ 
    title, 
    description, 
    icon: Icon, 
    onPress, 
    color = colors.primary 
  }: {
    title: string;
    description: string;
    icon: React.ComponentType<any>;
    onPress: () => void;
    color?: string;
  }) => (
    <TouchableOpacity style={styles.testButton} onPress={onPress}>
      <View style={[styles.iconContainer, { backgroundColor: `${color}15` }]}>
        <Icon size={24} color={color} />
      </View>
      <View style={styles.buttonContent}>
        <Text style={styles.buttonTitle}>{title}</Text>
        <Text style={styles.buttonDescription}>{description}</Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Mail size={32} color={colors.primary} />
          <Text style={styles.headerTitle}>Notification Test Panel</Text>
          <Text style={styles.headerSubtitle}>
            Test push notifications for different transaction types
          </Text>
        </View>

        {/* Initialization Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Setup</Text>
          <TestButton
            title="Initialize Notifications"
            description={isInitialized ? "✅ Ready to send notifications" : "Setup push notifications"}
            icon={Mail}
            onPress={initializeNotifications}
            color={isInitialized ? colors.success : colors.primary}
          />
        </View>

        {/* Transaction Notifications Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Transaction Notifications</Text>
          
          <TestButton
            title="Money Received"
            description="Test receiving money notification with 💰 icon"
            icon={ArrowDownLeft}
            onPress={() => sendTestNotification('money_received')}
            color={colors.success}
          />

          <TestButton
            title="Money Sent"
            description="Test sending money notification with 💸 icon"
            icon={ArrowUpRight}
            onPress={() => sendTestNotification('money_sent')}
            color={colors.error}
          />

          <TestButton
            title="Request Received"
            description="Test payment request notification with 📥 icon"
            icon={Clock}
            onPress={() => sendTestNotification('request_received')}
            color={colors.warning}
          />

          <TestButton
            title="Request Accepted"
            description="Test request accepted notification with ✅ icon"
            icon={CheckCircle}
            onPress={() => sendTestNotification('request_accepted')}
            color={colors.success}
          />

          <TestButton
            title="Email Notification"
            description="Test email notification with 📧 icon"
            icon={Mail}
            onPress={() => sendTestNotification('email_notification')}
            color={colors.accent}
          />
        </View>

        {/* Utility Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Utilities</Text>
          
          <TestButton
            title="Send Test Notification"
            description="Send a general test notification"
            icon={MessageSquare}
            onPress={() => notificationService.sendTestNotification()}
            color={colors.accent}
          />

          <TestButton
            title="Clear All Notifications"
            description="Remove all scheduled notifications"
            icon={Mail}
            onPress={clearAllNotifications}
            color={colors.error}
          />
        </View>

        {/* Info Section */}
        <View style={styles.infoSection}>
          <Text style={styles.infoTitle}>💡 How to Test</Text>
          <Text style={styles.infoText}>
            1. Tap &ldquo;Initialize Notifications&rdquo; to request permissions{'\n'}
            2. Test different notification types{'\n'}
            3. Tap notifications to test deep linking{'\n'}
            4. Check notification appearance and sounds{'\n'}
            5. Verify Lucide icons appear correctly
          </Text>
        </View>

        <View style={styles.bottomSpacing} />
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    flex: 1,
    padding: 20,
  },
  header: {
    alignItems: 'center',
    marginBottom: 30,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.text,
    marginTop: 12,
    marginBottom: 8,
  },
  headerSubtitle: {
    fontSize: 16,
    color: colors.secondaryText,
    textAlign: 'center',
    lineHeight: 22,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 16,
  },
  testButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.white,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: colors.border,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  buttonContent: {
    flex: 1,
  },
  buttonTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 4,
  },
  buttonDescription: {
    fontSize: 14,
    color: colors.secondaryText,
    lineHeight: 18,
  },
  infoSection: {
    backgroundColor: colors.accentTransparent,
    borderRadius: 12,
    padding: 16,
    marginTop: 20,
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 8,
  },
  infoText: {
    fontSize: 14,
    color: colors.secondaryText,
    lineHeight: 20,
  },
  bottomSpacing: {
    height: 40,
  },
});

export default NotificationTestPanel;
