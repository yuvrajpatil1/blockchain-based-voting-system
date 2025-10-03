const Vote = require("../models/Vote");
const Election = require("../models/Election");
const Candidate = require("../models/Candidate");
const User = require("../models/User");
const web3Utils = require("../utils/web3Utils");

// @desc    Cast vote
// @route   POST /api/votes
// @access  Private
exports.castVote = async (req, res) => {
  try {
    const { electionId, candidateId } = req.body;

    // Validation
    if (!electionId || !candidateId) {
      return res.status(400).json({
        success: false,
        message: "Please provide electionId and candidateId",
      });
    }

    // Get election
    const election = await Election.findById(electionId);
    if (!election) {
      return res.status(404).json({
        success: false,
        message: "Election not found",
      });
    }

    // Check if election is ongoing
    const now = new Date();
    if (now < election.startTime) {
      return res.status(400).json({
        success: false,
        message: "Election has not started yet",
      });
    }
    if (now > election.endTime) {
      return res.status(400).json({
        success: false,
        message: "Election has ended",
      });
    }
    if (election.status !== "ongoing" && election.status !== "upcoming") {
      return res.status(400).json({
        success: false,
        message: "Election is not active",
      });
    }

    // Check if candidate exists
    const candidate = await Candidate.findOne({ electionId, candidateId });
    if (!candidate) {
      return res.status(404).json({
        success: false,
        message: "Candidate not found",
      });
    }

    if (candidate.status !== "active") {
      return res.status(400).json({
        success: false,
        message: "Candidate is not active",
      });
    }

    // Get voter
    const voter = await User.findById(req.user.userId);
    if (!voter) {
      return res.status(404).json({
        success: false,
        message: "Voter not found",
      });
    }

    if (!voter.walletAddress) {
      return res.status(400).json({
        success: false,
        message: "Please link your wallet address first",
      });
    }

    if (!voter.isVerified) {
      return res.status(403).json({
        success: false,
        message: "Your account is not verified",
      });
    }

    // Check if already voted
    const existingVote = await Vote.findOne({
      electionId,
      voterId: voter._id,
    });

    if (existingVote) {
      return res.status(400).json({
        success: false,
        message: "You have already voted in this election",
      });
    }

    // Try blockchain operations with fallback
    let bcResult = null;
    let voteHash;
    let useBlockchain = true;

    try {
      // Check eligibility on blockchain
      const isEligible = await web3Utils.isVoterEligible(
        election.electionId,
        voter.walletAddress
      );

      if (!isEligible) {
        console.log(`Voter ${voter.walletAddress} not registered on blockchain, falling back to database-only voting`);
        useBlockchain = false;
      }

      if (useBlockchain) {
        // Cast vote on blockchain
        bcResult = await web3Utils.castVote(
          election.electionId,
          candidateId,
          voter.walletAddress
        );

        // Generate vote hash
        const voteData = `${election.electionId}-${voter._id}-${candidateId}-${Date.now()}`;
        voteHash = web3Utils.generateHash(voteData);
      }
    } catch (blockchainError) {
      console.log('Blockchain error, using database-only voting:', blockchainError.message);
      useBlockchain = false;
    }

    // Fallback: Database-only voting if blockchain unavailable or voter not registered
    if (!useBlockchain) {
      const crypto = require('crypto');
      const voteData = `${election.electionId}-${voter._id}-${candidateId}-${Date.now()}`;
      voteHash = crypto.createHash('sha256').update(voteData).digest('hex');
    }

    // Record vote in database
    const vote = await Vote.create({
      electionId,
      voterId: voter._id,
      candidateId,
      voteHash,
      transactionHash: bcResult?.transactionHash || null,
      blockNumber: bcResult?.blockNumber || null,
      status: bcResult ? "confirmed" : "pending",
      timestamp: new Date(),
    });

    // Update election vote count
    await Election.findByIdAndUpdate(electionId, {
      $inc: { totalVotes: 1 },
    });

    // Update candidate vote count
    await Candidate.findOneAndUpdate(
      { electionId, candidateId },
      { $inc: { voteCount: 1 } }
    );

    res.status(201).json({
      success: true,
      message: "Vote cast successfully",
      data: {
        voteHash,
        transactionHash: bcResult?.transactionHash || null,
        blockNumber: bcResult?.blockNumber || null,
        timestamp: vote.timestamp,
        blockchainEnabled: useBlockchain,
      },
    });
  } catch (error) {
    console.error("Cast vote error:", error);
    res.status(500).json({
      success: false,
      message: "Error casting vote",
      error: error.message,
    });
  }
};

// @desc    Verify vote on blockchain
// @route   POST /api/votes/verify
// @access  Private
exports.verifyVote = async (req, res) => {
  try {
    const { electionId } = req.body;

    const election = await Election.findById(electionId);
    if (!election) {
      return res.status(404).json({
        success: false,
        message: "Election not found",
      });
    }

    const voter = await User.findById(req.user.userId);
    if (!voter || !voter.walletAddress) {
      return res.status(404).json({
        success: false,
        message: "Voter not found or wallet not linked",
      });
    }

    // Check on blockchain
    const hasVoted = await web3Utils.hasVoted(
      election.electionId,
      voter.walletAddress
    );

    if (!hasVoted) {
      return res.status(404).json({
        success: false,
        message: "No vote found on blockchain",
      });
    }

    // Get vote from database
    const vote = await Vote.findOne({
      electionId,
      voterId: voter._id,
    });

    res.status(200).json({
      success: true,
      data: {
        hasVoted: true,
        voteHash: vote?.voteHash,
        transactionHash: vote?.transactionHash,
        blockNumber: vote?.blockNumber,
        timestamp: vote?.timestamp,
        verified: true,
      },
    });
  } catch (error) {
    console.error("Verify vote error:", error);
    res.status(500).json({
      success: false,
      message: "Error verifying vote",
      error: error.message,
    });
  }
};

// @desc    Check if user has voted
// @route   GET /api/votes/check/:electionId
// @access  Private
exports.checkVoteStatus = async (req, res) => {
  try {
    const vote = await Vote.findOne({
      electionId: req.params.electionId,
      voterId: req.user.userId,
    });

    res.status(200).json({
      success: true,
      data: {
        hasVoted: !!vote,
        voteHash: vote?.voteHash,
        timestamp: vote?.timestamp,
      },
    });
  } catch (error) {
    console.error("Check vote status error:", error);
    res.status(500).json({
      success: false,
      message: "Error checking vote status",
      error: error.message,
    });
  }
};

// @desc    Get vote receipt
// @route   GET /api/votes/receipt/:electionId
// @access  Private
exports.getVoteReceipt = async (req, res) => {
  try {
    const vote = await Vote.findOne({
      electionId: req.params.electionId,
      voterId: req.user.userId,
    }).populate("electionId", "title");

    if (!vote) {
      return res.status(404).json({
        success: false,
        message: "Vote not found",
      });
    }

    res.status(200).json({
      success: true,
      data: {
        electionTitle: vote.electionId.title,
        voteHash: vote.voteHash,
        transactionHash: vote.transactionHash,
        blockNumber: vote.blockNumber,
        timestamp: vote.timestamp,
        status: vote.status,
      },
    });
  } catch (error) {
    console.error("Get vote receipt error:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching vote receipt",
      error: error.message,
    });
  }
};

// @desc    Get voter history
// @route   GET /api/votes/history
// @access  Private
exports.getVoterHistory = async (req, res) => {
  try {
    const votes = await Vote.find({ voterId: req.user.userId })
      .populate("electionId", "title status startTime endTime")
      .select("-voterId")
      .sort({ timestamp: -1 });

    res.status(200).json({
      success: true,
      data: votes,
    });
  } catch (error) {
    console.error("Get voter history error:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching voter history",
      error: error.message,
    });
  }
};

// @desc    Get all votes for an election (admin only)
// @route   GET /api/votes/election/:electionId
// @access  Private/Admin
exports.getElectionVotes = async (req, res) => {
  try {
    const { page = 1, limit = 50 } = req.query;

    const votes = await Vote.find({ electionId: req.params.electionId })
      .populate("voterId", "name email voterId")
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .sort({ timestamp: -1 });

    const count = await Vote.countDocuments({
      electionId: req.params.electionId,
    });

    res.status(200).json({
      success: true,
      data: votes,
      pagination: {
        total: count,
        page: Number(page),
        pages: Math.ceil(count / limit),
      },
    });
  } catch (error) {
    console.error("Get election votes error:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching election votes",
      error: error.message,
    });
  }
};

// @desc    Verify vote integrity (blockchain vs database)
// @route   GET /api/votes/integrity/:electionId
// @access  Private/Admin
exports.verifyVoteIntegrity = async (req, res) => {
  try {
    const election = await Election.findById(req.params.electionId);
    if (!election) {
      return res.status(404).json({
        success: false,
        message: "Election not found",
      });
    }

    const dbVoteCount = await Vote.countDocuments({ electionId: election._id });
    const bcVoteCount = await web3Utils.getTotalVotes(election.electionId);

    const isIntact = dbVoteCount === bcVoteCount;

    res.status(200).json({
      success: true,
      data: {
        databaseVotes: dbVoteCount,
        blockchainVotes: bcVoteCount,
        isIntact,
        message: isIntact
          ? "Vote integrity verified"
          : "Vote count mismatch detected",
      },
    });
  } catch (error) {
    console.error("Verify vote integrity error:", error);
    res.status(500).json({
      success: false,
      message: "Error verifying vote integrity",
      error: error.message,
    });
  }
};

// @desc    Get vote analytics for an election
// @route   GET /api/votes/analytics/:electionId
// @access  Private/Admin
exports.getVoteAnalytics = async (req, res) => {
  try {
    const election = await Election.findById(req.params.electionId);
    if (!election) {
      return res.status(404).json({
        success: false,
        message: "Election not found",
      });
    }

    const totalVotes = await Vote.countDocuments({ electionId: election._id });

    const votesByCandidate = await Vote.aggregate([
      { $match: { electionId: election._id } },
      { $group: { _id: "$candidateId", count: { $sum: 1 } } },
      { $sort: { count: -1 } },
    ]);

    const votesOverTime = await Vote.aggregate([
      { $match: { electionId: election._id } },
      {
        $group: {
          _id: {
            $dateToString: { format: "%Y-%m-%d %H:00", date: "$timestamp" },
          },
          count: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    res.status(200).json({
      success: true,
      data: {
        totalVotes,
        votesByCandidate,
        votesOverTime,
      },
    });
  } catch (error) {
    console.error("Get vote analytics error:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching vote analytics",
      error: error.message,
    });
  }
};
