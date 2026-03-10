'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import {
    Send,
    ArrowLeft,
    Users,
    Layout,
    Type,
    Loader2,
    CheckCircle2,
    XCircle,
    Mail,
    ChevronRight,
    Search,
    Plus,
    X
} from 'lucide-react'
import Link from 'next/link'

interface Contact {
    id: string
    email: string
    first_name: string | null
    last_name: string | null
}

interface Template {
    id: string
    name: string
    subject: string | null
    body_html: string | null
    category: string | null
}

export default function NewCampaignPage() {
    const router = useRouter()
    const supabase = createClient()

    // State
    const [step, setStep] = useState(1)
    const [loading, setLoading] = useState(false)
    const [sending, setSending] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [success, setSuccess] = useState(false)

    // Data State
    const [contacts, setContacts] = useState<Contact[]>([])
    const [templates, setTemplates] = useState<Template[]>([])

    // Form State
    const [campaignName, setCampaignName] = useState('')
    const [selectedRecipients, setSelectedRecipients] = useState<Contact[]>([])
    const [selectedTemplateId, setSelectedTemplateId] = useState<string | null>(null)
    const [subject, setSubject] = useState('')
    const [message, setMessage] = useState('')
    const [recipientSearch, setRecipientSearch] = useState('')

    useEffect(() => {
        async function fetchData() {
            setLoading(true)
            const [contactsRes, templatesRes] = await Promise.all([
                supabase.from('email_contacts').select('id, email, first_name, last_name'),
                supabase.from('email_templates').select('id, name, subject, body_html, category')
            ])

            if (contactsRes.data) setContacts(contactsRes.data)
            if (templatesRes.data) setTemplates(templatesRes.data)
            setLoading(false)
        }
        fetchData()
    }, [supabase])

    const handleSelectTemplate = (templateId: string) => {
        const template = templates.find(t => t.id === templateId)
        if (template) {
            setSelectedTemplateId(templateId)
            setSubject(template.subject || '')
            // In a real app we'd handle HTML body, for now we just use plain text conversion or placeholder
            setMessage(template.body_html || '')
        }
    }

    const toggleRecipient = (contact: Contact) => {
        setSelectedRecipients(prev =>
            prev.find(r => r.id === contact.id)
                ? prev.filter(r => r.id !== contact.id)
                : [...prev, contact]
        )
    }

    const handleSend = async () => {
        if (!campaignName || selectedRecipients.length === 0 || !subject || !message) {
            setError('Please fill in all required fields')
            return
        }

        setSending(true)
        setError(null)

        try {
            // 1. Send via API
            const response = await fetch('/api/admin/emails/send', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    to: selectedRecipients.map(r => r.email).join(', '),
                    subject,
                    message,
                    type: 'bulk'
                })
            })

            const result = await response.json()

            if (!response.ok) throw new Error(result.error || 'Failed to send emails')

            // 2. Save to DB
            const { error: dbError } = await supabase
                .from('email_campaigns')
                .insert([{
                    name: campaignName,
                    subject,
                    template_id: selectedTemplateId,
                    status: 'sent',
                    sent_at: new Date().toISOString(),
                    stats: {
                        sent: selectedRecipients.length,
                        delivered: selectedRecipients.length, // Assume delivered for now
                        opened: 0,
                        clicked: 0
                    }
                }])

            if (dbError) throw dbError

            setSuccess(true)
            setTimeout(() => router.push('/admin/emails/campaigns'), 2000)

        } catch (err: any) {
            setError(err.message || 'An error occurred while sending.')
        } finally {
            setSending(false)
        }
    }

    const filteredContacts = contacts.filter(c =>
        c.email.toLowerCase().includes(recipientSearch.toLowerCase()) ||
        (`${c.first_name || ''} ${c.last_name || ''}`).toLowerCase().includes(recipientSearch.toLowerCase())
    )

    if (success) {
        return (
            <div className="p-8 flex items-center justify-center min-h-[60vh]">
                <div className="bg-white p-12 rounded-3xl border border-stone-100 shadow-2xl shadow-emerald-100 text-center max-w-md w-full">
                    <div className="w-20 h-20 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-6">
                        <CheckCircle2 className="w-10 h-10" />
                    </div>
                    <h2 className="text-2xl font-black text-stone-900 mb-2">Campaign Sent!</h2>
                    <p className="text-stone-500 font-medium whitespace-pre-wrap">
                        Your campaign "{campaignName}" has been successfully dispatched to {selectedRecipients.length} recipients.
                    </p>
                </div>
            </div>
        )
    }

    return (
        <div className="p-8 space-y-8 max-w-5xl mx-auto">
            {/* Header */}
            <div className="flex items-center gap-4">
                <Link href="/admin/emails/campaigns" className="p-2 hover:bg-stone-100 rounded-xl transition-colors">
                    <ArrowLeft className="w-6 h-6 text-stone-900" />
                </Link>
                <div>
                    <h1 className="text-3xl font-black text-stone-900">New Campaign</h1>
                    <p className="text-stone-500 font-medium">Step {step} of 3 • Craft your message</p>
                </div>
            </div>

            {/* Stepper */}
            <div className="flex gap-4 p-1 bg-stone-100 rounded-2xl">
                {[1, 2, 3].map(i => (
                    <button
                        key={i}
                        onClick={() => setStep(i)}
                        className={`flex-1 py-3 rounded-xl text-sm font-black transition-all ${step === i ? 'bg-white text-emerald-700 shadow-sm' : 'text-stone-400 hover:text-stone-600'
                            }`}
                    >
                        {i === 1 ? 'Details' : i === 2 ? 'Recipients' : 'Compose'}
                    </button>
                ))}
            </div>

            {error && (
                <div className="bg-red-50 border border-red-100 p-4 rounded-2xl flex items-center gap-3 text-red-700 font-bold">
                    <XCircle className="w-5 h-5" />
                    {error}
                </div>
            )}

            {/* Step 1: Details & Template */}
            {step === 1 && (
                <div className="space-y-6">
                    <div className="bg-white p-8 rounded-3xl border border-stone-200 space-y-4">
                        <label className="block text-sm font-black text-stone-400 uppercase tracking-widest">Internal Campaign Name</label>
                        <input
                            type="text"
                            placeholder="e.g. March 2024 Newsletter"
                            value={campaignName}
                            onChange={(e) => setCampaignName(e.target.value)}
                            className="w-full text-xl font-bold bg-stone-50 border-2 border-transparent focus:border-emerald-500 focus:bg-white rounded-2xl p-4 outline-none transition-all"
                        />
                    </div>

                    <div className="bg-white p-8 rounded-3xl border border-stone-200">
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-xl font-black text-stone-900">Choose a Template</h2>
                            <Link href="/admin/emails/templates" className="text-emerald-600 font-bold text-sm hover:underline flex items-center gap-1">
                                Manage Templates <ChevronRight className="w-4 h-4" />
                            </Link>
                        </div>

                        {loading ? (
                            <div className="py-12 flex justify-center"><Loader2 className="w-6 h-6 animate-spin text-stone-300" /></div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                <button
                                    onClick={() => setSelectedTemplateId(null)}
                                    className={`p-4 rounded-2xl border-2 transition-all text-left flex flex-col items-center justify-center gap-2 h-32 ${selectedTemplateId === null ? 'border-emerald-500 bg-emerald-50 text-emerald-700' : 'border-stone-100 hover:border-stone-300 bg-stone-50'
                                        }`}
                                >
                                    <Type className="w-6 h-6" />
                                    <span className="font-bold text-sm">Start from Blank</span>
                                </button>
                                {templates.map(t => (
                                    <button
                                        key={t.id}
                                        onClick={() => handleSelectTemplate(t.id)}
                                        className={`p-4 rounded-2xl border-2 transition-all text-left h-32 flex flex-col justify-between ${selectedTemplateId === t.id ? 'border-emerald-500 bg-emerald-50 text-emerald-700' : 'border-stone-100 hover:border-stone-300 bg-white'
                                            }`}
                                    >
                                        <div className="space-y-1">
                                            <div className="text-xs font-black uppercase text-stone-400">{t.category}</div>
                                            <div className="font-black leading-tight line-clamp-2">{t.name}</div>
                                        </div>
                                        {selectedTemplateId === t.id && <CheckCircle2 className="w-4 h-4 self-end" />}
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* Step 2: Recipients */}
            {step === 2 && (
                <div className="bg-white p-8 rounded-3xl border border-stone-200 space-y-6">
                    <div className="flex items-center justify-between gap-4">
                        <div className="flex-1 relative">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-stone-400" />
                            <input
                                type="text"
                                placeholder="Search by name or email..."
                                value={recipientSearch}
                                onChange={(e) => setRecipientSearch(e.target.value)}
                                className="w-full pl-12 pr-4 py-4 bg-stone-50 border-none rounded-2xl outline-none focus:ring-2 focus:ring-emerald-500 font-bold shadow-inner"
                            />
                        </div>
                        <div className="px-6 py-4 bg-emerald-50 rounded-2xl shrink-0">
                            <div className="text-xs font-black uppercase text-emerald-600 tracking-widest">Selected</div>
                            <div className="text-2xl font-black text-emerald-700">{selectedRecipients.length}</div>
                        </div>
                    </div>

                    <div className="max-h-[400px] overflow-y-auto pr-2 space-y-2 custom-scrollbar">
                        {loading ? (
                            <div className="py-12 flex justify-center"><Loader2 className="w-6 h-6 animate-spin text-stone-300" /></div>
                        ) : filteredContacts.length === 0 ? (
                            <p className="text-center py-12 text-stone-400 font-bold">No contacts found</p>
                        ) : (
                            filteredContacts.map(c => {
                                const isSelected = !!selectedRecipients.find(r => r.id === c.id)
                                return (
                                    <button
                                        key={c.id}
                                        onClick={() => toggleRecipient(c)}
                                        className={`w-full p-4 rounded-xl border-2 flex items-center justify-between transition-all ${isSelected ? 'border-emerald-500 bg-emerald-50 shadow-sm' : 'border-stone-50 hover:border-stone-200'
                                            }`}
                                    >
                                        <div className="flex items-center gap-4">
                                            <div className="w-10 h-10 rounded-full bg-stone-100 flex items-center justify-center font-black text-stone-400">
                                                {c.first_name ? c.first_name[0] : (c.email ? c.email[0].toUpperCase() : '?')}
                                            </div>
                                            <div className="text-left">
                                                <div className="font-black text-stone-900">{c.first_name ? `${c.first_name} ${c.last_name || ''}` : 'No Name'}</div>
                                                <div className="text-xs font-bold text-stone-400">{c.email}</div>
                                            </div>
                                        </div>
                                        {isSelected ? <X className="w-5 h-5 text-emerald-600" /> : <Plus className="w-5 h-5 text-stone-300" />}
                                    </button>
                                )
                            })
                        )}
                    </div>
                </div>
            )}

            {/* Step 3: Compose */}
            {step === 3 && (
                <div className="bg-white p-8 rounded-3xl border border-stone-200 space-y-6">
                    <div className="space-y-4">
                        <label className="block text-sm font-black text-stone-400 uppercase tracking-widest">Email Subject</label>
                        <input
                            type="text"
                            placeholder="What should the subject line be?"
                            value={subject}
                            onChange={(e) => setSubject(e.target.value)}
                            className="w-full text-lg font-bold bg-stone-50 border-none rounded-2xl p-4 outline-none focus:ring-2 focus:ring-emerald-500"
                        />
                    </div>

                    <div className="space-y-4">
                        <label className="block text-sm font-black text-stone-400 uppercase tracking-widest">Message Content</label>
                        <textarea
                            rows={12}
                            placeholder="Write your email here..."
                            value={message}
                            onChange={(e) => setMessage(e.target.value)}
                            className="w-full font-medium bg-stone-50 border-none rounded-2xl p-6 outline-none focus:ring-2 focus:ring-emerald-500 text-stone-800"
                        />
                    </div>

                    <div className="p-4 bg-stone-50 rounded-2xl border border-stone-100 flex items-start gap-3">
                        <Mail className="w-5 h-5 text-stone-400 shrink-0" />
                        <div className="text-xs text-stone-500 leading-relaxed">
                            <span className="font-bold text-stone-700">Tips:</span> Focus on a clear value proposition. Personalization is key for high open rates.
                            Always test your links before sending.
                        </div>
                    </div>
                </div>
            )}

            {/* Navigation Footer */}
            <div className="flex items-center justify-between pt-4">
                <button
                    onClick={() => setStep(prev => Math.max(1, prev - 1))}
                    disabled={step === 1}
                    className="px-8 py-4 bg-stone-100 text-stone-600 rounded-2xl font-black hover:bg-stone-200 disabled:opacity-0 transition-all font-inter"
                >
                    Back
                </button>

                {step < 3 ? (
                    <button
                        onClick={() => setStep(prev => Math.min(3, prev + 1))}
                        className="px-8 py-4 bg-stone-900 text-white rounded-2xl font-black hover:bg-stone-800 transition-all shadow-lg"
                    >
                        Continue
                    </button>
                ) : (
                    <button
                        onClick={handleSend}
                        disabled={sending}
                        className="px-12 py-4 bg-emerald-600 text-white rounded-2xl font-black hover:bg-emerald-700 transition-all shadow-xl shadow-emerald-100 flex items-center gap-3 disabled:opacity-50"
                    >
                        {sending ? (
                            <>
                                <Loader2 className="w-5 h-5 animate-spin" />
                                Sending...
                            </>
                        ) : (
                            <>
                                <Send className="w-5 h-5" />
                                Send Campaign
                            </>
                        )}
                    </button>
                )}
            </div>
        </div>
    )
}
