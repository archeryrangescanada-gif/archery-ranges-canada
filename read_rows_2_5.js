const XLSX = require('xlsx');
const filename = 'BC_Archery_Ranges_Complete.xlsx';

try {
    const workbook = XLSX.readFile(filename);
    const sheetName = workbook.SheetNames[0];
    const sheet = workbook.Sheets[sheetName];
    const data = XLSX.utils.sheet_to_json(sheet, { header: 1 });

    // Rows 2-5 correspond to indices 1-4
    for (let i = 1; i <= 4; i++) {
        console.log(`\n--- Row ${i + 1} (Index ${i}) ---`);
        if (data[i]) {
            console.log(JSON.stringify(data[i], null, 2));
        } else {
            console.log("Row is empty.");
        }
    }
} catch (e) {
    console.error("Error reading file:", e.message);
}
