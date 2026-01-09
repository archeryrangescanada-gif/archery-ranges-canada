# 🎯 Archery Ranges Canada - Complete Directory Website

A production-ready Next.js 14 directory website for finding archery ranges across Canada.

## 🚀 Features

- ✅ **Complete Directory Structure** - Homepage, Province pages, City pages
- ✅ **SEO Optimized** - Dynamic meta tags, proper heading hierarchy
- ✅ **Featured Listings** - Monetization-ready premium placement
- ✅ **Mobile Responsive** - Works perfectly on all devices
- ✅ **Supabase Backend** - Scalable PostgreSQL database with Row Level Security (RLS)
- ✅ **TypeScript** - Full type safety
- ✅ **Tailwind CSS** - Modern, responsive styling
- ✅ **Stripe Integration** - Subscription management for premium listings
- ✅ **AI-Powered** - Auto-extract listing details using Gemini AI
- ✅ **Secure** - SSRF protection, rate limiting, and input validation

## 📦 Project Structure

```
archery-ranges-canada/
├── src/
│   ├── app/
│   │   ├── page.tsx                    # Homepage
│   │   ├── admin/                      # Admin Dashboard
│   │   │   ├── listings/               # Listing Management
│   │   │   └── ...
│   │   ├── api/                        # API Routes
│   │   │   ├── admin/                  # Admin API (protected)
│   │   │   ├── ranges/                 # Public Range API
│   │   │   └── stripe/                 # Payment Webhooks
│   │   ├── [province]/
│   │   │   ├── page.tsx               # Province page
│   │   │   └── [city]/
│   │   │       └── page.tsx           # City page
│   │   ├── layout.tsx                  # Root layout
│   └── lib/
│       ├── supabase/
│       │   ├── server.ts               # Authenticated Server Client
│       │   ├── admin.ts                # Admin Client (Service Role)
│       │   └── safe-client.ts          # Build-Safe Client Wrapper
│       ├── rate-limit.ts               # API Rate Limiter
│       └── logger.ts                   # Centralized Logger
├── db_indexes.sql                      # Performance Optimization SQL
├── package.json
└── next.config.js
```

## ⚡ Quick Start

### 1. Install Dependencies

```bash
npm install
```

### 2. Set Up Supabase

1. Create a Supabase account at https://supabase.com
2. Create a new project
3. Go to SQL Editor and run the schema files provided in the setup guide.
4. **Performance Optimization:** Run the contents of `db_indexes.sql` in the Supabase SQL Editor to add recommended indexes.

### 3. Configure Environment Variables

Copy `.env.local.example` to `.env.local` and populate it with your keys.

**Required Variables for Production:**

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# Application URLs
NEXT_PUBLIC_SITE_URL=https://archeryrangescanada.ca
NEXT_PUBLIC_APP_URL=https://archeryrangescanada.ca

# Stripe (Payments)
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_...
STRIPE_SECRET_KEY=sk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...
STRIPE_SILVER_PRICE_ID=price_...
STRIPE_GOLD_PRICE_ID=price_...
STRIPE_PLATNIUM_PRICE_ID=price_...

# Email (Resend)
RESEND_API_KEY=re_...
FROM_EMAIL=noreply@archeryrangescanada.ca

# AI Services (Gemini)
GEMINI_API_KEY=AI...

# Admin
ADMIN_PASSWORD=<secure-password>
```

### 4. Run Development Server

```bash
npm run dev
```

Visit `http://localhost:3000`

## 🚀 Deployment

### Deploy to Vercel

1. **Push to GitHub.**
2. **Import to Vercel.**
3. **Add Environment Variables:** Ensure ALL variables listed above are added to the Vercel project settings.
4. **Deploy.**

### Troubleshooting Builds

If you encounter "Failed to collect page data" or "Supabase key missing" errors during build:
- This project uses `force-dynamic` and lazy client initialization (`getSupabaseClient`) to prevent build-time crashes.
- Ensure you are not initializing `createClient()` with `process.env` keys at the top level of any file in `src/app/api`. Use `getSupabaseClient()` inside the handler function instead.

## 🔒 Security Measures

- **Admin Authentication:** Protected by Supabase Auth middleware.
- **SSRF Protection:** AI extraction endpoint blocks private IP ranges and localhost.
- **Rate Limiting:** Public API routes (search, inquiries) are rate-limited by IP.
- **Input Validation:** Strict type checking and sanitization on all API inputs.
- **Secure Headers:** HTTP security headers configured.

## 📈 Performance

- **Caching:** API responses include `Cache-Control` headers (60s max-age).
- **Dynamic Imports:** Heavy libraries (Recharts, Leaflet) are loaded lazily.
- **Image Optimization:** Uses `next/image`.
- **Database Indexes:** Optimized for common queries (location, status, filtering).

## 📄 License

This project is for Archery Ranges Canada.

---

**Version:** 1.1.0 (Security & Performance Hardened)
**Last Updated:** 2026-01-08
**Status:** Production Ready ✅
