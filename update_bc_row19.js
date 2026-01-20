const XLSX = require('xlsx');
const filename = 'BC_Archery_Ranges_Complete.xlsx';

try {
    const workbook = XLSX.readFile(filename);
    const sheetName = workbook.SheetNames[0];
    const sheet = workbook.Sheets[sheetName];
    const data = XLSX.utils.sheet_to_json(sheet, { header: 1 });

    // Row 19 is index 18
    const rowIndex = 18;
    if (data[rowIndex]) {
        const row = data[rowIndex];

        row[1] = "3854 - 208th Street";
        row[5] = "V3A 4X7";
        row[8] = "(604) 534-3525";
        row[9] = "manager@lrgc.com / archery.lrgc@gmail.com";
        row[10] = "http://www.lrgc.com";

        // Description
        row[11] = "Comprehensive archery facilities with indoor/outdoor ranges and beginner lessons.";

        // Facility Type
        row[12] = "Indoor/Outdoor";

        // Hours (Index 16 assumed)
        row[16] = "Office: Wed 11-7:30, Fri-Sun 10/11-4:30; Indoor: Sun 5-7 PM & Wed; Outdoor: 9AM-Dusk";

        // Lanes/Distances (Index 15)
        row[15] = "Indoor Archery Range; Outdoor Archery Range";

        // Membership Price (Index 17)
        row[17] = "$236.25 (Adult/Family) + insurance; $8.00/session for members";

        // Drop-in Price (Index 18)
        row[18] = "$10.00 (Non-members) / $6.00 (Members drop-in)";

        // Equipment Rental (Index 19)
        row[19] = "Yes ($5 for non-members; Free for members)";

        // Lessons (Index 20)
        row[20] = "Beginner lessons available (contact for arrangement)";

        console.log("Updated Row 19:", row);
    }

    const newSheet = XLSX.utils.aoa_to_sheet(data);
    workbook.Sheets[sheetName] = newSheet;
    XLSX.writeFile(workbook, filename);
    console.log("File saved.");
} catch (e) {
    console.error("Error:", e.message);
}
