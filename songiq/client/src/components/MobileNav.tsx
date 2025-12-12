import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Home, TrendingUp, Wallet, Trophy, User, Newspaper } from 'lucide-react';
import { useAuth } from './AuthProvider';

const MobileNav: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { isAuthenticated } = useAuth();

  // Only show on mobile
  const isMobile = typeof window !== 'undefined' && window.innerWidth < 768;
  if (!isMobile) return null;

  const navItems = [
    {
      icon: Home,
      label: 'Home',
      path: '/',
      show: true
    },
    {
      icon: TrendingUp,
      label: 'Markets',
      path: '/markets',
      show: true
    },
    {
      icon: Newspaper,
      label: 'News',
      path: '/news',
      show: true
    },
    {
      icon: Trophy,
      label: 'Leaderboard',
      path: '/leaderboard',
      show: true
    },
    {
      icon: User,
      label: 'Profile',
      path: isAuthenticated ? '/dashboard' : '/auth?mode=login',
      show: true
    }
  ];

  const visibleItems = navItems.filter(item => item.show);

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 z-50 safe-area-bottom">
      <div className="flex justify-around items-center h-16 px-2">
        {visibleItems.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.path || 
                          (item.path === '/markets' && location.pathname.startsWith('/markets/'));
          
          return (
            <button
              key={item.path}
              onClick={() => navigate(item.path)}
              className={`flex flex-col items-center justify-center flex-1 h-full transition-colors ${
                isActive
                  ? 'text-primary-600 dark:text-primary-400'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
              }`}
            >
              <Icon className={`w-6 h-6 mb-1 ${isActive ? 'stroke-[2.5]' : 'stroke-2'}`} />
              <span className={`text-xs font-medium ${isActive ? 'font-semibold' : ''}`}>
                {item.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};

export default MobileNav;

