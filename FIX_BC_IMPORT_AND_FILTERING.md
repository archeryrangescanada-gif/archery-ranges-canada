# Fix BC Ranges Import & Add Province Filtering

## Issue 1: CSV Import Failing

**Error Message:**
```
Import failed: Database transaction failed: Could not find the function public.import_ranges_batch(ranges_json) in the schema cache
```

**Cause:** The required database function `import_ranges_batch` hasn't been deployed to your Supabase database yet.

### Solution - Deploy the Database Function

1. **Open Supabase Dashboard**
   - Go to https://supabase.com/dashboard
   - Select your project

2. **Open SQL Editor**
   - Click on "SQL Editor" in the left sidebar
   - Click "+ New Query"

3. **Run the Deployment Script**
   - Copy and paste the contents of `DEPLOY_BC_RANGES.sql` into the editor
   - Click "Run" or press Ctrl+Enter
   - You should see a success message

4. **Verify the Function**
   - The script will show you a table at the end confirming the function was created
   - You should see: `import_ranges_batch | FUNCTION | TABLE`

5. **Try Importing Again**
   - Go back to your admin panel: `archeryrangescanada.ca/admin/listings`
   - Click "Import CSV"
   - Select your BC ranges CSV file
   - The import should now work!

---

## Issue 2: Province Filtering Already Works!

Good news - your website **already has province filtering** built in! Here's how it works:

### For Admin Panel
The admin listings page (`/admin/listings`) already has a province dropdown filter at line 469-483:

```tsx
<select
  value={provinceFilter}
  onChange={(e) => setProvinceFilter(e.target.value)}
  className="..."
>
  <option value="all">All Provinces</option>
  <option value="Ontario">Ontario</option>
  <option value="British Columbia">British Columbia</option>
  <option value="Alberta">Alberta</option>
  // ... other provinces
</select>
```

### For Public Website
Your website uses a smart URL structure for province filtering:

- **All Ranges:** `archeryrangescanada.ca` (homepage)
- **Ontario Only:** `archeryrangescanada.ca/ontario`
- **British Columbia Only:** `archeryrangescanada.ca/british-columbia`
- **Specific City:** `archeryrangescanada.ca/british-columbia/vancouver`
- **Specific Range:** `archeryrangescanada.ca/british-columbia/vancouver/range-name`

The system automatically creates these URLs based on the province slugs in your database.

---

## After Importing BC Ranges

Once you successfully import the BC ranges CSV:

1. **British Columbia will automatically appear** in the province dropdown
2. **Users can visit** `archeryrangescanada.ca/british-columbia` to see only BC ranges
3. **Each city in BC** will have its own page: `/british-columbia/vancouver`, `/british-columbia/victoria`, etc.

---

## Quick Test After Import

1. Go to admin panel: `/admin/listings`
2. Use the province filter dropdown - select "British Columbia"
3. You should see all 44 BC ranges listed
4. Visit the public site: `/british-columbia`
5. All BC ranges should be displayed to users

---

## Common Issues & Solutions

### Import Still Fails After Running SQL
- Check if you're using the right Supabase project
- Make sure you ran the SQL in the correct database (not a different project)
- Try refreshing your browser cache (Ctrl+Shift+R)

### Province Doesn't Show in Dropdown
- The province options are hardcoded in the admin panel
- If you need to add more provinces, edit `src/app/admin/listings/page.tsx` lines 469-483

### BC Ranges Not Showing on Public Site
- Make sure the ranges have `status = 'active'` (check in admin panel)
- Verify the `province_id` is correctly set in the database
- Check that the province slug is set to `british-columbia` (lowercase with hyphens)

---

## Files Modified/Created

1. ✅ `DEPLOY_BC_RANGES.sql` - Database function deployment script
2. ✅ `BC_Archery_Ranges_Complete.xlsx` - Your completed BC data (all 44 locations filled)
3. ℹ️ Province filtering already exists in:
   - `/src/app/admin/listings/page.tsx` (admin panel)
   - `/src/app/[province]/page.tsx` (public province pages)

---

## Next Steps

1. ✅ Run `DEPLOY_BC_RANGES.sql` in Supabase SQL Editor
2. ✅ Export your Excel file to CSV format
3. ✅ Import the BC ranges CSV via admin panel
4. ✅ Verify all 44 ranges imported successfully
5. ✅ Test province filtering in both admin and public pages
6. 🎉 Your BC ranges are live!
