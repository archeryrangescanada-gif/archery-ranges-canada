const XLSX = require('xlsx');
const filename = 'BC_Archery_Ranges_Complete.xlsx';

try {
    const workbook = XLSX.readFile(filename);
    const sheetName = workbook.SheetNames[0];
    const sheet = workbook.Sheets[sheetName];
    const data = XLSX.utils.sheet_to_json(sheet, { header: 1 });

    // Rows 20, 21, 22 are indices 19, 20, 21
    console.log("\n--- Row 20 (Index 19) ---");
    console.log(JSON.stringify(data[19], null, 2));

    console.log("\n--- Row 21 (Index 20) ---");
    console.log(JSON.stringify(data[20], null, 2));

    console.log("\n--- Row 22 (Index 21) ---");
    console.log(JSON.stringify(data[21], null, 2));
} catch (e) {
    console.error("Error reading file:", e.message);
}
