'use client'
import { useEffect, useState } from 'react'
import { Search, UserCheck, UserX, Shield, Mail, Edit, Trash2, AlertTriangle, Loader2, UserPlus } from 'lucide-react'
import { InviteUserModal } from '@/components/admin/InviteUserModal'

interface User {
  id: string
  email: string
  full_name: string
  phone?: string
  company_name?: string
  role: 'user' | 'business_owner' | 'admin' | 'super_admin' | 'admin_employee'
  status: 'active' | 'suspended' | 'invited'
  avatar_url?: string
  created_at: string
  last_sign_in?: string
  listings_count?: number
}

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [searchQuery, setSearchQuery] = useState('')
  const [roleFilter, setRoleFilter] = useState<string>('all')
  const [selectedUser, setSelectedUser] = useState<User | null>(null)
  const [showModal, setShowModal] = useState(false)
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false)
  const [actionLoading, setActionLoading] = useState<string | null>(null)

  useEffect(() => {
    fetchUsers()
  }, [])

  const fetchUsers = async () => {
    try {
      const res = await fetch('/api/admin/users')
      const data = await res.json()

      if (!res.ok) throw new Error(data.error || 'Failed to fetch users')

      setUsers(data.users || [])
    } catch (err: any) {
      console.error(err)
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleRoleChange = async (userId: string, newRole: string) => {
    if (!confirm(`Are you sure you want to change this user's role to ${newRole}?`)) return

    setActionLoading(userId)
    try {
      const res = await fetch('/api/admin/users', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: userId, role: newRole })
      })

      const data = await res.json()
      if (!res.ok) throw new Error(data.error)

      setUsers(users.map(u => u.id === userId ? { ...u, role: newRole as any } : u))
    } catch (err: any) {
      alert(err.message)
    } finally {
      setActionLoading(null)
    }
  }

  const handleStatusChange = async (userId: string, newStatus: string) => {
    if (!confirm(`Are you sure you want to change this user's status to ${newStatus}?`)) return

    setActionLoading(userId)
    try {
      const res = await fetch('/api/admin/users', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: userId, status: newStatus })
      })

      const data = await res.json()
      if (!res.ok) throw new Error(data.error)

      setUsers(users.map(u => u.id === userId ? { ...u, status: newStatus as any } : u))
    } catch (err: any) {
      alert(err.message)
    } finally {
      setActionLoading(null)
    }
  }

  const handleDeleteUser = async (userId: string) => {
    if (!confirm('Are you sure you want to DELETE this user? This action cannot be undone.')) return

    setActionLoading(userId)
    try {
      const res = await fetch(`/api/admin/users?id=${userId}`, {
        method: 'DELETE',
      })

      const data = await res.json()
      if (!res.ok) throw new Error(data.error)

      setUsers(users.filter(u => u.id !== userId))
    } catch (err: any) {
      alert(err.message)
    } finally {
      setActionLoading(null)
    }
  }

  const handleResendInvite = async (email: string, role: string) => {
    if (!confirm(`Resend invitation to ${email}?`)) return;

    try {
      const res = await fetch('/api/admin/invite', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, role })
      });

      if (res.ok) {
        alert('Invitation resent successfully');
      } else {
        const data = await res.json();
        throw new Error(data.error);
      }
    } catch (err: any) {
      alert(err.message);
    }
  }

  const getRoleBadge = (role: string) => {
    const colors = {
      user: 'bg-gray-100 text-gray-800',
      business_owner: 'bg-blue-100 text-blue-800',
      admin: 'bg-purple-100 text-purple-800',
      admin_employee: 'bg-purple-100 text-purple-800',
      super_admin: 'bg-red-100 text-red-800'
    }
    return colors[role as keyof typeof colors] || colors.user
  }

  const getRoleLabel = (role: string) => {
    const labels = {
      user: 'User',
      business_owner: 'Business Owner',
      admin: 'Admin',
      admin_employee: 'Admin',
      super_admin: 'Super Admin'
    }
    return labels[role as keyof typeof labels] || role
  }

  const filteredUsers = users.filter(user => {
    const matchesSearch =
      user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.full_name?.toLowerCase().includes(searchQuery.toLowerCase())

    const matchesRole = roleFilter === 'all' || user.role === roleFilter

    return matchesSearch && matchesRole
  })

  if (loading) return (
    <div className="flex items-center justify-center min-h-[400px]">
      <Loader2 className="w-8 h-8 animate-spin text-emerald-600" />
    </div>
  )

  if (error) return (
    <div className="p-8 text-center text-red-600 bg-red-50 rounded-xl m-4">
      <AlertTriangle className="w-12 h-12 mx-auto mb-2" />
      <h3 className="text-lg font-bold">Access Denied</h3>
      <p>{error}</p>
    </div>
  )

  return (
    <div>
      <div className="mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Users Management</h1>
          <p className="text-gray-600 mt-2">Manage all user accounts and permissions</p>
        </div>
        <button
          onClick={() => setIsInviteModalOpen(true)}
          className="inline-flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg font-medium transition-colors shadow-sm"
        >
          <UserPlus className="w-4 h-4" />
          Invite Member
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow p-6">
          <p className="text-sm text-gray-600">Total Users</p>
          <p className="text-3xl font-bold text-gray-900">{users.length}</p>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <p className="text-sm text-gray-600">Business Owners</p>
          <p className="text-3xl font-bold text-blue-600">
            {users.filter(u => u.role === 'business_owner').length}
          </p>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <p className="text-sm text-gray-600">Regular Users</p>
          <p className="text-3xl font-bold text-green-600">
            {users.filter(u => u.role === 'user').length}
          </p>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <p className="text-sm text-gray-600">Admins</p>
          <p className="text-3xl font-bold text-purple-600">
            {users.filter(u => ['admin', 'admin_employee', 'super_admin'].includes(u.role)).length}
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search users by name or email..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-green-500"
            />
          </div>

          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-green-500"
          >
            <option value="all">All Roles</option>
            <option value="user">Users</option>
            <option value="business_owner">Business Owners</option>
            <option value="admin_employee">Admins</option>
            <option value="super_admin">Super Admins</option>
          </select>
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  User
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Role
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Joined
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredUsers.map((user) => (
                <tr key={user.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <div className="flex items-center">
                      <div className="h-10 w-10 min-w-[2.5rem] rounded-full bg-gray-200 flex items-center justify-center text-xs font-bold text-gray-600">
                        {user.full_name?.charAt(0).toUpperCase() || user.email.charAt(0).toUpperCase()}
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">{user.full_name || 'N/A'}</div>
                        <div className="text-sm text-gray-500">{user.email}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap admin-role-select">
                    <select
                      value={user.role}
                      disabled={actionLoading === user.id}
                      onChange={(e) => handleRoleChange(user.id, e.target.value)}
                      className={`px-3 py-1 rounded-full text-xs font-medium cursor-pointer ${getRoleBadge(user.role)} border-0 outline-none ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-indigo-600`}
                    >
                      <option value="user">User</option>
                      <option value="business_owner">Business Owner</option>
                      <option value="admin_employee">Admin</option>
                      <option value="super_admin">Super Admin</option>
                    </select>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2.5 py-1 rounded-full text-xs font-medium capitalize ${user.status === 'active'
                      ? 'bg-green-50 text-green-700'
                      : user.status === 'suspended'
                        ? 'bg-red-50 text-red-700'
                        : 'bg-yellow-50 text-yellow-700'
                      }`}>
                      {user.status || 'active'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(user.created_at).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex space-x-2 items-center">
                      {user.status === 'invited' && (
                        <button
                          onClick={() => handleResendInvite(user.email, user.role as any)}
                          className="text-emerald-600 hover:text-emerald-900 p-1 rounded hover:bg-emerald-50"
                          title="Resend Invite"
                        >
                          <Mail className="w-4 h-4" />
                        </button>
                      )}
                      <button
                        onClick={() => {
                          setSelectedUser(user)
                          setShowModal(true)
                        }}
                        className="text-blue-600 hover:text-blue-900 p-1 rounded hover:bg-blue-50"
                        title="View Details"
                      >
                        <Edit className="w-4 h-4" />
                      </button>

                      {user.status === 'suspended' ? (
                        <button
                          onClick={() => handleStatusChange(user.id, 'active')}
                          className="text-green-600 hover:text-green-900 p-1 rounded hover:bg-green-50"
                          title="Activate User"
                        >
                          <UserCheck className="w-4 h-4" />
                        </button>
                      ) : (
                        <button
                          onClick={() => handleStatusChange(user.id, 'suspended')}
                          className="text-amber-600 hover:text-amber-900 p-1 rounded hover:bg-amber-50"
                          title="Suspend User"
                        >
                          <UserX className="w-4 h-4" />
                        </button>
                      )}

                      <button
                        className="text-gray-400 hover:text-red-900 p-1 rounded hover:bg-red-50"
                        onClick={() => handleDeleteUser(user.id)}
                        title="Delete User"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* User Details Modal */}
      {showModal && selectedUser && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4">
            <div className="p-6">
              <h2 className="text-2xl font-bold mb-4">User Details</h2>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Full Name</label>
                  <p className="mt-1 text-sm text-gray-900">{selectedUser.full_name || 'N/A'}</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Email</label>
                  <p className="mt-1 text-sm text-gray-900">{selectedUser.email}</p>
                </div>

                {selectedUser.phone && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Phone</label>
                    <p className="mt-1 text-sm text-gray-900">{selectedUser.phone}</p>
                  </div>
                )}

                {selectedUser.company_name && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Company</label>
                    <p className="mt-1 text-sm text-gray-900">{selectedUser.company_name}</p>
                  </div>
                )}

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Role</label>
                    <p className="mt-1">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${getRoleBadge(selectedUser.role)}`}>
                        {getRoleLabel(selectedUser.role)}
                      </span>
                    </p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Status</label>
                    <p className="mt-1">
                      <span className={`inline-flex px-2.5 py-1 rounded-full text-xs font-medium capitalize ${selectedUser.status === 'active'
                        ? 'bg-green-50 text-green-700'
                        : selectedUser.status === 'suspended'
                          ? 'bg-red-50 text-red-700'
                          : 'bg-yellow-50 text-yellow-700'
                        }`}>
                        {selectedUser.status || 'active'}
                      </span>
                    </p>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Account Created</label>
                  <p className="mt-1 text-sm text-gray-900">
                    {new Date(selectedUser.created_at).toLocaleString()}
                  </p>
                </div>

                {selectedUser.last_sign_in && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Last Sign In</label>
                    <p className="mt-1 text-sm text-gray-900">
                      {new Date(selectedUser.last_sign_in).toLocaleString()}
                    </p>
                  </div>
                )}

                <div>
                  <label className="block text-sm font-medium text-gray-700">Listings Owned</label>
                  <p className="mt-1 text-sm text-gray-900">{selectedUser.listings_count || 0}</p>
                </div>
              </div>

              <div className="mt-6 flex justify-end space-x-3">
                <button
                  onClick={() => {
                    setShowModal(false)
                    setSelectedUser(null)
                  }}
                  className="px-4 py-2 border border-gray-300 rounded text-gray-700 hover:bg-gray-50"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Invite Modal */}
      <InviteUserModal
        isOpen={isInviteModalOpen}
        onClose={() => setIsInviteModalOpen(false)}
        onSuccess={fetchUsers}
      />
    </div>
  )
}