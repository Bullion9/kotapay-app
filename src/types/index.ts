export interface User {
  id: string;
  name: string;
  email: string;
  phone?: string;
  balance: number;
  isVerified: boolean;
  pin?: string;
  createdAt: string;
  updatedAt: string;
  // Additional profile fields
  address?: string;
  dateOfBirth?: string;
  nationality?: string;
}

export interface Transaction {
  id: string;
  type: 'send' | 'receive' | 'request';
  amount: number;
  description?: string;
  fromUserId: string;
  toUserId: string;
  status: 'pending' | 'completed' | 'failed' | 'cancelled';
  createdAt: string;
  updatedAt: string;
  fromUser?: User;
  toUser?: User;
}

export interface TransactionRequest {
  id: string;
  amount: number;
  description?: string;
  fromUserId: string;
  toUserId: string;
  status: 'pending' | 'accepted' | 'declined' | 'expired';
  createdAt: string;
  updatedAt: string;
  fromUser?: User;
  toUser?: User;
}

export interface Contact {
  id: string;
  name: string;
  phone: string;
  email?: string;
  profileImage?: string; // URI to profile picture
  isRegistered: boolean;
}

export interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'transaction' | 'request' | 'system' | 'security';
  isRead: boolean;
  userId: string;
  relatedId?: string; // Transaction or request ID
  createdAt: string;
}

export interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string, phone?: string) => Promise<void>;
  logout: () => Promise<void>;
  updateUser: (userData: Partial<User>) => Promise<void>;
  verifyPin: (pin: string) => Promise<boolean>;
  updatePin: (currentPin: string, newPin: string) => Promise<void>;
  deleteAccount: () => Promise<void>;
}

export interface QRData {
  type: 'payment' | 'user' | 'request';
  userId?: string;
  amount?: number;
  description?: string;
  requestId?: string;
}

export type RootStackParamList = {
  Splash: undefined;
  Onboarding: undefined;
  Login: undefined;
  Register: undefined;
  PinSetup: undefined;
  CreateAccountPin: undefined;
  MainTabs: undefined;
  SendMoney: { scannedData?: string };
  RequestMoney: { requesterId?: string; scannedData?: string };
  TransactionDetail: { transactionId: string };
  Receipt: { transaction?: any };
  QRScanner: undefined;
  QRCode: undefined;
  Settings: undefined;
  Profile: undefined;
  Transactions: undefined;
  Contacts: { scannedData?: string };
  AddContact: undefined;
  ContactDetail: { contact: Contact };
  Notifications: undefined;
  BillsHub: undefined;
  BillPayment: { category: string; title: string; scannedData?: string };
  CashOut: undefined;
  TopUp: undefined;
  Betting: undefined;
  BettingScreen: undefined;
  AirtimeTopUp: undefined;
  AirtimeTopUpScreen: undefined;
  DataTopUpScreen: undefined;
  CableTVScreen: undefined;
  ElectricityBillScreen: undefined;
  CreateVirtualCardScreen: undefined;
  VirtualCardDetailScreen: { cardId: string };
  TopUpVirtualCardScreen: { cardId: string };
  PayWithLink: { linkId: string };
};

export type TabParamList = {
  Home: undefined;
  Card: undefined;
  Contacts: undefined;
  History: undefined;
  Profile: undefined;
};

export type ProfileParamList = {
  ProfileMain: undefined;
  PersonalInformation: undefined;
  AccountSettings: undefined;
  DocumentCenter: undefined;
  AccountInformation: undefined;
  FreezeAccount: undefined;
  AccountStatements: undefined;
  KycLimits: undefined;
  TierDashboard: undefined;
  KycProcessingScreen: { submissionData: any };
  SuggestionBox: undefined;
  PaymentMethods: undefined;
  AddPaymentMethod: undefined;
  SecuritySettings: undefined;
  ChangePin: undefined;
  TransactionLimit: undefined;
  Preferences: undefined;
  HelpSupport: undefined;
  FAQ: undefined;
  ReferralProgram: undefined;
};
