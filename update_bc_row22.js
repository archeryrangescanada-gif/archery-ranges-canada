const XLSX = require('xlsx');
const filename = 'BC_Archery_Ranges_Complete.xlsx';

try {
    const workbook = XLSX.readFile(filename);
    const sheetName = workbook.SheetNames[0];
    const sheet = workbook.Sheets[sheetName];
    const data = XLSX.utils.sheet_to_json(sheet, { header: 1 });

    // Row 22 is index 21
    const rowIndex = 21;
    if (data[rowIndex]) {
        const row = data[rowIndex];

        row[1] = "Mobile Service (Servicing Vancouver Island/Nanaimo)";
        // Row already had phone/email/lat/long (likely business license location)

        // Description
        row[11] = "Mobile Arrow Tag service (archery dodgeball) for events. Equipment and basic instruction provided.";

        // Facility Type
        row[12] = "Mobile Event Service";

        // Hours
        row[13] = "Mon-Fri 6:00-9:00 PM; Sat 9:00 AM-9:00 PM (By Booking)";

        // Membership Price
        row[17] = "N/A (Event-based booking)";

        // Drop-in Price
        row[18] = "$450 (Private/Youth Event, up to 16 players, 90 mins)";

        // Equipment Rental
        row[19] = "Yes (Included in event packages)";

        // Lessons
        row[20] = "Basic instruction included in events; contact for individual lessons";

        console.log("Updated Row 22:", row);
    }

    const newSheet = XLSX.utils.aoa_to_sheet(data);
    workbook.Sheets[sheetName] = newSheet;
    XLSX.writeFile(workbook, filename);
    console.log("File saved.");
} catch (e) {
    console.error("Error:", e.message);
}
