import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import TrackingTimeline from '../components/TrackingTimeline';

const API = '/api/track';

export default function Tracking() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [trackingNumber, setTrackingNumber] = useState(searchParams.get('q') || '');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    const q = searchParams.get('q');
    if (q) handleSearch(q);
  }, []);

  const handleSearch = async (number) => {
    const tn = number || trackingNumber;
    if (!tn.trim()) return;
    setLoading(true);
    setError('');
    setResult(null);
    setSearchParams({ q: tn });

    try {
      const res = await fetch(`${API}/${encodeURIComponent(tn.trim())}`);
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Tracking number not found');
      }
      const data = await res.json();
      setResult(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const statusColors = {
    pickup_requested: 'bg-yellow-50 text-yellow-700 border-yellow-200',
    picked_up: 'bg-orange-50 text-orange-700 border-orange-200',
    at_warehouse: 'bg-purple-50 text-purple-700 border-purple-200',
    at_sorting_center: 'bg-violet-50 text-violet-700 border-violet-200',
    sorted: 'bg-indigo-50 text-indigo-700 border-indigo-200',
    out_for_delivery: 'bg-blue-50 text-blue-700 border-blue-200',
    customer_contacted: 'bg-teal-50 text-teal-700 border-teal-200',
    delivered: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    returned: 'bg-red-50 text-red-700 border-red-200',
    returned_to_sender: 'bg-red-50 text-red-700 border-red-200',
    rescheduled: 'bg-cyan-50 text-cyan-700 border-cyan-200',
    failed: 'bg-gray-100 text-gray-700 border-gray-200',
    failed_delivery: 'bg-gray-100 text-gray-700 border-gray-200',
  };

  const statusDots = {
    delivered: 'bg-emerald-500',
    out_for_delivery: 'bg-blue-500',
    pickup_requested: 'bg-yellow-500',
    failed: 'bg-red-500',
    failed_delivery: 'bg-red-500',
    returned: 'bg-red-500',
    returned_to_sender: 'bg-red-500',
  };

  const s = result?.shipment;

  return (
    <div className="min-h-screen pt-24 pb-16 bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-10">
          <span className="text-sm font-semibold text-brand-500 uppercase tracking-widest mb-3 block">Track Your Shipment</span>
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-3">Where's Your Package?</h1>
          <p className="text-gray-500 max-w-lg mx-auto">Enter your tracking number to see real-time status and delivery updates.</p>
        </motion.div>

        <motion.form
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
          onSubmit={(e) => { e.preventDefault(); handleSearch(); }}
          className="bg-white rounded-2xl shadow-lg shadow-gray-200/50 border border-gray-100 p-6 mb-8"
        >
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <svg className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input type="text" placeholder="Enter tracking number (e.g. SW0001)" value={trackingNumber}
                onChange={(e) => setTrackingNumber(e.target.value)}
                className="w-full pl-12 pr-5 py-4 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent bg-gray-50" />
            </div>
            <button type="submit" disabled={loading} className="btn-primary whitespace-nowrap">
              {loading ? (
                <span className="flex items-center gap-2">
                  <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  Searching...
                </span>
              ) : 'Track'}
            </button>
          </div>
        </motion.form>

        <AnimatePresence mode="wait">
          {error && (
            <motion.div key="error" initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
              className="bg-red-50 border border-red-200 rounded-2xl p-6 mb-6 text-center">
              <svg className="w-12 h-12 text-red-400 mx-auto mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <p className="text-red-700 font-medium">{error}</p>
              <p className="text-red-500 text-sm mt-1">Double-check the tracking number and try again.</p>
            </motion.div>
          )}

          {result && s && (
            <motion.div key={s.tracking_number} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
              className="bg-white rounded-2xl shadow-lg shadow-gray-200/50 border border-gray-100 overflow-hidden">
              <div className="p-6 md:p-8">
                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6 pb-6 border-b border-gray-100">
                  <div>
                    <p className="text-xs text-gray-400 uppercase tracking-wider mb-1">Tracking Number</p>
                    <p className="text-2xl font-bold text-gray-900 tracking-tight">{s.tracking_number}</p>
                  </div>
                  <span className={`mt-3 md:mt-0 inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full text-sm font-semibold border ${statusColors[s.status] || 'bg-gray-50 text-gray-700 border-gray-200'}`}>
                    <span className={`w-2 h-2 rounded-full ${statusDots[s.status] || 'bg-gray-500'}`} />
                    {s.status.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase())}
                  </span>
                </div>

                {/* Info Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
                  <div className="bg-gray-50 rounded-xl p-5 border border-gray-100">
                    <p className="text-xs text-gray-400 uppercase tracking-wider mb-1">Sender</p>
                    <p className="font-semibold text-gray-900">{s.sender_name}</p>
                    {s.sender_phone && <p className="text-sm text-gray-500">{s.sender_phone}</p>}
                    {s.sender_address && <p className="text-xs text-gray-400 mt-0.5">{s.sender_address}</p>}
                  </div>
                  <div className="bg-gray-50 rounded-xl p-5 border border-gray-100">
                    <p className="text-xs text-gray-400 uppercase tracking-wider mb-1">Receiver</p>
                    <p className="font-semibold text-gray-900">{s.receiver_name}</p>
                    {s.receiver_phone && <p className="text-sm text-gray-500">{s.receiver_phone}</p>}
                    {s.receiver_address && <p className="text-xs text-gray-400 mt-0.5">{s.receiver_address}</p>}
                  </div>
                  <div className="bg-gray-50 rounded-xl p-5 border border-gray-100">
                    <p className="text-xs text-gray-400 uppercase tracking-wider mb-1">Origin</p>
                    <p className="font-semibold text-gray-900">{s.origin}</p>
                  </div>
                  <div className="bg-gray-50 rounded-xl p-5 border border-gray-100">
                    <p className="text-xs text-gray-400 uppercase tracking-wider mb-1">Destination</p>
                    <p className="font-semibold text-gray-900">{s.destination}</p>
                  </div>
                  {s.parcel_type && (
                    <div className="bg-gray-50 rounded-xl p-5 border border-gray-100">
                      <p className="text-xs text-gray-400 uppercase tracking-wider mb-1">Parcel Type</p>
                      <p className="font-semibold text-gray-900 capitalize">{s.parcel_type}</p>
                    </div>
                  )}
                  {s.weight && (
                    <div className="bg-gray-50 rounded-xl p-5 border border-gray-100">
                      <p className="text-xs text-gray-400 uppercase tracking-wider mb-1">Weight</p>
                      <p className="font-semibold text-gray-900">{s.weight}</p>
                    </div>
                  )}
                  {s.estimated_delivery && (
                    <div className="bg-gray-50 rounded-xl p-5 border border-gray-100">
                      <p className="text-xs text-gray-400 uppercase tracking-wider mb-1">Estimated Delivery</p>
                      <p className="font-semibold text-gray-900">{s.estimated_delivery}</p>
                    </div>
                  )}
                  {s.num_items && (
                    <div className="bg-gray-50 rounded-xl p-5 border border-gray-100">
                      <p className="text-xs text-gray-400 uppercase tracking-wider mb-1">Items</p>
                      <p className="font-semibold text-gray-900">{s.num_items}</p>
                    </div>
                  )}
                </div>

                {/* Delivery Staff Info */}
                {(s.pickup_staff_name || s.delivery_staff_name) && (
                  <div className="bg-gray-50 rounded-xl p-5 border border-gray-100 mb-8">
                    <p className="text-xs text-gray-400 uppercase tracking-wider mb-3">Assigned Staff</p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {s.pickup_staff_name && (
                        <div>
                          <p className="text-sm font-medium text-gray-900">Pickup: {s.pickup_staff_name}</p>
                          {s.pickup_staff_phone && <p className="text-xs text-gray-500">{s.pickup_staff_phone}</p>}
                        </div>
                      )}
                      {s.delivery_staff_name && (
                        <div>
                          <p className="text-sm font-medium text-gray-900">Delivery: {s.delivery_staff_name}</p>
                          {s.delivery_staff_phone && <p className="text-xs text-gray-500">{s.delivery_staff_phone}</p>}
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Tracking Timeline */}
                <div>
                  <h3 className="font-semibold text-gray-900 mb-5 flex items-center gap-2">
                    <svg className="w-5 h-5 text-brand-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
                    </svg>
                    Tracking History
                  </h3>
                  <TrackingTimeline events={result.events} />
                </div>

                {/* Delivery Attempts */}
                {result.delivery_attempts?.length > 0 && (
                  <div className="mt-8 pt-8 border-t border-gray-100">
                    <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                      <svg className="w-5 h-5 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.34 16.5c-.77.833.192 2.5 1.732 2.5z" />
                      </svg>
                      Delivery Attempts
                    </h3>
                    <div className="space-y-3">
                      {result.delivery_attempts.map((attempt) => (
                        <div key={attempt.id} className="bg-red-50 border border-red-100 rounded-lg p-4">
                          <p className="font-semibold text-sm text-red-800">Delivery Attempt {attempt.attempt_number}</p>
                          <p className="text-sm text-red-600">Status: {attempt.reason}</p>
                          {attempt.custom_note && <p className="text-sm text-red-500">{attempt.custom_note}</p>}
                          {attempt.attempted_by && <p className="text-xs text-red-400 mt-1">By: {attempt.attempted_by}</p>}
                          <p className="text-xs text-red-300 mt-0.5">{new Date(attempt.timestamp).toLocaleString()}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          )}

          {!loading && !result && !error && (
            <motion.div key="empty" initial={{ opacity: 0 }} animate={{ opacity: 1 }}
              className="text-center py-16 bg-white rounded-2xl border border-gray-100">
              <svg className="w-16 h-16 text-gray-300 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
              </svg>
              <p className="text-gray-500">Enter a tracking number above to see your shipment status.</p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
