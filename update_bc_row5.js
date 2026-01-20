const XLSX = require('xlsx');
const filename = 'BC_Archery_Ranges_Complete.xlsx';

try {
    const workbook = XLSX.readFile(filename);
    const sheetName = workbook.SheetNames[0];
    const sheet = workbook.Sheets[sheetName];
    const data = XLSX.utils.sheet_to_json(sheet, { header: 1 });

    // Row 5 is index 4
    const rowIndex = 4;
    if (data[rowIndex]) {
        const row = data[rowIndex];

        row[1] = "1428 Reservoir Road";
        row[5] = "V0E 1B0";
        row[8] = "250-306-0737";
        row[9] = "ADFGA.Archery@gmail.com";
        row[10] = "http://www.adfga.ca";

        // Description
        row[11] = "Fish and game club with archery facilities since 1953. Archery for Kids program available.";

        // Facility Type
        row[12] = "Outdoor Range";

        // Hours
        row[16] = "Range: 8:30 AM to Dusk; Kids Program: Sat mornings (seasonal)";

        // Lanes/Distances
        row[15] = "Outdoor Archery Range";

        // Membership Price
        row[17] = "$90 (Adult/Senior) / $100 (Family)";

        // Drop-in Price
        row[18] = "$5 Guest Fee (must be with member); $10 Non-member Drop-in (Kids)";

        // Equipment Rental
        row[19] = "Yes (For Kids Program)";

        // Lessons
        row[20] = "Archery for Kids (Coached)";

        console.log("Updated Row 5:", row[0]);
    }

    const newSheet = XLSX.utils.aoa_to_sheet(data);
    workbook.Sheets[sheetName] = newSheet;
    XLSX.writeFile(workbook, filename);
    console.log("File saved.");
} catch (e) {
    console.error("Error:", e.message);
}
