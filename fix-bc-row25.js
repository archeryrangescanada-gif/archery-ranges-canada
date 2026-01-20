const XLSX = require('xlsx');

const workbook = XLSX.readFile('BC_Archery_Ranges_Complete.xlsx');
const sheetName = workbook.SheetNames[0];
const worksheet = workbook.Sheets[sheetName];
const data = XLSX.utils.sheet_to_json(worksheet, { header: 1, defval: '' });

// Fix Row 25 - SOSA Archers
// Misalignment detected - data in wrong columns

// Move data to correct columns:
data[25][13] = 'Outdoor: 8AM-9PM; Indoor: Mon & Thu nights (from 6 PM)';  // business_hours (combine from existing + index 16)
data[25][22] = '$125 (Regular) / $165 (Family) / $95 (Junior) / $115 (Senior)';  // membership_price_adult (from index 17)
data[25][26] = 'Certified NCCP Coaches; JOP Youth Program (Thu)';  // lesson_price_range (from index 20)

// Fill in missing coordinates (Oliver town center):
data[25][6] = '49.1833330';  // post_latitude
data[25][7] = '-119.5500000';  // post_longitude

// Fill in missing fields:
data[25][14] = 'N/A';  // post_images
data[25][28] = 'N/A';  // accessibility

// Clear misaligned columns and set correct values:
data[25][16] = 'N/A';  // number_of_lanes
data[25][17] = 'Indoor/Outdoor';  // facility_type
data[25][18] = 'N/A';  // has_pro_shop
data[25][19] = 'N/A';  // has_3d_course
data[25][20] = 'N/A';  // has_field_course

const newWorksheet = XLSX.utils.aoa_to_sheet(data);
workbook.Sheets[sheetName] = newWorksheet;
XLSX.writeFile(workbook, 'BC_Archery_Ranges_Complete.xlsx');

console.log('✓ Row 25 (SOSA Archers) has been completely filled!');
console.log('\nAll cells filled:');
console.log('- post_latitude: 49.1833330 (Oliver town center)');
console.log('- post_longitude: -119.5500000 (Oliver town center)');
console.log('- business_hours: Outdoor: 8AM-9PM; Indoor: Mon & Thu nights (from 6 PM)');
console.log('- post_images: N/A');
console.log('- number_of_lanes: N/A');
console.log('- facility_type: Indoor/Outdoor');
console.log('- has_pro_shop: N/A');
console.log('- has_3d_course: N/A');
console.log('- has_field_course: N/A');
console.log('- membership_price_adult: $125 (Regular) / $165 (Family) / $95 (Junior) / $115 (Senior)');
console.log('- drop_in_price: $6-10 depending on membership (already filled)');
console.log('- equipment_rental_available: Yes ($5) (already filled)');
console.log('- lessons_available: Yes (JOP) (already filled)');
console.log('- lesson_price_range: Certified NCCP Coaches; JOP Youth Program (Thu)');
console.log('- bow_types_allowed: Recurve, Compound, Crossbow (designated butt) (already filled)');
console.log('- accessibility: N/A');
