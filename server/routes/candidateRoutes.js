const express = require('express');
const router = express.Router();
const candidateController = require('../controllers/candidateController');
const { protect, authorize } = require('../middleware/auth');

// @route   POST /api/candidates (Admin can add directly, users can self-register)
router.post('/', protect, candidateController.addCandidate);

// @route   GET /api/candidates (get all candidates)
router.get('/', candidateController.getAllCandidates);

// @route   PUT /api/candidates/verify
router.put('/verify', protect, authorize('admin'), candidateController.verifyCandidates);

// @route   GET /api/candidates/election/:electionId
router.get('/election/:electionId', candidateController.getCandidatesByElection);

// @route   GET /api/candidates/:id
router.get('/:id', candidateController.getCandidateById);

// @route   GET /api/candidates/:id/blockchain
router.get('/:id/blockchain', candidateController.getCandidateWithBlockchainData);

// @route   PUT /api/candidates/:id
router.put('/:id', protect, authorize('admin'), candidateController.updateCandidate);

// @route   DELETE /api/candidates/:id
router.delete('/:id', protect, authorize('admin'), candidateController.deleteCandidate);

module.exports = router;
