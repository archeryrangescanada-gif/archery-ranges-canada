// src/app/admin/ads/new/page.tsx
'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Upload, X } from 'lucide-react'

export default function NewAdPage() {
  const router = useRouter()
  const [formData, setFormData] = useState({
    title: '',
    advertiser_name: '',
    ad_type: 'image',
    click_url: '',
    size_preset: 'leaderboard',
    width: 970,
    height: 250,
    start_date: '',
    end_date: '',
    impression_limit: '',
    click_limit: '',
    daily_budget: '',
    priority: 0,
    status: 'draft',
    target_provinces: [] as string[],
    html_content: ''
  })
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string>('')
  const [selectedPlacements, setSelectedPlacements] = useState<string[]>([])

  const sizePresets = {
    leaderboard: { width: 970, height: 250 },
    banner: { width: 728, height: 90 },
    rectangle: { width: 300, height: 250 },
    sidebar: { width: 300, height: 600 },
    mobile_banner: { width: 320, height: 50 },
    custom: { width: 0, height: 0 }
  }

  const placements = [
    { id: 'homepage_header', name: 'Homepage Header' },
    { id: 'homepage_sidebar_top', name: 'Homepage Sidebar Top' },
    { id: 'listing_page_header', name: 'Listing Page Header' },
    { id: 'province_page_header', name: 'Province Page Header' },
    { id: 'sidebar_top', name: 'Sidebar Top' }
  ]

  const provinces = [
    'Alberta', 'British Columbia', 'Manitoba', 'New Brunswick',
    'Newfoundland and Labrador', 'Nova Scotia', 'Ontario',
    'Prince Edward Island', 'Quebec', 'Saskatchewan'
  ]

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))

    if (name === 'size_preset' && value !== 'custom') {
      const preset = sizePresets[value as keyof typeof sizePresets]
      setFormData(prev => ({
        ...prev,
        width: preset.width,
        height: preset.height
      }))
    }
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

  const togglePlacement = (placementId: string) => {
    setSelectedPlacements(prev =>
      prev.includes(placementId)
        ? prev.filter(id => id !== placementId)
        : [...prev, placementId]
    )
  }

  const toggleProvince = (province: string) => {
    setFormData(prev => ({
      ...prev,
      target_provinces: prev.target_provinces.includes(province)
        ? prev.target_provinces.filter(p => p !== province)
        : [...prev.target_provinces, province]
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    // TODO: 
    // 1. Upload image to Supabase Storage
    // 2. Create ad record in Supabase
    // 3. Create placement assignments
    // 4. Redirect to ads list

    console.log('Form Data:', formData)
    console.log('Image File:', imageFile)
    console.log('Placements:', selectedPlacements)

    alert('Ad created successfully!')
    router.push('/admin/ads')
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Create New Ad</h1>
        <p className="text-gray-600 mt-2">Set up a new advertising campaign</p>
      </div>

      <form onSubmit={handleSubmit} className="max-w-4xl">
        <div className="bg-white rounded-lg shadow p-6 space-y-6">
          {/* Basic Information */}
          <div>
            <h2 className="text-lg font-semibold mb-4">Basic Information</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Campaign Title *
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
                  Advertiser Name *
                </label>
                <input
                  type="text"
                  name="advertiser_name"
                  value={formData.advertiser_name}
                  onChange={handleChange}
                  placeholder="e.g., Hoyt Archery"
                  className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-green-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Ad Type *
                </label>
                <select
                  name="ad_type"
                  value={formData.ad_type}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-green-500"
                  required
                >
                  <option value="image">Image</option>
                  <option value="html">HTML</option>
                  <option value="video">Video</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Click URL *
                </label>
                <input
                  type="url"
                  name="click_url"
                  value={formData.click_url}
                  onChange={handleChange}
                  placeholder="https://example.com"
                  className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-green-500"
                  required
                />
              </div>
            </div>
          </div>

          {/* Ad Content */}
          <div>
            <h2 className="text-lg font-semibold mb-4">Ad Content</h2>
            {formData.ad_type === 'image' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Upload Image
                </label>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6">
                  {imagePreview ? (
                    <div className="relative">
                      <img src={imagePreview} alt="Preview" className="max-w-full h-auto" />
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
            )}

            {formData.ad_type === 'html' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  HTML Code
                </label>
                <textarea
                  name="html_content"
                  value={formData.html_content}
                  onChange={handleChange}
                  rows={10}
                  className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-green-500 font-mono text-sm"
                  placeholder="<div>Your HTML code here</div>"
                />
              </div>
            )}
          </div>

          {/* Size Settings */}
          <div>
            <h2 className="text-lg font-semibold mb-4">Size Settings</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Size Preset
                </label>
                <select
                  name="size_preset"
                  value={formData.size_preset}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-green-500"
                >
                  <option value="leaderboard">Leaderboard (970x250)</option>
                  <option value="banner">Banner (728x90)</option>
                  <option value="rectangle">Rectangle (300x250)</option>
                  <option value="sidebar">Sidebar (300x600)</option>
                  <option value="mobile_banner">Mobile Banner (320x50)</option>
                  <option value="custom">Custom Size</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Width (px)
                </label>
                <input
                  type="number"
                  name="width"
                  value={formData.width}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-green-500"
                  disabled={formData.size_preset !== 'custom'}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Height (px)
                </label>
                <input
                  type="number"
                  name="height"
                  value={formData.height}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-green-500"
                  disabled={formData.size_preset !== 'custom'}
                />
              </div>
            </div>
          </div>

          {/* Placements */}
          <div>
            <h2 className="text-lg font-semibold mb-4">Ad Placements *</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {placements.map(placement => (
                <label
                  key={placement.id}
                  className="flex items-center space-x-3 p-3 border rounded hover:bg-gray-50 cursor-pointer"
                >
                  <input
                    type="checkbox"
                    checked={selectedPlacements.includes(placement.id)}
                    onChange={() => togglePlacement(placement.id)}
                    className="w-4 h-4 text-green-600 focus:ring-green-500"
                  />
                  <span className="text-sm text-gray-900">{placement.name}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Scheduling */}
          <div>
            <h2 className="text-lg font-semibold mb-4">Scheduling</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Start Date
                </label>
                <input
                  type="date"
                  name="start_date"
                  value={formData.start_date}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-green-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  End Date
                </label>
                <input
                  type="date"
                  name="end_date"
                  value={formData.end_date}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-green-500"
                />
              </div>
            </div>
          </div>

          {/* Limits & Budget */}
          <div>
            <h2 className="text-lg font-semibold mb-4">Limits & Budget</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Impression Limit
                </label>
                <input
                  type="number"
                  name="impression_limit"
                  value={formData.impression_limit}
                  onChange={handleChange}
                  placeholder="Leave empty for unlimited"
                  className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-green-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Click Limit
                </label>
                <input
                  type="number"
                  name="click_limit"
                  value={formData.click_limit}
                  onChange={handleChange}
                  placeholder="Leave empty for unlimited"
                  className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-green-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Daily Budget (impressions)
                </label>
                <input
                  type="number"
                  name="daily_budget"
                  value={formData.daily_budget}
                  onChange={handleChange}
                  placeholder="Max per day"
                  className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-green-500"
                />
              </div>
            </div>
          </div>

          {/* Targeting */}
          <div>
            <h2 className="text-lg font-semibold mb-4">Geographic Targeting</h2>
            <p className="text-sm text-gray-600 mb-3">Leave empty to target all provinces</p>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
              {provinces.map(province => (
                <label
                  key={province}
                  className="flex items-center space-x-2 text-sm"
                >
                  <input
                    type="checkbox"
                    checked={formData.target_provinces.includes(province)}
                    onChange={() => toggleProvince(province)}
                    className="w-4 h-4 text-green-600 focus:ring-green-500"
                  />
                  <span className="text-gray-700">{province}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Priority & Status */}
          <div>
            <h2 className="text-lg font-semibold mb-4">Settings</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                <p className="text-xs text-gray-500 mt-1">Higher priority ads show first</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Status
                </label>
                <select
                  name="status"
                  value={formData.status}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-green-500"
                >
                  <option value="draft">Draft</option>
                  <option value="active">Active</option>
                  <option value="paused">Paused</option>
                </select>
              </div>
            </div>
          </div>

          {/* Submit Buttons */}
          <div className="flex justify-end space-x-3 pt-6 border-t">
            <button
              type="button"
              onClick={() => router.push('/admin/ads')}
              className="px-6 py-2 border border-gray-300 rounded text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-2 bg-green-600 text-white rounded hover:bg-green-700"
            >
              Create Ad
            </button>
          </div>
        </div>
      </form>
    </div>
  )
}