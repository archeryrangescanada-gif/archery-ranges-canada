const XLSX = require('xlsx');
const filename = 'BC_Archery_Ranges_Complete.xlsx';

try {
    const workbook = XLSX.readFile(filename);
    const sheetName = workbook.SheetNames[0];
    const sheet = workbook.Sheets[sheetName];
    const data = XLSX.utils.sheet_to_json(sheet, { header: 1 });

    // Row 38 is index 37
    const rowIndex = 37;
    if (data[rowIndex]) {
        const row = data[rowIndex];

        row[1] = "Thornhill Junior Secondary (Indoor); 3577 Rifle Range Road (Outdoor)";
        row[5] = "V8G 3P1 (Outdoor)";
        row[8] = "N/A";
        row[9] = "b_gibson87@hotmail.com";
        row[10] = "https://www.terrace-archery.com/";

        // Description
        row[11] = "Indoor range (Nov-Apr) and outdoor range adjacent to Rod & Gun Club. Active JOP program and annual 3D competition.";

        // Facility Type
        row[12] = "Indoor/Outdoor";

        // Hours (Index 16 assumed)
        row[16] = "Indoor season: Nov-Apr; Outdoor available year-round";

        // Lanes/Distances (Index 15)
        row[15] = "Indoor Range; Outdoor Target & Field Ranges";

        // Membership Price (Index 17)
        row[17] = "Check website for current fees";

        // Drop-in Price (Index 18)
        row[18] = "N/A";

        // Equipment Rental (Index 19)
        row[19] = "Yes (Available during JOP and specific sessions)";

        // Lessons (Index 20)
        row[20] = "Junior Olympic Program (JOP); Introductory coaching available";

        console.log("Updated Row 38:", row[0]);
    }

    const newSheet = XLSX.utils.aoa_to_sheet(data);
    workbook.Sheets[sheetName] = newSheet;
    XLSX.writeFile(workbook, filename);
    console.log("File saved.");
} catch (e) {
    console.error("Error:", e.message);
}
