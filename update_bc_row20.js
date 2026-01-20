const XLSX = require('xlsx');
const filename = 'BC_Archery_Ranges_Complete.xlsx';

try {
    const workbook = XLSX.readFile(filename);
    const sheetName = workbook.SheetNames[0];
    const sheet = workbook.Sheets[sheetName];
    const data = XLSX.utils.sheet_to_json(sheet, { header: 1 });

    // Row 20 is index 19
    const rowIndex = 19;
    if (data[rowIndex]) {
        const row = data[rowIndex];

        row[1] = "11925 Haney Pl (Indoor); 27150 106th Ave (Outdoor)";
        row[5] = "V2W 1Y6 (Outdoor)";
        row[8] = "N/A";
        row[9] = "mapleridgearchery@gmail.com";
        row[10] = "http://www.mapleridgearchery.com";

        // Description
        row[11] = "Indoor shooting at Leisure Centre (Oct-Apr) and Outdoor at Selvey Park (May-Sep). Active JOP program.";

        // Facility Type
        row[12] = "Indoor/Outdoor";

        // Hours (Index 16 assumed)
        row[16] = "Indoor: Thu 6:30-8:30 PM, Sun 6:30-8 PM; Outdoor: Tue/Thu 5-8 PM, Sat 8 AM-1 PM";

        // Lanes/Distances (Index 15)
        row[15] = "Indoor Gym Range; Outdoor Park Range";

        // Membership Price (Index 17)
        row[17] = "$165 (Adult w/ equipment) / $225 (w/o equipment) / $440 (Family)";

        // Drop-in Price (Index 18)
        row[18] = "$10 (w/ BC Archery) / $15 (Non-member) / $35 (Try-it Night)";

        // Equipment Rental (Index 19)
        row[19] = "Yes (Included in Try-it/Intro)";

        // Lessons (Index 20)
        row[20] = "Introduction to Archery Course ($100); JOP Program; Try-it Nights";

        console.log("Updated Row 20:", row);
    }

    const newSheet = XLSX.utils.aoa_to_sheet(data);
    workbook.Sheets[sheetName] = newSheet;
    XLSX.writeFile(workbook, filename);
    console.log("File saved.");
} catch (e) {
    console.error("Error:", e.message);
}
