import React from 'react';
import Svg, { Path } from 'react-native-svg';

interface HomeQRCodeIconProps {
  size?: number;
  color?: string;
}

const HomeQRCodeIcon: React.FC<HomeQRCodeIconProps> = ({ 
  size = 24, 
  color = '#000000'
}) => {
  return (
    <Svg 
      width={size} 
      height={size} 
      viewBox="0 0 512 512" 
      fill="none"
    >
      <Path d="m30 30h90v-30h-120v120h30zm0 0" fill={color} />
      <Path d="m392 0v30h90v90h30v-120zm0 0" fill={color} />
      <Path d="m482 482h-90v30h120v-120h-30zm0 0" fill={color} />
      <Path d="m30 392h-30v120h120v-30h-90zm0 0" fill={color} />
      <Path d="m61 60v150h150v-90h30v-30h-30v-30zm120 120h-90v-90h90zm0 0" fill={color} />
      <Path d="m451 450v-150h-60v-30h-30v30h-90v30h30v30h-30v30h30v60zm-120-120h90v90h-90zm0 0" fill={color} />
      <Path d="m151 270h60v-30h-150v30h60v30h-30v30h30v60h-30v30h30v30h150v-30h-30v-30h-30v30h-60v-30h30v-30h-30zm0 0" fill={color} />
      <Path d="m121 120h30v30h-30zm0 0" fill={color} />
      <Path d="m361 120h30v30h-30zm0 0" fill={color} />
      <Path d="m391 210h60v-150h-150v150h60v30h30zm-60-30v-90h90v90zm0 0" fill={color} />
      <Path d="m451 270v-30c-7.257812 0-52.691406 0-60 0v30zm0 0" fill={color} />
      <Path d="m361 360h30v30h-30zm0 0" fill={color} />
      <Path d="m241 330h30v30h-30zm0 0" fill={color} />
      <Path d="m181 360h30c0-7.257812 0-52.691406 0-60h-30zm0 0" fill={color} />
      <Path d="m211 270h30v30h-30zm0 0" fill={color} />
      <Path d="m91 330h-30v60h30c0-7.257812 0-52.691406 0-60zm0 0" fill={color} />
      <Path d="m61 420h30v30h-30zm0 0" fill={color} />
      <Path d="m241 60h30v30h-30zm0 0" fill={color} />
      <Path d="m241 180h30c0-7.257812 0-52.691406 0-60h-30zm0 0" fill={color} />
      <Path d="m271 240v-30h-30v60h120v-30zm0 0" fill={color} />
    </Svg>
  );
};

export default HomeQRCodeIcon;
