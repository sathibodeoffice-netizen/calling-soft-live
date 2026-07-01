const fs = require('fs');
const https = require('https');
const XLSX = require('xlsx');

const url = 'https://docs.google.com/spreadsheets/d/1z5miwtEgeiAyHUy6VPYkI7ejO7UjlTpQQYYfsj8wj0A/export?format=xlsx';

function downloadAndParse() {
  https.get(url, (res) => {
    if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
      https.get(res.headers.location, handleResponse);
    } else {
      handleResponse(res);
    }
  });
}

function handleResponse(res) {
  const file = fs.createWriteStream('./temp_sheet.xlsx');
  res.pipe(file);
  file.on('finish', () => {
    file.close();
    parseExcel();
  });
}

function parseExcel() {
  const workbook = XLSX.readFile('./temp_sheet.xlsx');
  console.log("Sheet names:");
  console.log(workbook.SheetNames);
}

downloadAndParse();
