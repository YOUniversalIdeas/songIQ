import express from 'express';
import { requireSuperAdmin, requireAdminOrSuperAdmin } from '../middleware/adminAuth';
import User from '../models/User';
import Song from '../models/Song';
import Analysis from '../models/Analysis';

const router = express.Router();

// ===== USER MANAGEMENT =====

// Get all users with pagination and filtering
router.get('/users', requireSuperAdmin, async (req, res) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const search = req.query.search as string;
    const role = req.query.role as string;
    const status = req.query.status as string;

    const filter: any = {};
    
    if (search) {
      filter.$or = [
        { email: { $regex: search, $options: 'i' } },
        { firstName: { $regex: search, $options: 'i' } },
        { lastName: { $regex: search, $options: 'i' } },
        { username: { $regex: search, $options: 'i' } }
      ];
    }
    
    if (role) filter.role = role;
    if (status === 'active') filter.isActive = true;
    if (status === 'inactive') filter.isActive = false;

    const skip = (page - 1) * limit;
    
    const users = await User.find(filter)
      .select('-password')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);
    
    const total = await User.countDocuments(filter);
    
    res.json({
      success: true,
      data: users,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to fetch users' });
  }
});

// Get user details by ID
router.get('/users/:userId', requireSuperAdmin, async (req, res) => {
  try {
    const user = await User.findById(req.params.userId)
      .select('-password')
      .populate('uploadedSongs', 'title artist genre createdAt');
    
    if (!user) {
      res.status(404).json({ success: false, error: 'User not found' });
      return;
    }
    
    res.json({ success: true, data: user });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to fetch user' });
  }
});

// Update user role and status
router.patch('/users/:userId', requireSuperAdmin, async (req, res) => {
  try {
    const { role, isActive, isVerified } = req.body;
    
    const updateData: any = {};
    if (role) updateData.role = role;
    if (typeof isActive === 'boolean') updateData.isActive = isActive;
    if (typeof isVerified === 'boolean') updateData.isVerified = isVerified;
    
    const user = await User.findByIdAndUpdate(
      req.params.userId,
      updateData,
      { new: true, runValidators: true }
    ).select('-password');
    
    if (!user) {
      res.status(404).json({ success: false, error: 'User not found' });
      return;
    }
    
    res.json({ success: true, data: user });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to update user' });
  }
});

// Delete user (superadmin only)
router.delete('/users/:userId', requireSuperAdmin, async (req, res) => {
  try {
    const user = await User.findById(req.params.userId);
    
    if (!user) {
      res.status(404).json({ success: false, error: 'User not found' });
      return;
    }
    
    // Prevent superadmin from deleting themselves
    if (req.adminUser?.id === req.params.userId) {
      res.status(400).json({ success: false, error: 'Cannot delete your own account' });
      return;
    }
    
    await User.findByIdAndDelete(req.params.userId);
    
    res.json({ success: true, message: 'User deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to delete user' });
  }
});

// ===== ARTIST MANAGEMENT =====

// Get all artists with search and filtering
router.get('/artists', requireSuperAdmin, async (req, res) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const search = req.query.search as string;
    const role = req.query.role as string;
    
    const filter: any = { role: { $in: ['artist', 'producer', 'label'] } };
    
    if (search) {
      filter.$or = [
        { email: { $regex: search, $options: 'i' } },
        { firstName: { $regex: search, $options: 'i' } },
        { lastName: { $regex: search, $options: 'i' } },
        { bandName: { $regex: search, $options: 'i' } },
        { telephone: { $regex: search, $options: 'i' } },
        { 'subscription.plan': { $regex: search, $options: 'i' } }
      ];
    }
    
    if (role) filter.role = role;
    
    const skip = (page - 1) * limit;
    
    const artists = await User.find(filter)
      .select('email firstName lastName bandName telephone role isActive createdAt subscription.plan')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);
    
    const total = await User.countDocuments(filter);
    
    res.json({
      success: true,
      data: artists,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to fetch artists' });
  }
});

// Download artists data as CSV
router.get('/artists/download', requireSuperAdmin, async (req, res) => {
  try {
    const artists = await User.find({ role: { $in: ['artist', 'producer', 'label'] } })
      .select('email firstName lastName bandName telephone role isActive createdAt subscription.plan')
      .sort({ createdAt: -1 });
    
    // Create CSV content
    const csvHeader = 'Name,Band Name,Email,Phone,Role,Subscription,Status,Created Date\n';
    const csvRows = artists.map(artist => {
      const name = `${artist.firstName} ${artist.lastName}`;
      const status = artist.isActive ? 'Active' : 'Inactive';
      const subscription = artist.subscription?.plan ? artist.subscription.plan.charAt(0).toUpperCase() + artist.subscription.plan.slice(1) : 'Free';
      const createdDate = artist.createdAt.toISOString().split('T')[0];
      return `"${name}","${artist.bandName}","${artist.email}","${artist.telephone}","${artist.role}","${subscription}","${status}","${createdDate}"`;
    }).join('\n');
    
    const csvContent = csvHeader + csvRows;
    
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename="artists_data.csv"');
    res.send(csvContent);
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to download artists data' });
  }
});

// Pose as artist - get artist's context for impersonation
router.post('/artists/:artistId/pose', requireSuperAdmin, async (req, res) => {
  try {
    const artist = await User.findById(req.params.artistId)
      .select('-password')
      .populate('uploadedSongs', 'title artist genre createdAt analysisStatus')
      .populate('favoriteSongs', 'title artist genre');
    
    if (!artist) {
      res.status(404).json({ success: false, error: 'Artist not found' });
      return;
    }
    
    if (!['artist', 'producer', 'label'].includes(artist.role)) {
      res.status(400).json({ success: false, error: 'User is not an artist, producer, or label' });
      return;
    }
    
    // Create impersonation context
    const impersonationContext = {
      originalAdminId: req.adminUser?.id,
      artistId: artist._id,
      artistEmail: artist.email,
      artistName: `${artist.firstName} ${artist.lastName}`,
      bandName: artist.bandName,
      role: artist.role,
      impersonationStartTime: new Date(),
      artistData: {
        profile: {
          firstName: artist.firstName,
          lastName: artist.lastName,
          bandName: artist.bandName,
          email: artist.email,
          telephone: artist.telephone,
          bio: artist.bio,
          profilePicture: artist.profilePicture
        },
        songs: artist.uploadedSongs,
        favorites: artist.favoriteSongs,
        stats: artist.stats,
        subscription: artist.subscription
      }
    };
    
    res.json({
      success: true,
      message: `Now posing as ${artist.firstName} ${artist.lastName}`,
      data: impersonationContext
    });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to pose as artist' });
  }
});

// ===== CONTENT MANAGEMENT =====

// Get all songs with pagination and filtering
router.get('/songs', requireAdminOrSuperAdmin, async (req, res) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const search = req.query.search as string;
    const status = req.query.status as string;
    
    const filter: any = {};
    
    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: 'i' } },
        { artist: { $regex: search, $options: 'i' } },
        { genre: { $regex: search, $options: 'i' } }
      ];
    }
    
    if (status === 'pending') filter.analysisStatus = 'pending';
    if (status === 'completed') filter.analysisStatus = 'completed';
    if (status === 'failed') filter.analysisStatus = 'failed';
    
    const skip = (page - 1) * limit;
    
    const songs = await Song.find(filter)
      .populate('userId', 'email firstName lastName username')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);
    
    const total = await Song.countDocuments(filter);
    
    res.json({
      success: true,
      data: songs,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to fetch songs' });
  }
});

// Get song details with analysis
router.get('/songs/:songId', requireAdminOrSuperAdmin, async (req, res) => {
  try {
    const song = await Song.findById(req.params.songId)
      .populate('userId', 'email firstName lastName username')
      .populate('analysisId');
    
    if (!song) {
      res.status(404).json({ success: false, error: 'Song not found' });
      return;
    }
    
    res.json({ success: true, data: song });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to fetch song' });
  }
});

// Delete song (admin or superadmin)
router.delete('/songs/:songId', requireAdminOrSuperAdmin, async (req, res) => {
  try {
    const song = await Song.findById(req.params.songId);
    
    if (!song) {
      res.status(404).json({ success: false, error: 'Song not found' });
      return;
    }
    
    // Delete associated analysis if it exists
    if (song.analysisResults) {
      await Analysis.findByIdAndDelete(song.analysisResults);
    }
    
    await Song.findByIdAndDelete(req.params.songId);
    
    res.json({ success: true, message: 'Song deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to delete song' });
  }
});

// ===== SYSTEM ANALYTICS =====

// Get system overview statistics
router.get('/analytics/overview', requireAdminOrSuperAdmin, async (req, res) => {
  try {
    const [
      totalUsers,
      activeUsers,
      newUsersThisMonth,
      totalSongs,
      pendingAnalyses,
      completedAnalyses,
      totalRevenue
    ] = await Promise.all([
      User.countDocuments(),
      User.countDocuments({ isActive: true }),
      User.countDocuments({ 
        createdAt: { $gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1) }
      }),
      Song.countDocuments(),
      Song.countDocuments({ analysisStatus: 'pending' }),
      Song.countDocuments({ analysisStatus: 'completed' }),
      // Placeholder for revenue calculation
      Promise.resolve(0)
    ]);
    
    res.json({
      success: true,
      data: {
        users: {
          total: totalUsers,
          active: activeUsers,
          newThisMonth: newUsersThisMonth,
          growthRate: ((newUsersThisMonth / totalUsers) * 100).toFixed(1)
        },
        content: {
          totalSongs,
          pendingAnalyses,
          completedAnalyses,
          completionRate: totalSongs > 0 ? ((completedAnalyses / totalSongs) * 100).toFixed(1) : '0'
        },
        business: {
          totalRevenue,
          averageRevenuePerUser: totalUsers > 0 ? (totalRevenue / totalUsers).toFixed(2) : '0'
        }
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to fetch analytics' });
  }
});

// Get user growth trends
router.get('/analytics/user-growth', requireAdminOrSuperAdmin, async (req, res) => {
  try {
    const days = parseInt(req.query.days as string) || 30;
    const endDate = new Date();
    const startDate = new Date(endDate.getTime() - (days * 24 * 60 * 60 * 1000));
    
    const userGrowth = await User.aggregate([
      {
        $match: {
          createdAt: { $gte: startDate, $lte: endDate }
        }
      },
      {
        $group: {
          _id: {
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' },
            day: { $dayOfMonth: '$createdAt' }
          },
          count: { $sum: 1 }
        }
      },
      {
        $sort: { '_id.year': 1, '_id.month': 1, '_id.day': 1 }
      }
    ]);
    
    res.json({ success: true, data: userGrowth });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to fetch user growth data' });
  }
});

// Get content upload trends
router.get('/analytics/content-trends', requireAdminOrSuperAdmin, async (req, res) => {
  try {
    const days = parseInt(req.query.days as string) || 30;
    const endDate = new Date();
    const startDate = new Date(endDate.getTime() - (days * 24 * 60 * 60 * 1000));
    
    const contentTrends = await Song.aggregate([
      {
        $match: {
          createdAt: { $gte: startDate, $lte: endDate }
        }
      },
      {
        $group: {
          _id: {
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' },
            day: { $dayOfMonth: '$createdAt' }
          },
          uploads: { $sum: 1 },
          genres: { $addToSet: '$genre' }
        }
      },
      {
        $sort: { '_id.year': 1, '_id.month': 1, '_id.day': 1 }
      }
    ]);
    
    res.json({ success: true, data: contentTrends });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to fetch content trends' });
  }
});

// ===== SYSTEM SETTINGS =====

// Get system configuration (superadmin only)
router.get('/settings', requireSuperAdmin, async (req, res) => {
  try {
    // This would typically come from a database or environment
    const settings = {
      maintenanceMode: false,
      maxFileSize: '50MB',
      allowedFileTypes: ['mp3', 'wav', 'flac'],
      maxSongsPerUser: {
        free: 5,
        basic: 25,
        pro: 100,
        enterprise: 'unlimited'
      },
      apiRateLimits: {
        default: '100 requests per 15 minutes',
        premium: '1000 requests per 15 minutes'
      }
    };
    
    res.json({ success: true, data: settings });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to fetch settings' });
  }
});

// Update system settings (superadmin only)
router.patch('/settings', requireSuperAdmin, async (req, res) => {
  try {
    const { maintenanceMode, maxFileSize, allowedFileTypes } = req.body;
    
    // In a real application, these would be saved to database
    // For now, we'll just return success
    
    res.json({ 
      success: true, 
      message: 'Settings updated successfully',
      data: { maintenanceMode, maxFileSize, allowedFileTypes }
    });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to update settings' });
  }
});

// ===== ADMIN USER MANAGEMENT =====

// Promote user to admin (superadmin only)
router.post('/users/:userId/promote', requireSuperAdmin, async (req, res) => {
  try {
    const { role } = req.body;
    
    if (!['admin', 'superadmin'].includes(role)) {
      res.status(400).json({ success: false, error: 'Invalid role for promotion' });
      return;
    }
    
    const user = await User.findByIdAndUpdate(
      req.params.userId,
      { role },
      { new: true, runValidators: true }
    ).select('-password');
    
    if (!user) {
      res.status(404).json({ success: false, error: 'User not found' });
      return;
    }
    
    res.json({ 
      success: true, 
      message: `User promoted to ${role} successfully`,
      data: user 
    });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to promote user' });
  }
});

// Demote admin user (superadmin only)
router.post('/users/:userId/demote', requireSuperAdmin, async (req, res) => {
  try {
    const user = await User.findById(req.params.userId);
    
    if (!user) {
      res.status(404).json({ success: false, error: 'User not found' });
      return;
    }
    
    // Prevent demoting the last superadmin
    if (user.role === 'superadmin') {
      const superadminCount = await User.countDocuments({ role: 'superadmin' });
      if (superadminCount <= 1) {
        res.status(400).json({ success: false, error: 'Cannot demote the last superadmin' });
        return;
      }
    }
    
    // Prevent demoting yourself
    if (req.adminUser?.id === req.params.userId) {
      res.status(400).json({ success: false, error: 'Cannot demote yourself' });
      return;
    }
    
    const updatedUser = await User.findByIdAndUpdate(
      req.params.userId,
      { role: 'user' },
      { new: true, runValidators: true }
    ).select('-password');
    
    res.json({ 
      success: true, 
      message: 'User demoted successfully',
      data: updatedUser 
    });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to demote user' });
  }
});

export default router;
