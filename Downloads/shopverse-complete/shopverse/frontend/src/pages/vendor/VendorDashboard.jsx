import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { motion } from 'framer-motion';
import {
  DollarSign, Package, ShoppingBag, TrendingUp, Plus, Edit,
  Trash2, Eye, BarChart3, AlertTriangle, Check, X, Loader2
} from 'lucide-react';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Legend
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

// Monthly mock data for chart when API data isn't available
const MOCK_MONTHLY = [
  { month: 'Jan', revenue: 1200, orders: 15 },
  { month: 'Feb', revenue: 1800, orders: 22 },
  { month: 'Mar', revenue: 1400, orders: 18 },
  { month: 'Apr', revenue: 2400, orders: 31 },
  { month: 'May', revenue: 3100, orders: 42 },
  { month: 'Jun', revenue: 2800, orders: 36 },
];

export default function VendorDashboard() {
  const { user } = useSelector((s) => s.auth);
  const navigate = useNavigate();
  const [tab, setTab] = useState('overview');
  const [vendorData, setVendorData] = useState(null);
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showProductForm, setShowProductForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [categories, setCategories] = useState([]);
  const [productForm, setProductForm] = useState({
    name: '', description: '', price: '', discountPrice: '',
    stock: '', brand: '', category: '', images: [''], isFeatured: false,
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (user?.role !== 'vendor') { navigate('/dashboard'); return; }
    fetchAll();
  }, [user]);

  const fetchAll = async () => {
    setLoading(true);
    try {
      const [vendorRes, prodRes, ordRes, catRes] = await Promise.all([
        api.get('/vendors/me'),
        api.get(`/products?vendor=${user._id}&limit=100`),
        api.get('/orders'),
        api.get('/categories'),
      ]);
      setVendorData(vendorRes.data);
      setProducts(prodRes.data.products || []);
      setOrders(ordRes.data.orders || []);
      setCategories(catRes.data.categories || []);
    } catch (err) {
      toast.error('Failed to load vendor data');
    } finally {
      setLoading(false);
    }
  };

  const handleProductSave = async () => {
    if (!productForm.name || !productForm.price || !productForm.category) {
      return toast.error('Please fill required fields');
    }
    setSaving(true);
    try {
      const payload = {
        ...productForm,
        price: parseFloat(productForm.price),
        discountPrice: productForm.discountPrice ? parseFloat(productForm.discountPrice) : null,
        stock: parseInt(productForm.stock) || 0,
        images: productForm.images.filter(Boolean),
      };
      if (editingProduct) {
        await api.put(`/products/${editingProduct._id}`, payload);
        toast.success('Product updated!');
      } else {
        await api.post('/products', payload);
        toast.success('Product created!');
      }
      setShowProductForm(false);
      setEditingProduct(null);
      resetForm();
      fetchAll();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save product');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteProduct = async (id) => {
    if (!confirm('Delete this product?')) return;
    try {
      await api.delete(`/products/${id}`);
      toast.success('Product deleted');
      setProducts(products.filter((p) => p._id !== id));
    } catch {
      toast.error('Failed to delete');
    }
  };

  const handleEditProduct = (product) => {
    setEditingProduct(product);
    setProductForm({
      name: product.name, description: product.description,
      price: product.price, discountPrice: product.discountPrice || '',
      stock: product.stock, brand: product.brand || '',
      category: product.category?._id || '', images: product.images?.length ? product.images : [''],
      isFeatured: product.isFeatured || false,
    });
    setShowProductForm(true);
  };

  const handleOrderStatus = async (orderId, status) => {
    try {
      await api.put(`/orders/${orderId}/status`, { orderStatus: status });
      toast.success('Order status updated');
      fetchAll();
    } catch {
      toast.error('Failed to update');
    }
  };

  const resetForm = () => setProductForm({
    name: '', description: '', price: '', discountPrice: '',
    stock: '', brand: '', category: '', images: [''], isFeatured: false,
  });

  const analytics = vendorData?.analytics || {};
  const revenue = analytics.totalRevenue || 0;
  const totalOrders = analytics.totalOrders || 0;
  const totalProducts = analytics.totalProducts || 0;

  const TABS = [
    { key: 'overview', label: 'Overview Analytics', icon: BarChart3 },
    { key: 'products', label: 'Manage Products', icon: Package },
    { key: 'orders', label: 'Client Orders', icon: ShoppingBag },
  ];

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 transition-colors duration-300">
      <Navbar />
      <div className="pt-20">
        
        {/* Header */}
        <div className="relative bg-gradient-to-r from-slate-900 to-slate-950 py-16 overflow-hidden border-b border-slate-200/10 dark:border-slate-800/10 mb-10">
          <div className="absolute inset-0 bg-grid-pattern opacity-10" />
          <div className="absolute -top-32 -right-32 w-80 h-80 bg-primary/10 rounded-full blur-[100px]" />
          
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
              <div className="flex items-center gap-5">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-white font-bold text-2xl shadow-glow shrink-0">
                  {user?.name?.[0]?.toUpperCase()}
                </div>
                <div className="space-y-1">
                  <h1 className="font-display font-extrabold text-2xl sm:text-3xl text-white tracking-tight leading-none">
                    Vendor Console
                  </h1>
                  <p className="text-slate-400 font-semibold text-sm">
                    Store: <span className="text-white">{vendorData?.vendor?.storeName || user?.name}</span>
                  </p>
                </div>
              </div>

              {!vendorData?.vendor?.isApproved && (
                <div className="inline-flex items-center gap-2 bg-amber-500/10 border border-amber-500/20 rounded-2xl px-4 py-2.5 shadow-glass animate-pulse self-start sm:self-center">
                  <AlertTriangle size={16} className="text-amber-400" />
                  <span className="text-amber-300 text-xs font-bold uppercase tracking-wider">Pending Shop Approval</span>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-20">
          
          {/* Tab Navigation */}
          <div className="flex gap-1.5 bg-slate-200/60 p-1.5 rounded-2xl mb-10 w-fit dark:bg-slate-900/60 backdrop-blur border border-slate-200/30 dark:border-slate-800/40">
            {TABS.map(({ key, label, icon: Icon }) => (
              <button 
                key={key} 
                onClick={() => setTab(key)}
                className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold transition-all duration-300 ${
                  tab === key 
                    ? 'bg-white dark:bg-slate-800 text-primary dark:text-white shadow-premium' 
                    : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
                }`}
              >
                <Icon size={14} className="stroke-[2.2]" /> {label}
              </button>
            ))}
          </div>

          {/* OVERVIEW TAB */}
          {tab === 'overview' && (
            <div className="space-y-8">
              
              {/* Stats Summary Grid */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
                {[
                  { label: 'Total Sales Revenue', value: `$${revenue.toFixed(2)}`, icon: DollarSign, color: 'text-blue-500', bg: 'from-blue-500 to-indigo-500' },
                  { label: 'Orders Completed', value: totalOrders, icon: ShoppingBag, color: 'text-emerald-500', bg: 'from-emerald-500 to-teal-500' },
                  { label: 'Listed Inventory', value: totalProducts, icon: Package, color: 'text-orange-500', bg: 'from-orange-500 to-amber-500' },
                  { label: 'Average Ticket Value', value: totalOrders ? `$${(revenue / totalOrders).toFixed(2)}` : '$0.00', icon: TrendingUp, color: 'text-purple-500', bg: 'from-purple-500 to-secondary' },
                ].map((stat, i) => {
                  const Icon = stat.icon;
                  return (
                    <motion.div 
                      key={stat.label} 
                      initial={{ opacity: 0, y: 20 }} 
                      animate={{ opacity: 1, y: 0 }} 
                      transition={{ delay: i * 0.08, duration: 0.5 }}
                      className="premium-card p-6 bg-white dark:bg-slate-900 border border-slate-200/50 dark:border-slate-800/40 shadow-soft"
                    >
                      <div className="flex items-center justify-between mb-4">
                        <p className="text-slate-400 text-xs font-bold uppercase tracking-wider truncate">{stat.label}</p>
                        <div className="w-10 h-10 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800 flex items-center justify-center shrink-0">
                          <Icon size={18} className={stat.color} />
                        </div>
                      </div>
                      <p className="font-display font-extrabold text-2xl text-slate-950 dark:text-white leading-none tracking-tight">
                        {stat.value}
                      </p>
                    </motion.div>
                  );
                })}
              </div>

              {/* Revenue Line Chart */}
              <div className="premium-card p-6 bg-white dark:bg-slate-900 border border-slate-200/50 dark:border-slate-800/40 shadow-soft">
                <h2 className="font-display font-bold text-base text-slate-900 dark:text-white mb-6">Revenue & Order Analytics</h2>
                <div className="w-full h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={MOCK_MONTHLY} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                      <XAxis dataKey="month" tick={{ fontSize: 11, fontWeight: '600', fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                      <YAxis tick={{ fontSize: 11, fontWeight: '600', fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: '#0f172a', 
                          borderColor: '#1e293b', 
                          borderRadius: '16px',
                          color: '#fff',
                          fontSize: '12px',
                          fontWeight: '600',
                          boxShadow: '0 10px 30px rgba(0,0,0,0.15)'
                        }}
                      />
                      <Legend verticalAlign="top" height={36} iconType="circle" wrapperStyle={{ fontSize: '11px', fontWeight: 'bold' }} />
                      <Line type="monotone" dataKey="revenue" stroke="#3b82f6" strokeWidth={3} activeDot={{ r: 6 }} dot={{ fill: '#3b82f6', r: 4 }} name="Revenue ($)" />
                      <Line type="monotone" dataKey="orders" stroke="#8b5cf6" strokeWidth={3.5} activeDot={{ r: 5 }} dot={{ fill: '#8b5cf6', r: 3 }} name="Orders" />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Top Selling Products */}
              {products.length > 0 && (
                <div className="premium-card overflow-hidden bg-white dark:bg-slate-900 border border-slate-200/50 dark:border-slate-800/40 shadow-soft">
                  <div className="p-6 border-b border-slate-100 dark:border-slate-800/60">
                    <h2 className="font-display font-bold text-base text-slate-900 dark:text-white">Top Sales Products</h2>
                  </div>
                  <div className="divide-y divide-slate-100 dark:divide-slate-850">
                    {products.slice(0, 5).map((product) => (
                      <div key={product._id} className="flex items-center gap-4 p-5 hover:bg-slate-50/50 dark:hover:bg-slate-850/30 transition-colors">
                        <img 
                          src={product.images?.[0] || `https://placehold.co/48x48/3b82f6/fff?text=P`}
                          alt={product.name} 
                          className="w-12 h-12 rounded-xl object-cover bg-slate-100 dark:bg-slate-950 border border-slate-200/40 dark:border-slate-800/40 shrink-0"
                          onError={(e) => e.target.src = 'https://placehold.co/48x48/3b82f6/fff?text=P'} 
                        />
                        <div className="flex-1 min-w-0">
                          <p className="font-bold text-sm text-slate-900 dark:text-white truncate">{product.name}</p>
                          <p className="text-xs text-slate-400 mt-1 font-semibold">Stock: {product.stock} units left • Sold: {product.soldCount || 0} times</p>
                        </div>
                        <span className="font-extrabold text-sm text-slate-950 dark:text-white">${(product.discountPrice || product.price).toFixed(2)}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* PRODUCTS TAB */}
          {tab === 'products' && (
            <div>
              <div className="flex items-center justify-between mb-8">
                <h2 className="font-display font-bold text-lg text-slate-900 dark:text-white">My Shop Listings ({products.length})</h2>
                <button 
                  onClick={() => { resetForm(); setEditingProduct(null); setShowProductForm(true); }}
                  className="btn-primary !py-2.5 !px-5 text-sm"
                >
                  <Plus size={16} className="stroke-[2.2]" /> Add New Product
                </button>
              </div>

              {/* Product Form Modal */}
              {showProductForm && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                  <motion.div 
                    initial={{ opacity: 0, scale: 0.95 }} 
                    animate={{ opacity: 1, scale: 1 }}
                    className="bg-white dark:bg-slate-900 rounded-[32px] border border-slate-200/40 dark:border-slate-800/40 p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto shadow-2xl space-y-6"
                  >
                    <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
                      <h3 className="font-display font-bold text-lg text-slate-950 dark:text-white">
                        {editingProduct ? 'Edit Product Catalog' : 'Add New Catalog Item'}
                      </h3>
                      <button 
                        onClick={() => { setShowProductForm(false); setEditingProduct(null); }}
                        className="text-slate-400 hover:text-slate-600 transition-colors"
                      >
                        <X size={20} />
                      </button>
                    </div>
                    
                    <div className="space-y-4">
                      <div>
                        <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Product Name *</label>
                        <input value={productForm.name} onChange={(e) => setProductForm({ ...productForm, name: e.target.value })} className="input" placeholder="iPhone 15 Pro Max" />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Description *</label>
                        <textarea value={productForm.description} onChange={(e) => setProductForm({ ...productForm, description: e.target.value })} className="input resize-none" rows={3} placeholder="Describe product specs and details..." />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Price ($) *</label>
                          <input type="number" value={productForm.price} onChange={(e) => setProductForm({ ...productForm, price: e.target.value })} className="input" placeholder="99.99" min="0" step="0.01" />
                        </div>
                        <div>
                          <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Sale Price ($)</label>
                          <input type="number" value={productForm.discountPrice} onChange={(e) => setProductForm({ ...productForm, discountPrice: e.target.value })} className="input" placeholder="79.99" min="0" step="0.01" />
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Stock Inventory *</label>
                          <input type="number" value={productForm.stock} onChange={(e) => setProductForm({ ...productForm, stock: e.target.value })} className="input" placeholder="100" min="0" />
                        </div>
                        <div>
                          <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Brand</label>
                          <input value={productForm.brand} onChange={(e) => setProductForm({ ...productForm, brand: e.target.value })} className="input" placeholder="Apple" />
                        </div>
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Category *</label>
                        <div className="relative">
                          <select value={productForm.category} onChange={(e) => setProductForm({ ...productForm, category: e.target.value })} className="input appearance-none cursor-pointer">
                            <option value="">Select Category</option>
                            {categories.map((c) => <option key={c._id} value={c._id}>{c.icon} {c.name}</option>)}
                          </select>
                          <ChevronDown size={16} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                        </div>
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Image URL</label>
                        <input value={productForm.images[0]} onChange={(e) => setProductForm({ ...productForm, images: [e.target.value] })} className="input" placeholder="https://example.com/image.jpg" />
                      </div>
                      <label className="flex items-center gap-3 cursor-pointer group text-slate-700 dark:text-slate-350">
                        <input type="checkbox" checked={productForm.isFeatured} onChange={(e) => setProductForm({ ...productForm, isFeatured: e.target.checked })} className="w-4.5 h-4.5 rounded text-primary focus:ring-primary/25 cursor-pointer" />
                        <span className="text-sm font-semibold group-hover:text-primary transition-colors">Mark as Featured Listing</span>
                      </label>
                    </div>

                    <div className="flex gap-4 pt-4 border-t border-slate-100 dark:border-slate-800">
                      <button onClick={() => { setShowProductForm(false); setEditingProduct(null); }} className="btn-outline flex-1">Cancel</button>
                      <button onClick={handleProductSave} disabled={saving} className="btn-primary flex-1 flex items-center justify-center gap-2">
                        {saving ? <Loader2 size={16} className="animate-spin" /> : <Check size={16} />}
                        {saving ? 'Saving...' : editingProduct ? 'Update Info' : 'Publish Item'}
                      </button>
                    </div>
                  </motion.div>
                </div>
              )}

              {/* Products Listing Grid */}
              {loading ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {[...Array(6)].map((_, i) => <div key={i} className="h-48 w-full bg-slate-100 dark:bg-slate-900 rounded-3xl animate-pulse" />)}
                </div>
              ) : products.length === 0 ? (
                <div className="text-center py-24 premium-card max-w-lg mx-auto p-10 bg-white">
                  <div className="w-16 h-16 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center mx-auto mb-6">
                    <Package size={28} className="text-slate-400" />
                  </div>
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">No Products Listed Yet</h3>
                  <p className="text-slate-500 dark:text-slate-400 text-sm mb-6">Create your catalog inventory listing to start sales transactions.</p>
                  <button onClick={() => { resetForm(); setShowProductForm(true); }} className="btn-primary inline-flex items-center gap-2">
                    <Plus size={16} /> Add First Product
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {products.map((product) => (
                    <div key={product._id} className="premium-card overflow-hidden bg-white dark:bg-slate-900 border border-slate-200/50 dark:border-slate-800/40 shadow-soft group flex flex-col justify-between">
                      <div className="relative aspect-video overflow-hidden bg-slate-100 dark:bg-slate-950 flex items-center justify-center">
                        <img 
                          src={product.images?.[0] || `https://placehold.co/300x200/3b82f6/fff?text=P`}
                          alt={product.name} 
                          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-103"
                          onError={(e) => e.target.src = 'https://placehold.co/300x200/3b82f6/fff?text=P'} 
                        />
                        <div className="absolute top-3 left-3 flex flex-col gap-1.5">
                          {product.isFeatured && <span className="badge bg-amber-500 text-white font-extrabold text-[9px] px-2 py-0.5 shadow-soft">Featured</span>}
                          <span className={`badge font-extrabold text-[9px] px-2 py-0.5 border ${
                            product.stock > 0 ? 'bg-emerald-50 text-emerald-600 border-emerald-250/20' : 'bg-rose-50 text-rose-600 border-rose-250/20'
                          }`}>
                            {product.stock > 0 ? `${product.stock} Units` : 'Out of stock'}
                          </span>
                        </div>
                      </div>
                      <div className="p-5 flex-1 flex flex-col justify-between">
                        <div>
                          <h3 className="font-bold text-sm text-slate-900 dark:text-white line-clamp-1 mb-1 leading-snug">{product.name}</h3>
                          <p className="text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-4">
                            {product.category?.name || 'Uncategorized'} • Sold: {product.soldCount || 0}
                          </p>
                        </div>
                        <div className="flex items-center justify-between pt-3 border-t border-slate-100/60 dark:border-slate-850">
                          <div>
                            <span className="font-extrabold text-base text-slate-950 dark:text-white">${(product.discountPrice || product.price).toFixed(2)}</span>
                            {product.discountPrice && <span className="text-xs font-bold text-slate-400 line-through ml-2">${product.price.toFixed(2)}</span>}
                          </div>
                          <div className="flex gap-1">
                            <Link to={`/products/${product._id}`} className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 transition-colors">
                              <Eye size={15} />
                            </Link>
                            <button onClick={() => handleEditProduct(product)} className="p-2 rounded-lg hover:bg-primary/10 text-primary transition-colors">
                              <Edit size={15} />
                            </button>
                            <button onClick={() => handleDeleteProduct(product._id)} className="p-2 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-900/25 text-rose-500 transition-colors">
                              <Trash2 size={15} />
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* ORDERS TAB */}
          {tab === 'orders' && (
            <div className="premium-card overflow-hidden bg-white dark:bg-slate-900 border border-slate-200/50 dark:border-slate-800/40 shadow-soft">
              <div className="p-6 border-b border-slate-100 dark:border-slate-800/60 flex justify-between items-center">
                <h2 className="font-display font-bold text-base text-slate-900 dark:text-white">Customer Orders ({orders.length})</h2>
                <span className="badge bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-350 text-xs font-bold px-3 py-1">
                  Recent Activity
                </span>
              </div>
              {orders.length === 0 ? (
                <div className="text-center py-20 text-slate-400">
                  <ShoppingBag size={48} className="mx-auto mb-4 opacity-30" />
                  <p className="font-bold text-sm">No client purchases yet</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-slate-100 dark:border-slate-800/60 bg-slate-50/50 dark:bg-slate-900/50">
                        {['Order #', 'Customer Name', 'Items Bought', 'Total Payout', 'Shipping Status', 'Order Date', 'Update Status'].map((h) => (
                          <th key={h} className="text-left px-6 py-4 text-xs font-bold text-slate-450 uppercase tracking-wider">{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-850">
                      {orders.map((order) => (
                        <tr key={order._id} className="hover:bg-slate-50/50 dark:hover:bg-slate-850/30 transition-colors">
                          <td className="px-6 py-4 text-sm font-bold text-slate-900 dark:text-white font-mono">{order.orderNumber?.slice(-8).toUpperCase()}</td>
                          <td className="px-6 py-4 text-sm font-semibold text-slate-700 dark:text-slate-300">{order.user?.name || 'Customer'}</td>
                          <td className="px-6 py-4 text-sm font-semibold text-slate-500">{order.items?.length} items</td>
                          <td className="px-6 py-4 text-sm font-extrabold text-slate-950 dark:text-white">${order.total?.toFixed(2)}</td>
                          <td className="px-6 py-4">
                            <span className={`badge capitalize text-[10px] font-extrabold px-3 py-1 border rounded-full ${STATUS_COLORS[order.orderStatus] || 'bg-slate-100 text-slate-700'}`}>
                              {order.orderStatus}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-xs text-slate-400 font-semibold">{new Date(order.createdAt).toLocaleDateString(undefined, { dateStyle: 'medium' })}</td>
                          <td className="px-6 py-4">
                            <div className="relative w-fit">
                              <select 
                                value={order.orderStatus}
                                onChange={(e) => handleOrderStatus(order._id, e.target.value)}
                                className="text-xs font-bold border border-slate-200 dark:border-slate-800 rounded-xl pr-7 pl-3 py-1.5 bg-white dark:bg-slate-950 text-slate-700 dark:text-slate-200 appearance-none cursor-pointer focus:ring-4 focus:ring-primary/10 outline-none"
                              >
                                {['pending','confirmed','processing','shipped','delivered','cancelled'].map((s) => (
                                  <option key={s} value={s}>{s}</option>
                                ))}
                              </select>
                              <ChevronDown size={12} className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
      <Footer />
    </div>
  );
}
