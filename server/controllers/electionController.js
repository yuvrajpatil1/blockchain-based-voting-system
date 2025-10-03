const Election = require('../models/Election');
const Candidate = require('../models/Candidate');
const Vote = require('../models/Vote');
const User = require('../models/User');
const web3Utils = require('../utils/web3Utils');
const { sendBulkElectionAnnouncement } = require('../utils/emailService');

// @desc    Create new election
// @route   POST /api/elections
// @access  Private/Admin
exports.createElection = async (req, res) => {
  try {
    const { title, description, startTime, endTime, isPublic, allowedVoters } = req.body;

    // Validation
    if (!title || !description || !startTime || !endTime) {
      return res.status(400).json({
        success: false,
        message: 'Please provide all required fields'
      });
    }

    const start = new Date(startTime);
    const end = new Date(endTime);

    if (end <= start) {
      return res.status(400).json({
        success: false,
        message: 'End time must be after start time'
      });
    }

    // Create election on blockchain
    const startTimestamp = Math.floor(start.getTime() / 1000);
    const endTimestamp = Math.floor(end.getTime() / 1000);

    const bcResult = await web3Utils.createElection(
      title,
      description,
      startTimestamp,
      endTimestamp
    );

    const electionId = bcResult.events.ElectionCreated.returnValues.electionId;

    // Set candidate registration deadline to 48 hours from creation
    const candidateRegistrationDeadline = new Date(Date.now() + 48 * 60 * 60 * 1000);

    // Elections start as "scheduled" - must have candidates before going "upcoming" or "ongoing"
    const status = 'scheduled';

    // Create election in database
    const election = await Election.create({
      title,
      description,
      electionId,
      createdBy: req.user.userId,
      candidateRegistrationDeadline,
      startTime: start,
      endTime: end,
      status,
      isPublic: isPublic !== undefined ? isPublic : true,
      allowedVoters: allowedVoters || []
    });

    // Send email notifications to all verified users
    const verifiedUsers = await User.find({ isVerified: true }).select('name email');
    await sendBulkElectionAnnouncement(verifiedUsers, election);

    res.status(201).json({
      success: true,
      message: 'Election created successfully. Email notifications sent to all verified users.',
      data: election
    });
  } catch (error) {
    console.error('Create election error:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating election',
      error: error.message
    });
  }
};

// @desc    Get all elections
// @route   GET /api/elections
// @access  Public
exports.getAllElections = async (req, res) => {
  try {
    const { status, isPublic, page = 1, limit = 20 } = req.query;

    const filter = {};
    if (status) filter.status = status;
    if (isPublic !== undefined) filter.isPublic = isPublic === 'true';

    // If not admin, only show public elections or private elections user has access to
    if (req.user && req.user.role !== 'admin') {
      filter.$or = [
        { isPublic: true },
        { allowedVoters: req.user.userId }
      ];
    } else if (!req.user) {
      filter.isPublic = true;
    }

    const elections = await Election.find(filter)
      .populate('createdBy', 'name email')
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .sort({ startTime: -1 });

    const count = await Election.countDocuments(filter);

    res.status(200).json({
      success: true,
      data: elections,
      pagination: {
        total: count,
        page: Number(page),
        pages: Math.ceil(count / limit)
      }
    });
  } catch (error) {
    console.error('Get all elections error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching elections',
      error: error.message
    });
  }
};

// @desc    Get election by ID
// @route   GET /api/elections/:id
// @access  Public
exports.getElectionById = async (req, res) => {
  try {
    const election = await Election.findById(req.params.id)
      .populate('createdBy', 'name email');

    if (!election) {
      return res.status(404).json({
        success: false,
        message: 'Election not found'
      });
    }

    // Check access for private elections
    if (!election.isPublic) {
      if (!req.user || (req.user.role !== 'admin' && !election.allowedVoters.includes(req.user.userId))) {
        return res.status(403).json({
          success: false,
          message: 'Access denied to this election'
        });
      }
    }

    res.status(200).json({
      success: true,
      data: election
    });
  } catch (error) {
    console.error('Get election by ID error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching election',
      error: error.message
    });
  }
};

// @desc    Update election
// @route   PUT /api/elections/:id
// @access  Private/Admin
exports.updateElection = async (req, res) => {
  try {
    const { title, description, startTime, endTime, status, isPublic, allowedVoters } = req.body;

    const updateData = {};
    if (title) updateData.title = title;
    if (description) updateData.description = description;
    if (startTime) updateData.startTime = new Date(startTime);
    if (endTime) updateData.endTime = new Date(endTime);
    if (status) updateData.status = status;
    if (isPublic !== undefined) updateData.isPublic = isPublic;
    if (allowedVoters) updateData.allowedVoters = allowedVoters;

    const election = await Election.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    );

    if (!election) {
      return res.status(404).json({
        success: false,
        message: 'Election not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Election updated successfully',
      data: election
    });
  } catch (error) {
    console.error('Update election error:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating election',
      error: error.message
    });
  }
};

// @desc    Delete election
// @route   DELETE /api/elections/:id
// @access  Private/Admin
exports.deleteElection = async (req, res) => {
  try {
    const election = await Election.findByIdAndDelete(req.params.id);

    if (!election) {
      return res.status(404).json({
        success: false,
        message: 'Election not found'
      });
    }

    // Delete associated candidates and votes
    await Candidate.deleteMany({ electionId: election._id });
    await Vote.deleteMany({ electionId: election._id });

    res.status(200).json({
      success: true,
      message: 'Election deleted successfully'
    });
  } catch (error) {
    console.error('Delete election error:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting election',
      error: error.message
    });
  }
};

// @desc    Activate election (make it live for voting)
// @route   PUT /api/elections/:id/activate
// @access  Private/Admin
exports.activateElection = async (req, res) => {
  try {
    const election = await Election.findById(req.params.id);

    if (!election) {
      return res.status(404).json({
        success: false,
        message: 'Election not found'
      });
    }

    // Check if election has candidates
    const candidateCount = await Candidate.countDocuments({ electionId: election._id });
    if (candidateCount === 0) {
      return res.status(400).json({
        success: false,
        message: 'Cannot activate election without candidates. Please add candidates first.'
      });
    }

    // Determine appropriate status based on time
    const now = new Date();
    let newStatus;

    if (now >= election.startTime && now <= election.endTime) {
      newStatus = 'ongoing';
    } else if (now < election.startTime) {
      newStatus = 'upcoming';
    } else {
      return res.status(400).json({
        success: false,
        message: 'Cannot activate election that has already ended'
      });
    }

    election.status = newStatus;
    await election.save();

    res.status(200).json({
      success: true,
      message: `Election activated and set to ${newStatus}`,
      data: election
    });
  } catch (error) {
    console.error('Activate election error:', error);
    res.status(500).json({
      success: false,
      message: 'Error activating election',
      error: error.message
    });
  }
};

// @desc    Register voter to election
// @route   POST /api/elections/:id/register-voter
// @access  Private/Admin
exports.registerVoter = async (req, res) => {
  try {
    const { voterId, voterAddress } = req.body;

    const election = await Election.findById(req.params.id);
    if (!election) {
      return res.status(404).json({
        success: false,
        message: 'Election not found'
      });
    }

    // Get voter
    let voter;
    if (voterId) {
      voter = await User.findById(voterId);
    } else if (voterAddress) {
      voter = await User.findOne({ walletAddress: voterAddress.toUpperCase() });
    }

    if (!voter) {
      return res.status(404).json({
        success: false,
        message: 'Voter not found'
      });
    }

    if (!voter.walletAddress) {
      return res.status(400).json({
        success: false,
        message: 'Voter must have a wallet address linked'
      });
    }

    // Register voter on blockchain
    await web3Utils.registerVoter(election.electionId, voter.walletAddress);

    res.status(200).json({
      success: true,
      message: 'Voter registered successfully'
    });
  } catch (error) {
    console.error('Register voter error:', error);
    res.status(500).json({
      success: false,
      message: 'Error registering voter',
      error: error.message
    });
  }
};

// @desc    Bulk register voters
// @route   POST /api/elections/:id/register-voters-bulk
// @access  Private/Admin
exports.bulkRegisterVoters = async (req, res) => {
  try {
    const { voterIds, voterAddresses } = req.body;

    const election = await Election.findById(req.params.id);
    if (!election) {
      return res.status(404).json({
        success: false,
        message: 'Election not found'
      });
    }

    const registered = [];
    const failed = [];

    // Register by IDs
    if (voterIds && voterIds.length > 0) {
      for (const voterId of voterIds) {
        try {
          const voter = await User.findById(voterId);
          if (voter && voter.walletAddress) {
            await web3Utils.registerVoter(election.electionId, voter.walletAddress);
            registered.push(voterId);
          } else {
            failed.push({ voterId, reason: 'Voter not found or no wallet address' });
          }
        } catch (error) {
          failed.push({ voterId, reason: error.message });
        }
      }
    }

    // Register by addresses
    if (voterAddresses && voterAddresses.length > 0) {
      for (const address of voterAddresses) {
        try {
          const voter = await User.findOne({ walletAddress: address.toUpperCase() });
          if (voter) {
            await web3Utils.registerVoter(election.electionId, voter.walletAddress);
            registered.push(address);
          } else {
            failed.push({ address, reason: 'Voter not found' });
          }
        } catch (error) {
          failed.push({ address, reason: error.message });
        }
      }
    }

    res.status(200).json({
      success: true,
      message: 'Bulk registration completed',
      data: {
        registered: registered.length,
        failed: failed.length,
        details: { registered, failed }
      }
    });
  } catch (error) {
    console.error('Bulk register voters error:', error);
    res.status(500).json({
      success: false,
      message: 'Error in bulk registration',
      error: error.message
    });
  }
};

// @desc    Get election results
// @route   GET /api/elections/:id/results
// @access  Public
exports.getResults = async (req, res) => {
  try {
    const election = await Election.findById(req.params.id);

    if (!election) {
      return res.status(404).json({
        success: false,
        message: 'Election not found'
      });
    }

    // Allow viewing results for ongoing and completed elections
    // Only restrict if election is not started yet
    if (election.status === 'scheduled' && req.user?.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Election has not started yet'
      });
    }

    // Get candidates from database
    const candidates = await Candidate.find({ electionId: election._id });

    let results;
    let totalVotes = 0;

    try {
      // Try to get results from blockchain
      const bcResults = await web3Utils.getElectionResults(election.electionId);

      // Combine blockchain results with database data
      results = bcResults.map(bcResult => {
        const candidate = candidates.find(c => c.candidateId === bcResult.candidateId);
        return {
          candidateId: bcResult.candidateId,
          name: candidate?.name || 'Unknown',
          party: candidate?.party || 'Unknown',
          manifesto: candidate?.manifesto,
          voteCount: bcResult.voteCount,
          imageUrl: candidate?.imageUrl
        };
      }).sort((a, b) => b.voteCount - a.voteCount);

      totalVotes = await Vote.countDocuments({ electionId: election._id });
    } catch (blockchainError) {
      console.log('Blockchain unavailable, using database vote counts:', blockchainError.message);

      // Fallback to database vote counts when blockchain is unavailable
      results = candidates.map(candidate => ({
        candidateId: candidate.candidateId,
        name: candidate.name,
        party: candidate.party,
        manifesto: candidate.manifesto,
        voteCount: candidate.voteCount || 0,
        imageUrl: candidate.imageUrl
      })).sort((a, b) => b.voteCount - a.voteCount);

      totalVotes = election.totalVotes || 0;
    }

    res.status(200).json({
      success: true,
      data: {
        electionId: election.electionId,
        title: election.title,
        status: election.status,
        totalVotes,
        results
      }
    });
  } catch (error) {
    console.error('Get results error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching results',
      error: error.message
    });
  }
};

// @desc    Declare/publish results
// @route   POST /api/elections/:id/declare-results
// @access  Private/Admin
exports.declareResults = async (req, res) => {
  try {
    const election = await Election.findByIdAndUpdate(
      req.params.id,
      {
        resultsPublished: true,
        status: 'completed'
      },
      { new: true }
    );

    if (!election) {
      return res.status(404).json({
        success: false,
        message: 'Election not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Results declared successfully',
      data: election
    });
  } catch (error) {
    console.error('Declare results error:', error);
    res.status(500).json({
      success: false,
      message: 'Error declaring results',
      error: error.message
    });
  }
};

// @desc    Get election statistics
// @route   GET /api/elections/:id/stats
// @access  Public
exports.getElectionStats = async (req, res) => {
  try {
    const election = await Election.findById(req.params.id);

    if (!election) {
      return res.status(404).json({
        success: false,
        message: 'Election not found'
      });
    }

    const totalCandidates = await Candidate.countDocuments({ electionId: election._id });
    const totalVotes = await Vote.countDocuments({ electionId: election._id });
    const bcTotalVotes = await web3Utils.getTotalVotes(election.electionId);

    res.status(200).json({
      success: true,
      data: {
        title: election.title,
        status: election.status,
        totalCandidates,
        totalVotes,
        blockchainVotes: bcTotalVotes,
        startTime: election.startTime,
        endTime: election.endTime
      }
    });
  } catch (error) {
    console.error('Get election stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching election statistics',
      error: error.message
    });
  }
};

// @desc    End/suspend election
// @route   PUT /api/elections/:id/end
// @access  Private/Admin
exports.endElection = async (req, res) => {
  try {
    const { suspensionReason } = req.body;

    const election = await Election.findById(req.params.id);

    if (!election) {
      return res.status(404).json({
        success: false,
        message: 'Election not found'
      });
    }

    // End election on blockchain
    await web3Utils.endElection(election.electionId);

    // Update database
    election.status = suspensionReason ? 'suspended' : 'completed';
    if (suspensionReason) election.suspensionReason = suspensionReason;
    await election.save();

    res.status(200).json({
      success: true,
      message: 'Election ended successfully',
      data: election
    });
  } catch (error) {
    console.error('End election error:', error);
    res.status(500).json({
      success: false,
      message: 'Error ending election',
      error: error.message
    });
  }
};

// @desc    Get dashboard statistics
// @route   GET /api/elections/dashboard/stats
// @access  Private/Admin
exports.getDashboardStats = async (req, res) => {
  try {
    const totalElections = await Election.countDocuments();
    const activeElections = await Election.countDocuments({ status: 'ongoing' });
    const completedElections = await Election.countDocuments({ status: 'completed' });
    const totalVotes = await Vote.countDocuments();
    const totalUsers = await User.countDocuments();
    const verifiedVoters = await User.countDocuments({ role: 'voter', isVerified: true });

    res.status(200).json({
      success: true,
      data: {
        totalElections,
        activeElections,
        completedElections,
        totalVotes,
        totalUsers,
        verifiedVoters
      }
    });
  } catch (error) {
    console.error('Get dashboard stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching dashboard statistics',
      error: error.message
    });
  }
};

// @desc    Get voting analytics
// @route   GET /api/elections/analytics
// @access  Private/Admin
exports.getVotingAnalytics = async (req, res) => {
  try {
    const Vote = require('../models/Vote');
    const User = require('../models/User');

    // Get hourly distribution of votes
    const hourlyDistribution = await Vote.aggregate([
      {
        $group: {
          _id: { $hour: '$timestamp' },
          count: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    // Get peak voting hour
    const peakHour = hourlyDistribution.length > 0
      ? hourlyDistribution.reduce((max, curr) =>
          curr.count > max.count ? curr : max
        )
      : null;

    // Get total votes and unique voters
    const totalVotes = await Vote.countDocuments();
    const uniqueVoters = await User.countDocuments({ hasVoted: true });

    res.status(200).json({
      success: true,
      data: {
        hourlyDistribution,
        peakHour,
        totalVotes,
        uniqueVoters
      }
    });
  } catch (error) {
    console.error('Get voting analytics error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching voting analytics',
      error: error.message
    });
  }
};
