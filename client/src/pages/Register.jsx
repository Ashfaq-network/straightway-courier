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

function Field({ label, name, value, onChange, type = 'text', required, placeholder }) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1.5">{label}{required && ' *'}</label>
      <input type={type} required={required} placeholder={placeholder || ''} value={value}
        onChange={onChange}
        className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm bg-white focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all" />
    </div>
  );
}

export default function Register() {
  const [form, setForm] = useState(defaultForm);
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const update = (name) => (e) => setForm(prev => ({ ...prev, [name]: e.target.value }));

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
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const inputClass = "w-full px-4 py-3 border border-gray-200 rounded-xl text-sm bg-white focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all";

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
            {/* Client Type Selector */}
            <motion.div variants={fadeUp} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-9 h-9 bg-teal-100 rounded-xl flex items-center justify-center">
                  <svg className="w-5 h-5 text-teal-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" /></svg>
                </div>
                <h2 className="font-semibold text-gray-900">I am registering as</h2>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <button type="button" onClick={() => setForm(prev => ({ ...prev, client_type: 'business', company_name: '', business_reg_number: '' }))}
                  className={`p-4 rounded-xl border-2 text-left transition-all ${form.client_type === 'business' ? 'border-teal-500 bg-teal-50 ring-1 ring-teal-200' : 'border-gray-200 hover:border-gray-300'}`}>
                  <div className="text-lg mb-1">🏢</div>
                  <div className="text-sm font-semibold text-gray-900">Business</div>
                  <div className="text-xs text-gray-400 mt-0.5">Register your company</div>
                </button>
                <button type="button" onClick={() => setForm(prev => ({ ...prev, client_type: 'individual', company_name: '', business_reg_number: '' }))}
                  className={`p-4 rounded-xl border-2 text-left transition-all ${form.client_type === 'individual' ? 'border-teal-500 bg-teal-50 ring-1 ring-teal-200' : 'border-gray-200 hover:border-gray-300'}`}>
                  <div className="text-lg mb-1">👤</div>
                  <div className="text-sm font-semibold text-gray-900">Individual</div>
                  <div className="text-xs text-gray-400 mt-0.5">Personal account</div>
                </button>
              </div>
            </motion.div>

            {/* Personal / Business Details */}
            <motion.div variants={fadeUp} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 space-y-4">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-9 h-9 bg-teal-100 rounded-xl flex items-center justify-center">
                  {form.client_type === 'business' ? (
                    <svg className="w-5 h-5 text-teal-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M3.75 21h16.5M4.5 3h15M5.25 3v18m13.5-18v18M9 6.75h1.5m-1.5 3h1.5m-1.5 3h1.5m3-6H15m-1.5 3H15m-1.5 3H15M9 21v-3.375c0-.621.504-1.125 1.125-1.125h3.75c.621 0 1.125.504 1.125 1.125V21" /></svg>
                  ) : (
                    <svg className="w-5 h-5 text-teal-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" /></svg>
                  )}
                </div>
                <h2 className="font-semibold text-gray-900">{form.client_type === 'business' ? 'Business Details' : 'Personal Details'}</h2>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {form.client_type === 'business' && (
                  <>
                    <Field label="Company Name" name="company_name" value={form.company_name} onChange={update('company_name')} required placeholder="Your company name" />
                    <Field label="Business Registration #" name="business_reg_number" value={form.business_reg_number} onChange={update('business_reg_number')} placeholder="BR number" />
                  </>
                )}
                <Field label="Full Name" name="contact_person" value={form.contact_person} onChange={update('contact_person')} required placeholder={form.client_type === 'business' ? 'Contact person at company' : 'Your full name'} />
                <Field label="Phone Number" name="phone" value={form.phone} onChange={update('phone')} required placeholder="077 123 4567" />
                <Field label="Email" name="email" value={form.email} onChange={update('email')} type="email" placeholder={form.client_type === 'business' ? 'business@company.com' : 'you@email.com'} />
                <Field label="NIC Number" name="nic_number" value={form.nic_number} onChange={update('nic_number')} placeholder="National Identity Card number" />
                <div className="sm:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Address</label>
                  <input type="text" placeholder={form.client_type === 'business' ? 'Business address' : 'Your address'} value={form.address} onChange={update('address')} className={inputClass} />
                </div>
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
                <Field label="Bank Name" name="bank_name" value={form.bank_name} onChange={update('bank_name')} placeholder="e.g. Commercial Bank" />
                <Field label="Branch" name="bank_branch" value={form.bank_branch} onChange={update('bank_branch')} placeholder="e.g. Colombo Fort" />
                <Field label="Account Number" name="bank_account_number" value={form.bank_account_number} onChange={update('bank_account_number')} placeholder="Account number" />
                <Field label="Account Holder Name" name="bank_account_holder" value={form.bank_account_holder} onChange={update('bank_account_holder')} placeholder="Name on account" />
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
