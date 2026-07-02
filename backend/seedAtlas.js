const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const URI = 'mongodb+srv://sathibdigitalmarketing_db_user:basis-anis@cluster0.bspuern.mongodb.net/calling-management?appName=Cluster0';

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, default: 'admin' }
});
const User = mongoose.model('User', userSchema);

const memberSchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true },
  color: { type: String, required: true }
});
const TeamMember = mongoose.model('TeamMember', memberSchema);

async function seed() {
  try {
    await mongoose.connect(URI);
    console.log('Connected to Atlas');
    
    const existing = await User.findOne({ email: 'arsathib24@gmail.com' });
    if (!existing) {
      const hashedPassword = await bcrypt.hash('123456', 10);
      await User.create({
        name: 'Admin',
        email: 'arsathib24@gmail.com',
        password: hashedPassword,
        role: 'admin'
      });
      console.log('Admin user created.');
    } else {
      console.log('Admin already exists.');
    }

    const membersCount = await TeamMember.countDocuments();
    if (membersCount === 0) {
      const members = [
        { name: "Anis", color: "#FFB6C1" },
        { name: "Sraboni", color: "#ADD8E6" },
        { name: "Rifat", color: "#90EE90" },
        { name: "Limon", color: "#FFFFE0" },
        { name: "Rabbi", color: "#FFA07A" },
        { name: "Abir", color: "#20B2AA" },
        { name: "Rakib", color: "#9370DB" },
        { name: "Sayed", color: "#FFDAB9" },
        { name: "Nayem", color: "#F08080" },
        { name: "Nayeem", color: "#E6E6FA" }
      ];
      await TeamMember.insertMany(members);
      console.log('Members seeded.');
    }
    
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}
seed();
