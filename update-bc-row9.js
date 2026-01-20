const XLSX = require('xlsx');

const workbook = XLSX.readFile('BC_Archery_Ranges_Complete.xlsx');
const sheetName = workbook.SheetNames[0];
const worksheet = workbook.Sheets[sheetName];
const data = XLSX.utils.sheet_to_json(worksheet, { header: 1, defval: '' });

// Update Row 9 - Courtenay & District Fish & Game
data[9][1] = '3780 Colake Road';  // post_address
data[9][5] = 'V9N 5N4';  // post_zip
data[9][8] = '250-338-5159';  // phone
data[9][9] = 'archery@courtenayfishandgame.org';  // email
data[9][13] = 'N/A';  // business_hours
data[9][14] = 'N/A';  // post_images
data[9][16] = 'N/A';  // number_of_lanes
data[9][22] = 'Approx. $200/year (couple hundred)';  // membership_price_adult
data[9][23] = 'N/A';  // drop_in_price
data[9][24] = 'N/A';  // equipment_rental_available
data[9][25] = 'N/A';  // lessons_available
data[9][26] = 'N/A';  // lesson_price_range
data[9][27] = 'N/A';  // bow_types_allowed

const newWorksheet = XLSX.utils.aoa_to_sheet(data);
workbook.Sheets[sheetName] = newWorksheet;
XLSX.writeFile(workbook, 'BC_Archery_Ranges_Complete.xlsx');

console.log('✓ Row 9 (Courtenay & District Fish & Game) updated!');
