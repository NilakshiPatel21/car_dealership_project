const express = require('express');
const router = express.Router();
const { createVehicle, getVehicles, searchVehicles } = require('../controllers/vehicleController');
const { protect } = require('../middleware/auth');

router.get('/search', protect, searchVehicles);
router.get('/', protect, getVehicles);
router.post('/', protect, createVehicle);

module.exports = router;