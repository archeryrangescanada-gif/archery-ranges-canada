const XLSX = require('xlsx');

const workbook = XLSX.readFile('BC_Archery_Ranges_Complete.xlsx');
const sheetName = workbook.SheetNames[0];
const worksheet = workbook.Sheets[sheetName];
const data = XLSX.utils.sheet_to_json(worksheet, { header: 1, defval: '' });

// Fix Row 24 - North Shore Archers
// Misalignment detected - data in wrong columns

// Move data to correct columns:
data[24][13] = 'Tue 7-9 PM; Sat 10:30 AM-12:30 PM';  // business_hours
data[24][22] = '$75 (Adult) / $45 (Junior) / $130 (Family) + BCAA Fee';  // membership_price_adult (from index 17)
data[24][24] = 'Yes ($10 Range Fee for members using club equipment)';  // equipment_rental_available (from index 19)
data[24][25] = 'Yes';  // lessons_available (beginner intro lessons offered)
data[24][26] = 'Beginner intro lesson: $35 (1.5 hrs, equipment provided)';  // lesson_price_range

// Fill in missing coordinates:
data[24][6] = '49.3290132';  // post_latitude
data[24][7] = '-123.0534175';  // post_longitude

// Fill in missing fields:
data[24][14] = 'N/A';  // post_images
data[24][27] = 'Recurve, Compound, Traditional';  // bow_types_allowed
data[24][28] = 'N/A';  // accessibility

// Clear misaligned columns and set correct values:
data[24][16] = 'N/A';  // number_of_lanes
data[24][17] = 'Indoor (Pop-up)';  // facility_type
data[24][18] = 'N/A';  // has_pro_shop
data[24][19] = 'N/A';  // has_3d_course
data[24][20] = 'N/A';  // has_field_course

const newWorksheet = XLSX.utils.aoa_to_sheet(data);
workbook.Sheets[sheetName] = newWorksheet;
XLSX.writeFile(workbook, 'BC_Archery_Ranges_Complete.xlsx');

console.log('✓ Row 24 (North Shore Archers) has been completely filled!');
console.log('\nAll cells filled:');
console.log('- post_latitude: 49.3290132');
console.log('- post_longitude: -123.0534175');
console.log('- business_hours: Tue 7-9 PM; Sat 10:30 AM-12:30 PM');
console.log('- post_images: N/A');
console.log('- number_of_lanes: N/A');
console.log('- facility_type: Indoor (Pop-up)');
console.log('- has_pro_shop: N/A');
console.log('- has_3d_course: N/A');
console.log('- has_field_course: N/A');
console.log('- membership_price_adult: $75 (Adult) / $45 (Junior) / $130 (Family) + BCAA Fee');
console.log('- drop_in_price: Range fee each session (already filled)');
console.log('- equipment_rental_available: Yes ($10 Range Fee for members using club equipment)');
console.log('- lessons_available: Yes');
console.log('- lesson_price_range: Beginner intro lesson: $35 (1.5 hrs, equipment provided)');
console.log('- bow_types_allowed: Recurve, Compound, Traditional');
console.log('- accessibility: N/A');
