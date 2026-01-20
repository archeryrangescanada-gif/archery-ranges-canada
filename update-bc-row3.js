const XLSX = require('xlsx');

// Read the Excel file
const workbook = XLSX.readFile('BC_Archery_Ranges_Complete.xlsx');
const sheetName = workbook.SheetNames[0];
const worksheet = workbook.Sheets[sheetName];

// Convert to JSON to work with data
const data = XLSX.utils.sheet_to_json(worksheet, { header: 1, defval: '' });

// Update Row 3 (index 3) - Starr Archery
// Row structure based on headers:
// 0: name, 1: post_address, 2: post_city, 3: post_region, 4: post_country,
// 5: post_zip, 6: post_latitude, 7: post_longitude, 8: phone, 9: email,
// 10: website, 11: post_content, 12: post_tags, 13: business_hours, 14: post_images,
// 15: range_length_yards, 16: number_of_lanes, 17: facility_type, 18: has_pro_shop,
// 19: has_3d_course, 20: has_field_course, 21: membership_required, 22: membership_price_adult,
// 23: drop_in_price, 24: equipment_rental_available, 25: lessons_available, 26: lesson_price_range,
// 27: bow_types_allowed, 28: accessibility

data[3][5] = 'V4X 1T9';  // post_zip
data[3][6] = '49.1223136';  // post_latitude
data[3][7] = '-122.2374939';  // post_longitude
data[3][8] = '604-287-8814';  // phone
data[3][9] = 'shooting.starr@telus.net';  // email
data[3][14] = 'N/A';  // post_images
data[3][15] = 'Indoor: 18m, Outdoor: N/A';  // range_length_yards
data[3][16] = 'N/A';  // number_of_lanes
data[3][22] = 'Indoor: $150 returning/$200 new; Outdoor: $175 returning/$225 new';  // membership_price_adult
data[3][23] = '$15';  // drop_in_price
data[3][26] = 'N/A';  // lesson_price_range
data[3][28] = 'N/A';  // accessibility

// Convert back to worksheet
const newWorksheet = XLSX.utils.aoa_to_sheet(data);

// Replace the old worksheet with updated one
workbook.Sheets[sheetName] = newWorksheet;

// Write back to file
XLSX.writeFile(workbook, 'BC_Archery_Ranges_Complete.xlsx');

console.log('✓ Row 3 (Starr Archery) has been updated successfully!');
console.log('\nUpdated fields:');
console.log('- post_zip: V4X 1T9');
console.log('- post_latitude: 49.1223136');
console.log('- post_longitude: -122.2374939');
console.log('- phone: 604-287-8814');
console.log('- email: shooting.starr@telus.net');
console.log('- post_images: N/A');
console.log('- range_length_yards: Indoor: 18m, Outdoor: N/A');
console.log('- number_of_lanes: N/A');
console.log('- membership_price_adult: Indoor: $150 returning/$200 new; Outdoor: $175 returning/$225 new');
console.log('- drop_in_price: $15');
console.log('- lesson_price_range: N/A');
console.log('- accessibility: N/A');
