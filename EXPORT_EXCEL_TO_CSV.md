# How to Export BC_Archery_Ranges_Complete.xlsx to CSV

## Method 1: Using Excel (Windows)

1. **Open the Excel File**
   - Double-click `BC_Archery_Ranges_Complete.xlsx`

2. **Save As CSV**
   - Click **File** → **Save As**
   - Choose a location (same folder is fine)
   - In "Save as type" dropdown, select **CSV UTF-8 (Comma delimited) (*.csv)**
   - Name it: `BC_Archery_Ranges_Complete.csv`
   - Click **Save**

3. **Important Warnings to Ignore**
   - Excel will warn: "Some features may be lost" - Click **Yes**
   - Excel will warn about saving only one sheet - Click **OK**

---

## Method 2: Using Google Sheets (Any Platform)

1. **Upload to Google Sheets**
   - Go to https://sheets.google.com
   - Click **File** → **Open** → **Upload**
   - Upload `BC_Archery_Ranges_Complete.xlsx`

2. **Download as CSV**
   - Click **File** → **Download** → **Comma Separated Values (.csv)**
   - The file will download as `BC_Archery_Ranges_Complete.csv`

---

## Method 3: Using LibreOffice Calc (Free, Any Platform)

1. **Open with LibreOffice Calc**
   - Download LibreOffice (free): https://www.libreoffice.org/
   - Open `BC_Archery_Ranges_Complete.xlsx`

2. **Save As CSV**
   - Click **File** → **Save As**
   - In "File type" dropdown, select **Text CSV (.csv)**
   - Click **Save**
   - In the dialog:
     - Character set: **UTF-8**
     - Field delimiter: **,** (comma)
     - Text delimiter: **"** (double quote)
   - Click **OK**

---

## Verify Your CSV File

Before importing, open the CSV in Notepad or any text editor and check:

1. **First line should be headers:**
   ```
   name,post_address,post_city,post_region,post_country,post_zip,post_latitude,...
   ```

2. **Second line should be first range:**
   ```
   "Starr Archery","32465 Simon Avenue","Abbotsford","British Columbia","Canada","V4X 1T9",...
   ```

3. **File should have 45 lines total:**
   - 1 header row
   - 44 data rows (one for each BC range)

---

## Common CSV Export Issues

### Issue: Special Characters Look Broken
**Solution:** Make sure you selected **UTF-8** encoding when exporting

### Issue: Commas in Data Breaking Columns
**Solution:** The CSV export should wrap fields with commas in quotes - verify in text editor

### Issue: Multiple Sheets Warning
**Solution:** This is normal - your Excel file has only one sheet, so just click OK

---

## File Location After Export

Your CSV file should be in the same folder as your Excel file:
```
📁 archery-ranges-canada/
   📄 BC_Archery_Ranges_Complete.xlsx  ← Original Excel file
   📄 BC_Archery_Ranges_Complete.csv   ← New CSV file (ready to import)
```

---

## Ready to Import!

Once you have the CSV file:
1. ✅ Run the SQL deployment script first (see FIX_BC_IMPORT_AND_FILTERING.md)
2. ✅ Go to your admin panel: `archeryrangescanada.ca/admin/listings`
3. ✅ Click "Import CSV"
4. ✅ Select `BC_Archery_Ranges_Complete.csv`
5. ✅ Wait for "Import complete!" message
6. 🎉 Your 44 BC ranges are now live!
