const mongoose = require('mongoose');
const XLSX = require('xlsx');
const CallingData = require('./src/models/CallingData');

async function importData() {
  await mongoose.connect('mongodb://127.0.0.1:27017/calling-management');
  console.log('Connected to DB');

  const userId = '6a42818454b06f508aedd7c2';
  
  // Clear all data to ensure fresh import without duplicates or blanks
  await CallingData.deleteMany({ userId });
  console.log('Cleared existing data.');

  const workbook = XLSX.readFile('./temp_sheet.xlsx');
  
  const toInsert = [];

  for (const sheetName of workbook.SheetNames) {
    // Only parse sheets that look like DD MMM YY (e.g. 10 Feb 26)
    if (!/^\d{2} [a-zA-Z]{3} \d{2}$/.test(sheetName)) continue;
    
    const sheet = workbook.Sheets[sheetName];
    const rows = XLSX.utils.sheet_to_json(sheet, { header: 1 });
    
    // Skip header row (index 0)
    for (let i = 1; i < rows.length; i++) {
      const row = rows[i];
      if (!row || row.length === 0) continue;
      
      let hasData = false;
      for (let j=0; j<18; j++) {
        if (row[j] !== undefined && row[j] !== null && String(row[j]).trim() !== '') {
          hasData = true;
          break;
        }
      }
      if (!hasData) continue;

      // Extract raw values properly
      const getValue = (idx) => {
        let val = row[idx];
        if (val === undefined || val === null) return '';
        // Special formatting for dates if Excel parses them as numbers
        return String(val).trim();
      };

      toInsert.push({
        userId,
        sheetDate: sheetName,
        email: getValue(0),
        name: getValue(1),
        mobileNo: getValue(2),
        relation: getValue(3),
        errorCode: getValue(4),
        remarks: getValue(5),
        status: getValue(6),
        review: getValue(7),
        edit: getValue(8),
        call: getValue(9),
        callingOT: getValue(10),
        editOT: getValue(11),
        reviewOT: getValue(12),
        remarksFromCalling: getValue(13),
        remarksFromReview: getValue(14),
        reviewTime: getValue(15),
        editTime: getValue(16),
        callTime: getValue(17)
      });
    }
  }

  console.log(`Found ${toInsert.length} data rows to insert.`);
  
  if (toInsert.length > 0) {
    const batchSize = 1000;
    for (let i = 0; i < toInsert.length; i += batchSize) {
      const batch = toInsert.slice(i, i + batchSize);
      await CallingData.insertMany(batch);
      console.log(`Inserted batch ${i} to ${i + batch.length}`);
    }
    console.log('Import successful.');
  } else {
    console.log('No data found to insert.');
  }

  process.exit(0);
}

importData().catch(console.error);
