# songIQ Setup Guide

This guide will help you get the songIQ music intelligence platform up and running on your local machine.

## Prerequisites

- **Node.js 18+** - [Download here](https://nodejs.org/)
- **npm or yarn** - Package managers
- **MongoDB** - [Download here](https://www.mongodb.com/try/download/community) or use MongoDB Atlas

## Quick Start

### 1. Clone and Install Dependencies

```bash
# Navigate to the songiq directory
cd songiq

# Install all dependencies (client, server, and root)
npm run install:all
```

### 2. Set Up Environment Variables

**Server Environment:**
```bash
# Copy the example environment file
cp server/env.example server/.env

# Edit server/.env with your configuration
# At minimum, set your MongoDB URI:
MONGODB_URI=mongodb://localhost:27017/songiq
```

**Client Environment:**
```bash
# Copy the example environment file
cp client/env.example client/.env

# The default should work for local development
VITE_API_URL=http://localhost:5000/api
```

### 3. Start MongoDB

**Local MongoDB:**
```bash
# Start MongoDB service
mongod
```

**MongoDB Atlas (Cloud):**
- Create a free cluster at [MongoDB Atlas](https://www.mongodb.com/atlas)
- Get your connection string and update `MONGODB_URI` in `server/.env`

### 4. Start the Application

```bash
# Start both client and server in development mode
npm run dev
```

This will start:
- **Frontend**: http://localhost:3000
- **Backend**: http://localhost:5000

## Development Scripts

### Root Level Commands
```bash
npm run dev              # Start both client and server
npm run dev:client       # Start only the client
npm run dev:server       # Start only the server
npm run build            # Build both client and server
npm run install:all      # Install all dependencies
npm run lint             # Lint both projects
npm run type-check       # Type check both projects
```

### Client Commands
```bash
cd client
npm run dev              # Start development server
npm run build            # Build for production
npm run preview          # Preview production build
npm run lint             # Run ESLint
npm run type-check       # Run TypeScript checks
```

### Server Commands
```bash
cd server
npm run dev              # Start development server
npm run build            # Build for production
npm run start            # Start production server
npm run lint             # Run ESLint
npm run type-check       # Run TypeScript checks
```

## Project Structure

```
songiq/
├── client/                 # React frontend
│   ├── src/
│   │   ├── components/     # Reusable UI components
│   │   ├── pages/         # Page components
│   │   ├── hooks/         # Custom React hooks
│   │   ├── utils/         # Utility functions
│   │   └── types/         # TypeScript types
│   └── public/            # Static assets
├── server/                # Express backend
│   ├── src/
│   │   ├── routes/        # API routes
│   │   ├── models/        # MongoDB models
│   │   ├── services/      # Business logic
│   │   └── utils/         # Utility functions
│   └── uploads/           # Uploaded audio files
└── shared/                # Shared types and utilities
    └── types/             # Common TypeScript interfaces
```

## API Endpoints

### Songs
- `POST /api/songs/upload` - Upload a new song
- `GET /api/songs/:id` - Get song details
- `PUT /api/songs/:id` - Update song information
- `DELETE /api/songs/:id` - Delete a song
- `GET /api/songs` - Get all songs (paginated)

### Analysis
- `POST /api/analysis/start/:songId` - Start analysis process
- `GET /api/analysis/status/:songId` - Check analysis progress
- `GET /api/analysis/results/:songId` - Get analysis results

### Market Data
- `GET /api/market/compare/:songId` - Get similar songs and market data
- `GET /api/market/trends/:genre` - Get current genre trends
- `GET /api/market/predictions/:songId` - Get success predictions

## Features Implemented

### ✅ Completed
- **Project Setup**: Full TypeScript configuration, build tools, and project structure
- **Database Models**: MongoDB schemas for songs, analysis results, and performance metrics
- **Audio Upload**: Drag & drop interface with file validation and preview
- **Song Information Form**: Complete form with release status and platform selection
- **Analysis Progress**: Real-time progress tracking with step-by-step updates
- **Results Dashboard**: Comprehensive results display with success predictions
- **API Backend**: Complete REST API with file upload, analysis, and market data endpoints
- **Modern UI**: Responsive design with Tailwind CSS and beautiful components

### 🔄 In Progress / Mock Data
- **Audio Analysis**: Currently using mock data (ready for real ML integration)
- **Success Prediction**: Mock predictions (ready for real ML models)
- **Market Data**: Mock market comparisons (ready for real data integration)

## Next Steps

### For Real ML Integration
1. **Audio Analysis Service**: Implement real audio feature extraction using Web Audio API and Tone.js
2. **ML Models**: Integrate TensorFlow.js for genre classification and success prediction
3. **Market Data**: Connect to real music streaming APIs for market comparisons

### For Production
1. **Authentication**: Add user authentication and authorization
2. **File Storage**: Move to cloud storage (AWS S3, Google Cloud Storage)
3. **Queue System**: Implement background job processing for analysis
4. **Caching**: Add Redis for caching analysis results
5. **Monitoring**: Add logging and monitoring (Winston, Sentry)

## Troubleshooting

### Common Issues

**MongoDB Connection Error:**
```bash
# Make sure MongoDB is running
mongod

# Check your connection string in server/.env
MONGODB_URI=mongodb://localhost:27017/songiq
```

**Port Already in Use:**
```bash
# Kill processes on ports 3000 or 5000
lsof -ti:3000 | xargs kill -9
lsof -ti:5000 | xargs kill -9
```

**Dependencies Issues:**
```bash
# Clear node_modules and reinstall
rm -rf node_modules client/node_modules server/node_modules
npm run install:all
```

**TypeScript Errors:**
```bash
# Run type checking
npm run type-check

# Check for missing types
npm install @types/node @types/express
```

## Support

If you encounter any issues:
1. Check the console for error messages
2. Verify all environment variables are set correctly
3. Ensure MongoDB is running and accessible
4. Check that all dependencies are installed

For additional help, please refer to the main README.md file or create an issue in the repository. 