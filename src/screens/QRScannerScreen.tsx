import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import {
  ChevronLeft,
  QrCode,
  Scan,
  Camera,
} from 'lucide-react-native';
import { RootStackParamList } from '../types';
import { colors, spacing, shadows, borderRadius, iconSizes, globalStyles } from '../theme';
import SimpleQRCodeModal from '../components/SimpleQRCodeModal';

type QRScannerScreenNavigationProp = StackNavigationProp<RootStackParamList>;

const QRScannerScreen: React.FC = () => {
  const navigation = useNavigation<QRScannerScreenNavigationProp>();
  const [modalVisible, setModalVisible] = useState(false);
  const [modalMode, setModalMode] = useState<'scan' | 'generate'>('scan');

  const handleScanSuccess = (data: string) => {
    setModalVisible(false);
    
    try {
      // Try to parse as JSON for structured data
      const parsedData = JSON.parse(data);
      
      if (parsedData.userId || parsedData.type === 'user') {
        // User QR code - navigate to SendMoney
        navigation.navigate('SendMoney', { scannedData: data });
      } else if (parsedData.type === 'payment_request') {
        // Payment request - navigate to SendMoney  
        navigation.navigate('SendMoney', { scannedData: data });
      } else {
        // For other structured data, default to SendMoney
        navigation.navigate('SendMoney', { scannedData: data });
      }
    } catch {
      // Not JSON, treat as plain data
      // For simplicity, always navigate to SendMoney
      // SendMoney screen can handle various types of scanned data
      navigation.navigate('SendMoney', { scannedData: data });
    }
  };

  const openScanner = () => {
    setModalMode('scan');
    setModalVisible(true);
  };

  const openGenerator = () => {
    setModalMode('generate');
    setModalVisible(true);
  };

  const ActionCard = ({ 
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
    <TouchableOpacity style={styles.actionCard} onPress={onPress}>
      <View style={[styles.iconContainer, { backgroundColor: `${color}15` }]}>
        <Icon size={iconSizes.xl} color={color} />
      </View>
      <Text style={styles.actionTitle}>{title}</Text>
      <Text style={styles.actionDescription}>{description}</Text>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity 
          style={globalStyles.backButton} 
          onPress={() => navigation.goBack()}
        >
          <ChevronLeft size={24} color={colors.primary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>QR Code Scanner</Text>
        <View style={styles.headerSpacer} />
      </View>

      {/* Content */}
      <View style={styles.content}>
        {/* Main Actions */}
        <View style={styles.actionsContainer}>
          <ActionCard
            title="Scan QR Code"
            description="Scan a payment QR code to send money or add contacts"
            icon={Scan}
            onPress={openScanner}
            color={colors.primary}
          />

          <ActionCard
            title="My QR Code"
            description="Generate and share your payment QR code"
            icon={QrCode}
            onPress={openGenerator}
            color={colors.success}
          />
        </View>

        {/* Info Section */}
        <View style={styles.infoSection}>
          <View style={styles.infoHeader}>
            <Camera size={iconSizes.md} color={colors.accent} />
            <Text style={styles.infoTitle}>How to use QR Codes</Text>
          </View>
          
          <View style={styles.infoList}>
            <Text style={styles.infoItem}>• Scan QR codes to quickly send money to friends</Text>
            <Text style={styles.infoItem}>• Generate your QR code for others to pay you</Text>
            <Text style={styles.infoItem}>• Save QR codes to your photo gallery</Text>
            <Text style={styles.infoItem}>• Share QR codes via messages or social media</Text>
            <Text style={styles.infoItem}>• Use flash for better scanning in dark environments</Text>
          </View>
        </View>

        {/* Quick Actions */}
        <View style={styles.quickActions}>
          <TouchableOpacity 
            style={styles.quickActionButton}
            onPress={openScanner}
          >
            <Scan size={iconSizes.sm} color={colors.white} />
            <Text style={styles.quickActionText}>Quick Scan</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={[styles.quickActionButton, styles.quickActionButtonSecondary]}
            onPress={openGenerator}
          >
            <QrCode size={iconSizes.sm} color={colors.primary} />
            <Text style={[styles.quickActionText, styles.quickActionTextSecondary]}>
              My QR
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* QR Code Scanner Modal */}
      <SimpleQRCodeModal
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        onScanSuccess={handleScanSuccess}
        mode={modalMode}
        qrData="user@kotapay.com"
        title={modalMode === 'scan' ? 'Scan QR Code' : 'My QR Code'}
      />
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
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    paddingVertical: 16,
    paddingTop: 24,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5EA',
    backgroundColor: '#FFF0F5',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000d10',
  },
  headerSpacer: {
    width: 40,
  },
  content: {
    flex: 1,
    padding: spacing.lg,
  },
  actionsContainer: {
    gap: spacing.lg,
    marginBottom: spacing.xl,
  },
  actionCard: {
    backgroundColor: colors.white,
    borderRadius: borderRadius.large,
    padding: spacing.xl,
    alignItems: 'center',
    ...shadows.medium,
  },
  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.lg,
  },
  actionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: colors.text,
    marginBottom: spacing.sm,
    textAlign: 'center',
  },
  actionDescription: {
    fontSize: 14,
    color: colors.secondaryText,
    textAlign: 'center',
    lineHeight: 20,
  },
  infoSection: {
    backgroundColor: colors.white,
    borderRadius: borderRadius.large,
    padding: spacing.lg,
    marginBottom: spacing.xl,
    ...shadows.small,
  },
  infoHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginLeft: spacing.sm,
  },
  infoList: {
    gap: spacing.sm,
  },
  infoItem: {
    fontSize: 14,
    color: colors.secondaryText,
    lineHeight: 20,
  },
  quickActions: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  quickActionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.lg,
    backgroundColor: colors.primary,
    borderRadius: borderRadius.medium,
    gap: spacing.sm,
    ...shadows.small,
  },
  quickActionButtonSecondary: {
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.primary,
  },
  quickActionText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.white,
  },
  quickActionTextSecondary: {
    color: colors.primary,
  },
});

export default QRScannerScreen;
