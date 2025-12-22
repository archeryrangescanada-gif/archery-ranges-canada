'use client'

import Link from 'next/link'
import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'

interface BlogPost {
  id: string
  title: string
  slug: string
  excerpt: string
  category: string
  author: string
  featured_image: string
  published_at: string
  reading_time: number
  tags: string[]
}

export default function BlogPage() {
  const [posts, setPosts] = useState<BlogPost[]>([])
  const [loading, setLoading] = useState(true)

  const categories = ['All', 'Tips', 'Equipment', 'Ranges', 'News', 'Techniques']

  useEffect(() => {
    async function fetchPosts() {
      const supabase = createClient()
      const { data } = await supabase
        .from('blog_posts')
        .select('*')
        .eq('is_published', true)
        .order('published_at', { ascending: false })

      if (data) setPosts(data)
      setLoading(false)
    }
    fetchPosts()
  }, [])

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header - Same as Home Page */}
      <header className="bg-gradient-to-r from-emerald-700 to-emerald-800 text-white py-6 shadow-lg">
        <div className="container mx-auto px-4 flex items-center justify-between">
          <Link href="/" className="hover:opacity-90 transition-opacity">
            <img
              src="/logo.png?v=2"
              alt="Archery Ranges Canada"
              className="h-28 w-auto object-contain"
            />
          </Link>
          <nav className="hidden md:flex items-center space-x-6">
            <Link href="/" className="hover:text-green-100 transition-colors font-medium">
              Home
            </Link>
            <Link href="/blog" className="text-green-100 font-medium border-b-2 border-green-100">
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
          <button className="md:hidden text-white">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
        </div>
      </header>

      {/* Breadcrumb */}
      <nav className="bg-white border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center space-x-2 text-sm text-gray-600">
            <Link href="/" className="hover:text-green-600">Home</Link>
            <span>/</span>
            <span className="text-gray-800 font-medium">Blog</span>
          </div>
        </div>
      </nav>

      <main className="container mx-auto px-4 py-12">
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold text-gray-900 mb-4">Archery Blog</h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Tips, guides, and news from the world of archery
          </p>
        </div>

        <div className="flex flex-wrap justify-center gap-3 mb-12">
          {categories.map(category => (
            <button
              key={category}
              className="px-6 py-2 rounded-full bg-white border-2 border-gray-200 text-gray-800 hover:border-green-500 hover:bg-green-50 transition-colors font-medium"
            >
              {category}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="text-center py-16">
            <p className="text-xl text-gray-500">Loading posts...</p>
          </div>
        ) : posts && posts.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-7xl mx-auto">
            {posts.map((post: BlogPost) => (
              <Link
                key={post.id}
                href={'/blog/' + post.slug}
                className="group bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-2xl transition-shadow"
              >
                <div className="relative h-48 bg-gray-200">
                  {post.featured_image && (
                    <img
                      src={post.featured_image}
                      alt={post.title}
                      className="w-full h-full object-cover"
                    />
                  )}
                  <span className="absolute top-4 left-4 px-3 py-1 bg-green-600 text-white text-xs font-medium rounded-full">
                    {post.category}
                  </span>
                </div>
                <div className="p-6">
                  <h2 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-green-600 transition-colors">
                    {post.title}
                  </h2>
                  <p className="text-gray-600 mb-4 line-clamp-2">{post.excerpt}</p>
                  <div className="flex items-center justify-between text-sm text-gray-500">
                    <span>{post.author}</span>
                    <span>{post.reading_time} min read</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="text-center py-16">
            <p className="text-xl text-gray-500">No blog posts yet. Check back soon!</p>
          </div>
        )}
      </main>

      {/* Footer - Same as Home Page */}
      <footer className="bg-gradient-to-r from-emerald-700 to-emerald-800 text-white py-12 mt-20">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
            <div>
              <img
                src="/logo.png?v=2"
                alt="Archery Ranges Canada"
                className="h-20 w-auto object-contain mb-4"
              />
              <p className="text-green-100">
                Your complete directory of archery ranges across Canada
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Quick Links</h4>
              <ul className="space-y-2 text-green-100">
                <li><Link href="/" className="hover:text-white">Home</Link></li>
                <li><Link href="/blog" className="hover:text-white">Blog</Link></li>
                <li><Link href="/about" className="hover:text-white">About</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Range Owners</h4>
              <ul className="space-y-2 text-green-100">
                <li><Link href="/pricing" className="hover:text-white">Claim Your Listing</Link></li>
                <li><Link href="/pricing" className="hover:text-white">Premium Features</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Resources</h4>
              <ul className="space-y-2 text-green-100">
                <li><Link href="/blog" className="hover:text-white">Archery Tips</Link></li>
                <li><Link href="/blog" className="hover:text-white">Beginner Guides</Link></li>
                <li><Link href="/blog" className="hover:text-white">Equipment Reviews</Link></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-green-600 pt-8 text-center text-green-100">
            <p>© 2025 Archery Ranges Canada. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
