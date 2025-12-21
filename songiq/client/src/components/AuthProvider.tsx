import React, { createContext, useContext, useState, useEffect, useRef, ReactNode } from 'react';
import { getStoredToken, clearAuthStorage } from '../utils/auth';
// import { API_ENDPOINTS } from '../config/api';

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  bandName: string; // Artist/Band/Company Name
  username: string;
  telephone: string;
  profilePicture?: string;
  bio?: string;
  location?: string;
  website?: string;
  socialLinks?: {
    instagram?: string;
    twitter?: string;
    youtube?: string;
    spotify?: string;
  };
  role?: 'user' | 'artist' | 'producer' | 'label' | 'admin' | 'superadmin';
  spotifyToken?: string;
  subscription: {
    plan: 'free' | 'basic' | 'pro' | 'enterprise';
    status: 'active' | 'inactive' | 'cancelled' | 'canceled' | 'past_due' | 'unpaid' | 'trialing';
    startDate: string;
    endDate?: string;
    stripeCustomerId?: string;
    stripeSubscriptionId?: string;
    stripePriceId?: string;
    features: string[];
    usage?: {
      songsAnalyzed: number;
      currentPeriodStart: string;
      currentPeriodEnd: string;
    };
  };
  songLimit?: number;
  remainingSongs?: number;
  canAnalyzeSong?: boolean;
  profile: {
    bio?: string;
    location?: string;
    website?: string;
    socialLinks?: {
      instagram?: string;
      twitter?: string;
      youtube?: string;
      spotify?: string;
    };
  };
  stats: {
    totalSongs: number;
    totalStreams: number;
    averageScore: number;
    joinDate: string;
  };
  preferences: {
    notifications: {
      email: boolean;
      push: boolean;
      marketing: boolean;
    };
    theme: 'light' | 'dark' | 'auto';
    language: string;
  };
}

export interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

export interface AuthContextType extends AuthState {
  login: (email: string, password: string, rememberMe?: boolean) => Promise<void>;
  register: (userData: RegisterData) => Promise<void>;
  logout: () => void;
  updateProfile: (profileData: Partial<User>) => Promise<void>;
  markAsVerified: () => void;
  resetPassword: (email: string) => Promise<void>;
  changePassword: (currentPassword: string, newPassword: string) => Promise<void>;
  verifyEmail: (token: string) => Promise<void>;
  refreshToken: () => Promise<void>;
  refreshUserData: () => Promise<void>;
  updateSongCount: (newCount: number) => void;
  clearError: () => void;
}

export interface RegisterData {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  bandName: string; // Artist/Band/Company Name
  username: string;
  telephone: string;
}

// Create a default context value to prevent "useAuth must be used within an AuthProvider" errors
const defaultAuthContext: AuthContextType = {
  user: null,
  token: null,
  isAuthenticated: false,
  isLoading: true, // Start with loading true to prevent premature renders
  error: null,
  login: async () => {},
  register: async () => {},
  logout: () => {},
  updateProfile: async () => {},
  markAsVerified: () => {},
  resetPassword: async () => {},
  changePassword: async () => {},
  verifyEmail: async () => {},
  refreshToken: async () => {},
  refreshUserData: async () => {},
  updateSongCount: () => {},
  clearError: () => {},
};

const AuthContext = createContext<AuthContextType>(defaultAuthContext);


  // Use relative URLs to go through Vite proxy
  const API_ENDPOINTS = {
    AUTH: {
      LOGIN: `/api/auth/login`,
      REGISTER: `/api/auth/register`,
      PROFILE: `/api/auth/profile`,
      LOGOUT: `/api/auth/logout`,
    },
    SONGS: {
      UPLOAD: `/api/songs/upload`,
      SONG: `/api/songs/upload`,
      LIST: `/api/songs`,
      ANALYSIS: `/api/analysis`,
      GET_BY_ID: (id: string) => `/api/songs/${id}`,
    },
    UPLOAD: {
      SONG: `/api/songs/upload`,
      LYRICS: `/api/lyrics/upload`,
    },
    ANALYSIS: {
      START: (songId: string) => `/api/analysis/start/${songId}`,
      STATUS: (songId: string) => `/api/analysis/status/${songId}`,
      RESULTS: (songId: string) => `/api/analysis/results/${songId}`,
      PROGRESS: (songId: string) => `/api/analysis/progress/${songId}`,
    },
  };
interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    token: null,
    isAuthenticated: false,
    isLoading: true,
    error: null,
  });

  // Initialize auth state from localStorage or sessionStorage
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        // Get token from appropriate storage location
        const token = getStoredToken();
        const rememberMe = localStorage.getItem('songiq_remember_me') === 'true';
        
        if (token) {
          // Set loading state while verifying token
          setAuthState(prev => ({
            ...prev,
            isLoading: true,
            isAuthenticated: false, // Don't assume authenticated until verified
          }));

          // Verify existing token with backend using profile endpoint
          const response = await fetch(`${API_ENDPOINTS.AUTH.PROFILE}`, {
            method: 'GET',
            headers: {
              'Authorization': `Bearer ${token}`,
            },
          });

          if (response.ok) {
            const responseData = await response.json();
            
            // Extract the user object from the response
            const user = responseData.user || responseData;
            setAuthState({
              user,
              token,
              isAuthenticated: true,
              isLoading: false,
              error: null,
            });
          } else {
            // Token is invalid, remove it
            localStorage.removeItem('songiq_token');
            sessionStorage.removeItem('songiq_token');
            localStorage.removeItem('songiq_remember_me');
            setAuthState({
              user: null,
              token: null,
              isAuthenticated: false,
              isLoading: false,
              error: null,
            });
          }
        } else {
          setAuthState({
            user: null,
            token: null,
            isAuthenticated: false,
            isLoading: false,
            error: null,
          });
        }
      } catch (error) {
        console.error('Auth initialization error:', error);
        localStorage.removeItem('songiq_token');
        sessionStorage.removeItem('songiq_token');
        localStorage.removeItem('songiq_remember_me');
        setAuthState({
          user: null,
          token: null,
          isAuthenticated: false,
          isLoading: false,
          error: null,
        });
      }
    };

    initializeAuth();
  }, []);



  const login = async (email: string, password: string, rememberMe: boolean = false): Promise<void> => {
    try {
      setAuthState(prev => ({ ...prev, isLoading: true, error: null }));
      
      // Real API call to backend
      const response = await fetch(`${API_ENDPOINTS.AUTH.LOGIN}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password, rememberMe }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Login failed');
      }

      const data = await response.json();
      const { token, user } = data;

      if (!token) {
        throw new Error('No token received from server');
      }

      console.log('✅ Login successful, storing token...');
      console.log('Token length:', token.length);
      console.log('Remember me:', rememberMe);

      // Store token based on remember me choice
      if (rememberMe) {
        // Store in localStorage for persistent login (longer expiration)
        localStorage.setItem('songiq_token', token);
        localStorage.setItem('songiq_remember_me', 'true');
        sessionStorage.removeItem('songiq_token'); // Clear session storage
        console.log('✅ Token stored in localStorage');
      } else {
        // Store in sessionStorage for session-only login (shorter expiration)
        sessionStorage.setItem('songiq_token', token);
        localStorage.removeItem('songiq_token');
        localStorage.removeItem('songiq_remember_me');
        console.log('✅ Token stored in sessionStorage');
      }
      
      // Verify token was stored
      const storedToken = rememberMe 
        ? localStorage.getItem('songiq_token')
        : sessionStorage.getItem('songiq_token');
      console.log('✅ Token verification - stored:', !!storedToken, 'length:', storedToken?.length || 0);
      
      setAuthState({
        user,
        token,
        isAuthenticated: true,
        isLoading: false,
        error: null,
      });
    } catch (error) {
      setAuthState(prev => ({
        ...prev,
        isLoading: false,
        error: error instanceof Error ? error.message : 'Login failed',
      }));
    }
  };

  const register = async (userData: RegisterData): Promise<void> => {
    try {
      setAuthState(prev => ({ ...prev, isLoading: true, error: null }));
      
      // Real API call to backend
      const response = await fetch(`${API_ENDPOINTS.AUTH.REGISTER}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(userData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Registration failed');
      }

      const data = await response.json();
      const { token, user } = data;
      
      // Store token but don't mark as fully authenticated until verification
      localStorage.setItem('songiq_token', token);
      
      setAuthState({
        user,
        token,
        isAuthenticated: false, // Keep as false until verification
        isLoading: false,
        error: null,
      });
    } catch (error) {
      setAuthState(prev => ({
        ...prev,
        isLoading: false,
        error: error instanceof Error ? error.message : 'Registration failed',
      }));
    }
  };

  const logout = (): void => {
    // Clear all auth-related storage
    clearAuthStorage();
    setAuthState({
      user: null,
      token: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,
    });
  };

  const updateProfile = async (profileData: Partial<User>): Promise<void> => {
    try {
      setAuthState(prev => ({ ...prev, isLoading: true, error: null }));
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 800));
      
      if (authState.user) {
        const updatedUser = { ...authState.user, ...profileData };
        setAuthState(prev => ({
          ...prev,
          user: updatedUser,
          isLoading: false,
        }));
      }
    } catch (error) {
      setAuthState(prev => ({
        ...prev,
        isLoading: false,
        error: error instanceof Error ? error.message : 'Profile update failed',
      }));
    }
  };

  const markAsVerified = (): void => {
    setAuthState(prev => ({
      ...prev,
      isAuthenticated: true,
    }));
  };

  const resetPassword = async (_email: string): Promise<void> => {
    try {
      setAuthState(prev => ({ ...prev, isLoading: true, error: null }));
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setAuthState(prev => ({ ...prev, isLoading: false }));
      // In a real app, you would show a success message
    } catch (error) {
      setAuthState(prev => ({
        ...prev,
        isLoading: false,
        error: error instanceof Error ? error.message : 'Password reset failed',
      }));
    }
  };

  const changePassword = async (_currentPassword: string, _newPassword: string): Promise<void> => {
    try {
      setAuthState(prev => ({ ...prev, isLoading: true, error: null }));
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setAuthState(prev => ({ ...prev, isLoading: false }));
      // In a real app, you would show a success message
    } catch (error) {
      setAuthState(prev => ({
        ...prev,
        isLoading: false,
        error: error instanceof Error ? error.message : 'Password change failed',
      }));
    }
  };

  const verifyEmail = async (_token: string): Promise<void> => {
    try {
      setAuthState(prev => ({ ...prev, isLoading: true, error: null }));
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 800));
      
      setAuthState(prev => ({ ...prev, isLoading: false }));
      // In a real app, you would update the user's email verification status
    } catch (error) {
      setAuthState(prev => ({
        ...prev,
        isLoading: false,
        error: error instanceof Error ? error.message : 'Email verification failed',
      }));
    }
  };

  const refreshToken = async (): Promise<void> => {
    try {
      if (!authState.token) return;
      
      // For now, just return without doing anything
      // Real token refresh would require server-side implementation
      return;
    } catch (error) {
      console.error('Token refresh failed:', error);
      logout();
    }
  };

  // Add rate limiting for refreshUserData
  const refreshUserDataRef = useRef<NodeJS.Timeout | null>(null);
  const lastRefreshTime = useRef<number>(0);
  const REFRESH_COOLDOWN = 5000; // 5 seconds cooldown

  const refreshUserData = async (): Promise<void> => {
    try {
      // Get token from appropriate storage location
      const token = getStoredToken();
      if (!token) {
        return;
      }

      // Check if we're in cooldown period
      const now = Date.now();
      if (now - lastRefreshTime.current < REFRESH_COOLDOWN) {
        return;
      }

      // Clear any existing timeout
      if (refreshUserDataRef.current) {
        clearTimeout(refreshUserDataRef.current);
      }

      // Debounce the call
      refreshUserDataRef.current = setTimeout(async () => {
        try {
          lastRefreshTime.current = Date.now();
          
          const response = await fetch(`${API_ENDPOINTS.AUTH.PROFILE}`, {
            method: 'GET',
            headers: {
              'Authorization': `Bearer ${token}`,
            },
          });

          if (response.ok) {
            const responseData = await response.json();
            // Extract the user object from the response
            const user = responseData.user || responseData;
            setAuthState(prev => ({
              ...prev,
              user,
            }));
          } else {
            if (response.status === 401) {
              // Don't logout on 401 during refresh - this could be a temporary server issue
              // Only logout if the token is actually invalid (handled in main auth flow)
            } else if (response.status === 429) {
              // Don't logout on rate limit, just log it
            }
            // Don't logout on profile API failures - just log the error
            // The user might still be authenticated, just the profile data couldn't be refreshed
          }
        } catch (error) {
          console.error('Failed to refresh user data:', error);
          // Don't logout on network errors - just log the error
        }
      }, 1000); // 1 second debounce
    } catch (error) {
      console.error('Error in refreshUserData:', error);
    }
  };

  const clearError = (): void => {
    setAuthState(prev => ({ ...prev, error: null }));
  };


  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (refreshUserDataRef.current) {
        clearTimeout(refreshUserDataRef.current);
      }
    };
  }, []);

  const updateSongCount = (newCount: number): void => {
    setAuthState(prev => {
      if (prev.user && prev.user.subscription && prev.user.subscription.usage) {
        return {
          ...prev,
          user: {
            ...prev.user,
            subscription: {
              ...prev.user.subscription,
              usage: {
                ...prev.user.subscription.usage,
                songsAnalyzed: newCount
              }
            }
          }
        };
      }
      return prev;
    });
  };

  const value: AuthContextType = {
    ...authState,
    login,
    register,
    logout,
    updateProfile,
    markAsVerified,
    resetPassword,
    changePassword,
    verifyEmail,
    refreshToken,
    refreshUserData,
    updateSongCount,
    clearError,
  };



  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  return context;
}; 