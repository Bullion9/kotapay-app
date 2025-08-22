import { Camera, CameraType, CameraView, FlashMode } from 'expo-camera';
import * as ImagePicker from 'expo-image-picker';
import React, { useEffect, useState } from 'react';
import {
    Alert,
    BackHandler,
    Modal,
    Share,
    StatusBar,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import QRCode from 'react-native-qrcode-svg';
import { SafeAreaView } from 'react-native-safe-area-context';

import {
    AlertCircle,
    Camera as CameraIcon,
    Download,
    Image as ImageIcon,
    RotateCcw,
    Share2,
    X,
    Zap,
    ZapOff,
} from 'lucide-react-native';
import { borderRadius, colors, iconSizes, shadows, spacing } from '../theme';

interface QRCodeScannerModalProps {
  visible: boolean;
  onClose: () => void;
  onScanSuccess: (data: string) => void;
  mode?: 'scan' | 'generate';
  qrData?: string;
  title?: string;
}

const SimpleQRCodeModal: React.FC<QRCodeScannerModalProps> = ({
  visible,
  onClose,
  onScanSuccess,
  mode = 'scan',
  qrData = '',
  title = 'QR Code Scanner',
}) => {
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [scanned, setScanned] = useState(false);
  const [flashMode, setFlashMode] = useState<FlashMode>('off');
  const [cameraType, setCameraType] = useState<CameraType>('back');
  const [currentMode, setCurrentMode] = useState<'scan' | 'generate'>(mode);

  useEffect(() => {
    getCameraPermissions();
  }, []);

  useEffect(() => {
    setCurrentMode(mode);
  }, [mode]);

  useEffect(() => {
    if (visible) {
      setScanned(false);
    }
  }, [visible]);

  // Handle hardware back button on Android
  useEffect(() => {
    if (visible) {
      const backHandler = BackHandler.addEventListener('hardwareBackPress', () => {
        onClose();
        return true; // Prevent default behavior
      });

      return () => backHandler.remove();
    }
  }, [visible, onClose]);

  const getCameraPermissions = async () => {
    try {
      const { status } = await Camera.requestCameraPermissionsAsync();
      setHasPermission(status === 'granted');
    } catch (error) {
      console.error('Error requesting camera permission:', error);
      setHasPermission(false);
    }
  };

  const handleBarCodeScanned = (scanningResult: any) => {
    if (scanned) return;
    
    setScanned(true);
    
    try {
      const data = scanningResult.data || scanningResult;
      
      Alert.alert(
        'QR Code Scanned',
        `Data: ${data}`,
        [
          {
            text: 'Scan Again',
            onPress: () => setScanned(false),
            style: 'cancel',
          },
          {
            text: 'Use This',
            onPress: () => {
              onScanSuccess(data);
              onClose();
            },
          },
        ]
      );
    } catch (error) {
      console.error('Error handling scanned QR code:', error);
      Alert.alert('Error', 'Failed to process QR code data');
      setScanned(false);
    }
  };

  const toggleFlash = () => {
    const newFlashMode = flashMode === 'off' ? 'on' : 'off';
    setFlashMode(newFlashMode);
    
    // Optional: Add haptic feedback for better UX
    try {
      // You can add Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light) here if you want
      console.log(`Flash ${newFlashMode === 'on' ? 'enabled' : 'disabled'}`);
    } catch (error) {
      console.warn('Flash toggle error:', error);
    }
  };

  const toggleCameraType = () => {
    setCameraType(cameraType === 'back' ? 'front' : 'back');
  };

  const pickImageFromGallery = async () => {
    try {
      // Request permission to access media library
      const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
      
      if (!permissionResult.granted) {
        Alert.alert('Permission Required', 'Please allow access to your photo library to scan QR codes from images.');
        return;
      }

      // Launch image picker
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: 'images',
        allowsEditing: false,
        quality: 1,
      });

      if (!result.canceled && result.assets[0]) {
        // For now, show a helpful message since QR scanning from images
        // requires a development build rather than Expo Go
        Alert.alert(
          'Feature Coming Soon',
          'QR code scanning from gallery images is available in the production app. For now, please use the camera to scan QR codes directly.',
          [
            {
              text: 'OK',
              onPress: () => {},
            }
          ]
        );
      }
    } catch (error) {
      console.error('Error picking image from gallery:', error);
      Alert.alert('Error', 'Failed to access photo library. Please try again.');
    }
  };

  const generateQRData = () => {
    const paymentData = {
      type: 'payment_request',
      recipient: qrData || 'user@kotapay.com',
      amount: '',
      currency: 'USD',
      message: 'Payment request via KotaPay',
      timestamp: Date.now(),
    };
    
    return JSON.stringify(paymentData);
  };

  const shareQR = async () => {
    try {
      const qrDataToShare = currentMode === 'generate' ? generateQRData() : qrData;
      
      await Share.share({
        message: `Here's my KotaPay QR code for payments:\n\n${qrDataToShare}`,
        title: 'Share KotaPay QR Code',
      });
    } catch (error) {
      console.error('Error sharing QR code:', error);
      Alert.alert('Error', 'Failed to share QR code');
    }
  };

  const simulateQRScan = () => {
    // For Expo Go testing - simulate a QR code scan
    const mockQRData = {
      type: 'payment_request',
      recipient: 'john.doe@example.com',
      amount: '25.00',
      currency: 'USD',
      message: 'Coffee payment',
      timestamp: Date.now(),
    };
    
    Alert.alert(
      'Simulate QR Scan',
      'This simulates scanning a payment QR code for testing in Expo Go',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Test Scan',
          onPress: () => {
            onScanSuccess(JSON.stringify(mockQRData));
            onClose();
          },
        },
      ]
    );
  };

  const renderScannerView = () => {
    if (hasPermission === null) {
      return (
        <View style={styles.permissionContainer}>
          <Text style={styles.permissionText}>Requesting camera permission...</Text>
        </View>
      );
    }

    if (hasPermission === false) {
      return (
        <View style={styles.permissionContainer}>
          <CameraIcon size={64} color={colors.secondaryText} />
          <Text style={styles.permissionText}>No access to camera</Text>
          <Text style={styles.permissionSubtext}>
            Camera access is required to scan QR codes. Please enable camera access in your device settings.
          </Text>
          <TouchableOpacity style={styles.permissionButton} onPress={getCameraPermissions}>
            <Text style={styles.permissionButtonText}>Request Permission</Text>
          </TouchableOpacity>
          
          {/* Fallback for Expo Go */}
          <View style={styles.fallbackContainer}>
            <AlertCircle size={iconSizes.md} color={colors.warning} />
            <Text style={styles.fallbackText}>
              Testing in Expo Go? Use the simulate button below:
            </Text>
            <TouchableOpacity style={styles.simulateButton} onPress={simulateQRScan}>
              <Text style={styles.simulateButtonText}>Simulate QR Scan</Text>
            </TouchableOpacity>
          </View>
        </View>
      );
    }

    return (
      <View style={styles.cameraContainer}>
        <CameraView
          style={styles.camera}
          facing={cameraType}
          flash={flashMode}
          onBarcodeScanned={scanned ? undefined : handleBarCodeScanned}
          enableTorch={flashMode === 'on'}
        >
          {/* Scanner Overlay */}
          <View style={styles.scannerOverlay}>
            <View style={styles.scannerFrame}>
              <View style={[styles.corner, styles.topLeft]} />
              <View style={[styles.corner, styles.topRight]} />
              <View style={[styles.corner, styles.bottomLeft]} />
              <View style={[styles.corner, styles.bottomRight]} />
              
              {/* Scanning line animation placeholder */}
              <View style={styles.scanningLine} />
            </View>
          </View>

          {/* Scanner Instructions */}
          <View style={styles.instructionsContainer}>
            <Text style={styles.instructionText}>
              {scanned ? 'QR Code Detected!' : 'Point camera at QR code or tap gallery icon to scan from photos'}
            </Text>
            {flashMode === 'on' && !scanned && (
              <Text style={styles.flashStatusText}>
                💡 Flashlight is ON
              </Text>
            )}
            {scanned && (
              <TouchableOpacity
                style={styles.rescanButton}
                onPress={() => setScanned(false)}
              >
                <Text style={styles.rescanButtonText}>Tap to scan again</Text>
              </TouchableOpacity>
            )}
          </View>

          {/* Camera Controls */}
          <View style={styles.cameraControls}>
            <TouchableOpacity 
              style={[
                styles.controlButton, 
                flashMode === 'on' && styles.flashActiveButton
              ]} 
              onPress={toggleFlash}
            >
              {flashMode === 'on' ? (
                <Zap size={iconSizes.md} color={colors.warning} />
              ) : (
                <ZapOff size={iconSizes.md} color={colors.white} />
              )}
            </TouchableOpacity>

            <TouchableOpacity style={styles.controlButton} onPress={toggleCameraType}>
              <RotateCcw size={iconSizes.md} color={colors.white} />
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.controlButton} onPress={pickImageFromGallery}>
              <ImageIcon size={iconSizes.md} color={colors.white} />
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.controlButton} onPress={simulateQRScan}>
              <Text style={styles.simulateText}>Test</Text>
            </TouchableOpacity>
          </View>
        </CameraView>
      </View>
    );
  };

  const renderGeneratorView = () => {
    const qrDataToGenerate = qrData || generateQRData();

    return (
      <View style={styles.generatorContainer}>
        <View style={styles.qrContainer}>
          <View style={styles.qrCodeWrapper}>
            <QRCode
              value={qrDataToGenerate}
              size={200}
              color={colors.text}
              backgroundColor={colors.white}
            />
          </View>
          
          <Text style={styles.qrDataText} numberOfLines={3}>
            {qrDataToGenerate.length > 100 
              ? `${qrDataToGenerate.substring(0, 100)}...` 
              : qrDataToGenerate}
          </Text>
        </View>

        {/* Generator Controls */}
        <View style={styles.generatorControls}>
          <TouchableOpacity 
            style={styles.actionButton} 
            onPress={() => Alert.alert('Save QR', 'QR code saved to gallery! (Simulated in Expo Go)')}
          >
            <Download size={iconSizes.sm} color={colors.white} />
            <Text style={styles.actionButtonText}>Save to Gallery</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.actionButton} onPress={shareQR}>
            <Share2 size={iconSizes.sm} color={colors.white} />
            <Text style={styles.actionButtonText}>Share QR Code</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      onRequestClose={onClose}
    >
      <StatusBar barStyle="dark-content" backgroundColor={colors.background} translucent={false} />
      <SafeAreaView style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerBackground} />
          
          <TouchableOpacity style={styles.closeButton} onPress={onClose}>
            <View style={styles.closeButtonInner}>
              <X size={18} color={colors.primary} strokeWidth={3} />
            </View>
          </TouchableOpacity>
          
          <View style={styles.headerTitleContainer}>
            <Text style={styles.headerTitle}>
              {currentMode === 'scan' ? 'Scan QR Code' : 'My QR Code'}
            </Text>
            <View style={styles.titleUnderline} />
            <Text style={styles.headerSubtitle}>
              {currentMode === 'scan' ? 'Point camera at any QR code' : 'Share your payment code'}
            </Text>
          </View>
          
          <View style={styles.headerSpacer} />
        </View>

        {/* Content */}
        <View style={styles.content}>
          {currentMode === 'scan' ? renderScannerView() : renderGeneratorView()}
        </View>
      </SafeAreaView>
    </Modal>
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
    paddingVertical: spacing.lg,
    paddingTop: spacing.xl,
    backgroundColor: colors.background,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
    position: 'relative',
  },
  headerBackground: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: colors.background,
    opacity: 0.98,
  },
  closeButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1,
  },
  closeButtonInner: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.white,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: colors.border,
    ...shadows.small,
  },
  headerTitleContainer: {
    flex: 1,
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    zIndex: 1,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: '#1A1A1A',
    textAlign: 'center',
    marginBottom: 4,
    letterSpacing: 0.3,
  },
  titleUnderline: {
    width: 60,
    height: 3,
    backgroundColor: '#06402B',
    borderRadius: 2,
    marginBottom: 6,
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
    fontWeight: '500',
    lineHeight: 18,
  },
  headerSpacer: {
    width: 40,
  },
  content: {
    flex: 1,
  },
  
  // Scanner Styles
  cameraContainer: {
    flex: 1,
    backgroundColor: '#000000',
  },
  camera: {
    flex: 1,
  },
  scannerOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  scannerFrame: {
    width: 280,
    height: 280,
    position: 'relative',
  },
  corner: {
    position: 'absolute',
    width: 40,
    height: 40,
    borderColor: '#06402B',
    borderWidth: 4,
  },
  topLeft: {
    top: 0,
    left: 0,
    borderRightWidth: 0,
    borderBottomWidth: 0,
  },
  topRight: {
    top: 0,
    right: 0,
    borderLeftWidth: 0,
    borderBottomWidth: 0,
  },
  bottomLeft: {
    bottom: 0,
    left: 0,
    borderRightWidth: 0,
    borderTopWidth: 0,
  },
  bottomRight: {
    bottom: 0,
    right: 0,
    borderLeftWidth: 0,
    borderTopWidth: 0,
  },
  scanningLine: {
    position: 'absolute',
    top: '50%',
    left: 0,
    right: 0,
    height: 2,
    backgroundColor: '#06402B',
    opacity: 0.8,
    shadowColor: '#06402B',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 4,
  },
  instructionsContainer: {
    position: 'absolute',
    bottom: 140,
    left: 0,
    right: 0,
    alignItems: 'center',
    paddingHorizontal: spacing.xl,
  },
  instructionText: {
    fontSize: 16,
    color: colors.white,
    textAlign: 'center',
    marginBottom: spacing.sm,
    fontWeight: '500',
    textShadowColor: 'rgba(0, 0, 0, 0.5)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  flashStatusText: {
    fontSize: 14,
    color: colors.warning,
    textAlign: 'center',
    marginBottom: spacing.sm,
    fontWeight: '600',
    textShadowColor: 'rgba(0, 0, 0, 0.8)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
  rescanButton: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    backgroundColor: '#06402B',
    borderRadius: 25,
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.3)',
    ...shadows.medium,
  },
  rescanButtonText: {
    fontSize: 14,
    color: colors.white,
    fontWeight: '600',
  },
  cameraControls: {
    position: 'absolute',
    bottom: 40,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingHorizontal: spacing.xl,
  },
  controlButton: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.3)',
    ...shadows.medium,
  },
  flashActiveButton: {
    backgroundColor: 'rgba(255, 193, 7, 0.3)',
    borderColor: colors.warning,
    borderWidth: 3,
  },
  simulateText: {
    fontSize: 12,
    color: colors.white,
    fontWeight: 'bold',
  },

  // Generator Styles
  generatorContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.xl,
  },
  qrContainer: {
    alignItems: 'center',
    marginBottom: spacing.xxl,
  },
  qrCodeWrapper: {
    padding: spacing.lg,
    backgroundColor: colors.white,
    borderRadius: borderRadius.large,
    ...shadows.medium,
    marginBottom: spacing.lg,
  },
  qrDataText: {
    fontSize: 12,
    color: colors.secondaryText,
    textAlign: 'center',
    maxWidth: 280,
    lineHeight: 16,
  },
  generatorControls: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    backgroundColor: colors.primary,
    borderRadius: borderRadius.medium,
    gap: spacing.sm,
  },
  actionButtonText: {
    fontSize: 14,
    color: colors.white,
    fontWeight: '500',
  },

  // Permission Styles
  permissionContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.xl,
  },
  permissionText: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
    textAlign: 'center',
    marginTop: spacing.lg,
    marginBottom: spacing.sm,
  },
  permissionSubtext: {
    fontSize: 14,
    color: colors.secondaryText,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: spacing.xl,
  },
  permissionButton: {
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.md,
    backgroundColor: colors.primary,
    borderRadius: borderRadius.medium,
    marginBottom: spacing.xl,
  },
  permissionButtonText: {
    fontSize: 16,
    color: colors.white,
    fontWeight: '500',
  },
  
  // Fallback Styles
  fallbackContainer: {
    alignItems: 'center',
    backgroundColor: colors.accentTransparent,
    borderRadius: borderRadius.large,
    padding: spacing.lg,
    marginTop: spacing.lg,
  },
  fallbackText: {
    fontSize: 14,
    color: colors.text,
    textAlign: 'center',
    marginVertical: spacing.sm,
  },
  simulateButton: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    backgroundColor: colors.warning,
    borderRadius: borderRadius.medium,
    marginTop: spacing.sm,
  },
  simulateButtonText: {
    fontSize: 14,
    color: colors.white,
    fontWeight: '500',
  },
});

export default SimpleQRCodeModal;
