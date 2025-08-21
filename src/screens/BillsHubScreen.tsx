import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  RefreshControl,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  ChevronLeft,
  Zap,
  Smartphone,
  Wifi,
  Tv,
  Trophy,
  ChevronRight,
} from 'lucide-react-native';
import { colors } from '../theme';

interface BillCategory {
  id: string;
  title: string;
  icon: any;
  description: string;
  screen: string;
  isAvailable: boolean;
}

const BillsHubScreen: React.FC = () => {
  const navigation = useNavigation();

  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = React.useCallback(() => {
    setRefreshing(true);
    // Refresh bills or reload data
    setTimeout(() => {
      setRefreshing(false);
    }, 1000);
  }, []);

  const billCategories: BillCategory[] = [
    {
      id: 'airtime',
      title: 'Airtime Top-up',
      icon: Smartphone,
      description: 'Buy airtime for all networks',
      screen: 'AirtimeTopUpScreen',
      isAvailable: true,
    },
    {
      id: 'data',
      title: 'Data Bundles',
      icon: Wifi,
      description: 'Purchase data plans',
      screen: 'DataTopUpScreen',
      isAvailable: true,
    },
    {
      id: 'electricity',
      title: 'Electricity Bills',
      icon: Zap,
      description: 'Pay electricity bills',
      screen: 'ElectricityBillScreen',
      isAvailable: true,
    },
    {
      id: 'cabletv',
      title: 'Cable TV',
      icon: Tv,
      description: 'Subscribe to cable TV',
      screen: 'CableTVScreen',
      isAvailable: true,
    },
    {
      id: 'betting',
      title: 'Betting Wallet',
      icon: Trophy,
      description: 'Fund betting accounts',
      screen: 'BettingScreen',
      isAvailable: true,
    },
  ];

  const handleCategoryPress = (category: BillCategory) => {
    if (!category.isAvailable) {
      return;
    }
    
    // Navigate to the specific screen
    navigation.navigate(category.screen as never);
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <ChevronLeft size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Bills & Utilities</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView 
        style={styles.content} 
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* Bill Categories */}
        <View style={styles.categoriesSection}>
          <Text style={styles.sectionTitle}>Available Services</Text>
          
          <View style={styles.categoriesGrid}>
            {billCategories.map((category) => (
              <TouchableOpacity
                key={category.id}
                style={[
                  styles.categoryCard,
                  !category.isAvailable && styles.categoryCardDisabled
                ]}
                onPress={() => handleCategoryPress(category)}
                disabled={!category.isAvailable}
              >
                <View style={styles.categoryIconContainer}>
                  <category.icon 
                    size={32} 
                    color={category.isAvailable ? colors.primary : colors.disabled} 
                  />
                </View>
                
                <View style={styles.categoryInfo}>
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
                </View>
                
                <ChevronRight 
                  size={20} 
                  color={category.isAvailable ? colors.secondaryText : colors.disabled}
                />
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Tips Section */}
        <View style={styles.tipsSection}>
          <Text style={styles.sectionTitle}>💡 Tips</Text>
          
          <View style={styles.tipCard}>
            <Text style={styles.tipText}>
              • Save your meter numbers and user IDs for faster payments
            </Text>
            <Text style={styles.tipText}>
              • All transactions are secure and encrypted
            </Text>
            <Text style={styles.tipText}>
              • Get instant confirmation for all bill payments
            </Text>
          </View>
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
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#FFF0F5',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5EA',
  },
  backButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#000',
  },
  placeholder: {
    width: 40,
    height: 40,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  categoriesSection: {
    marginTop: 8,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 16,
  },
  categoriesGrid: {
    gap: 12,
  },
  categoryCard: {
    backgroundColor: colors.card,
    borderRadius: 16,
    padding: 20,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
  },
  categoryCardDisabled: {
    backgroundColor: colors.disabled,
    opacity: 0.6,
  },
  categoryIconContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.primaryTransparent,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  categoryInfo: {
    flex: 1,
  },
  categoryTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 4,
  },
  categoryTitleDisabled: {
    color: colors.secondaryText,
  },
  categoryDescription: {
    fontSize: 14,
    color: colors.secondaryText,
    lineHeight: 20,
  },
  categoryDescriptionDisabled: {
    color: colors.disabled,
  },
  tipsSection: {
    marginTop: 32,
  },
  tipCard: {
    backgroundColor: colors.primaryTransparent,
    borderRadius: 12,
    padding: 16,
  },
  tipText: {
    fontSize: 14,
    color: colors.text,
    marginBottom: 8,
    lineHeight: 20,
  },
  bottomPadding: {
    height: 32,
  },
});

export default BillsHubScreen;
