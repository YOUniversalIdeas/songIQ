import express from 'express';
import Comment from '../models/Comment';
import Market from '../models/Market';
import { authenticateToken } from '../middleware/auth';

const router = express.Router();

// GET /api/markets/:marketId/comments - Get all comments for a market
router.get('/markets/:marketId/comments', async (req, res) => {
  try {
    const { marketId } = req.params;
    const { limit = 50, skip = 0, sort = 'recent' } = req.query;

    // Verify market exists
    const market = await Market.findById(marketId);
    if (!market) {
      return res.status(404).json({ error: 'Market not found' });
    }

    // Build sort options
    const sortOptions: any = {};
    if (sort === 'recent') {
      sortOptions.createdAt = -1;
    } else if (sort === 'popular') {
      sortOptions.likes = -1;
      sortOptions.createdAt = -1;
    }

    // Get top-level comments (no parent)
    const comments = await Comment.find({ 
      marketId, 
      parentCommentId: null 
    })
      .populate('userId', 'firstName lastName username email')
      .sort(sortOptions)
      .limit(Number(limit))
      .skip(Number(skip));

    // Get reply counts for each comment
    const commentsWithReplies = await Promise.all(
      comments.map(async (comment) => {
        const replyCount = await Comment.countDocuments({ 
          parentCommentId: comment._id,
          isDeleted: false
        });
        return {
          ...comment.toObject(),
          replyCount
        };
      })
    );

    const total = await Comment.countDocuments({ 
      marketId, 
      parentCommentId: null,
      isDeleted: false 
    });

    res.json({
      comments: commentsWithReplies,
      total,
      hasMore: Number(skip) + comments.length < total
    });
  } catch (error) {
    console.error('Error fetching comments:', error);
    res.status(500).json({ error: 'Failed to fetch comments' });
  }
});

// GET /api/comments/:commentId/replies - Get replies to a comment
router.get('/comments/:commentId/replies', async (req, res) => {
  try {
    const { commentId } = req.params;
    const { limit = 20, skip = 0 } = req.query;

    const replies = await Comment.find({ 
      parentCommentId: commentId 
    })
      .populate('userId', 'firstName lastName username email')
      .sort({ createdAt: 1 }) // Oldest first for replies
      .limit(Number(limit))
      .skip(Number(skip));

    const total = await Comment.countDocuments({ 
      parentCommentId: commentId,
      isDeleted: false 
    });

    res.json({
      replies,
      total,
      hasMore: Number(skip) + replies.length < total
    });
  } catch (error) {
    console.error('Error fetching replies:', error);
    res.status(500).json({ error: 'Failed to fetch replies' });
  }
});

// POST /api/markets/:marketId/comments - Create a comment
router.post('/markets/:marketId/comments', authenticateToken, async (req, res) => {
  try {
    const { marketId } = req.params;
    const { content, parentCommentId } = req.body;
    const userId = req.user!.id;

    if (!content || content.trim().length === 0) {
      return res.status(400).json({ error: 'Comment content is required' });
    }

    if (content.length > 2000) {
      return res.status(400).json({ error: 'Comment is too long (max 2000 characters)' });
    }

    // Verify market exists
    const market = await Market.findById(marketId);
    if (!market) {
      return res.status(404).json({ error: 'Market not found' });
    }

    // If replying, verify parent comment exists
    if (parentCommentId) {
      const parentComment = await Comment.findById(parentCommentId);
      if (!parentComment) {
        return res.status(404).json({ error: 'Parent comment not found' });
      }
      if (parentComment.marketId.toString() !== marketId) {
        return res.status(400).json({ error: 'Parent comment belongs to different market' });
      }
    }

    const comment = new Comment({
      marketId,
      userId,
      content: content.trim(),
      parentCommentId: parentCommentId || null
    });

    await comment.save();
    await comment.populate('userId', 'firstName lastName username email');

    res.status(201).json({ 
      comment,
      message: 'Comment created successfully'
    });
  } catch (error) {
    console.error('Error creating comment:', error);
    res.status(500).json({ error: 'Failed to create comment' });
  }
});

// PATCH /api/comments/:commentId - Edit a comment
router.patch('/comments/:commentId', authenticateToken, async (req, res) => {
  try {
    const { commentId } = req.params;
    const { content } = req.body;
    const userId = req.user!.id;

    if (!content || content.trim().length === 0) {
      return res.status(400).json({ error: 'Comment content is required' });
    }

    if (content.length > 2000) {
      return res.status(400).json({ error: 'Comment is too long (max 2000 characters)' });
    }

    const comment = await Comment.findById(commentId);
    if (!comment) {
      return res.status(404).json({ error: 'Comment not found' });
    }

    // Only the comment author can edit
    if (comment.userId.toString() !== userId) {
      return res.status(403).json({ error: 'You can only edit your own comments' });
    }

    comment.content = content.trim();
    comment.isEdited = true;
    await comment.save();
    await comment.populate('userId', 'firstName lastName username email');

    res.json({ 
      comment,
      message: 'Comment updated successfully'
    });
  } catch (error) {
    console.error('Error updating comment:', error);
    res.status(500).json({ error: 'Failed to update comment' });
  }
});

// DELETE /api/comments/:commentId - Delete a comment
router.delete('/comments/:commentId', authenticateToken, async (req, res) => {
  try {
    const { commentId } = req.params;
    const userId = req.user!.id;

    const comment = await Comment.findById(commentId);
    if (!comment) {
      return res.status(404).json({ error: 'Comment not found' });
    }

    // Only the comment author or admin can delete
    const user = req.user!;
    const isOwner = comment.userId.toString() === userId;
    const isAdmin = user.role === 'admin' || user.role === 'superadmin';

    if (!isOwner && !isAdmin) {
      return res.status(403).json({ error: 'You can only delete your own comments' });
    }

    // Soft delete
    comment.isDeleted = true;
    comment.deletedAt = new Date();
    comment.content = '[deleted]';
    await comment.save();

    res.json({ message: 'Comment deleted successfully' });
  } catch (error) {
    console.error('Error deleting comment:', error);
    res.status(500).json({ error: 'Failed to delete comment' });
  }
});

// POST /api/comments/:commentId/like - Like/unlike a comment
router.post('/comments/:commentId/like', authenticateToken, async (req, res) => {
  try {
    const { commentId } = req.params;
    const userId = req.user!.id;

    const comment = await Comment.findById(commentId);
    if (!comment) {
      return res.status(404).json({ error: 'Comment not found' });
    }

    const userIdObj = new mongoose.Types.ObjectId(userId);
    const hasLiked = comment.likedBy.some(id => id.equals(userIdObj));

    if (hasLiked) {
      // Unlike
      comment.likedBy = comment.likedBy.filter(id => !id.equals(userIdObj));
      comment.likes = Math.max(0, comment.likes - 1);
    } else {
      // Like
      comment.likedBy.push(userIdObj);
      comment.likes += 1;
    }

    await comment.save();

    res.json({ 
      likes: comment.likes,
      hasLiked: !hasLiked,
      message: hasLiked ? 'Comment unliked' : 'Comment liked'
    });
  } catch (error) {
    console.error('Error liking comment:', error);
    res.status(500).json({ error: 'Failed to like comment' });
  }
});

// GET /api/users/:userId/comments - Get user's comments
router.get('/users/:userId/comments', async (req, res) => {
  try {
    const { userId } = req.params;
    const { limit = 20, skip = 0 } = req.query;

    const comments = await Comment.find({ userId })
      .populate('marketId', 'title category')
      .sort({ createdAt: -1 })
      .limit(Number(limit))
      .skip(Number(skip));

    const total = await Comment.countDocuments({ userId, isDeleted: false });

    res.json({
      comments,
      total,
      hasMore: Number(skip) + comments.length < total
    });
  } catch (error) {
    console.error('Error fetching user comments:', error);
    res.status(500).json({ error: 'Failed to fetch user comments' });
  }
});

export default router;

