import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Package, CheckCircle, Truck, Home, XCircle, Clock, ArrowLeft } from 'lucide-react';
import api from '../api/axios';
import Navbar from '../components/layout/Navbar';

const STATUS_STEPS = [
  { key: 'pending', label: 'Order Placed', icon: Clock, color: 'text-amber-500' },
  { key: 'confirmed', label: 'Confirmed', icon: CheckCircle, color: 'text-blue-500' },
  { key: 'processing', label: 'Processing', icon: Package, color: 'text-purple-500' },
  { key: 'shipped', label: 'Shipped', icon: Truck, color: 'text-orange-500' },
  { key: 'delivered', label: 'Delivered', icon: Home, color: 'text-green-500' },
];

const STATUS_COLORS = {
  pending: 'bg-amber-100 text-amber-700 dark:bg-amber-900/20 dark:text-amber-400',
  confirmed: 'bg-blue-100 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400',
  processing: 'bg-purple-100 text-purple-700 dark:bg-purple-900/20 dark:text-purple-400',
  shipped: 'bg-orange-100 text-orange-700 dark:bg-orange-900/20 dark:text-orange-400',
  delivered: 'bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-400',
  cancelled: 'bg-red-100 text-red-700 dark:bg-red-900/20 dark:text-red-400',
};

export default function OrderTrackingPage() {
  const { id } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get(`/orders/${id}`)
      .then(({ data }) => setOrder(data.order))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return (
    <div className="min-h-screen dark:bg-gray-950">
      <Navbar />
      <div className="pt-32 max-w-3xl mx-auto px-4">
        {[...Array(4)].map((_, i) => <div key={i} className="skeleton h-20 rounded-xl mb-4" />)}
      </div>
    </div>
  );

  if (!order) return (
    <div className="min-h-screen dark:bg-gray-950">
      <Navbar />
      <div className="pt-32 text-center">
        <p className="text-gray-500">Order not found</p>
        <Link to="/dashboard" className="btn-primary inline-block mt-4">Back to Dashboard</Link>
      </div>
    </div>
  );

  const currentStepIndex = order.orderStatus === 'cancelled'
    ? -1
    : STATUS_STEPS.findIndex((s) => s.key === order.orderStatus);

  return (
    <div className="min-h-screen dark:bg-gray-950">
      <Navbar />
      <div className="pt-16">
        <div className="bg-gradient-to-r from-primary to-secondary py-12">
          <div className="max-w-3xl mx-auto px-4">
            <Link to="/dashboard" className="flex items-center gap-2 text-white/70 hover:text-white text-sm mb-4 transition-colors">
              <ArrowLeft size={16} /> Back to Orders
            </Link>
            <h1 className="font-display font-bold text-3xl text-white">Order Tracking</h1>
            <p className="text-white/70 mt-1">#{order.orderNumber}</p>
          </div>
        </div>

        <div className="max-w-3xl mx-auto px-4 py-10 space-y-6">
          {/* Status Badge */}
          <div className="card p-6 flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 mb-1">Current Status</p>
              <span className={`badge text-sm ${STATUS_COLORS[order.orderStatus] || ''}`}>
                {order.orderStatus.charAt(0).toUpperCase() + order.orderStatus.slice(1)}
              </span>
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-500 mb-1">Estimated Delivery</p>
              <p className="font-semibold text-gray-900 dark:text-white">
                {order.estimatedDelivery ? new Date(order.estimatedDelivery).toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' }) : 'TBD'}
              </p>
            </div>
          </div>

          {/* Progress Timeline */}
          {order.orderStatus !== 'cancelled' ? (
            <div className="card p-6">
              <h2 className="font-semibold text-gray-900 dark:text-white mb-8">Delivery Progress</h2>
              <div className="relative">
                {/* Progress Line */}
                <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-gray-100 dark:bg-gray-800" />
                <div
                  className="absolute left-6 top-0 w-0.5 bg-gradient-to-b from-primary to-secondary transition-all duration-500"
                  style={{ height: `${currentStepIndex >= 0 ? (currentStepIndex / (STATUS_STEPS.length - 1)) * 100 : 0}%` }}
                />

                <div className="space-y-8">
                  {STATUS_STEPS.map((step, i) => {
                    const Icon = step.icon;
                    const isDone = i <= currentStepIndex;
                    const isCurrent = i === currentStepIndex;
                    const histEntry = order.statusHistory?.find((h) => h.status === step.key);
                    return (
                      <motion.div
                        key={step.key}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.1 }}
                        className="flex items-start gap-5 relative pl-14"
                      >
                        <div className={`absolute left-0 w-12 h-12 rounded-2xl flex items-center justify-center shadow-sm transition-all ${
                          isDone
                            ? 'bg-gradient-to-br from-primary to-secondary text-white shadow-primary/25'
                            : 'bg-gray-100 dark:bg-gray-800 text-gray-400'
                        } ${isCurrent ? 'scale-110 shadow-lg' : ''}`}>
                          <Icon size={20} />
                        </div>
                        <div className="flex-1 pt-2">
                          <div className="flex items-center gap-2">
                            <p className={`font-semibold ${isDone ? 'text-gray-900 dark:text-white' : 'text-gray-400'}`}>{step.label}</p>
                            {isCurrent && <span className="badge bg-primary/10 text-primary text-xs">Current</span>}
                          </div>
                          {histEntry && (
                            <>
                              {histEntry.note && <p className="text-sm text-gray-500 mt-0.5">{histEntry.note}</p>}
                              <p className="text-xs text-gray-400 mt-1">{new Date(histEntry.updatedAt).toLocaleString()}</p>
                            </>
                          )}
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              </div>
            </div>
          ) : (
            <div className="card p-6 flex items-center gap-4 border-red-200 dark:border-red-800">
              <div className="w-12 h-12 bg-red-100 dark:bg-red-900/20 rounded-2xl flex items-center justify-center">
                <XCircle size={24} className="text-red-500" />
              </div>
              <div>
                <p className="font-semibold text-gray-900 dark:text-white">Order Cancelled</p>
                <p className="text-sm text-gray-500">This order has been cancelled. Refund will be processed within 3-5 business days.</p>
              </div>
            </div>
          )}

          {/* Items */}
          <div className="card p-6">
            <h2 className="font-semibold text-gray-900 dark:text-white mb-4">Order Items</h2>
            <div className="space-y-4">
              {order.items.map((item, i) => (
                <div key={i} className="flex gap-4">
                  <img src={item.image || `https://placehold.co/60x60/6366F1/fff?text=P`} alt={item.name}
                    className="w-16 h-16 rounded-xl object-cover bg-gray-100"
                    onError={(e) => e.target.src = 'https://placehold.co/60x60/6366F1/fff?text=P'} />
                  <div className="flex-1">
                    <p className="font-medium text-sm text-gray-900 dark:text-white">{item.name}</p>
                    <p className="text-xs text-gray-400">Qty: {item.quantity}</p>
                  </div>
                  <span className="font-semibold text-gray-900 dark:text-white">${(item.price * item.quantity).toFixed(2)}</span>
                </div>
              ))}
            </div>
            <div className="border-t border-gray-100 dark:border-gray-800 mt-4 pt-4 space-y-2 text-sm">
              <div className="flex justify-between text-gray-500"><span>Subtotal</span><span>${order.subtotal?.toFixed(2)}</span></div>
              <div className="flex justify-between text-gray-500"><span>Shipping</span><span>{order.shippingFee === 0 ? 'FREE' : `$${order.shippingFee?.toFixed(2)}`}</span></div>
              {order.discount > 0 && <div className="flex justify-between text-green-600"><span>Discount</span><span>-${order.discount?.toFixed(2)}</span></div>}
              <div className="flex justify-between font-bold text-gray-900 dark:text-white text-base pt-2 border-t border-gray-100 dark:border-gray-800">
                <span>Total</span><span>${order.total?.toFixed(2)}</span>
              </div>
            </div>
          </div>

          {/* Shipping Address */}
          <div className="card p-6">
            <h2 className="font-semibold text-gray-900 dark:text-white mb-3">Shipping Address</h2>
            <div className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
              <p className="font-medium text-gray-900 dark:text-white">{order.shippingAddress?.fullName}</p>
              <p>{order.shippingAddress?.street}</p>
              <p>{order.shippingAddress?.city}, {order.shippingAddress?.state} {order.shippingAddress?.zipCode}</p>
              <p>{order.shippingAddress?.country}</p>
              <p>{order.shippingAddress?.phone}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
