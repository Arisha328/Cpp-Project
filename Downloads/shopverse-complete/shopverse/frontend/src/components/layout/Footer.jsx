import { Link } from 'react-router-dom';
import { Store, Globe, Link2, Rss, Mail, Phone, MapPin, ChevronRight, Send } from 'lucide-react';

const MARKETPLACE_LINKS = [
  ['Browse Products', '/products'],
  ['Top Vendors', '/vendors'],
  ['Featured Collections', '/products?sort=featured'],
  ['Categories', '/products'],
];

const ACCOUNT_LINKS = [
  ['My Dashboard', '/dashboard'],
  ['Wishlist', '/wishlist'],
  ['Sell on ShopVerse', '/register'],
  ['Settings', '/settings'],
];

export default function Footer() {
  return (
    <footer className="relative bg-slate-950 text-slate-350 pt-24 pb-12 overflow-hidden border-t border-slate-900">
      {/* Decorative Blur Bubble */}
      <div className="absolute -top-40 -right-40 w-96 h-96 bg-primary/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-secondary/5 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Main Grid */}
        <div className="grid gap-12 lg:grid-cols-[1.5fr_1fr_1fr_1.3fr] mb-16">
          
          {/* Brand Info */}
          <div className="space-y-6">
            <Link to="/" className="inline-flex items-center gap-3">
              <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-primary to-secondary shadow-glow flex items-center justify-center text-white transition-transform hover:scale-105">
                <Store size={20} className="stroke-[1.75]" />
              </div>
              <div>
                <p className="text-lg font-bold text-white tracking-tight leading-none">ShopVerse</p>
                <p className="text-[10px] uppercase tracking-[0.25em] text-slate-500 mt-1.5 font-semibold">Premium Mall</p>
              </div>
            </Link>
            <p className="max-w-sm text-sm leading-7 text-slate-400">
              A modern, decentralized multi-vendor marketplace designed for secure transactions, high-speed delivery, and seamless commerce experiences.
            </p>
            {/* Social Icons */}
            <div className="flex items-center gap-3">
              {[Globe, Link2, Rss].map((Icon, index) => (
                <a
                  key={index}
                  href="#"
                  className="inline-flex h-11 w-11 items-center justify-center rounded-2xl border border-slate-800/80 bg-slate-900/60 text-slate-400 transition-all duration-300 hover:border-primary/50 hover:bg-slate-900 hover:text-primary hover:scale-105 active:scale-95"
                >
                  <Icon size={18} />
                </a>
              ))}
            </div>
          </div>

          {/* Links Column 1 */}
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-slate-400 mb-6">Marketplace</p>
            <ul className="space-y-4 text-sm font-medium">
              {MARKETPLACE_LINKS.map(([label, href]) => (
                <li key={label}>
                  <Link 
                    to={href} 
                    className="group inline-flex items-center gap-2 text-slate-400 hover:text-white transition-colors duration-250"
                  >
                    <ChevronRight size={14} className="text-primary transition-transform duration-250 group-hover:translate-x-1" />
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Links Column 2 */}
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-slate-400 mb-6">Account</p>
            <ul className="space-y-4 text-sm font-medium">
              {ACCOUNT_LINKS.map(([label, href]) => (
                <li key={label}>
                  <Link 
                    to={href} 
                    className="group inline-flex items-center gap-2 text-slate-400 hover:text-white transition-colors duration-250"
                  >
                    <ChevronRight size={14} className="text-primary transition-transform duration-250 group-hover:translate-x-1" />
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Newsletter Box */}
          <div className="rounded-3xl border border-slate-800/60 bg-slate-900/40 p-6 shadow-premium backdrop-blur">
            <p className="text-sm font-bold uppercase tracking-[0.15em] text-slate-200 mb-4">Stay in the loop</p>
            <p className="text-xs text-slate-400 leading-relaxed mb-6">Subscribe to receive launch announcements, vendor newsletters, and seasonal discounts.</p>
            
            <form className="flex gap-2" onSubmit={(e) => e.preventDefault()}>
              <label htmlFor="footer-email" className="sr-only">Email address</label>
              <div className="relative flex-1">
                <input
                  id="footer-email"
                  type="email"
                  placeholder="Your email"
                  className="w-full rounded-2xl border border-slate-800/80 bg-slate-950 px-4 py-3 text-xs text-slate-100 placeholder:text-slate-500 outline-none transition duration-300 focus:border-primary/50 focus:ring-4 focus:ring-primary/10"
                />
              </div>
              <button 
                type="submit" 
                className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-r from-primary to-secondary text-white shadow-glow transition-all duration-300 hover:scale-105 active:scale-95"
                aria-label="Subscribe"
              >
                <Send size={15} />
              </button>
            </form>
          </div>

        </div>

        {/* Bottom Line */}
        <div className="border-t border-slate-900 pt-8 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between text-xs text-slate-500 font-semibold">
          <p>© {new Date().getFullYear()} ShopVerse Inc. Designed for premium commerce experiences.</p>
          <div className="flex flex-wrap gap-6">
            {['Privacy Policy', 'Terms of Service', 'Cookie Policy'].map((item) => (
              <a key={item} href="#" className="hover:text-slate-350 transition-colors">{item}</a>
            ))}
          </div>
        </div>

      </div>
    </footer>
  );
}
