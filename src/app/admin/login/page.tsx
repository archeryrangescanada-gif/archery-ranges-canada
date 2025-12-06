// src/app/admin/login/page.tsx
'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { LogIn, Eye, EyeOff } from 'lucide-react'

export default function AdminLogin() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      // Hardcoded credentials for demo (replace with Supabase auth later)
      if (email === 'admin@archeryranges.com' && password === 'password123') {
        // Set cookie with token
        document.cookie = 'admin-token=valid-token; path=/'
        
        // Redirect to dashboard
        router.push('/admin/dashboard')
      } else {
        setError('Invalid email or password')
      }
    } catch (err) {
      setError('An error occurred during login')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white rounded-lg shadow-lg p-8">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <div className="bg-green-600 p-3 rounded-lg">
              <LogIn className="w-6 h-6 text-white" />
            </div>
          </div>
          <h1 className="text-3xl font-bold text-gray-900">ARC Admin</h1>
          <p className="text-gray-600 text-sm mt-2">Archery Ranges Canada - Admin Portal</p>
        </div>

        {/* Login Form */}
        <form onSubmit={handleLogin} className="space-y-4">
          {/* Email */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Email Address
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 text-gray-900"
              placeholder="admin@archeryranges.com"
              required
              disabled={loading}
            />
          </div>

          {/* Password */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Password
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 text-gray-900"
                placeholder="••••••••"
                required
                disabled={loading}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-2.5 text-gray-600 hover:text-gray-900"
              >
                {showPassword ? (
                  <EyeOff className="w-5 h-5" />
                ) : (
                  <Eye className="w-5 h-5" />
                )}
              </button>
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3">
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}

          {/* Login Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-green-600 text-white py-2 rounded-lg font-medium hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition mt-6"
          >
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>

        {/* Demo Credentials */}
        <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <p className="text-xs text-blue-900 font-semibold mb-2">📝 Demo Credentials:</p>
          <p className="text-xs text-blue-800 font-mono">Email: admin@archeryranges.com</p>
          <p className="text-xs text-blue-800 font-mono">Password: password123</p>
        </div>

        {/* Footer */}
        <p className="text-center text-xs text-gray-500 mt-6">
          © 2024 Archery Ranges Canada. All rights reserved.
        </p>
      </div>
    </div>
  )
}