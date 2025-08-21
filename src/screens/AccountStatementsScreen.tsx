import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  Alert,
  Modal,
  FlatList,
} from 'react-native';
import { StackNavigationProp } from '@react-navigation/stack';
import { ProfileParamList } from '../types';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { colors as globalColors } from '../theme';
import {
  ChevronLeft,
  FileText,
  Download,
  Calendar,
  Filter,
  ChevronDown,
  CheckCircle,
  Clock,
  X,
  Eye,
  Share,
} from 'lucide-react-native';

// Ultra-Professional Color Palette
const colors = {
  canvas: globalColors.background, // Use app's background color instead of white
  seaGreen: '#06402B',
  mint: '#A8E4A0',
  muted: '#A3AABE',
  coral: '#EA3B52',
  text: '#1A1A1A',
  textLight: '#666666',
  shadow: 'rgba(0, 0, 0, 0.1)',
  background: globalColors.background,
  border: '#E5E7EB',
  success: '#10B981',
  warning: '#F59E0B',
};

interface AccountStatement {
  id: string;
  period: string;
  type: 'monthly' | 'quarterly' | 'yearly' | 'custom';
  dateRange: {
    start: string;
    end: string;
  };
  status: 'ready' | 'generating' | 'failed';
  fileSize: string;
  transactionCount: number;
  generatedDate: string;
  downloadUrl?: string;
}

interface FilterOptions {
  type: 'all' | 'monthly' | 'quarterly' | 'yearly' | 'custom';
  status: 'all' | 'ready' | 'generating' | 'failed';
  dateRange: {
    start: string;
    end: string;
  };
}

interface AccountStatementsScreenProps {
  navigation: StackNavigationProp<ProfileParamList, 'AccountStatements'>;
}

const AccountStatementsScreen: React.FC<AccountStatementsScreenProps> = ({ navigation }) => {
  const [statements, setStatements] = useState<AccountStatement[]>([]);
  const [filteredStatements, setFilteredStatements] = useState<AccountStatement[]>([]);
  const [isFilterModalVisible, setIsFilterModalVisible] = useState(false);
  const [isGenerateModalVisible, setIsGenerateModalVisible] = useState(false);
  const [filters, setFilters] = useState<FilterOptions>({
    type: 'all',
    status: 'all',
    dateRange: {
      start: '',
      end: '',
    },
  });

  useEffect(() => {
    loadStatements();
    generateMockStatements(); // For demo purposes
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    applyFilters();
  }, [statements, filters]); // eslint-disable-line react-hooks/exhaustive-deps

  const loadStatements = async () => {
    try {
      const savedStatements = await AsyncStorage.getItem('accountStatements');
      if (savedStatements) {
        setStatements(JSON.parse(savedStatements));
      }
    } catch (error) {
      console.error('Error loading statements:', error);
    }
  };

  // Generate mock statements for demo
  const generateMockStatements = () => {
    const mockStatements: AccountStatement[] = [
      {
        id: '1',
        period: 'December 2024',
        type: 'monthly',
        dateRange: {
          start: '2024-12-01',
          end: '2024-12-31',
        },
        status: 'ready',
        fileSize: '2.3 MB',
        transactionCount: 156,
        generatedDate: '2025-01-02',
        downloadUrl: 'mock-url',
      },
      {
        id: '2',
        period: 'November 2024',
        type: 'monthly',
        dateRange: {
          start: '2024-11-01',
          end: '2024-11-30',
        },
        status: 'ready',
        fileSize: '1.8 MB',
        transactionCount: 128,
        generatedDate: '2024-12-02',
        downloadUrl: 'mock-url',
      },
      {
        id: '3',
        period: 'Q4 2024',
        type: 'quarterly',
        dateRange: {
          start: '2024-10-01',
          end: '2024-12-31',
        },
        status: 'generating',
        fileSize: '5.2 MB',
        transactionCount: 423,
        generatedDate: '2025-01-05',
      },
      {
        id: '4',
        period: 'October 2024',
        type: 'monthly',
        dateRange: {
          start: '2024-10-01',
          end: '2024-10-31',
        },
        status: 'ready',
        fileSize: '2.1 MB',
        transactionCount: 142,
        generatedDate: '2024-11-02',
        downloadUrl: 'mock-url',
      },
    ];

    if (statements.length === 0) {
      setStatements(mockStatements);
    }
  };

  const applyFilters = () => {
    let filtered = [...statements];

    if (filters.type !== 'all') {
      filtered = filtered.filter(statement => statement.type === filters.type);
    }

    if (filters.status !== 'all') {
      filtered = filtered.filter(statement => statement.status === filters.status);
    }

    // Sort by generated date (newest first)
    filtered.sort((a, b) => new Date(b.generatedDate).getTime() - new Date(a.generatedDate).getTime());

    setFilteredStatements(filtered);
  };

  const downloadStatement = (statement: AccountStatement) => {
    if (statement.status !== 'ready') {
      Alert.alert('Error', 'Statement is not ready for download');
      return;
    }

    // In a real app, this would trigger the actual download
    Alert.alert(
      'Download Started',
      `Your ${statement.period} statement is being downloaded. You'll find it in your device's downloads folder.`,
      [{ text: 'OK', style: 'default' }]
    );
  };

  const shareStatement = (statement: AccountStatement) => {
    if (statement.status !== 'ready') {
      Alert.alert('Error', 'Statement is not ready for sharing');
      return;
    }

    // In a real app, this would open the share sheet
    Alert.alert(
      'Share Statement',
      `Share your ${statement.period} statement via email, messaging, or cloud storage.`,
      [{ text: 'OK', style: 'default' }]
    );
  };

  const previewStatement = (statement: AccountStatement) => {
    if (statement.status !== 'ready') {
      Alert.alert('Error', 'Statement is not ready for preview');
      return;
    }

    // In a real app, this would open a PDF viewer
    Alert.alert(
      'Preview Statement',
      `Opening preview for ${statement.period} statement...`,
      [{ text: 'OK', style: 'default' }]
    );
  };

  const generateNewStatement = () => {
    setIsGenerateModalVisible(true);
  };

  const requestCustomStatement = () => {
    Alert.alert(
      'Custom Statement Request',
      'Your custom statement request has been submitted. You will receive an email notification when it\'s ready (usually within 24 hours).',
      [{ text: 'OK', style: 'default' }]
    );
    setIsGenerateModalVisible(false);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'ready':
        return <CheckCircle size={16} color={colors.success} />;
      case 'generating':
        return <Clock size={16} color={colors.warning} />;
      case 'failed':
        return <X size={16} color={colors.coral} />;
      default:
        return <Clock size={16} color={colors.muted} />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ready': return colors.success;
      case 'generating': return colors.warning;
      case 'failed': return colors.coral;
      default: return colors.muted;
    }
  };

  const renderStatementCard = ({ item: statement }: { item: AccountStatement }) => (
    <View style={styles.statementCard}>
      <View style={styles.statementHeader}>
        <View style={styles.statementInfo}>
          <Text style={styles.statementPeriod}>{statement.period}</Text>
          <Text style={styles.statementType}>
            {statement.type.charAt(0).toUpperCase() + statement.type.slice(1)} Statement
          </Text>
          <Text style={styles.statementDetails}>
            {statement.transactionCount} transactions • {statement.fileSize}
          </Text>
        </View>
        <View style={styles.statementStatus}>
          {getStatusIcon(statement.status)}
          <Text style={[styles.statusText, { color: getStatusColor(statement.status) }]}>
            {statement.status.charAt(0).toUpperCase() + statement.status.slice(1)}
          </Text>
        </View>
      </View>

      <View style={styles.statementMeta}>
        <Text style={styles.generatedDate}>
          Generated: {new Date(statement.generatedDate).toLocaleDateString()}
        </Text>
        <Text style={styles.dateRange}>
          {new Date(statement.dateRange.start).toLocaleDateString()} - {new Date(statement.dateRange.end).toLocaleDateString()}
        </Text>
      </View>

      {statement.status === 'ready' && (
        <View style={styles.statementActions}>
          <TouchableOpacity 
            style={styles.actionButton}
            onPress={() => previewStatement(statement)}
          >
            <Eye size={16} color={colors.seaGreen} />
            <Text style={styles.actionButtonText}>Preview</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.actionButton}
            onPress={() => downloadStatement(statement)}
          >
            <Download size={16} color={colors.seaGreen} />
            <Text style={styles.actionButtonText}>Download</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.actionButton}
            onPress={() => shareStatement(statement)}
          >
            <Share size={16} color={colors.seaGreen} />
            <Text style={styles.actionButtonText}>Share</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );

  const renderFilterOption = (
    label: string,
    value: string,
    currentValue: string,
    onSelect: (value: string) => void
  ) => (
    <TouchableOpacity
      style={[
        styles.filterOption,
        currentValue === value && styles.filterOptionSelected,
      ]}
      onPress={() => onSelect(value)}
    >
      <Text style={[
        styles.filterOptionText,
        currentValue === value && styles.filterOptionTextSelected,
      ]}>
        {label}
      </Text>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.canvas} />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <ChevronLeft size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Account Statements</Text>
        <TouchableOpacity 
          style={styles.filterButton}
          onPress={() => setIsFilterModalVisible(true)}
        >
          <Filter size={20} color={colors.seaGreen} />
        </TouchableOpacity>
      </View>

      {/* Summary Stats */}
      <View style={styles.summaryContainer}>
        <View style={styles.summaryCard}>
          <Text style={styles.summaryNumber}>{filteredStatements.length}</Text>
          <Text style={styles.summaryLabel}>Total Statements</Text>
        </View>
        <View style={styles.summaryCard}>
          <Text style={styles.summaryNumber}>
            {filteredStatements.filter(s => s.status === 'ready').length}
          </Text>
          <Text style={styles.summaryLabel}>Ready</Text>
        </View>
        <View style={styles.summaryCard}>
          <Text style={styles.summaryNumber}>
            {filteredStatements.filter(s => s.status === 'generating').length}
          </Text>
          <Text style={styles.summaryLabel}>Generating</Text>
        </View>
      </View>

      {/* Generate New Statement Button */}
      <View style={styles.generateSection}>
        <TouchableOpacity 
          style={styles.generateButton}
          onPress={generateNewStatement}
        >
          <FileText size={20} color={colors.canvas} />
          <Text style={styles.generateButtonText}>Generate New Statement</Text>
        </TouchableOpacity>
      </View>

      {/* Statements List */}
      <FlatList
        data={filteredStatements}
        renderItem={renderStatementCard}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.statementsList}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={() => (
          <View style={styles.emptyState}>
            <FileText size={48} color={colors.muted} />
            <Text style={styles.emptyStateTitle}>No Statements Found</Text>
            <Text style={styles.emptyStateSubtitle}>
              Generate your first statement or adjust your filters
            </Text>
          </View>
        )}
      />

      {/* Filter Modal */}
      <Modal
        visible={isFilterModalVisible}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setIsFilterModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Filter Statements</Text>
              <TouchableOpacity 
                style={styles.modalCloseButton}
                onPress={() => setIsFilterModalVisible(false)}
              >
                <X size={24} color={colors.text} />
              </TouchableOpacity>
            </View>
            
            <ScrollView style={styles.modalContent}>
              <Text style={styles.filterSectionTitle}>Statement Type</Text>
              <View style={styles.filterOptionsContainer}>
                {renderFilterOption('All', 'all', filters.type, (value) => 
                  setFilters({ ...filters, type: value as any })
                )}
                {renderFilterOption('Monthly', 'monthly', filters.type, (value) => 
                  setFilters({ ...filters, type: value as any })
                )}
                {renderFilterOption('Quarterly', 'quarterly', filters.type, (value) => 
                  setFilters({ ...filters, type: value as any })
                )}
                {renderFilterOption('Yearly', 'yearly', filters.type, (value) => 
                  setFilters({ ...filters, type: value as any })
                )}
              </View>

              <Text style={styles.filterSectionTitle}>Status</Text>
              <View style={styles.filterOptionsContainer}>
                {renderFilterOption('All', 'all', filters.status, (value) => 
                  setFilters({ ...filters, status: value as any })
                )}
                {renderFilterOption('Ready', 'ready', filters.status, (value) => 
                  setFilters({ ...filters, status: value as any })
                )}
                {renderFilterOption('Generating', 'generating', filters.status, (value) => 
                  setFilters({ ...filters, status: value as any })
                )}
                {renderFilterOption('Failed', 'failed', filters.status, (value) => 
                  setFilters({ ...filters, status: value as any })
                )}
              </View>

              <TouchableOpacity 
                style={styles.applyFiltersButton}
                onPress={() => setIsFilterModalVisible(false)}
              >
                <Text style={styles.applyFiltersButtonText}>Apply Filters</Text>
              </TouchableOpacity>
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* Generate Statement Modal */}
      <Modal
        visible={isGenerateModalVisible}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setIsGenerateModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Generate Statement</Text>
              <TouchableOpacity 
                style={styles.modalCloseButton}
                onPress={() => setIsGenerateModalVisible(false)}
              >
                <X size={24} color={colors.text} />
              </TouchableOpacity>
            </View>
            
            <View style={styles.modalContent}>
              <Text style={styles.generateDescription}>
                Select the type of statement you want to generate:
              </Text>

              <TouchableOpacity 
                style={styles.generateOption}
                onPress={requestCustomStatement}
              >
                <Calendar size={20} color={colors.seaGreen} />
                <View style={styles.generateOptionContent}>
                  <Text style={styles.generateOptionTitle}>Custom Date Range</Text>
                  <Text style={styles.generateOptionSubtitle}>
                    Generate statement for a specific period
                  </Text>
                </View>
                <ChevronDown size={20} color={colors.muted} />
              </TouchableOpacity>

              <TouchableOpacity 
                style={styles.generateOption}
                onPress={requestCustomStatement}
              >
                <FileText size={20} color={colors.seaGreen} />
                <View style={styles.generateOptionContent}>
                  <Text style={styles.generateOptionTitle}>Last 30 Days</Text>
                  <Text style={styles.generateOptionSubtitle}>
                    Generate statement for the last 30 days
                  </Text>
                </View>
                <ChevronDown size={20} color={colors.muted} />
              </TouchableOpacity>

              <TouchableOpacity 
                style={styles.generateOption}
                onPress={requestCustomStatement}
              >
                <FileText size={20} color={colors.seaGreen} />
                <View style={styles.generateOptionContent}>
                  <Text style={styles.generateOptionTitle}>Last 90 Days</Text>
                  <Text style={styles.generateOptionSubtitle}>
                    Generate statement for the last 90 days
                  </Text>
                </View>
                <ChevronDown size={20} color={colors.muted} />
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: colors.canvas,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  backButton: {
    padding: 8,
    marginLeft: -8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
    flex: 1,
    textAlign: 'center',
  },
  filterButton: {
    padding: 8,
  },
  summaryContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  summaryCard: {
    flex: 1,
    backgroundColor: colors.canvas,
    padding: 16,
    marginHorizontal: 4,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  summaryNumber: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.seaGreen,
    marginBottom: 4,
  },
  summaryLabel: {
    fontSize: 12,
    color: colors.textLight,
    textAlign: 'center',
  },
  generateSection: {
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  generateButton: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.seaGreen,
    paddingVertical: 16,
    borderRadius: 12,
  },
  generateButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.canvas,
    marginLeft: 8,
  },
  statementsList: {
    paddingHorizontal: 16,
  },
  statementCard: {
    backgroundColor: colors.canvas,
    padding: 16,
    marginBottom: 12,
    borderRadius: 12,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  statementHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  statementInfo: {
    flex: 1,
  },
  statementPeriod: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 4,
  },
  statementType: {
    fontSize: 14,
    color: colors.textLight,
    marginBottom: 4,
  },
  statementDetails: {
    fontSize: 12,
    color: colors.muted,
  },
  statementStatus: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusText: {
    fontSize: 12,
    fontWeight: '500',
    marginLeft: 4,
  },
  statementMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  generatedDate: {
    fontSize: 12,
    color: colors.textLight,
  },
  dateRange: {
    fontSize: 12,
    color: colors.textLight,
  },
  statementActions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    backgroundColor: 'rgba(6, 64, 43, 0.1)',
  },
  actionButtonText: {
    fontSize: 12,
    fontWeight: '500',
    color: colors.seaGreen,
    marginLeft: 4,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 60,
    paddingHorizontal: 20,
  },
  emptyStateTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
    marginTop: 16,
    marginBottom: 8,
  },
  emptyStateSubtitle: {
    fontSize: 14,
    color: colors.textLight,
    textAlign: 'center',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContainer: {
    backgroundColor: colors.canvas,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
  },
  modalCloseButton: {
    padding: 4,
  },
  modalContent: {
    padding: 20,
  },
  filterSectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 12,
  },
  filterOptionsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 24,
  },
  filterOption: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: colors.border,
    marginRight: 8,
    marginBottom: 8,
  },
  filterOptionSelected: {
    backgroundColor: colors.seaGreen,
    borderColor: colors.seaGreen,
  },
  filterOptionText: {
    fontSize: 14,
    color: colors.text,
  },
  filterOptionTextSelected: {
    color: colors.canvas,
  },
  applyFiltersButton: {
    backgroundColor: colors.seaGreen,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  applyFiltersButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.canvas,
  },
  generateDescription: {
    fontSize: 14,
    color: colors.textLight,
    marginBottom: 20,
    textAlign: 'center',
  },
  generateOption: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    marginBottom: 12,
  },
  generateOptionContent: {
    flex: 1,
    marginLeft: 12,
  },
  generateOptionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 4,
  },
  generateOptionSubtitle: {
    fontSize: 14,
    color: colors.textLight,
  },
});

export default AccountStatementsScreen;
