import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import BackendConnectionService from '../services/BackendConnectionService';

interface ConnectionTestResult {
  backend: boolean;
  paystack: boolean;
  appwrite: boolean;
  overall: boolean;
  details: {
    backend?: any;
    paystack?: any;
    appwrite?: any;
  };
}

export default function ConnectionTestScreen() {
  const [testing, setTesting] = useState(false);
  const [results, setResults] = useState<ConnectionTestResult | null>(null);
  const [logs, setLogs] = useState<string[]>([]);

  const addLog = (message: string) => {
    setLogs(prev => [...prev, `${new Date().toLocaleTimeString()}: ${message}`]);
  };

  const testConnections = async () => {
    setTesting(true);
    setResults(null);
    setLogs([]);
    
    addLog('🚀 Starting connection tests...');
    
    try {
      const connectionService = BackendConnectionService.getInstance();
      
      addLog('📡 Testing backend connection...');
      const backendResult = await connectionService.testBackendConnection();
      addLog(`Backend: ${backendResult.connected ? '✅ Connected' : '❌ Failed'}`);
      
      addLog('💳 Testing Paystack connection...');
      const paystackResult = await connectionService.testPaystackConnection();
      addLog(`Paystack: ${paystackResult.connected ? '✅ Connected' : '❌ Failed'}`);
      
      addLog('🗄️ Testing Appwrite connection...');
      const appwriteResult = await connectionService.testAppwriteConnection();
      addLog(`Appwrite: ${appwriteResult.connected ? '✅ Connected' : '❌ Failed'}`);
      
      const overallResult = backendResult.connected && paystackResult.connected && appwriteResult.connected;
      
      const testResults: ConnectionTestResult = {
        backend: backendResult.connected,
        paystack: paystackResult.connected,
        appwrite: appwriteResult.connected,
        overall: overallResult,
        details: {
          backend: backendResult,
          paystack: paystackResult,
          appwrite: appwriteResult
        }
      };
      
      setResults(testResults);
      addLog(`🎯 Overall result: ${overallResult ? '✅ ALL SYSTEMS GO!' : '❌ Some connections failed'}`);
      
      if (overallResult) {
        Alert.alert(
          '🎉 Success!',
          'All connections are working perfectly! Your app is ready for live production.',
          [{ text: 'Awesome!', style: 'default' }]
        );
      } else {
        Alert.alert(
          '⚠️ Connection Issues',
          'Some connections failed. Check the logs for details.',
          [{ text: 'Check Logs', style: 'default' }]
        );
      }
      
    } catch (error) {
      addLog(`❌ Test failed: ${error}`);
      Alert.alert('Error', `Connection test failed: ${error}`);
    } finally {
      setTesting(false);
    }
  };

  const getStatusIcon = (status: boolean | undefined) => {
    if (status === undefined) return '❓';
    return status ? '✅' : '❌';
  };

  const getStatusColor = (status: boolean | undefined) => {
    if (status === undefined) return '#666';
    return status ? '#4CAF50' : '#F44336';
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Ionicons name="pulse" size={32} color="#2196F3" />
        <Text style={styles.title}>Connection Tester</Text>
        <Text style={styles.subtitle}>Test live backend connections</Text>
      </View>

      <TouchableOpacity 
        style={[styles.testButton, testing && styles.testButtonDisabled]}
        onPress={testConnections}
        disabled={testing}
      >
        <Ionicons 
          name={testing ? "sync" : "flash"} 
          size={20} 
          color="white" 
          style={testing ? styles.spinning : {}} 
        />
        <Text style={styles.testButtonText}>
          {testing ? 'Testing...' : 'Test All Connections'}
        </Text>
      </TouchableOpacity>

      {results && (
        <View style={styles.resultsContainer}>
          <Text style={styles.resultsTitle}>Test Results</Text>
          
          <View style={styles.resultRow}>
            <Text style={styles.resultLabel}>Backend Server</Text>
            <Text style={[styles.resultStatus, { color: getStatusColor(results.backend) }]}>
              {getStatusIcon(results.backend)}
            </Text>
          </View>
          
          <View style={styles.resultRow}>
            <Text style={styles.resultLabel}>Paystack API</Text>
            <Text style={[styles.resultStatus, { color: getStatusColor(results.paystack) }]}>
              {getStatusIcon(results.paystack)}
            </Text>
          </View>
          
          <View style={styles.resultRow}>
            <Text style={styles.resultLabel}>Appwrite Database</Text>
            <Text style={[styles.resultStatus, { color: getStatusColor(results.appwrite) }]}>
              {getStatusIcon(results.appwrite)}
            </Text>
          </View>
          
          <View style={[styles.resultRow, styles.overallRow]}>
            <Text style={styles.overallLabel}>Overall Status</Text>
            <Text style={[styles.overallStatus, { color: getStatusColor(results.overall) }]}>
              {results.overall ? '🎉 READY FOR PRODUCTION' : '⚠️ NEEDS ATTENTION'}
            </Text>
          </View>
        </View>
      )}

      {logs.length > 0 && (
        <View style={styles.logsContainer}>
          <Text style={styles.logsTitle}>Test Logs</Text>
          <ScrollView style={styles.logsScroll} nestedScrollEnabled>
            {logs.map((log, index) => (
              <Text key={index} style={styles.logItem}>{log}</Text>
            ))}
          </ScrollView>
        </View>
      )}

      <View style={styles.infoContainer}>
        <Text style={styles.infoTitle}>💡 What this tests:</Text>
        <Text style={styles.infoItem}>• Backend server health (localhost:3000)</Text>
        <Text style={styles.infoItem}>• Paystack API connectivity</Text>
        <Text style={styles.infoItem}>• Appwrite database connection</Text>
        <Text style={styles.infoItem}>• Production readiness status</Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    padding: 20,
  },
  header: {
    alignItems: 'center',
    marginBottom: 30,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 10,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    marginTop: 5,
  },
  testButton: {
    backgroundColor: '#2196F3',
    padding: 15,
    borderRadius: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  testButtonDisabled: {
    backgroundColor: '#999',
  },
  testButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 10,
  },
  spinning: {
    transform: [{ rotate: '45deg' }],
  },
  resultsContainer: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 10,
    marginBottom: 20,
  },
  resultsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 15,
  },
  resultRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  resultLabel: {
    fontSize: 16,
    color: '#333',
  },
  resultStatus: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  overallRow: {
    borderBottomWidth: 0,
    marginTop: 10,
    paddingTop: 15,
    borderTopWidth: 2,
    borderTopColor: '#2196F3',
  },
  overallLabel: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  overallStatus: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  logsContainer: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 10,
    marginBottom: 20,
  },
  logsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10,
  },
  logsScroll: {
    maxHeight: 200,
  },
  logItem: {
    fontSize: 12,
    color: '#555',
    fontFamily: 'monospace',
    marginBottom: 5,
  },
  infoContainer: {
    backgroundColor: '#E3F2FD',
    padding: 15,
    borderRadius: 10,
    borderLeftWidth: 4,
    borderLeftColor: '#2196F3',
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10,
  },
  infoItem: {
    fontSize: 14,
    color: '#555',
    marginBottom: 5,
  },
});
