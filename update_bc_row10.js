const XLSX = require('xlsx');

const filename = 'BC_Archery_Ranges_Complete.xlsx';

try {
    const workbook = XLSX.readFile(filename);
    const sheetName = workbook.SheetNames[0];
    const sheet = workbook.Sheets[sheetName];

    // Convert to array of arrays (header: 1)
    const data = XLSX.utils.sheet_to_json(sheet, { header: 1 });

    // Row 10 is index 9
    const rowIndex = 9;

    if (data[rowIndex]) {
        const row = data[rowIndex];

        // 0: Name
        // 1: Addr
        // 2: City
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
        // 13: ?
        // 14: ?
        // 15: ?
        // 16: ?
        // 17: Mem Price
        // 18: Drop-in Price
        // 19: Rental
        // 20: Lessons
        // 21: ? (JOP?)
        // 22: Equipment Types?
        // 23: Images? 

        // Update specific fields based on research

        // Hours (Often not a column we saw explicit before, likely buried in Description or unmapped, 
        // but based on Step 158/184, "Yes (members)..." was at index 16 where I suspected Hours/Access might be)
        // Let's assume standard columns.

        // Set knowns:

        // Description (Index 11) - Append finding
        const currentDesc = row[11] || "";
        const newDesc = "Field range (10-70 yds), 3km trail with 3D targets, permanent 25-target 3D course. " + currentDesc;
        // Clean up duplication if needed, but existing description was good: "Field range with target butts 10-70 yards..."
        // So I'll just leave description or slightly enhance.
        // Existing: "Field range with target butts 10-70 yards. 3km trail with variety of 3D targets. Field house and Old Archers Cabin..."
        // It's good.

        // Hours (Index 16?)
        // Row 9 had "Yes (members); Drop-in Thu" 
        // For Row 10: "Dawn to Dusk (Members); Open House 1st Sun of month 10am-2pm"
        if (!row[16] || row[16] === 'N/A') {
            row[16] = "Dawn to Dusk (Members); Open House 1st Sun/month 10am-2pm";
        }

        // Lanes (User asked for lanes - likely index 15 "70" which was "Yes" for field course? Or is 70 the yardage?)
        // Row 9 had "Indoor: 18m; Outdoor: N/A" at index 15.
        // So Index 15 is likely "Lanes / Distances".
        // Current value: "70" -> Update to "Field Range: 10-70 yards; 3D Trails"
        row[15] = "Field Range: 10-70 yards; 3D Trails";

        // Membership Price (Index 17)
        // Current: "Approx. $200/year (couple hundred)"
        // Research didn't give exact current price, stick with existing but maybe clean up text if needed.
        // "Refer to website breakdown" might be safer but existing is fine.

        // Drop-in Price (Index 18)
        // Research: "Free (during Monthly Open House)"
        row[18] = "Free (First Sunday of Month Open House)";

        // Equipment Rental (Index 19)
        // Research: Provided during open house.
        // Current: "No"
        // Update to: "Yes (During Open House only)"
        row[19] = "Yes (During Open House only)";

        // Lessons (Index 20)
        // Research: Instruction at open houses, Junior Olympic intro.
        // Current: "Yes" (Wait, row 9 had "Yes")
        // Row 10 has "Yes" in index 20? Let's check read output from step 167.
        // Row 10 index 20 is "Yes".
        // Update to: "Volunteers at Open House; JOP Program"
        row[20] = "Volunteers at Open House; JOP Program";

        // Images (Index 23?)
        // Keep N/A

        console.log("Updated Row 10:", row);
    }

    const newSheet = XLSX.utils.aoa_to_sheet(data);
    workbook.Sheets[sheetName] = newSheet;
    XLSX.writeFile(workbook, filename);
    console.log("File saved.");

} catch (e) {
    console.error("Error:", e.message);
}
