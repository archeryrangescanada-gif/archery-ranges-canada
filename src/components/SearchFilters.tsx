'use client'

import { useState } from 'react'

interface FilterState {
  rangeType: string[]
  amenities: string[]
  priceRange: string[]
}

interface SearchFiltersProps {
  onFilterChange: (filters: FilterState) => void
}

export default function SearchFilters({ onFilterChange }: SearchFiltersProps) {
  const [filters, setFilters] = useState<FilterState>({
    rangeType: [],
    amenities: [],
    priceRange: []
  })

  const rangeTypes = [
    { id: 'indoor', label: 'Indoor', icon: '🏢' },
    { id: 'outdoor', label: 'Outdoor', icon: '🌲' },
    { id: '3d', label: '3D Course', icon: '🎯' },
    { id: 'field', label: 'Field Archery', icon: '🏹' }
  ]

  const amenitiesList = [
    { id: 'rentals', label: 'Equipment Rentals', icon: '🎽' },
    { id: 'lessons', label: 'Lessons Available', icon: '👨‍🏫' },
    { id: 'pro_shop', label: 'Pro Shop', icon: '🛒' },
    { id: 'parking', label: 'Parking', icon: '🅿️' },
    { id: 'cafe', label: 'Café', icon: '☕' },
    { id: '3d_course', label: '3D Course', icon: '🦌' }
  ]

  const priceRanges = [
    { id: '$', label: '$', description: 'Budget-friendly' },
    { id: '$$', label: '$$', description: 'Moderate' },
    { id: '$$$', label: '$$$', description: 'Premium' },
    { id: '$$$$', label: '$$$$', description: 'Luxury' }
  ]

  const handleToggle = (category: keyof FilterState, value: string) => {
    const newFilters = { ...filters }
    const index = newFilters[category].indexOf(value)
    
    if (index > -1) {
      newFilters[category].splice(index, 1)
    } else {
      newFilters[category].push(value)
    }
    
    setFilters(newFilters)
    onFilterChange(newFilters)
  }

  const clearFilters = () => {
    const emptyFilters: FilterState = {
      rangeType: [],
      amenities: [],
      priceRange: []
    }
    setFilters(emptyFilters)
    onFilterChange(emptyFilters)
  }

  const activeFilterCount = 
    filters.rangeType.length + 
    filters.amenities.length + 
    filters.priceRange.length

  return (
    <div className="bg-white rounded-xl shadow-lg p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-bold text-gray-900">Filters</h3>
        {activeFilterCount > 0 && (
          <button
            onClick={clearFilters}
            className="text-sm text-green-600 hover:text-green-700 font-medium"
          >
            Clear all ({activeFilterCount})
          </button>
        )}
      </div>

      {/* Range Type */}
      <div className="mb-8">
        <h4 className="font-semibold text-gray-900 mb-4">Range Type</h4>
        <div className="space-y-2">
          {rangeTypes.map(type => (
            <label
              key={type.id}
              className="flex items-center space-x-3 cursor-pointer group"
            >
              <input
                type="checkbox"
                checked={filters.rangeType.includes(type.id)}
                onChange={() => handleToggle('rangeType', type.id)}
                className="w-5 h-5 text-green-600 rounded focus:ring-green-500"
              />
              <span className="flex items-center space-x-2 group-hover:text-green-600">
                <span>{type.icon}</span>
                <span>{type.label}</span>
              </span>
            </label>
          ))}
        </div>
      </div>

      {/* Amenities */}
      <div className="mb-8">
        <h4 className="font-semibold text-gray-900 mb-4">Amenities</h4>
        <div className="space-y-2">
          {amenitiesList.map(amenity => (
            <label
              key={amenity.id}
              className="flex items-center space-x-3 cursor-pointer group"
            >
              <input
                type="checkbox"
                checked={filters.amenities.includes(amenity.id)}
                onChange={() => handleToggle('amenities', amenity.id)}
                className="w-5 h-5 text-green-600 rounded focus:ring-green-500"
              />
              <span className="flex items-center space-x-2 group-hover:text-green-600">
                <span>{amenity.icon}</span>
                <span>{amenity.label}</span>
              </span>
            </label>
          ))}
        </div>
      </div>

      {/* Price Range */}
      <div className="mb-6">
        <h4 className="font-semibold text-gray-900 mb-4">Price Range</h4>
        <div className="space-y-2">
          {priceRanges.map(price => (
            <label
              key={price.id}
              className="flex items-center space-x-3 cursor-pointer group"
            >
              <input
                type="checkbox"
                checked={filters.priceRange.includes(price.id)}
                onChange={() => handleToggle('priceRange', price.id)}
                className="w-5 h-5 text-green-600 rounded focus:ring-green-500"
              />
              <div className="flex items-center justify-between flex-1 group-hover:text-green-600">
                <span className="font-bold">{price.label}</span>
                <span className="text-sm text-gray-500">{price.description}</span>
              </div>
            </label>
          ))}
        </div>
      </div>

      {/* Active Filters Summary */}
      {activeFilterCount > 0 && (
        <div className="mt-6 pt-6 border-t">
          <div className="flex flex-wrap gap-2">
            {filters.rangeType.map(type => {
              const typeInfo = rangeTypes.find(t => t.id === type)
              return (
                <span
                  key={type}
                  className="inline-flex items-center space-x-1 px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm"
                >
                  <span>{typeInfo?.icon}</span>
                  <span>{typeInfo?.label}</span>
                  <button
                    onClick={() => handleToggle('rangeType', type)}
                    className="ml-1 hover:text-green-900"
                  >
                    ×
                  </button>
                </span>
              )
            })}
            {filters.amenities.map(amenity => {
              const amenityInfo = amenitiesList.find(a => a.id === amenity)
              return (
                <span
                  key={amenity}
                  className="inline-flex items-center space-x-1 px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm"
                >
                  <span>{amenityInfo?.icon}</span>
                  <span>{amenityInfo?.label}</span>
                  <button
                    onClick={() => handleToggle('amenities', amenity)}
                    className="ml-1 hover:text-blue-900"
                  >
                    ×
                  </button>
                </span>
              )
            })}
            {filters.priceRange.map(price => (
              <span
                key={price}
                className="inline-flex items-center space-x-1 px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-sm"
              >
                <span>{price}</span>
                <button
                  onClick={() => handleToggle('priceRange', price)}
                  className="ml-1 hover:text-purple-900"
                >
                  ×
                </button>
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}