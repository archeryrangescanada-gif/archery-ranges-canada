const XLSX = require('xlsx');
const filename = 'BC_Archery_Ranges_Complete.xlsx';

try {
    const workbook = XLSX.readFile(filename);
    const sheetName = workbook.SheetNames[0];
    const sheet = workbook.Sheets[sheetName];
    const data = XLSX.utils.sheet_to_json(sheet, { header: 1 });

    // Rows 41, 42, 43 are indices 40, 41, 42
    console.log("\n--- Row 41 (Index 40) ---");
    console.log(JSON.stringify(data[40], null, 2));

    console.log("\n--- Row 42 (Index 41) ---");
    console.log(JSON.stringify(data[41], null, 2));

    console.log("\n--- Row 43 (Index 42) ---");
    console.log(JSON.stringify(data[42], null, 2));
} catch (e) {
    console.error("Error reading file:", e.message);
}
