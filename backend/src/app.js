const express = require('express');
const authRoutes = require('./routes/authRoutes');

const app = express();

// Parse incoming JSON bodies
app.use(express.json());

app.use('/api/auth', authRoutes);

// Health check
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'OK' });
});

module.exports = app;
