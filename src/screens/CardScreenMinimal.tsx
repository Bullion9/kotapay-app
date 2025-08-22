import React, { useState } from 'react';
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
  ChevronLeft,
  Freeze,
} from 'lucide-react-native';
import { colors, spacing, borderRadius, shadows } from '../theme';

const CardScreenMinimal: React.FC = () => {
  const [showBalance, setShowBalance] = useState(false);

  const cards = [
    {
      id: '1',
      type: 'Virtual',
      last4: '4532',
      balance: 1234.56,
      isActive: true,
      color: '#06402B',
    },
    {
      id: '2',
      type: 'Physical',
      last4: '8901',
      balance: 567.89,
      isActive: false,
      color: '#000d10',
    },
  ];

  const totalBalance = cards.reduce((sum, card) => sum + card.balance, 0);

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton}>
          <ChevronLeft size={24} color={colors.primary} />
        </TouchableOpacity>
        <View style={styles.headerPlaceholder} />
        <Text style={styles.headerTitle}>My Cards - Simplified</Text>
        <View style={styles.headerPlaceholder} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Card Info */}
        <View style={styles.cardInfo}>
          <View style={styles.cardHeader}>
            <Text style={styles.cardTitle}>Total Balance</Text>
            <TouchableOpacity onPress={() => setShowBalance(!showBalance)}>
              {showBalance ? (
                <EyeOff size={20} color={colors.white} />
              ) : (
                <Eye size={20} color={colors.white} />
              )}
            </TouchableOpacity>
          </View>
          <Text style={styles.cardBalance}>
            {showBalance ? `₦${totalBalance.toFixed(2)}` : '••••••'}
          </Text>
          <Text style={styles.cardSubtitle}>
            Across {cards.length} active cards
          </Text>
        </View>

        {/* Cards List */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Your Cards</Text>
          <View style={styles.cardsList}>
            {cards.map((card, index) => (
              <View key={card.id} style={styles.cardItem}>
                <View style={[styles.cardIcon, { backgroundColor: card.color }]}>
                  <CreditCard size={24} color={colors.white} />
                </View>
                <View style={styles.cardDetails}>
                  <Text style={styles.cardType}>{card.type} Card</Text>
                  <Text style={styles.cardNumber}>
                    •••• {card.last4} • {card.isActive ? 'Active' : 'Inactive'}
                  </Text>
                  <Text style={styles.cardAmount}>₦{card.balance.toFixed(2)}</Text>
                </View>
              </View>
            ))}
          </View>
        </View>

        {/* Quick Actions */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>
          
          <TouchableOpacity style={styles.actionButton}>
            <View style={styles.actionIcon}>
              <Plus size={24} color={colors.white} />
            </View>
            <View style={styles.actionContent}>
              <Text style={styles.actionTitle}>Add New Card</Text>
              <Text style={styles.actionSubtitle}>Create virtual or link physical card</Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity style={styles.actionButton}>
            <View style={[styles.actionIcon, { backgroundColor: colors.error }]}>
              <Freeze size={24} color={colors.white} />
            </View>
            <View style={styles.actionContent}>
              <Text style={styles.actionTitle}>Freeze Card</Text>
              <Text style={styles.actionSubtitle}>Temporarily disable card transactions</Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity style={styles.actionButton}>
            <View style={[styles.actionIcon, { backgroundColor: '#000d10' }]}>
              <Settings size={24} color={colors.white} />
            </View>
            <View style={styles.actionContent}>
              <Text style={styles.actionTitle}>Card Settings</Text>
              <Text style={styles.actionSubtitle}>Manage limits and preferences</Text>
            </View>
          </TouchableOpacity>
        </View>

        <View style={styles.bottomPadding} />
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
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.lg,
    backgroundColor: colors.white,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  headerPlaceholder: {
    width: 40,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.background,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: colors.border,
  },
  headerTitle: {
    flex: 1,
    textAlign: 'center',
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
  },
  content: {
    paddingHorizontal: spacing.xl,
  },
  cardInfo: {
    backgroundColor: colors.primary,
    borderRadius: borderRadius.large,
    padding: spacing.xl,
    margin: spacing.xl,
    ...shadows.medium,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.white,
  },
  cardBalance: {
    fontSize: 32,
    fontWeight: 'bold',
    color: colors.white,
    marginBottom: spacing.xs,
  },
  cardSubtitle: {
    fontSize: 14,
    color: colors.white,
    opacity: 0.8,
  },
  section: {
    paddingHorizontal: spacing.xl,
    marginBottom: spacing.xl,
  },
  sectionTitle: {
    fontSize: 20,
    color: colors.text,
    marginBottom: spacing.lg,
    fontWeight: '600',
  },
  cardsList: {
    gap: spacing.md,
  },
  cardItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.white,
    borderRadius: borderRadius.medium,
    padding: spacing.lg,
    ...shadows.small,
  },
  cardIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  cardDetails: {
    flex: 1,
  },
  cardType: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginBottom: spacing.xs,
  },
  cardNumber: {
    fontSize: 14,
    color: colors.secondaryText,
    marginBottom: spacing.xs,
  },
  cardAmount: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.primary,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.white,
    borderRadius: borderRadius.medium,
    padding: spacing.lg,
    marginBottom: spacing.md,
    ...shadows.small,
  },
  actionIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  actionContent: {
    flex: 1,
  },
  actionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginBottom: spacing.xs,
  },
  actionSubtitle: {
    fontSize: 14,
    color: colors.secondaryText,
  },
  bottomPadding: {
    height: 100,
  },
});

export default CardScreenMinimal;
