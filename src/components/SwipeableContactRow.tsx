import React, { useRef } from 'react';
import {
  StyleSheet,
  Animated,
  PanResponder,
} from 'react-native';
import ContactRow from './ContactRow';

interface Contact {
  id: string;
  name: string;
  phone: string;
  profileImage?: string;
  isRegistered?: boolean;
}

interface SwipeableContactRowProps {
  item: Contact;
  onDelete: (contactId: string) => void;
  onUndo?: (contact: Contact) => void;
  isDeleted?: boolean;
}

const SwipeableContactRow: React.FC<SwipeableContactRowProps> = ({
  item,
  onDelete,
  onUndo,
  isDeleted = false,
}) => {
  const translateX = useRef(new Animated.Value(0)).current;
  const rowOpacity = useRef(new Animated.Value(1)).current;

  const panResponder = PanResponder.create({
    onMoveShouldSetPanResponder: (evt, gestureState) => {
      // Only respond to horizontal swipes with significant movement
      return Math.abs(gestureState.dx) > 20 && Math.abs(gestureState.dx) > Math.abs(gestureState.dy);
    },
    onPanResponderGrant: () => {
      // Don't prevent other touch events
    },
    onPanResponderMove: (evt, gestureState) => {
      // Only move on significant horizontal gesture
      if (Math.abs(gestureState.dx) > Math.abs(gestureState.dy)) {
        translateX.setValue(gestureState.dx);
      }
    },
    onPanResponderRelease: (evt, gestureState) => {
      const { dx } = gestureState;
      
      if (dx < -100) {
        // Swipe left - delete
        Animated.sequence([
          Animated.timing(translateX, {
            toValue: -300,
            duration: 200,
            useNativeDriver: false,
          }),
          Animated.timing(rowOpacity, {
            toValue: 0,
            duration: 200,
            useNativeDriver: false,
          }),
        ]).start(() => {
          onDelete(item.id);
          // Reset animations for when item is restored
          translateX.setValue(0);
          rowOpacity.setValue(1);
        });
      } else if (dx > 100 && isDeleted && onUndo) {
        // Swipe right - undo (only for deleted contacts)
        Animated.sequence([
          Animated.timing(translateX, {
            toValue: 300,
            duration: 200,
            useNativeDriver: false,
          }),
          Animated.timing(rowOpacity, {
            toValue: 0,
            duration: 200,
            useNativeDriver: false,
          }),
        ]).start(() => {
          onUndo(item);
          // Reset animations
          translateX.setValue(0);
          rowOpacity.setValue(1);
        });
      } else {
        // Snap back to original position
        Animated.spring(translateX, {
          toValue: 0,
          useNativeDriver: false,
        }).start();
      }
    },
    onPanResponderTerminate: () => {
      // Reset position if gesture is interrupted
      Animated.spring(translateX, {
        toValue: 0,
        useNativeDriver: false,
      }).start();
    },
  });

  return (
    <Animated.View
      style={[
        styles.container,
        {
          transform: [{ translateX }],
          opacity: rowOpacity,
        },
      ]}
      {...panResponder.panHandlers}
    >
      <ContactRow item={item} />
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFFFFF',
  },
});

export default SwipeableContactRow;
