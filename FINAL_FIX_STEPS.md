# FINAL FIX - Type Mismatch Error

## What Went Wrong

Your database has `business_hours` stored as **JSONB** (JSON object) but the import function is sending plain **TEXT** strings. This is causing the error:

```
column 'business_hours' is of type jsonb but expression is of type text
```

## SOLUTION - Run This New SQL Script

### Step 1: Open Supabase SQL Editor

1. Go to https://supabase.com/dashboard
2. Select your project
3. Click **SQL Editor** (left sidebar)
4. Click **+ New Query**

### Step 2: Run the Type Fix Script

1. Open the file: **`FIX_TYPE_MISMATCH.sql`**
2. Copy the ENTIRE contents
3. Paste into Supabase SQL Editor
4. Click **Run** (or press Ctrl+Enter)

### Step 3: Expected Output

You should see a table showing the column types, and then a success message:
```
Type mismatch fixed! business_hours is now TEXT. Try importing your CSV again.
```

### Step 4: Try Import Again

1. Go back to `/admin/listings`
2. Click **Import CSV**
3. Select your `BC_Archery_Ranges_Complete.csv` file
4. This time it should work - you should see:
   - ✅ Success: 44
   - ❌ Failed: 0

---

## What This Script Does

1. Changes `business_hours` column from JSONB to TEXT
2. This matches what your CSV import function expects
3. The import function from `FIX_IMPORT_ERRORS.sql` is already deployed and ready to work

---

## If You Still Get Errors

If you see a different type mismatch error for other columns, let me know which column name is shown in the error. The script includes commented-out lines for other potential columns that might need similar fixes.

---

## Why This Happened

The original database schema must have been created with `business_hours` as JSONB for storing structured schedule data. But your CSV import provides simple text strings like "Mon-Fri: 9am-5pm", which can't be inserted into a JSONB column without conversion.

The simplest fix is to change the column type to TEXT, which is what this script does.

---

## After Successful Import

Once all 44 ranges import successfully:

1. ✅ Go to `/admin/listings`
2. ✅ Use province filter dropdown - select "British Columbia"
3. ✅ You should see all 44 BC ranges
4. ✅ Visit `/british-columbia` on public site
5. ✅ All BC ranges visible to users
6. 🎉 Done!
