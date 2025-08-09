# Unreleased Songs Support - songIQ Guide

## 🎵 **Overview**

songIQ is designed to work with **both released and unreleased songs**. While Spotify Web API integration provides industry-standard analysis for released tracks, our **local audio analysis system** ensures that unreleased, demo, and private tracks receive comprehensive analysis without requiring distribution.

## ✅ **How It Works for Unreleased Songs**

### **Dual Analysis System**

1. **Released Songs** → Spotify Web API analysis (if available on Spotify)
2. **Unreleased Songs** → Local audio analysis (works with any audio file)

### **Local Analysis Capabilities**

Our `simpleAudioAnalysisService` provides comprehensive analysis for unreleased tracks:

```typescript
// What we extract for unreleased songs
{
  tempo: 120,                    // BPM estimation
  key: "C",                      // Musical key (C, C#, D, etc.)
  mode: "major",                 // Major/minor mode
  loudness: -12.5,              // RMS loudness in dB
  duration: 180,                // Duration in seconds
  spectralFeatures: {
    centroid: 1500,             // Spectral centroid (Hz)
    rolloff: 4000,              // Spectral rolloff (Hz)
    flux: 0.3,                  // Spectral flux
    energy: 0.7                 // Energy level
  },
  pitchAnalysis: {
    dominantFrequencies: [440, 880, 220],  // Main frequencies
    harmonicContent: 0.6,       // Harmonic content ratio
    pitchStability: 0.8         // Pitch stability measure
  },
  rhythmAnalysis: {
    beatStrength: 0.7,          // Beat strength
    rhythmicComplexity: 0.4,    // Rhythm complexity
    groove: 0.6                 // Groove factor
  }
}
```

## 🚀 **API Endpoints for Unreleased Songs**

### **1. General Upload (Works for Both)**
```http
POST /api/songs/upload
Content-Type: multipart/form-data

{
  "audioFile": [file],
  "title": "My Unreleased Song",
  "artist": "Artist Name",
  "isReleased": "false",
  "userId": "user_id_optional"
}
```

### **2. Dedicated Unreleased Song Upload**
```http
POST /api/songs/analyze-unreleased
Content-Type: multipart/form-data

{
  "audioFile": [file],
  "title": "My Unreleased Song",
  "artist": "Artist Name",
  "description": "Demo version of my new track",
  "genre": "Pop",
  "targetReleaseDate": "2024-12-01",
  "userId": "user_id_optional"
}
```

## 📊 **Analysis Features for Unreleased Songs**

### **Basic Audio Properties**
- ✅ **Tempo Detection**: BPM estimation using peak detection
- ✅ **Key & Mode Analysis**: Musical key and major/minor mode detection
- ✅ **Loudness Measurement**: RMS loudness calculation
- ✅ **Duration Analysis**: Accurate duration from file metadata

### **Spectral Analysis**
- ✅ **Spectral Centroid**: Frequency center of mass
- ✅ **Spectral Rolloff**: Frequency below which 85% of energy is contained
- ✅ **Spectral Flux**: Rate of change in spectral content
- ✅ **Energy Level**: Overall audio energy measurement

### **Pitch Analysis**
- ✅ **Dominant Frequencies**: Main frequency components
- ✅ **Harmonic Content**: Ratio of harmonic to total content
- ✅ **Pitch Stability**: Measure of pitch consistency over time

### **Rhythm Analysis**
- ✅ **Beat Strength**: Strength of rhythmic patterns
- ✅ **Rhythmic Complexity**: Complexity of rhythmic structure
- ✅ **Groove Factor**: Overall rhythmic feel and groove

### **Waveform Visualization**
- ✅ **Waveform Data**: Audio waveform for visualization
- ✅ **Interactive Display**: Chart.js-based waveform viewer
- ✅ **Playback Controls**: Play, pause, seek, zoom functionality

## 🔄 **Upload Flow for Unreleased Songs**

### **Step-by-Step Process**

1. **File Upload**
   ```typescript
   // Artist uploads unreleased track
   const formData = new FormData();
   formData.append('audioFile', file);
   formData.append('title', 'My New Song');
   formData.append('artist', 'Artist Name');
   formData.append('isReleased', 'false');
   ```

2. **File Validation**
   ```typescript
   // System validates file format and integrity
   - File type: MP3, WAV, M4A, FLAC
   - File size: Up to 50MB
   - Audio integrity: Valid audio structure
   ```

3. **Local Analysis**
   ```typescript
   // Comprehensive local analysis
   const analysis = await analyzeAudioSimple(filePath);
   // Extracts tempo, key, mode, spectral features, etc.
   ```

4. **Database Storage**
   ```typescript
   // Save analysis results
   const audioFeatures = new AudioFeatures({
     ...analysis,
     analysisSource: 'local',
     isUnreleased: true
   });
   ```

5. **Response**
   ```typescript
   // Return comprehensive analysis
   {
     success: true,
     data: {
       songId: "song_id",
       analysisStatus: "completed",
       isUnreleased: true,
       audioFeatures: { /* analysis results */ },
       analysisDetails: { /* detailed analysis */ }
     }
   }
   ```

## 📈 **Comparison: Released vs Unreleased**

| Feature | Released Songs | Unreleased Songs |
|---------|---------------|------------------|
| **Analysis Source** | Spotify Web API | Local Analysis |
| **Availability** | Must be on Spotify | Any audio file |
| **Audio Features** | Industry standard | Custom analysis |
| **Tempo** | Spotify's analysis | Peak detection |
| **Key/Mode** | Spotify's analysis | Chromagram analysis |
| **Spectral Features** | Spotify's analysis | Custom calculation |
| **Waveform** | Not available | Generated locally |
| **Real-time** | No | Yes |
| **Custom Fields** | Limited | Full support |

## 🎯 **Use Cases for Unreleased Songs**

### **1. Demo Analysis**
- Artists can analyze demo versions before final release
- Compare different versions of the same song
- Track improvements over time

### **2. Pre-Release Planning**
- Analyze tracks before distribution
- Get insights for marketing and promotion
- Plan release strategy based on analysis

### **3. Private Projects**
- Analyze private/unlisted tracks
- Keep analysis private until ready to share
- Work on projects without public exposure

### **4. Collaboration**
- Share analysis results with collaborators
- Compare different artists' contributions
- Track project progress

## 🔧 **Technical Implementation**

### **File Support**
- **Formats**: MP3, WAV, M4A, FLAC
- **Size Limit**: 50MB per file
- **Quality**: Any quality level supported
- **Duration**: No practical limit

### **Analysis Performance**
- **Speed**: Real-time analysis (seconds)
- **Accuracy**: High-quality feature extraction
- **Reliability**: Robust error handling
- **Scalability**: Efficient processing

### **Data Storage**
- **Audio Features**: Stored in MongoDB
- **File Storage**: Local file system
- **Metadata**: Comprehensive song metadata
- **Relationships**: Proper database relationships

## 🛡️ **Privacy & Security**

### **Unreleased Song Privacy**
- ✅ **Private Uploads**: Songs marked as unreleased are private by default
- ✅ **User Control**: Artists control who can access their unreleased tracks
- ✅ **Data Protection**: Secure storage and transmission
- ✅ **Access Control**: User-based permissions

### **Analysis Data**
- ✅ **Local Processing**: Analysis done on our servers
- ✅ **No External Sharing**: Analysis data not shared with third parties
- ✅ **User Ownership**: Artists own their analysis data
- ✅ **Secure Storage**: Encrypted storage and transmission

## 📊 **Response Examples**

### **Unreleased Song Upload Response**
```json
{
  "success": true,
  "data": {
    "songId": "64f8a1b2c3d4e5f6a7b8c9d0",
    "uploadUrl": "/uploads/song_1234567890.mp3",
    "analysisStatus": "completed",
    "isUnreleased": true,
    "analysisSource": "local",
    "audioFeatures": {
      "tempo": 128,
      "key": 0,
      "mode": 1,
      "loudness": -14.2,
      "energy": 0.75,
      "danceability": 0.68,
      "valence": 0.72
    },
    "analysisDetails": {
      "spectralFeatures": {
        "centroid": 1450,
        "rolloff": 3800,
        "flux": 0.25,
        "energy": 0.75
      },
      "pitchAnalysis": {
        "dominantFrequencies": [440, 880, 220],
        "harmonicContent": 0.65,
        "pitchStability": 0.82
      },
      "rhythmAnalysis": {
        "beatStrength": 0.73,
        "rhythmicComplexity": 0.41,
        "groove": 0.67
      },
      "waveformData": [/* waveform samples */]
    },
    "song": {
      "id": "64f8a1b2c3d4e5f6a7b8c9d0",
      "title": "My Unreleased Song",
      "artist": "Artist Name",
      "duration": 180,
      "isReleased": false,
      "description": "Demo version",
      "genre": "Pop",
      "targetReleaseDate": "2024-12-01"
    }
  },
  "message": "Unreleased song uploaded and analyzed successfully"
}
```

## 🎵 **Benefits for Artists**

### **1. Early Insights**
- Get analysis before release
- Understand song characteristics
- Plan marketing strategy

### **2. Quality Control**
- Compare different versions
- Track improvements
- Ensure consistency

### **3. Collaboration**
- Share analysis with team
- Compare contributions
- Track project progress

### **4. Market Preparation**
- Understand target audience
- Plan release timing
- Optimize for platforms

## ✅ **Summary**

songIQ provides **comprehensive support for unreleased songs** through:

- ✅ **Local Audio Analysis**: Works with any audio file
- ✅ **Comprehensive Features**: Tempo, key, mode, spectral analysis
- ✅ **Waveform Visualization**: Interactive waveform display
- ✅ **Privacy Protection**: Secure handling of unreleased content
- ✅ **Flexible API**: Dedicated endpoints for unreleased tracks
- ✅ **Database Integration**: Proper storage and relationships

**Unreleased songs receive the same level of analysis as released tracks**, ensuring artists can make informed decisions about their music before distribution. 