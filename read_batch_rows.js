const XLSX = require('xlsx');

const filename = 'BC_Archery_Ranges_Complete.xlsx';

try {
    const workbook = XLSX.readFile(filename);
    const sheetName = workbook.SheetNames[0];
    const sheet = workbook.Sheets[sheetName];

    // Convert to JSON
    const data = XLSX.utils.sheet_to_json(sheet, { header: 1 });

    // Rows 11, 12, 13 are indices 10, 11, 12
    console.log("\n--- Row 11 (Index 10) ---");
    console.log(JSON.stringify(data[10], null, 2));

    console.log("\n--- Row 12 (Index 11) ---");
    console.log(JSON.stringify(data[11], null, 2));

    console.log("\n--- Row 13 (Index 12) ---");
    console.log(JSON.stringify(data[12], null, 2));

} catch (e) {
    console.error("Error reading file:", e.message);
}
