'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Save, ShieldCheck, Globe, Mail, Bell, Key, AlertCircle, Loader2, CheckCircle } from 'lucide-react'

export default function EmailSettingsPage() {
    const [saving, setSaving] = useState(false)
    const [saved, setSaved] = useState(false)
    const [settings, setSettings] = useState({
        from_name: 'Josh from Archery Ranges',
        from_email: 'josh@archeryrangescanada.ca',
        reply_to: 'support@archeryrangescanada.ca',
        track_opens: true,
        track_clicks: true,
        google_analytics: false
    })

    const supabase = createClient()

    useEffect(() => {
        async function loadSettings() {
            const { data } = await supabase.from('email_settings').select('*')
            if (data) {
                const settingsMap: Record<string, string> = {}
                data.forEach(row => {
                    settingsMap[row.setting_key] = row.setting_value
                })
                setSettings({
                    from_name: settingsMap.from_name || 'Josh from Archery Ranges',
                    from_email: settingsMap.from_email || 'josh@archeryrangescanada.ca',
                    reply_to: settingsMap.reply_to || 'support@archeryrangescanada.ca',
                    track_opens: settingsMap.track_opens === 'true',
                    track_clicks: settingsMap.track_clicks === 'true',
                    google_analytics: settingsMap.google_analytics === 'true'
                })
            }
        }
        loadSettings()
    }, [supabase])

    const handleSave = async () => {
        setSaving(true)
        setSaved(false)
        try {
            const updates = [
                { setting_key: 'from_name', setting_value: settings.from_name },
                { setting_key: 'from_email', setting_value: settings.from_email },
                { setting_key: 'reply_to', setting_value: settings.reply_to },
                { setting_key: 'track_opens', setting_value: String(settings.track_opens) },
                { setting_key: 'track_clicks', setting_value: String(settings.track_clicks) },
                { setting_key: 'google_analytics', setting_value: String(settings.google_analytics) }
            ]

            for (const update of updates) {
                await supabase
                    .from('email_settings')
                    .upsert(update, { onConflict: 'setting_key' })
            }

            setSaved(true)
            setTimeout(() => setSaved(false), 3000)
        } catch (err) {
            console.error('Error saving settings:', err)
            alert('Failed to save settings')
        } finally {
            setSaving(false)
        }
    }

    return (
        <div className="p-8 space-y-8 max-w-5xl">
            <div>
                <h1 className="text-3xl font-black text-stone-900">Settings</h1>
                <p className="text-stone-500 mt-2 font-medium">Configure sender identity, tracking, and compliance</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                {/* Main Settings Column */}
                <div className="lg:col-span-2 space-y-8">
                    {/* Sender Identity */}
                    <section className="bg-white rounded-2xl shadow-sm border border-stone-200 p-6">
                        <h2 className="text-lg font-bold text-stone-800 flex items-center gap-2 mb-6">
                            <Mail className="w-5 h-5 text-emerald-600" />
                            Sender Identity
                        </h2>
                        <div className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-bold text-stone-500 uppercase tracking-wide mb-2">From Name</label>
                                    <input
                                        type="text"
                                        value={settings.from_name}
                                        onChange={(e) => setSettings({ ...settings, from_name: e.target.value })}
                                        className="w-full px-4 py-2 border-2 border-stone-100 rounded-xl font-medium text-stone-900 focus:border-emerald-500 outline-none"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-stone-500 uppercase tracking-wide mb-2">From Email</label>
                                    <input
                                        type="email"
                                        value={settings.from_email}
                                        onChange={(e) => setSettings({ ...settings, from_email: e.target.value })}
                                        className="w-full px-4 py-2 border-2 border-stone-100 rounded-xl font-medium text-stone-900 focus:border-emerald-500 outline-none"
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-stone-500 uppercase tracking-wide mb-2">Reply-To Email</label>
                                <input
                                    type="email"
                                    value={settings.reply_to}
                                    onChange={(e) => setSettings({ ...settings, reply_to: e.target.value })}
                                    className="w-full px-4 py-2 border-2 border-stone-100 rounded-xl font-medium text-stone-900 focus:border-emerald-500 outline-none"
                                />
                            </div>
                        </div>
                    </section>

                    {/* Domain Authentication */}
                    <section className="bg-white rounded-2xl shadow-sm border border-stone-200 p-6">
                        <h2 className="text-lg font-bold text-stone-800 flex items-center gap-2 mb-6">
                            <ShieldCheck className="w-5 h-5 text-blue-600" />
                            Domain Authentication
                        </h2>

                        <div className="bg-emerald-50 border border-emerald-100 rounded-xl p-4 mb-6 flex items-start gap-3">
                            <div className="bg-emerald-100 p-1 rounded-full text-emerald-600 mt-0.5">
                                <ShieldCheck className="w-4 h-4" />
                            </div>
                            <div>
                                <h4 className="text-sm font-bold text-emerald-800">Domain Authenticated</h4>
                                <p className="text-xs text-emerald-600 mt-1">Your DNS records for SPF and DKIM are correctly configured for <strong>archeryrangescanada.ca</strong>.</p>
                            </div>
                        </div>

                        <div className="space-y-3">
                            <div className="flex items-center justify-between p-3 bg-stone-50 rounded-xl border border-stone-100">
                                <div className="flex items-center gap-3">
                                    <span className="text-xs font-bold bg-stone-200 text-stone-600 px-2 py-1 rounded">CNAME</span>
                                    <span className="text-sm font-mono text-stone-600">em1234.archeryrangescanada.ca</span>
                                </div>
                                <span className="text-xs font-bold text-emerald-600 flex items-center gap-1"><CheckIcon /> Verified</span>
                            </div>
                            <div className="flex items-center justify-between p-3 bg-stone-50 rounded-xl border border-stone-100">
                                <div className="flex items-center gap-3">
                                    <span className="text-xs font-bold bg-stone-200 text-stone-600 px-2 py-1 rounded">TXT</span>
                                    <span className="text-sm font-mono text-stone-600">v=spf1 include:sendgrid.net ~all</span>
                                </div>
                                <span className="text-xs font-bold text-emerald-600 flex items-center gap-1"><CheckIcon /> Verified</span>
                            </div>
                        </div>
                    </section>
                </div>

                {/* Side Settings */}
                <div className="space-y-6">
                    {/* Tracking Settings */}
                    <section className="bg-white rounded-2xl shadow-sm border border-stone-200 p-6">
                        <h2 className="text-lg font-bold text-stone-800 flex items-center gap-2 mb-6">
                            <Globe className="w-5 h-5 text-stone-400" />
                            Tracking
                        </h2>
                        <div className="space-y-4">
                            <Toggle
                                label="Track Opens"
                                description="Insert invisible pixel to track read rates"
                                checked={settings.track_opens}
                                onChange={(val) => setSettings({ ...settings, track_opens: val })}
                            />
                            <Toggle
                                label="Track Clicks"
                                description="Rewrite links to measure CTR"
                                checked={settings.track_clicks}
                                onChange={(val) => setSettings({ ...settings, track_clicks: val })}
                            />
                            <Toggle
                                label="Google Analytics"
                                description="Add UTM parameters automatically"
                                checked={settings.google_analytics}
                                onChange={(val) => setSettings({ ...settings, google_analytics: val })}
                            />
                        </div>
                    </section>

                    {/* API Keys */}
                    <section className="bg-white rounded-2xl shadow-sm border border-stone-200 p-6">
                        <h2 className="text-lg font-bold text-stone-800 flex items-center gap-2 mb-6">
                            <Key className="w-5 h-5 text-stone-400" />
                            API Access
                        </h2>
                        <div className="p-3 bg-stone-900 rounded-xl mb-3">
                            <code className="text-xs text-stone-400 font-mono block mb-1">Public Key</code>
                            <div className="text-white font-mono text-sm truncate">pk_live_51Msz...</div>
                        </div>
                        <button className="w-full py-2 border-2 border-stone-200 rounded-xl font-bold text-stone-600 hover:bg-stone-50 text-sm">
                            Regenerate Keys
                        </button>
                    </section>
                </div>

            </div>

            <div className="flex justify-end pt-6 border-t border-stone-200">
                <button
                    onClick={handleSave}
                    disabled={saving}
                    className="bg-stone-900 hover:bg-black text-white px-8 py-4 rounded-xl font-black flex items-center gap-2 shadow-lg transition-all active:scale-95 disabled:opacity-50"
                >
                    {saving ? (
                        <>
                            <Loader2 className="w-5 h-5 animate-spin" />
                            Saving...
                        </>
                    ) : saved ? (
                        <>
                            <CheckCircle className="w-5 h-5" />
                            Saved!
                        </>
                    ) : (
                        <>
                            <Save className="w-5 h-5" />
                            Save Changes
                        </>
                    )}
                </button>
            </div>

        </div>
    )
}

function Toggle({ label, description, checked, onChange }: { label: string, description?: string, checked: boolean, onChange: (val: boolean) => void }) {
    return (
        <div className="flex items-start justify-between cursor-pointer" onClick={() => onChange(!checked)}>
            <div>
                <div className="text-sm font-bold text-stone-900">{label}</div>
                {description && <div className="text-xs text-stone-500 leading-snug mt-0.5">{description}</div>}
            </div>
            <div className={`w-12 h-6 rounded-full p-1 transition-colors duration-200 relative ${checked ? 'bg-emerald-500' : 'bg-stone-200'}`}>
                <div className={`w-4 h-4 rounded-full bg-white shadow-sm transition-transform duration-200 ${checked ? 'translate-x-6' : 'translate-x-0'}`} />
            </div>
        </div>
    )
}

function CheckIcon() {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" className="w-3 h-3">
            <path d="M20 6 9 17l-5-5" />
        </svg>
    )
}
