const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { sendWalletAssignmentEmail } = require('../utils/emailService');
const crypto = require('crypto');

// Generate JWT Token
const generateToken = (userId, role) => {
  return jwt.sign(
    { userId, role },
    process.env.JWT_SECRET || 'your-secret-key',
    { expiresIn: '7d' }
  );
};

// @desc    Register a new user
// @route   POST /api/auth/register
// @access  Public
exports.register = async (req, res) => {
  try {
    const { name, email, password, walletAddress, role } = req.body;

    // Validation
    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide name, email, and password'
      });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'User already exists with this email'
      });
    }

    // Check if wallet address is already in use
    if (walletAddress) {
      const walletInUse = await User.findOne({ walletAddress: walletAddress.toUpperCase() });
      if (walletInUse) {
        return res.status(400).json({
          success: false,
          message: 'Wallet address already linked to another account'
        });
      }
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Auto-generate wallet address if not provided
    let finalWalletAddress = walletAddress;
    if (!finalWalletAddress) {
      // Generate a deterministic wallet address from user email and timestamp
      const hash = crypto.createHash('sha256').update(`${email}${Date.now()}`).digest('hex');
      finalWalletAddress = '0x' + hash.substring(0, 40).toUpperCase();
    } else {
      finalWalletAddress = finalWalletAddress.toUpperCase();
    }

    // Create user
    const user = await User.create({
      name,
      email: email.toLowerCase(),
      password: hashedPassword,
      walletAddress: finalWalletAddress,
      role: role || 'voter'
    });

    // Generate token
    const token = generateToken(user._id, user.role);

    // Send wallet assignment email if wallet was auto-generated
    if (!walletAddress) {
      await sendWalletAssignmentEmail(user.email, user.name, finalWalletAddress);
    }

    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      data: {
        userId: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        walletAddress: user.walletAddress,
        isVerified: user.isVerified
      },
      token
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({
      success: false,
      message: 'Error registering user',
      error: error.message
    });
  }
};

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validation
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide email and password'
      });
    }

    // Find user
    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    // Check password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    // Generate token
    const token = generateToken(user._id, user.role);

    res.status(200).json({
      success: true,
      message: 'Login successful',
      data: {
        userId: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        walletAddress: user.walletAddress,
        isVerified: user.isVerified
      },
      token
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      message: 'Error logging in',
      error: error.message
    });
  }
};

// @desc    Get current user
// @route   GET /api/auth/me
// @access  Private
exports.getCurrentUser = async (req, res) => {
  try {
    const user = await User.findById(req.user.userId).select('-password');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.status(200).json({
      success: true,
      data: user
    });
  } catch (error) {
    console.error('Get current user error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching user data',
      error: error.message
    });
  }
};

// @desc    Link wallet address
// @route   PUT /api/auth/link-wallet
// @access  Private
exports.linkWallet = async (req, res) => {
  try {
    const { walletAddress } = req.body;

    if (!walletAddress) {
      return res.status(400).json({
        success: false,
        message: 'Please provide wallet address'
      });
    }

    // Check if wallet is already in use
    const walletInUse = await User.findOne({
      walletAddress: walletAddress.toUpperCase(),
      _id: { $ne: req.user.userId }
    });

    if (walletInUse) {
      return res.status(400).json({
        success: false,
        message: 'Wallet address already linked to another account'
      });
    }

    // Update user
    const user = await User.findByIdAndUpdate(
      req.user.userId,
      { walletAddress: walletAddress.toUpperCase() },
      { new: true }
    ).select('-password');

    res.status(200).json({
      success: true,
      message: 'Wallet linked successfully',
      data: user
    });
  } catch (error) {
    console.error('Link wallet error:', error);
    res.status(500).json({
      success: false,
      message: 'Error linking wallet',
      error: error.message
    });
  }
};
