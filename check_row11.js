const XLSX = require('xlsx');

const filename = 'BC_Archery_Ranges_Complete.xlsx';

try {
    const workbook = XLSX.readFile(filename);
    const sheetName = workbook.SheetNames[0];
    const sheet = workbook.Sheets[sheetName];
    const data = XLSX.utils.sheet_to_json(sheet, { header: 1 });

    console.log("Row 11 (Index 10) Name:", data[10][0]);
    console.log("Row 11 Details:", JSON.stringify(data[10], null, 2));

} catch (e) {
    console.error(e.message);
}
