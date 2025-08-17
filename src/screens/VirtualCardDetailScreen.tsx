import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  Animated,
  Clipboard,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import {
  ChevronLeft,
  ArrowLeft,
  MoreHorizontal,
  Plus,
  Snowflake,
  Unlock,
  List,
  Edit3,
  Check,
  X,
  Copy,
  Shield,
  Clock,
} from 'lucide-react-native';
import { colors, spacing, borderRadius, shadows, globalStyles } from '../theme';
import { EyeIcon } from '../components/icons';
import PinEntryModal from '../components/PinEntryModal';
import FreezeCardModal from '../components/FreezeCardModal';
import DeleteCardModal from '../components/DeleteCardModal';

type RootStackParamList = {
  TopUpVirtualCardScreen: { cardId: string };
  TransactionHistoryScreen: { cardId?: string };
};

type NavigationProp = StackNavigationProp<RootStackParamList>;

interface VirtualCardDetail {
  id: string;
  nickname: string;
  pan: string;
  cvv: string;
  expiryDate: string;
  cardholderName: string;
  status: 'Active' | 'Frozen' | 'Expired';
  balance: number;
  spendLimit: number;
  merchantLock?: string;
  autoExpiryDate: string;
  cardType: string;
  gradientColors: string[];
}

interface Transaction {
  id: string;
  merchant: string;
  amount: number;
  date: string;
  status: 'Success' | 'Failed' | 'Pending';
}

const VirtualCardDetailScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProp>();
  const route = useRoute();
  const { cardId } = route.params as { cardId: string };
  
  // Animation for card flip
  const flipAnimation = useRef(new Animated.Value(0)).current;
  const confirmationScale = useRef(new Animated.Value(0)).current;
  const confirmationOpacity = useRef(new Animated.Value(0)).current;
  const [isCardFlipped, setIsCardFlipped] = useState(false);
  const [isEditingNickname, setIsEditingNickname] = useState(false);
  const [showMoreMenu, setShowMoreMenu] = useState(false);
  const [showCardDetails, setShowCardDetails] = useState(false);
  const [showPinModal, setShowPinModal] = useState(false);
  const [pinModalAction, setPinModalAction] = useState<'viewCard' | 'freeze' | 'delete' | null>(null);
  const [showFreezeModal, setShowFreezeModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showConfirmationAnimation, setShowConfirmationAnimation] = useState(false);
  const [confirmationMessage, setConfirmationMessage] = useState('');
  
  // Focus states
  const [isNicknameFocused, setIsNicknameFocused] = useState(false);
  
  // Mock card data (would come from API/context)
  const [cardData, setCardData] = useState<VirtualCardDetail>({
    id: cardId,
    nickname: 'Shopping Card',
    pan: '4532 1234 5678 9012',
    cvv: '123',
    expiryDate: '12/26',
    cardholderName: 'JOHN DOE',
    status: 'Active',
    balance: 25000,
    spendLimit: 50000,
    merchantLock: 'Amazon',
    autoExpiryDate: '2026-12-15',
    cardType: 'Single-use',
    gradientColors: ['#06402B', '#A8E4A0'],
  });
  
  const [tempNickname, setTempNickname] = useState(cardData.nickname);
  
  // Mock recent transactions
  const recentTransactions: Transaction[] = [
    {
      id: '1',
      merchant: 'Amazon',
      amount: 15000,
      date: '2024-01-15',
      status: 'Success',
    },
    {
      id: '2',
      merchant: 'Jumia',
      amount: 8500,
      date: '2024-01-14',
      status: 'Success',
    },
    {
      id: '3',
      merchant: 'Netflix',
      amount: 2500,
      date: '2024-01-13',
      status: 'Failed',
    },
  ];
  
  const flipCard = () => {
    Animated.timing(flipAnimation, {
      toValue: isCardFlipped ? 0 : 1,
      duration: 600,
      useNativeDriver: true,
    }).start();
    setIsCardFlipped(!isCardFlipped);
  };
  
  const frontAnimatedStyle = {
    transform: [
      {
        rotateY: flipAnimation.interpolate({
          inputRange: [0, 1],
          outputRange: ['0deg', '180deg'],
        }),
      },
    ],
  };
  
  const backAnimatedStyle = {
    transform: [
      {
        rotateY: flipAnimation.interpolate({
          inputRange: [0, 1],
          outputRange: ['180deg', '360deg'],
        }),
      },
    ],
  };
  
  const handleNicknameEdit = () => {
    if (isEditingNickname) {
      // Save nickname
      setCardData(prev => ({ ...prev, nickname: tempNickname }));
      setIsEditingNickname(false);
    } else {
      setIsEditingNickname(true);
    }
  };
  
  const cancelNicknameEdit = () => {
    setTempNickname(cardData.nickname);
    setIsEditingNickname(false);
  };
  
  const handleFreeze = () => {
    setShowMoreMenu(false);
    setShowFreezeModal(true);
  };
  
  const handleDelete = () => {
    setShowMoreMenu(false);
    setShowDeleteModal(true);
  };
  
  const handleShare = () => {
    setShowMoreMenu(false);
    Alert.alert('Share Card', 'Share card details with trusted contacts only.');
  };
  
  const copyToClipboard = (text: string, label: string) => {
    Clipboard.setString(text);
    Alert.alert('Copied', `${label} copied to clipboard`);
  };

  // Handle card details visibility toggle
  const handleToggleCardDetails = () => {
    if (showCardDetails) {
      // If details are currently shown, hide them immediately
      setShowCardDetails(false);
    } else {
      // If details are hidden, show PIN modal to verify before showing
      requirePinForAction('viewCard');
    }
  };

  // Handle PIN verification for showing card details
  const handlePinVerified = () => {
    setShowPinModal(false);
    
    switch (pinModalAction) {
      case 'viewCard':
        setShowCardDetails(true);
        break;
      case 'freeze':
        executeFreeze();
        break;
      case 'delete':
        executeDelete();
        break;
    }
    setPinModalAction(null);
  };

  // Handle freeze PIN requirement from FreezeCardModal
  const handleFreezePinRequired = (cardId: string, shouldFreeze: boolean) => {
    setShowFreezeModal(false);
    setPinModalAction('freeze');
    setShowPinModal(true);
    // Store the freeze intention temporarily
    setCardData(prev => ({ ...prev, _pendingFreeze: shouldFreeze }));
  };

  // Handle delete PIN requirement from DeleteCardModal  
  const handleDeletePinRequired = (cardId: string) => {
    setShowDeleteModal(false);
    setPinModalAction('delete');
    setShowPinModal(true);
  };

  const requirePinForAction = (action: 'viewCard' | 'freeze' | 'delete') => {
    setPinModalAction(action);
    setShowPinModal(true);
  };

  const showConfirmationWithAnimation = (message: string) => {
    setConfirmationMessage(message);
    setShowConfirmationAnimation(true);
    confirmationScale.setValue(0);
    confirmationOpacity.setValue(0);
    
    Animated.spring(confirmationScale, {
      toValue: 1,
      useNativeDriver: true,
      tension: 100,
      friction: 8,
    }).start();
    
    Animated.timing(confirmationOpacity, {
      toValue: 1,
      duration: 300,
      useNativeDriver: true,
    }).start();

    // Auto hide after 2 seconds
    setTimeout(() => {
      setShowConfirmationAnimation(false);
    }, 2000);
  };

  const executeFreeze = () => {
    const shouldFreeze = (cardData as any)._pendingFreeze;
    const newStatus = shouldFreeze ? 'Frozen' : 'Active';
    setCardData(prev => ({
      ...prev,
      status: newStatus,
      _pendingFreeze: undefined
    }));
    
    const message = newStatus === 'Frozen' ? 'Card Frozen Successfully!' : 'Card Unfrozen Successfully!';
    showConfirmationWithAnimation(message);
  };

  const executeDelete = () => {
    showConfirmationWithAnimation('Card Deleted Successfully!');
    setTimeout(() => {
      navigation.goBack();
    }, 2000);
  };
  
  const getStatusColor = () => {
    switch (cardData.status) {
      case 'Active':
        return '#A8E4A0';
      case 'Frozen':
        return '#EA3B52';
      case 'Expired':
        return '#A3AABE';
      default:
        return '#A3AABE';
    }
  };
  
  const getTransactionStatusColor = (status: Transaction['status']) => {
    switch (status) {
      case 'Success':
        return '#A8E4A0';
      case 'Failed':
        return '#EA3B52';
      case 'Pending':
        return '#FFA500';
      default:
        return '#A3AABE';
    }
  };
  
  const getDaysUntilExpiry = () => {
    const today = new Date();
    const expiryDate = new Date(cardData.autoExpiryDate);
    const diffTime = expiryDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };
  
  const renderCardFront = () => (
    <Animated.View style={[styles.cardSide, styles.cardFront, frontAnimatedStyle]}>
      <View style={styles.cardHeader}>
        <Text style={styles.cardTypeText}>{cardData.cardType}</Text>
        <Text style={styles.cardBrandText}>KotaPay</Text>
      </View>
      
      <View style={styles.cardContent}>
        <Text style={styles.cardPAN}>
          {showCardDetails ? cardData.pan : '**** **** **** ****'}
        </Text>
        
        <View style={styles.cardBottomRow}>
          <View>
            <Text style={styles.cardLabel}>EXPIRES</Text>
            <Text style={styles.cardValue}>
              {showCardDetails ? cardData.expiryDate : '**/**'}
            </Text>
          </View>
          <View>
            <Text style={styles.cardLabel}>CARDHOLDER</Text>
            <Text style={styles.cardValue}>
              {showCardDetails ? cardData.cardholderName : '********'}
            </Text>
          </View>
        </View>
      </View>
    </Animated.View>
  );
  
  const renderCardBack = () => (
    <Animated.View style={[styles.cardSide, styles.cardBack, backAnimatedStyle]}>
      <View style={styles.magneticStrip} />
      
      <View style={styles.signaturePanel}>
        <Text style={styles.signaturePanelText}>Authorized Signature</Text>
      </View>
      
      <View style={styles.cvvSection}>
        <Text style={styles.cvvLabel}>CVV</Text>
        <TouchableOpacity
          style={styles.cvvContainer}
          onPress={() => showCardDetails && copyToClipboard(cardData.cvv, 'CVV')}
        >
          <Text style={styles.cvvText}>
            {showCardDetails ? cardData.cvv : '***'}
          </Text>
          {showCardDetails && <Copy size={16} color="#000" style={styles.copyIcon} />}
        </TouchableOpacity>
      </View>
      
      <Text style={styles.tapToCopyText}>
        {showCardDetails ? 'Tap CVV to copy' : 'Enter PIN to view details'}
      </Text>
    </Animated.View>
  );
  
  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={globalStyles.backButton} onPress={() => navigation.goBack()}>
          <ChevronLeft size={24} color={colors.primary} />
        </TouchableOpacity>
        
        <View style={styles.headerTitle}>
          {isEditingNickname ? (
            <View style={styles.editNicknameContainer}>
              <TextInput
                style={[
                  styles.nicknameInput,
                  isNicknameFocused && styles.nicknameInputFocused
                ]}
                value={tempNickname}
                onChangeText={setTempNickname}
                onFocus={() => setIsNicknameFocused(true)}
                onBlur={() => setIsNicknameFocused(false)}
                autoFocus
                selectTextOnFocus
              />
              <TouchableOpacity onPress={handleNicknameEdit} style={styles.editButton}>
                <Check size={20} color="#000d10" />
              </TouchableOpacity>
              <TouchableOpacity onPress={cancelNicknameEdit} style={styles.editButton}>
                <X size={20} color="#000d10" />
              </TouchableOpacity>
            </View>
          ) : (
            <TouchableOpacity style={styles.nicknameContainer} onPress={handleNicknameEdit}>
              <Text style={styles.nicknameText}>{cardData.nickname}</Text>
              <Edit3 size={16} color="#000d10" style={styles.editIcon} />
            </TouchableOpacity>
          )}
        </View>
        
        <TouchableOpacity
          style={styles.moreButton}
          onPress={() => setShowMoreMenu(!showMoreMenu)}
        >
          {showMoreMenu ? (
            <View style={styles.closeButtonContainer}>
              <X size={16} color="#EA3B52" />
              <Text style={styles.closeButtonText}>Close</Text>
            </View>
          ) : (
            <MoreHorizontal size={24} color="#000d10" />
          )}
        </TouchableOpacity>
      </View>
      
      {/* More Menu */}
      {showMoreMenu && (
        <>
          {/* Backdrop */}
          <TouchableOpacity 
            style={styles.menuBackdrop} 
            onPress={() => setShowMoreMenu(false)}
            activeOpacity={1}
          />
          <View style={styles.moreMenu}>
            <TouchableOpacity style={styles.menuItem} onPress={handleFreeze}>
              {cardData.status === 'Frozen' ? (
                <Unlock size={20} color={colors.text} />
              ) : (
                <Snowflake size={20} color={colors.text} />
              )}
              <Text style={styles.menuItemText}>
                {cardData.status === 'Frozen' ? 'Unfreeze' : 'Freeze'}
              </Text>
            </TouchableOpacity>
          
            <TouchableOpacity style={styles.menuItem} onPress={handleDelete}>
              <X size={20} color="#EA3B52" />
              <Text style={[styles.menuItemText, { color: '#EA3B52' }]}>Delete</Text>
            </TouchableOpacity>
          
            <TouchableOpacity style={styles.menuItem} onPress={handleShare}>
              <ArrowLeft size={20} color={colors.text} style={{ transform: [{ rotate: '45deg' }] }} />
              <Text style={styles.menuItemText}>Share</Text>
            </TouchableOpacity>
          </View>
        </>
      )}
      
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Card Visual */}
        <TouchableOpacity style={styles.cardContainer} onPress={flipCard} activeOpacity={0.9}>
          <View style={[styles.virtualCard, { backgroundColor: cardData.gradientColors[0] }]}>
            {!isCardFlipped ? renderCardFront() : renderCardBack()}
          </View>
          
          <View style={[styles.statusBadge, { backgroundColor: getStatusColor() }]}>
            <Text style={styles.statusText}>{cardData.status}</Text>
          </View>
        </TouchableOpacity>
        
        {/* Quick Actions */}
        <View style={styles.quickActions}>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => navigation.navigate('TopUpVirtualCardScreen', { cardId: cardData.id })}
          >
            <Plus size={24} color="#06402B" />
            <Text style={styles.actionButtonText}>Top-Up</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.actionButton} onPress={handleToggleCardDetails}>
            <EyeIcon 
              size={24} 
              color="#06402B" 
              filled={showCardDetails}
            />
            <Text style={styles.actionButtonText}>
              {showCardDetails ? 'Hide Card' : 'View Card'}
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.actionButton} onPress={() => setShowFreezeModal(true)}>
            {cardData.status === 'Frozen' ? (
              <Unlock size={24} color="#06402B" />
            ) : (
              <Snowflake size={24} color="#06402B" />
            )}
            <Text style={styles.actionButtonText}>
              {cardData.status === 'Frozen' ? 'Unfreeze' : 'Freeze'}
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => navigation.navigate('TransactionHistoryScreen', { cardId: cardData.id })}
          >
            <List size={24} color="#06402B" />
            <Text style={styles.actionButtonText}>History</Text>
          </TouchableOpacity>
        </View>
        
        {/* Security Info Card */}
        <View style={styles.securityCard}>
          <Text style={styles.securityTitle}>Security & Usage</Text>
          
          {/* Recent Transactions */}
          <View style={styles.securitySection}>
            <Text style={styles.securitySectionTitle}>Recent Transactions</Text>
            {recentTransactions.map((transaction) => (
              <View key={transaction.id} style={styles.transactionItem}>
                <View style={styles.transactionInfo}>
                  <Text style={styles.transactionMerchant}>{transaction.merchant}</Text>
                  <Text style={styles.transactionDate}>{transaction.date}</Text>
                </View>
                <View style={styles.transactionRight}>
                  <Text style={styles.transactionAmount}>₦{transaction.amount.toLocaleString()}</Text>
                  <View style={[
                    styles.transactionStatus,
                    { backgroundColor: getTransactionStatusColor(transaction.status) }
                  ]}>
                    <Text style={styles.transactionStatusText}>{transaction.status}</Text>
                  </View>
                </View>
              </View>
            ))}
          </View>
          
          {/* Merchant Lock Status */}
          {cardData.merchantLock && (
            <View style={styles.securitySection}>
              <Text style={styles.securitySectionTitle}>Merchant Lock</Text>
              <View style={styles.merchantLockInfo}>
                <Shield size={20} color="#06402B" />
                <Text style={styles.merchantLockText}>
                  Restricted to {cardData.merchantLock}
                </Text>
              </View>
            </View>
          )}
          
          {/* Auto-Expiry Countdown */}
          <View style={styles.securitySection}>
            <Text style={styles.securitySectionTitle}>Auto-Expiry</Text>
            <View style={styles.expiryInfo}>
              <Clock size={20} color="#EA3B52" />
              <Text style={styles.expiryText}>
                {getDaysUntilExpiry()} days remaining
              </Text>
            </View>
          </View>
          
          {/* Balance & Limit */}
          <View style={styles.securitySection}>
            <Text style={styles.securitySectionTitle}>Spending</Text>
            <View style={styles.spendingInfo}>
              <View style={styles.spendingItem}>
                <Text style={styles.spendingLabel}>Available Balance</Text>
                <Text style={styles.spendingValue}>₦{cardData.balance.toLocaleString()}</Text>
              </View>
              <View style={styles.spendingItem}>
                <Text style={styles.spendingLabel}>Spend Limit</Text>
                <Text style={styles.spendingValue}>₦{cardData.spendLimit.toLocaleString()}</Text>
              </View>
            </View>
          </View>
        </View>
      </ScrollView>
      
      {/* PIN Entry Modal for Actions */}
      <PinEntryModal
        visible={showPinModal}
        onClose={() => {
          setShowPinModal(false);
          setPinModalAction(null);
        }}
        onPinEntered={handlePinVerified}
        title="Verify PIN"
        subtitle={
          pinModalAction === 'viewCard' ? 'Enter PIN to view card details' :
          pinModalAction === 'freeze' ? 'Enter PIN to freeze/unfreeze card' :
          pinModalAction === 'delete' ? 'Enter PIN to delete card' :
          'Enter your PIN to continue'
        }
        allowBiometric={true}
      />

      {/* Freeze Card Modal */}
      <FreezeCardModal
        visible={showFreezeModal}
        onClose={() => setShowFreezeModal(false)}
        cardId={cardData.id}
        cardNickname={cardData.nickname}
        isCurrentlyFrozen={cardData.status === 'Frozen'}
        onPinRequired={handleFreezePinRequired}
      />

      {/* Delete Card Modal */}
      <DeleteCardModal
        visible={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        cardId={cardData.id}
        cardNickname={cardData.nickname}
        onPinRequired={handleDeletePinRequired}
      />

      {/* Confirmation Animation */}
      {showConfirmationAnimation && (
        <View style={styles.confirmationOverlay}>
          <Animated.View
            style={[
              styles.confirmationContainer,
              {
                opacity: confirmationOpacity,
                transform: [{ scale: confirmationScale }],
              },
            ]}
          >
            <Text style={styles.confirmationText}>{confirmationMessage}</Text>
          </Animated.View>
        </View>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    backgroundColor: '#FFF0F5',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.lg,
    paddingTop: spacing.xl,
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    flex: 1,
    alignItems: 'center',
  },
  editNicknameContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: borderRadius.small,
    paddingHorizontal: spacing.sm,
  },
  nicknameInput: {
    color: '#000d10',
    fontSize: 18,
    fontWeight: '600',
    paddingVertical: spacing.sm,
    minWidth: 120,
    textAlign: 'center',
  },
  nicknameInputFocused: {
    borderColor: '#06402B',
  },
  nicknameContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  nicknameText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000d10',
  },
  editIcon: {
    marginLeft: spacing.xs,
  },
  editButton: {
    padding: spacing.xs,
    marginLeft: spacing.xs,
  },
  moreButton: {
    padding: spacing.sm,
    zIndex: 1001,
    position: 'relative',
  },
  closeButtonContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.white,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.medium,
    gap: 4,
    ...shadows.small,
    borderWidth: 1,
    borderColor: '#EA3B52',
  },
  closeButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#EA3B52',
  },
  menuBackdrop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'transparent',
    zIndex: 999,
  },
  moreMenu: {
    position: 'absolute',
    top: 100,
    right: spacing.lg,
    backgroundColor: colors.white,
    borderRadius: borderRadius.medium,
    paddingVertical: spacing.sm,
    zIndex: 1000,
    ...shadows.large,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  menuItemText: {
    fontSize: 16,
    color: colors.text,
    marginLeft: spacing.sm,
  },
  content: {
    flex: 1,
    paddingHorizontal: spacing.lg,
  },
  cardContainer: {
    marginTop: spacing.lg,
    marginBottom: spacing.xl,
    position: 'relative',
  },
  virtualCard: {
    height: 200,
    borderRadius: borderRadius.large,
    ...shadows.medium,
    position: 'relative',
  },
  cardSide: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    backfaceVisibility: 'hidden',
    borderRadius: borderRadius.large,
    padding: spacing.lg,
  },
  cardFront: {
    justifyContent: 'space-between',
  },
  cardBack: {
    backgroundColor: '#F5F5F5',
    paddingTop: spacing.xl,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  cardTypeText: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.white,
    opacity: 0.9,
  },
  cardBrandText: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.white,
  },
  cardContent: {
    justifyContent: 'flex-end',
  },
  cardPAN: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.white,
    marginBottom: spacing.lg,
    letterSpacing: 2,
  },
  cardBottomRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  cardLabel: {
    fontSize: 10,
    fontWeight: '500',
    color: colors.white,
    opacity: 0.7,
    marginBottom: 4,
  },
  cardValue: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.white,
  },
  magneticStrip: {
    height: 40,
    backgroundColor: '#000',
    marginHorizontal: -spacing.lg,
    marginBottom: spacing.lg,
  },
  signaturePanel: {
    height: 30,
    backgroundColor: '#FFF',
    borderRadius: 4,
    justifyContent: 'center',
    paddingHorizontal: spacing.sm,
    marginBottom: spacing.lg,
  },
  signaturePanelText: {
    fontSize: 10,
    color: '#888',
  },
  cvvSection: {
    alignItems: 'flex-end',
    marginBottom: spacing.sm,
  },
  cvvLabel: {
    fontSize: 10,
    color: '#666',
    marginBottom: 4,
  },
  cvvContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF',
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderRadius: 4,
  },
  cvvText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000',
    marginRight: spacing.xs,
  },
  copyIcon: {
    opacity: 0.6,
  },
  tapToCopyText: {
    fontSize: 10,
    color: '#666',
    textAlign: 'center',
    fontStyle: 'italic',
  },
  statusBadge: {
    position: 'absolute',
    top: spacing.sm,
    right: spacing.sm,
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderRadius: borderRadius.small,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.white,
  },
  quickActions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: spacing.xl,
  },
  actionButton: {
    alignItems: 'center',
    backgroundColor: colors.white,
    paddingVertical: spacing.lg,
    paddingHorizontal: spacing.lg,
    borderRadius: borderRadius.medium,
    flex: 1,
    marginHorizontal: spacing.xs,
    ...shadows.small,
  },
  actionButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#06402B',
    marginTop: spacing.xs,
  },
  securityCard: {
    backgroundColor: colors.white,
    borderRadius: borderRadius.large,
    padding: spacing.lg,
    marginBottom: spacing.xl,
    ...shadows.medium,
  },
  securityTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
    marginBottom: spacing.lg,
  },
  securitySection: {
    marginBottom: spacing.lg,
  },
  securitySectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
    marginBottom: spacing.sm,
  },
  transactionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  transactionInfo: {
    flex: 1,
  },
  transactionMerchant: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.text,
  },
  transactionDate: {
    fontSize: 12,
    color: colors.secondaryText,
    marginTop: 2,
  },
  transactionRight: {
    alignItems: 'flex-end',
  },
  transactionAmount: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 4,
  },
  transactionStatus: {
    paddingHorizontal: spacing.xs,
    paddingVertical: 2,
    borderRadius: borderRadius.small,
  },
  transactionStatusText: {
    fontSize: 10,
    fontWeight: '500',
    color: colors.white,
  },
  merchantLockInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  merchantLockText: {
    fontSize: 14,
    color: colors.text,
    marginLeft: spacing.sm,
  },
  expiryInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  expiryText: {
    fontSize: 14,
    color: '#EA3B52',
    marginLeft: spacing.sm,
    fontWeight: '500',
  },
  spendingInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  spendingItem: {
    flex: 1,
  },
  spendingLabel: {
    fontSize: 12,
    color: colors.secondaryText,
    marginBottom: 4,
  },
  spendingValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#06402B',
  },
  confirmationOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  confirmationContainer: {
    backgroundColor: colors.white,
    borderRadius: borderRadius.large,
    padding: spacing.xl,
    alignItems: 'center',
    marginHorizontal: spacing.xl,
    ...shadows.large,
  },
  confirmationText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#06402B',
    textAlign: 'center',
  },
});

export default VirtualCardDetailScreen;
