import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { motion } from 'framer-motion';
import { Eye, EyeOff, Store, Loader2, ArrowLeft } from 'lucide-react';
import { login, register, clearError } from '../../store/slices/authSlice';
import toast from 'react-hot-toast';

export function LoginPage() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { loading, error, user } = useSelector((s) => s.auth);
  const [form, setForm] = useState({ email: '', password: '' });
  const [showPass, setShowPass] = useState(false);

  useEffect(() => {
    if (user) {
      if (user.role === 'admin') navigate('/admin');
      else if (user.role === 'vendor') navigate('/vendor');
      else navigate('/dashboard');
    }
  }, [user]);

  useEffect(() => {
    if (error) {
      toast.error(error);
      dispatch(clearError());
    }
  }, [error]);

  const handleSubmit = (e) => {
    e.preventDefault();
    dispatch(login(form));
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 dark:bg-slate-950 dark:text-slate-100">
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-transparent to-secondary/10" />
        <div className="absolute top-0 left-1/2 h-96 w-96 -translate-x-1/2 rounded-full bg-primary/10 blur-3xl" />
        <div className="relative z-10 min-h-screen flex flex-col lg:flex-row items-center justify-center px-4 py-10 lg:py-16">
          <div className="hidden lg:flex lg:w-1/2 xl:w-2/5 flex-col rounded-[32px] border border-white/70 bg-white/90 p-12 shadow-glow backdrop-blur-xl">
            <div className="flex h-20 w-20 items-center justify-center rounded-3xl bg-gradient-to-br from-primary to-secondary text-white shadow-xl mb-8">
              <Store size={36} />
            </div>
            <h1 className="text-4xl font-semibold text-slate-900 mb-4">Welcome back to ShopVerse</h1>
            <p className="max-w-xl text-sm text-slate-500 leading-7">A premium hub for shoppers and sellers who value speed, trust, and effortless commerce.</p>
            <div className="mt-10 grid gap-4 text-sm text-slate-600">
              {['Secure checkout', 'Verified vendors', 'Personalized recommendations', 'Dedicated support'].map((item) => (
                <div key={item} className="rounded-3xl border border-slate-200 bg-slate-50 px-5 py-4 shadow-sm">• {item}</div>
              ))}
            </div>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55 }}
            className="w-full max-w-xl rounded-[32px] border border-slate-200 bg-white p-8 shadow-soft backdrop-blur-xl dark:border-slate-800 dark:bg-slate-950"
          >
            <Link
              to="/"
              className="mb-6 inline-flex items-center gap-2 text-sm font-medium text-slate-500 hover:text-primary"
            >
              <ArrowLeft size={16} /> Back to Home
            </Link>

            <div className="mb-8">
              <p className="text-sm uppercase tracking-[0.22em] text-primary font-semibold">Sign in</p>
              <h2 className="mt-4 text-3xl font-semibold text-slate-900 dark:text-white">Access your account</h2>
              <p className="mt-3 text-sm text-slate-500 dark:text-slate-400">Secure access for buyers, vendors, and marketplace administrators.</p>
            </div>

            <div className="rounded-[28px] border border-primary/10 bg-primary/5 p-4 mb-7 text-sm text-slate-700 dark:bg-white/5 dark:text-slate-200">
              <p className="font-semibold text-primary mb-2">Demo Credentials</p>
              <p>Customer: customer@demo.com / demo123</p>
              <p>Vendor: vendor@demo.com / demo123</p>
              <p>Admin: admin@demo.com / demo123</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Email</label>
                <input
                  type="email"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  className="input"
                  placeholder="you@company.com"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Password</label>
                <div className="relative">
                  <input
                    type={showPass ? 'text' : 'password'}
                    value={form.password}
                    onChange={(e) => setForm({ ...form, password: e.target.value })}
                    className="input pr-12"
                    placeholder="Minimum 6 characters"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPass(!showPass)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                    aria-label={showPass ? 'Hide password' : 'Show password'}
                  >
                    {showPass ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              <button type="submit" disabled={loading} className="btn-primary w-full">
                {loading ? <Loader2 size={18} className="animate-spin" /> : null}
                {loading ? 'Signing in...' : 'Sign In'}
              </button>
            </form>

            <p className="mt-6 text-sm text-slate-500 dark:text-slate-400">
              If you are a seller, use your seller email and password. After login, you will be redirected to the Vendor Dashboard.
            </p>

            <p className="mt-5 text-sm text-slate-500 dark:text-slate-400">
              Don&apos;t have an account?{' '}
              <Link to="/register" className="font-semibold text-primary hover:underline">Create one</Link>
            </p>
          </motion.div>
        </div>
      </div>
    </div>
  );
}

export function RegisterPage() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { loading, error, user } = useSelector((s) => s.auth);
  const [form, setForm] = useState({ name: '', email: '', password: '', role: 'customer', storeName: '' });
  const [showPass, setShowPass] = useState(false);

  useEffect(() => {
    if (user) {
      if (user.role === 'vendor') navigate('/vendor');
      else navigate('/dashboard');
    }
  }, [user]);

  useEffect(() => {
    if (error) {
      toast.error(error);
      dispatch(clearError());
    }
  }, [error]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (form.password.length < 6) return toast.error('Password must be at least 6 characters');
    dispatch(register(form));
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 dark:bg-slate-950 dark:text-slate-100">
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-transparent to-secondary/10" />
        <div className="absolute right-0 top-10 h-80 w-80 rounded-full bg-secondary/10 blur-3xl" />
        <div className="relative z-10 flex min-h-screen items-center justify-center px-4 py-12">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55 }}
            className="w-full max-w-2xl rounded-[32px] border border-slate-200 bg-white p-8 shadow-soft backdrop-blur-xl dark:border-slate-800 dark:bg-slate-950"
          >
            <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between mb-8">
              <div>
                <p className="text-sm uppercase tracking-[0.18em] text-primary font-semibold">Create Account</p>
                <h1 className="mt-3 text-4xl font-semibold text-slate-900 dark:text-white">Start selling or shopping today</h1>
                <p className="mt-3 text-sm text-slate-500 dark:text-slate-400 max-w-xl">Build your store, manage orders, and deliver premium experiences for your customers.</p>
              </div>
              <Link
                to="/"
                className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 px-5 py-3 text-sm font-medium text-slate-700 transition hover:border-primary hover:text-primary dark:border-slate-800 dark:text-slate-300"
              >
                <ArrowLeft size={16} /> Back Home
              </Link>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-6">
              {[
                { value: 'customer', label: 'I&apos;m a Buyer', icon: '🛍️' },
                { value: 'vendor', label: 'I&apos;m a Seller', icon: '🏪' },
              ].map((role) => (
                <button
                  key={role.value}
                  type="button"
                  onClick={() => setForm({ ...form, role: role.value })}
                  className={`rounded-[28px] border p-5 text-left transition-all ${
                    form.role === role.value
                      ? 'border-primary bg-primary/10 shadow-lg'
                      : 'border-slate-200 bg-slate-50 hover:border-primary dark:border-slate-800 dark:bg-slate-900'
                  }`}
                >
                  <div className="text-3xl mb-3">{role.icon}</div>
                  <p className="font-semibold text-slate-900 dark:text-white">{role.label}</p>
                  <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">{role.value === 'vendor' ? 'Sell products and manage orders' : 'Shop from verified sellers'}</p>
                </button>
              ))}
            </div>

            <div className="rounded-[28px] border border-slate-200 bg-slate-50 p-4 text-sm text-slate-600 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300 mb-6">
              Selected account type: <span className="font-semibold text-primary">{form.role === 'vendor' ? 'Seller' : 'Buyer'}</span>
            </div>

            <form onSubmit={handleSubmit} className="grid gap-5">
              <div className="grid gap-5 sm:grid-cols-2">
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Full Name</label>
                  <input type="text" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="input" placeholder="John Doe" required />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Email</label>
                  <input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className="input" placeholder="you@company.com" required />
                </div>
              </div>

              <div className="grid gap-5 sm:grid-cols-2">
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Password</label>
                  <div className="relative">
                    <input type={showPass ? 'text' : 'password'} value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} className="input pr-12" placeholder="Minimum 6 characters" required />
                    <button type="button" onClick={() => setShowPass(!showPass)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600" aria-label={showPass ? 'Hide password' : 'Show password'}>
                      {showPass ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                </div>
                {form.role === 'vendor' && (
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Store Name</label>
                    <input type="text" value={form.storeName} onChange={(e) => setForm({ ...form, storeName: e.target.value })} className="input" placeholder="My Premium Store" required />
                  </div>
                )}
              </div>

              <button type="submit" disabled={loading} className="btn-primary w-full">
                {loading ? <Loader2 size={18} className="animate-spin" /> : null}
                {loading ? 'Creating account...' : 'Create Account'}
              </button>
            </form>

            <p className="mt-6 text-center text-sm text-slate-500 dark:text-slate-400">
              Already have an account?{' '}
              <Link to="/login" className="font-semibold text-primary hover:underline">Sign in</Link>
            </p>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
