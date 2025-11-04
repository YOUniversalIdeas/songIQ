import React, { useState } from 'react';
import { UserPlus, UserMinus, Loader2 } from 'lucide-react';
import { API_BASE_URL } from '../config/api';
import { useAuth } from './AuthProvider';

interface FollowButtonProps {
  userId: string;
  initialFollowing: boolean;
  onFollowChange?: () => void;
  size?: 'sm' | 'md' | 'lg';
}

const FollowButton: React.FC<FollowButtonProps> = ({
  userId,
  initialFollowing,
  onFollowChange,
  size = 'md'
}) => {
  const { token, isAuthenticated } = useAuth();
  const [isFollowing, setIsFollowing] = useState(initialFollowing);
  const [loading, setLoading] = useState(false);

  const handleToggleFollow = async () => {
    if (!token || !isAuthenticated) {
      alert('Please sign in to follow users');
      return;
    }

    setLoading(true);

    try {
      const method = isFollowing ? 'DELETE' : 'POST';
      const response = await fetch(`${API_BASE_URL}/api/social/follow/${userId}`, {
        method,
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to update follow status');
      }

      setIsFollowing(!isFollowing);
      if (onFollowChange) {
        onFollowChange();
      }
    } catch (error: any) {
      console.error('Error toggling follow:', error);
      alert(error.message || 'Failed to update follow status');
    } finally {
      setLoading(false);
    }
  };

  const sizeClasses = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-base',
    lg: 'px-6 py-3 text-lg'
  };

  const iconSize = {
    sm: 'w-3 h-3',
    md: 'w-4 h-4',
    lg: 'w-5 h-5'
  };

  if (!isAuthenticated) {
    return null;
  }

  return (
    <button
      onClick={handleToggleFollow}
      disabled={loading}
      className={`flex items-center space-x-2 rounded-lg font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed ${
        isFollowing
          ? 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
          : 'bg-primary-600 text-white hover:bg-primary-700 shadow-md hover:shadow-lg'
      } ${sizeClasses[size]}`}
    >
      {loading ? (
        <Loader2 className={`${iconSize[size]} animate-spin`} />
      ) : isFollowing ? (
        <UserMinus className={iconSize[size]} />
      ) : (
        <UserPlus className={iconSize[size]} />
      )}
      <span>{loading ? 'Loading...' : isFollowing ? 'Unfollow' : 'Follow'}</span>
    </button>
  );
};

export default FollowButton;

