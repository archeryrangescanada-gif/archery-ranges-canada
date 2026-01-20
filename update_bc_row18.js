const XLSX = require('xlsx');
const filename = 'BC_Archery_Ranges_Complete.xlsx';

try {
    const workbook = XLSX.readFile(filename);
    const sheetName = workbook.SheetNames[0];
    const sheet = workbook.Sheets[sheetName];
    const data = XLSX.utils.sheet_to_json(sheet, { header: 1 });

    // Row 18 is index 17
    const rowIndex = 17;
    if (data[rowIndex]) {
        const row = data[rowIndex];

        row[1] = "N/A (Transitional - contacting for facility)";
        row[5] = "N/A";
        row[8] = "(604) 328-4461";
        row[9] = "N/A";
        row[10] = "https://langleyarchers.wixsite.com/langley-archers";

        // Description
        row[11] = "Archery training, lessons, and workshops led by certified instructors. Currently in transition to a new facility.";

        // Facility Type
        row[12] = "N/A (Mobile/Transitional)";

        // Hours (Index 16 assumed)
        row[16] = "Contact for lesson availability";

        // Lanes/Distances (Index 15)
        row[15] = "N/A";

        // Membership Price (Index 17)
        row[17] = "N/A";

        // Drop-in Price (Index 18)
        row[18] = "$200 (Group Lesson / 2hr)";

        // Equipment Rental (Index 19)
        row[19] = "Yes (During lessons)";

        // Lessons (Index 20)
        row[20] = "Certified training, camps, and workshops";

        console.log("Updated Row 18:", row);
    }

    const newSheet = XLSX.utils.aoa_to_sheet(data);
    workbook.Sheets[sheetName] = newSheet;
    XLSX.writeFile(workbook, filename);
    console.log("File saved.");
} catch (e) {
    console.error("Error:", e.message);
}
