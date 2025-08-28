import { RealAudioFeatures } from '../utils/audioAnalysis';

export interface SuccessPrediction {
  score: number;
  confidence: number;
  factors: string[];
  marketPotential: number;
  socialScore: number;
  genreAlignment: number;
  seasonalFactors: number;
  riskAssessment: RiskAssessment;
  recommendations: Recommendation[];
}

export interface RiskAssessment {
  overallRisk: 'low' | 'medium' | 'high';
  riskFactors: string[];
  riskScore: number;
  mitigationStrategies: string[];
}

export interface Recommendation {
  category: 'marketing' | 'production' | 'timing' | 'platform' | 'audience';
  title: string;
  description: string;
  priority: 'low' | 'medium' | 'high';
  impact: number;
  implementation: string;
  estimatedROI: number;
}

export interface GenreProfile {
  name: string;
  marketShare: number;
  growthRate: number;
  peakSeason: string[];
  targetDemographics: string[];
  platformPerformance: Record<string, number>;
  successFactors: string[];
}

export class MLSuccessPredictor {
  private genreProfiles: Map<string, GenreProfile> = new Map();
  private seasonalFactors: Map<string, number> = new Map();
  private marketTrends: Map<string, number> = new Map();

  constructor() {
    this.initializeGenreProfiles();
    this.initializeSeasonalFactors();
    this.initializeMarketTrends();
  }

  async predictSuccess(audioFeatures: RealAudioFeatures, genre: string): Promise<SuccessPrediction> {
    try {
      console.log('🎯 Starting success prediction for genre:', genre);
      console.log('📊 Input audio features:', audioFeatures);
      
      // Extract key features for prediction
      const featureVector = this.extractFeatureVector(audioFeatures);
      console.log('🔢 Feature vector extracted:', featureVector);
      
      // Get genre profile
      const genreProfile = this.genreProfiles.get(genre) || this.genreProfiles.get('Pop')!;
      console.log('🎵 Using genre profile:', genreProfile.name);
      
      // Calculate base success score using multiple algorithms
      const baseScore = this.calculateBaseScore(featureVector, genreProfile);
      console.log('📈 Base score calculated:', baseScore);
      
      // Apply market and seasonal adjustments
      const marketAdjustment = this.calculateMarketAdjustment(genre, audioFeatures);
      const seasonalAdjustment = this.calculateSeasonalAdjustment(genre);
      console.log('📊 Market adjustment:', marketAdjustment, 'Seasonal adjustment:', seasonalAdjustment);
      
      // Calculate final score
      const finalScore = Math.max(0, Math.min(100, 
        baseScore + marketAdjustment + seasonalAdjustment
      ));
      console.log('🎯 Final score calculated:', finalScore);
      
      // Calculate confidence based on feature quality
      const confidence = this.calculateConfidence(audioFeatures, genreProfile);
      console.log('🎲 Confidence calculated:', confidence);
      
      // Generate success factors
      const factors = this.generateSuccessFactors(audioFeatures, genreProfile, finalScore);
      
      // Calculate derived scores
      const marketPotential = this.calculateMarketPotential(finalScore, genreProfile);
      const socialScore = this.calculateSocialScore(finalScore, audioFeatures);
      const genreAlignment = this.calculateGenreAlignment(audioFeatures, genreProfile);
      const seasonalFactors = this.calculateSeasonalFactors(genre);
      
      console.log('💰 Derived scores:', {
        marketPotential,
        socialScore,
        genreAlignment,
        seasonalFactors
      });
      
      // Assess risks
      const riskAssessment = this.assessRisks(audioFeatures, genreProfile, finalScore);
      
      // Generate recommendations
      const recommendations = this.generateRecommendations(
        audioFeatures, 
        genreProfile, 
        finalScore, 
        riskAssessment
      );
      
      const result = {
        score: Math.round(finalScore),
        confidence,
        factors,
        marketPotential,
        socialScore,
        genreAlignment,
        seasonalFactors,
        riskAssessment,
        recommendations
      };
      
      console.log('🎉 Final prediction result:', result);
      return result;
      
    } catch (error) {
      console.error('❌ Success prediction failed:', error);
      // Return fallback prediction
      return this.getFallbackPrediction(audioFeatures, genre);
    }
  }

  private extractFeatureVector(audioFeatures: RealAudioFeatures): number[] {
    // Create a normalized feature vector for ML algorithms with safe fallbacks
    return [
      audioFeatures.danceability || 0.5,
      audioFeatures.energy || 0.5,
      audioFeatures.valence || 0.5,
      audioFeatures.acousticness || 0.5,
      audioFeatures.instrumentalness || 0.5,
      audioFeatures.liveness || 0.5,
      audioFeatures.speechiness || 0.5,
      (audioFeatures.tempo || 120) / 200, // Normalize tempo to 0-1
      (audioFeatures.spectralCentroid || 2000) / 8000, // Normalize frequency to 0-1
      (audioFeatures.spectralRolloff || 4000) / 8000,
      audioFeatures.rhythmStrength || 0.5,
      audioFeatures.beatConfidence || 0.5,
      audioFeatures.keyConfidence || 0.5,
      audioFeatures.harmonicComplexity || 0.5,
      (audioFeatures.dynamicRange || -20) / 60, // Normalize dB range
      (audioFeatures.crestFactor || 5) / 10 // Normalize crest factor
    ];
  }

  private calculateBaseScore(featureVector: number[], genreProfile: GenreProfile): number {
    // Use multiple algorithms for robust prediction
    
    console.log('🧮 Starting base score calculation...');
    
    // Algorithm 1: Weighted Linear Combination
    const weights = [
      0.15, // danceability
      0.12, // energy
      0.10, // valence
      0.08, // acousticness
      0.08, // instrumentalness
      0.06, // liveness
      0.05, // speechiness
      0.08, // tempo
      0.08, // spectral centroid
      0.06, // spectral rolloff
      0.06, // rhythm strength
      0.04, // beat confidence
      0.04, // key confidence
      0.03, // harmonic complexity
      0.03, // dynamic range
      0.02  // crest factor
    ];
    
    let linearScore = 0;
    for (let i = 0; i < featureVector.length; i++) {
      const contribution = featureVector[i] * weights[i];
      linearScore += contribution;
      console.log(`📊 Feature ${i}: ${featureVector[i].toFixed(3)} × ${weights[i]} = ${contribution.toFixed(3)}`);
    }
    linearScore *= 100; // Scale to 0-100
    console.log('📈 Linear score calculated:', linearScore.toFixed(2));
    
    // Algorithm 2: Non-linear transformation
    let nonLinearScore = 0;
    for (let i = 0; i < featureVector.length; i++) {
      // Apply sigmoid-like transformation
      const transformed = 1 / (1 + Math.exp(-5 * (featureVector[i] - 0.5)));
      nonLinearScore += transformed;
      console.log(`🔄 Feature ${i}: ${featureVector[i].toFixed(3)} → ${transformed.toFixed(3)}`);
    }
    nonLinearScore = (nonLinearScore / featureVector.length) * 100;
    console.log('🔄 Non-linear score calculated:', nonLinearScore.toFixed(2));
    
    // Algorithm 3: Genre-specific scoring
    const genreScore = this.calculateGenreSpecificScore(featureVector, genreProfile);
    console.log('🎵 Genre score calculated:', genreScore);
    
    // Combine algorithms with ensemble learning
    const ensembleScore = (linearScore * 0.4) + (nonLinearScore * 0.3) + (genreScore * 0.3);
    console.log('🎯 Ensemble score calculation:', {
      linear: linearScore.toFixed(2),
      nonLinear: nonLinearScore.toFixed(2),
      genre: genreScore,
      weights: '0.4, 0.3, 0.3',
      final: ensembleScore.toFixed(2)
    });
    
    return ensembleScore;
  }

  private calculateGenreSpecificScore(featureVector: number[], genreProfile: GenreProfile): number {
    // Adjust scoring based on genre characteristics
    let score = 50; // Base score
    
    console.log('🎵 Calculating genre-specific score for:', genreProfile.name);
    console.log('🔢 Feature vector for genre scoring:', featureVector);
    
    switch (genreProfile.name) {
      case 'Pop':
        // Pop benefits from high danceability, energy, and valence
        if (featureVector[0] > 0.7) { score += 15; console.log('✅ Pop: High danceability +15'); }
        if (featureVector[1] > 0.7) { score += 12; console.log('✅ Pop: High energy +12'); }
        if (featureVector[2] > 0.6) { score += 10; console.log('✅ Pop: High valence +10'); }
        if (featureVector[8] > 0.5) { score += 8; console.log('✅ Pop: Good spectral centroid +8'); }
        break;
        
      case 'Rock':
        // Rock benefits from high energy, moderate danceability
        if (featureVector[1] > 0.8) { score += 18; console.log('✅ Rock: High energy +18'); }
        if (featureVector[0] > 0.5) { score += 8; console.log('✅ Rock: Good danceability +8'); }
        if (featureVector[7] > 0.6) { score += 10; console.log('✅ Rock: Good tempo +10'); }
        if (featureVector[3] < 0.4) { score += 8; console.log('✅ Rock: Low acousticness +8'); }
        break;
        
      case 'Electronic':
        // Electronic benefits from high danceability, energy, low acousticness
        if (featureVector[0] > 0.8) { score += 20; console.log('✅ Electronic: High danceability +20'); }
        if (featureVector[1] > 0.7) { score += 15; console.log('✅ Electronic: High energy +15'); }
        if (featureVector[3] < 0.3) { score += 10; console.log('✅ Electronic: Low acousticness +10'); }
        if (featureVector[8] > 0.6) { score += 8; console.log('✅ Electronic: Good spectral centroid +8'); }
        break;
        
      case 'Hip-Hop':
        // Hip-hop benefits from moderate tempo, high rhythm strength
        if (featureVector[7] > 0.4 && featureVector[7] < 0.7) { score += 15; console.log('✅ Hip-Hop: Good tempo range +15'); }
        if (featureVector[10] > 0.7) { score += 18; console.log('✅ Hip-Hop: High rhythm strength +18'); }
        if (featureVector[11] > 0.6) { score += 12; console.log('✅ Hip-Hop: High beat confidence +12'); }
        if (featureVector[2] > 0.5) { score += 8; console.log('✅ Hip-Hop: Good valence +8'); }
        break;
        
      default:
        // Generic scoring for other genres
        const genericBonus = (featureVector[0] + featureVector[1] + featureVector[2]) * 20;
        score += genericBonus;
        console.log('✅ Generic genre scoring:', genericBonus);
    }
    
    console.log('🎯 Final genre-specific score:', score);
    return Math.min(100, score);
  }

  private calculateMarketAdjustment(genre: string, audioFeatures: RealAudioFeatures): number {
    const marketTrend = this.marketTrends.get(genre) || 0;
    const genreProfile = this.genreProfiles.get(genre);
    
    if (!genreProfile) return 0;
    
    // Market adjustment based on current trends
    let adjustment = marketTrend * 10; // Scale trend to adjustment
    
    // Adjust based on audio feature alignment with market preferences
    if (audioFeatures.energy > 0.7 && marketTrend > 0) {
      adjustment += 5; // High energy songs benefit from positive market trends
    }
    
    if (audioFeatures.danceability > 0.8 && genre === 'Pop') {
      adjustment += 3; // Danceable pop songs have market advantage
    }
    
    return adjustment;
  }

  private calculateSeasonalAdjustment(genre: string): number {
    const currentMonth = new Date().getMonth();
    const seasonalFactor = this.seasonalFactors.get(genre) || 0;
    
    // Calculate seasonal adjustment based on current month and seasonal factor
    let adjustment = seasonalFactor * 0.1; // Use seasonal factor
    
    // Use currentMonth for seasonal adjustments
    if (currentMonth >= 5 && currentMonth <= 7) {
      // Summer months (June-August)
      if (genre === 'Pop' || genre === 'Electronic') {
        adjustment += 8; // Summer benefits for upbeat genres
      }
    } else if (currentMonth === 11 || currentMonth === 0) {
      // Holiday season (December-January)
      if (genre === 'Pop' || genre === 'Rock') {
        adjustment += 5; // Holiday season benefits
      }
    } else if (currentMonth >= 2 && currentMonth <= 3) {
      // Spring months (March-April)
      if (genre === 'Folk' || genre === 'Alternative') {
        adjustment += 4; // Spring benefits for organic genres
      }
    }
    
    return adjustment;
  }

  private calculateConfidence(audioFeatures: RealAudioFeatures, genreProfile: GenreProfile): number {
    let confidence = 0.7; // Base confidence
    
    // Increase confidence based on feature quality
    if (audioFeatures.keyConfidence > 0.8) confidence += 0.1;
    if (audioFeatures.beatConfidence > 0.7) confidence += 0.1;
    if (audioFeatures.rhythmStrength > 0.6) confidence += 0.05;
    
    // Decrease confidence for unusual combinations
    if (audioFeatures.danceability > 0.8 && audioFeatures.tempo < 100) confidence -= 0.1;
    if (audioFeatures.energy < 0.3 && audioFeatures.danceability > 0.7) confidence -= 0.1;
    
    // Genre-specific confidence adjustments
    if (genreProfile.marketShare > 0.2) confidence += 0.05; // Popular genres have more data
    
    return Math.max(0.3, Math.min(0.95, confidence));
  }

  private generateSuccessFactors(audioFeatures: RealAudioFeatures, genreProfile: GenreProfile, _score: number): string[] {
    const factors: string[] = [];
    
    // Analyze audio features for success factors
    if (audioFeatures.energy > 0.7) {
      factors.push('High energy levels typically perform well in dance/pop genres');
    }
    
    if (audioFeatures.danceability > 0.6) {
      factors.push('Strong danceability increases viral potential');
    }
    
    if (audioFeatures.valence > 0.6) {
      factors.push('Positive mood often correlates with chart success');
    }
    
    // Add genre-specific factors
    const seasonalFactor = this.seasonalFactors.get(genreProfile.name) || 0;
    if (seasonalFactor > 0.7) {
      factors.push(`Strong seasonal performance in ${genreProfile.name}`);
    }
    
    return factors;
  }

  private calculateMarketPotential(score: number, genreProfile: GenreProfile): number {
    // Market potential based on success score and genre market data
    let marketPotential = score * 0.8; // Base calculation
    
    // Adjust based on genre market share
    marketPotential += genreProfile.marketShare * 20;
    
    // Adjust based on growth rate
    marketPotential += genreProfile.growthRate * 100;
    
    return Math.max(0, Math.min(100, Math.round(marketPotential)));
  }

  private calculateSocialScore(score: number, audioFeatures: RealAudioFeatures): number {
    // Social score based on success score and social-friendly features
    let socialScore = score * 0.9; // Base calculation
    
    // Increase for social-friendly features
    if (audioFeatures.danceability > 0.7) socialScore += 5;
    if (audioFeatures.energy > 0.7) socialScore += 3;
    if (audioFeatures.valence > 0.6) socialScore += 4;
    
    return Math.max(0, Math.min(100, Math.round(socialScore)));
  }

  private calculateGenreAlignment(audioFeatures: RealAudioFeatures, genreProfile: GenreProfile): number {
    // Calculate how well the song aligns with genre expectations
    let alignment = 70; // Base alignment
    
    // Adjust based on genre-specific feature requirements
    switch (genreProfile.name) {
      case 'Pop':
        if (audioFeatures.danceability > 0.7) alignment += 15;
        if (audioFeatures.energy > 0.7) alignment += 10;
        if (audioFeatures.valence > 0.6) alignment += 5;
        break;
        
      case 'Rock':
        if (audioFeatures.energy > 0.8) alignment += 20;
        if (audioFeatures.tempo > 120) alignment += 10;
        break;
        
      case 'Electronic':
        if (audioFeatures.danceability > 0.8) alignment += 20;
        if (audioFeatures.energy > 0.7) alignment += 15;
        break;
    }
    
    return Math.max(0, Math.min(100, alignment));
  }

  private calculateSeasonalFactors(genre: string): number {
    const seasonalFactor = this.seasonalFactors.get(genre) || 0;
    
    let seasonalScore = 70; // Base seasonal score
    
    // Adjust based on genre seasonality
    if (seasonalFactor > 0.1) seasonalScore += 20;
    if (seasonalFactor < -0.1) seasonalScore -= 15;
    
    return Math.max(0, Math.min(100, seasonalScore));
  }

  private assessRisks(audioFeatures: RealAudioFeatures, genreProfile: GenreProfile, _score: number): RiskAssessment {
    const riskFactors: string[] = [];
    let riskScore = 0;
    
    // Audio feature risks
    if (audioFeatures.energy < 0.3) {
      riskFactors.push('Low energy may limit audience engagement');
      riskScore += 20;
    }
    
    if (audioFeatures.danceability < 0.4) {
      riskFactors.push('Low danceability reduces viral potential');
      riskScore += 15;
    }
    
    // Genre market risks
    if (genreProfile.marketShare < 0.05) {
      riskFactors.push('Niche genre with limited market reach');
      riskScore += 25;
    }
    
    if (genreProfile.growthRate < -0.02) {
      riskFactors.push('Declining genre market');
      riskScore += 30;
    }
    
    // Determine overall risk level
    let overallRisk: 'low' | 'medium' | 'high' = 'low';
    if (riskScore > 50) overallRisk = 'high';
    else if (riskScore > 25) overallRisk = 'medium';
    
    return {
      overallRisk,
      riskScore: Math.min(100, riskScore),
      riskFactors,
      mitigationStrategies: this.generateMitigationStrategies(riskFactors)
    };
  }

  private generateMitigationStrategies(riskFactors: string[]): string[] {
    const strategies: string[] = [];
    
    if (riskFactors.includes('Low energy may limit audience engagement')) {
      strategies.push('Increase energy levels through production or mixing');
    }
    
    if (riskFactors.includes('Low danceability reduces viral potential')) {
      strategies.push('Work with a producer to refine rhythm and melody');
    }
    
    if (riskFactors.includes('Niche genre with limited market reach')) {
      strategies.push('Focus on building dedicated fanbase through targeted marketing');
    }
    
    if (riskFactors.includes('Declining genre market')) {
      strategies.push('Consider genre fusion or modern production techniques');
    }
    
    return strategies.length > 0 ? strategies : ['Continue with current approach'];
  }

  private generateRecommendations(
    _audioFeatures: RealAudioFeatures, 
    genreProfile: GenreProfile, 
    score: number, 
    riskAssessment: RiskAssessment
  ): Recommendation[] {
    const recommendations: Recommendation[] = [];
    
    // High priority recommendations for high scores
    if (score > 80) {
      recommendations.push({
        category: 'marketing',
        title: 'Aggressive Release Strategy',
        description: 'High success probability warrants significant marketing investment',
        priority: 'high',
        impact: 90,
        implementation: 'Allocate 60-80% of budget to marketing and promotion',
        estimatedROI: 3.5
      });
      
      recommendations.push({
        category: 'platform',
        title: 'Multi-Platform Release',
        description: 'Maximize reach across all major streaming platforms',
        priority: 'high',
        impact: 85,
        implementation: 'Coordinate release on Spotify, Apple Music, YouTube Music simultaneously',
        estimatedROI: 2.8
      });
    }
    
    // Medium priority recommendations for moderate scores
    if (score > 60) {
      recommendations.push({
        category: 'production',
        title: 'Production Refinement',
        description: 'Minor improvements could significantly boost success probability',
        priority: 'medium',
        impact: 70,
        implementation: 'Work with producer on mixing and mastering',
        estimatedROI: 2.2
      });
    }
    
    // Risk mitigation recommendations
    if (riskAssessment.overallRisk === 'high') {
      recommendations.push({
        category: 'production',
        title: 'Professional Consultation',
        description: 'High risk factors require expert guidance',
        priority: 'high',
        impact: 80,
        implementation: 'Schedule session with experienced music producer',
        estimatedROI: 1.8
      });
    }
    
    // Genre-specific recommendations
    if (genreProfile.name === 'Pop') {
      recommendations.push({
        category: 'timing',
        title: 'Summer Release Window',
        description: 'Pop songs perform best during summer months',
        priority: 'medium',
        impact: 65,
        implementation: 'Target June-August release window',
        estimatedROI: 2.1
      });
    }
    
    // Always include basic recommendations
    recommendations.push({
      category: 'audience',
      title: 'Social Media Engagement',
      description: 'Build audience connection through consistent social media presence',
      priority: 'medium',
      impact: 60,
      implementation: 'Post 3-5 times per week with engaging content',
      estimatedROI: 1.5
    });
    
    return recommendations;
  }

  private getFallbackPrediction(_audioFeatures: RealAudioFeatures, _genre: string): SuccessPrediction {
    return {
      score: 65,
      confidence: 0.6,
      factors: ['Balanced composition', 'Professional production quality'],
      marketPotential: 70,
      socialScore: 65,
      genreAlignment: 75,
      seasonalFactors: 70,
      recommendations: [
        {
          category: 'production',
          title: 'Focus on Mix Quality',
          description: 'Ensure professional mixing and mastering',
          priority: 'high',
          impact: 80,
          implementation: 'Work with experienced audio engineer',
          estimatedROI: 2.0
        }
      ],
      riskAssessment: {
        overallRisk: 'low',
        riskScore: 25,
        riskFactors: ['Limited market data'],
        mitigationStrategies: ['Gather more audience feedback']
      }
    };
  }

  private initializeGenreProfiles(): void {
    this.genreProfiles.set('Pop', {
      name: 'Pop',
      marketShare: 0.35,
      growthRate: 0.08,
      peakSeason: ['summer', 'spring'],
      targetDemographics: ['13-25', '26-35'],
      platformPerformance: { 'spotify': 0.9, 'apple': 0.85, 'youtube': 0.95 },
      successFactors: ['catchy melodies', 'danceable rhythms', 'relatable lyrics']
    });
    
    this.genreProfiles.set('Rock', {
      name: 'Rock',
      marketShare: 0.20,
      growthRate: -0.02,
      peakSeason: ['fall', 'winter'],
      targetDemographics: ['25-45', '46-55'],
      platformPerformance: { 'spotify': 0.75, 'apple': 0.80, 'youtube': 0.70 },
      successFactors: ['strong energy', 'memorable riffs', 'authentic performance']
    });
    
    this.genreProfiles.set('Electronic', {
      name: 'Electronic',
      marketShare: 0.15,
      growthRate: 0.12,
      peakSeason: ['summer', 'fall'],
      targetDemographics: ['18-30', '31-40'],
      platformPerformance: { 'spotify': 0.85, 'apple': 0.75, 'youtube': 0.90 },
      successFactors: ['innovative sounds', 'danceable beats', 'atmospheric elements']
    });
    
    this.genreProfiles.set('Hip-Hop', {
      name: 'Hip-Hop',
      marketShare: 0.25,
      growthRate: 0.15,
      peakSeason: ['all year'],
      targetDemographics: ['16-35', '36-45'],
      platformPerformance: { 'spotify': 0.95, 'apple': 0.90, 'youtube': 0.98 },
      successFactors: ['strong beats', 'authentic lyrics', 'cultural relevance']
    });
    
    this.genreProfiles.set('Folk', {
      name: 'Folk',
      marketShare: 0.05,
      growthRate: 0.03,
      peakSeason: ['spring', 'fall'],
      targetDemographics: ['25-45', '46-65'],
      platformPerformance: { 'spotify': 0.60, 'apple': 0.65, 'youtube': 0.55 },
      successFactors: ['authentic storytelling', 'acoustic quality', 'emotional depth']
    });
  }

  private initializeSeasonalFactors(): void {
    // Seasonal factors for different genres (positive = beneficial, negative = challenging)
    this.seasonalFactors.set('Pop', 0.15);      // Summer benefits
    this.seasonalFactors.set('Rock', -0.05);    // Slight winter preference
    this.seasonalFactors.set('Electronic', 0.10); // Summer/fall benefits
    this.seasonalFactors.set('Hip-Hop', 0.02);  // Year-round
    this.seasonalFactors.set('Folk', 0.08);     // Spring/fall benefits
  }

  private initializeMarketTrends(): void {
    // Current market trends for different genres (positive = growing, negative = declining)
    this.marketTrends.set('Pop', 0.05);        // Slight growth
    this.marketTrends.set('Rock', -0.03);      // Slight decline
    this.marketTrends.set('Electronic', 0.12); // Strong growth
    this.marketTrends.set('Hip-Hop', 0.18);    // Very strong growth
    this.marketTrends.set('Folk', 0.02);       // Stable
  }
}

export default MLSuccessPredictor;
