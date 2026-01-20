const XLSX = require('xlsx');
const filename = 'BC_Archery_Ranges_Complete.xlsx';

try {
    const workbook = XLSX.readFile(filename);
    const sheetName = workbook.SheetNames[0];
    const sheet = workbook.Sheets[sheetName];
    const data = XLSX.utils.sheet_to_json(sheet, { header: 1 });

    // Row 24 is index 23
    const rowIndex = 23;
    if (data[rowIndex]) {
        const row = data[rowIndex];

        row[1] = "422A East Columbia St";
        row[5] = "V3L 3W9";
        row[8] = "(604) 524-1674";
        row[9] = "boormanarchery@gmail.com";
        row[10] = "https://boormanarchery.com/";

        // Description
        row[11] = "Pro shop and indoor range since 1964. Private/group lessons and 4-week adult courses available.";

        // Facility Type
        row[12] = "Indoor Pro Shop & Range";

        // Hours (Index 16 assumed)
        row[16] = "Tue-Sat 9:30 AM-5:00 PM; Sun-Mon Closed";

        // Lanes/Distances (Index 15)
        row[15] = "Indoor Range (Recurve/Traditional/Compound)";

        // Membership Price (Index 17)
        row[17] = "Shooter Cards: $120 (Traditional / 8 sessions); $160 (Compound / 8 sessions)";

        // Drop-in Price (Index 18)
        row[18] = "$20 (Traditional/Recurve drop-in); $25 (Compound drop-in)";

        // Equipment Rental (Index 19)
        row[19] = "Yes (Available during lessons; verify general range rental)";

        // Lessons (Index 20)
        row[20] = "Private/Group lessons ($45-$60/hr); Adult 4-week course ($119.99); Spring Camp";

        console.log("Updated Row 24:", row);
    }

    const newSheet = XLSX.utils.aoa_to_sheet(data);
    workbook.Sheets[sheetName] = newSheet;
    XLSX.writeFile(workbook, filename);
    console.log("File saved.");
} catch (e) {
    console.error("Error:", e.message);
}
