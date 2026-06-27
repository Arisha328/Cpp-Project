import { useState, useEffect, useMemo } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ShoppingCart,
  Heart,
  Search,
  Menu,
  X,
  Sun,
  Moon,
  User,
  Package,
  LogOut,
  ChevronDown,
  Bell,
  Store,
} from 'lucide-react';
import { logout } from '../../store/slices/authSlice';

const NAV_LINKS = [
  { label: 'Products', to: '/products' },
  { label: 'Sell', to: '/register' },
  { label: 'Help', to: '/orders' },
];

export default function Navbar() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useSelector((s) => s.auth);
  const cartItems = useSelector((s) => s.cart.items);
  const [isOpen, setIsOpen] = useState(false);
  const [darkMode, setDarkMode] = useState(() => localStorage.getItem('shopverse_dark') === 'true');
  const [profileOpen, setProfileOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [scrolled, setScrolled] = useState(false);
  const [searchFocused, setSearchFocused] = useState(false);

  useEffect(() => {
    document.documentElement.classList.toggle('dark', darkMode);
    localStorage.setItem('shopverse_dark', darkMode);
  }, [darkMode]);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const cartCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);

  const handleSearch = (e) => {
    e.preventDefault();
    if (search.trim()) {
      navigate(`/products?search=${encodeURIComponent(search.trim())}`);
      setSearch('');
      setIsOpen(false);
    }
  };

  const handleLogout = () => {
    dispatch(logout());
    navigate('/');
    setProfileOpen(false);
  };

  const dashboardLink = useMemo(() => {
    if (!user) return '/login';
    if (user.role === 'admin') return '/admin';
    if (user.role === 'vendor') return '/vendor';
    return '/dashboard';
  }, [user]);

  return (
    <nav className={`fixed inset-x-0 top-0 z-50 transition-all duration-300 ${
      scrolled
        ? 'py-3 bg-white/70 dark:bg-slate-950/70 border-b border-slate-200/50 dark:border-slate-800/50 backdrop-blur-xl shadow-premium'
        : 'py-5 bg-transparent'
    }`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-14 items-center justify-between gap-4">
          
          {/* Logo */}
          <Link to="/" className="flex items-center gap-3 shrink-0">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-primary to-secondary text-white shadow-glow transition-transform hover:scale-105 active:scale-95">
              <Store size={20} className="stroke-[1.75]" />
            </div>
            <div>
              <p className="text-base font-bold tracking-tight text-slate-900 dark:text-white leading-none">ShopVerse</p>
              <p className="text-[9px] font-semibold uppercase tracking-[0.25em] text-primary dark:text-secondary mt-1">Premium Mall</p>
            </div>
          </Link>

          {/* Nav Links */}
          <div className="hidden md:flex items-center gap-1 rounded-2xl border border-slate-200/60 bg-slate-100/50 p-1.5 dark:border-slate-800/60 dark:bg-slate-900/50 backdrop-blur">
            {NAV_LINKS.map((link) => {
              const isActive = location.pathname.startsWith(link.to);
              return (
                <Link
                  key={link.to}
                  to={link.to}
                  className={`relative rounded-xl px-4 py-2 text-sm font-semibold transition-all duration-300 ${
                    isActive
                      ? 'bg-white text-primary shadow-premium dark:bg-slate-800 dark:text-white'
                      : 'text-slate-600 hover:text-primary dark:text-slate-300 dark:hover:text-white'
                  }`}
                >
                  {link.label}
                </Link>
              );
            })}
          </div>

          {/* Search bar */}
          <div className="hidden lg:flex flex-1 justify-center max-w-md transition-all duration-300">
            <form onSubmit={handleSearch} className="w-full">
              <label htmlFor="nav-search" className="sr-only">Search products</label>
              <div className="relative">
                <Search size={18} className={`absolute left-4 top-1/2 -translate-y-1/2 transition-colors duration-300 ${
                  searchFocused ? 'text-primary' : 'text-slate-400'
                }`} />
                <input
                  id="nav-search"
                  type="text"
                  value={search}
                  onFocus={() => setSearchFocused(true)}
                  onBlur={() => setSearchFocused(false)}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search products, brands, categories..."
                  className={`w-full rounded-2xl border bg-white/60 dark:bg-slate-950/60 px-11 py-2.5 text-sm text-slate-950 shadow-soft outline-none transition-all duration-300 dark:text-slate-50 ${
                    searchFocused 
                      ? 'border-primary ring-4 ring-primary/10 w-[110%] -translate-x-[5%]' 
                      : 'border-slate-200 dark:border-slate-800'
                  }`}
                />
              </div>
            </form>
          </div>

          {/* Actions & Dropdowns */}
          <div className="flex items-center gap-2">
            
            {/* Theme Toggle */}
            <button
              onClick={() => setDarkMode(!darkMode)}
              className="inline-flex h-11 w-11 items-center justify-center rounded-2xl border border-slate-200/60 bg-white/60 text-slate-600 shadow-soft transition hover:border-primary hover:text-primary dark:border-slate-800/60 dark:bg-slate-950/60 dark:text-slate-300 hover:scale-105 active:scale-95"
              aria-label="Toggle dark mode"
            >
              {darkMode ? <Sun size={18} /> : <Moon size={18} />}
            </button>

            {user && (
              <>
                {/* Wishlist */}
                <Link
                  to="/wishlist"
                  className="inline-flex h-11 w-11 items-center justify-center rounded-2xl border border-slate-200/60 bg-white/60 text-slate-600 shadow-soft transition hover:border-primary hover:text-primary dark:border-slate-800/60 dark:bg-slate-950/60 dark:text-slate-300 hover:scale-105 active:scale-95"
                  aria-label="Wishlist"
                >
                  <Heart size={18} />
                </Link>
                
                {/* Cart */}
                <Link
                  to="/cart"
                  className="relative inline-flex h-11 w-11 items-center justify-center rounded-2xl border border-slate-200/60 bg-white/60 text-slate-600 shadow-soft transition hover:border-primary hover:text-primary dark:border-slate-800/60 dark:bg-slate-950/60 dark:text-slate-300 hover:scale-105 active:scale-95"
                  aria-label="Cart"
                >
                  <ShoppingCart size={18} />
                  {cartCount > 0 && (
                    <span className="absolute -right-1.5 -top-1.5 inline-flex h-5 min-w-[1.25rem] items-center justify-center rounded-full bg-primary text-[10px] font-bold text-white shadow-glow px-1">
                      {cartCount > 9 ? '9+' : cartCount}
                    </span>
                  )}
                </Link>
              </>
            )}

            {/* Profile Dropdown */}
            {user ? (
              <div className="relative">
                <button
                  onClick={() => setProfileOpen(!profileOpen)}
                  className="inline-flex items-center gap-2 rounded-2xl border border-slate-200/60 bg-white/60 p-1.5 pr-3 text-sm font-semibold text-slate-700 shadow-soft transition hover:border-primary hover:text-primary dark:border-slate-800/60 dark:bg-slate-950/60 dark:text-slate-200 hover:scale-102 active:scale-98"
                >
                  <span className="inline-flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-secondary text-white font-bold text-sm leading-none shadow-glow">
                    {user.name?.[0]?.toUpperCase()}
                  </span>
                  <span className="hidden sm:inline">{user.name?.split(' ')[0]}</span>
                  <ChevronDown size={14} className="text-slate-400" />
                </button>

                <AnimatePresence>
                  {profileOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: 10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 10, scale: 0.95 }}
                      transition={{ duration: 0.2, ease: 'easeOut' }}
                      className="absolute right-0 mt-3 w-64 overflow-hidden rounded-3xl border border-slate-200/60 bg-white/90 shadow-premium backdrop-blur-lg dark:border-slate-800/60 dark:bg-slate-950/90 z-55"
                    >
                      <div className="border-b border-slate-100 dark:border-slate-800 p-4">
                        <p className="text-sm font-bold text-slate-900 dark:text-white">{user.name}</p>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 truncate">{user.email}</p>
                        <span className="mt-2.5 inline-flex rounded-full bg-primary/10 px-2.5 py-0.5 text-[10px] font-bold text-primary dark:bg-primary/20">
                          {user.role}
                        </span>
                      </div>
                      <div className="flex flex-col py-1.5">
                        <Link
                          to={dashboardLink}
                          onClick={() => setProfileOpen(false)}
                          className="flex items-center gap-3 px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50 dark:text-slate-200 dark:hover:bg-slate-900"
                        >
                          <Package size={16} className="text-slate-400" /> Dashboard
                        </Link>
                        <Link
                          to="/profile"
                          onClick={() => setProfileOpen(false)}
                          className="flex items-center gap-3 px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50 dark:text-slate-200 dark:hover:bg-slate-900"
                        >
                          <User size={16} className="text-slate-400" /> Profile
                        </Link>
                        <Link
                          to="/settings"
                          onClick={() => setProfileOpen(false)}
                          className="flex items-center gap-3 px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50 dark:text-slate-200 dark:hover:bg-slate-900"
                        >
                          <Bell size={16} className="text-slate-400" /> Settings
                        </Link>
                        <div className="h-px bg-slate-100 dark:bg-slate-850 my-1"></div>
                        <button
                          onClick={handleLogout}
                          className="flex items-center gap-3 px-4 py-2.5 text-sm font-bold text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/20"
                        >
                          <LogOut size={16} /> Sign Out
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ) : (
              <div className="hidden md:flex items-center gap-3">
                <Link to="/login" className="text-sm font-semibold text-slate-700 hover:text-primary dark:text-slate-300 hover:scale-102 transition-transform">
                  Sign In
                </Link>
                <Link to="/register" className="btn-primary !py-2.5 !px-5 text-sm">
                  Get Started
                </Link>
              </div>
            )}

            {/* Mobile menu toggle */}
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="inline-flex h-11 w-11 items-center justify-center rounded-2xl border border-slate-200/60 bg-white/60 text-slate-600 shadow-soft transition hover:border-primary hover:text-primary md:hidden dark:border-slate-800/60 dark:bg-slate-950/60 dark:text-slate-300"
              aria-label="Toggle menu"
            >
              {isOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>

        {/* Mobile menu drawer */}
        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="md:hidden pb-4 pt-2"
            >
              <div className="rounded-3xl border border-slate-200/60 bg-white/95 p-4 shadow-premium dark:border-slate-800/60 dark:bg-slate-950/95 backdrop-blur">
                <form onSubmit={handleSearch} className="mb-4">
                  <label htmlFor="mobile-search" className="sr-only">Search products</label>
                  <div className="relative">
                    <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      id="mobile-search"
                      type="text"
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                      placeholder="Search products..."
                      className="input pl-11 !py-3"
                    />
                  </div>
                </form>
                <div className="space-y-1">
                  {NAV_LINKS.map((link) => (
                    <Link
                      key={link.to}
                      to={link.to}
                      onClick={() => setIsOpen(false)}
                      className="block rounded-2xl px-4 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50 dark:text-slate-200 dark:hover:bg-slate-900"
                    >
                      {link.label}
                    </Link>
                  ))}
                  {!user ? (
                    <div className="grid grid-cols-2 gap-3 pt-3 mt-3 border-t border-slate-100 dark:border-slate-800">
                      <Link
                        to="/login"
                        onClick={() => setIsOpen(false)}
                        className="flex items-center justify-center rounded-2xl border border-slate-200/60 bg-white py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50 dark:border-slate-800/60 dark:bg-slate-900"
                      >
                        Sign In
                      </Link>
                      <Link
                        to="/register"
                        onClick={() => setIsOpen(false)}
                        className="btn-primary flex items-center justify-center !py-3"
                      >
                        Get Started
                      </Link>
                    </div>
                  ) : (
                    <>
                      <Link
                        to={dashboardLink}
                        onClick={() => setIsOpen(false)}
                        className="block rounded-2xl px-4 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50 dark:text-slate-200 dark:hover:bg-slate-900"
                      >
                        Dashboard
                      </Link>
                      <button
                        onClick={() => {
                          handleLogout();
                          setIsOpen(false);
                        }}
                        className="block w-full rounded-2xl px-4 py-3 text-left text-sm font-bold text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/20"
                      >
                        Sign Out
                      </button>
                    </>
                  )}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </nav>
  );
}
