import React from 'react';
import Svg, { Circle, Defs, LinearGradient, Path, Stop } from 'react-native-svg';

interface TelegramIconProps {
  size?: number;
  color?: string;
}

const TelegramIcon: React.FC<TelegramIconProps> = ({ 
  size = 24, 
  color = '#2aabee' 
}) => {
  return (
    <Svg
      width={size}
      height={size}
      viewBox="0 0 512 512"
    >
      <Defs>
        <LinearGradient
          id="telegramGradient"
          x1="0%"
          y1="0%"
          x2="0%"
          y2="100%"
        >
          <Stop offset="0" stopColor="#2aabee" />
          <Stop offset="1" stopColor="#229ed9" />
        </LinearGradient>
      </Defs>
      
      {/* Background circle with Telegram's authentic gradient */}
      <Circle 
        cx="256" 
        cy="256" 
        r="256" 
        fill="url(#telegramGradient)" 
      />
      
      {/* Telegram paper plane icon */}
      <Path 
        d="m115.88 253.298c74.629-32.515 124.394-53.951 149.293-64.307 71.094-29.57 85.867-34.707 95.495-34.877 2.118-.037 6.853.488 9.92 2.977 4.55 3.692 4.576 11.706 4.071 17.01-3.853 40.48-20.523 138.713-29.004 184.051-3.589 19.184-10.655 25.617-17.495 26.246-14.866 1.368-26.155-9.825-40.554-19.263-22.531-14.77-35.26-23.964-57.131-38.376-25.275-16.656-8.89-25.81 5.514-40.771 3.77-3.915 69.271-63.494 70.539-68.899.159-.676.306-3.196-1.191-4.526s-3.706-.876-5.3-.514c-2.26.513-38.254 24.304-107.982 71.372-10.217 7.016-19.471 10.434-27.762 10.255-9.141-.197-26.723-5.168-39.794-9.417-16.032-5.211-28.774-7.967-27.664-16.817.578-4.611 6.926-9.325 19.045-14.144z" 
        fill="#fff" 
      />
    </Svg>
  );
};

export default TelegramIcon;
