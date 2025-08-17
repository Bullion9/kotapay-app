import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  Animated,
  PanResponder,
  TextInput,
} from 'react-native';
import {
  Trash2,
  AlertTriangle,
  X,
} from 'lucide-react-native';
import { colors, spacing, borderRadius } from '../theme';

interface DeleteCardModalProps {
  visible: boolean;
  onClose: () => void;
  cardId: string;
  cardNickname: string;
  onPinRequired: (cardId: string) => void;
}

const DeleteCardModal: React.FC<DeleteCardModalProps> = ({
  visible,
  onClose,
  cardId,
  cardNickname,
  onPinRequired,
}) => {
  // States
  const [confirmationText, setConfirmationText] = useState('');
  const [error, setError] = useState<string | null>(null);
  
  // Animations
  const slideAnim = useRef(new Animated.Value(0)).current;
  const overlayOpacity = useRef(new Animated.Value(0)).current;
  
  // Required confirmation text
  const requiredText = 'DELETE';
  const isConfirmationValid = confirmationText.trim().toUpperCase() === requiredText;
  
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
      setConfirmationText('');
      setError(null);
      animateIn();
    } else {
      animateOut();
    }
  }, [visible, animateIn, animateOut]);
  
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
  
  // Handle delete confirmation
  const handleDeleteConfirm = () => {
    if (!isConfirmationValid) return;
    
    // Show PIN verification instead of executing immediately
    onPinRequired(cardId);
  };
  
  // Generate dynamic gradient based on cardId
  const generateCardGradient = (cardId: string) => {
    // Create a simple hash from cardId for consistent colors
    let hash = 0;
    for (let i = 0; i < cardId.length; i++) {
      hash = ((hash << 5) - hash + cardId.charCodeAt(i)) & 0xffffffff;
    }
    
    // Use hash to create variations of the red color for deletion
    const baseHue = Math.abs(hash) % 20; // Variation in red range
    const saturation = 70 + (Math.abs(hash) % 30); // 70-100% saturation
    const lightness1 = 25 + (Math.abs(hash) % 15); // 25-40% for dark color
    const lightness2 = 85 + (Math.abs(hash) % 15); // 85-100% for light color
    
    return {
      colors: [
        `hsl(${350 + baseHue}, ${saturation}%, ${lightness1}%)`, // Red variation
        `hsl(${0 + baseHue}, ${saturation}%, ${lightness2}%)`, // Light red variation
      ],
      start: { x: 0, y: 0 },
      end: { x: 1, y: 1 },
    };
  };
  
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
              <View style={[styles.iconContainer, { backgroundColor: '#FFEBEE' }]}>
                <Trash2 size={24} color="#EA3B52" />
              </View>
              <View style={styles.headerText}>
                <Text style={styles.headerTitle}>Delete Card</Text>
                <Text style={styles.headerSubtitle}>{cardNickname}</Text>
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
                <Text style={styles.cardStatus}>TO BE DELETED</Text>
              </View>
            </View>
          </View>
          
          {/* Warning Section */}
          <View style={styles.warningSection}>
            <View style={styles.warningRow}>
              <AlertTriangle size={20} color="#EA3B52" />
              <View style={styles.warningText}>
                <Text style={styles.warningTitle}>Permanent Action</Text>
                <Text style={styles.warningDescription}>
                  This will permanently delete your virtual card. This action cannot be undone.
                </Text>
              </View>
            </View>
          </View>
          
          {/* Consequences List */}
          <View style={styles.consequencesSection}>
            <Text style={styles.consequencesTitle}>What happens when you delete:</Text>
            <View style={styles.consequencesList}>
              <Text style={styles.consequenceItem}>• Card will be immediately deactivated</Text>
              <Text style={styles.consequenceItem}>• All pending transactions will be cancelled</Text>
              <Text style={styles.consequenceItem}>• Card details will be permanently removed</Text>
              <Text style={styles.consequenceItem}>• Any remaining balance will be returned to your main wallet</Text>
            </View>
          </View>
          
          {/* Confirmation Input */}
          <View style={styles.confirmationSection}>
            <Text style={styles.confirmationLabel}>
              Type <Text style={styles.confirmationKeyword}>DELETE</Text> to confirm:
            </Text>
            <TextInput
              style={[
                styles.confirmationInput,
                isConfirmationValid && styles.confirmationInputValid,
                error && styles.confirmationInputError,
              ]}
              value={confirmationText}
              onChangeText={setConfirmationText}
              placeholder="Type DELETE here"
              placeholderTextColor={colors.secondaryText}
              autoCapitalize="characters"
              autoCorrect={false}
            />
          </View>
          
          {/* Error Display */}
          {error && (
            <View style={styles.errorContainer}>
              <AlertTriangle size={16} color="#EA3B52" />
              <Text style={styles.errorText}>{error}</Text>
            </View>
          )}
          
          {/* Action Buttons */}
          <View style={styles.actionButtons}>
            <TouchableOpacity
              style={styles.cancelButton}
              onPress={onClose}
            >
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={[
                styles.deleteButton,
                !isConfirmationValid && styles.deleteButtonDisabled,
              ]}
              onPress={handleDeleteConfirm}
              disabled={!isConfirmationValid}
            >
              <Text style={styles.deleteButtonText}>Delete Forever</Text>
            </TouchableOpacity>
          </View>
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
    maxHeight: '85%',
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
    marginBottom: spacing.lg,
  },
  cardGradient: {
    height: 100,
    borderRadius: borderRadius.medium,
    overflow: 'hidden',
    position: 'relative',
  },
  cardBlurOverlay: {
    flex: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.12)',
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
  warningSection: {
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.lg,
  },
  warningRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#FFEBEE',
    padding: spacing.md,
    borderRadius: borderRadius.medium,
    borderLeftWidth: 4,
    borderLeftColor: '#EA3B52',
  },
  warningText: {
    flex: 1,
    marginLeft: spacing.sm,
  },
  warningTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#EA3B52',
    marginBottom: 4,
  },
  warningDescription: {
    fontSize: 14,
    color: '#C62828',
    lineHeight: 20,
  },
  consequencesSection: {
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.lg,
  },
  consequencesTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
    marginBottom: spacing.sm,
  },
  consequencesList: {
    backgroundColor: '#F8F9FA',
    padding: spacing.md,
    borderRadius: borderRadius.small,
  },
  consequenceItem: {
    fontSize: 13,
    color: colors.secondaryText,
    lineHeight: 20,
    marginBottom: 4,
  },
  confirmationSection: {
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.lg,
  },
  confirmationLabel: {
    fontSize: 14,
    color: colors.text,
    marginBottom: spacing.sm,
  },
  confirmationKeyword: {
    fontWeight: '700',
    color: '#EA3B52',
    backgroundColor: '#FFEBEE',
    paddingHorizontal: 4,
    paddingVertical: 2,
    borderRadius: 4,
  },
  confirmationInput: {
    borderWidth: 2,
    borderColor: colors.border,
    borderRadius: borderRadius.small,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    fontSize: 16,
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  confirmationInputValid: {
    borderColor: '#A8E4A0',
    backgroundColor: '#F1F8E9',
  },
  confirmationInputError: {
    borderColor: '#EA3B52',
    backgroundColor: '#FFEBEE',
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
  actionButtons: {
    flexDirection: 'row',
    paddingHorizontal: spacing.lg,
    gap: spacing.md,
  },
  cancelButton: {
    flex: 1,
    backgroundColor: colors.border,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.medium,
    alignItems: 'center',
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
  },
  deleteButton: {
    flex: 1,
    backgroundColor: '#EA3B52',
    paddingVertical: spacing.md,
    borderRadius: borderRadius.medium,
    alignItems: 'center',
  },
  deleteButtonDisabled: {
    backgroundColor: colors.border,
  },
  deleteButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.white,
  },
});

export default DeleteCardModal;
