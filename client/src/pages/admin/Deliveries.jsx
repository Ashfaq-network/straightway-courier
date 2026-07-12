import { useState, useEffect } from 'react';

const API = '/api/admin';

const statusColors = {
  out_for_delivery: 'bg-blue-100 text-blue-800',
  delivered: 'bg-green-100 text-green-800',
  failed_delivery: 'bg-red-100 text-red-800',
  rescheduled: 'bg-cyan-100 text-cyan-800',
};

export default function Deliveries({ onBack }) {
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
    await fetch(`${API}/deliveries/${completeForm.id}/complete`, {
      method: 'PUT', headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${getToken()}` },
      body: JSON.stringify(completeForm)
    });
    setCompleteForm(null);
    fetchItems();
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-8">
      <button onClick={onBack} className="text-brand-500 hover:underline text-sm mb-4 inline-block">&larr; Back to Dashboard</button>
      <h2 className="text-xl font-bold text-gray-900 mb-6">Delivery Management</h2>

      <div className="flex gap-2 mb-4">
        <select value={filter} onChange={(e) => setFilter(e.target.value)} className="px-4 py-2.5 border border-gray-200 rounded-lg text-sm">
          <option value="">All Deliveries</option>
          <option value="out_for_delivery">Out for Delivery</option>
          <option value="delivered">Delivered</option>
          <option value="failed_delivery">Failed</option>
          <option value="rescheduled">Rescheduled</option>
        </select>
      </div>

      {completeForm && (
        <form onSubmit={handleComplete} className="bg-green-50 rounded-xl p-6 border border-green-200 mb-6">
          <h3 className="font-semibold text-gray-900 mb-4">Complete Delivery — {completeForm.tracking_number}</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Receiver Name *</label>
              <input type="text" required value={completeForm.receiver_name || ''} onChange={(e) => setCompleteForm({...completeForm, receiver_name: e.target.value})}
                className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Delivery Remarks</label>
              <input type="text" value={completeForm.remarks || ''} onChange={(e) => setCompleteForm({...completeForm, remarks: e.target.value})}
                className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Signature (text)</label>
              <input type="text" value={completeForm.signature || ''} onChange={(e) => setCompleteForm({...completeForm, signature: e.target.value})}
                className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm" placeholder="Receiver name as signature" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Photo URL</label>
              <input type="text" value={completeForm.delivery_photo || ''} onChange={(e) => setCompleteForm({...completeForm, delivery_photo: e.target.value})}
                className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm" placeholder="https://..." />
            </div>
          </div>
          <div className="flex gap-2 mt-4">
            <button type="submit" className="px-4 py-2 bg-green-500 text-white rounded-lg text-sm">Mark Delivered</button>
            <button type="button" onClick={() => setCompleteForm(null)} className="px-4 py-2 bg-gray-200 rounded-lg text-sm">Cancel</button>
          </div>
        </form>
      )}

      {loading ? <p className="text-gray-500">Loading...</p> : items.length === 0 ? (
        <p className="text-gray-500">No deliveries found.</p>
      ) : (
        <div className="overflow-x-auto bg-white rounded-xl shadow border border-gray-100">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-gray-600">
              <tr>
                <th className="text-left px-4 py-3 font-medium">Tracking #</th>
                <th className="text-left px-4 py-3 font-medium">Receiver</th>
                <th className="text-left px-4 py-3 font-medium">Address</th>
                <th className="text-left px-4 py-3 font-medium">Rider</th>
                <th className="text-left px-4 py-3 font-medium">Status</th>
                <th className="text-left px-4 py-3 font-medium">Delivered At</th>
                <th className="text-right px-4 py-3 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {items.map(s => (
                <tr key={s.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 font-medium text-gray-900">{s.tracking_number}</td>
                  <td className="px-4 py-3 text-gray-600">{s.receiver_name}<br/><span className="text-xs">{s.receiver_phone}</span></td>
                  <td className="px-4 py-3 text-gray-600 text-xs">{s.delivery_address || s.receiver_address || '-'}</td>
                  <td className="px-4 py-3 text-gray-600">{s.rider_name || <span className="text-gray-400">-</span>}</td>
                  <td className="px-4 py-3">
                    <span className={`inline-block px-2 py-0.5 rounded text-xs font-semibold ${statusColors[s.status] || 'bg-gray-100'}`}>
                      {s.status.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase())}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-xs text-gray-500">{s.delivered_at ? new Date(s.delivered_at).toLocaleString() : '-'}</td>
                  <td className="px-4 py-3 text-right">
                    {s.status === 'out_for_delivery' && (
                      <button onClick={() => setCompleteForm({ id: s.id, tracking_number: s.tracking_number, receiver_name: s.receiver_name, remarks: '', signature: '', delivery_photo: '' })}
                        className="text-green-500 hover:underline text-xs">Complete</button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
