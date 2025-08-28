import React from 'react';

// Temporarily disable Stripe to prevent blocking dashboard functionality
const StripeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return <>{children}</>;
};

export default StripeProvider; 