import React from 'react';
import logoImage from './LeaningIQ.svg';

interface LogoProps {
  className?: string;
  size?: number;
}

const Logo: React.FC<LogoProps> = ({ className = '', size = 120 }) => {
  return (
    <img 
      src={logoImage} 
      alt="SongIQ Logo"
      style={{ 
        width: size, 
        height: 'auto',
        maxWidth: '100%',
        objectFit: 'contain'
      }}
      className={className}
    />
  );
};

export default Logo; 