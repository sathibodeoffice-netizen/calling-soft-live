const mongoose = require('mongoose');
const CallingData = require('./src/models/CallingData');

async function seed() {
  try {
    await mongoose.connect('mongodb://127.0.0.1:27017/calling-management');
    console.log('Connected to DB');

    // Admin user ID
    const userId = '6a42818454b06f508aedd7c2';

    const dummyData = [
      { userId, email: 'millonmia015@gmail.com', name: '', mobileNo: '', relation: '', errorCode: '05', remarks: 'সুন্নতি দাড়ি আছে কি না? ক', status: 'Not Approved', review: 'Suja', edit: '', call: '', editOverview: '', remarksFromCalling: '', remarksFromReview: '', reviewTime: '', editTime: '', callTime: '' },
      { userId, email: 'mdmahmudullahriyad575@', name: '', mobileNo: '', relation: '', errorCode: '05', remarks: '০৫, অভিভাবকের সাথে স', status: 'Not Approved', review: 'Suja', edit: '', call: '', editOverview: '', remarksFromCalling: '', remarksFromReview: '', reviewTime: '9:16:00 AM', editTime: '', callTime: '' },
      { userId, email: 'ajijulislamislam81@gmail', name: '', mobileNo: '', relation: '', errorCode: '', remarks: 'শিক্ষাগত যোগ্যতা, এই মুহু', status: 'Edit required', review: 'Suja', edit: '', call: '', editOverview: '', remarksFromCalling: '', remarksFromReview: '', reviewTime: '9:30:37 AM', editTime: '', callTime: '' },
      { userId, email: 'eklasu39@gmail.com', name: '', mobileNo: '', relation: '', errorCode: '05', remarks: 'সুন্নতি দাড়ি আছে কি না? ক', status: 'Not Approved', review: 'Suja', edit: '', call: '', editOverview: '', remarksFromCalling: '', remarksFromReview: '', reviewTime: '', editTime: '', callTime: '' },
      { userId, email: 'shiblusl@gmail.com', name: 'শিবলু মিয়া', mobileNo: '01346235700', relation: 'ভাই', errorCode: '', remarks: '', status: 'Approved', review: 'Suja', edit: 'Tuba', call: '', editOverview: '', remarksFromCalling: '', remarksFromReview: '', reviewTime: '', editTime: '', callTime: '' },
      { userId, email: 'md.shujonmia191@gmail.', name: '', mobileNo: '', relation: '', errorCode: '', remarks: '২৮, আপনি বা আপনার প', status: 'Not Approved', review: 'Suja', edit: '', call: '', editOverview: '', remarksFromCalling: '', remarksFromReview: '', reviewTime: '9:38:15 AM', editTime: '', callTime: '' },
      { userId, email: 'tarmimakter2023@gmail.c', name: '', mobileNo: '', relation: '', errorCode: '07', remarks: 'কবে থেকে নিকাব সহ পর্দা', status: 'Not Approved', review: 'Suja', edit: '', call: '', editOverview: '', remarksFromCalling: '', remarksFromReview: '', reviewTime: '', editTime: '', callTime: '' },
      { userId, email: 'jahidhasank9@gmail.com', name: '', mobileNo: '', relation: '', errorCode: '', remarks: 'অভিভাবকের সাথে সম্পর্ক, ', status: 'Edit required', review: 'Suja', edit: '', call: '', editOverview: '', remarksFromCalling: '', remarksFromReview: '', reviewTime: '9:43:43 AM', editTime: '', callTime: '' },
      { userId, email: 'taspiaakter121@gmail.com', name: 'তাসপিয়া আক্তার', mobileNo: '01338914949', relation: 'বড় ভাইয়া', errorCode: '', remarks: 'কবে থেকে নিকাব সহ পর্দা', status: 'Approved', review: 'Suja', edit: 'Tuba', call: '', editOverview: '', remarksFromCalling: '', remarksFromReview: '', reviewTime: '', editTime: '', callTime: '' },
      { userId, email: 'seum.sjws@gmail.com', name: '', mobileNo: '', relation: '', errorCode: '05', remarks: 'সুন্নতি দাড়ি আছে কি না? ক', status: 'Not Approved', review: 'Suja', edit: '', call: '', editOverview: '', remarksFromCalling: '', remarksFromReview: '', reviewTime: '', editTime: '', callTime: '' }
    ];

    // Clear existing empty rows created by the user accidentally to make it clean
    await CallingData.deleteMany({ userId });
    
    await CallingData.insertMany(dummyData);
    console.log('Seed successful');
    process.exit(0);
  } catch (error) {
    console.error('Seed error:', error);
    process.exit(1);
  }
}

seed();
