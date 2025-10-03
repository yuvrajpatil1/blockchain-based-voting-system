const mongoose = require('mongoose');

const voteSchema = new mongoose.Schema({
  electionId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Election',
    required: true
  },
  voterId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  candidateId: {
    type: Number,
    required: true
  },
  voteHash: {
    type: String,
    required: true
  },
  transactionHash: {
    type: String
  },
  blockNumber: {
    type: Number
  },
  status: {
    type: String,
    enum: ['pending', 'confirmed', 'failed'],
    default: 'confirmed'
  },
  timestamp: {
    type: Date,
    default: Date.now,
    required: true
  }
}, {
  timestamps: true
});

// Compound index to ensure one vote per voter per election
voteSchema.index({ electionId: 1, voterId: 1 }, { unique: true });
voteSchema.index({ electionId: 1, candidateId: 1 });
voteSchema.index({ voteHash: 1 });

module.exports = mongoose.model('Vote', voteSchema);
