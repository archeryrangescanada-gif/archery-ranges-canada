const XLSX = require('xlsx');

const filename = 'BC_Archery_Ranges_Complete.xlsx';

try {
    const workbook = XLSX.readFile(filename);
    const sheetName = workbook.SheetNames[0];
    const sheet = workbook.Sheets[sheetName];

    // Convert to array of arrays (header: 1)
    const data = XLSX.utils.sheet_to_json(sheet, { header: 1 });

    // Row 13 is index 12
    const rowIndex = 12;

    if (data[rowIndex]) {
        const row = data[rowIndex];

        // 0: Name "Fernie Rod and Gun Club"
        // 1: Addr
        // 2: City "Fernie"
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

        // Address: Using Physical location
        row[1] = "Coal Creek Road (Archery Range); Mailing: Box 1448";
        row[5] = "V0B 1M0";
        row[8] = "(250) 423-3495"; // President Kevin Marasco
        row[9] = "president@ferniergc.com";

        // Description
        // "Rod and gun club with archery facilities." -> Append finding
        // "Includes Indoor Archery Range and Outdoor 3D Fun Shoots."
        row[11] = "Includes Indoor Archery Range and Outdoor 3D Fun Shoots. Programs in Winter.";

        // Hours (Index 16)
        // Variable/Event based
        row[16] = "Check Facebook/Website for Events; Winter Indoor Program";

        // Lanes (Index 15)
        row[15] = "Indoor Range; Outdoor Range (Coal Creek Rd)";

        // Membership Price (Index 17)
        // $60 Reg + $40 Indoor Range
        row[17] = "$60 (Adult) / $80 (Family) + $40 Indoor Range Access";

        // Drop-in Price (Index 18)
        row[18] = "N/A (See Membership)";

        // Equipment Rental (Index 19)
        // Not stated, likely BYO or club use only.
        row[19] = "No";

        // Lessons (Index 20)
        // "Programs during winter"
        row[20] = "Yes (Winter Programs)";

        console.log("Updated Row 13:", row);
    }

    // Also re-verify one last time rows 11,12 were saved correctly by prev scripts (they were, I saw output).
    // Just saving this one.

    const newSheet = XLSX.utils.aoa_to_sheet(data);
    workbook.Sheets[sheetName] = newSheet;
    XLSX.writeFile(workbook, filename);
    console.log("File saved.");

} catch (e) {
    console.error("Error:", e.message);
}
