const XLSX = require('xlsx');

const workbook = XLSX.readFile('BC_Archery_Ranges_Complete.xlsx');
const sheetName = workbook.SheetNames[0];
const worksheet = workbook.Sheets[sheetName];
const data = XLSX.utils.sheet_to_json(worksheet, { header: 1, defval: '' });

// Fix Row 36 - Semiahmoo Fish & Game Club / Semiahmoo Archers
// Misalignment detected - data in wrong columns

// Move data to correct columns:
data[36][13] = 'Indoor: Mon/Thu 7:30-9:30 PM; Outdoor: Dawn-Dusk';  // business_hours (from index 16)
data[36][22] = '$120 (Individual) / $150 (Family) / $50 (Junior) / $60 (Senior)';  // membership_price_adult (from index 17)
data[36][23] = '$10.00 (Non-members) / $5.00 (Adult members) / $4.00 (Junior members)';  // drop_in_price (from index 18)
data[36][26] = 'Adult Archery Classes; Junior Archery Program (JOP); Group Events';  // lesson_price_range (from index 20)

// Fill in missing coordinates (from postal code):
data[36][6] = '49.0160557';  // post_latitude
data[36][7] = '-122.7182700';  // post_longitude

// Fill in missing fields:
data[36][14] = 'N/A';  // post_images
data[36][28] = 'N/A';  // accessibility

// Clear misaligned columns and set correct values:
data[36][16] = 'N/A';  // number_of_lanes
data[36][17] = 'Indoor/Outdoor';  // facility_type
data[36][18] = 'N/A';  // has_pro_shop
data[36][19] = 'N/A';  // has_3d_course
data[36][20] = 'N/A';  // has_field_course

const newWorksheet = XLSX.utils.aoa_to_sheet(data);
workbook.Sheets[sheetName] = newWorksheet;
XLSX.writeFile(workbook, 'BC_Archery_Ranges_Complete.xlsx');

console.log('✓ Row 36 (Semiahmoo Fish & Game Club / Semiahmoo Archers) has been completely filled!');
console.log('\nAll cells filled:');
console.log('- post_latitude: 49.0160557 (from postal code)');
console.log('- post_longitude: -122.7182700 (from postal code)');
console.log('- business_hours: Indoor: Mon/Thu 7:30-9:30 PM; Outdoor: Dawn-Dusk');
console.log('- post_images: N/A');
console.log('- number_of_lanes: N/A');
console.log('- facility_type: Indoor/Outdoor');
console.log('- has_pro_shop: N/A');
console.log('- has_3d_course: N/A');
console.log('- has_field_course: N/A');
console.log('- membership_required: Yes for outdoor; Drop-in for indoor (already filled)');
console.log('- membership_price_adult: $120 (Individual) / $150 (Family) / $50 (Junior) / $60 (Senior)');
console.log('- drop_in_price: $10.00 (Non-members) / $5.00 (Adult members) / $4.00 (Junior members)');
console.log('- equipment_rental_available: Yes (already filled)');
console.log('- lessons_available: Yes (JOP, Adult) (already filled)');
console.log('- lesson_price_range: Adult Archery Classes; Junior Archery Program (JOP); Group Events');
console.log('- bow_types_allowed: Recurve, Compound, Crossbow (designated butt) (already filled)');
console.log('- accessibility: N/A');
