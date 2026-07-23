const express = require('express');
const { createVehicle } = require('../controllers/vehicleController');
const { protect } = require('../middleware/auth');

const router = express.Router();

// Any logged-in user can create a vehicle
router.post('/', protect, createVehicle);

module.exports = router;
