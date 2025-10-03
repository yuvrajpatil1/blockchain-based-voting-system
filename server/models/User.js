const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Name is required'],
    trim: true
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    trim: true,
    match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email']
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: 6
  },
  walletAddress: {
    type: String,
    unique: true,
    sparse: true,
    uppercase: true
  },
  role: {
    type: String,
    enum: ['voter', 'admin'],
    default: 'voter'
  },
  isVerified: {
    type: Boolean,
    default: false
  },
  voterId: {
    type: String,
    unique: true,
    sparse: true
  },
  phoneNumber: {
    type: String,
    trim: true
  },
  dateOfBirth: {
    type: Date
  },
  address: {
    type: String
  },
  hasVoted: {
    type: Boolean,
    default: false
  },
  isActive: {
    type: Boolean,
    default: true
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

module.exports = mongoose.model('User', userSchema);
