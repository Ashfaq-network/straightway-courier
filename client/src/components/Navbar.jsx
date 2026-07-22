import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';

const links = [
  { to: '/', label: 'Home' },
  { to: '/track', label: 'Track' },
  { to: '/services', label: 'Services' },
  { to: '/about', label: 'About' },
  { to: '/faqs', label: 'FAQs' },
  { to: '/contact', label: 'Contact' },
];

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const location = useLocation();
  const isHome = location.pathname === '/';
  const isDashboard = location.pathname.startsWith('/admin') || location.pathname.startsWith('/staff') || location.pathname.startsWith('/client');
  if (isDashboard) return null;

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${isHome ? 'bg-transparent' : 'bg-white/95 shadow-sm border-b border-gray-100'}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 md:h-20 items-center">
          <Link to="/" className="flex items-center gap-2.5 group">
            <div className="w-10 h-10 bg-white/95 rounded-xl flex items-center justify-center shadow-md overflow-hidden group-hover:shadow-lg group-hover:scale-105 transition-all duration-200">
              <img src="/logo.png" alt="Straightway Couriers" className="w-full h-full object-contain" />
            </div>
            <span className={`font-bold text-lg tracking-tight ${isHome ? 'text-white' : 'text-brand-600'}`}>
              Straightway
              <span className="font-normal"> Couriers</span>
            </span>
          </Link>

          <div className="hidden md:flex items-center gap-8">
            {links.map(link => (
              <Link
                key={link.to}
                to={link.to}
                className={`relative text-sm font-medium transition-colors py-1 ${
                  location.pathname === link.to
                    ? isHome ? 'text-white' : 'text-brand-500'
                    : isHome ? 'text-white/80 hover:text-white' : 'text-gray-500 hover:text-brand-500'
                }`}
              >
                {link.label}
                {location.pathname === link.to && (
                  <motion.div
                    layoutId="nav-indicator"
                    className={`absolute -bottom-1 left-0 right-0 h-0.5 rounded-full ${isHome ? 'bg-white' : 'bg-brand-500'}`}
                  />
                )}
              </Link>
            ))}
            <a href="https://wa.me/94772520636" target="_blank" rel="noopener noreferrer"
              className="px-4 py-2 bg-green-500 text-white text-sm font-semibold rounded-lg hover:bg-green-600 transition-colors">
              WhatsApp
            </a>
            <Link to="/register"
              className={`px-4 py-2 text-sm font-semibold rounded-lg transition-colors ${
                isHome ? 'bg-white/10 text-white hover:bg-white/20' : 'bg-teal-500 text-white hover:bg-teal-600'
              }`}>
              Register
            </Link>
          </div>

          <button
            className={`md:hidden p-2.5 rounded-xl transition-colors ${
              isHome ? 'hover:bg-white/10 text-white' : 'hover:bg-gray-100 text-gray-600'
            }`}
            onClick={() => setOpen(!open)}
          >
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              {open ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>
      </div>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden bg-white border-t border-gray-100 shadow-lg overflow-hidden"
          >
            {links.map((link, i) => (
              <motion.div key={link.to} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.05 }}>
                <Link to={link.to} onClick={() => setOpen(false)}
                  className={`block px-6 py-3.5 text-sm font-medium border-l-2 transition-all ${
                    location.pathname === link.to
                      ? 'text-brand-500 bg-brand-50 border-brand-500'
                      : 'text-gray-600 hover:bg-gray-50 border-transparent'
                  }`}>
                  {link.label}
                </Link>
              </motion.div>
            ))}
            <a href="https://wa.me/94772520636" target="_blank" rel="noopener noreferrer"
              className="block px-6 py-3.5 text-sm font-medium text-green-600 bg-green-50 border-l-2 border-green-500">
              WhatsApp
            </a>
            <Link to="/register" onClick={() => setOpen(false)}
              className="block px-6 py-3.5 text-sm font-medium text-teal-600 bg-teal-50 border-l-2 border-teal-500">
              Register
            </Link>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}
