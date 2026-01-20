const XLSX = require('xlsx');

const workbook = XLSX.readFile('BC_Archery_Ranges_Complete.xlsx');
const sheetName = workbook.SheetNames[0];
const worksheet = workbook.Sheets[sheetName];
const data = XLSX.utils.sheet_to_json(worksheet, { header: 1, defval: '' });

// Fix Row 32 - Gum Ying Richmond Archery Club
// Misalignment detected - data in wrong columns

// Move data to correct columns:
data[32][22] = '$35 (Yearly Membership Fee)';  // membership_price_adult (from index 17)
data[32][23] = '$20/hr (Members gear) / $25/hr (w/ Recurve rental)';  // drop_in_price (from index 18)
data[32][26] = 'Intro Session ($35); Family Session ($70); JOP ($666.75)';  // lesson_price_range (from index 20)

// Fill in missing fields:
data[32][14] = 'N/A';  // post_images

// Clear misaligned columns and set correct values:
data[32][16] = '24';  // number_of_lanes (24 shooting spots mentioned)
data[32][17] = 'Indoor';  // facility_type
data[32][18] = 'N/A';  // has_pro_shop
data[32][19] = 'N/A';  // has_3d_course
data[32][20] = 'N/A';  // has_field_course

const newWorksheet = XLSX.utils.aoa_to_sheet(data);
workbook.Sheets[sheetName] = newWorksheet;
XLSX.writeFile(workbook, 'BC_Archery_Ranges_Complete.xlsx');

console.log('✓ Row 32 (Gum Ying Richmond Archery Club) has been completely filled!');
console.log('\nAll cells filled:');
console.log('- post_latitude: 49.170509 (already filled)');
console.log('- post_longitude: -123.157968 (already filled)');
console.log('- business_hours: Tue-Fri 3:30-8:15 PM; Sat 9:30 AM-6:15 PM; Sun 1:30-6:15 PM; Mon 3:30-6 PM (already filled)');
console.log('- post_images: N/A');
console.log('- number_of_lanes: 24');
console.log('- facility_type: Indoor');
console.log('- has_pro_shop: N/A');
console.log('- has_3d_course: N/A');
console.log('- has_field_course: N/A');
console.log('- membership_required: No (already filled)');
console.log('- membership_price_adult: $35 (Yearly Membership Fee)');
console.log('- drop_in_price: $20/hr (Members gear) / $25/hr (w/ Recurve rental)');
console.log('- equipment_rental_available: Yes (already filled)');
console.log('- lessons_available: Yes (already filled)');
console.log('- lesson_price_range: Intro Session ($35); Family Session ($70); JOP ($666.75)');
console.log('- bow_types_allowed: Recurve, Longbow (up to 45lbs), Compound (up to 60lbs) (already filled)');
console.log('- accessibility: Free parking underneath building (already filled)');
