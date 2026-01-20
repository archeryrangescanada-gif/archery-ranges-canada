const XLSX = require('xlsx');

const workbook = XLSX.readFile('BC_Archery_Ranges_Complete.xlsx');
const sheetName = workbook.SheetNames[0];
const worksheet = workbook.Sheets[sheetName];
const data = XLSX.utils.sheet_to_json(worksheet, { header: 1, defval: '' });

// Fix Row 17 - Langley Archers
// Some misalignment:
// [16] number_of_lanes has business hours info
// [18] has_pro_shop has lesson pricing
// [19] has_3d_course has equipment rental
// [20] has_field_course has lesson info

// Move data to correct columns:
data[17][13] = 'Contact for lesson availability';  // business_hours
data[17][22] = 'N/A';  // membership_price_adult
data[17][23] = 'N/A';  // drop_in_price
data[17][24] = 'Yes (During lessons)';  // equipment_rental_available
data[17][25] = 'Yes';  // lessons_available
data[17][26] = '$200 (Group Lesson / 2hr); Certified training, camps, and workshops';  // lesson_price_range

// Clear misaligned columns and set correct values:
data[17][16] = 'N/A';  // number_of_lanes
data[17][17] = 'Mobile/Transitional';  // facility_type
data[17][18] = 'N/A';  // has_pro_shop
data[17][19] = 'N/A';  // has_3d_course
data[17][20] = 'N/A';  // has_field_course

// Fill in missing information:
data[17][6] = 'N/A';  // post_latitude (transitional facility)
data[17][7] = 'N/A';  // post_longitude (transitional facility)
data[17][14] = 'N/A';  // post_images
data[17][21] = 'N/A';  // membership_required
data[17][27] = 'Compound, Recurve, Traditional';  // bow_types_allowed
data[17][28] = 'N/A';  // accessibility

const newWorksheet = XLSX.utils.aoa_to_sheet(data);
workbook.Sheets[sheetName] = newWorksheet;
XLSX.writeFile(workbook, 'BC_Archery_Ranges_Complete.xlsx');

console.log('✓ Row 17 (Langley Archers) has been fixed and updated!');
console.log('\nData realigned:');
console.log('- business_hours: Contact for lesson availability');
console.log('- equipment_rental_available: Yes (During lessons)');
console.log('- lessons_available: Yes');
console.log('- lesson_price_range: $200 (Group Lesson / 2hr); Certified training, camps, and workshops');
console.log('\nNew data added:');
console.log('- membership_required: N/A');
console.log('- bow_types_allowed: Compound, Recurve, Traditional');
console.log('- accessibility: N/A');
