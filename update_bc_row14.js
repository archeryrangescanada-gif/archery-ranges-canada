const XLSX = require('xlsx');

const filename = 'BC_Archery_Ranges_Complete.xlsx';

try {
    const workbook = XLSX.readFile(filename);
    const sheetName = workbook.SheetNames[0];
    const sheet = workbook.Sheets[sheetName];

    // Convert to array of arrays (header: 1)
    const data = XLSX.utils.sheet_to_json(sheet, { header: 1 });

    // Row 14 is index 13
    const rowIndex = 13;

    if (data[rowIndex]) {
        const row = data[rowIndex];

        // 0: Name "New Totem Archery Club - Indoor Range"
        // 1: Addr
        // 2: City "Fort St John"
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

        row[1] = "9223 100 St (Indoor); 9169 Jones Subdivision Rd (Outdoor)";
        row[5] = "V1J 3X3 (Indoor) / V0C 1H0 (Outdoor)";
        row[8] = "(250) 329-4899 / (250) 785-6866";
        row[9] = "newtotemarchery@live.com";
        row[10] = "https://newtotemarchery.net/";

        // Description
        row[11] = "Indoor range (20-yard) and Outdoor range (3D course & 10-60 yard field). Basic instruction provided.";

        // Facility Type
        row[12] = "Indoor/Outdoor";

        // Hours (Index 16 assumed)
        row[16] = "Wed 7-9 PM, Sun 2-4 PM (Winter); Wed 6:30-8:30 PM, Sun 2-4 PM (Summer)";

        // Lanes/Distances (Index 15)
        row[15] = "Indoor: 20-yard; Outdoor: 20-target 3D Course & 10-60 yard Field";

        // Membership Price (Index 17)
        row[17] = "$250 (Adult) / $400 (Family) / $120 (Junior)";

        // Drop-in Price (Index 18)
        row[18] = "$10.00";

        // Equipment Rental (Index 19)
        // Equipment provided for new archers
        row[19] = "Yes (For New Archers)";

        // Lessons (Index 20)
        row[20] = "Basic Instruction; Intermediate Classes ($30-$60)";

        console.log("Updated Row 14:", row);
    }

    const newSheet = XLSX.utils.aoa_to_sheet(data);
    workbook.Sheets[sheetName] = newSheet;
    XLSX.writeFile(workbook, filename);
    console.log("File saved.");

} catch (e) {
    console.error("Error:", e.message);
}
