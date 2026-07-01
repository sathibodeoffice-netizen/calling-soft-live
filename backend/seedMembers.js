const mongoose = require('mongoose');

async function seedMembers() {
  await mongoose.connect('mongodb://127.0.0.1:27017/calling-management');
  
  const Call = mongoose.model('CallingData', new mongoose.Schema({review: String, edit: String, call: String}, {collection: 'callingdatas'}));
  
  const teamMemberSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    name: { type: String },
    color: { type: String, default: '#ffffff' }
  }, { timestamps: true });
  const TeamMember = mongoose.model('TeamMember', teamMemberSchema);

  const userId = '6a42818454b06f508aedd7c2';
  
  const reviews = await Call.distinct('review');
  const edits = await Call.distinct('edit');
  const calls = await Call.distinct('call');
  
  const allNames = new Set([...reviews, ...edits, ...calls]);
  allNames.delete('');
  
  // Masum has a light blue color in the screenshot (approx #e6f2ff)
  // Others we can just leave default white or a random color.
  
  for (const name of allNames) {
    if (name) {
      const exists = await TeamMember.findOne({ userId, name: name.trim() });
      if (!exists) {
        let color = '#ffffff';
        if (name.trim().toLowerCase() === 'masum') color = '#e6f2ff';
        if (name.trim().toLowerCase() === 'hasan') color = '#e6ffe6';
        
        await TeamMember.create({
          userId,
          name: name.trim(),
          color
        });
      }
    }
  }
  
  console.log('Seeded members.');
  process.exit(0);
}
seedMembers().catch(console.error);
