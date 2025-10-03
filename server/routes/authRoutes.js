const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { protect } = require('../middleware/auth');

// @route   POST /api/auth/register
router.post('/register', authController.register);

// @route   POST /api/auth/login
router.post('/login', authController.login);

// @route   GET /api/auth/me
router.get('/me', protect, authController.getCurrentUser);

// @route   PUT /api/auth/link-wallet
router.put('/link-wallet', protect, authController.linkWallet);

module.exports = router;
