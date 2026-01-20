const XLSX = require('xlsx');
const filename = 'BC_Archery_Ranges_Complete.xlsx';

try {
    const workbook = XLSX.readFile(filename);
    const sheetName = workbook.SheetNames[0];
    const sheet = workbook.Sheets[sheetName];
    const data = XLSX.utils.sheet_to_json(sheet, { header: 1 });

    // Row 25 is index 24
    const rowIndex = 24;
    if (data[rowIndex]) {
        const row = data[rowIndex];

        row[1] = "Brockton School (Indoor), 1150 Lynn Valley Rd";
        row[5] = "V7J 1Z9 (Brockton School)";
        row[8] = "N/A";
        row[9] = "info@northshorearchers.org";
        row[10] = "http://www.northshorearchers.org";

        // Description
        row[11] = "Pop-up club based in Brockton School gym. Range is set up/taken down each practice. BCAA membership mandatory.";

        // Facility Type
        row[12] = "Indoor (Pop-up)";

        // Hours (Index 16 assumed)
        row[16] = "Varies (Practice sessions only; check website)";

        // Lanes/Distances (Index 15)
        row[15] = "Indoor Gym Range (Pop-up)";

        // Membership Price (Index 17)
        row[17] = "$75 (Adult) / $45 (Junior) / $130 (Family) + BCAA Fee";

        // Drop-in Price (Index 18)
        row[18] = "$5.00 Range Fee (Members)";

        // Equipment Rental (Index 19)
        row[19] = "Yes ($10 Range Fee for members using club equipment)";

        // Lessons (Index 20)
        row[20] = "None scheduled (Equipment available for use during sessions)";

        console.log("Updated Row 25:", row);
    }

    const newSheet = XLSX.utils.aoa_to_sheet(data);
    workbook.Sheets[sheetName] = newSheet;
    XLSX.writeFile(workbook, filename);
    console.log("File saved.");
} catch (e) {
    console.error("Error:", e.message);
}
