'use client'
import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Loader2, Save } from 'lucide-react'

const CATEGORIES = ['Tips', 'Equipment', 'Ranges', 'News', 'Techniques']

function slugify(text: string) {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
}

export default function EditBlogPostPage() {
  const router = useRouter()
  const params = useParams()
  const id = params.id as string

  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [slugManuallyEdited, setSlugManuallyEdited] = useState(true)

  const [form, setForm] = useState({
    title: '',
    slug: '',
    excerpt: '',
    content: '',
    category: 'Tips',
    author: '',
    featured_image: '',
    published_at: new Date().toISOString().split('T')[0],
    reading_time: 5,
    tags: '',
    is_published: false,
  })

  useEffect(() => {
    async function load() {
      const res = await fetch('/api/admin/blog')
      const { data } = await res.json()
      const post = (data || []).find((p: any) => p.id === id)
      if (!post) {
        setError('Post not found')
        setLoading(false)
        return
      }
      setForm({
        title: post.title || '',
        slug: post.slug || '',
        excerpt: post.excerpt || '',
        content: post.content || '',
        category: post.category || 'Tips',
        author: post.author || '',
        featured_image: post.featured_image || '',
        published_at: post.published_at ? post.published_at.split('T')[0] : new Date().toISOString().split('T')[0],
        reading_time: post.reading_time || 5,
        tags: Array.isArray(post.tags) ? post.tags.join(', ') : (post.tags || ''),
        is_published: !!post.is_published,
      })
      setLoading(false)
    }
    load()
  }, [id])

  function update(field: string, value: string | number | boolean) {
    setForm(prev => {
      const next: any = { ...prev, [field]: value }
      if (field === 'title' && !slugManuallyEdited) {
        next.slug = slugify(value as string)
      }
      return next
    })
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!form.title.trim()) return setError('Title is required.')
    if (!form.slug.trim()) return setError('Slug is required.')

    setSaving(true)
    setError('')

    const payload = {
      ...form,
      tags: form.tags ? form.tags.split(',').map((t: string) => t.trim()).filter(Boolean) : [],
      reading_time: Number(form.reading_time),
      published_at: form.is_published ? new Date(form.published_at).toISOString() : null,
    }

    const res = await fetch(`/api/admin/blog/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    })

    const data = await res.json()
    if (!res.ok) {
      setError(data.error || 'Failed to save post')
      setSaving(false)
      return
    }

    router.push('/admin/blog')
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
      </div>
    )
  }

  return (
    <div className="max-w-3xl">
      <div className="flex items-center gap-3 mb-6">
        <Link href="/admin/blog" className="p-2 hover:bg-gray-200 rounded-full transition-colors">
          <ArrowLeft className="w-5 h-5 text-gray-600" />
        </Link>
        <h1 className="text-2xl font-bold text-gray-900">Edit Blog Post</h1>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">{error}</div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-5">
          <h2 className="font-semibold text-gray-800">Content</h2>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Title *</label>
            <input
              type="text"
              value={form.title}
              onChange={e => update('title', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Slug *</label>
            <input
              type="text"
              value={form.slug}
              onChange={e => { setSlugManuallyEdited(true); update('slug', e.target.value) }}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm font-mono focus:outline-none focus:ring-2 focus:ring-green-500"
            />
            <p className="text-xs text-gray-400 mt-1">/blog/{form.slug || 'your-slug'}</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Excerpt</label>
            <textarea
              value={form.excerpt}
              onChange={e => update('excerpt', e.target.value)}
              rows={2}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500 resize-none"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Content</label>
            <textarea
              value={form.content}
              onChange={e => update('content', e.target.value)}
              rows={16}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm font-mono focus:outline-none focus:ring-2 focus:ring-green-500 resize-y"
            />
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-5">
          <h2 className="font-semibold text-gray-800">Details</h2>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
              <select
                value={form.category}
                onChange={e => update('category', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
              >
                {CATEGORIES.map(c => <option key={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Reading Time (min)</label>
              <input
                type="number"
                min={1}
                value={form.reading_time}
                onChange={e => update('reading_time', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Author</label>
            <input
              type="text"
              value={form.author}
              onChange={e => update('author', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Featured Image URL</label>
            <input
              type="url"
              value={form.featured_image}
              onChange={e => update('featured_image', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
              placeholder="https://..."
            />
            {form.featured_image && (
              <img src={form.featured_image} alt="Preview" className="mt-2 h-24 w-full object-cover rounded-lg" />
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Tags (comma-separated)</label>
            <input
              type="text"
              value={form.tags}
              onChange={e => update('tags', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
              placeholder="archery, canada, tips"
            />
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-4">
          <h2 className="font-semibold text-gray-800">Publishing</h2>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Publish Date</label>
            <input
              type="date"
              value={form.published_at}
              onChange={e => update('published_at', e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
            />
          </div>

          <label className="flex items-center gap-3 cursor-pointer">
            <div
              onClick={() => update('is_published', !form.is_published)}
              className={`relative w-10 h-6 rounded-full transition-colors ${form.is_published ? 'bg-green-500' : 'bg-gray-300'}`}
            >
              <div className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full shadow transition-transform ${form.is_published ? 'translate-x-4' : ''}`} />
            </div>
            <span className="text-sm font-medium text-gray-700">
              {form.is_published ? 'Published (visible on site)' : 'Draft (hidden from public)'}
            </span>
          </label>
        </div>

        <div className="flex gap-3 pb-6">
          <Link
            href="/admin/blog"
            className="px-5 py-2 border border-gray-300 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors"
          >
            Cancel
          </Link>
          <button
            type="submit"
            disabled={saving}
            className="flex items-center gap-2 px-5 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg text-sm font-medium transition-colors disabled:opacity-50"
          >
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            {saving ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </form>
    </div>
  )
}
