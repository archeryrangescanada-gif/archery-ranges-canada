'use client'

import { useState } from 'react'
import { Save, ShieldCheck, Globe, Mail, Bell, Key, AlertCircle } from 'lucide-react'

export default function EmailSettingsPage() {
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
                                    <input type="text" defaultValue="Josh from Archery Ranges" className="w-full px-4 py-2 border-2 border-stone-100 rounded-xl font-medium text-stone-900 focus:border-emerald-500 outline-none" />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-stone-500 uppercase tracking-wide mb-2">From Email</label>
                                    <input type="email" defaultValue="josh@archeryrangescanada.ca" className="w-full px-4 py-2 border-2 border-stone-100 rounded-xl font-medium text-stone-900 focus:border-emerald-500 outline-none" />
                                </div>
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-stone-500 uppercase tracking-wide mb-2">Reply-To Email</label>
                                <input type="email" defaultValue="support@archeryrangescanada.ca" className="w-full px-4 py-2 border-2 border-stone-100 rounded-xl font-medium text-stone-900 focus:border-emerald-500 outline-none" />
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
                            <Toggle label="Track Opens" description="Insert invisible pixel to track read rates" defaultChecked />
                            <Toggle label="Track Clicks" description="Rewrite links to measure CTR" defaultChecked />
                            <Toggle label="Google Analytics" description="Add UTM parameters automatically" />
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
                <button className="bg-stone-900 hover:bg-black text-white px-8 py-4 rounded-xl font-black flex items-center gap-2 shadow-lg transition-all active:scale-95">
                    <Save className="w-5 h-5" />
                    Save Changes
                </button>
            </div>

        </div>
    )
}

function Toggle({ label, description, defaultChecked }: { label: string, description?: string, defaultChecked?: boolean }) {
    const [checked, setChecked] = useState(defaultChecked || false)
    return (
        <div className="flex items-start justify-between cursor-pointer" onClick={() => setChecked(!checked)}>
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
