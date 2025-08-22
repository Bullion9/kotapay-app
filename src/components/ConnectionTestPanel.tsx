import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, RefreshControl } from 'react-native';
import { connectionTester } from '../utils/ConnectionTester';

interface ConnectionTest {
  service: string;
  status: 'success' | 'error' | 'pending';
  message: string;
  latency?: number;
}

const ConnectionTestPanel: React.FC = () => {
  const [tests, setTests] = useState<ConnectionTest[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [lastTested, setLastTested] = useState<Date | null>(null);

  useEffect(() => {
    runTests();
  }, []);

  const runTests = async () => {
    setIsLoading(true);
    try {
      const results = await connectionTester.testAllConnections();
      setTests(results);
      setLastTested(new Date());
    } catch (error) {
      console.error('Connection test failed:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'success': return '#4CAF50';
      case 'error': return '#F44336';
      case 'pending': return '#FF9800';
      default: return '#757575';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'success': return '✅';
      case 'error': return '❌';
      case 'pending': return '⏳';
      default: return '❓';
    }
  };

  const config = connectionTester.getConnectionStatus();
  const validation = connectionTester.validateConfiguration();

  return (
    <ScrollView 
      style={styles.container}
      refreshControl={
        <RefreshControl refreshing={isLoading} onRefresh={runTests} />
      }
    >
      <View style={styles.header}>
        <Text style={styles.title}>🔗 KotaPay Connections</Text>
        {lastTested && (
          <Text style={styles.lastTested}>
            Last tested: {lastTested.toLocaleTimeString()}
          </Text>
        )}
      </View>

      {/* Configuration Validation */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>📋 Configuration</Text>
        <View style={[styles.configItem, { backgroundColor: validation.isValid ? '#E8F5E8' : '#FFF3E0' }]}>
          <Text style={styles.configStatus}>
            {validation.isValid ? '✅ Valid' : '⚠️ Issues Found'}
          </Text>
          {!validation.isValid && (
            <View style={styles.issuesList}>
              {validation.issues.map((issue, index) => (
                <Text key={index} style={styles.issueText}>• {issue}</Text>
              ))}
            </View>
          )}
        </View>
      </View>

      {/* Connection Tests */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>🧪 Connection Tests</Text>
        {tests.map((test, index) => (
          <View key={index} style={styles.testItem}>
            <View style={styles.testHeader}>
              <Text style={styles.testService}>
                {getStatusIcon(test.status)} {test.service}
              </Text>
              {test.latency && (
                <Text style={styles.latency}>{test.latency}ms</Text>
              )}
            </View>
            <Text style={[styles.testMessage, { color: getStatusColor(test.status) }]}>
              {test.message}
            </Text>
          </View>
        ))}
      </View>

      {/* Configuration Details */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>⚙️ Current Configuration</Text>
        <View style={styles.configDetails}>
          <Text style={styles.configLabel}>Backend:</Text>
          <Text style={styles.configValue}>{config.backend}</Text>
          
          <Text style={styles.configLabel}>Appwrite:</Text>
          <Text style={styles.configValue}>{config.appwrite}</Text>
          
          <Text style={styles.configLabel}>Paystack:</Text>
          <Text style={styles.configValue}>{config.paystack}</Text>
          
          <Text style={styles.configLabel}>Environment:</Text>
          <Text style={styles.configValue}>{config.environment}</Text>
        </View>
      </View>

      {/* Actions */}
      <View style={styles.actions}>
        <TouchableOpacity 
          style={[styles.button, styles.primaryButton]} 
          onPress={runTests}
          disabled={isLoading}
        >
          <Text style={styles.buttonText}>
            {isLoading ? '🔄 Testing...' : '🔄 Refresh Tests'}
          </Text>
        </TouchableOpacity>
      </View>

      <View style={styles.footer}>
        <Text style={styles.footerText}>
          💡 Pull down to refresh • Check your .env.local file for configuration
        </Text>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    padding: 20,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
  lastTested: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
  },
  section: {
    backgroundColor: '#fff',
    margin: 10,
    borderRadius: 8,
    padding: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 10,
  },
  configItem: {
    padding: 10,
    borderRadius: 6,
  },
  configStatus: {
    fontSize: 16,
    fontWeight: '500',
  },
  issuesList: {
    marginTop: 8,
  },
  issueText: {
    fontSize: 14,
    color: '#d32f2f',
    marginVertical: 2,
  },
  testItem: {
    marginBottom: 12,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  testHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  testService: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
  },
  latency: {
    fontSize: 12,
    color: '#666',
    backgroundColor: '#f0f0f0',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 10,
  },
  testMessage: {
    fontSize: 14,
  },
  configDetails: {
    gap: 8,
  },
  configLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#333',
  },
  configValue: {
    fontSize: 13,
    color: '#666',
    marginBottom: 8,
    fontFamily: 'monospace',
  },
  actions: {
    padding: 20,
  },
  button: {
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  primaryButton: {
    backgroundColor: '#2196F3',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '500',
  },
  footer: {
    padding: 20,
    alignItems: 'center',
  },
  footerText: {
    fontSize: 12,
    color: '#999',
    textAlign: 'center',
  },
});

export default ConnectionTestPanel;
