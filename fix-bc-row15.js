const XLSX = require('xlsx');

const workbook = XLSX.readFile('BC_Archery_Ranges_Complete.xlsx');
const sheetName = workbook.SheetNames[0];
const worksheet = workbook.Sheets[sheetName];
const data = XLSX.utils.sheet_to_json(worksheet, { header: 1, defval: '' });

// Fix Row 15 - The Feathered Fletch Archery School & Range
// Some misalignment detected:
// [16] number_of_lanes has hours (duplicate of business_hours)
// [18] has_pro_shop has pricing
// [19] has_3d_course has equipment rental info
// [20] has_field_course has lesson pricing

// Move data to correct columns:
data[15][22] = 'N/A (Class-based)';  // membership_price_adult
data[15][23] = '$55 (Workshop Drop-in); $15 (Summer Shoots)';  // drop_in_price (from index 18)
data[15][26] = 'Full Courses ($245-$280); Summer Shoots ($15); Group Events';  // lesson_price_range (from index 20)

// Clear misaligned columns and set correct values:
data[15][16] = 'N/A';  // number_of_lanes
data[15][17] = 'Indoor/Outdoor';  // facility_type
data[15][18] = 'N/A';  // has_pro_shop
data[15][19] = 'N/A';  // has_3d_course
data[15][20] = 'N/A';  // has_field_course

// Fill in missing information:
data[15][14] = 'N/A';  // post_images
data[15][27] = 'Compound, Recurve, Traditional';  // bow_types_allowed
data[15][28] = 'N/A';  // accessibility

const newWorksheet = XLSX.utils.aoa_to_sheet(data);
workbook.Sheets[sheetName] = newWorksheet;
XLSX.writeFile(workbook, 'BC_Archery_Ranges_Complete.xlsx');

console.log('✓ Row 15 (The Feathered Fletch Archery School & Range) has been fixed and updated!');
console.log('\nData realigned:');
console.log('- membership_price_adult: N/A (Class-based)');
console.log('- drop_in_price: $55 (Workshop Drop-in); $15 (Summer Shoots)');
console.log('- lesson_price_range: Full Courses ($245-$280); Summer Shoots ($15); Group Events');
console.log('\nNew data added:');
console.log('- bow_types_allowed: Compound, Recurve, Traditional');
console.log('- accessibility: N/A');
