import React, { useState, useEffect } from 'react';
import { MessageCircle, ThumbsUp, Reply, Edit, Trash2, Send, AlertCircle } from 'lucide-react';
import { API_BASE_URL } from '../config/api';
import { useAuth } from './AuthProvider';

interface Comment {
  _id: string;
  marketId: string;
  userId: {
    _id: string;
    firstName?: string;
    lastName?: string;
    username?: string;
    email: string;
  };
  content: string;
  parentCommentId?: string;
  likes: number;
  likedBy: string[];
  isEdited: boolean;
  createdAt: string;
  replyCount?: number;
}

interface MarketCommentsProps {
  marketId: string;
}

const MarketComments: React.FC<MarketCommentsProps> = ({ marketId }) => {
  const { user, token, isAuthenticated } = useAuth();
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const [newComment, setNewComment] = useState('');
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [replyContent, setReplyContent] = useState('');
  const [editingComment, setEditingComment] = useState<string | null>(null);
  const [editContent, setEditContent] = useState('');
  const [expandedReplies, setExpandedReplies] = useState<Set<string>>(new Set());
  const [replies, setReplies] = useState<{ [key: string]: Comment[] }>({});
  const [sortBy, setSortBy] = useState<'recent' | 'popular'>('recent');

  useEffect(() => {
    fetchComments();
  }, [marketId, sortBy]);

  const fetchComments = async () => {
    try {
      setLoading(true);
      const response = await fetch(
        `${API_BASE_URL}/api/markets/${marketId}/comments?sort=${sortBy}&limit=100`
      );
      
      if (!response.ok) throw new Error('Failed to fetch comments');
      
      const data = await response.json();
      setComments(data.comments || []);
    } catch (error) {
      console.error('Error fetching comments:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchReplies = async (commentId: string) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/comments/${commentId}/replies`);
      
      if (!response.ok) throw new Error('Failed to fetch replies');
      
      const data = await response.json();
      setReplies(prev => ({ ...prev, [commentId]: data.replies || [] }));
    } catch (error) {
      console.error('Error fetching replies:', error);
    }
  };

  const handlePostComment = async () => {
    if (!token || !newComment.trim()) return;

    try {
      const response = await fetch(`${API_BASE_URL}/api/markets/${marketId}/comments`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ content: newComment }),
      });

      if (!response.ok) throw new Error('Failed to post comment');

      setNewComment('');
      await fetchComments();
    } catch (error) {
      console.error('Error posting comment:', error);
    }
  };

  const handlePostReply = async (parentId: string) => {
    if (!token || !replyContent.trim()) return;

    try {
      const response = await fetch(`${API_BASE_URL}/api/markets/${marketId}/comments`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ content: replyContent, parentCommentId: parentId }),
      });

      if (!response.ok) throw new Error('Failed to post reply');

      setReplyingTo(null);
      setReplyContent('');
      await fetchReplies(parentId);
      await fetchComments(); // Refresh to update reply count
    } catch (error) {
      console.error('Error posting reply:', error);
    }
  };

  const handleEditComment = async (commentId: string) => {
    if (!token || !editContent.trim()) return;

    try {
      const response = await fetch(`${API_BASE_URL}/api/comments/${commentId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ content: editContent }),
      });

      if (!response.ok) throw new Error('Failed to edit comment');

      setEditingComment(null);
      setEditContent('');
      await fetchComments();
    } catch (error) {
      console.error('Error editing comment:', error);
    }
  };

  const handleDeleteComment = async (commentId: string) => {
    if (!token || !window.confirm('Are you sure you want to delete this comment?')) return;

    try {
      const response = await fetch(`${API_BASE_URL}/api/comments/${commentId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!response.ok) throw new Error('Failed to delete comment');

      await fetchComments();
    } catch (error) {
      console.error('Error deleting comment:', error);
    }
  };

  const handleLikeComment = async (commentId: string) => {
    if (!token) return;

    try {
      const response = await fetch(`${API_BASE_URL}/api/comments/${commentId}/like`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!response.ok) throw new Error('Failed to like comment');

      await fetchComments();
      // Also update in replies if needed
      Object.keys(replies).forEach(async (parentId) => {
        const hasReply = replies[parentId].some(r => r._id === commentId);
        if (hasReply) {
          await fetchReplies(parentId);
        }
      });
    } catch (error) {
      console.error('Error liking comment:', error);
    }
  };

  const toggleReplies = (commentId: string) => {
    const newExpanded = new Set(expandedReplies);
    if (newExpanded.has(commentId)) {
      newExpanded.delete(commentId);
    } else {
      newExpanded.add(commentId);
      if (!replies[commentId]) {
        fetchReplies(commentId);
      }
    }
    setExpandedReplies(newExpanded);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString();
  };

  const getUserDisplayName = (comment: Comment) => {
    if (comment.userId.firstName || comment.userId.lastName) {
      return `${comment.userId.firstName || ''} ${comment.userId.lastName || ''}`.trim();
    }
    return comment.userId.username || comment.userId.email.split('@')[0];
  };

  const renderComment = (comment: Comment, isReply: boolean = false) => {
    const isOwner = user?.id === comment.userId._id;
    const hasLiked = comment.likedBy?.includes(user?.id || '');
    const isEditing = editingComment === comment._id;

    return (
      <div key={comment._id} className={`${isReply ? 'ml-12' : ''}`}>
        <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
          <div className="flex items-start space-x-3">
            {/* Avatar */}
            <div className="flex-shrink-0">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-semibold">
                {getUserDisplayName(comment).charAt(0).toUpperCase()}
              </div>
            </div>

            {/* Comment Content */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <span className="font-medium text-gray-900 dark:text-white">
                    {getUserDisplayName(comment)}
                  </span>
                  <span className="text-xs text-gray-500 dark:text-gray-400">
                    {formatDate(comment.createdAt)}
                  </span>
                  {comment.isEdited && (
                    <span className="text-xs text-gray-400 italic">(edited)</span>
                  )}
                </div>
                
                {isOwner && !isReply && (
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => {
                        setEditingComment(comment._id);
                        setEditContent(comment.content);
                      }}
                      className="text-gray-500 hover:text-blue-600 dark:text-gray-400 dark:hover:text-blue-400"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDeleteComment(comment._id)}
                      className="text-gray-500 hover:text-red-600 dark:text-gray-400 dark:hover:text-red-400"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                )}
              </div>

              {isEditing ? (
                <div className="mt-2 space-y-2">
                  <textarea
                    value={editContent}
                    onChange={(e) => setEditContent(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 dark:bg-gray-700 dark:text-white"
                    rows={3}
                  />
                  <div className="flex space-x-2">
                    <button
                      onClick={() => handleEditComment(comment._id)}
                      className="px-3 py-1 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm"
                    >
                      Save
                    </button>
                    <button
                      onClick={() => {
                        setEditingComment(null);
                        setEditContent('');
                      }}
                      className="px-3 py-1 bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-500 text-sm"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  <p className="mt-1 text-gray-700 dark:text-gray-300 whitespace-pre-wrap break-words">
                    {comment.content}
                  </p>

                  {/* Actions */}
                  <div className="mt-3 flex items-center space-x-4 text-sm">
                    <button
                      onClick={() => handleLikeComment(comment._id)}
                      disabled={!isAuthenticated}
                      className={`flex items-center space-x-1 ${
                        hasLiked
                          ? 'text-blue-600 dark:text-blue-400'
                          : 'text-gray-500 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400'
                      } disabled:opacity-50 disabled:cursor-not-allowed transition-colors`}
                    >
                      <ThumbsUp className={`w-4 h-4 ${hasLiked ? 'fill-current' : ''}`} />
                      <span>{comment.likes > 0 ? comment.likes : ''}</span>
                    </button>

                    {!isReply && isAuthenticated && (
                      <button
                        onClick={() => setReplyingTo(comment._id)}
                        className="flex items-center space-x-1 text-gray-500 dark:text-gray-400 hover:text-primary-600 dark:hover:text-primary-400 transition-colors"
                      >
                        <Reply className="w-4 h-4" />
                        <span>Reply</span>
                      </button>
                    )}

                    {!isReply && (comment.replyCount || 0) > 0 && (
                      <button
                        onClick={() => toggleReplies(comment._id)}
                        className="flex items-center space-x-1 text-gray-500 dark:text-gray-400 hover:text-primary-600 dark:hover:text-primary-400 transition-colors"
                      >
                        <MessageCircle className="w-4 h-4" />
                        <span>
                          {expandedReplies.has(comment._id) ? 'Hide' : 'Show'} {comment.replyCount}{' '}
                          {comment.replyCount === 1 ? 'reply' : 'replies'}
                        </span>
                      </button>
                    )}
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Reply Form */}
          {replyingTo === comment._id && (
            <div className="mt-4 ml-12">
              <div className="flex space-x-2">
                <textarea
                  value={replyContent}
                  onChange={(e) => setReplyContent(e.target.value)}
                  placeholder="Write a reply..."
                  className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 dark:bg-gray-700 dark:text-white resize-none"
                  rows={2}
                />
                <div className="flex flex-col space-y-2">
                  <button
                    onClick={() => handlePostReply(comment._id)}
                    disabled={!replyContent.trim()}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Send className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => {
                      setReplyingTo(null);
                      setReplyContent('');
                    }}
                    className="px-4 py-2 bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-500"
                  >
                    ×
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Replies */}
        {expandedReplies.has(comment._id) && replies[comment._id] && (
          <div className="mt-3 space-y-3">
            {replies[comment._id].map(reply => renderComment(reply, true))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center">
          <MessageCircle className="w-5 h-5 mr-2" />
          Discussion ({comments.length})
        </h3>
        <div className="flex space-x-2">
          <button
            onClick={() => setSortBy('recent')}
            className={`px-3 py-1 rounded-lg text-sm ${
              sortBy === 'recent'
                ? 'bg-primary-600 text-white'
                : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
            }`}
          >
            Recent
          </button>
          <button
            onClick={() => setSortBy('popular')}
            className={`px-3 py-1 rounded-lg text-sm ${
              sortBy === 'popular'
                ? 'bg-primary-600 text-white'
                : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
            }`}
          >
            Popular
          </button>
        </div>
      </div>

      {/* New Comment Form */}
      {isAuthenticated ? (
        <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
          <div className="flex space-x-3">
            <div className="flex-shrink-0">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-semibold">
                {user?.firstName?.charAt(0).toUpperCase() || user?.email?.charAt(0).toUpperCase()}
              </div>
            </div>
            <div className="flex-1">
              <textarea
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder="Share your thoughts on this market..."
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-700 dark:text-white resize-none"
                rows={3}
                maxLength={2000}
              />
              <div className="flex items-center justify-between mt-2">
                <span className="text-xs text-gray-500 dark:text-gray-400">
                  {newComment.length}/2000
                </span>
                <button
                  onClick={handlePostComment}
                  disabled={!newComment.trim()}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center space-x-2"
                >
                  <Send className="w-4 h-4" />
                  <span>Post Comment</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
          <p className="text-sm text-blue-800 dark:text-blue-200">
            Please <a href="/auth?mode=login" className="underline font-medium">sign in</a> to join the discussion
          </p>
        </div>
      )}

      {/* Comments List */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
        </div>
      ) : comments.length > 0 ? (
        <div className="space-y-4">
          {comments.map(comment => renderComment(comment))}
        </div>
      ) : (
        <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
          <MessageCircle className="w-12 h-12 text-gray-400 mx-auto mb-3" />
          <p className="text-gray-500 dark:text-gray-400">No comments yet</p>
          <p className="text-sm text-gray-400 dark:text-gray-500 mt-1">Be the first to share your thoughts!</p>
        </div>
      )}
    </div>
  );
};

export default MarketComments;

