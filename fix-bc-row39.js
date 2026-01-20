const XLSX = require('xlsx');

const workbook = XLSX.readFile('BC_Archery_Ranges_Complete.xlsx');
const sheetName = workbook.SheetNames[0];
const worksheet = workbook.Sheets[sheetName];
const data = XLSX.utils.sheet_to_json(worksheet, { header: 1, defval: '' });

// Fix Row 39 - UBC Archers
// Misalignment detected - data in wrong columns

// Move data to correct columns:
data[39][22] = '$65 (Alumni/Community members)';  // membership_price_adult (from index 17)
data[39][23] = '$15 (Non-members)';  // drop_in_price (from index 18)
data[39][26] = 'Beginner lessons included with membership info';  // lesson_price_range (from index 20)

// Fill in missing coordinates:
data[39][6] = '49.2602844';  // post_latitude
data[39][7] = '-123.2437201';  // post_longitude

// Fill in missing fields:
data[39][14] = 'N/A';  // post_images
data[39][27] = 'Recurve, Compound, Traditional';  // bow_types_allowed
data[39][28] = 'N/A';  // accessibility

// Clear misaligned columns and set correct values:
data[39][16] = 'N/A';  // number_of_lanes
data[39][17] = 'Indoor';  // facility_type
data[39][18] = 'N/A';  // has_pro_shop
data[39][19] = 'N/A';  // has_3d_course
data[39][20] = 'N/A';  // has_field_course

const newWorksheet = XLSX.utils.aoa_to_sheet(data);
workbook.Sheets[sheetName] = newWorksheet;
XLSX.writeFile(workbook, 'BC_Archery_Ranges_Complete.xlsx');

console.log('✓ Row 39 (UBC Archers) has been completely filled!');
console.log('\nAll cells filled:');
console.log('- post_latitude: 49.2602844');
console.log('- post_longitude: -123.2437201');
console.log('- business_hours: Mon 5-7 PM (during winter terms) (already filled)');
console.log('- post_images: N/A');
console.log('- number_of_lanes: N/A');
console.log('- facility_type: Indoor');
console.log('- has_pro_shop: N/A');
console.log('- has_3d_course: N/A');
console.log('- has_field_course: N/A');
console.log('- membership_required: Yes (term membership) (already filled)');
console.log('- membership_price_adult: $65 (Alumni/Community members)');
console.log('- drop_in_price: $15 (Non-members)');
console.log('- equipment_rental_available: Yes (provided) (already filled)');
console.log('- lessons_available: Yes (already filled)');
console.log('- lesson_price_range: Beginner lessons included with membership info');
console.log('- bow_types_allowed: Recurve, Compound, Traditional');
console.log('- accessibility: N/A');
