const XLSX = require('xlsx');
const filename = 'BC_Archery_Ranges_Complete.xlsx';

try {
    const workbook = XLSX.readFile(filename);
    const sheetName = workbook.SheetNames[0];
    const sheet = workbook.Sheets[sheetName];
    const data = XLSX.utils.sheet_to_json(sheet, { header: 1 });

    // Rows 17, 18, 19 are indices 16, 17, 18
    console.log("\n--- Row 17 (Index 16) ---");
    console.log(JSON.stringify(data[16], null, 2));

    console.log("\n--- Row 18 (Index 17) ---");
    console.log(JSON.stringify(data[17], null, 2));

    console.log("\n--- Row 19 (Index 18) ---");
    console.log(JSON.stringify(data[18], null, 2));
} catch (e) {
    console.error("Error reading file:", e.message);
}
