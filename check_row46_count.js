const XLSX = require('xlsx');
const filename = 'BC_Archery_Ranges_Complete.xlsx';

try {
    const workbook = XLSX.readFile(filename);
    const sheetName = workbook.SheetNames[0];
    const sheet = workbook.Sheets[sheetName];
    const data = XLSX.utils.sheet_to_json(sheet, { header: 1 });

    console.log("Total rows found:", data.length);
    if (data[45]) {
        console.log("Row 46 (Index 45) Name:", data[45][0]);
    } else {
        console.log("Row 46 (Index 45) is undefined or empty.");
    }
} catch (e) {
    console.error(e.message);
}
