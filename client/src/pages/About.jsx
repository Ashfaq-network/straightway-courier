import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: (i = 0) => ({
    opacity: 1, y: 0,
    transition: { duration: 0.5, delay: i * 0.1, ease: [0.25, 0.4, 0.25, 1] }
  })
};

const stagger = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.1 } }
};

const reasons = [
  {
    title: 'Reliable & On-Time Deliveries',
    desc: 'We ensure your parcels are delivered safely and within the promised time.',
  },
  {
    title: 'Over 2 Years of Experience',
    desc: 'Trusted by businesses through consistent and dependable service.',
  },
  {
    title: 'Affordable Pricing',
    desc: 'Competitive rates with no compromise on service quality.',
  },
  {
    title: 'Safe & Secure Handling',
    desc: 'Every parcel is handled with care from pickup to delivery.',
  },
  {
    title: 'Professional Customer Support',
    desc: 'Our team is responsive, friendly, and always ready to assist.',
  },
  {
    title: 'Customer Satisfaction',
    desc: 'We are committed to building long-term relationships through reliable service and positive customer experiences.',
  },
];

export default function About() {
  return (
    <div className="min-h-screen pt-24 pb-16">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial="hidden"
          animate="visible"
          variants={stagger}
          className="mb-16"
        >
          <motion.span variants={fadeUp} className="text-sm font-semibold text-brand-500 uppercase tracking-widest mb-3 block">
            About Company
          </motion.span>
          <motion.h1 variants={fadeUp} className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
            About Company
          </motion.h1>
          <motion.div variants={fadeUp} className="prose max-w-none">
            <p className="text-lg text-gray-600 leading-relaxed">
              <span className="font-semibold text-gray-900">Straightway Couriers</span> is a growing delivery service provider based in Sri Lanka, committed to offering fast, safe, and affordable parcel delivery solutions.
            </p>
            <p className="text-gray-600 leading-relaxed mt-4">
              We have proudly been serving the market for over 2 years, building trust among individual customers, small businesses, and online sellers.
            </p>
          </motion.div>
        </motion.div>

        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={stagger}
          className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16"
        >
          <motion.div variants={fadeUp} className="bg-brand-50 rounded-2xl p-8 md:p-10">
            <h2 className="text-xl font-bold text-gray-900 mb-3">Our Mission</h2>
            <p className="text-gray-600 leading-relaxed">To deliver parcels quickly, safely, and affordably while ensuring maximum customer satisfaction.</p>
          </motion.div>
          <motion.div variants={fadeUp} custom={1} className="bg-brand-50 rounded-2xl p-8 md:p-10">
            <h2 className="text-xl font-bold text-gray-900 mb-3">Our Vision</h2>
            <p className="text-gray-600 leading-relaxed">To become one of the most trusted courier service providers in Sri Lanka.</p>
          </motion.div>
        </motion.div>

        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={stagger}
          className="mb-16"
        >
          <motion.h2 variants={fadeUp} className="text-3xl font-bold text-gray-900 mb-2">What We Do?</motion.h2>
          <motion.p variants={fadeUp} className="text-gray-600 text-lg leading-relaxed">
            At Straightway Couriers, we provide fast, secure, and reliable courier services for businesses across Colombo and Greater Colombo. We understand the importance of timely deliveries and are committed to ensuring every parcel reaches its destination safely and on schedule.
          </motion.p>
        </motion.div>

        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={stagger}
        >
          <motion.h2 variants={fadeUp} className="text-3xl font-bold text-gray-900 mb-8">Why Businesses Choose Us?</motion.h2>
          <motion.div variants={stagger} className="space-y-4">
            {reasons.map((r, i) => (
              <motion.div
                key={i}
                variants={fadeUp}
                custom={i}
                className="flex items-start gap-4 p-5 bg-white rounded-xl border border-gray-100"
              >
                <div className="w-8 h-8 bg-brand-100 rounded-lg flex items-center justify-center text-brand-600 flex-shrink-0 mt-0.5">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">{r.title}</h3>
                  <p className="text-sm text-gray-500 mt-0.5">{r.desc}</p>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </motion.div>

        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={stagger}
          className="mt-16 bg-gradient-to-br from-brand-500 via-brand-600 to-brand-800 rounded-3xl p-10 md:p-14 text-center relative overflow-hidden"
        >
          <div className="absolute top-0 right-0 w-48 h-48 bg-accent-400/10 rounded-full blur-3xl" />
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-blue-400/10 rounded-full blur-3xl" />
          <div className="relative">
            <h2 className="text-3xl font-bold text-white mb-3">Let's Work Together!</h2>
            <p className="text-blue-100/80 mb-7 max-w-lg mx-auto">Partner with us for fast, reliable, and professional delivery solutions.</p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a href="https://wa.me/94772520636" target="_blank" rel="noopener noreferrer" className="inline-block px-6 py-3 bg-accent-500 text-white font-semibold rounded-xl hover:bg-accent-600 transition-colors">
                WhatsApp +94 772520636
              </a>
              <Link to="/contact" className="inline-block px-6 py-3 bg-white/10 text-white font-semibold rounded-xl hover:bg-white/20 transition-colors border border-white/20">
                Contact Us
              </Link>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
