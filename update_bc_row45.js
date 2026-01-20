const XLSX = require('xlsx');
const filename = 'BC_Archery_Ranges_Complete.xlsx';

try {
    const workbook = XLSX.readFile(filename);
    const sheetName = workbook.SheetNames[0];
    const sheet = workbook.Sheets[sheetName];
    const data = XLSX.utils.sheet_to_json(sheet, { header: 1 });

    // Row 45 is index 44
    const rowIndex = 44;
    if (data[rowIndex]) {
        const row = data[rowIndex];

        row[1] = "920 Bond Lake Road (Clubhouse/Range)";
        row[5] = "V2G 2V2";
        row[8] = "(250) 392-9695 (Al) / (250) 398-5691 (Lee)";
        row[9] = "al.campsall@gmail.com / wlsajop@gmail.com";
        row[10] = "https://wlsa.ca/caribooarchers/";

        // Description
        row[11] = "Part of Williams Lake Sportsmen's Association. JOP youth program, ladies lessons, and indoor/outdoor facilities.";

        // Facility Type
        row[12] = "Indoor/Outdoor";

        // Hours (Index 16 assumed)
        row[16] = "Wed 7:00 PM; Sun 2:00 PM; JOP Thu evening";

        // Lanes/Distances (Index 15)
        row[15] = "Indoor & Outdoor Ranges";

        // Membership Price (Index 17)
        row[17] = "WLSA Membership (approx. $10-$11/mo) + Cariboo Archers fee";

        // Drop-in Price (Index 18)
        row[18] = "N/A (Members & guests only; no day passes)";

        // Equipment Rental (Index 19)
        row[19] = "Yes (Available for JOP and specified lessons)";

        // Lessons (Index 20)
        row[20] = "Ladies Lessons; Junior Olympian Program (JOP)";

        console.log("Updated Row 45:", row[0]);
    }

    const newSheet = XLSX.utils.aoa_to_sheet(data);
    workbook.Sheets[sheetName] = newSheet;
    XLSX.writeFile(workbook, filename);
    console.log("File saved.");
} catch (e) {
    console.error("Error:", e.message);
}
