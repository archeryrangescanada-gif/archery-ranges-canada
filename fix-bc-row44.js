const XLSX = require('xlsx');

const workbook = XLSX.readFile('BC_Archery_Ranges_Complete.xlsx');
const sheetName = workbook.SheetNames[0];
const worksheet = workbook.Sheets[sheetName];
const data = XLSX.utils.sheet_to_json(worksheet, { header: 1, defval: '' });

// Fix Row 44 - Cariboo Archers
// Misalignment detected - data in wrong columns

// Move data to correct columns:
data[44][13] = 'Wed 7:00 PM; Sun 2:00 PM; JOP Thu evening';  // business_hours (from index 16, more complete)
data[44][22] = 'WLSA Membership (approx. $10-$11/mo) + Cariboo Archers fee';  // membership_price_adult (from index 17)
data[44][23] = 'N/A (Members & guests only; no day passes)';  // drop_in_price (from index 18)

// Fill in missing coordinates (Williams Lake town center):
data[44][6] = '52.1292657';  // post_latitude
data[44][7] = '-122.1397259';  // post_longitude

// Fill in missing fields:
data[44][14] = 'N/A';  // post_images
data[44][27] = 'Compound, Recurve, Traditional';  // bow_types_allowed
data[44][28] = 'N/A';  // accessibility

// Clear misaligned columns and set correct values:
data[44][16] = 'N/A';  // number_of_lanes
data[44][17] = 'Indoor/Outdoor';  // facility_type
data[44][18] = 'N/A';  // has_pro_shop
data[44][19] = 'N/A';  // has_3d_course
data[44][20] = 'N/A';  // has_field_course

const newWorksheet = XLSX.utils.aoa_to_sheet(data);
workbook.Sheets[sheetName] = newWorksheet;
XLSX.writeFile(workbook, 'BC_Archery_Ranges_Complete.xlsx');

console.log('✓ Row 44 (Cariboo Archers) has been completely filled!');
console.log('\nAll cells filled:');
console.log('- post_latitude: 52.1292657 (Williams Lake town center)');
console.log('- post_longitude: -122.1397259 (Williams Lake town center)');
console.log('- business_hours: Wed 7:00 PM; Sun 2:00 PM; JOP Thu evening');
console.log('- post_images: N/A');
console.log('- number_of_lanes: N/A');
console.log('- facility_type: Indoor/Outdoor');
console.log('- has_pro_shop: N/A');
console.log('- has_3d_course: N/A');
console.log('- has_field_course: N/A');
console.log('- membership_required: Yes (WLSA + BC Archery) (already filled)');
console.log('- membership_price_adult: WLSA Membership (approx. $10-$11/mo) + Cariboo Archers fee');
console.log('- drop_in_price: N/A (Members & guests only; no day passes)');
console.log('- equipment_rental_available: Yes (already filled)');
console.log('- lessons_available: Yes (JOP) (already filled)');
console.log('- lesson_price_range: $30 JOP fee (already filled)');
console.log('- bow_types_allowed: Compound, Recurve, Traditional');
console.log('- accessibility: N/A');
