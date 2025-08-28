// API Configuration
export const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001';

export const API_ENDPOINTS = {
  AUTH: {
    LOGIN: `${API_BASE_URL}/api/auth/login`,
    REGISTER: `${API_BASE_URL}/api/auth/register`,
    PROFILE: `${API_BASE_URL}/api/auth/profile`,
    LOGOUT: `${API_BASE_URL}/api/auth/logout`,
  },
  SONGS: {
    UPLOAD: `${API_BASE_URL}/api/songs/upload`,
    UPLOAD_TEMP: `${API_BASE_URL}/api/songs/upload-temp`,
    SONG: `${API_BASE_URL}/api/songs/upload`,
    LIST: `${API_BASE_URL}/api/songs`,
    ANALYSIS: `${API_BASE_URL}/api/analysis`,
  },
  UPLOAD: {
    SONG: `${API_BASE_URL}/api/songs/upload`,
    LYRICS: `${API_BASE_URL}/api/lyrics/upload`,
  },
};
