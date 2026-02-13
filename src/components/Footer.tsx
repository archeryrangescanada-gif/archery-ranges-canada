import Link from 'next/link'
import Image from 'next/image'

export default function Footer() {
    return (
        <footer className="bg-gradient-to-r from-emerald-700 to-emerald-800 text-white py-12">
            <div className="container mx-auto px-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
                    <div>
                        <Image
                            src="/logo.png?v=2"
                            alt="Archery Ranges Canada"
                            width={143}
                            height={80}
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
                            <li><Link href="/about" className="hover:text-white">About</Link></li>
                            <li><Link href="/dashboard/onboarding" className="hover:text-white">Claim Your Listing</Link></li>
                        </ul>
                    </div>
                    <div>
                        <h4 className="font-semibold mb-4">Legal</h4>
                        <ul className="space-y-2 text-green-100">
                            <li><Link href="/contact" className="hover:text-white">Contact Us</Link></li>
                            <li><Link href="/terms" className="hover:text-white">Terms & Conditions</Link></li>
                            <li><Link href="/privacy" className="hover:text-white">Privacy Policy</Link></li>
                            <li><Link href="/cookies" className="hover:text-white">Cookie Policy</Link></li>
                        </ul>
                    </div>
                </div>
                <div className="border-t border-green-600 pt-8 text-center text-green-100">
                    <p>© 2026 Archery Ranges Canada. All rights reserved.</p>
                </div>
            </div>
        </footer>
    )
}
