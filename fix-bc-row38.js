const XLSX = require('xlsx');

const workbook = XLSX.readFile('BC_Archery_Ranges_Complete.xlsx');
const sheetName = workbook.SheetNames[0];
const worksheet = workbook.Sheets[sheetName];
const data = XLSX.utils.sheet_to_json(worksheet, { header: 1, defval: '' });

// Fix Row 38 - West Kootenay Archers
// Misalignment detected - data in wrong columns

// Move data to correct columns:
data[38][13] = 'Dawn to dusk; Check TWA range closure schedule';  // business_hours (from index 16)
data[38][22] = 'Requires WKA or TWA Membership (approx. $20-$40 for events)';  // membership_price_adult (from index 17)
data[38][23] = '$10-$20 (Event-based drop-in)';  // drop_in_price (from index 18)
data[38][24] = 'No';  // equipment_rental_available (from index 19)
data[38][25] = 'Yes';  // lessons_available (summer camps for youth)
data[38][26] = 'Occasional archery days and instruction; summer camps for youth';  // lesson_price_range (from index 20)

// Fill in missing coordinates:
data[38][6] = '49.0935732';  // post_latitude
data[38][7] = '-117.6725616';  // post_longitude

// Fill in missing fields:
data[38][14] = 'N/A';  // post_images
data[38][28] = 'N/A';  // accessibility

// Clear misaligned columns and set correct values:
data[38][16] = 'N/A';  // number_of_lanes
data[38][17] = 'Outdoor';  // facility_type
data[38][18] = 'N/A';  // has_pro_shop
data[38][19] = 'Yes';  // has_3d_course (3 outdoor 3D courses)
data[38][20] = 'N/A';  // has_field_course

const newWorksheet = XLSX.utils.aoa_to_sheet(data);
workbook.Sheets[sheetName] = newWorksheet;
XLSX.writeFile(workbook, 'BC_Archery_Ranges_Complete.xlsx');

console.log('✓ Row 38 (West Kootenay Archers) has been completely filled!');
console.log('\nAll cells filled:');
console.log('- post_latitude: 49.0935732');
console.log('- post_longitude: -117.6725616');
console.log('- business_hours: Dawn to dusk; Check TWA range closure schedule');
console.log('- post_images: N/A');
console.log('- number_of_lanes: N/A');
console.log('- facility_type: Outdoor');
console.log('- has_pro_shop: N/A');
console.log('- has_3d_course: Yes');
console.log('- has_field_course: N/A');
console.log('- membership_required: Yes (already filled)');
console.log('- membership_price_adult: Requires WKA or TWA Membership (approx. $20-$40 for events)');
console.log('- drop_in_price: $10-$20 (Event-based drop-in)');
console.log('- equipment_rental_available: No');
console.log('- lessons_available: Yes');
console.log('- lesson_price_range: Occasional archery days and instruction; summer camps for youth');
console.log('- bow_types_allowed: Traditional, Compound (already filled)');
console.log('- accessibility: N/A');
