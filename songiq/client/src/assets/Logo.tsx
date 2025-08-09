import React from 'react';
import logoImage from './LeaningIQ2025-08-05_12-17-500x.png';

interface LogoProps {
  className?: string;
  size?: number;
}

const Logo: React.FC<LogoProps> = ({ className = '', size = 120 }) => {
  return (
    <img 
      src={logoImage} 
      alt="SongIQ Logo"
      width={size}
      height={size}
      className={className}
    />
  );
};

export default Logo; 