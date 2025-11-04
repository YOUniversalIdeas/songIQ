// Register service worker for PWA
export const registerServiceWorker = () => {
  if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
      navigator.serviceWorker
        .register('/service-worker.js')
        .then((registration) => {
          console.log('SW registered:', registration);
          
          // Check for updates periodically
          setInterval(() => {
            registration.update();
          }, 60000); // Check every minute
        })
        .catch((error) => {
          console.log('SW registration failed:', error);
        });
    });
  }
};

// Request notification permission
export const requestNotificationPermission = async (): Promise<NotificationPermission> => {
  if (!('Notification' in window)) {
    console.log('This browser does not support notifications');
    return 'denied';
  }

  if (Notification.permission === 'granted') {
    return 'granted';
  }

  if (Notification.permission !== 'denied') {
    const permission = await Notification.requestPermission();
    return permission;
  }

  return Notification.permission;
};

// Show a notification
export const showNotification = (title: string, options?: NotificationOptions) => {
  if ('Notification' in window && Notification.permission === 'granted') {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.ready.then((registration) => {
        registration.showNotification(title, {
          icon: '/icon-192x192.png',
          badge: '/icon-72x72.png',
          vibrate: [200, 100, 200],
          ...options
        });
      });
    } else {
      new Notification(title, options);
    }
  }
};

// Check if app is installed
export const isAppInstalled = (): boolean => {
  return window.matchMedia('(display-mode: standalone)').matches ||
         (window.navigator as any).standalone ||
         document.referrer.includes('android-app://');
};

// Get install prompt event
export const getInstallPrompt = (): Promise<any> => {
  return new Promise((resolve) => {
    window.addEventListener('beforeinstallprompt', (e) => {
      e.preventDefault();
      resolve(e);
    });
  });
};

// Vibrate device (for tactile feedback)
export const vibrate = (pattern: number | number[]) => {
  if ('vibrate' in navigator) {
    navigator.vibrate(pattern);
  }
};

// Check if device supports touch
export const isTouchDevice = (): boolean => {
  return 'ontouchstart' in window || navigator.maxTouchPoints > 0;
};

// Get device type
export const getDeviceType = (): 'mobile' | 'tablet' | 'desktop' => {
  const width = window.innerWidth;
  if (width < 768) return 'mobile';
  if (width < 1024) return 'tablet';
  return 'desktop';
};

// Add to home screen prompt
export const addToHomeScreen = async (deferredPrompt: any) => {
  if (!deferredPrompt) {
    return false;
  }

  deferredPrompt.prompt();
  const { outcome } = await deferredPrompt.userChoice;
  
  return outcome === 'accepted';
};

// Detect network status
export const getNetworkStatus = (): 'online' | 'offline' | 'slow' => {
  if (!navigator.onLine) {
    return 'offline';
  }

  const connection = (navigator as any).connection || 
                     (navigator as any).mozConnection || 
                     (navigator as any).webkitConnection;

  if (connection) {
    if (connection.effectiveType === 'slow-2g' || connection.effectiveType === '2g') {
      return 'slow';
    }
  }

  return 'online';
};

// Listen to network changes
export const onNetworkChange = (callback: (status: 'online' | 'offline' | 'slow') => void) => {
  window.addEventListener('online', () => callback(getNetworkStatus()));
  window.addEventListener('offline', () => callback(getNetworkStatus()));

  const connection = (navigator as any).connection || 
                     (navigator as any).mozConnection || 
                     (navigator as any).webkitConnection;

  if (connection) {
    connection.addEventListener('change', () => callback(getNetworkStatus()));
  }
};

// Save data for offline use
export const saveForOffline = async (key: string, data: any) => {
  if ('caches' in window) {
    const cache = await caches.open('offline-data');
    const response = new Response(JSON.stringify(data));
    await cache.put(key, response);
  } else {
    localStorage.setItem(`offline_${key}`, JSON.stringify(data));
  }
};

// Get offline data
export const getOfflineData = async (key: string): Promise<any> => {
  if ('caches' in window) {
    const cache = await caches.open('offline-data');
    const response = await cache.match(key);
    if (response) {
      return await response.json();
    }
  }
  
  const data = localStorage.getItem(`offline_${key}`);
  return data ? JSON.parse(data) : null;
};

export default {
  registerServiceWorker,
  requestNotificationPermission,
  showNotification,
  isAppInstalled,
  getInstallPrompt,
  vibrate,
  isTouchDevice,
  getDeviceType,
  addToHomeScreen,
  getNetworkStatus,
  onNetworkChange,
  saveForOffline,
  getOfflineData
};

