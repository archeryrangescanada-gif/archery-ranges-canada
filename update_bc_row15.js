const XLSX = require('xlsx');

const filename = 'BC_Archery_Ranges_Complete.xlsx';

try {
    const workbook = XLSX.readFile(filename);
    const sheetName = workbook.SheetNames[0];
    const sheet = workbook.Sheets[sheetName];

    // Convert to array of arrays (header: 1)
    const data = XLSX.utils.sheet_to_json(sheet, { header: 1 });

    // Row 15 is index 14
    const rowIndex = 14;

    if (data[rowIndex]) {
        const row = data[rowIndex];

        // 0: Name "Kamloops Target Sports Association"
        // 1: Addr
        // 2: City "Kamloops"
        // 3: Prov
        // 4: Country
        // 5: Postal
        // 6: Lat
        // 7: Long
        // 8: Phone
        // 9: Email
        // 10: Web
        // 11: Desc
        // 12: Type

        row[1] = "755 Lansdowne St (Indoor); Hillside Dr (Outdoor)";
        row[8] = "250-320-0234 / 778-694-6667";
        row[9] = "admin-assistant@ktsa.ca / archery@ktsa.ca";
        row[10] = "https://ktsa.ca/";

        // Description
        row[11] = "Indoor 18m range downtown and hillside outdoor range. Beginners intro courses available.";

        // Facility Type
        row[12] = "Indoor/Outdoor";

        // Hours (Index 16 assumed)
        row[16] = "Indoor: Tue 6:30-8:00 PM; Sun 5-9 PM (at SRD K9); Outdoor: Dawn to Dusk";

        // Lanes/Distances (Index 15)
        row[15] = "Indoor: 10-lane (18m); Outdoor Hillside Range";

        // Membership Price (Index 17)
        row[17] = "$185.40 (Single) / $226.60 (Family) / $108.15 (Senior)";

        // Drop-in Price (Index 18)
        row[18] = "$6.50 (Adult) / $4.50 (Seniors & Youth) with Digital Punchcard";

        // Equipment Rental (Index 19)
        row[19] = "Yes (Included in Intro Courses)";

        // Lessons (Index 20)
        row[20] = "Beginners Intro ($20-$35); Junior Archery ($80 for 4 weeks)";

        console.log("Updated Row 15:", row);
    }

    const newSheet = XLSX.utils.aoa_to_sheet(data);
    workbook.Sheets[sheetName] = newSheet;
    XLSX.writeFile(workbook, filename);
    console.log("File saved.");

} catch (e) {
    console.error("Error:", e.message);
}
