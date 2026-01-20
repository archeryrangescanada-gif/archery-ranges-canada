const XLSX = require('xlsx');

const filename = 'BC_Archery_Ranges_Complete.xlsx';

try {
    const workbook = XLSX.readFile(filename);
    const sheetName = workbook.SheetNames[0];
    const sheet = workbook.Sheets[sheetName];

    // Convert to JSON
    const data = XLSX.utils.sheet_to_json(sheet, { header: 1 }); // array of arrays

    if (data.length === 0) {
        console.log("File is empty");
    } else {
        console.log("Headers (Row 1):", data[0]);

        // Excel Row 9 is index 8 (0-based)
        // User said "Row 9". 
        // Let's print rows 8, 9, 10 (indices 7, 8, 9)

        console.log("\n--- Row 8 (Index 7) ---");
        console.log(JSON.stringify(data[7], null, 2));

        console.log("\n--- Row 9 (Index 8) ---");
        console.log(JSON.stringify(data[8], null, 2));

        console.log("\n--- Row 10 (Index 9) ---");
        console.log(JSON.stringify(data[9], null, 2));
    }

} catch (e) {
    console.error("Error reading file:", e.message);
}
