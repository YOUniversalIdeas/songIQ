import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
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
    tier: 'free' | 'pro' | 'enterprise';
    status: 'active' | 'inactive' | 'cancelled';
    expiresAt: string;
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
  login: (email: string, password: string) => Promise<void>;
  register: (userData: RegisterData) => Promise<void>;
  logout: () => void;
  updateProfile: (profileData: Partial<User>) => Promise<void>;
  markAsVerified: () => void;
  resetPassword: (email: string) => Promise<void>;
  changePassword: (currentPassword: string, newPassword: string) => Promise<void>;
  verifyEmail: (token: string) => Promise<void>;
  refreshToken: () => Promise<void>;
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

const AuthContext = createContext<AuthContextType | undefined>(undefined);
  // TODO: Fix import issue with API_ENDPOINTS
  const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5001";
  const API_ENDPOINTS = {
    AUTH: {
      LOGIN: `${API_BASE_URL}/api/auth/login`,
      REGISTER: `${API_BASE_URL}/api/auth/register`,
      PROFILE: `${API_BASE_URL}/api/auth/profile`,
      LOGOUT: `${API_BASE_URL}/api/auth/logout`,
    },
    SONGS: {
      UPLOAD: `${API_BASE_URL}/api/songs/upload`,
      SONG: `${API_BASE_URL}/api/songs/upload`,
      LIST: `${API_BASE_URL}/api/songs`,
      ANALYSIS: `${API_BASE_URL}/api/analysis`,
      GET_BY_ID: (id: string) => `${API_BASE_URL}/api/songs/${id}`,
    },
    UPLOAD: {
      SONG: `${API_BASE_URL}/api/songs/upload`,
      LYRICS: `${API_BASE_URL}/api/lyrics/upload`,
    },
    ANALYSIS: {
      START: (songId: string) => `${API_BASE_URL}/api/analysis/start/${songId}`,
      STATUS: (songId: string) => `${API_BASE_URL}/api/analysis/status/${songId}`,
      RESULTS: (songId: string) => `${API_BASE_URL}/api/analysis/results/${songId}`,
      PROGRESS: (songId: string) => `${API_BASE_URL}/api/analysis/progress/${songId}`,
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

  // Initialize auth state from localStorage
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        const token = localStorage.getItem('songiq_token');
        
        if (token) {
          // Verify existing token with backend using profile endpoint
          const response = await fetch(`${API_ENDPOINTS.AUTH.PROFILE}`, {
            method: 'GET',
            headers: {
              'Authorization': `Bearer ${token}`,
            },
          });

          if (response.ok) {
            const user = await response.json();
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



  const login = async (email: string, password: string): Promise<void> => {
    try {
      setAuthState(prev => ({ ...prev, isLoading: true, error: null }));
      
      // Real API call to backend
      const response = await fetch(`${API_ENDPOINTS.AUTH.LOGIN}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Login failed');
      }

      const data = await response.json();
      const { token, user } = data;

      localStorage.setItem('songiq_token', token);
      
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
    localStorage.removeItem('songiq_token');
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
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500));
      
      const newToken = 'mock_jwt_token_' + Date.now();
      localStorage.setItem('songiq_token', newToken);
      
      setAuthState(prev => ({
        ...prev,
        token: newToken,
      }));
    } catch (error) {
      console.error('Token refresh failed:', error);
      logout();
    }
  };

  const clearError = (): void => {
    setAuthState(prev => ({ ...prev, error: null }));
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
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}; 