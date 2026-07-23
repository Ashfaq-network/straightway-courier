import { useState, useEffect } from 'react';

const API = '/api/admin';

const statusColors = {
  sorted: 'bg-indigo-50 text-indigo-700 ring-indigo-600/20',
  out_for_delivery: 'bg-blue-50 text-blue-700 ring-blue-600/20',
  customer_contacted: 'bg-teal-50 text-teal-700 ring-teal-600/20',
  delivered: 'bg-green-50 text-green-700 ring-green-600/20',
  failed_delivery: 'bg-red-50 text-red-700 ring-red-600/20',
  rescheduled: 'bg-cyan-50 text-cyan-700 ring-cyan-600/20',
};

const statusOptions = [
  { value: '', label: 'All Deliveries' },
  { value: 'sorted', label: 'Sorted (Ready)' },
  { value: 'out_for_delivery', label: 'Out for Delivery' },
  { value: 'customer_contacted', label: 'Customer Contacted' },
  { value: 'delivered', label: 'Delivered' },
  { value: 'failed_delivery', label: 'Failed' },
  { value: 'rescheduled', label: 'Rescheduled' },
];

export default function Deliveries() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [completeForm, setCompleteForm] = useState(null);
  const [filter, setFilter] = useState('');

  const getToken = () => sessionStorage.getItem('swc_token');

  useEffect(() => { fetchItems(); }, [filter]);

  const fetchItems = async () => {
    setLoading(true);
    try {
      const params = filter ? `?status=${filter}` : '';
      const res = await fetch(`${API}/deliveries${params}`, { headers: { 'Authorization': `Bearer ${getToken()}` } });
      if (res.ok) setItems(await res.json());
    } catch (err) { console.error(err); } finally { setLoading(false); }
  };

  const handleComplete = async (e) => {
    e.preventDefault();
    const res = await fetch(`${API}/deliveries/${completeForm.id}/complete`, {
      method: 'PUT', headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${getToken()}` },
      body: JSON.stringify(completeForm)
    });
    if (!res.ok) { alert('Failed to complete delivery'); return; }
    setCompleteForm(null);
    fetchItems();
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-xl bg-blue-50 flex items-center justify-center">
            <svg className="w-5 h-5 text-blue-600" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M8.25 18.75a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h6m-9 0H3.375a1.125 1.125 0 01-1.125-1.125V14.25m17.25 4.5a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h1.125c.621 0 1.129-.504 1.09-1.124a17.902 17.902 0 00-3.213-9.193 2.056 2.056 0 00-1.58-.86H14.25M16.5 18.75h-2.25m0-11.177v-.958c0-.568-.422-1.048-.987-1.106a48.554 48.554 0 00-10.026 0 1.106 1.106 0 00-.987 1.106v7.635m12-6.677v6.677m0 4.5v-4.5m0 0h-12" /></svg>
          </div>
          <div>
            <h2 className="text-lg font-bold text-gray-900">Deliveries</h2>
            <p className="text-[13px] text-gray-400 mt-0.5">Track and manage all deliveries across the system</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          {filter && (
            <button onClick={() => setFilter('')} className="px-3.5 py-2 bg-gray-100 text-gray-600 rounded-xl text-xs font-medium hover:bg-gray-200 transition-colors flex items-center gap-1.5">
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
              Clear filter
            </button>
          )}
          <select value={filter} onChange={(e) => setFilter(e.target.value)}
            className="px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm font-medium text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-400 transition-all">
            {statusOptions.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
          </select>
        </div>
      </div>

      {completeForm && (
        <form onSubmit={handleComplete} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
          <div className="flex items-center gap-3 mb-5">
            <div className="w-11 h-11 rounded-xl bg-green-50 flex items-center justify-center">
              <svg className="w-5 h-5 text-green-600" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
            </div>
            <div>
              <h3 className="text-lg font-bold text-gray-900">Complete Delivery</h3>
              <p className="text-[13px] text-gray-400 mt-0.5">{completeForm.tracking_number} — mark as delivered</p>
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-[13px] font-medium text-gray-700 mb-1.5">Receiver Name *</label>
              <input type="text" required value={completeForm.receiver_name || ''} onChange={(e) => setCompleteForm({...completeForm, receiver_name: e.target.value})}
                className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-400 transition-all" />
            </div>
            <div>
              <label className="block text-[13px] font-medium text-gray-700 mb-1.5">Delivery Remarks</label>
              <input type="text" value={completeForm.remarks || ''} onChange={(e) => setCompleteForm({...completeForm, remarks: e.target.value})}
                className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-400 transition-all" />
            </div>
            <div>
              <label className="block text-[13px] font-medium text-gray-700 mb-1.5">Signature (text)</label>
              <input type="text" value={completeForm.signature || ''} onChange={(e) => setCompleteForm({...completeForm, signature: e.target.value})}
                className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-400 transition-all" placeholder="Receiver name as signature" />
            </div>
            <div>
              <label className="block text-[13px] font-medium text-gray-700 mb-1.5">Photo URL</label>
              <input type="text" value={completeForm.delivery_photo || ''} onChange={(e) => setCompleteForm({...completeForm, delivery_photo: e.target.value})}
                className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-400 transition-all" placeholder="https://..." />
            </div>
          </div>
          <div className="flex gap-2.5 mt-5">
            <button type="submit" className="px-4 py-2.5 bg-gradient-to-r from-green-600 to-green-500 text-white rounded-xl text-sm font-semibold hover:shadow-lg hover:shadow-green-500/25 transition-all active:scale-[0.97]">Mark Delivered</button>
            <button type="button" onClick={() => setCompleteForm(null)} className="px-4 py-2.5 bg-gray-100 text-gray-700 rounded-xl text-sm font-medium hover:bg-gray-200 transition-colors">Cancel</button>
          </div>
        </form>
      )}

      {loading ? (
        <div className="flex items-center gap-3 py-12 justify-center">
          <div className="w-5 h-5 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
          <span className="text-sm text-gray-500">Loading deliveries...</span>
        </div>
      ) : items.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center">
          <div className="w-14 h-14 rounded-2xl bg-gray-100 flex items-center justify-center mx-auto mb-4">
            <svg className="w-7 h-7 text-gray-400" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M8.25 18.75a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h6m-9 0H3.375a1.125 1.125 0 01-1.125-1.125V14.25m17.25 4.5a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h1.125c.621 0 1.129-.504 1.09-1.124a17.902 17.902 0 00-3.213-9.193 2.056 2.056 0 00-1.58-.86H14.25M16.5 18.75h-2.25m0-11.177v-.958c0-.568-.422-1.048-.987-1.106a48.554 48.554 0 00-10.026 0 1.106 1.106 0 00-.987 1.106v7.635m12-6.677v6.677m0 4.5v-4.5m0 0h-12" /></svg>
          </div>
          <p className="text-sm font-medium text-gray-900 mb-1">No deliveries found</p>
          <p className="text-[13px] text-gray-400">
            {filter ? 'Try adjusting your filter criteria.' : 'Deliveries will appear here once shipments are dispatched.'}
          </p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100">
                  <th className="text-left px-5 py-3.5 text-[11px] font-semibold text-gray-400 uppercase tracking-wider">Tracking #</th>
                  <th className="text-left px-5 py-3.5 text-[11px] font-semibold text-gray-400 uppercase tracking-wider">Receiver</th>
                  <th className="text-left px-5 py-3.5 text-[11px] font-semibold text-gray-400 uppercase tracking-wider">Address</th>
                  <th className="text-left px-5 py-3.5 text-[11px] font-semibold text-gray-400 uppercase tracking-wider">Rider</th>
                  <th className="text-left px-5 py-3.5 text-[11px] font-semibold text-gray-400 uppercase tracking-wider">Status</th>
                  <th className="text-left px-5 py-3.5 text-[11px] font-semibold text-gray-400 uppercase tracking-wider">Delivered At</th>
                  <th className="text-right px-5 py-3.5 text-[11px] font-semibold text-gray-400 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100/60">
                {items.map(s => (
                  <tr key={s.id} className="hover:bg-gray-50/60 transition-colors group">
                    <td className="px-5 py-3.5 font-medium text-gray-900">{s.tracking_number}</td>
                    <td className="px-5 py-3.5 text-gray-600"><span className="font-medium">{s.receiver_name}</span><br/><span className="text-[13px] text-gray-400">{s.receiver_phone}</span></td>
                    <td className="px-5 py-3.5 text-gray-600 text-[13px] max-w-[200px] truncate">{s.delivery_address || s.receiver_address || '-'}</td>
                    <td className="px-5 py-3.5 text-gray-600 text-[13px]">{s.rider_name || <span className="text-gray-400">—</span>}</td>
                    <td className="px-5 py-3.5">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-lg text-[11px] font-semibold ring-1 ring-inset ${statusColors[s.status] || 'bg-gray-100 text-gray-600 ring-gray-500/10'}`}>
                        {s.status.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase())}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 text-[13px] text-gray-500">{s.delivered_at ? new Date(s.delivered_at).toLocaleString() : '-'}</td>
                    <td className="px-5 py-3.5 text-right">
                      {s.status !== 'delivered' && (
                        <button onClick={() => setCompleteForm({ id: s.id, tracking_number: s.tracking_number, receiver_name: s.receiver_name, remarks: '', signature: '', delivery_photo: '' })}
                          className="px-3 py-1.5 rounded-lg text-xs font-semibold text-green-600 bg-green-50 hover:bg-green-100 ring-1 ring-inset ring-green-600/20 transition-colors">Complete</button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
