// src/app/admin/announcements/new/page.tsx
'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Upload, X } from 'lucide-react'

export default function NewAnnouncementPage() {
  const router = useRouter()
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    excerpt: '',
    link_url: '',
    link_text: 'Learn More',
    category: 'news',
    province: '',
    target_audience: 'all',
    is_featured: false,
    is_pinned: false,
    priority: 0,
    status: 'draft',
    publish_date: new Date().toISOString().split('T')[0],
    expire_date: '',
    background_color: '',
    tags: [] as string[]
  })
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string>('')
  const [tagInput, setTagInput] = useState('')

  const provinces = [
    '', 'Alberta', 'British Columbia', 'Manitoba', 'New Brunswick',
    'Newfoundland and Labrador', 'Nova Scotia', 'Ontario',
    'Prince Edward Island', 'Quebec', 'Saskatchewan'
  ]

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target
    const checked = (e.target as HTMLInputElement).checked

    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }))
  }

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setImageFile(file)
      const reader = new FileReader()
      reader.onloadend = () => {
        setImagePreview(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const addTag = () => {
    if (tagInput.trim() && !formData.tags.includes(tagInput.trim())) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, tagInput.trim()]
      }))
      setTagInput('')
    }
  }

  const removeTag = (tag: string) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(t => t !== tag)
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    // TODO:
    // 1. Upload image to Supabase Storage
    // 2. Create announcement record in Supabase
    // 3. Redirect to announcements list

    console.log('Form Data:', formData)
    console.log('Image File:', imageFile)

    alert('Announcement created successfully!')
    router.push('/admin/announcements')
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Create New Announcement</h1>
        <p className="text-gray-600 mt-2">Create a new announcement for the sidebar</p>
      </div>

      <form onSubmit={handleSubmit} className="max-w-4xl">
        <div className="bg-white rounded-lg shadow p-6 space-y-6">
          {/* Basic Information */}
          <div>
            <h2 className="text-lg font-semibold mb-4">Basic Information</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Title *
                </label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-green-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Excerpt (Short Summary)
                </label>
                <input
                  type="text"
                  name="excerpt"
                  value={formData.excerpt}
                  onChange={handleChange}
                  placeholder="Brief description shown in the card"
                  maxLength={150}
                  className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-green-500"
                />
                <p className="text-xs text-gray-500 mt-1">{formData.excerpt.length}/150 characters</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Content *
                </label>
                <textarea
                  name="content"
                  value={formData.content}
                  onChange={handleChange}
                  rows={8}
                  placeholder="Full announcement content (HTML supported)"
                  className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-green-500"
                  required
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Link URL
                  </label>
                  <input
                    type="url"
                    name="link_url"
                    value={formData.link_url}
                    onChange={handleChange}
                    placeholder="https://example.com"
                    className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-green-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Link Text
                  </label>
                  <input
                    type="text"
                    name="link_text"
                    value={formData.link_text}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-green-500"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Image Upload */}
          <div>
            <h2 className="text-lg font-semibold mb-4">Featured Image</h2>
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6">
              {imagePreview ? (
                <div className="relative">
                  <img src={imagePreview} alt="Preview" className="max-w-full h-auto rounded" />
                  <button
                    type="button"
                    onClick={() => {
                      setImageFile(null)
                      setImagePreview('')
                    }}
                    className="absolute top-2 right-2 bg-red-500 text-white p-2 rounded-full hover:bg-red-600"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <div className="text-center">
                  <Upload className="mx-auto h-12 w-12 text-gray-400" />
                  <p className="mt-2 text-sm text-gray-600">Click to upload or drag and drop</p>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="mt-2"
                  />
                </div>
              )}
            </div>
          </div>

          {/* Categorization */}
          <div>
            <h2 className="text-lg font-semibold mb-4">Categorization</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Category *
                </label>
                <select
                  name="category"
                  value={formData.category}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-green-500"
                  required
                >
                  <option value="tournament">Tournament</option>
                  <option value="event">Event</option>
                  <option value="news">News</option>
                  <option value="promotion">Promotion</option>
                  <option value="update">Update</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Province (Optional)
                </label>
                <select
                  name="province"
                  value={formData.province}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-green-500"
                >
                  <option value="">All Provinces</option>
                  {provinces.filter(p => p).map(province => (
                    <option key={province} value={province}>{province}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Tags */}
            <div className="mt-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Tags
              </label>
              <div className="flex space-x-2">
                <input
                  type="text"
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
                  placeholder="Add a tag and press Enter"
                  className="flex-1 px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-green-500"
                />
                <button
                  type="button"
                  onClick={addTag}
                  className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
                >
                  Add
                </button>
              </div>
              <div className="flex flex-wrap gap-2 mt-2">
                {formData.tags.map(tag => (
                  <span
                    key={tag}
                    className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-blue-100 text-blue-800"
                  >
                    {tag}
                    <button
                      type="button"
                      onClick={() => removeTag(tag)}
                      className="ml-2 text-blue-600 hover:text-blue-800"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Display Settings */}
          <div>
            <h2 className="text-lg font-semibold mb-4">Display Settings</h2>
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Target Audience
                  </label>
                  <select
                    name="target_audience"
                    value={formData.target_audience}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-green-500"
                  >
                    <option value="all">All Users</option>
                    <option value="business_owners">Business Owners</option>
                    <option value="coaches">Coaches</option>
                    <option value="archers">Archers</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Priority (0-100)
                  </label>
                  <input
                    type="number"
                    name="priority"
                    value={formData.priority}
                    onChange={handleChange}
                    min="0"
                    max="100"
                    className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-green-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Background Color (Optional)
                </label>
                <input
                  type="text"
                  name="background_color"
                  value={formData.background_color}
                  onChange={handleChange}
                  placeholder="#F3F4F6 or rgb(243, 244, 246)"
                  className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-green-500"
                />
              </div>

              <div className="space-y-3">
                <label className="flex items-center space-x-3">
                  <input
                    type="checkbox"
                    name="is_featured"
                    checked={formData.is_featured}
                    onChange={handleChange}
                    className="w-4 h-4 text-green-600 focus:ring-green-500"
                  />
                  <span className="text-sm text-gray-700">
                    Featured (Show at top with special styling)
                  </span>
                </label>

                <label className="flex items-center space-x-3">
                  <input
                    type="checkbox"
                    name="is_pinned"
                    checked={formData.is_pinned}
                    onChange={handleChange}
                    className="w-4 h-4 text-green-600 focus:ring-green-500"
                  />
                  <span className="text-sm text-gray-700">
                    Pinned (Always keep at top)
                  </span>
                </label>
              </div>
            </div>
          </div>

          {/* Scheduling */}
          <div>
            <h2 className="text-lg font-semibold mb-4">Scheduling</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Status *
                </label>
                <select
                  name="status"
                  value={formData.status}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-green-500"
                  required
                >
                  <option value="draft">Draft</option>
                  <option value="published">Published</option>
                  <option value="archived">Archived</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Publish Date *
                </label>
                <input
                  type="date"
                  name="publish_date"
                  value={formData.publish_date}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-green-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Expire Date (Optional)
                </label>
                <input
                  type="date"
                  name="expire_date"
                  value={formData.expire_date}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-green-500"
                />
              </div>
            </div>
          </div>

          {/* Submit Buttons */}
          <div className="flex justify-end space-x-3 pt-6 border-t">
            <button
              type="button"
              onClick={() => router.push('/admin/announcements')}
              className="px-6 py-2 border border-gray-300 rounded text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-2 bg-green-600 text-white rounded hover:bg-green-700"
            >
              Create Announcement
            </button>
          </div>
        </div>
      </form>
    </div>
  )
}