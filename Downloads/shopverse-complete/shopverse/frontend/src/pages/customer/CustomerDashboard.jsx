import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { motion } from 'framer-motion';
import { Package, Heart, ShoppingBag, TrendingUp, Eye, Clock, ArrowRight } from 'lucide-react';
import api from '../../api/axios';
import Navbar from '../../components/layout/Navbar';
import Footer from '../../components/layout/Footer';

const STATUS_COLORS = {
  pending: 'bg-amber-50 text-amber-600 border-amber-250/20 dark:bg-amber-950/30 dark:text-amber-400 dark:border-amber-800/20',
  confirmed: 'bg-blue-50 text-blue-600 border-blue-250/20 dark:bg-blue-950/30 dark:text-blue-400 dark:border-blue-800/20',
  processing: 'bg-purple-50 text-purple-600 border-purple-250/20 dark:bg-purple-950/30 dark:text-purple-400 dark:border-purple-800/20',
  shipped: 'bg-orange-50 text-orange-600 border-orange-250/20 dark:bg-orange-950/30 dark:text-orange-400 dark:border-orange-800/20',
  delivered: 'bg-emerald-50 text-emerald-600 border-emerald-250/20 dark:bg-emerald-950/30 dark:text-emerald-400 dark:border-emerald-800/20',
  cancelled: 'bg-rose-50 text-rose-600 border-rose-250/20 dark:bg-rose-950/30 dark:text-rose-400 dark:border-rose-800/20',
};

export default function CustomerDashboard() {
  const { user } = useSelector((s) => s.auth);
  const wishlistCount = useSelector((s) => s.wishlist.products.length);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/orders')
      .then(({ data }) => setOrders(data.orders || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const stats = [
    { label: 'Total Orders', value: orders.length, icon: Package, color: 'from-blue-500 to-indigo-500', iconColor: 'text-blue-500', href: '#orders' },
    { label: 'Delivered', value: orders.filter((o) => o.orderStatus === 'delivered').length, icon: TrendingUp, color: 'from-emerald-500 to-teal-500', iconColor: 'text-emerald-500', href: '#orders' },
    { label: 'Wishlist Items', value: wishlistCount, icon: Heart, color: 'from-rose-500 to-pink-500', iconColor: 'text-rose-500', href: '/wishlist' },
    { label: 'Total Spent', value: `$${orders.reduce((s, o) => s + (o.total || 0), 0).toFixed(2)}`, icon: ShoppingBag, color: 'from-amber-500 to-orange-500', iconColor: 'text-amber-500', href: '#orders' },
  ];

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 transition-colors duration-300">
      <Navbar />
      <div className="pt-20">
        
        {/* Header Banner */}
        <div className="relative bg-gradient-to-r from-slate-900 to-slate-950 py-16 overflow-hidden border-b border-slate-200/10 dark:border-slate-800/10 mb-10">
          <div className="absolute inset-0 bg-grid-pattern opacity-10" />
          <div className="absolute -top-32 -right-32 w-80 h-80 bg-primary/10 rounded-full blur-[100px]" />
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5">
              <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-white font-display font-extrabold text-3xl shadow-glow">
                {user?.name?.[0]?.toUpperCase()}
              </div>
              <div className="space-y-1.5">
                <h1 className="font-display font-extrabold text-3xl sm:text-4xl text-white tracking-tight leading-none">
                  Welcome back, {user?.name?.split(' ')[0]}!
                </h1>
                <p className="text-slate-400 font-medium text-sm sm:text-base">
                  Track orders, manage your profile details, and review wishlist items.
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-20">
          
          {/* Stats Grid */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
            {stats.map((stat, i) => {
              const Icon = stat.icon;
              return (
                <motion.div
                  key={stat.label}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.08, duration: 0.5, ease: 'easeOut' }}
                >
                  <a href={stat.href} className="premium-card p-6 bg-white dark:bg-slate-900 border border-slate-200/50 dark:border-slate-800/40 shadow-soft flex items-center gap-5 hover:border-primary/30 block">
                    <div className={`w-14 h-14 rounded-2xl bg-slate-50 dark:bg-slate-950 flex items-center justify-center border border-slate-100 dark:border-slate-800 shrink-0`}>
                      <Icon size={22} className={stat.iconColor} />
                    </div>
                    <div className="min-w-0">
                      <p className="text-slate-400 text-xs font-bold uppercase tracking-wider mb-1 truncate">{stat.label}</p>
                      <p className="font-display font-extrabold text-2xl text-slate-900 dark:text-white leading-none tracking-tight">{stat.value}</p>
                    </div>
                  </a>
                </motion.div>
              );
            })}
          </div>

          {/* Orders Section */}
          <div id="orders" className="premium-card bg-white dark:bg-slate-900 border border-slate-200/50 dark:border-slate-800/40 shadow-soft overflow-hidden mb-8">
            <div className="p-6 border-b border-slate-100 dark:border-slate-800/60 flex items-center justify-between">
              <h2 className="font-display font-bold text-lg text-slate-900 dark:text-white">Recent Orders</h2>
              <span className="badge bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-350 text-xs font-bold px-3 py-1">
                {orders.length} Total
              </span>
            </div>

            {loading ? (
              <div className="p-6 space-y-4">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="h-16 w-full rounded-2xl bg-slate-100 dark:bg-slate-800 animate-pulse" />
                ))}
              </div>
            ) : orders.length === 0 ? (
              <div className="p-16 text-center max-w-sm mx-auto">
                <div className="w-16 h-16 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center mx-auto mb-6">
                  <Package size={28} className="text-slate-400" />
                </div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">No Orders Placed Yet</h3>
                <p className="text-slate-500 dark:text-slate-400 text-sm mb-6">Browse our product catalog to make your first purchase.</p>
                <Link to="/products" className="btn-primary inline-flex items-center gap-2">
                  <ShoppingBag size={16} /> Start Shopping <ArrowRight size={14} />
                </Link>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-slate-100 dark:border-slate-800/60 bg-slate-50/50 dark:bg-slate-900/50">
                      <th className="text-left px-6 py-4 text-xs font-bold text-slate-450 uppercase tracking-wider">Order Reference</th>
                      <th className="text-left px-6 py-4 text-xs font-bold text-slate-450 uppercase tracking-wider hidden md:table-cell">Purchase Date</th>
                      <th className="text-left px-6 py-4 text-xs font-bold text-slate-450 uppercase tracking-wider">Status</th>
                      <th className="text-right px-6 py-4 text-xs font-bold text-slate-450 uppercase tracking-wider">Total Value</th>
                      <th className="px-6 py-4" />
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-850">
                    {orders.map((order) => (
                      <tr key={order._id} className="hover:bg-slate-50/50 dark:hover:bg-slate-850/30 transition-colors">
                        <td className="px-6 py-4.5">
                          <div>
                            <p className="font-bold text-sm text-slate-900 dark:text-white font-mono">{order.orderNumber}</p>
                            <p className="text-xs text-slate-400 dark:text-slate-500 mt-1 font-semibold">
                              {order.items?.length} item{order.items?.length !== 1 ? 's' : ''} in shipment
                            </p>
                          </div>
                        </td>
                        <td className="px-6 py-4.5 hidden md:table-cell">
                          <span className="text-sm font-semibold text-slate-500 dark:text-slate-450 flex items-center gap-1.5">
                            <Clock size={14} className="text-slate-400" /> 
                            {new Date(order.createdAt).toLocaleDateString(undefined, { dateStyle: 'medium' })}
                          </span>
                        </td>
                        <td className="px-6 py-4.5">
                          <span className={`badge capitalize text-[10px] font-extrabold px-3 py-1 border rounded-full ${STATUS_COLORS[order.orderStatus] || 'bg-slate-100 text-slate-700'}`}>
                            {order.orderStatus}
                          </span>
                        </td>
                        <td className="px-6 py-4.5 text-right font-extrabold text-slate-950 dark:text-white">
                          ${order.total?.toFixed(2)}
                        </td>
                        <td className="px-6 py-4.5">
                          <Link to={`/orders/${order._id}`}
                            className="inline-flex items-center gap-1.5 text-xs font-bold text-primary hover:underline">
                            <Eye size={14} /> Track Order
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Quick Actions Panel */}
          <div className="space-y-4">
            <h3 className="font-bold text-xs uppercase tracking-wider text-slate-400">Quick Actions</h3>
            <div className="grid sm:grid-cols-3 gap-6">
              {[
                { to: '/products', label: 'Continue Shopping', icon: ShoppingBag, color: 'text-blue-500', bg: 'hover:border-blue-200/50 dark:hover:border-blue-900/30' },
                { to: '/wishlist', label: 'View Wishlist', icon: Heart, color: 'text-rose-500', bg: 'hover:border-rose-200/50 dark:hover:border-rose-900/30' },
                { to: '/profile', label: 'Edit Account Profile', icon: Package, color: 'text-violet-550', bg: 'hover:border-violet-200/50 dark:hover:border-violet-900/30' },
              ].map(({ to, label, icon: Icon, color, bg }) => (
                <Link key={to} to={to} className={`premium-card p-5 bg-white dark:bg-slate-900 border border-slate-200/50 dark:border-slate-800/40 shadow-soft flex items-center gap-4 transition-all duration-300 ${bg}`}>
                  <div className="w-11 h-11 rounded-xl bg-slate-50 dark:bg-slate-950 flex items-center justify-center border border-slate-100 dark:border-slate-800 shrink-0">
                    <Icon size={18} className={color} />
                  </div>
                  <span className="font-bold text-sm text-slate-800 dark:text-slate-200">{label}</span>
                </Link>
              ))}
            </div>
          </div>

        </div>
      </div>
      <Footer />
    </div>
  );
}
