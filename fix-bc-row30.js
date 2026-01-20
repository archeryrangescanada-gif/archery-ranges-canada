const XLSX = require('xlsx');

const workbook = XLSX.readFile('BC_Archery_Ranges_Complete.xlsx');
const sheetName = workbook.SheetNames[0];
const worksheet = workbook.Sheets[sheetName];
const data = XLSX.utils.sheet_to_json(worksheet, { header: 1, defval: '' });

// Fix Row 30 - Quesnel River Archers
// Misalignment detected - data in wrong columns

// Move data to correct columns:
data[30][13] = 'Indoor sessions typically Sat/Sun morning & afternoon; Outdoor dawn-dusk';  // business_hours (from index 16)
data[30][21] = 'Yes';  // membership_required
data[30][22] = 'N/A (Membership through Archery Canada/BC Archery; check for club fees)';  // membership_price_adult (from index 17)
data[30][23] = '$5-$10 (Guest estimate based on local gun club; verify with Dale)';  // drop_in_price (from index 18)
data[30][24] = 'Yes (Available for specific children/beginner programs)';  // equipment_rental_available (from index 19)
data[30][25] = 'Yes';  // lessons_available
data[30][26] = 'Children\'s archery program (K-12); Contact for adult lessons';  // lesson_price_range (from index 20)

// Fill in missing coordinates:
data[30][6] = '52.9772321';  // post_latitude
data[30][7] = '-122.4969964';  // post_longitude

// Fill in missing fields:
data[30][14] = 'N/A';  // post_images
data[30][27] = 'Compound, Recurve, Traditional';  // bow_types_allowed
data[30][28] = 'N/A';  // accessibility

// Clear misaligned columns and set correct values:
data[30][16] = 'N/A';  // number_of_lanes
data[30][17] = 'Indoor/Outdoor';  // facility_type
data[30][18] = 'N/A';  // has_pro_shop
data[30][19] = 'N/A';  // has_3d_course
data[30][20] = 'N/A';  // has_field_course (Fita range mentioned but not traditional field course)

const newWorksheet = XLSX.utils.aoa_to_sheet(data);
workbook.Sheets[sheetName] = newWorksheet;
XLSX.writeFile(workbook, 'BC_Archery_Ranges_Complete.xlsx');

console.log('✓ Row 30 (Quesnel River Archers) has been completely filled!');
console.log('\nAll cells filled:');
console.log('- post_latitude: 52.9772321');
console.log('- post_longitude: -122.4969964');
console.log('- business_hours: Indoor sessions typically Sat/Sun morning & afternoon; Outdoor dawn-dusk');
console.log('- post_images: N/A');
console.log('- number_of_lanes: N/A');
console.log('- facility_type: Indoor/Outdoor');
console.log('- has_pro_shop: N/A');
console.log('- has_3d_course: N/A');
console.log('- has_field_course: N/A');
console.log('- membership_required: Yes');
console.log('- membership_price_adult: N/A (Membership through Archery Canada/BC Archery; check for club fees)');
console.log('- drop_in_price: $5-$10 (Guest estimate based on local gun club; verify with Dale)');
console.log('- equipment_rental_available: Yes (Available for specific children/beginner programs)');
console.log('- lessons_available: Yes');
console.log('- lesson_price_range: Children\'s archery program (K-12); Contact for adult lessons');
console.log('- bow_types_allowed: Compound, Recurve, Traditional');
console.log('- accessibility: N/A');
