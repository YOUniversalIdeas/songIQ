import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export interface User {
  id: string;
  email: string;
  username: string;
  firstName: string;
  lastName: string;
  avatar?: string;
  role?: 'user' | 'artist' | 'producer' | 'label' | 'admin';
  subscription: {
    tier: 'free' | 'pro' | 'enterprise';
    status: 'active' | 'inactive' | 'cancelled';
    expiresAt: string;
    features: string[];
  };
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
  resetPassword: (email: string) => Promise<void>;
  changePassword: (currentPassword: string, newPassword: string) => Promise<void>;
  verifyEmail: (token: string) => Promise<void>;
  refreshToken: () => Promise<void>;
  clearError: () => void;
}

export interface RegisterData {
  email: string;
  password: string;
  username: string;
  firstName: string;
  lastName: string;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

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
          // Verify token and get user data
          const user = await verifyToken(token);
          setAuthState({
            user,
            token,
            isAuthenticated: true,
            isLoading: false,
            error: null,
          });
        } else {
          setAuthState(prev => ({ ...prev, isLoading: false }));
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

  // Simulate API calls
  const verifyToken = async (_token: string): Promise<User> => {
    // Simulate API call to verify token
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // Return mock user data
    return {
      id: 'user-123',
      email: 'demo@example.com',
      username: 'demoartist',
      firstName: 'Demo',
      lastName: 'Artist',
      avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face',
      role: 'admin',
      subscription: {
        tier: 'enterprise',
        status: 'active',
        expiresAt: '2024-12-31T23:59:59Z',
        features: ['unlimited_uploads', 'advanced_analytics', 'ai_recommendations', 'priority_support', 'admin_access']
      },
      profile: {
        bio: 'Independent artist passionate about creating meaningful music',
        location: 'Los Angeles, CA',
        website: 'https://demoartist.com',
        socialLinks: {
          instagram: '@demoartist',
          twitter: '@demoartist',
          youtube: 'DemoArtist',
          spotify: 'Demo Artist'
        }
      },
      stats: {
        totalSongs: 15,
        totalStreams: 125000,
        averageScore: 78.5,
        joinDate: '2024-01-15T00:00:00Z'
      },
      preferences: {
        notifications: {
          email: true,
          push: true,
          marketing: false
        },
        theme: 'auto',
        language: 'en'
      }
    };
  };

  const login = async (email: string, password: string): Promise<void> => {
    try {
      setAuthState(prev => ({ ...prev, isLoading: true, error: null }));
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Mock authentication
      if (email === 'demo@example.com' && password === 'password') {
        const token = 'mock_jwt_token_' + Date.now();
        const user = await verifyToken(token);
        
        localStorage.setItem('songiq_token', token);
        
        setAuthState({
          user,
          token,
          isAuthenticated: true,
          isLoading: false,
          error: null,
        });
      } else {
        throw new Error('Invalid email or password');
      }
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
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Mock registration
      const token = 'mock_jwt_token_' + Date.now();
      const user: User = {
        id: 'user-' + Date.now(),
        email: userData.email,
        username: userData.username,
        firstName: userData.firstName,
        lastName: userData.lastName,
        subscription: {
          tier: 'free',
          status: 'active',
          expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
          features: ['basic_uploads', 'basic_analytics']
        },
        profile: {},
        stats: {
          totalSongs: 0,
          totalStreams: 0,
          averageScore: 0,
          joinDate: new Date().toISOString()
        },
        preferences: {
          notifications: {
            email: true,
            push: true,
            marketing: false
          },
          theme: 'auto',
          language: 'en'
        }
      };
      
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