const XLSX = require('xlsx');

const filename = 'BC_Archery_Ranges_Complete.xlsx';

try {
    const workbook = XLSX.readFile(filename);
    const sheetName = workbook.SheetNames[0];
    const sheet = workbook.Sheets[sheetName];

    // Convert to array of arrays (header: 1)
    const data = XLSX.utils.sheet_to_json(sheet, { header: 1 });

    // Row 12 is index 11
    const rowIndex = 11;

    if (data[rowIndex]) {
        const row = data[rowIndex];

        // 0: Name "Cowichan Bowmen"
        // 1: Addr "3044 Doupe Rd"
        // 2: City "Duncan"
        // 3: Prov
        // 4: Country
        // 5: Postal "V9L 6R8"
        // 6: Lat
        // 7: Long
        // 8: Phone "+12508823220"
        // 9: Email "president@..."
        // 10: Web
        // 11: Desc
        // 12: Type

        // Address matches search (3044 Doupe Rd).

        // Phone: Existing is +12508823220. I will format it nicely: "(250) 882-3220"
        row[8] = "(250) 882-3220";

        // Hours (Index 16)
        // Family Night Tue/Thu 6-8PM; Members 24/7? (Year round).
        row[16] = "Family Night (Drop-in): Tue 6-7:15PM, Thu 6-8PM; Members: Year-round access";

        // Lanes (Index 15)
        // Research: 10-lane indoor (18m), 3-acre outdoor target, 16-target field course.
        row[15] = "10-lane Indoor (18m); 3-acre Outdoor Target; 16-target Field Course";

        // Membership Price (Index 17)
        // $150 Adult, $200 Family, $100 Senior
        row[17] = "$150 (Adult) / $200 (Family) / $100 (Senior)";

        // Drop-in Price (Index 18)
        // $5.00
        row[18] = "$5.00 (Family Night - Includes Equipment)";

        // Equipment Rental (Index 19)
        // Included in drop-in.
        row[19] = "Yes (During Family Night)";

        // Lessons (Index 20)
        // Family night instruction, JOP.
        row[20] = "Intro Instruction at Family Night; JOP Program (Mon)";

        console.log("Updated Row 12:", row);
    }

    const newSheet = XLSX.utils.aoa_to_sheet(data);
    workbook.Sheets[sheetName] = newSheet;
    XLSX.writeFile(workbook, filename);
    console.log("File saved.");

} catch (e) {
    console.error("Error:", e.message);
}
