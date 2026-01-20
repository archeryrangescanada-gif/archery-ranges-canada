const XLSX = require('xlsx');

const filename = 'BC_Archery_Ranges_Complete.xlsx';

try {
    const workbook = XLSX.readFile(filename);
    const sheetName = workbook.SheetNames[0];
    const sheet = workbook.Sheets[sheetName];

    // Convert to JSON
    const data = XLSX.utils.sheet_to_json(sheet, { header: 1 });

    // Rows 14, 15, 16 are indices 13, 14, 15
    console.log("\n--- Row 14 (Index 13) ---");
    console.log(JSON.stringify(data[13], null, 2));

    console.log("\n--- Row 15 (Index 14) ---");
    console.log(JSON.stringify(data[14], null, 2));

    console.log("\n--- Row 16 (Index 15) ---");
    console.log(JSON.stringify(data[15], null, 2));

} catch (e) {
    console.error("Error reading file:", e.message);
}
