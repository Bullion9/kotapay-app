import React, { useState, useEffect } from 'react';
import { View, Alert, StyleSheet } from 'react-native';
import { useRoute, useNavigation, RouteProp } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../types';
import ReceiptGenerator from '../components/ReceiptGenerator';
import { receiptService, TransactionData } from '../services/receiptService';
import { colors } from '../theme';

type ReceiptScreenRouteProp = RouteProp<RootStackParamList, 'Receipt'>;
type ReceiptScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Receipt'>;

const ReceiptScreen: React.FC = () => {
  const route = useRoute<ReceiptScreenRouteProp>();
  const navigation = useNavigation<ReceiptScreenNavigationProp>();
  const [transaction, setTransaction] = useState<TransactionData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadReceiptData = async () => {
      try {
        setIsLoading(true);
        
        // Check if we have transaction data from navigation params
        const transactionData = route.params?.transaction;
        
        if (transactionData) {
          // Transaction data is already in the correct format from TransactionHistoryScreen
          setTransaction(transactionData);
        } else {
          // Create a demo receipt for testing
          const mockReceipt = receiptService.createMockReceipt('SENT', 5000);
          setTransaction(mockReceipt);
        }
      } catch (error) {
        console.error('Error loading receipt:', error);
        Alert.alert('Error', 'Failed to load receipt');
        navigation.goBack();
      } finally {
        setIsLoading(false);
      }
    };

    loadReceiptData();
  }, [route.params?.transaction, navigation]);

  const handleDownloadPDF = async () => {
    if (!transaction) return;

    try {
      Alert.alert('Download PDF', 'PDF download functionality would be implemented here with react-native-fs or similar library');
      // await receiptService.downloadReceiptPDF(transaction.id);
    } catch {
      Alert.alert('Error', 'Failed to download PDF');
    }
  };

  const handleReportIssue = async () => {
    if (!transaction) return;

    Alert.alert(
      'Report Issue',
      'What seems to be the problem with this receipt?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Wrong Amount', 
          onPress: () => reportIssue('The transaction amount is incorrect') 
        },
        { 
          text: 'Missing Details', 
          onPress: () => reportIssue('Some transaction details are missing') 
        },
        { 
          text: 'Other', 
          onPress: () => reportIssue('Other issue with the receipt') 
        },
      ]
    );
  };

  const reportIssue = async (description: string) => {
    if (!transaction) return;

    try {
      await receiptService.reportIssue(transaction.id, description);
      Alert.alert('Issue Reported', 'Thank you for reporting this issue. Our team will investigate.');
    } catch {
      Alert.alert('Error', 'Failed to report issue. Please try again.');
    }
  };

  const handleBack = () => {
    navigation.goBack();
  };

  if (isLoading || !transaction) {
    return (
      <View style={styles.loadingContainer}>
        {/* You could add a loading spinner here */}
      </View>
    );
  }

  return (
    <ReceiptGenerator
      transaction={transaction}
      onBack={handleBack}
      onDownloadPDF={handleDownloadPDF}
      onReportIssue={handleReportIssue}
    />
  );
};

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    backgroundColor: colors.background,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default ReceiptScreen;
