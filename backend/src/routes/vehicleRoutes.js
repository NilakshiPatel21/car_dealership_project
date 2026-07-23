const express = require('express');
const router = express.Router();
const { createVehicle, getVehicles, searchVehicles, updateVehicle, deleteVehicle, purchaseVehicle, restockVehicle } = require('../controllers/vehicleController');
const { protect, adminOnly } = require('../middleware/auth');

router.get('/search', protect, searchVehicles);
router.get('/', protect, getVehicles);
router.post('/', protect, createVehicle);
router.put('/:id', protect, updateVehicle);
router.delete('/:id', protect, adminOnly, deleteVehicle);
router.post('/:id/purchase', protect, purchaseVehicle);
router.post('/:id/restock', protect, adminOnly, restockVehicle);

module.exports = router;