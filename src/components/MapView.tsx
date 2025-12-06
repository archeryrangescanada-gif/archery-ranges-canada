'use client'

import { useEffect, useRef } from 'react'

interface Range {
  id: string
  name: string
  slug: string
  latitude: number | null
  longitude: number | null
  address: string
  range_type: string
  city?: {
    name: string
    slug: string
    province?: {
      slug: string
    }
  }
}

interface MapViewProps {
  ranges: Range[]
  centerLat?: number
  centerLng?: number
  zoom?: number
}

export default function MapView({ 
  ranges, 
  centerLat = 43.6532, 
  centerLng = -79.3832, 
  zoom = 10 
}: MapViewProps) {
  const mapRef = useRef<HTMLDivElement>(null)
  const mapInstanceRef = useRef<any>(null)

  useEffect(() => {
    // This is a placeholder for actual map integration
    // You would integrate Google Maps, Mapbox, or Leaflet here
    
    if (!mapRef.current) return

    // For now, we'll show a placeholder with range locations
    console.log('Map would render with these ranges:', ranges)

    return () => {
      if (mapInstanceRef.current) {
        // Cleanup map instance
      }
    }
  }, [ranges])

  const rangesWithCoords = ranges.filter(r => r.latitude && r.longitude)

  return (
    <div className="relative w-full h-96 bg-gray-200 rounded-xl overflow-hidden">
      {/* Map Container */}
      <div ref={mapRef} className="w-full h-full" />

      {/* Placeholder Content */}
      <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-green-100 to-green-200">
        <div className="text-center p-8">
          <span className="text-6xl mb-4 block">🗺️</span>
          <h3 className="text-2xl font-bold text-gray-800 mb-2">Interactive Map</h3>
          <p className="text-gray-600 mb-4">
            Showing {rangesWithCoords.length} ranges with coordinates
          </p>
          <p className="text-sm text-gray-500">
            Map integration requires API key setup
          </p>
        </div>
      </div>

      {/* Range List Overlay */}
      <div className="absolute bottom-4 left-4 right-4 bg-white rounded-lg shadow-lg p-4 max-h-48 overflow-y-auto">
        <h4 className="font-semibold mb-3">Ranges on Map:</h4>
        <div className="space-y-2">
          {rangesWithCoords.map((range, index) => (
            <div key={range.id} className="flex items-start space-x-3 text-sm">
              <span className="flex-shrink-0 w-6 h-6 bg-green-600 text-white rounded-full flex items-center justify-center text-xs">
                {index + 1}
              </span>
              <div>
                <p className="font-medium text-gray-900">{range.name}</p>
                <p className="text-gray-500 text-xs">
                  {range.range_type} • {range.city?.name}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}