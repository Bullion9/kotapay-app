import React, { useRef, useEffect } from 'react';
import { NavigationContainer, NavigationContainerRef } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';

import { RootStackParamList, TabParamList, ProfileParamList } from '../types';
import { colors } from '../theme';
import { deepLinkService } from '../services/deepLinking';
import { 
  HomeIcon, 
  CardIcon, 
  ContactsIcon, 
  NavigationHistoryIcon, 
  NavigationProfileIcon 
} from '../components/icons';

// Screen imports
import {
  SplashScreen,
  OnboardingScreen,
  LoginScreen,
  RegisterScreen,
  PinSetupScreen,
  CreateAccountPinScreen,
  HomeScreen,
  SendMoneyScreen,
  CardScreen,
  CreateVirtualCardScreen,
  VirtualCardDetailScreen,
  TopUpVirtualCardScreen,
  FreezeCardScreen,
  WithdrawCardScreen,
  WithdrawalScreen,
  WithdrawalProcessingScreen,
  ContactsScreen,
  AddContactScreen,
  ContactDetailScreen,
  TransactionHistoryScreen,
  QRCodeScreen,
  QRScannerScreen,
  ProfileScreen,
  PersonalInformationScreen,
  AccountSettingsScreen,
  DocumentCenterScreen,
  AccountInformationScreen,
  FreezeAccountScreen,
  AccountStatementsScreen,
  KycLimitsScreen,
  TierDashboard,
  KycProcessingScreen,
  SuggestionBoxScreen,
  PaymentMethodsScreen,
  AddPaymentMethodScreen,
  RequestMoneyScreen,
  SettingsScreen,
  BillsHubScreen,
  BillPaymentScreen,
  CashOutScreen,
  TopUpScreen,
  BettingScreen,
  AirtimeTopUpScreen,
  DataTopUpScreen,
  CableTVScreen,
  ElectricityBillScreen,
  PayWithLinkScreen,
  ReceiptScreen,
  SecuritySettingsScreen,
  ChangePinScreen,
  TransactionLimitScreen,
  PreferencesScreen,
  TermsPrivacyScreen,
} from '../screens';

import NotificationScreen from '../screens/NotificationScreen';
import HelpSupportScreen from '../screens/HelpSupportScreen';
import FAQScreen from '../screens/FAQScreen';
import ReferralScreen from '../screens/ReferralScreen';

const Stack = createStackNavigator<RootStackParamList>();
const Tab = createBottomTabNavigator<TabParamList>();
const CardStack = createStackNavigator();
const ProfileStack = createStackNavigator<ProfileParamList>();

function CardStackNavigator() {
  return (
    <CardStack.Navigator
      screenOptions={{
        headerShown: false,
      }}
    >
      <CardStack.Screen 
        name="VirtualCardHub" 
        component={CardScreen}
      />
      <CardStack.Screen 
        name="CreateVirtualCardScreen" 
        component={CreateVirtualCardScreen}
      />
      <CardStack.Screen 
        name="VirtualCardDetailScreen" 
        component={VirtualCardDetailScreen}
      />
      <CardStack.Screen 
        name="TopUpVirtualCardScreen" 
        component={TopUpVirtualCardScreen}
      />
      <CardStack.Screen 
        name="FreezeCardScreen" 
        component={FreezeCardScreen}
      />
      <CardStack.Screen 
        name="WithdrawCardScreen" 
        component={WithdrawCardScreen}
      />
      <CardStack.Screen 
        name="WithdrawalScreen" 
        component={WithdrawalScreen}
      />
      <CardStack.Screen 
        name="WithdrawalProcessingScreen" 
        component={WithdrawalProcessingScreen}
      />
      <CardStack.Screen 
        name="TransactionHistoryScreen" 
        component={TransactionHistoryScreen}
      />
      <CardStack.Screen 
        name="ProfileMain" 
        component={ProfileScreen}
      />
      <CardStack.Screen 
        name="Notifications" 
        component={NotificationScreen}
      />
      <CardStack.Screen 
        name="SecuritySettings" 
        component={SecuritySettingsScreen}
      />
      <CardStack.Screen 
        name="HelpSupport" 
        component={HelpSupportScreen}
      />
      <CardStack.Screen 
        name="Settings" 
        component={SettingsScreen}
      />
      <CardStack.Screen 
        name="TermsPrivacy" 
        component={TermsPrivacyScreen}
      />
    </CardStack.Navigator>
  );
}

function ProfileStackNavigator() {
  return (
    <ProfileStack.Navigator
      screenOptions={{
        headerShown: false,
      }}
    >
      <ProfileStack.Screen 
        name="ProfileMain" 
        component={ProfileScreen}
      />
      <ProfileStack.Screen 
        name="PersonalInformation" 
        component={PersonalInformationScreen}
      />
      <ProfileStack.Screen 
        name="AccountSettings" 
        component={AccountSettingsScreen}
      />
      <ProfileStack.Screen 
        name="DocumentCenter" 
        component={DocumentCenterScreen}
      />
      <ProfileStack.Screen 
        name="AccountInformation" 
        component={AccountInformationScreen}
      />
      <ProfileStack.Screen 
        name="FreezeAccount" 
        component={FreezeAccountScreen}
      />
      <ProfileStack.Screen 
        name="AccountStatements" 
        component={AccountStatementsScreen}
      />
      <ProfileStack.Screen 
        name="KycLimits" 
        component={KycLimitsScreen}
      />
      <ProfileStack.Screen 
        name="TierDashboard" 
        component={TierDashboard}
      />
      <ProfileStack.Screen 
        name="KycProcessingScreen" 
        component={KycProcessingScreen}
      />
      <ProfileStack.Screen 
        name="SuggestionBox" 
        component={SuggestionBoxScreen}
      />
      <ProfileStack.Screen 
        name="PaymentMethods" 
        component={PaymentMethodsScreen}
      />
      <ProfileStack.Screen 
        name="AddPaymentMethod" 
        component={AddPaymentMethodScreen}
      />
      <ProfileStack.Screen 
        name="SecuritySettings" 
        component={SecuritySettingsScreen}
      />
      <ProfileStack.Screen 
        name="ChangePin" 
        component={ChangePinScreen}
      />
      <ProfileStack.Screen 
        name="TransactionLimit" 
        component={TransactionLimitScreen}
      />
      <ProfileStack.Screen 
        name="Preferences" 
        component={PreferencesScreen}
      />
      <ProfileStack.Screen 
        name="HelpSupport" 
        component={HelpSupportScreen}
      />
      <ProfileStack.Screen 
        name="FAQ" 
        component={FAQScreen}
      />
      <ProfileStack.Screen 
        name="ReferralProgram" 
        component={ReferralScreen}
      />
    </ProfileStack.Navigator>
  );
}

function TabNavigator() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          // Use a brighter color for inactive state
          const inactiveColor = colors.primary + 'B3'; // Adding 70% opacity
          const iconColor = focused ? colors.primary : inactiveColor;
          const iconSize = focused ? size + 2 : size;

          switch (route.name) {
            case 'Home':
              return <HomeIcon size={iconSize} color={iconColor} focused={focused} />;
            case 'Card':
              return <CardIcon size={iconSize} color={iconColor} focused={focused} />;
            case 'Contacts':
              return <ContactsIcon size={iconSize} color={iconColor} focused={focused} />;
            case 'History':
              return <NavigationHistoryIcon size={iconSize} color={iconColor} focused={focused} />;
            case 'Profile':
              return <NavigationProfileIcon size={iconSize} color={iconColor} focused={focused} />;
            default:
              return <HomeIcon size={iconSize} color={iconColor} focused={focused} />;
          }
        },
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.primary + 'B3', // Match icon color
        tabBarStyle: {
          backgroundColor: colors.background,
          borderTopColor: colors.border,
          height: 80, // Increased height for better visibility
          paddingBottom: 12, // More bottom padding
          paddingTop: 12, // More top padding
          elevation: 8, // Add elevation for Android
          shadowColor: '#000', // Add shadow for iOS
          shadowOffset: {
            width: 0,
            height: -2,
          },
          shadowOpacity: 0.1,
          shadowRadius: 4,
        },
        headerShown: false,
      })}
    >
      <Tab.Screen 
        name="Home" 
        component={HomeScreen}
        options={{ title: 'Home' }}
      />
      <Tab.Screen 
        name="Card" 
        component={CardStackNavigator}
        options={{ title: 'Card' }}
      />
      <Tab.Screen 
        name="Contacts" 
        component={ContactsScreen}
        options={{ title: 'Contacts' }}
      />
      <Tab.Screen 
        name="History" 
        component={TransactionHistoryScreen}
        options={{ title: 'History' }}
      />
      <Tab.Screen 
        name="Profile" 
        component={ProfileStackNavigator}
        options={{ title: 'Profile' }}
      />
    </Tab.Navigator>
  );
}

export default function AppNavigator() {
  const navigationRef = useRef<NavigationContainerRef<RootStackParamList>>(null);

  useEffect(() => {
    // Set navigation ref for deep linking
    if (navigationRef.current) {
      deepLinkService.setNavigationRef(navigationRef.current);
    }

    // Initialize deep linking
    const initDeepLinking = async () => {
      try {
        await deepLinkService.initialize();
      } catch (error) {
        console.error('Failed to initialize deep linking:', error);
      }
    };

    initDeepLinking();
  }, []);

  return (
    <NavigationContainer ref={navigationRef}>
      <Stack.Navigator 
        initialRouteName="Splash"
        screenOptions={{
          headerStyle: {
            backgroundColor: colors.background,
          },
          headerTintColor: colors.text,
          headerTitleStyle: {
            fontWeight: '600',
          },
        }}
      >
        <Stack.Screen 
          name="Splash" 
          component={SplashScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen 
          name="Onboarding" 
          component={OnboardingScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen 
          name="Login" 
          component={LoginScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen 
          name="Register" 
          component={RegisterScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen 
          name="PinSetup" 
          component={PinSetupScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen 
          name="CreateAccountPin" 
          component={CreateAccountPinScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen 
          name="MainTabs" 
          component={TabNavigator}
          options={{ headerShown: false }}
        />
        <Stack.Screen 
          name="SendMoney" 
          component={SendMoneyScreen}
          options={{ 
            headerShown: false
          }}
        />
        <Stack.Screen 
          name="RequestMoney" 
          component={RequestMoneyScreen}
          options={{ 
            headerShown: false
          }}
        />
        <Stack.Screen 
          name="QRScanner" 
          component={QRScannerScreen}
          options={{ 
            headerShown: false
          }}
        />
        <Stack.Screen 
          name="QRCode" 
          component={QRCodeScreen}
          options={{ 
            headerShown: false
          }}
        />
        <Stack.Screen 
          name="Settings" 
          component={SettingsScreen}
          options={{ 
            title: 'Settings',
            headerBackTitle: 'Back'
          }}
        />
        <Stack.Screen 
          name="Notifications" 
          component={NotificationScreen}
          options={{ 
            headerShown: false
          }}
        />
        <Stack.Screen 
          name="Receipt" 
          component={ReceiptScreen}
          options={{ 
            headerShown: false
          }}
        />
        <Stack.Screen 
          name="Contacts" 
          component={ContactsScreen}
          options={{ 
            title: 'Contacts',
            headerBackTitle: 'Back'
          }}
        />
        <Stack.Screen 
          name="AddContact" 
          component={AddContactScreen}
          options={{ 
            headerShown: false
          }}
        />
        <Stack.Screen 
          name="ContactDetail" 
          component={ContactDetailScreen}
          options={{ 
            headerShown: false
          }}
        />
        <Stack.Screen 
          name="Transactions" 
          component={TransactionHistoryScreen}
          options={{ 
            headerShown: false
          }}
        />
        <Stack.Screen 
          name="BillsHub" 
          component={BillsHubScreen}
          options={{ 
            headerShown: false
          }}
        />
        <Stack.Screen 
          name="BillPayment" 
          component={BillPaymentScreen}
          options={{ 
            headerShown: false // We handle header in the component
          }}
        />
        <Stack.Screen 
          name="CashOut" 
          component={CashOutScreen}
          options={{ 
            headerShown: false // We handle header in the component
          }}
        />
        <Stack.Screen 
          name="TopUp" 
          component={TopUpScreen}
          options={{ 
            headerShown: false // We handle header in the component
          }}
        />
        <Stack.Screen 
          name="Betting" 
          component={BettingScreen}
          options={{ 
            headerShown: false // We handle header in the component
          }}
        />
        <Stack.Screen 
          name="BettingScreen" 
          component={BettingScreen}
          options={{ 
            headerShown: false // We handle header in the component
          }}
        />
        <Stack.Screen 
          name="AirtimeTopUp" 
          component={AirtimeTopUpScreen}
          options={{ 
            headerShown: false // We handle header in the component
          }}
        />
        <Stack.Screen 
          name="AirtimeTopUpScreen" 
          component={AirtimeTopUpScreen}
          options={{ 
            headerShown: false // We handle header in the component
          }}
        />
        <Stack.Screen 
          name="DataTopUpScreen" 
          component={DataTopUpScreen}
          options={{ 
            headerShown: false // We handle header in the component
          }}
        />
        <Stack.Screen 
          name="CableTVScreen" 
          component={CableTVScreen}
          options={{ 
            headerShown: false // We handle header in the component
          }}
        />
        <Stack.Screen 
          name="ElectricityBillScreen" 
          component={ElectricityBillScreen}
          options={{ 
            headerShown: false // We handle header in the component
          }}
        />
        <Stack.Screen 
          name="PayWithLink" 
          component={PayWithLinkScreen}
          options={{ 
            headerShown: false // We handle header in the component
          }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
