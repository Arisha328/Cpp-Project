import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { motion } from 'framer-motion';
import { Heart, ShoppingCart, Trash2, ArrowRight } from 'lucide-react';
import { fetchWishlist, removeFromWishlist } from '../store/slices/cartWishlistSlice';
import { addToCart } from '../store/slices/cartWishlistSlice';
import Navbar from '../components/layout/Navbar';
import Footer from '../components/layout/Footer';
import toast from 'react-hot-toast';

export default function WishlistPage() {
  const dispatch = useDispatch();
  const { products } = useSelector((s) => s.wishlist);
  const { user } = useSelector((s) => s.auth);

  useEffect(() => {
    if (user) dispatch(fetchWishlist());
  }, [user]);

  const handleMoveToCart = async (product) => {
    await dispatch(addToCart({ productId: product._id }));
    await dispatch(removeFromWishlist(product._id));
    toast.success('Moved to cart!');
  };

  const handleRemove = async (productId, name) => {
    await dispatch(removeFromWishlist(productId));
    toast.success(`${name} removed from wishlist`);
  };

  return (
    <div className="min-h-screen dark:bg-gray-950">
      <Navbar />
      <div className="pt-16">
        <div className="bg-gradient-to-r from-primary to-secondary py-12">
          <div className="max-w-7xl mx-auto px-4">
            <h1 className="font-display font-bold text-3xl text-white flex items-center gap-3">
              <Heart size={28} fill="white" /> My Wishlist
            </h1>
            <p className="text-white/70 mt-1">{products.length} saved items</p>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          {products.length === 0 ? (
            <div className="text-center py-24">
              <Heart size={72} className="text-gray-200 dark:text-gray-700 mx-auto mb-6" />
              <h2 className="font-display font-bold text-2xl text-gray-900 dark:text-white mb-3">Your wishlist is empty</h2>
              <p className="text-gray-500 dark:text-gray-400 mb-8">Save items you love for later</p>
              <Link to="/products" className="btn-primary inline-flex items-center gap-2">
                Browse Products <ArrowRight size={16} />
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {products.map((product, i) => {
                if (!product?._id) return null;
                const price = product.discountPrice || product.price;
                const img = product.images?.[0] || `https://placehold.co/300x300/6366F1/ffffff?text=${product.name?.[0] || 'P'}`;
                return (
                  <motion.div
                    key={product._id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.05 }}
                    className="card overflow-hidden group"
                  >
                    <Link to={`/products/${product._id}`} className="block">
                      <div className="relative aspect-square overflow-hidden bg-gray-50 dark:bg-gray-800">
                        <img src={img} alt={product.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          onError={(e) => e.target.src = `https://placehold.co/300x300/6366F1/ffffff?text=P`} />
                        <button onClick={(e) => { e.preventDefault(); handleRemove(product._id, product.name); }}
                          className="absolute top-3 right-3 w-8 h-8 bg-white dark:bg-gray-900 rounded-xl flex items-center justify-center text-red-500 shadow opacity-0 group-hover:opacity-100 transition-opacity">
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </Link>
                    <div className="p-4">
                      <Link to={`/products/${product._id}`}>
                        <h3 className="font-semibold text-sm text-gray-900 dark:text-white line-clamp-2 mb-2 hover:text-primary transition-colors">{product.name}</h3>
                      </Link>
                      <div className="flex items-center justify-between">
                        <div>
                          <span className="font-bold text-gray-900 dark:text-white">${price?.toFixed(2)}</span>
                          {product.discountPrice && product.price > product.discountPrice && (
                            <span className="text-xs text-gray-400 line-through ml-2">${product.price.toFixed(2)}</span>
                          )}
                        </div>
                        <button onClick={() => handleMoveToCart(product)} disabled={product.stock === 0}
                          className="flex items-center gap-1.5 text-xs font-medium text-primary hover:bg-primary hover:text-white border border-primary px-3 py-1.5 rounded-lg transition-colors disabled:opacity-40 disabled:cursor-not-allowed">
                          <ShoppingCart size={12} /> Add to Cart
                        </button>
                      </div>
                      {product.stock === 0 && <p className="text-xs text-red-500 mt-2">Out of stock</p>}
                    </div>
                  </motion.div>
                );
              })}
            </div>
          )}
        </div>
      </div>
      <Footer />
    </div>
  );
}
