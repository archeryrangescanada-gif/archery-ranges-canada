const XLSX = require('xlsx');

// Read the Excel file
const workbook = XLSX.readFile('BC_Archery_Ranges_Complete.xlsx');
const sheetName = workbook.SheetNames[0];
const worksheet = workbook.Sheets[sheetName];

// Convert to JSON to work with data
const data = XLSX.utils.sheet_to_json(worksheet, { header: 1, defval: '' });

// Update Row 5 (index 5) - Burnaby Archers
// Row structure based on headers:
// 0: name, 1: post_address, 2: post_city, 3: post_region, 4: post_country,
// 5: post_zip, 6: post_latitude, 7: post_longitude, 8: phone, 9: email,
// 10: website, 11: post_content, 12: post_tags, 13: business_hours, 14: post_images,
// 15: range_length_yards, 16: number_of_lanes, 17: facility_type, 18: has_pro_shop,
// 19: has_3d_course, 20: has_field_course, 21: membership_required, 22: membership_price_adult,
// 23: drop_in_price, 24: equipment_rental_available, 25: lessons_available, 26: lesson_price_range,
// 27: bow_types_allowed, 28: accessibility

data[5][8] = 'N/A';  // phone
data[5][13] = 'Daily dawn to dusk (year-round)';  // business_hours (updated to match website)
data[5][14] = 'N/A';  // post_images
data[5][15] = 'N/A';  // range_length_yards
data[5][16] = 'N/A';  // number_of_lanes
data[5][22] = '$110 individual / $220 family';  // membership_price_adult
data[5][26] = 'N/A';  // lesson_price_range (no lessons offered)
data[5][28] = 'N/A';  // accessibility

// Convert back to worksheet
const newWorksheet = XLSX.utils.aoa_to_sheet(data);

// Replace the old worksheet with updated one
workbook.Sheets[sheetName] = newWorksheet;

// Write back to file
XLSX.writeFile(workbook, 'BC_Archery_Ranges_Complete.xlsx');

console.log('✓ Row 5 (Burnaby Archers) has been updated successfully!');
console.log('\nUpdated fields:');
console.log('- phone: N/A');
console.log('- business_hours: Daily dawn to dusk (year-round)');
console.log('- post_images: N/A');
console.log('- range_length_yards: N/A');
console.log('- number_of_lanes: N/A');
console.log('- membership_price_adult: $110 individual / $220 family');
console.log('- lesson_price_range: N/A');
console.log('- accessibility: N/A');
