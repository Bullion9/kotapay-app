import { useNavigation } from '@react-navigation/native';
import * as Haptics from 'expo-haptics';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { colors } from '../theme';
import HomeNotificationIcon from './icons/HomeNotificationIcon';

interface NotificationMailIconProps {
  unreadCount?: number;
  size?: number;
  color?: string;
  onPress?: () => void;
  useContext?: boolean; // Option to use context or provided unreadCount
}

const NotificationMailIcon: React.FC<NotificationMailIconProps> = ({
  unreadCount: providedUnreadCount = 0,
  size = 24,
  color = '#000d10',
  onPress,
  useContext = false,
}) => {
  const navigation = useNavigation();
  
  // For now, we'll use provided unreadCount and implement context integration later
  const unreadCount = providedUnreadCount;

  const handlePress = async () => {
    // Haptic feedback
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    
    if (onPress) {
      onPress();
    } else {
      // Default navigation to Notifications screen
      navigation.navigate('Notifications' as never);
    }
  };

  return (
    <TouchableOpacity
      style={styles.container}
      onPress={handlePress}
      hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
    >
      <View style={styles.iconContainer}>
        <HomeNotificationIcon size={size} color={color} />
        
        {/* Notification Badge */}
        {unreadCount > 0 && (
          <View style={styles.badge}>
            <Text style={styles.badgeText}>
              {unreadCount > 99 ? '99+' : unreadCount.toString()}
            </Text>
          </View>
        )}
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'relative',
  },
  iconContainer: {
    position: 'relative',
  },
  badge: {
    position: 'absolute',
    top: -4,
    right: -4,
    backgroundColor: '#EA3B52',
    borderRadius: 8,
    minWidth: 16,
    height: 16,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 4,
  },
  badgeText: {
    color: colors.white,
    fontSize: 10,
    fontWeight: 'bold',
    textAlign: 'center',
  },
});

export default NotificationMailIcon;
