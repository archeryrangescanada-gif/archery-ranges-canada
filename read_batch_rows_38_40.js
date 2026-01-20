const XLSX = require('xlsx');
const filename = 'BC_Archery_Ranges_Complete.xlsx';

try {
    const workbook = XLSX.readFile(filename);
    const sheetName = workbook.SheetNames[0];
    const sheet = workbook.Sheets[sheetName];
    const data = XLSX.utils.sheet_to_json(sheet, { header: 1 });

    // Rows 38, 39, 40 are indices 37, 38, 39
    console.log("\n--- Row 38 (Index 37) ---");
    console.log(JSON.stringify(data[37], null, 2));

    console.log("\n--- Row 39 (Index 38) ---");
    console.log(JSON.stringify(data[38], null, 2));

    console.log("\n--- Row 40 (Index 39) ---");
    console.log(JSON.stringify(data[39], null, 2));
} catch (e) {
    console.error("Error reading file:", e.message);
}
