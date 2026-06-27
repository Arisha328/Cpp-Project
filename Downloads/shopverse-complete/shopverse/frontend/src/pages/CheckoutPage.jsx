import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { motion } from 'framer-motion';
import { CreditCard, MapPin, Package, CheckCircle, Lock, Loader2 } from 'lucide-react';
import api from '../api/axios';
import { clearCart } from '../store/slices/cartWishlistSlice';
import Navbar from '../components/layout/Navbar';
import toast from 'react-hot-toast';

const STEPS = ['Shipping', 'Payment', 'Review'];

export default function CheckoutPage() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { items } = useSelector((s) => s.cart);
  const { user } = useSelector((s) => s.auth);
  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [coupon, setCoupon] = useState('');

  const [shipping, setShipping] = useState({
    fullName: user?.name || '',
    street: user?.address?.street || '',
    city: user?.address?.city || '',
    state: user?.address?.state || '',
    zipCode: user?.address?.zipCode || '',
    country: user?.address?.country || 'United States',
    phone: user?.phone || '',
  });

  const [payment, setPayment] = useState({
    method: 'card',
    cardNumber: '',
    cardName: '',
    expiry: '',
    cvv: '',
  });

  const subtotal = items.reduce((s, item) => {
    const price = item.product?.discountPrice || item.product?.price || 0;
    return s + price * item.quantity;
  }, 0);
  const shippingFee = subtotal > 100 ? 0 : 9.99;
  const discount = coupon === 'SAVE10' ? subtotal * 0.1 : 0;
  const total = subtotal + shippingFee - discount;

  const handleOrder = async () => {
    setLoading(true);
    try {
      const orderItems = items.map((item) => ({
        product: item.product._id,
        quantity: item.quantity,
      }));

      const { data } = await api.post('/orders', {
        items: orderItems,
        shippingAddress: shipping,
        paymentMethod: payment.method,
        couponCode: coupon || null,
      });

      dispatch(clearCart());
      toast.success('Order placed successfully! 🎉');
      navigate(`/orders/${data.order._id}`);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to place order');
    } finally {
      setLoading(false);
    }
  };

  const shippingValid = Object.values(shipping).every((v) => v.trim());
  const paymentValid = payment.method !== 'card' || (payment.cardNumber && payment.cardName && payment.expiry && payment.cvv);

  return (
    <div className="min-h-screen dark:bg-gray-950">
      <Navbar />
      <div className="pt-16">
        <div className="bg-gradient-to-r from-primary to-secondary py-10">
          <div className="max-w-4xl mx-auto px-4">
            <h1 className="font-display font-bold text-3xl text-white mb-6">Checkout</h1>
            {/* Progress */}
            <div className="flex items-center gap-0">
              {STEPS.map((s, i) => (
                <div key={s} className="flex items-center">
                  <div className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all ${
                    i === step ? 'bg-white text-primary' :
                    i < step ? 'bg-white/20 text-white' : 'bg-white/10 text-white/50'
                  }`}>
                    {i < step ? <CheckCircle size={14} /> : <span>{i + 1}</span>}
                    {s}
                  </div>
                  {i < STEPS.length - 1 && <div className={`w-8 h-0.5 ${i < step ? 'bg-white' : 'bg-white/20'}`} />}
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-10">
          <div className="grid lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
              {/* Step 0: Shipping */}
              {step === 0 && (
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="card p-6">
                  <h2 className="font-display font-semibold text-lg text-gray-900 dark:text-white mb-6 flex items-center gap-2">
                    <MapPin size={20} className="text-primary" /> Shipping Address
                  </h2>
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div className="sm:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Full Name</label>
                      <input value={shipping.fullName} onChange={(e) => setShipping({ ...shipping, fullName: e.target.value })} className="input" placeholder="John Doe" />
                    </div>
                    <div className="sm:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Street Address</label>
                      <input value={shipping.street} onChange={(e) => setShipping({ ...shipping, street: e.target.value })} className="input" placeholder="123 Main Street, Apt 4B" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">City</label>
                      <input value={shipping.city} onChange={(e) => setShipping({ ...shipping, city: e.target.value })} className="input" placeholder="New York" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">State</label>
                      <input value={shipping.state} onChange={(e) => setShipping({ ...shipping, state: e.target.value })} className="input" placeholder="NY" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">ZIP Code</label>
                      <input value={shipping.zipCode} onChange={(e) => setShipping({ ...shipping, zipCode: e.target.value })} className="input" placeholder="10001" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Country</label>
                      <input value={shipping.country} onChange={(e) => setShipping({ ...shipping, country: e.target.value })} className="input" placeholder="United States" />
                    </div>
                    <div className="sm:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Phone Number</label>
                      <input value={shipping.phone} onChange={(e) => setShipping({ ...shipping, phone: e.target.value })} className="input" placeholder="+1 (555) 000-0000" />
                    </div>
                  </div>
                  <button onClick={() => setStep(1)} disabled={!shippingValid} className="btn-primary w-full mt-6">
                    Continue to Payment
                  </button>
                </motion.div>
              )}

              {/* Step 1: Payment */}
              {step === 1 && (
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="card p-6">
                  <h2 className="font-display font-semibold text-lg text-gray-900 dark:text-white mb-6 flex items-center gap-2">
                    <CreditCard size={20} className="text-primary" /> Payment Method
                  </h2>
                  <div className="grid grid-cols-3 gap-3 mb-6">
                    {[
                      { value: 'card', label: '💳 Card' },
                      { value: 'paypal', label: '🅿️ PayPal' },
                      { value: 'cod', label: '💵 Cash on Delivery' },
                    ].map((m) => (
                      <button key={m.value} onClick={() => setPayment({ ...payment, method: m.value })}
                        className={`p-3 rounded-xl border-2 text-sm font-medium transition-all ${payment.method === m.value ? 'border-primary bg-primary/5 text-primary' : 'border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300'}`}>
                        {m.label}
                      </button>
                    ))}
                  </div>

                  {payment.method === 'card' && (
                    <div className="space-y-4">
                      <div className="bg-gradient-to-br from-primary to-secondary rounded-2xl p-5 text-white mb-6">
                        <p className="text-xs opacity-70 mb-1">Card Number</p>
                        <p className="font-mono text-lg tracking-widest">
                          {payment.cardNumber ? payment.cardNumber.replace(/(.{4})/g, '$1 ').trim() : '•••• •••• •••• ••••'}
                        </p>
                        <div className="flex justify-between mt-4">
                          <div><p className="text-xs opacity-70">Name</p><p className="font-medium">{payment.cardName || 'YOUR NAME'}</p></div>
                          <div><p className="text-xs opacity-70">Expires</p><p className="font-medium">{payment.expiry || 'MM/YY'}</p></div>
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Card Number</label>
                        <input value={payment.cardNumber} onChange={(e) => setPayment({ ...payment, cardNumber: e.target.value.replace(/\D/g, '').slice(0, 16) })} className="input font-mono" placeholder="1234 5678 9012 3456" maxLength={16} />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Cardholder Name</label>
                        <input value={payment.cardName} onChange={(e) => setPayment({ ...payment, cardName: e.target.value })} className="input" placeholder="John Doe" />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Expiry</label>
                          <input value={payment.expiry} onChange={(e) => setPayment({ ...payment, expiry: e.target.value })} className="input" placeholder="MM/YY" maxLength={5} />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">CVV</label>
                          <input value={payment.cvv} onChange={(e) => setPayment({ ...payment, cvv: e.target.value.slice(0, 3) })} className="input" placeholder="•••" type="password" maxLength={3} />
                        </div>
                      </div>
                    </div>
                  )}

                  {payment.method === 'paypal' && (
                    <div className="text-center py-10 bg-blue-50 dark:bg-blue-900/10 rounded-xl">
                      <p className="text-gray-600 dark:text-gray-400">You'll be redirected to PayPal to complete payment</p>
                    </div>
                  )}
                  {payment.method === 'cod' && (
                    <div className="text-center py-10 bg-green-50 dark:bg-green-900/10 rounded-xl">
                      <p className="text-gray-600 dark:text-gray-400">Pay when your order arrives at your doorstep</p>
                    </div>
                  )}

                  <div className="flex gap-3 mt-6">
                    <button onClick={() => setStep(0)} className="btn-outline flex-1">Back</button>
                    <button onClick={() => setStep(2)} disabled={!paymentValid} className="btn-primary flex-1">Review Order</button>
                  </div>
                </motion.div>
              )}

              {/* Step 2: Review */}
              {step === 2 && (
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="card p-6">
                  <h2 className="font-display font-semibold text-lg text-gray-900 dark:text-white mb-6 flex items-center gap-2">
                    <Package size={20} className="text-primary" /> Review Order
                  </h2>
                  <div className="space-y-4 mb-6">
                    {items.map((item) => {
                      if (!item.product) return null;
                      const price = item.product.discountPrice || item.product.price;
                      return (
                        <div key={item.product._id} className="flex gap-3">
                          <img src={item.product.images?.[0] || `https://placehold.co/60x60/6366F1/fff?text=P`}
                            alt={item.product.name} className="w-14 h-14 rounded-xl object-cover bg-gray-100"
                            onError={(e) => e.target.src = 'https://placehold.co/60x60/6366F1/fff?text=P'} />
                          <div className="flex-1">
                            <p className="font-medium text-sm text-gray-900 dark:text-white line-clamp-1">{item.product.name}</p>
                            <p className="text-xs text-gray-400">Qty: {item.quantity}</p>
                          </div>
                          <span className="font-semibold text-sm text-gray-900 dark:text-white">${(price * item.quantity).toFixed(2)}</span>
                        </div>
                      );
                    })}
                  </div>

                  <div className="bg-gray-50 dark:bg-gray-800/50 rounded-xl p-4 mb-6 text-sm space-y-2">
                    <div className="font-medium text-gray-900 dark:text-white">Shipping to:</div>
                    <p className="text-gray-600 dark:text-gray-400">{shipping.fullName}</p>
                    <p className="text-gray-600 dark:text-gray-400">{shipping.street}, {shipping.city}, {shipping.state} {shipping.zipCode}</p>
                    <p className="text-gray-600 dark:text-gray-400">{shipping.country}</p>
                  </div>

                  <div className="flex gap-3">
                    <button onClick={() => setStep(1)} className="btn-outline flex-1">Back</button>
                    <button onClick={handleOrder} disabled={loading} className="btn-primary flex-1 flex items-center justify-center gap-2">
                      {loading ? <Loader2 size={16} className="animate-spin" /> : <Lock size={16} />}
                      {loading ? 'Placing Order...' : 'Place Order'}
                    </button>
                  </div>
                </motion.div>
              )}
            </div>

            {/* Summary Sidebar */}
            <div>
              <div className="card p-5 sticky top-20">
                <h3 className="font-semibold text-gray-900 dark:text-white mb-4">Order Total</h3>
                <div className="space-y-2 text-sm mb-4">
                  <div className="flex justify-between text-gray-500"><span>Subtotal</span><span>${subtotal.toFixed(2)}</span></div>
                  <div className="flex justify-between text-gray-500"><span>Shipping</span><span className={shippingFee === 0 ? 'text-success' : ''}>{shippingFee === 0 ? 'FREE' : `$${shippingFee.toFixed(2)}`}</span></div>
                  {discount > 0 && <div className="flex justify-between text-green-600"><span>Coupon</span><span>-${discount.toFixed(2)}</span></div>}
                  <div className="border-t border-gray-100 dark:border-gray-800 pt-2 flex justify-between font-bold text-gray-900 dark:text-white">
                    <span>Total</span><span>${total.toFixed(2)}</span>
                  </div>
                </div>
                <div className="flex gap-2">
                  <input value={coupon} onChange={(e) => setCoupon(e.target.value.toUpperCase())} className="input !py-1.5 !text-sm" placeholder="SAVE10" />
                  <button className="px-3 py-1.5 text-xs font-medium text-primary border border-primary rounded-lg hover:bg-primary hover:text-white transition-colors">Apply</button>
                </div>
                {coupon === 'SAVE10' && <p className="text-xs text-success mt-1">✓ 10% discount applied!</p>}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
