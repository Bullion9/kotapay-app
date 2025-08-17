# QR Code Scanner Documentation

## Overview
The QR Code Scanner feature allows users to scan QR codes for payments and generate their own QR codes for receiving payments. This feature is built using expo-camera, expo-barcode-scanner, and react-native-qrcode-svg.

## Features Implemented

### 1. QR Code Scanning
- **Camera Integration**: Uses expo-camera with barcode scanning capabilities
- **Permission Handling**: Requests camera permissions automatically
- **Flash Control**: Toggle flash on/off for better scanning in dark environments
- **Camera Switching**: Switch between front and back cameras
- **Scan Frame Overlay**: Visual scanning frame with corner guides
- **Re-scan Functionality**: Tap to scan again after successful scan

### 2. QR Code Generation
- **Payment QR Codes**: Generate QR codes for payment requests
- **Custom Logo**: Includes KotaPay logo in generated QR codes
- **Data Preview**: Shows QR code data in readable format
- **Real-time Generation**: Updates QR code based on user data

### 3. QR Code Sharing & Saving
- **Share QR Code**: Share QR code data via native share sheet
- **Save to Gallery**: Save QR code images to device photo gallery (requires media library permissions)
- **Copy Data**: Copy QR code data to clipboard

### 4. User Interface
- **Modal Interface**: Full-screen modal with intuitive controls
- **Mode Toggle**: Switch between scan and generate modes
- **Visual Feedback**: Clear instructions and status indicators
- **Responsive Design**: Works on different screen sizes
- **Theme Consistency**: Follows KotaPay design system

## Usage

### From Home Screen
1. Tap the "QR Code" quick action button
2. The QR Scanner screen opens with options to scan or generate

### Scanning QR Codes
1. In the QR Scanner screen, tap "Scan QR Code"
2. Point camera at a QR code
3. The app automatically detects and processes the QR code
4. For payment QR codes, it navigates to the Send Money screen
5. For other QR codes, it shows the data in an alert

### Generating QR Codes
1. In the QR Scanner screen, tap "My QR Code"
2. The app generates a payment request QR code
3. Use the "Save to Gallery" button to save the QR code
4. Use the "Share QR Code" button to share via messaging apps

### In Modal Interface
- **Header**: Close button, title, and mode switch button
- **Scanner View**: Camera view with scanning overlay and controls
- **Generator View**: QR code display with action buttons
- **Bottom Toggle**: Switch between scan and generate modes

## QR Code Data Format

### Payment Request Format
```json
{
  "type": "payment_request",
  "recipient": "user@kotapay.com",
  "amount": "",
  "currency": "USD", 
  "message": "Payment request via KotaPay",
  "timestamp": 1634567890123
}
```

### Recognition
- The app automatically recognizes KotaPay payment QR codes
- Other QR codes are displayed as plain text
- JSON data is parsed and formatted for better readability

## Technical Implementation

### Dependencies
- **expo-camera**: Camera access and barcode scanning
- **expo-barcode-scanner**: QR code detection
- **expo-media-library**: Save images to photo gallery
- **react-native-qrcode-svg**: QR code generation
- **react-native-svg**: SVG rendering support

### Components
- **QRCodeScannerModal**: Main modal component with scan/generate functionality
- **QRScannerScreen**: Navigation screen with action cards and info
- **HomeScreen Integration**: Quick access via QR Code action button

### Navigation
- Route: `QRScanner`
- Navigation: Accessible from Home screen quick actions
- Deep linking: Supports navigation to Send Money screen from scanned payment QR codes

### Permissions
- **Camera Permission**: Required for scanning QR codes
- **Media Library Permission**: Required for saving QR codes to gallery
- **Graceful Fallback**: Clear error messages and permission request buttons

## Error Handling
- **Permission Denied**: Shows clear message with option to request again
- **Camera Unavailable**: Fallback UI with error message
- **Invalid QR Code**: Handles malformed data gracefully
- **Network Issues**: Local QR code generation works offline

## Security Considerations
- **Data Validation**: Validates QR code data before processing
- **Permission Checks**: Only requests necessary permissions
- **Local Processing**: QR code generation happens locally
- **No Data Storage**: QR code data is not stored permanently

## Future Enhancements
- **Batch Scanning**: Scan multiple QR codes in sequence
- **History**: Keep history of scanned QR codes
- **Custom Templates**: Create QR codes with different templates
- **Contact QR Codes**: Generate QR codes for adding contacts
- **Advanced Sharing**: Share QR codes as images instead of text

## Testing
1. **Scanner Testing**: Test with various QR code types
2. **Permission Testing**: Test permission flows on first launch
3. **Generation Testing**: Verify QR code generation with different data
4. **Navigation Testing**: Confirm proper navigation from scanned payment QR codes
5. **Error Testing**: Test error scenarios (no camera, denied permissions, etc.)

## Known Limitations
- **Expo Go**: Full functionality requires development build for production
- **Flash**: Flash might not work on all devices in Expo Go
- **Gallery Save**: Simplified implementation - production would use FileSystem
- **Multiple Formats**: Currently optimized for KotaPay payment QR codes

The QR Code Scanner is fully functional and ready for testing in the Expo Go app!
