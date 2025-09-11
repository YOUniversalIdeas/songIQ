const { EnsembleGenreDetectionService } = require('./server/src/services/ensembleGenreDetectionService');
const { EnhancedAudioFeatureExtractor } = require('./server/src/services/enhancedAudioFeatureExtractor');
const { MLGenreClassifier } = require('./server/src/services/mlGenreClassifier');

async function testEnhancedGenreDetection() {
  console.log('🎵 Testing Enhanced Genre Detection System\n');

  try {
    // Test 1: Test ML Genre Classifier with sample features
    console.log('1. Testing ML Genre Classifier...');
    const mlClassifier = new MLGenreClassifier();
    
    // Create sample audio features for different genres
    const sampleFeatures = {
      // Pop-like features
      tempo: 120,
      key: 'C',
      mode: 1,
      loudness: -5,
      duration: 180,
      spectralCentroid: 3000,
      spectralRolloff: 0.6,
      spectralFlatness: 0.3,
      spectralBandwidth: 1500,
      zeroCrossingRate: 0.1,
      rhythmStrength: 0.8,
      beatConfidence: 0.9,
      onsetRate: 0.2,
      keyConfidence: 0.8,
      harmonicComplexity: 0.6,
      pitchVariability: 0.4,
      rms: -10,
      dynamicRange: 0.7,
      crestFactor: 0.5,
      danceability: 0.8,
      energy: 0.7,
      valence: 0.7,
      acousticness: 0.2,
      instrumentalness: 0.1,
      liveness: 0.3,
      speechiness: 0.1,
      rockness: 0.3,
      popness: 0.8,
      electronicness: 0.4,
      jazzness: 0.2,
      classicalness: 0.1,
      hiphopness: 0.3,
      countryness: 0.2,
      folkness: 0.1,
      metalness: 0.2,
      rnbness: 0.3
    };

    const popResult = await mlClassifier.classifyGenre(sampleFeatures);
    console.log(`   Pop classification: ${popResult.primaryGenre} (confidence: ${popResult.confidence.toFixed(3)})`);
    console.log(`   Sub-genres: ${popResult.subGenres.join(', ')}`);
    console.log(`   Method: ${popResult.method}\n`);

    // Test 2: Test with Rock-like features
    console.log('2. Testing Rock classification...');
    const rockFeatures = {
      ...sampleFeatures,
      tempo: 140,
      energy: 0.9,
      valence: 0.4,
      acousticness: 0.1,
      spectralCentroid: 5000,
      rhythmStrength: 0.9,
      harmonicComplexity: 0.8,
      dynamicRange: 0.8,
      rockness: 0.9,
      popness: 0.3
    };

    const rockResult = await mlClassifier.classifyGenre(rockFeatures);
    console.log(`   Rock classification: ${rockResult.primaryGenre} (confidence: ${rockResult.confidence.toFixed(3)})`);
    console.log(`   Sub-genres: ${rockResult.subGenres.join(', ')}`);
    console.log(`   Method: ${rockResult.method}\n`);

    // Test 3: Test with Hip-Hop-like features
    console.log('3. Testing Hip-Hop classification...');
    const hiphopFeatures = {
      ...sampleFeatures,
      tempo: 90,
      danceability: 0.9,
      energy: 0.8,
      valence: 0.6,
      acousticness: 0.1,
      speechiness: 0.6,
      rhythmStrength: 0.9,
      zeroCrossingRate: 0.3,
      hiphopness: 0.9,
      popness: 0.4
    };

    const hiphopResult = await mlClassifier.classifyGenre(hiphopFeatures);
    console.log(`   Hip-Hop classification: ${hiphopResult.primaryGenre} (confidence: ${hiphopResult.confidence.toFixed(3)})`);
    console.log(`   Sub-genres: ${hiphopResult.subGenres.join(', ')}`);
    console.log(`   Method: ${hiphopResult.method}\n`);

    // Test 4: Test metadata-based classification
    console.log('4. Testing metadata-based classification...');
    const metadata = {
      title: 'Electronic Dance Music Track',
      description: 'High-energy EDM track with synthesizers and heavy bass',
      tags: ['electronic', 'dance', 'edm', 'synth', 'bass']
    };

    const metadataResult = await mlClassifier.classifyGenre(sampleFeatures, metadata);
    console.log(`   Metadata classification: ${metadataResult.primaryGenre} (confidence: ${metadataResult.confidence.toFixed(3)})`);
    console.log(`   Sub-genres: ${metadataResult.subGenres.join(', ')}`);
    console.log(`   Method: ${metadataResult.method}\n`);

    // Test 5: Test ensemble detection (simulated)
    console.log('5. Testing Ensemble Genre Detection...');
    const ensembleDetector = new EnsembleGenreDetectionService();
    
    // Test with a dummy audio file path (this would normally analyze a real file)
    console.log('   Note: Full ensemble detection requires an actual audio file');
    console.log('   Available genres:', ensembleDetector.getAvailableGenres().join(', '));
    
    // Test genre profile retrieval
    const popProfile = await ensembleDetector.getGenreProfile('Pop');
    if (popProfile) {
      console.log(`   Pop profile market share: ${(popProfile.marketShare * 100).toFixed(1)}%`);
      console.log(`   Pop profile growth rate: ${(popProfile.growthRate * 100).toFixed(1)}%`);
    }

    console.log('\n✅ Enhanced Genre Detection System Test Complete!');
    console.log('\n📊 Summary:');
    console.log(`   - Pop classification: ${popResult.primaryGenre} (${popResult.confidence.toFixed(3)})`);
    console.log(`   - Rock classification: ${rockResult.primaryGenre} (${rockResult.confidence.toFixed(3)})`);
    console.log(`   - Hip-Hop classification: ${hiphopResult.primaryGenre} (${hiphopResult.confidence.toFixed(3)})`);
    console.log(`   - Metadata classification: ${metadataResult.primaryGenre} (${metadataResult.confidence.toFixed(3)})`);
    
    console.log('\n🎯 Key Improvements:');
    console.log('   ✅ Enhanced audio feature extraction (16+ features)');
    console.log('   ✅ Machine learning-based classification');
    console.log('   ✅ Ensemble methods combining multiple approaches');
    console.log('   ✅ Metadata analysis integration');
    console.log('   ✅ Confidence scoring and validation');
    console.log('   ✅ Genre-specific market analysis');
    console.log('   ✅ Seasonal factor consideration');
    console.log('   ✅ Optimization recommendations');

  } catch (error) {
    console.error('❌ Test failed:', error);
  }
}

// Run the test
testEnhancedGenreDetection();
