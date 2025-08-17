import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  Animated,
  PanResponder,
  Switch,
} from 'react-native';
import {
  Snowflake,
  Shield,
  AlertTriangle,
  X,
} from 'lucide-react-native';
import { colors, spacing, borderRadius } from '../theme';

interface FreezeCardModalProps {
  visible: boolean;
  onClose: () => void;
  cardId: string;
  cardNickname: string;
  isCurrentlyFrozen: boolean;
  onPinRequired: (cardId: string, shouldFreeze: boolean) => void;
}

const FreezeCardModal: React.FC<FreezeCardModalProps> = ({
  visible,
  onClose,
  cardId,
  cardNickname,
  isCurrentlyFrozen,
  onPinRequired,
}) => {
  // States
  const [isFrozen, setIsFrozen] = useState(isCurrentlyFrozen);
  const [error, setError] = useState<string | null>(null);
  
  // Animations
  const slideAnim = useRef(new Animated.Value(0)).current;
  const overlayOpacity = useRef(new Animated.Value(0)).current;
  
  // Animate modal in
  const animateIn = useCallback(() => {
    Animated.parallel([
      Animated.timing(overlayOpacity, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.spring(slideAnim, {
        toValue: 1,
        useNativeDriver: true,
        tension: 100,
        friction: 8,
      }),
    ]).start();
  }, [overlayOpacity, slideAnim]);
  
  // Animate modal out
  const animateOut = useCallback(() => {
    Animated.parallel([
      Animated.timing(overlayOpacity, {
        toValue: 0,
        duration: 250,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 250,
        useNativeDriver: true,
      }),
    ]).start();
  }, [overlayOpacity, slideAnim]);
  
  // Reset state when modal opens
  useEffect(() => {
    if (visible) {
      setIsFrozen(isCurrentlyFrozen);
      setError(null);
      animateIn();
    } else {
      animateOut();
    }
  }, [visible, isCurrentlyFrozen, animateIn, animateOut]);
  
  // Pan responder for swipe to dismiss
  const panResponder = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: (_, gestureState) => {
        return gestureState.dy > 10 && Math.abs(gestureState.dx) < 100;
      },
      onPanResponderMove: (_, gestureState) => {
        if (gestureState.dy > 0) {
          const progress = Math.min(gestureState.dy / 300, 1);
          slideAnim.setValue(1 - progress);
          overlayOpacity.setValue(1 - progress * 0.5);
        }
      },
      onPanResponderRelease: (_, gestureState) => {
        if (gestureState.dy > 150) {
          onClose();
        } else {
          animateIn();
        }
      },
    })
  ).current;
  
  // Handle freeze toggle
  const handleToggleFreeze = (value: boolean) => {
    setIsFrozen(value);
    setError(null);
  };
  
  // Handle confirm action
  const handleConfirm = async () => {
    if (isFrozen === isCurrentlyFrozen) {
      onClose();
      return;
    }
    
    // Show PIN verification instead of executing immediately
    onPinRequired(cardId, isFrozen);
  };
  
  // Generate dynamic gradient based on cardId
  const generateCardGradient = (cardId: string) => {
    // Create a simple hash from cardId for consistent colors
    let hash = 0;
    for (let i = 0; i < cardId.length; i++) {
      hash = ((hash << 5) - hash + cardId.charCodeAt(i)) & 0xffffffff;
    }
    
    // Use hash to create variations of the base colors
    const baseHue = Math.abs(hash) % 60; // Variation in green range
    const saturation = 70 + (Math.abs(hash) % 30); // 70-100% saturation
    const lightness1 = 25 + (Math.abs(hash) % 15); // 25-40% for dark color
    const lightness2 = 85 + (Math.abs(hash) % 15); // 85-100% for light color
    
    return {
      colors: [
        `hsl(${150 + baseHue}, ${saturation}%, ${lightness1}%)`, // Sea-green variation
        `hsl(${180 + baseHue}, ${saturation}%, ${lightness2}%)`, // Ice-glow variation
      ],
      start: { x: 0, y: 0 },
      end: { x: 1, y: 1 },
    };
  };
  
  const hasChanges = isFrozen !== isCurrentlyFrozen;
  const cardGradient = generateCardGradient(cardId);
  
  if (!visible) return null;
  
  return (
    <Modal transparent visible={visible} animationType="none">
      <View style={styles.overlay}>
        <Animated.View
          style={[
            styles.overlayBackground,
            {
              opacity: overlayOpacity,
            },
          ]}
        >
          <TouchableOpacity
            style={StyleSheet.absoluteFill}
            onPress={onClose}
            activeOpacity={1}
          />
        </Animated.View>
        
        <Animated.View
          style={[
            styles.modalContainer,
            {
              transform: [
                {
                  translateY: slideAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [500, 0],
                  }),
                },
              ],
            },
          ]}
          {...panResponder.panHandlers}
        >
          {/* Drag Handle */}
          <View style={styles.dragHandle} />
          
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.headerLeft}>
              <View style={[styles.iconContainer, { backgroundColor: isFrozen ? '#E3F2FD' : '#FFF3E0' }]}>
                {isFrozen ? (
                  <Snowflake size={24} color="#1976D2" />
                ) : (
                  <Shield size={24} color="#F57C00" />
                )}
              </View>
              <View style={styles.headerText}>
                <Text style={styles.headerTitle}>
                  {isFrozen ? 'Freeze Card' : 'Unfreeze Card'}
                </Text>
                <Text style={styles.headerSubtitle}>
                  {cardNickname}
                </Text>
              </View>
            </View>
            
            <TouchableOpacity style={styles.closeButton} onPress={onClose}>
              <X size={24} color={colors.secondaryText} />
            </TouchableOpacity>
          </View>
          
          {/* Card Preview */}
          <View style={styles.cardPreview}>
            <View style={[styles.cardGradient, { backgroundColor: cardGradient.colors[0] }]}>
              <View style={styles.cardBlurOverlay}>
                <Text style={styles.cardNickname}>{cardNickname}</Text>
                <Text style={styles.cardStatus}>
                  {isFrozen ? 'FROZEN' : 'ACTIVE'}
                </Text>
              </View>
            </View>
          </View>
          
          {/* Freeze Toggle */}
          <View style={styles.toggleSection}>
            <View style={styles.toggleRow}>
              <View style={styles.toggleText}>
                <Text style={styles.toggleTitle}>Freeze Card</Text>
                <Text style={styles.toggleDescription}>
                  {isFrozen 
                    ? 'No new charges will be allowed on this card'
                    : 'Allow normal transactions on this card'
                  }
                </Text>
              </View>
              
              <Switch
                value={isFrozen}
                onValueChange={handleToggleFreeze}
                trackColor={{ false: colors.border, true: '#06402B' }}
                thumbColor={isFrozen ? colors.white : colors.white}
              />
            </View>
          </View>
          
          {/* Info Section */}
          <View style={styles.infoSection}>
            <View style={styles.infoRow}>
              <AlertTriangle size={16} color="#F57C00" />
              <Text style={styles.infoText}>
                {isFrozen
                  ? 'Frozen cards cannot process any new transactions until unfrozen'
                  : 'Unfreezing will allow all transaction types to resume normally'
                }
              </Text>
            </View>
          </View>
          
          {/* Error Display */}
          {error && (
            <View style={styles.errorContainer}>
              <AlertTriangle size={16} color="#EA3B52" />
              <Text style={styles.errorText}>{error}</Text>
            </View>
          )}
          
          {/* Action Button */}
          <TouchableOpacity
            style={[
              styles.confirmButton,
              !hasChanges && styles.confirmButtonDisabled,
            ]}
            onPress={handleConfirm}
            disabled={!hasChanges}
          >
            <Text style={styles.confirmButtonText}>
              {hasChanges ? 'Confirm' : 'No Changes'}
            </Text>
          </TouchableOpacity>
        </Animated.View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  overlayBackground: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContainer: {
    backgroundColor: colors.white,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingBottom: spacing.xl,
    maxHeight: '80%',
  },
  dragHandle: {
    width: 40,
    height: 4,
    backgroundColor: colors.border,
    borderRadius: 2,
    alignSelf: 'center',
    marginTop: spacing.md,
    marginBottom: spacing.lg,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.lg,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  headerText: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
  },
  headerSubtitle: {
    fontSize: 14,
    color: colors.secondaryText,
    marginTop: 2,
  },
  closeButton: {
    padding: spacing.sm,
  },
  cardPreview: {
    marginHorizontal: spacing.lg,
    marginBottom: spacing.xl,
  },
  cardGradient: {
    height: 100,
    borderRadius: borderRadius.medium,
    overflow: 'hidden',
    position: 'relative',
  },
  cardBlurOverlay: {
    flex: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.12)', // 12% blur overlay
    padding: spacing.lg,
    justifyContent: 'space-between',
  },
  cardNickname: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.white,
  },
  cardStatus: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.white,
    letterSpacing: 1,
  },
  toggleSection: {
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.lg,
  },
  toggleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    backgroundColor: '#F8F9FA',
    borderRadius: borderRadius.medium,
  },
  toggleText: {
    flex: 1,
    marginRight: spacing.md,
  },
  toggleTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 4,
  },
  toggleDescription: {
    fontSize: 14,
    color: colors.secondaryText,
    lineHeight: 20,
  },
  infoSection: {
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.lg,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#FFF8E1',
    padding: spacing.md,
    borderRadius: borderRadius.small,
    borderLeftWidth: 4,
    borderLeftColor: '#F57C00',
  },
  infoText: {
    fontSize: 13,
    color: '#E65100',
    marginLeft: spacing.sm,
    flex: 1,
    lineHeight: 18,
  },
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFEBEE',
    marginHorizontal: spacing.lg,
    marginBottom: spacing.md,
    padding: spacing.md,
    borderRadius: borderRadius.small,
    borderLeftWidth: 4,
    borderLeftColor: '#EA3B52',
  },
  errorText: {
    fontSize: 14,
    color: '#EA3B52',
    marginLeft: spacing.sm,
    flex: 1,
  },
  confirmButton: {
    backgroundColor: '#06402B',
    marginHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.medium,
    alignItems: 'center',
  },
  confirmButtonDisabled: {
    backgroundColor: colors.border,
  },
  confirmButtonLoading: {
    opacity: 0.8,
  },
  confirmButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.white,
  },
  successOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  successContainer: {
    backgroundColor: colors.white,
    borderRadius: borderRadius.large,
    padding: spacing.xl,
    alignItems: 'center',
    marginHorizontal: spacing.xl,
  },
  successText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#06402B',
    textAlign: 'center',
    marginTop: spacing.md,
  },
  successSubtext: {
    fontSize: 14,
    color: colors.secondaryText,
    textAlign: 'center',
    marginTop: spacing.xs,
  },
});

export default FreezeCardModal;
