const XLSX = require('xlsx');
const filename = 'BC_Archery_Ranges_Complete.xlsx';

try {
    const workbook = XLSX.readFile(filename);
    const sheetName = workbook.SheetNames[0];
    const sheet = workbook.Sheets[sheetName];
    const data = XLSX.utils.sheet_to_json(sheet, { header: 1 });

    // Rows 32, 33, 34 are indices 31, 32, 33
    console.log("\n--- Row 32 (Index 31) ---");
    console.log(JSON.stringify(data[31], null, 2));

    console.log("\n--- Row 33 (Index 32) ---");
    console.log(JSON.stringify(data[32], null, 2));

    console.log("\n--- Row 34 (Index 33) ---");
    console.log(JSON.stringify(data[33], null, 2));
} catch (e) {
    console.error("Error reading file:", e.message);
}
