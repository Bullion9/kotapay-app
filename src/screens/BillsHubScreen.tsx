import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import {
  ChevronLeft,
  Zap,
  Smartphone,
  Wifi,
  Droplets,
  Tv,
  Trophy,
  Globe,
} from 'lucide-react-native';
import { RootStackParamList } from '../types';
import { colors, spacing, borderRadius, shadows, iconSizes, globalStyles } from '../theme';

type BillsHubScreenNavigationProp = StackNavigationProp<RootStackParamList>;

interface BillCategory {
  id: string;
  title: string;
  icon: any;
  description: string;
  isAvailable: boolean;
  category: string;
  color?: string;
  version?: 'v1' | 'v2';
}

const BillsHubScreen: React.FC = () => {
  const navigation = useNavigation<BillsHubScreenNavigationProp>();

  const billCategories = [
    {
      id: 'airtime',
      title: 'Airtime',
      description: 'Recharge your mobile phone',
      icon: Smartphone,
      color: colors.seaGreen,
      category: 'airtime',
      isAvailable: true,
    },
    {
      id: 'data',
      title: 'Data',
      description: 'Buy data bundles',
      icon: Wifi,
      color: colors.seaGreen,
      category: 'internet',
      isAvailable: true,
    },
    {
      id: 'cable',
      title: 'Cable TV',
      description: 'Renew TV subscriptions',
      icon: Tv,
      color: colors.seaGreen,
      category: 'cable',
      isAvailable: true,
    },
    {
      id: 'electricity',
      title: 'Electricity',
      description: 'Pay your electricity bills',
      icon: Zap,
      color: colors.seaGreen,
      category: 'electricity',
      isAvailable: true,
    },
    {
      id: 'betting',
      title: 'Betting',
      description: 'Fund betting accounts',
      icon: Trophy,
      color: colors.seaGreen,
      category: 'betting',
      isAvailable: true,
    },
    {
      id: 'water',
      title: 'Water',
      description: 'Pay your water bills',
      icon: Droplets,
      color: colors.seaGreen,
      category: 'water',
      isAvailable: true,
    },
    {
      id: 'internet',
      title: 'Internet',
      description: 'Internet service subscriptions',
      icon: Globe,
      color: colors.seaGreen,
      category: 'internet-service',
      isAvailable: true,
    },
  ];  const handleCategoryPress = (category: BillCategory) => {
    if (!category.isAvailable) {
      // Show coming soon message for v2 features
      return;
    }

    // Handle Sports Betting navigation
    if (category.id === 'betting') {
      navigation.navigate('Betting');
      return;
    }

    // Handle Airtime Top-up navigation
    if (category.id === 'airtime') {
      navigation.navigate('AirtimeTopUp');
      return;
    }

    // For other categories, navigate to bill payment screen with category
    navigation.navigate('BillPayment', { 
      category: category.category,
      title: category.title 
    });
  };

  const BillCategoryTile: React.FC<{ category: BillCategory }> = ({ category }) => {
    const IconComponent = category.icon;
    
    return (
      <TouchableOpacity
        style={[
          styles.categoryTile,
          !category.isAvailable && styles.categoryTileDisabled
        ]}
        onPress={() => handleCategoryPress(category)}
        activeOpacity={0.7}
        disabled={!category.isAvailable}
      >
        <View style={styles.iconContainer}>
          <IconComponent
            size={iconSizes.lg}
            color={category.isAvailable ? colors.seaGreen : colors.secondaryText}
          />
        </View>
        
        <Text style={[
          styles.categoryTitle,
          !category.isAvailable && styles.categoryTitleDisabled
        ]}>
          {category.title}
        </Text>
        
        <Text style={[
          styles.categoryDescription,
          !category.isAvailable && styles.categoryDescriptionDisabled
        ]}>
          {category.description}
        </Text>

        {!category.isAvailable && (
          <View style={styles.comingSoonBadge}>
            <Text style={styles.comingSoonText}>Coming Soon</Text>
          </View>
        )}
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={globalStyles.backButton}
          onPress={() => navigation.goBack()}
        >
          <ChevronLeft size={24} color={colors.primary} />
        </TouchableOpacity>
        
        <View style={styles.headerPlaceholder} />
        <Text style={styles.headerTitle}>Bill Payments</Text>
        <View style={styles.headerPlaceholder} />
      </View>

      {/* Content */}
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.headerSection}>
          <Text style={styles.sectionDescription}>
            Quick and secure bill payments for all your utilities
          </Text>
        </View>

        <View style={styles.categoriesGrid}>
          {billCategories.map((category) => (
            <BillCategoryTile
              key={category.id}
              category={category}
            />
          ))}
        </View>

        {/* Info Section */}
        <View style={styles.infoSection}>
          <Text style={styles.infoTitle}>Quick & Secure</Text>
          <Text style={styles.infoText}>
            All payments are processed securely through our encrypted payment system. 
            Receipts are automatically generated and stored for your records.
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFF0F5',
  },
  header: {
    backgroundColor: '#FFF0F5',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.lg,
    paddingTop: spacing.xl,
  },
  headerPlaceholder: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000d10',
    textAlign: 'center',
  },
  content: {
    flex: 1,
    padding: spacing.md,
    backgroundColor: '#FFF0F5',
  },
  headerSection: {
    marginBottom: spacing.xl,
    backgroundColor: '#FFE4E8',
    borderRadius: borderRadius.large,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: '#FFD1D9',
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.text,
    marginBottom: spacing.xs,
  },
  sectionDescription: {
    fontSize: 16,
    color: colors.secondaryText,
    lineHeight: 22,
    textAlign: 'center',
  },
  categoriesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: spacing.xl,
  },
  categoryTile: {
    width: '48%',
    backgroundColor: colors.white,
    borderRadius: borderRadius.medium,
    padding: spacing.md,
    marginBottom: spacing.md,
    alignItems: 'center',
    minHeight: 140,
    ...shadows.billsCard,
    elevation: 2,
  },
  categoryTileDisabled: {
    backgroundColor: colors.disabled,
    opacity: 0.6,
  },
  iconContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: colors.white,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.sm,
    ...shadows.small,
  },
  categoryTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
    textAlign: 'center',
    marginBottom: spacing.xs,
  },
  categoryTitleDisabled: {
    color: colors.secondaryText,
  },
  categoryDescription: {
    fontSize: 12,
    color: colors.secondaryText,
    textAlign: 'center',
    lineHeight: 16,
  },
  categoryDescriptionDisabled: {
    color: colors.placeholder,
  },
  comingSoonBadge: {
    position: 'absolute',
    top: spacing.xs,
    right: spacing.xs,
    backgroundColor: colors.warning,
    paddingHorizontal: spacing.xs,
    paddingVertical: 2,
    borderRadius: borderRadius.small,
  },
  comingSoonText: {
    fontSize: 10,
    fontWeight: '600',
    color: colors.white,
  },
  infoSection: {
    backgroundColor: '#FFE4E8',
    borderRadius: borderRadius.large,
    padding: spacing.md,
    marginTop: spacing.lg,
    borderWidth: 1,
    borderColor: '#FFD1D9',
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginBottom: spacing.xs,
  },
  infoText: {
    fontSize: 14,
    color: colors.secondaryText,
    lineHeight: 20,
  },
});

export default BillsHubScreen;
