import { useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { motion, AnimatePresence } from 'framer-motion';
import { Trash2, Plus, Minus, ShoppingBag, ArrowRight, Tag } from 'lucide-react';
import {
  fetchCart, updateCartItem, removeFromCart
} from '../store/slices/cartWishlistSlice';
import { addToWishlist } from '../store/slices/cartWishlistSlice';
import Navbar from '../components/layout/Navbar';
import Footer from '../components/layout/Footer';
import toast from 'react-hot-toast';

export default function CartPage() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { items, loading } = useSelector((s) => s.cart);
  const { user } = useSelector((s) => s.auth);

  useEffect(() => {
    if (user) dispatch(fetchCart());
  }, [user]);

  const subtotal = items.reduce((sum, item) => {
    const price = item.product?.discountPrice || item.product?.price || 0;
    return sum + price * item.quantity;
  }, 0);

  const shipping = subtotal > 100 ? 0 : 9.99;
  const total = subtotal + shipping;

  const handleQtyChange = (productId, newQty) => {
    if (newQty < 1) return;
    dispatch(updateCartItem({ productId, quantity: newQty }));
  };

  const handleRemove = (productId, name) => {
    dispatch(removeFromCart(productId));
    toast.success(`${name} removed from cart`);
  };

  const handleSaveForLater = async (productId) => {
    await dispatch(addToWishlist(productId));
    dispatch(removeFromCart(productId));
    toast.success('Saved to wishlist');
  };

  if (!user) {
    return (
      <div className="min-h-screen dark:bg-gray-950">
        <Navbar />
        <div className="pt-32 text-center">
          <ShoppingBag size={64} className="text-gray-300 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Please login to view cart</h2>
          <Link to="/login" className="btn-primary inline-flex items-center gap-2 mt-4">Login <ArrowRight size={16} /></Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen dark:bg-gray-950">
      <Navbar />
      <div className="pt-16">
        <div className="bg-gradient-to-r from-primary to-secondary py-12">
          <div className="max-w-7xl mx-auto px-4">
            <h1 className="font-display font-bold text-3xl text-white">Shopping Cart</h1>
            <p className="text-white/70 mt-1">{items.length} {items.length === 1 ? 'item' : 'items'}</p>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          {items.length === 0 ? (
            <div className="text-center py-24">
              <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}>
                <ShoppingBag size={72} className="text-gray-200 dark:text-gray-700 mx-auto mb-6" />
                <h2 className="font-display font-bold text-2xl text-gray-900 dark:text-white mb-3">Your cart is empty</h2>
                <p className="text-gray-500 dark:text-gray-400 mb-8">Looks like you haven't added anything yet.</p>
                <Link to="/products" className="btn-primary inline-flex items-center gap-2">
                  <ShoppingBag size={18} /> Browse Products
                </Link>
              </motion.div>
            </div>
          ) : (
            <div className="grid lg:grid-cols-3 gap-8">
              {/* Items List */}
              <div className="lg:col-span-2 space-y-4">
                <AnimatePresence>
                  {items.map((item) => {
                    if (!item.product) return null;
                    const price = item.product.discountPrice || item.product.price;
                    const img = item.product.images?.[0] || `https://placehold.co/100x100/6366F1/ffffff?text=${item.product.name?.[0]}`;
                    return (
                      <motion.div
                        key={item.product._id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, x: -100 }}
                        className="card p-5 flex gap-5"
                      >
                        <Link to={`/products/${item.product._id}`} className="shrink-0">
                          <img src={img} alt={item.product.name}
                            className="w-24 h-24 rounded-xl object-cover bg-gray-100"
                            onError={(e) => e.target.src = `https://placehold.co/100x100/6366F1/ffffff?text=P`}
                          />
                        </Link>
                        <div className="flex-1 min-w-0">
                          <div className="flex justify-between gap-2">
                            <Link to={`/products/${item.product._id}`}>
                              <h3 className="font-semibold text-gray-900 dark:text-white text-sm leading-snug hover:text-primary transition-colors line-clamp-2">
                                {item.product.name}
                              </h3>
                            </Link>
                            <button onClick={() => handleRemove(item.product._id, item.product.name)} className="text-gray-400 hover:text-red-500 transition-colors shrink-0">
                              <Trash2 size={16} />
                            </button>
                          </div>
                          {item.product.brand && <p className="text-xs text-gray-400 mt-0.5">{item.product.brand}</p>}

                          <div className="flex items-center justify-between mt-4">
                            <div className="flex items-center gap-2 bg-gray-50 dark:bg-gray-800 rounded-xl p-1">
                              <button onClick={() => handleQtyChange(item.product._id, item.quantity - 1)} className="w-7 h-7 rounded-lg hover:bg-white dark:hover:bg-gray-700 flex items-center justify-center transition-colors">
                                <Minus size={12} />
                              </button>
                              <span className="w-6 text-center text-sm font-semibold">{item.quantity}</span>
                              <button onClick={() => handleQtyChange(item.product._id, item.quantity + 1)} className="w-7 h-7 rounded-lg hover:bg-white dark:hover:bg-gray-700 flex items-center justify-center transition-colors">
                                <Plus size={12} />
                              </button>
                            </div>
                            <div className="text-right">
                              <p className="font-bold text-gray-900 dark:text-white">${(price * item.quantity).toFixed(2)}</p>
                              {item.quantity > 1 && <p className="text-xs text-gray-400">${price.toFixed(2)} each</p>}
                            </div>
                          </div>

                          <button onClick={() => handleSaveForLater(item.product._id)} className="text-xs text-primary hover:underline mt-2 flex items-center gap-1">
                            Save for later
                          </button>
                        </div>
                      </motion.div>
                    );
                  })}
                </AnimatePresence>
              </div>

              {/* Order Summary */}
              <div>
                <div className="card p-6 sticky top-20">
                  <h2 className="font-display font-bold text-lg text-gray-900 dark:text-white mb-6">Order Summary</h2>

                  <div className="space-y-3 mb-6">
                    <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400">
                      <span>Subtotal ({items.length} items)</span>
                      <span>${subtotal.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400">
                      <span>Shipping</span>
                      <span className={shipping === 0 ? 'text-success font-medium' : ''}>{shipping === 0 ? 'FREE' : `$${shipping.toFixed(2)}`}</span>
                    </div>
                    {shipping > 0 && (
                      <p className="text-xs text-gray-400 bg-amber-50 dark:bg-amber-900/10 rounded-lg p-2">
                        💡 Add ${(100 - subtotal).toFixed(2)} more for free shipping
                      </p>
                    )}
                    <div className="border-t border-gray-100 dark:border-gray-800 pt-3 flex justify-between font-bold text-gray-900 dark:text-white">
                      <span>Total</span>
                      <span className="text-xl">${total.toFixed(2)}</span>
                    </div>
                  </div>

                  {/* Coupon */}
                  <div className="flex gap-2 mb-6">
                    <div className="relative flex-1">
                      <Tag size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                      <input type="text" placeholder="Coupon code" className="input !py-2 !text-sm pl-9" />
                    </div>
                    <button className="px-4 py-2 text-sm font-medium text-primary border border-primary rounded-xl hover:bg-primary hover:text-white transition-colors">
                      Apply
                    </button>
                  </div>

                  <button onClick={() => navigate('/checkout')} className="btn-primary w-full flex items-center justify-center gap-2">
                    Proceed to Checkout <ArrowRight size={16} />
                  </button>

                  <Link to="/products" className="block text-center text-sm text-gray-500 hover:text-primary mt-4 transition-colors">
                    ← Continue Shopping
                  </Link>

                  <div className="mt-6 pt-5 border-t border-gray-100 dark:border-gray-800 flex items-center justify-center gap-4 text-gray-300 dark:text-gray-600">
                    {['Visa', 'Mastercard', 'PayPal', 'Apple Pay'].map((p) => (
                      <span key={p} className="text-xs font-medium">{p}</span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
      <Footer />
    </div>
  );
}
