import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Heart, ShoppingCart, Star, Eye } from 'lucide-react';
import { useDispatch, useSelector } from 'react-redux';
import { addToCart } from '../../store/slices/cartWishlistSlice';
import { addToWishlist, removeFromWishlist } from '../../store/slices/cartWishlistSlice';
import toast from 'react-hot-toast';

export default function ProductCard({ product }) {
  const dispatch = useDispatch();
  const { user } = useSelector((s) => s.auth);
  const wishlistProducts = useSelector((s) => s.wishlist.products);
  const [imgError, setImgError] = useState(false);

  const isWishlisted = wishlistProducts.some((p) => (p._id || p) === product._id);

  const discount = product.discountPrice && product.price > product.discountPrice
    ? Math.round(((product.price - product.discountPrice) / product.price) * 100)
    : null;

  const handleAddToCart = async (e) => {
    e.preventDefault();
    if (!user) {
      toast.error('Please login to add items to cart');
      return;
    }
    await dispatch(addToCart({ productId: product._id }));
    toast.success('Added to cart!');
  };

  const handleWishlist = async (e) => {
    e.preventDefault();
    if (!user) {
      toast.error('Please login to save items');
      return;
    }
    if (isWishlisted) {
      await dispatch(removeFromWishlist(product._id));
      toast.success('Removed from wishlist');
    } else {
      await dispatch(addToWishlist(product._id));
      toast.success('Added to wishlist!');
    }
  };

  const image = !imgError && product.images?.[0]
    ? product.images[0]
    : `https://placehold.co/300x300/3b82f6/ffffff?text=${encodeURIComponent(product.name?.[0] || 'P')}`;

  return (
    <motion.div
      whileHover={{ y: -6 }}
      transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
      className="premium-card overflow-hidden group flex flex-col justify-between h-full bg-white dark:bg-slate-900 border border-slate-200/50 dark:border-slate-800/40 shadow-soft"
    >
      <div className="relative overflow-hidden aspect-square bg-slate-100 dark:bg-slate-950 flex items-center justify-center">
        
        {/* Product Image */}
        <img
          src={image}
          alt={product.name}
          onError={() => setImgError(true)}
          className="h-full w-full object-cover transition-transform duration-700 ease-[0.16, 1, 0.3, 1] group-hover:scale-106 select-none"
        />

        {/* Hover overlay gradient */}
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />

        {/* Status badges */}
        <div className="absolute top-4 left-4 flex flex-col gap-1.5 z-10">
          {discount && (
            <span className="badge bg-rose-500 text-white font-extrabold text-[10px] px-2.5 py-1">
              -{discount}%
            </span>
          )}
          {product.isFeatured && (
            <span className="badge bg-gradient-to-r from-amber-500 to-orange-500 text-white font-extrabold text-[10px] px-2.5 py-1 shadow-glow-secondary">
              Featured
            </span>
          )}
          {product.stock === 0 && (
            <span className="badge bg-slate-650 text-white font-extrabold text-[10px] px-2.5 py-1">
              Sold Out
            </span>
          )}
        </div>

        {/* Floating Controls Overlay */}
        <div className="absolute top-4 right-4 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-all duration-300 translate-x-2 group-hover:translate-x-0 z-10">
          <button
            onClick={handleWishlist}
            className={`flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200/30 bg-white/90 dark:bg-slate-900/90 text-slate-700 dark:text-slate-350 shadow-md backdrop-blur-sm transition-all hover:scale-110 active:scale-95 ${
              isWishlisted ? 'bg-rose-500 border-rose-600 text-white dark:text-white dark:bg-rose-600' : 'hover:bg-primary hover:text-white hover:border-primary'
            }`}
            aria-label={isWishlisted ? 'Remove from wishlist' : 'Add to wishlist'}
          >
            <Heart size={16} fill={isWishlisted ? 'currentColor' : 'none'} className="stroke-[2.2]" />
          </button>
          
          <Link
            to={`/products/${product._id}`}
            className="flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200/30 bg-white/90 dark:bg-slate-900/90 text-slate-700 dark:text-slate-350 shadow-md backdrop-blur-sm transition-all hover:scale-110 active:scale-95 hover:bg-primary hover:text-white hover:border-primary"
            aria-label="View product"
          >
            <Eye size={16} className="stroke-[2.2]" />
          </Link>
        </div>
      </div>

      {/* Card Info */}
      <div className="p-5 flex-1 flex flex-col justify-between">
        
        <div>
          {/* Category & Brand */}
          <div className="flex items-center justify-between gap-3 mb-2 text-[10px] uppercase font-bold tracking-wider text-slate-400 dark:text-slate-500">
            <span>{product.category?.name || 'General'}</span>
            <span>{product.brand || 'ShopVerse'}</span>
          </div>

          {/* Product Name */}
          <Link to={`/products/${product._id}`}>
            <h3 className="text-base font-bold text-slate-900 dark:text-white mb-2 line-clamp-2 hover:text-primary transition-colors leading-snug">
              {product.name}
            </h3>
          </Link>

          {/* Ratings */}
          <div className="flex items-center gap-2 mb-4">
            <div className="flex items-center text-amber-400">
              {[1, 2, 3, 4, 5].map((star) => (
                <Star
                  key={star}
                  size={13}
                  className={star <= Math.round(product.ratings?.average || 0) ? 'fill-amber-400 stroke-amber-400' : 'text-slate-200 dark:text-slate-750'}
                />
              ))}
            </div>
            <span className="text-[11px] font-bold text-slate-400 dark:text-slate-500">({product.ratings?.count || 0})</span>
          </div>
        </div>

        {/* Pricing & Add to Cart */}
        <div className="flex items-center justify-between gap-4 pt-3 border-t border-slate-100/60 dark:border-slate-800/40">
          <div>
            <div className="text-lg font-extrabold text-slate-950 dark:text-white tracking-tight leading-none">
              ${(product.discountPrice || product.price).toFixed(2)}
            </div>
            {discount && (
              <div className="text-xs font-bold text-slate-400 dark:text-slate-500 line-through mt-1">
                ${product.price.toFixed(2)}
              </div>
            )}
          </div>
          
          <button
            onClick={handleAddToCart}
            disabled={product.stock === 0}
            className="inline-flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10 text-primary transition-all duration-300 hover:bg-primary hover:text-white hover:shadow-glow disabled:cursor-not-allowed disabled:opacity-30 hover:scale-105 active:scale-95"
            aria-label="Add to cart"
          >
            <ShoppingCart size={17} className="stroke-[2.2]" />
          </button>
        </div>

      </div>
    </motion.div>
  );
}
