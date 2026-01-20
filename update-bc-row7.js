const XLSX = require('xlsx');

// Read the Excel file
const workbook = XLSX.readFile('BC_Archery_Ranges_Complete.xlsx');
const sheetName = workbook.SheetNames[0];
const worksheet = workbook.Sheets[sheetName];

// Convert to JSON to work with data
const data = XLSX.utils.sheet_to_json(worksheet, { header: 1, defval: '' });

// Update Row 7 (index 7) - Chilliwack Fish and Game
// Row structure based on headers:
// 0: name, 1: post_address, 2: post_city, 3: post_region, 4: post_country,
// 5: post_zip, 6: post_latitude, 7: post_longitude, 8: phone, 9: email,
// 10: website, 11: post_content, 12: post_tags, 13: business_hours, 14: post_images,
// 15: range_length_yards, 16: number_of_lanes, 17: facility_type, 18: has_pro_shop,
// 19: has_3d_course, 20: has_field_course, 21: membership_required, 22: membership_price_adult,
// 23: drop_in_price, 24: equipment_rental_available, 25: lessons_available, 26: lesson_price_range,
// 27: bow_types_allowed, 28: accessibility

data[7][6] = '49.0807500';  // post_latitude
data[7][7] = '-121.8783461';  // post_longitude
data[7][8] = '604-824-1703';  // phone
data[7][14] = 'N/A';  // post_images
data[7][15] = 'N/A';  // range_length_yards
data[7][16] = 'N/A';  // number_of_lanes
data[7][19] = 'N/A';  // has_3d_course
data[7][20] = 'N/A';  // has_field_course
data[7][22] = 'N/A';  // membership_price_adult
data[7][23] = 'N/A';  // drop_in_price
data[7][24] = 'Yes';  // equipment_rental_available
data[7][26] = 'N/A';  // lesson_price_range
data[7][27] = 'N/A';  // bow_types_allowed
data[7][28] = 'N/A';  // accessibility

// Convert back to worksheet
const newWorksheet = XLSX.utils.aoa_to_sheet(data);

// Replace the old worksheet with updated one
workbook.Sheets[sheetName] = newWorksheet;

// Write back to file
XLSX.writeFile(workbook, 'BC_Archery_Ranges_Complete.xlsx');

console.log('✓ Row 7 (Chilliwack Fish and Game) has been updated successfully!');
console.log('\nUpdated fields:');
console.log('- post_latitude: 49.0807500');
console.log('- post_longitude: -121.8783461');
console.log('- phone: 604-824-1703');
console.log('- post_images: N/A');
console.log('- range_length_yards: N/A');
console.log('- number_of_lanes: N/A');
console.log('- has_3d_course: N/A');
console.log('- has_field_course: N/A');
console.log('- membership_price_adult: N/A');
console.log('- drop_in_price: N/A');
console.log('- equipment_rental_available: Yes');
console.log('- lesson_price_range: N/A');
console.log('- bow_types_allowed: N/A');
console.log('- accessibility: N/A');
