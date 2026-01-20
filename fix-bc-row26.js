const XLSX = require('xlsx');

const workbook = XLSX.readFile('BC_Archery_Ranges_Complete.xlsx');
const sheetName = workbook.SheetNames[0];
const worksheet = workbook.Sheets[sheetName];
const data = XLSX.utils.sheet_to_json(worksheet, { header: 1, defval: '' });

// Fix Row 26 - Arrowsmith Archers / Parksville-Qualicum Fish & Game
// Misalignment detected - data in wrong columns

// Move data to correct columns:
data[26][13] = 'Indoor: Mon/Wed 6:00-8:00 PM; Outdoor: 9:00 AM-8:00 PM (Summer)';  // business_hours (combine from index 13 + 16)
data[26][22] = '$130 (Regular) / $50 (Junior) + $35 Key Fee';  // membership_price_adult (from index 17)
data[26][26] = 'Certified Coaches at indoor sessions; JOP Youth Program';  // lesson_price_range (from index 20)

// Fill in missing coordinates:
data[26][6] = '49.3001728';  // post_latitude
data[26][7] = '-124.2616374';  // post_longitude

// Fill in missing fields:
data[26][14] = 'N/A';  // post_images
data[26][28] = 'N/A';  // accessibility

// Clear misaligned columns and set correct values:
data[26][16] = 'N/A';  // number_of_lanes
data[26][17] = 'Indoor/Outdoor';  // facility_type
data[26][18] = 'N/A';  // has_pro_shop
data[26][19] = 'Yes';  // has_3d_course (Dorman Range has 3D mentioned)
data[26][20] = 'Yes';  // has_field_course (Dorman Range Field course mentioned)

const newWorksheet = XLSX.utils.aoa_to_sheet(data);
workbook.Sheets[sheetName] = newWorksheet;
XLSX.writeFile(workbook, 'BC_Archery_Ranges_Complete.xlsx');

console.log('✓ Row 26 (Arrowsmith Archers / Parksville-Qualicum Fish & Game) has been completely filled!');
console.log('\nAll cells filled:');
console.log('- post_latitude: 49.3001728');
console.log('- post_longitude: -124.2616374');
console.log('- business_hours: Indoor: Mon/Wed 6:00-8:00 PM; Outdoor: 9:00 AM-8:00 PM (Summer)');
console.log('- post_images: N/A');
console.log('- number_of_lanes: N/A');
console.log('- facility_type: Indoor/Outdoor');
console.log('- has_pro_shop: N/A');
console.log('- has_3d_course: Yes');
console.log('- has_field_course: Yes');
console.log('- membership_price_adult: $130 (Regular) / $50 (Junior) + $35 Key Fee');
console.log('- drop_in_price: First drop-in free (already filled)');
console.log('- equipment_rental_available: Yes (already filled)');
console.log('- lessons_available: Yes (already filled)');
console.log('- lesson_price_range: Certified Coaches at indoor sessions; JOP Youth Program');
console.log('- bow_types_allowed: Recurve, Compound, Crossbow (designated) (already filled)');
console.log('- accessibility: N/A');
