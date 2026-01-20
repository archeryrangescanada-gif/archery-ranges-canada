const XLSX = require('xlsx');
const filename = 'BC_Archery_Ranges_Complete.xlsx';

try {
    const workbook = XLSX.readFile(filename);
    const sheetName = workbook.SheetNames[0];
    const sheet = workbook.Sheets[sheetName];
    const data = XLSX.utils.sheet_to_json(sheet, { header: 1 });

    // Rows 29, 30, 31 are indices 28, 29, 30
    console.log("\n--- Row 29 (Index 28) ---");
    console.log(JSON.stringify(data[28], null, 2));

    console.log("\n--- Row 30 (Index 29) ---");
    console.log(JSON.stringify(data[29], null, 2));

    console.log("\n--- Row 31 (Index 30) ---");
    console.log(JSON.stringify(data[30], null, 2));
} catch (e) {
    console.error("Error reading file:", e.message);
}
