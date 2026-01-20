const XLSX = require('xlsx');

const workbook = XLSX.readFile('BC_Archery_Ranges_Complete.xlsx');
const sheetName = workbook.SheetNames[0];
const worksheet = workbook.Sheets[sheetName];
const data = XLSX.utils.sheet_to_json(worksheet, { header: 1, defval: '' });

// Fix Row 13 - New Totem Archery Club - Indoor Range
// Current misalignment:
// [16] number_of_lanes has: 'Wed 7-9 PM, Sun 2-4 PM (Winter); Wed 6:30-8:30 PM, Sun 2-4 PM (Summer)'
// [17] facility_type has: '$250 (Adult) / $400 (Family) / $120 (Junior)'
// [18] has_pro_shop has: '$10.00'
// [19] has_3d_course has: 'Yes (For New Archers)'
// [20] has_field_course has: 'Basic Instruction; Intermediate Classes ($30-$60)'

// Note: business_hours already correctly set at index 13: 'Wed 6:45-8:30 PM; Sun 2-4 PM'
// The data in index 16 appears to be more detailed hours, but we'll keep the current one

// Move data to correct columns:
data[13][22] = '$250 (Adult) / $400 (Family) / $120 (Junior)';  // membership_price_adult
data[13][23] = '$10.00';  // drop_in_price
data[13][24] = 'Yes (For New Archers)';  // equipment_rental_available
data[13][25] = 'Yes';  // lessons_available
data[13][26] = 'Basic Instruction; Intermediate Classes ($30-$60)';  // lesson_price_range

// Clear the misaligned columns and set correct values
data[13][16] = 'N/A';  // number_of_lanes
data[13][17] = 'Indoor/Outdoor';  // facility_type
data[13][18] = 'N/A';  // has_pro_shop
data[13][19] = 'Yes';  // has_3d_course (mentioned in post_content)
data[13][20] = 'Yes';  // has_field_course (10-60 yard field mentioned)

// Fill in missing information
data[13][14] = 'N/A';  // post_images
data[13][21] = 'Yes';  // membership_required
data[13][27] = 'Compound, Recurve, Traditional, Barebow';  // bow_types_allowed
data[13][28] = 'N/A';  // accessibility

const newWorksheet = XLSX.utils.aoa_to_sheet(data);
workbook.Sheets[sheetName] = newWorksheet;
XLSX.writeFile(workbook, 'BC_Archery_Ranges_Complete.xlsx');

console.log('✓ Row 13 (New Totem Archery Club - Indoor Range) has been fixed and updated!');
console.log('\nData realigned:');
console.log('- membership_price_adult: $250 (Adult) / $400 (Family) / $120 (Junior)');
console.log('- drop_in_price: $10.00');
console.log('- equipment_rental_available: Yes (For New Archers)');
console.log('- lessons_available: Yes');
console.log('- lesson_price_range: Basic Instruction; Intermediate Classes ($30-$60)');
console.log('\nNew data added:');
console.log('- has_3d_course: Yes');
console.log('- has_field_course: Yes');
console.log('- membership_required: Yes');
console.log('- bow_types_allowed: Compound, Recurve, Traditional, Barebow');
console.log('- accessibility: N/A');
