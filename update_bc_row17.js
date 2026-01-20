const XLSX = require('xlsx');
const filename = 'BC_Archery_Ranges_Complete.xlsx';

try {
    const workbook = XLSX.readFile(filename);
    const sheetName = workbook.SheetNames[0];
    const sheet = workbook.Sheets[sheetName];
    const data = XLSX.utils.sheet_to_json(sheet, { header: 1 });

    // Row 17 is index 16
    const rowIndex = 16;
    if (data[rowIndex]) {
        const row = data[rowIndex];

        row[1] = "4041 Casorso Rd";
        row[5] = "V1W 4N6";
        row[8] = "(250) 764-7558";
        row[9] = "info@kdfgc.org";
        row[10] = "https://kdfgc.org/";

        // Description
        row[11] = "Extensive archery facilities including indoor range, 3D course, and field range. Scheduled league nights.";

        // Facility Type
        row[12] = "Indoor/Outdoor";

        // Hours (Index 16 assumed)
        row[16] = "Weekdays 9:00AM-8:00PM; Weekends 9:00AM-5:00PM; Indoor scheduled";

        // Lanes/Distances (Index 15)
        row[15] = "Indoor Range; Lower/Upper Ranges; 3D Range; Field Range";

        // Membership Price (Index 17)
        row[17] = "$355 (Adult + Spouse) / $405 (Family) / $65 (Junior)";

        // Drop-in Price (Index 18)
        row[18] = "$25 (Adult Guest) / $5 (Junior Guest) - must be with member";

        // Equipment Rental (Index 19)
        row[19] = "Yes (During JOP/Intro Programs)";

        // Lessons (Index 20)
        row[20] = "BCAA Adult Archery; BCAA JOP Program";

        console.log("Updated Row 17:", row);
    }

    const newSheet = XLSX.utils.aoa_to_sheet(data);
    workbook.Sheets[sheetName] = newSheet;
    XLSX.writeFile(workbook, filename);
    console.log("File saved.");
} catch (e) {
    console.error("Error:", e.message);
}
