const XLSX = require('xlsx');

const workbook = XLSX.readFile('BC_Archery_Ranges_Complete.xlsx');
const sheetName = workbook.SheetNames[0];
const worksheet = workbook.Sheets[sheetName];
const data = XLSX.utils.sheet_to_json(worksheet, { header: 1, defval: '' });

// Fix Row 31 - Richmond Rod and Gun Club - Indoor Archery Range
// Misalignment detected - data in wrong columns

// Move data to correct columns:
data[31][13] = 'Mon/Wed/Thu/Fri 7:30 PM - 9:30 PM';  // business_hours (from index 16, more complete than existing)
data[31][22] = '$135-$165 (Typical Club Membership); Archery 5-pass $25';  // membership_price_adult (from index 17)
data[31][23] = '$18 (Non-member) / $6 (Member) / $12 (Youth)';  // drop_in_price (from index 18)
data[31][24] = 'Yes ($12 full equipment rental)';  // equipment_rental_available (from index 19)
data[31][25] = 'Yes';  // lessons_available
data[31][26] = 'Beginner Lessons ($40 including gear; Mondays)';  // lesson_price_range (from index 20)

// Fill in missing fields:
data[31][14] = 'N/A';  // post_images
data[31][27] = 'All bow types (Compound, Recurve, Traditional, Crossbow)';  // bow_types_allowed
data[31][28] = 'N/A';  // accessibility

// Clear misaligned columns and set correct values:
data[31][16] = 'N/A';  // number_of_lanes
data[31][17] = 'Indoor';  // facility_type
data[31][18] = 'N/A';  // has_pro_shop
data[31][19] = 'N/A';  // has_3d_course
data[31][20] = 'N/A';  // has_field_course

const newWorksheet = XLSX.utils.aoa_to_sheet(data);
workbook.Sheets[sheetName] = newWorksheet;
XLSX.writeFile(workbook, 'BC_Archery_Ranges_Complete.xlsx');

console.log('✓ Row 31 (Richmond Rod and Gun Club - Indoor Archery Range) has been completely filled!');
console.log('\nAll cells filled:');
console.log('- post_latitude: 49.180422 (already filled)');
console.log('- post_longitude: -123.140574 (already filled)');
console.log('- business_hours: Mon/Wed/Thu/Fri 7:30 PM - 9:30 PM');
console.log('- post_images: N/A');
console.log('- number_of_lanes: N/A');
console.log('- facility_type: Indoor');
console.log('- has_pro_shop: N/A');
console.log('- has_3d_course: N/A');
console.log('- has_field_course: N/A');
console.log('- membership_required: Yes (already filled)');
console.log('- membership_price_adult: $135-$165 (Typical Club Membership); Archery 5-pass $25');
console.log('- drop_in_price: $18 (Non-member) / $6 (Member) / $12 (Youth)');
console.log('- equipment_rental_available: Yes ($12 full equipment rental)');
console.log('- lessons_available: Yes');
console.log('- lesson_price_range: Beginner Lessons ($40 including gear; Mondays)');
console.log('- bow_types_allowed: All bow types (Compound, Recurve, Traditional, Crossbow)');
console.log('- accessibility: N/A');
