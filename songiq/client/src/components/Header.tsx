import { Logo } from '../assets'
import { Link } from 'react-router-dom'
import { User, LogIn, Moon, Sun, ChevronDown, BarChart3, LogOut } from 'lucide-react'
import { useDarkMode } from '../contexts/DarkModeContext'
import { useAuth } from './AuthProvider'
import { useEffect, useState, useRef } from 'react'

const Header = () => {
  const { isAuthenticated, user, isLoading, logout } = useAuth();
  const { isDarkMode, toggleDarkMode } = useDarkMode();
  const [isUserDropdownOpen, setIsUserDropdownOpen] = useState(false);
  const userDropdownRef = useRef<HTMLDivElement>(null);


  // Track auth state changes in Header
  useEffect(() => {
  }, [isAuthenticated, isLoading, user]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (userDropdownRef.current && !userDropdownRef.current.contains(event.target as Node)) {
        setIsUserDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleToggleDarkMode = () => {
    toggleDarkMode();
  };

  return (
    <header className="bg-white shadow-sm border-b border-gray-200 dark:bg-gray-800 dark:border-gray-700">
      <div className="w-full max-w-full px-4 py-4">
        <div className="flex items-center justify-between min-w-0">
          <div className="flex items-center space-x-3">
            <Link to="/" className="flex items-center space-x-2 hover:opacity-80 transition-opacity">
              <Logo size={80} className="drop-shadow-sm" />
            </Link>
            <Link to="/" className="hidden sm:block hover:opacity-80 transition-opacity">
              <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 songiq-logo">songIQ</h1>
              <p className="text-sm text-gray-600 dark:text-gray-400">Music Intelligence Platform</p>
            </Link>
          </div>
          
          <div className="flex items-center space-x-4 flex-shrink-0">
            {/* Dark Mode Toggle */}
            <button
              onClick={handleToggleDarkMode}
              className="p-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
              aria-label="Toggle dark mode"
            >
              {isDarkMode ? (
                <Sun className="h-5 w-5" />
              ) : (
                <Moon className="h-5 w-5" />
              )}
            </button>

            <div className="hidden md:flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400">
              <span className="hidden lg:inline">Powered by AI</span>
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            </div>
            
            {/* Authentication Buttons */}
            {isLoading ? (
              <div className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400">
                <div className="w-4 h-4 border-2 border-gray-300 border-t-primary-600 rounded-full animate-spin"></div>
                <span>Loading...</span>
              </div>
            ) : !isAuthenticated ? (
              <div className="flex items-center space-x-3">
                <Link
                  to="/auth"
                  className="flex items-center space-x-2 px-4 py-2 text-sm font-medium text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                >
                  <LogIn className="h-4 w-4" />
                  <span>Sign In</span>
                </Link>
                <Link
                  to="/auth?mode=register"
                  className="flex items-center space-x-2 px-4 py-2 text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 rounded-lg transition-colors"
                >
                  <User className="h-4 w-4" />
                  <span>Sign Up</span>
                </Link>
              </div>
            ) : (
              <div className="flex items-center space-x-4">
                {/* Usage Indicator */}
                <div className="hidden lg:flex items-center space-x-2 px-3 py-2 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    {user?.subscription?.usage?.songsAnalyzed || 0}/{user?.songLimit === -1 ? '∞' : (user?.songLimit || (user?.subscription?.plan === 'free' ? '3' : '∞'))} songs
                  </span>
                  <span className="text-xs text-gray-500 dark:text-gray-400">
                    ({user?.subscription?.plan === 'free' ? 'Free' : 
                      user?.subscription?.plan === 'basic' ? 'Basic' :
                      user?.subscription?.plan === 'pro' ? 'Pro' :
                      user?.subscription?.plan === 'enterprise' ? 'Enterprise' : 'Free'} Plan)
                  </span>
                </div>
                
                {/* User Dropdown with Welcome Message */}
                <div className="relative" ref={userDropdownRef}>
                  <button
                    onClick={() => setIsUserDropdownOpen(!isUserDropdownOpen)}
                    className="flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                  >
                    <div className="w-6 h-6 rounded-full bg-blue-600 flex items-center justify-center">
                      <User className="w-4 h-4 text-white" />
                    </div>
                    <span>Welcome, {user?.firstName || user?.email?.split('@')[0] || 'User'}!</span>
                    <ChevronDown className={`w-4 h-4 transition-transform ${isUserDropdownOpen ? 'rotate-180' : ''}`} />
                  </button>
                  
                  {/* Dropdown Menu */}
                  {isUserDropdownOpen && (
                    <div 
                      className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-md shadow-lg py-1 z-[9999] border border-gray-200 dark:border-gray-700" 
                      style={{ display: 'block', visibility: 'visible' }}
                    >
                      <Link
                        to="/profile"
                        onClick={() => setIsUserDropdownOpen(false)}
                        className="flex items-center px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                      >
                        <User className="w-4 h-4 mr-3" />
                        Profile
                      </Link>
                      <Link
                        to="/user-activity"
                        onClick={() => setIsUserDropdownOpen(false)}
                        className="flex items-center px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                      >
                        <BarChart3 className="w-4 h-4 mr-3" />
                        My Songs
                      </Link>
                      <button
                        onClick={() => {
                          setIsUserDropdownOpen(false);
                          logout();
                        }}
                        className="flex items-center w-full px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                      >
                        <LogOut className="w-4 h-4 mr-3" />
                        Logout
                      </button>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  )
}

export default Header 