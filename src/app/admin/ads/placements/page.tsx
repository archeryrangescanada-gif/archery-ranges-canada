'use client'
import { useEffect, useState } from 'react'
import { Plus, Edit, Trash2, Save, X, DollarSign, Globe, MapPin, Layout } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

interface Placement {
    id: string
    name: string
    page_pattern: string
    position: string
    base_price: number
    current_price: number
    multiplier: number
    is_active: boolean
}

interface Province {
    id: string
    name: string
    slug: string
}

type PlacementScope = 'global' | 'homepage' | 'province' | 'all_listings' | 'custom'

export default function PlacementsPage() {
    const [placements, setPlacements] = useState<Placement[]>([])
    const [provinces, setProvinces] = useState<Province[]>([])
    const [loading, setLoading] = useState(true)
    const [editingId, setEditingId] = useState<string | null>(null)
    const [isCreating, setIsCreating] = useState(false)
    const supabase = createClient()

    // Form State
    const [formData, setFormData] = useState<Partial<Placement>>({})
    const [scope, setScope] = useState<PlacementScope>('global')
    const [selectedProvince, setSelectedProvince] = useState('')

    useEffect(() => {
        fetchPlacements()
        fetchProvinces()
    }, [])

    const fetchPlacements = async () => {
        const { data, error } = await supabase.from('ad_placements').select('*').order('name')
        if (data) setPlacements(data)
        setLoading(false)
    }

    const fetchProvinces = async () => {
        const { data } = await supabase.from('provinces').select('id, name, slug').order('name')
        if (data) setProvinces(data)
    }

    const generatePattern = (s: PlacementScope, prov: string, custom: string) => {
        switch (s) {
            case 'global': return '*'
            case 'homepage': return '/'
            case 'all_listings': return '/*/*/*' // Covers /province/city/range
            case 'province': return `/${prov}*`
            case 'custom': return custom
            default: return '*'
        }
    }

    const startCreate = () => {
        setFormData({
            name: '',
            position: 'top',
            base_price: 10.00,
            multiplier: 1.0,
            is_active: true,
            page_pattern: '*'
        })
        setScope('global')
        setSelectedProvince('')
        setIsCreating(true)
        setEditingId(null)
    }

    const startEdit = (p: Placement) => {
        setFormData(p)
        // Attempt to reverse-engineer scope
        if (p.page_pattern === '*') setScope('global')
        else if (p.page_pattern === '/') setScope('homepage')
        else if (p.page_pattern === '/*/*/*') setScope('all_listings')
        else if (p.page_pattern.startsWith('/') && p.page_pattern.endsWith('*') && p.page_pattern.length > 2) {
            setScope('province')
            setSelectedProvince(p.page_pattern.replace('/', '').replace('*', ''))
        } else {
            setScope('custom')
        }

        setEditingId(p.id)
        setIsCreating(false)
    }

    const handleSave = async () => {
        if (!formData.name) return alert('Name is required')

        // Finalize Pattern
        const finalPattern = generatePattern(scope, selectedProvince, formData.page_pattern || '')

        const payload = {
            name: formData.name,
            position: formData.position,
            base_price: formData.base_price,
            multiplier: formData.multiplier,
            is_active: formData.is_active,
            page_pattern: finalPattern
        }

        try {
            if (editingId) {
                const { error } = await supabase.from('ad_placements').update(payload).eq('id', editingId)
                if (error) throw error
            } else {
                const { error } = await supabase.from('ad_placements').insert(payload)
                if (error) throw error
            }

            await fetchPlacements()
            cancelForm()
        } catch (error: any) {
            alert('Error saving: ' + error.message)
        }
    }

    const cancelForm = () => {
        setEditingId(null)
        setIsCreating(false)
        setFormData({})
    }

    const handleDelete = async (id: string) => {
        if (!confirm('Delete this placement?')) return
        const { error } = await supabase.from('ad_placements').delete().eq('id', id)
        if (!error) setPlacements(placements.filter(p => p.id !== id))
    }

    if (loading) return <div className="p-8">Loading...</div>

    return (
        <div className="p-8">
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Ad Placements</h1>
                    <p className="text-gray-600 mt-2">Manage where ads appear on your site.</p>
                </div>
                {!isCreating && !editingId && (
                    <button onClick={startCreate} className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 flex items-center">
                        <Plus className="w-5 h-5 mr-2" />
                        New Placement
                    </button>
                )}
            </div>

            {/* Edit/Create Form */}
            {(isCreating || editingId) && (
                <div className="bg-white p-6 rounded-lg shadow mb-8 border border-green-200">
                    <h3 className="text-lg font-bold mb-4">{isCreating ? 'Create New Placement' : 'Edit Placement'}</h3>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Left Col: Basics */}
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Placement Name</label>
                                <input
                                    type="text"
                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm border p-2"
                                    placeholder="e.g. Homepage Hero"
                                    value={formData.name || ''}
                                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700">Page Position</label>
                                <select
                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm border p-2"
                                    value={formData.position || 'top'}
                                    onChange={e => setFormData({ ...formData, position: e.target.value })}
                                >
                                    <option value="top">Top Banner (Header)</option>
                                    <option value="right">Right Sidebar</option>
                                    <option value="content_middle">In-Content (Middle)</option>
                                    <option value="bottom">Bottom Banner (Footer)</option>
                                </select>
                            </div>

                            <div className="flex space-x-4">
                                <div className="flex-1">
                                    <label className="block text-sm font-medium text-gray-700">Base Price ($)</label>
                                    <input
                                        type="number"
                                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm border p-2"
                                        value={formData.base_price || 0}
                                        onChange={e => setFormData({ ...formData, base_price: parseFloat(e.target.value) })}
                                    />
                                </div>
                                <div className="flex-1">
                                    <label className="block text-sm font-medium text-gray-700">Surge Multiplier</label>
                                    <input
                                        type="number"
                                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm border p-2"
                                        step="0.1"
                                        value={formData.multiplier || 1.0}
                                        onChange={e => setFormData({ ...formData, multiplier: parseFloat(e.target.value) })}
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Right Col: Scope Logic */}
                        <div className="space-y-4 bg-gray-50 p-4 rounded">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Where should this ad appear?</label>
                                <div className="space-y-2">
                                    <label className="flex items-center space-x-2 p-2 rounded hover:bg-white cursor-pointer ring-1 ring-transparent hover:ring-gray-200 text-gray-900">
                                        <input
                                            type="radio"
                                            checked={scope === 'global'}
                                            onChange={() => setScope('global')}
                                            className="text-green-600"
                                        />
                                        <Globe className="w-4 h-4 text-gray-500" />
                                        <span><strong>Everywhere</strong> (Global Site-wide)</span>
                                    </label>

                                    <label className="flex items-center space-x-2 p-2 rounded hover:bg-white cursor-pointer ring-1 ring-transparent hover:ring-gray-200 text-gray-900">
                                        <input
                                            type="radio"
                                            checked={scope === 'homepage'}
                                            onChange={() => setScope('homepage')}
                                            className="text-green-600"
                                        />
                                        <Layout className="w-4 h-4 text-gray-500" />
                                        <span><strong>Homepage Only</strong></span>
                                    </label>

                                    <label className="flex items-center space-x-2 p-2 rounded hover:bg-white cursor-pointer ring-1 ring-transparent hover:ring-gray-200 text-gray-900">
                                        <input
                                            type="radio"
                                            checked={scope === 'province'}
                                            onChange={() => setScope('province')}
                                            className="text-green-600"
                                        />
                                        <MapPin className="w-4 h-4 text-gray-500" />
                                        <span><strong>Specific Region</strong> (Entire Province)</span>
                                    </label>

                                    {scope === 'province' && (
                                        <div className="ml-8 mt-1">
                                            <select
                                                className="w-full text-sm border-gray-300 rounded p-1 text-gray-900"
                                                value={selectedProvince}
                                                onChange={e => setSelectedProvince(e.target.value)}
                                            >
                                                <option value="">Select a Province...</option>
                                                {provinces.map(p => (
                                                    <option key={p.id} value={p.slug}>{p.name}</option>
                                                ))}
                                            </select>
                                        </div>
                                    )}

                                    <label className="flex items-center space-x-2 p-2 rounded hover:bg-white cursor-pointer ring-1 ring-transparent hover:ring-gray-200 text-gray-900">
                                        <input
                                            type="radio"
                                            checked={scope === 'all_listings'}
                                            onChange={() => setScope('all_listings')}
                                            className="text-green-600"
                                        />
                                        <Layout className="w-4 h-4 text-gray-500" />
                                        <span><strong>All Listing Pages</strong> (Any Range)</span>
                                    </label>

                                    <label className="flex items-center space-x-2 p-2 rounded hover:bg-white cursor-pointer ring-1 ring-transparent hover:ring-gray-200 text-gray-900">
                                        <input
                                            type="radio"
                                            checked={scope === 'custom'}
                                            onChange={() => setScope('custom')}
                                            className="text-green-600"
                                        />
                                        <span><strong>Custom Pattern</strong> (Advanced)</span>
                                    </label>

                                    {scope === 'custom' && (
                                        <input
                                            type="text"
                                            className="ml-8 w-64 text-sm border-gray-300 rounded p-1 text-gray-900"
                                            placeholder="e.g. /blog/*"
                                            value={formData.page_pattern || ''}
                                            onChange={e => setFormData({ ...formData, page_pattern: e.target.value })}
                                        />
                                    )}
                                </div>
                            </div>

                            <div className="text-sm text-gray-500 mt-4 border-t pt-2">
                                <strong>Preview Pattern:</strong>
                                <code className="ml-2 bg-gray-200 px-1 rounded">
                                    {generatePattern(scope, selectedProvince, formData.page_pattern || '')}
                                </code>
                            </div>
                        </div>
                    </div>

                    <div className="mt-6 flex justify-end space-x-3">
                        <button onClick={cancelForm} className="px-4 py-2 text-gray-600 hover:text-gray-900">Cancel</button>
                        <button onClick={handleSave} className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 shadow-sm">Save Placement</button>
                    </div>
                </div>
            )}

            {/* List */}
            <div className="bg-white rounded-lg shadow overflow-hidden">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Placement Name</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Target Scope</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Pricing</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {placements.length === 0 ? (
                            <tr><td colSpan={5} className="px-6 py-8 text-center text-gray-500">No placements defined. Create one above!</td></tr>
                        ) : (
                            placements.map(placement => (
                                <tr key={placement.id}>
                                    <td className="px-6 py-4">
                                        <div className="font-medium text-gray-900">{placement.name}</div>
                                        <div className="text-xs text-gray-500 uppercase">{placement.position}</div>
                                    </td>
                                    <td className="px-6 py-4 text-sm text-gray-600">
                                        {placement.page_pattern === '*' && <span className="flex items-center"><Globe className="w-3 h-3 mr-1" /> Global</span>}
                                        {placement.page_pattern === '/' && <span className="flex items-center"><Layout className="w-3 h-3 mr-1" /> Homepage</span>}
                                        {placement.page_pattern.startsWith('/') && placement.page_pattern.endsWith('*') && placement.page_pattern !== '/*/*/*' && (
                                            <span className="flex items-center text-blue-600"><MapPin className="w-3 h-3 mr-1" /> {placement.page_pattern.replace(/\//g, '').replace(/\*/g, '').toUpperCase()}</span>
                                        )}
                                        {!['*', '/'].includes(placement.page_pattern) && !(placement.page_pattern.startsWith('/') && placement.page_pattern.endsWith('*')) && (
                                            <code className="bg-gray-100 px-1 rounded">{placement.page_pattern}</code>
                                        )}
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="text-sm">
                                            ${placement.base_price}<span className="text-xs text-gray-400"> (base)</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={`px-2 py-1 text-xs rounded-full ${placement.is_active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                                            {placement.is_active ? 'Active' : 'Hidden'}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 flex space-x-2">
                                        <button onClick={() => startEdit(placement)} className="text-blue-600 hover:text-blue-800">
                                            <Edit className="w-4 h-4" />
                                        </button>
                                        <button onClick={() => handleDelete(placement.id)} className="text-red-600 hover:text-red-800">
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    )
}
