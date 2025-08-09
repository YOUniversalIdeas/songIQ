import { NavLink } from 'react-router-dom'
import { Home, Upload, BarChart3, TrendingUp, BarChart, TrendingUp as TrendingUpIcon, Zap, User, LogOut, Settings, CreditCard } from 'lucide-react'
import { useAuth } from './AuthProvider'

const Navigation = () => {
  const { user, isAuthenticated, logout } = useAuth();
  
  // Check if user has admin privileges
  const isAdmin = user?.subscription?.tier === 'enterprise' || user?.role === 'admin';
  
  const navItems = [
    { path: '/', label: 'Home', icon: Home },
    { path: '/upload', label: 'Upload Song', icon: Upload },
    { path: '/comparison', label: 'Compare', icon: BarChart },
    { path: '/trends', label: 'Trends', icon: TrendingUpIcon },
    { path: '/recommendations', label: 'Recommendations', icon: Zap },
    { path: '/analysis', label: 'Analysis', icon: BarChart3 },
    { path: '/dashboard', label: 'Dashboard', icon: TrendingUp },
    { path: '/pricing', label: 'Pricing', icon: CreditCard },
    ...(isAdmin ? [{ path: '/admin', label: 'Admin', icon: Settings }] : []),
  ]

  return (
    <nav className="bg-white shadow-sm border-b border-gray-200 dark:bg-gray-800 dark:border-gray-700">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between">
          <div className="flex space-x-8">
            {navItems.map((item) => {
              const Icon = item.icon
              return (
                <NavLink
                  key={item.path}
                  to={item.path}
                  className={({ isActive }) =>
                    `flex items-center space-x-2 px-3 py-4 text-sm font-medium transition-colors duration-200 ${
                      isActive
                        ? 'text-primary-600 border-b-2 border-primary-600 dark:text-primary-400 dark:border-primary-400'
                        : 'text-gray-600 hover:text-gray-900 hover:border-b-2 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-100 dark:hover:border-gray-600'
                    }`
                  }
                >
                  <Icon className="h-4 w-4" />
                  <span>{item.label}</span>
                </NavLink>
              )
            })}
          </div>
          
          {/* User Menu */}
          <div className="flex items-center space-x-4">
            {isAuthenticated && user ? (
              <>
                <NavLink
                  to="/profile"
                  className="flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                >
                  <div className="w-6 h-6 rounded-full overflow-hidden">
                    <img
                      src={user.avatar || 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=24&h=24&fit=crop&crop=face'}
                      alt={`${user.firstName} ${user.lastName}`}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <span>{user.firstName}</span>
                </NavLink>
                <button
                  onClick={logout}
                  className="flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Logout</span>
                </button>
              </>
            ) : (
              <NavLink
                to="/auth"
                className="flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium bg-blue-600 text-white hover:bg-blue-700 transition-colors"
              >
                <User className="w-4 h-4" />
                <span>Sign In</span>
              </NavLink>
            )}
          </div>
        </div>
      </div>
    </nav>
  )
}

export default Navigation 