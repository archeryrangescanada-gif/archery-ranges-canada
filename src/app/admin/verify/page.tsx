'use client'
import { useEffect, useState } from 'react'

export default function VerifyConfigPage() {
    const [report, setReport] = useState<any>(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        fetch('/api/admin/verify-config')
            .then(res => res.json())
            .then(data => {
                setReport(data)
                setLoading(false)
            })
            .catch(err => {
                console.error(err)
                setLoading(false)
            })
    }, [])

    if (loading) return <div className="p-8">Running Diagnostics...</div>

    return (
        <div className="p-8 max-w-2xl mx-auto">
            <h1 className="text-2xl font-bold mb-6">System Configuration Check</h1>

            <div className="bg-white rounded-lg shadow p-6 mb-6">
                <h2 className="text-lg font-semibold mb-4 border-b pb-2">Environment Status</h2>

                {report?.checks?.map((check: string, i: number) => (
                    <div key={i} className={`mb-3 p-3 rounded ${check.includes('✅') ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800 font-bold'
                        }`}>
                        {check}
                    </div>
                ))}

                {report?.connection_success ? (
                    <div className="mt-6 p-4 bg-green-100 text-green-800 rounded border border-green-200">
                        <p className="font-bold text-lg">🎉 Configuration Valid!</p>
                        <p>The server can successfully talk to Supabase.</p>
                    </div>
                ) : (
                    <div className="mt-6 p-4 bg-red-100 text-red-800 rounded border border-red-200">
                        <p className="font-bold text-lg">🚫 Configuration Failed</p>
                        <p className="mb-2">The server cannot connect. Please check your .env.local file.</p>
                        <ul className="list-disc pl-5 text-sm space-y-1">
                            <li>Is the <code>SUPABASE_SERVICE_ROLE_KEY</code> correct?</li>
                            <li>Did you use the <code>service_role</code> secret (not anon)?</li>
                            <li>Did you restart the server after saving changes?</li>
                        </ul>
                    </div>
                )}
            </div>

            <button
                onClick={() => window.location.reload()}
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
                Run Check Again
            </button>
        </div>
    )
}
