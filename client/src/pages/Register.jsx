import { useState } from 'react';
import { motion } from 'framer-motion';

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: (i = 0) => ({
    opacity: 1, y: 0,
    transition: { duration: 0.5, delay: i * 0.1, ease: [0.25, 0.4, 0.25, 1] }
  })
};

const stagger = { hidden: {}, visible: { transition: { staggerChildren: 0.1 } } };

const defaultForm = {
  client_type: 'business',
  company_name: '', contact_person: '', phone: '', email: '', address: '',
  nic_number: '', business_reg_number: '',
  bank_name: '', bank_branch: '', bank_account_number: '', bank_account_holder: '',
};

export default function Register() {
  const [form, setForm] = useState(defaultForm);
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form)
      });
      if (!res.ok) { const d = await res.json(); throw new Error(d.error || 'Failed to register'); }
      setSubmitted(true);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const Field = ({ label, name, type = 'text', required, placeholder, colSpan }) => (
    <div className={colSpan || ''}>
      <label className="block text-sm font-medium text-gray-700 mb-1.5">{label}{required && ' *'}</label>
      <input type={type} required={required} placeholder={placeholder || ''} value={form[name]}
        onChange={(e) => setForm({...form, [name]: e.target.value})}
        className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm bg-white focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all" />
    </div>
  );

  return (
    <div className="min-h-screen pt-24 pb-16 bg-gray-50">
      <motion.div initial="hidden" animate="visible" variants={stagger} className="max-w-3xl mx-auto px-4 sm:px-6">

        <motion.div variants={fadeUp} className="text-center mb-10">
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-3">Register as a Client</h1>
          <p className="text-gray-500 max-w-lg mx-auto">Fill in your details below. Our team will review your registration and set up your account.</p>
        </motion.div>

        {submitted ? (
          <motion.div variants={fadeUp} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-12 text-center">
            <div className="w-20 h-20 bg-green-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <svg className="w-10 h-10 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">Registration Submitted!</h3>
            <p className="text-gray-500 text-sm mb-2">Thank you for registering with Straightway Couriers.</p>
            <p className="text-gray-400 text-xs">We'll review your details and contact you shortly to set up your login credentials.</p>
          </motion.div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Business Details */}
            <motion.div variants={fadeUp} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 space-y-4">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-9 h-9 bg-teal-100 rounded-xl flex items-center justify-center">
                  <svg className="w-5 h-5 text-teal-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M3.75 21h16.5M4.5 3h15M5.25 3v18m13.5-18v18M9 6.75h1.5m-1.5 3h1.5m-1.5 3h1.5m3-6H15m-1.5 3H15m-1.5 3H15M9 21v-3.375c0-.621.504-1.125 1.125-1.125h3.75c.621 0 1.125.504 1.125 1.125V21" /></svg>
                </div>
                <h2 className="font-semibold text-gray-900">Business Details</h2>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Client Type *</label>
                  <select value={form.client_type} onChange={(e) => setForm({...form, client_type: e.target.value})}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm bg-white focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent">
                    <option value="business">Business</option>
                    <option value="individual">Individual</option>
                  </select>
                </div>
                <Field label="Company Name" name="company_name" placeholder="Your company name" />
                <Field label="Contact Person *" name="contact_person" required placeholder="Full name" />
                <Field label="Phone Number *" name="phone" required placeholder="077 123 4567" />
                <Field label="Email" name="email" type="email" placeholder="you@company.com" />
                <div className="sm:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Address</label>
                  <input type="text" placeholder="Business address" value={form.address}
                    onChange={(e) => setForm({...form, address: e.target.value})}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm bg-white focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent" />
                </div>
                <Field label="NIC Number" name="nic_number" placeholder="NIC number" />
                <Field label="Business Registration #" name="business_reg_number" placeholder="BR number" />
              </div>
            </motion.div>

            {/* Bank Details */}
            <motion.div variants={fadeUp} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 space-y-4">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-9 h-9 bg-blue-100 rounded-xl flex items-center justify-center">
                  <svg className="w-5 h-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M12 21v-8.25M15.75 21v-8.25M8.25 21v-8.25M3 9l9-6 9 6m-1.5 12V10.332A48.36 48.36 0 0012 9.75c-2.551 0-5.056.2-7.5.582V21M3 21h18M12 6.75h.008v.008H12V6.75z" /></svg>
                </div>
                <h2 className="font-semibold text-gray-900">Bank Details</h2>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Field label="Bank Name" name="bank_name" placeholder="e.g. Commercial Bank" />
                <Field label="Branch" name="bank_branch" placeholder="e.g. Colombo Fort" />
                <Field label="Account Number" name="bank_account_number" placeholder="Account number" />
                <Field label="Account Holder Name" name="bank_account_holder" placeholder="Name on account" />
              </div>
            </motion.div>

            {error && (
              <motion.div variants={fadeUp} className="bg-red-50 text-red-600 text-sm px-4 py-3 rounded-xl border border-red-100">
                {error}
              </motion.div>
            )}

            <motion.div variants={fadeUp}>
              <button type="submit" disabled={loading}
                className="w-full px-6 py-3.5 bg-teal-500 text-white rounded-xl text-sm font-semibold hover:bg-teal-600 transition-colors disabled:opacity-50 shadow-sm shadow-teal-200">
                {loading ? 'Submitting...' : 'Register'}
              </button>
              <p className="text-center text-xs text-gray-400 mt-3">Already have an account? <a href="/client" className="text-teal-500 font-medium hover:text-teal-600">Login here</a></p>
            </motion.div>
          </form>
        )}
      </motion.div>
    </div>
  );
}
