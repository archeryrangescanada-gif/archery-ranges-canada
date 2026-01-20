const XLSX = require('xlsx');
const filename = 'BC_Archery_Ranges_Complete.xlsx';

try {
    const workbook = XLSX.readFile(filename);
    const sheetName = workbook.SheetNames[0];
    const sheet = workbook.Sheets[sheetName];
    const data = XLSX.utils.sheet_to_json(sheet, { header: 1 });

    data.forEach((row, index) => {
        if (row[0] && row[0].toLowerCase().includes('revelstoke')) {
            console.log(`Found Revelstoke at Row ${index + 1} (Index ${index}):`, row[0]);
        }
    });
} catch (e) {
    console.error(e.message);
}
