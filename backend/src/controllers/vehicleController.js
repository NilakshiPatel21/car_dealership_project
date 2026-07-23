const Vehicle = require('../models/vehicle');

const createVehicle = async (req, res) => {
  try {
    const { make, model, category, price, quantity } = req.body;

    if (!make || !model || !category || price === undefined || quantity === undefined) {
      return res.status(400).json({ message: 'make, model, category, price, and quantity are required' });
    }
    if (price < 0 || quantity < 0) {
      return res.status(400).json({ message: 'price and quantity must not be negative' });
    }

    const vehicle = await Vehicle.create({ make, model, category, price, quantity });
    res.status(201).json(vehicle);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

module.exports = { createVehicle };
