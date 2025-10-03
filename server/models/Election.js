const mongoose = require('mongoose');

const electionSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Election title is required'],
    trim: true,
    minlength: [3, 'Title must be at least 3 characters']
  },
  description: {
    type: String,
    required: [true, 'Description is required'],
    trim: true
  },
  electionId: {
    type: String,
    required: true,
    unique: true
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  candidateRegistrationDeadline: {
    type: Date,
    required: true
  },
  startTime: {
    type: Date,
    required: [true, 'Start time is required']
  },
  endTime: {
    type: Date,
    required: [true, 'End time is required'],
    validate: {
      validator: function(value) {
        return value > this.startTime;
      },
      message: 'End time must be after start time'
    }
  },
  status: {
    type: String,
    enum: ['scheduled', 'upcoming', 'ongoing', 'completed', 'suspended', 'cancelled'],
    default: 'scheduled'
  },
  isPublic: {
    type: Boolean,
    default: true
  },
  allowedVoters: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  resultsPublished: {
    type: Boolean,
    default: false
  },
  resultsPublishTime: {
    type: Date
  },
  isArchived: {
    type: Boolean,
    default: false
  },
  suspensionReason: {
    type: String
  },
  totalVotes: {
    type: Number,
    default: 0
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

module.exports = mongoose.model('Election', electionSchema);
