
'use client'

import Link from 'next/link'
import { useState } from 'react'

export default function Header() {
    const [isMenuOpen, setIsMenuOpen] = useState(false)

    return (
        <header className="bg-gradient-to-r from-emerald-700 to-emerald-800 text-white py-6 shadow-lg">
            <div className="container mx-auto px-4 flex items-center justify-between">
                <Link href="/" className="hover:opacity-90 transition-opacity">
                    <img
                        src="/logo.png?v=2"
                        alt="Archery Ranges Canada"
                        className="h-28 w-auto object-contain"
                    />
                </Link>

                {/* Desktop Navigation */}
                <nav className="hidden md:flex items-center space-x-6">
                    <Link href="/" className="hover:text-green-100 transition-colors font-medium">
                        Home
                    </Link>
                    <Link href="/blog" className="hover:text-green-100 transition-colors font-medium">
                        Blog
                    </Link>
                    <Link href="/pricing" className="hover:text-green-100 transition-colors font-medium">
                        Pricing
                    </Link>
                    <div className="border-l border-green-600 pl-6 flex items-center space-x-3">
                        <Link href="/auth/login" className="hover:text-green-100 transition-colors font-medium">
                            Sign In
                        </Link>
                        <Link href="/auth/signup" className="bg-white text-green-700 px-4 py-2 rounded-lg font-semibold hover:bg-green-50 transition-colors">
                            Sign Up
                        </Link>
                    </div>
                </nav>

                {/* Mobile menu button */}
                <button
                    className="md:hidden text-white p-2"
                    onClick={() => setIsMenuOpen(!isMenuOpen)}
                >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        {isMenuOpen ? (
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        ) : (
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                        )}
                    </svg>
                </button>
            </div>

            {/* Mobile Navigation */}
            {isMenuOpen && (
                <div className="md:hidden bg-emerald-800 px-4 py-4 space-y-3">
                    <Link href="/" className="block hover:text-green-100 transition-colors font-medium">
                        Home
                    </Link>
                    <Link href="/blog" className="block hover:text-green-100 transition-colors font-medium">
                        Blog
                    </Link>
                    <Link href="/pricing" className="block hover:text-green-100 transition-colors font-medium">
                        Pricing
                    </Link>
                    <hr className="border-green-600" />
                    <Link href="/auth/login" className="block hover:text-green-100 transition-colors font-medium">
                        Sign In
                    </Link>
                    <Link href="/auth/signup" className="block bg-white text-green-700 px-4 py-2 rounded-lg font-semibold hover:bg-green-50 transition-colors text-center">
                        Sign Up
                    </Link>
                </div>
            )}
        </header>
    )
}
