import React, { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from './AuthProvider';

interface VerificationGuardProps {
  children: React.ReactNode;
}

const VerificationGuard: React.FC<VerificationGuardProps> = ({ children }) => {
  const { user, token, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();



  useEffect(() => {
    // Only run verification check if we're not on auth or verify pages
    if (location.pathname === '/auth' || location.pathname === '/verify') {
      return;
    }

    // If user has a token but is not authenticated, they need verification
    if (token && user && !isAuthenticated && location.pathname !== '/verify') {
      console.log('🔍 Running verification check...');
      // Check if user is verified on the backend
      const checkVerificationStatus = async () => {
        try {
          const response = await fetch('/api/verification/status', {
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            }
          });

          if (response.ok) {
            const data = await response.json();
            if (!data.isVerified) {
              // User is not verified, redirect to verification page
              navigate('/verify');
            }
          }
        } catch (error) {
          console.error('Error checking verification status:', error);
          // If we can't check, redirect to verification to be safe
          navigate('/verify');
        }
      };

      checkVerificationStatus();
    }
  }, [token, user, isAuthenticated, navigate, location.pathname]);

  // If user is not authenticated and not on allowed pages, redirect to auth
  const allowedUnauthenticatedPaths = ['/auth', '/', '/upload', '/pricing'];
  if (!token && !isAuthenticated && !allowedUnauthenticatedPaths.includes(location.pathname)) {
    navigate('/auth');
    return null;
  }

  // Don't interfere with navigation to auth page
  if (location.pathname === '/auth') {
    return <>{children}</>;
  }

  // Temporary: Allow all navigation to auth-related routes
  if (location.pathname.includes('/auth')) {
    return <>{children}</>;
  }

  return <>{children}</>;
};

export default VerificationGuard;
