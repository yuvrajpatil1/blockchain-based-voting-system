const express = require('express');
const router = express.Router();
const voteController = require('../controllers/voteController');
const { protect, authorize } = require('../middleware/auth');

// @route   POST /api/votes
router.post('/', protect, voteController.castVote);

// @route   POST /api/votes/verify
router.post('/verify', protect, voteController.verifyVote);

// @route   GET /api/votes/check/:electionId
router.get('/check/:electionId', protect, voteController.checkVoteStatus);

// @route   GET /api/votes/receipt/:electionId
router.get('/receipt/:electionId', protect, voteController.getVoteReceipt);

// @route   GET /api/votes/history
router.get('/history', protect, voteController.getVoterHistory);

// @route   GET /api/votes/election/:electionId
router.get('/election/:electionId', protect, authorize('admin'), voteController.getElectionVotes);

// @route   GET /api/votes/integrity/:electionId
router.get('/integrity/:electionId', protect, authorize('admin'), voteController.verifyVoteIntegrity);

// @route   GET /api/votes/analytics/:electionId
router.get('/analytics/:electionId', protect, authorize('admin'), voteController.getVoteAnalytics);

module.exports = router;
