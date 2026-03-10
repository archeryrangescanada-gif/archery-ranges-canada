'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { BarChart3, Layout, Users, Send, Settings, Mail } from 'lucide-react'

const navItems = [
    { name: 'Analytics', href: '/admin/emails/analytics', icon: BarChart3 },
    { name: 'Campaigns', href: '/admin/emails/campaigns', icon: Send },
    { name: 'Templates', href: '/admin/emails/templates', icon: Layout },
    { name: 'Audience', href: '/admin/emails/audience', icon: Users },
    { name: 'Settings', href: '/admin/emails/settings', icon: Settings },
]

export function EmailSidebar() {
    const pathname = usePathname()

    return (
        <div className="w-64 bg-white border-r border-stone-200 min-h-[calc(100vh-64px)] p-6 hidden lg:block">
            <div className="mb-8">
                <h2 className="text-xs font-bold text-stone-400 uppercase tracking-widest mb-4">Email Marketing</h2>
                <nav className="space-y-2">
                    {navItems.map((item) => {
                        const isActive = pathname.startsWith(item.href)
                        return (
                            <Link
                                key={item.name}
                                href={item.href}
                                className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-all ${isActive
                                        ? 'bg-emerald-50 text-emerald-700'
                                        : 'text-stone-600 hover:bg-stone-50 hover:text-stone-900'
                                    }`}
                            >
                                <item.icon className={`w-5 h-5 ${isActive ? 'text-emerald-600' : 'text-stone-400'}`} />
                                {item.name}
                            </Link>
                        )
                    })}
                </nav>
            </div>

            <div className="bg-stone-50 rounded-xl p-4 border border-stone-100">
                <h3 className="text-xs font-bold text-stone-500 uppercase tracking-widest mb-2">System Status</h3>
                <div className="flex items-center gap-2 text-xs font-bold text-emerald-600">
                    <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                    Mail Server Online
                </div>
                <div className="mt-2 text-[10px] text-stone-400 font-medium">99.9% Deliverability</div>
            </div>
        </div>
    )
}
