import { Request, Response, NextFunction } from 'express';
import { authenticateToken } from './auth';

// Extend the Request interface to include admin user
declare global {
  namespace Express {
    interface Request {
      adminUser?: {
        id: string;
        email: string;
        role: string;
        isSuperAdmin: boolean;
      };
    }
  }
}

export const requireSuperAdmin = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    // First authenticate the token
    await new Promise<void>((resolve, reject) => {
      authenticateToken(req, res, (err) => {
        if (err) reject(err);
        else resolve();
      });
    });

    // Check if user exists and has admin role
    if (!req.user) {
      res.status(401).json({ error: 'Authentication required' });
      return;
    }

    // Import User model here to avoid circular dependencies
    const User = require('../models/User').default;
    
    // Get full user details from database
    const user = await User.findById(req.user.id).select('+role');
    
    if (!user) {
      res.status(401).json({ error: 'User not found' });
      return;
    }

    // Check if user is admin
    if (user.role !== 'admin') {
      res.status(403).json({ error: 'Admin access required' });
      return;
    }

    // Set admin user context
    req.adminUser = {
      id: user._id.toString(),
      email: user.email,
      role: user.role,
      isSuperAdmin: true
    };

    next();
  } catch (error) {
    res.status(500).json({ error: 'Authentication failed' });
    return;
  }
};

export const requireAdminOrSuperAdmin = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    // First authenticate the token
    await new Promise<void>((resolve, reject) => {
      authenticateToken(req, res, (err) => {
        if (err) reject(err);
        else resolve();
      });
    });

    // Check if user exists
    if (!req.user) {
      res.status(401).json({ error: 'Authentication required' });
      return;
    }

    // Import User model here to avoid circular dependencies
    const User = require('../models/User').default;
    
    // Get full user details from database
    const user = await User.findById(req.user.id).select('+role');
    
    if (!user) {
      res.status(401).json({ error: 'User not found' });
      return;
    }

    // Check if user has admin privileges
    if (user.role !== 'admin' && user.role !== 'superadmin') {
      res.status(403).json({ error: 'Admin access required' });
      return;
    }

    // Set admin user context
    req.adminUser = {
      id: user._id.toString(),
      email: user.email,
      role: user.role,
      isSuperAdmin: user.role === 'superadmin'
    };

    next();
  } catch (error) {
    res.status(500).json({ error: 'Authentication failed' });
    return;
  }
};
