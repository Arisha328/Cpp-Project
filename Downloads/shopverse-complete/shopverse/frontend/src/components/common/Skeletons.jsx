import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Heart, ShoppingCart, Star, Eye } from 'lucide-react';
import { useDispatch, useSelector } from 'react-redux';
import { addToCart } from '../../store/slices/cartWishlistSlice';
import { addToWishlist, removeFromWishlist } from '../../store/slices/cartWishlistSlice';
import toast from 'react-hot-toast';

export function ProductSkeleton() {
  return (
    <div className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-soft dark:border-slate-800 dark:bg-slate-950 animate-pulse">
      <div className="h-64 rounded-3xl bg-slate-100 dark:bg-slate-800 mb-5" />
      <div className="h-4 w-3/4 rounded-full bg-slate-100 dark:bg-slate-800 mb-3" />
      <div className="h-4 w-1/2 rounded-full bg-slate-100 dark:bg-slate-800 mb-4" />
      <div className="flex items-center gap-3">
        <div className="h-10 w-10 rounded-2xl bg-slate-100 dark:bg-slate-800" />
        <div className="h-10 w-full rounded-2xl bg-slate-100 dark:bg-slate-800" />
      </div>
    </div>
  );
}

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
    : `https://placehold.co/300x300/2563EB/ffffff?text=${encodeURIComponent(product.name?.[0] || 'P')}`;

  return (
    <motion.div
      whileHover={{ y: -5 }}
      transition={{ duration: 0.25 }}
      className="rounded-[28px] border border-slate-200 bg-white shadow-soft overflow-hidden group dark:border-slate-800 dark:bg-slate-950"
    >
      <div className="relative overflow-hidden aspect-square bg-slate-100 dark:bg-slate-900">
        <img
          src={image}
          alt={product.name}
          onError={() => setImgError(true)}
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
        <div className="absolute top-4 left-4 flex flex-col gap-2">
          {discount && <span className="badge bg-rose-500 text-white">-{discount}%</span>}
          {product.isFeatured && <span className="badge bg-amber-500 text-white">Featured</span>}
          {product.stock === 0 && <span className="badge bg-slate-500 text-white">Out of Stock</span>}
        </div>
        <div className="absolute top-4 right-4 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
          <button
            onClick={handleWishlist}
            className={`flex h-10 w-10 items-center justify-center rounded-2xl border border-white/80 bg-white/90 text-slate-600 shadow-md transition-colors ${
              isWishlisted ? 'bg-rose-500 text-white border-rose-500' : 'hover:bg-primary hover:text-white'
            }`}
            aria-label={isWishlisted ? 'Remove from wishlist' : 'Add to wishlist'}
          >
            <Heart size={16} fill={isWishlisted ? 'currentColor' : 'none'} />
          </button>
          <Link
            to={`/products/${product._id}`}
            className="flex h-10 w-10 items-center justify-center rounded-2xl border border-white/80 bg-white/90 text-slate-600 shadow-md transition-colors hover:bg-primary hover:text-white"
            aria-label="View product"
          >
            <Eye size={16} />
          </Link>
        </div>
      </div>

      <div className="p-5">
        <div className="flex items-center justify-between gap-3 mb-3 text-xs text-slate-500 dark:text-slate-400">
          <span>{product.category?.name || 'General'}</span>
          <span>{product.brand || 'ShopVerse'}</span>
        </div>

        <h3 className="text-base font-semibold text-slate-900 dark:text-white mb-3 line-clamp-2">{product.name}</h3>

        <div className="flex items-center gap-2 mb-4">
          <div className="flex items-center gap-1 text-amber-400">
            {[1, 2, 3, 4, 5].map((star) => (
              <Star
                key={star}
                size={14}
                className={star <= Math.round(product.ratings?.average || 0) ? 'fill-amber-400' : 'text-slate-200'}
              />
            ))}
          </div>
          <span className="text-xs text-slate-500 dark:text-slate-400">({product.ratings?.count || 0})</span>
        </div>

        <div className="flex items-center justify-between gap-4">
          <div>
            <div className="text-lg font-semibold text-slate-900 dark:text-white">${(product.discountPrice || product.price).toFixed(2)}</div>
            {discount && <div className="text-xs text-slate-400 line-through">${product.price.toFixed(2)}</div>}
          </div>
          <button
            onClick={handleAddToCart}
            disabled={product.stock === 0}
            className="inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-primary/10 text-primary shadow-sm transition hover:bg-primary hover:text-white disabled:cursor-not-allowed disabled:opacity-40"
            aria-label="Add to cart"
          >
            <ShoppingCart size={16} />
          </button>
        </div>
      </div>
    </motion.div>
  );
}
