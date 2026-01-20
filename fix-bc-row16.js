const XLSX = require('xlsx');

const workbook = XLSX.readFile('BC_Archery_Ranges_Complete.xlsx');
const sheetName = workbook.SheetNames[0];
const worksheet = workbook.Sheets[sheetName];
const data = XLSX.utils.sheet_to_json(worksheet, { header: 1, defval: '' });

// Fix Row 16 - Kelowna & District Fish & Game Club
// Misalignment detected:
// [16] number_of_lanes has hours
// [17] facility_type has pricing
// [18] has_pro_shop has drop-in pricing
// [19] has_3d_course has equipment rental info
// [20] has_field_course has lesson info

// Move data to correct columns:
data[16][13] = 'Weekdays 9:00AM-8:00PM; Weekends 9:00AM-5:00PM; Indoor scheduled';  // business_hours
data[16][22] = '$355 (Adult + Spouse) / $405 (Family) / $65 (Junior)';  // membership_price_adult
data[16][23] = '$25 (Adult Guest) / $5 (Junior Guest) - must be with member';  // drop_in_price
data[16][24] = 'Yes (During JOP/Intro Programs)';  // equipment_rental_available
data[16][25] = 'Yes';  // lessons_available
data[16][26] = 'BCAA Adult Archery; BCAA JOP Program';  // lesson_price_range

// Clear misaligned columns and set correct values:
data[16][16] = 'N/A';  // number_of_lanes
data[16][17] = 'Indoor/Outdoor';  // facility_type
data[16][18] = 'N/A';  // has_pro_shop
data[16][19] = 'Yes';  // has_3d_course (mentioned in post_content)
data[16][20] = 'Yes';  // has_field_course (mentioned in range_length_yards)

// Fill in missing information:
data[16][6] = '49.8483';  // post_latitude
data[16][7] = '-119.4041';  // post_longitude
data[16][14] = 'N/A';  // post_images
data[16][27] = 'Compound, Recurve, Traditional';  // bow_types_allowed
data[16][28] = 'N/A';  // accessibility

const newWorksheet = XLSX.utils.aoa_to_sheet(data);
workbook.Sheets[sheetName] = newWorksheet;
XLSX.writeFile(workbook, 'BC_Archery_Ranges_Complete.xlsx');

console.log('✓ Row 16 (Kelowna & District Fish & Game Club) has been fixed and updated!');
console.log('\nData realigned:');
console.log('- business_hours: Weekdays 9:00AM-8:00PM; Weekends 9:00AM-5:00PM; Indoor scheduled');
console.log('- membership_price_adult: $355 (Adult + Spouse) / $405 (Family) / $65 (Junior)');
console.log('- drop_in_price: $25 (Adult Guest) / $5 (Junior Guest) - must be with member');
console.log('- equipment_rental_available: Yes (During JOP/Intro Programs)');
console.log('- lessons_available: Yes');
console.log('- lesson_price_range: BCAA Adult Archery; BCAA JOP Program');
console.log('\nNew data added:');
console.log('- post_latitude: 49.8483');
console.log('- post_longitude: -119.4041');
console.log('- has_3d_course: Yes');
console.log('- has_field_course: Yes');
console.log('- bow_types_allowed: Compound, Recurve, Traditional');
console.log('- accessibility: N/A');
