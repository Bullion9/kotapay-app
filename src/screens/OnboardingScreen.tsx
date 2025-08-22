import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { ArrowRight, CreditCard, QrCode, Shield, Smartphone, Zap } from 'lucide-react-native';
import React, { useState } from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import PageLoadingOverlay from '../components/PageLoadingOverlay';
import KotaPayLogo from '../components/icons/KotaPayLogo';
import { usePageLoading } from '../hooks/usePageLoading';
import { borderRadius, colors, globalStyles, iconSizes, shadows, spacing } from '../theme';
import { RootStackParamList } from '../types';

type OnboardingScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Onboarding'>;

const OnboardingScreen: React.FC = () => {
  const navigation = useNavigation<OnboardingScreenNavigationProp>();
  const [currentSlide, setCurrentSlide] = useState(0);
  const { isPageLoading } = usePageLoading();

  const slides = [
    {
      icon: Shield,
      title: 'Secure & Safe',
      subtitle: 'Your money is protected with bank-level security and encryption',
      color: colors.primary,
    },
    {
      icon: Zap,
      title: 'Instant Transfers',
      subtitle: 'Send and receive money instantly to anyone, anywhere',
      color: colors.success,
    },
    {
      icon: QrCode,
      title: 'QR Payments',
      subtitle: 'Pay with a simple scan - fast, easy, and contactless',
      color: colors.accent,
    },
  ];

  const handleNext = () => {
    if (currentSlide < slides.length - 1) {
      setCurrentSlide(currentSlide + 1);
    } else {
      navigation.navigate('Register');
    }
  };

  const handleSkip = () => {
    navigation.navigate('Login');
  };

  return (
    <SafeAreaView style={[globalStyles.container, styles.container]}>
      <ScrollView 
        contentContainerStyle={styles.scrollContainer}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <KotaPayLogo size={100} animated={true} />
          <Text style={styles.brandName}>KotaPay</Text>
          <Text style={styles.tagline}>Digital Payment Made Simple</Text>
        </View>

        {/* Current Slide */}
        <View style={styles.slideContainer}>
          <View style={[styles.iconContainer, { backgroundColor: slides[currentSlide].color }]}>
            {React.createElement(slides[currentSlide].icon, { size: 48, color: 'white' })}
          </View>
          <Text style={styles.slideTitle}>{slides[currentSlide].title}</Text>
          <Text style={styles.slideSubtitle}>{slides[currentSlide].subtitle}</Text>
        </View>

        {/* Slide Indicators */}
        <View style={styles.indicators}>
          {slides.map((_, index) => (
            <View
              key={index}
              style={[
                styles.indicator,
                { backgroundColor: index === currentSlide ? colors.primary : colors.border }
              ]}
            />
          ))}
        </View>

        {/* Features Grid */}
        <View style={styles.featuresContainer}>
          <View style={styles.featureRow}>
            <View style={styles.featureCard}>
              <Smartphone size={iconSizes.md} color={colors.primary} />
              <Text style={styles.featureText}>Mobile First</Text>
            </View>
            <View style={styles.featureCard}>
              <CreditCard size={iconSizes.md} color={colors.success} />
              <Text style={styles.featureText}>Easy Setup</Text>
            </View>
          </View>
        </View>

        {/* Action Buttons */}
        <View style={styles.actions}>
          <TouchableOpacity 
            style={styles.primaryButton}
            onPress={handleNext}
          >
            <Text style={styles.primaryButtonText}>
              {currentSlide === slides.length - 1 ? 'Get Started' : 'Next'}
            </Text>
            <ArrowRight size={20} color="white" style={styles.buttonIcon} />
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.secondaryButton}
            onPress={handleSkip}
          >
            <Text style={styles.secondaryButtonText}>
              {currentSlide === slides.length - 1 ? 'Sign In Instead' : 'Skip'}
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
      
      {/* Page Loading Overlay */}
      <PageLoadingOverlay isVisible={isPageLoading} />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollContainer: {
    flexGrow: 1,
    paddingHorizontal: spacing.xl,
    paddingBottom: spacing.xl,
  },
  header: {
    alignItems: 'center',
    paddingTop: spacing.xxl,
    marginBottom: spacing.xxl,
  },
  brandName: {
    fontSize: 32,
    fontWeight: 'bold',
    color: colors.text,
    marginTop: spacing.md,
    marginBottom: spacing.xs,
  },
  tagline: {
    fontSize: 16,
    color: colors.secondaryText,
    textAlign: 'center',
  },
  slideContainer: {
    alignItems: 'center',
    paddingVertical: spacing.xxl,
  },
  iconContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.xl,
    ...shadows.medium,
  },
  slideTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: colors.text,
    textAlign: 'center',
    marginBottom: spacing.md,
  },
  slideSubtitle: {
    fontSize: 16,
    color: colors.secondaryText,
    textAlign: 'center',
    lineHeight: 24,
    paddingHorizontal: spacing.md,
  },
  indicators: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginVertical: spacing.xl,
    gap: spacing.sm,
  },
  indicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  featuresContainer: {
    marginVertical: spacing.lg,
  },
  featureRow: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  featureCard: {
    flex: 1,
    backgroundColor: colors.white,
    borderRadius: borderRadius.large,
    padding: spacing.md,
    alignItems: 'center',
    ...shadows.small,
  },
  featureText: {
    fontSize: 14,
    color: colors.text,
    fontWeight: '600',
    marginTop: spacing.sm,
    textAlign: 'center',
  },
  actions: {
    gap: spacing.md,
    marginTop: spacing.xl,
  },
  primaryButton: {
    backgroundColor: colors.primary,
    borderRadius: borderRadius.large,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.xl,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    ...shadows.medium,
  },
  primaryButtonText: {
    color: colors.white,
    fontSize: 18,
    fontWeight: '600',
    marginRight: spacing.sm,
  },
  buttonIcon: {
    marginLeft: spacing.sm,
  },
  secondaryButton: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: borderRadius.large,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.xl,
    alignItems: 'center',
    justifyContent: 'center',
  },
  secondaryButtonText: {
    color: colors.text,
    fontSize: 16,
    fontWeight: '500',
  },
});

export default OnboardingScreen;
