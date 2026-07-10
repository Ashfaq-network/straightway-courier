import { motion } from 'framer-motion';

const faqs = [
  {
    q: 'How do I track my parcel?',
    a: 'Enter your tracking number on our Track Parcel page. You can also enter it directly in the search bar on the homepage. Your tracking number starts with "SWC-" followed by a unique number.',
  },
  {
    q: 'How long does delivery take?',
    a: 'Standard delivery within Colombo takes 1-2 business days. Outstation deliveries typically take 2-4 business days. Express and same-day delivery options are available for urgent shipments.',
  },
  {
    q: 'What areas do you serve?',
    a: 'We currently serve all major cities and towns across Sri Lanka, including Colombo, Kandy, Galle, Jaffna, Negombo, Kurunegala, and many more. Contact us for specific location inquiries.',
  },
  {
    q: 'How much does delivery cost?',
    a: 'Delivery charges start from LKR 350 for standard deliveries within Colombo Metro and LKR 400 for outstation deliveries. Pricing depends on weight, distance, and delivery type.',
  },
  {
    q: 'Can I send parcels internationally?',
    a: 'Yes, we are expanding to offer international shipping services. Please contact us directly for international delivery inquiries and pricing.',
  },
  {
    q: 'What items are restricted?',
    a: 'We do not accept hazardous materials, illegal substances, flammable items, or perishable goods without proper packaging. Please contact us if you are unsure about your item.',
  },
  {
    q: 'How do I schedule a pickup?',
    a: 'Contact us via phone, WhatsApp, or our contact form to schedule a pickup. Our team will arrange a convenient time to collect your parcel.',
  },
  {
    q: 'What if my delivery is delayed?',
    a: 'If your delivery is delayed, we will notify you via email or SMS. You can also check the latest status on our tracking page. For further assistance, contact our support team.',
  },
  {
    q: 'Can I change my delivery address?',
    a: 'Yes, you can request an address change by contacting our support team. Please note that changes may affect the delivery timeline.',
  },
  {
    q: 'What happens if no one is available to receive the parcel?',
    a: 'Our delivery staff will make multiple attempts. If delivery is unsuccessful after several attempts, we will contact you to arrange a suitable time. Storage or re-delivery charges may apply.',
  },
];

export default function FAQs() {
  return (
    <div className="min-h-screen pt-24 pb-16 bg-gray-50">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-12">
          <span className="text-sm font-semibold text-brand-500 uppercase tracking-widest mb-3 block">Got Questions?</span>
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-3">Frequently Asked Questions</h1>
          <p className="text-gray-500 max-w-lg mx-auto">Find answers to common questions about our courier services.</p>
        </motion.div>

        <div className="space-y-4">
          {faqs.map((faq, i) => (
            <motion.details
              key={i}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden group"
            >
              <summary className="px-6 py-4 cursor-pointer font-medium text-gray-900 flex items-center justify-between hover:bg-gray-50 transition-colors">
                <span>{faq.q}</span>
                <svg className="w-5 h-5 text-gray-400 group-open:rotate-180 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </summary>
              <div className="px-6 pb-4 text-gray-600 text-sm leading-relaxed border-t border-gray-100 pt-3">
                {faq.a}
              </div>
            </motion.details>
          ))}
        </div>
      </div>
    </div>
  );
}
