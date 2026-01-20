const XLSX = require('xlsx');

const workbook = XLSX.readFile('BC_Archery_Ranges_Complete.xlsx');
const sheetName = workbook.SheetNames[0];
const worksheet = workbook.Sheets[sheetName];
const data = XLSX.utils.sheet_to_json(worksheet, { header: 1, defval: '' });

// Fix Row 19 - Maple Ridge Archery Club
// Misalignment detected:
// [16] number_of_lanes has hours
// [17] facility_type has pricing
// [18] has_pro_shop has drop-in pricing
// [19] has_3d_course has equipment rental
// [20] has_field_course has lesson info

// Move data to correct columns:
data[19][13] = 'Indoor: Thu 6:30-8:30 PM, Sun 6:30-8 PM; Outdoor: Tue/Thu 5-8 PM, Sat 8 AM-1 PM';  // business_hours
data[19][22] = '$165 (Adult w/ equipment) / $225 (w/o equipment) / $440 (Family)';  // membership_price_adult
data[19][23] = '$10 (w/ BC Archery) / $15 (Non-member) / $35 (Try-it Night)';  // drop_in_price
data[19][24] = 'Yes (Included in Try-it/Intro)';  // equipment_rental_available
data[19][26] = 'Introduction to Archery Course ($100); JOP Program; Try-it Nights';  // lesson_price_range

// Clear misaligned columns and set correct values:
data[19][16] = 'N/A';  // number_of_lanes
data[19][17] = 'Indoor/Outdoor';  // facility_type
data[19][18] = 'N/A';  // has_pro_shop
data[19][19] = 'N/A';  // has_3d_course
data[19][20] = 'N/A';  // has_field_course

// Fill in missing information:
data[19][6] = '49.2167';  // post_latitude (Maple Ridge)
data[19][7] = '-122.5986';  // post_longitude (Maple Ridge)
data[19][14] = 'N/A';  // post_images
data[19][27] = 'Compound, Recurve, Traditional';  // bow_types_allowed
data[19][28] = 'N/A';  // accessibility

const newWorksheet = XLSX.utils.aoa_to_sheet(data);
workbook.Sheets[sheetName] = newWorksheet;
XLSX.writeFile(workbook, 'BC_Archery_Ranges_Complete.xlsx');

console.log('✓ Row 19 (Maple Ridge Archery Club) has been fixed and updated!');
console.log('\nData realigned:');
console.log('- business_hours: Indoor: Thu 6:30-8:30 PM, Sun 6:30-8 PM; Outdoor: Tue/Thu 5-8 PM, Sat 8 AM-1 PM');
console.log('- membership_price_adult: $165 (Adult w/ equipment) / $225 (w/o equipment) / $440 (Family)');
console.log('- drop_in_price: $10 (w/ BC Archery) / $15 (Non-member) / $35 (Try-it Night)');
console.log('- equipment_rental_available: Yes (Included in Try-it/Intro)');
console.log('- lesson_price_range: Introduction to Archery Course ($100); JOP Program; Try-it Nights');
console.log('\nNew data added:');
console.log('- post_latitude: 49.2167');
console.log('- post_longitude: -122.5986');
console.log('- bow_types_allowed: Compound, Recurve, Traditional');
console.log('- accessibility: N/A');
