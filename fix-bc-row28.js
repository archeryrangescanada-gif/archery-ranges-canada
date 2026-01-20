const XLSX = require('xlsx');

const workbook = XLSX.readFile('BC_Archery_Ranges_Complete.xlsx');
const sheetName = workbook.SheetNames[0];
const worksheet = workbook.Sheets[sheetName];
const data = XLSX.utils.sheet_to_json(worksheet, { header: 1, defval: '' });

// Fix Row 28 - Silvertip Archers - Indoor Range
// Misalignment detected - data in wrong columns

// Move data to correct columns:
data[28][13] = 'Indoor: 6:30 AM - 11 PM daily; Outdoor: 8 AM - sunset (members)';  // business_hours
data[28][21] = 'Yes';  // membership_required
data[28][22] = '$190 (Adult) / $130 (Junior) / $320 (Family) + BCAA Fee';  // membership_price_adult (from index 17)
data[28][23] = '$5.00 (Friday night drop-in - verify current status)';  // drop_in_price (from index 18)
data[28][24] = 'Yes (Available during drop-in/lessons)';  // equipment_rental_available (from index 19)
data[28][25] = 'Yes';  // lessons_available
data[28][26] = 'JOP Program; Tuesday Development Night; Lessons available (contact for pricing)';  // lesson_price_range (from index 20)

// Fill in missing fields:
data[28][14] = 'N/A';  // post_images
data[28][27] = 'Compound, Recurve, Traditional';  // bow_types_allowed
data[28][28] = 'N/A';  // accessibility

// Clear misaligned columns and set correct values:
data[28][16] = 'N/A';  // number_of_lanes
data[28][17] = 'Indoor/Outdoor';  // facility_type
data[28][18] = 'N/A';  // has_pro_shop
data[28][19] = 'N/A';  // has_3d_course
data[28][20] = 'N/A';  // has_field_course

const newWorksheet = XLSX.utils.aoa_to_sheet(data);
workbook.Sheets[sheetName] = newWorksheet;
XLSX.writeFile(workbook, 'BC_Archery_Ranges_Complete.xlsx');

console.log('✓ Row 28 (Silvertip Archers - Indoor Range) has been completely filled!');
console.log('\nAll cells filled:');
console.log('- post_latitude: 53.917045 (already filled)');
console.log('- post_longitude: -122.782735 (already filled)');
console.log('- business_hours: Indoor: 6:30 AM - 11 PM daily; Outdoor: 8 AM - sunset (members)');
console.log('- post_images: N/A');
console.log('- number_of_lanes: N/A');
console.log('- facility_type: Indoor/Outdoor');
console.log('- has_pro_shop: N/A');
console.log('- has_3d_course: N/A');
console.log('- has_field_course: N/A');
console.log('- membership_required: Yes');
console.log('- membership_price_adult: $190 (Adult) / $130 (Junior) / $320 (Family) + BCAA Fee');
console.log('- drop_in_price: $5.00 (Friday night drop-in - verify current status)');
console.log('- equipment_rental_available: Yes (Available during drop-in/lessons)');
console.log('- lessons_available: Yes');
console.log('- lesson_price_range: JOP Program; Tuesday Development Night; Lessons available (contact for pricing)');
console.log('- bow_types_allowed: Compound, Recurve, Traditional');
console.log('- accessibility: N/A');
