import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import 'leaflet/dist/leaflet.css'

export const dynamic = 'force-dynamic'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: {
    default: 'Archery Ranges Canada - Find Indoor & Outdoor Archery Ranges Near You',
    template: '%s | Archery Ranges Canada'
  },
  description: 'Canada\'s #1 directory for archery ranges. Find indoor and outdoor facilities, lessons, pro shops, and archery clubs across all provinces. Compare prices, read reviews, and book today.',
  keywords: ['archery ranges Canada', 'indoor archery', 'outdoor archery', 'archery lessons', 'bow shop', 'archery club', 'target shooting', '3D archery'],
  authors: [{ name: 'Archery Ranges Canada' }],
  creator: 'Archery Ranges Canada',
  openGraph: {
    type: 'website',
    locale: 'en_CA',
    siteName: 'Archery Ranges Canada',
    title: 'Archery Ranges Canada - Find Indoor & Outdoor Archery Ranges',
    description: 'Canada\'s comprehensive directory for archery ranges. Find facilities near you.',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Archery Ranges Canada',
    description: 'Find archery ranges across Canada',
  },
  robots: {
    index: true,
    follow: true,
  },
  alternates: {
    canonical: 'https://archeryrangescanada.com',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <head>
        <link rel="icon" href="/favicon.ico" />
        <meta name="theme-color" content="#059669" />
      </head>
      <body className={inter.className}>{children}</body>
    </html>
  )
}
