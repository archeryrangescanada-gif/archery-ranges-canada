'use client'

import { useState } from 'react'
import { MapPin, Loader2, CheckCircle, XCircle } from 'lucide-react'

export default function AdminToolsPage() {
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<any>(null)

  const handleGeocodeClick = async () => {
    if (!confirm('This will geocode all listings that are missing latitude/longitude. Continue?')) {
      return
    }

    setLoading(true)
    setResult(null)

    try {
      const response = await fetch('/api/admin/geocode-missing', {
        method: 'POST'
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to geocode listings')
      }

      setResult(data)
    } catch (error: any) {
      setResult({
        error: error.message || 'An error occurred'
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Admin Tools</h1>
        <p className="text-gray-600 mt-2">Maintenance and batch operations</p>
      </div>

      {/* Geocoding Tool */}
      <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
        <div className="flex items-start gap-4">
          <div className="p-3 bg-blue-50 rounded-lg">
            <MapPin className="w-6 h-6 text-blue-600" />
          </div>
          <div className="flex-1">
            <h2 className="text-xl font-bold text-gray-900 mb-2">Geocode Missing Listings</h2>
            <p className="text-gray-600 mb-4">
              Automatically add latitude/longitude coordinates to listings that don't have them.
              This enables maps to display on listing detail pages.
            </p>

            <button
              onClick={handleGeocodeClick}
              disabled={loading}
              className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Geocoding...
                </>
              ) : (
                <>
                  <MapPin className="w-4 h-4" />
                  Run Geocoding
                </>
              )}
            </button>

            {/* Results */}
            {result && (
              <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                {result.error ? (
                  <div className="flex items-start gap-3 text-red-600">
                    <XCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="font-semibold">Error</p>
                      <p className="text-sm">{result.error}</p>
                    </div>
                  </div>
                ) : (
                  <div>
                    <div className="flex items-start gap-3 text-green-600 mb-4">
                      <CheckCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="font-semibold">{result.message}</p>
                        <p className="text-sm text-gray-600">
                          Total: {result.total} | Successful: {result.successful} | Failed: {result.failed}
                        </p>
                      </div>
                    </div>

                    {/* Detailed Results */}
                    {result.results && result.results.length > 0 && (
                      <div className="mt-4 space-y-2">
                        <p className="text-sm font-semibold text-gray-700">Details:</p>
                        {result.results.map((item: any, idx: number) => (
                          <div
                            key={idx}
                            className={`text-sm p-2 rounded ${
                              item.status === 'success'
                                ? 'bg-green-50 text-green-800'
                                : 'bg-red-50 text-red-800'
                            }`}
                          >
                            <span className="font-medium">{item.name}</span>
                            {item.status === 'success' ? (
                              <span className="ml-2 text-xs">
                                ({item.latitude?.toFixed(6)}, {item.longitude?.toFixed(6)})
                              </span>
                            ) : (
                              <span className="ml-2 text-xs">- {item.error}</span>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Future tools can go here */}
      <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100 opacity-50">
        <div className="flex items-start gap-4">
          <div className="p-3 bg-gray-100 rounded-lg">
            <MapPin className="w-6 h-6 text-gray-400" />
          </div>
          <div className="flex-1">
            <h2 className="text-xl font-bold text-gray-400 mb-2">More Tools Coming Soon</h2>
            <p className="text-gray-400">
              Additional admin tools and maintenance operations will be added here.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
