const XLSX = require('xlsx');
const filename = 'BC_Archery_Ranges_Complete.xlsx';

try {
    const workbook = XLSX.readFile(filename);
    const sheetName = workbook.SheetNames[0];
    const sheet = workbook.Sheets[sheetName];
    const data = XLSX.utils.sheet_to_json(sheet, { header: 1 });

    // Rows 35, 36, 37 are indices 34, 35, 36
    console.log("\n--- Row 35 (Index 34) ---");
    console.log(JSON.stringify(data[34], null, 2));

    console.log("\n--- Row 36 (Index 35) ---");
    console.log(JSON.stringify(data[35], null, 2));

    console.log("\n--- Row 37 (Index 36) ---");
    console.log(JSON.stringify(data[36], null, 2));
} catch (e) {
    console.error("Error reading file:", e.message);
}
