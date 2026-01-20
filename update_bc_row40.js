const XLSX = require('xlsx');
const filename = 'BC_Archery_Ranges_Complete.xlsx';

try {
    const workbook = XLSX.readFile(filename);
    const sheetName = workbook.SheetNames[0];
    const sheet = workbook.Sheets[sheetName];
    const data = XLSX.utils.sheet_to_json(sheet, { header: 1 });

    // Row 40 is index 39
    const rowIndex = 39;
    if (data[rowIndex]) {
        const row = data[rowIndex];

        row[1] = "6108 Thunderbird Boulevard (Osborne Building)";
        row[5] = "V6T 1Z3";
        row[8] = "N/A";
        row[9] = "ubcarchers@gmail.com";
        row[10] = "https://ubcarchery.ca/";

        // Description
        row[11] = "University club open to students, alumni, and local community. Weekly indoor sessions during winter terms.";

        // Facility Type
        row[12] = "Indoor Range";

        // Hours (Index 16 assumed)
        row[16] = "Mon 5:00-7:00 PM (Winter terms only)";

        // Lanes/Distances (Index 15)
        row[15] = "Indoor Range (Osborne Gym)";

        // Membership Price (Index 17)
        row[17] = "$65 (Alumni/Community members)";

        // Drop-in Price (Index 18)
        row[18] = "$15 (Non-members)";

        // Equipment Rental (Index 19)
        row[19] = "Yes (Archery and safety equipment provided to members/drop-ins)";

        // Lessons (Index 20)
        row[20] = "Beginner lessons included with membership info";

        console.log("Updated Row 40:", row[0]);
    }

    const newSheet = XLSX.utils.aoa_to_sheet(data);
    workbook.Sheets[sheetName] = newSheet;
    XLSX.writeFile(workbook, filename);
    console.log("File saved.");
} catch (e) {
    console.error("Error:", e.message);
}
