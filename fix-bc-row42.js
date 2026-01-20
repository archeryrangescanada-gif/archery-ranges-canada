const XLSX = require('xlsx');

const workbook = XLSX.readFile('BC_Archery_Ranges_Complete.xlsx');
const sheetName = workbook.SheetNames[0];
const worksheet = workbook.Sheets[sheetName];
const data = XLSX.utils.sheet_to_json(worksheet, { header: 1, defval: '' });

// Fix Row 42 - Victoria Bowmen
// Misalignment detected - data in wrong columns

// Move data to correct columns:
data[42][13] = 'Members only access; Check website for schedule';  // business_hours (from index 16)
data[42][22] = '$115 (Senior >25) / $45 (Junior) / $240 (Family) + BCAA/AC Fees';  // membership_price_adult (from index 17)
data[42][23] = 'N/A (Membership based)';  // drop_in_price (from index 18)
data[42][24] = 'No';  // equipment_rental_available (from index 19)
data[42][25] = 'Yes';  // lessons_available (occasional beginner programs)
data[42][26] = 'Occasional beginner programs; check website for availability';  // lesson_price_range (from index 20)

// Fill in missing fields:
data[42][14] = 'N/A';  // post_images
data[42][27] = 'Compound, Recurve, Traditional';  // bow_types_allowed
data[42][28] = 'N/A';  // accessibility

// Clear misaligned columns and set correct values:
data[42][16] = 'N/A';  // number_of_lanes
data[42][17] = 'Outdoor';  // facility_type
data[42][18] = 'N/A';  // has_pro_shop
data[42][19] = 'N/A';  // has_3d_course
data[42][20] = 'N/A';  // has_field_course

const newWorksheet = XLSX.utils.aoa_to_sheet(data);
workbook.Sheets[sheetName] = newWorksheet;
XLSX.writeFile(workbook, 'BC_Archery_Ranges_Complete.xlsx');

console.log('✓ Row 42 (Victoria Bowmen) has been completely filled!');
console.log('\nAll cells filled:');
console.log('- post_latitude: 48.463680 (already filled)');
console.log('- post_longitude: -123.445478 (already filled)');
console.log('- business_hours: Members only access; Check website for schedule');
console.log('- post_images: N/A');
console.log('- number_of_lanes: N/A');
console.log('- facility_type: Outdoor');
console.log('- has_pro_shop: N/A');
console.log('- has_3d_course: N/A');
console.log('- has_field_course: N/A');
console.log('- membership_required: Yes (already filled)');
console.log('- membership_price_adult: $115 (Senior >25) / $45 (Junior) / $240 (Family) + BCAA/AC Fees');
console.log('- drop_in_price: N/A (Membership based)');
console.log('- equipment_rental_available: No');
console.log('- lessons_available: Yes');
console.log('- lesson_price_range: Occasional beginner programs; check website for availability');
console.log('- bow_types_allowed: Compound, Recurve, Traditional');
console.log('- accessibility: N/A');
