import React from 'react';
import Svg, { Path } from 'react-native-svg';

interface HomeBillsIconProps {
  size?: number;
  color?: string;
}

const HomeBillsIcon: React.FC<HomeBillsIconProps> = ({ 
  size = 24, 
  color = '#000000'
}) => {
  return (
    <Svg 
      width={size} 
      height={size} 
      viewBox="0 0 24 24" 
      fill="none"
    >
      <Path
        d="m8 0h-4a4 4 0 0 0 -4 4v1a4 4 0 0 0 4 4h1v2h-2a1 1 0 0 0 0 2h6a1 1 0 0 0 0-2h-2v-2h1a4 4 0 0 0 4-4v-1a4 4 0 0 0 -4-4zm2 5a2 2 0 0 1 -2 2h-4a2 2 0 0 1 -2-2v-1a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2zm10 6h-2a4 4 0 0 0 -4 4v5a4 4 0 0 0 4 4h2a4 4 0 0 0 4-4v-5a4 4 0 0 0 -4-4zm2 9a2 2 0 0 1 -2 2h-2a2 2 0 0 1 -2-2v-5a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2zm-8-16a1 1 0 0 1 1-1h2a3 3 0 0 1 3 3v2a1 1 0 0 1 -2 0v-2a1 1 0 0 0 -1-1h-2a1 1 0 0 1 -1-1zm-2 16a1 1 0 0 1 -1 1h-3a3 3 0 0 1 -3-3v-2a1 1 0 0 1 2 0v2a1 1 0 0 0 1 1h3a1 1 0 0 1 1 1zm8 0a1 1 0 1 1 -1-1 1 1 0 0 1 1 1z"
        fill={color}
      />
    </Svg>
  );
};

export default HomeBillsIcon;
