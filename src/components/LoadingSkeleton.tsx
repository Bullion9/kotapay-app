import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Animated } from 'react-native';
import { colors, spacing, borderRadius, shadows } from '../theme';

interface LoadingSkeletonProps {
  height?: number;
  width?: number | string;
  borderRadius?: number;
  style?: any;
}

const LoadingSkeleton: React.FC<LoadingSkeletonProps> = ({
  height = 20,
  width = '100%',
  borderRadius: skeletonBorderRadius = borderRadius.small,
  style,
}) => {
  const animatedValue = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(animatedValue, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: false,
        }),
        Animated.timing(animatedValue, {
          toValue: 0,
          duration: 1000,
          useNativeDriver: false,
        }),
      ])
    );

    animation.start();

    return () => animation.stop();
  }, [animatedValue]);

  const backgroundColor = animatedValue.interpolate({
    inputRange: [0, 1],
    outputRange: ['#E5E5EA', '#F2F2F7'],
  });

  return (
    <Animated.View
      style={[
        styles.skeleton,
        {
          height,
          width,
          borderRadius: skeletonBorderRadius,
          backgroundColor,
        },
        style,
      ]}
    />
  );
};

// Predefined skeleton components for common use cases
export const ProviderCardSkeleton: React.FC = () => (
  <View style={styles.providerCardSkeleton}>
    <View style={styles.providerHeader}>
      <LoadingSkeleton height={40} width={40} borderRadius={20} />
      <View style={styles.providerInfo}>
        <LoadingSkeleton height={16} width="60%" />
        <LoadingSkeleton height={12} width="40%" style={{ marginTop: 4 }} />
      </View>
    </View>
    <LoadingSkeleton height={12} width="80%" style={{ marginTop: spacing.sm }} />
  </View>
);

export const BillPlanSkeleton: React.FC = () => (
  <View style={styles.billPlanSkeleton}>
    <View style={styles.planHeader}>
      <LoadingSkeleton height={16} width="50%" />
      <LoadingSkeleton height={14} width="30%" />
    </View>
    <LoadingSkeleton height={12} width="70%" style={{ marginTop: spacing.xs }} />
    <LoadingSkeleton height={12} width="40%" style={{ marginTop: spacing.xs }} />
  </View>
);

export const BouquetListSkeleton: React.FC = () => (
  <View style={styles.bouquetListContainer}>
    <LoadingSkeleton height={18} width="40%" style={{ marginBottom: spacing.md }} />
    {[1, 2, 3, 4, 5].map((item) => (
      <BillPlanSkeleton key={item} />
    ))}
  </View>
);

export const ProviderGridSkeleton: React.FC = () => (
  <View style={styles.providerGrid}>
    {[1, 2, 3, 4, 5, 6].map((item) => (
      <ProviderCardSkeleton key={item} />
    ))}
  </View>
);

const styles = StyleSheet.create({
  skeleton: {
    backgroundColor: '#E5E5EA',
  },
  providerCardSkeleton: {
    backgroundColor: colors.white,
    borderRadius: borderRadius.medium,
    padding: spacing.lg,
    marginBottom: spacing.sm,
    ...shadows.billsCard,
    width: '48%',
  },
  providerHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  providerInfo: {
    marginLeft: spacing.sm,
    flex: 1,
  },
  billPlanSkeleton: {
    backgroundColor: colors.white,
    borderRadius: borderRadius.medium,
    padding: spacing.lg,
    marginBottom: spacing.sm,
    ...shadows.billsCard,
  },
  planHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  bouquetListContainer: {
    padding: spacing.lg,
  },
  providerGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    padding: spacing.lg,
  },
});

export default LoadingSkeleton;
