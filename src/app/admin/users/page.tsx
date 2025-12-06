// src/app/admin/users/page.tsx
'use client'
import { useEffect, useState } from 'react'
import { Search, UserCheck, UserX, Shield, Mail, Edit } from 'lucide-react'

interface User {
  id: string
  email: string
  full_name: string
  phone?: string
  company_name?: string
  role: 'user' | 'business_owner' | 'admin' | 'super_admin'
  avatar_url?: string
  created_at: string
  last_sign_in?: string
  listings_count?: number
}

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [roleFilter, setRoleFilter] = useState<string>('all')
  const [selectedUser, setSelectedUser] = useState<User | null>(null)
  const [showModal, setShowModal] = useState(false)

  useEffect(() => {
    fetchUsers()
  }, [roleFilter, searchQuery])

  const fetchUsers = async () => {
    // TODO: Fetch from Supabase
    setUsers([
      {
        id: '1',
        email: 'john@example.com',
        full_name: 'John Smith',
        phone: '416-555-1234',
        company_name: 'Toronto Archery Range',
        role: 'business_owner',
        created_at: '2024-01-15',
        last_sign_in: '2024-03-10',
        listings_count: 1
      },
      {
        id: '2',
        email: 'sarah@example.com',
        full_name: 'Sarah Johnson',
        role: 'user',
        created_at: '2024-02-20',
        last_sign_in: '2024-03-09',
        listings_count: 0
      },
      {
        id: '3',
        email: 'admin@archeryranges.ca',
        full_name: 'Admin User',
        role: 'admin',
        created_at: '2023-12-01',
        last_sign_in: '2024-03-11',
        listings_count: 0
      }
    ])
    setLoading(false)
  }

  const handleRoleChange = async (userId: string, newRole: string) => {
    if (!confirm(`Are you sure you want to change this user's role to ${newRole}?`)) return
    
    // TODO: Update in Supabase
    setUsers(users.map(u =>
      u.id === userId ? { ...u, role: newRole as any } : u
    ))
  }

  const getRoleBadge = (role: string) => {
    const colors = {
      user: 'bg-gray-100 text-gray-800',
      business_owner: 'bg-blue-100 text-blue-800',
      admin: 'bg-purple-100 text-purple-800',
      super_admin: 'bg-red-100 text-red-800'
    }
    return colors[role as keyof typeof colors] || colors.user
  }

  const getRoleLabel = (role: string) => {
    const labels = {
      user: 'User',
      business_owner: 'Business Owner',
      admin: 'Admin',
      super_admin: 'Super Admin'
    }
    return labels[role as keyof typeof labels] || role
  }

  if (loading) {
    return <div>Loading...</div>
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Users Management</h1>
        <p className="text-gray-600 mt-2">Manage user accounts and permissions</p>
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
            {users.filter(u => u.role === 'admin' || u.role === 'super_admin').length}
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
            <option value="admin">Admins</option>
            <option value="super_admin">Super Admins</option>
          </select>
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                User
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Contact
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Role
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Listings
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Joined
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Last Sign In
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {users.map((user) => (
              <tr key={user.id} className="hover:bg-gray-50">
                <td className="px-6 py-4">
                  <div className="flex items-center">
                    <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center">
                      {user.avatar_url ? (
                        <img src={user.avatar_url} alt="" className="h-10 w-10 rounded-full" />
                      ) : (
                        <span className="text-gray-600 font-medium">
                          {user.full_name?.charAt(0) || user.email.charAt(0).toUpperCase()}
                        </span>
                      )}
                    </div>
                    <div className="ml-4">
                      <div className="text-sm font-medium text-gray-900">{user.full_name || 'N/A'}</div>
                      {user.company_name && (
                        <div className="text-sm text-gray-500">{user.company_name}</div>
                      )}
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="text-sm text-gray-900">{user.email}</div>
                  {user.phone && (
                    <div className="text-sm text-gray-500">{user.phone}</div>
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <select
                    value={user.role}
                    onChange={(e) => handleRoleChange(user.id, e.target.value)}
                    className={`px-3 py-1 rounded-full text-xs font-medium ${getRoleBadge(user.role)}`}
                  >
                    <option value="user">User</option>
                    <option value="business_owner">Business Owner</option>
                    <option value="admin">Admin</option>
                    <option value="super_admin">Super Admin</option>
                  </select>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {user.listings_count || 0}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {new Date(user.created_at).toLocaleDateString()}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {user.last_sign_in ? new Date(user.last_sign_in).toLocaleDateString() : 'Never'}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <div className="flex space-x-2">
                    <button
                      onClick={() => {
                        setSelectedUser(user)
                        setShowModal(true)
                      }}
                      className="text-blue-600 hover:text-blue-900"
                      title="View Details"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button
                      className="text-green-600 hover:text-green-900"
                      title="Send Email"
                    >
                      <Mail className="w-4 h-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
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

                <div>
                  <label className="block text-sm font-medium text-gray-700">Role</label>
                  <p className="mt-1">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${getRoleBadge(selectedUser.role)}`}>
                      {getRoleLabel(selectedUser.role)}
                    </span>
                  </p>
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
    </div>
  )
}