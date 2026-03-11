import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import Script from 'next/script'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

const GA_MEASUREMENT_ID = 'G-D1GDEBMEYT'

export const metadata: Metadata = {
  title: 'Archery Near Me | Canadian Archery Range Directory',
  description: 'Search the largest directory of archery ranges in Canada. Find indoor and outdoor archery near me, including clubs, pro shops, and ranges with equipment rentals.',
  keywords: ['archery near me', 'archery range', 'archery ranges Canada', 'indoor archery', 'outdoor archery', 'archery lessons', 'bow shop', 'archery club'],
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
    canonical: 'https://archeryrangescanada.ca',
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
      <body className={inter.className}>
        {children}

        {/* Google Analytics 4 - Load after page content */}
        <Script
          src={`https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`}
          strategy="afterInteractive"
        />
        <Script id="google-analytics" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', '${GA_MEASUREMENT_ID}', {
              page_path: window.location.pathname,
              send_page_view: true
            });
          `}
        </Script>
      </body>
    </html>
  )
}

