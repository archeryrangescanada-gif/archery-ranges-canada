const XLSX = require('xlsx');

// Read the Excel file
const workbook = XLSX.readFile('BC_Archery_Ranges_Complete.xlsx');
const sheetName = workbook.SheetNames[0];
const worksheet = workbook.Sheets[sheetName];

// Convert to JSON
const data = XLSX.utils.sheet_to_json(worksheet, { header: 1, defval: '' });

// Print first 5 rows to see structure
console.log('Total rows:', data.length);
console.log('\nFirst 5 rows:');
data.slice(0, 5).forEach((row, idx) => {
  console.log(`Row ${idx}:`, JSON.stringify(row));
});

// Print headers
console.log('\nHeaders (Row 0):');
console.log(data[0]);

// Print Row 3 (first data row to work on)
console.log('\nRow 3 (first location to research):');
console.log(JSON.stringify(data[3], null, 2));
