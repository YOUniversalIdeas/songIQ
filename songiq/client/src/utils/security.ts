// Security utilities and configurations

// Content Security Policy configuration
export const CSP_CONFIG = {
  'default-src': ["'self'"],
  'script-src': [
    "'self'",
    "'unsafe-inline'", // Required for Vite in development
    "'unsafe-eval'",   // Required for Vite in development
  ],
  'style-src': [
    "'self'",
    "'unsafe-inline'", // Required for Tailwind CSS
  ],
  'img-src': [
    "'self'",
    'data:',
    'https:',
  ],
  'font-src': [
    "'self'",
    'data:',
  ],
  'connect-src': [
    "'self'",
    import.meta.env.VITE_API_URL || 'http://localhost:5001', // Development API
    'https://api.songiq.com', // Production API
  ],
  'media-src': [
    "'self'",
    'blob:',
  ],
  'object-src': ["'none'"],
  'base-uri': ["'self'"],
  'form-action': ["'self'"],
  'frame-ancestors': ["'none'"],
  'upgrade-insecure-requests': [],
};

// Generate CSP header string
export const generateCSPHeader = (): string => {
  return Object.entries(CSP_CONFIG)
    .map(([directive, sources]) => {
      if (sources.length === 0) {
        return directive;
      }
      return `${directive} ${sources.join(' ')}`;
    })
    .join('; ');
};

// Security headers configuration
export const SECURITY_HEADERS = {
  'Content-Security-Policy': generateCSPHeader(),
  'X-Content-Type-Options': 'nosniff',
  'X-Frame-Options': 'DENY',
  'X-XSS-Protection': '1; mode=block',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  'Permissions-Policy': 'camera=(), microphone=(), geolocation=()',
  'Strict-Transport-Security': 'max-age=31536000; includeSubDomains',
};

// Token management utilities
export class TokenManager {
  private static readonly TOKEN_KEY = 'songiq_token';
  private static readonly REFRESH_TOKEN_KEY = 'songiq_refresh_token';

  static setTokens(accessToken: string, refreshToken?: string): void {
    try {
      localStorage.setItem(this.TOKEN_KEY, accessToken);
      if (refreshToken) {
        localStorage.setItem(this.REFRESH_TOKEN_KEY, refreshToken);
      }
    } catch (error) {
      console.error('Failed to store tokens:', error);
    }
  }

  static getAccessToken(): string | null {
    try {
      return localStorage.getItem(this.TOKEN_KEY);
    } catch (error) {
      console.error('Failed to retrieve access token:', error);
      return null;
    }
  }

  static getRefreshToken(): string | null {
    try {
      return localStorage.getItem(this.REFRESH_TOKEN_KEY);
    } catch (error) {
      console.error('Failed to retrieve refresh token:', error);
      return null;
    }
  }

  static clearTokens(): void {
    try {
      localStorage.removeItem(this.TOKEN_KEY);
      localStorage.removeItem(this.REFRESH_TOKEN_KEY);
    } catch (error) {
      console.error('Failed to clear tokens:', error);
    }
  }

  static isTokenExpired(token: string): boolean {
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      const expirationTime = payload.exp * 1000; // Convert to milliseconds
      return Date.now() >= expirationTime;
    } catch (error) {
      console.error('Failed to parse token:', error);
      return true; // Assume expired if we can't parse
    }
  }
}

// Rate limiting utilities
export class RateLimiter {
  private static requests: Map<string, { count: number; resetTime: number }> = new Map();
  private static readonly WINDOW_MS = 15 * 60 * 1000; // 15 minutes
  private static readonly MAX_REQUESTS = 100;

  static checkRateLimit(identifier: string): boolean {
    const now = Date.now();
    const requestData = this.requests.get(identifier);

    if (!requestData || now > requestData.resetTime) {
      // Reset or initialize
      this.requests.set(identifier, {
        count: 1,
        resetTime: now + this.WINDOW_MS
      });
      return true;
    }

    if (requestData.count >= this.MAX_REQUESTS) {
      return false;
    }

    requestData.count++;
    return true;
  }

  static getRemainingRequests(identifier: string): number {
    const requestData = this.requests.get(identifier);
    if (!requestData || Date.now() > requestData.resetTime) {
      return this.MAX_REQUESTS;
    }
    return Math.max(0, this.MAX_REQUESTS - requestData.count);
  }
}

// Input sanitization for XSS prevention
export const sanitizeInput = (input: string): string => {
  return input
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/\//g, '&#x2F;');
};

// CSRF token generation
export const generateCSRFToken = (): string => {
  const array = new Uint8Array(32);
  crypto.getRandomValues(array);
  return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
};

// Secure random string generation
export const generateSecureRandomString = (length: number = 32): string => {
  const charset = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  const array = new Uint8Array(length);
  crypto.getRandomValues(array);
  
  for (let i = 0; i < length; i++) {
    result += charset[array[i] % charset.length];
  }
  
  return result;
};

// Password strength checker
export const checkPasswordStrength = (password: string): {
  score: number;
  feedback: string[];
  strength: 'weak' | 'medium' | 'strong' | 'very-strong';
} => {
  const feedback: string[] = [];
  let score = 0;

  // Length check
  if (password.length >= 8) score += 1;
  if (password.length >= 12) score += 1;
  if (password.length >= 16) score += 1;

  // Character variety checks
  if (/[a-z]/.test(password)) score += 1;
  if (/[A-Z]/.test(password)) score += 1;
  if (/\d/.test(password)) score += 1;
  if (/[!@#$%^&*(),.?":{}|<>]/.test(password)) score += 1;

  // Additional checks
  if (password.length < 8) feedback.push('Password should be at least 8 characters long');
  if (!/[a-z]/.test(password)) feedback.push('Add lowercase letters');
  if (!/[A-Z]/.test(password)) feedback.push('Add uppercase letters');
  if (!/\d/.test(password)) feedback.push('Add numbers');
  if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) feedback.push('Add special characters');

  let strength: 'weak' | 'medium' | 'strong' | 'very-strong';
  if (score <= 3) strength = 'weak';
  else if (score <= 5) strength = 'medium';
  else if (score <= 7) strength = 'strong';
  else strength = 'very-strong';

  return { score, feedback, strength };
}; 