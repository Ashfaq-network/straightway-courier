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
    title: 'Reliable & On-Time Deliveries',
    desc: 'We ensure your parcels are delivered safely and within the promised time.',
    icon: <TruckIcon className="w-7 h-7" />
  },
  {
    title: 'Over 2 Years of Experience',
    desc: 'Trusted by businesses through consistent and dependable service.',
    icon: <CheckShieldIcon className="w-7 h-7" />
  },
  {
    title: 'Affordable Pricing',
    desc: 'Competitive rates with no compromise on service quality.',
    icon: (
      <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    )
  },
  {
    title: 'Safe & Secure Handling',
    desc: 'Every parcel is handled with care from pickup to delivery.',
    icon: <PackageIcon className="w-7 h-7" />
  },
  {
    title: 'Professional Customer Support',
    desc: 'Our team is responsive, friendly, and always ready to assist.',
    icon: <MapPinIcon className="w-7 h-7" />
  },
  {
    title: 'Wide Coverage',
    desc: 'Coverage across Colombo and Greater Colombo to meet your business needs.',
    icon: <RoutePathIcon className="w-7 h-7" />
  },
];

const stats = [
  { number: '2+', label: 'Years of Experience' },
  { number: '500+', label: 'Deliveries Completed' },
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
                Priority Courier & Secure Dispatch Services
              </motion.div>
              <motion.h1 variants={fadeUp} className="text-5xl md:text-6xl lg:text-7xl font-black text-white leading-[1.1] mb-6 tracking-tight">
                PRIORITY COURIER & SECURE
                <span className="block text-transparent bg-clip-text bg-gradient-to-r from-accent-300 to-accent-400">
                  DISPATCH SERVICES
                </span>
              </motion.h1>
              <motion.p variants={fadeUp} className="text-lg md:text-xl text-blue-100/80 mb-8 leading-relaxed max-w-xl italic">
                "Efficient, Secure, and On-Time Delivery Solutions for Your Business"
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
              About Company
            </motion.span>
            <motion.h2 variants={fadeUp} className="section-title mb-4">
              Our Mission & Vision
            </motion.h2>
            <motion.p variants={fadeUp} className="section-subtitle max-w-2xl mx-auto">
              Straightway Couriers is a growing delivery service provider based in Sri Lanka, committed to offering fast, safe, and affordable parcel delivery solutions. We have proudly been serving the market for over 2 years, building trust among individual customers, small businesses, and online sellers.
            </motion.p>
          </motion.div>

          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-50px' }}
            variants={stagger}
            className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto"
          >
            <motion.div variants={fadeUp} className="bg-brand-50 rounded-2xl p-8 md:p-10 text-center">
              <div className="w-16 h-16 bg-accent-500 rounded-2xl flex items-center justify-center mx-auto mb-5">
                <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Our Mission</h3>
              <p className="text-gray-600 leading-relaxed">To deliver parcels quickly, safely, and affordably while ensuring maximum customer satisfaction.</p>
            </motion.div>

            <motion.div variants={fadeUp} custom={1} className="bg-brand-50 rounded-2xl p-8 md:p-10 text-center">
              <div className="w-16 h-16 bg-brand-500 rounded-2xl flex items-center justify-center mx-auto mb-5">
                <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Our Vision</h3>
              <p className="text-gray-600 leading-relaxed">To become one of the most trusted courier service providers in Sri Lanka.</p>
            </motion.div>
          </motion.div>
        </div>
      </section>

      <section className="py-20 bg-gray-50 relative border-t border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-100px' }}
            variants={stagger}
            className="text-center"
          >
            <motion.span variants={fadeUp} className="text-sm font-semibold text-brand-500 uppercase tracking-widest mb-3 block">
              What We Do
            </motion.span>
            <motion.h2 variants={fadeUp} className="section-title mb-6">
              What We Do?
            </motion.h2>
            <motion.p variants={fadeUp} className="text-gray-600 text-lg leading-relaxed max-w-3xl mx-auto">
              At Straightway Couriers, we provide fast, secure, and reliable courier services for businesses across Colombo and Greater Colombo. We understand the importance of timely deliveries and are committed to ensuring every parcel reaches its destination safely and on schedule.
            </motion.p>
          </motion.div>
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
              Why Choose Us
            </motion.span>
            <motion.h2 variants={fadeUp} className="section-title mb-4">
              Why Businesses Choose Us?
            </motion.h2>
            <motion.p variants={fadeUp} className="section-subtitle">
              We are committed to building long-term relationships through reliable service and positive customer experiences.
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

      <section className="py-20 bg-white relative overflow-hidden border-t border-gray-100">
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={stagger}
          >
            <motion.div variants={fadeUp} className="text-center mb-10">
              <span className="text-sm font-semibold text-brand-500 uppercase tracking-widest mb-3 block">Price Rates</span>
              <h2 className="section-title mb-4">Our Delivery Rates</h2>
              <p className="text-gray-500 font-medium text-sm tracking-wider">Fast | Safe | Reliable | COD | On Time</p>
            </motion.div>
            <motion.div variants={stagger} className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-2xl mx-auto">
              <motion.div variants={fadeUp} className="bg-white rounded-2xl border-2 border-brand-100 p-8 text-center hover:border-brand-300 hover:shadow-lg transition-all duration-300">
                <p className="text-sm font-semibold text-brand-500 uppercase tracking-wider mb-2">Within Colombo</p>
                <div className="text-5xl font-black text-gray-900 mb-1">LKR 350</div>
              </motion.div>
              <motion.div variants={fadeUp} custom={1} className="bg-white rounded-2xl border-2 border-brand-100 p-8 text-center hover:border-brand-300 hover:shadow-lg transition-all duration-300">
                <p className="text-sm font-semibold text-brand-500 uppercase tracking-wider mb-2">Greater Colombo</p>
                <div className="text-5xl font-black text-gray-900 mb-1">LKR 400</div>
              </motion.div>
            </motion.div>
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

      <section className="py-20 bg-gray-50 relative overflow-hidden">
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={stagger}
          >
            <motion.div variants={fadeUp} className="text-center mb-12">
              <span className="text-sm font-semibold text-brand-500 uppercase tracking-widest mb-3 block">Testimonials</span>
              <h2 className="section-title mb-4">What Do Our Customers Say</h2>
            </motion.div>
            <motion.div variants={stagger} className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
              <motion.div variants={fadeUp} className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
                <div className="flex items-center gap-2 mb-3">
                  {[...Array(5)].map((_, i) => (
                    <svg key={i} className="w-4 h-4 text-amber-400" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  ))}
                </div>
                <p className="text-gray-600 text-sm leading-relaxed mb-4">"The reliable, trustworthy and fastest courier service!! Highly recommended and really appreciate your service."</p>
                <p className="font-semibold text-gray-900 text-sm">— The Flora</p>
              </motion.div>

              <motion.div variants={fadeUp} custom={1} className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
                <div className="flex items-center gap-2 mb-3">
                  {[...Array(5)].map((_, i) => (
                    <svg key={i} className="w-4 h-4 text-amber-400" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  ))}
                </div>
                <p className="text-gray-600 text-sm leading-relaxed mb-4">"WE HAD AN EXCELLENT EXPERIENCE WITH @STRAIGHTWAYCOURIERS. THEY ARE RELIABLE, FAST AND OFFER GREAT CUSTOMER SERVICE. WHOLE PROCESS WAS SMOOTH AND STRESS FREE. HIGHLY RECOMMEND!"</p>
                <p className="font-semibold text-gray-900 text-sm">— INNOCELL</p>
              </motion.div>

              <motion.div variants={fadeUp} custom={2} className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
                <div className="flex items-center gap-2 mb-3">
                  {[...Array(5)].map((_, i) => (
                    <svg key={i} className="w-4 h-4 text-amber-400" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  ))}
                </div>
                <p className="text-gray-600 text-sm leading-relaxed mb-4">"Straightway Couriers has consistently demonstrated excellence in logistics and delivery services. Their unwavering commitment to punctuality, precision, and secure handling has ensured our products reach customers in pristine condition and on time."</p>
                <p className="font-semibold text-gray-900 text-sm">— MasterCare</p>
              </motion.div>
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
                  Let's Work Together!
                </h2>
                <p className="text-blue-100/80 mb-8 leading-relaxed">
                  We sincerely appreciate the opportunity to present our courier services. We look forward to partnering with your business and providing fast, reliable, and professional delivery solutions.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <a href="https://wa.me/94772520636" target="_blank" rel="noopener noreferrer" className="btn-accent">
                    WhatsApp +94 772520636
                  </a>
                  <a href="tel:+94772520636" className="btn-outline !border-white/30 !text-white hover:!bg-white/10">
                    Call +94 77 252 0636
                  </a>
                </div>
                <div className="mt-6">
                  <a href="https://instagram.com/_straightway_couriers_" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 text-white/60 hover:text-white transition-colors text-sm">
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
                    </svg>
                    _.straightway_couriers._
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
