import Link from 'next/link'

export default function NotFound() {
    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-stone-50 p-4">
            <h2 className="text-4xl font-bold text-stone-800 mb-4">404 - Page Not Found</h2>
            <p className="text-stone-600 mb-8 max-w-md text-center">
                We couldn&apos;t find the page you&apos;re looking for. It might have been moved or doesn&apos;t exist.
            </p>
            <Link
                href="/"
                className="px-6 py-3 bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 transition-colors font-medium"
            >
                Return Home
            </Link>
        </div>
    )
}
