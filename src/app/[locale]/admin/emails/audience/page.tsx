'use client'

import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Search, Filter, MoreHorizontal, UserPlus, Download, CheckCircle, XCircle, Clock, AlertTriangle, Loader2, X } from 'lucide-react'

// DB Type Definition (simplified)
interface Contact {
    id: string
    first_name: string | null
    last_name: string | null
    email: string
    status: string
    source: string | null
    tags: string[] | null
    last_activity: string | null
    created_at: string
}

export default function AudiencePage() {
    const [contacts, setContacts] = useState<Contact[]>([])
    const [loading, setLoading] = useState(true)
    const [totalCount, setTotalCount] = useState(0)
    const [filterStatus, setFilterStatus] = useState('All')
    const [searchQuery, setSearchQuery] = useState('')
    const [page, setPage] = useState(1)
    const [showAddModal, setShowAddModal] = useState(false)
    const [addingContact, setAddingContact] = useState(false)
    const [newContact, setNewContact] = useState({ first_name: '', last_name: '', email: '', tags: '' })
    const PAGE_SIZE = 10

    const supabase = createClient()

    const fetchContacts = useCallback(async () => {
        setLoading(true)
        try {
            let query = supabase
                .from('email_contacts')
                .select('*', { count: 'exact' })
                .order('created_at', { ascending: false })
                .range((page - 1) * PAGE_SIZE, page * PAGE_SIZE - 1)

            if (filterStatus !== 'All') {
                query = query.eq('status', filterStatus.toLowerCase())
            }

            if (searchQuery) {
                // Simple search on email or name
                query = query.or(`email.ilike.%${searchQuery}%,first_name.ilike.%${searchQuery}%,last_name.ilike.%${searchQuery}%`)
            }

            const { data, error, count } = await query

            if (error) {
                console.error('Error fetching contacts:', error)
            } else {
                setContacts(data || [])
                setTotalCount(count || 0)
            }
        } catch (err) {
            console.error('Unexpected error:', err)
        } finally {
            setLoading(false)
        }
    }, [supabase, filterStatus, searchQuery, page])

    useEffect(() => {
        fetchContacts()
    }, [fetchContacts])

    const handleAddContact = async () => {
        if (!newContact.email) {
            alert('Email is required')
            return
        }
        setAddingContact(true)
        try {
            const tagsArray = newContact.tags ? newContact.tags.split(',').map(t => t.trim()).filter(Boolean) : []
            const { error } = await supabase
                .from('email_contacts')
                .insert([{
                    email: newContact.email,
                    first_name: newContact.first_name || null,
                    last_name: newContact.last_name || null,
                    tags: tagsArray,
                    status: 'active',
                    source: 'manual'
                }])

            if (error) throw error

            setShowAddModal(false)
            setNewContact({ first_name: '', last_name: '', email: '', tags: '' })
            fetchContacts()
        } catch (err: any) {
            console.error('Error adding contact:', err)
            alert(err.message || 'Failed to add contact')
        } finally {
            setAddingContact(false)
        }
    }

    const handleExport = () => {
        // Create CSV content
        const headers = ['Email', 'First Name', 'Last Name', 'Status', 'Source', 'Tags', 'Created At']
        const csvRows = [headers.join(',')]

        contacts.forEach(contact => {
            const row = [
                contact.email,
                contact.first_name || '',
                contact.last_name || '',
                contact.status,
                contact.source || '',
                (contact.tags || []).join(';'),
                contact.created_at
            ].map(val => `"${String(val).replace(/"/g, '""')}"`)
            csvRows.push(row.join(','))
        })

        const csvContent = csvRows.join('\n')
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
        const url = URL.createObjectURL(blob)
        const link = document.createElement('a')
        link.href = url
        link.download = `audience_export_${new Date().toISOString().split('T')[0]}.csv`
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
        URL.revokeObjectURL(url)
    }

    // Debounce search could be added here, currently triggers on effect dependency

    return (
        <div className="p-8 space-y-8">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-black text-stone-900">Audience</h1>
                    <p className="text-stone-500 mt-2 font-medium">Manage contacts, segments, and tags</p>
                </div>
                <div className="flex gap-3">
                    <button
                        onClick={handleExport}
                        disabled={contacts.length === 0}
                        className="bg-white hover:bg-stone-50 text-stone-700 px-5 py-3 rounded-xl font-bold flex items-center gap-2 shadow-sm border border-stone-200 transition-all disabled:opacity-50"
                    >
                        <Download className="w-4 h-4" />
                        Export
                    </button>
                    <button
                        onClick={() => setShowAddModal(true)}
                        className="bg-emerald-600 hover:bg-emerald-700 text-white px-5 py-3 rounded-xl font-bold flex items-center gap-2 shadow-lg shadow-emerald-200 transition-all active:scale-95"
                    >
                        <UserPlus className="w-4 h-4 stroke-[3px]" />
                        Add Contact
                    </button>
                </div>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-stone-200 overflow-hidden">
                {/* Toolbar */}
                <div className="p-4 border-b border-stone-100 flex flex-col md:flex-row gap-4 justify-between items-center">
                    <div className="flex items-center gap-2 w-full md:w-auto">
                        <div className="relative w-full md:w-80">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
                            <input
                                type="text"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                placeholder="Search by name or email..."
                                className="w-full pl-10 pr-4 py-2 border-2 border-stone-100 rounded-xl focus:border-emerald-500 outline-none font-medium text-stone-800"
                            />
                        </div>
                        <button className="p-2 border-2 border-stone-100 rounded-xl hover:bg-stone-50 text-stone-500">
                            <Filter className="w-4 h-4" />
                        </button>
                    </div>

                    <div className="flex gap-2">
                        {['All', 'Active', 'Bounced', 'Unsubscribed'].map(s => (
                            <button
                                key={s}
                                onClick={() => { setFilterStatus(s); setPage(1); }}
                                className={`text-xs font-bold px-3 py-1.5 rounded-lg transition-colors ${filterStatus === s ? 'bg-stone-900 text-white' : 'bg-stone-50 text-stone-500 hover:bg-stone-100'
                                    }`}
                            >
                                {s}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Table */}
                <div className="overflow-x-auto min-h-[300px]">
                    {loading ? (
                        <div className="flex items-center justify-center h-64 text-stone-400 gap-2">
                            <Loader2 className="w-6 h-6 animate-spin" />
                            <span className="font-bold">Loading Audience...</span>
                        </div>
                    ) : contacts.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-64 text-stone-400 gap-2">
                            <div className="bg-stone-100 p-4 rounded-full mb-2">
                                <UserPlus className="w-6 h-6 text-stone-300" />
                            </div>
                            <span className="font-bold text-stone-500">No contacts found</span>
                            <p className="text-sm">Try adjusting your filters or add a new contact.</p>
                        </div>
                    ) : (
                        <table className="w-full">
                            <thead className="bg-stone-50 text-stone-400 text-[10px] font-bold uppercase tracking-widest text-left">
                                <tr>
                                    <th className="px-6 py-4 w-10">
                                        <input type="checkbox" className="rounded border-stone-300 text-emerald-600 focus:ring-emerald-500" />
                                    </th>
                                    <th className="px-6 py-4">Contact</th>
                                    <th className="px-6 py-4">Status</th>
                                    <th className="px-6 py-4">Last Active</th>
                                    <th className="px-6 py-4">Source</th>
                                    <th className="px-6 py-4">Tags</th>
                                    <th className="px-6 py-4 w-10"></th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-stone-100">
                                {contacts.map((contact) => (
                                    <tr key={contact.id} className="hover:bg-stone-50/50 transition-colors group">
                                        <td className="px-6 py-4">
                                            <input type="checkbox" className="rounded border-stone-300 text-emerald-600 focus:ring-emerald-500" />
                                        </td>
                                        <td className="px-6 py-4">
                                            <div>
                                                <div className="font-bold text-stone-900">
                                                    {contact.first_name} {contact.last_name || ''}
                                                </div>
                                                <div className="text-xs text-stone-500 font-medium">{contact.email}</div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <StatusBadge status={contact.status} />
                                        </td>
                                        <td className="px-6 py-4 text-sm font-medium text-stone-700">
                                            {contact.last_activity ? new Date(contact.last_activity).toLocaleDateString() : 'Never'}
                                        </td>
                                        <td className="px-6 py-4 text-xs font-bold text-stone-500 uppercase tracking-wide">
                                            {contact.source || 'N/A'}
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex flex-wrap gap-1">
                                                {(contact.tags || []).map(tag => (
                                                    <span key={tag} className="px-2 py-0.5 bg-stone-100 text-stone-600 rounded text-[10px] font-bold">
                                                        #{tag}
                                                    </span>
                                                ))}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <button className="p-2 hover:bg-stone-100 rounded-lg text-stone-400 hover:text-stone-900 opacity-0 group-hover:opacity-100 transition-all">
                                                <MoreHorizontal className="w-4 h-4" />
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>

                {/* Pagination Footer */}
                <div className="p-4 border-t border-stone-100 flex justify-between items-center text-xs font-bold text-stone-500">
                    <span>Showing {(page - 1) * PAGE_SIZE + 1}-{Math.min(page * PAGE_SIZE, totalCount)} of {totalCount} contacts</span>
                    <div className="flex gap-2">
                        <button
                            onClick={() => setPage(p => Math.max(1, p - 1))}
                            disabled={page === 1}
                            className="text-stone-400 hover:text-stone-900 disabled:opacity-50"
                        >
                            Previous
                        </button>
                        <button className="text-stone-900 hover:text-emerald-600 px-2 bg-stone-100 rounded">{page}</button>
                        <button
                            onClick={() => setPage(p => p + 1)}
                            disabled={page * PAGE_SIZE >= totalCount}
                            className="text-stone-400 hover:text-stone-900"
                        >
                            Next
                        </button>
                    </div>
                </div>
            </div>

            {/* Add Contact Modal */}
            {showAddModal && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl">
                        <div className="p-6">
                            <div className="flex items-center justify-between mb-6">
                                <h2 className="text-xl font-black text-stone-900">Add New Contact</h2>
                                <button
                                    onClick={() => setShowAddModal(false)}
                                    className="p-2 hover:bg-stone-100 rounded-lg transition-colors"
                                >
                                    <X className="w-5 h-5 text-stone-500" />
                                </button>
                            </div>

                            <div className="space-y-4">
                                <div>
                                    <label className="block text-xs font-bold text-stone-500 uppercase tracking-wide mb-2">Email *</label>
                                    <input
                                        type="email"
                                        value={newContact.email}
                                        onChange={(e) => setNewContact({ ...newContact, email: e.target.value })}
                                        className="w-full px-4 py-3 border-2 border-stone-100 rounded-xl font-medium text-stone-900 focus:border-emerald-500 outline-none"
                                        placeholder="email@example.com"
                                    />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-xs font-bold text-stone-500 uppercase tracking-wide mb-2">First Name</label>
                                        <input
                                            type="text"
                                            value={newContact.first_name}
                                            onChange={(e) => setNewContact({ ...newContact, first_name: e.target.value })}
                                            className="w-full px-4 py-3 border-2 border-stone-100 rounded-xl font-medium text-stone-900 focus:border-emerald-500 outline-none"
                                            placeholder="John"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-stone-500 uppercase tracking-wide mb-2">Last Name</label>
                                        <input
                                            type="text"
                                            value={newContact.last_name}
                                            onChange={(e) => setNewContact({ ...newContact, last_name: e.target.value })}
                                            className="w-full px-4 py-3 border-2 border-stone-100 rounded-xl font-medium text-stone-900 focus:border-emerald-500 outline-none"
                                            placeholder="Doe"
                                        />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-stone-500 uppercase tracking-wide mb-2">Tags (comma separated)</label>
                                    <input
                                        type="text"
                                        value={newContact.tags}
                                        onChange={(e) => setNewContact({ ...newContact, tags: e.target.value })}
                                        className="w-full px-4 py-3 border-2 border-stone-100 rounded-xl font-medium text-stone-900 focus:border-emerald-500 outline-none"
                                        placeholder="newsletter, vip"
                                    />
                                </div>
                            </div>

                            <div className="flex gap-3 mt-6">
                                <button
                                    onClick={() => setShowAddModal(false)}
                                    className="flex-1 px-6 py-3 border-2 border-stone-200 text-stone-600 rounded-xl font-bold hover:bg-stone-50 transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleAddContact}
                                    disabled={addingContact}
                                    className="flex-1 px-6 py-3 bg-emerald-600 text-white rounded-xl font-bold hover:bg-emerald-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                                >
                                    {addingContact ? (
                                        <>
                                            <Loader2 className="w-4 h-4 animate-spin" />
                                            Adding...
                                        </>
                                    ) : (
                                        'Add Contact'
                                    )}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}

function StatusBadge({ status }: { status: string }) {
    // Normalize status to match CSS keys
    const normalized = status.charAt(0).toUpperCase() + status.slice(1).toLowerCase();

    const styles = {
        'Active': 'bg-emerald-50 text-emerald-700 border-emerald-100',
        'Bounced': 'bg-red-50 text-red-700 border-red-100',
        'Unsubscribed': 'bg-stone-100 text-stone-500 border-stone-200',
        'Complained': 'bg-orange-50 text-orange-700 border-orange-100'
    }[normalized] || 'bg-stone-50 text-stone-700'

    const Icon = {
        'Active': CheckCircle,
        'Bounced': XCircle,
        'Unsubscribed': Clock,
        'Complained': AlertTriangle
    }[normalized] || CheckCircle

    return (
        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wide border ${styles}`}>
            <Icon className="w-3 h-3" />
            {normalized}
        </span>
    )
}
