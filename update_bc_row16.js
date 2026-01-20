const XLSX = require('xlsx');

const filename = 'BC_Archery_Ranges_Complete.xlsx';

try {
    const workbook = XLSX.readFile(filename);
    const sheetName = workbook.SheetNames[0];
    const sheet = workbook.Sheets[sheetName];

    // Convert to array of arrays (header: 1)
    const data = XLSX.utils.sheet_to_json(sheet, { header: 1 });

    // Row 16 is index 15
    const rowIndex = 15;

    if (data[rowIndex]) {
        const row = data[rowIndex];

        // 0: Name "The Feathered Fletch Archery School & Range"
        // 1: Addr "750 McClure Rd"
        // 2: City "Kelowna"
        // 3: Prov
        // 4: Country
        // 5: Postal "V1W 1M3"
        // 6: Lat
        // 7: Long
        // 8: Phone "+13065704056"
        // 9: Email "admin@..."
        // 10: Web
        // 11: Desc
        // 12: Type

        row[8] = "(306) 570-4056";

        // Hours (Index 16 assumed)
        row[16] = "Mon-Sat 8 AM-7 PM; Sun Closed";

        // Lanes/Distances (Index 15)
        // Accommodates up to 30 shooters in group events.
        row[15] = "Indoor & Outdoor Instruction; Group events up to 30 shooters";

        // Membership Price (Index 17)
        row[17] = "N/A (Primarily Class/Program based)";

        // Drop-in Price (Index 18)
        row[18] = "$55 (Workshop Drop-in); $15 (Summer Shoots)";

        // Equipment Rental (Index 19)
        row[19] = "Yes (Included in Lessons/Programs)";

        // Lessons (Index 20)
        row[20] = "Full Courses ($245-$280); Summer Shoots ($15); Group Events";

        console.log("Updated Row 16:", row);
    }

    const newSheet = XLSX.utils.aoa_to_sheet(data);
    workbook.Sheets[sheetName] = newSheet;
    XLSX.writeFile(workbook, filename);
    console.log("File saved.");

} catch (e) {
    console.error("Error:", e.message);
}
