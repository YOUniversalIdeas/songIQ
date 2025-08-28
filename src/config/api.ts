// API Configuration
export const API_BASE_URL = 'http://localhost:3000';

export const API_ENDPOINTS = {
  AUTH: {
    LOGIN: `${API_BASE_URL}/api/auth/login`,
    REGISTER: `${API_BASE_URL}/api/auth/register`,
    PROFILE: `${API_BASE_URL}/api/auth/profile`,
    LOGOUT: `${API_BASE_URL}/api/auth/logout`,
  },
  SONGS: {
    UPLOAD: `${API_BASE_URL}/api/songs/upload`,
    SONG: `${API_BASE_URL}/api/songs/upload`,
    LIST: `${API_BASE_URL}/api/songs`,
    ANALYSIS: `${API_BASE_URL}/api/analysis`,
    GET_BY_ID: (id: string) => `${API_BASE_URL}/api/songs/${id}`,
  },
  UPLOAD: {
    SONG: `${API_BASE_URL}/api/songs/upload`,
    LYRICS: `${API_BASE_URL}/api/lyrics/upload`,
  },
  ANALYSIS: {
    START: (songId: string) => `${API_BASE_URL}/api/analysis/start/${songId}`,
    STATUS: (songId: string) => `${API_BASE_URL}/api/analysis/status/${songId}`,
    RESULTS: (songId: string) => `${API_BASE_URL}/api/analysis/results/${songId}`,
    PROGRESS: (songId: string) => `${API_BASE_URL}/api/analysis/progress/${songId}`,
  },
};
