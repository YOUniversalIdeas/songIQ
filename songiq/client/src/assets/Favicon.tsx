import React from 'react';
import logoImage from './LeaningIQ2025-08-05_12-17-500x.png';

interface FaviconProps {
  className?: string;
  size?: number;
}

const Favicon: React.FC<FaviconProps> = ({ className = '', size = 80 }) => {
  return (
    <img 
      src={logoImage} 
      alt="SongIQ Favicon"
      width={size}
      height={size}
      className={className}
    />
  );
};

export default Favicon; 