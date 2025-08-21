import React from 'react';
import logoImage from './LeaningIQ.svg';

interface LogoSmallProps {
  className?: string;
  size?: number;
}

const LogoSmall: React.FC<LogoSmallProps> = ({ className = '', size = 24 }) => {
  return (
    <img 
      src={logoImage} 
      alt="SongIQ Logo Small"
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

export default LogoSmall; 