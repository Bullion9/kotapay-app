import React from 'react';
import Svg, { Path } from 'react-native-svg';

interface ContactsIconProps {
  size?: number;
  color?: string;
  focused?: boolean;
}

const ContactsIcon: React.FC<ContactsIconProps> = ({ 
  size = 24, 
  color = '#000000', 
  focused = false 
}) => {
  const opacity = focused ? 1 : 0.7;
  return (
    <Svg 
      width={size} 
      height={size} 
      viewBox="0 0 24 24" 
      fill="none"
    >
      <Path
        d="M23,5V19a5.006,5.006,0,0,1-5,5H8a5,5,0,0,1-4.576-3H2a1,1,0,0,1,0-2H3V17H2a1,1,0,0,1,0-2H3V13H2a1,1,0,0,1,0-2H3V9H2A1,1,0,0,1,2,7H3V5H2A1,1,0,0,1,2,3H3.424A5,5,0,0,1,8,0H18A5.006,5.006,0,0,1,23,5ZM10,9a3,3,0,0,0,6,0A3,3,0,0,0,10,9Zm8,9c-.211-6.608-9.791-6.606-10,0a1,1,0,0,0,2,0,3,3,0,0,1,6,0A1,1,0,0,0,18,18Z"
        fill={color}
        opacity={opacity}
      />
    </Svg>
  );
};

export default ContactsIcon;
