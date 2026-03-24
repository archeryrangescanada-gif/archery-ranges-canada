/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    missingSuspenseWithCSRBailout: false,
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
      {
        protocol: 'https',
        hostname: '*.supabase.co',
      },
    ],
  },
  async rewrites() {
    return [
      {
        source: '/arc-booking',
        destination: 'https://arc-booking-software-josh-kennedys-projects-a2f17453.vercel.app/',
      },
      {
        source: '/arc-booking/:path*',
        destination: 'https://arc-booking-software-josh-kennedys-projects-a2f17453.vercel.app/:path*',
      },
    ]
  },
}

module.exports = nextConfig
