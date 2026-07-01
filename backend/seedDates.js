const mongoose = require('mongoose');
const CallingData = require('./src/models/CallingData');

async function seed() {
  await mongoose.connect('mongodb://127.0.0.1:27017/calling-management');
  console.log('Connected to DB');

  const userId = '6a42818454b06f508aedd7c2';

  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'];
  let datesToSeed = [];

  // Generate dates from Jan 1 to Jun 30, 2026
  for (let m = 0; m <= 5; m++) {
    const maxDays = new Date(2026, m + 1, 0).getDate();
    for (let d = 1; d <= maxDays; d++) {
      const day = d.toString().padStart(2, '0');
      const month = months[m];
      const dateStr = `${day} ${month} 26`;
      datesToSeed.push(dateStr);
    }
  }

  // Find existing dates
  const existingDates = await CallingData.distinct('sheetDate', { userId });
  
  const toInsert = [];
  for (const date of datesToSeed) {
    if (!existingDates.includes(date)) {
      toInsert.push({
        userId,
        email: '', name: '', mobileNo: '', relation: '', errorCode: '', remarks: '',
        status: '', review: '', edit: '', call: '', editOverview: '', remarksFromCalling: '', remarksFromReview: '', reviewTime: '', editTime: '', callTime: '',
        sheetDate: date
      });
    }
  }

  if (toInsert.length > 0) {
    await CallingData.insertMany(toInsert);
    console.log(`Inserted ${toInsert.length} dates.`);
  } else {
    console.log('No new dates to insert.');
  }
  
  process.exit(0);
}

seed().catch(console.error);
