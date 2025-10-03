const express = require('express');
const router = express.Router();

// @route   GET /api/health
// @desc    Get system health status
// @access  Public
router.get('/', async (req, res) => {
  try {
    const mongoose = require('mongoose');

    const health = {
      success: true,
      system: {
        status: 'operational',
        database: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected',
        uptime: process.uptime(),
        timestamp: new Date().toISOString(),
        environment: process.env.NODE_ENV || 'development',
        nodeVersion: process.version
      }
    };

    res.json(health);
  } catch (error) {
    res.status(500).json({
      success: false,
      system: {
        status: 'error',
        message: error.message
      }
    });
  }
});

module.exports = router;
