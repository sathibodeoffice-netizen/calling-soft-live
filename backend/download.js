const fs = require('fs');
const https = require('https');

const url = 'https://docs.google.com/spreadsheets/d/1z5miwtEgeiAyHUy6VPYkI7ejO7UjlTpQQYYfsj8wj0A/export?format=xlsx';

https.get(url, (res) => {
  if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
    // Follow redirect
    https.get(res.headers.location, (redirectRes) => {
      const file = fs.createWriteStream('../sheet.xlsx');
      redirectRes.pipe(file);
      file.on('finish', () => {
        file.close();
        console.log('Download complete (redirected)');
      });
    });
  } else {
    const file = fs.createWriteStream('../sheet.xlsx');
    res.pipe(file);
    file.on('finish', () => {
      file.close();
      console.log('Download complete');
    });
  }
}).on('error', (err) => {
  console.error('Download failed:', err);
});
