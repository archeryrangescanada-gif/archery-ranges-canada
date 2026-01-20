const XLSX = require('xlsx');

const workbook = XLSX.readFile('BC_Archery_Ranges_Complete.xlsx');
const sheetName = workbook.SheetNames[0];
const worksheet = workbook.Sheets[sheetName];
const data = XLSX.utils.sheet_to_json(worksheet, { header: 1, defval: '' });

// Fix Row 23 - Boorman Archery
// Misalignment detected - data in wrong columns

// Move data to correct columns:
data[23][13] = 'Tue-Sat 9:30 AM-5:00 PM; Sun-Mon Closed';  // business_hours (from index 16)
data[23][22] = 'N/A (Drop-in and Shooter Cards available)';  // membership_price_adult
data[23][23] = '$20 (Traditional/Recurve drop-in); $25 (Compound drop-in)';  // drop_in_price (from index 18)
data[23][24] = 'Yes (Not included with Shooter Cards)';  // equipment_rental_available
data[23][25] = 'Yes';  // lessons_available
data[23][26] = 'Private/Group lessons ($45-$60/hr); Adult 4-week course ($119.99); Shooter Cards: $120 (Traditional / 8 sessions), $160 (Compound / 8 sessions)';  // lesson_price_range (from index 20)

// Fill in missing coordinates:
data[23][6] = '49.2250476';  // post_latitude
data[23][7] = '-122.8929030';  // post_longitude

// Fill in missing fields:
data[23][14] = 'N/A';  // post_images
data[23][28] = 'N/A';  // accessibility

// Clear misaligned columns and set correct values:
data[23][16] = 'N/A';  // number_of_lanes
data[23][17] = 'Indoor';  // facility_type
data[23][18] = 'Yes';  // has_pro_shop (Pro shop and indoor range since 1964)
data[23][19] = 'N/A';  // has_3d_course
data[23][20] = 'N/A';  // has_field_course

// Update bow_types_allowed with complete information from website:
data[23][27] = 'Recurve, Compound, Longbow, Crossbow';  // bow_types_allowed

const newWorksheet = XLSX.utils.aoa_to_sheet(data);
workbook.Sheets[sheetName] = newWorksheet;
XLSX.writeFile(workbook, 'BC_Archery_Ranges_Complete.xlsx');

console.log('✓ Row 23 (Boorman Archery) has been completely filled!');
console.log('\nAll cells filled:');
console.log('- post_latitude: 49.2250476');
console.log('- post_longitude: -122.8929030');
console.log('- business_hours: Tue-Sat 9:30 AM-5:00 PM; Sun-Mon Closed');
console.log('- post_images: N/A');
console.log('- number_of_lanes: N/A');
console.log('- facility_type: Indoor');
console.log('- has_pro_shop: Yes');
console.log('- has_3d_course: N/A');
console.log('- has_field_course: N/A');
console.log('- membership_price_adult: N/A (Drop-in and Shooter Cards available)');
console.log('- drop_in_price: $20 (Traditional/Recurve drop-in); $25 (Compound drop-in)');
console.log('- equipment_rental_available: Yes (Not included with Shooter Cards)');
console.log('- lessons_available: Yes');
console.log('- lesson_price_range: Private/Group lessons ($45-$60/hr); Adult 4-week course ($119.99); Shooter Cards: $120 (Traditional / 8 sessions), $160 (Compound / 8 sessions)');
console.log('- bow_types_allowed: Recurve, Compound, Longbow, Crossbow');
console.log('- accessibility: N/A');
