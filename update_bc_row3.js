const XLSX = require('xlsx');
const filename = 'BC_Archery_Ranges_Complete.xlsx';

try {
    const workbook = XLSX.readFile(filename);
    const sheetName = workbook.SheetNames[0];
    const sheet = workbook.Sheets[sheetName];
    const data = XLSX.utils.sheet_to_json(sheet, { header: 1 });

    // Row 3 is index 2
    const rowIndex = 2;
    if (data[rowIndex]) {
        const row = data[rowIndex];

        row[1] = "N/A (See Starr Archery or Abbotsford Fish & Game)";
        row[5] = "N/A";
        row[8] = "N/A";
        row[9] = "N/A";
        row[10] = "N/A";

        // Description
        row[11] = "Likely a generic reference or closed business. See Starr Archery or Abbotsford Fish & Game for active local ranges.";

        // Facility Type
        row[12] = "N/A";

        // Other fields n/a
        row[16] = "N/A";
        row[15] = "N/A";
        row[17] = "N/A";
        row[18] = "N/A";
        row[19] = "N/A";
        row[20] = "N/A";

        console.log("Updated Row 3:", row[0]);
    }

    const newSheet = XLSX.utils.aoa_to_sheet(data);
    workbook.Sheets[sheetName] = newSheet;
    XLSX.writeFile(workbook, filename);
    console.log("File saved.");
} catch (e) {
    console.error("Error:", e.message);
}
