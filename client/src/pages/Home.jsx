import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';

const fadeUp = {
  hidden: { opacity: 0, y: 40 },
  visible: (i = 0) => ({
    opacity: 1, y: 0,
    transition: { duration: 0.6, delay: i * 0.12, ease: [0.25, 0.4, 0.25, 1] }
  })
};

const stagger = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.1 } }
};

function TruckIcon({ className }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 48 48" stroke="currentColor" strokeWidth={1.2}>
      <rect x="4" y="14" width="26" height="16" rx="2" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M30 20h6l6 4v6h-4" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx="14" cy="34" r="4" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx="36" cy="34" r="4" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M10 34H8M38 34h2" strokeLinecap="round" />
      <path d="M4 24h-2" strokeLinecap="round" />
      <circle cx="14" cy="34" r="1.5" fill="currentColor" />
      <circle cx="36" cy="34" r="1.5" fill="currentColor" />
    </svg>
  );
}

function RoutePathIcon({ className }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 48 48" stroke="currentColor" strokeWidth={1.2}>
      <circle cx="8" cy="12" r="4" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx="40" cy="36" r="4" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M12 12c4 0 8 4 12 4s8-4 12-4" strokeLinecap="round" strokeLinejoin="round" strokeDasharray="2 2" />
      <path d="M12 12c4 0 8 4 12 4s8 4 12 8" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M12 12c4 2 8 6 12 6s8-2 12-6" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx="24" cy="16" r="2" fill="currentColor" />
      <circle cx="12" cy="12" r="1.5" fill="currentColor" />
      <circle cx="40" cy="36" r="1.5" fill="currentColor" />
    </svg>
  );
}

function PackageIcon({ className }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 48 48" stroke="currentColor" strokeWidth={1.2}>
      <path d="M8 16l16-8 16 8v16l-16 8-16-8V16z" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M24 8v16" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M8 16l16 8 16-8" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M16 12l16 8" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M24 24v14" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M8 24v4l16 8" strokeLinecap="round" strokeLinejoin="round" opacity="0.5" />
    </svg>
  );
}

function MapPinIcon({ className }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 48 48" stroke="currentColor" strokeWidth={1.2}>
      <path d="M24 44c0 0 14-12 14-24a14 14 0 00-28 0c0 12 14 24 14 24z" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx="24" cy="20" r="6" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx="24" cy="20" r="2" fill="currentColor" />
    </svg>
  );
}

function CheckShieldIcon({ className }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 48 48" stroke="currentColor" strokeWidth={1.2}>
      <path d="M24 6L6 12v10c0 12 8 20 18 22 10-2 18-10 18-22V12L24 6z" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M18 24l4 4 8-8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

const features = [
  {
    title: 'Same-Day Delivery',
    desc: 'Urgent deliveries within Colombo Metro area, guaranteed same-day.',
    icon: <TruckIcon className="w-7 h-7" />
  },
  {
    title: 'Real-Time Tracking',
    desc: 'Know exactly where your shipment is with live GPS updates.',
    icon: <MapPinIcon className="w-7 h-7" />
  },
  {
    title: 'Nationwide Coverage',
    desc: 'Delivering to all provinces across Sri Lanka, from Colombo to Jaffna.',
    icon: <RoutePathIcon className="w-7 h-7" />
  },
  {
    title: 'All Deliveries',
    desc: 'Documents, parcels, freight, e-commerce — we handle it all.',
    icon: <PackageIcon className="w-7 h-7" />
  },
  {
    title: 'Affordable Rates',
    desc: 'Competitive pricing with complete transparency — no hidden charges.',
    icon: (
      <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    )
  },
  {
    title: 'Trusted Service',
    desc: 'Professional handling with care. Your shipments are in safe hands.',
    icon: <CheckShieldIcon className="w-7 h-7" />
  },
];

const stats = [
  { number: '500+', label: 'Deliveries Completed' },
  { number: '50+', label: 'Cities Covered' },
  { number: '98%', label: 'On-Time Rate' },
  { number: '100%', label: 'Customer Satisfaction' },
];

const steps = [
  {
    number: '01',
    title: 'Book a Pickup',
    desc: 'Call us or send a message to schedule a pickup at your location.',
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
      </svg>
    )
  },
  {
    number: '02',
    title: 'We Collect',
    desc: 'Our rider picks up your package from your doorstep at the scheduled time.',
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
      </svg>
    )
  },
  {
    number: '03',
    title: 'In Transit',
    desc: 'Your package is on the move. Track it in real-time from our website.',
    icon: <RoutePathIcon className="w-6 h-6" />
  },
  {
    number: '04',
    title: 'Delivered Safely',
    desc: 'Package arrives at the destination. Confirmation sent via SMS.',
    icon: <PackageIcon className="w-6 h-6" />
  }
];

const cities = [
  'Colombo', 'Kandy', 'Galle', 'Jaffna', 'Kurunegala',
  'Negombo', 'Anuradhapura', 'Trincomalee', 'Batticaloa', 'Ratnapura',
  'Badulla', 'Matara', 'Nuwara Eliya', 'Polonnaruwa', 'Kalutara'
];

export default function Home() {
  const [trackingId, setTrackingId] = useState('');
  const navigate = useNavigate();

  const handleTrack = (e) => {
    e.preventDefault();
    if (trackingId.trim()) {
      navigate(`/track?q=${trackingId.trim()}`);
    }
  };

  return (
    <div>
      <section className="relative min-h-screen flex items-center overflow-hidden bg-gradient-to-br from-brand-600 via-brand-700 to-gray-900">
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 -right-40 w-96 h-96 bg-accent-400/10 rounded-full blur-3xl animate-float" />
          <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-blue-400/10 rounded-full blur-3xl animate-float-delayed" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-brand-500/10 rounded-full blur-3xl animate-pulse-soft" />
          <div className="absolute inset-0" style={{
            backgroundImage: 'radial-gradient(circle at 1px 1px, rgba(255,255,255,0.03) 1px, transparent 0)',
            backgroundSize: '40px 40px'
          }} />
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-32 md:py-40">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <motion.div
              initial="hidden"
              animate="visible"
              variants={stagger}
              className="max-w-2xl"
            >
              <motion.div variants={fadeUp} className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-sm rounded-full text-sm text-white/90 mb-6 border border-white/10">
                <TruckIcon className="w-4 h-4 text-accent-400" />
                Trusted Courier Service in Sri Lanka
              </motion.div>
              <motion.h1 variants={fadeUp} className="text-5xl md:text-6xl lg:text-7xl font-black text-white leading-[1.1] mb-6 tracking-tight">
                Fast & Reliable
                <span className="block text-transparent bg-clip-text bg-gradient-to-r from-accent-300 to-accent-400">
                  Courier Services
                </span>
                Across Sri Lanka
              </motion.h1>
              <motion.p variants={fadeUp} className="text-lg md:text-xl text-blue-100/80 mb-8 leading-relaxed max-w-xl">
                From Colombo to every corner of the island — we deliver your packages safely, swiftly, and affordably.
              </motion.p>
              <motion.form variants={fadeUp} onSubmit={handleTrack} className="flex flex-col sm:flex-row gap-3 max-w-lg">
                <div className="relative flex-1">
                  <svg className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                  <input
                    type="text"
                    placeholder="Enter tracking number"
                    value={trackingId}
                    onChange={(e) => setTrackingId(e.target.value)}
                    className="w-full pl-12 pr-5 py-4 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-accent-400 shadow-lg"
                  />
                </div>
                <button type="submit" className="btn-accent whitespace-nowrap">
                  Track Now
                </button>
              </motion.form>
              <motion.div variants={fadeUp} className="flex items-center gap-6 mt-8 text-sm text-white/60">
                <span className="flex items-center gap-1.5">
                  <svg className="w-4 h-4 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  Real-time tracking
                </span>
                <span className="flex items-center gap-1.5">
                  <svg className="w-4 h-4 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  Door-to-door delivery
                </span>
                <span className="flex items-center gap-1.5">
                  <svg className="w-4 h-4 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  Insured shipments
                </span>
              </motion.div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 40 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.3 }}
              className="hidden lg:flex justify-center"
            >
              <div className="relative w-80">
                <div className="bg-white/5 backdrop-blur-sm rounded-3xl border border-white/10 p-6">
                  <p className="text-white/50 text-xs uppercase tracking-wider mb-4 font-medium">Delivery Route</p>
                  <svg viewBox="0 0 280 240" className="w-full" fill="none">
                    <circle cx="140" cy="120" r="100" stroke="rgba(255,255,255,0.06)" strokeWidth="1" strokeDasharray="4 4" />
                    <circle cx="140" cy="120" r="70" stroke="rgba(255,255,255,0.06)" strokeWidth="1" strokeDasharray="4 4" />
                    <circle cx="140" cy="120" r="40" stroke="rgba(255,255,255,0.06)" strokeWidth="1" strokeDasharray="4 4" />
                    <circle cx="140" cy="48" r="4" fill="#fbbf24" />
                    <circle cx="220" cy="140" r="4" fill="#fbbf24" />
                    <circle cx="60" cy="160" r="4" fill="#fbbf24" />
                    <circle cx="140" cy="200" r="4" fill="#fbbf24" />
                    <circle cx="140" cy="120" r="6" fill="#fbbf24" />
                    <path d="M140 48 Q180 80 220 140" stroke="rgba(251,191,36,0.3)" strokeWidth="2" fill="none" strokeDasharray="4 4" />
                    <path d="M220 140 Q180 180 140 200" stroke="rgba(251,191,36,0.3)" strokeWidth="2" fill="none" strokeDasharray="4 4" />
                    <path d="M140 200 Q100 180 60 160" stroke="rgba(251,191,36,0.3)" strokeWidth="2" fill="none" strokeDasharray="4 4" />
                    <path d="M60 160 Q80 130 140 120" stroke="rgba(251,191,36,0.3)" strokeWidth="2" fill="none" strokeDasharray="4 4" />
                    <path d="M140 120 Q130 80 140 48" stroke="#fbbf24" strokeWidth="2" fill="none" />
                    <rect x="130" y="116" width="20" height="8" rx="2" fill="#fbbf24" />
                    <text x="148" y="46" fill="rgba(255,255,255,0.7)" fontSize="8" fontWeight="500">Jaffna</text>
                    <text x="222" y="156" fill="rgba(255,255,255,0.7)" fontSize="8" fontWeight="500">Trinco</text>
                    <text x="30" y="166" fill="rgba(255,255,255,0.7)" fontSize="8" fontWeight="500">Colombo</text>
                    <text x="126" y="210" fill="rgba(255,255,255,0.7)" fontSize="8" fontWeight="500">Galle</text>
                    <text x="144" y="126" fill="rgba(255,255,255,0.7)" fontSize="8" fontWeight="500">Kandy</text>
                  </svg>
                  <div className="flex items-center justify-between mt-4 pt-4 border-t border-white/10">
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-emerald-400" />
                      <span className="text-white/60 text-xs">Active routes</span>
                    </div>
                    <span className="text-white/40 text-xs">12 deliveries today</span>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      <section className="py-24 bg-white relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-100px' }}
            variants={stagger}
            className="text-center mb-16"
          >
            <motion.span variants={fadeUp} className="text-sm font-semibold text-brand-500 uppercase tracking-widest mb-3 block">
              How It Works
            </motion.span>
            <motion.h2 variants={fadeUp} className="section-title mb-4">
              From Pickup to Delivery
            </motion.h2>
            <motion.p variants={fadeUp} className="section-subtitle">
              Four simple steps to get your package from anywhere to everywhere.
            </motion.p>
          </motion.div>

          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-50px' }}
            variants={stagger}
            className="grid grid-cols-1 md:grid-cols-4 gap-6 relative"
          >
            {steps.map((step, i) => (
              <motion.div key={i} variants={fadeUp} custom={i} className="relative text-center">
                <div className="relative z-10 w-20 h-20 mx-auto mb-5 bg-brand-50 rounded-2xl flex items-center justify-center text-brand-500 group-hover:bg-brand-500 group-hover:text-white transition-all duration-300">
                  {step.icon}
                </div>
                <div className="hidden md:block absolute top-8 left-[60%] w-[calc(100%-80px)] h-0.5 border-t-2 border-dashed border-gray-200" />
                <span className="text-xs font-bold text-brand-400 tracking-widest">{step.number}</span>
                <h3 className="font-semibold text-gray-900 mt-1 mb-1">{step.title}</h3>
                <p className="text-sm text-gray-500 max-w-[200px] mx-auto">{step.desc}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      <section className="py-24 bg-white relative border-t border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-100px' }}
            variants={stagger}
            className="text-center mb-16"
          >
            <motion.span variants={fadeUp} className="text-sm font-semibold text-brand-500 uppercase tracking-widest mb-3 block">
              What We Offer
            </motion.span>
            <motion.h2 variants={fadeUp} className="section-title mb-4">
              Why Choose Straightway Couriers?
            </motion.h2>
            <motion.p variants={fadeUp} className="section-subtitle">
              We pride ourselves on speed, reliability, and exceptional service — delivering peace of mind with every package.
            </motion.p>
          </motion.div>

          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-50px' }}
            variants={stagger}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            {features.map((feature, i) => (
              <motion.div
                key={i}
                variants={fadeUp}
                custom={i}
                className="card-hover p-8 group"
              >
                <div className="w-14 h-14 bg-brand-50 rounded-2xl flex items-center justify-center text-brand-500 group-hover:bg-brand-500 group-hover:text-white transition-all duration-300 mb-5">
                  {feature.icon}
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">{feature.title}</h3>
                <p className="text-gray-500 text-sm leading-relaxed">{feature.desc}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      <section className="py-20 bg-gray-50 relative overflow-hidden">
        <div className="absolute inset-0" style={{
          backgroundImage: 'radial-gradient(circle at 1px 1px, rgba(30, 64, 175, 0.04) 1px, transparent 0)',
          backgroundSize: '30px 30px'
        }} />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={stagger}
          >
            <motion.div variants={fadeUp} className="text-center mb-16">
              <span className="text-sm font-semibold text-brand-500 uppercase tracking-widest mb-3 block">Coverage</span>
              <h2 className="section-title mb-4">Cities We Serve</h2>
              <p className="section-subtitle">Reliable delivery to every major city across Sri Lanka.</p>
            </motion.div>
            <motion.div variants={fadeUp} className="flex flex-wrap justify-center gap-3 max-w-3xl mx-auto">
              {cities.map((city, i) => (
                <span key={i} className="px-4 py-2 bg-white rounded-lg border border-gray-100 text-sm text-gray-600 hover:border-brand-200 hover:text-brand-600 hover:bg-brand-50 transition-all duration-200 shadow-sm">
                  {city}
                </span>
              ))}
            </motion.div>
          </motion.div>
        </div>
      </section>

      <section className="py-20 bg-gray-50 relative overflow-hidden border-t border-gray-100">
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={stagger}
          >
            <motion.div variants={fadeUp} className="text-center mb-16">
              <span className="text-sm font-semibold text-brand-500 uppercase tracking-widest mb-3 block">By the Numbers</span>
              <h2 className="section-title mb-4">Straightway in Numbers</h2>
            </motion.div>
            <motion.div variants={stagger} className="grid grid-cols-2 lg:grid-cols-4 gap-8">
              {stats.map((stat, i) => (
                <motion.div
                  key={i}
                  variants={fadeUp}
                  custom={i}
                  className="text-center p-8 bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-xl transition-all duration-300"
                >
                  <div className="text-4xl md:text-5xl font-black text-brand-500 mb-2">{stat.number}</div>
                  <div className="text-sm text-gray-500 font-medium">{stat.label}</div>
                </motion.div>
              ))}
            </motion.div>
          </motion.div>
        </div>
      </section>

      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={stagger}
            className="relative bg-gradient-to-br from-brand-500 via-brand-600 to-brand-800 rounded-3xl p-10 md:p-16 overflow-hidden"
          >
            <div className="absolute top-0 right-0 w-64 h-64 bg-accent-400/10 rounded-full blur-3xl translate-x-1/2 -translate-y-1/2" />
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-blue-400/10 rounded-full blur-3xl -translate-x-1/2 translate-y-1/2" />
            <div className="relative">
              <motion.div variants={fadeUp} className="text-center max-w-2xl mx-auto">
                <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
                  Ready to Ship With Us?
                </h2>
                <p className="text-blue-100/80 mb-8 leading-relaxed">
                  Contact us today for a free quote or to schedule a pickup. We're here to help.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Link to="/contact" className="btn-accent">
                    Get a Quote
                  </Link>
                  <a href="tel:+94772520636" className="btn-outline !border-white/30 !text-white hover:!bg-white/10">
                    Call +94 77 252 0636
                  </a>
                </div>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
