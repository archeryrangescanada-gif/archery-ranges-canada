const XLSX = require('xlsx');
const filename = 'BC_Archery_Ranges_Complete.xlsx';

try {
    const workbook = XLSX.readFile(filename);
    const sheetName = workbook.SheetNames[0];
    const sheet = workbook.Sheets[sheetName];
    const data = XLSX.utils.sheet_to_json(sheet, { header: 1 });

    // Row 42 is index 41
    const rowIndex = 41;
    if (data[rowIndex]) {
        const row = data[rowIndex];

        row[1] = "3501 Quail Road";
        row[5] = "V0J 3A0";
        row[8] = "(250) 570-9280";
        row[9] = "N/A";
        // Website? affiliated with NVSA.
        row[10] = "N/A (Affiliated with NVSA)";

        // Description
        row[11] = "Outdoor archery range located at the Nechako Valley Sporting Association grounds.";

        // Facility Type
        row[12] = "Outdoor Range";

        // Hours (Index 16 assumed)
        row[16] = "Check with club for members' access";

        // Lanes/Distances (Index 15)
        row[15] = "Outdoor Range";

        // Membership Price (Index 17)
        row[17] = "Contact club for current membership rates";

        // Drop-in Price (Index 18)
        row[18] = "N/A";

        // Equipment Rental (Index 19)
        row[19] = "No";

        // Lessons (Index 20)
        row[20] = "N/A";

        console.log("Updated Row 42:", row[0]);
    }

    const newSheet = XLSX.utils.aoa_to_sheet(data);
    workbook.Sheets[sheetName] = newSheet;
    XLSX.writeFile(workbook, filename);
    console.log("File saved.");
} catch (e) {
    console.error("Error:", e.message);
}
