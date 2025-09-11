import { EnhancedAudioFeatureExtractor, EnhancedAudioFeatures, GenreClassificationResult } from './enhancedAudioFeatureExtractor';
import { MLGenreClassifier } from './mlGenreClassifier';

export interface EnsembleGenreDetectionOptions {
  audioFilePath: string;
  metadata?: {
    title?: string;
    description?: string;
    tags?: string[];
  };
  enableAudioAnalysis?: boolean;
  enableMetadataAnalysis?: boolean;
  enableMLAnalysis?: boolean;
  confidenceThreshold?: number;
}

export interface EnsembleGenreDetectionResult {
  primaryGenre: string;
  subGenres: string[];
  confidence: number;
  genreProbabilities: { [genre: string]: number };
  method: 'ensemble' | 'audio' | 'metadata' | 'ml';
  features?: EnhancedAudioFeatures;
  analysisDetails: {
    audioAnalysis?: GenreClassificationResult;
    metadataAnalysis?: GenreClassificationResult;
    mlAnalysis?: GenreClassificationResult;
    ensembleScore: number;
    validationPassed: boolean;
  };
  recommendations: {
    genreAlignment: number;
    marketPotential: number;
    seasonalFactors: { [month: string]: number };
    optimizationTips: string[];
  };
}

export class EnsembleGenreDetectionService {
  private audioFeatureExtractor: EnhancedAudioFeatureExtractor;
  private mlClassifier: MLGenreClassifier;
  private readonly DEFAULT_CONFIDENCE_THRESHOLD = 0.4;
  private readonly MIN_FEATURES_FOR_ANALYSIS = 5;

  constructor() {
    this.audioFeatureExtractor = new EnhancedAudioFeatureExtractor();
    this.mlClassifier = new MLGenreClassifier();
  }

  async detectGenre(options: EnsembleGenreDetectionOptions): Promise<EnsembleGenreDetectionResult> {
    try {
      console.log('🎵 Starting ensemble genre detection...');
      
      const {
        audioFilePath,
        metadata,
        enableAudioAnalysis = true,
        enableMetadataAnalysis = true,
        enableMLAnalysis = true,
        confidenceThreshold = this.DEFAULT_CONFIDENCE_THRESHOLD
      } = options;

      const analysisResults: { [key: string]: GenreClassificationResult } = {};
      let features: EnhancedAudioFeatures | undefined;

      // 1. Audio-based analysis
      if (enableAudioAnalysis) {
        try {
          console.log('🔊 Extracting enhanced audio features...');
          features = await this.audioFeatureExtractor.extractFeatures(audioFilePath);
          
          console.log('🎯 Performing audio-based genre classification...');
          analysisResults.audio = await this.mlClassifier.classifyGenre(features, metadata);
          
          console.log(`✅ Audio analysis complete: ${analysisResults.audio.primaryGenre} (${analysisResults.audio.confidence.toFixed(3)})`);
        } catch (error) {
          console.warn('⚠️ Audio analysis failed:', error);
        }
      }

      // 2. Metadata-based analysis
      if (enableMetadataAnalysis && metadata) {
        try {
          console.log('📝 Performing metadata-based genre classification...');
          analysisResults.metadata = await this.mlClassifier.classifyGenre(
            this.createDummyFeatures(), 
            metadata
          );
          
          console.log(`✅ Metadata analysis complete: ${analysisResults.metadata.primaryGenre} (${analysisResults.metadata.confidence.toFixed(3)})`);
        } catch (error) {
          console.warn('⚠️ Metadata analysis failed:', error);
        }
      }

      // 3. ML-based analysis (if we have features)
      if (enableMLAnalysis && features) {
        try {
          console.log('🤖 Performing ML-based genre classification...');
          analysisResults.ml = await this.mlClassifier.classifyGenre(features, metadata);
          
          console.log(`✅ ML analysis complete: ${analysisResults.ml.primaryGenre} (${analysisResults.ml.confidence.toFixed(3)})`);
        } catch (error) {
          console.warn('⚠️ ML analysis failed:', error);
        }
      }

      // 4. Ensemble combination
      const ensembleResult = this.combineAnalysisResults(analysisResults, features);
      
      // 5. Validation
      const validationPassed = this.validateEnsembleResult(ensembleResult, confidenceThreshold);
      
      // 6. Generate recommendations
      const recommendations = this.generateRecommendations(ensembleResult, features);

      console.log(`🎉 Ensemble detection complete: ${ensembleResult.primaryGenre} (${ensembleResult.confidence.toFixed(3)})`);

      return {
        primaryGenre: ensembleResult.primaryGenre,
        subGenres: ensembleResult.subGenres,
        confidence: ensembleResult.confidence,
        genreProbabilities: ensembleResult.genreProbabilities,
        method: ensembleResult.method,
        features,
        analysisDetails: {
          audioAnalysis: analysisResults.audio,
          metadataAnalysis: analysisResults.metadata,
          mlAnalysis: analysisResults.ml,
          ensembleScore: ensembleResult.confidence,
          validationPassed
        },
        recommendations
      };

    } catch (error) {
      console.error('❌ Ensemble genre detection failed:', error);
      throw new Error(`Ensemble genre detection failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  private combineAnalysisResults(
    analysisResults: { [key: string]: GenreClassificationResult },
    features?: EnhancedAudioFeatures
  ): GenreClassificationResult {
    const availableMethods = Object.keys(analysisResults);
    
    if (availableMethods.length === 0) {
      throw new Error('No analysis methods available');
    }

    if (availableMethods.length === 1) {
      const method = availableMethods[0];
      return {
        ...analysisResults[method],
        method: method as 'audio' | 'metadata' | 'ensemble'
      };
    }

    // Ensemble combination
    const ensembleWeights = this.calculateEnsembleWeights(analysisResults, features);
    const combinedProbabilities: { [genre: string]: number } = {};
    const allGenres = new Set<string>();

    // Collect all genres from all methods
    for (const result of Object.values(analysisResults)) {
      Object.keys(result.genreProbabilities).forEach(genre => allGenres.add(genre));
    }

    // Calculate weighted average probabilities
    for (const genre of allGenres) {
      let weightedSum = 0;
      let totalWeight = 0;

      for (const [method, result] of Object.entries(analysisResults)) {
        const weight = ensembleWeights[method];
        const probability = result.genreProbabilities[genre] || 0;
        
        weightedSum += probability * weight;
        totalWeight += weight;
      }

      combinedProbabilities[genre] = totalWeight > 0 ? weightedSum / totalWeight : 0;
    }

    // Find best genre
    const sortedGenres = Object.entries(combinedProbabilities)
      .sort(([,a], [,b]) => b - a);

    const primaryGenre = sortedGenres[0][0];
    const confidence = sortedGenres[0][1];

    // Determine sub-genres
    const subGenres = this.determineSubGenres(combinedProbabilities, primaryGenre);

    return {
      primaryGenre,
      subGenres,
      confidence,
      genreProbabilities: combinedProbabilities,
      method: 'ensemble',
      features
    };
  }

  private calculateEnsembleWeights(
    analysisResults: { [key: string]: GenreClassificationResult },
    features?: EnhancedAudioFeatures
  ): { [method: string]: number } {
    const weights: { [method: string]: number } = {};

    // Base weights
    const baseWeights = {
      audio: 0.4,
      ml: 0.3,
      metadata: 0.2,
      ensemble: 0.1
    };

    // Adjust weights based on confidence and feature quality
    for (const [method, result] of Object.entries(analysisResults)) {
      let weight = baseWeights[method as keyof typeof baseWeights] || 0.1;
      
      // Boost weight for high confidence
      if (result.confidence > 0.7) {
        weight *= 1.2;
      } else if (result.confidence < 0.3) {
        weight *= 0.5;
      }

      // Boost weight for audio analysis if we have good features
      if (method === 'audio' && features && this.hasGoodFeatures(features)) {
        weight *= 1.3;
      }

      // Boost weight for ML analysis if we have comprehensive features
      if (method === 'ml' && features && this.hasComprehensiveFeatures(features)) {
        weight *= 1.2;
      }

      weights[method] = Math.max(0.05, Math.min(0.8, weight)); // Clamp between 0.05 and 0.8
    }

    // Normalize weights
    const totalWeight = Object.values(weights).reduce((sum, w) => sum + w, 0);
    for (const method in weights) {
      weights[method] = weights[method] / totalWeight;
    }

    return weights;
  }

  private hasGoodFeatures(features: EnhancedAudioFeatures): boolean {
    const requiredFeatures = [
      'tempo', 'danceability', 'energy', 'valence', 'acousticness',
      'spectralCentroid', 'rhythmStrength', 'harmonicComplexity'
    ];

    let validFeatures = 0;
    for (const feature of requiredFeatures) {
      const value = (features as any)[feature];
      if (value !== undefined && value !== null && !isNaN(value)) {
        validFeatures++;
      }
    }

    return validFeatures >= this.MIN_FEATURES_FOR_ANALYSIS;
  }

  private hasComprehensiveFeatures(features: EnhancedAudioFeatures): boolean {
    const comprehensiveFeatures = [
      'tempo', 'danceability', 'energy', 'valence', 'acousticness',
      'spectralCentroid', 'spectralRolloff', 'spectralFlatness', 'spectralBandwidth',
      'rhythmStrength', 'beatConfidence', 'onsetRate', 'harmonicComplexity',
      'dynamicRange', 'zeroCrossingRate', 'speechiness', 'instrumentalness'
    ];

    let validFeatures = 0;
    for (const feature of comprehensiveFeatures) {
      const value = (features as any)[feature];
      if (value !== undefined && value !== null && !isNaN(value)) {
        validFeatures++;
      }
    }

    return validFeatures >= comprehensiveFeatures.length * 0.8; // 80% of features available
  }

  private determineSubGenres(probabilities: { [genre: string]: number }, primaryGenre: string): string[] {
    const subGenres: string[] = [];
    const sortedGenres = Object.entries(probabilities)
      .filter(([genre]) => genre !== primaryGenre)
      .sort(([,a], [,b]) => b - a);

    // Add sub-genres with confidence > 0.25
    for (const [genre, confidence] of sortedGenres) {
      if (confidence > 0.25 && subGenres.length < 3) {
        subGenres.push(genre);
      }
    }

    return subGenres;
  }

  private validateEnsembleResult(result: GenreClassificationResult, threshold: number): boolean {
    // Check confidence threshold
    if (result.confidence < threshold) {
      return false;
    }

    // Check if we have a reasonable genre distribution
    const probabilities = Object.values(result.genreProbabilities);
    const maxProb = Math.max(...probabilities);
    const secondMaxProb = probabilities.sort((a, b) => b - a)[1] || 0;

    // Ensure there's a clear winner (not too close to second place)
    if (maxProb - secondMaxProb < 0.1) {
      return false;
    }

    // Check if primary genre is in top 3
    const sortedGenres = Object.entries(result.genreProbabilities)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 3)
      .map(([genre]) => genre);

    return sortedGenres.includes(result.primaryGenre);
  }

  private generateRecommendations(
    result: GenreClassificationResult,
    features?: EnhancedAudioFeatures
  ): {
    genreAlignment: number;
    marketPotential: number;
    seasonalFactors: { [month: string]: number };
    optimizationTips: string[];
  } {
    const genreProfile = this.mlClassifier.getGenreProfile(result.primaryGenre);
    
    if (!genreProfile) {
      return {
        genreAlignment: 0.5,
        marketPotential: 0.5,
        seasonalFactors: {},
        optimizationTips: ['Genre profile not available']
      };
    }

    // Calculate genre alignment
    const genreAlignment = this.calculateGenreAlignment(result, features, genreProfile);
    
    // Calculate market potential
    const marketPotential = this.calculateMarketPotential(genreProfile, result.confidence);
    
    // Get seasonal factors
    const seasonalFactors = genreProfile.seasonalFactors;
    
    // Generate optimization tips
    const optimizationTips = this.generateOptimizationTips(result, features, genreProfile);

    return {
      genreAlignment,
      marketPotential,
      seasonalFactors,
      optimizationTips
    };
  }

  private calculateGenreAlignment(
    result: GenreClassificationResult,
    features: EnhancedAudioFeatures | undefined,
    profile: any
  ): number {
    if (!features) return 0.5;

    let alignment = 0;
    let totalWeight = 0;

    for (const [feature, weight] of Object.entries(profile.weights)) {
      const featureValue = (features as any)[feature];
      if (featureValue !== undefined) {
        const normalizedValue = this.normalizeFeatureValue(featureValue, feature);
        const threshold = profile.thresholds[feature];
        
        if (threshold) {
          const thresholdScore = this.calculateThresholdScore(normalizedValue, threshold);
          alignment += (thresholdScore as number) * (weight as number);
        } else {
          alignment += (normalizedValue as number) * (weight as number);
        }
        
        totalWeight += (weight as number);
      }
    }

    return totalWeight > 0 ? alignment / totalWeight : 0.5;
  }

  private calculateMarketPotential(profile: any, confidence: number): number {
    const basePotential = profile.marketShare * 100;
    const confidenceMultiplier = 0.5 + (confidence * 0.5); // 0.5 to 1.0
    const growthMultiplier = 1 + (profile.growthRate * 0.5); // Growth rate impact
    
    return Math.min(100, basePotential * confidenceMultiplier * growthMultiplier);
  }

  private generateOptimizationTips(
    result: GenreClassificationResult,
    features: EnhancedAudioFeatures | undefined,
    profile: any
  ): string[] {
    const tips: string[] = [];

    // Confidence-based tips
    if (result.confidence < 0.5) {
      tips.push('Consider providing more metadata (title, description, tags) for better classification');
      tips.push('Ensure audio quality is high for more accurate analysis');
    }

    // Genre-specific tips
    if (result.primaryGenre === 'Pop') {
      tips.push('Focus on high danceability and energy for pop success');
      tips.push('Keep tempo between 100-140 BPM for optimal pop appeal');
    } else if (result.primaryGenre === 'Rock') {
      tips.push('Maintain high energy and dynamic range for rock impact');
      tips.push('Consider guitar-driven arrangements for authentic rock sound');
    } else if (result.primaryGenre === 'Hip-Hop') {
      tips.push('Emphasize rhythm and beat consistency for hip-hop');
      tips.push('Consider vocal delivery and lyrical content');
    } else if (result.primaryGenre === 'Electronic') {
      tips.push('Focus on electronic elements and high energy');
      tips.push('Consider dance-friendly tempo and rhythm');
    }

    // Feature-based tips
    if (features) {
      if (features.danceability < 0.5) {
        tips.push('Consider increasing danceability for broader appeal');
      }
      if (features.energy < 0.5) {
        tips.push('Boost energy levels for more engaging sound');
      }
      if (features.acousticness > 0.8 && result.primaryGenre !== 'Folk' && result.primaryGenre !== 'Country') {
        tips.push('Consider adding electronic elements for modern appeal');
      }
    }

    // Market-based tips
    if (profile.growthRate < 0) {
      tips.push('This genre is declining - consider modernizing the sound');
    } else if (profile.growthRate > 0.1) {
      tips.push('This genre is growing - great timing for release');
    }

    return tips.length > 0 ? tips : ['Continue creating music in your identified genre'];
  }

  private normalizeFeatureValue(value: number, featureName: string): number {
    // Same normalization logic as in MLGenreClassifier
    const normalizations: { [key: string]: { min: number; max: number } } = {
      tempo: { min: 60, max: 200 },
      danceability: { min: 0, max: 1 },
      energy: { min: 0, max: 1 },
      valence: { min: 0, max: 1 },
      acousticness: { min: 0, max: 1 },
      spectralCentroid: { min: 0, max: 10000 },
      rhythmStrength: { min: 0, max: 1 },
      harmonicComplexity: { min: 0, max: 1 },
      dynamicRange: { min: 0, max: 1 },
      zeroCrossingRate: { min: 0, max: 1 },
      speechiness: { min: 0, max: 1 },
      instrumentalness: { min: 0, max: 1 },
      liveness: { min: 0, max: 1 }
    };
    
    const norm = normalizations[featureName];
    if (norm) {
      return Math.max(0, Math.min(1, (value - norm.min) / (norm.max - norm.min)));
    }
    
    return Math.max(0, Math.min(1, value));
  }

  private calculateThresholdScore(value: number, threshold: { min: number; max: number }): number {
    if (value >= threshold.min && value <= threshold.max) {
      return 1.0;
    } else if (value < threshold.min) {
      return Math.max(0, value / threshold.min);
    } else {
      return Math.max(0, 1 - (value - threshold.max) / (1 - threshold.max));
    }
  }

  private createDummyFeatures(): EnhancedAudioFeatures {
    // Create dummy features for metadata-only analysis
    return {
      tempo: 120,
      key: 'C',
      mode: 1,
      loudness: 0,
      duration: 0,
      spectralCentroid: 3000,
      spectralRolloff: 0.5,
      spectralFlatness: 0.5,
      spectralBandwidth: 1000,
      zeroCrossingRate: 0.1,
      rhythmStrength: 0.5,
      beatConfidence: 0.5,
      onsetRate: 0.1,
      keyConfidence: 0.5,
      harmonicComplexity: 0.5,
      pitchVariability: 0.5,
      rms: 0,
      dynamicRange: 0.5,
      crestFactor: 0.5,
      danceability: 0.5,
      energy: 0.5,
      valence: 0.5,
      acousticness: 0.5,
      instrumentalness: 0.5,
      liveness: 0.5,
      speechiness: 0.5,
      rockness: 0,
      popness: 0,
      electronicness: 0,
      jazzness: 0,
      classicalness: 0,
      hiphopness: 0,
      countryness: 0,
      folkness: 0,
      metalness: 0,
      rnbness: 0
    };
  }

  // Public methods for external use
  async getGenreProfile(genre: string) {
    return this.mlClassifier.getGenreProfile(genre);
  }

  getAvailableGenres(): string[] {
    return this.mlClassifier.getAvailableGenres();
  }

  async validateGenreClassification(result: EnsembleGenreDetectionResult): Promise<boolean> {
    return this.mlClassifier.validateClassification({
      primaryGenre: result.primaryGenre,
      subGenres: result.subGenres,
      confidence: result.confidence,
      genreProbabilities: result.genreProbabilities,
      method: result.method as 'audio' | 'metadata' | 'ensemble',
      features: result.features
    });
  }
}
