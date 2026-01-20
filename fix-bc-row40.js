const XLSX = require('xlsx');

const workbook = XLSX.readFile('BC_Archery_Ranges_Complete.xlsx');
const sheetName = workbook.SheetNames[0];
const worksheet = workbook.Sheets[sheetName];
const data = XLSX.utils.sheet_to_json(worksheet, { header: 1, defval: '' });

// Fix Row 40 - Lykopis Archery
// Misalignment detected - data in wrong columns

// Move data to correct columns:
data[40][13] = 'Shop: Mon/Tue/Thu/Fri 10:30-5:30; Open Range: Fri 6:30-8:30 PM';  // business_hours (from index 16)
data[40][22] = '$249/mo (Adult ongoing classes); Intro class $140';  // membership_price_adult (from index 17)
data[40][23] = '$25 (Own equipment) / $35 (Rental) - Fridays 6:30 PM';  // drop_in_price (from index 18)
data[40][26] = 'Traditional/Historical archery lessons; Private $90-$160';  // lesson_price_range (from index 20)

// Fill in missing coordinates:
data[40][6] = '49.2656968';  // post_latitude
data[40][7] = '-123.1005711';  // post_longitude

// Fill in missing fields:
data[40][14] = 'N/A';  // post_images
data[40][28] = 'N/A';  // accessibility

// Clear misaligned columns and set correct values:
data[40][16] = 'N/A';  // number_of_lanes
data[40][17] = 'Indoor';  // facility_type
data[40][18] = 'Yes';  // has_pro_shop (Shop hours listed)
data[40][19] = 'N/A';  // has_3d_course
data[40][20] = 'N/A';  // has_field_course

const newWorksheet = XLSX.utils.aoa_to_sheet(data);
workbook.Sheets[sheetName] = newWorksheet;
XLSX.writeFile(workbook, 'BC_Archery_Ranges_Complete.xlsx');

console.log('✓ Row 40 (Lykopis Archery) has been completely filled!');
console.log('\nAll cells filled:');
console.log('- post_latitude: 49.2656968');
console.log('- post_longitude: -123.1005711');
console.log('- business_hours: Shop: Mon/Tue/Thu/Fri 10:30-5:30; Open Range: Fri 6:30-8:30 PM');
console.log('- post_images: N/A');
console.log('- number_of_lanes: N/A');
console.log('- facility_type: Indoor');
console.log('- has_pro_shop: Yes');
console.log('- has_3d_course: N/A');
console.log('- has_field_course: N/A');
console.log('- membership_required: No (already filled)');
console.log('- membership_price_adult: $249/mo (Adult ongoing classes); Intro class $140');
console.log('- drop_in_price: $25 (Own equipment) / $35 (Rental) - Fridays 6:30 PM');
console.log('- equipment_rental_available: Yes (already filled)');
console.log('- lessons_available: Yes (already filled)');
console.log('- lesson_price_range: Traditional/Historical archery lessons; Private $90-$160');
console.log('- bow_types_allowed: Traditional, Historical, Longbow, Recurve (already filled)');
console.log('- accessibility: N/A');
