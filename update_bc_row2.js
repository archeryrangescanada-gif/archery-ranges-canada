const XLSX = require('xlsx');
const filename = 'BC_Archery_Ranges_Complete.xlsx';

try {
    const workbook = XLSX.readFile(filename);
    const sheetName = workbook.SheetNames[0];
    const sheet = workbook.Sheets[sheetName];
    const data = XLSX.utils.sheet_to_json(sheet, { header: 1 });

    // Row 2 is index 1
    const rowIndex = 1;
    if (data[rowIndex]) {
        const row = data[rowIndex];

        row[1] = "5513 Highway 24 (Outdoor); 5830 Horse Lake Rd (Indoor)";
        row[5] = "V0K 1X0";
        row[8] = "(250) 644-8613 (Grayson Klassen)";
        row[9] = "membership@lonebuttefishandwildlife.com";
        row[10] = "https://lonebuttefishandwildlife.com/";

        // Description
        row[11] = "Club with indoor and outdoor ranges. Archery bay available. Also home to Bighorn Archery Club events.";

        // Facility Type
        row[12] = "Indoor/Outdoor";

        // Hours (Index 16 assumed)
        row[16] = "Check club for range hours; Indoor winter shooting often Tue 7-9 PM";

        // Lanes/Distances (Index 15)
        row[15] = "Indoor Archery Bay; Outdoor Range";

        // Membership Price (Index 17)
        row[17] = "$50 (Adult) / $40 (Youth) / $35 (Child) - Bighorn Rates; Check Lone Butte for range fees";

        // Drop-in Price (Index 18)
        row[18] = "$10 (Adult) / $2 (Junior) - Guest Fee";

        // Equipment Rental (Index 19)
        row[19] = "Yes (During introductory events)";

        // Lessons (Index 20)
        row[20] = "Introductory nights available";

        console.log("Updated Row 2:", row[0]);
    }

    const newSheet = XLSX.utils.aoa_to_sheet(data);
    workbook.Sheets[sheetName] = newSheet;
    XLSX.writeFile(workbook, filename);
    console.log("File saved.");
} catch (e) {
    console.error("Error:", e.message);
}
