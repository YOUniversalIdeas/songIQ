const mongoose = require('mongoose');

// Connect to MongoDB
mongoose.connect('mongodb://127.0.0.1:27017/songiq', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

// Define Song schema (simplified for testing)
const songSchema = new mongoose.Schema({
  title: String,
  artist: String,
  duration: Number,
  uploadDate: Date,
  fileUrl: String,
  isReleased: Boolean,
  genre: String,
  description: String
});

const Song = mongoose.model('Song', songSchema);

// Create a test song
async function createTestSong() {
  try {
    const testSong = new Song({
      title: 'Test Song for Analysis',
      artist: 'Test Artist',
      duration: 180, // 3 minutes
      uploadDate: new Date(),
      fileUrl: 'https://example.com/test-song.mp3',
      isReleased: false,
      genre: 'Pop',
      description: 'A test song for testing analysis functionality'
    });

    const savedSong = await testSong.save();
    console.log('Test song created successfully:', savedSong._id);
    console.log('You can now test analysis with song ID:', savedSong._id);
    
    mongoose.connection.close();
  } catch (error) {
    console.error('Error creating test song:', error);
    mongoose.connection.close();
  }
}

createTestSong();
