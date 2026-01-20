# THE REAL FIX - Array Column Type Mismatch

## What's Actually Wrong

Your error messages show:
```
Unknown: column "bow_types_allowed" is of type text[] but expression is of type text
```

This means your database has these columns stored as **PostgreSQL arrays (`text[]`)**, but your CSV import is sending **plain text strings**.

### Columns That Are Arrays in Your Database:
- `bow_types_allowed` - stored as `text[]` array
- `post_tags` - stored as `text[]` array
- `post_images` - stored as `text[]` array
- `video_urls` - possibly stored as `text[]` array
- `business_hours` - possibly stored as `jsonb` object

### What Your CSV Provides:
- `bow_types_allowed`: `"Recurve, Compound, Crossbow"` (comma-separated text)
- `post_tags`: `"archery, indoor, BC"` (comma-separated text)
- Not array format

---

## THE SOLUTION

Run this new SQL script that converts ALL array columns to plain TEXT:

### Step 1: Open Supabase SQL Editor

1. Go to https://supabase.com/dashboard
2. Select your project
3. Click **SQL Editor** (left sidebar)
4. Click **+ New Query**

### Step 2: Run the Array Fix Script

1. Open the file: **`FIX_ARRAY_COLUMNS.sql`**
2. Copy the ENTIRE contents
3. Paste into Supabase SQL Editor
4. Click **Run** (or press Ctrl+Enter)

### Step 3: What This Does

The script will:
1. ✅ Convert `bow_types_allowed` from `text[]` to `TEXT`
2. ✅ Convert `post_tags` from `text[]` to `TEXT`
3. ✅ Convert `post_images` from `text[]` to `TEXT`
4. ✅ Convert `video_urls` from `text[]` to `TEXT` (if it exists)
5. ✅ Convert `business_hours` from `jsonb` to `TEXT` (if it's JSONB)

Any existing data will be preserved - arrays will be converted to comma-separated text.

### Step 4: Expected Output

You'll see two tables:
1. **Before** - showing current types (text[], jsonb, etc.)
2. **After** - showing all converted to TEXT
3. Success message: "All array and JSONB columns converted to TEXT! Import should now work."

### Step 5: Try Import Again

1. Go to `/admin/listings`
2. Click **Import CSV**
3. Select your BC ranges CSV file
4. **This time it WILL work** - you should see:
   - ✅ Success: 44
   - ❌ Failed: 0

---

## Why This Happened

Your database was originally set up with structured data types (arrays, JSONB) for better data organization. But GeoDirectory CSV exports provide plain text with comma-separated values, not structured arrays.

The simplest fix is to change the database columns to TEXT to match the import format.

---

## Previous Scripts You Can Ignore

- ~~FIX_TYPE_MISMATCH.sql~~ - Only fixed business_hours, missed the arrays
- ~~FIX_IMPORT_ERRORS.sql~~ - Already applied, but didn't fix array types

**Use ONLY `FIX_ARRAY_COLUMNS.sql`** - this is the complete fix.

---

## After Successful Import

✅ All 44 BC ranges will be in your database
✅ Province filter will show "British Columbia"
✅ Public site will show BC ranges at `/british-columbia`
✅ Each city will have its own page

🎯 **Your BC archery range directory will be live!**
