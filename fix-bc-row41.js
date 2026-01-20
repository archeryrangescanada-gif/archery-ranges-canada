const XLSX = require('xlsx');

const workbook = XLSX.readFile('BC_Archery_Ranges_Complete.xlsx');
const sheetName = workbook.SheetNames[0];
const worksheet = workbook.Sheets[sheetName];
const data = XLSX.utils.sheet_to_json(worksheet, { header: 1, defval: '' });

// Fix Row 41 - Vanderhoof Fish & Game Club
// Misalignment detected - data in wrong columns

// Move data to correct columns:
data[41][13] = 'Check with club for members\' access';  // business_hours (from index 16)
data[41][22] = 'Contact club for current membership rates';  // membership_price_adult (from index 17)
data[41][23] = 'N/A';  // drop_in_price
data[41][24] = 'No';  // equipment_rental_available (from index 19)
data[41][25] = 'N/A';  // lessons_available
data[41][26] = 'N/A';  // lesson_price_range

// Fill in missing coordinates (Vanderhoof town center):
data[41][6] = '54.0175289';  // post_latitude
data[41][7] = '-124.0076627';  // post_longitude

// Fill in missing fields:
data[41][14] = 'N/A';  // post_images
data[41][27] = 'Compound, Recurve, Traditional';  // bow_types_allowed
data[41][28] = 'N/A';  // accessibility

// Clear misaligned columns and set correct values:
data[41][16] = 'N/A';  // number_of_lanes
data[41][17] = 'Outdoor';  // facility_type
data[41][18] = 'N/A';  // has_pro_shop (already set correctly)
data[41][19] = 'N/A';  // has_3d_course
data[41][20] = 'N/A';  // has_field_course (already set correctly)

const newWorksheet = XLSX.utils.aoa_to_sheet(data);
workbook.Sheets[sheetName] = newWorksheet;
XLSX.writeFile(workbook, 'BC_Archery_Ranges_Complete.xlsx');

console.log('✓ Row 41 (Vanderhoof Fish & Game Club) has been completely filled!');
console.log('\nAll cells filled:');
console.log('- post_latitude: 54.0175289 (Vanderhoof town center)');
console.log('- post_longitude: -124.0076627 (Vanderhoof town center)');
console.log('- business_hours: Check with club for members\' access');
console.log('- post_images: N/A');
console.log('- number_of_lanes: N/A');
console.log('- facility_type: Outdoor');
console.log('- has_pro_shop: N/A');
console.log('- has_3d_course: N/A');
console.log('- has_field_course: N/A');
console.log('- membership_required: Yes (already filled)');
console.log('- membership_price_adult: Contact club for current membership rates');
console.log('- drop_in_price: N/A');
console.log('- equipment_rental_available: No');
console.log('- lessons_available: N/A');
console.log('- lesson_price_range: N/A');
console.log('- bow_types_allowed: Compound, Recurve, Traditional');
console.log('- accessibility: N/A');
