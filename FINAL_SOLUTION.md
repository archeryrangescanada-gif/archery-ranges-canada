# FINAL SOLUTION - Complete Fix for BC Ranges Import

## The Real Problems

Looking at your errors, there are **THREE separate issues**:

### 1. **Array Type Mismatch**
```
column "bow_types_allowed" is of type text[] but expression is of type text
```
Database expects arrays like `{"Recurve","Compound"}`, CSV has `"Recurve, Compound"`

### 2. **Boolean Type Mismatch**
```
invalid input syntax for type boolean: "$10 (Adult) / $2 (Junior) - Guest Fee"
invalid input syntax for type boolean: "N/A"
```
Database expects `true/false`, CSV has pricing text or "N/A"

### 3. **JSONB Type Mismatch**
```
column "business_hours" is of type jsonb but expression is of type text
```
Database expects JSON objects, CSV has plain text

---

## SOLUTION - Two Steps

### STEP 1: Fix Database Schema (Run Once)

1. **Open Supabase SQL Editor**
   - Go to https://supabase.com/dashboard
   - Select your project
   - Click **SQL Editor** → **+ New Query**

2. **Run Diagnostic First (Optional but Recommended)**
   - Copy contents of `DIAGNOSE_SCHEMA.sql`
   - Paste and run
   - This shows you exactly what's wrong

3. **Run the Complete Fix**
   - Copy contents of `COMPLETE_SCHEMA_FIX.sql`
   - Paste and run
   - This fixes ALL schema issues at once

4. **Verify Success**
   - You should see messages like:
     - `Fixed bow_types_allowed: ARRAY → TEXT`
     - `Fixed business_hours: JSONB → TEXT`
     - `✅ SCHEMA FIX COMPLETE!`

---

### STEP 2: Check Your CSV Data

The new errors show your CSV has **bad data** in boolean columns. Let me check your Excel file structure.

**Common Issues in Your CSV:**

| Column | Database Expects | Your CSV Might Have | Fix |
|--------|------------------|---------------------|-----|
| `has_pro_shop` | `true` or `false` | Pricing text like "$10 Adult" | Change to `Yes` or `No` |
| `membership_required` | `true` or `false` | "N/A" | Change to `No` or leave blank |
| `drop_in_price` | Number like `10.00` | "$10 (Adult) / $2 (Junior)" | Change to `10.00` (just the number) |
| `bow_types_allowed` | Text like "Recurve, Compound" | Should be OK | ✓ |

---

## What You Need To Do

### A. Fix Database (5 minutes)
1. Run `COMPLETE_SCHEMA_FIX.sql` in Supabase
2. Wait for success message

### B. Fix Your Excel File

Open `BC_Archery_Ranges_Complete.xlsx` and check these columns:

**Boolean Columns** - Should only have:
- `Yes` / `No`
- `TRUE` / `FALSE`
- `1` / `0`
- Or blank (empty)

**NOT** text like "N/A" or pricing info!

Columns to check:
- `has_pro_shop`
- `has_3d_course`
- `has_field_course`
- `membership_required`
- `equipment_rental_available`
- `lessons_available`
- `accessibility`
- `parking_available`

**Pricing Columns** - Should only have numbers:
- `membership_price_adult` → `50` (not "$50" or "$50/year")
- `drop_in_price` → `10` (not "$10 (Adult) / $5 (Child)")
- `lesson_price_range` → Can be text like "$20-$40"

### C. Export to CSV
1. Open the Excel file
2. File → Save As
3. Format: **CSV UTF-8 (Comma delimited)**
4. Save as `BC_Archery_Ranges_Complete.csv`

### D. Import
1. Go to `/admin/listings`
2. Click Import CSV
3. Select the CSV file
4. Should work now! ✅

---

## Quick Test Before Full Import

Want to test first? Create a test CSV with just 1-2 ranges:
1. Copy the header row + first 2 data rows
2. Save as `BC_Test.csv`
3. Import the test file first
4. If it works, import the full 44 ranges

---

## Files to Use

1. ✅ **DIAGNOSE_SCHEMA.sql** - Run first to see problems (optional)
2. ✅ **COMPLETE_SCHEMA_FIX.sql** - Run this to fix database (required)
3. ✅ **BC_Archery_Ranges_Complete.xlsx** - Fix data, then export to CSV
4. ✅ **BC_Archery_Ranges_Complete.csv** - Import this file

---

## Still Having Issues?

After running the SQL fix, if import still fails:

1. **Copy the FULL error message**
2. **Tell me which row/range is failing**
3. **Show me a sample of your CSV data** (first 3 lines)

This will help me see exactly what's wrong with the data format.
