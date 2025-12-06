# 🎯 Archery Ranges Canada - Complete Directory Website

A production-ready Next.js 14 directory website for finding archery ranges across Canada.

## 🚀 Features

- ✅ **Complete Directory Structure** - Homepage, Province pages, City pages
- ✅ **SEO Optimized** - Dynamic meta tags, proper heading hierarchy
- ✅ **Featured Listings** - Monetization-ready premium placement
- ✅ **Mobile Responsive** - Works perfectly on all devices
- ✅ **Supabase Backend** - Scalable PostgreSQL database
- ✅ **TypeScript** - Full type safety
- ✅ **Tailwind CSS** - Modern, responsive styling

## 📦 What's Included

```
archery-ranges-canada/
├── src/
│   ├── app/
│   │   ├── page.tsx                    # Homepage
│   │   ├── [province]/
│   │   │   ├── page.tsx               # Province page
│   │   │   └── [city]/
│   │   │       └── page.tsx           # City page
│   │   ├── layout.tsx                  # Root layout
│   │   └── globals.css                 # Global styles
│   └── lib/
│       └── supabase/
│           └── server.ts               # Supabase client
├── package.json
├── tsconfig.json
├── tailwind.config.ts
├── next.config.js
└── .env.local.example
```

## ⚡ Quick Start

### 1. Install Dependencies

```bash
npm install
```

### 2. Set Up Supabase

1. Create a Supabase account at https://supabase.com
2. Create a new project
3. Go to SQL Editor and run the `supabase-schema.sql` file
4. This creates:
   - `provinces` table (pre-populated with 13 provinces)
   - `cities` table
   - `ranges` table
   - All necessary indexes and RLS policies

### 3. Configure Environment Variables

Copy `.env.local.example` to `.env.local`:

```bash
cp .env.local.example .env.local
```

Edit `.env.local` and add your Supabase credentials:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
```

Get these from: Supabase Dashboard → Settings → API

### 4. Add Sample Data

In Supabase SQL Editor, run:

**Add Cities:**
```sql
-- Example: Add cities in Ontario
INSERT INTO cities (name, slug, province_id) VALUES
  ('Toronto', 'toronto', (SELECT id FROM provinces WHERE slug = 'ontario')),
  ('Ottawa', 'ottawa', (SELECT id FROM provinces WHERE slug = 'ontario')),
  ('Mississauga', 'mississauga', (SELECT id FROM provinces WHERE slug = 'ontario'));
```

**Add Ranges:**
```sql
-- Example: Add a range in Toronto
INSERT INTO ranges (
  name, slug, address, phone_number, website, description,
  city_id, province_id, is_featured
) VALUES (
  'Toronto Archery Hub',
  'toronto-archery-hub',
  '123 Archery Lane, Toronto, ON M5H 2N2',
  '(416) 555-0100',
  'https://example.com',
  'Premier indoor and outdoor archery facility in the heart of Toronto.',
  (SELECT id FROM cities WHERE slug = 'toronto'),
  (SELECT id FROM provinces WHERE slug = 'ontario'),
  true
);
```

### 5. Start Development Server

```bash
npm run dev
```

Visit `http://localhost:3000`

## 🌐 URL Structure

```
/                                    → Homepage (all provinces)
/ontario                             → Province page (cities in Ontario)
/ontario/toronto                     → City page (ranges in Toronto)
/ontario/ottawa                      → City page (ranges in Ottawa)
/british-columbia                    → Province page (cities in BC)
/british-columbia/vancouver          → City page (ranges in Vancouver)
```

## 📝 Adding Data

### Add a Province

Provinces are pre-populated! All 13 Canadian provinces/territories are already in the database.

### Add a City

```sql
INSERT INTO cities (name, slug, province_id) VALUES
  ('City Name', 'city-name', (SELECT id FROM provinces WHERE slug = 'province-slug'));
```

**Slug Format:** lowercase, hyphenated (e.g., `'toronto'`, `'st-johns'`)

### Add a Range

```sql
INSERT INTO ranges (
  name,
  slug,
  address,
  phone_number,
  website,
  description,
  city_id,
  province_id,
  is_featured
) VALUES (
  'Range Name',
  'range-slug',
  '123 Street Name, City, Province A1B 2C3',
  '(123) 456-7890',
  'https://example.com',
  'Description of the archery range...',
  (SELECT id FROM cities WHERE slug = 'city-slug'),
  (SELECT id FROM provinces WHERE slug = 'province-slug'),
  false  -- Set to 'true' for featured ranges
);
```

## 🎨 Customization

### Change Color Theme

Find and replace in all page files:

- `green-700` → your primary color
- `green-600` → your medium shade
- `green-500` → your border color
- `green-400` → your hover color
- `green-100` → your light background
- `green-50` → your very light background

### Modify Page Content

**Homepage:** Edit `src/app/page.tsx`  
**Province Pages:** Edit `src/app/[province]/page.tsx`  
**City Pages:** Edit `src/app/[province]/[city]/page.tsx`

## 🚀 Deployment

### Deploy to Vercel

1. Push to GitHub:
```bash
git init
git add .
git commit -m "Initial commit"
git remote add origin your-repo-url
git push -u origin main
```

2. Connect to Vercel:
   - Go to https://vercel.com
   - Import your repository
   - Add environment variables (Supabase URL and key)
   - Deploy!

### Environment Variables in Vercel

Add these in Vercel Dashboard → Settings → Environment Variables:

```
NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY
```

## 📊 Database Schema

### Tables

**provinces:**
- id, name, slug, created_at
- Pre-populated with 13 provinces/territories

**cities:**
- id, name, slug, province_id, created_at
- Unique: (slug, province_id)

**ranges:**
- id, name, slug, address, phone_number, website, description
- latitude, longitude, city_id, province_id, is_featured
- owner_id, created_at, updated_at
- Unique: (slug, city_id)

## 🔒 Security

- Row Level Security (RLS) enabled on all tables
- Public read access for all listings
- Authenticated write access for creating/editing
- Owner-only updates for range modifications

## 📱 Features by Page

### Homepage
- List all 13 provinces
- Province cards with hover effects
- Call-to-action sections

### Province Pages
- Show all cities in province
- Display range count
- Breadcrumb navigation
- Mobile responsive grid

### City Pages (SEO Optimized!)
- Featured ranges section (premium placement)
- Regular ranges grid
- Full contact information (address, phone, website)
- City-specific FAQ section
- Nearby cities linking (internal SEO)
- Empty state handling

## 🐛 Troubleshooting

### "Module not found: @/lib/supabase/server"

Check `tsconfig.json` has correct path alias:
```json
"paths": {
  "@/*": ["./src/*"]
}
```

### Database Connection Errors

1. Verify `.env.local` has correct credentials
2. Check Supabase project is active
3. Verify RLS policies allow SELECT operations

### No Data Showing

1. Run database schema in Supabase SQL Editor
2. Verify provinces table has 13 rows
3. Add cities and ranges using SQL

## 📈 Performance

- Server-side rendering for SEO
- Static generation support with `generateStaticParams`
- Optimized database queries with indexes
- Lazy loading for images

## 🎯 SEO Checklist

- [x] Unique meta titles per page
- [x] Descriptive meta descriptions
- [x] Proper H1 hierarchy
- [x] Clean, readable URLs
- [x] Internal linking structure
- [x] Mobile responsive
- [x] Fast page loads
- [ ] Add structured data (Schema.org)
- [ ] Add sitemap.xml
- [ ] Add robots.txt

## 📦 Built With

- **Next.js 14** - React framework
- **TypeScript** - Type safety
- **Tailwind CSS** - Styling
- **Supabase** - Backend & database
- **Vercel** - Hosting (recommended)

## 📄 License

This project is for Archery Ranges Canada.

## 🤝 Contributing

To add more features:

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## 📞 Support

For issues or questions:
- Check the documentation in this README
- Review Supabase logs for database errors
- Check browser console for client-side errors

---

**Version:** 1.0.0  
**Last Updated:** 2025-10-31  
**Status:** Production Ready ✅

## 🎉 You're All Set!

Your directory website is ready to launch. Start by:

1. ✅ Running `npm install`
2. ✅ Setting up Supabase
3. ✅ Adding environment variables
4. ✅ Adding cities and ranges
5. ✅ Testing locally
6. ✅ Deploying to Vercel

Happy coding! 🏹🎯
