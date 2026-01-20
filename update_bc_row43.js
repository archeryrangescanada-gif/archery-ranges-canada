const XLSX = require('xlsx');
const filename = 'BC_Archery_Ranges_Complete.xlsx';

try {
    const workbook = XLSX.readFile(filename);
    const sheetName = workbook.SheetNames[0];
    const sheet = workbook.Sheets[sheetName];
    const data = XLSX.utils.sheet_to_json(sheet, { header: 1 });

    // Row 43 is index 42
    const rowIndex = 42;
    if (data[rowIndex]) {
        const row = data[rowIndex];

        row[1] = "2401 Burnside Rd W";
        row[5] = "V9B 6N1";
        row[8] = "(250) 727-8351";
        row[9] = "membership@victoriabowmen.com";
        row[10] = "https://www.victoriabowmen.com/";

        // Description
        row[11] = "Archery club in Victoria with range located near the handyDART Centre. Affiliated with BC Archery.";

        // Facility Type
        row[12] = "Outdoor Range";

        // Hours (Index 16 assumed)
        row[16] = "Members only access; Check website for schedule";

        // Lanes/Distances (Index 15)
        row[15] = "Outdoor Target Range";

        // Membership Price (Index 17)
        row[17] = "$115 (Senior >25) / $45 (Junior) / $240 (Family) + BCAA/AC Fees";

        // Drop-in Price (Index 18)
        row[18] = "N/A (Membership based)";

        // Equipment Rental (Index 19)
        row[19] = "No";

        // Lessons (Index 20)
        row[20] = "Occasional beginner programs; check website for availability";

        console.log("Updated Row 43:", row[0]);
    }

    const newSheet = XLSX.utils.aoa_to_sheet(data);
    workbook.Sheets[sheetName] = newSheet;
    XLSX.writeFile(workbook, filename);
    console.log("File saved.");
} catch (e) {
    console.error("Error:", e.message);
}
