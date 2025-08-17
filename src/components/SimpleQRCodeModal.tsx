import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  Alert,
  StatusBar,
  Share,
  BackHandler,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Camera, CameraView, CameraType, FlashMode } from 'expo-camera';
import * as ImagePicker from 'expo-image-picker';
import QRCode from 'react-native-qrcode-svg';
import {
  X,
  Zap,
  ZapOff,
  Download,
  Share2,
  QrCode,
  Camera as CameraIcon,
  RotateCcw,
  AlertCircle,
  Image as ImageIcon,
} from 'lucide-react-native';
import { colors, spacing, shadows, borderRadius, iconSizes } from '../theme';

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
    setFlashMode(flashMode === 'off' ? 'on' : 'off');
  };

  const toggleCameraType = () => {
    setCameraType(cameraType === 'back' ? 'front' : 'back');
  };

  const switchMode = () => {
    setCurrentMode(currentMode === 'scan' ? 'generate' : 'scan');
    setScanned(false);
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
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
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
        >
          {/* Scanner Overlay */}
          <View style={styles.scannerOverlay}>
            <View style={styles.scannerFrame}>
              <View style={[styles.corner, styles.topLeft]} />
              <View style={[styles.corner, styles.topRight]} />
              <View style={[styles.corner, styles.bottomLeft]} />
              <View style={[styles.corner, styles.bottomRight]} />
            </View>
          </View>

          {/* Scanner Instructions */}
          <View style={styles.instructionsContainer}>
            <Text style={styles.instructionText}>
              {scanned ? 'QR Code Detected!' : 'Point camera at QR code or tap gallery icon to scan from photos'}
            </Text>
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
            <TouchableOpacity style={styles.controlButton} onPress={toggleFlash}>
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
      <StatusBar barStyle="light-content" backgroundColor={colors.primary} />
      <SafeAreaView style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity style={styles.closeButton} onPress={onClose}>
            <X size={iconSizes.md} color={colors.white} />
          </TouchableOpacity>
          
          <Text style={styles.headerTitle}>
            {currentMode === 'scan' ? 'Scan QR Code' : 'My QR Code'}
          </Text>
          
          <TouchableOpacity style={styles.modeButton} onPress={switchMode}>
            <QrCode size={iconSizes.md} color={colors.white} />
          </TouchableOpacity>
        </View>

        {/* Content */}
        <View style={styles.content}>
          {currentMode === 'scan' ? renderScannerView() : renderGeneratorView()}
        </View>

        {/* Mode Toggle */}
        <View style={styles.modeToggle}>
          <TouchableOpacity
            style={[
              styles.modeToggleButton,
              currentMode === 'scan' && styles.modeToggleButtonActive,
            ]}
            onPress={() => setCurrentMode('scan')}
          >
            <CameraIcon size={iconSizes.sm} color={currentMode === 'scan' ? colors.white : colors.text} />
            <Text style={[
              styles.modeToggleText,
              currentMode === 'scan' && styles.modeToggleTextActive,
            ]}>
              Scan
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.modeToggleButton,
              currentMode === 'generate' && styles.modeToggleButtonActive,
            ]}
            onPress={() => setCurrentMode('generate')}
          >
            <QrCode size={iconSizes.sm} color={currentMode === 'generate' ? colors.white : colors.text} />
            <Text style={[
              styles.modeToggleText,
              currentMode === 'generate' && styles.modeToggleTextActive,
            ]}>
              Generate
            </Text>
          </TouchableOpacity>
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
    paddingVertical: spacing.md,
    paddingTop: spacing.xl,
    backgroundColor: colors.primary,
    borderBottomLeftRadius: borderRadius.large,
    borderBottomRightRadius: borderRadius.large,
    ...shadows.medium,
  },
  closeButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.white,
  },
  modeButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
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
    width: 250,
    height: 250,
    position: 'relative',
  },
  corner: {
    position: 'absolute',
    width: 30,
    height: 30,
    borderColor: colors.white,
    borderWidth: 3,
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
  instructionsContainer: {
    position: 'absolute',
    bottom: 120,
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
  },
  rescanButton: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    backgroundColor: colors.primary,
    borderRadius: borderRadius.medium,
  },
  rescanButtonText: {
    fontSize: 14,
    color: colors.white,
    fontWeight: '500',
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
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    alignItems: 'center',
    justifyContent: 'center',
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

  // Mode Toggle Styles
  modeToggle: {
    flexDirection: 'row',
    margin: spacing.lg,
    backgroundColor: colors.white,
    borderRadius: borderRadius.large,
    padding: 4,
    ...shadows.small,
  },
  modeToggleButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.md,
    borderRadius: borderRadius.medium,
    gap: spacing.xs,
  },
  modeToggleButtonActive: {
    backgroundColor: colors.primary,
  },
  modeToggleText: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.text,
  },
  modeToggleTextActive: {
    color: colors.white,
  },
});

export default SimpleQRCodeModal;
