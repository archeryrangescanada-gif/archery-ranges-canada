const XLSX = require('xlsx');

const filename = 'BC_Archery_Ranges_Complete.xlsx';

try {
    const workbook = XLSX.readFile(filename);
    const sheetName = workbook.SheetNames[0];
    const sheet = workbook.Sheets[sheetName];

    // Convert to array of arrays (header: 1)
    const data = XLSX.utils.sheet_to_json(sheet, { header: 1 });

    // Row 11 is index 10
    const rowIndex = 10;

    if (data[rowIndex]) {
        const row = data[rowIndex];

        // 0: Name "Cranbrook Archery Club"
        // 1: Addr
        // 2: City "Cranbrook"
        // 3: Prov
        // 4: Country
        // 5: Postal
        // 6: Lat
        // 7: Long
        // 8: Phone
        // 9: Email
        // 10: Web
        // 11: Desc
        // 12: Type

        row[1] = "2279 Cranbrook St N";
        row[5] = "V1C 3T3";
        row[8] = "N/A"; // No direct phone found
        row[9] = "cranbrookarcherysecretary@gmail.com";

        // Description: append hours info maybe?
        // Existing description is good.

        // Hours (Index 16 assumed from previous rows)
        if (!row[16] || row[16].trim() === '') {
            row[16] = "Club Night: Tue 7-9PM; See website for events";
        }

        // Lanes (Index 15)
        // Research: Indoor 18m, Outdoor?
        row[15] = "Indoor 18m Range; Outdoor Range";

        // Membership Price (Index 17)
        row[17] = "$15 (Individual) / $25 (Family) + BC Archery Fee";

        // Drop-in Price (Index 18)
        row[18] = "N/A";

        // Equipment Rental (Index 19)
        // Not explicitly stated as available for general rental, mostly for youth/events?
        // Let's mark N/A to be safe or "For events". Row 11 had "No" in index 19 originally. 
        // I'll stick with "No" or N/A unless I'm sure.
        row[19] = "No";

        // Lessons (Index 20)
        // "Yes"
        row[20] = "Yes (Youth Program)";

        console.log("Updated Row 11:", row);
    }

    const newSheet = XLSX.utils.aoa_to_sheet(data);
    workbook.Sheets[sheetName] = newSheet;
    XLSX.writeFile(workbook, filename);
    console.log("File saved.");

} catch (e) {
    console.error("Error:", e.message);
}
