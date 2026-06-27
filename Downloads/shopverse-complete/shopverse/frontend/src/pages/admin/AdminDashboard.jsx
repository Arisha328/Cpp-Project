import { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Users, Package, ShoppingBag, DollarSign, TrendingUp,
  Store, Star, Check, X, AlertTriangle, Loader2, Trash2, ChevronDown
} from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, PieChart, Pie, Cell
} from 'recharts';
import api from '../../api/axios';
import Navbar from '../../components/layout/Navbar';
import Footer from '../../components/layout/Footer';
import toast from 'react-hot-toast';

const STATUS_COLORS = {
  pending: 'bg-amber-50 text-amber-600 border-amber-250/20 dark:bg-amber-950/30 dark:text-amber-400 dark:border-amber-800/20',
  confirmed: 'bg-blue-50 text-blue-600 border-blue-250/20 dark:bg-blue-950/30 dark:text-blue-400 dark:border-blue-800/20',
  processing: 'bg-purple-50 text-purple-600 border-purple-250/20 dark:bg-purple-950/30 dark:text-purple-400 dark:border-purple-800/20',
  shipped: 'bg-orange-50 text-orange-600 border-orange-250/20 dark:bg-orange-950/30 dark:text-orange-400 dark:border-orange-800/20',
  delivered: 'bg-emerald-50 text-emerald-600 border-emerald-250/20 dark:bg-emerald-950/30 dark:text-emerald-400 dark:border-emerald-800/20',
  cancelled: 'bg-rose-50 text-rose-600 border-rose-250/20 dark:bg-rose-950/30 dark:text-rose-400 dark:border-rose-800/20',
};

const PIE_COLORS = ['#3b82f6', '#8b5cf6', '#06b6d4', '#10b981'];

export default function AdminDashboard() {
  const { user } = useSelector((s) => s.auth);
  const navigate = useNavigate();
  const [tab, setTab] = useState('overview');
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [vendors, setVendors] = useState([]);
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [categories, setCategories] = useState([]);
  const [catForm, setCatForm] = useState({ name: '', icon: '🛍️', description: '' });

  useEffect(() => {
    if (user?.role !== 'admin') { navigate('/dashboard'); return; }
    fetchAll();
  }, [user]);

  const fetchAll = async () => {
    setLoading(true);
    try {
      const [statsRes, usersRes, vendorsRes, prodsRes, ordersRes, revsRes, catRes] = await Promise.all([
        api.get('/admin/stats'),
        api.get('/admin/users'),
        api.get('/admin/vendors'),
        api.get('/admin/products'),
        api.get('/admin/orders'),
        api.get('/admin/reviews'),
        api.get('/categories'),
      ]);
      setStats(statsRes.data);
      setUsers(usersRes.data.users || []);
      setVendors(vendorsRes.data.vendors || []);
      setProducts(prodsRes.data.products || []);
      setOrders(ordersRes.data.orders || []);
      setReviews(revsRes.data.reviews || []);
      setCategories(catRes.data.categories || []);
    } catch (err) {
      toast.error('Failed to load admin data');
    } finally {
      setLoading(false);
    }
  };

  const handleSuspendUser = async (userId, suspend) => {
    try {
      await api.put(`/admin/users/${userId}/suspend`, { isSuspended: suspend });
      toast.success(suspend ? 'User suspended' : 'User unsuspended');
      fetchAll();
    } catch { toast.error('Failed'); }
  };

  const handleApproveVendor = async (vendorId, approve) => {
    try {
      await api.put(`/admin/vendors/${vendorId}/approve`, { isApproved: approve });
      toast.success(approve ? 'Vendor approved!' : 'Vendor rejected');
      fetchAll();
    } catch { toast.error('Failed'); }
  };

  const handleDeleteReview = async (reviewId) => {
    try {
      await api.delete(`/admin/reviews/${reviewId}`);
      toast.success('Review deleted');
      setReviews(reviews.filter((r) => r._id !== reviewId));
    } catch { toast.error('Failed'); }
  };

  const handleCreateCategory = async () => {
    if (!catForm.name) return toast.error('Category name required');
    try {
      await api.post('/categories', catForm);
      toast.success('Category created!');
      setCatForm({ name: '', icon: '🛍️', description: '' });
      fetchAll();
    } catch (err) { toast.error(err.response?.data?.message || 'Failed'); }
  };

  const handleDeleteCategory = async (id) => {
    try {
      await api.delete(`/categories/${id}`);
      toast.success('Category deleted');
      fetchAll();
    } catch { toast.error('Failed'); }
  };

  const TABS = [
    { key: 'overview', label: 'Overview Analytics', icon: TrendingUp },
    { key: 'users', label: 'User Directory', icon: Users },
    { key: 'vendors', label: 'Vendor Directory', icon: Store },
    { key: 'products', label: 'Product Inventory', icon: Package },
    { key: 'orders', label: 'All Orders', icon: ShoppingBag },
    { key: 'reviews', label: 'Review Moderation', icon: Star },
    { key: 'categories', label: 'Mall Categories', icon: Package },
  ];

  const statCards = [
    { label: 'Marketplace Revenue', value: `$${(stats?.stats?.totalRevenue || 0).toFixed(2)}`, icon: DollarSign, color: 'text-blue-500' },
    { label: 'Total Orders', value: stats?.stats?.totalOrders || 0, icon: ShoppingBag, color: 'text-emerald-500' },
    { label: 'Customers Active', value: stats?.stats?.totalUsers || 0, icon: Users, color: 'text-orange-500' },
    { label: 'Registered Vendors', value: stats?.stats?.totalVendors || 0, icon: Store, color: 'text-purple-500' },
    { label: 'Listed Products', value: stats?.stats?.totalProducts || 0, icon: Package, color: 'text-accent' },
    { label: 'Pending Reviews', value: reviews.length, icon: Star, color: 'text-rose-500' },
  ];

  const orderStatusData = Object.entries(
    orders.reduce((acc, o) => { acc[o.orderStatus] = (acc[o.orderStatus] || 0) + 1; return acc; }, {})
  ).map(([name, value]) => ({ name, value }));

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 transition-colors duration-300">
      <Navbar />
      <div className="pt-20">
        
        {/* Header */}
        <div className="relative bg-gradient-to-r from-slate-900 to-slate-950 py-16 overflow-hidden border-b border-slate-200/10 dark:border-slate-800/10 mb-10">
          <div className="absolute inset-0 bg-grid-pattern opacity-10" />
          <div className="absolute -top-32 -right-32 w-80 h-80 bg-primary/10 rounded-full blur-[100px]" />
          
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            <div className="flex items-center gap-5">
              <div className="w-16 h-16 bg-gradient-to-br from-primary to-secondary rounded-2xl flex items-center justify-center text-white shadow-glow shrink-0">
                <TrendingUp size={24} className="stroke-[2.2]" />
              </div>
              <div className="space-y-1">
                <h1 className="font-display font-extrabold text-2xl sm:text-3xl text-white tracking-tight leading-none">
                  Admin Control Panel
                </h1>
                <p className="text-slate-400 font-semibold text-sm">
                  Global catalog moderation, user suspensions, and system logs.
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-20">
          
          {/* Tab Navigation */}
          <div className="flex gap-1.5 overflow-x-auto scrollbar-hide bg-slate-200/60 p-1.5 rounded-2xl mb-10 w-full dark:bg-slate-900/60 backdrop-blur border border-slate-200/30 dark:border-slate-800/40">
            {TABS.map(({ key, label, icon: Icon }) => (
              <button 
                key={key} 
                onClick={() => setTab(key)}
                className={`flex items-center gap-2 px-5 py-3 rounded-xl text-xs font-bold whitespace-nowrap transition-all duration-300 ${
                  tab === key 
                    ? 'bg-white dark:bg-slate-800 text-primary dark:text-white shadow-premium' 
                    : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-350'
                }`}
              >
                <Icon size={14} className="stroke-[2.2]" /> {label}
              </button>
            ))}
          </div>

          {/* OVERVIEW TAB */}
          {tab === 'overview' && (
            <div className="space-y-8">
              
              {/* Stat Cards */}
              <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-6">
                {statCards.map((stat, i) => {
                  const Icon = stat.icon;
                  return (
                    <motion.div 
                      key={stat.label} 
                      initial={{ opacity: 0, y: 20 }} 
                      animate={{ opacity: 1, y: 0 }} 
                      transition={{ delay: i * 0.04, duration: 0.5 }}
                      className="premium-card p-5 bg-white dark:bg-slate-900 border border-slate-200/50 dark:border-slate-800/40 shadow-soft"
                    >
                      <div className="w-10 h-10 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800 flex items-center justify-center mb-4 shrink-0">
                        <Icon size={18} className={stat.color} />
                      </div>
                      <p className="font-display font-extrabold text-xl text-slate-950 dark:text-white tracking-tight leading-none">
                        {stat.value}
                      </p>
                      <p className="text-[10px] uppercase font-bold text-slate-400 mt-2 truncate">{stat.label}</p>
                    </motion.div>
                  );
                })}
              </div>

              {/* Charts grid */}
              <div className="grid lg:grid-cols-2 gap-8">
                
                {/* Monthly Revenue Bar Chart */}
                <div className="premium-card p-6 bg-white dark:bg-slate-900 border border-slate-200/50 dark:border-slate-800/40 shadow-soft">
                  <h2 className="font-display font-bold text-base text-slate-900 dark:text-white mb-6">Monthly Profit Analytics</h2>
                  <div className="w-full h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={stats?.monthlyRevenue || []} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                        <XAxis dataKey="_id.month" tick={{ fontSize: 11, fontWeight: '600', fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                        <YAxis tick={{ fontSize: 11, fontWeight: '600', fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                        <Tooltip 
                          contentStyle={{ 
                            backgroundColor: '#0f172a', 
                            borderColor: '#1e293b', 
                            borderRadius: '16px',
                            color: '#fff',
                            fontSize: '12px',
                            fontWeight: '600'
                          }}
                        />
                        <Bar dataKey="revenue" fill="#3b82f6" radius={[6, 6, 0, 0]} name="Revenue ($)" />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                {/* Order Status Pie Chart */}
                <div className="premium-card p-6 bg-white dark:bg-slate-900 border border-slate-200/50 dark:border-slate-800/40 shadow-soft">
                  <h2 className="font-display font-bold text-base text-slate-900 dark:text-white mb-6">Order Status Share</h2>
                  {orderStatusData.length > 0 ? (
                    <div className="w-full h-64">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie 
                            data={orderStatusData} 
                            cx="50%" 
                            cy="50%" 
                            innerRadius={55} 
                            outerRadius={85}
                            paddingAngle={3}
                            dataKey="value" 
                            label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                          >
                            {orderStatusData.map((_, i) => (
                              <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                            ))}
                          </Pie>
                          <Tooltip />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                  ) : (
                    <div className="h-64 flex items-center justify-center text-slate-400 text-xs font-semibold">No orders logged yet</div>
                  )}
                </div>

              </div>

              {/* Recent Orders table */}
              <div className="premium-card overflow-hidden bg-white dark:bg-slate-900 border border-slate-200/50 dark:border-slate-800/40 shadow-soft">
                <div className="p-6 border-b border-slate-100 dark:border-slate-800/60">
                  <h2 className="font-display font-bold text-base text-slate-900 dark:text-white">Recent Purchases</h2>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-slate-100 dark:border-slate-800/60 bg-slate-50/50 dark:bg-slate-900/50">
                        {['Order #', 'Customer Name', 'Total Paid', 'Shipping Status', 'Date Placed'].map((h) => (
                          <th key={h} className="text-left px-6 py-4 text-xs font-bold text-slate-450 uppercase tracking-wider">{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-850">
                      {(stats?.recentOrders || []).slice(0, 8).map((order) => (
                        <tr key={order._id} className="hover:bg-slate-50/50 dark:hover:bg-slate-850/30 transition-colors">
                          <td className="px-6 py-4 text-sm font-bold text-slate-900 dark:text-white font-mono">{order.orderNumber?.slice(-10).toUpperCase()}</td>
                          <td className="px-6 py-4 text-sm font-semibold text-slate-700 dark:text-slate-350">{order.user?.name}</td>
                          <td className="px-6 py-4 text-sm font-extrabold text-slate-955 dark:text-white">${order.total?.toFixed(2)}</td>
                          <td className="px-6 py-4">
                            <span className={`badge capitalize text-[9px] font-extrabold px-2.5 py-0.5 border rounded-full ${STATUS_COLORS[order.orderStatus] || 'bg-slate-100 text-slate-700'}`}>
                              {order.orderStatus}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-xs text-slate-400 font-semibold">{new Date(order.createdAt).toLocaleDateString(undefined, { dateStyle: 'medium' })}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

            </div>
          )}

          {/* USERS TAB */}
          {tab === 'users' && (
            <div className="premium-card overflow-hidden bg-white dark:bg-slate-900 border border-slate-200/50 dark:border-slate-800/40 shadow-soft">
              <div className="p-6 border-b border-slate-100 dark:border-slate-800/60">
                <h2 className="font-display font-bold text-base text-slate-900 dark:text-white">User Directory ({users.length})</h2>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-slate-100 dark:border-slate-800/60 bg-slate-50/50 dark:bg-slate-900/50">
                      {['User profile', 'Email address', 'Access Role', 'Registration Date', 'System Status', 'Control action'].map((h) => (
                        <th key={h} className="text-left px-6 py-4 text-xs font-bold text-slate-450 uppercase tracking-wider">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-850">
                    {users.map((u) => (
                      <tr key={u._id} className="hover:bg-slate-50/50 dark:hover:bg-slate-850/30 transition-colors">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-white text-xs font-extrabold shadow-glow shrink-0">
                              {u.name?.[0]?.toUpperCase()}
                            </div>
                            <span className="text-sm font-bold text-slate-900 dark:text-white">{u.name}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-sm font-semibold text-slate-550 dark:text-slate-400">{u.email}</td>
                        <td className="px-6 py-4">
                          <span className="badge bg-primary/10 text-primary border-primary/20 capitalize font-bold text-[10px] px-2.5 py-0.5">
                            {u.role}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-xs text-slate-400 font-semibold">{new Date(u.createdAt).toLocaleDateString(undefined, { dateStyle: 'medium' })}</td>
                        <td className="px-6 py-4">
                          <span className={`badge text-[10px] font-extrabold px-2.5 py-0.5 border rounded-full ${
                            u.isSuspended 
                              ? 'bg-rose-50 text-rose-600 border-rose-250/20' 
                              : 'bg-emerald-50 text-emerald-600 border-emerald-250/20'
                          }`}>
                            {u.isSuspended ? 'Suspended' : 'Active Account'}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          {u.role !== 'admin' && (
                            <button 
                              onClick={() => handleSuspendUser(u._id, !u.isSuspended)}
                              className={`text-[10px] font-bold px-3 py-1.5 border rounded-xl transition-all duration-200 active:scale-95 ${
                                u.isSuspended 
                                  ? 'bg-emerald-50 text-emerald-600 border-emerald-250/20 hover:bg-emerald-100' 
                                  : 'bg-rose-50 text-rose-600 border-rose-250/20 hover:bg-rose-100'
                              }`}
                            >
                              {u.isSuspended ? 'Unsuspend User' : 'Suspend Account'}
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* VENDORS TAB */}
          {tab === 'vendors' && (
            <div className="premium-card overflow-hidden bg-white dark:bg-slate-900 border border-slate-200/50 dark:border-slate-800/40 shadow-soft">
              <div className="p-6 border-b border-slate-100 dark:border-slate-800/60">
                <h2 className="font-display font-bold text-base text-slate-900 dark:text-white">Vendor Directory ({vendors.length})</h2>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-slate-100 dark:border-slate-800/60 bg-slate-50/50 dark:bg-slate-900/50">
                      {['Store Brand Name', 'Owner Operator', 'Email address', 'Escrow Status', 'Action Control'].map((h) => (
                        <th key={h} className="text-left px-6 py-4 text-xs font-bold text-slate-450 uppercase tracking-wider">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-850">
                    {vendors.map((v) => (
                      <tr key={v._id} className="hover:bg-slate-50/50 dark:hover:bg-slate-850/30 transition-colors">
                        <td className="px-6 py-4 font-bold text-sm text-slate-900 dark:text-white">{v.storeName}</td>
                        <td className="px-6 py-4 text-sm font-semibold text-slate-700 dark:text-slate-350">{v.user?.name}</td>
                        <td className="px-6 py-4 text-sm font-semibold text-slate-500">{v.user?.email}</td>
                        <td className="px-6 py-4">
                          <span className={`badge text-[10px] font-extrabold px-2.5 py-0.5 border rounded-full ${
                            v.isApproved 
                              ? 'bg-emerald-50 text-emerald-600 border-emerald-250/20' 
                              : 'bg-amber-50 text-amber-600 border-amber-250/20 animate-pulse'
                          }`}>
                            {v.isApproved ? '✓ Approved shop' : '⏳ Review Pending'}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex gap-2">
                            {!v.isApproved ? (
                              <button 
                                onClick={() => handleApproveVendor(v._id, true)}
                                className="flex items-center gap-1.5 text-[10px] font-bold px-3 py-1.5 bg-emerald-50 text-emerald-600 border border-emerald-250/20 rounded-xl hover:bg-emerald-100 transition-all duration-200 active:scale-95"
                              >
                                <Check size={12} className="stroke-[2.5]" /> Approve Shop
                              </button>
                            ) : (
                              <button 
                                onClick={() => handleApproveVendor(v._id, false)}
                                className="flex items-center gap-1.5 text-[10px] font-bold px-3 py-1.5 bg-rose-50 text-rose-600 border border-rose-250/20 rounded-xl hover:bg-rose-100 transition-all duration-200 active:scale-95"
                              >
                                <X size={12} className="stroke-[2.5]" /> Deny Permission
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* PRODUCTS TAB */}
          {tab === 'products' && (
            <div className="premium-card overflow-hidden bg-white dark:bg-slate-900 border border-slate-200/50 dark:border-slate-800/40 shadow-soft">
              <div className="p-6 border-b border-slate-100 dark:border-slate-800/60">
                <h2 className="font-display font-bold text-base text-slate-900 dark:text-white">Active Product Inventory ({products.length})</h2>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-slate-100 dark:border-slate-800/60 bg-slate-50/50 dark:bg-slate-900/50">
                      {['Product Info', 'Listed By', 'Mall Category', 'Base Price', 'Units in Stock', 'Visibility Status'].map((h) => (
                        <th key={h} className="text-left px-6 py-4 text-xs font-bold text-slate-450 uppercase tracking-wider">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-850">
                    {products.slice(0, 50).map((p) => (
                      <tr key={p._id} className="hover:bg-slate-50/50 dark:hover:bg-slate-850/30 transition-colors">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <img 
                              src={p.images?.[0] || 'https://placehold.co/40x40/3b82f6/fff?text=P'} 
                              alt={p.name}
                              className="w-10 h-10 rounded-xl object-cover bg-slate-50 border border-slate-200/40 shrink-0"
                              onError={(e) => e.target.src = 'https://placehold.co/40x40/3b82f6/fff?text=P'} 
                            />
                            <span className="text-sm font-bold text-slate-900 dark:text-white line-clamp-1 max-w-xs leading-none">{p.name}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-sm font-semibold text-slate-600 dark:text-slate-350">{p.vendor?.name}</td>
                        <td className="px-6 py-4 text-sm font-semibold text-slate-500">{p.category?.name}</td>
                        <td className="px-6 py-4 text-sm font-extrabold text-slate-950 dark:text-white">${p.price?.toFixed(2)}</td>
                        <td className="px-6 py-4 text-sm font-semibold text-slate-500">{p.stock} units</td>
                        <td className="px-6 py-4">
                          <span className={`badge text-[9px] font-extrabold px-2.5 py-0.5 border rounded-full ${
                            p.isActive 
                              ? 'bg-emerald-50 text-emerald-600 border-emerald-250/20' 
                              : 'bg-slate-100 text-slate-500 border-slate-200/30'
                          }`}>
                            {p.isActive ? 'Visible' : 'Hidden'}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ORDERS TAB */}
          {tab === 'orders' && (
            <div className="premium-card overflow-hidden bg-white dark:bg-slate-900 border border-slate-200/50 dark:border-slate-800/40 shadow-soft">
              <div className="p-6 border-b border-slate-100 dark:border-slate-800/60">
                <h2 className="font-display font-bold text-base text-slate-900 dark:text-white">All Orders ({orders.length})</h2>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-slate-100 dark:border-slate-800/60 bg-slate-50/50 dark:bg-slate-900/50">
                      {['Order Reference', 'Customer Name', 'Items Bought', 'Total Payout', 'Shipping Status', 'Order Date'].map((h) => (
                        <th key={h} className="text-left px-6 py-4 text-xs font-bold text-slate-450 uppercase tracking-wider">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-850">
                    {orders.slice(0, 50).map((order) => (
                      <tr key={order._id} className="hover:bg-slate-50/50 dark:hover:bg-slate-850/30 transition-colors">
                        <td className="px-6 py-4 text-sm font-bold text-slate-900 dark:text-white font-mono">{order.orderNumber?.slice(-12).toUpperCase()}</td>
                        <td className="px-6 py-4 text-sm font-semibold text-slate-700 dark:text-slate-350">{order.user?.name}</td>
                        <td className="px-6 py-4 text-sm font-semibold text-slate-500">{order.items?.length} items</td>
                        <td className="px-6 py-4 text-sm font-extrabold text-slate-950 dark:text-white">${order.total?.toFixed(2)}</td>
                        <td className="px-6 py-4">
                          <span className={`badge capitalize text-[9px] font-extrabold px-2.5 py-0.5 border rounded-full ${STATUS_COLORS[order.orderStatus] || 'bg-slate-100'}`}>
                            {order.orderStatus}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-xs text-slate-400 font-semibold">{new Date(order.createdAt).toLocaleDateString(undefined, { dateStyle: 'medium' })}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* REVIEWS TAB */}
          {tab === 'reviews' && (
            <div className="premium-card overflow-hidden bg-white dark:bg-slate-900 border border-slate-200/50 dark:border-slate-800/40 shadow-soft">
              <div className="p-6 border-b border-slate-100 dark:border-slate-800/60">
                <h2 className="font-display font-bold text-base text-slate-900 dark:text-white">Review Moderation Console ({reviews.length})</h2>
              </div>
              <div className="divide-y divide-slate-100 dark:divide-slate-850">
                {reviews.length === 0 ? (
                  <div className="text-center py-16 text-slate-400">
                    <Star size={48} className="mx-auto mb-4 opacity-30 text-amber-400" />
                    <p className="font-bold text-sm">No client reviews registered yet</p>
                  </div>
                ) : reviews.map((review) => (
                  <div key={review._id} className="p-6 flex gap-4 hover:bg-slate-50/50 dark:hover:bg-slate-850/30 transition-colors">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="font-bold text-sm text-slate-900 dark:text-white leading-none">{review.user?.name}</span>
                        <div className="flex text-amber-400 text-sm">
                          {[1,2,3,4,5].map((s) => <span key={s} className="text-[15px]">{s <= review.rating ? '★' : '☆'}</span>)}
                        </div>
                        {review.isVerifiedPurchase && (
                          <span className="badge bg-green-50 text-green-600 border-green-250/20 text-[9px] font-bold px-2 py-0.5">
                            Verified Purchase
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] font-bold text-slate-450 mb-2">
                        Product: <span className="text-primary font-bold">{review.product?.name}</span>
                      </p>
                      <p className="text-sm text-slate-600 dark:text-slate-350 leading-relaxed font-semibold">"{review.comment}"</p>
                    </div>
                    
                    <button 
                      onClick={() => handleDeleteReview(review._id)} 
                      className="text-slate-400 hover:text-rose-500 transition-colors shrink-0 p-1 hover:bg-rose-50 rounded-lg h-fit duration-200"
                      aria-label="Delete Review"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* CATEGORIES TAB */}
          {tab === 'categories' && (
            <div className="space-y-8">
              
              {/* Add Category Form */}
              <div className="premium-card p-6 bg-white dark:bg-slate-900 border border-slate-200/50 dark:border-slate-800/40 shadow-soft">
                <h2 className="font-display font-bold text-base text-slate-900 dark:text-white mb-5">Create New Category</h2>
                <div className="grid sm:grid-cols-3 gap-6 items-end">
                  <div>
                    <label className="block text-xs font-bold text-slate-450 uppercase tracking-wider mb-2">Icon (emoji)</label>
                    <input value={catForm.icon} onChange={(e) => setCatForm({ ...catForm, icon: e.target.value })} className="input" placeholder="🛍️" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-450 uppercase tracking-wider mb-2">Category Name *</label>
                    <input value={catForm.name} onChange={(e) => setCatForm({ ...catForm, name: e.target.value })} className="input" placeholder="Electronics" />
                  </div>
                  <button onClick={handleCreateCategory} className="btn-primary w-full !py-3.5">
                    Create New Category
                  </button>
                </div>
              </div>

              {/* Categories Catalog */}
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6">
                {categories.map((cat) => (
                  <div key={cat._id} className="premium-card p-5 bg-white dark:bg-slate-900 border border-slate-200/50 dark:border-slate-800/40 shadow-soft flex items-center justify-between hover:border-rose-100 group">
                    <div className="flex items-center gap-3 min-w-0">
                      <span className="text-2xl shrink-0 select-none bg-slate-50 dark:bg-slate-950 w-12 h-12 rounded-xl flex items-center justify-center border border-slate-200/40">{cat.icon}</span>
                      <p className="font-bold text-sm text-slate-900 dark:text-white truncate">{cat.name}</p>
                    </div>
                    <button 
                      onClick={() => handleDeleteCategory(cat._id)} 
                      className="text-slate-450 hover:text-rose-500 transition-colors shrink-0 p-1.5 hover:bg-rose-50 dark:hover:bg-rose-950/20 rounded-lg duration-200"
                      aria-label="Delete category"
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                ))}
              </div>

            </div>
          )}
        </div>
      </div>
      <Footer />
    </div>
  );
}
