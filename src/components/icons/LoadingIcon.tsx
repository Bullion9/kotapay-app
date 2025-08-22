import React, { useEffect, useRef } from 'react';
import { Animated, Easing, Image, View } from 'react-native';

interface LoadingIconProps {
  size?: number;
  color?: string;
  useKotaPayLogo?: boolean;
}

const LoadingIcon: React.FC<LoadingIconProps> = ({ 
  size = 40, 
  color = '#007AFF',
  useKotaPayLogo = true
}) => {
  const rotateAnim = useRef(new Animated.Value(0)).current;
  const pulseAnim = useRef(new Animated.Value(0.8)).current;

  useEffect(() => {
    if (useKotaPayLogo) {
      // Enhanced rotation animation with smooth easing
      const rotateAnimation = Animated.loop(
        Animated.timing(rotateAnim, {
          toValue: 1,
          duration: 3000, // Slower, more elegant rotation
          easing: Easing.linear,
          useNativeDriver: true,
        })
      );

      // Enhanced pulse animation with better easing
      const pulseAnimation = Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.15, // Slightly more pronounced pulse
            duration: 1200,
            easing: Easing.inOut(Easing.sin), // Smoother easing
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 0.95, // More subtle minimum scale
            duration: 1200,
            easing: Easing.inOut(Easing.sin),
            useNativeDriver: true,
          }),
        ])
      );

      rotateAnimation.start();
      pulseAnimation.start();

      return () => {
        rotateAnimation.stop();
        pulseAnimation.stop();
      };
    } else {
      // Fallback spinner animation
      const startRotation = () => {
        Animated.loop(
          Animated.timing(rotateAnim, {
            toValue: 1,
            duration: 1000,
            easing: Easing.linear,
            useNativeDriver: true,
          })
        ).start();
      };

      startRotation();
    }
  }, [rotateAnim, pulseAnim, useKotaPayLogo]);

  const rotate = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  if (useKotaPayLogo) {
    return (
      <View style={{ alignItems: 'center', justifyContent: 'center' }}>
        {/* Outer glow ring - much smaller */}
        <Animated.View
          style={{
            position: 'absolute',
            width: size * 0.8,
            height: size * 0.8,
            borderRadius: (size * 0.8) / 2,
            backgroundColor: 'rgba(0, 122, 255, 0.05)',
            transform: [{ scale: pulseAnim }],
          }}
        />
        
        {/* Middle ring with gradient effect - much smaller */}
        <Animated.View
          style={{
            position: 'absolute',
            width: size * 0.7,
            height: size * 0.7,
            borderRadius: (size * 0.7) / 2,
            backgroundColor: 'rgba(0, 122, 255, 0.1)',
            borderWidth: 2,
            borderColor: 'rgba(0, 122, 255, 0.2)',
            transform: [{ rotate }, { scale: pulseAnim }],
          }}
        />
        
        {/* Inner background circle - very small, tight wrap */}
        <Animated.View
          style={{
            position: 'absolute',
            width: size * 0.6,
            height: size * 0.6,
            borderRadius: (size * 0.6) / 2,
            backgroundColor: 'rgba(255, 255, 255, 0.95)',
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.15,
            shadowRadius: 8,
            elevation: 8,
            transform: [{ scale: pulseAnim }],
          }}
        />
        
        {/* Rotating dots around the background - much closer */}
        <Animated.View
          style={{
            position: 'absolute',
            width: size * 0.75,
            height: size * 0.75,
            transform: [{ rotate }],
          }}
        >
          {[0, 1, 2, 3].map((index) => (
            <View
              key={index}
              style={{
                position: 'absolute',
                width: 4,
                height: 4,
                borderRadius: 2,
                backgroundColor: 'rgba(0, 122, 255, 0.6)',
                top: index % 2 === 0 ? 2 : size * 0.75 - 6,
                left: index < 2 ? 2 : size * 0.75 - 6,
              }}
            />
          ))}
        </Animated.View>
        
        {/* Main logo - fits perfectly in tight background */}
        <Animated.View
          style={{
            transform: [{ scale: pulseAnim }],
            shadowColor: 'rgba(0, 122, 255, 0.3)',
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.8,
            shadowRadius: 4,
            elevation: 5,
          }}
        >
          <Image
            source={require('../../../assets/images/kotapay-logo.png')}
            style={{
              width: size * 0.8, // Logo fits perfectly within tight background
              height: size * 0.8,
            }}
            resizeMode="contain"
          />
        </Animated.View>
      </View>
    );
  }

  // Fallback to original spinner if KotaPay logo is not used
  return (
    <Animated.View style={{ transform: [{ rotate }] }}>
      <View
        style={{
          width: size,
          height: size,
          borderWidth: 3,
          borderColor: `${color}20`,
          borderTopColor: color,
          borderRadius: size / 2,
        }}
      />
    </Animated.View>
  );
};

export default LoadingIcon;