const XLSX = require('xlsx');

const workbook = XLSX.readFile('BC_Archery_Ranges_Complete.xlsx');
const sheetName = workbook.SheetNames[0];
const worksheet = workbook.Sheets[sheetName];
const data = XLSX.utils.sheet_to_json(worksheet, { header: 1, defval: '' });

// Fix Row 21 - Bowsmith Archery
// Some misalignment:
// [18] has_pro_shop has pricing
// [19] has_3d_course has equipment rental
// [20] has_field_course has lesson info

// Move data to correct columns:
data[21][22] = 'N/A (Event-based booking)';  // membership_price_adult
data[21][23] = '$450 (Private/Youth Event, up to 16 players, 90 mins)';  // drop_in_price
data[21][26] = 'Basic instruction included in events; contact for individual lessons';  // lesson_price_range

// Clear misaligned columns and set correct values:
data[21][15] = 'Mobile service - no fixed range';  // range_length_yards
data[21][16] = 'N/A';  // number_of_lanes
data[21][17] = 'Mobile/Event Service';  // facility_type (keep existing)
data[21][18] = 'N/A';  // has_pro_shop
data[21][19] = 'N/A';  // has_3d_course
data[21][20] = 'N/A';  // has_field_course

// Fill in missing information:
data[21][14] = 'N/A';  // post_images
data[21][21] = 'N/A';  // membership_required
data[21][27] = 'Compound, Recurve, Traditional';  // bow_types_allowed
data[21][28] = 'N/A';  // accessibility

const newWorksheet = XLSX.utils.aoa_to_sheet(data);
workbook.Sheets[sheetName] = newWorksheet;
XLSX.writeFile(workbook, 'BC_Archery_Ranges_Complete.xlsx');

console.log('✓ Row 21 (Bowsmith Archery) has been fixed and updated!');
console.log('\nData realigned:');
console.log('- membership_price_adult: N/A (Event-based booking)');
console.log('- drop_in_price: $450 (Private/Youth Event, up to 16 players, 90 mins)');
console.log('- lesson_price_range: Basic instruction included in events; contact for individual lessons');
console.log('\nNew data added:');
console.log('- range_length_yards: Mobile service - no fixed range');
console.log('- membership_required: N/A');
console.log('- bow_types_allowed: Compound, Recurve, Traditional');
console.log('- accessibility: N/A');
