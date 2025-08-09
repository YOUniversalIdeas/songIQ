// Input validation and sanitization utilities

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
}

export interface SanitizationResult {
  sanitized: string;
  original: string;
  wasModified: boolean;
}

// Email validation
export const validateEmail = (email: string): ValidationResult => {
  const errors: string[] = [];
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  
  if (!email) {
    errors.push('Email is required');
  } else if (!emailRegex.test(email)) {
    errors.push('Please enter a valid email address');
  } else if (email.length > 254) {
    errors.push('Email is too long');
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
};

// Password validation
export const validatePassword = (password: string): ValidationResult => {
  const errors: string[] = [];
  
  if (!password) {
    errors.push('Password is required');
  } else {
    if (password.length < 8) {
      errors.push('Password must be at least 8 characters long');
    }
    if (!/[A-Z]/.test(password)) {
      errors.push('Password must contain at least one uppercase letter');
    }
    if (!/[a-z]/.test(password)) {
      errors.push('Password must contain at least one lowercase letter');
    }
    if (!/\d/.test(password)) {
      errors.push('Password must contain at least one number');
    }
    if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
      errors.push('Password must contain at least one special character');
    }
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
};

// Username validation
export const validateUsername = (username: string): ValidationResult => {
  const errors: string[] = [];
  const usernameRegex = /^[a-zA-Z0-9_-]{3,20}$/;
  
  if (!username) {
    errors.push('Username is required');
  } else if (!usernameRegex.test(username)) {
    errors.push('Username must be 3-20 characters and contain only letters, numbers, underscores, and hyphens');
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
};

// Song title validation
export const validateSongTitle = (title: string): ValidationResult => {
  const errors: string[] = [];
  
  if (!title) {
    errors.push('Song title is required');
  } else if (title.length > 100) {
    errors.push('Song title is too long (max 100 characters)');
  } else if (title.trim().length === 0) {
    errors.push('Song title cannot be empty');
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
};

// Artist name validation
export const validateArtistName = (artist: string): ValidationResult => {
  const errors: string[] = [];
  
  if (!artist) {
    errors.push('Artist name is required');
  } else if (artist.length > 100) {
    errors.push('Artist name is too long (max 100 characters)');
  } else if (artist.trim().length === 0) {
    errors.push('Artist name cannot be empty');
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
};

// File validation
export const validateAudioFile = (file: File): ValidationResult => {
  const errors: string[] = [];
  const maxSize = 50 * 1024 * 1024; // 50MB
  const allowedTypes = [
    'audio/mpeg',
    'audio/mp3',
    'audio/wav',
    'audio/ogg',
    'audio/m4a',
    'audio/aac',
    'audio/flac'
  ];
  
  if (!file) {
    errors.push('Audio file is required');
  } else {
    if (file.size > maxSize) {
      errors.push('File size must be less than 50MB');
    }
    if (!allowedTypes.includes(file.type)) {
      errors.push('Please upload a valid audio file (MP3, WAV, OGG, M4A, AAC, FLAC)');
    }
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
};

// Input sanitization
export const sanitizeString = (input: string): SanitizationResult => {
  const original = input;
  let sanitized = input;
  
  // Remove HTML tags
  sanitized = sanitized.replace(/<[^>]*>/g, '');
  
  // Remove script tags and their content
  sanitized = sanitized.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');
  
  // Remove potentially dangerous characters
  sanitized = sanitized.replace(/[<>]/g, '');
  
  // Trim whitespace
  sanitized = sanitized.trim();
  
  return {
    sanitized,
    original,
    wasModified: sanitized !== original
  };
};

// URL validation
export const validateUrl = (url: string): ValidationResult => {
  const errors: string[] = [];
  
  if (!url) {
    errors.push('URL is required');
  } else {
    try {
      new URL(url);
    } catch {
      errors.push('Please enter a valid URL');
    }
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
};

// Phone number validation
export const validatePhoneNumber = (phone: string): ValidationResult => {
  const errors: string[] = [];
  const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/;
  
  if (!phone) {
    errors.push('Phone number is required');
  } else if (!phoneRegex.test(phone.replace(/[\s\-\(\)]/g, ''))) {
    errors.push('Please enter a valid phone number');
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
};

// Generic form validation
export const validateForm = (data: Record<string, any>, rules: Record<string, (value: any) => ValidationResult>): ValidationResult => {
  const errors: string[] = [];
  
  for (const [field, validator] of Object.entries(rules)) {
    const result = validator(data[field]);
    if (!result.isValid) {
      errors.push(...result.errors);
    }
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
}; 