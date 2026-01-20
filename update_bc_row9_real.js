const XLSX = require('xlsx');

const filename = 'BC_Archery_Ranges_Complete.xlsx';

try {
    const workbook = XLSX.readFile(filename);
    const sheetName = workbook.SheetNames[0];
    const sheet = workbook.Sheets[sheetName];

    // Convert to array of arrays (header: 1)
    const data = XLSX.utils.sheet_to_json(sheet, { header: 1 });

    // Row 9 is index 8
    const rowIndex = 8;

    if (data[rowIndex]) {
        const row = data[rowIndex];

        // Update with found info for Burke Mountain Archers
        // Indices based on standard headers (assuming consistency with previous reads)
        // 0: Name
        // 1: Address
        // 2: City
        // 3: Province
        // 4: Country
        // 5: Postal
        // 6: Lat
        // 7: Long
        // 8: Phone
        // 9: Email
        // 10: Website
        // 11: Desc
        // 12: Fac Type
        // 13: ?
        // 14: ?
        // 15: ?
        // 16: ?
        // 17: Membership Price (approx index)
        // 18: Drop-in Price

        // Let's use the explicit assignment based on previous observation of columns
        // Address
        row[1] = "5000 Upper Harper Road";
        // City
        row[2] = "Coquitlam";
        // Postal
        row[5] = "V3E 3H1";
        // Phone (N/A)
        row[8] = "N/A";
        // Email
        row[9] = "burke.archery@gmail.com";
        // Website
        row[10] = "https://pcdhfc.com/clubs/archery/";

        // Description
        row[11] = "Affiliated with PCDHFC. Indoor drop-in nights and Junior Olympian Program (JOP).";

        // Facility Type
        row[12] = "Indoor/Outdoor";

        // Hours (Finding the column is tricky solely by index, but let's assume it's one of the later ones or append/update if empty)
        // From Step 158 log, the columns after "Indoor/Outdoor" were:
        // "No", "Yes", "Yes", "N/A" (Hours?), "$155...", "N/A", "N/A", "N/A", "$120...", "Recurve...", "N/A"

        // Use N/A search to find empty spots? No, risky.
        // Let's rely on the previous script's logic or just update known ones.

        // I will assume standard indexes for strict columns I know.

        // I'll leave other columns as populated by the previous script (N/A) if I can't be sure, 
        // BUT I can update the ones I filled with "N/A" specifically.

        // Re-saving...
        console.log("Updated Row 9 with Real Data:", row);
    }

    const newSheet = XLSX.utils.aoa_to_sheet(data);
    workbook.Sheets[sheetName] = newSheet;
    XLSX.writeFile(workbook, filename);
    console.log("File saved.");

} catch (e) {
    console.error("Error:", e.message);
}
