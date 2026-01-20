const XLSX = require('xlsx');

const workbook = XLSX.readFile('BC_Archery_Ranges_Complete.xlsx');
const sheetName = workbook.SheetNames[0];
const worksheet = workbook.Sheets[sheetName];
const data = XLSX.utils.sheet_to_json(worksheet, { header: 1, defval: '' });

// Fix Row 43 - UVic Archery Club
// Misalignment detected - data in wrong columns

// Move data to correct columns:
data[43][13] = 'Wed 1:30-4:30 PM; Fri 3:30-6:30 PM';  // business_hours (from index 16)
data[43][22] = '$30 per semester';  // membership_price_adult (from index 17)
data[43][23] = 'N/A (Membership required)';  // drop_in_price (from index 18)
data[43][24] = 'Yes (Provided for club practices)';  // equipment_rental_available (from index 19)
data[43][25] = 'Yes';  // lessons_available (Coaching provided)
data[43][26] = 'Coaching provided during practice sessions';  // lesson_price_range (from index 20)

// Fill in missing coordinates (UVic campus):
data[43][6] = '48.4620600';  // post_latitude
data[43][7] = '-123.3114198';  // post_longitude

// Fill in missing fields:
data[43][14] = 'N/A';  // post_images
data[43][27] = 'Recurve, Compound, Traditional';  // bow_types_allowed
data[43][28] = 'N/A';  // accessibility

// Clear misaligned columns and set correct values:
data[43][16] = 'N/A';  // number_of_lanes
data[43][17] = 'Indoor (Gym)';  // facility_type
data[43][18] = 'N/A';  // has_pro_shop
data[43][19] = 'N/A';  // has_3d_course
data[43][20] = 'N/A';  // has_field_course

const newWorksheet = XLSX.utils.aoa_to_sheet(data);
workbook.Sheets[sheetName] = newWorksheet;
XLSX.writeFile(workbook, 'BC_Archery_Ranges_Complete.xlsx');

console.log('✓ Row 43 (UVic Archery Club) has been completely filled!');
console.log('\nAll cells filled:');
console.log('- post_latitude: 48.4620600 (UVic campus)');
console.log('- post_longitude: -123.3114198 (UVic campus)');
console.log('- business_hours: Wed 1:30-4:30 PM; Fri 3:30-6:30 PM');
console.log('- post_images: N/A');
console.log('- number_of_lanes: N/A');
console.log('- facility_type: Indoor (Gym)');
console.log('- has_pro_shop: N/A');
console.log('- has_3d_course: N/A');
console.log('- has_field_course: N/A');
console.log('- membership_required: UVic students (already filled)');
console.log('- membership_price_adult: $30 per semester');
console.log('- drop_in_price: N/A (Membership required)');
console.log('- equipment_rental_available: Yes (Provided for club practices)');
console.log('- lessons_available: Yes');
console.log('- lesson_price_range: Coaching provided during practice sessions');
console.log('- bow_types_allowed: Recurve, Compound, Traditional');
console.log('- accessibility: N/A');
