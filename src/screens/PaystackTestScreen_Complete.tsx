import React, { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    SafeAreaView,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';
import { usePaystack } from '../hooks/usePaystack';

const PaystackTestScreen: React.FC = () => {
  const {
    checkHealth,
    initializePayment,
    verifyPayment,
    getBanks,
    resolveAccount,
    createTransferRecipient,
    initiateTransfer,
    getTransactions,
    banks,
    loading,
    error,
    clearError,
    // Individual loading states
    initializingPayment,
    loadingBanks,
    resolvingAccount,
  } = usePaystack();

  const [healthStatus, setHealthStatus] = useState<any>(null);
  const [testReference, setTestReference] = useState<string>('');
  const [accountNumber, setAccountNumber] = useState<string>('0123456789');
  const [selectedBankCode, setSelectedBankCode] = useState<string>('044');
  const [selectedBank, setSelectedBank] = useState<any>(null);
  const [transferRecipient, setTransferRecipient] = useState<any>(null);

  // Load banks on mount
  useEffect(() => {
    getBanks();
  }, [getBanks]);

  // Update selected bank when bank code changes
  useEffect(() => {
    if (banks.length > 0 && selectedBankCode) {
      const bank = banks.find(b => b.code === selectedBankCode);
      setSelectedBank(bank);
    }
  }, [banks, selectedBankCode]);

  const handleHealthCheck = async () => {
    try {
      const status = await checkHealth();
      setHealthStatus(status);
      Alert.alert('Success', 'Backend is healthy!');
    } catch (err) {
      console.error('Health check failed:', err);
    }
  };

  const handleTestPayment = async () => {
    try {
      const paymentData = await initializePayment({
        email: 'test@kotapay.com',
        amount: 500000, // ₦5,000 in kobo
        metadata: {
          custom_fields: [
            {
              display_name: "Test Type",
              variable_name: "test_type",
              value: "integration_test"
            }
          ]
        }
      });
      
      if (paymentData?.data?.reference) {
        setTestReference(paymentData.data.reference);
        Alert.alert(
          'Payment Initialized', 
          `Reference: ${paymentData.data.reference}\nAuthorization URL ready for testing`
        );
      }
    } catch (err) {
      console.error('Payment initialization failed:', err);
    }
  };

  const handleVerifyPayment = async (reference?: string) => {
    const ref = reference || testReference;
    if (!ref) {
      Alert.alert('Error', 'No payment reference to verify');
      return;
    }

    try {
      const verification = await verifyPayment(ref);
      const status = verification?.data?.status || 'unknown';
      Alert.alert(
        'Payment Verification', 
        `Status: ${status}\nAmount: ₦${(verification?.data?.amount || 0) / 100}`
      );
    } catch (err) {
      console.error('Payment verification failed:', err);
    }
  };

  const handleAccountResolution = async () => {
    if (!accountNumber || !selectedBankCode) {
      Alert.alert('Error', 'Please provide account number and bank code');
      return;
    }

    try {
      const account = await resolveAccount(accountNumber, selectedBankCode);
      Alert.alert(
        'Account Resolved', 
        `Name: ${account?.data?.account_name || 'Unknown'}\nNumber: ${account?.data?.account_number || accountNumber}`
      );
    } catch (err) {
      console.error('Account resolution failed:', err);
    }
  };

  const handleCreateTransferRecipient = async () => {
    if (!accountNumber || !selectedBankCode) {
      Alert.alert('Error', 'Please provide account number and bank code');
      return;
    }

    try {
      // First resolve the account to get the name
      const accountData = await resolveAccount(accountNumber, selectedBankCode);
      
      if (accountData?.data?.account_name) {
        const recipient = await createTransferRecipient({
          type: 'nuban',
          name: accountData.data.account_name,
          account_number: accountNumber,
          bank_code: selectedBankCode,
        });
        
        setTransferRecipient(recipient?.data);
        Alert.alert(
          'Transfer Recipient Created', 
          `Code: ${recipient?.data?.recipient_code}\nName: ${recipient?.data?.name}`
        );
      }
    } catch (err) {
      console.error('Transfer recipient creation failed:', err);
    }
  };

  const handleTestTransfer = async () => {
    if (!transferRecipient) {
      Alert.alert('Error', 'Please create a transfer recipient first');
      return;
    }

    try {
      const transfer = await initiateTransfer({
        source: 'balance',
        amount: 10000, // ₦100 in kobo
        recipient: transferRecipient.recipient_code,
        reason: 'Integration test transfer',
      });
      
      Alert.alert(
        'Transfer Initiated', 
        `Reference: ${transfer?.data?.reference}\nStatus: ${transfer?.data?.status}`
      );
    } catch (err) {
      console.error('Transfer initiation failed:', err);
    }
  };

  const handleGetTransactions = async () => {
    try {
      const transactions = await getTransactions();
      const count = transactions?.data?.length || 0;
      Alert.alert(
        'Transactions Retrieved', 
        `Found ${count} transactions\nCheck console for details`
      );
      console.log('Transactions:', transactions?.data);
    } catch (err) {
      console.error('Get transactions failed:', err);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.content}>
        <Text style={styles.title}>KotaPay Backend Integration Test</Text>
        
        {/* Health Status */}
        {healthStatus && (
          <View style={styles.statusCard}>
            <Text style={styles.statusTitle}>Backend Status</Text>
            <Text style={styles.statusText}>✅ {healthStatus.message}</Text>
            <Text style={styles.statusDetail}>Environment: {healthStatus.environment}</Text>
            <Text style={styles.statusDetail}>Version: {healthStatus.version}</Text>
            <Text style={styles.statusDetail}>Uptime: {Math.floor(healthStatus.uptime)}s</Text>
            <Text style={styles.statusDetail}>
              Services: Paystack {healthStatus.services.paystack}, 
              Appwrite {healthStatus.services.appwrite}
            </Text>
          </View>
        )}

        {/* Error Display */}
        {error && (
          <View style={styles.errorCard}>
            <Text style={styles.errorText}>Error: {error}</Text>
            <TouchableOpacity style={styles.clearErrorButton} onPress={clearError}>
              <Text style={styles.clearErrorText}>Clear Error</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Test Reference Display */}
        {testReference && (
          <View style={styles.infoCard}>
            <Text style={styles.infoTitle}>Last Payment Reference</Text>
            <Text style={styles.infoText}>{testReference}</Text>
          </View>
        )}

        {/* Banks Information */}
        <View style={styles.infoCard}>
          <Text style={styles.infoTitle}>Available Banks</Text>
          <Text style={styles.infoText}>
            {loadingBanks ? 'Loading banks...' : `${banks.length} banks loaded`}
          </Text>
          {selectedBank && (
            <Text style={styles.infoText}>Selected: {selectedBank.name} ({selectedBank.code})</Text>
          )}
        </View>

        {/* Account Input Section */}
        <View style={styles.inputCard}>
          <Text style={styles.inputTitle}>Test Account Details</Text>
          <TextInput
            style={styles.textInput}
            placeholder="Account Number"
            value={accountNumber}
            onChangeText={setAccountNumber}
            keyboardType="numeric"
          />
          <TextInput
            style={styles.textInput}
            placeholder="Bank Code"
            value={selectedBankCode}
            onChangeText={setSelectedBankCode}
          />
        </View>

        {/* Transfer Recipient Status */}
        {transferRecipient && (
          <View style={styles.successCard}>
            <Text style={styles.successTitle}>Transfer Recipient Ready</Text>
            <Text style={styles.successText}>
              Code: {transferRecipient.recipient_code}
            </Text>
            <Text style={styles.successText}>
              Name: {transferRecipient.name}
            </Text>
          </View>
        )}

        {/* Test Buttons */}
        <View style={styles.buttonContainer}>
          <TouchableOpacity 
            style={styles.button} 
            onPress={handleHealthCheck}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#fff" size="small" />
            ) : (
              <Text style={styles.buttonText}>🏥 Check Backend Health</Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.button} 
            onPress={handleTestPayment}
            disabled={initializingPayment}
          >
            {initializingPayment ? (
              <ActivityIndicator color="#fff" size="small" />
            ) : (
              <Text style={styles.buttonText}>💰 Initialize Payment (₦5,000)</Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.button} 
            onPress={() => handleVerifyPayment()}
            disabled={loading || !testReference}
          >
            {loading ? (
              <ActivityIndicator color="#fff" size="small" />
            ) : (
              <Text style={styles.buttonText}>✅ Verify Last Payment</Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.button} 
            onPress={handleAccountResolution}
            disabled={resolvingAccount}
          >
            {resolvingAccount ? (
              <ActivityIndicator color="#fff" size="small" />
            ) : (
              <Text style={styles.buttonText}>🔍 Resolve Account</Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.button} 
            onPress={handleCreateTransferRecipient}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#fff" size="small" />
            ) : (
              <Text style={styles.buttonText}>👤 Create Transfer Recipient</Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.button} 
            onPress={handleTestTransfer}
            disabled={loading || !transferRecipient}
          >
            {loading ? (
              <ActivityIndicator color="#fff" size="small" />
            ) : (
              <Text style={styles.buttonText}>💸 Test Transfer (₦100)</Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.button} 
            onPress={handleGetTransactions}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#fff" size="small" />
            ) : (
              <Text style={styles.buttonText}>📊 Get Transaction History</Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity 
            style={[styles.button, styles.secondaryButton]} 
            onPress={getBanks}
            disabled={loadingBanks}
          >
            {loadingBanks ? (
              <ActivityIndicator color="#06402B" size="small" />
            ) : (
              <Text style={styles.secondaryButtonText}>🔄 Reload Banks</Text>
            )}
          </TouchableOpacity>
        </View>

        {/* API Documentation */}
        <View style={styles.instructionsCard}>
          <Text style={styles.instructionsTitle}>API Integration Status</Text>
          <Text style={styles.instructionsText}>
            ✅ Payment Initialization{'\n'}
            ✅ Payment Verification{'\n'}
            ✅ Bank List Retrieval{'\n'}
            ✅ Account Resolution{'\n'}
            ✅ Transfer Recipient Creation{'\n'}
            ✅ Transfer Initiation{'\n'}
            ✅ Transaction History{'\n'}
            ✅ Error Handling & Retry Logic{'\n'}
            ✅ Rate Limiting Support
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#06402B',
    textAlign: 'center',
    marginBottom: 20,
  },
  statusCard: {
    backgroundColor: '#E8F5E8',
    padding: 15,
    borderRadius: 10,
    marginBottom: 15,
    borderLeftWidth: 4,
    borderLeftColor: '#06402B',
  },
  statusTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#06402B',
    marginBottom: 5,
  },
  statusText: {
    fontSize: 14,
    color: '#06402B',
    marginBottom: 5,
  },
  statusDetail: {
    fontSize: 12,
    color: '#666',
  },
  errorCard: {
    backgroundColor: '#FFE6E6',
    padding: 15,
    borderRadius: 10,
    marginBottom: 15,
    borderLeftWidth: 4,
    borderLeftColor: '#E53E3E',
  },
  errorText: {
    fontSize: 14,
    color: '#E53E3E',
    marginBottom: 10,
  },
  clearErrorButton: {
    backgroundColor: '#E53E3E',
    padding: 8,
    borderRadius: 5,
    alignSelf: 'flex-start',
  },
  clearErrorText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  infoCard: {
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 10,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#06402B',
    marginBottom: 5,
  },
  infoText: {
    fontSize: 14,
    color: '#666',
  },
  inputCard: {
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 10,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  inputTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#06402B',
    marginBottom: 10,
  },
  textInput: {
    backgroundColor: '#f9f9f9',
    padding: 12,
    borderRadius: 8,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#ddd',
    fontSize: 16,
  },
  successCard: {
    backgroundColor: '#E8F5E8',
    padding: 15,
    borderRadius: 10,
    marginBottom: 15,
    borderLeftWidth: 4,
    borderLeftColor: '#28A745',
  },
  successTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#28A745',
    marginBottom: 5,
  },
  successText: {
    fontSize: 14,
    color: '#28A745',
  },
  buttonContainer: {
    marginBottom: 20,
  },
  button: {
    backgroundColor: '#06402B',
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  secondaryButton: {
    backgroundColor: '#fff',
    borderWidth: 2,
    borderColor: '#06402B',
  },
  secondaryButtonText: {
    color: '#06402B',
    fontSize: 16,
    fontWeight: 'bold',
  },
  instructionsCard: {
    backgroundColor: '#F0F8FF',
    padding: 15,
    borderRadius: 10,
    borderLeftWidth: 4,
    borderLeftColor: '#4A90E2',
  },
  instructionsTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#4A90E2',
    marginBottom: 10,
  },
  instructionsText: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
});

export default PaystackTestScreen;
