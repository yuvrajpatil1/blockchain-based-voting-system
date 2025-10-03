const Candidate = require('../models/Candidate');
const Election = require('../models/Election');
const User = require('../models/User');
const web3Utils = require('../utils/web3Utils');

// @desc    Add candidate to election (Admin or Self-Registration)
// @route   POST /api/candidates
// @access  Private
exports.addCandidate = async (req, res) => {
  try {
    const { electionId, candidateId, name, party, manifesto, imageUrl, userId } = req.body;

    // Validation
    if (!name || !party) {
      return res.status(400).json({
        success: false,
        message: 'Please provide name and party'
      });
    }

    // If no electionId provided, get the first scheduled election
    let finalElectionId = electionId;
    if (!finalElectionId) {
      const scheduledElection = await Election.findOne({ status: 'scheduled' }).sort({ createdAt: -1 });
      if (!scheduledElection) {
        return res.status(400).json({
          success: false,
          message: 'No elections are currently accepting candidates'
        });
      }
      finalElectionId = scheduledElection._id;
    }

    // Auto-generate candidateId if not provided
    let finalCandidateId = candidateId;
    if (!finalCandidateId) {
      const lastCandidate = await Candidate.findOne({ electionId: finalElectionId }).sort({ candidateId: -1 });
      finalCandidateId = lastCandidate ? lastCandidate.candidateId + 1 : 1;
    }

    // Check if user is registering themselves as candidate
    const isSelfRegistration = req.user.role !== 'admin';
    if (isSelfRegistration) {
      // Verify user is verified before allowing self-registration
      const user = await User.findById(req.user.userId);
      if (!user.isVerified) {
        return res.status(403).json({
          success: false,
          message: 'Only verified users can register as candidates'
        });
      }
    }

    // Check if election exists
    const election = await Election.findById(finalElectionId);
    if (!election) {
      return res.status(404).json({
        success: false,
        message: 'Election not found'
      });
    }

    // Check if candidate registration deadline has passed
    const now = new Date();
    if (now > election.candidateRegistrationDeadline) {
      return res.status(400).json({
        success: false,
        message: 'Candidate registration deadline has passed. Registration closed.'
      });
    }

    // For self-registration, check if election is in scheduled status
    if (isSelfRegistration && election.status !== 'scheduled') {
      return res.status(400).json({
        success: false,
        message: 'Candidate registration is only allowed during the registration period'
      });
    }

    // Check if candidate ID already exists for this election
    const existingCandidate = await Candidate.findOne({ electionId: finalElectionId, candidateId: finalCandidateId });
    if (existingCandidate) {
      return res.status(400).json({
        success: false,
        message: 'Candidate with this ID already exists in this election'
      });
    }

    // Add candidate to blockchain
    await web3Utils.addCandidate(election.electionId, finalCandidateId, name, party);

    // Add candidate to database
    const candidate = await Candidate.create({
      electionId: finalElectionId,
      candidateId: finalCandidateId,
      name,
      party,
      manifesto,
      imageUrl,
      userId: userId || req.user.userId,
      isVerified: req.user.role === 'admin', // Auto-verify if added by admin
      isActive: req.user.role === 'admin' // Auto-activate if added by admin
    });

    res.status(201).json({
      success: true,
      message: isSelfRegistration
        ? 'Candidate registration submitted. Awaiting admin verification.'
        : 'Candidate added successfully',
      data: candidate
    });
  } catch (error) {
    console.error('Add candidate error:', error);
    res.status(500).json({
      success: false,
      message: 'Error adding candidate',
      error: error.message
    });
  }
};

// @desc    Get all candidates for an election
// @route   GET /api/candidates/election/:electionId
// @access  Public
exports.getCandidatesByElection = async (req, res) => {
  try {
    const candidates = await Candidate.find({ electionId: req.params.electionId })
      .sort({ candidateId: 1 });

    res.status(200).json({
      success: true,
      data: candidates
    });
  } catch (error) {
    console.error('Get candidates error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching candidates',
      error: error.message
    });
  }
};

// @desc    Get candidate by ID
// @route   GET /api/candidates/:id
// @access  Public
exports.getCandidateById = async (req, res) => {
  try {
    const candidate = await Candidate.findById(req.params.id)
      .populate('electionId', 'title status');

    if (!candidate) {
      return res.status(404).json({
        success: false,
        message: 'Candidate not found'
      });
    }

    res.status(200).json({
      success: true,
      data: candidate
    });
  } catch (error) {
    console.error('Get candidate by ID error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching candidate',
      error: error.message
    });
  }
};

// @desc    Update candidate
// @route   PUT /api/candidates/:id
// @access  Private/Admin
exports.updateCandidate = async (req, res) => {
  try {
    const { name, party, manifesto, imageUrl, status, withdrawalReason } = req.body;

    const updateData = {};
    if (name) updateData.name = name;
    if (party) updateData.party = party;
    if (manifesto) updateData.manifesto = manifesto;
    if (imageUrl) updateData.imageUrl = imageUrl;
    if (status) updateData.status = status;
    if (withdrawalReason) updateData.withdrawalReason = withdrawalReason;

    const candidate = await Candidate.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    );

    if (!candidate) {
      return res.status(404).json({
        success: false,
        message: 'Candidate not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Candidate updated successfully',
      data: candidate
    });
  } catch (error) {
    console.error('Update candidate error:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating candidate',
      error: error.message
    });
  }
};

// @desc    Delete candidate
// @route   DELETE /api/candidates/:id
// @access  Private/Admin
exports.deleteCandidate = async (req, res) => {
  try {
    const candidate = await Candidate.findByIdAndDelete(req.params.id);

    if (!candidate) {
      return res.status(404).json({
        success: false,
        message: 'Candidate not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Candidate deleted successfully'
    });
  } catch (error) {
    console.error('Delete candidate error:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting candidate',
      error: error.message
    });
  }
};

// @desc    Get candidate with vote count from blockchain
// @route   GET /api/candidates/:id/blockchain
// @access  Public
exports.getCandidateWithBlockchainData = async (req, res) => {
  try {
    const candidate = await Candidate.findById(req.params.id)
      .populate('electionId');

    if (!candidate) {
      return res.status(404).json({
        success: false,
        message: 'Candidate not found'
      });
    }

    // Get blockchain data
    const bcData = await web3Utils.getCandidate(
      candidate.electionId.electionId,
      candidate.candidateId
    );

    res.status(200).json({
      success: true,
      data: {
        ...candidate.toObject(),
        blockchainData: bcData
      }
    });
  } catch (error) {
    console.error('Get candidate blockchain data error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching candidate blockchain data',
      error: error.message
    });
  }
};

// @desc    Get all candidates
// @route   GET /api/candidates
// @access  Public
exports.getAllCandidates = async (req, res) => {
  try {
    const Candidate = require('../models/Candidate');
    const candidates = await Candidate.find()
      .populate('electionId', 'name startDate endDate')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      data: candidates
    });
  } catch (error) {
    console.error('Get all candidates error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching candidates',
      error: error.message
    });
  }
};

// @desc    Verify/unverify candidates
// @route   PUT /api/candidates/verify
// @access  Private/Admin
exports.verifyCandidates = async (req, res) => {
  try {
    const { selectedCandidate, isVerified, verificationNotes } = req.body;
    const Candidate = require('../models/Candidate');

    const candidate = await Candidate.findByIdAndUpdate(
      selectedCandidate,
      {
        isVerified,
        isActive: isVerified,
        verificationNotes,
        verifiedAt: isVerified ? new Date() : null
      },
      { new: true }
    );

    if (!candidate) {
      return res.status(404).json({
        success: false,
        message: 'Candidate not found'
      });
    }

    res.status(200).json({
      success: true,
      message: `Candidate ${isVerified ? 'verified' : 'rejected'} successfully`,
      data: candidate
    });
  } catch (error) {
    console.error('Verify candidate error:', error);
    res.status(500).json({
      success: false,
      message: 'Error verifying candidate',
      error: error.message
    });
  }
};
