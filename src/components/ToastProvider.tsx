import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated, Dimensions, TouchableOpacity } from 'react-native';
import { Check, X, AlertCircle } from 'lucide-react-native';
import { colors, spacing, borderRadius, iconSizes } from '../theme';

interface Toast {
  id: string;
  type: 'success' | 'error' | 'warning';
  message: string;
  duration?: number;
}

interface ToastContextType {
  showToast: (type: Toast['type'], message: string, duration?: number) => void;
}

const ToastContext = React.createContext<ToastContextType | null>(null);

export const useToast = () => {
  const context = React.useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};

interface ToastProviderProps {
  children: React.ReactNode;
}

export const ToastProvider: React.FC<ToastProviderProps> = ({ children }) => {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [toastCounter, setToastCounter] = useState(0);
  const removeTimeouts = useRef<Map<string, NodeJS.Timeout>>(new Map());
  
  const MAX_TOASTS = 3; // Maximum number of toasts to show at once

  const showToast = (type: Toast['type'], message: string, duration = 3000) => {
    // Check if the same message is already being displayed
    const existingToast = toasts.find(toast => toast.message === message && toast.type === type);
    if (existingToast) {
      return; // Don't show duplicate toast
    }

    // Generate truly unique ID using timestamp + counter + random number
    const uniqueId = `toast_${Date.now()}_${toastCounter}_${Math.random().toString(36).substr(2, 9)}`;
    const newToast: Toast = { id: uniqueId, type, message, duration };
    
    setToastCounter(prev => prev + 1);
    
    setToasts(prev => {
      const updatedToasts = [...prev, newToast];
      // If we exceed max toasts, remove the oldest one
      if (updatedToasts.length > MAX_TOASTS) {
        const oldestToast = updatedToasts[0];
        // Clear timeout for removed toast
        const timeoutId = removeTimeouts.current.get(oldestToast.id);
        if (timeoutId) {
          clearTimeout(timeoutId);
          removeTimeouts.current.delete(oldestToast.id);
        }
        return updatedToasts.slice(1);
      }
      return updatedToasts;
    });

    // Auto-remove toast after duration
    const timeoutId = setTimeout(() => {
      removeToast(uniqueId);
    }, duration);
    
    removeTimeouts.current.set(uniqueId, timeoutId);
  };

  const removeToast = (id: string) => {
    // Clear timeout if it exists
    const timeoutId = removeTimeouts.current.get(id);
    if (timeoutId) {
      clearTimeout(timeoutId);
      removeTimeouts.current.delete(id);
    }
    
    setToasts(prev => prev.filter(toast => toast.id !== id));
  };

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <ToastContainer toasts={toasts} onRemove={removeToast} />
    </ToastContext.Provider>
  );
};

interface ToastContainerProps {
  toasts: Toast[];
  onRemove: (id: string) => void;
}

const ToastContainer: React.FC<ToastContainerProps> = ({ toasts, onRemove }) => {
  return (
    <View style={styles.container}>
      {toasts.map((toast) => (
        <ToastItem 
          key={toast.id} 
          toast={toast} 
          onRemove={onRemove}
        />
      ))}
    </View>
  );
};

interface ToastItemProps {
  toast: Toast;
  onRemove: (id: string) => void;
}

const ToastItem: React.FC<ToastItemProps> = ({ toast, onRemove }) => {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(-100)).current;
  const [isAnimating, setIsAnimating] = useState(false);
  const [hasAnimated, setHasAnimated] = useState(false);

  useEffect(() => {
    if (!hasAnimated && !isAnimating) {
      setIsAnimating(true);
      setHasAnimated(true);
      // Slide in animation
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start(() => {
        setIsAnimating(false);
      });
    }
  }, [fadeAnim, slideAnim, isAnimating, hasAnimated]);

  const handleToastPress = () => {
    if (!isAnimating) {
      // Slide out animation before removing
      setIsAnimating(true);
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(slideAnim, {
          toValue: -100,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start(() => {
        onRemove(toast.id);
      });
    }
  };

  const getToastStyle = () => {
    switch (toast.type) {
      case 'success':
        return {
          backgroundColor: '#A8E4A0', // Bills success color
          icon: Check,
        };
      case 'error':
        return {
          backgroundColor: '#EA3B52', // Bills error color
          icon: X,
        };
      case 'warning':
        return {
          backgroundColor: colors.warning,
          icon: AlertCircle,
        };
      default:
        return {
          backgroundColor: '#A8E4A0', // Bills success color
          icon: Check,
        };
    }
  };

  const toastStyle = getToastStyle();
  const IconComponent = toastStyle.icon;

  return (
    <TouchableOpacity
      style={[
        styles.toast,
        {
          backgroundColor: toastStyle.backgroundColor,
          opacity: fadeAnim,
          transform: [{ translateY: slideAnim }],
        },
      ]}
      onPress={handleToastPress}
      activeOpacity={0.9}
    >
      <View style={styles.toastContent}>
        <IconComponent size={iconSizes.sm} color={colors.white} />
        <Text style={styles.toastMessage}>{toast.message}</Text>
      </View>
    </TouchableOpacity>
  );
};

const { width } = Dimensions.get('window');

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 60, // Below status bar and header
    left: 0,
    right: 0,
    zIndex: 9999,
    paddingHorizontal: spacing.lg,
  },
  toast: {
    borderRadius: borderRadius.medium,
    marginBottom: spacing.sm,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    maxWidth: width - spacing.lg * 2,
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  toastContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  toastMessage: {
    color: colors.white,
    fontSize: 14,
    fontWeight: '600',
    marginLeft: spacing.sm,
    flex: 1,
    lineHeight: 20,
  },
});

export default ToastProvider;
