'use client' // Error components must be Client Components

import { useEffect } from 'react'

export default function Error({
    error,
    reset,
}: {
    error: Error & { digest?: string }
    reset: () => void
}) {
    useEffect(() => {
        // Log the error to an error reporting service
        console.error(error)
    }, [error])

    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-stone-50 p-4">
            <h2 className="text-2xl font-bold text-stone-800 mb-4">Something went wrong!</h2>
            <p className="text-stone-600 mb-6 font-mono bg-stone-200 p-2 rounded text-sm">
                {error.message || "Unknown error occurred"}
            </p>
            <button
                onClick={
                    // Attempt to recover by trying to re-render the segment
                    () => reset()
                }
                className="px-6 py-3 bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 transition-colors font-medium"
            >
                Try again
            </button>
        </div>
    )
}
