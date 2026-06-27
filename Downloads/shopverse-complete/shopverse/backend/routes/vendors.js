const express = require('express');
const router = express.Router();
const { Vendor } = require('../models/index');
const Product = require('../models/Product');
const { Order } = require('../models/index');
const { protect, authorize } = require('../middleware/auth');

router.get('/', async (req, res) => {
  try {
    const vendors = await Vendor.find({ isApproved: true, isSuspended: false })
      .populate('user', 'name avatar email')
      .sort('-totalRevenue');
    res.json({ success: true, vendors });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

router.get('/me', protect, authorize('vendor'), async (req, res) => {
  try {
    const vendor = await Vendor.findOne({ user: req.user._id }).populate('user', 'name email');
    if (!vendor) return res.status(404).json({ success: false, message: 'Vendor profile not found.' });

    // Analytics
    const products = await Product.find({ vendor: req.user._id });
    const orders = await Order.find({ 'items.vendor': req.user._id })
      .populate('items.product', 'name images price');

    const revenue = orders.reduce((sum, o) => {
      const vendorItems = o.items.filter(i => i.vendor?.toString() === req.user._id.toString());
      return sum + vendorItems.reduce((s, i) => s + i.price * i.quantity, 0);
    }, 0);

    res.json({
      success: true,
      vendor,
      analytics: {
        totalProducts: products.length,
        totalOrders: orders.length,
        totalRevenue: revenue,
        recentOrders: orders.slice(0, 5),
      },
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

router.put('/me', protect, authorize('vendor'), async (req, res) => {
  try {
    const vendor = await Vendor.findOneAndUpdate(
      { user: req.user._id },
      req.body,
      { new: true }
    );
    res.json({ success: true, vendor });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
