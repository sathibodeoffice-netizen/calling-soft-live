const XLSX = require('xlsx');

function readSheet() {
  try {
    const workbook = XLSX.readFile('../sheet.xlsx');
    
    // Read the first daily sheet (e.g. 10 Feb 26)
    const dailySheetName = '10 Feb 26';
    if (workbook.SheetNames.includes(dailySheetName)) {
      console.log("Found daily sheet:", dailySheetName);
      const dailySheet = workbook.Sheets[dailySheetName];
      const data = XLSX.utils.sheet_to_json(dailySheet, { header: 1 });
      console.log("Headers of daily sheet:", data[0]);
    } else {
      console.log("No daily sheet found.");
    }
  } catch (err) {
    console.error(err);
  }
}

readSheet();
