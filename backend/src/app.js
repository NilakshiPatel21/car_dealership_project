const express = require('express');
const authRoutes = require('./routes/authRoutes');
const vehicleRoutes = require('./routes/vehicleRoutes');

const app = express();

// Parse incoming JSON bodies
app.use(express.json());

app.use('/api/auth', authRoutes);


app.use('/api/vehicles', vehicleRoutes);

// Health check
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'OK' });
});

module.exports = app;
