import express from 'express';
import { requireSuperAdmin, requireAdminOrSuperAdmin } from '../middleware/adminAuth';
import User from '../models/User';
import Song from '../models/Song';
import Analysis from '../models/Analysis';
import Market from '../models/Market';
import Trade from '../models/Trade';
import Position from '../models/Position';

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
    const csvHeader = 'Name,Artist/Band/Company Name,Email,Phone,Role,Subscription,Status,Created Date\n';
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

// ===== MARKETS MANAGEMENT =====

// Get all markets with admin details
router.get('/markets', requireAdminOrSuperAdmin, async (req, res) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const search = req.query.search as string;
    const status = req.query.status as string;
    const flagged = req.query.flagged === 'true';

    const filter: any = {};
    
    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { category: { $regex: search, $options: 'i' } }
      ];
    }
    
    if (status) filter.status = status;
    if (flagged) filter.flagged = true;

    const skip = (page - 1) * limit;
    
    const markets = await Market.find(filter)
      .populate('creatorId', 'email firstName lastName')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);
    
    const total = await Market.countDocuments(filter);
    
    res.json({
      success: true,
      data: markets,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Admin get markets error:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch markets' });
  }
});

// Get market details with analytics
router.get('/markets/:marketId', requireAdminOrSuperAdmin, async (req, res) => {
  try {
    const market = await Market.findById(req.params.marketId)
      .populate('creatorId', 'email firstName lastName')
      .populate('relatedSongId', 'title artist');
    
    if (!market) {
      return res.status(404).json({ success: false, error: 'Market not found' });
    }

    // Get trade statistics
    const trades = await Trade.find({ marketId: market._id });
    const positions = await Position.find({ marketId: market._id, shares: { $gt: 0 } });
    
    const analytics = {
      totalTrades: trades.length,
      totalParticipants: new Set(trades.map(t => t.userId.toString())).size,
      activePositions: positions.length,
      volumeByOutcome: market.outcomes.map(o => ({
        outcomeId: o.id,
        name: o.name,
        volume: o.totalVolume,
        shares: o.shares,
        price: o.price
      }))
    };
    
    res.json({ success: true, data: { market, analytics } });
  } catch (error) {
    console.error('Admin get market error:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch market' });
  }
});

// Suspend/Unsuspend market
router.patch('/markets/:marketId/suspend', requireAdminOrSuperAdmin, async (req, res) => {
  try {
    const { suspend, reason } = req.body;
    
    const market = await Market.findById(req.params.marketId);
    if (!market) {
      return res.status(404).json({ success: false, error: 'Market not found' });
    }

    if (suspend) {
      market.status = 'cancelled';
      (market as any).suspensionReason = reason || 'Suspended by admin';
      (market as any).suspendedAt = new Date();
      (market as any).suspendedBy = req.adminUser?.id;
    } else {
      market.status = 'active';
      (market as any).suspensionReason = undefined;
      (market as any).suspendedAt = undefined;
      (market as any).suspendedBy = undefined;
    }
    
    await market.save();
    
    res.json({ 
      success: true, 
      message: suspend ? 'Market suspended' : 'Market reactivated',
      data: market 
    });
  } catch (error) {
    console.error('Suspend market error:', error);
    res.status(500).json({ success: false, error: 'Failed to update market' });
  }
});

// Flag/Unflag market
router.patch('/markets/:marketId/flag', requireAdminOrSuperAdmin, async (req, res) => {
  try {
    const { flagged, reason } = req.body;
    
    const market = await Market.findById(req.params.marketId);
    if (!market) {
      return res.status(404).json({ success: false, error: 'Market not found' });
    }

    (market as any).flagged = flagged;
    if (flagged) {
      (market as any).flagReason = reason || 'Flagged by admin';
      (market as any).flaggedAt = new Date();
      (market as any).flaggedBy = req.adminUser?.id;
    } else {
      (market as any).flagReason = undefined;
      (market as any).flaggedAt = undefined;
      (market as any).flaggedBy = undefined;
    }
    
    await market.save();
    
    res.json({ 
      success: true, 
      message: flagged ? 'Market flagged' : 'Flag removed',
      data: market 
    });
  } catch (error) {
    console.error('Flag market error:', error);
    res.status(500).json({ success: false, error: 'Failed to flag market' });
  }
});

// Delete market (superadmin only)
router.delete('/markets/:marketId', requireSuperAdmin, async (req, res) => {
  try {
    const market = await Market.findById(req.params.marketId);
    if (!market) {
      return res.status(404).json({ success: false, error: 'Market not found' });
    }

    // Check if market has active positions
    const activePositions = await Position.countDocuments({ 
      marketId: market._id, 
      shares: { $gt: 0 } 
    });

    if (activePositions > 0 && market.status !== 'resolved') {
      return res.status(400).json({ 
        success: false, 
        error: 'Cannot delete market with active positions. Resolve or cancel first.' 
      });
    }

    await Market.findByIdAndDelete(req.params.marketId);
    
    res.json({ 
      success: true, 
      message: 'Market deleted successfully' 
    });
  } catch (error) {
    console.error('Delete market error:', error);
    res.status(500).json({ success: false, error: 'Failed to delete market' });
  }
});

// Force resolve market
router.post('/markets/:marketId/force-resolve', requireAdminOrSuperAdmin, async (req, res) => {
  try {
    const { outcomeId, reason } = req.body;
    
    const market = await Market.findById(req.params.marketId);
    if (!market) {
      return res.status(404).json({ success: false, error: 'Market not found' });
    }

    if (market.status === 'resolved') {
      return res.status(400).json({ success: false, error: 'Market already resolved' });
    }

    const outcome = market.outcomes.find(o => o.id === outcomeId);
    if (!outcome) {
      return res.status(404).json({ success: false, error: 'Outcome not found' });
    }

    market.status = 'resolved';
    market.resolvedOutcomeId = outcomeId;
    market.resolutionDate = new Date();
    (market as any).forceResolvedBy = req.adminUser?.id;
    (market as any).forceResolveReason = reason;

    await market.save();

    // Calculate payouts for winning positions
    const winningPositions = await Position.find({ 
      marketId: market._id, 
      outcomeId,
      shares: { $gt: 0 }
    });

    for (const position of winningPositions) {
      const payout = position.shares * 1.0;
      const profit = payout - position.totalInvested;
      position.realizedPnL += profit;
      position.currentValue = payout;
      await position.save();
    }

    res.json({ 
      success: true,
      message: 'Market force resolved successfully',
      data: { market, winnersCount: winningPositions.length }
    });
  } catch (error) {
    console.error('Force resolve market error:', error);
    res.status(500).json({ success: false, error: 'Failed to resolve market' });
  }
});

// ===== USER WARNINGS SYSTEM =====

// Add warning to user
router.post('/users/:userId/warnings', requireAdminOrSuperAdmin, async (req, res) => {
  try {
    const { reason, severity } = req.body;
    
    const user = await User.findById(req.params.userId);
    if (!user) {
      return res.status(404).json({ success: false, error: 'User not found' });
    }

    const warning = {
      reason,
      severity: severity || 'low',
      issuedBy: req.adminUser?.id,
      issuedAt: new Date()
    };

    if (!(user as any).warnings) {
      (user as any).warnings = [];
    }
    (user as any).warnings.push(warning);

    // Auto-suspend if too many warnings
    const warningCount = (user as any).warnings.length;
    if (warningCount >= 3 && user.isActive) {
      user.isActive = false;
      (user as any).suspensionReason = 'Automatic suspension: Too many warnings';
    }

    await user.save();
    
    res.json({ 
      success: true, 
      message: 'Warning issued',
      data: { warnings: (user as any).warnings, isActive: user.isActive }
    });
  } catch (error) {
    console.error('Add warning error:', error);
    res.status(500).json({ success: false, error: 'Failed to add warning' });
  }
});

// Get user warnings
router.get('/users/:userId/warnings', requireAdminOrSuperAdmin, async (req, res) => {
  try {
    const user = await User.findById(req.params.userId)
      .select('warnings email firstName lastName');
    
    if (!user) {
      return res.status(404).json({ success: false, error: 'User not found' });
    }

    res.json({ 
      success: true, 
      data: (user as any).warnings || []
    });
  } catch (error) {
    console.error('Get warnings error:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch warnings' });
  }
});

// Clear user warnings
router.delete('/users/:userId/warnings', requireSuperAdmin, async (req, res) => {
  try {
    const user = await User.findById(req.params.userId);
    if (!user) {
      return res.status(404).json({ success: false, error: 'User not found' });
    }

    (user as any).warnings = [];
    await user.save();
    
    res.json({ 
      success: true, 
      message: 'Warnings cleared'
    });
  } catch (error) {
    console.error('Clear warnings error:', error);
    res.status(500).json({ success: false, error: 'Failed to clear warnings' });
  }
});

// ===== PLATFORM STATISTICS =====

// Get platform statistics
router.get('/stats/platform', requireAdminOrSuperAdmin, async (req, res) => {
  try {
    const now = new Date();
    const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const oneMonthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

    // User statistics
    const totalUsers = await User.countDocuments();
    const activeUsers = await User.countDocuments({ isActive: true });
    const newUsersToday = await User.countDocuments({ createdAt: { $gte: oneDayAgo } });
    const newUsersThisWeek = await User.countDocuments({ createdAt: { $gte: oneWeekAgo } });
    const newUsersThisMonth = await User.countDocuments({ createdAt: { $gte: oneMonthAgo } });

    // Market statistics
    const totalMarkets = await Market.countDocuments();
    const activeMarkets = await Market.countDocuments({ status: 'active' });
    const resolvedMarkets = await Market.countDocuments({ status: 'resolved' });
    const cancelledMarkets = await Market.countDocuments({ status: 'cancelled' });
    const flaggedMarkets = await Market.countDocuments({ flagged: true });

    // Trading statistics
    const totalTrades = await Trade.countDocuments();
    const tradesToday = await Trade.countDocuments({ createdAt: { $gte: oneDayAgo } });
    const tradesThisWeek = await Trade.countDocuments({ createdAt: { $gte: oneWeekAgo } });
    const tradesThisMonth = await Trade.countDocuments({ createdAt: { $gte: oneMonthAgo } });

    // Volume statistics
    const volumeAggregation = await Trade.aggregate([
      {
        $group: {
          _id: null,
          totalVolume: { $sum: '$totalCost' },
          totalFees: { $sum: '$fee' }
        }
      }
    ]);

    const volumeStats = volumeAggregation[0] || { totalVolume: 0, totalFees: 0 };

    // Active positions
    const totalPositions = await Position.countDocuments({ shares: { $gt: 0 } });
    
    // Users with warnings
    const usersWithWarnings = await User.countDocuments({ 
      warnings: { $exists: true, $not: { $size: 0 } } 
    });

    res.json({
      success: true,
      data: {
        users: {
          total: totalUsers,
          active: activeUsers,
          newToday: newUsersToday,
          newThisWeek: newUsersThisWeek,
          newThisMonth: newUsersThisMonth,
          withWarnings: usersWithWarnings
        },
        markets: {
          total: totalMarkets,
          active: activeMarkets,
          resolved: resolvedMarkets,
          cancelled: cancelledMarkets,
          flagged: flaggedMarkets
        },
        trading: {
          totalTrades,
          tradesToday,
          tradesThisWeek,
          tradesThisMonth,
          activePositions: totalPositions
        },
        volume: {
          total: volumeStats.totalVolume,
          fees: volumeStats.totalFees
        }
      }
    });
  } catch (error) {
    console.error('Platform stats error:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch platform statistics' });
  }
});

// Get recent activity feed
router.get('/stats/activity', requireAdminOrSuperAdmin, async (req, res) => {
  try {
    const limit = parseInt(req.query.limit as string) || 50;

    // Get recent trades
    const recentTrades = await Trade.find()
      .sort({ createdAt: -1 })
      .limit(limit)
      .populate('userId', 'email firstName lastName')
      .populate('marketId', 'title');

    // Get recent markets
    const recentMarkets = await Market.find()
      .sort({ createdAt: -1 })
      .limit(20)
      .populate('creatorId', 'email firstName lastName');

    // Get recent users
    const recentUsers = await User.find()
      .sort({ createdAt: -1 })
      .limit(20)
      .select('email firstName lastName createdAt role');

    res.json({
      success: true,
      data: {
        trades: recentTrades,
        markets: recentMarkets,
        users: recentUsers
      }
    });
  } catch (error) {
    console.error('Activity feed error:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch activity' });
  }
});

// Get market analytics
router.get('/stats/markets-analytics', requireAdminOrSuperAdmin, async (req, res) => {
  try {
    const categoryStats = await Market.aggregate([
      {
        $group: {
          _id: '$category',
          count: { $sum: 1 },
          totalVolume: { $sum: '$totalVolume' },
          avgVolume: { $avg: '$totalVolume' }
        }
      },
      { $sort: { count: -1 } }
    ]);

    const statusStats = await Market.aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ]);

    res.json({
      success: true,
      data: {
        byCategory: categoryStats,
        byStatus: statusStats
      }
    });
  } catch (error) {
    console.error('Market analytics error:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch market analytics' });
  }
});

// ===== PLATFORM SETTINGS =====

// Note: Platform settings would typically be stored in a Settings collection
// For now, we'll use environment variables and return current configuration

// Get platform settings
router.get('/settings', requireSuperAdmin, async (req, res) => {
  try {
    const settings = {
      fees: {
        platformFee: parseFloat(process.env.PLATFORM_FEE || '0.02'),
        withdrawalFee: parseFloat(process.env.WITHDRAWAL_FEE || '0.01')
      },
      limits: {
        maxMarketDuration: parseInt(process.env.MAX_MARKET_DURATION || '90'),
        minLiquidity: parseFloat(process.env.MIN_LIQUIDITY || '100'),
        maxOutcomes: parseInt(process.env.MAX_OUTCOMES || '10'),
        minOutcomes: parseInt(process.env.MIN_OUTCOMES || '2')
      },
      features: {
        tradingEnabled: process.env.TRADING_ENABLED !== 'false',
        marketCreationEnabled: process.env.MARKET_CREATION_ENABLED !== 'false',
        withdrawalsEnabled: process.env.WITHDRAWALS_ENABLED !== 'false',
        maintenanceMode: process.env.MAINTENANCE_MODE === 'true'
      },
      moderation: {
        autoFlagThreshold: parseInt(process.env.AUTO_FLAG_THRESHOLD || '5'),
        autoSuspendWarnings: parseInt(process.env.AUTO_SUSPEND_WARNINGS || '3')
      }
    };

    res.json({ success: true, data: settings });
  } catch (error) {
    console.error('Get settings error:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch settings' });
  }
});

export default router;
