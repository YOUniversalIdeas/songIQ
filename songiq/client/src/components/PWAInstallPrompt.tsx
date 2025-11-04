import React, { useState, useEffect } from 'react';
import { Download, X, Smartphone } from 'lucide-react';
import { isAppInstalled, addToHomeScreen } from '../utils/pwaUtils';

const PWAInstallPrompt: React.FC = () => {
  const [showPrompt, setShowPrompt] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    // Check if already installed or dismissed
    if (isAppInstalled() || localStorage.getItem('pwa-install-dismissed')) {
      return;
    }

    // Listen for install prompt
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setShowPrompt(true);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    // Show manual prompt for iOS
    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as any).MSStream;
    if (isIOS && !isAppInstalled()) {
      setTimeout(() => setShowPrompt(true), 3000); // Show after 3 seconds
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstall = async () => {
    if (deferredPrompt) {
      const installed = await addToHomeScreen(deferredPrompt);
      if (installed) {
        setShowPrompt(false);
        setDeferredPrompt(null);
      }
    }
  };

  const handleDismiss = () => {
    setShowPrompt(false);
    setDismissed(true);
    localStorage.setItem('pwa-install-dismissed', Date.now().toString());
  };

  if (!showPrompt || dismissed) {
    return null;
  }

  const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as any).MSStream;

  return (
    <div className="fixed bottom-20 md:bottom-6 left-4 right-4 md:left-auto md:right-6 md:max-w-sm bg-white dark:bg-gray-800 rounded-lg shadow-2xl border border-gray-200 dark:border-gray-700 p-4 z-50 animate-slide-up">
      <button
        onClick={handleDismiss}
        className="absolute top-2 right-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
      >
        <X className="w-5 h-5" />
      </button>

      <div className="flex items-start space-x-4">
        <div className="flex-shrink-0 w-12 h-12 bg-gradient-to-br from-primary-500 to-purple-600 rounded-xl flex items-center justify-center">
          <Smartphone className="w-6 h-6 text-white" />
        </div>
        
        <div className="flex-1">
          <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-1">
            Install songIQ App
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
            {isIOS 
              ? 'Add to your home screen for a better experience. Tap the share button and select "Add to Home Screen".'
              : 'Install our app for faster access, offline support, and push notifications!'}
          </p>

          {!isIOS && (
            <button
              onClick={handleInstall}
              className="w-full flex items-center justify-center space-x-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors font-medium"
            >
              <Download className="w-4 h-4" />
              <span>Install App</span>
            </button>
          )}
        </div>
      </div>

      {/* iOS Instructions */}
      {isIOS && (
        <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-700">
          <div className="flex items-center space-x-2 text-xs text-gray-600 dark:text-gray-400">
            <span>1. Tap</span>
            <span className="inline-flex items-center px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded">
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z"/>
              </svg>
            </span>
            <span>→ 2. Select "Add to Home Screen"</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default PWAInstallPrompt;

