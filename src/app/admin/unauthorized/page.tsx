// src/app/admin/unauthorized/page.tsx
'use client'

import Link from 'next/link'
import { Shield, ArrowLeft } from 'lucide-react'

export default function UnauthorizedPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 to-orange-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white rounded-lg shadow-lg p-8 text-center">
        <div className="flex justify-center mb-6">
          <div className="bg-red-100 p-4 rounded-full">
            <Shield className="w-12 h-12 text-red-600" />
          </div>
        </div>

        <h1 className="text-3xl font-bold text-gray-900 mb-4">Access Denied</h1>

        <p className="text-gray-600 mb-2">
          You do not have permission to access the admin portal.
        </p>

        <p className="text-gray-500 text-sm mb-8">
          Only users with administrator privileges can access this area. If you believe this is an error, please contact your system administrator.
        </p>

        <div className="space-y-3">
          <Link
            href="/"
            className="w-full inline-flex items-center justify-center bg-green-600 text-white py-2 px-4 rounded-lg font-medium hover:bg-green-700 transition"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Return to Home
          </Link>

          <Link
            href="/admin/login"
            className="w-full inline-flex items-center justify-center bg-white text-gray-700 py-2 px-4 rounded-lg font-medium border border-gray-300 hover:bg-gray-50 transition"
          >
            Sign in with different account
          </Link>
        </div>

        <p className="text-center text-xs text-gray-500 mt-8">
          © 2024 Archery Ranges Canada. All rights reserved.
        </p>
      </div>
    </div>
  )
}
