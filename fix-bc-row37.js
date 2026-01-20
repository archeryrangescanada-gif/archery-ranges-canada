const XLSX = require('xlsx');

const workbook = XLSX.readFile('BC_Archery_Ranges_Complete.xlsx');
const sheetName = workbook.SheetNames[0];
const worksheet = workbook.Sheets[sheetName];
const data = XLSX.utils.sheet_to_json(worksheet, { header: 1, defval: '' });

// Fix Row 37 - Terrace Whiskey-Jack Archers
// Misalignment detected - data in wrong columns

// Move data to correct columns:
data[37][13] = 'Indoor season: Nov-Apr; Outdoor available year-round';  // business_hours (from index 16)
data[37][21] = 'Yes';  // membership_required
data[37][22] = 'Check website for current fees';  // membership_price_adult (from index 17)
data[37][23] = 'N/A';  // drop_in_price
data[37][24] = 'Yes (Available during JOP and specific sessions)';  // equipment_rental_available (from index 19)
data[37][25] = 'Yes';  // lessons_available (JOP available)
data[37][26] = 'Junior Olympic Program (JOP); Introductory coaching available';  // lesson_price_range (from index 20)

// Fill in missing coordinates (Terrace town center):
data[37][6] = '54.5172715';  // post_latitude
data[37][7] = '-128.5995480';  // post_longitude

// Fill in missing fields:
data[37][14] = 'N/A';  // post_images
data[37][27] = 'Compound, Recurve, Traditional';  // bow_types_allowed
data[37][28] = 'N/A';  // accessibility

// Clear misaligned columns and set correct values:
data[37][16] = 'N/A';  // number_of_lanes
data[37][17] = 'Indoor/Outdoor';  // facility_type
data[37][18] = 'N/A';  // has_pro_shop (already set correctly)
data[37][19] = 'Yes';  // has_3d_course (annual 3D competition mentioned)
data[37][20] = 'Yes';  // has_field_course (Field Ranges mentioned)

const newWorksheet = XLSX.utils.aoa_to_sheet(data);
workbook.Sheets[sheetName] = newWorksheet;
XLSX.writeFile(workbook, 'BC_Archery_Ranges_Complete.xlsx');

console.log('✓ Row 37 (Terrace Whiskey-Jack Archers) has been completely filled!');
console.log('\nAll cells filled:');
console.log('- post_latitude: 54.5172715 (Terrace town center)');
console.log('- post_longitude: -128.5995480 (Terrace town center)');
console.log('- business_hours: Indoor season: Nov-Apr; Outdoor available year-round');
console.log('- post_images: N/A');
console.log('- number_of_lanes: N/A');
console.log('- facility_type: Indoor/Outdoor');
console.log('- has_pro_shop: N/A');
console.log('- has_3d_course: Yes');
console.log('- has_field_course: Yes');
console.log('- membership_required: Yes');
console.log('- membership_price_adult: Check website for current fees');
console.log('- drop_in_price: N/A');
console.log('- equipment_rental_available: Yes (Available during JOP and specific sessions)');
console.log('- lessons_available: Yes');
console.log('- lesson_price_range: Junior Olympic Program (JOP); Introductory coaching available');
console.log('- bow_types_allowed: Compound, Recurve, Traditional');
console.log('- accessibility: N/A');
