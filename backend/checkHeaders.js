const XLSX = require('xlsx');

function checkHeaders() {
  const workbook = XLSX.readFile('./temp_sheet.xlsx');
  const sheetName = '10 Feb 26';
  if (workbook.SheetNames.includes(sheetName)) {
    const sheet = workbook.Sheets[sheetName];
    const data = XLSX.utils.sheet_to_json(sheet, { header: 1 });
    console.log("Headers from 10 Feb 26:");
    console.log(data[0]);
    console.log(data[1]);
  }
}
checkHeaders();
