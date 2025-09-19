import express from 'express';
import cors from 'cors';
import mongoose from 'mongoose';
import { loadEnvironment, logEnvironmentStatus } from './utils/envLoader';

// Load environment variables
console.log('🚀 Starting Simple Server...');
const envResult = loadEnvironment();

if (!envResult.success) {
  console.warn('⚠️  Environment loading failed, but continuing with defaults:', envResult.error);
}

logEnvironmentStatus();

const app = express();
const PORT = 9002;

// Basic middleware
app.use(cors({
  origin: ['http://localhost:3001'],
  credentials: true
}));

app.use(express.json());

// Simple User schema
const userSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  role: { type: String, default: 'user' }
});

const User = mongoose.model('User', userSchema);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Simple login endpoint
app.post('/api/auth/login', async (req, res): Promise<void> => {
  try {
    const { email, password } = req.body;
    
    if (!email || !password) {
      res.status(400).json({
        success: false,
        message: 'Email and password are required'
      });
      return;
    }

    // Find user
    const user = await User.findOne({ email: email.toLowerCase() });
    
    if (!user) {
      res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
      return;
    }

    // Simple password check (in production, use bcrypt)
    if (user.password !== password) {
      res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
      return;
    }

    // Return success
    res.json({
      success: true,
      message: 'Login successful',
      user: {
        id: user._id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role
      },
      token: 'dummy-token-' + Date.now()
    });

  } catch (error: any) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      message: 'Login failed',
      error: error.message
    });
  }
});

// Simple register endpoint
app.post('/api/auth/register', async (req, res): Promise<void> => {
  try {
    const { email, password, firstName, lastName } = req.body;
    
    if (!email || !password || !firstName || !lastName) {
      res.status(400).json({
        success: false,
        message: 'All fields are required'
      });
      return;
    }

    // Check if user exists
    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      res.status(400).json({
        success: false,
        message: 'User with this email already exists'
      });
      return;
    }

    // Create user
    const user = new User({
      email: email.toLowerCase(),
      password, // In production, hash this
      firstName,
      lastName
    });

    await user.save();

    res.json({
      success: true,
      message: 'User registered successfully',
      user: {
        id: user._id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName
      }
    });

  } catch (error: any) {
    console.error('Register error:', error);
    res.status(500).json({
      success: false,
      message: 'Registration failed',
      error: error.message
    });
  }
});

// Profile endpoint
app.get('/api/auth/profile', async (req, res): Promise<void> => {
  try {
    // For now, just return a dummy response
    // In production, verify JWT token
    res.json({
      success: true,
      user: {
        id: 'dummy-id',
        email: 'admin@songiq.com',
        firstName: 'Admin',
        lastName: 'User',
        role: 'admin'
      }
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: 'Failed to get profile'
    });
  }
});

// Start server
const startServer = async () => {
  try {
    // Connect to MongoDB
    const mongoURI = process.env.MONGODB_URI || 'mongodb://localhost:27017/songiq';
    await mongoose.connect(mongoURI);
    console.log('MongoDB connected successfully');
    
    // Start server
    app.listen(PORT, '0.0.0.0', () => {
      console.log(`🚀 Simple songIQ server running on port ${PORT}`);
      console.log(`🔗 Health check: http://localhost:${PORT}/api/health`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

startServer();
