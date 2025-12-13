'use client'
import { useState } from 'react'
import { Upload, FileText, CheckCircle, XCircle, AlertCircle, Download, Loader2 } from 'lucide-react'

interface UploadStats {
  totalRows: number
  parsed: number
  valid: number
  invalid: number
  inserted?: number
  updated?: number
  failed?: number
  newRanges?: number
  existingRanges?: number
  newCities?: number
  newProvinces?: number
}

interface PreviewData {
  newRanges: string[]
  existingRanges: string[]
  newCities: string[]
  newProvinces: string[]
}

interface UploadError {
  range?: string
  error?: string
  errors?: string[]
}

export default function ImportCSVPage() {
  const [file, setFile] = useState<File | null>(null)
  const [uploading, setUploading] = useState(false)
  const [previewing, setPreviewing] = useState(false)
  const [updateExisting, setUpdateExisting] = useState(false)
  const [uploadComplete, setUploadComplete] = useState(false)
  const [previewMode, setPreviewMode] = useState(false)
  const [stats, setStats] = useState<UploadStats | null>(null)
  const [preview, setPreview] = useState<PreviewData | null>(null)
  const [errors, setErrors] = useState<UploadError[]>([])
  const [parseErrors, setParseErrors] = useState<string[]>([])

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0]
    if (selectedFile) {
      setFile(selectedFile)
      // Reset states when new file is selected
      setUploadComplete(false)
      setPreviewMode(false)
      setStats(null)
      setPreview(null)
      setErrors([])
      setParseErrors([])
    }
  }

  const handlePreview = async () => {
    if (!file) return

    setPreviewing(true)
    setErrors([])
    setParseErrors([])

    const formData = new FormData()
    formData.append('file', file)
    formData.append('previewOnly', 'true')

    try {
      const response = await fetch('/api/admin/ranges/upload', {
        method: 'POST',
        body: formData,
      })

      const result = await response.json()

      if (response.ok) {
        setStats(result.stats)
        setPreview(result.preview)
        setPreviewMode(true)
        if (result.parseErrors) setParseErrors(result.parseErrors)
        if (result.validationErrors) setErrors(result.validationErrors)
      } else {
        alert(`Preview failed: ${result.error}`)
      }
    } catch (error) {
      alert('Failed to preview file')
      console.error(error)
    } finally {
      setPreviewing(false)
    }
  }

  const handleUpload = async () => {
    if (!file) return

    if (!confirm('Are you sure you want to import these ranges? This will add data to your database.')) {
      return
    }

    setUploading(true)
    setErrors([])
    setParseErrors([])

    const formData = new FormData()
    formData.append('file', file)
    formData.append('updateExisting', updateExisting.toString())
    formData.append('previewOnly', 'false')

    try {
      const response = await fetch('/api/admin/ranges/upload', {
        method: 'POST',
        body: formData,
      })

      const result = await response.json()

      if (response.ok) {
        setStats(result.stats)
        setUploadComplete(true)
        setPreviewMode(false)
        if (result.parseErrors) setParseErrors(result.parseErrors)
        if (result.validationErrors) setErrors([...errors, ...result.validationErrors])
        if (result.importErrors) setErrors([...errors, ...result.importErrors])
      } else {
        alert(`Upload failed: ${result.error}`)
        if (result.details) console.error(result.details)
      }
    } catch (error) {
      alert('Failed to upload file')
      console.error(error)
    } finally {
      setUploading(false)
    }
  }

  const downloadSampleCSV = () => {
    const sampleData = `post_title,post_address,post_city,post_region,post_country,post_zip,post_latitude,post_longitude,phone,email,website,post_content,post_tags,business_hours,range_length_yards,number_of_lanes,facility_type,has_pro_shop,has_3d_course,has_field_course,membership_required,membership_price_adult,drop_in_price,equipment_rental_available,lessons_available,lesson_price_range,bow_types_allowed,accessibility,parking_available
Sample Archery Range,123 Main St,Toronto,Ontario,Canada,M5V 1A1,43.6532,-79.3832,416-555-1234,info@sample.com,https://sample.com,A great archery range in downtown Toronto,"archery, indoor, toronto",{"monday": "9am-5pm"},30,10,Indoor,Yes,No,No,Yes,100,15,Yes,Yes,$50-100,"Recurve, Compound",Wheelchair accessible,Yes`

    const blob = new Blob([sampleData], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'sample-ranges.csv'
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    window.URL.revokeObjectURL(url)
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Import Ranges from CSV</h1>
        <p className="text-gray-600 mt-2">Upload and import archery range data in bulk</p>
      </div>

      {/* Instructions Card */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-6">
        <h2 className="text-lg font-semibold text-blue-900 mb-3 flex items-center">
          <AlertCircle className="w-5 h-5 mr-2" />
          How to Import CSV Data
        </h2>
        <ol className="list-decimal list-inside space-y-2 text-blue-800">
          <li>Prepare your CSV file with the required columns (download sample below)</li>
          <li>Click "Preview Import" to validate your data before importing</li>
          <li>Review the preview statistics and any errors</li>
          <li>Click "Import to Database" to complete the import</li>
        </ol>
        <button
          onClick={downloadSampleCSV}
          className="mt-4 flex items-center text-blue-600 hover:text-blue-800 font-medium"
        >
          <Download className="w-4 h-4 mr-2" />
          Download Sample CSV Template
        </button>
      </div>

      {/* Upload Section */}
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <h2 className="text-xl font-semibold mb-4">Upload CSV File</h2>

        {/* File Input */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Select CSV File
          </label>
          <div className="flex items-center space-x-4">
            <label className="flex-1 flex items-center justify-center px-6 py-4 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-green-500 hover:bg-green-50 transition-colors">
              <div className="text-center">
                <FileText className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                <span className="text-sm text-gray-600">
                  {file ? file.name : 'Click to select CSV file'}
                </span>
                <input
                  type="file"
                  accept=".csv"
                  onChange={handleFileChange}
                  className="hidden"
                />
              </div>
            </label>
          </div>
          {file && (
            <p className="text-sm text-gray-500 mt-2">
              File size: {(file.size / 1024).toFixed(2)} KB
            </p>
          )}
        </div>

        {/* Options */}
        <div className="mb-6">
          <label className="flex items-center space-x-2">
            <input
              type="checkbox"
              checked={updateExisting}
              onChange={(e) => setUpdateExisting(e.target.checked)}
              className="rounded border-gray-300 text-green-600 focus:ring-green-500"
            />
            <span className="text-sm text-gray-700">
              Update existing ranges (if slug matches)
            </span>
          </label>
        </div>

        {/* Action Buttons */}
        <div className="flex space-x-4">
          <button
            onClick={handlePreview}
            disabled={!file || previewing || uploading}
            className="flex items-center px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed"
          >
            {previewing ? (
              <>
                <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                Previewing...
              </>
            ) : (
              <>
                <AlertCircle className="w-5 h-5 mr-2" />
                Preview Import
              </>
            )}
          </button>

          <button
            onClick={handleUpload}
            disabled={!file || uploading || previewing}
            className="flex items-center px-6 py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:bg-gray-300 disabled:cursor-not-allowed"
          >
            {uploading ? (
              <>
                <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                Importing...
              </>
            ) : (
              <>
                <Upload className="w-5 h-5 mr-2" />
                Import to Database
              </>
            )}
          </button>
        </div>
      </div>

      {/* Preview Statistics */}
      {previewMode && stats && (
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4 flex items-center">
            <AlertCircle className="w-5 h-5 mr-2 text-blue-600" />
            Import Preview
          </h2>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-blue-50 p-4 rounded">
              <div className="text-2xl font-bold text-blue-600">{stats.totalRows}</div>
              <div className="text-sm text-gray-600">Total Rows</div>
            </div>
            <div className="bg-green-50 p-4 rounded">
              <div className="text-2xl font-bold text-green-600">{stats.valid}</div>
              <div className="text-sm text-gray-600">Valid Ranges</div>
            </div>
            <div className="bg-purple-50 p-4 rounded">
              <div className="text-2xl font-bold text-purple-600">{stats.newRanges || 0}</div>
              <div className="text-sm text-gray-600">New Ranges</div>
            </div>
            <div className="bg-yellow-50 p-4 rounded">
              <div className="text-2xl font-bold text-yellow-600">{stats.existingRanges || 0}</div>
              <div className="text-sm text-gray-600">Existing Ranges</div>
            </div>
          </div>

          {preview && (
            <div className="space-y-4">
              {preview.newProvinces.length > 0 && (
                <div className="bg-blue-50 p-4 rounded">
                  <h3 className="font-semibold text-blue-900 mb-2">New Provinces ({preview.newProvinces.length})</h3>
                  <p className="text-sm text-blue-700">{preview.newProvinces.join(', ')}</p>
                </div>
              )}

              {preview.newCities.length > 0 && (
                <div className="bg-purple-50 p-4 rounded">
                  <h3 className="font-semibold text-purple-900 mb-2">New Cities ({preview.newCities.length})</h3>
                  <p className="text-sm text-purple-700">{preview.newCities.join(', ')}</p>
                </div>
              )}

              {preview.newRanges.length > 0 && (
                <div className="bg-green-50 p-4 rounded">
                  <h3 className="font-semibold text-green-900 mb-2">Sample New Ranges (showing up to 10)</h3>
                  <ul className="text-sm text-green-700 list-disc list-inside">
                    {preview.newRanges.map((range, idx) => (
                      <li key={idx}>{range}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Upload Results */}
      {uploadComplete && stats && (
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4 flex items-center">
            <CheckCircle className="w-5 h-5 mr-2 text-green-600" />
            Import Complete
          </h2>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-green-50 p-4 rounded">
              <div className="text-2xl font-bold text-green-600">{stats.inserted || 0}</div>
              <div className="text-sm text-gray-600">Inserted</div>
            </div>
            <div className="bg-blue-50 p-4 rounded">
              <div className="text-2xl font-bold text-blue-600">{stats.updated || 0}</div>
              <div className="text-sm text-gray-600">Updated</div>
            </div>
            <div className="bg-red-50 p-4 rounded">
              <div className="text-2xl font-bold text-red-600">{stats.failed || 0}</div>
              <div className="text-sm text-gray-600">Failed</div>
            </div>
            <div className="bg-purple-50 p-4 rounded">
              <div className="text-2xl font-bold text-purple-600">{stats.valid}</div>
              <div className="text-sm text-gray-600">Valid</div>
            </div>
          </div>
        </div>
      )}

      {/* Errors */}
      {(errors.length > 0 || parseErrors.length > 0) && (
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4 flex items-center text-red-600">
            <XCircle className="w-5 h-5 mr-2" />
            Errors & Warnings
          </h2>

          {parseErrors.length > 0 && (
            <div className="mb-4">
              <h3 className="font-semibold text-gray-800 mb-2">Parse Errors</h3>
              <div className="bg-red-50 p-4 rounded max-h-60 overflow-y-auto">
                {parseErrors.map((error, idx) => (
                  <div key={idx} className="text-sm text-red-700 mb-1">
                    {error}
                  </div>
                ))}
              </div>
            </div>
          )}

          {errors.length > 0 && (
            <div>
              <h3 className="font-semibold text-gray-800 mb-2">Validation & Import Errors</h3>
              <div className="bg-yellow-50 p-4 rounded max-h-60 overflow-y-auto">
                {errors.map((error, idx) => (
                  <div key={idx} className="text-sm text-yellow-800 mb-2 pb-2 border-b border-yellow-200 last:border-b-0">
                    <div className="font-medium">{error.range || 'Unknown Range'}</div>
                    {error.error && <div className="text-yellow-700">{error.error}</div>}
                    {error.errors && (
                      <ul className="list-disc list-inside text-yellow-700 ml-2">
                        {error.errors.map((err, i) => (
                          <li key={i}>{err}</li>
                        ))}
                      </ul>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
