import { motion } from 'framer-motion';

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

const values = [
  {
    title: 'Reliable',
    desc: 'Every shipment is handled with the utmost care and professionalism.',
    icon: (
      <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
      </svg>
    )
  },
  {
    title: 'Fast',
    desc: 'Same-day delivery in Colombo Metro and express services nationwide.',
    icon: (
      <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
      </svg>
    )
  },
  {
    title: 'Affordable',
    desc: 'Competitive pricing with complete transparency — no hidden charges.',
    icon: (
      <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    )
  },
  {
    title: 'Trackable',
    desc: 'Real-time tracking with live updates so you always know where your package is.',
    icon: (
      <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
      </svg>
    )
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
            About Us
          </motion.span>
          <motion.h1 variants={fadeUp} className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
            Who We Are
          </motion.h1>
          <motion.div variants={fadeUp} className="prose max-w-none">
            <p className="text-lg text-gray-600 leading-relaxed">
              <span className="font-semibold text-gray-900">Straightway Couriers</span> is a trusted courier service based in <strong>Colombo, Sri Lanka</strong>, committed to providing fast, reliable, and affordable delivery solutions for businesses and individuals alike.
            </p>
            <p className="text-gray-600 leading-relaxed mt-4">
              We understand that in today's fast-paced world, every package matters. Whether it's an urgent document, an online order, or a freight shipment, we ensure your items reach their destination safely and on time.
            </p>
          </motion.div>
        </motion.div>

        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={stagger}
          className="mb-16"
        >
          <motion.h2 variants={fadeUp} className="text-3xl font-bold text-gray-900 mb-2">Our Mission</motion.h2>
          <motion.p variants={fadeUp} className="text-gray-600 text-lg leading-relaxed">
            To provide seamless courier services that connect people and businesses across Sri Lanka with speed, care, and professionalism.
          </motion.p>
        </motion.div>

        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={stagger}
        >
          <motion.h2 variants={fadeUp} className="text-3xl font-bold text-gray-900 mb-8">Our Values</motion.h2>
          <motion.div variants={stagger} className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            {values.map((v, i) => (
              <motion.div
                key={i}
                variants={fadeUp}
                custom={i}
                className="card-hover p-6 flex items-start gap-4"
              >
                <div className="w-12 h-12 bg-brand-50 rounded-xl flex items-center justify-center text-brand-500 flex-shrink-0">
                  {v.icon}
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-1">{v.title}</h3>
                  <p className="text-sm text-gray-500 leading-relaxed">{v.desc}</p>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
}
