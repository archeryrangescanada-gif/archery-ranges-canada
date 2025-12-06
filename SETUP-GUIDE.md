# 🚀 Complete Setup Guide - Archery Ranges Canada

Follow these steps to get your directory website running in 15 minutes!

---

## ✅ Prerequisites

Before you begin, make sure you have:

- [ ] Node.js 18+ installed ([download here](https://nodejs.org/))
- [ ] A Supabase account ([sign up here](https://supabase.com))
- [ ] Git installed (optional, for version control)
- [ ] A code editor (VS Code recommended)

---

## 📦 Step 1: Extract the Project

You have received the complete project folder: `archery-ranges-canada/`

```bash
# Navigate to the project
cd archery-ranges-canada

# Verify files are present
ls -la
```

You should see:
```
src/
package.json
tsconfig.json
tailwind.config.ts
next.config.js
README.md
supabase-schema.sql
bulk-cities-data.sql
sample-ranges-data.sql
.env.local.example
```

---

## 📚 Step 2: Install Dependencies

```bash
npm install
```

This installs:
- Next.js 14
- React 18
- Tailwind CSS
- Supabase client
- TypeScript

**Time:** ~2 minutes

---

## 🗄️ Step 3: Set Up Supabase Database

### 3.1 Create Supabase Project

1. Go to https://supabase.com
2. Click "Start your project"
3. Sign up/Login
4. Click "New Project"
5. Fill in:
   - **Name:** archery-ranges-canada
   - **Database Password:** (choose a strong password - save it!)
   - **Region:** Choose closest to you
   - **Pricing Plan:** Free tier is perfect
6. Click "Create new project"
7. Wait 2-3 minutes for project to be ready

### 3.2 Run Database Schema

1. In your Supabase project, click "SQL Editor" (left sidebar)
2. Click "New Query"
3. Open `supabase-schema.sql` from your project folder
4. Copy the **entire contents**
5. Paste into Supabase SQL Editor
6. Click "Run" (or press Ctrl/Cmd + Enter)
7. You should see: "Success. No rows returned"

**What this does:**
- Creates `provinces` table (with 13 provinces pre-populated)
- Creates `cities` table
- Creates `ranges` table
- Sets up indexes for performance
- Enables Row Level Security (RLS)
- Creates helper functions

### 3.3 Verify Database Setup

Run this query in SQL Editor:

```sql
SELECT COUNT(*) FROM provinces;
```

Should return: **13** ✅

### 3.4 Add Cities (Optional but Recommended)

1. Click "New Query" in SQL Editor
2. Open `bulk-cities-data.sql`
3. Copy and paste contents
4. Click "Run"
5. Verify:

```sql
SELECT COUNT(*) FROM cities;
```

Should return: **100+** ✅

### 3.5 Add Sample Ranges (For Testing)

1. Click "New Query" in SQL Editor
2. Open `sample-ranges-data.sql`
3. Copy and paste contents
4. Click "Run"
5. Verify:

```sql
SELECT COUNT(*) FROM ranges;
```

Should return: **12** ✅

---

## 🔑 Step 4: Configure Environment Variables

### 4.1 Get Supabase Credentials

1. In Supabase Dashboard, click "Settings" (gear icon)
2. Click "API" in left sidebar
3. Find:
   - **Project URL** (looks like: `https://abc123xyz.supabase.co`)
   - **anon public key** (long string starting with `eyJ...`)

### 4.2 Create Environment File

```bash
# Copy the example file
cp .env.local.example .env.local

# Open .env.local in your editor
```

### 4.3 Add Your Credentials

Edit `.env.local`:

```env
NEXT_PUBLIC_SUPABASE_URL=https://YOUR-PROJECT-ID.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOi...your-full-key-here
```

**Important:** Replace the placeholder values with your actual credentials!

---

## 🖥️ Step 5: Start Development Server

```bash
npm run dev
```

You should see:
```
▲ Next.js 14.2.15
- Local:        http://localhost:3000
- Ready in 2.5s
```

---

## ✅ Step 6: Test Your Website

Open your browser and test these URLs:

### Test 1: Homepage ✅
```
http://localhost:3000
```

**Should see:**
- "Find Archery Ranges in Canada" heading
- Grid of 13 provinces
- Each province is clickable

### Test 2: Province Page ✅
```
http://localhost:3000/ontario
```

**Should see:**
- "Archery Ranges in Ontario" heading
- Cities listed (if you added them)
- Breadcrumb: Home / Ontario

### Test 3: City Page ✅
```
http://localhost:3000/ontario/toronto
```

**Should see:**
- "Archery Ranges in Toronto, Ontario" heading
- Featured range with "FEATURED" badge (if you added sample data)
- FAQ section
- Nearby cities links

### Test 4: Navigation ✅
- Click "Ontario" from homepage → goes to province page
- Click "Toronto" from province page → goes to city page
- Click breadcrumb "Ontario" → goes back to province
- Click "Home" → goes back to homepage

### Test 5: Mobile View ✅
1. Press F12 (open dev tools)
2. Click device icon (Ctrl+Shift+M)
3. Select "iPhone 12 Pro"
4. Verify:
   - Cards stack vertically
   - Text is readable
   - Navigation works

---

## 🐛 Troubleshooting

### Problem: npm install fails

**Solution:**
```bash
# Clear npm cache
npm cache clean --force

# Delete node_modules and try again
rm -rf node_modules package-lock.json
npm install
```

### Problem: "Module not found: @/lib/supabase/server"

**Solution:**
1. Check `tsconfig.json` has:
```json
"paths": {
  "@/*": ["./src/*"]
}
```
2. Restart dev server (Ctrl+C, then `npm run dev`)

### Problem: Database connection error

**Solution:**
1. Check `.env.local` has correct URL and key
2. No quotes around values
3. No spaces
4. File is named exactly `.env.local` (not `.env.local.txt`)
5. Restart dev server after changes

### Problem: No provinces showing

**Solution:**
1. Go to Supabase SQL Editor
2. Run: `SELECT * FROM provinces;`
3. Should return 13 rows
4. If 0, re-run `supabase-schema.sql`

### Problem: Can't access Supabase

**Solution:**
1. Check RLS policies in Supabase Dashboard → Authentication → Policies
2. Verify "Provinces are viewable by everyone" policy exists
3. If not, re-run `supabase-schema.sql`

### Problem: Port 3000 already in use

**Solution:**
```bash
# Use different port
npm run dev -- -p 3001

# Or kill existing process
# Mac/Linux:
lsof -ti:3000 | xargs kill -9

# Windows:
netstat -ano | findstr :3000
taskkill /PID <PID> /F
```

---

## 📊 Understanding Your Data

### Provinces Table
```sql
SELECT * FROM provinces ORDER BY name;
```
- Pre-populated with 13 Canadian provinces/territories
- Don't modify this table

### Cities Table
```sql
SELECT c.name, p.name as province 
FROM cities c 
JOIN provinces p ON c.province_id = p.id;
```
- Add cities as needed
- Each city belongs to one province

### Ranges Table
```sql
SELECT r.name, c.name as city, r.is_featured
FROM ranges r
JOIN cities c ON r.city_id = c.id;
```
- Your main content
- `is_featured = true` shows prominently on city pages

---

## 🎨 Step 7: Customize (Optional)

### Change Site Name

Edit `src/app/layout.tsx`:
```tsx
title: 'Your Custom Name'
```

### Change Colors

Find and replace in all files:
- `green-700` → `blue-700` (or your color)
- `green-600` → `blue-600`
- `green-500` → `blue-500`

### Update Footer

Edit `src/app/page.tsx` (and other pages):
```tsx
<footer className="bg-gray-800 text-white py-8 mt-12">
  {/* Update your links here */}
</footer>
```

---

## 🚀 Step 8: Deploy to Production

### Option 1: Vercel (Recommended)

1. Push code to GitHub:
```bash
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/yourusername/archery-ranges-canada.git
git push -u origin main
```

2. Deploy to Vercel:
   - Go to https://vercel.com
   - Click "New Project"
   - Import your GitHub repository
   - Add environment variables:
     - `NEXT_PUBLIC_SUPABASE_URL`
     - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - Click "Deploy"

3. Done! Your site is live at: `https://your-project.vercel.app`

### Option 2: Other Hosting

- Netlify
- Railway
- Render
- Your own VPS

All support Next.js - just add environment variables!

---

## 📈 Next Steps

### Add Real Data

1. Research archery ranges in major cities
2. Add them to database:

```sql
INSERT INTO ranges (
  name, slug, address, phone_number, website, description,
  city_id, province_id, is_featured
) VALUES (
  'Actual Range Name',
  'actual-range-name',
  'Real Address',
  '(123) 456-7890',
  'https://actualwebsite.com',
  'Real description...',
  (SELECT id FROM cities WHERE slug = 'city-slug'),
  (SELECT id FROM provinces WHERE slug = 'province-slug'),
  false
);
```

### Set Up SEO

1. Add `sitemap.xml`
2. Add `robots.txt`
3. Submit to Google Search Console
4. Add Google Analytics

### Add More Features

1. Search functionality
2. Range detail pages
3. User reviews
4. Maps integration
5. Admin dashboard

---

## ✅ Setup Complete!

You now have:

✅ Fully functional directory website  
✅ Database with provinces, cities, ranges  
✅ SEO-optimized pages  
✅ Mobile responsive design  
✅ Ready to deploy  

**Total Setup Time:** ~15 minutes  

---

## 📞 Need Help?

**Common Issues:**
- Database errors → Check Supabase logs
- Module errors → Restart dev server
- Styling issues → Clear .next folder and rebuild
- Data not showing → Verify database queries

**Resources:**
- Next.js Docs: https://nextjs.org/docs
- Supabase Docs: https://supabase.com/docs
- Tailwind Docs: https://tailwindcss.com/docs

---

**Setup Version:** 1.0  
**Last Updated:** 2025-10-31  
**Estimated Time:** 15 minutes ⏱️  

🎉 **Congratulations! Your directory website is live!** 🎉
