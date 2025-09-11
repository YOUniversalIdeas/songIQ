import { NavLink, useNavigate } from 'react-router-dom'
import { Home, Upload, BarChart3, TrendingUp, BarChart, Zap, Settings, CreditCard, ChevronDown, Music, Globe, BarChart2, Star } from 'lucide-react'
import { useState, useEffect, useRef } from 'react'
import { useAuth } from './AuthProvider'

const Navigation = () => {
  const { user, isAuthenticated, isLoading } = useAuth();
  const navigate = useNavigate();
  
  const [isPlatformsDropdownOpen, setIsPlatformsDropdownOpen] = useState(false);
  const [isTrendsDropdownOpen, setIsTrendsDropdownOpen] = useState(false);
  const platformsDropdownRef = useRef<HTMLDivElement>(null);
  const trendsDropdownRef = useRef<HTMLDivElement>(null);
  
  // Check if user has superadmin privileges
  const isSuperAdmin = user?.role === 'superadmin';
  
  // Navigation item type
  interface NavigationItem {
    path: string;
    label: string;
    icon: any;
    hasDropdown?: boolean;
  }
  

  


  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (platformsDropdownRef.current && !platformsDropdownRef.current.contains(event.target as Node)) {
        setIsPlatformsDropdownOpen(false);
      }
      if (trendsDropdownRef.current && !trendsDropdownRef.current.contains(event.target as Node)) {
        setIsTrendsDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);
  
  // Split navigation items into two rows
  const navigationItems: NavigationItem[] = [
    { path: '/', label: 'Home', icon: Home },
    { path: '/upload', label: 'Upload', icon: Upload },
    { path: '/dashboard', label: 'Dashboard', icon: TrendingUp },
    { path: '/recommendations', label: 'Recommendations', icon: Zap },
    { path: '/platforms', label: 'Platforms', icon: Globe, hasDropdown: true },
    { path: '/trends', label: 'Trends', icon: BarChart2, hasDropdown: true },
  ];
  
  const secondRowItems: NavigationItem[] = [
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
            {navigationItems.map((item) => {
              const Icon = item.icon
              
              // Handle dropdowns
              if (item.hasDropdown) {
                const isPlatforms = item.path === '/platforms';
                const isTrends = item.path === '/trends';
                const isOpen = isPlatforms ? isPlatformsDropdownOpen : isTrendsDropdownOpen;
                const setIsOpen = isPlatforms ? setIsPlatformsDropdownOpen : setIsTrendsDropdownOpen;
                const dropdownRef = isPlatforms ? platformsDropdownRef : trendsDropdownRef;
                
                return (
                  <div key={item.path} className="relative" ref={dropdownRef}>
                    <button
                      onClick={() => setIsOpen(!isOpen)}
                      className="flex items-center space-x-1 lg:space-x-2 px-2 lg:px-3 py-2 text-xs lg:text-sm font-medium transition-colors duration-200 flex-shrink-0 text-gray-600 hover:text-gray-900 hover:border-b-2 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-100 dark:hover:border-gray-600"
                    >
                      {Icon && <Icon className="h-3 w-3 lg:h-4 lg:w-4" />}
                      <span className="hidden sm:inline">{item.label}</span>
                      <ChevronDown className={`h-3 w-3 lg:h-4 lg:w-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
                    </button>
                    
                    {/* Dropdown Menu */}
                    {isOpen && (
                      <div className="absolute top-full left-0 mt-1 w-48 bg-white dark:bg-gray-800 rounded-md shadow-lg py-1 z-[9999] border border-gray-200 dark:border-gray-700">
                        {isPlatforms ? (
                          <>
                            <NavLink
                              to="/spotify"
                              onClick={() => setIsPlatformsDropdownOpen(false)}
                              className="flex items-center px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                            >
                              <Music className="h-4 w-4 mr-3" />
                              Spotify
                            </NavLink>
                            <NavLink
                              to="/youtube-music"
                              onClick={() => setIsPlatformsDropdownOpen(false)}
                              className="flex items-center px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                            >
                              <Music className="h-4 w-4 mr-3" />
                              YouTube Music
                            </NavLink>
                          </>
                        ) : isTrends ? (
                          <>
                            <button
                              onClick={() => {
                                setIsTrendsDropdownOpen(false);
                                navigate('/trends#industry-trends');
                              }}
                              className="flex items-center w-full px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                            >
                              <TrendingUp className="h-4 w-4 mr-3" />
                              Industry Trends
                            </button>
                            <button
                              onClick={() => {
                                setIsTrendsDropdownOpen(false);
                                navigate('/trends#charts');
                              }}
                              className="flex items-center w-full px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                            >
                              <BarChart3 className="h-4 w-4 mr-3" />
                              Charts
                            </button>
                          </>
                        ) : null}
                      </div>
                    )}
                  </div>
                )
              }
              
              // Regular navigation item
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
                  {Icon && <Icon className="h-3 w-3 lg:h-4 lg:w-4" />}
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
                  {Icon && <Icon className="h-3 w-3 lg:h-4 lg:w-4" />}
                  <span className="hidden sm:inline">{item.label}</span>
                </NavLink>
              )
            })}
          </div>
        </div>
      </div>
    </nav>
  )
}

export default Navigation 