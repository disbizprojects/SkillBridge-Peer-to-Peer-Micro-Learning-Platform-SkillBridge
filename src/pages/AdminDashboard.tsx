import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Shield, LogOut, Users, DollarSign, Check, X, Loader, AlertCircle } from 'lucide-react';
import { toast } from 'sonner@2.0.3';
import { projectId, publicAnonKey } from '../utils/supabase/info';

const API_URL = `https://${projectId}.supabase.co/functions/v1/make-server-d45a5820`;

interface Withdrawal {
  id: string;
  mentorId: string;
  mentorName: string;
  mentorAvatar?: string;
  amount: number;
  paymentMethod: string;
  paymentDestination: string;
  requestedDate: string;
  status: 'pending' | 'approved' | 'rejected';
}

interface AdminUser {
  id: string;
  name: string;
  email: string;
}

export const AdminDashboard: React.FC = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'payouts' | 'users'>('payouts');
  const [adminUser, setAdminUser] = useState<AdminUser | null>(null);
  
  // Payouts state
  const [pendingWithdrawals, setPendingWithdrawals] = useState<Withdrawal[]>([]);
  const [pastPayouts, setPastPayouts] = useState<Withdrawal[]>([]);
  const [loadingPayouts, setLoadingPayouts] = useState(true);
  
  // User management state
  const [searchQuery, setSearchQuery] = useState('');
  const [users, setUsers] = useState<any[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(false);
  
  // Modal state
  const [confirmModal, setConfirmModal] = useState<{
    type: 'approve' | 'reject' | 'suspend' | 'unsuspend' | null;
    data?: any;
    reason?: string;
  }>({ type: null });

  useEffect(() => {
    // Check admin authentication
    const adminToken = localStorage.getItem('adminToken');
    const adminUserData = localStorage.getItem('adminUser');
    
    if (!adminToken || !adminUserData) {
      navigate('/admin/login');
      return;
    }

    setAdminUser(JSON.parse(adminUserData));
    fetchWithdrawals();
  }, []);

  useEffect(() => {
    if (activeTab === 'users') {
      fetchUsers();
    }
  }, [activeTab, searchQuery]);

  const fetchWithdrawals = async () => {
    try {
      setLoadingPayouts(true);
      const token = localStorage.getItem('adminToken');
      
      const response = await fetch(`${API_URL}/admin/withdrawals`, {
        headers: {
          'Authorization': `Bearer ${publicAnonKey}`,
          'X-Admin-Token': token || '',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch withdrawals');
      }

      const data = await response.json();
      
      setPendingWithdrawals(data.filter((w: Withdrawal) => w.status === 'pending'));
      setPastPayouts(data.filter((w: Withdrawal) => w.status === 'approved').slice(0, 10));
    } catch (error) {
      console.error('Error fetching withdrawals:', error);
      toast.error('Failed to load withdrawals');
    } finally {
      setLoadingPayouts(false);
    }
  };

  const fetchUsers = async () => {
    try {
      setLoadingUsers(true);
      const token = localStorage.getItem('adminToken');
      
      const url = searchQuery 
        ? `${API_URL}/admin/users?search=${encodeURIComponent(searchQuery)}`
        : `${API_URL}/admin/users`;
      
      const response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${publicAnonKey}`,
          'X-Admin-Token': token || '',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch users');
      }

      const data = await response.json();
      setUsers(data);
    } catch (error) {
      console.error('Error fetching users:', error);
      toast.error('Failed to load users');
    } finally {
      setLoadingUsers(false);
    }
  };

  const handleApproveWithdrawal = async (withdrawal: Withdrawal) => {
    try {
      const token = localStorage.getItem('adminToken');
      
      const response = await fetch(`${API_URL}/admin/withdrawals/${withdrawal.id}/approve`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${publicAnonKey}`,
          'X-Admin-Token': token || '',
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to approve withdrawal');
      }

      toast.success(`Transfer of $${withdrawal.amount} approved for ${withdrawal.mentorName}`);
      setConfirmModal({ type: null });
      fetchWithdrawals();
    } catch (error) {
      console.error('Error approving withdrawal:', error);
      toast.error('Failed to approve withdrawal');
    }
  };

  const handleRejectWithdrawal = async (withdrawal: Withdrawal, reason?: string) => {
    try {
      const token = localStorage.getItem('adminToken');
      
      const response = await fetch(`${API_URL}/admin/withdrawals/${withdrawal.id}/reject`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${publicAnonKey}`,
          'X-Admin-Token': token || '',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ reason }),
      });

      if (!response.ok) {
        throw new Error('Failed to reject withdrawal');
      }

      toast.success(`Withdrawal request rejected for ${withdrawal.mentorName}`);
      setConfirmModal({ type: null });
      fetchWithdrawals();
    } catch (error) {
      console.error('Error rejecting withdrawal:', error);
      toast.error('Failed to reject withdrawal');
    }
  };

  const handleSuspendUser = async (user: any) => {
    try {
      const token = localStorage.getItem('adminToken');
      
      const response = await fetch(`${API_URL}/admin/users/${user.id}/suspend`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${publicAnonKey}`,
          'X-Admin-Token': token || '',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to suspend user');
      }

      toast.success(`${user.name} has been suspended`);
      setConfirmModal({ type: null });
      fetchUsers();
    } catch (error) {
      console.error('Error suspending user:', error);
      toast.error('Failed to suspend user');
    }
  };

  const handleUnsuspendUser = async (user: any) => {
    try {
      const token = localStorage.getItem('adminToken');
      
      const response = await fetch(`${API_URL}/admin/users/${user.id}/unsuspend`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${publicAnonKey}`,
          'X-Admin-Token': token || '',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to unsuspend user');
      }

      toast.success(`${user.name} has been reactivated`);
      setConfirmModal({ type: null });
      fetchUsers();
    } catch (error) {
      console.error('Error unsuspending user:', error);
      toast.error('Failed to reactivate user');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('adminToken');
    localStorage.removeItem('adminUser');
    navigate('/admin/login');
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-40">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-red-500 to-orange-600 rounded-lg flex items-center justify-center">
                <Shield className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl">Admin Control Center</h1>
                <p className="text-sm text-gray-500">Welcome, {adminUser?.name}</p>
              </div>
            </div>

            <button
              onClick={handleLogout}
              className="flex items-center gap-2 px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
            >
              <LogOut className="w-4 h-4" />
              Logout
            </button>
          </div>
        </div>
      </header>

      {/* Navigation Tabs */}
      <div className="bg-white border-b border-gray-200">
        <div className="container mx-auto px-4">
          <div className="flex gap-1">
            <button
              onClick={() => setActiveTab('payouts')}
              className={`px-6 py-4 transition-colors relative ${
                activeTab === 'payouts'
                  ? 'text-orange-600'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <div className="flex items-center gap-2">
                <DollarSign className="w-5 h-5" />
                <span>Payouts</span>
                {pendingWithdrawals.length > 0 && (
                  <span className="ml-2 px-2 py-0.5 bg-orange-100 text-orange-600 rounded-full text-xs">
                    {pendingWithdrawals.length}
                  </span>
                )}
              </div>
              {activeTab === 'payouts' && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-orange-600" />
              )}
            </button>

            <button
              onClick={() => setActiveTab('users')}
              className={`px-6 py-4 transition-colors relative ${
                activeTab === 'users'
                  ? 'text-orange-600'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <div className="flex items-center gap-2">
                <Users className="w-5 h-5" />
                <span>Users</span>
              </div>
              {activeTab === 'users' && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-orange-600" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        {activeTab === 'payouts' ? (
          <div className="space-y-8">
            {/* Pending Withdrawals */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200">
              <div className="px-6 py-4 border-b border-gray-200">
                <h2 className="text-xl">Pending Withdrawals</h2>
                <p className="text-sm text-gray-600 mt-1">
                  {pendingWithdrawals.length} request{pendingWithdrawals.length !== 1 ? 's' : ''} awaiting approval
                </p>
              </div>

              {loadingPayouts ? (
                <div className="flex items-center justify-center py-12">
                  <Loader className="w-8 h-8 animate-spin text-orange-600" />
                </div>
              ) : pendingWithdrawals.length === 0 ? (
                <div className="text-center py-12 text-gray-500">
                  <DollarSign className="w-12 h-12 mx-auto mb-3 opacity-50" />
                  <p>No pending withdrawals</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs text-gray-500 uppercase tracking-wider">
                          Mentor
                        </th>
                        <th className="px-6 py-3 text-left text-xs text-gray-500 uppercase tracking-wider">
                          Amount
                        </th>
                        <th className="px-6 py-3 text-left text-xs text-gray-500 uppercase tracking-wider">
                          Payment Destination
                        </th>
                        <th className="px-6 py-3 text-left text-xs text-gray-500 uppercase tracking-wider">
                          Requested Date
                        </th>
                        <th className="px-6 py-3 text-left text-xs text-gray-500 uppercase tracking-wider">
                          Status
                        </th>
                        <th className="px-6 py-3 text-left text-xs text-gray-500 uppercase tracking-wider">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {pendingWithdrawals.map((withdrawal) => (
                        <tr key={withdrawal.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center gap-3">
                              {withdrawal.mentorAvatar ? (
                                <img
                                  src={withdrawal.mentorAvatar}
                                  alt={withdrawal.mentorName}
                                  className="w-10 h-10 rounded-full"
                                />
                              ) : (
                                <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
                                  <span className="text-gray-600 text-sm">
                                    {withdrawal.mentorName.charAt(0)}
                                  </span>
                                </div>
                              )}
                              <span>{withdrawal.mentorName}</span>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            ${withdrawal.amount.toFixed(2)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div>
                              <div className="text-sm">{withdrawal.paymentMethod}</div>
                              <div className="text-xs text-gray-500">{withdrawal.paymentDestination}</div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                            {formatDate(withdrawal.requestedDate)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className="px-2 py-1 bg-yellow-100 text-yellow-700 rounded-full text-xs">
                              Pending
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center gap-2">
                              <button
                                onClick={() => setConfirmModal({ type: 'approve', data: withdrawal })}
                                className="p-2 bg-green-50 text-green-600 hover:bg-green-100 rounded-lg transition-colors"
                                title="Approve"
                              >
                                <Check className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => setConfirmModal({ type: 'reject', data: withdrawal })}
                                className="p-2 bg-red-50 text-red-600 hover:bg-red-100 rounded-lg transition-colors"
                                title="Reject"
                              >
                                <X className="w-4 h-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            {/* Past Payouts */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200">
              <div className="px-6 py-4 border-b border-gray-200">
                <h2 className="text-xl">Past Payouts</h2>
                <p className="text-sm text-gray-600 mt-1">Recent approved transactions</p>
              </div>

              {pastPayouts.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <p className="text-sm">No past payouts to display</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs text-gray-500 uppercase tracking-wider">
                          Mentor
                        </th>
                        <th className="px-6 py-3 text-left text-xs text-gray-500 uppercase tracking-wider">
                          Amount
                        </th>
                        <th className="px-6 py-3 text-left text-xs text-gray-500 uppercase tracking-wider">
                          Payment Destination
                        </th>
                        <th className="px-6 py-3 text-left text-xs text-gray-500 uppercase tracking-wider">
                          Date
                        </th>
                        <th className="px-6 py-3 text-left text-xs text-gray-500 uppercase tracking-wider">
                          Status
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {pastPayouts.map((payout) => (
                        <tr key={payout.id}>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center gap-3">
                              {payout.mentorAvatar ? (
                                <img
                                  src={payout.mentorAvatar}
                                  alt={payout.mentorName}
                                  className="w-8 h-8 rounded-full"
                                />
                              ) : (
                                <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center">
                                  <span className="text-gray-600 text-xs">
                                    {payout.mentorName.charAt(0)}
                                  </span>
                                </div>
                              )}
                              <span className="text-sm">{payout.mentorName}</span>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm">
                            ${payout.amount.toFixed(2)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm">
                            {payout.paymentDestination}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                            {formatDate(payout.requestedDate)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className="px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs">
                              Approved
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        ) : (
          /* Users Tab */
          <div className="space-y-6">
            {/* Search Bar */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <input
                type="text"
                placeholder="Search by Name or Email..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-orange-500 transition-colors"
              />
            </div>

            {/* User List */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200">
              <div className="px-6 py-4 border-b border-gray-200">
                <h2 className="text-xl">User Management</h2>
                <p className="text-sm text-gray-600 mt-1">
                  {users.length} user{users.length !== 1 ? 's' : ''} found
                </p>
              </div>

              {loadingUsers ? (
                <div className="flex items-center justify-center py-12">
                  <Loader className="w-8 h-8 animate-spin text-orange-600" />
                </div>
              ) : users.length === 0 ? (
                <div className="text-center py-12 text-gray-500">
                  <Users className="w-12 h-12 mx-auto mb-3 opacity-50" />
                  <p>No users found</p>
                </div>
              ) : (
                <div className="divide-y divide-gray-200">
                  {users.map((user) => (
                    <div
                      key={user.id}
                      className="px-6 py-4 hover:bg-gray-50 transition-colors"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          {/* Avatar */}
                          {user.avatar ? (
                            <img
                              src={user.avatar}
                              alt={user.name}
                              className="w-12 h-12 rounded-full"
                            />
                          ) : (
                            <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center">
                              <span className="text-gray-600">{user.name.charAt(0)}</span>
                            </div>
                          )}

                          {/* User Info */}
                          <div>
                            <div className="flex items-center gap-2">
                              <span>{user.name}</span>
                              {user.status === 'active' ? (
                                <span className="w-2 h-2 bg-green-500 rounded-full" title="Active" />
                              ) : (
                                <span className="w-2 h-2 bg-red-500 rounded-full" title="Suspended" />
                              )}
                            </div>
                            <p className="text-sm text-gray-600">{user.email}</p>
                            <div className="flex items-center gap-2 mt-1">
                              {user.roles?.map((role: string) => (
                                <span
                                  key={role}
                                  className="px-2 py-0.5 bg-blue-100 text-blue-700 rounded text-xs"
                                >
                                  {role}
                                </span>
                              ))}
                            </div>
                          </div>
                        </div>

                        {/* Suspend/Unsuspend Button */}
                        <div>
                          {user.status === 'active' ? (
                            <button
                              onClick={() => setConfirmModal({ type: 'suspend', data: user })}
                              className="px-4 py-2 bg-red-50 text-red-600 hover:bg-red-100 rounded-lg transition-colors"
                            >
                              Suspend
                            </button>
                          ) : (
                            <button
                              onClick={() => setConfirmModal({ type: 'unsuspend', data: user })}
                              className="px-4 py-2 bg-green-50 text-green-600 hover:bg-green-100 rounded-lg transition-colors"
                            >
                              Reactivate
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Confirmation Modals */}
      {confirmModal.type && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6">
            <div className="flex items-center gap-3 mb-4">
              <div
                className={`w-12 h-12 rounded-full flex items-center justify-center ${
                  confirmModal.type === 'approve'
                    ? 'bg-green-100'
                    : confirmModal.type === 'reject'
                    ? 'bg-red-100'
                    : confirmModal.type === 'suspend'
                    ? 'bg-red-100'
                    : 'bg-green-100'
                }`}
              >
                <AlertCircle
                  className={`w-6 h-6 ${
                    confirmModal.type === 'approve'
                      ? 'text-green-600'
                      : confirmModal.type === 'reject'
                      ? 'text-red-600'
                      : confirmModal.type === 'suspend'
                      ? 'text-red-600'
                      : 'text-green-600'
                  }`}
                />
              </div>
              <h3 className="text-xl">
                {confirmModal.type === 'approve' && 'Approve Withdrawal'}
                {confirmModal.type === 'reject' && 'Reject Withdrawal'}
                {confirmModal.type === 'suspend' && 'Suspend User'}
                {confirmModal.type === 'unsuspend' && 'Reactivate User'}
              </h3>
            </div>

            <p className="text-gray-600 mb-6">
              {confirmModal.type === 'approve' &&
                `Confirm transfer of $${confirmModal.data.amount.toFixed(2)} to ${confirmModal.data.mentorName}?`}
              {confirmModal.type === 'reject' &&
                `Are you sure you want to reject this withdrawal request from ${confirmModal.data.mentorName}?`}
              {confirmModal.type === 'suspend' &&
                `Are you sure you want to suspend ${confirmModal.data.name}? They will lose access immediately.`}
              {confirmModal.type === 'unsuspend' &&
                `Are you sure you want to reactivate ${confirmModal.data.name}? They will regain access immediately.`}
            </p>

            {confirmModal.type === 'reject' && (
              <div className="mb-6">
                <label className="block text-sm text-gray-700 mb-2">
                  Reason (Optional)
                </label>
                <textarea
                  value={confirmModal.reason || ''}
                  onChange={(e) =>
                    setConfirmModal({ ...confirmModal, reason: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-orange-500"
                  rows={3}
                  placeholder="Enter a reason for rejection..."
                />
              </div>
            )}

            <div className="flex gap-3">
              <button
                onClick={() => setConfirmModal({ type: null })}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  if (confirmModal.type === 'approve') {
                    handleApproveWithdrawal(confirmModal.data);
                  } else if (confirmModal.type === 'reject') {
                    handleRejectWithdrawal(confirmModal.data, confirmModal.reason);
                  } else if (confirmModal.type === 'suspend') {
                    handleSuspendUser(confirmModal.data);
                  } else if (confirmModal.type === 'unsuspend') {
                    handleUnsuspendUser(confirmModal.data);
                  }
                }}
                className={`flex-1 px-4 py-2 text-white rounded-lg transition-colors ${
                  confirmModal.type === 'approve' || confirmModal.type === 'unsuspend'
                    ? 'bg-green-600 hover:bg-green-700'
                    : 'bg-red-600 hover:bg-red-700'
                }`}
              >
                {confirmModal.type === 'approve' && 'Confirm Approval'}
                {confirmModal.type === 'reject' && 'Confirm Rejection'}
                {confirmModal.type === 'suspend' && 'Confirm Suspension'}
                {confirmModal.type === 'unsuspend' && 'Confirm Reactivation'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};