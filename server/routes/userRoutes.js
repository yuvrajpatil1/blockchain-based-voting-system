const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { protect, authorize } = require('../middleware/auth');

// @route   GET /api/users/stats
router.get('/stats', protect, authorize('admin'), userController.getUserStats);

// @route   GET /api/users
router.get('/', protect, authorize('admin'), userController.getAllUsers);

// @route   GET /api/users/:id
router.get('/:id', protect, userController.getUserById);

// @route   PUT /api/users/:id
router.put('/:id', protect, userController.updateUser);

// @route   PUT /api/users/:id/role
router.put('/:id/role', protect, authorize('admin'), userController.updateUserRole);

// @route   PUT /api/users/:id/verify
router.put('/:id/verify', protect, authorize('admin'), userController.verifyUser);

// @route   PUT /api/users/:id/status
router.put('/:id/status', protect, authorize('admin'), userController.updateUserStatus);

// @route   POST /api/users/:id/reset-vote
router.post('/:id/reset-vote', protect, authorize('admin'), userController.resetUserVote);

// @route   DELETE /api/users/:id
router.delete('/:id', protect, authorize('admin'), userController.deleteUser);

module.exports = router;
