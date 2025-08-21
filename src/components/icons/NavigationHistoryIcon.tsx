import React from 'react';
import Svg, { Path } from 'react-native-svg';

interface NavigationHistoryIconProps {
  size?: number;
  color?: string;
  focused?: boolean;
}

const NavigationHistoryIcon: React.FC<NavigationHistoryIconProps> = ({ 
  size = 24, 
  color = '#000000', 
  focused = false 
}) => {
  const opacity = focused ? 1 : 0.7;
  return (
    <Svg 
      width={size} 
      height={size} 
      viewBox="0 0 32 32" 
      fill="none"
    >
      <Path
        d="m26 2h-20a3 3 0 0 0 -3 3v24a1 1 0 0 0 1.64.77l5.36-4.47 4.77 3.94a2 2 0 0 0 2.56 0l4.67-3.94 5.36 4.47a1 1 0 0 0 .64.23 1 1 0 0 0 .42-.09 1 1 0 0 0 .58-.91v-24a3 3 0 0 0 -3-3zm-3 17h-14a1 1 0 0 1 0-2h14a1 1 0 0 1 0 2zm0-5h-14a1 1 0 0 1 0-2h14a1 1 0 0 1 0 2zm0-5h-14a1 1 0 0 1 0-2h14a1 1 0 0 1 0 2z"
        fill={color}
        opacity={opacity}
      />
    </Svg>
  );
};

export default NavigationHistoryIcon;
