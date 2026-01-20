const XLSX = require('xlsx');

const workbook = XLSX.readFile('BC_Archery_Ranges_Complete.xlsx');
const sheetName = workbook.SheetNames[0];
const worksheet = workbook.Sheets[sheetName];
const data = XLSX.utils.sheet_to_json(worksheet, { header: 1, defval: '' });

// Fix Row 11 - Cowichan Bowmen
// Current misalignment:
// [16] number_of_lanes has: 'Family Night (Drop-in): Tue 6-7:15PM, Thu 6-8PM; Members: Year-round access'
// [17] facility_type has: '$150 (Adult) / $200 (Family) / $100 (Senior)'
// [18] has_pro_shop has: '$5.00 (Family Night - Includes Equipment)'
// [19] has_3d_course has: 'Yes (During Family Night)'
// [20] has_field_course has: 'Intro Instruction at Family Night; JOP Program (Mon)'

// Move data to correct columns:
data[11][13] = 'Family Night (Drop-in): Tue 6-7:15PM, Thu 6-8PM; Members: Year-round access';  // business_hours
data[11][22] = '$150 (Adult) / $200 (Family) / $100 (Senior)';  // membership_price_adult
data[11][23] = '$5.00 (Family Night - Includes Equipment)';  // drop_in_price
data[11][24] = 'Yes (During Family Night)';  // equipment_rental_available
data[11][25] = 'Yes';  // lessons_available (JOP Program mentioned)
data[11][26] = 'Intro Instruction at Family Night; JOP Program (Mon)';  // lesson_price_range

// Clear the misaligned columns
data[11][16] = 'N/A';  // number_of_lanes
data[11][17] = 'Indoor/Outdoor';  // facility_type
data[11][18] = 'N/A';  // has_pro_shop
data[11][19] = 'N/A';  // has_3d_course
data[11][20] = 'Yes';  // has_field_course (16-target Field Course mentioned in range_length_yards)

// Fill in missing information from website research
data[11][14] = 'N/A';  // post_images
data[11][27] = 'Compound, Recurve, Traditional, Barebow';  // bow_types_allowed
data[11][28] = 'N/A';  // accessibility

const newWorksheet = XLSX.utils.aoa_to_sheet(data);
workbook.Sheets[sheetName] = newWorksheet;
XLSX.writeFile(workbook, 'BC_Archery_Ranges_Complete.xlsx');

console.log('✓ Row 11 (Cowichan Bowmen) has been fixed and updated!');
console.log('\nData realigned:');
console.log('- business_hours: Family Night (Drop-in): Tue 6-7:15PM, Thu 6-8PM; Members: Year-round access');
console.log('- membership_price_adult: $150 (Adult) / $200 (Family) / $100 (Senior)');
console.log('- drop_in_price: $5.00 (Family Night - Includes Equipment)');
console.log('- equipment_rental_available: Yes (During Family Night)');
console.log('- lessons_available: Yes');
console.log('- lesson_price_range: Intro Instruction at Family Night; JOP Program (Mon)');
console.log('\nNew data added:');
console.log('- bow_types_allowed: Compound, Recurve, Traditional, Barebow');
console.log('- accessibility: N/A');
