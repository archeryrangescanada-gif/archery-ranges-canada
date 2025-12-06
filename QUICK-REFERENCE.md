# 🚀 Quick Reference - Archery Ranges Canada

## Common Commands

### Development
```bash
npm install          # Install all dependencies
npm run dev          # Start development server (http://localhost:3000)
npm run build        # Build for production
npm start            # Start production server
```

### Environment Setup
```bash
cp .env.local.example .env.local    # Create environment file
# Then edit .env.local with your Supabase credentials
```

## File Structure

```
archery-ranges-canada/
├── src/
│   ├── app/
│   │   ├── page.tsx                      # Homepage
│   │   ├── layout.tsx                    # Root layout
│   │   ├── globals.css                   # Global styles
│   │   ├── [province]/
│   │   │   └── page.tsx                  # Province pages
│   │   └── [province]/[city]/
│   │       └── page.tsx                  # City pages
│   └── lib/
│       └── supabase/
│           └── server.ts                 # Supabase client
├── package.json                          # Dependencies
├── tsconfig.json                         # TypeScript config
├── tailwind.config.ts                    # Tailwind config
├── next.config.js                        # Next.js config
├── .env.local.example                    # Environment template
├── supabase-schema.sql                   # Database schema
├── bulk-cities-data.sql                  # 100+ cities
├── sample-ranges-data.sql                # Sample ranges
└── README.md                             # Full documentation
```

## Database Quick Commands

### Run in Supabase SQL Editor:

**Setup Database:**
```sql
-- Copy and paste entire supabase-schema.sql file
-- This creates tables and adds 13 provinces
```

**Add Cities:**
```sql
-- Copy and paste entire bulk-cities-data.sql file
-- This adds 100+ cities
```

**Add Sample Ranges:**
```sql
-- Copy and paste entire sample-ranges-data.sql file
-- This adds 12 test ranges
```

**Verify Setup:**
```sql
SELECT COUNT(*) FROM provinces;  -- Should return 13
SELECT COUNT(*) FROM cities;     -- Should return 100+
SELECT COUNT(*) FROM ranges;     -- Should return 12 (after sample data)
```

## URL Structure

```
/                               → Homepage (all provinces)
/ontario                        → Province page (Ontario cities)
/ontario/toronto                → City page (Toronto ranges)
/british-columbia/vancouver     → City page (Vancouver ranges)
```

## Adding Data

### Add a City
```sql
INSERT INTO cities (name, slug, province_id) VALUES
  ('City Name', 'city-name', (SELECT id FROM provinces WHERE slug = 'province-slug'));
```

### Add a Range
```sql
INSERT INTO ranges (
  name, slug, address, phone_number, website, description,
  city_id, province_id, is_featured
) VALUES (
  'Range Name',
  'range-slug',
  '123 Street, City, Province A1B 2C3',
  '(123) 456-7890',
  'https://example.com',
  'Description here...',
  (SELECT id FROM cities WHERE slug = 'city-slug'),
  (SELECT id FROM provinces WHERE slug = 'province-slug'),
  false
);
```

## Deployment to Vercel

```bash
# 1. Push to GitHub
git init
git add .
git commit -m "Initial commit"
git remote add origin https://github.com/yourusername/archery-ranges-canada.git
git push -u origin main

# 2. Go to vercel.com
# 3. Import your GitHub repository
# 4. Add environment variables:
#    - NEXT_PUBLIC_SUPABASE_URL
#    - NEXT_PUBLIC_SUPABASE_ANON_KEY
# 5. Deploy!
```

## Troubleshooting

### Port 3000 in use?
```bash
npm run dev -- -p 3001  # Use different port
```

### Module not found?
```bash
# Restart dev server
# Press Ctrl+C
npm run dev
```

### Database connection error?
1. Check `.env.local` has correct URL and key
2. No quotes around values
3. Restart dev server after changes

### No data showing?
```sql
-- Verify in Supabase SQL Editor:
SELECT * FROM provinces;
SELECT * FROM cities;
SELECT * FROM ranges;
```

## Customization

### Change Colors
Find and replace in all `.tsx` files:
- `green-700` → `blue-700` (or your color)
- `green-600` → `blue-600`
- `green-500` → `blue-500`

### Modify Site Name
Edit `src/app/layout.tsx`:
```tsx
title: 'Your Custom Name'
```

## Need Help?

1. **SETUP-GUIDE.md** - Detailed setup instructions
2. **README.md** - Complete project documentation
3. **START-HERE.md** - Project overview
4. **Supabase Docs** - https://supabase.com/docs
5. **Next.js Docs** - https://nextjs.org/docs

## Quick Tests

### Test Homepage
```
http://localhost:3000
```
Should show all 13 provinces

### Test Province Page
```
http://localhost:3000/ontario
```
Should show cities in Ontario

### Test City Page
```
http://localhost:3000/ontario/toronto
```
Should show ranges in Toronto

---

**Version:** 1.0.0  
**Last Updated:** 2025-11-02  
**Quick Start Time:** 15 minutes ⏱️
