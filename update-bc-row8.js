const XLSX = require('xlsx');

const workbook = XLSX.readFile('BC_Archery_Ranges_Complete.xlsx');
const sheetName = workbook.SheetNames[0];
const worksheet = workbook.Sheets[sheetName];
const data = XLSX.utils.sheet_to_json(worksheet, { header: 1, defval: '' });

// Update Row 8 - Burke Mountain Archers
data[8][6] = '49.3088168';  // post_latitude
data[8][7] = '-122.7482478';  // post_longitude
data[8][8] = '604-942-9772';  // phone
data[8][14] = 'N/A';  // post_images
data[8][15] = 'Indoor: 18m; Outdoor: N/A';  // range_length_yards
data[8][16] = 'N/A';  // number_of_lanes
data[8][22] = '$155 individual / $200 family (PCDHFC membership)';  // membership_price_adult
data[8][23] = '$5 (Thu night indoor)';  // drop_in_price
data[8][28] = 'N/A';  // accessibility

const newWorksheet = XLSX.utils.aoa_to_sheet(data);
workbook.Sheets[sheetName] = newWorksheet;
XLSX.writeFile(workbook, 'BC_Archery_Ranges_Complete.xlsx');

console.log('✓ Row 8 (Burke Mountain Archers) updated!');
