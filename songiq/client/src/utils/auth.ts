// Helper function to get token from appropriate storage location
export const getStoredToken = (): string | null => {
  const persistentToken = localStorage.getItem('songiq_token');
  const sessionToken = sessionStorage.getItem('songiq_token');
  const rememberMe = localStorage.getItem('songiq_remember_me') === 'true';
  
  // Use persistent token if remember me was checked, otherwise use session token
  return rememberMe ? persistentToken : sessionToken;
};

// Helper function to clear all auth-related storage
export const clearAuthStorage = (): void => {
  localStorage.removeItem('songiq_token');
  localStorage.removeItem('songiq_remember_me');
  sessionStorage.removeItem('songiq_token');
};
