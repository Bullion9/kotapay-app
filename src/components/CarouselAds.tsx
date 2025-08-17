import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Dimensions,
  NativeSyntheticEvent,
  NativeScrollEvent,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import {
  Gift,
  CreditCard,
  Percent,
  Globe,
  Moon,
  Users,
  ArrowRight,
} from 'lucide-react-native';
import { useNavigation } from '@react-navigation/native';
import { spacing, borderRadius, shadows } from '../theme';

const { width: screenWidth } = Dimensions.get('window');
// Match the balance card width exactly (screen width minus 2 * spacing.xl)
const CAROUSEL_WIDTH = screenWidth - (spacing.xl * 2); // spacing.xl = 24, so 48 total horizontal margin
const CAROUSEL_HEIGHT = 200; // Increased height for better visibility
const AUTO_SCROLL_INTERVAL = 4500; // 4.5 seconds

interface CarouselPage {
  id: number;
  title: string;
  subtitle: string;
  gradientColors: [string, string];
  icon: React.ComponentType<any>;
  navigationTarget: string;
  tabTarget?: string;
}

const carouselData: CarouselPage[] = [
  {
    id: 1,
    title: 'Zero-Fee Fridays',
    subtitle: 'No charges on transfers every Friday',
    gradientColors: ['#000d10', '#b9f1ffe'],
    icon: Gift,
    navigationTarget: 'SendMoney',
  },
  {
    id: 2,
    title: 'Instant Virtual Cards',
    subtitle: 'Create cards in seconds for online shopping',
    gradientColors: ['#06402B', '#A8E4A0'],
    icon: CreditCard,
    navigationTarget: 'MainTabs',
    tabTarget: 'Card',
  },
  {
    id: 3,
    title: 'Earn Cashback on Bills',
    subtitle: 'Get rewards on all your utility payments',
    gradientColors: ['#EA3B52', '#FFF0F5'],
    icon: Percent,
    navigationTarget: 'BillsHub',
  },
  {
    id: 4,
    title: 'Send Money Abroad',
    subtitle: 'Fast international transfers at low rates',
    gradientColors: ['#3E3D29', '#F0FFF0'],
    icon: Globe,
    navigationTarget: 'SendMoney',
  },
  {
    id: 5,
    title: 'Dark Mode is Here',
    subtitle: 'Switch to dark theme in settings',
    gradientColors: ['#000000', '#A3AABE'],
    icon: Moon,
    navigationTarget: 'Settings',
  },
  {
    id: 6,
    title: 'Refer & Get ₦500',
    subtitle: 'Invite friends and earn together',
    gradientColors: ['#3E3D29', '#8B0000'],
    icon: Users,
    navigationTarget: 'Profile',
  },
  {
    id: 7,
    title: 'Tap to Explore',
    subtitle: 'Discover all KotaPay features',
    gradientColors: ['#FFFFFF', '#06402B'],
    icon: ArrowRight,
    navigationTarget: 'MainTabs',
    tabTarget: 'Profile',
  },
];

// Memoized carousel page component for better performance
const CarouselPageItem = React.memo<{ 
  item: CarouselPage; 
  currentIndex: number; 
  onPress: (item: CarouselPage) => void; 
}>(({ item, currentIndex, onPress }) => {
  const IconComponent = item.icon;
  const isLastPage = item.id === 7;
  const textColor = isLastPage ? '#000000' : '#FFFFFF';
  
  return (
    <TouchableOpacity
      style={styles.carouselPage}
      onPress={() => onPress(item)}
      activeOpacity={0.9}
    >
      <LinearGradient
        colors={item.gradientColors}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.gradientBackground}
        locations={[0, 1]} // Ensure even gradient distribution
      >
        {/* Dark overlay for readability (except last page) */}
        {!isLastPage && <View style={styles.darkOverlay} />}
        
        <View style={styles.contentContainer}>
          <IconComponent size={48} color={textColor} style={styles.icon} />
          <Text style={[styles.title, { color: textColor }]}>{item.title}</Text>
          <Text style={[styles.subtitle, { color: textColor, opacity: 0.9 }]}>
            {item.subtitle}
          </Text>
          
          {/* Dot indicators inside each ad content */}
          <View style={styles.dotContainer}>
            {carouselData.map((_, index) => (
              <View
                key={index}
                style={[
                  styles.dot,
                  {
                    backgroundColor: index === currentIndex ? textColor : `${textColor}40`,
                    opacity: index === currentIndex ? 1 : 0.6,
                  },
                ]}
              />
            ))}
          </View>
        </View>
      </LinearGradient>
    </TouchableOpacity>
  );
});

CarouselPageItem.displayName = 'CarouselPageItem';

const CarouselAds: React.FC = () => {
  const navigation = useNavigation();
  const flatListRef = useRef<FlatList>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAutoScrolling, setIsAutoScrolling] = useState(true);
  const autoScrollTimer = useRef<NodeJS.Timeout | null>(null);

  // Auto-scroll functionality
  useEffect(() => {
    if (isAutoScrolling) {
      autoScrollTimer.current = setInterval(() => {
        const nextIndex = (currentIndex + 1) % carouselData.length;
        flatListRef.current?.scrollToIndex({
          index: nextIndex,
          animated: true,
        });
        setCurrentIndex(nextIndex);
      }, AUTO_SCROLL_INTERVAL);
    }

    return () => {
      if (autoScrollTimer.current) {
        clearInterval(autoScrollTimer.current);
      }
    };
  }, [currentIndex, isAutoScrolling]);

  // Handle manual scroll
  const handleScrollEnd = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const scrollX = event.nativeEvent.contentOffset.x;
    const newIndex = Math.round(scrollX / CAROUSEL_WIDTH);
    setCurrentIndex(newIndex);
    
    // Pause auto-scroll for a moment after manual interaction
    setIsAutoScrolling(false);
    if (autoScrollTimer.current) {
      clearInterval(autoScrollTimer.current);
    }
    
    setTimeout(() => {
      setIsAutoScrolling(true);
    }, 2000); // Resume auto-scroll after 2 seconds
  };

  // Handle page navigation
  const handlePagePress = useCallback((item: CarouselPage) => {
    try {
      if (item.tabTarget) {
        // Navigate to MainTabs and then to specific tab
        (navigation as any).navigate(item.navigationTarget, {
          screen: item.tabTarget,
        });
      } else {
        (navigation as any).navigate(item.navigationTarget);
      }
    } catch {
      console.log(`Navigation to ${item.navigationTarget} not available`);
    }
  }, [navigation]);

  // Render individual carousel page
  const renderCarouselPage = useCallback(({ item }: { item: CarouselPage }) => (
    <CarouselPageItem 
      item={item} 
      currentIndex={currentIndex} 
      onPress={handlePagePress} 
    />
  ), [currentIndex, handlePagePress]);

  const keyExtractor = useCallback((item: CarouselPage) => item.id.toString(), []);

  return (
    <View style={styles.container}>
      <FlatList
        ref={flatListRef}
        data={carouselData}
        renderItem={renderCarouselPage}
        keyExtractor={keyExtractor}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        snapToInterval={CAROUSEL_WIDTH}
        snapToAlignment="start"
        decelerationRate="fast"
        onMomentumScrollEnd={handleScrollEnd}
        style={styles.carousel}
        contentContainerStyle={{ paddingHorizontal: 0 }}
        removeClippedSubviews={true}
        maxToRenderPerBatch={3}
        initialNumToRender={3}
        windowSize={5}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    height: CAROUSEL_HEIGHT,
    marginHorizontal: 0, // No margin since parent container handles it
    marginVertical: 0,   // No margin since parent container handles it
    backgroundColor: 'transparent',
  },
  carousel: {
    flex: 1,
  },
  carouselPage: {
    width: CAROUSEL_WIDTH,
    height: CAROUSEL_HEIGHT - 30, // Account for dot indicators
    borderRadius: borderRadius.large,
    overflow: 'hidden',
    marginRight: 0,
    ...shadows.medium,
    backgroundColor: '#FFFFFF', // Ensure proper background
  },
  gradientBackground: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  darkOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.2)', // 20% translucent dark scrim
  },
  contentContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.xl,
    zIndex: 1,
    width: '100%', // Ensure content takes full width
    height: '100%', // Ensure content takes full height
  },
  icon: {
    marginBottom: spacing.md,
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: spacing.xs,
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
    maxWidth: '90%', // Ensure text doesn't overflow
    flexWrap: 'wrap',
  },
  subtitle: {
    fontSize: 14,
    fontWeight: '400',
    textAlign: 'center',
    lineHeight: 20,
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
    maxWidth: '85%', // Ensure subtitle fits well
    flexWrap: 'wrap',
  },
  dotContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: spacing.lg,
    backgroundColor: 'transparent',
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginHorizontal: 4,
    backgroundColor: '#A3AABE',
  },
});

export default CarouselAds;
