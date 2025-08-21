import { Logo } from '../assets'
import { Link } from 'react-router-dom'
import { User, LogIn, Moon, Sun } from 'lucide-react'
import { useDarkMode } from '../contexts/DarkModeContext'
import { useAuth } from './AuthProvider'

const Header = () => {
  const { isAuthenticated, user } = useAuth();
  const { isDarkMode, toggleDarkMode } = useDarkMode();

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
              <div className="w-2 h-2 bg-success-500 rounded-full animate-pulse"></div>
            </div>
            
            {/* Authentication Buttons */}
            {!isAuthenticated ? (
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
              <div className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400">
                <span>Welcome, {user?.firstName || 'User'}!</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  )
}

export default Header 