import * as fs from 'fs';
import * as path from 'path';
import { promisify } from 'util';
import { exec } from 'child_process';

const execAsync = promisify(exec);

export interface AudioMetadata {
  duration: number; // Duration in seconds
  bitrate?: number; // Bitrate in kbps
  sampleRate?: number; // Sample rate in Hz
  channels?: number; // Number of audio channels
  format?: string; // Audio format (mp3, wav, etc.)
  size: number; // File size in bytes
}

export interface AudioAnalysisResult {
  metadata: AudioMetadata;
  isValid: boolean;
  error?: string;
}

/**
 * Extract audio metadata using ffprobe (if available) or fallback methods
 */
export const extractAudioMetadata = async (filePath: string): Promise<AudioAnalysisResult> => {
  try {
    // Check if file exists
    if (!fs.existsSync(filePath)) {
      return {
        metadata: { duration: 0, size: 0 },
        isValid: false,
        error: 'File not found'
      };
    }

    // Get file stats
    const stats = fs.statSync(filePath);
    const fileSize = stats.size;

    // Try to use ffprobe first (most accurate)
    try {
      const metadata = await extractMetadataWithFFprobe(filePath);
      return {
        metadata: { ...metadata, size: fileSize },
        isValid: true
      };
    } catch (ffprobeError) {
      console.warn('FFprobe not available, using fallback method:', ffprobeError);
      
      // Fallback: estimate duration based on file size and format
      const metadata = await estimateAudioMetadata(filePath, fileSize);
      return {
        metadata: { ...metadata, size: fileSize },
        isValid: true
      };
    }
  } catch (error) {
    return {
      metadata: { duration: 0, size: 0 },
      isValid: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
};

/**
 * Extract audio metadata using ffprobe
 */
const extractMetadataWithFFprobe = async (filePath: string): Promise<AudioMetadata> => {
  const command = `ffprobe -v quiet -print_format json -show_format -show_streams "${filePath}"`;
  
  try {
    const { stdout } = await execAsync(command);
    const data = JSON.parse(stdout);
    
    // Find audio stream
    const audioStream = data.streams?.find((stream: any) => stream.codec_type === 'audio');
    const format = data.format;
    
    if (!audioStream || !format) {
      throw new Error('No audio stream found');
    }
    
    return {
      duration: parseFloat(format.duration) || 0,
      bitrate: parseInt(format.bit_rate) ? Math.round(parseInt(format.bit_rate) / 1000) : undefined,
      sampleRate: parseInt(audioStream.sample_rate) || undefined,
      channels: parseInt(audioStream.channels) || undefined,
      format: path.extname(filePath).toLowerCase().replace('.', ''),
      size: parseInt(format.size) || 0
    };
  } catch (error) {
    throw new Error(`FFprobe extraction failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
};

/**
 * Estimate audio metadata based on file size and format
 */
const estimateAudioMetadata = async (filePath: string, fileSize: number): Promise<AudioMetadata> => {
  const extension = path.extname(filePath).toLowerCase();
  
  // Rough estimates based on common audio formats and bitrates
  const formatEstimates = {
    '.mp3': { avgBitrate: 128, sampleRate: 44100, channels: 2 },
    '.wav': { avgBitrate: 1411, sampleRate: 44100, channels: 2 }, // CD quality
    '.m4a': { avgBitrate: 256, sampleRate: 44100, channels: 2 },
    '.flac': { avgBitrate: 1000, sampleRate: 44100, channels: 2 }
  };
  
  const estimate = formatEstimates[extension as keyof typeof formatEstimates];
  
  if (!estimate) {
    // Default estimate for unknown formats
    return {
      duration: 0,
      format: extension.replace('.', ''),
      size: fileSize
    };
  }
  
  // Calculate estimated duration: (fileSize * 8) / (bitrate * 1000)
  const estimatedDuration = (fileSize * 8) / (estimate.avgBitrate * 1000);
  
  return {
    duration: Math.round(estimatedDuration),
    bitrate: estimate.avgBitrate,
    sampleRate: estimate.sampleRate,
    channels: estimate.channels,
    format: extension.replace('.', ''),
    size: fileSize
  };
};

/**
 * Validate audio file format and basic integrity
 */
export const validateAudioFile = async (filePath: string): Promise<{ isValid: boolean; error?: string }> => {
  try {
    const extension = path.extname(filePath).toLowerCase();
    const allowedExtensions = ['.mp3', '.wav', '.m4a', '.flac'];
    
    if (!allowedExtensions.includes(extension)) {
      return {
        isValid: false,
        error: `Unsupported file format: ${extension}`
      };
    }
    
    // Check file size
    const stats = fs.statSync(filePath);
    const maxSize = 50 * 1024 * 1024; // 50MB
    
    if (stats.size > maxSize) {
      return {
        isValid: false,
        error: `File too large: ${(stats.size / (1024 * 1024)).toFixed(2)}MB (max: 50MB)`
      };
    }
    
    if (stats.size === 0) {
      return {
        isValid: false,
        error: 'File is empty'
      };
    }
    
    // Try to extract metadata to verify file integrity
    const metadata = await extractAudioMetadata(filePath);
    
    if (!metadata.isValid) {
      return {
        isValid: false,
        error: metadata.error || 'Invalid audio file'
      };
    }
    
    if (metadata.metadata.duration <= 0) {
      return {
        isValid: false,
        error: 'Could not determine audio duration'
      };
    }
    
    return { isValid: true };
  } catch (error) {
    return {
      isValid: false,
      error: error instanceof Error ? error.message : 'File validation failed'
    };
  }
};

/**
 * Format duration in MM:SS format
 */
export const formatDuration = (seconds: number): string => {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = Math.floor(seconds % 60);
  return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
};

/**
 * Format file size in human-readable format
 */
export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

/**
 * Get audio format information
 */
export const getAudioFormatInfo = (extension: string) => {
  const formatInfo = {
    '.mp3': {
      name: 'MP3',
      description: 'MPEG Audio Layer III',
      quality: 'Good',
      compression: 'Lossy'
    },
    '.wav': {
      name: 'WAV',
      description: 'Waveform Audio File Format',
      quality: 'Excellent',
      compression: 'Lossless'
    },
    '.m4a': {
      name: 'M4A',
      description: 'MPEG-4 Audio',
      quality: 'Good',
      compression: 'Lossy'
    },
    '.flac': {
      name: 'FLAC',
      description: 'Free Lossless Audio Codec',
      quality: 'Excellent',
      compression: 'Lossless'
    }
  };
  
  return formatInfo[extension.toLowerCase() as keyof typeof formatInfo] || {
    name: extension.toUpperCase().replace('.', ''),
    description: 'Unknown format',
    quality: 'Unknown',
    compression: 'Unknown'
  };
}; 