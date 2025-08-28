// Test file for ML Success Predictor
import MLSuccessPredictor from '../services/mlSuccessPredictor'
import { RealAudioFeatures } from './audioAnalysis'

// Test the ML predictor with sample data
export const testMLPredictor = async () => {
  console.log('🧪 Testing ML Success Predictor...')
  
  try {
    const mlPredictor = new MLSuccessPredictor()
    
    // Create sample audio features
    const sampleAudioFeatures: RealAudioFeatures = {
      duration: 180,
      sampleRate: 44100,
      channels: 2,
      
      // Spectral features
      spectralCentroid: 2500,
      spectralRolloff: 5000,
      spectralFlatness: 0.3,
      spectralBandwidth: 1500,
      
      // Rhythmic features
      tempo: 120,
      rhythmStrength: 0.8,
      beatConfidence: 0.9,
      
      // Tonal features
      key: 'C',
      mode: 'major',
      keyConfidence: 0.85,
      harmonicComplexity: 0.7,
      
      // Dynamic features
      rms: 0.6,
      dynamicRange: -25,
      crestFactor: 7,
      
      // Perceptual features
      danceability: 0.8,
      energy: 0.75,
      valence: 0.7,
      acousticness: 0.2,
      instrumentalness: 0.1,
      liveness: 0.3,
      speechiness: 0.05
    }
    
    console.log('📊 Sample audio features:', sampleAudioFeatures)
    
    // Test prediction for different genres
    const genres = ['Pop', 'Rock', 'Electronic', 'Hip-Hop']
    
    for (const genre of genres) {
      console.log(`\n🎵 Testing ${genre} genre...`)
      const prediction = await mlPredictor.predictSuccess(sampleAudioFeatures, genre)
      
      console.log(`✅ ${genre} prediction:`, {
        score: prediction.score,
        confidence: prediction.confidence,
        marketPotential: prediction.marketPotential,
        socialScore: prediction.socialScore
      })
    }
    
    console.log('\n🎉 ML Predictor test completed successfully!')
    return { success: true }
    
  } catch (error) {
    console.error('❌ ML Predictor test failed:', error)
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' }
  }
}

// Export for use in development
export default testMLPredictor
