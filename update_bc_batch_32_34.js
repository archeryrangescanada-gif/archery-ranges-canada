const XLSX = require('xlsx');
const filename = 'BC_Archery_Ranges_Complete.xlsx';

try {
    const workbook = XLSX.readFile(filename);
    const sheetName = workbook.SheetNames[0];
    const sheet = workbook.Sheets[sheetName];
    const data = XLSX.utils.sheet_to_json(sheet, { header: 1 });

    // Row 32: Revelstoke Rod and Gun Club (Index 31)
    if (data[31]) {
        const row = data[31];
        row[1] = "1906 Camozzi Road (Frisby Range)";
        row[5] = "V0E 2S0";
        row[8] = "(250) 814-9384 (Lee)";
        row[9] = "revelstokerodandgunclub@gmail.com";
        row[10] = "https://revelstokerodandgunclub.ca/";
        row[11] = "Outdoor Frisby Range with an eight-acre wooded area designated for archery. Membership includes BC Wildlife Federation.";
        row[12] = "Outdoor Range";
        row[16] = "30 mins after sunrise to 30 mins before sunset";
        row[15] = "Wooded Archery Area (8 acres)";
        row[17] = "$120 (Adult) / $175 (Family) / $50 (Youth) / $90 (Senior)";
        row[18] = "N/A (Membership only facility)";
        row[19] = "N/A";
        row[20] = "No formal archery-specific lessons found";
        console.log("Updated Row 32:", row[0]);
    }

    // Row 33: Richmond Archery Club (Index 32)
    if (data[32]) {
        const row = data[32];
        row[17] = "$35 (Yearly Membership Fee)";
        row[18] = "$20/hr (Members gear) / $25/hr (w/ Recurve rental)";
        row[19] = "Yes ($5-$10 per hour for members)";
        row[20] = "Intro Session ($35); Family Session ($70); JOP ($666.75/4mo)";
        row[11] = "Large indoor archery range with certified instructors. Can accommodate 70 people with 24 simultaneous shooting spots.";
        console.log("Updated Row 33:", row[0]);
    }

    // Row 34: Bulkley Valley Bowmen (Index 33)
    if (data[33]) {
        const row = data[33];
        row[1] = "7091 Kroeker Road (Indoor at BV Rod & Gun); Fall Fair Grounds (Outdoor)";
        row[5] = "V0J 2N0 (Mailing)";
        row[8] = "(250) 877-8734 (Sam Cooper)";
        row[9] = "membership@bvbowmen.ca / rentals@bvbowmen.com";
        row[10] = "https://www.bulkleyvalleybowmen.com/";
        row[11] = "Indoor archery at Rod & Gun club (Mon nights) and outdoor range along Bulkley River. Junior program available.";
        row[12] = "Indoor/Outdoor";
        row[16] = "Indoor Drop-in: Mon 6:30-9:30 PM (Jan-Apr)";
        row[15] = "Indoor Range; Outdoor River-side Range";
        row[17] = "$57.80 (Individual) / $85.50 (Family) / $35.75 (Junior)";
        row[18] = "$10.00 (Indoor session fee for members)";
        row[19] = "Yes (Available for events/socials)";
        row[20] = "Junior Indoor Archery Program (6 weeks; free for members' kids)";
        row[2] = "Smithers";
        console.log("Updated Row 34:", row[0]);
    }

    const newSheet = XLSX.utils.aoa_to_sheet(data);
    workbook.Sheets[sheetName] = newSheet;
    XLSX.writeFile(workbook, filename);
    console.log("File saved.");
} catch (e) {
    console.error("Error:", e.message);
}
