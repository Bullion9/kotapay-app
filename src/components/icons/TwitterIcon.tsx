import React from 'react';
import Svg, { Circle, Path } from 'react-native-svg';

interface TwitterIconProps {
  size?: number;
  color?: string;
}

const TwitterIcon: React.FC<TwitterIconProps> = ({ 
  size = 24, 
  color = '#000000' 
}) => {
  return (
    <Svg
      width={size}
      height={size}
      viewBox="0 0 1227 1227"
    >
      {/* Black circular background */}
      <Circle 
        cx="613.5" 
        cy="613.5" 
        r="613.5" 
        fill="#000000" 
      />
      
      {/* White X logo */}
      <Path 
        d="m680.617 557.98 262.632-305.288h-62.235l-228.044 265.078-182.137-265.078h-210.074l275.427 400.844-275.427 320.142h62.239l240.82-279.931 192.35 279.931h210.074l-285.641-415.698zm-335.194-258.435h95.595l440.024 629.411h-95.595z" 
        fill="#fff" 
      />
    </Svg>
  );
};

export default TwitterIcon;
