const XLSX = require('xlsx');
const filename = 'BC_Archery_Ranges_Complete.xlsx';

try {
    const workbook = XLSX.readFile(filename);
    const sheetName = workbook.SheetNames[0];
    const sheet = workbook.Sheets[sheetName];
    const data = XLSX.utils.sheet_to_json(sheet, { header: 1 });

    // Row 26 is index 25
    const rowIndex = 25;
    if (data[rowIndex]) {
        const row = data[rowIndex];

        row[1] = "352 Sportsmen's Bowl Road (Outdoor); 5856 Cessna Street (Indoor)";
        row[5] = "V0H 1T5 (Outdoor)";
        // Phone numbers for Trap directors Al/Ed found, but not a direct archery phone. 
        // I will list the Amos Realty phone for membership if appropriate, but email is better for archery.
        row[8] = "(250) 498-4844 (Amos Realty for Membership)";
        row[9] = "ost287642@gmail.com / mostermeier49@gmail.com";
        row[10] = "http://www.okanagansportsmen.com/archery.html";

        // Description
        row[11] = "Indoor archery at Air Cadet Building (Oct+) and Outdoor range (365 days). Dedicated crossbow/broadhead areas. Active JOP.";

        // Facility Type
        row[12] = "Indoor/Outdoor";

        // Hours (Index 16 assumed)
        row[16] = "Outdoor: 8AM-9PM; Indoor: Mon & Thu nights (from 6 PM)";

        // Lanes/Distances (Index 15)
        row[15] = "Outdoor: Crossbow butt, Broadhead pit, target butts; Indoor: Air Cadet Bldg";

        // Membership Price (Index 17)
        row[17] = "$125 (Regular) / $165 (Family) / $95 (Junior) / $115 (Senior)";

        // Drop-in Price (Index 18)
        row[18] = "$10 (Guest) / $6 (Member/Youth) / $7 (BC Archery Member)";

        // Equipment Rental (Index 19)
        row[19] = "Yes ($5.00 for indoor sessions)";

        // Lessons (Index 20)
        row[20] = "Certified NCCP Coaches; JOP Youth Program (Thu)";

        console.log("Updated Row 26:", row);
    }

    const newSheet = XLSX.utils.aoa_to_sheet(data);
    workbook.Sheets[sheetName] = newSheet;
    XLSX.writeFile(workbook, filename);
    console.log("File saved.");
} catch (e) {
    console.error("Error:", e.message);
}
