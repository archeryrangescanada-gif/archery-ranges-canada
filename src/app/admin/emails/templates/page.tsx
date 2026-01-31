'use client'

import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Plus, Search, MoreHorizontal, Edit, Copy, Trash2, FileText, Loader2 } from 'lucide-react'

// DB Type Definition
interface Template {
    id: string
    name: string
    subject: string | null
    preheader: string | null
    category: string | null
    status: string
    updated_at: string
    created_at: string
}

const categories = ['All', 'Newsletter', 'Welcome Series', 'Transactional', 'Cold Outreach']

export default function TemplatesPage() {
    const [templates, setTemplates] = useState<Template[]>([])
    const [loading, setLoading] = useState(true)
    const [activeCategory, setActiveCategory] = useState('All')
    const [searchQuery, setSearchQuery] = useState('')

    const supabase = createClient()

    const fetchTemplates = useCallback(async () => {
        setLoading(true)
        try {
            let query = supabase
                .from('email_templates')
                .select('*')
                .order('updated_at', { ascending: false })

            if (activeCategory !== 'All') {
                query = query.eq('category', activeCategory)
            }

            const { data, error } = await query

            if (error) {
                console.error('Error fetching templates:', error)
            } else {
                setTemplates(data || [])
            }
        } catch (err) {
            console.error('Unexpected error:', err)
        } finally {
            setLoading(false)
        }
    }, [supabase, activeCategory])

    useEffect(() => {
        fetchTemplates()
    }, [fetchTemplates])

    // Client-side search filtering (since text search on multiple fields in simpler with JS for small datasets)
    const filteredTemplates = templates.filter(t => {
        const matchesSearch = (t.name?.toLowerCase() || '').includes(searchQuery.toLowerCase()) ||
            (t.subject?.toLowerCase() || '').includes(searchQuery.toLowerCase())
        return matchesSearch
    })

    return (
        <div className="p-8 space-y-8">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-black text-stone-900">Templates</h1>
                    <p className="text-stone-500 mt-2 font-medium">Manage and build your email layouts</p>
                </div>
                <button className="bg-emerald-600 hover:bg-emerald-700 text-white px-5 py-3 rounded-xl font-bold flex items-center gap-2 shadow-lg shadow-emerald-200 transition-all active:scale-95">
                    <Plus className="w-5 h-5 stroke-[3px]" />
                    Create Template
                </button>
            </div>

            {/* Filters & Search */}
            <div className="flex flex-col lg:flex-row gap-4 justify-between items-start lg:items-center bg-white p-4 rounded-2xl border border-stone-200 shadow-sm">
                <div className="flex gap-2 overflow-x-auto pb-2 lg:pb-0 w-full lg:w-auto no-scrollbar">
                    {categories.map(cat => (
                        <button
                            key={cat}
                            onClick={() => setActiveCategory(cat)}
                            className={`px-4 py-2 rounded-lg text-sm font-bold whitespace-nowrap transition-colors ${activeCategory === cat
                                ? 'bg-stone-900 text-white'
                                : 'bg-stone-50 text-stone-600 hover:bg-stone-100'
                                }`}
                        >
                            {cat}
                        </button>
                    ))}
                </div>

                <div className="relative w-full lg:w-80">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
                    <input
                        type="text"
                        placeholder="Search templates..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 border-2 border-stone-100 rounded-xl focus:border-emerald-500 outline-none font-medium text-stone-800"
                    />
                </div>
            </div>

            {/* Grid */}
            {loading ? (
                <div className="flex items-center justify-center h-64 text-stone-400 gap-2">
                    <Loader2 className="w-6 h-6 animate-spin" />
                    <span className="font-bold">Loading Templates...</span>
                </div>
            ) : filteredTemplates.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-64 text-stone-400 gap-2">
                    <div className="bg-stone-100 p-4 rounded-full mb-2">
                        <FileText className="w-6 h-6 text-stone-300" />
                    </div>
                    <span className="font-bold text-stone-500">No templates found</span>
                    <p className="text-sm">Try adjusting your filters or create a new template.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                    {filteredTemplates.map(template => (
                        <div key={template.id} className="group bg-white rounded-2xl border border-stone-200 shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1 flex flex-col h-full overflow-hidden">
                            {/* Thumbnail Preview Area */}
                            <div className={`h-40 bg-stone-50 relative p-6 flex flex-col items-center justify-center border-b border-stone-100`}>
                                {/* Mock skeleton UI for thumbnail - could be replaced with real thumbnail IMG if available */}
                                <div className="w-3/4 h-full bg-white rounded-lg shadow-sm p-3 opacity-90 scale-100 group-hover:scale-105 transition-transform duration-500">
                                    <div className="h-2 w-1/3 bg-stone-200 rounded mb-2"></div>
                                    <div className="h-2 w-full bg-stone-100 rounded mb-1"></div>
                                    <div className="h-2 w-2/3 bg-stone-100 rounded mb-3"></div>
                                    <div className="h-16 w-full bg-stone-50 rounded border border-stone-100"></div>
                                </div>

                                <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <button className="bg-white p-2 rounded-lg shadow-sm hover:text-emerald-600 transition-colors">
                                        <MoreHorizontal className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>

                            <div className="p-6 flex-1 flex flex-col">
                                <div className="flex justify-between items-start mb-2">
                                    <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded-md ${template.category === 'Newsletter' ? 'bg-blue-50 text-blue-700' :
                                            template.category === 'Transactional' ? 'bg-orange-50 text-orange-700' :
                                                'bg-stone-100 text-stone-600'
                                        }`}>
                                        {template.category || 'General'}
                                    </span>
                                    {template.status === 'draft' && (
                                        <span className="text-[10px] font-bold text-stone-400 bg-stone-50 px-2 py-1 rounded-md">Draft</span>
                                    )}
                                </div>

                                <h3 className="text-lg font-bold text-stone-900 mb-1 leading-tight">{template.name}</h3>
                                <div className="flex items-center gap-1.5 text-stone-400 text-xs mb-4">
                                    <FileText className="w-3 h-3" />
                                    <span className="truncate max-w-[200px]">{template.subject || 'No Subject'}</span>
                                </div>

                                <div className="mt-auto pt-4 border-t border-stone-100 flex items-center justify-between">
                                    <span className="text-xs font-bold text-stone-400">
                                        Edited {new Date(template.updated_at).toLocaleDateString()}
                                    </span>
                                    <div className="flex gap-1">
                                        <button className="p-2 text-stone-400 hover:text-stone-900 hover:bg-stone-100 rounded-lg transition-colors" title="Duplicate">
                                            <Copy className="w-4 h-4" />
                                        </button>
                                        <button className="p-2 text-stone-400 hover:bg-red-50 hover:text-red-600 rounded-lg transition-colors" title="Delete">
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                        <button className="px-3 py-1.5 bg-stone-900 text-white text-xs font-bold rounded-lg hover:bg-emerald-600 transition-colors flex items-center gap-1">
                                            <Edit className="w-3 h-3" /> Edit
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    )
}
