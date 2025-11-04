import React, { useState, useEffect } from 'react';
import {
  Users,
  Search,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Ban,
  Shield,
  Eye,
  Mail,
  Calendar,
  Activity,
  Award
} from 'lucide-react';
import { API_BASE_URL } from '../config/api';

interface User {
  _id: string;
  email: string;
  firstName?: string;
  lastName?: string;
  username?: string;
  role: string;
  isActive: boolean;
  isVerified: boolean;
  createdAt: string;
  warnings?: Array<{
    reason: string;
    severity: string;
    issuedBy: string;
    issuedAt: string;
  }>;
  suspensionReason?: string;
}

const UsersManagement: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [actionModal, setActionModal] = useState<{
    type: 'suspend' | 'activate' | 'warn' | 'promote' | 'details' | null;
    user: User | null;
  }>({ type: null, user: null });
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    fetchUsers();
  }, [roleFilter, statusFilter]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const params = new URLSearchParams();
      
      if (roleFilter !== 'all') params.append('role', roleFilter);
      if (statusFilter !== 'all') params.append('status', statusFilter);
      params.append('limit', '100');

      const response = await fetch(`${API_BASE_URL}/api/admin/users?${params}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!response.ok) throw new Error('Failed to fetch users');

      const data = await response.json();
      setUsers(data.data || []);
    } catch (error) {
      console.error('Error fetching users:', error);
      showMessage('error', 'Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  const fetchUserDetails = async (userId: string) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/api/admin/users/${userId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!response.ok) throw new Error('Failed to fetch user details');

      const data = await response.json();
      setSelectedUser(data.data);
    } catch (error) {
      console.error('Error fetching user details:', error);
      showMessage('error', 'Failed to load user details');
    }
  };

  const updateUserStatus = async (userId: string, isActive: boolean) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/api/admin/users/${userId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ isActive }),
      });

      if (!response.ok) throw new Error('Failed to update user');

      const data = await response.json();
      showMessage('success', `User ${isActive ? 'activated' : 'suspended'} successfully`);
      setActionModal({ type: null, user: null });
      await fetchUsers();
    } catch (error: any) {
      showMessage('error', error.message || 'Failed to update user');
    }
  };

  const addWarning = async (userId: string, reason: string, severity: string) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/api/admin/users/${userId}/warnings`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ reason, severity }),
      });

      if (!response.ok) throw new Error('Failed to add warning');

      const data = await response.json();
      showMessage('success', data.message);
      setActionModal({ type: null, user: null });
      await fetchUsers();
    } catch (error: any) {
      showMessage('error', error.message || 'Failed to add warning');
    }
  };

  const promoteUser = async (userId: string, role: string) => {
    try {
      const token = localStorage.getItem('token');
      const endpoint = role === 'admin' ? 'promote' : 'demote';
      const response = await fetch(`${API_BASE_URL}/api/admin/users/${userId}/${endpoint}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to update user role');
      }

      const data = await response.json();
      showMessage('success', data.message);
      setActionModal({ type: null, user: null });
      await fetchUsers();
    } catch (error: any) {
      showMessage('error', error.message || 'Failed to update user role');
    }
  };

  const showMessage = (type: 'success' | 'error', text: string) => {
    setMessage({ type, text });
    setTimeout(() => setMessage(null), 5000);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const getRoleBadge = (role: string) => {
    const colors: { [key: string]: string } = {
      superadmin: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200',
      admin: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
      artist: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
      user: 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200',
    };
    return colors[role] || colors.user;
  };

  const filteredUsers = users.filter(
    (user) =>
      (user.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.firstName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.lastName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.username?.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Users Management</h2>
          <p className="text-gray-600 dark:text-gray-400">
            Manage user accounts, permissions, and warnings
          </p>
        </div>
      </div>

      {/* Message Alert */}
      {message && (
        <div
          className={`p-4 rounded-lg flex items-center ${
            message.type === 'success'
              ? 'bg-green-50 text-green-800 border border-green-200 dark:bg-green-900/20 dark:text-green-200 dark:border-green-800'
              : 'bg-red-50 text-red-800 border border-red-200 dark:bg-red-900/20 dark:text-red-200 dark:border-red-800'
          }`}
        >
          {message.type === 'success' ? (
            <CheckCircle className="w-5 h-5 mr-2" />
          ) : (
            <AlertTriangle className="w-5 h-5 mr-2" />
          )}
          {message.text}
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Total Users</div>
              <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">{users.length}</div>
            </div>
            <Users className="w-8 h-8 text-gray-400" />
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Active</div>
              <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                {users.filter((u) => u.isActive).length}
              </div>
            </div>
            <CheckCircle className="w-8 h-8 text-green-400" />
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Suspended</div>
              <div className="text-2xl font-bold text-red-600 dark:text-red-400">
                {users.filter((u) => !u.isActive).length}
              </div>
            </div>
            <Ban className="w-8 h-8 text-red-400" />
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm text-gray-600 dark:text-gray-400">With Warnings</div>
              <div className="text-2xl font-bold text-orange-600 dark:text-orange-400">
                {users.filter((u) => u.warnings && u.warnings.length > 0).length}
              </div>
            </div>
            <AlertTriangle className="w-8 h-8 text-orange-400" />
          </div>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4 border border-gray-200 dark:border-gray-700">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search by email, name, or username..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
            />
          </div>
          <div className="flex gap-2">
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
            >
              <option value="all">All Roles</option>
              <option value="user">Users</option>
              <option value="artist">Artists</option>
              <option value="admin">Admins</option>
              <option value="superadmin">Super Admins</option>
            </select>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="inactive">Suspended</option>
            </select>
          </div>
        </div>
      </div>

      {/* Users Table */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
        </div>
      ) : filteredUsers.length > 0 ? (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow border border-gray-200 dark:border-gray-700 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-gray-900">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    User
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Role
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Warnings
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Joined
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {filteredUsers.map((user) => (
                  <tr key={user._id} className="hover:bg-gray-50 dark:hover:bg-gray-900/50">
                    <td className="px-6 py-4">
                      <div>
                        <div className="text-sm font-medium text-gray-900 dark:text-gray-100">
                          {user.firstName || user.lastName
                            ? `${user.firstName || ''} ${user.lastName || ''}`.trim()
                            : user.username || 'Unknown'}
                        </div>
                        <div className="text-sm text-gray-500 dark:text-gray-400 flex items-center">
                          <Mail className="w-3 h-3 mr-1" />
                          {user.email}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${getRoleBadge(user.role)}`}>
                        {user.role.toUpperCase()}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        {user.isActive ? (
                          <>
                            <CheckCircle className="w-4 h-4 text-green-600 mr-2" />
                            <span className="text-sm text-green-600 dark:text-green-400">Active</span>
                          </>
                        ) : (
                          <>
                            <Ban className="w-4 h-4 text-red-600 mr-2" />
                            <span className="text-sm text-red-600 dark:text-red-400">Suspended</span>
                          </>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      {user.warnings && user.warnings.length > 0 ? (
                        <span className="px-2 py-1 text-xs font-medium rounded-full bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200">
                          {user.warnings.length} Warning{user.warnings.length > 1 ? 's' : ''}
                        </span>
                      ) : (
                        <span className="text-sm text-gray-500 dark:text-gray-400">None</span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400">
                      {formatDate(user.createdAt)}
                    </td>
                    <td className="px-6 py-4 text-sm">
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => {
                            fetchUserDetails(user._id);
                            setActionModal({ type: 'details', user });
                          }}
                          className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
                          title="View Details"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => setActionModal({ type: 'warn', user })}
                          className="text-orange-600 hover:text-orange-800 dark:text-orange-400 dark:hover:text-orange-300"
                          title="Issue Warning"
                        >
                          <AlertTriangle className="w-4 h-4" />
                        </button>
                        {user.isActive ? (
                          <button
                            onClick={() => setActionModal({ type: 'suspend', user })}
                            className="text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300"
                            title="Suspend User"
                          >
                            <Ban className="w-4 h-4" />
                          </button>
                        ) : (
                          <button
                            onClick={() => setActionModal({ type: 'activate', user })}
                            className="text-green-600 hover:text-green-800 dark:text-green-400 dark:hover:text-green-300"
                            title="Activate User"
                          >
                            <CheckCircle className="w-4 h-4" />
                          </button>
                        )}
                        {user.role !== 'superadmin' && (
                          <button
                            onClick={() => setActionModal({ type: 'promote', user })}
                            className="text-purple-600 hover:text-purple-800 dark:text-purple-400 dark:hover:text-purple-300"
                            title={user.role === 'admin' ? 'Demote' : 'Promote to Admin'}
                          >
                            <Shield className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
          <p className="text-gray-500 dark:text-gray-400">No users found</p>
        </div>
      )}

      {/* Action Modals */}
      {actionModal.type && actionModal.user && (
        <UserActionModal
          type={actionModal.type}
          user={actionModal.user}
          selectedUser={selectedUser}
          onClose={() => {
            setActionModal({ type: null, user: null });
            setSelectedUser(null);
          }}
          onUpdateStatus={updateUserStatus}
          onAddWarning={addWarning}
          onPromote={promoteUser}
        />
      )}
    </div>
  );
};

// User Action Modal Component
interface UserActionModalProps {
  type: 'suspend' | 'activate' | 'warn' | 'promote' | 'details';
  user: User;
  selectedUser: User | null;
  onClose: () => void;
  onUpdateStatus: (userId: string, isActive: boolean) => void;
  onAddWarning: (userId: string, reason: string, severity: string) => void;
  onPromote: (userId: string, role: string) => void;
}

const UserActionModal: React.FC<UserActionModalProps> = ({
  type,
  user,
  selectedUser,
  onClose,
  onUpdateStatus,
  onAddWarning,
  onPromote,
}) => {
  const [reason, setReason] = useState('');
  const [severity, setSeverity] = useState('medium');

  const handleSubmit = () => {
    switch (type) {
      case 'suspend':
        onUpdateStatus(user._id, false);
        break;
      case 'activate':
        onUpdateStatus(user._id, true);
        break;
      case 'warn':
        if (reason.trim()) {
          onAddWarning(user._id, reason, severity);
        }
        break;
      case 'promote':
        const newRole = user.role === 'admin' ? 'user' : 'admin';
        onPromote(user._id, newRole);
        break;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-4">
            {type === 'details' && 'User Details'}
            {type === 'suspend' && 'Suspend User'}
            {type === 'activate' && 'Activate User'}
            {type === 'warn' && 'Issue Warning'}
            {type === 'promote' && (user.role === 'admin' ? 'Demote Admin' : 'Promote to Admin')}
          </h3>

          <div className="space-y-4">
            <div>
              <p className="text-sm font-medium text-gray-700 dark:text-gray-300">User:</p>
              <p className="text-gray-900 dark:text-gray-100">
                {user.firstName || user.lastName
                  ? `${user.firstName || ''} ${user.lastName || ''}`.trim()
                  : user.username || 'Unknown'}
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-400">{user.email}</p>
            </div>

            {type === 'details' && selectedUser && (
              <>
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                    <p className="text-sm text-gray-600 dark:text-gray-400">Role</p>
                    <p className="text-lg font-bold text-gray-900 dark:text-gray-100 capitalize">
                      {selectedUser.role}
                    </p>
                  </div>
                  <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                    <p className="text-sm text-gray-600 dark:text-gray-400">Status</p>
                    <p className="text-lg font-bold text-gray-900 dark:text-gray-100">
                      {selectedUser.isActive ? 'Active' : 'Suspended'}
                    </p>
                  </div>
                  <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                    <p className="text-sm text-gray-600 dark:text-gray-400">Verified</p>
                    <p className="text-lg font-bold text-gray-900 dark:text-gray-100">
                      {selectedUser.isVerified ? 'Yes' : 'No'}
                    </p>
                  </div>
                  <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                    <p className="text-sm text-gray-600 dark:text-gray-400">Member Since</p>
                    <p className="text-lg font-bold text-gray-900 dark:text-gray-100">
                      {formatDate(selectedUser.createdAt)}
                    </p>
                  </div>
                </div>

                {selectedUser.warnings && selectedUser.warnings.length > 0 && (
                  <div>
                    <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Warnings ({selectedUser.warnings.length}):
                    </p>
                    <div className="space-y-2">
                      {selectedUser.warnings.map((warning, index) => (
                        <div
                          key={index}
                          className="p-3 bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800 rounded-lg"
                        >
                          <div className="flex justify-between items-start">
                            <div>
                              <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                                {warning.reason}
                              </p>
                              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                {formatDate(warning.issuedAt)} • Severity: {warning.severity}
                              </p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {selectedUser.suspensionReason && (
                  <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                    <p className="text-sm font-medium text-red-900 dark:text-red-100">Suspension Reason:</p>
                    <p className="text-sm text-red-800 dark:text-red-200 mt-1">{selectedUser.suspensionReason}</p>
                  </div>
                )}
              </>
            )}

            {type === 'warn' && (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Severity:
                  </label>
                  <select
                    value={severity}
                    onChange={(e) => setSeverity(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Reason:
                  </label>
                  <textarea
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                    rows={4}
                    placeholder="Explain the reason for this warning..."
                    required
                  />
                </div>
              </>
            )}

            {type === 'suspend' && (
              <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
                <p className="text-sm text-red-800 dark:text-red-200">
                  This user will be unable to access their account until reactivated.
                </p>
              </div>
            )}

            {type === 'activate' && (
              <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
                <p className="text-sm text-green-800 dark:text-green-200">
                  This user will regain full access to their account.
                </p>
              </div>
            )}

            {type === 'promote' && (
              <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                <p className="text-sm text-blue-800 dark:text-blue-200">
                  {user.role === 'admin'
                    ? 'This user will be demoted to regular user and lose admin privileges.'
                    : 'This user will be promoted to admin with elevated privileges.'}
                </p>
              </div>
            )}
          </div>

          <div className="flex justify-end space-x-3 mt-6">
            <button
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
            >
              {type === 'details' ? 'Close' : 'Cancel'}
            </button>
            {type !== 'details' && (
              <button
                onClick={handleSubmit}
                disabled={type === 'warn' && !reason.trim()}
                className={`px-4 py-2 rounded-lg text-white ${
                  type === 'suspend'
                    ? 'bg-red-600 hover:bg-red-700'
                    : type === 'warn'
                    ? 'bg-orange-600 hover:bg-orange-700'
                    : 'bg-primary-600 hover:bg-primary-700'
                } disabled:opacity-50 disabled:cursor-not-allowed`}
              >
                {type === 'suspend' && 'Suspend User'}
                {type === 'activate' && 'Activate User'}
                {type === 'warn' && 'Issue Warning'}
                {type === 'promote' && (user.role === 'admin' ? 'Demote User' : 'Promote to Admin')}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default UsersManagement;

