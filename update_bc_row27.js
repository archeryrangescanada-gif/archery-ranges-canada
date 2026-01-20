const XLSX = require('xlsx');
const filename = 'BC_Archery_Ranges_Complete.xlsx';

try {
    const workbook = XLSX.readFile(filename);
    const sheetName = workbook.SheetNames[0];
    const sheet = workbook.Sheets[sheetName];
    const data = XLSX.utils.sheet_to_json(sheet, { header: 1 });

    // Row 27 is index 26
    const rowIndex = 26;
    if (data[rowIndex]) {
        const row = data[rowIndex];

        row[1] = "1245 Chattell Rd (Henry Range); 1979 Dorman Rd (Dorman Range)";
        row[5] = "V9P 2H1 (Mailing)";
        row[8] = "(250) 228-3877 (Office) / (250) 716-6431 (Caretaker)";
        row[9] = "info@pqfg.org / arrowsmitharchers@shaw.ca";
        row[10] = "https://pqfg.org/";

        // Description
        row[11] = "Indoor archery at Nanoose Pentecostal Camp (Sept-May) and two outdoor ranges (Henry & Dorman). Active JOP program.";

        // Facility Type
        row[12] = "Indoor/Outdoor";

        // Hours (Index 16 assumed)
        row[16] = "Indoor: Mon/Wed 6:00-8:00 PM; Outdoor: 9:00 AM-8:00 PM (Summer)";

        // Lanes/Distances (Index 15)
        row[15] = "Henry Range (10-70yds); Dorman Range (Field course & 3D)";

        // Membership Price (Index 17)
        row[17] = "$130 (Regular) / $50 (Junior) + $35 Key Fee";

        // Drop-in Price (Index 18)
        row[18] = "$20 (Guest day pass w/ member) / $10 (Member day pass)";

        // Equipment Rental (Index 19)
        row[19] = "Yes (Available at indoor range for beginners)";

        // Lessons (Index 20)
        row[20] = "Certified Coaches at indoor sessions; JOP Youth Program";

        console.log("Updated Row 27:", row);
    }

    const newSheet = XLSX.utils.aoa_to_sheet(data);
    workbook.Sheets[sheetName] = newSheet;
    XLSX.writeFile(workbook, filename);
    console.log("File saved.");
} catch (e) {
    console.error("Error:", e.message);
}
