const XLSX = require('xlsx');
const filename = 'BC_Archery_Ranges_Complete.xlsx';

try {
    const workbook = XLSX.readFile(filename);
    const sheetName = workbook.SheetNames[0];
    const sheet = workbook.Sheets[sheetName];
    const data = XLSX.utils.sheet_to_json(sheet, { header: 1 });

    // Row 44 is index 43
    const rowIndex = 43;
    if (data[rowIndex]) {
        const row = data[rowIndex];

        row[1] = "McKinnon Gym, University of Victoria";
        row[5] = "V8W 2Y2 (Mailing)";
        row[8] = "(250) 472-4000 (Vikes Rec)";
        row[9] = "archersofvic@gmail.com";
        row[10] = "https://vikesrec.ca/sports/2015/10/1/Archery%20Club.aspx";

        // Description
        row[11] = "University club in McKinnon Gym. Certified coaches, beginner-friendly. Operates during academic terms.";

        // Facility Type
        row[12] = "Indoor Range (Gym)";

        // Hours (Index 16 assumed)
        row[16] = "Wed 1:30-4:30 PM; Fri 3:30-6:30 PM";

        // Lanes/Distances (Index 15)
        row[15] = "Indoor Gym Range";

        // Membership Price (Index 17)
        row[17] = "$30 per semester";

        // Drop-in Price (Index 18)
        row[18] = "N/A (Membership required)";

        // Equipment Rental (Index 19)
        row[19] = "Yes (Provided for club practices)";

        // Lessons (Index 20)
        row[20] = "Coaching provided during practice sessions";

        console.log("Updated Row 44:", row[0]);
    }

    const newSheet = XLSX.utils.aoa_to_sheet(data);
    workbook.Sheets[sheetName] = newSheet;
    XLSX.writeFile(workbook, filename);
    console.log("File saved.");
} catch (e) {
    console.error("Error:", e.message);
}
