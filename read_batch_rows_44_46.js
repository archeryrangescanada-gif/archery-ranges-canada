const XLSX = require('xlsx');
const filename = 'BC_Archery_Ranges_Complete.xlsx';

try {
    const workbook = XLSX.readFile(filename);
    const sheetName = workbook.SheetNames[0];
    const sheet = workbook.Sheets[sheetName];
    const data = XLSX.utils.sheet_to_json(sheet, { header: 1 });

    // Rows 44, 45, 46 are indices 43, 44, 45
    console.log("\n--- Row 44 (Index 43) ---");
    console.log(JSON.stringify(data[43], null, 2));

    console.log("\n--- Row 45 (Index 44) ---");
    console.log(JSON.stringify(data[44], null, 2));

    console.log("\n--- Row 46 (Index 45) ---");
    console.log(JSON.stringify(data[45], null, 2));
} catch (e) {
    console.error("Error reading file:", e.message);
}
