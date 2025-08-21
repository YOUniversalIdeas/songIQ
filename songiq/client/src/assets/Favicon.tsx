import React from 'react';
import logoImage from './LeaningIQ.svg';

interface FaviconProps {
  className?: string;
  size?: number;
}

const Favicon: React.FC<FaviconProps> = ({ className = '', size = 80 }) => {
  return (
    <img 
      src={logoImage} 
      alt="SongIQ Favicon"
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

export default Favicon; 