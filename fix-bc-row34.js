const XLSX = require('xlsx');

const workbook = XLSX.readFile('BC_Archery_Ranges_Complete.xlsx');
const sheetName = workbook.SheetNames[0];
const worksheet = workbook.Sheets[sheetName];
const data = XLSX.utils.sheet_to_json(worksheet, { header: 1, defval: '' });

// Fix Row 34 - Squamish Valley Rod & Gun Club
// Misalignment detected - data in wrong columns

// Move data to correct columns:
data[34][13] = 'Indoor: Wed 7:30-9 PM, Fri 7-9 PM; Outdoor: 9 AM-9 PM (members)';  // business_hours (from index 16, more complete)
data[34][22] = '$125 (Adult Resident) / $165 (Adult Non-Resident) / $190 (Family)';  // membership_price_adult (from index 17)
data[34][23] = '$5.00 (Adult Drop-in) / $2.00 (Junior Drop-in)';  // drop_in_price (from index 18)
data[34][26] = 'Junior Olympic Program (JOP); Certified instructors available.';  // lesson_price_range (from index 20)

// Fill in missing coordinates:
data[34][6] = '49.7286159';  // post_latitude
data[34][7] = '-123.1427405';  // post_longitude

// Fill in missing fields:
data[34][14] = 'N/A';  // post_images
data[34][27] = 'Compound, Recurve, Traditional';  // bow_types_allowed
data[34][28] = 'N/A';  // accessibility

// Clear misaligned columns and set correct values:
data[34][16] = 'N/A';  // number_of_lanes
data[34][17] = 'Indoor/Outdoor';  // facility_type
data[34][18] = 'N/A';  // has_pro_shop
data[34][19] = 'N/A';  // has_3d_course
data[34][20] = 'N/A';  // has_field_course

const newWorksheet = XLSX.utils.aoa_to_sheet(data);
workbook.Sheets[sheetName] = newWorksheet;
XLSX.writeFile(workbook, 'BC_Archery_Ranges_Complete.xlsx');

console.log('✓ Row 34 (Squamish Valley Rod & Gun Club) has been completely filled!');
console.log('\nAll cells filled:');
console.log('- post_latitude: 49.7286159');
console.log('- post_longitude: -123.1427405');
console.log('- business_hours: Indoor: Wed 7:30-9 PM, Fri 7-9 PM; Outdoor: 9 AM-9 PM (members)');
console.log('- post_images: N/A');
console.log('- number_of_lanes: N/A');
console.log('- facility_type: Indoor/Outdoor');
console.log('- has_pro_shop: N/A');
console.log('- has_3d_course: N/A');
console.log('- has_field_course: N/A');
console.log('- membership_required: Yes (already filled)');
console.log('- membership_price_adult: $125 (Adult Resident) / $165 (Adult Non-Resident) / $190 (Family)');
console.log('- drop_in_price: $5.00 (Adult Drop-in) / $2.00 (Junior Drop-in)');
console.log('- equipment_rental_available: Limited (guests) (already filled)');
console.log('- lessons_available: Yes (already filled)');
console.log('- lesson_price_range: Junior Olympic Program (JOP); Certified instructors available.');
console.log('- bow_types_allowed: Compound, Recurve, Traditional');
console.log('- accessibility: N/A');
