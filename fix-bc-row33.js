const XLSX = require('xlsx');

const workbook = XLSX.readFile('BC_Archery_Ranges_Complete.xlsx');
const sheetName = workbook.SheetNames[0];
const worksheet = workbook.Sheets[sheetName];
const data = XLSX.utils.sheet_to_json(worksheet, { header: 1, defval: '' });

// Fix Row 33 - Bulkley Valley Bowmen
// Misalignment detected - data in wrong columns

// Move data to correct columns:
data[33][13] = 'Indoor Drop-in: Mon 6:30-9:30 PM (Jan-Apr); Outdoor: Dawn-Dusk';  // business_hours
data[33][21] = 'Yes';  // membership_required
data[33][22] = '$57.80 (Individual) / $85.50 (Family)';  // membership_price_adult (from index 17)
data[33][23] = '$10.00 (Indoor session fee for members)';  // drop_in_price (from index 18)
data[33][24] = 'Yes (Available for events/socials)';  // equipment_rental_available (from index 19)
data[33][25] = 'Yes';  // lessons_available (Junior program available)
data[33][26] = 'Junior Indoor Archery Program (Free for members\' kids)';  // lesson_price_range (from index 20)

// Fill in missing coordinates (Smithers town center):
data[33][6] = '54.7792074';  // post_latitude
data[33][7] = '-127.1760991';  // post_longitude

// Fill in missing fields:
data[33][14] = 'N/A';  // post_images
data[33][27] = 'Compound, Recurve, Traditional';  // bow_types_allowed
data[33][28] = 'N/A';  // accessibility

// Clear misaligned columns and set correct values:
data[33][16] = 'N/A';  // number_of_lanes
data[33][17] = 'Indoor/Outdoor';  // facility_type
data[33][18] = 'N/A';  // has_pro_shop
data[33][19] = 'N/A';  // has_3d_course
data[33][20] = 'N/A';  // has_field_course

const newWorksheet = XLSX.utils.aoa_to_sheet(data);
workbook.Sheets[sheetName] = newWorksheet;
XLSX.writeFile(workbook, 'BC_Archery_Ranges_Complete.xlsx');

console.log('✓ Row 33 (Bulkley Valley Bowmen) has been completely filled!');
console.log('\nAll cells filled:');
console.log('- post_latitude: 54.7792074 (Smithers town center)');
console.log('- post_longitude: -127.1760991 (Smithers town center)');
console.log('- business_hours: Indoor Drop-in: Mon 6:30-9:30 PM (Jan-Apr); Outdoor: Dawn-Dusk');
console.log('- post_images: N/A');
console.log('- number_of_lanes: N/A');
console.log('- facility_type: Indoor/Outdoor');
console.log('- has_pro_shop: N/A');
console.log('- has_3d_course: N/A');
console.log('- has_field_course: N/A');
console.log('- membership_required: Yes');
console.log('- membership_price_adult: $57.80 (Individual) / $85.50 (Family)');
console.log('- drop_in_price: $10.00 (Indoor session fee for members)');
console.log('- equipment_rental_available: Yes (Available for events/socials)');
console.log('- lessons_available: Yes');
console.log('- lesson_price_range: Junior Indoor Archery Program (Free for members\' kids)');
console.log('- bow_types_allowed: Compound, Recurve, Traditional');
console.log('- accessibility: N/A');
