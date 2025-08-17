import React, { useRef, useEffect } from 'react';
import { NavigationContainer, NavigationContainerRef } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { 
  Home, 
  CreditCard, 
  Users, 
  Clock, 
  User
} from 'lucide-react-native';

import { RootStackParamList, TabParamList } from '../types';
import { colors } from '../theme';
import { deepLinkService } from '../services/deepLinking';

// Screen imports
import {
  SplashScreen,
  OnboardingScreen,
  LoginScreen,
  RegisterScreen,
  PinSetupScreen,
  HomeScreen,
  SendMoneyScreen,
  VirtualCardHubScreen,
  CreateVirtualCardScreen,
  VirtualCardDetailScreen,
  TopUpVirtualCardScreen,
  ContactsScreen,
  AddContactScreen,
  ContactDetailScreen,
  TransactionHistoryScreen,
  QRCodeScreen,
  QRScannerScreen,
  ProfileScreen,
  RequestMoneyScreen,
  SettingsScreen,
  BillsHubScreen,
  BillPaymentScreen,
  CashOutScreen,
  TopUpScreen,
  BettingScreen,
  AirtimeTopUpScreen,
} from '../screens';

import NotificationScreen from '../screens/NotificationScreen';

const Stack = createStackNavigator<RootStackParamList>();
const Tab = createBottomTabNavigator<TabParamList>();
const CardStack = createStackNavigator();

function CardStackNavigator() {
  return (
    <CardStack.Navigator
      screenOptions={{
        headerShown: false,
      }}
    >
      <CardStack.Screen 
        name="VirtualCardHub" 
        component={VirtualCardHubScreen}
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
        name="TransactionHistoryScreen" 
        component={TransactionHistoryScreen}
      />
    </CardStack.Navigator>
  );
}

function TabNavigator() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let IconComponent;

          switch (route.name) {
            case 'Home':
              IconComponent = Home;
              break;
            case 'Card':
              IconComponent = CreditCard;
              break;
            case 'Contacts':
              IconComponent = Users;
              break;
            case 'History':
              IconComponent = Clock;
              break;
            case 'Profile':
              IconComponent = User;
              break;
            default:
              IconComponent = Home;
          }

          return <IconComponent size={size} color={color} />;
        },
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.secondaryText,
        tabBarStyle: {
          backgroundColor: colors.background,
          borderTopColor: colors.border,
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
        component={ProfileScreen}
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
            title: 'Transaction History',
            headerBackTitle: 'Back'
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
          name="AirtimeTopUp" 
          component={AirtimeTopUpScreen}
          options={{ 
            headerShown: false // We handle header in the component
          }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
