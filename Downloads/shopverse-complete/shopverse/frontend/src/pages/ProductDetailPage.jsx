import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { motion } from 'framer-motion';
import {
  ShoppingCart, Heart, Star, ArrowLeft, Plus, Minus,
  Shield, Truck, RotateCcw, Share2, CheckCircle, Tag
} from 'lucide-react';
import api from '../api/axios';
import { addToCart } from '../store/slices/cartWishlistSlice';
import { addToWishlist, removeFromWishlist } from '../store/slices/cartWishlistSlice';
import Navbar from '../components/layout/Navbar';
import Footer from '../components/layout/Footer';
import ProductCard from '../components/product/ProductCard';
import toast from 'react-hot-toast';

export default function ProductDetailPage() {
  const { id } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user } = useSelector((s) => s.auth);
  const wishlistProducts = useSelector((s) => s.wishlist.products);

  const [product, setProduct] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [related, setRelated] = useState([]);
  const [loading, setLoading] = useState(true);
  const [qty, setQty] = useState(1);
  const [activeImg, setActiveImg] = useState(0);
  const [reviewForm, setReviewForm] = useState({ rating: 5, title: '', comment: '' });
  const [submittingReview, setSubmittingReview] = useState(false);
  const [activeTab, setActiveTab] = useState('description');

  const isWishlisted = wishlistProducts.some((p) => (p._id || p) === id);

  useEffect(() => {
    const fetchAll = async () => {
      setLoading(true);
      try {
        const [prodRes, revRes] = await Promise.all([
          api.get(`/products/${id}`),
          api.get(`/reviews/product/${id}`),
        ]);
        setProduct(prodRes.data.product);
        setReviews(revRes.data.reviews || []);

        // Fetch related products
        if (prodRes.data.product?.category?._id) {
          const relRes = await api.get(`/products?category=${prodRes.data.product.category._id}&limit=4`);
          setRelated((relRes.data.products || []).filter((p) => p._id !== id));
        }
      } catch {
        toast.error('Product not found');
        navigate('/products');
      } finally {
        setLoading(false);
      }
    };
    fetchAll();
  }, [id]);

  const handleAddToCart = async () => {
    if (!user) return toast.error('Please login first');
    await dispatch(addToCart({ productId: product._id, quantity: qty }));
    toast.success(`${product.name} added to cart!`);
  };

  const handleBuyNow = async () => {
    if (!user) return navigate('/login');
    await dispatch(addToCart({ productId: product._id, quantity: qty }));
    navigate('/cart');
  };

  const handleWishlist = async () => {
    if (!user) return toast.error('Please login first');
    if (isWishlisted) {
      await dispatch(removeFromWishlist(product._id));
      toast.success('Removed from wishlist');
    } else {
      await dispatch(addToWishlist(product._id));
      toast.success('Added to wishlist!');
    }
  };

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    if (!user) return toast.error('Please login to leave a review');
    setSubmittingReview(true);
    try {
      const { data } = await api.post('/reviews', { productId: id, ...reviewForm });
      setReviews([data.review, ...reviews]);
      setReviewForm({ rating: 5, title: '', comment: '' });
      toast.success('Review submitted!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to submit review');
    } finally {
      setSubmittingReview(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen dark:bg-gray-950">
        <Navbar />
        <div className="pt-20 max-w-7xl mx-auto px-4 py-12">
          <div className="grid lg:grid-cols-2 gap-12">
            <div className="skeleton aspect-square rounded-2xl" />
            <div className="space-y-4">
              {[...Array(6)].map((_, i) => <div key={i} className="skeleton h-6 rounded" style={{ width: `${80 - i * 10}%` }} />)}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!product) return null;

  const discount = product.discountPrice && product.price > product.discountPrice
    ? Math.round(((product.price - product.discountPrice) / product.price) * 100)
    : null;

  const images = product.images?.length > 0
    ? product.images
    : [`https://placehold.co/600x600/6366F1/ffffff?text=${encodeURIComponent(product.name[0])}`];

  return (
    <div className="min-h-screen dark:bg-gray-950">
      <Navbar />
      <div className="pt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Breadcrumb */}
          <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 mb-8">
            <Link to="/" className="hover:text-primary">Home</Link>
            <span>/</span>
            <Link to="/products" className="hover:text-primary">Products</Link>
            <span>/</span>
            <Link to={`/products?category=${product.category?._id}`} className="hover:text-primary">{product.category?.name}</Link>
            <span>/</span>
            <span className="text-gray-900 dark:text-white truncate max-w-xs">{product.name}</span>
          </div>

          {/* Main Product Section */}
          <div className="grid lg:grid-cols-2 gap-12 mb-16">
            {/* Images */}
            <div>
              <div className="aspect-square rounded-2xl overflow-hidden bg-gray-50 dark:bg-gray-900 mb-4">
                <motion.img
                  key={activeImg}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  src={images[activeImg]}
                  alt={product.name}
                  className="w-full h-full object-cover"
                  onError={(e) => e.target.src = `https://placehold.co/600x600/6366F1/ffffff?text=${product.name[0]}`}
                />
              </div>
              {images.length > 1 && (
                <div className="flex gap-3 overflow-x-auto scrollbar-hide">
                  {images.map((img, i) => (
                    <button
                      key={i}
                      onClick={() => setActiveImg(i)}
                      className={`shrink-0 w-20 h-20 rounded-xl overflow-hidden border-2 transition-colors ${
                        activeImg === i ? 'border-primary' : 'border-gray-200 dark:border-gray-700'
                      }`}
                    >
                      <img src={img} alt="" className="w-full h-full object-cover" onError={(e) => e.target.src = `https://placehold.co/80x80/6366F1/ffffff?text=${i + 1}`} />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Info */}
            <div>
              <div className="flex items-start justify-between gap-4 mb-3">
                <div>
                  <span className="badge bg-primary/10 text-primary mb-2">{product.category?.icon} {product.category?.name}</span>
                  <h1 className="font-display font-bold text-2xl lg:text-3xl text-gray-900 dark:text-white leading-tight">{product.name}</h1>
                </div>
                <div className="flex gap-2 shrink-0">
                  <button onClick={handleWishlist} className={`p-2.5 rounded-xl border transition-colors ${isWishlisted ? 'bg-red-50 border-red-200 text-red-500 dark:bg-red-900/20 dark:border-red-800' : 'border-gray-200 dark:border-gray-700 text-gray-500 hover:border-red-300 hover:text-red-500'}`}>
                    <Heart size={18} fill={isWishlisted ? 'currentColor' : 'none'} />
                  </button>
                  <button onClick={() => { navigator.clipboard.writeText(window.location.href); toast.success('Link copied!'); }} className="p-2.5 rounded-xl border border-gray-200 dark:border-gray-700 text-gray-500 hover:border-primary hover:text-primary transition-colors">
                    <Share2 size={18} />
                  </button>
                </div>
              </div>

              {/* Rating */}
              <div className="flex items-center gap-3 mb-4">
                <div className="flex">
                  {[1,2,3,4,5].map((s) => (
                    <Star key={s} size={16} className={s <= Math.round(product.ratings?.average || 0) ? 'text-amber-400 fill-amber-400' : 'text-gray-200 dark:text-gray-700'} />
                  ))}
                </div>
                <span className="font-semibold text-gray-900 dark:text-white">{product.ratings?.average?.toFixed(1) || '0.0'}</span>
                <span className="text-gray-500 text-sm">({product.ratings?.count || 0} reviews)</span>
                {product.soldCount > 0 && <span className="text-gray-400 text-sm">• {product.soldCount}+ sold</span>}
              </div>

              {/* Price */}
              <div className="flex items-baseline gap-3 mb-6">
                <span className="font-display font-bold text-4xl text-gray-900 dark:text-white">
                  ${(product.discountPrice || product.price).toFixed(2)}
                </span>
                {discount && (
                  <>
                    <span className="text-xl text-gray-400 line-through">${product.price.toFixed(2)}</span>
                    <span className="badge bg-red-100 text-red-600 dark:bg-red-900/20 dark:text-red-400 text-sm">-{discount}% OFF</span>
                  </>
                )}
              </div>

              {product.couponCode && (
                <div className="flex items-center gap-2 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-xl p-3 mb-5">
                  <Tag size={16} className="text-amber-500" />
                  <span className="text-sm text-amber-700 dark:text-amber-400">Use code <strong>{product.couponCode}</strong> for extra {product.couponDiscount}% off</span>
                </div>
              )}

              {/* Stock */}
              <div className="mb-6">
                {product.stock > 0 ? (
                  <span className="flex items-center gap-2 text-success font-medium text-sm">
                    <CheckCircle size={16} /> In Stock ({product.stock} available)
                  </span>
                ) : (
                  <span className="text-red-500 font-medium text-sm">Out of Stock</span>
                )}
              </div>

              {/* Quantity */}
              {product.stock > 0 && (
                <div className="flex items-center gap-4 mb-6">
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Quantity:</span>
                  <div className="flex items-center gap-3 bg-gray-50 dark:bg-gray-800 rounded-xl p-1">
                    <button onClick={() => setQty(Math.max(1, qty - 1))} className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-white dark:hover:bg-gray-700 transition-colors">
                      <Minus size={14} />
                    </button>
                    <span className="w-8 text-center font-semibold">{qty}</span>
                    <button onClick={() => setQty(Math.min(product.stock, qty + 1))} className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-white dark:hover:bg-gray-700 transition-colors">
                      <Plus size={14} />
                    </button>
                  </div>
                </div>
              )}

              {/* CTAs */}
              <div className="flex gap-3 mb-8">
                <button onClick={handleAddToCart} disabled={product.stock === 0} className="btn-outline flex-1 flex items-center justify-center gap-2">
                  <ShoppingCart size={18} /> Add to Cart
                </button>
                <button onClick={handleBuyNow} disabled={product.stock === 0} className="btn-primary flex-1">
                  Buy Now
                </button>
              </div>

              {/* Trust badges */}
              <div className="grid grid-cols-3 gap-3 pt-6 border-t border-gray-100 dark:border-gray-800">
                {[
                  { icon: Shield, label: 'Secure Payment' },
                  { icon: Truck, label: 'Fast Delivery' },
                  { icon: RotateCcw, label: '30-Day Returns' },
                ].map(({ icon: Icon, label }) => (
                  <div key={label} className="text-center">
                    <Icon size={20} className="text-primary mx-auto mb-1" />
                    <span className="text-xs text-gray-500 dark:text-gray-400">{label}</span>
                  </div>
                ))}
              </div>

              {/* Vendor */}
              {product.vendor && (
                <div className="mt-6 p-4 bg-gray-50 dark:bg-gray-800/50 rounded-xl flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-white font-bold">
                    {product.vendor.name?.[0]}
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Sold by</p>
                    <p className="font-semibold text-sm text-gray-900 dark:text-white">{product.vendor.name}</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Tabs */}
          <div className="card overflow-hidden mb-16">
            <div className="flex border-b border-gray-100 dark:border-gray-800">
              {['description', 'reviews', 'shipping'].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`px-6 py-4 text-sm font-medium capitalize transition-colors border-b-2 -mb-px ${
                    activeTab === tab
                      ? 'border-primary text-primary'
                      : 'border-transparent text-gray-500 hover:text-gray-900 dark:hover:text-white'
                  }`}
                >
                  {tab} {tab === 'reviews' && `(${reviews.length})`}
                </button>
              ))}
            </div>

            <div className="p-6">
              {activeTab === 'description' && (
                <div className="prose dark:prose-invert max-w-none text-gray-600 dark:text-gray-400 text-sm leading-relaxed">
                  <p>{product.description}</p>
                  {product.brand && <p className="mt-4"><strong>Brand:</strong> {product.brand}</p>}
                </div>
              )}

              {activeTab === 'reviews' && (
                <div>
                  {/* Review Summary */}
                  <div className="flex items-center gap-8 p-6 bg-gray-50 dark:bg-gray-800/50 rounded-xl mb-8">
                    <div className="text-center">
                      <div className="font-display font-bold text-5xl text-gray-900 dark:text-white">{product.ratings?.average?.toFixed(1) || '0.0'}</div>
                      <div className="flex justify-center mt-1">
                        {[1,2,3,4,5].map((s) => (
                          <Star key={s} size={16} className={s <= Math.round(product.ratings?.average || 0) ? 'text-amber-400 fill-amber-400' : 'text-gray-300'} />
                        ))}
                      </div>
                      <p className="text-gray-500 text-sm mt-1">{product.ratings?.count || 0} reviews</p>
                    </div>
                    <div className="flex-1 space-y-2">
                      {[5,4,3,2,1].map((r) => {
                        const count = reviews.filter((rv) => rv.rating === r).length;
                        const pct = reviews.length ? (count / reviews.length) * 100 : 0;
                        return (
                          <div key={r} className="flex items-center gap-3">
                            <span className="text-xs text-gray-500 w-3">{r}</span>
                            <Star size={12} className="text-amber-400 fill-amber-400" />
                            <div className="flex-1 h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                              <div className="h-full bg-amber-400 rounded-full transition-all" style={{ width: `${pct}%` }} />
                            </div>
                            <span className="text-xs text-gray-400 w-4">{count}</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Write Review */}
                  {user && (
                    <div className="card p-6 mb-8">
                      <h3 className="font-semibold text-gray-900 dark:text-white mb-4">Write a Review</h3>
                      <form onSubmit={handleReviewSubmit} className="space-y-4">
                        <div>
                          <label className="block text-sm text-gray-600 dark:text-gray-400 mb-2">Rating</label>
                          <div className="flex gap-2">
                            {[1,2,3,4,5].map((s) => (
                              <button key={s} type="button" onClick={() => setReviewForm({ ...reviewForm, rating: s })}>
                                <Star size={24} className={s <= reviewForm.rating ? 'text-amber-400 fill-amber-400' : 'text-gray-300'} />
                              </button>
                            ))}
                          </div>
                        </div>
                        <input
                          type="text"
                          placeholder="Review title (optional)"
                          value={reviewForm.title}
                          onChange={(e) => setReviewForm({ ...reviewForm, title: e.target.value })}
                          className="input"
                        />
                        <textarea
                          placeholder="Share your experience with this product..."
                          value={reviewForm.comment}
                          onChange={(e) => setReviewForm({ ...reviewForm, comment: e.target.value })}
                          rows={4}
                          className="input resize-none"
                          required
                        />
                        <button type="submit" disabled={submittingReview} className="btn-primary">
                          {submittingReview ? 'Submitting...' : 'Submit Review'}
                        </button>
                      </form>
                    </div>
                  )}

                  {/* Reviews List */}
                  <div className="space-y-6">
                    {reviews.length === 0 ? (
                      <div className="text-center py-12 text-gray-400">
                        <Star size={48} className="mx-auto mb-3 opacity-30" />
                        <p>No reviews yet. Be the first to review!</p>
                      </div>
                    ) : reviews.map((review) => (
                      <div key={review._id} className="flex gap-4 border-b border-gray-100 dark:border-gray-800 pb-6 last:border-0">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-white font-bold text-sm shrink-0">
                          {review.user?.name?.[0]}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center justify-between mb-1">
                            <span className="font-semibold text-sm text-gray-900 dark:text-white">{review.user?.name}</span>
                            <span className="text-xs text-gray-400">{new Date(review.createdAt).toLocaleDateString()}</span>
                          </div>
                          <div className="flex items-center gap-2 mb-2">
                            <div className="flex">
                              {[1,2,3,4,5].map((s) => (
                                <Star key={s} size={12} className={s <= review.rating ? 'text-amber-400 fill-amber-400' : 'text-gray-300'} />
                              ))}
                            </div>
                            {review.isVerifiedPurchase && (
                              <span className="badge bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-400">✓ Verified Purchase</span>
                            )}
                          </div>
                          {review.title && <p className="font-medium text-sm text-gray-900 dark:text-white mb-1">{review.title}</p>}
                          <p className="text-gray-600 dark:text-gray-400 text-sm">{review.comment}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {activeTab === 'shipping' && (
                <div className="space-y-4 text-sm text-gray-600 dark:text-gray-400">
                  {[
                    { icon: Truck, title: 'Standard Delivery', desc: '5-7 business days — Free on orders over $100' },
                    { icon: Shield, title: 'Secure Packaging', desc: 'All items are carefully packaged to prevent damage during shipping' },
                    { icon: RotateCcw, title: 'Easy Returns', desc: 'Return within 30 days for a full refund, no questions asked' },
                  ].map(({ icon: Icon, title, desc }) => (
                    <div key={title} className="flex gap-4 p-4 bg-gray-50 dark:bg-gray-800/50 rounded-xl">
                      <Icon size={20} className="text-primary shrink-0 mt-0.5" />
                      <div>
                        <p className="font-medium text-gray-900 dark:text-white mb-0.5">{title}</p>
                        <p>{desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Related Products */}
          {related.length > 0 && (
            <div>
              <h2 className="section-title mb-8">Related Products</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {related.slice(0, 4).map((p) => <ProductCard key={p._id} product={p} />)}
              </div>
            </div>
          )}
        </div>
      </div>
      <Footer />
    </div>
  );
}
