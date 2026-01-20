const XLSX = require('xlsx');

const workbook = XLSX.readFile('BC_Archery_Ranges_Complete.xlsx');
const sheetName = workbook.SheetNames[0];
const worksheet = workbook.Sheets[sheetName];
const data = XLSX.utils.sheet_to_json(worksheet, { header: 1, defval: '' });

// Fix Row 27 - Penticton Archery Club / Penticton Shooting Sports
// Misalignment detected - data in wrong columns

// Move data to correct columns:
data[27][13] = 'Wed 7:00-9:00 PM; Sat 2:00-4:00 PM';  // business_hours (from index 16)
data[27][22] = '$125 (Adult) / $165 (Family) / $80 (Junior/Student/Senior)';  // membership_price_adult (from index 17)
data[27][23] = '$5.00 for non-members (per night)';  // drop_in_price (from index 18)
data[27][25] = 'N/A';  // lessons_available (informal assistance only, no formal structured lessons)
data[27][26] = 'Informal assistance for beginners; no formal structured lessons listed';  // lesson_price_range (from index 20)

// Fill in missing coordinates:
data[27][6] = '49.4940797';  // post_latitude
data[27][7] = '-119.6072556';  // post_longitude

// Fill in missing fields:
data[27][14] = 'N/A';  // post_images
data[27][27] = 'Recurve, Compound, Traditional';  // bow_types_allowed
data[27][28] = 'N/A';  // accessibility

// Clear misaligned columns and set correct values:
data[27][16] = 'N/A';  // number_of_lanes
data[27][17] = 'Indoor/Outdoor';  // facility_type
data[27][18] = 'N/A';  // has_pro_shop
data[27][19] = 'N/A';  // has_3d_course
data[27][20] = 'N/A';  // has_field_course

const newWorksheet = XLSX.utils.aoa_to_sheet(data);
workbook.Sheets[sheetName] = newWorksheet;
XLSX.writeFile(workbook, 'BC_Archery_Ranges_Complete.xlsx');

console.log('✓ Row 27 (Penticton Archery Club / Penticton Shooting Sports) has been completely filled!');
console.log('\nAll cells filled:');
console.log('- post_latitude: 49.4940797');
console.log('- post_longitude: -119.6072556');
console.log('- business_hours: Wed 7:00-9:00 PM; Sat 2:00-4:00 PM');
console.log('- post_images: N/A');
console.log('- number_of_lanes: N/A');
console.log('- facility_type: Indoor/Outdoor');
console.log('- has_pro_shop: N/A');
console.log('- has_3d_course: N/A');
console.log('- has_field_course: N/A');
console.log('- membership_price_adult: $125 (Adult) / $165 (Family) / $80 (Junior/Student/Senior)');
console.log('- drop_in_price: $5.00 for non-members (per night)');
console.log('- equipment_rental_available: Yes (free on National Range Day) (already filled)');
console.log('- lessons_available: N/A');
console.log('- lesson_price_range: Informal assistance for beginners; no formal structured lessons listed');
console.log('- bow_types_allowed: Recurve, Compound, Traditional');
console.log('- accessibility: N/A');
