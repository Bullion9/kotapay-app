import {
    AlertCircle,
    CheckCircle,
    ChevronLeft,
    Clock,
    Download,
    QrCode,
    Share as ShareIcon,
    Shield,
    XCircle,
} from 'lucide-react-native';
import React from 'react';
import {
    Alert,
    ScrollView,
    Share,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useSettings } from '../contexts/SettingsContext';
import { TransactionData } from '../services/receiptService';
import { colors, globalStyles, iconSizes, spacing } from '../theme';
import KotaPayLogo from './icons/KotaPayLogo';

interface ReceiptGeneratorProps {
  transaction: TransactionData;
  onBack: () => void;
  onDownloadPDF: () => void;
  onReportIssue: () => void;
}

const ReceiptGenerator: React.FC<ReceiptGeneratorProps> = ({
  transaction,
  onBack,
  onDownloadPDF,
  onReportIssue,
}) => {
  const getTypeColor = (type: string) => {
    switch (type) {
      case 'SENT':
      case 'WITHDRAW':
      case 'BILL_PAYMENT':
        return colors.error;
      case 'RECEIVED':
      case 'CARD_TOP_UP':
        return colors.success;
      default:
        return colors.primary;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'SUCCESS':
        return <CheckCircle size={16} color={colors.success} />;
      case 'PENDING':
        return <Clock size={16} color={colors.warning} />;
      case 'FAILED':
        return <XCircle size={16} color={colors.error} />;
      default:
        return <Clock size={16} color={colors.warning} />;
    }
  };

  const getAmountSign = (type: string) => {
    switch (type) {
      case 'SENT':
      case 'WITHDRAW':
      case 'BILL_PAYMENT':
        return '-';
      case 'RECEIVED':
      case 'CARD_TOP_UP':
        return '+';
      default:
        return '';
    }
  };

  const { formatCurrency } = useSettings();

  const handleShare = async () => {
    try {
      await Share.share({
        message: `KotaPay Receipt\nTransaction ID: ${transaction.id}\nAmount: ${formatCurrency(transaction.total, transaction.currency)}\nStatus: ${transaction.status}`,
        title: 'KotaPay Receipt',
      });
    } catch {
      Alert.alert('Error', 'Failed to share receipt');
    }
  };

  const handleReportIssue = () => {
    onReportIssue();
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={globalStyles.backButton} onPress={onBack}>
          <ChevronLeft size={24} color={colors.primary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Receipt</Text>
        <View style={styles.headerSpace} />
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.receiptContainer}>
          {/* Top Banner */}
          <View style={styles.topBanner}>
            {/* KotaPay Logo */}
            <KotaPayLogo size={60} />

            {/* Receipt Type Badge */}
            <View style={[styles.typeBadge, { backgroundColor: getTypeColor(transaction.type) }]}>
              <Text style={styles.typeBadgeText}>{transaction.type.replace('_', ' ')}</Text>
            </View>

            {/* Transaction ID & QR */}
            <View style={styles.idQrContainer}>
              <View>
                <Text style={styles.transactionIdLabel}>Transaction ID</Text>
                <Text style={styles.transactionId}>{transaction.id}</Text>
              </View>
              <View style={styles.qrContainer}>
                <QrCode size={60} color={colors.primary} />
              </View>
            </View>
          </View>

          {/* Hero Row */}
          <View style={styles.heroRow}>
            <Text style={[styles.heroAmount, { color: getTypeColor(transaction.type) }]}>
              {getAmountSign(transaction.type)}{formatCurrency(transaction.amount, transaction.currency)}
            </Text>
          </View>

          {/* Transaction Details */}
          <View style={styles.detailsContainer}>
            <Text style={styles.sectionTitle}>Transaction Details</Text>
            
            <View style={styles.detailsTable}>
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Date & Time</Text>
                <Text style={styles.detailValue}>{transaction.date} {transaction.time}</Text>
              </View>

              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Status</Text>
                <View style={styles.statusContainer}>
                  {getStatusIcon(transaction.status)}
                  <Text style={[styles.detailValue, styles.statusText]}>{transaction.status}</Text>
                </View>
              </View>

              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>From</Text>
                <Text style={styles.detailValue}>{transaction.from}</Text>
              </View>

              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>To</Text>
                <Text style={styles.detailValue}>{transaction.to}</Text>
              </View>

              {transaction.note && (
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Note</Text>
                  <Text style={styles.detailValue}>&ldquo;{transaction.note}&rdquo;</Text>
                </View>
              )}

              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Fee</Text>
                <Text style={styles.detailValue}>
                  {formatCurrency(transaction.fee, transaction.currency)}
                </Text>
              </View>

              <View style={[styles.detailRow, styles.totalRow]}>
                <Text style={styles.totalLabel}>Total</Text>
                <Text style={styles.totalValue}>
                  {formatCurrency(transaction.total, transaction.currency)}
                </Text>
              </View>
            </View>
          </View>

          {/* Virtual Card Details */}
          {transaction.cardLastFour && (
            <View style={styles.detailsContainer}>
              <Text style={styles.sectionTitle}>Virtual Card Details</Text>
              <View style={styles.detailsTable}>
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Card</Text>
                  <Text style={styles.detailValue}>**** {transaction.cardLastFour}</Text>
                </View>
                {transaction.cardValidUntil && (
                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>Valid until</Text>
                    <Text style={styles.detailValue}>{transaction.cardValidUntil}</Text>
                  </View>
                )}
              </View>
            </View>
          )}

          {/* Bill Details */}
          {transaction.billProvider && (
            <View style={styles.detailsContainer}>
              <Text style={styles.sectionTitle}>Bill Details</Text>
              <View style={styles.detailsTable}>
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Provider</Text>
                  <Text style={styles.detailValue}>{transaction.billProvider}</Text>
                </View>
                {transaction.billMeter && (
                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>Meter</Text>
                    <Text style={styles.detailValue}>**** {transaction.billMeter}</Text>
                  </View>
                )}
              </View>
            </View>
          )}

          {/* Security Footer */}
          <View style={styles.securityFooter}>
            <View style={styles.authContainer}>
              <Shield size={16} color={colors.primary} />
              <Text style={styles.authText}>
                {transaction.biometricAuth ? 'Authorized by biometric' : 'Authorized by PIN'}
              </Text>
            </View>
            <Text style={styles.versionText}>KotaPay v2.1.0 (Build 2025.08.17)</Text>
          </View>
        </View>
      </ScrollView>

      {/* Action Buttons */}
      <View style={styles.actionContainer}>
        <TouchableOpacity style={styles.actionButton} onPress={onDownloadPDF}>
          <Download size={iconSizes.sm} color={colors.white} />
          <Text style={styles.actionButtonText}>Download PDF</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.actionButton} onPress={handleShare}>
          <ShareIcon size={iconSizes.sm} color={colors.white} />
          <Text style={styles.actionButtonText}>Share</Text>
        </TouchableOpacity>

        <TouchableOpacity style={[styles.actionButton, styles.reportButton]} onPress={handleReportIssue}>
          <AlertCircle size={iconSizes.sm} color={colors.error} />
          <Text style={[styles.actionButtonText, styles.reportButtonText]}>Report Issue</Text>
        </TouchableOpacity>
      </View>
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
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    backgroundColor: colors.background,
  },
  headerTitle: {
    flex: 1,
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
    textAlign: 'center',
  },
  headerSpace: {
    width: 40,
  },
  scrollView: {
    flex: 1,
  },
  receiptContainer: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    margin: spacing.lg,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  topBanner: {
    padding: spacing.xl,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  typeBadge: {
    alignSelf: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: 20,
    marginBottom: spacing.lg,
  },
  typeBadgeText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.white,
    textTransform: 'uppercase',
  },
  idQrContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  transactionIdLabel: {
    fontSize: 12,
    color: colors.secondaryText,
    marginBottom: spacing.xs,
  },
  transactionId: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
    fontFamily: 'monospace',
  },
  qrContainer: {
    padding: spacing.sm,
    backgroundColor: colors.background,
    borderRadius: 8,
  },
  heroRow: {
    alignItems: 'center',
    paddingVertical: spacing.xl,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  heroAmount: {
    fontSize: 32,
    fontWeight: 'bold',
  },
  detailsContainer: {
    padding: spacing.xl,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginBottom: spacing.lg,
  },
  detailsTable: {
    gap: spacing.md,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.sm,
  },
  detailLabel: {
    fontSize: 14,
    color: '#A3AABE',
    flex: 1,
  },
  detailValue: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.text,
    flex: 1,
    textAlign: 'right',
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    flex: 1,
    justifyContent: 'flex-end',
  },
  statusText: {
    fontWeight: '600',
  },
  totalRow: {
    borderTopWidth: 1,
    borderTopColor: colors.border,
    paddingTop: spacing.md,
    marginTop: spacing.sm,
  },
  totalLabel: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.text,
    flex: 1,
  },
  totalValue: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.seaGreen,
    flex: 1,
    textAlign: 'right',
  },
  securityFooter: {
    padding: spacing.xl,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    alignItems: 'center',
    gap: spacing.sm,
  },
  authContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  authText: {
    fontSize: 12,
    color: colors.secondaryText,
  },
  versionText: {
    fontSize: 10,
    color: '#A3AABE',
  },
  actionContainer: {
    flexDirection: 'row',
    padding: spacing.lg,
    gap: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xs,
    paddingVertical: spacing.md,
    borderRadius: 12,
    backgroundColor: colors.seaGreen,
  },
  actionButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.white,
  },
  reportButton: {
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.error,
  },
  reportButtonText: {
    color: colors.error,
  },
});

export default ReceiptGenerator;
