const mongoose = require('mongoose');

const candidateSchema = new mongoose.Schema({
  electionId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Election',
    required: true
  },
  candidateId: {
    type: Number,
    required: true
  },
  name: {
    type: String,
    required: [true, 'Candidate name is required'],
    trim: true
  },
  party: {
    type: String,
    required: [true, 'Party is required'],
    trim: true
  },
  manifesto: {
    type: String,
    trim: true
  },
  imageUrl: {
    type: String,
    trim: true
  },
  status: {
    type: String,
    enum: ['active', 'withdrawn', 'disqualified'],
    default: 'active'
  },
  withdrawalReason: {
    type: String
  },
  voteCount: {
    type: Number,
    default: 0
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  isVerified: {
    type: Boolean,
    default: false
  },
  isActive: {
    type: Boolean,
    default: false
  },
  verificationNotes: {
    type: String
  },
  verifiedAt: {
    type: Date
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Compound index to ensure unique candidate IDs per election
candidateSchema.index({ electionId: 1, candidateId: 1 }, { unique: true });

module.exports = mongoose.model('Candidate', candidateSchema);
