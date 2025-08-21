import { NavLink } from 'react-router-dom'
import { Home, Upload, BarChart3, TrendingUp, BarChart, TrendingUp as TrendingUpIcon, Zap, User, LogOut, Settings, CreditCard, ChevronDown } from 'lucide-react'
import { useState, useEffect, useRef } from 'react'

const Navigation = () => {
  // Temporarily remove auth dependencies
  const user: any = { firstName: '', lastName: '', profilePicture: '' };
  const isAuthenticated = false;
  const logout = () => {};
  
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  
  // Check if user has superadmin privileges
  const isSuperAdmin = false;
  

  


  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsProfileDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);
  
  // Split navigation items into two rows
  const firstRowItems = [
    { path: '/', label: 'Home', icon: Home },
    { path: '/upload', label: 'Upload Song', icon: Upload },
    { path: '/dashboard', label: 'Dashboard', icon: TrendingUp },
    { path: '/analysis', label: 'Analysis', icon: BarChart3 },
    { path: '/recommendations', label: 'Recommendations', icon: Zap },
    { path: '/lyrics', label: 'Lyrics', icon: BarChart3 },
  ];
  
  const secondRowItems = [
    { path: '/trends', label: 'Trends', icon: TrendingUpIcon },
    { path: '/comparison', label: 'Compare', icon: BarChart },
    { path: '/user-activity', label: 'My Songs', icon: BarChart3 },
    { path: '/pricing', label: 'Pricing', icon: CreditCard },
    ...(isSuperAdmin ? [{ path: '/admin', label: 'SuperAdmin', icon: Settings }] : []),
  ];
  


  return (
    <nav className="bg-white shadow-sm border-b border-gray-200 dark:bg-gray-800 dark:border-gray-700">
      <div className="w-full max-w-full px-4 relative">
        {/* Navigation Rows */}
        <div className="flex flex-col min-w-0">
          {/* First Row */}
          <div className="flex space-x-4 lg:space-x-8 min-w-0 justify-center py-2">
            {firstRowItems.map((item) => {
              const Icon = item.icon
              return (
                <NavLink
                  key={item.path}
                  to={item.path}
                  className={({ isActive }) =>
                    `flex items-center space-x-1 lg:space-x-2 px-2 lg:px-3 py-2 text-xs lg:text-sm font-medium transition-colors duration-200 flex-shrink-0 ${
                      isActive
                        ? 'text-primary-600 border-b-2 border-primary-600 dark:text-primary-400 dark:border-primary-400'
                        : 'text-gray-600 hover:text-gray-900 hover:border-b-2 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-100 dark:hover:border-gray-600'
                    }`
                  }
                >
                  <Icon className="h-3 w-3 lg:h-4 lg:w-4" />
                  <span className="hidden sm:inline">{item.label}</span>
                </NavLink>
              )
            })}
          </div>
          
          {/* Second Row */}
          <div className="flex space-x-4 lg:space-x-8 min-w-0 justify-center py-2">
            {secondRowItems.map((item) => {
              const Icon = item.icon
              return (
                <NavLink
                  key={item.path}
                  to={item.path}
                  className={({ isActive }) =>
                    `flex items-center space-x-1 lg:space-x-2 px-2 lg:px-3 py-2 text-xs lg:text-sm font-medium transition-colors duration-200 flex-shrink-0 ${
                      isActive
                        ? 'text-primary-600 border-b-2 border-primary-600 dark:text-primary-400 dark:border-primary-400'
                        : 'text-gray-600 hover:text-gray-900 hover:border-b-2 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-100 dark:hover:border-gray-600'
                    }`
                  }
                >
                  <Icon className="h-3 w-3 lg:h-4 lg:w-4" />
                  <span className="hidden sm:inline">{item.label}</span>
                </NavLink>
              )
            })}
          </div>
        </div>
        
        {/* User Menu - Positioned on the right side */}
        <div className="absolute top-2 right-4 flex items-center space-x-4 flex-shrink-0">
          {isAuthenticated && user ? (
            <>
              <div className="relative" ref={dropdownRef}>
                <button
                  onClick={() => setIsProfileDropdownOpen(!isProfileDropdownOpen)}
                  className="flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                >
                  <div className="w-6 h-6 rounded-full overflow-hidden">
                    <img
                      src={user.profilePicture || 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=24&h=24&fit=crop&crop=face'}
                      alt={`${user.firstName} ${user.lastName}`}
                      className="w-8 h-8 rounded-full object-cover"
                    />
                  </div>
                  <span>{user.firstName}</span>
                  <ChevronDown className={`w-4 h-4 transition-transform ${isProfileDropdownOpen ? 'rotate-180' : ''}`} />
                </button>
                
                {/* Dropdown Menu */}
                {isProfileDropdownOpen && (
                  <div 
                    className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-md shadow-lg py-1 z-[9999] border border-gray-200 dark:border-gray-700" 
                    style={{ display: 'block', visibility: 'visible' }}
                  >
                    <NavLink
                      to="/profile"
                      onClick={() => setIsProfileDropdownOpen(false)}
                      className="flex items-center px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                    >
                      <User className="w-4 h-4 mr-3" />
                      Profile
                    </NavLink>
                    <NavLink
                      to="/user-activity"
                      onClick={() => setIsProfileDropdownOpen(false)}
                      className="flex items-center px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                    >
                      <BarChart3 className="w-4 h-4 mr-3" />
                      My Songs
                    </NavLink>
                    <button
                      onClick={() => {
                        setIsProfileDropdownOpen(false);
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
            </>
          ) : (
            <NavLink
              to="/auth"
              className="flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium bg-blue-600 text-white hover:bg-blue-700 transition-colors"
            >
              <User className="h-4 w-4" />
              <span>Sign In</span>
            </NavLink>
          )}
        </div>
      </div>
    </nav>
  )
}

export default Navigation 