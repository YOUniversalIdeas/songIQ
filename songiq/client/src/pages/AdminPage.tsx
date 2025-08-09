import React from 'react';
import { useAuth } from '@/components/AuthProvider';
import AdminDashboard from '@/components/AdminDashboard';
import { Shield, AlertTriangle } from 'lucide-react';

const AdminPage: React.FC = () => {
  const { user, isAuthenticated } = useAuth();

  // Check if user has admin privileges
  const isAdmin = user?.subscription?.tier === 'enterprise' || user?.role === 'admin';

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <Shield className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Access Denied</h2>
          <p className="text-gray-600 dark:text-gray-400">Please sign in to access the admin dashboard.</p>
        </div>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <AlertTriangle className="h-16 w-16 text-yellow-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Insufficient Permissions</h2>
          <p className="text-gray-600 dark:text-gray-400">
            You need administrator privileges to access this dashboard.
          </p>
          <p className="text-sm text-gray-500 dark:text-gray-500 mt-2">
            Current tier: {user?.subscription?.tier || 'free'}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <AdminDashboard />
    </div>
  );
};

export default AdminPage; 