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
  Image,
  Dimensions,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { StackNavigationProp } from '@react-navigation/stack';
import { ProfileParamList } from '../types';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { colors as globalColors } from '../theme';
import {
  ChevronLeft,
  FileText,
  Download,
  Eye,
  Trash2,
  Calendar,
  Shield,
  CheckCircle,
  X,
} from 'lucide-react-native';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

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
  background: globalColors.background, // Use app's background color
  border: '#E5E7EB',
};

interface Document {
  id: string;
  type: string;
  name: string;
  uri: string;
  uploadDate: string;
  tier: number;
  status: 'pending' | 'approved' | 'rejected';
  size?: string;
}

interface DocumentCenterScreenProps {
  navigation: StackNavigationProp<ProfileParamList, 'DocumentCenter'>;
}

const DocumentCenterScreen: React.FC<DocumentCenterScreenProps> = ({ navigation }) => {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [selectedDocument, setSelectedDocument] = useState<Document | null>(null);
  const [isPreviewVisible, setIsPreviewVisible] = useState(false);
  const [submittedTiers, setSubmittedTiers] = useState<Set<number>>(new Set());

  useEffect(() => {
    loadDocuments();
    loadSubmittedTiers();
  }, []);

  const loadDocuments = async () => {
    try {
      const savedDocuments = await AsyncStorage.getItem('documents');
      if (savedDocuments) {
        setDocuments(JSON.parse(savedDocuments));
      }
    } catch (error) {
      console.error('Error loading documents:', error);
    }
  };

  const loadSubmittedTiers = async () => {
    try {
      const savedSubmittedTiers = await AsyncStorage.getItem('submittedTiers');
      if (savedSubmittedTiers) {
        setSubmittedTiers(new Set(JSON.parse(savedSubmittedTiers)));
      }
    } catch (error) {
      console.error('Error loading submitted tiers:', error);
    }
  };

  const getDocumentTypeLabel = (type: string) => {
    const typeLabels: { [key: string]: string } = {
      id_front: 'ID Front',
      id_back: 'ID Back',
      address: 'Address Proof',
      income: 'Income Proof',
      employment: 'Employment Letter',
      bank_statement: 'Bank Statement',
    };
    return typeLabels[type] || type;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved': return colors.seaGreen;
      case 'rejected': return colors.coral;
      default: return colors.muted;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'approved': return <CheckCircle size={16} color={colors.seaGreen} />;
      case 'rejected': return <X size={16} color={colors.coral} />;
      default: return <Calendar size={16} color={colors.muted} />;
    }
  };

  const previewDocument = (document: Document) => {
    setSelectedDocument(document);
    setIsPreviewVisible(true);
  };

  const deleteDocument = async (documentId: string) => {
    const document = documents.find(doc => doc.id === documentId);
    if (!document) return;

    // Check if document is from a submitted tier
    if (submittedTiers.has(document.tier)) {
      Alert.alert(
        'Document Protected',
        'This document is from a submitted KYC tier and cannot be deleted for security reasons.',
        [{ text: 'OK', style: 'default' }]
      );
      return;
    }

    Alert.alert(
      'Delete Document',
      `Are you sure you want to delete "${document.name}"? This action cannot be undone.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              const updatedDocuments = documents.filter(doc => doc.id !== documentId);
              setDocuments(updatedDocuments);
              await AsyncStorage.setItem('documents', JSON.stringify(updatedDocuments));
            } catch (error) {
              console.error('Error deleting document:', error);
              Alert.alert('Error', 'Failed to delete document');
            }
          },
        },
      ]
    );
  };

  const downloadDocument = (document: Document) => {
    // In a real app, this would download the document
    Alert.alert(
      'Download Document',
      `"${document.name}" will be downloaded to your device.`,
      [{ text: 'OK', style: 'default' }]
    );
  };

  const renderDocumentCard = (document: Document) => {
    const isProtected = submittedTiers.has(document.tier);
    
    return (
      <View key={document.id} style={styles.documentCard}>
        <View style={styles.documentHeader}>
          <View style={styles.documentInfo}>
            <Text style={styles.documentName}>{getDocumentTypeLabel(document.type)}</Text>
            <Text style={styles.documentDate}>
              Uploaded: {new Date(document.uploadDate).toLocaleDateString()}
            </Text>
            <Text style={styles.documentTier}>Tier {document.tier}</Text>
          </View>
          <View style={styles.documentStatus}>
            {getStatusIcon(document.status)}
            <Text style={[styles.statusText, { color: getStatusColor(document.status) }]}>
              {document.status ? (document.status.charAt(0).toUpperCase() + document.status.slice(1)) : 'Unknown'}
            </Text>
          </View>
        </View>

        {isProtected && (
          <View style={styles.protectionBadge}>
            <Shield size={14} color={colors.seaGreen} />
            <Text style={styles.protectionText}>Protected Document</Text>
          </View>
        )}

        <View style={styles.documentActions}>
          <TouchableOpacity 
            style={styles.actionButton}
            onPress={() => previewDocument(document)}
          >
            <Eye size={20} color={colors.seaGreen} />
            <Text style={styles.actionButtonText}>View</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.actionButton}
            onPress={() => downloadDocument(document)}
          >
            <Download size={20} color={colors.seaGreen} />
            <Text style={styles.actionButtonText}>Download</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={[
              styles.actionButton,
              isProtected && styles.actionButtonDisabled
            ]}
            onPress={() => deleteDocument(document.id)}
            disabled={isProtected}
          >
            <Trash2 
              size={20} 
              color={isProtected ? colors.muted : colors.coral} 
            />
            <Text style={[
              styles.actionButtonText,
              isProtected && styles.actionButtonTextDisabled
            ]}>
              Delete
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.canvas} />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <ChevronLeft size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Document Center</Text>
        <View style={styles.headerSpacer} />
      </View>

      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardAvoidingView}
      >
        <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Summary Section */}
        <View style={styles.summaryCard}>
          <View style={styles.summaryHeader}>
            <FileText size={24} color={colors.seaGreen} />
            <Text style={styles.summaryTitle}>Your Documents</Text>
          </View>
          
          <View style={styles.summaryStats}>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>{documents.length}</Text>
              <Text style={styles.statLabel}>Total</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>
                {documents.filter(doc => doc.status === 'approved').length}
              </Text>
              <Text style={styles.statLabel}>Approved</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>
                {documents.filter(doc => submittedTiers.has(doc.tier)).length}
              </Text>
              <Text style={styles.statLabel}>Protected</Text>
            </View>
          </View>
        </View>

        {/* Documents List */}
        <View style={styles.documentsSection}>
          <Text style={styles.sectionTitle}>All Documents</Text>
          
          {documents.length === 0 ? (
            <View style={styles.emptyState}>
              <FileText size={48} color={colors.muted} />
              <Text style={styles.emptyStateTitle}>No Documents Found</Text>
              <Text style={styles.emptyStateSubtitle}>
                Upload documents through the KYC verification process
              </Text>
              <TouchableOpacity 
                style={styles.emptyStateButton}
                onPress={() => navigation.navigate('TierDashboard')}
              >
                <Text style={styles.emptyStateButtonText}>Go to KYC</Text>
              </TouchableOpacity>
            </View>
          ) : (
            documents.map(renderDocumentCard)
          )}
        </View>

        <View style={styles.bottomSpacing} />
      </ScrollView>
      </KeyboardAvoidingView>

      {/* Document Preview Modal */}
      <Modal
        visible={isPreviewVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setIsPreviewVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>
                {selectedDocument ? getDocumentTypeLabel(selectedDocument.type) : ''}
              </Text>
              <TouchableOpacity 
                style={styles.modalCloseButton}
                onPress={() => setIsPreviewVisible(false)}
              >
                <X size={24} color={colors.text} />
              </TouchableOpacity>
            </View>
            
            <View style={styles.modalContent}>
              {selectedDocument && (
                <>
                  <Image 
                    source={{ uri: selectedDocument.uri }} 
                    style={styles.previewImage}
                    resizeMode="contain"
                  />
                  
                  <View style={styles.documentDetails}>
                    <Text style={styles.detailItem}>
                      <Text style={styles.detailLabel}>Type: </Text>
                      {getDocumentTypeLabel(selectedDocument.type)}
                    </Text>
                    <Text style={styles.detailItem}>
                      <Text style={styles.detailLabel}>Uploaded: </Text>
                      {new Date(selectedDocument.uploadDate).toLocaleDateString()}
                    </Text>
                    <Text style={styles.detailItem}>
                      <Text style={styles.detailLabel}>Tier: </Text>
                      {selectedDocument.tier}
                    </Text>
                    <Text style={styles.detailItem}>
                      <Text style={styles.detailLabel}>Status: </Text>
                      <Text style={{ color: getStatusColor(selectedDocument.status) }}>
                        {selectedDocument.status ? (selectedDocument.status.charAt(0).toUpperCase() + selectedDocument.status.slice(1)) : 'Unknown'}
                      </Text>
                    </Text>
                  </View>
                </>
              )}
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
    marginRight: 40,
  },
  headerSpacer: {
    width: 40,
  },
  scrollView: {
    flex: 1,
  },
  keyboardAvoidingView: {
    flex: 1,
  },
  summaryCard: {
    backgroundColor: colors.canvas,
    margin: 16,
    padding: 20,
    borderRadius: 16,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  summaryHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  summaryTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: colors.text,
    marginLeft: 12,
  },
  summaryStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
  },
  statItem: {
    alignItems: 'center',
    flex: 1,
  },
  statNumber: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.seaGreen,
  },
  statLabel: {
    fontSize: 14,
    color: colors.textLight,
    marginTop: 4,
  },
  statDivider: {
    width: 1,
    height: 40,
    backgroundColor: colors.border,
  },
  documentsSection: {
    paddingHorizontal: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 16,
  },
  documentCard: {
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
  documentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  documentInfo: {
    flex: 1,
  },
  documentName: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 4,
  },
  documentDate: {
    fontSize: 14,
    color: colors.textLight,
    marginBottom: 2,
  },
  documentTier: {
    fontSize: 12,
    color: colors.seaGreen,
    fontWeight: '500',
  },
  documentStatus: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusText: {
    fontSize: 14,
    fontWeight: '500',
    marginLeft: 4,
  },
  protectionBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.mint,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    alignSelf: 'flex-start',
    marginBottom: 12,
  },
  protectionText: {
    fontSize: 12,
    fontWeight: '500',
    color: colors.seaGreen,
    marginLeft: 4,
  },
  documentActions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    borderTopWidth: 1,
    borderTopColor: colors.border,
    paddingTop: 12,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    backgroundColor: 'rgba(6, 64, 43, 0.1)',
  },
  actionButtonDisabled: {
    backgroundColor: 'rgba(163, 170, 190, 0.1)',
  },
  actionButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.seaGreen,
    marginLeft: 4,
  },
  actionButtonTextDisabled: {
    color: colors.muted,
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
    marginBottom: 24,
  },
  emptyStateButton: {
    backgroundColor: colors.seaGreen,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  emptyStateButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.canvas,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    width: screenWidth * 0.9,
    maxHeight: screenHeight * 0.8,
    backgroundColor: colors.canvas,
    borderRadius: 16,
    overflow: 'hidden',
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
    flex: 1,
  },
  previewImage: {
    width: '100%',
    height: 300,
    backgroundColor: colors.background,
  },
  documentDetails: {
    padding: 20,
  },
  detailItem: {
    fontSize: 14,
    color: colors.text,
    marginBottom: 8,
  },
  detailLabel: {
    fontWeight: '600',
  },
  bottomSpacing: {
    height: 32,
  },
});

export default DocumentCenterScreen;
