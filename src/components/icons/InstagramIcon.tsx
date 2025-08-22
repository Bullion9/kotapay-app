import React from 'react';
import Svg, { Circle, Defs, LinearGradient, Path, Rect, Stop } from 'react-native-svg';

interface InstagramIconProps {
  size?: number;
  color?: string;
}

const InstagramIcon: React.FC<InstagramIconProps> = ({ 
  size = 24, 
  color = '#E4405F' 
}) => {
  return (
    <Svg
      width={size}
      height={size}
      viewBox="0 0 512 512"
    >
      <Defs>
        <LinearGradient
          id="instagramGradient"
          x1="328.27"
          y1="508.05"
          x2="183.73"
          y2="3.95"
          gradientUnits="userSpaceOnUse"
        >
          <Stop offset="0" stopColor="#ffdb73" />
          <Stop offset="0.08" stopColor="#fdad4e" />
          <Stop offset="0.15" stopColor="#fb832e" />
          <Stop offset="0.19" stopColor="#fa7321" />
          <Stop offset="0.23" stopColor="#f6692f" />
          <Stop offset="0.37" stopColor="#e84a5a" />
          <Stop offset="0.48" stopColor="#e03675" />
          <Stop offset="0.55" stopColor="#dd2f7f" />
          <Stop offset="0.68" stopColor="#b43d97" />
          <Stop offset="0.97" stopColor="#4d60d4" />
          <Stop offset="1" stopColor="#4264db" />
        </LinearGradient>
      </Defs>
      
      {/* Background rounded rectangle with Instagram gradient */}
      <Rect 
        x="23.47" 
        y="23.47" 
        width="465.06" 
        height="465.06" 
        rx="107.23" 
        ry="107.23" 
        fill="url(#instagramGradient)" 
      />
      
      {/* Outer square frame */}
      <Path 
        d="M331,115.22a66.92,66.92,0,0,1,66.65,66.65V330.13A66.92,66.92,0,0,1,331,396.78H181a66.92,66.92,0,0,1-66.65-66.65V181.87A66.92,66.92,0,0,1,181,115.22H331m0-31H181c-53.71,0-97.66,44-97.66,97.66V330.13c0,53.71,44,97.66,97.66,97.66H331c53.71,0,97.66-44,97.66-97.66V181.87c0-53.71-43.95-97.66-97.66-97.66Z" 
        fill="#fff" 
      />
      
      {/* Camera lens circle */}
      <Path 
        d="M256,198.13A57.87,57.87,0,1,1,198.13,256,57.94,57.94,0,0,1,256,198.13m0-31A88.87,88.87,0,1,0,344.87,256,88.87,88.87,0,0,0,256,167.13Z" 
        fill="#fff" 
      />
      
      {/* Top right dot */}
      <Circle 
        cx="346.81" 
        cy="163.23" 
        r="21.07" 
        fill="#fff" 
      />
    </Svg>
  );
};

export default InstagramIcon;
