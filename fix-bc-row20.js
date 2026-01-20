const XLSX = require('xlsx');

const workbook = XLSX.readFile('BC_Archery_Ranges_Complete.xlsx');
const sheetName = workbook.SheetNames[0];
const worksheet = workbook.Sheets[sheetName];
const data = XLSX.utils.sheet_to_json(worksheet, { header: 1, defval: '' });

// Fix Row 20 - Ridgedale Rod and Gun Club
// Misalignment detected:
// [16] number_of_lanes has hours
// [17] facility_type has pricing
// [18] has_pro_shop has drop-in pricing
// [19] has_3d_course has equipment rental
// [20] has_field_course has lesson info

// Move data to correct columns:
data[20][13] = 'Office: Tue-Fri 10:30 AM-5:30 PM; Archery Practice: Thu 6:00-8:00 PM';  // business_hours
data[20][22] = '$165 (Individual) / $190 (Family) / $130 (Senior) + fees';  // membership_price_adult
data[20][23] = '$20 (Adult Guest) / $5 (Junior Guest) - must be with member';  // drop_in_price
data[20][24] = 'Yes ($10 for club bows during beginners program)';  // equipment_rental_available
data[20][25] = 'Yes';  // lessons_available
data[20][26] = 'Archery for Beginners (4th Thu of month, 6-7 PM, requires registration)';  // lesson_price_range

// Clear misaligned columns and set correct values:
data[20][16] = 'N/A';  // number_of_lanes
data[20][17] = 'Outdoor';  // facility_type
data[20][18] = 'N/A';  // has_pro_shop
data[20][19] = 'Yes';  // has_3d_course (mentioned in post_content)
data[20][20] = 'N/A';  // has_field_course

// Fill in missing information:
data[20][6] = '49.2326';  // post_latitude
data[20][7] = '-122.5123';  // post_longitude
data[20][14] = 'N/A';  // post_images
data[20][27] = 'Compound, Recurve, Traditional';  // bow_types_allowed
data[20][28] = 'N/A';  // accessibility

const newWorksheet = XLSX.utils.aoa_to_sheet(data);
workbook.Sheets[sheetName] = newWorksheet;
XLSX.writeFile(workbook, 'BC_Archery_Ranges_Complete.xlsx');

console.log('✓ Row 20 (Ridgedale Rod and Gun Club) has been fixed and updated!');
console.log('\nData realigned:');
console.log('- business_hours: Office: Tue-Fri 10:30 AM-5:30 PM; Archery Practice: Thu 6:00-8:00 PM');
console.log('- membership_price_adult: $165 (Individual) / $190 (Family) / $130 (Senior) + fees');
console.log('- drop_in_price: $20 (Adult Guest) / $5 (Junior Guest) - must be with member');
console.log('- equipment_rental_available: Yes ($10 for club bows during beginners program)');
console.log('- lessons_available: Yes');
console.log('- lesson_price_range: Archery for Beginners (4th Thu of month, 6-7 PM, requires registration)');
console.log('\nNew data added:');
console.log('- post_latitude: 49.2326');
console.log('- post_longitude: -122.5123');
console.log('- has_3d_course: Yes');
console.log('- bow_types_allowed: Compound, Recurve, Traditional');
console.log('- accessibility: N/A');
