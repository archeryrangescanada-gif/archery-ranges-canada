'use client';

import Link from 'next/link'
import Image from 'next/image'
import { useLanguage } from '@/lib/i18n/LanguageContext'

export default function Footer() {
    const { t } = useLanguage()

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
                            {t('footer.directory')}
                        </p>
                    </div>
                    <div>
                        <h4 className="font-semibold mb-4">{t('footer.quickLinks')}</h4>
                        <ul className="space-y-2 text-green-100">
                            <li><Link href="/" className="hover:text-white">{t('nav.home')}</Link></li>
                            <li><Link href="/about" className="hover:text-white">{t('nav.about')}</Link></li>
                            <li><Link href="/dashboard/onboarding" className="hover:text-white">{t('footer.claimListing')}</Link></li>
                        </ul>
                    </div>
                    <div>
                        <h4 className="font-semibold mb-4">{t('footer.legal')}</h4>
                        <ul className="space-y-2 text-green-100">
                            <li><Link href="/contact" className="hover:text-white">{t('footer.contactUs')}</Link></li>
                            <li><Link href="/terms" className="hover:text-white">{t('footer.terms')}</Link></li>
                            <li><Link href="/privacy" className="hover:text-white">{t('footer.privacy')}</Link></li>
                            <li><Link href="/cookies" className="hover:text-white">{t('footer.cookies')}</Link></li>
                        </ul>
                    </div>
                </div>
                <div className="border-t border-green-600 pt-8 text-center text-green-100">
                    <p>© 2026 Archery Ranges Canada. {t('footer.allRightsReserved')}</p>
                </div>
            </div>
        </footer>
    )
}
