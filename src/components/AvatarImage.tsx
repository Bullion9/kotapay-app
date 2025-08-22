import { User } from 'lucide-react-native';
import React from 'react';
import { Image, Text, View } from 'react-native';
import { useProfileImage } from '../contexts/ProfileImageContext';
import { theme } from '../theme';

const { colors } = theme;

interface AvatarImageProps {
  size?: number;
  userName?: string;
  style?: any;
  textStyle?: any;
  showInitials?: boolean;
}

export const AvatarImage: React.FC<AvatarImageProps> = ({
  size = 40,
  userName = 'User',
  style,
  textStyle,
  showInitials = true,
}) => {
  const { profileImage } = useProfileImage();

  const containerStyle = {
    width: size,
    height: size,
    borderRadius: size / 2,
    backgroundColor: colors.light,
    justifyContent: 'center' as const,
    alignItems: 'center' as const,
    overflow: 'hidden' as const,
  };

  const imageStyle = {
    width: size,
    height: size,
    borderRadius: size / 2,
  };

  const defaultTextStyle = {
    fontSize: size * 0.4,
    color: colors.primary,
    fontWeight: '600' as const,
    fontFamily: 'System',
  };

  if (profileImage) {
    return (
      <View style={[containerStyle, style]}>
        <Image source={{ uri: profileImage }} style={imageStyle} />
      </View>
    );
  }

  if (showInitials && userName) {
    return (
      <View style={[containerStyle, style]}>
        <Text style={[defaultTextStyle, textStyle]}>
          {userName.charAt(0).toUpperCase()}
        </Text>
      </View>
    );
  }

  return (
    <View style={[containerStyle, style]}>
      <User size={size * 0.5} color={colors.primary} />
    </View>
  );
};

export default AvatarImage;
