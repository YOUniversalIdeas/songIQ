import dotenv from 'dotenv';
import * as path from 'path';

/**
 * Environment Loader Utility
 * 
 * This utility properly loads environment variables based on NODE_ENV
 * and provides fallback mechanisms for different deployment scenarios.
 */

export interface EnvLoadResult {
  success: boolean;
  envFile: string;
  nodeEnv: string;
  error?: string;
}

/**
 * Loads environment variables based on NODE_ENV
 * 
 * Environment file priority:
 * 1. .env.production (for NODE_ENV=production)
 * 2. .env.staging (for NODE_ENV=staging) 
 * 3. env.development (for NODE_ENV=development or default)
 * 
 * @param customPath - Optional custom path to environment file
 * @returns EnvLoadResult with loading status and details
 */
export function loadEnvironment(customPath?: string): EnvLoadResult {
  const nodeEnv = process.env.NODE_ENV || 'development';
  const currentDir = process.cwd();
  
  let envFile: string;
  
  if (customPath) {
    envFile = customPath;
  } else {
    // Determine environment file based on NODE_ENV
    if (nodeEnv === 'production') {
      envFile = './.env.production';
    } else if (nodeEnv === 'staging') {
      envFile = './.env.staging';
    } else {
      envFile = './env.development';
    }
  }
  
  console.log('🔧 Environment Loader:');
  console.log('  NODE_ENV:', nodeEnv);
  console.log('  Working Directory:', currentDir);
  console.log('  Environment File:', envFile);
  
  // Try to load the environment file
  const envResult = dotenv.config({ path: envFile });
  
  if (envResult.error) {
    console.warn('⚠️  Environment file not found:', envFile);
    console.warn('⚠️  Error:', envResult.error.message);
    
    // Try fallback to .env file
    const fallbackResult = dotenv.config({ path: './.env' });
    if (fallbackResult.error) {
      console.warn('⚠️  Fallback .env file also not found');
      return {
        success: false,
        envFile,
        nodeEnv,
        error: `Environment file not found: ${envFile}. Fallback .env also not found.`
      };
    } else {
      console.log('✅ Fallback .env file loaded successfully');
      return {
        success: true,
        envFile: './.env',
        nodeEnv
      };
    }
  } else {
    console.log('✅ Environment loaded successfully from:', envFile);
    return {
      success: true,
      envFile,
      nodeEnv
    };
  }
}

/**
 * Validates that required environment variables are present
 * 
 * @param requiredVars - Array of required environment variable names
 * @returns Array of missing variables
 */
export function validateRequiredEnvVars(requiredVars: string[]): string[] {
  const missing: string[] = [];
  
  for (const varName of requiredVars) {
    if (!process.env[varName]) {
      missing.push(varName);
    }
  }
  
  if (missing.length > 0) {
    console.error('❌ Missing required environment variables:', missing);
  } else {
    console.log('✅ All required environment variables are present');
  }
  
  return missing;
}

/**
 * Logs environment configuration status (without exposing sensitive values)
 */
export function logEnvironmentStatus(): void {
  console.log('🔑 Environment Status:');
  console.log('  NODE_ENV:', process.env.NODE_ENV || 'development');
  console.log('  PORT:', process.env.PORT || '5001');
  console.log('  MONGODB_URI:', process.env.MONGODB_URI ? '✅ Set' : '❌ Not set');
  console.log('  STRIPE_SECRET_KEY:', process.env.STRIPE_SECRET_KEY ? '✅ Set' : '❌ Not set');
  console.log('  SPOTIFY_CLIENT_ID:', process.env.SPOTIFY_CLIENT_ID ? '✅ Set' : '❌ Not set');
  console.log('  YOUTUBE_API_KEY:', process.env.YOUTUBE_API_KEY ? '✅ Set' : '❌ Not set');
  console.log('  LASTFM_API_KEY:', process.env.LASTFM_API_KEY ? '✅ Set' : '❌ Not set');
}

/**
 * Gets a safe environment variable value (masks sensitive data)
 * 
 * @param varName - Environment variable name
 * @param defaultValue - Default value if not set
 * @returns Safe value for logging (masks sensitive data)
 */
export function getSafeEnvValue(varName: string, defaultValue: string = 'Not set'): string {
  const value = process.env[varName];
  if (!value) return defaultValue;
  
  // Mask sensitive environment variables
  const sensitiveVars = [
    'STRIPE_SECRET_KEY',
    'SPOTIFY_CLIENT_SECRET',
    'MONGODB_URI',
    'JWT_SECRET',
    'EMAIL_PASSWORD',
    'TWILIO_AUTH_TOKEN'
  ];
  
  if (sensitiveVars.includes(varName)) {
    return '***MASKED***';
  }
  
  return value;
}
