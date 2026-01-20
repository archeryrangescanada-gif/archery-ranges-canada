const XLSX = require('xlsx');
const filename = 'BC_Archery_Ranges_Complete.xlsx';

try {
    const workbook = XLSX.readFile(filename);
    const sheetName = workbook.SheetNames[0];
    const sheet = workbook.Sheets[sheetName];
    const data = XLSX.utils.sheet_to_json(sheet, { header: 1 });

    // Row 4 is index 3
    const rowIndex = 3;
    if (data[rowIndex]) {
        const row = data[rowIndex];

        row[1] = "4161 Lakemount Road";
        row[5] = "V3G 2J1";
        row[8] = "(604) 852-4101"; // Generic club number if available
        row[9] = "info@abbotsfordfishandgameclub.org"; // General inquiry
        row[10] = "https://abbotsfordfishandgameclub.org/";

        // Description
        row[11] = "Private club with indoor/outdoor archery ranges. Sagittarius Archers sub-club hosts Wed night drops-ins.";

        // Facility Type
        row[12] = "Indoor/Outdoor";

        // Hours
        row[16] = "Wed 7-9 PM (Sagittarius Drop-in); General Range: 8 AM-10 PM";

        // Lanes/Distances
        row[15] = "Indoor (20 yd); Outdoor (70 yd); 3D Trail";

        // Membership Price
        row[17] = "$170 (Adult) / $195 (Family) + $50 Work Bee deposit";

        // Drop-in Price
        row[18] = "$10 (Wed Night Drop-in) / Guest Fee $10";

        // Equipment Rental
        row[19] = "Yes ($10 rental on Wed nights)";

        // Lessons
        row[20] = "Wed Night Drop-in coaching available";

        console.log("Updated Row 4:", row[0]);
    }

    const newSheet = XLSX.utils.aoa_to_sheet(data);
    workbook.Sheets[sheetName] = newSheet;
    XLSX.writeFile(workbook, filename);
    console.log("File saved.");
} catch (e) {
    console.error("Error:", e.message);
}
