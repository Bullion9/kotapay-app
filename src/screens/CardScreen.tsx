import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
} from 'react-native';
import {
  CreditCard,
  Plus,
  Eye,
  EyeOff,
  Settings,
  Lock,
  MoreHorizontal,
} from 'lucide-react-native';
import { colors, spacing, typography, borderRadius, shadows, iconSizes } from '../theme';

const CardScreen: React.FC = () => {
  const [showCardNumber, setShowCardNumber] = React.useState(false);

  const cards = [
    {
      id: '1',
      type: 'Virtual',
      last4: '4532',
      balance: 1234.56,
      isActive: true,
      color: colors.primary,
    },
    {
      id: '2',
      type: 'Physical',
      last4: '8901',
      balance: 567.89,
      isActive: false,
      color: colors.accent,
    },
  ];

  const toggleCardNumber = () => setShowCardNumber(!showCardNumber);

  const renderCard = (card: typeof cards[0]) => (
    <View key={card.id} style={[styles.card, { backgroundColor: card.color }]}>
      <View style={styles.cardHeader}>
        <Text style={styles.cardType}>{card.type} Card</Text>
        <TouchableOpacity onPress={toggleCardNumber}>
          {showCardNumber ? (
            <EyeOff size={iconSizes.sm} color={colors.white} />
          ) : (
            <Eye size={iconSizes.sm} color={colors.white} />
          )}
        </TouchableOpacity>
      </View>
      
      <View style={styles.cardBody}>
        <Text style={styles.cardNumber}>
          {showCardNumber ? `•••• •••• •••• ${card.last4}` : '•••• •••• •••• ••••'}
        </Text>
        <View style={styles.cardRow}>
          <View>
            <Text style={styles.cardLabel}>Balance</Text>
            <Text style={styles.cardBalance}>₦{card.balance.toFixed(2)}</Text>
          </View>
          <View style={styles.cardActions}>
            <TouchableOpacity style={styles.cardActionButton}>
              <Settings size={iconSizes.sm} color={colors.white} />
            </TouchableOpacity>
            <TouchableOpacity style={styles.cardActionButton}>
              <Lock size={iconSizes.sm} color={colors.white} />
            </TouchableOpacity>
            <TouchableOpacity style={styles.cardActionButton}>
              <MoreHorizontal size={iconSizes.sm} color={colors.white} />
            </TouchableOpacity>
          </View>
        </View>
      </View>
      
      <View style={styles.cardFooter}>
        <Text style={styles.cardStatus}>
          {card.isActive ? 'Active' : 'Inactive'}
        </Text>
        <View style={styles.cardLogo}>
          <CreditCard size={iconSizes.lg} color={colors.white} />
        </View>
      </View>
    </View>
  );

  const quickActions = [
    {
      title: 'Add Card',
      icon: Plus,
      color: colors.success,
      onPress: () => {/* Add Card functionality */},
    },
    {
      title: 'Freeze Card',
      icon: Lock,
      color: colors.warning,
      onPress: () => {/* Freeze Card functionality */},
    },
    {
      title: 'Card Settings',
      icon: Settings,
      color: colors.primary,
      onPress: () => {/* Card Settings functionality */},
    },
  ];

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={styles.title}>My Cards</Text>
          <Text style={styles.subtitle}>Manage your payment cards</Text>
        </View>

        <View style={styles.cardsContainer}>
          {cards.map(renderCard)}
        </View>

        <View style={styles.actionsContainer}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>
          <View style={styles.actionsGrid}>
            {quickActions.map((action, index) => (
              <TouchableOpacity key={index} style={styles.actionCard} onPress={action.onPress}>
                <View style={[styles.actionIcon, { backgroundColor: action.color }]}>
                  <action.icon size={iconSizes.lg} color={colors.white} />
                </View>
                <Text style={styles.actionTitle}>{action.title}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={styles.infoContainer}>
          <Text style={styles.sectionTitle}>Card Information</Text>
          <View style={styles.infoCard}>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Virtual Card Limit</Text>
              <Text style={styles.infoValue}>₦2,000,000/month</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Physical Card Fee</Text>
              <Text style={styles.infoValue}>₦4,000.00</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>International Transactions</Text>
              <Text style={styles.infoValue}>Enabled</Text>
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    padding: spacing.xl,
    paddingBottom: spacing.lg,
  },
  title: {
    ...typography.h2,
    color: colors.text,
    marginBottom: spacing.xs,
  },
  subtitle: {
    ...typography.caption,
    color: colors.secondaryText,
  },
  cardsContainer: {
    paddingHorizontal: spacing.xl,
    gap: spacing.lg,
  },
  card: {
    borderRadius: borderRadius.large,
    padding: spacing.xl,
    ...shadows.medium,
    minHeight: 200,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  cardType: {
    ...typography.body,
    color: colors.white,
    fontWeight: '600',
  },
  cardBody: {
    flex: 1,
  },
  cardNumber: {
    ...typography.h3,
    color: colors.white,
    letterSpacing: 2,
    marginBottom: spacing.lg,
  },
  cardRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
  },
  cardLabel: {
    ...typography.small,
    color: colors.white,
    opacity: 0.8,
    marginBottom: spacing.xs,
  },
  cardBalance: {
    ...typography.h3,
    color: colors.white,
    fontWeight: 'bold',
  },
  cardActions: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  cardActionButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: spacing.lg,
  },
  cardStatus: {
    ...typography.caption,
    color: colors.white,
    fontWeight: '600',
  },
  cardLogo: {
    opacity: 0.7,
  },
  actionsContainer: {
    padding: spacing.xl,
  },
  sectionTitle: {
    ...typography.h3,
    color: colors.text,
    marginBottom: spacing.lg,
  },
  actionsGrid: {
    flexDirection: 'row',
    gap: spacing.lg,
  },
  actionCard: {
    flex: 1,
    backgroundColor: 'transparent',
    borderRadius: borderRadius.medium,
    padding: spacing.lg,
    alignItems: 'center',
    ...shadows.small,
  },
  actionIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.md,
  },
  actionTitle: {
    ...typography.caption,
    color: colors.text,
    textAlign: 'center',
    fontWeight: '600',
  },
  infoContainer: {
    padding: spacing.xl,
    paddingTop: 0,
  },
  infoCard: {
    backgroundColor: colors.white,
    borderRadius: borderRadius.medium,
    padding: spacing.lg,
    ...shadows.small,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  infoLabel: {
    ...typography.body,
    color: colors.text,
  },
  infoValue: {
    ...typography.body,
    color: colors.secondaryText,
    fontWeight: '600',
  },
});

export default CardScreen;
