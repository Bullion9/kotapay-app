import React, { useEffect, useRef } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  Modal, 
  Animated, 
  Dimensions,
  StatusBar 
} from 'react-native';
import LoadingIcon from './icons/LoadingIcon';
import { colors, spacing, borderRadius } from '../theme';

interface LoadingOverlayProps {
  visible: boolean;
  message?: string;
  subMessage?: string;
  type?: 'loading' | 'processing' | 'confirming' | 'success' | 'error';
  onComplete?: () => void;
}

const { width } = Dimensions.get('window');

const LoadingOverlay: React.FC<LoadingOverlayProps> = ({
  visible,
  message = 'Processing...',
  subMessage,
  type = 'loading',
  onComplete,
}) => {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.8)).current;

  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.spring(scaleAnim, {
          toValue: 1,
          tension: 100,
          friction: 8,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(scaleAnim, {
          toValue: 0.8,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start(() => {
        if (onComplete) {
          onComplete();
        }
      });
    }
  }, [visible, fadeAnim, scaleAnim, onComplete]);

  const getLoadingColor = () => {
    switch (type) {
      case 'processing':
        return colors.warning;
      case 'confirming':
        return colors.accent;
      case 'success':
        return colors.success;
      case 'error':
        return colors.error;
      default:
        return colors.primary;
    }
  };

  const getLoadingMessage = () => {
    switch (type) {
      case 'processing':
        return message || 'Processing your request...';
      case 'confirming':
        return message || 'Confirming transaction...';
      case 'success':
        return message || 'Success!';
      case 'error':
        return message || 'Something went wrong';
      default:
        return message || 'Loading...';
    }
  };

  if (!visible) return null;

  return (
    <Modal
      transparent
      visible={visible}
      animationType="none"
      statusBarTranslucent
    >
      <StatusBar backgroundColor="rgba(0,0,0,0.5)" barStyle="light-content" />
      <Animated.View 
        style={[
          styles.overlay,
          {
            opacity: fadeAnim,
          }
        ]}
      >
        <Animated.View 
          style={[
            styles.container,
            {
              transform: [{ scale: scaleAnim }],
            }
          ]}
        >
          <View style={styles.content}>
            <LoadingIcon 
              size={60} 
              color={getLoadingColor()} 
            />
            
            <Text style={[styles.message, { color: getLoadingColor() }]}>
              {getLoadingMessage()}
            </Text>
            
            {subMessage && (
              <Text style={styles.subMessage}>
                {subMessage}
              </Text>
            )}
          </View>
        </Animated.View>
      </Animated.View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  container: {
    backgroundColor: colors.background,
    borderRadius: borderRadius.large,
    padding: spacing.xl,
    margin: spacing.lg,
    maxWidth: width * 0.8,
    minWidth: 200,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  content: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  message: {
    fontSize: 18,
    fontWeight: '600',
    textAlign: 'center',
    marginTop: spacing.md,
    marginBottom: spacing.xs,
  },
  subMessage: {
    fontSize: 14,
    color: colors.secondaryText,
    textAlign: 'center',
    lineHeight: 20,
    marginTop: spacing.xs,
  },
});

export default LoadingOverlay;