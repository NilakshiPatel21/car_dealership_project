const express = require('express');
const authRoutes = require('./routes/authRoutes');
const vehicleRoutes = require('./routes/vehicleRoutes');

const notFound = require('./middleware/notFound');
const errorHandler = require('./middleware/errorHandler');

const app = express();

// Parse incoming JSON bodies
app.use(express.json());

app.use('/api/auth', authRoutes);


app.use('/api/vehicles', vehicleRoutes);

// Health check
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'OK' });
});

// Global error handlers
app.use(notFound);
app.use(errorHandler);
  
module.exports = app;
