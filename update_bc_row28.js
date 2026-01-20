const XLSX = require('xlsx');
const filename = 'BC_Archery_Ranges_Complete.xlsx';

try {
    const workbook = XLSX.readFile(filename);
    const sheetName = workbook.SheetNames[0];
    const sheet = workbook.Sheets[sheetName];
    const data = XLSX.utils.sheet_to_json(sheet, { header: 1 });

    // Row 28 is index 27
    const rowIndex = 27;
    if (data[rowIndex]) {
        const row = data[rowIndex];

        row[1] = "1787 Highway 97";
        row[5] = "V2A 6K6 (Mailing)";
        row[8] = "(250) 328-8619 (Office) / (778) 930-7177 (Greg)";
        row[9] = "gregghar66@gmail.com";
        row[10] = "https://www.pentictonshootingsports.com/archery/";

        // Description
        row[11] = "Indoor 20yd range (winter) and outdoor range (summer, 20-70yds). Greg Seib is the Director.";

        // Facility Type
        row[12] = "Indoor/Outdoor";

        // Hours (Index 16 assumed)
        row[16] = "Wed 7:00-9:00 PM; Sat 2:00-4:00 PM";

        // Lanes/Distances (Index 15)
        row[15] = "Indoor: 20yds; Outdoor: 20-70yds";

        // Membership Price (Index 17)
        row[17] = "$125 (Adult) / $165 (Family) / $80 (Junior/Student/Senior)";

        // Drop-in Price (Index 18)
        row[18] = "$5.00 for non-members (per night)";

        // Equipment Rental (Index 19)
        row[19] = "Yes (Recurve bows available for beginners to try)";

        // Lessons (Index 20)
        row[20] = "Informal assistance for beginners; no formal structured lessons listed";

        console.log("Updated Row 28:", row);
    }

    const newSheet = XLSX.utils.aoa_to_sheet(data);
    workbook.Sheets[sheetName] = newSheet;
    XLSX.writeFile(workbook, filename);
    console.log("File saved.");
} catch (e) {
    console.error("Error:", e.message);
}
