import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { motion } from 'framer-motion';
import {
  Moon, Sun, Lock, Bell, Shield, Eye, EyeOff,
  Save, Loader2, CheckCircle, Smartphone, Mail
} from 'lucide-react';
import api from '../api/axios';
import Navbar from '../components/layout/Navbar';
import toast from 'react-hot-toast';

export default function SettingsPage() {
  const { user } = useSelector((s) => s.auth);
  const [darkMode, setDarkMode] = useState(() => localStorage.getItem('shopverse_dark') === 'true');
  const [passwords, setPasswords] = useState({ current: '', newPass: '', confirm: '' });
  const [showPw, setShowPw] = useState({ current: false, new: false, confirm: false });
  const [saving, setSaving] = useState(false);
  const [notifications, setNotifications] = useState({
    orderUpdates: true,
    newArrivals: false,
    promotions: true,
    reviews: true,
    stockAlerts: true,
    emailDigest: false,
  });

  useEffect(() => {
    document.documentElement.classList.toggle('dark', darkMode);
    localStorage.setItem('shopverse_dark', darkMode);
  }, [darkMode]);

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    if (passwords.newPass !== passwords.confirm) return toast.error('Passwords do not match');
    if (passwords.newPass.length < 6) return toast.error('Password must be at least 6 characters');
    setSaving(true);
    try {
      await api.put('/users/change-password', {
        currentPassword: passwords.current,
        newPassword: passwords.newPass,
      });
      toast.success('Password updated successfully!');
      setPasswords({ current: '', newPass: '', confirm: '' });
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update password');
    } finally {
      setSaving(false);
    }
  };

  const ToggleSwitch = ({ checked, onChange }) => (
    <button
      type="button"
      onClick={() => onChange(!checked)}
      className={`relative w-12 h-6 rounded-full transition-colors duration-200 focus:outline-none ${checked ? 'bg-primary' : 'bg-gray-200 dark:bg-gray-700'}`}
    >
      <span className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform duration-200 ${checked ? 'translate-x-6' : 'translate-x-0'}`} />
    </button>
  );

  const PwInput = ({ field, label, placeholder }) => (
    <div>
      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">{label}</label>
      <div className="relative">
        <input
          type={showPw[field] ? 'text' : 'password'}
          value={passwords[field === 'newPass' ? 'newPass' : field]}
          onChange={(e) => setPasswords({ ...passwords, [field === 'newPass' ? 'newPass' : field]: e.target.value })}
          className="input pr-11"
          placeholder={placeholder}
          required
        />
        <button type="button" onClick={() => setShowPw({ ...showPw, [field]: !showPw[field] })}
          className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
          {showPw[field] ? <EyeOff size={16} /> : <Eye size={16} />}
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen dark:bg-gray-950">
      <Navbar />
      <div className="pt-16">
        <div className="bg-gradient-to-r from-primary to-secondary py-12">
          <div className="max-w-2xl mx-auto px-4">
            <h1 className="font-display font-bold text-3xl text-white">Settings</h1>
            <p className="text-white/70 mt-1">Customize your ShopVerse experience</p>
          </div>
        </div>

        <div className="max-w-2xl mx-auto px-4 sm:px-6 py-10 space-y-6">

          {/* Appearance */}
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="card p-6">
            <h2 className="font-semibold text-gray-900 dark:text-white mb-5 flex items-center gap-2">
              {darkMode ? <Moon size={18} className="text-primary" /> : <Sun size={18} className="text-primary" />}
              Appearance
            </h2>
            <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800/60 rounded-xl">
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${darkMode ? 'bg-gray-900 border border-gray-700' : 'bg-white border border-gray-200 shadow-sm'}`}>
                  {darkMode ? <Moon size={18} className="text-primary" /> : <Sun size={18} className="text-amber-500" />}
                </div>
                <div>
                  <p className="font-medium text-sm text-gray-900 dark:text-white">Dark Mode</p>
                  <p className="text-xs text-gray-500">{darkMode ? 'Currently using dark theme' : 'Currently using light theme'}</p>
                </div>
              </div>
              <ToggleSwitch checked={darkMode} onChange={setDarkMode} />
            </div>
          </motion.div>

          {/* Change Password */}
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }} className="card p-6">
            <h2 className="font-semibold text-gray-900 dark:text-white mb-5 flex items-center gap-2">
              <Lock size={18} className="text-primary" /> Change Password
            </h2>
            <form onSubmit={handlePasswordChange} className="space-y-4">
              <PwInput field="current" label="Current Password" placeholder="Enter current password" />
              <PwInput field="newPass" label="New Password" placeholder="Min 6 characters" />
              <PwInput field="confirm" label="Confirm New Password" placeholder="Re-enter new password" />

              {passwords.newPass && passwords.confirm && (
                <div className={`flex items-center gap-2 text-sm ${passwords.newPass === passwords.confirm ? 'text-success' : 'text-red-500'}`}>
                  <CheckCircle size={14} />
                  {passwords.newPass === passwords.confirm ? 'Passwords match' : 'Passwords do not match'}
                </div>
              )}

              <button type="submit" disabled={saving || !passwords.current || !passwords.newPass || passwords.newPass !== passwords.confirm}
                className="btn-primary flex items-center gap-2">
                {saving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
                {saving ? 'Updating...' : 'Update Password'}
              </button>
            </form>
          </motion.div>

          {/* Notifications */}
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="card p-6">
            <h2 className="font-semibold text-gray-900 dark:text-white mb-5 flex items-center gap-2">
              <Bell size={18} className="text-primary" /> Notification Preferences
            </h2>
            <div className="space-y-1">
              {[
                { key: 'orderUpdates', icon: CheckCircle, label: 'Order Updates', desc: 'Status changes on your orders', color: 'text-green-500' },
                { key: 'newArrivals', icon: Smartphone, label: 'New Arrivals', desc: 'Products in categories you follow', color: 'text-blue-500' },
                { key: 'promotions', icon: Mail, label: 'Promotions & Deals', desc: 'Special offers and discounts', color: 'text-orange-500' },
                { key: 'reviews', icon: Bell, label: 'Review Responses', desc: 'When vendors respond to your reviews', color: 'text-purple-500' },
                { key: 'stockAlerts', icon: Shield, label: 'Back-in-Stock Alerts', desc: 'Wishlist items back in stock', color: 'text-red-500' },
                { key: 'emailDigest', icon: Mail, label: 'Weekly Email Digest', desc: 'Weekly summary of activity', color: 'text-cyan-500' },
              ].map(({ key, icon: Icon, label, desc, color }) => (
                <div key={key} className="flex items-center justify-between py-3.5 px-4 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                  <div className="flex items-center gap-3">
                    <Icon size={16} className={color} />
                    <div>
                      <p className="text-sm font-medium text-gray-900 dark:text-white">{label}</p>
                      <p className="text-xs text-gray-500">{desc}</p>
                    </div>
                  </div>
                  <ToggleSwitch
                    checked={notifications[key]}
                    onChange={(val) => setNotifications({ ...notifications, [key]: val })}
                  />
                </div>
              ))}
            </div>
            <button onClick={() => toast.success('Notification preferences saved!')}
              className="btn-primary mt-4 flex items-center gap-2">
              <Save size={16} /> Save Preferences
            </button>
          </motion.div>

          {/* Account Info */}
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }} className="card p-6">
            <h2 className="font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
              <Shield size={18} className="text-primary" /> Account Info
            </h2>
            <div className="space-y-3 text-sm">
              {[
                { label: 'Account Type', value: user?.role?.charAt(0).toUpperCase() + user?.role?.slice(1) },
                { label: 'Email', value: user?.email },
                { label: 'Member Since', value: user?.createdAt ? new Date(user.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }) : 'N/A' },
                { label: 'Account Status', value: 'Active' },
              ].map(({ label, value }) => (
                <div key={label} className="flex justify-between py-2 border-b border-gray-50 dark:border-gray-800 last:border-0">
                  <span className="text-gray-500">{label}</span>
                  <span className="font-medium text-gray-900 dark:text-white">{value}</span>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Danger Zone */}
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="card p-6 border border-red-100 dark:border-red-900/30">
            <h2 className="font-semibold text-red-500 mb-3">Danger Zone</h2>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
              These actions are permanent and cannot be undone.
            </p>
            <button onClick={() => toast.error('Please contact support to delete your account')}
              className="px-4 py-2 text-sm font-medium text-red-500 border border-red-200 dark:border-red-800 rounded-xl hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors">
              Delete Account
            </button>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
