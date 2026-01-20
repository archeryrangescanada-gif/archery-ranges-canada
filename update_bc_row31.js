const XLSX = require('xlsx');
const filename = 'BC_Archery_Ranges_Complete.xlsx';

try {
    const workbook = XLSX.readFile(filename);
    const sheetName = workbook.SheetNames[0];
    const sheet = workbook.Sheets[sheetName];
    const data = XLSX.utils.sheet_to_json(sheet, { header: 1 });

    // Row 31 is index 30
    const rowIndex = 30;
    if (data[rowIndex]) {
        const row = data[rowIndex];

        row[1] = "160 Barlow Ave (Indoor); Campsite Rd (Outdoor); Sword Ave (Fita)";
        row[5] = "V2J 3J4 (Mailing)";
        row[8] = "(250) 249-5623 (Dale Chapplow)";
        row[9] = "quesnelriverarchers@gmail.com / dalechapplow2@gmail.com";
        row[10] = "https://www.facebook.com/groups/415123712208449";

        // Description
        row[11] = "Club with indoor facility at Barlow Ave (18m rounds) and outdoor/Fita ranges. Hosts BC championships.";

        // Facility Type
        row[12] = "Indoor/Outdoor";

        // Hours (Index 16 assumed)
        row[16] = "Indoor sessions typically Sat/Sun morning & afternoon; Outdoor dawn-dusk";

        // Lanes/Distances (Index 15)
        row[15] = "Indoor (18m); Outdoor (Pioneer Park); Fita Range";

        // Membership Price (Index 17)
        row[17] = "N/A (Membership through Archery Canada/BC Archery; check for club fees)";

        // Drop-in Price (Index 18)
        row[18] = "$5-$10 (Guest estimate based on local gun club; verify with Dale)";

        // Equipment Rental (Index 19)
        row[19] = "Yes (Available for specific children/beginner programs)";

        // Lessons (Index 20)
        row[20] = "Children's archery program (K-12); Contact for adult lessons";

        console.log("Updated Row 31:", row);
    }

    const newSheet = XLSX.utils.aoa_to_sheet(data);
    workbook.Sheets[sheetName] = newSheet;
    XLSX.writeFile(workbook, filename);
    console.log("File saved.");
} catch (e) {
    console.error("Error:", e.message);
}
