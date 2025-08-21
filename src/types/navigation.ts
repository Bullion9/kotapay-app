import { NavigatorScreenParams } from '@react-navigation/native';

export type RootStackParamList = {
  Home: undefined;
  PaymentMethods: undefined;
  AddPaymentMethod: undefined;
  SecuritySettings: undefined;
  ChangePin: undefined;
  TransactionLimit: undefined;
  Preferences: undefined;
  KycLimitsScreen: undefined;
  KycProcessingScreen: {
    documentsCount: number;
    targetTier: string;
    submissionId: string;
  };
};

export type CardStackParamList = {
  VirtualCardHub: undefined;
  CreateVirtualCardScreen: undefined;
  VirtualCardDetailScreen: { cardId: string };
  TopUpVirtualCardScreen: { cardId: string };
  WithdrawalScreen: {
    cardId: string;
    availableBalance: number;
    cardNickname: string;
  };
  WithdrawalProcessingScreen: {
    amount: number;
    cardNickname: string;
    transactionId: string;
  };
  TransactionHistoryScreen: undefined;
};

export type TabParamList = {
  HomeTab: NavigatorScreenParams<RootStackParamList>;
  Transactions: undefined;
  Cards: NavigatorScreenParams<CardStackParamList>;
  Profile: undefined;
};
