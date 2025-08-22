import React, { useEffect, useRef } from 'react';
import { Animated, Easing, Image, StyleSheet, View } from 'react-native';

interface KotaPayLogoProps {
  size?: number;
  animated?: boolean;
  style?: any;
}

const KotaPayLogo: React.FC<KotaPayLogoProps> = ({ 
  size = 80, 
  animated = false,
  style 
}) => {
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const rotateAnim = useRef(new Animated.Value(0)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (animated) {
      // Enhanced pulse animation - more noticeable
      const pulse = Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.15, // Increased from 1.1 to 1.15 for more visibility
            duration: 800,  // Slightly faster for more dynamic feel
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 800,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
        ])
      );

      // Faster, more noticeable rotation
      const rotate = Animated.loop(
        Animated.timing(rotateAnim, {
          toValue: 1,
          duration: 4000, // Reduced from 8000 to 4000 for faster rotation
          easing: Easing.linear,
          useNativeDriver: true,
        })
      );

      pulse.start();
      rotate.start();

      return () => {
        pulse.stop();
        rotate.stop();
      };
    }
  }, [animated, pulseAnim, rotateAnim]);

  const rotation = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  return (
    <View style={[styles.container, style]}>
      <Animated.View 
        style={[
          styles.logoContainer,
          {
            width: size,
            height: size,
            transform: animated 
              ? [
                  { scale: pulseAnim },
                  { rotate: rotation }
                ]
              : [{ scale: scaleAnim }]
          }
        ]}
      >
        <Image
          source={require('../../../assets/images/kotapay-logo.png')}
          style={[styles.logo, { width: size, height: size }]}
          resizeMode="contain"
        />
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    // Add subtle shadow to make the logo more prominent
    shadowColor: '#007AFF',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 5,
  },
  logo: {
    width: '100%',
    height: '100%',
  },
});

export default KotaPayLogo;
