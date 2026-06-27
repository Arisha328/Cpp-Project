import { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Filter, X, ChevronDown, Grid3X3, List, Search, Star } from 'lucide-react';
import api from '../api/axios';
import ProductCard from '../components/product/ProductCard';
import { ProductSkeleton } from '../components/common/Skeletons';
import Navbar from '../components/layout/Navbar';
import Footer from '../components/layout/Footer';

const SORT_OPTIONS = [
  { value: '-createdAt', label: 'Newest' },
  { value: 'popular', label: 'Most Popular' },
  { value: 'highest_rated', label: 'Highest Rated' },
  { value: 'lowest_price', label: 'Price: Low to High' },
  { value: 'highest_price', label: 'Price: High to Low' },
];

export default function ProductsPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({ total: 0, pages: 1 });
  const [filtersOpen, setFiltersOpen] = useState(false);

  const filters = {
    search: searchParams.get('search') || '',
    category: searchParams.get('category') || '',
    minPrice: searchParams.get('minPrice') || '',
    maxPrice: searchParams.get('maxPrice') || '',
    sort: searchParams.get('sort') || '-createdAt',
    page: searchParams.get('page') || '1',
    rating: searchParams.get('rating') || '',
  };

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      Object.entries(filters).forEach(([k, v]) => { if (v) params.append(k, v); });
      params.append('limit', '12');
      const { data } = await api.get(`/products?${params}`);
      setProducts(data.products || []);
      setPagination(data.pagination || { total: 0, pages: 1 });
    } catch (err) {
      setProducts([]);
    } finally {
      setLoading(false);
    }
  }, [searchParams]);

  useEffect(() => { fetchProducts(); }, [fetchProducts]);

  useEffect(() => {
    api.get('/categories').then(({ data }) => setCategories(data.categories || []));
  }, []);

  const updateFilter = (key, value) => {
    const next = new URLSearchParams(searchParams);
    if (value) next.set(key, value);
    else next.delete(key);
    next.delete('page');
    setSearchParams(next);
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 transition-colors duration-300">
      <Navbar />
      <div className="pt-20">
        
        {/* Header */}
        <div className="relative bg-gradient-to-r from-slate-900 to-slate-950 py-16 overflow-hidden border-b border-slate-200/10 dark:border-slate-800/10 mb-10">
          <div className="absolute inset-0 bg-grid-pattern opacity-10" />
          <div className="absolute -top-32 -right-32 w-80 h-80 bg-primary/10 rounded-full blur-[100px]" />
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-accent text-[11px] font-bold mb-4 shadow-glass">
              Market Catalog
            </span>
            <h1 className="font-display font-extrabold text-4xl sm:text-5xl text-white tracking-tight leading-none mb-3">
              {filters.search ? `Search results for "${filters.search}"` : 'All Shop Products'}
            </h1>
            <p className="text-slate-400 font-medium text-sm sm:text-base">
              Explore {pagination.total} products available from our verified vendors
            </p>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-20">
          <div className="flex flex-col lg:flex-row gap-8 items-start">
            
            {/* Filters Sidebar */}
            <aside className={`shrink-0 w-full lg:w-72 sticky lg:top-24 z-30 ${filtersOpen ? 'block' : 'hidden lg:block'}`}>
              <div className="premium-card p-6 bg-white dark:bg-slate-900 border border-slate-200/50 dark:border-slate-800/40 shadow-soft space-y-7">
                <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
                  <h2 className="font-bold text-base text-slate-900 dark:text-white">Filter Products</h2>
                  <button onClick={() => setSearchParams({})} className="text-xs font-bold text-primary hover:underline">Clear All</button>
                </div>

                {/* Categories */}
                <div className="space-y-4">
                  <h3 className="font-bold text-xs uppercase tracking-wider text-slate-400">Category</h3>
                  <div className="space-y-2.5 max-h-56 overflow-y-auto pr-1">
                    <label className="flex items-center gap-3 cursor-pointer group text-slate-700 dark:text-slate-350">
                      <input 
                        type="radio" 
                        name="category" 
                        value="" 
                        checked={!filters.category}
                        onChange={() => updateFilter('category', '')}
                        className="w-4.5 h-4.5 text-primary border-slate-300 dark:border-slate-700 focus:ring-primary/20 cursor-pointer" 
                      />
                      <span className="text-sm font-semibold group-hover:text-primary transition-colors">All Categories</span>
                    </label>
                    {categories.map((cat) => (
                      <label key={cat._id} className="flex items-center gap-3 cursor-pointer group text-slate-700 dark:text-slate-350">
                        <input 
                          type="radio" 
                          name="category" 
                          value={cat._id}
                          checked={filters.category === cat._id}
                          onChange={() => updateFilter('category', cat._id)}
                          className="w-4.5 h-4.5 text-primary border-slate-300 dark:border-slate-700 focus:ring-primary/20 cursor-pointer" 
                        />
                        <span className="text-sm font-semibold group-hover:text-primary transition-colors">
                          <span className="mr-2 text-base">{cat.icon}</span>{cat.name}
                        </span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Price Range */}
                <div className="space-y-4">
                  <h3 className="font-bold text-xs uppercase tracking-wider text-slate-400">Price Range ($)</h3>
                  <div className="flex gap-3">
                    <div className="relative flex-1">
                      <input
                        type="number"
                        placeholder="Min"
                        value={filters.minPrice}
                        onChange={(e) => updateFilter('minPrice', e.target.value)}
                        className="input !py-2.5 !px-3.5 !text-xs text-center font-bold"
                      />
                    </div>
                    <div className="self-center text-slate-300">-</div>
                    <div className="relative flex-1">
                      <input
                        type="number"
                        placeholder="Max"
                        value={filters.maxPrice}
                        onChange={(e) => updateFilter('maxPrice', e.target.value)}
                        className="input !py-2.5 !px-3.5 !text-xs text-center font-bold"
                      />
                    </div>
                  </div>
                </div>

                {/* Rating */}
                <div className="space-y-4">
                  <h3 className="font-bold text-xs uppercase tracking-wider text-slate-400">Minimum Rating</h3>
                  <div className="space-y-2.5">
                    {[4, 3, 2, 1].map((r) => (
                      <label key={r} className="flex items-center gap-3 cursor-pointer group text-slate-700 dark:text-slate-350">
                        <input 
                          type="radio" 
                          name="rating" 
                          value={r}
                          checked={filters.rating === String(r)}
                          onChange={() => updateFilter('rating', String(r))}
                          className="w-4.5 h-4.5 text-primary border-slate-300 dark:border-slate-700 focus:ring-primary/20 cursor-pointer" 
                        />
                        <span className="text-sm font-semibold group-hover:text-primary transition-colors flex items-center gap-1">
                          <span className="flex items-center text-amber-400">
                            {[...Array(5)].map((_, i) => (
                              <span key={i} className="text-sm">{i < r ? '★' : '☆'}</span>
                            ))}
                          </span>
                          <span className="ml-1 text-xs font-bold text-slate-400">& up</span>
                        </span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Apply filters trigger for mobile only */}
                <button 
                  onClick={() => setFiltersOpen(false)}
                  className="w-full btn-primary !py-3 !text-sm lg:hidden"
                >
                  Apply Filters
                </button>
              </div>
            </aside>

            {/* Products Listing Grid */}
            <div className="flex-1 min-w-0 w-full">
              
              {/* Toolbar */}
              <div className="flex items-center justify-between mb-8 gap-4 bg-white dark:bg-slate-900 border border-slate-200/50 dark:border-slate-800/40 p-4 rounded-3xl shadow-soft">
                <button
                  onClick={() => setFiltersOpen(!filtersOpen)}
                  className="lg:hidden flex items-center gap-2 text-xs font-bold text-slate-700 dark:text-slate-200 bg-slate-100 dark:bg-slate-800 px-4 py-2.5 rounded-xl border border-slate-200/40 dark:border-slate-750 hover:bg-slate-200 transition-colors"
                >
                  <Filter size={15} /> Filters
                </button>
                
                <div className="flex items-center gap-3 ml-auto">
                  <span className="text-xs font-semibold text-slate-400 hidden sm:block">{pagination.total} items listed</span>
                  <div className="relative">
                    <select
                      value={filters.sort}
                      onChange={(e) => updateFilter('sort', e.target.value)}
                      className="rounded-xl border border-slate-200/60 bg-white pr-9 pl-4 py-2 text-xs font-bold text-slate-750 outline-none transition focus:border-primary focus:ring-4 focus:ring-primary/10 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-200 appearance-none cursor-pointer"
                    >
                      {SORT_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
                    </select>
                    <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                  </div>
                </div>
              </div>

              {/* Product Grid Renderer */}
              {loading ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
                  {[...Array(9)].map((_, i) => <ProductSkeleton key={i} />)}
                </div>
              ) : products.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
                  {products.map((p) => <ProductCard key={p._id} product={p} />)}
                </div>
              ) : (
                <div className="text-center py-24 premium-card max-w-lg mx-auto p-10 bg-white">
                  <div className="w-16 h-16 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center mx-auto mb-6">
                    <Search size={28} className="text-slate-400" />
                  </div>
                  <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">No Products Match Filters</h3>
                  <p className="text-slate-500 dark:text-slate-400 text-sm mb-6 max-w-sm mx-auto">Try clearing search parameters, adjusting minimum ratings, or price filters.</p>
                  <button onClick={() => setSearchParams({})} className="btn-primary inline-flex items-center gap-2">
                    <X size={16} /> Reset Filters
                  </button>
                </div>
              )}

              {/* Pagination */}
              {pagination.pages > 1 && (
                <div className="flex justify-center items-center gap-2 mt-12">
                  {[...Array(pagination.pages)].map((_, i) => (
                    <button
                      key={i}
                      onClick={() => updateFilter('page', String(i + 1))}
                      className={`w-10 h-10 rounded-xl text-xs font-bold transition-all hover:scale-105 active:scale-95 ${
                        filters.page === String(i + 1)
                          ? 'bg-primary text-white shadow-glow'
                          : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-200 border border-slate-200/50 dark:border-slate-800/40 hover:border-primary'
                      }`}
                    >
                      {i + 1}
                    </button>
                  ))}
                </div>
              )}
            </div>

          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}
