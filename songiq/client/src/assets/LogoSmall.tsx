import React from 'react';
import logoImage from './LeaningIQ2025-08-05_12-17-500x.png';

interface LogoSmallProps {
  className?: string;
  size?: number;
}

const LogoSmall: React.FC<LogoSmallProps> = ({ className = '', size = 24 }) => {
  return (
    <img 
      src={logoImage} 
      alt="SongIQ Logo Small"
      width={size}
      height={size}
      className={className}
    />
  );
};

export default LogoSmall; 