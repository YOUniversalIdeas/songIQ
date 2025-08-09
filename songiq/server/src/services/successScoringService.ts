import { IAudioFeatures } from '../models/AudioFeatures';

export interface SuccessScoreResult {
  overallScore: number; // 0-100
  confidence: number; // 0-1
  breakdown: {
    audioFeatures: number;
    marketTrends: number;
    genreAlignment: number;
    seasonalFactors: number;
  };
  recommendations: Recommendation[];
  riskFactors: string[];
  marketPotential: number; // 0-100
  socialScore: number; // 0-100
}

export interface Recommendation {
  category: 'audio' | 'market' | 'timing' | 'genre';
  priority: 'high' | 'medium' | 'low';
  title: string;
  description: string;
  impact: number; // 0-100
  implementation: string;
}

export interface MarketTrends {
  trendingGenres: { [genre: string]: number };
  optimalTempo: { min: number; max: number; peak: number };
  popularKeys: { [key: string]: number };
  energyTrends: { low: number; medium: number; high: number };
  seasonalFactors: { [month: string]: number };
}

// Optimal ranges for different features based on market analysis
const OPTIMAL_RANGES = {
  danceability: { min: 0.6, max: 0.9, peak: 0.75 },
  energy: { min: 0.5, max: 0.9, peak: 0.7 },
  valence: { min: 0.4, max: 0.8, peak: 0.6 },
  acousticness: { min: 0.0, max: 0.3, peak: 0.1 },
  instrumentalness: { min: 0.0, max: 0.2, peak: 0.05 },
  liveness: { min: 0.0, max: 0.3, peak: 0.1 },
  speechiness: { min: 0.0, max: 0.1, peak: 0.05 },
  tempo: { min: 100, max: 140, peak: 120 },
  loudness: { min: -12, max: -6, peak: -9 }
};

// Genre-specific feature importance weights
const GENRE_WEIGHTS = {
  pop: {
    danceability: 0.25,
    energy: 0.20,
    valence: 0.20,
    tempo: 0.15,
    loudness: 0.10,
    acousticness: 0.05,
    instrumentalness: 0.05
  },
  hip_hop: {
    danceability: 0.20,
    energy: 0.25,
    valence: 0.15,
    tempo: 0.20,
    loudness: 0.15,
    acousticness: 0.03,
    instrumentalness: 0.02
  },
  rock: {
    danceability: 0.15,
    energy: 0.30,
    valence: 0.15,
    tempo: 0.20,
    loudness: 0.15,
    acousticness: 0.03,
    instrumentalness: 0.02
  },
  electronic: {
    danceability: 0.30,
    energy: 0.25,
    valence: 0.15,
    tempo: 0.20,
    loudness: 0.10,
    acousticness: 0.0,
    instrumentalness: 0.0
  },
  rnb: {
    danceability: 0.20,
    energy: 0.15,
    valence: 0.25,
    tempo: 0.15,
    loudness: 0.10,
    acousticness: 0.10,
    instrumentalness: 0.05
  },
  country: {
    danceability: 0.15,
    energy: 0.15,
    valence: 0.25,
    tempo: 0.15,
    loudness: 0.10,
    acousticness: 0.15,
    instrumentalness: 0.05
  }
};

// Seasonal factors (month-based multipliers)
const SEASONAL_FACTORS = {
  1: 0.9,   // January - post-holiday slump
  2: 0.95,  // February - Valentine's boost
  3: 1.0,   // March - spring awakening
  4: 1.05,  // April - spring momentum
  5: 1.1,   // May - summer anticipation
  6: 1.15,  // June - summer peak
  7: 1.1,   // July - summer continuation
  8: 1.05,  // August - summer wind-down
  9: 1.0,   // September - back to school
  10: 1.05, // October - fall momentum
  11: 1.1,  // November - holiday prep
  12: 1.2   // December - holiday peak
};

/**
 * Calculate success score based on audio features and market trends
 */
export async function calculateSuccessScore(
  audioFeatures: Partial<IAudioFeatures>,
  genre?: string,
  releaseDate?: Date,
  marketTrends?: MarketTrends
): Promise<SuccessScoreResult> {
  try {
    // Default genre if not provided
    const targetGenre = genre || 'pop';
    const genreWeights = GENRE_WEIGHTS[targetGenre as keyof typeof GENRE_WEIGHTS] || GENRE_WEIGHTS.pop;
    
    // Calculate audio features score
    const audioFeaturesScore = calculateAudioFeaturesScore(audioFeatures, genreWeights);
    
    // Calculate market trends score
    const marketTrendsScore = calculateMarketTrendsScore(audioFeatures, marketTrends);
    
    // Calculate genre alignment score
    const genreAlignmentScore = calculateGenreAlignmentScore(audioFeatures, targetGenre);
    
    // Calculate seasonal factors
    const seasonalScore = calculateSeasonalScore(releaseDate);
    
    // Calculate overall score with weighted components
    const overallScore = Math.round(
      audioFeaturesScore * 0.4 +
      marketTrendsScore * 0.3 +
      genreAlignmentScore * 0.2 +
      seasonalScore * 0.1
    );
    
    // Calculate confidence based on data completeness
    const confidence = calculateConfidence(audioFeatures, genre, marketTrends);
    
    // Generate recommendations
    const recommendations = generateRecommendations(audioFeatures, targetGenre, overallScore);
    
    // Identify risk factors
    const riskFactors = identifyRiskFactors(audioFeatures, targetGenre);
    
    // Calculate market potential
    const marketPotential = calculateMarketPotential(audioFeatures, targetGenre, marketTrends);
    
    // Calculate social score
    const socialScore = calculateSocialScore(audioFeatures, targetGenre);
    
    return {
      overallScore: Math.max(0, Math.min(100, overallScore)),
      confidence,
      breakdown: {
        audioFeatures: Math.round(audioFeaturesScore),
        marketTrends: Math.round(marketTrendsScore),
        genreAlignment: Math.round(genreAlignmentScore),
        seasonalFactors: Math.round(seasonalScore)
      },
      recommendations,
      riskFactors,
      marketPotential: Math.round(marketPotential),
      socialScore: Math.round(socialScore)
    };
    
  } catch (error) {
    console.error('Success score calculation error:', error);
    throw new Error('Failed to calculate success score');
  }
}

/**
 * Calculate audio features score based on optimal ranges
 */
function calculateAudioFeaturesScore(
  features: Partial<IAudioFeatures>,
  genreWeights: { [key: string]: number }
): number {
  let totalScore = 0;
  let totalWeight = 0;
  
  // Danceability score
  if (features.danceability !== undefined && genreWeights.danceability !== undefined) {
    const score = calculateFeatureScore(features.danceability, OPTIMAL_RANGES.danceability);
    totalScore += score * genreWeights.danceability;
    totalWeight += genreWeights.danceability;
  }
  
  // Energy score
  if (features.energy !== undefined && genreWeights.energy !== undefined) {
    const score = calculateFeatureScore(features.energy, OPTIMAL_RANGES.energy);
    totalScore += score * genreWeights.energy;
    totalWeight += genreWeights.energy;
  }
  
  // Valence score
  if (features.valence !== undefined && genreWeights.valence !== undefined) {
    const score = calculateFeatureScore(features.valence, OPTIMAL_RANGES.valence);
    totalScore += score * genreWeights.valence;
    totalWeight += genreWeights.valence;
  }
  
  // Tempo score
  if (features.tempo !== undefined && genreWeights.tempo !== undefined) {
    const tempoNormalized = features.tempo / 200; // Normalize to 0-1 range
    const score = calculateFeatureScore(tempoNormalized, OPTIMAL_RANGES.tempo);
    totalScore += score * genreWeights.tempo;
    totalWeight += genreWeights.tempo;
  }
  
  // Loudness score (normalize from dB to 0-1)
  if (features.loudness !== undefined && genreWeights.loudness !== undefined) {
    const loudnessNormalized = (features.loudness + 60) / 60; // -60dB to 0dB
    const score = calculateFeatureScore(loudnessNormalized, OPTIMAL_RANGES.loudness);
    totalScore += score * genreWeights.loudness;
    totalWeight += genreWeights.loudness;
  }
  
  // Acousticness score (inverse - lower is better for most genres)
  if (features.acousticness !== undefined && genreWeights.acousticness !== undefined) {
    const acousticnessScore = 1 - calculateFeatureScore(features.acousticness, OPTIMAL_RANGES.acousticness);
    totalScore += acousticnessScore * genreWeights.acousticness;
    totalWeight += genreWeights.acousticness;
  }
  
  // Instrumentalness score (inverse - lower is better for most genres)
  if (features.instrumentalness !== undefined && genreWeights.instrumentalness !== undefined) {
    const instrumentalnessScore = 1 - calculateFeatureScore(features.instrumentalness, OPTIMAL_RANGES.instrumentalness);
    totalScore += instrumentalnessScore * genreWeights.instrumentalness;
    totalWeight += genreWeights.instrumentalness;
  }
  
  return totalWeight > 0 ? (totalScore / totalWeight) * 100 : 50;
}

/**
 * Calculate individual feature score based on optimal range
 */
function calculateFeatureScore(value: number, range: { min: number; max: number; peak: number }): number {
  if (value >= range.min && value <= range.max) {
    // Within optimal range
    const distanceFromPeak = Math.abs(value - range.peak);
    const rangeWidth = range.max - range.min;
    const normalizedDistance = distanceFromPeak / (rangeWidth / 2);
    return Math.max(0.7, 1 - normalizedDistance * 0.3);
  } else {
    // Outside optimal range
    const distance = Math.min(
      Math.abs(value - range.min),
      Math.abs(value - range.max)
    );
    return Math.max(0, 0.7 - distance * 0.1);
  }
}

/**
 * Calculate market trends score
 */
function calculateMarketTrendsScore(
  features: Partial<IAudioFeatures>,
  marketTrends?: MarketTrends
): number {
  if (!marketTrends) {
    return 50; // Default score if no market trends available
  }
  
  let score = 50;
  
  // Tempo trend alignment
  if (features.tempo !== undefined) {
    const { min, max, peak } = marketTrends.optimalTempo;
    if (features.tempo >= min && features.tempo <= max) {
      const distanceFromPeak = Math.abs(features.tempo - peak);
      const rangeWidth = max - min;
      const alignment = 1 - (distanceFromPeak / (rangeWidth / 2));
      score += alignment * 20;
    }
  }
  
  // Key popularity
  if (features.key !== undefined) {
    const keyNames = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
    const keyName = keyNames[features.key] || 'C';
    const keyPopularity = marketTrends.popularKeys[keyName] || 0.5;
    score += keyPopularity * 15;
  }
  
  // Energy trend alignment
  if (features.energy !== undefined) {
    let energyTrend = 0.5;
    if (features.energy < 0.3) energyTrend = marketTrends.energyTrends.low;
    else if (features.energy < 0.7) energyTrend = marketTrends.energyTrends.medium;
    else energyTrend = marketTrends.energyTrends.high;
    score += energyTrend * 15;
  }
  
  return Math.min(100, Math.max(0, score));
}

/**
 * Calculate genre alignment score
 */
function calculateGenreAlignmentScore(
  features: Partial<IAudioFeatures>,
  genre: string
): number {
  const genreProfiles = {
    pop: {
      danceability: { min: 0.6, max: 0.9 },
      energy: { min: 0.5, max: 0.9 },
      valence: { min: 0.4, max: 0.8 },
      tempo: { min: 100, max: 140 }
    },
    hip_hop: {
      danceability: { min: 0.7, max: 0.95 },
      energy: { min: 0.6, max: 0.9 },
      valence: { min: 0.3, max: 0.7 },
      tempo: { min: 80, max: 120 }
    },
    rock: {
      danceability: { min: 0.4, max: 0.8 },
      energy: { min: 0.7, max: 0.95 },
      valence: { min: 0.3, max: 0.7 },
      tempo: { min: 120, max: 160 }
    },
    electronic: {
      danceability: { min: 0.7, max: 0.95 },
      energy: { min: 0.6, max: 0.9 },
      valence: { min: 0.4, max: 0.8 },
      tempo: { min: 120, max: 140 }
    }
  };
  
  const profile = genreProfiles[genre as keyof typeof genreProfiles] || genreProfiles.pop;
  let alignmentScore = 0;
  let featureCount = 0;
  
  if (features.danceability !== undefined) {
    const inRange = features.danceability >= profile.danceability.min && 
                   features.danceability <= profile.danceability.max;
    alignmentScore += inRange ? 25 : 10;
    featureCount++;
  }
  
  if (features.energy !== undefined) {
    const inRange = features.energy >= profile.energy.min && 
                   features.energy <= profile.energy.max;
    alignmentScore += inRange ? 25 : 10;
    featureCount++;
  }
  
  if (features.valence !== undefined) {
    const inRange = features.valence >= profile.valence.min && 
                   features.valence <= profile.valence.max;
    alignmentScore += inRange ? 25 : 10;
    featureCount++;
  }
  
  if (features.tempo !== undefined) {
    const inRange = features.tempo >= profile.tempo.min && 
                   features.tempo <= profile.tempo.max;
    alignmentScore += inRange ? 25 : 10;
    featureCount++;
  }
  
  return featureCount > 0 ? alignmentScore / featureCount : 50;
}

/**
 * Calculate seasonal score
 */
function calculateSeasonalScore(releaseDate?: Date): number {
  if (!releaseDate) {
    return 50; // Default score if no release date
  }
  
  const month = releaseDate.getMonth() + 1; // getMonth() returns 0-11
  const seasonalFactor = SEASONAL_FACTORS[month as keyof typeof SEASONAL_FACTORS] || 1.0;
  
  return Math.round(50 * seasonalFactor);
}

/**
 * Calculate confidence score
 */
function calculateConfidence(
  features: Partial<IAudioFeatures>,
  genre?: string,
  marketTrends?: MarketTrends
): number {
  let confidence = 0.5; // Base confidence
  
  // Feature completeness
  const requiredFeatures = ['danceability', 'energy', 'valence', 'tempo'];
  const availableFeatures = requiredFeatures.filter(f => features[f as keyof IAudioFeatures] !== undefined);
  confidence += (availableFeatures.length / requiredFeatures.length) * 0.3;
  
  // Genre specification
  if (genre) confidence += 0.1;
  
  // Market trends availability
  if (marketTrends) confidence += 0.1;
  
  return Math.min(1, confidence);
}

/**
 * Generate recommendations for improvement
 */
function generateRecommendations(
  features: Partial<IAudioFeatures>,
  genre: string,
  currentScore: number
): Recommendation[] {
  const recommendations: Recommendation[] = [];
  
  // Audio feature recommendations
  if (features.danceability !== undefined && features.danceability < OPTIMAL_RANGES.danceability.min) {
    recommendations.push({
      category: 'audio',
      priority: 'high',
      title: 'Increase Danceability',
      description: `Current danceability (${features.danceability.toFixed(2)}) is below optimal range. Consider adding more rhythmic elements or adjusting the beat structure.`,
      impact: 15,
      implementation: 'Add stronger rhythmic patterns, syncopation, or dance-oriented production elements.'
    });
  }
  
  if (features.energy !== undefined && features.energy < OPTIMAL_RANGES.energy.min) {
    recommendations.push({
      category: 'audio',
      priority: 'medium',
      title: 'Boost Energy Level',
      description: `Current energy (${features.energy.toFixed(2)}) could be increased for better market appeal.`,
      impact: 12,
      implementation: 'Add more dynamic elements, increase instrumental intensity, or enhance production energy.'
    });
  }
  
  if (features.tempo !== undefined) {
    const optimalTempo = OPTIMAL_RANGES.tempo.peak;
    const tempoDiff = Math.abs(features.tempo - optimalTempo);
    if (tempoDiff > 20) {
      recommendations.push({
        category: 'audio',
        priority: 'medium',
        title: 'Adjust Tempo',
        description: `Current tempo (${features.tempo} BPM) is ${tempoDiff > 0 ? 'faster' : 'slower'} than optimal range.`,
        impact: 10,
        implementation: `Consider adjusting tempo to around ${optimalTempo} BPM for better market alignment.`
      });
    }
  }
  
  // Market timing recommendations
  if (currentScore < 70) {
    recommendations.push({
      category: 'timing',
      priority: 'high',
      title: 'Consider Release Timing',
      description: 'Current score suggests timing could be optimized for better market reception.',
      impact: 20,
      implementation: 'Analyze seasonal trends and consider releasing during peak periods for your genre.'
    });
  }
  
  // Genre-specific recommendations
  if (genre === 'pop' && features.acousticness && features.acousticness > 0.3) {
    recommendations.push({
      category: 'genre',
      priority: 'medium',
      title: 'Reduce Acoustic Elements',
      description: 'Pop music typically benefits from more electronic/produced elements.',
      impact: 8,
      implementation: 'Consider adding more electronic production elements or reducing acoustic instrumentation.'
    });
  }
  
  return recommendations.sort((a, b) => b.impact - a.impact);
}

/**
 * Identify risk factors
 */
function identifyRiskFactors(
  features: Partial<IAudioFeatures>,
  genre: string
): string[] {
  const riskFactors: string[] = [];
  
  if (features.danceability !== undefined && features.danceability < 0.4) {
    riskFactors.push('Very low danceability may limit commercial appeal');
  }
  
  if (features.energy !== undefined && features.energy < 0.3) {
    riskFactors.push('Low energy may not engage listeners effectively');
  }
  
  if (features.tempo !== undefined && features.tempo < 80) {
    riskFactors.push('Very slow tempo may not align with current market preferences');
  }
  
  if (features.loudness !== undefined && features.loudness < -20) {
    riskFactors.push('Low loudness may not compete well in streaming environments');
  }
  
  if (features.instrumentalness !== undefined && features.instrumentalness > 0.5) {
    riskFactors.push('High instrumental content may limit radio play potential');
  }
  
  return riskFactors;
}

/**
 * Calculate market potential score
 */
function calculateMarketPotential(
  features: Partial<IAudioFeatures>,
  genre: string,
  marketTrends?: MarketTrends
): number {
  let potential = 50;
  
  // Base potential on audio features
  if (features.danceability !== undefined && features.danceability > 0.7) potential += 10;
  if (features.energy !== undefined && features.energy > 0.6) potential += 10;
  if (features.valence !== undefined && features.valence > 0.5) potential += 10;
  
  // Genre market size adjustment
  const genreMarketSize = {
    pop: 1.2,
    hip_hop: 1.1,
    rock: 0.9,
    electronic: 1.0,
    rnb: 0.8,
    country: 0.7
  };
  
  const marketMultiplier = genreMarketSize[genre as keyof typeof genreMarketSize] || 1.0;
  potential *= marketMultiplier;
  
  return Math.min(100, Math.max(0, potential));
}

/**
 * Calculate social score (potential for social media engagement)
 */
function calculateSocialScore(
  features: Partial<IAudioFeatures>,
  genre: string
): number {
  let socialScore = 50;
  
  // High energy and danceability correlate with social sharing
  if (features.energy !== undefined && features.energy > 0.7) socialScore += 15;
  if (features.danceability !== undefined && features.danceability > 0.7) socialScore += 15;
  
  // Positive valence (happy songs) get shared more
  if (features.valence !== undefined && features.valence > 0.6) socialScore += 10;
  
  // Genre-specific social appeal
  const genreSocialAppeal = {
    pop: 1.2,
    hip_hop: 1.3,
    rock: 0.9,
    electronic: 1.1,
    rnb: 0.8,
    country: 0.7
  };
  
  const socialMultiplier = genreSocialAppeal[genre as keyof typeof genreSocialAppeal] || 1.0;
  socialScore *= socialMultiplier;
  
  return Math.min(100, Math.max(0, socialScore));
}

export default {
  calculateSuccessScore,
  OPTIMAL_RANGES,
  GENRE_WEIGHTS,
  SEASONAL_FACTORS
}; 