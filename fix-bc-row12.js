const XLSX = require('xlsx');

const workbook = XLSX.readFile('BC_Archery_Ranges_Complete.xlsx');
const sheetName = workbook.SheetNames[0];
const worksheet = workbook.Sheets[sheetName];
const data = XLSX.utils.sheet_to_json(worksheet, { header: 1, defval: '' });

// Fix Row 12 - Fernie Rod and Gun Club
// Current misalignment:
// [16] number_of_lanes has: 'Check Facebook/Website for Events; Winter Indoor Program'
// [17] facility_type has: '$60 (Adult) / $80 (Family) + $40 Indoor Range Access'
// [18] has_pro_shop has: 'N/A (See Membership)'
// [19] has_3d_course has: 'No'
// [20] has_field_course has: 'Yes (Winter Programs)'

// Move data to correct columns:
data[12][13] = 'Check Facebook/Website for Events; Winter Indoor Program';  // business_hours
data[12][22] = '$60 (Adult) / $80 (Family) + $40 Indoor Range Access';  // membership_price_adult
data[12][23] = 'N/A (See Membership)';  // drop_in_price

// Clear the misaligned columns and set correct values
data[12][16] = 'N/A';  // number_of_lanes
data[12][17] = 'Indoor/Outdoor';  // facility_type
data[12][18] = 'N/A';  // has_pro_shop
data[12][19] = 'Yes';  // has_3d_course (mentions 3D Fun Shoots in post_content)
data[12][20] = 'N/A';  // has_field_course

// Fill in missing information
data[12][6] = '49.4887';  // post_latitude (approximate - Fernie area)
data[12][7] = '-115.0626';  // post_longitude (approximate - Fernie area)
data[12][14] = 'N/A';  // post_images
data[12][24] = 'N/A';  // equipment_rental_available
data[12][25] = 'Yes';  // lessons_available (Winter Programs mentioned)
data[12][26] = 'N/A';  // lesson_price_range
data[12][27] = 'N/A';  // bow_types_allowed
data[12][28] = 'N/A';  // accessibility

const newWorksheet = XLSX.utils.aoa_to_sheet(data);
workbook.Sheets[sheetName] = newWorksheet;
XLSX.writeFile(workbook, 'BC_Archery_Ranges_Complete.xlsx');

console.log('✓ Row 12 (Fernie Rod and Gun Club) has been fixed and updated!');
console.log('\nData realigned:');
console.log('- business_hours: Check Facebook/Website for Events; Winter Indoor Program');
console.log('- membership_price_adult: $60 (Adult) / $80 (Family) + $40 Indoor Range Access');
console.log('- drop_in_price: N/A (See Membership)');
console.log('\nNew data added:');
console.log('- post_latitude: 49.4887 (approximate)');
console.log('- post_longitude: -115.0626 (approximate)');
console.log('- has_3d_course: Yes');
console.log('- lessons_available: Yes');
console.log('- bow_types_allowed: N/A');
console.log('- accessibility: N/A');
