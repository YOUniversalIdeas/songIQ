import { spawn } from 'child_process';
import * as fs from 'fs';
import * as path from 'path';

export interface EnhancedAudioFeatures {
  // Basic features
  tempo: number;
  key: string;
  mode: number; // 0 = minor, 1 = major
  loudness: number;
  duration: number;
  
  // Spectral features
  spectralCentroid: number;
  spectralRolloff: number;
  spectralFlatness: number;
  spectralBandwidth: number;
  zeroCrossingRate: number;
  
  // Rhythmic features
  rhythmStrength: number;
  beatConfidence: number;
  onsetRate: number;
  
  // Tonal features
  keyConfidence: number;
  harmonicComplexity: number;
  pitchVariability: number;
  
  // Dynamic features
  rms: number;
  dynamicRange: number;
  crestFactor: number;
  
  // Perceptual features
  danceability: number;
  energy: number;
  valence: number;
  acousticness: number;
  instrumentalness: number;
  liveness: number;
  speechiness: number;
  
  // Genre-specific features
  rockness: number;
  popness: number;
  electronicness: number;
  jazzness: number;
  classicalness: number;
  hiphopness: number;
  countryness: number;
  folkness: number;
  metalness: number;
  rnbness: number;
}

export interface GenreClassificationResult {
  primaryGenre: string;
  subGenres: string[];
  confidence: number;
  genreProbabilities: { [genre: string]: number };
  method: 'audio' | 'metadata' | 'ensemble';
  features: EnhancedAudioFeatures;
}

export class EnhancedAudioFeatureExtractor {
  private readonly GENRE_PROFILES = {
    'Pop': {
      tempo: { min: 100, max: 140, weight: 0.15 },
      danceability: { min: 0.6, max: 1.0, weight: 0.2 },
      energy: { min: 0.5, max: 1.0, weight: 0.15 },
      valence: { min: 0.4, max: 1.0, weight: 0.1 },
      acousticness: { min: 0.0, max: 0.4, weight: 0.1 },
      spectralCentroid: { min: 2000, max: 6000, weight: 0.1 },
      rhythmStrength: { min: 0.6, max: 1.0, weight: 0.1 },
      harmonicComplexity: { min: 0.3, max: 0.8, weight: 0.1 }
    },
    'Rock': {
      tempo: { min: 120, max: 180, weight: 0.1 },
      energy: { min: 0.7, max: 1.0, weight: 0.2 },
      valence: { min: 0.2, max: 0.8, weight: 0.1 },
      acousticness: { min: 0.0, max: 0.3, weight: 0.1 },
      spectralCentroid: { min: 3000, max: 8000, weight: 0.15 },
      rhythmStrength: { min: 0.7, max: 1.0, weight: 0.15 },
      harmonicComplexity: { min: 0.4, max: 0.9, weight: 0.1 },
      dynamicRange: { min: 0.6, max: 1.0, weight: 0.1 }
    },
    'Hip-Hop': {
      tempo: { min: 80, max: 120, weight: 0.1 },
      danceability: { min: 0.7, max: 1.0, weight: 0.2 },
      energy: { min: 0.6, max: 1.0, weight: 0.15 },
      valence: { min: 0.3, max: 0.9, weight: 0.1 },
      acousticness: { min: 0.0, max: 0.2, weight: 0.1 },
      speechiness: { min: 0.1, max: 0.8, weight: 0.15 },
      rhythmStrength: { min: 0.8, max: 1.0, weight: 0.1 },
      zeroCrossingRate: { min: 0.1, max: 0.4, weight: 0.1 }
    },
    'Electronic': {
      tempo: { min: 120, max: 200, weight: 0.1 },
      danceability: { min: 0.7, max: 1.0, weight: 0.2 },
      energy: { min: 0.6, max: 1.0, weight: 0.15 },
      valence: { min: 0.3, max: 0.9, weight: 0.1 },
      acousticness: { min: 0.0, max: 0.1, weight: 0.1 },
      spectralCentroid: { min: 4000, max: 10000, weight: 0.15 },
      rhythmStrength: { min: 0.8, max: 1.0, weight: 0.1 },
      harmonicComplexity: { min: 0.2, max: 0.7, weight: 0.1 }
    },
    'Country': {
      tempo: { min: 80, max: 140, weight: 0.1 },
      danceability: { min: 0.4, max: 0.8, weight: 0.1 },
      energy: { min: 0.3, max: 0.8, weight: 0.1 },
      valence: { min: 0.4, max: 0.9, weight: 0.1 },
      acousticness: { min: 0.6, max: 1.0, weight: 0.2 },
      spectralCentroid: { min: 1000, max: 4000, weight: 0.15 },
      rhythmStrength: { min: 0.4, max: 0.8, weight: 0.1 },
      harmonicComplexity: { min: 0.3, max: 0.7, weight: 0.15 }
    },
    'Jazz': {
      tempo: { min: 60, max: 200, weight: 0.05 },
      danceability: { min: 0.3, max: 0.7, weight: 0.1 },
      energy: { min: 0.2, max: 0.8, weight: 0.1 },
      valence: { min: 0.2, max: 0.8, weight: 0.1 },
      acousticness: { min: 0.7, max: 1.0, weight: 0.15 },
      spectralCentroid: { min: 1500, max: 5000, weight: 0.15 },
      harmonicComplexity: { min: 0.6, max: 1.0, weight: 0.2 },
      dynamicRange: { min: 0.7, max: 1.0, weight: 0.15 }
    },
    'Classical': {
      tempo: { min: 40, max: 200, weight: 0.05 },
      danceability: { min: 0.1, max: 0.5, weight: 0.05 },
      energy: { min: 0.1, max: 0.7, weight: 0.1 },
      valence: { min: 0.1, max: 0.9, weight: 0.1 },
      acousticness: { min: 0.9, max: 1.0, weight: 0.2 },
      spectralCentroid: { min: 1000, max: 4000, weight: 0.15 },
      harmonicComplexity: { min: 0.8, max: 1.0, weight: 0.2 },
      dynamicRange: { min: 0.8, max: 1.0, weight: 0.15 }
    },
    'Metal': {
      tempo: { min: 140, max: 300, weight: 0.1 },
      energy: { min: 0.8, max: 1.0, weight: 0.2 },
      valence: { min: 0.0, max: 0.4, weight: 0.1 },
      acousticness: { min: 0.0, max: 0.1, weight: 0.1 },
      spectralCentroid: { min: 5000, max: 12000, weight: 0.15 },
      rhythmStrength: { min: 0.9, max: 1.0, weight: 0.15 },
      harmonicComplexity: { min: 0.5, max: 1.0, weight: 0.1 },
      dynamicRange: { min: 0.3, max: 0.8, weight: 0.1 }
    },
    'R&B': {
      tempo: { min: 70, max: 120, weight: 0.1 },
      danceability: { min: 0.6, max: 0.9, weight: 0.15 },
      energy: { min: 0.4, max: 0.8, weight: 0.1 },
      valence: { min: 0.3, max: 0.8, weight: 0.1 },
      acousticness: { min: 0.1, max: 0.6, weight: 0.1 },
      speechiness: { min: 0.1, max: 0.6, weight: 0.15 },
      rhythmStrength: { min: 0.6, max: 0.9, weight: 0.1 },
      harmonicComplexity: { min: 0.4, max: 0.8, weight: 0.2 }
    },
    'Folk': {
      tempo: { min: 60, max: 120, weight: 0.1 },
      danceability: { min: 0.3, max: 0.7, weight: 0.1 },
      energy: { min: 0.2, max: 0.6, weight: 0.1 },
      valence: { min: 0.3, max: 0.8, weight: 0.1 },
      acousticness: { min: 0.8, max: 1.0, weight: 0.2 },
      spectralCentroid: { min: 800, max: 3000, weight: 0.15 },
      rhythmStrength: { min: 0.3, max: 0.7, weight: 0.1 },
      harmonicComplexity: { min: 0.2, max: 0.6, weight: 0.15 }
    }
  };

  async extractFeatures(audioFilePath: string): Promise<EnhancedAudioFeatures> {
    try {
      console.log('🎵 Starting enhanced audio feature extraction...');
      
      // Use FFmpeg to extract comprehensive audio features
      const features = await this.extractWithFFmpeg(audioFilePath);
      
      // Calculate additional features
      const enhancedFeatures = await this.calculateAdditionalFeatures(features, audioFilePath);
      
      console.log('✅ Enhanced audio features extracted successfully');
      return enhancedFeatures;
      
    } catch (error) {
      console.error('❌ Enhanced feature extraction failed:', error);
      throw new Error(`Enhanced feature extraction failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  private async extractWithFFmpeg(audioFilePath: string): Promise<Partial<EnhancedAudioFeatures>> {
    return new Promise((resolve, reject) => {
      const ffmpeg = spawn('ffmpeg', [
        '-i', audioFilePath,
        '-af', 'astats=metadata=1:reset=1,acompressor,acompressor',
        '-f', 'null',
        '-'
      ]);

      let output = '';
      let errorOutput = '';

      ffmpeg.stdout.on('data', (data) => {
        output += data.toString();
      });

      ffmpeg.stderr.on('data', (data) => {
        errorOutput += data.toString();
      });

      ffmpeg.on('close', (code) => {
        if (code === 0) {
          const features = this.parseFFmpegOutput(output + errorOutput);
          resolve(features);
        } else {
          reject(new Error(`FFmpeg failed with code ${code}: ${errorOutput}`));
        }
      });

      ffmpeg.on('error', (error) => {
        reject(new Error(`FFmpeg error: ${error.message}`));
      });
    });
  }

  private parseFFmpegOutput(output: string): Partial<EnhancedAudioFeatures> {
    // Parse FFmpeg output to extract basic features
    const features: Partial<EnhancedAudioFeatures> = {};
    
    // Extract basic audio properties
    const durationMatch = output.match(/Duration: (\d+):(\d+):(\d+\.\d+)/);
    if (durationMatch) {
      const hours = parseInt(durationMatch[1]);
      const minutes = parseInt(durationMatch[2]);
      const seconds = parseFloat(durationMatch[3]);
      features.duration = hours * 3600 + minutes * 60 + seconds;
    }

    // Extract loudness information
    const loudnessMatch = output.match(/mean_volume: ([\d.-]+) dB/);
    if (loudnessMatch) {
      features.loudness = parseFloat(loudnessMatch[1]);
    }

    // Extract RMS
    const rmsMatch = output.match(/rms_level: ([\d.-]+) dB/);
    if (rmsMatch) {
      features.rms = parseFloat(rmsMatch[1]);
    }

    // Extract peak level for dynamic range calculation
    const peakMatch = output.match(/peak_level: ([\d.-]+) dB/);
    if (peakMatch) {
      const peak = parseFloat(peakMatch[1]);
      const rms = features.rms || 0;
      features.dynamicRange = Math.max(0, peak - rms);
      features.crestFactor = peak - rms;
    }

    return features;
  }

  private async calculateAdditionalFeatures(
    basicFeatures: Partial<EnhancedAudioFeatures>, 
    audioFilePath: string
  ): Promise<EnhancedAudioFeatures> {
    // Read audio file for additional analysis
    const audioBuffer = await fs.promises.readFile(audioFilePath);
    
    // Calculate spectral features
    const spectralFeatures = this.calculateSpectralFeatures(audioBuffer);
    
    // Calculate rhythmic features
    const rhythmicFeatures = this.calculateRhythmicFeatures(audioBuffer, basicFeatures.tempo || 120);
    
    // Calculate tonal features
    const tonalFeatures = this.calculateTonalFeatures(audioBuffer);
    
    // Calculate perceptual features
    const perceptualFeatures = this.calculatePerceptualFeatures(audioBuffer, basicFeatures);
    
    // Calculate genre-specific features
    const genreFeatures = this.calculateGenreSpecificFeatures(audioBuffer, perceptualFeatures);

    return {
      // Basic features
      tempo: basicFeatures.tempo || this.estimateTempo(audioBuffer),
      key: tonalFeatures.key,
      mode: tonalFeatures.mode,
      loudness: basicFeatures.loudness || 0,
      duration: basicFeatures.duration || 0,
      
      // Spectral features
      ...spectralFeatures,
      
      // Rhythmic features
      ...rhythmicFeatures,
      
      // Tonal features
      ...tonalFeatures,
      
      // Dynamic features
      rms: basicFeatures.rms || 0,
      dynamicRange: basicFeatures.dynamicRange || 0,
      crestFactor: basicFeatures.crestFactor || 0,
      
      // Perceptual features
      ...perceptualFeatures,
      
      // Genre-specific features
      ...genreFeatures
    };
  }

  private calculateSpectralFeatures(audioBuffer: Buffer): Partial<EnhancedAudioFeatures> {
    // Convert buffer to audio samples and calculate FFT
    const samples = this.bufferToSamples(audioBuffer);
    const fft = this.performFFT(samples);
    
    // Calculate spectral centroid
    const spectralCentroid = this.calculateSpectralCentroid(fft);
    
    // Calculate spectral rolloff
    const spectralRolloff = this.calculateSpectralRolloff(fft);
    
    // Calculate spectral flatness
    const spectralFlatness = this.calculateSpectralFlatness(fft);
    
    // Calculate spectral bandwidth
    const spectralBandwidth = this.calculateSpectralBandwidth(fft, spectralCentroid);
    
    // Calculate zero crossing rate
    const zeroCrossingRate = this.calculateZeroCrossingRate(samples);

    return {
      spectralCentroid,
      spectralRolloff,
      spectralFlatness,
      spectralBandwidth,
      zeroCrossingRate
    };
  }

  private calculateRhythmicFeatures(audioBuffer: Buffer, tempo: number): Partial<EnhancedAudioFeatures> {
    const samples = this.bufferToSamples(audioBuffer);
    
    // Calculate rhythm strength
    const rhythmStrength = this.calculateRhythmStrength(samples);
    
    // Calculate beat confidence
    const beatConfidence = this.calculateBeatConfidence(samples, tempo);
    
    // Calculate onset rate
    const onsetRate = this.calculateOnsetRate(samples);

    return {
      rhythmStrength,
      beatConfidence,
      onsetRate
    };
  }

  private calculateTonalFeatures(audioBuffer: Buffer): Partial<EnhancedAudioFeatures> {
    const samples = this.bufferToSamples(audioBuffer);
    const fft = this.performFFT(samples);
    
    // Detect key and mode
    const { key, mode, confidence } = this.detectKey(fft);
    
    // Calculate harmonic complexity
    const harmonicComplexity = this.calculateHarmonicComplexity(fft);
    
    // Calculate pitch variability
    const pitchVariability = this.calculatePitchVariability(samples);

    return {
      key,
      mode,
      keyConfidence: confidence,
      harmonicComplexity,
      pitchVariability
    };
  }

  private calculatePerceptualFeatures(
    audioBuffer: Buffer, 
    basicFeatures: Partial<EnhancedAudioFeatures>
  ): Partial<EnhancedAudioFeatures> {
    const samples = this.bufferToSamples(audioBuffer);
    
    // Calculate danceability
    const danceability = this.calculateDanceability(samples, basicFeatures.tempo || 120);
    
    // Calculate energy
    const energy = this.calculateEnergy(samples);
    
    // Calculate valence
    const valence = this.calculateValence(samples);
    
    // Calculate acousticness
    const acousticness = this.calculateAcousticness(samples);
    
    // Calculate instrumentalness
    const instrumentalness = this.calculateInstrumentalness(samples);
    
    // Calculate liveness
    const liveness = this.calculateLiveness(samples);
    
    // Calculate speechiness
    const speechiness = this.calculateSpeechiness(samples);

    return {
      danceability,
      energy,
      valence,
      acousticness,
      instrumentalness,
      liveness,
      speechiness
    };
  }

  private calculateGenreSpecificFeatures(
    audioBuffer: Buffer, 
    perceptualFeatures: Partial<EnhancedAudioFeatures>
  ): Partial<EnhancedAudioFeatures> {
    const samples = this.bufferToSamples(audioBuffer);
    
    return {
      rockness: this.calculateRockness(samples, perceptualFeatures),
      popness: this.calculatePopness(samples, perceptualFeatures),
      electronicness: this.calculateElectronicness(samples, perceptualFeatures),
      jazzness: this.calculateJazzness(samples, perceptualFeatures),
      classicalness: this.calculateClassicalness(samples, perceptualFeatures),
      hiphopness: this.calculateHiphopness(samples, perceptualFeatures),
      countryness: this.calculateCountryness(samples, perceptualFeatures),
      folkness: this.calculateFolkness(samples, perceptualFeatures),
      metalness: this.calculateMetalness(samples, perceptualFeatures),
      rnbness: this.calculateRnbness(samples, perceptualFeatures)
    };
  }

  // Helper methods for audio analysis
  private bufferToSamples(audioBuffer: Buffer): Float32Array {
    // Convert audio buffer to float32 samples
    const samples = new Float32Array(audioBuffer.length / 2);
    for (let i = 0; i < samples.length; i++) {
      samples[i] = audioBuffer.readInt16LE(i * 2) / 32768.0;
    }
    return samples;
  }

  private performFFT(samples: Float32Array): Float32Array {
    // Simple FFT implementation (in production, use a proper FFT library)
    const N = samples.length;
    const fft = new Float32Array(N);
    
    for (let k = 0; k < N; k++) {
      let real = 0;
      let imag = 0;
      
      for (let n = 0; n < N; n++) {
        const angle = -2 * Math.PI * k * n / N;
        real += samples[n] * Math.cos(angle);
        imag += samples[n] * Math.sin(angle);
      }
      
      fft[k] = Math.sqrt(real * real + imag * imag);
    }
    
    return fft;
  }

  private calculateSpectralCentroid(fft: Float32Array): number {
    let weightedSum = 0;
    let magnitudeSum = 0;
    
    for (let i = 0; i < fft.length; i++) {
      weightedSum += i * fft[i];
      magnitudeSum += fft[i];
    }
    
    return magnitudeSum > 0 ? weightedSum / magnitudeSum : 0;
  }

  private calculateSpectralRolloff(fft: Float32Array): number {
    const totalEnergy = fft.reduce((sum, val) => sum + val, 0);
    const threshold = totalEnergy * 0.85;
    
    let cumulativeEnergy = 0;
    for (let i = 0; i < fft.length; i++) {
      cumulativeEnergy += fft[i];
      if (cumulativeEnergy >= threshold) {
        return i / fft.length;
      }
    }
    
    return 1.0;
  }

  private calculateSpectralFlatness(fft: Float32Array): number {
    let geometricMean = 1;
    let arithmeticMean = 0;
    
    for (let i = 0; i < fft.length; i++) {
      if (fft[i] > 0) {
        geometricMean *= Math.pow(fft[i], 1 / fft.length);
      }
      arithmeticMean += fft[i];
    }
    
    arithmeticMean /= fft.length;
    
    return arithmeticMean > 0 ? geometricMean / arithmeticMean : 0;
  }

  private calculateSpectralBandwidth(fft: Float32Array, centroid: number): number {
    let weightedSum = 0;
    let magnitudeSum = 0;
    
    for (let i = 0; i < fft.length; i++) {
      const diff = i - centroid;
      weightedSum += diff * diff * fft[i];
      magnitudeSum += fft[i];
    }
    
    return magnitudeSum > 0 ? Math.sqrt(weightedSum / magnitudeSum) : 0;
  }

  private calculateZeroCrossingRate(samples: Float32Array): number {
    let crossings = 0;
    
    for (let i = 1; i < samples.length; i++) {
      if ((samples[i] >= 0) !== (samples[i - 1] >= 0)) {
        crossings++;
      }
    }
    
    return crossings / samples.length;
  }

  private calculateRhythmStrength(samples: Float32Array): number {
    // Calculate variance of audio levels as rhythm measure
    const windowSize = 1024;
    const windows = Math.floor(samples.length / windowSize);
    const levels = [];
    
    for (let i = 0; i < windows; i++) {
      const start = i * windowSize;
      const end = Math.min(start + windowSize, samples.length);
      let level = 0;
      
      for (let j = start; j < end; j++) {
        level += Math.abs(samples[j]);
      }
      
      levels.push(level / (end - start));
    }
    
    // Calculate variance
    const mean = levels.reduce((sum, val) => sum + val, 0) / levels.length;
    const variance = levels.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / levels.length;
    
    return Math.min(1, variance);
  }

  private calculateBeatConfidence(samples: Float32Array, tempo: number): number {
    // Simple beat confidence based on tempo consistency
    const expectedBeatInterval = 60 / tempo; // seconds per beat
    const sampleRate = 44100; // Assuming 44.1kHz
    const expectedSamplesPerBeat = expectedBeatInterval * sampleRate;
    
    // Analyze beat patterns (simplified)
    const windowSize = Math.floor(expectedSamplesPerBeat);
    const windows = Math.floor(samples.length / windowSize);
    
    if (windows < 2) return 0.5;
    
    let consistentBeats = 0;
    for (let i = 1; i < windows; i++) {
      const prevStart = (i - 1) * windowSize;
      const currStart = i * windowSize;
      const prevEnd = Math.min(prevStart + windowSize, samples.length);
      const currEnd = Math.min(currStart + windowSize, samples.length);
      
      const prevEnergy = this.calculateEnergyInRange(samples, prevStart, prevEnd);
      const currEnergy = this.calculateEnergyInRange(samples, currStart, currEnd);
      
      if (Math.abs(prevEnergy - currEnergy) < 0.1) {
        consistentBeats++;
      }
    }
    
    return consistentBeats / (windows - 1);
  }

  private calculateOnsetRate(samples: Float32Array): number {
    // Calculate rate of onset detection
    const windowSize = 1024;
    const hopSize = 512;
    const windows = Math.floor((samples.length - windowSize) / hopSize);
    let onsets = 0;
    
    let prevEnergy = 0;
    for (let i = 0; i < windows; i++) {
      const start = i * hopSize;
      const end = Math.min(start + windowSize, samples.length);
      const energy = this.calculateEnergyInRange(samples, start, end);
      
      if (energy > prevEnergy * 1.5) { // Threshold for onset detection
        onsets++;
      }
      
      prevEnergy = energy;
    }
    
    return onsets / windows;
  }

  private detectKey(fft: Float32Array): { key: string; mode: number; confidence: number } {
    // Simple key detection based on frequency analysis
    const keys = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
    
    // Find dominant frequencies
    const frequencies = [];
    for (let i = 0; i < fft.length / 2; i++) {
      frequencies.push({ freq: i, magnitude: fft[i] });
    }
    
    frequencies.sort((a, b) => b.magnitude - a.magnitude);
    
    // Simple key detection (in production, use more sophisticated methods)
    const dominantFreq = frequencies[0].freq;
    const keyIndex = Math.round(dominantFreq / (fft.length / 12)) % 12;
    
    return {
      key: keys[keyIndex],
      mode: Math.random() > 0.5 ? 1 : 0, // Simplified
      confidence: Math.min(0.9, frequencies[0].magnitude / 1000)
    };
  }

  private calculateHarmonicComplexity(fft: Float32Array): number {
    // Calculate harmonic complexity based on frequency distribution
    const peaks = [];
    for (let i = 1; i < fft.length - 1; i++) {
      if (fft[i] > fft[i - 1] && fft[i] > fft[i + 1] && fft[i] > 0.1) {
        peaks.push(fft[i]);
      }
    }
    
    return Math.min(1, peaks.length / 50); // Normalize by expected peak count
  }

  private calculatePitchVariability(samples: Float32Array): number {
    // Calculate pitch variability over time
    const windowSize = 2048;
    const hopSize = 1024;
    const windows = Math.floor((samples.length - windowSize) / hopSize);
    const pitches = [];
    
    for (let i = 0; i < windows; i++) {
      const start = i * hopSize;
      const end = Math.min(start + windowSize, samples.length);
      const window = samples.slice(start, end);
      const fft = this.performFFT(window);
      
      // Find dominant frequency
      let maxFreq = 0;
      let maxMagnitude = 0;
      for (let j = 0; j < fft.length / 2; j++) {
        if (fft[j] > maxMagnitude) {
          maxMagnitude = fft[j];
          maxFreq = j;
        }
      }
      
      pitches.push(maxFreq);
    }
    
    // Calculate variance of pitches
    if (pitches.length < 2) return 0;
    
    const mean = pitches.reduce((sum, val) => sum + val, 0) / pitches.length;
    const variance = pitches.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / pitches.length;
    
    return Math.min(1, variance / 1000); // Normalize
  }

  private calculateDanceability(samples: Float32Array, tempo: number): number {
    // Calculate danceability based on tempo and rhythm
    let danceability = 0;
    
    // Tempo factor (optimal range: 100-130 BPM)
    if (tempo >= 100 && tempo <= 130) {
      danceability += 0.4;
    } else if (tempo >= 80 && tempo <= 160) {
      danceability += 0.2;
    }
    
    // Rhythm strength factor
    const rhythmStrength = this.calculateRhythmStrength(samples);
    danceability += rhythmStrength * 0.3;
    
    // Beat consistency factor
    const beatConfidence = this.calculateBeatConfidence(samples, tempo);
    danceability += beatConfidence * 0.3;
    
    return Math.min(1, danceability);
  }

  private calculateEnergy(samples: Float32Array): number {
    // Calculate energy as RMS of samples
    let sum = 0;
    for (let i = 0; i < samples.length; i++) {
      sum += samples[i] * samples[i];
    }
    
    return Math.sqrt(sum / samples.length);
  }

  private calculateValence(samples: Float32Array): number {
    // Calculate valence based on spectral characteristics
    const fft = this.performFFT(samples);
    const spectralCentroid = this.calculateSpectralCentroid(fft);
    
    // Higher spectral centroid often indicates more positive valence
    return Math.min(1, spectralCentroid / 5000);
  }

  private calculateAcousticness(samples: Float32Array): number {
    // Calculate acousticness based on spectral characteristics
    const fft = this.performFFT(samples);
    const spectralCentroid = this.calculateSpectralCentroid(fft);
    
    // Lower spectral centroid often indicates more acoustic content
    return Math.max(0, 1 - (spectralCentroid / 4000));
  }

  private calculateInstrumentalness(samples: Float32Array): number {
    // Calculate instrumentalness based on speechiness
    const speechiness = this.calculateSpeechiness(samples);
    return Math.max(0, 1 - speechiness);
  }

  private calculateLiveness(samples: Float32Array): number {
    // Calculate liveness based on dynamic range and noise characteristics
    const dynamicRange = this.calculateDynamicRange(samples);
    const noiseLevel = this.calculateNoiseLevel(samples);
    
    return Math.min(1, (dynamicRange + noiseLevel) / 2);
  }

  private calculateSpeechiness(samples: Float32Array): number {
    // Calculate speechiness based on zero crossing rate and spectral characteristics
    const zcr = this.calculateZeroCrossingRate(samples);
    const fft = this.performFFT(samples);
    const spectralCentroid = this.calculateSpectralCentroid(fft);
    
    // Higher ZCR and lower spectral centroid often indicate speech
    return Math.min(1, (zcr + (1 - spectralCentroid / 3000)) / 2);
  }

  private calculateDynamicRange(samples: Float32Array): number {
    // Calculate dynamic range
    let max = 0;
    let min = 0;
    
    for (let i = 0; i < samples.length; i++) {
      max = Math.max(max, samples[i]);
      min = Math.min(min, samples[i]);
    }
    
    return Math.min(1, (max - min) / 2);
  }

  private calculateNoiseLevel(samples: Float32Array): number {
    // Calculate noise level based on high-frequency content
    const fft = this.performFFT(samples);
    const highFreqStart = Math.floor(fft.length * 0.7);
    let highFreqEnergy = 0;
    
    for (let i = highFreqStart; i < fft.length; i++) {
      highFreqEnergy += fft[i];
    }
    
    const totalEnergy = fft.reduce((sum, val) => sum + val, 0);
    return totalEnergy > 0 ? highFreqEnergy / totalEnergy : 0;
  }

  private calculateEnergyInRange(samples: Float32Array, start: number, end: number): number {
    let energy = 0;
    for (let i = start; i < end; i++) {
      energy += samples[i] * samples[i];
    }
    return Math.sqrt(energy / (end - start));
  }

  private estimateTempo(audioBuffer: Buffer): number {
    // Simple tempo estimation (in production, use more sophisticated methods)
    const samples = this.bufferToSamples(audioBuffer);
    const rhythmStrength = this.calculateRhythmStrength(samples);
    
    // Estimate tempo based on rhythm strength and audio length
    const duration = audioBuffer.length / (44100 * 2); // Assuming 44.1kHz, 16-bit
    const baseTempo = 120;
    
    return Math.round(baseTempo + (rhythmStrength - 0.5) * 40);
  }

  // Genre-specific feature calculations
  private calculateRockness(samples: Float32Array, perceptualFeatures: Partial<EnhancedAudioFeatures>): number {
    const energy = perceptualFeatures.energy || 0;
    const dynamicRange = this.calculateDynamicRange(samples);
    const rhythmStrength = this.calculateRhythmStrength(samples);
    
    return Math.min(1, (energy * 0.4 + dynamicRange * 0.3 + rhythmStrength * 0.3));
  }

  private calculatePopness(samples: Float32Array, perceptualFeatures: Partial<EnhancedAudioFeatures>): number {
    const danceability = perceptualFeatures.danceability || 0;
    const energy = perceptualFeatures.energy || 0;
    const valence = perceptualFeatures.valence || 0;
    
    return Math.min(1, (danceability * 0.4 + energy * 0.3 + valence * 0.3));
  }

  private calculateElectronicness(samples: Float32Array, perceptualFeatures: Partial<EnhancedAudioFeatures>): number {
    const acousticness = perceptualFeatures.acousticness || 0;
    const energy = perceptualFeatures.energy || 0;
    const danceability = perceptualFeatures.danceability || 0;
    
    return Math.min(1, ((1 - acousticness) * 0.5 + energy * 0.3 + danceability * 0.2));
  }

  private calculateJazzness(samples: Float32Array, perceptualFeatures: Partial<EnhancedAudioFeatures>): number {
    const harmonicComplexity = this.calculateHarmonicComplexity(this.performFFT(samples));
    const acousticness = perceptualFeatures.acousticness || 0;
    const dynamicRange = this.calculateDynamicRange(samples);
    
    return Math.min(1, (harmonicComplexity * 0.4 + acousticness * 0.3 + dynamicRange * 0.3));
  }

  private calculateClassicalness(samples: Float32Array, perceptualFeatures: Partial<EnhancedAudioFeatures>): number {
    const acousticness = perceptualFeatures.acousticness || 0;
    const harmonicComplexity = this.calculateHarmonicComplexity(this.performFFT(samples));
    const dynamicRange = this.calculateDynamicRange(samples);
    
    return Math.min(1, (acousticness * 0.4 + harmonicComplexity * 0.4 + dynamicRange * 0.2));
  }

  private calculateHiphopness(samples: Float32Array, perceptualFeatures: Partial<EnhancedAudioFeatures>): number {
    const speechiness = perceptualFeatures.speechiness || 0;
    const danceability = perceptualFeatures.danceability || 0;
    const rhythmStrength = this.calculateRhythmStrength(samples);
    
    return Math.min(1, (speechiness * 0.4 + danceability * 0.3 + rhythmStrength * 0.3));
  }

  private calculateCountryness(samples: Float32Array, perceptualFeatures: Partial<EnhancedAudioFeatures>): number {
    const acousticness = perceptualFeatures.acousticness || 0;
    const valence = perceptualFeatures.valence || 0;
    const energy = perceptualFeatures.energy || 0;
    
    return Math.min(1, (acousticness * 0.5 + valence * 0.3 + (1 - energy) * 0.2));
  }

  private calculateFolkness(samples: Float32Array, perceptualFeatures: Partial<EnhancedAudioFeatures>): number {
    const acousticness = perceptualFeatures.acousticness || 0;
    const energy = perceptualFeatures.energy || 0;
    const harmonicComplexity = this.calculateHarmonicComplexity(this.performFFT(samples));
    
    return Math.min(1, (acousticness * 0.5 + (1 - energy) * 0.3 + (1 - harmonicComplexity) * 0.2));
  }

  private calculateMetalness(samples: Float32Array, perceptualFeatures: Partial<EnhancedAudioFeatures>): number {
    const energy = perceptualFeatures.energy || 0;
    const valence = perceptualFeatures.valence || 0;
    const rhythmStrength = this.calculateRhythmStrength(samples);
    
    return Math.min(1, (energy * 0.4 + (1 - valence) * 0.3 + rhythmStrength * 0.3));
  }

  private calculateRnbness(samples: Float32Array, perceptualFeatures: Partial<EnhancedAudioFeatures>): number {
    const speechiness = perceptualFeatures.speechiness || 0;
    const danceability = perceptualFeatures.danceability || 0;
    const energy = perceptualFeatures.energy || 0;
    
    return Math.min(1, (speechiness * 0.3 + danceability * 0.4 + energy * 0.3));
  }
}
