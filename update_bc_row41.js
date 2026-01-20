const XLSX = require('xlsx');
const filename = 'BC_Archery_Ranges_Complete.xlsx';

try {
    const workbook = XLSX.readFile(filename);
    const sheetName = workbook.SheetNames[0];
    const sheet = workbook.Sheets[sheetName];
    const data = XLSX.utils.sheet_to_json(sheet, { header: 1 });

    // Row 41 is index 40
    const rowIndex = 40;
    if (data[rowIndex]) {
        const row = data[rowIndex];

        row[1] = "2180 Main St";
        row[5] = "V5T 3C5";
        row[8] = "(604) 423-4226";
        row[9] = "lykopisinfo@gmail.com";
        row[10] = "https://lykopis.com/";

        // Description
        row[11] = "Vancouver's home of traditional and historical archery. Adult & youth classes, open range, and private lessons.";

        // Facility Type
        row[12] = "Indoor Range & School";

        // Hours (Index 16 assumed)
        row[16] = "Shop: Mon/Tue/Thu/Fri 10:30-5:30; Open Range: Fri 6:30-8:30 PM";

        // Lanes/Distances (Index 15)
        row[15] = "Indoor Traditional Range";

        // Membership Price (Index 17)
        row[17] = "$249/mo (Adult ongoing classes); Intro class $140";

        // Drop-in Price (Index 18)
        row[18] = "$25 (Own equipment) / $35 (Rental) - Fridays 6:30 PM";

        // Equipment Rental (Index 19)
        row[19] = "Yes (Included in classes or $35 for open range)";

        // Lessons (Index 20)
        row[20] = "Traditional/Historical archery lessons; Private $90-$160";

        console.log("Updated Row 41:", row[0]);
    }

    const newSheet = XLSX.utils.aoa_to_sheet(data);
    workbook.Sheets[sheetName] = newSheet;
    XLSX.writeFile(workbook, filename);
    console.log("File saved.");
} catch (e) {
    console.error("Error:", e.message);
}
