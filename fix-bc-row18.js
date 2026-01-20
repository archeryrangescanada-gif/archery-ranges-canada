const XLSX = require('xlsx');

const workbook = XLSX.readFile('BC_Archery_Ranges_Complete.xlsx');
const sheetName = workbook.SheetNames[0];
const worksheet = workbook.Sheets[sheetName];
const data = XLSX.utils.sheet_to_json(worksheet, { header: 1, defval: '' });

// Fix Row 18 - Langley Rod & Gun Club
// Misalignment detected:
// [16] number_of_lanes has hours
// [17] facility_type has pricing
// [18] has_pro_shop has drop-in pricing
// [19] has_3d_course has equipment rental
// [20] has_field_course has lesson info

// Move data to correct columns:
data[18][13] = 'Office: Wed 11-7:30, Fri-Sun 10/11-4:30; Indoor: Sun 5-7 PM & Wed; Outdoor: 9AM-Dusk';  // business_hours
data[18][22] = '$236.25 (Adult/Family) + insurance';  // membership_price_adult
data[18][23] = '$10.00 (Non-members) / $6.00 (Members drop-in); $8.00/session for members';  // drop_in_price
data[18][24] = 'Yes ($5 for non-members; Free for members)';  // equipment_rental_available
data[18][25] = 'Yes';  // lessons_available
data[18][26] = 'Beginner lessons available (contact for arrangement)';  // lesson_price_range

// Clear misaligned columns and set correct values:
data[18][16] = 'N/A';  // number_of_lanes
data[18][17] = 'Indoor/Outdoor';  // facility_type
data[18][18] = 'N/A';  // has_pro_shop
data[18][19] = 'N/A';  // has_3d_course
data[18][20] = 'N/A';  // has_field_course

// Fill in missing information:
data[18][6] = '49.1064';  // post_latitude
data[18][7] = '-122.6851';  // post_longitude
data[18][14] = 'N/A';  // post_images
data[18][27] = 'Compound, Recurve, Traditional';  // bow_types_allowed
data[18][28] = 'N/A';  // accessibility

const newWorksheet = XLSX.utils.aoa_to_sheet(data);
workbook.Sheets[sheetName] = newWorksheet;
XLSX.writeFile(workbook, 'BC_Archery_Ranges_Complete.xlsx');

console.log('✓ Row 18 (Langley Rod & Gun Club) has been fixed and updated!');
console.log('\nData realigned:');
console.log('- business_hours: Office: Wed 11-7:30, Fri-Sun 10/11-4:30; Indoor: Sun 5-7 PM & Wed; Outdoor: 9AM-Dusk');
console.log('- membership_price_adult: $236.25 (Adult/Family) + insurance');
console.log('- drop_in_price: $10.00 (Non-members) / $6.00 (Members drop-in); $8.00/session for members');
console.log('- equipment_rental_available: Yes ($5 for non-members; Free for members)');
console.log('- lessons_available: Yes');
console.log('- lesson_price_range: Beginner lessons available (contact for arrangement)');
console.log('\nNew data added:');
console.log('- post_latitude: 49.1064');
console.log('- post_longitude: -122.6851');
console.log('- bow_types_allowed: Compound, Recurve, Traditional');
console.log('- accessibility: N/A');
