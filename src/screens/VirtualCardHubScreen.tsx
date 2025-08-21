import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  FlatList,
  Dimensions,
  Alert,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { PlusCircle } from 'lucide-react-native';
import { colors, spacing, borderRadius, shadows } from '../theme';
import { EyeIcon } from '../components/icons';

type RootStackParamList = {
  CreateVirtualCardScreen: undefined;
  VirtualCardDetailScreen: { cardId: string };
};

type NavigationProp = StackNavigationProp<RootStackParamList>;

interface VirtualCard {
  id: string;
  lastFourDigits: string;
  expiryDate: string;
  status: 'Active' | 'Frozen' | 'Expired';
  balance: number;
  cardType: string;
  gradientColors: string[];
}

const { width: screenWidth } = Dimensions.get('window');
const cardWidth = screenWidth * 0.85;

const VirtualCardHubScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProp>();
  const [showCardBalances, setShowCardBalances] = useState<{[key: string]: boolean}>({});
  
  // Mock data for virtual cards
  const [virtualCards] = useState<VirtualCard[]>([
    {
      id: '1',
      lastFourDigits: '4567',
      expiryDate: '12/26',
      status: 'Active',
      balance: 25000,
      cardType: 'Shopping Card',
      gradientColors: ['#06402B', '#A8E4A0'],
    },
    {
      id: '2',
      lastFourDigits: '8901',
      expiryDate: '08/25',
      status: 'Frozen',
      balance: 15000,
      cardType: 'Travel Card',
      gradientColors: ['#8B0000', '#DC143C'],
    },
    {
      id: '3',
      lastFourDigits: '2345',
      expiryDate: '03/24',
      status: 'Expired',
      balance: 0,
      cardType: 'Subscription Card',
      gradientColors: ['#4B0082', '#663399'],
    },
  ]);

  const toggleCardBalance = (cardId: string) => {
    setShowCardBalances(prev => ({
      ...prev,
      [cardId]: !prev[cardId]
    }));
  };

  const getStatusColor = (status: VirtualCard['status']) => {
    switch (status) {
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

  const renderCard = ({ item }: { item: VirtualCard }) => (
    <TouchableOpacity
      style={styles.cardContainer}
      onPress={() => navigation.navigate('VirtualCardDetailScreen', { cardId: item.id })}
      activeOpacity={0.8}
    >
      <View style={[styles.virtualCard, { backgroundColor: item.gradientColors[0] }]}>
        <View style={styles.cardHeader}>
          <Text style={styles.cardType}>{item.cardType}</Text>
          <View style={[styles.statusChip, { backgroundColor: getStatusColor(item.status) }]}>
            <Text style={styles.statusText}>{item.status}</Text>
          </View>
        </View>
        
        <View style={styles.cardContent}>
          <Text style={styles.cardNumber}>•••• •••• •••• {item.lastFourDigits}</Text>
          <View style={styles.cardDetails}>
            <View>
              <Text style={styles.cardLabel}>EXPIRES</Text>
              <Text style={styles.cardValue}>{item.expiryDate}</Text>
            </View>
            <View style={styles.balanceSection}>
              <View style={styles.balanceRow}>
                <View>
                  <Text style={styles.cardLabel}>BALANCE</Text>
                  <Text style={styles.cardValue}>
                    {showCardBalances[item.id] ? `₦${item.balance.toLocaleString()}` : '••••••'}
                  </Text>
                </View>
                <TouchableOpacity 
                  onPress={() => toggleCardBalance(item.id)}
                  style={styles.eyeButton}
                >
                  <EyeIcon 
                    size={16} 
                    color={colors.white} 
                    filled={!showCardBalances[item.id]}
                  />
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.placeholder} />
        
        <View style={styles.headerCenter}>
          <Text style={styles.headerTitle}>Virtual Cards</Text>
        </View>
        
        <View style={styles.placeholder} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Active Cards Section */}
        <View style={styles.cardsSection}>
          <Text style={styles.sectionTitle}>Your Virtual Cards</Text>
          
          {virtualCards.length > 0 ? (
            <FlatList
              data={virtualCards}
              renderItem={renderCard}
              keyExtractor={(item) => item.id}
              horizontal
              showsHorizontalScrollIndicator={false}
              snapToInterval={cardWidth + spacing.md}
              decelerationRate="fast"
              contentContainerStyle={styles.cardsList}
            />
          ) : (
            <View style={styles.emptyState}>
              <Text style={styles.emptyStateText}>No virtual cards yet</Text>
              <Text style={styles.emptyStateSubtext}>Create your first virtual card to get started</Text>
            </View>
          )}
        </View>
      </ScrollView>

      {/* Card Limit Message */}
      {virtualCards.some(card => card.status === 'Active') && (
        <View style={styles.limitMessage}>
          <Text style={styles.limitMessageText}>
            You can only have one active virtual card at a time
          </Text>
        </View>
      )}

      {/* FAB */}
      {!virtualCards.some(card => card.status === 'Active') ? (
        <TouchableOpacity
          style={styles.fab}
          onPress={() => navigation.navigate('CreateVirtualCardScreen')}
          activeOpacity={0.8}
        >
          <PlusCircle size={24} color={colors.white} />
        </TouchableOpacity>
      ) : (
        <TouchableOpacity
          style={[styles.fab, styles.fabDisabled]}
          onPress={() => {
            Alert.alert(
              'Card Limit Reached',
              'You can only have one active virtual card at a time. Please deactivate your current card before creating a new one.',
              [{ text: 'OK', style: 'default' }]
            );
          }}
          activeOpacity={0.8}
        >
          <PlusCircle size={24} color={colors.white} />
        </TouchableOpacity>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFF0F5',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#FFF0F5',
  },
  headerCenter: {
    flex: 1,
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#000d10',
  },
  placeholder: {
    width: 40,
  },
  content: {
    flex: 1,
  },

  cardsSection: {
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.xl,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
    marginBottom: spacing.lg,
  },
  cardsList: {
    paddingLeft: spacing.md,
  },
  cardContainer: {
    width: cardWidth,
    marginRight: spacing.md,
  },
  virtualCard: {
    height: 200,
    borderRadius: borderRadius.large,
    padding: spacing.lg,
    justifyContent: 'space-between',
    ...shadows.medium,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  cardType: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.white,
    opacity: 0.9,
  },
  statusChip: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderRadius: borderRadius.small,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.white,
  },
  cardContent: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  cardNumber: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.white,
    marginBottom: spacing.lg,
    letterSpacing: 2,
  },
  cardDetails: {
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
  balanceSection: {
    flex: 1,
  },
  balanceRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
  },
  eyeButton: {
    padding: 4,
    marginLeft: 8,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: spacing.xl * 2,
  },
  emptyStateText: {
    fontSize: 16,
    fontWeight: '500',
    color: colors.text,
    marginBottom: spacing.xs,
  },
  emptyStateSubtext: {
    fontSize: 14,
    color: colors.secondaryText,
    textAlign: 'center',
  },
  fab: {
    position: 'absolute',
    bottom: spacing.xl,
    right: spacing.lg,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#06402B',
    alignItems: 'center',
    justifyContent: 'center',
    ...shadows.large,
    elevation: 8,
  },
  fabDisabled: {
    backgroundColor: colors.secondaryText,
    opacity: 0.7,
  },
  limitMessage: {
    position: 'absolute',
    bottom: spacing.xl + 70, // Position above FAB
    left: spacing.lg,
    right: spacing.lg,
    backgroundColor: colors.primary + '15', // Very light primary color
    padding: spacing.md,
    borderRadius: borderRadius.medium,
    alignItems: 'center',
    justifyContent: 'center',
  },
  limitMessageText: {
    color: colors.primary,
    fontSize: 14,
    textAlign: 'center',
    fontWeight: '500',
  },
});

export default VirtualCardHubScreen;
