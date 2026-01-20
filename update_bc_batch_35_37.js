const XLSX = require('xlsx');
const filename = 'BC_Archery_Ranges_Complete.xlsx';

try {
    const workbook = XLSX.readFile(filename);
    const sheetName = workbook.SheetNames[0];
    const sheet = workbook.Sheets[sheetName];
    const data = XLSX.utils.sheet_to_json(sheet, { header: 1 });

    // Row 35: Squamish Valley Rod & Gun Club (Index 34)
    if (data[34]) {
        const row = data[34];
        row[1] = "2050 Centennial Way";
        row[5] = "V8B 0A3";
        row[8] = "N/A (Email preferred)";
        row[9] = "archery@svrgc.org";
        row[10] = "https://svrgc.org/archery-home";
        row[11] = "Indoor sessions Wed (adults) & Fri (families); Outdoor range open year-round for members (9 AM - 9 PM).";
        row[12] = "Indoor/Outdoor";
        row[16] = "Indoor: Wed 7:30-9 PM, Fri 7-9 PM; Outdoor: 9 AM-9 PM";
        row[15] = "Indoor Range; Outdoor Range";
        row[17] = "$125 (Adult Resident) / $165 (Adult Non-Resident) / $190 (Family)";
        row[18] = "$5.00 (Adult Drop-in) / $2.00 (Junior Drop-in)";
        row[19] = "No (Limited borrowing available during sessions)";
        row[20] = "Junior Olympic Program (JOP); Certified instructors available.";
        console.log("Updated Row 35:", row[0]);
    }

    // Row 36: Sunshine Coast Rod & Gun Club (Index 35)
    if (data[35]) {
        const row = data[35];
        row[1] = "4384 Parkway Drive";
        row[2] = "Sechelt";
        row[5] = "V0N 3A1";
        row[8] = "N/A (Email preferred)";
        row[9] = "archery@scrgc.ca / info@scrgc.ca";
        row[10] = "https://scrgc.ca/Archery";
        row[11] = "Indoor and outdoor ranges. Weekly drop-in sessions on Saturdays. Private club accessible to members & guests.";
        row[12] = "Indoor/Outdoor";
        row[16] = "Drop-in: Sat 9:30-11:30 AM; Youth: Sat 11:30 AM-1 PM; Members: Sun 9:30 AM";
        row[15] = "Indoor Range; Outdoor Range; Trap/Skeet";
        row[17] = "$165 (Adult) / $175 (Bundle) / $40 (Junior) / $145 (Senior)";
        row[18] = "$20.00 (Guest Fee) + $2.00 (Target Fee)";
        row[19] = "Yes ($10.00 Non-members; $5.00 Members)";
        row[20] = "Archery coordinators provide lessons and open house events.";
        console.log("Updated Row 36:", row[0]);
    }

    // Row 37: Semiahmoo Fish & Game Club / Semiahmoo Archers (Index 36)
    if (data[36]) {
        const row = data[36];
        row[1] = "1284 184th Street";
        row[8] = "(604) 535-8366";
        row[9] = "archery.sfgc@gmail.com";
        row[10] = "https://www.sfgc.info/archery";
        row[11] = "Indoor and outdoor ranges. Indoor drop-in (Mon/Thu), JOP youth program, adult lessons, and group events.";
        row[12] = "Indoor/Outdoor";
        row[16] = "Indoor: Mon/Thu 7:30-9:30 PM; Outdoor: Dawn-Dusk";
        row[15] = "Indoor Range; Outdoor targets (20-70 yards)";
        row[17] = "$120 (Individual) / $150 (Family) / $50 (Junior) / $60 (Senior)";
        row[18] = "$10.00 (Non-members) / $5.00 (Adult members) / $4.00 (Junior members)";
        row[19] = "Yes (Included in indoor drop-in fees)";
        row[20] = "Adult Archery Classes; Junior Archery Program (JOP); Group Events";
        console.log("Updated Row 37:", row[0]);
    }

    const newSheet = XLSX.utils.aoa_to_sheet(data);
    workbook.Sheets[sheetName] = newSheet;
    XLSX.writeFile(workbook, filename);
    console.log("File saved.");
} catch (e) {
    console.error("Error:", e.message);
}
