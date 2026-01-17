
'use client'

import Link from 'next/link'
import { useState, useCallback } from 'react'

export default function Header() {
    const [isMenuOpen, setIsMenuOpen] = useState(false)

    const toggleMenu = useCallback(() => {
        setIsMenuOpen(prev => !prev)
    }, [])

    const closeMenu = useCallback(() => {
        setIsMenuOpen(false)
    }, [])

    return (
        <header className="bg-gradient-to-r from-emerald-700 to-emerald-800 text-white py-6 shadow-lg relative z-50">
            <div className="container mx-auto px-4 flex items-center justify-between relative">
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
                    <Link href="/about" className="hover:text-green-100 transition-colors font-medium">
                        About
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
                    type="button"
                    className="md:hidden text-white p-3 min-w-[48px] min-h-[48px] flex items-center justify-center focus:outline-none focus:ring-2 focus:ring-white focus:ring-opacity-50 rounded-lg active:bg-emerald-900 touch-manipulation relative z-50"
                    onClick={toggleMenu}
                    onTouchEnd={(e) => {
                        e.preventDefault()
                        toggleMenu()
                    }}
                    aria-label="Toggle menu"
                    aria-expanded={isMenuOpen}
                >
                    <svg className="w-7 h-7 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
                <nav className="md:hidden bg-emerald-800 px-4 py-4 space-y-3 relative z-40" role="navigation">
                    <Link href="/" onClick={closeMenu} className="block hover:text-green-100 transition-colors font-medium py-2">
                        Home
                    </Link>
                    <Link href="/about" onClick={closeMenu} className="block hover:text-green-100 transition-colors font-medium py-2">
                        About
                    </Link>
                    <Link href="/blog" onClick={closeMenu} className="block hover:text-green-100 transition-colors font-medium py-2">
                        Blog
                    </Link>
                    <Link href="/pricing" onClick={closeMenu} className="block hover:text-green-100 transition-colors font-medium py-2">
                        Pricing
                    </Link>
                    <hr className="border-green-600" />
                    <Link href="/auth/login" onClick={closeMenu} className="block hover:text-green-100 transition-colors font-medium py-2">
                        Sign In
                    </Link>
                    <Link href="/auth/signup" onClick={closeMenu} className="block bg-white text-green-700 px-4 py-2 rounded-lg font-semibold hover:bg-green-50 transition-colors text-center">
                        Sign Up
                    </Link>
                </nav>
            )}
        </header>
    )
}
