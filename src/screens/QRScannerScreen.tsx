import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  StatusBar,
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
import { colors, spacing, shadows, borderRadius, globalStyles } from '../theme';
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

  return (
    <>
      <StatusBar barStyle="dark-content" backgroundColor="#FFF0F5" />
      <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity 
            style={globalStyles.backButton} 
            onPress={() => navigation.goBack()}
          >
            <ChevronLeft size={24} color={colors.primary} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>QR Scanner</Text>
          <View style={styles.headerSpacer} />
        </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Card Info */}
        <View style={styles.cardInfo}>
          <Text style={styles.cardTitle}>QR Code Scanner</Text>
          <Text style={styles.cardSubtitle}>Scan or generate payment codes instantly</Text>
        </View>

        {/* Main Actions */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Choose Action</Text>
          
          <TouchableOpacity style={styles.actionButton} onPress={openScanner}>
            <View style={styles.actionIcon}>
              <Scan size={28} color={colors.white} />
            </View>
            <View style={styles.actionContent}>
              <Text style={styles.actionTitle}>Scan QR Code</Text>
              <Text style={styles.actionSubtitle}>Scan to send money or add contacts</Text>
            </View>
            <View style={styles.actionArrow}>
              <Camera size={20} color={colors.secondaryText} />
            </View>
          </TouchableOpacity>

          <TouchableOpacity style={styles.actionButton} onPress={openGenerator}>
            <View style={[styles.actionIcon, { backgroundColor: colors.success }]}>
              <QrCode size={28} color={colors.white} />
            </View>
            <View style={styles.actionContent}>
              <Text style={styles.actionTitle}>My QR Code</Text>
              <Text style={styles.actionSubtitle}>Generate and share your payment code</Text>
            </View>
            <View style={styles.actionArrow}>
              <ChevronLeft size={20} color={colors.secondaryText} style={{ transform: [{ rotate: '180deg' }] }} />
            </View>
          </TouchableOpacity>
        </View>

        {/* Quick Tips */}
        <View style={styles.tipsSection}>
          <Text style={styles.tipsTitle}>💡 Quick Tips</Text>
          <Text style={styles.tipText}>• Hold steady while scanning for best results</Text>
          <Text style={styles.tipText}>• Tap flashlight button for better scanning in dark</Text>
          <Text style={styles.tipText}>• Make sure QR code is well-lit and clear</Text>
          <Text style={styles.tipText}>• Your QR code updates automatically for security</Text>
        </View>

        <View style={styles.bottomPadding} />
      </ScrollView>

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
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    backgroundColor: '#FFF0F5',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    paddingTop: spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5EA',
    minHeight: 60,
  },
  headerPlaceholder: {
    flex: 1,
  },
  headerSpacer: {
    width: 40,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000d10',
    textAlign: 'center',
  },
  content: {
    flex: 1,
    paddingHorizontal: spacing.xl,
  },
  cardInfo: {
    backgroundColor: colors.primary,
    borderRadius: borderRadius.xl,
    padding: spacing.xl,
    marginTop: spacing.lg,
    marginBottom: spacing.xl,
    ...shadows.medium,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.white,
    marginBottom: spacing.xs,
  },
  cardSubtitle: {
    fontSize: 14,
    color: colors.white,
    opacity: 0.8,
  },
  section: {
    marginBottom: spacing.xl,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginBottom: spacing.md,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.white,
    borderRadius: borderRadius.medium,
    padding: spacing.lg,
    marginBottom: spacing.md,
    ...shadows.small,
  },
  actionIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  actionContent: {
    flex: 1,
  },
  actionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 2,
  },
  actionSubtitle: {
    fontSize: 14,
    color: colors.secondaryText,
  },
  actionArrow: {
    marginLeft: spacing.sm,
  },
  tipsSection: {
    backgroundColor: colors.primaryTransparent,
    borderRadius: borderRadius.medium,
    padding: spacing.lg,
    marginTop: spacing.md,
  },
  tipsTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.primary,
    marginBottom: spacing.sm,
  },
  tipText: {
    fontSize: 12,
    color: colors.text,
    marginBottom: 4,
  },
  bottomPadding: {
    height: 100,
  },
});

export default QRScannerScreen;
