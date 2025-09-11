import React, { useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from './AuthProvider';

interface VerificationGuardProps {
  children: React.ReactNode;
}

const VerificationGuard: React.FC<VerificationGuardProps> = ({ children }) => {
  const { user, token, isAuthenticated, markAsVerified } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const hasCheckedVerification = useRef(false);

  useEffect(() => {
    // Only run verification check if we're not on auth or verify pages
    if (location.pathname === '/auth' || location.pathname === '/verify') {
      return;
    }

    // Prevent multiple verification checks
    if (hasCheckedVerification.current) {
      return;
    }

    // If user has a token but is not authenticated, they need verification
    // But be more lenient - only redirect if we're sure they need verification
    if (token && user && !isAuthenticated && location.pathname !== '/verify') {
      console.log('🔍 Running verification check...');
      hasCheckedVerification.current = true;
      
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
              console.log('User not verified, redirecting to verification');
              navigate('/verify', { replace: true });
            } else {
              // User is verified, mark as authenticated
              console.log('User is verified, marking as authenticated');
              markAsVerified();
            }
          } else {
            console.log('Verification check failed, but not redirecting to avoid logout');
            // Don't redirect on API failure to avoid logout issues
          }
        } catch (error) {
          console.error('Error checking verification status:', error);
          // Don't redirect on network errors to avoid logout issues
          console.log('Verification check error, but not redirecting to avoid logout');
        }
      };

      checkVerificationStatus();
    }
  }, [token, user, isAuthenticated, navigate, location.pathname]);

  // Handle unauthenticated user redirects
  useEffect(() => {
    const allowedUnauthenticatedPaths = ['/auth', '/', '/upload', '/pricing', '/privacy', '/terms'];
    if (!token && !isAuthenticated && !allowedUnauthenticatedPaths.includes(location.pathname)) {
      // Use replace to avoid adding to history stack
      navigate('/auth', { replace: true });
    }
  }, [token, isAuthenticated, navigate, location.pathname]);

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
