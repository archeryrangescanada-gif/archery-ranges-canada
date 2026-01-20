const XLSX = require('xlsx');
const filename = 'BC_Archery_Ranges_Complete.xlsx';

try {
    const workbook = XLSX.readFile(filename);
    const sheetName = workbook.SheetNames[0];
    const sheet = workbook.Sheets[sheetName];
    const data = XLSX.utils.sheet_to_json(sheet, { header: 1 });

    // Rows 23, 24, 25 are indices 22, 23, 24
    console.log("\n--- Row 23 (Index 22) ---");
    console.log(JSON.stringify(data[22], null, 2));

    console.log("\n--- Row 24 (Index 23) ---");
    console.log(JSON.stringify(data[23], null, 2));

    console.log("\n--- Row 25 (Index 24) ---");
    console.log(JSON.stringify(data[24], null, 2));
} catch (e) {
    console.error("Error reading file:", e.message);
}
