const XLSX = require('xlsx');
const filename = 'BC_Archery_Ranges_Complete.xlsx';

try {
    const workbook = XLSX.readFile(filename);
    const sheetName = workbook.SheetNames[0];
    const sheet = workbook.Sheets[sheetName];
    const data = XLSX.utils.sheet_to_json(sheet, { header: 1 });

    // Row 21 is index 20
    const rowIndex = 20;
    if (data[rowIndex]) {
        const row = data[rowIndex];

        row[1] = "35655 Harris Rd";
        row[5] = "V3G 1R7";
        row[8] = "(604) 826-0552";
        row[9] = "officeadmin@ridgedale.net / archery@ridgedale.net";
        row[10] = "https://ridgedale.net/";

        // Description
        row[11] = "Outdoor archery range up to 70 yards and 3D archery targets in summer. Weekly practice and beginner lessons.";

        // Facility Type
        row[12] = "Outdoor (Indoor scheduled events)";

        // Hours (Index 16 assumed)
        row[16] = "Office: Tue-Fri 10:30 AM-5:30 PM; Archery Practice: Thu 6:00-8:00 PM";

        // Lanes/Distances (Index 15)
        row[15] = "Outdoor Range (up to 70 yards); 3D Course";

        // Membership Price (Index 17)
        row[17] = "$165 (Individual) / $190 (Family) / $130 (Senior) + fees";

        // Drop-in Price (Index 18)
        row[18] = "$20 (Adult Guest) / $5 (Junior Guest) - must be with member";

        // Equipment Rental (Index 19)
        row[19] = "Yes ($10 for club bows during beginners program)";

        // Lessons (Index 20)
        row[20] = "Archery for Beginners (4th Thu of month, 6-7 PM, requires registration)";

        console.log("Updated Row 21:", row);
    }

    const newSheet = XLSX.utils.aoa_to_sheet(data);
    workbook.Sheets[sheetName] = newSheet;
    XLSX.writeFile(workbook, filename);
    console.log("File saved.");
} catch (e) {
    console.error("Error:", e.message);
}
