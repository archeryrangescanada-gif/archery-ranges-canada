const XLSX = require('xlsx');
const filename = 'BC_Archery_Ranges_Complete.xlsx';

try {
    const workbook = XLSX.readFile(filename);
    const sheetName = workbook.SheetNames[0];
    const sheet = workbook.Sheets[sheetName];
    const data = XLSX.utils.sheet_to_json(sheet, { header: 1 });

    // Row 29 is index 28 (Indoor)
    if (data[28]) {
        const row = data[28];
        row[1] = "835 Central St W";
        row[5] = "V2M 3C6";
        row[8] = "(778) 416-0674";
        row[9] = "silvertiparchers@gmail.com";
        row[10] = "https://silvertiparchers.ca/";
        row[11] = "Indoor range with 24/7 key access for members (6:30 AM - 11 PM). JOP youth program and development nights.";
        row[12] = "Indoor Range";
        row[16] = "Member access: 6:30 AM - 11 PM";
        row[15] = "Indoor 18m/20yd range";
        row[17] = "$190 (Adult) / $130 (Junior) / $320 (Family) + BCAA Fee";
        row[18] = "$5.00 (Friday night drop-in - verify current status)";
        row[19] = "Yes (Available during drop-in/lessons)";
        row[20] = "JOP Program; Tuesday Development Night; Lessons available";
        console.log("Updated Row 29:", row);
    }

    // Row 30 is index 29 (Outdoor)
    if (data[29]) {
        const row = data[29];
        row[1] = "6390 Trans-Canada Hwy";
        row[5] = "V2K 5C5";
        row[8] = "(778) 416-0674";
        row[9] = "silvertiparchers@gmail.com";
        row[10] = "https://silvertiparchers.ca/";
        row[11] = "Outdoor facility with target and field ranges. Open from 8:00 AM until sunset.";
        row[12] = "Outdoor Range";
        row[16] = "8:00 AM - Sunset";
        row[15] = "Target & Field Ranges";
        row[17] = "$190 (Adult) / $130 (Junior) / $320 (Family) + BCAA Fee";
        row[18] = "N/A (Included in membership)";
        row[19] = "No (Outdoor range requires own equipment)";
        row[20] = "Club shoots and events";
        console.log("Updated Row 30:", row);
    }

    const newSheet = XLSX.utils.aoa_to_sheet(data);
    workbook.Sheets[sheetName] = newSheet;
    XLSX.writeFile(workbook, filename);
    console.log("File saved.");
} catch (e) {
    console.error("Error:", e.message);
}
