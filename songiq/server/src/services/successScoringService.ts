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
  category: 'production' | 'marketing' | 'distribution' | 'performance' | 'arrangement' | 'genre' | 'audience' | 'timing';
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
  marketTrends?: MarketTrends,
  isReleased?: boolean
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
    
    // Generate recommendations based on release status
    const recommendations = generateRecommendations(audioFeatures, targetGenre, overallScore, isReleased);
    
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
 * Generate comprehensive recommendations for improvement
 */
function generateRecommendations(
  features: Partial<IAudioFeatures>,
  genre: string,
  currentScore: number,
  isReleased?: boolean
): Recommendation[] {
  const recommendations: Recommendation[] = [];
  
  // === PRODUCTION RECOMMENDATIONS ===
  // Only provide production recommendations for unreleased songs
  
  if (!isReleased) {
    // Danceability analysis
    if (features.danceability !== undefined) {
      if (features.danceability < 0.4) {
        recommendations.push({
          category: 'production',
          priority: 'high',
          title: 'Dramatically Increase Danceability',
          description: `Current danceability (${features.danceability.toFixed(2)}) is very low. This severely limits streaming potential and playlist inclusion.`,
          impact: 25,
          implementation: 'Add strong 4/4 kick pattern, syncopated hi-hats, bass drops on beat 1, and consider adding a dance break or build-up section.'
        });
      } else if (features.danceability < 0.6) {
        recommendations.push({
          category: 'production',
          priority: 'medium',
          title: 'Enhance Danceability',
          description: `Current danceability (${features.danceability.toFixed(2)}) could be improved for better club and streaming appeal.`,
          impact: 15,
          implementation: 'Add more rhythmic elements: sidechain compression, percussive fills, and ensure the kick pattern is prominent and consistent.'
        });
      } else if (features.danceability > 0.9) {
        recommendations.push({
          category: 'production',
          priority: 'low',
          title: 'Consider More Subtle Rhythms',
          description: `Very high danceability (${features.danceability.toFixed(2)}) might limit radio play and broader appeal.`,
          impact: 5,
          implementation: 'Consider adding more melodic elements or reducing the intensity of the beat in certain sections.'
        });
      }
    }
  } else {
    // For released songs, provide analysis insights instead of production recommendations
    if (features.danceability !== undefined) {
      if (features.danceability < 0.4) {
        recommendations.push({
          category: 'performance',
          priority: 'medium',
          title: 'Danceability Analysis - Low Score',
          description: `Your song's danceability (${features.danceability.toFixed(2)}) is below optimal range. This may explain limited playlist inclusion and streaming performance.`,
          impact: 10,
          implementation: 'Consider this insight for future releases. Focus on marketing strategies that don\'t rely on danceability (acoustic versions, live performances, etc.).'
        });
      } else if (features.danceability > 0.9) {
        recommendations.push({
          category: 'performance',
          priority: 'low',
          title: 'Danceability Analysis - High Score',
          description: `Your song's high danceability (${features.danceability.toFixed(2)}) likely contributed to its success. This is a strength to build upon.`,
          impact: 5,
          implementation: 'Leverage this strength in marketing materials and consider similar production approaches for future releases.'
        });
      }
    }
  }
  
  // Energy analysis
  if (features.energy !== undefined) {
    if (!isReleased) {
      // Production recommendations for unreleased songs
      if (features.energy < 0.3) {
        recommendations.push({
          category: 'production',
          priority: 'high',
          title: 'Significantly Boost Energy',
          description: `Very low energy (${features.energy.toFixed(2)}) will struggle to compete in today's high-energy music market.`,
          impact: 22,
          implementation: 'Add driving basslines, punchy drums, layered synths, and consider increasing the overall dynamic range. Add energy builds and drops.'
        });
      } else if (features.energy < 0.6) {
        recommendations.push({
          category: 'production',
          priority: 'medium',
          title: 'Increase Energy Level',
          description: `Current energy (${features.energy.toFixed(2)}) could be enhanced for better streaming and radio performance.`,
          impact: 12,
          implementation: 'Layer more instruments, add harmonic content, increase compression, and ensure the chorus has significantly more energy than the verse.'
        });
      } else if (features.energy > 0.9) {
        recommendations.push({
          category: 'production',
          priority: 'low',
          title: 'Consider Dynamic Contrast',
          description: `Very high energy (${features.energy.toFixed(2)}) throughout might be overwhelming. Consider adding quieter sections.`,
          impact: 8,
          implementation: 'Add breakdown sections, softer verses, or instrumental interludes to create more dynamic contrast.'
        });
      }
    } else {
      // Analysis insights for released songs
      if (features.energy < 0.3) {
        recommendations.push({
          category: 'performance',
          priority: 'medium',
          title: 'Energy Analysis - Low Score',
          description: `Your song's low energy (${features.energy.toFixed(2)}) may have limited its market appeal. This insight can inform future releases.`,
          impact: 10,
          implementation: 'Focus on marketing strategies that highlight the song\'s emotional depth rather than energy. Consider acoustic or stripped-down versions.'
        });
      } else if (features.energy > 0.9) {
        recommendations.push({
          category: 'performance',
          priority: 'low',
          title: 'Energy Analysis - High Score',
          description: `Your song's high energy (${features.energy.toFixed(2)}) likely contributed to its success and streaming performance.`,
          impact: 5,
          implementation: 'This is a strength to leverage in marketing and consider for future releases.'
        });
      }
    }
  }
  
  // Tempo analysis
  if (features.tempo !== undefined) {
    const optimalTempo = OPTIMAL_RANGES.tempo.peak;
    const tempoDiff = Math.abs(features.tempo - optimalTempo);
    
    if (tempoDiff > 30) {
      recommendations.push({
        category: 'production',
        priority: 'high',
        title: 'Optimize Tempo for Market',
        description: `Current tempo (${features.tempo} BPM) is significantly outside the optimal range (${optimalTempo} BPM ±20). This affects streaming algorithms and playlist inclusion.`,
        impact: 18,
        implementation: `Consider adjusting to ${optimalTempo} BPM. If the current tempo is essential to the song's character, ensure the production compensates with stronger rhythmic elements.`
      });
    } else if (tempoDiff > 15) {
      recommendations.push({
        category: 'production',
        priority: 'medium',
        title: 'Fine-tune Tempo',
        description: `Current tempo (${features.tempo} BPM) is slightly outside optimal range. Small adjustments can improve streaming performance.`,
        impact: 10,
        implementation: `Consider adjusting to ${optimalTempo} BPM or ensure the production elements strongly support the current tempo choice.`
      });
    }
  }
  
  // Valence (mood) analysis
  if (features.valence !== undefined) {
    if (features.valence < 0.2) {
      recommendations.push({
        category: 'production',
        priority: 'medium',
        title: 'Consider Uplifting Elements',
        description: `Very low valence (${features.valence.toFixed(2)}) creates a dark, melancholic mood that may limit mainstream appeal.`,
        impact: 12,
        implementation: 'Add major chord progressions, brighter instrumentation, or consider adding a more uplifting bridge or outro section.'
      });
    } else if (features.valence > 0.8) {
      recommendations.push({
        category: 'production',
        priority: 'low',
        title: 'Add Emotional Depth',
        description: `Very high valence (${features.valence.toFixed(2)}) might lack emotional complexity for sustained listener engagement.`,
        impact: 6,
        implementation: 'Consider adding minor chord progressions, more complex harmonies, or contrasting sections with different emotional tones.'
      });
    }
  }
  
  // Acousticness analysis
  if (features.acousticness !== undefined) {
    if (genre === 'pop' && features.acousticness > 0.5) {
      recommendations.push({
        category: 'production',
        priority: 'medium',
        title: 'Modernize Production for Pop Market',
        description: `High acousticness (${features.acousticness.toFixed(2)}) in pop music may limit streaming and radio play.`,
        impact: 15,
        implementation: 'Add electronic elements, modern production techniques, and consider hybrid acoustic-electronic arrangements.'
      });
    } else if (genre === 'folk' && features.acousticness < 0.3) {
      recommendations.push({
        category: 'production',
        priority: 'medium',
        title: 'Embrace Acoustic Elements',
        description: `Low acousticness (${features.acousticness.toFixed(2)}) may not align with folk genre expectations.`,
        impact: 12,
        implementation: 'Consider adding more acoustic instruments, natural reverb, and organic production techniques.'
      });
    }
  }
  
  // === MARKETING RECOMMENDATIONS ===
  
  if (currentScore < 60) {
    recommendations.push({
      category: 'marketing',
      priority: 'high',
      title: 'Focus on Niche Marketing Strategy',
      description: 'With a lower overall score, target specific communities and platforms where your sound will resonate most.',
      impact: 20,
      implementation: 'Identify 3-5 specific communities (Reddit, Discord, Facebook groups) that match your genre. Create content specifically for these audiences.'
    });
  } else if (currentScore < 80) {
    recommendations.push({
      category: 'marketing',
      priority: 'medium',
      title: 'Build Momentum Before Major Release',
      description: 'Your track has potential but needs strategic marketing to maximize impact.',
      impact: 15,
      implementation: 'Release teasers 2-3 weeks before, build anticipation on social media, and consider collaborating with micro-influencers in your genre.'
    });
  } else {
    recommendations.push({
      category: 'marketing',
      priority: 'high',
      title: 'Aggressive Mainstream Marketing Push',
      description: 'High-scoring track ready for major marketing investment and playlist pitching.',
      impact: 25,
      implementation: 'Submit to major playlists, invest in paid promotion, reach out to music blogs, and consider hiring a PR firm for maximum exposure.'
    });
  }
  
  // === DISTRIBUTION RECOMMENDATIONS ===
  
  if (features.energy && features.energy > 0.7) {
    recommendations.push({
      category: 'distribution',
      priority: 'medium',
      title: 'Prioritize Club and Festival Distribution',
      description: 'High-energy track perfect for club and festival playlists.',
      impact: 12,
      implementation: 'Submit to Beatport, Traxsource, and festival playlist curators. Create extended mixes and DJ-friendly versions.'
    });
  }
  
  if (features.danceability && features.danceability > 0.7) {
    recommendations.push({
      category: 'distribution',
      priority: 'medium',
      title: 'Target Streaming Playlists',
      description: 'High danceability makes this perfect for streaming platform playlists.',
      impact: 15,
      implementation: 'Submit to Spotify editorial playlists, Apple Music playlists, and create your own playlist featuring similar artists.'
    });
  }
  
  // === PERFORMANCE RECOMMENDATIONS ===
  
  if (features.liveness && features.liveness > 0.5) {
    recommendations.push({
      category: 'performance',
      priority: 'medium',
      title: 'Leverage Live Performance Potential',
      description: 'High liveness score indicates strong live performance potential.',
      impact: 10,
      implementation: 'Plan live performances, create acoustic versions, and consider live streaming sessions to build audience connection.'
    });
  }
  
  // === ARRANGEMENT RECOMMENDATIONS ===
  
  if (features.duration_ms && features.duration_ms < 180000) { // 3 minutes in milliseconds
    recommendations.push({
      category: 'arrangement',
      priority: 'medium',
      title: 'Consider Extended Arrangement',
      description: `Short duration (${Math.round(features.duration_ms / 1000)}s) may limit streaming revenue and playlist inclusion.`,
      impact: 8,
      implementation: 'Add instrumental sections, extended outro, or consider creating a longer version for streaming platforms.'
    });
  } else if (features.duration_ms && features.duration_ms > 300000) { // 5 minutes in milliseconds
    recommendations.push({
      category: 'arrangement',
      priority: 'low',
      title: 'Consider Radio Edit',
      description: `Long duration (${Math.round(features.duration_ms / 1000)}s) may limit radio play and some playlist inclusion.`,
      impact: 6,
      implementation: 'Create a 3-4 minute radio edit while keeping the full version for streaming platforms.'
    });
  }
  
  // === AUDIENCE RECOMMENDATIONS ===
  
  if (features.speechiness && features.speechiness > 0.1) {
    recommendations.push({
      category: 'audience',
      priority: 'medium',
      title: 'Target Hip-Hop and Rap Audiences',
      description: 'Speech-like vocals suggest crossover potential with hip-hop audiences.',
      impact: 12,
      implementation: 'Collaborate with rappers, submit to hip-hop playlists, and consider creating remixes with featured artists.'
    });
  }
  
  // === GENRE-SPECIFIC RECOMMENDATIONS ===
  
  if (genre === 'pop') {
    if (features.instrumentalness && features.instrumentalness > 0.5) {
      recommendations.push({
        category: 'genre',
        priority: 'high',
        title: 'Add Strong Vocal Hook',
        description: 'Pop music requires memorable vocal melodies and hooks for commercial success.',
        impact: 20,
        implementation: 'Write a catchy chorus melody, add vocal harmonies, and ensure the vocal is the focal point of the track.'
      });
    }
  }
  
  if (genre === 'electronic') {
    if (features.acousticness && features.acousticness > 0.3) {
      recommendations.push({
        category: 'genre',
        priority: 'medium',
        title: 'Embrace Electronic Production',
        description: 'Electronic genre benefits from more synthetic and processed sounds.',
        impact: 10,
        implementation: 'Add more synthesizers, electronic drums, and digital effects. Consider sidechain compression and modern EDM production techniques.'
      });
    }
  }
  
  // === TIMING RECOMMENDATIONS ===
  
  const currentMonth = new Date().getMonth() + 1;
  const seasonalFactors = {
    1: { factor: 0.9, reason: 'Post-holiday slump' },
    2: { factor: 0.95, reason: 'Valentine\'s boost' },
    3: { factor: 1.0, reason: 'Spring awakening' },
    4: { factor: 1.05, reason: 'Spring momentum' },
    5: { factor: 1.1, reason: 'Summer anticipation' },
    6: { factor: 1.15, reason: 'Summer peak' },
    7: { factor: 1.1, reason: 'Summer continuation' },
    8: { factor: 1.05, reason: 'Summer wind-down' },
    9: { factor: 1.0, reason: 'Back to school' },
    10: { factor: 1.05, reason: 'Fall momentum' },
    11: { factor: 1.1, reason: 'Holiday prep' },
    12: { factor: 1.2, reason: 'Holiday peak' }
  };
  
  const seasonalFactor = seasonalFactors[currentMonth as keyof typeof seasonalFactors];
  if (seasonalFactor.factor < 1.0) {
    recommendations.push({
      category: 'timing',
      priority: 'medium',
      title: 'Consider Delaying Release',
      description: `Current month has lower market activity (${seasonalFactor.factor * 100}% of peak). ${seasonalFactor.reason}.`,
      impact: 8,
      implementation: 'Consider waiting 1-2 months for better market conditions, or focus on building anticipation during this period.'
    });
  } else if (seasonalFactor.factor > 1.1) {
    recommendations.push({
      category: 'timing',
      priority: 'high',
      title: 'Strike While Market is Hot',
      description: `Current month has high market activity (${seasonalFactor.factor * 100}% of peak). ${seasonalFactor.reason}.`,
      impact: 15,
      implementation: 'Accelerate your release timeline and marketing push to capitalize on peak market conditions.'
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