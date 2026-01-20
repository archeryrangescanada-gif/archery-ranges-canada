const XLSX = require('xlsx');
const filename = 'BC_Archery_Ranges_Complete.xlsx';

try {
    const workbook = XLSX.readFile(filename);
    const sheetName = workbook.SheetNames[0];
    const sheet = workbook.Sheets[sheetName];
    const data = XLSX.utils.sheet_to_json(sheet, { header: 1 });

    console.log("Row 35 (Index 34) Name:", data[34][0]);
    console.log("Row 35 Details:", JSON.stringify(data[34], null, 2));
} catch (e) {
    console.error(e.message);
}
