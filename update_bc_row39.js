const XLSX = require('xlsx');
const filename = 'BC_Archery_Ranges_Complete.xlsx';

try {
    const workbook = XLSX.readFile(filename);
    const sheetName = workbook.SheetNames[0];
    const sheet = workbook.Sheets[sheetName];
    const data = XLSX.utils.sheet_to_json(sheet, { header: 1 });

    // Row 39 is index 38
    const rowIndex = 38;
    if (data[rowIndex]) {
        const row = data[rowIndex];

        row[1] = "3430 Casino Road (Casino Range)";
        row[5] = "V1R 4X3";
        row[8] = "N/A";
        row[9] = "WestKootenayarchers@gmail.com";
        row[10] = "https://www.facebook.com/westkootenayarchers";

        // Description
        row[11] = "Casino Range managed by Trail Wildlife Association. Outdoor target and 3D courses (3 courses with 15 targets each).";

        // Facility Type
        row[12] = "Outdoor Range";

        // Hours (Index 16 assumed)
        row[16] = "Dawn to dusk; Check TWA range closure schedule";

        // Lanes/Distances (Index 15)
        row[15] = "3 Outdoor 3D Courses (15 targets each)";

        // Membership Price (Index 17)
        row[17] = "Requires WKA or TWA Membership (approx. $20-$40 for events)";

        // Drop-in Price (Index 18)
        row[18] = "$10-$20 (Event-based drop-in)";

        // Equipment Rental (Index 19)
        row[19] = "No";

        // Lessons (Index 20)
        row[20] = "Occasional archery days and instruction; summer camps for youth";

        console.log("Updated Row 39:", row[0]);
    }

    const newSheet = XLSX.utils.aoa_to_sheet(data);
    workbook.Sheets[sheetName] = newSheet;
    XLSX.writeFile(workbook, filename);
    console.log("File saved.");
} catch (e) {
    console.error("Error:", e.message);
}
