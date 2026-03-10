// src/app/admin/layout.tsx
'use client'
import Link from 'next/link'
import { useEffect } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import {
  LayoutDashboard,
  MapPin,
  UserCheck,
  Megaphone,
  Users,
  BarChart3,
  Settings,
  FileText,
  CreditCard,
  LogOut,
  Shield,
  Mail,
  Wrench,
  Menu,
  X
} from 'lucide-react'
import { useState } from 'react'

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname()
  const router = useRouter()
  const supabase = createClient()
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)

  // useEffect(() => {
  //   const checkUser = async () => {
  //     const { data: { session } } = await supabase.auth.getSession()
  //     if (!session) {
  //       // Clear legacy token just in case
  //       document.cookie = 'admin-token=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT;'
  //       router.push('/admin/login')
  //     }
  //   }
  //   checkUser()
  // }, [])

  const handleLogout = async () => {
    // 1. Clear Supabase Session
    await supabase.auth.signOut()

    // 2. Clear Admin Cookie
    document.cookie = 'admin-token=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT;'

    // 3. Redirect to login
    router.push('/admin/login')
    router.refresh()
  }

  const navigation = [
    { name: 'Dashboard', href: '/admin/dashboard', icon: LayoutDashboard },
    { name: 'Listings', href: '/admin/listings', icon: MapPin },
    { name: 'Claims', href: '/admin/claims', icon: UserCheck },
    { name: 'Ads', href: '/admin/ads', icon: Megaphone },
    { name: 'Announcements', href: '/admin/announcements', icon: FileText },
    { name: 'Emails', href: '/admin/emails', icon: Mail },
    { name: 'Submissions', href: '/admin/submissions', icon: FileText },
    { name: 'Users', href: '/admin/users', icon: Users },
    { name: 'Subscriptions', href: '/admin/subscriptions', icon: CreditCard },
    { name: 'Analytics', href: '/admin/analytics', icon: BarChart3 },
    { name: 'Tools', href: '/admin/tools', icon: Wrench },
    { name: 'Settings', href: '/admin/settings', icon: Settings },
  ]

  const isActive = (href: string) => pathname.startsWith(href)

  // If on login page, render only the children without the admin layout
  if (pathname === '/admin/login') {
    return <>{children}</>
  }

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Top Navigation Bar */}
      <nav className="bg-white shadow-sm border-b sticky top-0 z-40">
        <div className="px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <button
                onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                className="p-2 mr-2 text-gray-600 lg:hidden hover:bg-gray-100 rounded-md"
              >
                {isSidebarOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
              <Link href="/admin/dashboard" className="text-xl font-bold text-green-600">
                ARC Admin
              </Link>
            </div>
            <div className="flex items-center space-x-4">
              <Link href="/" className="text-gray-600 hover:text-gray-900 text-sm sm:text-base">
                View Site
              </Link>
              <button
                onClick={handleLogout}
                className="flex items-center text-gray-600 hover:text-gray-900 text-sm sm:text-base"
              >
                <LogOut className="w-5 h-5 mr-0 sm:mr-2" />
                <span className="hidden sm:inline">Logout</span>
              </button>
            </div>
          </div>
        </div>
      </nav>

      <div className="flex overflow-hidden">
        {/* Sidebar Overlay (Mobile Only) */}
        {isSidebarOpen && (
          <div
            className="fixed inset-0 bg-black bg-opacity-50 z-20 lg:hidden"
            onClick={() => setIsSidebarOpen(false)}
          />
        )}

        {/* Sidebar */}
        <aside
          className={`
            fixed inset-y-0 left-0 z-30 w-64 bg-white shadow-sm transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0
            ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
          `}
        >
          <nav className="mt-5 px-2 h-full overflow-y-auto pb-20">
            <div className="space-y-1">
              {navigation.map((item) => {
                const Icon = item.icon
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    onClick={() => setIsSidebarOpen(false)}
                    className={`
                      group flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors
                      ${isActive(item.href)
                        ? 'bg-green-100 text-green-900'
                        : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                      }
                    `}
                  >
                    <Icon className={`
                      mr-3 h-5 w-5
                      ${isActive(item.href) ? 'text-green-600' : 'text-gray-400'}
                    `} />
                    {item.name}
                  </Link>
                )
              })}
            </div>
          </nav>
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-4 sm:p-8 min-w-0 bg-gray-100 min-h-[calc(100vh-64px)] overflow-x-hidden">
          {children}
        </main>
      </div>
    </div>
  )
}