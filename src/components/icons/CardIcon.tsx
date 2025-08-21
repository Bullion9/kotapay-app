import React from 'react';
import Svg, { Path } from 'react-native-svg';

interface CardIconProps {
  size?: number;
  color?: string;
  focused?: boolean;
}

const CardIcon: React.FC<CardIconProps> = ({ 
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
        d="M19,2H5C2.243,2,0,4.243,0,7v2h24V7c0-2.757-2.243-5-5-5ZM0,17c0,2.757,2.243,5,5,5h14c2.757,0,5-2.243,5-5v-6H0v6Zm7-3h10c.552,0,1,.448,1,1s-.448,1-1,1H7c-.552,0-1-.448-1-1s.448-1,1-1Z"
        fill={color}
        opacity={opacity}
      />
    </Svg>
  );
};

export default CardIcon;
