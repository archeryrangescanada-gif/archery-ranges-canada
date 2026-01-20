const XLSX = require('xlsx');
const filename = 'BC_Archery_Ranges_Complete.xlsx';

try {
    const workbook = XLSX.readFile(filename);
    const sheetName = workbook.SheetNames[0];
    const sheet = workbook.Sheets[sheetName];
    const data = XLSX.utils.sheet_to_json(sheet, { header: 1 });

    // Row 23 is index 22
    const rowIndex = 22;
    if (data[rowIndex]) {
        const row = data[rowIndex];

        row[1] = "801 Railway St (Indoor); 124 Porto Rico Rd (Outdoor)";
        row[5] = "V1L 5P7 (Mailing)";
        row[8] = "(250) 551-7414 (Alan) / (250) 551-7562 (Warren)";
        row[9] = "Membership@nrgcbc.ca / nelsonbcarchery@gmail.com";
        row[10] = "http://www.nrgcbc.ca/";

        // Description
        row[11] = "Indoor range (801 Railway St) and Outdoor range (Porto Rico Rd) with 14 stations. Masks required indoors.";

        // Facility Type
        row[12] = "Indoor/Outdoor";

        // Hours (Index 16 assumed)
        row[16] = "Outdoor: 7:30 AM-Dusk; Clubhouse: Wed-Sun 10 AM-3 PM (verify)";

        // Lanes/Distances (Index 15)
        row[15] = "Indoor Range (5 archers); Outdoor (14 stations/15 targets)";

        // Membership Price (Index 17)
        row[17] = "$85 (Individual) / $110 (Family) / $30 (Junior)";

        // Drop-in Price (Index 18)
        row[18] = "N/A (Membership required; guest fees apply)";

        // Equipment Rental (Index 19)
        row[19] = "Yes (During Saturday beginner sessions)";

        // Lessons (Index 20)
        row[20] = "Beginner sessions (Sat 11 AM-Noon; contact Greg)";

        console.log("Updated Row 23:", row);
    }

    const newSheet = XLSX.utils.aoa_to_sheet(data);
    workbook.Sheets[sheetName] = newSheet;
    XLSX.writeFile(workbook, filename);
    console.log("File saved.");
} catch (e) {
    console.error("Error:", e.message);
}
