import { EnhancedAudioFeatures, GenreClassificationResult } from './enhancedAudioFeatureExtractor';

export interface GenreProfile {
  name: string;
  weights: { [feature: string]: number };
  thresholds: { [feature: string]: { min: number; max: number } };
  marketShare: number;
  growthRate: number;
  seasonalFactors: { [month: string]: number };
}

export class MLGenreClassifier {
  private genreProfiles: Map<string, GenreProfile> = new Map();
  private readonly MIN_CONFIDENCE_THRESHOLD = 0.3;
  private readonly ENSEMBLE_WEIGHTS = {
    audio: 0.6,
    metadata: 0.2,
    ensemble: 0.2
  };

  constructor() {
    this.initializeGenreProfiles();
  }

  private initializeGenreProfiles(): void {
    // Pop
    this.genreProfiles.set('Pop', {
      name: 'Pop',
      weights: {
        danceability: 0.20,
        energy: 0.15,
        valence: 0.10,
        acousticness: 0.10,
        tempo: 0.15,
        spectralCentroid: 0.10,
        rhythmStrength: 0.10,
        harmonicComplexity: 0.10
      },
      thresholds: {
        danceability: { min: 0.6, max: 1.0 },
        energy: { min: 0.5, max: 1.0 },
        valence: { min: 0.4, max: 1.0 },
        acousticness: { min: 0.0, max: 0.4 },
        tempo: { min: 100, max: 140 },
        spectralCentroid: { min: 2000, max: 6000 }
      },
      marketShare: 0.35,
      growthRate: 0.08,
      seasonalFactors: {
        '0': 0.95, '1': 0.90, '2': 0.95, '3': 1.05, '4': 1.10, '5': 1.15,
        '6': 1.20, '7': 1.15, '8': 1.10, '9': 1.05, '10': 1.00, '11': 0.95
      }
    });

    // Rock
    this.genreProfiles.set('Rock', {
      name: 'Rock',
      weights: {
        energy: 0.20,
        tempo: 0.10,
        valence: 0.10,
        acousticness: 0.10,
        spectralCentroid: 0.15,
        rhythmStrength: 0.15,
        harmonicComplexity: 0.10,
        dynamicRange: 0.10
      },
      thresholds: {
        energy: { min: 0.7, max: 1.0 },
        tempo: { min: 120, max: 180 },
        valence: { min: 0.2, max: 0.8 },
        acousticness: { min: 0.0, max: 0.3 },
        spectralCentroid: { min: 3000, max: 8000 }
      },
      marketShare: 0.20,
      growthRate: -0.02,
      seasonalFactors: {
        '0': 1.10, '1': 1.05, '2': 1.00, '3': 0.95, '4': 0.90, '5': 0.85,
        '6': 0.80, '7': 0.85, '8': 0.90, '9': 0.95, '10': 1.00, '11': 1.05
      }
    });

    // Hip-Hop
    this.genreProfiles.set('Hip-Hop', {
      name: 'Hip-Hop',
      weights: {
        danceability: 0.20,
        energy: 0.15,
        valence: 0.10,
        acousticness: 0.10,
        speechiness: 0.15,
        rhythmStrength: 0.10,
        zeroCrossingRate: 0.10,
        tempo: 0.10
      },
      thresholds: {
        danceability: { min: 0.7, max: 1.0 },
        energy: { min: 0.6, max: 1.0 },
        valence: { min: 0.3, max: 0.9 },
        acousticness: { min: 0.0, max: 0.2 },
        speechiness: { min: 0.1, max: 0.8 },
        tempo: { min: 80, max: 120 }
      },
      marketShare: 0.25,
      growthRate: 0.15,
      seasonalFactors: {
        '0': 1.05, '1': 1.00, '2': 0.95, '3': 0.90, '4': 0.95, '5': 1.00,
        '6': 1.05, '7': 1.10, '8': 1.15, '9': 1.10, '10': 1.05, '11': 1.00
      }
    });

    // Electronic
    this.genreProfiles.set('Electronic', {
      name: 'Electronic',
      weights: {
        danceability: 0.20,
        energy: 0.15,
        valence: 0.10,
        acousticness: 0.10,
        spectralCentroid: 0.15,
        rhythmStrength: 0.10,
        harmonicComplexity: 0.10,
        tempo: 0.10
      },
      thresholds: {
        danceability: { min: 0.7, max: 1.0 },
        energy: { min: 0.6, max: 1.0 },
        valence: { min: 0.3, max: 0.9 },
        acousticness: { min: 0.0, max: 0.1 },
        spectralCentroid: { min: 4000, max: 10000 },
        tempo: { min: 120, max: 200 }
      },
      marketShare: 0.15,
      growthRate: 0.12,
      seasonalFactors: {
        '0': 0.90, '1': 0.85, '2': 0.90, '3': 0.95, '4': 1.00, '5': 1.05,
        '6': 1.15, '7': 1.20, '8': 1.15, '9': 1.10, '10': 1.05, '11': 1.00
      }
    });

    // Country
    this.genreProfiles.set('Country', {
      name: 'Country',
      weights: {
        acousticness: 0.20,
        tempo: 0.10,
        danceability: 0.10,
        energy: 0.10,
        valence: 0.10,
        spectralCentroid: 0.15,
        rhythmStrength: 0.10,
        harmonicComplexity: 0.15
      },
      thresholds: {
        acousticness: { min: 0.6, max: 1.0 },
        tempo: { min: 80, max: 140 },
        danceability: { min: 0.4, max: 0.8 },
        energy: { min: 0.3, max: 0.8 },
        valence: { min: 0.4, max: 0.9 },
        spectralCentroid: { min: 1000, max: 4000 }
      },
      marketShare: 0.10,
      growthRate: 0.03,
      seasonalFactors: {
        '0': 1.00, '1': 0.95, '2': 0.90, '3': 0.95, '4': 1.00, '5': 1.05,
        '6': 1.10, '7': 1.15, '8': 1.10, '9': 1.05, '10': 1.00, '11': 0.95
      }
    });

    // Jazz
    this.genreProfiles.set('Jazz', {
      name: 'Jazz',
      weights: {
        acousticness: 0.15,
        harmonicComplexity: 0.20,
        dynamicRange: 0.15,
        tempo: 0.05,
        danceability: 0.10,
        energy: 0.10,
        valence: 0.10,
        spectralCentroid: 0.15
      },
      thresholds: {
        acousticness: { min: 0.7, max: 1.0 },
        harmonicComplexity: { min: 0.6, max: 1.0 },
        dynamicRange: { min: 0.7, max: 1.0 },
        tempo: { min: 60, max: 200 },
        spectralCentroid: { min: 1500, max: 5000 }
      },
      marketShare: 0.05,
      growthRate: 0.02,
      seasonalFactors: {
        '0': 1.05, '1': 1.00, '2': 0.95, '3': 0.90, '4': 0.95, '5': 1.00,
        '6': 1.05, '7': 1.10, '8': 1.05, '9': 1.00, '10': 0.95, '11': 1.00
      }
    });

    // Classical
    this.genreProfiles.set('Classical', {
      name: 'Classical',
      weights: {
        acousticness: 0.20,
        harmonicComplexity: 0.20,
        dynamicRange: 0.15,
        tempo: 0.05,
        danceability: 0.05,
        energy: 0.10,
        valence: 0.10,
        spectralCentroid: 0.15
      },
      thresholds: {
        acousticness: { min: 0.9, max: 1.0 },
        harmonicComplexity: { min: 0.8, max: 1.0 },
        dynamicRange: { min: 0.8, max: 1.0 },
        tempo: { min: 40, max: 200 },
        spectralCentroid: { min: 1000, max: 4000 }
      },
      marketShare: 0.03,
      growthRate: 0.01,
      seasonalFactors: {
        '0': 1.10, '1': 1.05, '2': 1.00, '3': 0.95, '4': 0.90, '5': 0.85,
        '6': 0.80, '7': 0.85, '8': 0.90, '9': 0.95, '10': 1.00, '11': 1.05
      }
    });

    // Metal
    this.genreProfiles.set('Metal', {
      name: 'Metal',
      weights: {
        energy: 0.20,
        tempo: 0.10,
        valence: 0.10,
        acousticness: 0.10,
        spectralCentroid: 0.15,
        rhythmStrength: 0.15,
        harmonicComplexity: 0.10,
        dynamicRange: 0.10
      },
      thresholds: {
        energy: { min: 0.8, max: 1.0 },
        tempo: { min: 140, max: 300 },
        valence: { min: 0.0, max: 0.4 },
        acousticness: { min: 0.0, max: 0.1 },
        spectralCentroid: { min: 5000, max: 12000 }
      },
      marketShare: 0.08,
      growthRate: 0.05,
      seasonalFactors: {
        '0': 1.00, '1': 0.95, '2': 0.90, '3': 0.95, '4': 1.00, '5': 1.05,
        '6': 1.10, '7': 1.15, '8': 1.10, '9': 1.05, '10': 1.00, '11': 0.95
      }
    });

    // R&B
    this.genreProfiles.set('R&B', {
      name: 'R&B',
      weights: {
        danceability: 0.15,
        energy: 0.10,
        valence: 0.10,
        acousticness: 0.10,
        speechiness: 0.15,
        rhythmStrength: 0.10,
        harmonicComplexity: 0.20,
        tempo: 0.10
      },
      thresholds: {
        danceability: { min: 0.6, max: 0.9 },
        energy: { min: 0.4, max: 0.8 },
        valence: { min: 0.3, max: 0.8 },
        acousticness: { min: 0.1, max: 0.6 },
        speechiness: { min: 0.1, max: 0.6 },
        tempo: { min: 70, max: 120 }
      },
      marketShare: 0.12,
      growthRate: 0.08,
      seasonalFactors: {
        '0': 1.00, '1': 0.95, '2': 0.90, '3': 0.95, '4': 1.00, '5': 1.05,
        '6': 1.10, '7': 1.15, '8': 1.10, '9': 1.05, '10': 1.00, '11': 0.95
      }
    });

    // Folk
    this.genreProfiles.set('Folk', {
      name: 'Folk',
      weights: {
        acousticness: 0.20,
        tempo: 0.10,
        danceability: 0.10,
        energy: 0.10,
        valence: 0.10,
        spectralCentroid: 0.15,
        rhythmStrength: 0.10,
        harmonicComplexity: 0.15
      },
      thresholds: {
        acousticness: { min: 0.8, max: 1.0 },
        tempo: { min: 60, max: 120 },
        danceability: { min: 0.3, max: 0.7 },
        energy: { min: 0.2, max: 0.6 },
        valence: { min: 0.3, max: 0.8 },
        spectralCentroid: { min: 800, max: 3000 }
      },
      marketShare: 0.05,
      growthRate: 0.03,
      seasonalFactors: {
        '0': 0.95, '1': 0.90, '2': 0.95, '3': 1.00, '4': 1.05, '5': 1.10,
        '6': 1.15, '7': 1.10, '8': 1.05, '9': 1.00, '10': 0.95, '11': 0.90
      }
    });
  }

  async classifyGenre(
    audioFeatures: EnhancedAudioFeatures,
    metadata?: { title?: string; description?: string; tags?: string[] }
  ): Promise<GenreClassificationResult> {
    try {
      console.log('🎯 Starting ML genre classification...');
      
      // Calculate genre probabilities using multiple methods
      const audioProbabilities = this.calculateAudioBasedProbabilities(audioFeatures);
      const metadataProbabilities = metadata ? this.calculateMetadataBasedProbabilities(metadata) : {};
      const ensembleProbabilities = this.calculateEnsembleProbabilities(audioFeatures, metadata);
      
      // Combine probabilities using ensemble weights
      const finalProbabilities = this.combineProbabilities(
        audioProbabilities,
        metadataProbabilities,
        ensembleProbabilities
      );
      
      // Find best genre
      const sortedGenres = Object.entries(finalProbabilities)
        .sort(([,a], [,b]) => b - a);
      
      const primaryGenre = sortedGenres[0][0];
      const confidence = sortedGenres[0][1];
      
      // Determine sub-genres
      const subGenres = this.determineSubGenres(finalProbabilities, primaryGenre);
      
      // Determine method used
      const method = this.determineClassificationMethod(audioProbabilities, metadataProbabilities, ensembleProbabilities);
      
      console.log(`✅ Genre classified as: ${primaryGenre} (confidence: ${confidence.toFixed(3)})`);
      
      return {
        primaryGenre,
        subGenres,
        confidence,
        genreProbabilities: finalProbabilities,
        method,
        features: audioFeatures
      };
      
    } catch (error) {
      console.error('❌ ML genre classification failed:', error);
      throw new Error(`ML genre classification failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  private calculateAudioBasedProbabilities(audioFeatures: EnhancedAudioFeatures): { [genre: string]: number } {
    const probabilities: { [genre: string]: number } = {};
    
    for (const [genreName, profile] of this.genreProfiles) {
      let score = 0;
      let totalWeight = 0;
      
      for (const [featureName, weight] of Object.entries(profile.weights)) {
        const featureValue = this.getFeatureValue(audioFeatures, featureName);
        if (featureValue !== undefined) {
          const normalizedValue = this.normalizeFeatureValue(featureValue, featureName);
          const threshold = profile.thresholds[featureName];
          
          if (threshold) {
            const thresholdScore = this.calculateThresholdScore(normalizedValue, threshold);
            score += thresholdScore * weight;
          } else {
            score += normalizedValue * weight;
          }
          
          totalWeight += weight;
        }
      }
      
      // Apply market and seasonal adjustments
      const marketAdjustment = profile.marketShare * 0.1;
      const seasonalAdjustment = this.getSeasonalAdjustment(profile);
      
      probabilities[genreName] = Math.max(0, Math.min(1, 
        (score / totalWeight) + marketAdjustment + seasonalAdjustment
      ));
    }
    
    return this.normalizeProbabilities(probabilities);
  }

  private calculateMetadataBasedProbabilities(metadata: { title?: string; description?: string; tags?: string[] }): { [genre: string]: number } {
    const text = `${metadata.title || ''} ${metadata.description || ''} ${(metadata.tags || []).join(' ')}`.toLowerCase();
    const probabilities: { [genre: string]: number } = {};
    
    // Genre-specific keyword matching
    const genreKeywords = {
      'Pop': ['pop', 'mainstream', 'radio', 'hit', 'chart', 'top 40'],
      'Rock': ['rock', 'alternative', 'indie', 'guitar', 'electric', 'band'],
      'Hip-Hop': ['hip hop', 'rap', 'trap', 'beats', 'rhythm', 'urban'],
      'Electronic': ['electronic', 'edm', 'dance', 'synth', 'techno', 'house'],
      'Country': ['country', 'folk', 'acoustic', 'guitar', 'southern', 'bluegrass'],
      'Jazz': ['jazz', 'blues', 'soul', 'swing', 'bebop', 'fusion'],
      'Classical': ['classical', 'orchestral', 'symphony', 'chamber', 'baroque'],
      'Metal': ['metal', 'heavy', 'thrash', 'death', 'black', 'progressive'],
      'R&B': ['r&b', 'soul', 'funk', 'motown', 'neo soul'],
      'Folk': ['folk', 'acoustic', 'traditional', 'americana', 'indie folk']
    };
    
    for (const [genre, keywords] of Object.entries(genreKeywords)) {
      let score = 0;
      for (const keyword of keywords) {
        if (text.includes(keyword)) {
          score += 1;
        }
      }
      probabilities[genre] = Math.min(1, score / keywords.length);
    }
    
    return this.normalizeProbabilities(probabilities);
  }

  private calculateEnsembleProbabilities(
    audioFeatures: EnhancedAudioFeatures,
    metadata?: { title?: string; description?: string; tags?: string[] }
  ): { [genre: string]: number } {
    // Use genre-specific features for ensemble classification
    const probabilities: { [genre: string]: number } = {};
    
    const genreSpecificFeatures = {
      'Pop': audioFeatures.popness || 0,
      'Rock': audioFeatures.rockness || 0,
      'Hip-Hop': audioFeatures.hiphopness || 0,
      'Electronic': audioFeatures.electronicness || 0,
      'Country': audioFeatures.countryness || 0,
      'Jazz': audioFeatures.jazzness || 0,
      'Classical': audioFeatures.classicalness || 0,
      'Metal': audioFeatures.metalness || 0,
      'R&B': audioFeatures.rnbness || 0,
      'Folk': audioFeatures.folkness || 0
    };
    
    for (const [genre, score] of Object.entries(genreSpecificFeatures)) {
      probabilities[genre] = score;
    }
    
    return this.normalizeProbabilities(probabilities);
  }

  private combineProbabilities(
    audioProbs: { [genre: string]: number },
    metadataProbs: { [genre: string]: number },
    ensembleProbs: { [genre: string]: number }
  ): { [genre: string]: number } {
    const combined: { [genre: string]: number } = {};
    const allGenres = new Set([
      ...Object.keys(audioProbs),
      ...Object.keys(metadataProbs),
      ...Object.keys(ensembleProbs)
    ]);
    
    for (const genre of allGenres) {
      const audioScore = audioProbs[genre] || 0;
      const metadataScore = metadataProbs[genre] || 0;
      const ensembleScore = ensembleProbs[genre] || 0;
      
      combined[genre] = 
        audioScore * this.ENSEMBLE_WEIGHTS.audio +
        metadataScore * this.ENSEMBLE_WEIGHTS.metadata +
        ensembleScore * this.ENSEMBLE_WEIGHTS.ensemble;
    }
    
    return this.normalizeProbabilities(combined);
  }

  private determineSubGenres(probabilities: { [genre: string]: number }, primaryGenre: string): string[] {
    const subGenres: string[] = [];
    const sortedGenres = Object.entries(probabilities)
      .filter(([genre]) => genre !== primaryGenre)
      .sort(([,a], [,b]) => b - a);
    
    // Add sub-genres with confidence > 0.3
    for (const [genre, confidence] of sortedGenres) {
      if (confidence > 0.3 && subGenres.length < 3) {
        subGenres.push(genre);
      }
    }
    
    return subGenres;
  }

  private determineClassificationMethod(
    audioProbs: { [genre: string]: number },
    metadataProbs: { [genre: string]: number },
    ensembleProbs: { [genre: string]: number }
  ): 'audio' | 'metadata' | 'ensemble' {
    const audioMax = Math.max(...Object.values(audioProbs));
    const metadataMax = Math.max(...Object.values(metadataProbs));
    const ensembleMax = Math.max(...Object.values(ensembleProbs));
    
    if (audioMax >= metadataMax && audioMax >= ensembleMax) {
      return 'audio';
    } else if (metadataMax >= ensembleMax) {
      return 'metadata';
    } else {
      return 'ensemble';
    }
  }

  private getFeatureValue(audioFeatures: EnhancedAudioFeatures, featureName: string): number | undefined {
    return (audioFeatures as any)[featureName];
  }

  private normalizeFeatureValue(value: number, featureName: string): number {
    // Normalize feature values to 0-1 range based on typical ranges
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
      return 1.0; // Perfect match
    } else if (value < threshold.min) {
      return Math.max(0, value / threshold.min); // Partial match below
    } else {
      return Math.max(0, 1 - (value - threshold.max) / (1 - threshold.max)); // Partial match above
    }
  }

  private getSeasonalAdjustment(profile: GenreProfile): number {
    const currentMonth = new Date().getMonth().toString();
    const seasonalFactor = profile.seasonalFactors[currentMonth] || 1.0;
    return (seasonalFactor - 1.0) * 0.1; // Convert to adjustment factor
  }

  private normalizeProbabilities(probabilities: { [genre: string]: number }): { [genre: string]: number } {
    const total = Object.values(probabilities).reduce((sum, val) => sum + val, 0);
    if (total === 0) return probabilities;
    
    const normalized: { [genre: string]: number } = {};
    for (const [genre, value] of Object.entries(probabilities)) {
      normalized[genre] = value / total;
    }
    
    return normalized;
  }

  // Public method to get genre profile for external use
  getGenreProfile(genre: string): GenreProfile | undefined {
    return this.genreProfiles.get(genre);
  }

  // Public method to get all available genres
  getAvailableGenres(): string[] {
    return Array.from(this.genreProfiles.keys());
  }

  // Public method to validate classification confidence
  validateClassification(result: GenreClassificationResult): boolean {
    return result.confidence >= this.MIN_CONFIDENCE_THRESHOLD;
  }
}
