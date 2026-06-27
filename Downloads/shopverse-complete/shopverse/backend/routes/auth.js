const express = require('express');
const router = express.Router();
const User = require('../models/User');
const { Vendor } = require('../models/index');
const { generateToken } = require('../middleware/auth');

// @route POST /api/auth/register
router.post('/register', async (req, res) => {
  let user;
  try {
    const { name, email, password, role, storeName } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ success: false, message: 'Please provide name, email, and password.' });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ success: false, message: 'Email already registered.' });
    }

    const validRole = ['customer', 'vendor'].includes(role) ? role : 'customer';
    if (validRole === 'vendor' && !storeName?.trim()) {
      return res.status(400).json({ success: false, message: 'Store name is required for seller registration.' });
    }

    user = await User.create({ name, email, password, role: validRole });

    if (validRole === 'vendor') {
      await Vendor.create({
        user: user._id,
        storeName: storeName.trim(),
        isApproved: false,
      });
    }

    const token = generateToken(user._id);
    res.status(201).json({
      success: true,
      token,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        avatar: user.avatar,
      },
    });
  } catch (err) {
    if (user) {
      await User.findByIdAndDelete(user._id).catch(() => null);
    }
    const duplicateStore = err.code === 11000 && err.keyValue?.storeName;
    const message = duplicateStore
      ? 'Store name already taken. Please choose a different one.'
      : err.message;
    res.status(duplicateStore ? 400 : 500).json({ success: false, message });
  }
});

// @route POST /api/auth/login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Please provide email and password.' });
    }

    const user = await User.findOne({ email }).select('+password');
    if (!user || !(await user.comparePassword(password))) {
      return res.status(401).json({ success: false, message: 'Invalid email or password.' });
    }

    if (user.isSuspended) {
      return res.status(403).json({ success: false, message: 'Your account has been suspended.' });
    }

    const token = generateToken(user._id);
    res.json({
      success: true,
      token,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        avatar: user.avatar,
      },
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// @route GET /api/auth/me
router.get('/me', require('../middleware/auth').protect, async (req, res) => {
  try {
    const user = await User.findById(req.user._id).populate('wishlist');
    res.json({ success: true, user });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
