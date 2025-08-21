# KotaPay - Mobile Payment Application

A modern React Native mobile payment application built with Expo, featuring comprehensive financial services including money transfers, bill payments, virtual cards, and more.

## 🚀 Features

### Core Functionality
- **Money Transfers**: Send and receive money instantly
- **Bill Payments**: Pay for utilities, airtime, data, cable TV, and betting
- **Virtual Cards**: Create and manage virtual debit cards
- **QR Payments**: Scan and generate QR codes for payments
- **Contact Management**: Manage payment contacts with ease
- **Transaction History**: Track all your financial activities

### User Experience
- **Modern UI/UX**: Clean, intuitive interface with haptic feedback
- **Profile Management**: Comprehensive user profile with security settings
- **Notifications**: Real-time payment notifications
- **Biometric Security**: Fingerprint and Face ID authentication
- **Multi-language Support**: English and local language options

## 🛠 Tech Stack

- **Framework**: React Native with Expo SDK 53
- **Language**: TypeScript
- **Navigation**: React Navigation v7
- **Icons**: Lucide React Native
- **State Management**: React Context API
- **Storage**: AsyncStorage
- **Development**: VS Code with extensive tooling

## 🏗 Installation

### Prerequisites
- Node.js (v18 or later)
- npm or yarn
- Expo CLI
- iOS Simulator (for iOS development)
- Android Studio/Emulator (for Android development)

### Setup

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/kotapay.git
   cd kotapay
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start the development server**
   ```bash
   npx expo start
   ```

4. **Run on device/simulator**
   - **iOS**: Press `i` to open in iOS Simulator
   - **Android**: Press `a` to open in Android Emulator
   - **Web**: Press `w` to open in web browser
   - **Physical Device**: Scan QR code with Expo Go app

## 📂 Project Structure

```
kotapay/
├── src/
│   ├── components/          # Reusable UI components
│   ├── screens/             # Application screens
│   │   ├── profile/         # Profile-related screens
│   │   └── ...
│   ├── navigation/          # Navigation configuration
│   ├── services/            # API and external services
│   ├── contexts/            # React Context providers
│   ├── theme/               # Design system and styling
│   ├── types/               # TypeScript type definitions
│   └── utils/               # Utility functions
├── assets/                  # Static assets (images, fonts)
├── logo/                    # Network provider logos
├── ios/                     # iOS native code
└── ...
```

## 🎨 Key Features Detail

### Payment Services
- **Send Money**: Transfer funds to contacts or via phone number
- **Request Money**: Request payments from other users
- **Bill Payments**: Comprehensive bill payment system
- **Airtime/Data**: Mobile recharge services
- **Cable TV**: DSTV, GOTV, StarTimes subscriptions
- **Betting**: Sports betting payments

### Security Features
- **PIN Authentication**: 4-digit security PIN
- **Biometric Auth**: Fingerprint/Face ID support
- **Two-Factor Authentication**: Enhanced security options
- **Session Management**: Secure session handling

### Virtual Cards
- **Create Cards**: Generate virtual debit cards
- **Card Management**: Freeze/unfreeze, set limits
- **Transaction Tracking**: Monitor card usage
- **Top-up**: Add funds to virtual cards

## 🔧 Configuration

### Environment Setup
Create a `.env` file in the root directory:
```env
EXPO_PUBLIC_API_URL=your_api_url
EXPO_PUBLIC_APPWRITE_ENDPOINT=your_appwrite_endpoint
EXPO_PUBLIC_APPWRITE_PROJECT_ID=your_project_id
```

## 🚀 Deployment

### EAS Build
```bash
# Install EAS CLI
npm install -g @expo/eas-cli

# Configure EAS
eas build:configure

# Build for iOS
eas build --platform ios

# Build for Android
eas build --platform android
```

## 🧪 Testing

```bash
# Run TypeScript checks
npx tsc --noEmit

# Run ESLint
npx expo lint

# Clear cache
npx expo start --clear
```

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License.

## 👨‍💻 Author

**Bullionhead**
- GitHub: [@bullionhead](https://github.com/bullionhead)

## 📊 Project Status

- ✅ Core payment functionality
- ✅ User authentication & profiles  
- ✅ Virtual card management
- ✅ Bill payment services
- ✅ QR code functionality
- ✅ Modern UI/UX design
- ✅ Complete frontend implementation
- 🔄 Advanced security features (in progress)

---

**KotaPay** - Making payments simple, secure, and accessible for everyone.
