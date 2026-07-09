import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-gray-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
          <div className="lg:col-span-1">
            <div className="flex items-center gap-2.5 mb-5">
              <div className="w-10 h-10 bg-brand-500 rounded-xl flex items-center justify-center shadow-lg">
                <span className="text-white font-extrabold text-xl">S</span>
              </div>
              <span className="font-bold text-xl text-white">Straightway Couriers</span>
            </div>
            <p className="text-gray-400 text-sm leading-relaxed">
              Fast, reliable delivery services across Sri Lanka. We handle all kinds of shipments with care and professionalism.
            </p>
            <div className="flex gap-3 mt-6">
              {['f', 't', 'i', 'y'].map((s, i) => (
                <div key={i} className="w-9 h-9 rounded-lg bg-gray-800 flex items-center justify-center text-gray-400 hover:bg-brand-500 hover:text-white transition-all duration-200 cursor-pointer text-xs font-bold">
                  {s.toUpperCase()}
                </div>
              ))}
            </div>
          </div>

          <div>
            <h3 className="font-semibold text-white mb-5 text-sm uppercase tracking-widest">Quick Links</h3>
            <div className="flex flex-col gap-3">
              {[
                { to: '/', label: 'Home' },
                { to: '/track', label: 'Track Shipment' },
                { to: '/services', label: 'Services' },
                { to: '/about', label: 'About Us' },
                { to: '/contact', label: 'Contact' },
              ].map(link => (
                <Link
                  key={link.to}
                  to={link.to}
                  className="text-gray-400 hover:text-white transition-colors text-sm flex items-center gap-2"
                >
                  <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                  {link.label}
                </Link>
              ))}
            </div>
          </div>

          <div>
            <h3 className="font-semibold text-white mb-5 text-sm uppercase tracking-widest">Services</h3>
            <div className="flex flex-col gap-3 text-sm text-gray-400">
              <span className="hover:text-white transition-colors cursor-pointer">Same-Day Delivery</span>
              <span className="hover:text-white transition-colors cursor-pointer">Express Delivery</span>
              <span className="hover:text-white transition-colors cursor-pointer">Freight Services</span>
              <span className="hover:text-white transition-colors cursor-pointer">E-Commerce</span>
              <span className="hover:text-white transition-colors cursor-pointer">Document Delivery</span>
            </div>
          </div>

          <div>
            <h3 className="font-semibold text-white mb-5 text-sm uppercase tracking-widest">Contact</h3>
            <div className="space-y-4 text-sm">
              <div className="flex items-start gap-3">
                <svg className="w-5 h-5 text-brand-400 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                <span className="text-gray-400">Colombo, Sri Lanka</span>
              </div>
              <div className="flex items-start gap-3">
                <svg className="w-5 h-5 text-brand-400 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                </svg>
                <a href="tel:+94772520636" className="text-gray-400 hover:text-white transition-colors">+94 77 252 0636</a>
              </div>
              <div className="flex items-start gap-3">
                <svg className="w-5 h-5 text-brand-400 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                <a href="mailto:info@straightwaycouriers.com" className="text-gray-400 hover:text-white transition-colors break-all">info@straightwaycouriers.com</a>
              </div>
            </div>
          </div>
        </div>

        <div className="border-t border-gray-800 mt-12 pt-8 flex flex-col sm:flex-row justify-between items-center gap-4 text-sm text-gray-500">
          <p>&copy; {new Date().getFullYear()} Straightway Couriers. All rights reserved.</p>
          <div className="flex gap-6">
            <span className="hover:text-gray-300 transition-colors cursor-pointer">Privacy Policy</span>
            <span className="hover:text-gray-300 transition-colors cursor-pointer">Terms of Service</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
