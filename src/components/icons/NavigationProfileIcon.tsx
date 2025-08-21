import React from 'react';
import Svg, { Circle, Path } from 'react-native-svg';

interface NavigationProfileIconProps {
  size?: number;
  color?: string;
  focused?: boolean;
}

const NavigationProfileIcon: React.FC<NavigationProfileIconProps> = ({ 
  size = 24, 
  color = '#000000', 
  focused = false 
}) => {
  const opacity = focused ? 1 : 0.7;
  return (
    <Svg 
      width={size} 
      height={size} 
      viewBox="0 0 512 512" 
      fill="none"
    >
      <Circle
        cx="256" 
        cy="128" 
        r="128"
        fill={color}
        opacity={opacity}
        stroke="none"
      />
      <Path
        d="M256,298.667c-105.99,0.118-191.882,86.01-192,192C64,502.449,73.551,512,85.333,512h341.333c11.782,0,21.333-9.551,21.333-21.333C447.882,384.677,361.99,298.784,256,298.667z"
        fill={color}
        opacity={opacity}
        stroke="none"
      />
    </Svg>
  );
};

export default NavigationProfileIcon;
