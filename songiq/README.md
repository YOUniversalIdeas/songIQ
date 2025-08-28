# songIQ - Music Intelligence Platform

A modern web application that provides music intelligence and success prediction for artists. songIQ analyzes uploaded songs and compares them to market data to provide insights and predictions about potential success.

## 🎵 Features

- **Audio Analysis**: Extract musical features like tempo, key, energy, and mood
- **Success Prediction**: AI-powered predictions based on market trends and similar songs
- **Market Comparison**: Compare your song to successful tracks in the same genre
- **Performance Tracking**: Monitor streaming data and chart positions for released songs
- **Interactive Dashboard**: Beautiful visualizations of analysis results and insights

## 🛠 Tech Stack

### Frontend
- **React 18** with TypeScript
- **Tailwind CSS** for styling
- **Vite** for build tooling
- **React Router** for navigation
- **Chart.js** for data visualizations
- **Tone.js** for audio analysis
- **TensorFlow.js** for ML predictions

### Backend
- **Node.js** with Express
- **MongoDB** with Mongoose
- **Multer** for file uploads
- **Joi** for validation
- **Winston** for logging

## 📁 Project Structure

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
└── shared/                # Shared types and utilities
    └── types/             # Common TypeScript interfaces
```

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn
- MongoDB (local or cloud)

### 🚀 Deployment Status

- ✅ **Development Environment**: Fully configured and tested
- ✅ **Staging Environment**: Ready for deployment (staging.songiq.com)
- ✅ **Production Environment**: Ready for deployment (songiq.com)
- ✅ **ESLint Configuration**: Fixed and working
- ✅ **Email System**: SendGrid configured and tested
- ✅ **Build System**: TypeScript compilation successful
- ✅ **Documentation**: Complete deployment guides created

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd songiq
   ```

2. **Install dependencies**
   ```bash
   npm run install:all
   ```

3. **Set up environment variables**
   
   Create `.env` files in both `client/` and `server/` directories:
   
   **server/.env:**
   ```env
   PORT=5000
   MONGODB_URI=mongodb://localhost:27017/songiq
   NODE_ENV=development
   JWT_SECRET=your-secret-key
   ```
   
   **client/.env:**
   ```env
   VITE_API_URL=http://localhost:5001/api
   ```

4. **Start the development servers**
   ```bash
   npm run dev
   ```

   This will start both the frontend (http://localhost:3000) and backend (http://localhost:5001) servers.

### Development Scripts

- `npm run dev` - Start both client and server in development mode
- `npm run build` - Build both client and server for production
- `npm run lint` - Run ESLint on both client and server
- `npm run type-check` - Run TypeScript type checking on both projects

## 📊 API Endpoints

### Songs
- `POST /api/songs/upload` - Upload a new song
- `GET /api/songs/:id` - Get song details
- `PUT /api/songs/:id` - Update song information
- `DELETE /api/songs/:id` - Delete a song

### Analysis
- `POST /api/analysis/start/:songId` - Start analysis process
- `GET /api/analysis/status/:songId` - Check analysis progress
- `GET /api/analysis/results/:songId` - Get analysis results

### Market Data
- `GET /api/market/compare/:songId` - Get similar songs and market data
- `GET /api/market/trends/:genre` - Get current genre trends
- `GET /api/market/predictions/:songId` - Get success predictions

## 🎯 Usage

1. **Upload a Song**: Navigate to the upload page and drag & drop your audio file
2. **Song Information**: Fill in the song details and release status
3. **Analysis**: The system will automatically analyze your song
4. **View Results**: Check the dashboard for detailed insights and predictions
5. **Track Performance**: For released songs, monitor streaming and chart data

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

If you encounter any issues or have questions, please open an issue on GitHub or contact the development team.

---

Built with ❤️ for musicians and artists everywhere. 