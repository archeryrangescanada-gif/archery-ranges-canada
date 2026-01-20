const XLSX = require('xlsx');
const filename = 'BC_Archery_Ranges_Complete.xlsx';

try {
    const workbook = XLSX.readFile(filename);
    const sheetName = workbook.SheetNames[0];
    const sheet = workbook.Sheets[sheetName];
    const data = XLSX.utils.sheet_to_json(sheet, { header: 1 });

    // Row 32: Richmond Rod and Gun Club (Index 31)
    if (data[31]) {
        const row = data[31];
        row[1] = "7400 River Rd";
        row[2] = "Richmond";
        row[5] = "V6X 1X5";
        row[8] = "(604) 278-1101";
        row[9] = "N/A (Contact via website)";
        row[10] = "https://richmondrodandgunclub.com/";
        row[11] = "Indoor archery range with scheduled drop-in nights and beginner lessons on Mondays. All bow types welcome.";
        row[12] = "Indoor Range";
        row[16] = "Mon/Wed/Thu/Fri 7:30 PM - 9:30 PM";
        row[15] = "Indoor Range";
        row[17] = "$135-$165 (Typical Club Membership); Archery 5-pass $25";
        row[18] = "$18 (Non-member) / $6 (Member) / $12 (Youth)";
        row[19] = "Yes ($12 full equipment rental)";
        row[20] = "Beginner Lessons ($40 including gear; Mondays)";
        console.log("Updated Row 32 (Fixed):", row[0]);
    }

    // Row 33: Gum Ying Richmond Archery Club (Index 32)
    if (data[32]) {
        const row = data[32];
        row[1] = "4221 Shell Rd, Unit 160";
        row[2] = "Richmond";
        row[5] = "V6X 2W8";
        row[8] = "(604) 338-3999";
        row[9] = "richmondarchery@hotmail.com";
        row[10] = "http://www.richmondarchery.com/";
        row[11] = "Large indoor archery range with certified instructors. Accommodates 70 people with 24 simultaneous shooting spots.";
        row[12] = "Indoor Range";
        row[13] = "Tue-Fri 3:30-8:15 PM; Sat 9:30 AM-6:15 PM; Sun 1:30-6:15 PM; Mon 3:30-6 PM";
        row[15] = "Indoor (18m; 24 shooting spots)";
        row[16] = "Tue-Fri 3:30-8:15 PM; Sat 9:30-6:15 PM; Sun 1:30-6:15 PM";
        row[17] = "$35 (Yearly Membership Fee)";
        row[18] = "$20/hr (Members gear) / $25/hr (w/ Recurve rental)";
        row[19] = "Yes ($5-$10 per hour for members)";
        row[20] = "Intro Session ($35); Family Session ($70); JOP ($666.75)";
        console.log("Updated Row 33 (Eriched):", row[0]);
    }

    // Row 34: Bulkley Valley Bowmen (Index 33) - Already mostly correct but ensuring consistency
    if (data[33]) {
        const row = data[33];
        row[1] = "Behind Fall Fair Grounds (Outdoor); 7091 Kroeker Road (Indoor at BV Rod & Gun)";
        row[2] = "Smithers";
        row[5] = "V0J 2N0 (Mailing)";
        row[8] = "(250) 877-8734 (Sam Cooper)";
        row[9] = "membership@bvbowmen.ca / rentals@bvbowmen.com";
        row[10] = "https://www.bulkleyvalleybowmen.com/";
        row[11] = "Indoor archery at Rod & Gun club (Mon nights) and outdoor range along Bulkley River. Junior program available.";
        row[12] = "Indoor/Outdoor";
        row[16] = "Indoor Drop-in: Mon 6:30-9:30 PM (Jan-Apr)";
        row[15] = "Indoor Range; Outdoor River-side Range";
        row[17] = "$57.80 (Individual) / $85.50 (Family)";
        row[18] = "$10.00 (Indoor session fee for members)";
        row[19] = "Yes (Available for events/socials)";
        row[20] = "Junior Indoor Archery Program (Free for members' kids)";
        console.log("Updated Row 34 (Verified):", row[0]);
    }

    const newSheet = XLSX.utils.aoa_to_sheet(data);
    workbook.Sheets[sheetName] = newSheet;
    XLSX.writeFile(workbook, filename);
    console.log("File saved.");
} catch (e) {
    console.error("Error:", e.message);
}
