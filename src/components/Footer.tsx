
import Link from 'next/link'

export default function Footer() {
    return (
        <footer className="bg-gradient-to-r from-emerald-700 to-emerald-800 text-white py-12">
            <div className="container mx-auto px-4">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
                    <div>
                        <img
                            src="/logo.png?v=2"
                            alt="Archery Ranges Canada"
                            className="h-20 w-auto object-contain mb-4"
                        />
                        <p className="text-green-100">
                            Your complete directory of archery ranges across Canada
                        </p>
                    </div>
                    <div>
                        <h4 className="font-semibold mb-4">Quick Links</h4>
                        <ul className="space-y-2 text-green-100">
                            <li><Link href="/" className="hover:text-white">Home</Link></li>
                            <li><Link href="/blog" className="hover:text-white">Blog</Link></li>
                            <li><Link href="/about" className="hover:text-white">About</Link></li>
                        </ul>
                    </div>
                    <div>
                        <h4 className="font-semibold mb-4">Range Owners</h4>
                        <ul className="space-y-2 text-green-100">
                            <li><Link href="/claim" className="hover:text-white">Claim Your Listing</Link></li>
                            <li><Link href="/premium" className="hover:text-white">Premium Features</Link></li>
                        </ul>
                    </div>
                    <div>
                        <h4 className="font-semibold mb-4">Resources</h4>
                        <ul className="space-y-2 text-green-100">
                            <li><Link href="/blog" className="hover:text-white">Archery Tips</Link></li>
                            <li><Link href="/blog" className="hover:text-white">Beginner Guides</Link></li>
                            <li><Link href="/blog" className="hover:text-white">Equipment Reviews</Link></li>
                        </ul>
                    </div>
                </div>
                <div className="border-t border-green-600 pt-8 text-center text-green-100">
                    <p>© 2025 Archery Ranges Canada. All rights reserved.</p>
                </div>
            </div>
        </footer>
    )
}
