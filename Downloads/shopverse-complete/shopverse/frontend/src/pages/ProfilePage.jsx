import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { motion } from 'framer-motion';
import { User, Mail, Phone, MapPin, Camera, Save, Loader2 } from 'lucide-react';
import api from '../api/axios';
import { updateUser } from '../store/slices/authSlice';
import Navbar from '../components/layout/Navbar';
import toast from 'react-hot-toast';

export default function ProfilePage() {
  const dispatch = useDispatch();
  const { user } = useSelector((s) => s.auth);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    name: '',
    phone: '',
    avatar: '',
    address: { street: '', city: '', state: '', zipCode: '', country: '' },
  });

  useEffect(() => {
    if (user) {
      setForm({
        name: user.name || '',
        phone: user.phone || '',
        avatar: user.avatar || '',
        address: {
          street: user.address?.street || '',
          city: user.address?.city || '',
          state: user.address?.state || '',
          zipCode: user.address?.zipCode || '',
          country: user.address?.country || '',
        },
      });
    }
  }, [user]);

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const { data } = await api.put('/users/profile', form);
      dispatch(updateUser(data.user));
      toast.success('Profile updated successfully!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  const updateAddr = (field, val) =>
    setForm((f) => ({ ...f, address: { ...f.address, [field]: val } }));

  return (
    <div className="min-h-screen dark:bg-gray-950">
      <Navbar />
      <div className="pt-16">
        {/* Header */}
        <div className="bg-gradient-to-r from-primary to-secondary py-12">
          <div className="max-w-3xl mx-auto px-4">
            <h1 className="font-display font-bold text-3xl text-white">My Profile</h1>
            <p className="text-white/70 mt-1">Manage your personal information</p>
          </div>
        </div>

        <div className="max-w-3xl mx-auto px-4 sm:px-6 py-10">
          <form onSubmit={handleSave} className="space-y-6">
            {/* Avatar Section */}
            <div className="card p-6">
              <div className="flex items-center gap-6">
                <div className="relative">
                  <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-white font-display font-bold text-3xl overflow-hidden shadow-lg">
                    {form.avatar ? (
                      <img src={form.avatar} alt="Avatar" className="w-full h-full object-cover"
                        onError={(e) => { e.target.style.display = 'none'; }} />
                    ) : (
                      user?.name?.[0]?.toUpperCase()
                    )}
                  </div>
                  <div className="absolute -bottom-2 -right-2 w-8 h-8 bg-white dark:bg-gray-900 rounded-xl shadow flex items-center justify-center border border-gray-100 dark:border-gray-800">
                    <Camera size={14} className="text-primary" />
                  </div>
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900 dark:text-white text-lg">{user?.name}</h3>
                  <p className="text-gray-500 text-sm">{user?.email}</p>
                  <span className="badge bg-primary/10 text-primary mt-1 capitalize">{user?.role}</span>
                  <div className="mt-3">
                    <label className="block text-xs text-gray-500 mb-1">Avatar URL</label>
                    <input
                      type="url"
                      value={form.avatar}
                      onChange={(e) => setForm({ ...form, avatar: e.target.value })}
                      className="input !py-2 !text-sm"
                      placeholder="https://example.com/avatar.jpg"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Personal Info */}
            <div className="card p-6">
              <h2 className="font-semibold text-gray-900 dark:text-white mb-5 flex items-center gap-2">
                <User size={18} className="text-primary" /> Personal Information
              </h2>
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Full Name</label>
                  <input
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    className="input"
                    placeholder="John Doe"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Email Address</label>
                  <input
                    value={user?.email}
                    disabled
                    className="input opacity-60 cursor-not-allowed"
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Phone Number</label>
                  <div className="relative">
                    <Phone size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                      value={form.phone}
                      onChange={(e) => setForm({ ...form, phone: e.target.value })}
                      className="input pl-10"
                      placeholder="+1 (555) 000-0000"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Address */}
            <div className="card p-6">
              <h2 className="font-semibold text-gray-900 dark:text-white mb-5 flex items-center gap-2">
                <MapPin size={18} className="text-primary" /> Address
              </h2>
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="sm:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Street Address</label>
                  <input value={form.address.street} onChange={(e) => updateAddr('street', e.target.value)} className="input" placeholder="123 Main St, Apt 4B" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">City</label>
                  <input value={form.address.city} onChange={(e) => updateAddr('city', e.target.value)} className="input" placeholder="New York" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">State</label>
                  <input value={form.address.state} onChange={(e) => updateAddr('state', e.target.value)} className="input" placeholder="NY" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">ZIP Code</label>
                  <input value={form.address.zipCode} onChange={(e) => updateAddr('zipCode', e.target.value)} className="input" placeholder="10001" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Country</label>
                  <input value={form.address.country} onChange={(e) => updateAddr('country', e.target.value)} className="input" placeholder="United States" />
                </div>
              </div>
            </div>

            <button type="submit" disabled={saving} className="btn-primary w-full flex items-center justify-center gap-2 py-4 text-base">
              {saving ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
              {saving ? 'Saving...' : 'Save Changes'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
