const express = require('express');
const router = express.Router();
const { Order, Cart } = require('../models/index');
const Product = require('../models/Product');
const { protect, authorize } = require('../middleware/auth');

// GET user orders
router.get('/', protect, async (req, res) => {
  try {
    const query = req.user.role === 'admin' ? {} : { user: req.user._id };
    if (req.user.role === 'vendor') {
      // Vendors see orders containing their products
      const vendorProducts = await Product.find({ vendor: req.user._id }).select('_id');
      const productIds = vendorProducts.map(p => p._id);
      query['items.vendor'] = req.user._id;
      delete query.user;
    }
    const orders = await Order.find(query)
      .populate('user', 'name email')
      .populate('items.product', 'name images')
      .sort('-createdAt');
    res.json({ success: true, orders });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// GET single order
router.get('/:id', protect, async (req, res) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate('user', 'name email phone')
      .populate('items.product', 'name images price');

    if (!order) return res.status(404).json({ success: false, message: 'Order not found.' });

    if (req.user.role === 'customer' && order.user._id.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized.' });
    }

    res.json({ success: true, order });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// POST create order
router.post('/', protect, async (req, res) => {
  try {
    const { items, shippingAddress, billingAddress, paymentMethod, couponCode, notes } = req.body;

    if (!items || items.length === 0) {
      return res.status(400).json({ success: false, message: 'No items in order.' });
    }

    // Enrich items with product data and vendor info
    const enrichedItems = [];
    let subtotal = 0;

    for (const item of items) {
      const product = await Product.findById(item.product);
      if (!product) continue;
      const price = product.discountPrice || product.price;
      enrichedItems.push({
        product: product._id,
        name: product.name,
        image: product.images[0] || '',
        price,
        quantity: item.quantity,
        vendor: product.vendor,
      });
      subtotal += price * item.quantity;
      // Update stock and sold count
      await Product.findByIdAndUpdate(product._id, {
        $inc: { stock: -item.quantity, soldCount: item.quantity },
      });
    }

    const shippingFee = subtotal > 100 ? 0 : 9.99;
    const discount = couponCode ? subtotal * 0.1 : 0; // 10% discount with coupon
    const total = subtotal + shippingFee - discount;

    const order = await Order.create({
      user: req.user._id,
      items: enrichedItems,
      shippingAddress,
      billingAddress: billingAddress || shippingAddress,
      paymentMethod: paymentMethod || 'card',
      paymentStatus: 'paid', // Simulated payment
      orderStatus: 'confirmed',
      subtotal,
      shippingFee,
      discount,
      total,
      couponCode,
      notes,
      statusHistory: [{ status: 'confirmed', note: 'Order placed successfully' }],
      estimatedDelivery: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    });

    // Clear user cart
    await Cart.findOneAndUpdate({ user: req.user._id }, { items: [] });

    res.status(201).json({ success: true, order });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// PUT update order status (vendor/admin)
router.put('/:id/status', protect, authorize('vendor', 'admin'), async (req, res) => {
  try {
    const { orderStatus, note } = req.body;
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ success: false, message: 'Order not found.' });

    order.orderStatus = orderStatus;
    order.statusHistory.push({ status: orderStatus, note: note || '' });
    await order.save();

    res.json({ success: true, order });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// DELETE cancel order
router.delete('/:id', protect, async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ success: false, message: 'Order not found.' });

    if (order.user.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized.' });
    }

    if (['shipped', 'delivered'].includes(order.orderStatus)) {
      return res.status(400).json({ success: false, message: 'Cannot cancel this order.' });
    }

    order.orderStatus = 'cancelled';
    order.statusHistory.push({ status: 'cancelled', note: 'Order cancelled by user' });
    await order.save();

    res.json({ success: true, order });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
