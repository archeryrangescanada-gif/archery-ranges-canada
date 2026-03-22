'use client'
import { useEffect, useState } from 'react'
import { Search, Plus, Edit, Trash2, Eye, EyeOff, Loader2 } from 'lucide-react'
import Link from 'next/link'

interface BlogPost {
  id: string
  title: string
  slug: string
  category: string
  author: string
  is_published: boolean
  published_at: string
  reading_time: number
  view_count: number
}

export default function AdminBlogPage() {
  const [posts, setPosts] = useState<BlogPost[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<'all' | 'published' | 'draft'>('all')
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [togglingId, setTogglingId] = useState<string | null>(null)

  useEffect(() => {
    fetchPosts()
  }, [])

  async function fetchPosts() {
    setLoading(true)
    const res = await fetch('/api/admin/blog', { credentials: 'include' })
    const { data } = await res.json()
    setPosts(data || [])
    setLoading(false)
  }

  async function handleDelete(id: string, title: string) {
    if (!confirm(`Delete "${title}"? This cannot be undone.`)) return
    setDeletingId(id)
    const res = await fetch(`/api/admin/blog/${id}`, { method: 'DELETE', credentials: 'include' })
    if (res.ok) {
      setPosts(prev => prev.filter(p => p.id !== id))
    } else {
      alert('Failed to delete post')
    }
    setDeletingId(null)
  }

  async function handleTogglePublished(post: BlogPost) {
    setTogglingId(post.id)
    const res = await fetch(`/api/admin/blog/${post.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ is_published: !post.is_published }),
    })
    if (res.ok) {
      setPosts(prev => prev.map(p => p.id === post.id ? { ...p, is_published: !p.is_published } : p))
    } else {
      alert('Failed to update post')
    }
    setTogglingId(null)
  }

  const filtered = posts.filter(p => {
    const matchesSearch = p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.author.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.category.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesStatus =
      statusFilter === 'all' ||
      (statusFilter === 'published' && p.is_published) ||
      (statusFilter === 'draft' && !p.is_published)
    return matchesSearch && matchesStatus
  })

  const publishedCount = posts.filter(p => p.is_published).length
  const draftCount = posts.filter(p => !p.is_published).length

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Blog Posts</h1>
          <p className="text-gray-500 text-sm mt-1">{posts.length} total &mdash; {publishedCount} published, {draftCount} drafts</p>
        </div>
        <Link
          href="/admin/blog/new"
          className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white font-medium rounded-lg transition-colors"
        >
          <Plus className="w-4 h-4" />
          New Post
        </Link>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search posts..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-lg text-sm text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-green-500"
          />
        </div>
        <select
          value={statusFilter}
          onChange={e => setStatusFilter(e.target.value as any)}
          className="px-3 py-2 border border-gray-200 rounded-lg text-sm text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-green-500"
        >
          <option value="all">All Status</option>
          <option value="published">Published</option>
          <option value="draft">Draft</option>
        </select>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-16 text-gray-500">
            {posts.length === 0 ? 'No blog posts yet. Create your first post.' : 'No posts match your filters.'}
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50">
                <th className="text-left px-4 py-3 font-medium text-gray-600">Title</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600 hidden md:table-cell">Category</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600 hidden lg:table-cell">Author</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600 hidden lg:table-cell">Views</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Status</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600 hidden md:table-cell">Date</th>
                <th className="text-right px-4 py-3 font-medium text-gray-600">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filtered.map(post => (
                <tr key={post.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-3">
                    <div className="font-medium text-gray-900 line-clamp-1">{post.title}</div>
                    <div className="text-xs text-gray-400 mt-0.5">/blog/{post.slug}</div>
                  </td>
                  <td className="px-4 py-3 hidden md:table-cell">
                    <span className="px-2 py-0.5 bg-green-50 text-green-700 rounded text-xs font-medium">
                      {post.category}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-gray-600 hidden lg:table-cell">{post.author}</td>
                  <td className="px-4 py-3 text-gray-600 hidden lg:table-cell">{post.view_count ?? 0}</td>
                  <td className="px-4 py-3">
                    <button
                      onClick={() => handleTogglePublished(post)}
                      disabled={togglingId === post.id}
                      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium transition-colors ${
                        post.is_published
                          ? 'bg-green-100 text-green-700 hover:bg-green-200'
                          : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                      }`}
                    >
                      {togglingId === post.id ? (
                        <Loader2 className="w-3 h-3 animate-spin" />
                      ) : post.is_published ? (
                        <Eye className="w-3 h-3" />
                      ) : (
                        <EyeOff className="w-3 h-3" />
                      )}
                      {post.is_published ? 'Published' : 'Draft'}
                    </button>
                  </td>
                  <td className="px-4 py-3 text-gray-500 hidden md:table-cell">
                    {post.published_at ? new Date(post.published_at).toLocaleDateString('en-CA') : '—'}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-1">
                      {post.is_published && (
                        <a
                          href={`/blog/${post.slug}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors"
                          title="View post"
                        >
                          <Eye className="w-4 h-4" />
                        </a>
                      )}
                      <Link
                        href={`/admin/blog/${post.id}/edit`}
                        className="p-1.5 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded transition-colors"
                        title="Edit"
                      >
                        <Edit className="w-4 h-4" />
                      </Link>
                      <button
                        onClick={() => handleDelete(post.id, post.title)}
                        disabled={deletingId === post.id}
                        className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors disabled:opacity-40"
                        title="Delete"
                      >
                        {deletingId === post.id ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <Trash2 className="w-4 h-4" />
                        )}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}
