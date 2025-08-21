import { IAudioFeatures } from '../models/AudioFeatures';
import { SuccessScoreResult } from './successScoringService';

export interface ABTestConfig {
  testId: string;
  name: string;
  description: string;
  variants: {
    [variantId: string]: {
      name: string;
      description: string;
      algorithm: 'baseline' | 'experimental' | 'custom';
      config: any;
      weight: number; // Traffic allocation (0-1)
    };
  };
  startDate: Date;
  endDate?: Date;
  isActive: boolean;
  targetMetric: 'accuracy' | 'user_satisfaction' | 'prediction_error';
  minSampleSize: number;
}

export interface ABTestResult {
  testId: string;
  variantId: string;
  songId: string;
  predictedScore: number;
  actualPerformance?: number; // Will be filled later when we have real data
  userFeedback?: number; // 1-5 rating
  timestamp: Date;
}

export interface ABTestAnalysis {
  testId: string;
  variantResults: {
    [variantId: string]: {
      name: string;
      sampleSize: number;
      avgPredictedScore: number;
      avgActualPerformance: number;
      avgUserFeedback: number;
      predictionError: number;
      confidence: number;
      isWinner: boolean;
    };
  };
  overallWinner?: string;
  statisticalSignificance: number;
  recommendation: string;
  analysisDate: Date;
}

// In-memory storage for development (replace with database in production)
const AB_TEST_CONFIGS: { [testId: string]: ABTestConfig } = {};
const AB_TEST_RESULTS: ABTestResult[] = [];

/**
 * Create a new A/B test configuration
 */
export function createABTest(config: Omit<ABTestConfig, 'testId'>): ABTestConfig {
  const testId = generateTestId();
  const newTest: ABTestConfig = {
    ...config,
    testId,
    startDate: new Date(),
    isActive: true
  };
  
  AB_TEST_CONFIGS[testId] = newTest;
  console.log(`Created A/B test: ${testId} - ${config.name}`);
  
  return newTest;
}

/**
 * Get active A/B test for a song
 */
export function getActiveABTest(songId: string): ABTestConfig | null {
  const activeTests = Object.values(AB_TEST_CONFIGS).filter(test => 
    test.isActive && (!test.endDate || test.endDate > new Date())
  );
  
  if (activeTests.length === 0) return null;
  
  // Simple assignment based on song ID hash
  const hash = simpleHash(songId);
  const totalWeight = activeTests.reduce((sum, test) => 
    sum + Object.values(test.variants).reduce((vSum, variant) => vSum + variant.weight, 0), 0
  );
  
  let cumulativeWeight = 0;
  for (const test of activeTests) {
    for (const [variantId, variant] of Object.entries(test.variants)) {
      cumulativeWeight += variant.weight;
      if (hash <= cumulativeWeight / totalWeight) {
        return test;
      }
    }
  }
  
  return activeTests[0] || null; // Fallback
}

/**
 * Assign variant to a song for A/B testing
 */
export function assignVariant(test: ABTestConfig, songId: string): string {
  const hash = simpleHash(songId);
  const totalWeight = Object.values(test.variants).reduce((sum, variant) => sum + variant.weight, 0);
  
  let cumulativeWeight = 0;
  for (const [variantId, variant] of Object.entries(test.variants)) {
    cumulativeWeight += variant.weight;
    if (hash <= cumulativeWeight / totalWeight) {
      return variantId;
    }
  }
  
  // Fallback to first variant
  return Object.keys(test.variants)[0] || 'control';
}

/**
 * Apply A/B test variant to success scoring
 */
export async function applyABTestVariant(
  test: ABTestConfig,
  variantId: string,
  audioFeatures: Partial<IAudioFeatures>,
  genre?: string,
  releaseDate?: Date
): Promise<SuccessScoreResult> {
  const variant = test.variants[variantId];
  if (!variant) {
    throw new Error(`Variant ${variantId} not found in test ${test.testId}`);
  }
  
  // Import the success scoring service
  const { calculateSuccessScore } = await import('./successScoringService');
  
  // Apply variant-specific modifications
  let modifiedFeatures = { ...audioFeatures };
  let modifiedGenre = genre;
  let modifiedReleaseDate = releaseDate;
  
  switch (variant.algorithm) {
    case 'baseline':
      // Use standard algorithm
      break;
      
    case 'experimental':
      // Apply experimental modifications
      modifiedFeatures = applyExperimentalModifications(audioFeatures, variant.config);
      break;
      
    case 'custom':
      // Apply custom algorithm modifications
      modifiedFeatures = applyCustomModifications(audioFeatures, variant.config);
      break;
  }
  
  // Calculate score with modified parameters
  const result = await calculateSuccessScore(modifiedFeatures, modifiedGenre, modifiedReleaseDate);
  
  // Store A/B test result
  const abResult: ABTestResult = {
    testId: test.testId,
    variantId,
    songId: `song_${Date.now()}`, // In production, this would be the actual song ID
    predictedScore: result.overallScore,
    timestamp: new Date()
  };
  
  AB_TEST_RESULTS.push(abResult);
  
  return result;
}

/**
 * Apply experimental modifications to audio features
 */
function applyExperimentalModifications(
  features: Partial<IAudioFeatures>,
  config: any
): Partial<IAudioFeatures> {
  const modified = { ...features };
  
  // Example experimental modifications
  if (config.boostDanceability && features.danceability) {
    modified.danceability = Math.min(1, features.danceability * 1.1);
  }
  
  if (config.boostEnergy && features.energy) {
    modified.energy = Math.min(1, features.energy * 1.15);
  }
  
  if (config.adjustTempo && features.tempo) {
    modified.tempo = features.tempo * config.tempoMultiplier || 1.0;
  }
  
  return modified;
}

/**
 * Apply custom algorithm modifications
 */
function applyCustomModifications(
  features: Partial<IAudioFeatures>,
  config: any
): Partial<IAudioFeatures> {
  const modified = { ...features };
  
  // Custom weighting modifications
  if (config.customWeights) {
    // Apply custom feature weights
    Object.keys(config.customWeights).forEach(feature => {
      if (modified[feature as keyof IAudioFeatures] !== undefined) {
        const value = modified[feature as keyof IAudioFeatures] as number;
        const weight = config.customWeights[feature];
        (modified as any)[feature] = value * weight;
      }
    });
  }
  
  // Custom thresholds
  if (config.customThresholds) {
    Object.keys(config.customThresholds).forEach(feature => {
      if (modified[feature as keyof IAudioFeatures] !== undefined) {
        const value = modified[feature as keyof IAudioFeatures] as number;
        const threshold = config.customThresholds[feature];
        if (value < threshold.min) {
          (modified as any)[feature] = threshold.min;
        } else if (value > threshold.max) {
          (modified as any)[feature] = threshold.max;
        }
      }
    });
  }
  
  return modified;
}

/**
 * Record actual performance for A/B test results
 */
export function recordActualPerformance(
  testId: string,
  songId: string,
  actualPerformance: number
): void {
  const result = AB_TEST_RESULTS.find(r => r.testId === testId && r.songId === songId);
  if (result) {
    result.actualPerformance = actualPerformance;
  }
}

/**
 * Record user feedback for A/B test results
 */
export function recordUserFeedback(
  testId: string,
  songId: string,
  userFeedback: number
): void {
  const result = AB_TEST_RESULTS.find(r => r.testId === testId && r.songId === songId);
  if (result) {
    result.userFeedback = Math.max(1, Math.min(5, userFeedback));
  }
}

/**
 * Analyze A/B test results
 */
export function analyzeABTest(testId: string): ABTestAnalysis | null {
  const test = AB_TEST_CONFIGS[testId];
  if (!test) return null;
  
  const testResults = AB_TEST_RESULTS.filter(r => r.testId === testId);
  if (testResults.length === 0) return null;
  
  const variantResults: Record<string, any> = {};
  
  // Calculate metrics for each variant
  Object.keys(test.variants).forEach(variantId => {
    const variantResults = testResults.filter(r => r.variantId === variantId);
    
    if (variantResults.length === 0) return;
    
    const avgPredictedScore = variantResults.reduce((sum, r) => sum + r.predictedScore, 0) / variantResults.length;
    const avgActualPerformance = variantResults
      .filter(r => r.actualPerformance !== undefined)
      .reduce((sum, r) => sum + (r.actualPerformance || 0), 0) / variantResults.filter(r => r.actualPerformance !== undefined).length;
    const avgUserFeedback = variantResults
      .filter(r => r.userFeedback !== undefined)
      .reduce((sum, r) => sum + (r.userFeedback || 0), 0) / variantResults.filter(r => r.userFeedback !== undefined).length;
    
    const predictionError = Math.abs(avgPredictedScore - avgActualPerformance);
    
    const variant = test.variants[variantId];
    if (!variant) return;
    
    (variantResults as any)[variantId] = {
      name: variant.name,
      sampleSize: variantResults.length,
      avgPredictedScore,
      avgActualPerformance,
      avgUserFeedback,
      predictionError,
      confidence: calculateConfidence(variantResults.length),
      isWinner: false
    };
  });
  
  // Determine winner based on target metric
  let bestVariant: string | undefined;
  let bestScore = -Infinity;
  
  Object.entries(variantResults).forEach(([variantId, results]) => {
    let score = 0;
    
    switch (test.targetMetric) {
      case 'accuracy':
        score = 100 - results.predictionError;
        break;
      case 'user_satisfaction':
        score = results.avgUserFeedback;
        break;
      case 'prediction_error':
        score = 100 - results.predictionError;
        break;
    }
    
    if (score > bestScore) {
      bestScore = score;
      bestVariant = variantId;
    }
  });
  
  // Mark winner
  if (bestVariant) {
    variantResults[bestVariant].isWinner = true;
  }
  
  // Calculate statistical significance (simplified)
  const statisticalSignificance = calculateStatisticalSignificance(variantResults);
  
  return {
    testId,
    variantResults,
    overallWinner: bestVariant,
    statisticalSignificance,
    recommendation: generateRecommendation(variantResults, statisticalSignificance),
    analysisDate: new Date()
  };
}

/**
 * Calculate confidence interval
 */
function calculateConfidence(sampleSize: number): number {
  // Simplified confidence calculation
  return Math.min(1, sampleSize / 100);
}

/**
 * Calculate statistical significance (simplified)
 */
function calculateStatisticalSignificance(variantResults: { [variantId: string]: any }): number {
  const variants = Object.values(variantResults);
  if (variants.length < 2) return 0;
  
  // Simplified significance calculation
  const scores = variants.map(v => v.avgPredictedScore);
  const mean = scores.reduce((sum, score) => sum + score, 0) / scores.length;
  const variance = scores.reduce((sum, score) => sum + Math.pow(score - mean, 2), 0) / scores.length;
  
  return Math.min(1, variance / 100); // Simplified p-value approximation
}

/**
 * Generate recommendation based on analysis
 */
function generateRecommendation(
  variantResults: { [variantId: string]: any },
  significance: number
): string {
  const winner = Object.entries(variantResults).find(([_, results]) => results.isWinner);
  
  if (!winner) {
    return 'Insufficient data to determine winner';
  }
  
  const [winnerId, winnerResults] = winner;
  
  if (significance < 0.05) {
    return `Variant "${winnerResults.name}" shows statistically significant improvement. Consider implementing this algorithm.`;
  } else if (significance < 0.1) {
    return `Variant "${winnerResults.name}" shows promising results but needs more data for statistical significance.`;
  } else {
    return `No statistically significant difference between variants. Continue testing with larger sample size.`;
  }
}

/**
 * Get all A/B test configurations
 */
export function getAllABTests(): ABTestConfig[] {
  return Object.values(AB_TEST_CONFIGS);
}

/**
 * Get A/B test results
 */
export function getABTestResults(testId?: string): ABTestResult[] {
  if (testId) {
    return AB_TEST_RESULTS.filter(r => r.testId === testId);
  }
  return AB_TEST_RESULTS;
}

/**
 * Stop an A/B test
 */
export function stopABTest(testId: string): boolean {
  const test = AB_TEST_CONFIGS[testId];
  if (!test) return false;
  
  test.isActive = false;
  test.endDate = new Date();
  
  console.log(`Stopped A/B test: ${testId}`);
  return true;
}

/**
 * Generate unique test ID
 */
function generateTestId(): string {
  return `ab_test_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Simple hash function for consistent variant assignment
 */
function simpleHash(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32-bit integer
  }
  return Math.abs(hash) / 2147483647; // Normalize to 0-1
}

/**
 * Create example A/B test configurations
 */
export function createExampleABTests(): void {
  // Test 1: Danceability boost experiment
  createABTest({
    name: 'Danceability Boost Experiment',
    description: 'Testing if boosting danceability scores improves prediction accuracy',
    variants: {
      control: {
        name: 'Control',
        description: 'Standard algorithm',
        algorithm: 'baseline',
        config: {},
        weight: 0.5
      },
      experimental: {
        name: 'Danceability Boost',
        description: 'Boost danceability scores by 10%',
        algorithm: 'experimental',
        config: { boostDanceability: true },
        weight: 0.5
      }
    },
    targetMetric: 'accuracy',
    minSampleSize: 100,
    isActive: true,
    startDate: new Date()
  });
  
  // Test 2: Custom weighting experiment
  createABTest({
    name: 'Custom Feature Weights',
    description: 'Testing custom feature weighting for different genres',
    variants: {
      control: {
        name: 'Standard Weights',
        description: 'Standard genre-based weights',
        algorithm: 'baseline',
        config: {},
        weight: 0.4
      },
      custom_pop: {
        name: 'Pop-Optimized',
        description: 'Custom weights optimized for pop music',
        algorithm: 'custom',
        config: {
          customWeights: {
            danceability: 1.2,
            energy: 1.1,
            valence: 1.15
          }
        },
        weight: 0.3
      },
      custom_hiphop: {
        name: 'Hip-Hop Optimized',
        description: 'Custom weights optimized for hip-hop',
        algorithm: 'custom',
        config: {
          customWeights: {
            energy: 1.3,
            tempo: 1.1,
            loudness: 1.2
          }
        },
        weight: 0.3
      }
    },
    targetMetric: 'user_satisfaction',
    minSampleSize: 150,
    isActive: true,
    startDate: new Date()
  });
}

export default {
  createABTest,
  getActiveABTest,
  assignVariant,
  applyABTestVariant,
  recordActualPerformance,
  recordUserFeedback,
  analyzeABTest,
  getAllABTests,
  getABTestResults,
  stopABTest,
  createExampleABTests
}; 