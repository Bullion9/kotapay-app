import { useNavigation, useRoute } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import React, { useEffect, useRef, useState } from 'react';
import {
    Animated,
    Dimensions,
    Easing,
    SafeAreaView,
    StyleSheet,
    Text,
    View,
} from 'react-native';
import Svg, { Circle, Path } from 'react-native-svg';
import { colors, spacing } from '../theme';

interface RouteParams {
  documentsCount: number;
  targetTier: string;
  submissionId: string;
}

type KycProcessingNavigationProp = StackNavigationProp<any, 'KycProcessingScreen'>;

const { width } = Dimensions.get('window');

const KycProcessingScreen: React.FC = () => {
  const navigation = useNavigation<KycProcessingNavigationProp>();
  const route = useRoute();
  const { documentsCount, targetTier, submissionId } = route.params as RouteParams;

  const [processingStep, setProcessingStep] = useState(0);
  const rotateAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.8)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;

  const processingSteps = [
    'Verifying submitted documents...',
    'Validating identity information...',
    'Processing KYC application...',
    'Updating account tier...',
    'KYC submission completed!'
  ];

  useEffect(() => {
    // Start animations
    const startAnimations = () => {
      // Fade in animation
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }).start();

      // Scale animation
      Animated.loop(
        Animated.sequence([
          Animated.timing(scaleAnim, {
            toValue: 1.1,
            duration: 1000,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
          Animated.timing(scaleAnim, {
            toValue: 0.9,
            duration: 1000,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
        ])
      ).start();

      // Rotation animation for hourglass
      Animated.loop(
        Animated.timing(rotateAnim, {
          toValue: 1,
          duration: 3000,
          easing: Easing.linear,
          useNativeDriver: true,
        })
      ).start();
    };

    startAnimations();
    
    // Simulate processing steps
    const stepInterval = setInterval(() => {
      setProcessingStep(prev => {
        if (prev < processingSteps.length - 1) {
          return prev + 1;
        } else {
          clearInterval(stepInterval);
          // Navigate back after completion
          setTimeout(() => {
            navigation.goBack();
          }, 2000);
          return prev;
        }
      });
    }, 1800);

    return () => clearInterval(stepInterval);
  }, [navigation, processingSteps.length, fadeAnim, scaleAnim, rotateAnim]);

  const rotate = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '180deg'],
  });

  const SandClockIcon = () => (
    <Animated.View 
      style={[
        styles.iconContainer,
        {
          transform: [
            { rotate },
            { scale: scaleAnim }
          ],
          opacity: fadeAnim,
        }
      ]}
    >
      <Svg 
        width={120} 
        height={120} 
        viewBox="0 0 512 512"
      >
        <Path
          d="M288,90.976V16c0-4.256-1.696-8.32-4.672-11.328S276.256,0,272,0H48c-8.832,0-16,7.168-16,16v74.976 C32,129.44,46.976,165.6,74.176,192.8l31.2,31.2l-31.2,31.2C46.976,282.432,32,318.56,32,357.024v75.008 c0,4.256,1.696,8.32,4.672,11.328s7.072,4.672,11.328,4.672L272,448c8.832,0,16-7.168,16-16v-75.008 c0-38.464-14.976-74.624-42.176-101.824L214.624,224l31.2-31.232C273.024,165.6,288,129.44,288,90.976z"
          fill="#ECEFF1"
        />
        <Path
          d="M16,32C7.168,32,0,24.864,0,16C0,7.2,7.168,0,16,0h288c8.832,0,16,7.168,16,16s-7.168,16-16,16H16z"
          fill="#607D8B"
        />
        <Path
          d="M304,448H16c-8.8,0-16-7.2-16-16l0,0c0-8.8,7.2-16,16-16h288c8.8,0,16,7.2,16,16l0,0 C320,440.8,312.8,448,304,448z"
          fill="#607D8B"
        />
        <Path
          d="M64,64v26.976c0,29.92,11.648,58.016,32.8,79.2c0,0,63.2,49.6,63.2,53.824l0,0 c0-4.224,63.2-53.856,63.2-53.856c21.152-21.152,32.8-49.28,32.8-79.168V64H64z"
          fill="#B0BEC5"
        />
        <Path
          d="M64,416v-26.976c0-29.92,11.648-58.016,32.8-79.2c0,0.032,63.2-49.6,63.2-53.824l0,0 c0,4.224,63.2,53.856,63.2,53.856c21.152,21.152,32.8,49.28,32.8,79.2V416H64z"
          fill="#B0BEC5"
        />
        <Path
          d="M304,416h-16v-59.008c0-38.464-14.976-74.624-42.176-101.824l-6.688-6.656 C209.984,279.936,192,321.856,192,368c0,28.832,7.104,55.968,19.424,80H272h32c8.8,0,16-7.2,16-16S312.8,416,304,416z"
          fill="#FAFAFA"
        />
        <Circle cx="368" cy="368" r="144" fill={colors.primary} />
        <Path
          d="M416,432c-4.096,0-8.192-1.568-11.328-4.672l-48-48C353.696,376.32,352,372.256,352,368v-64 c0-8.832,7.168-16,16-16s16,7.168,16,16v57.376l43.328,43.328c6.24,6.24,6.24,16.384,0,22.624C424.192,430.432,420.096,432,416,432z"
          fill="#FAFAFA"
        />
      </Svg>
    </Animated.View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Processing KYC Application</Text>
          <Text style={styles.subtitle}>Please wait while we verify your documents</Text>
        </View>

        {/* Submission Details */}
        <View style={styles.detailsContainer}>
          <Text style={styles.detailsLabel}>Submission Details</Text>
          <View style={styles.detailRow}>
            <Text style={styles.detailKey}>Documents Submitted:</Text>
            <Text style={styles.detailValue}>{documentsCount} files</Text>
          </View>
          <View style={styles.detailRow}>
            <Text style={styles.detailKey}>Target Tier:</Text>
            <Text style={styles.detailValue}>{targetTier}</Text>
          </View>
          <View style={styles.detailRow}>
            <Text style={styles.detailKey}>Application ID:</Text>
            <Text style={styles.detailValue}>{submissionId}</Text>
          </View>
        </View>

        {/* Loading Animation */}
        <View style={styles.animationContainer}>
          <SandClockIcon />
        </View>

        {/* Processing Steps */}
        <View style={styles.stepsContainer}>
          <Animated.View style={[styles.stepIndicator, { opacity: fadeAnim }]}>
            <Text style={styles.stepText}>
              {processingSteps[processingStep]}
            </Text>
            
            {/* Progress dots */}
            <View style={styles.dotsContainer}>
              {processingSteps.map((_, index) => (
                <View
                  key={index}
                  style={[
                    styles.dot,
                    {
                      backgroundColor: index <= processingStep 
                        ? colors.primary 
                        : colors.border,
                    }
                  ]}
                />
              ))}
            </View>
          </Animated.View>
        </View>

        {/* Info Notice */}
        <View style={styles.infoContainer}>
          <Text style={styles.infoTitle}>What happens next?</Text>
          <Text style={styles.infoText}>
            • Your documents will be reviewed within 1-3 business days
          </Text>
          <Text style={styles.infoText}>
            • You&apos;ll receive an email notification with the results
          </Text>
          <Text style={styles.infoText}>
            • Your account limits will be updated upon approval
          </Text>
        </View>

        {/* Completion Message */}
        {processingStep === processingSteps.length - 1 && (
          <Animated.View 
            style={[
              styles.completionContainer,
              { opacity: fadeAnim }
            ]}
          >
            <Text style={styles.completionText}>
              ✅ KYC application submitted successfully!
            </Text>
            <Text style={styles.completionSubtext}>
              We&apos;ll notify you once the review is complete
            </Text>
          </Animated.View>
        )}
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.xl,
  },
  header: {
    alignItems: 'center',
    marginBottom: spacing.xl,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: colors.text,
    textAlign: 'center',
    marginBottom: spacing.sm,
  },
  subtitle: {
    fontSize: 16,
    color: colors.secondaryText,
    textAlign: 'center',
  },
  detailsContainer: {
    alignItems: 'center',
    marginBottom: spacing.xl * 2,
    paddingVertical: spacing.lg,
    paddingHorizontal: spacing.xl,
    backgroundColor: colors.white,
    borderRadius: 20,
    minWidth: width * 0.85,
  },
  detailsLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginBottom: spacing.md,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    paddingVertical: spacing.xs,
  },
  detailKey: {
    fontSize: 14,
    color: colors.secondaryText,
  },
  detailValue: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.text,
  },
  animationContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.xl * 2,
  },
  iconContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepsContainer: {
    alignItems: 'center',
    marginBottom: spacing.xl,
    minHeight: 80,
  },
  stepIndicator: {
    alignItems: 'center',
  },
  stepText: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
    textAlign: 'center',
    marginBottom: spacing.lg,
  },
  dotsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginHorizontal: 4,
  },
  infoContainer: {
    alignItems: 'flex-start',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    backgroundColor: colors.light,
    borderRadius: 12,
    marginBottom: spacing.xl,
    width: '100%',
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginBottom: spacing.sm,
  },
  infoText: {
    fontSize: 14,
    color: colors.text,
    marginVertical: spacing.xs,
    lineHeight: 20,
  },
  completionContainer: {
    alignItems: 'center',
    paddingVertical: spacing.lg,
    paddingHorizontal: spacing.xl,
    backgroundColor: colors.success,
    borderRadius: 16,
    marginTop: spacing.lg,
  },
  completionText: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.white,
    textAlign: 'center',
    marginBottom: spacing.sm,
  },
  completionSubtext: {
    fontSize: 14,
    color: colors.white,
    textAlign: 'center',
    opacity: 0.9,
  },
});

export default KycProcessingScreen;
