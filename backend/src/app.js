const express = require('express');
const cors = require('cors');

const authRoutes = require('./routes/authRoutes');
const callingRoutes = require('./routes/callingRoutes');
const reportRoutes = require('./routes/reportRoutes');
const memberRoutes = require('./routes/memberRoutes');

const app = express();

// Middlewares
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/calling', callingRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/members', memberRoutes);

app.get('/', (req, res) => {
  res.send('Calling Management API is running...');
});

// Error handling middleware can be added here

module.exports = app;
