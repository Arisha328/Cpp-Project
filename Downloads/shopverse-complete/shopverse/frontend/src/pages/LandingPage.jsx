import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { motion, useInView } from 'framer-motion';
import { ArrowRight, ShoppingBag, Store, Shield, Star, Zap, ChevronDown, Package, Users, TrendingUp, CheckCircle, Award, Sparkles } from 'lucide-react';
import api from '../api/axios';
import ProductCard from '../components/product/ProductCard';
import { ProductSkeleton } from '../components/common/Skeletons';
import Navbar from '../components/layout/Navbar';
import Footer from '../components/layout/Footer';

const CATEGORIES = [
  { icon: '💻', name: 'Electronics', color: 'from-blue-500/10 to-cyan-500/10 text-blue-500 border-blue-200/40 dark:border-blue-800/20' },
  { icon: '👗', name: 'Fashion', color: 'from-pink-500/10 to-rose-500/10 text-pink-500 border-pink-200/40 dark:border-pink-800/20' },
  { icon: '🏠', name: 'Home & Living', color: 'from-amber-500/10 to-orange-500/10 text-amber-500 border-amber-200/40 dark:border-amber-800/20' },
  { icon: '📚', name: 'Books', color: 'from-green-500/10 to-emerald-500/10 text-green-500 border-green-200/40 dark:border-green-800/20' },
  { icon: '⚽', name: 'Sports', color: 'from-violet-500/10 to-purple-500/10 text-violet-500 border-violet-200/40 dark:border-violet-800/20' },
  { icon: '💄', name: 'Beauty', color: 'from-red-500/10 to-pink-500/10 text-red-500 border-red-200/40 dark:border-red-800/20' },
  { icon: '🎮', name: 'Gaming', color: 'from-indigo-500/10 to-blue-500/10 text-indigo-500 border-indigo-200/40 dark:border-indigo-800/20' },
  { icon: '🍎', name: 'Food & Health', color: 'from-teal-500/10 to-green-500/10 text-teal-500 border-teal-200/40 dark:border-teal-800/20' },
];

const STATS = [
  { label: 'Active Buyers', value: '2M+', icon: Users, color: 'text-primary' },
  { label: 'Products Listed', value: '500K+', icon: Package, color: 'text-secondary' },
  { label: 'Verified Vendors', value: '12K+', icon: Store, color: 'text-accent' },
  { label: 'Orders Completed', value: '8M+', icon: TrendingUp, color: 'text-emerald-500' },
];

const TESTIMONIALS = [
  { name: 'Sarah Johnson', role: 'Fashion Entrepreneur', avatar: 'SJ', rating: 5, text: 'ShopVerse transformed my small boutique into a thriving online business. The vendor tools are incredibly intuitive and the customer reach is unmatched.' },
  { name: 'Marcus Chen', role: 'Tech Gadget Seller', avatar: 'MC', rating: 5, text: 'The analytics dashboard gives me real insights into my store performance. Sales have grown 3x since I joined ShopVerse.' },
  { name: 'Priya Patel', role: 'Loyal Customer', avatar: 'PP', rating: 5, text: 'I love shopping on ShopVerse! The variety is incredible and the checkout process is seamless. My orders always arrive on time.' },
];

const FAQS = [
  { q: 'How do I become a vendor on ShopVerse?', a: 'Sign up with a vendor account, complete your store profile, and start listing products. Our team reviews new vendors within 24 hours.' },
  { q: 'Is my payment information secure?', a: 'Absolutely. We use bank-grade 256-bit SSL encryption and never store your raw card data. All transactions are PCI DSS compliant.' },
  { q: 'What is ShopVerse\'s return policy?', a: 'We offer a 30-day return window for most products. Vendors set their own return policies which are clearly listed on each product page.' },
  { q: 'How do I track my order?', a: 'Once your order ships, you\'ll receive a tracking number via email. You can also track in real-time from your customer dashboard.' },
];

function StatCounter({ value, label, icon: Icon, color, inView }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.6, cubicBezier: [0.16, 1, 0.3, 1] }}
      className="card p-8 text-center relative overflow-hidden group hover:border-primary/30"
    >
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-secondary/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-800 dark:to-slate-900 flex items-center justify-center mx-auto mb-5 shadow-inner transition-transform duration-300 group-hover:scale-110`}>
        <Icon size={24} className={color} />
      </div>
      <div className="font-display font-extrabold text-3xl sm:text-4xl text-slate-900 dark:text-white mb-2 tracking-tight">{value}</div>
      <p className="text-sm font-semibold text-slate-500 dark:text-slate-400">{label}</p>
    </motion.div>
  );
}

export default function LandingPage() {
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [openFaq, setOpenFaq] = useState(null);
  const statsRef = useRef(null);
  const statsInView = useInView(statsRef, { once: true });

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const { data } = await api.get('/products?featured=true&limit=8');
        setFeaturedProducts(data.products || []);
      } catch (err) {
        setFeaturedProducts([]);
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, []);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 transition-colors duration-300">
      <Navbar />

      {/* HERO */}
      <section className="relative min-h-screen flex items-center pt-24 pb-20 overflow-hidden bg-slate-900 dark:bg-slate-950">
        
        {/* Animated Background Mesh & Gradients */}
        <div className="absolute inset-0 bg-gradient-mesh opacity-90 pointer-events-none" />
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-1/4 left-1/4 w-[45rem] h-[45rem] bg-primary/10 rounded-full blur-3xl animate-pulse-slow" />
          <div className="absolute bottom-1/4 right-1/4 w-[40rem] h-[40rem] bg-secondary/10 rounded-full blur-3xl animate-pulse-slow" style={{ animationDelay: '1.5s' }} />
          <div className="absolute top-1/2 left-1/2 w-80 h-80 bg-accent/5 rounded-full blur-3xl animate-pulse-slow" style={{ animationDelay: '3s' }} />
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 w-full">
          <div className="grid lg:grid-cols-12 gap-12 lg:gap-8 items-center">
            
            {/* Left Content Column */}
            <div className="lg:col-span-7 text-left space-y-8">
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, cubicBezier: [0.16, 1, 0.3, 1] }}
                className="space-y-6"
              >
                <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-white/10 bg-white/5 backdrop-blur-md text-slate-200 text-xs font-bold shadow-glass">
                  <Sparkles size={13} className="text-accent animate-pulse" />
                  The Next-Gen Multi-Vendor Marketplace
                </span>
                
                <h1 className="font-display font-extrabold text-5xl sm:text-6xl lg:text-7xl text-white leading-[1.08] tracking-tight">
                  Everything You{' '}
                  <span className="bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent">
                    Want & Sell
                  </span>{' '}
                  in One Place
                </h1>
                
                <p className="text-slate-350 text-base sm:text-lg lg:text-xl leading-relaxed max-w-2xl">
                  Discover millions of handpicked items from verified suppliers worldwide. Experience ultra-fast delivery, bulletproof escrow checkout, and premium support.
                </p>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2, duration: 0.8, cubicBezier: [0.16, 1, 0.3, 1] }}
                className="flex flex-col sm:flex-row gap-4"
              >
                <Link to="/products" className="btn-primary flex items-center justify-center gap-2 text-base px-8 py-4 shadow-glow hover:scale-103 active:scale-97">
                  <ShoppingBag size={18} />
                  Start Shopping
                  <ArrowRight size={16} className="ml-1" />
                </Link>
                <Link to="/register" className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-2xl border border-white/20 text-white font-bold hover:bg-white/10 transition-all duration-300 backdrop-blur-sm text-base hover:scale-103 active:scale-97">
                  <Store size={18} />
                  Become a Vendor
                </Link>
              </motion.div>

              {/* Trust Indicators */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.4, duration: 0.8 }}
                className="flex flex-wrap gap-x-8 gap-y-3 pt-4 border-t border-white/5"
              >
                {[
                  { icon: Shield, text: 'PCI Encrypted Escrows' },
                  { icon: Package, text: '24-Hour Tracked Logistics' },
                  { icon: Award, text: 'Top Rated Global Sellers' },
                ].map(({ icon: Icon, text }) => (
                  <div key={text} className="flex items-center gap-2.5 text-white/50 text-xs font-semibold uppercase tracking-wider">
                    <Icon size={16} className="text-accent" />
                    {text}
                  </div>
                ))}
              </motion.div>
            </div>

            {/* Right Interactive Mockup Column */}
            <div className="lg:col-span-5 hidden lg:block relative">
              
              {/* Decorative Glow behind mockup */}
              <div className="absolute -inset-4 bg-gradient-to-tr from-primary/30 to-secondary/30 rounded-[40px] blur-2xl opacity-80 animate-pulse-slow" />
              
              <motion.div 
                initial={{ opacity: 0, scale: 0.9, y: 40 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                transition={{ delay: 0.1, duration: 1, cubicBezier: [0.16, 1, 0.3, 1] }}
                className="relative rounded-[36px] border border-white/15 bg-slate-900/60 backdrop-blur-2xl p-6 shadow-premium-hover w-full max-w-sm mx-auto select-none"
              >
                {/* Mockup Header */}
                <div className="flex items-center justify-between pb-4 border-b border-white/10 mb-5">
                  <div className="flex gap-1.5">
                    <div className="w-2.5 h-2.5 rounded-full bg-rose-500" />
                    <div className="w-2.5 h-2.5 rounded-full bg-amber-500" />
                    <div className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                  </div>
                  <div className="text-[10px] font-bold text-slate-400 tracking-[0.2em] uppercase">ShopVerse Live Console</div>
                </div>

                {/* Stacking Widgets */}
                <div className="space-y-4">
                  
                  {/* Revenue Widget */}
                  <motion.div 
                    whileHover={{ scale: 1.03 }}
                    className="p-4 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-between"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-green-500 flex items-center justify-center text-white">
                        <TrendingUp size={18} />
                      </div>
                      <div>
                        <div className="text-[10px] font-semibold text-slate-400 uppercase tracking-wide">Live Vendor Sales</div>
                        <div className="text-lg font-bold text-white mt-0.5">$18,452.90</div>
                      </div>
                    </div>
                    <span className="badge bg-emerald-500/20 text-emerald-400 border-emerald-500/30 text-[10px]">+14.2%</span>
                  </motion.div>

                  {/* Hot Product Widget */}
                  <motion.div 
                    whileHover={{ scale: 1.03 }}
                    className="p-4 rounded-2xl bg-white/5 border border-white/10 flex items-center gap-3"
                  >
                    <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-primary/30 to-secondary/30 overflow-hidden shrink-0 border border-white/10">
                      <div className="w-full h-full bg-grid-pattern opacity-40 flex items-center justify-center text-xl">🎧</div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-[10px] font-semibold text-accent uppercase tracking-wide">Trending Item</div>
                      <div className="text-sm font-bold text-white truncate mt-0.5">Studio ANC Wireless Pro</div>
                      <div className="flex items-center gap-2 mt-1">
                        <div className="flex text-amber-400 text-xs">★★★★★</div>
                        <span className="text-[10px] text-slate-400 font-medium">(1.4k reviews)</span>
                      </div>
                    </div>
                  </motion.div>

                  {/* Shipping Tracker Widget */}
                  <motion.div 
                    whileHover={{ scale: 1.03 }}
                    className="p-4 rounded-2xl bg-white/5 border border-white/10"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wide">Dispatched Courier</span>
                      <span className="text-[10px] font-bold text-primary">ID: #4819-SV</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-2.5 h-2.5 rounded-full bg-primary animate-ping shrink-0" />
                      <div className="w-full bg-white/10 h-1.5 rounded-full overflow-hidden">
                        <div className="bg-gradient-to-r from-primary to-secondary h-full rounded-full w-2/3" />
                      </div>
                    </div>
                    <div className="flex justify-between items-center text-[10px] font-semibold text-slate-400 mt-2">
                      <span>Vendor Hub</span>
                      <span>Transit</span>
                      <span>Arrived</span>
                    </div>
                  </motion.div>
                </div>
              </motion.div>

              {/* Decorative elements */}
              <div className="absolute -bottom-6 -right-6 w-12 h-12 rounded-2xl bg-gradient-to-br from-secondary to-pink-500 animate-float-slow opacity-80 shadow-glow" />
              <div className="absolute -top-6 -left-6 w-10 h-10 rounded-2xl bg-gradient-to-br from-primary to-accent animate-float-medium opacity-80 shadow-glow" />
            </div>

          </div>
        </div>
      </section>

      {/* CATEGORIES */}
      <section className="py-24 bg-white dark:bg-slate-900 border-b border-slate-200/50 dark:border-slate-800/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16 space-y-3">
            <p className="text-primary font-bold text-xs uppercase tracking-[0.2em]">Explore Collections</p>
            <h2 className="section-title">Shop by Category</h2>
            <p className="section-subtitle">Find premium quality items across our highly curated catalog listings.</p>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-4">
            {CATEGORIES.map((cat, i) => (
              <motion.div
                key={cat.name}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                transition={{ delay: i * 0.05, duration: 0.5, cubicBezier: [0.16, 1, 0.3, 1] }}
                viewport={{ once: true }}
                whileHover={{ scale: 1.05 }}
              >
                <Link
                  to={`/products?category=${encodeURIComponent(cat.name)}`}
                  className={`flex flex-col items-center p-5 rounded-3xl border hover:shadow-premium transition-all duration-300 group bg-gradient-to-br ${cat.color}`}
                >
                  <div className="w-16 h-16 rounded-2xl bg-white dark:bg-slate-950 flex items-center justify-center text-3xl mb-4 group-hover:scale-110 shadow-soft border border-white/50 dark:border-slate-800/50 transition-transform">
                    {cat.icon}
                  </div>
                  <span className="text-xs font-bold text-slate-800 dark:text-slate-100 text-center leading-tight tracking-wide">{cat.name}</span>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* FEATURED PRODUCTS */}
      <section className="py-24 bg-slate-50 dark:bg-slate-950">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-end justify-between mb-16">
            <div className="space-y-3">
              <p className="text-primary font-bold text-xs uppercase tracking-[0.2em]">Curated For You</p>
              <h2 className="section-title">Featured Products</h2>
            </div>
            <Link to="/products" className="btn-secondary !py-2.5 !px-5 text-sm hidden sm:flex items-center gap-2 shadow-soft">
              View All Products <ArrowRight size={14} />
            </Link>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {[...Array(8)].map((_, i) => <ProductSkeleton key={i} />)}
            </div>
          ) : featuredProducts.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {featuredProducts.map((product) => (
                <ProductCard key={product._id} product={product} />
              ))}
            </div>
          ) : (
            <div className="text-center py-24 premium-card max-w-xl mx-auto p-10 bg-white">
              <div className="w-16 h-16 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center mx-auto mb-6">
                <ShoppingBag size={28} className="text-slate-400 dark:text-slate-500" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">No Featured Products Yet</h3>
              <p className="text-slate-500 dark:text-slate-400 text-sm mb-6 max-w-md mx-auto">Products listed by verified marketplace vendors will be featured here automatically.</p>
              <Link to="/register" className="btn-primary inline-flex items-center gap-2">
                Register Store <ArrowRight size={16} />
              </Link>
            </div>
          )}
        </div>
      </section>

      {/* STATS */}
      <section ref={statsRef} className="py-24 bg-white dark:bg-slate-900 border-t border-b border-slate-200/50 dark:border-slate-800/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16 space-y-3">
            <p className="text-primary font-bold text-xs uppercase tracking-[0.2em]">Our Milestones</p>
            <h2 className="section-title">Trusted by Millions Globally</h2>
            <p className="section-subtitle">A decentralized model connecting suppliers and customers worldwide.</p>
          </div>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
            {STATS.map((stat, i) => (
              <StatCounter key={stat.label} {...stat} inView={statsInView} />
            ))}
          </div>
        </div>
      </section>

      {/* VENDOR CTA */}
      <section className="py-24 relative overflow-hidden bg-gradient-dark text-white border-b border-slate-950">
        
        {/* Glow Effects */}
        <div className="absolute inset-0 bg-grid-pattern opacity-10 pointer-events-none" />
        <div className="absolute top-1/2 left-1/4 -translate-y-1/2 w-96 h-96 bg-primary/20 rounded-full blur-[120px] pointer-events-none" />
        <div className="absolute bottom-0 right-1/4 w-[30rem] h-[30rem] bg-secondary/15 rounded-full blur-[140px] pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            
            {/* CTA Left Column */}
            <motion.div
              initial={{ opacity: 0, x: -40 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, cubicBezier: [0.16, 1, 0.3, 1] }}
              viewport={{ once: true }}
              className="space-y-8"
            >
              <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-accent text-xs font-bold shadow-glass">
                Vendor Hub
              </span>
              <h2 className="font-display font-extrabold text-4xl sm:text-5xl text-white leading-tight">
                Launch & Scalel Your Business With ShopVerse
              </h2>
              <p className="text-slate-300 text-base sm:text-lg leading-relaxed">
                Unlock instant access to a global buyer catalog. Create your store in 5 minutes, list with zero fee commissions, and harness automatic analytics widgets.
              </p>
              
              <ul className="space-y-4">
                {[
                  'Zero commission structure for the initial 90 days',
                  'Frictionless analytics, tracking, and customer conversion tools',
                  'Built-in secure payment gateways and immediate payouts',
                  'Verified seller badge matching modern industry standards',
                ].map((item) => (
                  <li key={item} className="flex items-start gap-3 text-slate-200">
                    <CheckCircle size={18} className="text-accent shrink-0 mt-0.5" />
                    <span className="text-sm font-medium">{item}</span>
                  </li>
                ))}
              </ul>
              
              <div className="pt-2">
                <Link to="/register" className="btn-primary !px-8 !py-4 text-base shadow-glow hover:scale-103 active:scale-97">
                  Open Your Store <ArrowRight size={18} />
                </Link>
              </div>
            </motion.div>

            {/* CTA Right Cards Column */}
            <motion.div
              initial={{ opacity: 0, x: 40 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, cubicBezier: [0.16, 1, 0.3, 1] }}
              viewport={{ once: true }}
              className="grid grid-cols-2 gap-4"
            >
              {[
                { label: 'Avg. Monthly Revenue', value: '$4,200', icon: '💰', color: 'border-primary/20 bg-primary/5' },
                { label: 'Customer Satisfaction', value: '98.7%', icon: '⭐', color: 'border-secondary/20 bg-secondary/5' },
                { label: 'Orders Handled Daily', value: '24K+', icon: '📦', color: 'border-accent/20 bg-accent/5' },
                { label: 'Countries Supported', value: '80+', icon: '🌍', color: 'border-emerald-550/20 bg-emerald-500/5' },
              ].map((stat) => (
                <div key={stat.label} className={`border rounded-[28px] p-6 text-white backdrop-blur shadow-premium transition-all hover:scale-105 duration-350 ${stat.color}`}>
                  <div className="text-3xl mb-3">{stat.icon}</div>
                  <div className="font-display font-extrabold text-2xl mb-1 tracking-tight">{stat.value}</div>
                  <p className="text-slate-400 text-xs font-semibold">{stat.label}</p>
                </div>
              ))}
            </motion.div>
          </div>
        </div>
      </section>

      {/* TESTIMONIALS */}
      <section className="py-24 bg-slate-50 dark:bg-slate-950">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16 space-y-3">
            <p className="text-primary font-bold text-xs uppercase tracking-[0.2em]">Customer Reviews</p>
            <h2 className="section-title">What Our Community Says</h2>
            <p className="section-subtitle">Hear stories from buyers and sellers managing transactions daily.</p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {TESTIMONIALS.map((t, i) => (
              <motion.div
                key={t.name}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1, duration: 0.6, cubicBezier: [0.16, 1, 0.3, 1] }}
                viewport={{ once: true }}
                className="premium-card p-8 bg-white dark:bg-slate-900"
              >
                <div className="flex mb-4">
                  {[...Array(t.rating)].map((_, j) => (
                    <Star key={j} size={15} className="text-amber-400 fill-amber-400" />
                  ))}
                </div>
                <p className="text-slate-600 dark:text-slate-300 text-sm leading-relaxed mb-6 font-medium">"{t.text}"</p>
                <div className="flex items-center gap-3.5 border-t border-slate-100 dark:border-slate-800 pt-4 mt-auto">
                  <div className="w-11 h-11 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-white font-extrabold text-sm shadow-glow">
                    {t.avatar}
                  </div>
                  <div>
                    <p className="font-bold text-slate-900 dark:text-white text-sm leading-none">{t.name}</p>
                    <p className="text-xs text-slate-500 mt-1 font-semibold">{t.role}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-24 bg-white dark:bg-slate-900 border-t border-slate-200/50 dark:border-slate-800/30">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16 space-y-3">
            <p className="text-primary font-bold text-xs uppercase tracking-[0.2em]">Got Questions?</p>
            <h2 className="section-title">Frequently Asked Questions</h2>
            <p className="section-subtitle">Got questions? Find direct explanations here.</p>
          </div>
          <div className="space-y-4">
            {FAQS.map((faq, i) => (
              <div key={i} className="card overflow-hidden bg-slate-50 dark:bg-slate-950 hover:border-primary/20">
                <button
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                  className="w-full flex items-center justify-between p-6 text-left"
                >
                  <span className="font-bold text-slate-900 dark:text-white text-sm tracking-wide">{faq.q}</span>
                  <ChevronDown
                    size={18}
                    className={`text-slate-400 transition-transform duration-300 shrink-0 ${openFaq === i ? 'rotate-180 text-primary' : ''}`}
                  />
                </button>
                {openFaq === i && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3 }}
                    className="px-6 pb-6 border-t border-slate-100/50 dark:border-slate-800/50 pt-4"
                  >
                    <p className="text-slate-500 dark:text-slate-400 text-sm leading-relaxed font-medium">{faq.a}</p>
                  </motion.div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
