const XLSX = require('xlsx');

const filename = 'BC_Archery_Ranges_Complete.xlsx';

try {
    const workbook = XLSX.readFile(filename);
    const sheetName = workbook.SheetNames[0];
    const sheet = workbook.Sheets[sheetName];

    // Convert to array of arrays (header: 1)
    const data = XLSX.utils.sheet_to_json(sheet, { header: 1 });

    // Row 9 is index 8
    const rowIndex = 8;

    // Check if row exists
    if (data[rowIndex]) {
        // Headers are typically:
        // Name, Address, City, Province, Country, Postal, Lat, Long, Phone, Email, Website, Description, Facility Type, 
        // Hours, Images, Lanes, Membership Price, Drop-in Price, Equipment Rental, Lessons Info

        // Based on the read output from previous step, let's map the indices.
        // Index 0: Name
        // Index 1: Address
        // Index 2: City
        // Index 3: Province
        // Index 4: Country
        // Index 5: Postal
        // Index 6: Lat
        // Index 7: Long
        // Index 8: Phone
        // Index 9: Email
        // Index 10: Website
        // Index 11: Desc
        // ...

        // The user wants: address, postal code, phone, email, hours, images, lanes, membership price, drop-in price, equipment rental, lessons info.

        const row = data[rowIndex];

        // Update fields if they are missing or empty
        // Helper to safely set N/A if empty
        const setIfEmpty = (idx, val) => {
            if (!row[idx] || row[idx] === 'N/A' || row[idx].trim() === '') {
                row[idx] = val;
            }
        };

        // Name is at 0: "Coquitlam Area Enforcers"

        // Address at 1
        row[1] = "N/A";
        // Postal at 5
        row[5] = "N/A";
        // Phone at 8
        row[8] = "N/A";
        // Email at 9
        row[9] = "N/A";

        // Hours at 17 ?? Let's check the previous output structure for index mapping.
        // From Row 8 output:
        // 0: Name
        // 1: Address
        // 2: City
        // 3: Province
        // 4: Country
        // 5: Postal
        // 6: Lat
        // 7: Long
        // 8: Phone
        // 9: Email
        // 10: Website
        // 11: Description
        // 12: Fac Type (Indoor/Outdoor)

        // Wait, I need to match the columns perfectly.
        // Let's look at Row 8 again from the log.
        // [
        //   "Port Coquitlam...",
        //   "5000 Harper Rd",
        //   "Coquitlam",
        //   "British Columbia",
        //   "Canada",
        //   "V3E 3H1",
        //   "49.309...",
        //   "-122.75...",
        //   "604-942...", (Phone)
        //   "info@...", (Email)
        //   "https://...",
        //   "...", (Desc)
        //   "Indoor/Outdoor", (12)
        //   "No", (13 - Has Pro Shop?)
        //   "Yes", (14 - Has 3D?)
        //   "Yes", (15 - Has Field?)
        //   "Yes", (16 - Equipment Rental?) -- Wait, user asked for "Equipment rental" column update.
        //   "$155 individual...", (17? No, let's count)
        // ]

        // Let's rely on the structure from Row 8 output in step 140.
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
        // 13: ? (Values: "No") -> Pro Shop?
        // 14: ? (Values: "Yes") -> 3D?
        // 15: ? (Values: "Yes") -> Field?
        // 16: ? (Values: "Yes (members)...") -> Hours? Or Access?
        // 17: ? (Values: "$155...") -> Membership Price
        // 18: ? (Values: "$5...") -> Drop-in Price
        // 19: ? (Values: "Yes") -> Equipment Rental?
        // 20: ? (Values: "Yes (JOP...)") -> Lessons?
        // 21: ? (Values: "$120/year...") -> ? 
        // 22: ? (Values: "Recurve...") -> Equipment Types?
        // 23: "N/A" (Images??)

        // The user listed "lanes" too.
        // Let's look at the Headers from Step 140 log if available?
        // "Headers (Row 1):" was printed but truncated in the tool output preview. I didn't see the full list.
        // I will assume standard columns based on the request.

        // Let's just update the specific indices safely by assuming the user wants "N/A" where I found nothing.
        // I will set indices 1, 5, 8, 9 to "N/A".

        // For the rest (Hours, Prices, etc), I need to know which index is which. 
        // I'll read headers again to be sure in this script before writing.

        const headers = data[0];
        const getIdx = (name) => headers.findIndex(h => h.toLowerCase().includes(name.toLowerCase()));

        const idxAddress = getIdx('address'); // Usually 1 or 'post_address'
        const idxPostal = getIdx('postal');
        const idxPhone = getIdx('phone');
        const idxEmail = getIdx('email');
        const idxHours = getIdx('hours'); // Might not exist? Or 'operating_hours'?
        const idxImages = getIdx('images'); // or 'listing_images'
        const idxLanes = getIdx('lanes');
        const idxMemPrice = getIdx('membership');
        const idxDropPrice = getIdx('drop');
        const idxRental = getIdx('rental');
        const idxLessons = getIdx('lesson');

        // Fallback indices if headers are not clear (based on previous observations):
        // 1: Address
        // 5: Postal
        // 8: Phone
        // 9: Email

        // I will write N/A to these calculated indices if they exist.

        const setVal = (idx, val) => {
            if (idx >= 0) row[idx] = val;
        };

        setVal(idxAddress, "N/A");
        setVal(idxPostal, "N/A");
        setVal(idxPhone, "N/A");
        setVal(idxEmail, "N/A");
        setVal(idxHours, "N/A");
        setVal(idxImages, "N/A");
        setVal(idxLanes, "N/A");
        setVal(idxMemPrice, "N/A");
        setVal(idxDropPrice, "N/A");
        setVal(idxRental, "N/A");
        setVal(idxLessons, "N/A");

        // Also ensure specific indices 1,5,8,9 are N/A if header search failed, because those are standard/critical.
        if (idxAddress === -1) row[1] = "N/A";
        if (idxPostal === -1) row[5] = "N/A";
        if (idxPhone === -1) row[8] = "N/A";
        if (idxEmail === -1) row[9] = "N/A";

        console.log("Updated Row 9:", row);
    }

    // Write back
    const newSheet = XLSX.utils.aoa_to_sheet(data);
    workbook.Sheets[sheetName] = newSheet;
    XLSX.writeFile(workbook, filename);
    console.log("File saved.");

} catch (e) {
    console.error("Error:", e.message);
}
