const express = require('express');
const router = express.Router();
const { register, login } = require('../controllers/authController');

router.post('/register', register);
// src/routes/authRoutes.js
router.post('/login', login); // ← new line added



module.exports = router;