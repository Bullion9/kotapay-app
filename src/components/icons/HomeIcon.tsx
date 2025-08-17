import React from 'react';
import Svg, { Path, Polygon } from 'react-native-svg';

interface HomeIconProps {
  size?: number;
  color?: string;
  focused?: boolean;
}

const HomeIcon: React.FC<HomeIconProps> = ({ 
  size = 24, 
  color = '#000000', 
  focused = false 
}) => {
  return (
    <Svg 
      width={size} 
      height={size} 
      viewBox="0 0 24 24" 
      fill="none"
    >
      {focused ? (
        // Filled version - Simple home with filled areas
        <>
          {/* Roof triangle */}
          <Polygon
            points="12,3 20,10 20,21 4,21 4,10"
            fill={color}
          />
          {/* Door */}
          <Path
            d="M9 21V14h6v7"
            fill="#ffffff"
            stroke={color}
            strokeWidth="1"
          />
        </>
      ) : (
        // Outline version - Clean line art matching Flaticon style
        <>
          {/* House outline */}
          <Path
            d="M3 12h2l7-9 7 9h2"
            stroke={color}
            strokeWidth="2"
            fill="none"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          {/* House body */}
          <Path
            d="M5 12v7a2 2 0 002 2h10a2 2 0 002-2v-7"
            stroke={color}
            strokeWidth="2"
            fill="none"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          {/* Door */}
          <Path
            d="M9 21v-6a2 2 0 012-2h0a2 2 0 012 2v6"
            stroke={color}
            strokeWidth="2"
            fill="none"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </>
      )}
    </Svg>
  );
};

export default HomeIcon;
