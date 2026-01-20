const XLSX = require('xlsx');
const filename = 'BC_Archery_Ranges_Complete.xlsx';

try {
    const workbook = XLSX.readFile(filename);
    const sheetName = workbook.SheetNames[0];
    const sheet = workbook.Sheets[sheetName];
    const data = XLSX.utils.sheet_to_json(sheet, { header: 1 });

    // Rows 26, 27, 28 are indices 25, 26, 27
    console.log("\n--- Row 26 (Index 25) ---");
    console.log(JSON.stringify(data[25], null, 2));

    console.log("\n--- Row 27 (Index 26) ---");
    console.log(JSON.stringify(data[26], null, 2));

    console.log("\n--- Row 28 (Index 27) ---");
    console.log(JSON.stringify(data[27], null, 2));
} catch (e) {
    console.error("Error reading file:", e.message);
}
