const XLSX = require('xlsx');
const filename = 'BC_Archery_Ranges_Complete.xlsx';

try {
    const workbook = XLSX.readFile(filename);
    const sheetName = workbook.SheetNames[0];
    const sheet = workbook.Sheets[sheetName];
    const data = XLSX.utils.sheet_to_json(sheet, { header: 1 });

    console.log("--- Headers ---");
    // Column W is index 22. Let's show headers from index 20 onwards
    const headers = data[0];
    for (let i = 20; i < headers.length; i++) {
        console.log(`Index ${i} (${String.fromCharCode(65 + i)}? no that logic is simple, let's just say Index): ${headers[i]}`);
    }

    // Rows 11-13 are indices 10-12
    for (let i = 10; i <= 12; i++) {
        console.log(`\n--- Row ${i + 1} (Index ${i}) ---`);
        console.log(JSON.stringify(data[i], null, 2));
    }
} catch (e) {
    console.error("Error reading file:", e.message);
}
