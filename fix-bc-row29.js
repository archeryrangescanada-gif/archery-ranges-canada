const XLSX = require('xlsx');

const workbook = XLSX.readFile('BC_Archery_Ranges_Complete.xlsx');
const sheetName = workbook.SheetNames[0];
const worksheet = workbook.Sheets[sheetName];
const data = XLSX.utils.sheet_to_json(worksheet, { header: 1, defval: '' });

// Fix Row 29 - Silvertip Archers - Outdoor
// Misalignment detected - data in wrong columns

// Move data to correct columns:
data[29][13] = '8:00 AM - Sunset (members)';  // business_hours (from index 16)
data[29][21] = 'Yes';  // membership_required (same club as Row 28)
data[29][22] = '$190 (Adult) / $130 (Junior) / $320 (Family) + BCAA Fee';  // membership_price_adult (from index 17)
data[29][23] = 'N/A (Included in membership)';  // drop_in_price
data[29][24] = 'No (Outdoor range requires own equipment)';  // equipment_rental_available (from index 19)
data[29][25] = 'N/A';  // lessons_available (outdoor range, lessons at indoor facility)
data[29][26] = 'Club shoots and events';  // lesson_price_range (from index 20)

// Fill in missing fields:
data[29][14] = 'N/A';  // post_images
data[29][27] = 'Compound, Recurve, Traditional';  // bow_types_allowed
data[29][28] = 'N/A';  // accessibility

// Clear misaligned columns and set correct values:
data[29][16] = 'N/A';  // number_of_lanes
data[29][17] = 'Outdoor';  // facility_type
data[29][18] = 'N/A';  // has_pro_shop
data[29][19] = 'N/A';  // has_3d_course
data[29][20] = 'Yes';  // has_field_course (Field Ranges mentioned)

const newWorksheet = XLSX.utils.aoa_to_sheet(data);
workbook.Sheets[sheetName] = newWorksheet;
XLSX.writeFile(workbook, 'BC_Archery_Ranges_Complete.xlsx');

console.log('✓ Row 29 (Silvertip Archers - Outdoor) has been completely filled!');
console.log('\nAll cells filled:');
console.log('- post_latitude: 53.928195 (already filled)');
console.log('- post_longitude: -122.633846 (already filled)');
console.log('- business_hours: 8:00 AM - Sunset (members)');
console.log('- post_images: N/A');
console.log('- number_of_lanes: N/A');
console.log('- facility_type: Outdoor');
console.log('- has_pro_shop: N/A');
console.log('- has_3d_course: N/A');
console.log('- has_field_course: Yes');
console.log('- membership_required: Yes');
console.log('- membership_price_adult: $190 (Adult) / $130 (Junior) / $320 (Family) + BCAA Fee');
console.log('- drop_in_price: N/A (Included in membership)');
console.log('- equipment_rental_available: No (Outdoor range requires own equipment)');
console.log('- lessons_available: N/A');
console.log('- lesson_price_range: Club shoots and events');
console.log('- bow_types_allowed: Compound, Recurve, Traditional');
console.log('- accessibility: N/A');
