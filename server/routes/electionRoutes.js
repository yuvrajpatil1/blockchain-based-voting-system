const express = require('express');
const router = express.Router();
const electionController = require('../controllers/electionController');
const { protect, authorize, optionalAuth } = require('../middleware/auth');

// @route   GET /api/elections/dashboard/stats
router.get('/dashboard/stats', protect, authorize('admin'), electionController.getDashboardStats);

// @route   GET /api/elections/analytics
router.get('/analytics', protect, authorize('admin'), electionController.getVotingAnalytics);

// @route   POST /api/elections
router.post('/', protect, authorize('admin'), electionController.createElection);

// @route   GET /api/elections
router.get('/', optionalAuth, electionController.getAllElections);

// @route   GET /api/elections/:id
router.get('/:id', optionalAuth, electionController.getElectionById);

// @route   PUT /api/elections/:id
router.put('/:id', protect, authorize('admin'), electionController.updateElection);

// @route   DELETE /api/elections/:id
router.delete('/:id', protect, authorize('admin'), electionController.deleteElection);

// @route   PUT /api/elections/:id/activate
router.put('/:id/activate', protect, authorize('admin'), electionController.activateElection);

// @route   POST /api/elections/:id/register-voter
router.post('/:id/register-voter', protect, authorize('admin'), electionController.registerVoter);

// @route   POST /api/elections/:id/register-voters-bulk
router.post('/:id/register-voters-bulk', protect, authorize('admin'), electionController.bulkRegisterVoters);

// @route   GET /api/elections/:id/results
router.get('/:id/results', optionalAuth, electionController.getResults);

// @route   POST /api/elections/:id/declare-results
router.post('/:id/declare-results', protect, authorize('admin'), electionController.declareResults);

// @route   GET /api/elections/:id/stats
router.get('/:id/stats', optionalAuth, electionController.getElectionStats);

// @route   PUT /api/elections/:id/end
router.put('/:id/end', protect, authorize('admin'), electionController.endElection);

module.exports = router;
