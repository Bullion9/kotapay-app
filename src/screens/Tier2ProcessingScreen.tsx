import { RouteProp } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import React, { useEffect, useRef } from 'react';
import {
    Animated,
    Dimensions,
    StatusBar,
    StyleSheet,
    Text,
    View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Svg, { Path } from 'react-native-svg';
import { theme } from '../theme';
import { ProfileParamList } from '../types';

const { colors, spacing } = theme;
const { width } = Dimensions.get('window');

type Tier2ProcessingScreenNavigationProp = StackNavigationProp<ProfileParamList, 'Tier2Processing'>;
type Tier2ProcessingScreenRouteProp = RouteProp<ProfileParamList, 'Tier2Processing'>;

interface Props {
  navigation: Tier2ProcessingScreenNavigationProp;
  route: Tier2ProcessingScreenRouteProp;
}

const AnimatedSvg = Animated.createAnimatedComponent(Svg);

const HourglassIcon: React.FC<{ size?: number; color?: string; style?: any }> = ({ 
  size = 80, 
  color = colors.primary,
  style 
}) => (
  <AnimatedSvg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    style={style}
  >
    <Path
      d="M6 2v6h.01L6 8.01 10 12l-4 4 .01.01H6V22h12v-5.99h-.01L18 16l-4-4 4-3.99-.01-.01H18V2H6zm10 14.5V20H8v-3.5l4-4 4 4zm-4-5l-4-4V4h8v3.5l-4 4z"
      fill={color}
    />
  </AnimatedSvg>
);

const Tier2ProcessingScreen: React.FC<Props> = ({ navigation, route }) => {
  const rotationAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const progressAnim = useRef(new Animated.Value(0)).current;

  const submissionData = route.params?.submissionData;
  const submissionId = submissionData?.submissionId || 'T2-' + Date.now();

  const steps = [
    'Validating government ID...',
    'Verifying proof of address...',
    'Processing bank statement...',
    'Conducting enhanced verification...',
    'Updating account limits...',
    'Tier 2 verification complete!'
  ];

  const [currentStep, setCurrentStep] = React.useState(0);

  useEffect(() => {
    // Start animations
    Animated.parallel([
      Animated.loop(
        Animated.sequence([
          Animated.timing(rotationAnim, {
            toValue: 1,
            duration: 3000,
            useNativeDriver: true,
          }),
          Animated.timing(rotationAnim, {
            toValue: 0,
            duration: 0,
            useNativeDriver: true,
          }),
        ])
      ),
      Animated.loop(
        Animated.sequence([
          Animated.timing(scaleAnim, {
            toValue: 1.1,
            duration: 1500,
            useNativeDriver: true,
          }),
          Animated.timing(scaleAnim, {
            toValue: 1,
            duration: 1500,
            useNativeDriver: true,
          }),
        ])
      ),
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
    ]).start();

    // Progress through steps
    const stepInterval = setInterval(() => {
      setCurrentStep(prev => {
        const next = prev + 1;
        if (next >= steps.length) {
          clearInterval(stepInterval);
          // Navigate back after completion
          setTimeout(() => {
            navigation.navigate('KycLimits');
          }, 2000);
          return prev;
        }
        return next;
      });
    }, 2500);

    // Animate progress
    Animated.timing(progressAnim, {
      toValue: 1,
      duration: steps.length * 2500,
      useNativeDriver: false,
    }).start();

    return () => {
      clearInterval(stepInterval);
    };
  }, [navigation, rotationAnim, scaleAnim, fadeAnim, progressAnim, steps.length]);

  const rotation = rotationAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '180deg'],
  });

  const progressWidth = progressAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0%', '100%'],
  });

  return (
    <>
      <StatusBar barStyle="light-content" backgroundColor={colors.primary} />
      <SafeAreaView style={styles.container}>
        <View style={styles.content}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.title}>Processing Tier 2 Verification</Text>
            <Text style={styles.subtitle}>
              Enhanced verification in progress
            </Text>
          </View>

          {/* Animation Container */}
          <Animated.View 
            style={[
              styles.animationContainer,
              {
                opacity: fadeAnim,
                transform: [
                  { scale: scaleAnim },
                  { rotate: rotation }
                ]
              }
            ]}
          >
            <HourglassIcon size={120} color={colors.white} />
          </Animated.View>

          {/* Progress Steps */}
          <View style={styles.stepsContainer}>
            <Text style={styles.currentStep}>
              {steps[currentStep] || steps[steps.length - 1]}
            </Text>
            
            {/* Progress Dots */}
            <View style={styles.dotsContainer}>
              {steps.map((_, index) => (
                <View
                  key={index}
                  style={[
                    styles.dot,
                    index <= currentStep && styles.dotActive
                  ]}
                />
              ))}
            </View>

            {/* Progress Bar */}
            <View style={styles.progressBar}>
              <Animated.View 
                style={[
                  styles.progressFill, 
                  { width: progressWidth }
                ]} 
              />
            </View>
          </View>

          {/* Information */}
          <View style={styles.infoContainer}>
            <Text style={styles.infoTitle}>Submission Details</Text>
            <Text style={styles.infoText}>
              Submission ID: {submissionId}
            </Text>
            <Text style={styles.infoText}>
              Documents: Government ID, Proof of Address, Bank Statement
            </Text>
            <Text style={styles.infoText}>
              Expected completion: 2-3 business days
            </Text>
            <Text style={styles.infoText}>
              New limits: ₦200,000 daily, ₦1,000,000 monthly
            </Text>
          </View>

          {/* Footer */}
          <View style={styles.footer}>
            {currentStep >= steps.length - 1 ? (
              <Text style={styles.completionText}>
                ✅ Tier 2 verification submitted successfully!
              </Text>
            ) : (
              <Text style={styles.footerText}>
                Processing enhanced verification... Please don&apos;t close the app
              </Text>
            )}
          </View>
        </View>
      </SafeAreaView>
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.primary,
  },
  content: {
    flex: 1,
    paddingHorizontal: spacing.xl,
    justifyContent: 'space-between',
  },
  header: {
    alignItems: 'center',
    paddingTop: spacing.xl,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.white,
    textAlign: 'center',
    marginBottom: spacing.sm,
  },
  subtitle: {
    fontSize: 16,
    color: colors.white,
    textAlign: 'center',
    opacity: 0.9,
    lineHeight: 22,
  },
  animationContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    height: 200,
  },
  stepsContainer: {
    alignItems: 'center',
  },
  currentStep: {
    fontSize: 18,
    color: colors.white,
    textAlign: 'center',
    marginBottom: spacing.xl,
    fontWeight: '500',
    minHeight: 50,
  },
  dotsContainer: {
    flexDirection: 'row',
    marginBottom: spacing.lg,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    marginHorizontal: 3,
  },
  dotActive: {
    backgroundColor: colors.white,
  },
  progressBar: {
    width: width - (spacing.xl * 2),
    height: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    borderRadius: 2,
  },
  progressFill: {
    height: 4,
    backgroundColor: colors.white,
    borderRadius: 2,
  },
  infoContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 12,
    padding: spacing.lg,
    marginVertical: spacing.lg,
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.white,
    marginBottom: spacing.sm,
  },
  infoText: {
    fontSize: 14,
    color: colors.white,
    opacity: 0.9,
    marginBottom: spacing.xs,
    lineHeight: 20,
  },
  footer: {
    alignItems: 'center',
    paddingBottom: spacing.xl,
  },
  footerText: {
    fontSize: 14,
    color: colors.white,
    textAlign: 'center',
    opacity: 0.8,
    lineHeight: 20,
  },
  completionText: {
    fontSize: 16,
    color: colors.white,
    textAlign: 'center',
    fontWeight: '600',
    lineHeight: 22,
  },
});

export default Tier2ProcessingScreen;
