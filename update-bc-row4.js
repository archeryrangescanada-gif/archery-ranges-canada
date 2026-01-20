const XLSX = require('xlsx');

// Read the Excel file
const workbook = XLSX.readFile('BC_Archery_Ranges_Complete.xlsx');
const sheetName = workbook.SheetNames[0];
const worksheet = workbook.Sheets[sheetName];

// Convert to JSON to work with data
const data = XLSX.utils.sheet_to_json(worksheet, { header: 1, defval: '' });

// Update Row 4 (index 4) - Armstrong District Fish & Game Assoc.
// Row structure based on headers:
// 0: name, 1: post_address, 2: post_city, 3: post_region, 4: post_country,
// 5: post_zip, 6: post_latitude, 7: post_longitude, 8: phone, 9: email,
// 10: website, 11: post_content, 12: post_tags, 13: business_hours, 14: post_images,
// 15: range_length_yards, 16: number_of_lanes, 17: facility_type, 18: has_pro_shop,
// 19: has_3d_course, 20: has_field_course, 21: membership_required, 22: membership_price_adult,
// 23: drop_in_price, 24: equipment_rental_available, 25: lessons_available, 26: lesson_price_range,
// 27: bow_types_allowed, 28: accessibility

data[4][1] = '1428 Reservoir Road';  // post_address
data[4][5] = 'V0E 1B0';  // post_zip
data[4][6] = '50.4445481';  // post_latitude (Armstrong town center)
data[4][7] = '-119.1941593';  // post_longitude (Armstrong town center)
data[4][8] = '250-306-0737';  // phone (Range Access - Wayne)
data[4][9] = 'ADFGA.Archery@gmail.com';  // email (Archery contact)
data[4][13] = 'Archery: Sat 10 AM-12 PM (kids coached); General range: 8:30 AM to dusk or 8:30 PM';  // business_hours
data[4][14] = 'N/A';  // post_images
data[4][15] = 'N/A';  // range_length_yards
data[4][16] = 'N/A';  // number_of_lanes
data[4][19] = 'Yes';  // has_3d_course
data[4][20] = 'Yes';  // has_field_course
data[4][22] = 'N/A';  // membership_price_adult
data[4][23] = '$25';  // drop_in_price (3D shoot registration)
data[4][24] = 'N/A';  // equipment_rental_available
data[4][25] = 'Yes';  // lessons_available
data[4][26] = '$10 per coached session';  // lesson_price_range
data[4][27] = 'N/A';  // bow_types_allowed
data[4][28] = 'N/A';  // accessibility

// Convert back to worksheet
const newWorksheet = XLSX.utils.aoa_to_sheet(data);

// Replace the old worksheet with updated one
workbook.Sheets[sheetName] = newWorksheet;

// Write back to file
XLSX.writeFile(workbook, 'BC_Archery_Ranges_Complete.xlsx');

console.log('✓ Row 4 (Armstrong District Fish & Game Assoc.) has been updated successfully!');
console.log('\nUpdated fields:');
console.log('- post_address: 1428 Reservoir Road');
console.log('- post_zip: V0E 1B0');
console.log('- post_latitude: 50.4445481 (Armstrong town center)');
console.log('- post_longitude: -119.1941593 (Armstrong town center)');
console.log('- phone: 250-306-0737');
console.log('- email: ADFGA.Archery@gmail.com');
console.log('- business_hours: Archery: Sat 10 AM-12 PM (kids coached); General range: 8:30 AM to dusk or 8:30 PM');
console.log('- post_images: N/A');
console.log('- range_length_yards: N/A');
console.log('- number_of_lanes: N/A');
console.log('- has_3d_course: Yes');
console.log('- has_field_course: Yes');
console.log('- membership_price_adult: N/A');
console.log('- drop_in_price: $25');
console.log('- equipment_rental_available: N/A');
console.log('- lessons_available: Yes');
console.log('- lesson_price_range: $10 per coached session');
console.log('- bow_types_allowed: N/A');
console.log('- accessibility: N/A');
