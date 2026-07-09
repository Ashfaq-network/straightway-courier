import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: (i = 0) => ({
    opacity: 1, y: 0,
    transition: { duration: 0.5, delay: i * 0.08, ease: [0.25, 0.4, 0.25, 1] }
  })
};

const stagger = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.08 } }
};

const services = [
  {
    title: 'Same-Day Delivery',
    description: 'Urgent deliveries within Colombo Metro area. We pick up and deliver the same day — guaranteed.',
    gradient: 'from-amber-400 to-orange-500',
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <rect x="1" y="5" width="16" height="12" rx="2" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" />
        <path d="M17 9h4l2 3v4h-3" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" />
        <circle cx="7" cy="19" r="3" strokeWidth={1.5} />
        <circle cx="19" cy="19" r="3" strokeWidth={1.5} />
        <path d="M4 19H3M21 19h1" strokeWidth={1.5} strokeLinecap="round" />
      </svg>
    ),
    features: ['Colombo Metro coverage', 'Same-day guarantee', 'Real-time tracking', 'SMS notifications']
  },
  {
    title: 'Express Delivery',
    description: 'Fast inter-city delivery across Sri Lanka. Next-day delivery to all major cities.',
    gradient: 'from-blue-400 to-indigo-500',
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
    features: ['Nationwide coverage', 'Next-day to major cities', 'Package tracking', 'Insurance available']
  },
  {
    title: 'Standard Delivery',
    description: 'Economical delivery option for non-urgent shipments. Reliable and affordable.',
    gradient: 'from-emerald-400 to-teal-500',
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path d="M4 7l8-4 8 4M4 7v10l8 4M4 7l8 4m0-4v10m8-10v10l-8 4" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" />
        <path d="M8 9l8 4M8 13l8 4" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" opacity="0.5" />
      </svg>
    ),
    features: ['Affordable rates', '2-3 day delivery', 'Tracking included', 'Door-to-door service']
  },
  {
    title: 'Freight & Bulk',
    description: 'Large volume shipments and freight services for businesses of all sizes.',
    gradient: 'from-purple-400 to-violet-500',
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path d="M16 4h4v4" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" />
        <path d="M20 4l-6 6" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" />
        <rect x="2" y="10" width="14" height="10" rx="2" strokeWidth={1.5} />
        <path d="M2 14h14" strokeWidth={1.5} />
        <circle cx="7" cy="20" r="2" strokeWidth={1.5} />
        <circle cx="13" cy="20" r="2" strokeWidth={1.5} />
      </svg>
    ),
    features: ['Bulk discounts', 'Palletized freight', 'Warehouse pickup', 'Business accounts']
  },
  {
    title: 'E-Commerce Delivery',
    description: 'Tailored solutions for online businesses. Seamless fulfillment for your store.',
    gradient: 'from-rose-400 to-pink-500',
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 100 4 2 2 0 000-4z" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
    features: ['Bulk pickup service', 'Order tracking', 'Returns management', 'Cash on delivery']
  },
  {
    title: 'Document & Parcel',
    description: 'Secure delivery for documents, contracts, and small parcels across Sri Lanka.',
    gradient: 'from-cyan-400 to-sky-500',
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" />
        <path d="M7 13h10M7 17h6" strokeWidth={1.5} strokeLinecap="round" />
        <path d="M12 3v6h6" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" opacity="0.5" />
      </svg>
    ),
    features: ['Secure handling', 'Signature on delivery', 'Track & trace', 'Confidential treatment']
  },
];

export default function Services() {
  return (
    <div className="min-h-screen pt-24 pb-16 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial="hidden"
          animate="visible"
          variants={stagger}
          className="text-center mb-16"
        >
          <motion.span variants={fadeUp} className="text-sm font-semibold text-brand-500 uppercase tracking-widest mb-3 block">
            Our Services
          </motion.span>
          <motion.h1 variants={fadeUp} className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Delivery Solutions for Every Need
          </motion.h1>
          <motion.p variants={fadeUp} className="text-gray-500 max-w-2xl mx-auto text-lg">
            From urgent documents to bulk freight, we offer a complete range of delivery services across Sri Lanka.
          </motion.p>
        </motion.div>

        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-50px' }}
          variants={stagger}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          {services.map((service, i) => (
            <motion.div
              key={i}
              variants={fadeUp}
              custom={i}
              className="group bg-white rounded-2xl border border-gray-100 p-8 hover:shadow-xl hover:-translate-y-1 transition-all duration-300"
            >
              <div className={`w-14 h-14 bg-gradient-to-br ${service.gradient} rounded-2xl flex items-center justify-center text-white mb-5 shadow-lg`}>
                {service.icon}
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">{service.title}</h3>
              <p className="text-gray-500 text-sm leading-relaxed mb-5">{service.description}</p>
              <ul className="space-y-2.5">
                {service.features.map((f, j) => (
                  <li key={j} className="flex items-center gap-2.5 text-sm text-gray-600">
                    <svg className="w-4 h-4 text-emerald-500 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                    </svg>
                    {f}
                  </li>
                ))}
              </ul>
            </motion.div>
          ))}
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mt-16 bg-gradient-to-br from-brand-500 via-brand-600 to-brand-800 rounded-3xl p-10 md:p-14 text-center relative overflow-hidden"
        >
          <div className="absolute top-0 right-0 w-48 h-48 bg-accent-400/10 rounded-full blur-3xl" />
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-blue-400/10 rounded-full blur-3xl" />
          <div className="relative">
            <h2 className="text-3xl font-bold text-white mb-3">Need a Custom Solution?</h2>
            <p className="text-blue-100/80 mb-7 max-w-lg mx-auto">Contact us for tailored delivery solutions for your business.</p>
            <Link to="/contact" className="btn-accent inline-block">
              Get in Touch
            </Link>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
