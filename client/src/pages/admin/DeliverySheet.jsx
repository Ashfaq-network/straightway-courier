import { useState, useEffect } from 'react';

const API = '/api/admin';

const statusColors = {
  sorted: 'bg-indigo-100 text-indigo-800',
  out_for_delivery: 'bg-blue-100 text-blue-800',
  customer_contacted: 'bg-teal-100 text-teal-800',
  delivered: 'bg-green-100 text-green-800',
  failed_delivery: 'bg-red-100 text-red-800',
  returned_to_sender: 'bg-gray-200 text-gray-800',
  rescheduled: 'bg-cyan-100 text-cyan-800',
};

export default function DeliverySheet({ onBack }) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [riderFilter, setRiderFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  const getToken = () => sessionStorage.getItem('swc_token');

  useEffect(() => { fetchSheet(); }, []);

  const fetchSheet = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API}/deliveries`, { headers: { 'Authorization': `Bearer ${getToken()}` } });
      if (res.ok) setItems(await res.json());
    } catch (err) { console.error(err); } finally { setLoading(false); }
  };

  const filtered = items.filter(s => {
    if (riderFilter && s.rider_name !== riderFilter) return false;
    if (statusFilter && s.status !== statusFilter) return false;
    return true;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-8">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6 no-print">
        <button onClick={onBack} className="text-brand-500 hover:underline text-sm inline-block">&larr; Back to Dashboard</button>
        <div className="flex items-center gap-3">
          <button onClick={() => window.print()}
            className="px-5 py-2.5 bg-brand-500 text-white font-semibold rounded-lg hover:bg-brand-600 text-sm flex items-center gap-2">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" /></svg>
            Print Delivery Sheet
          </button>
        </div>
      </div>

      <div className="no-print mb-4 flex flex-wrap gap-2">
        <select value={riderFilter} onChange={(e) => setRiderFilter(e.target.value)}
          className="px-4 py-2.5 border border-gray-200 rounded-lg text-sm">
          <option value="">All Riders</option>
          {[...new Set(items.map(s => s.rider_name).filter(Boolean))].map(r => (
            <option key={r} value={r}>{r}</option>
          ))}
        </select>
        <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}
          className="px-4 py-2.5 border border-gray-200 rounded-lg text-sm">
          <option value="">All Statuses</option>
          {['sorted','out_for_delivery','customer_contacted','delivered','failed_delivery','returned_to_sender','rescheduled'].map(st => (
            <option key={st} value={st}>{st.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase())}</option>
          ))}
        </select>
      </div>

      <div className="print-area">
        <div className="text-center mb-6 hidden print:block">
          <h1 className="text-2xl font-bold text-gray-900">Delivery Sheet</h1>
          <p className="text-sm text-gray-500">Straightway Couriers — {new Date().toLocaleDateString('en-GB', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
        </div>

        {loading ? <p className="text-gray-500">Loading...</p> : filtered.length === 0 ? (
          <div className="text-center py-16 bg-gray-50 rounded-xl">
            <p className="text-gray-500">{riderFilter ? `No deliveries for ${riderFilter}.` : 'No deliveries out for delivery right now.'}</p>
          </div>
        ) : (
          <div className="space-y-6">
            {riderFilter ? (
              <RiderSection shipments={filtered} rider={riderFilter} />
            ) : (
              [...new Set(filtered.map(s => s.rider_name || 'Unassigned'))].map(rider => (
                <RiderSection key={rider} shipments={filtered.filter(s => (s.rider_name || 'Unassigned') === rider)} rider={rider} />
              ))
            )}
          </div>
        )}
      </div>

      <style>{`
        @media print {
          body { font-size: 11px; }
          .no-print { display: none !important; }
          .print-area { margin: 0; padding: 0; }
          .page-break { page-break-before: always; }
        }
      `}</style>
    </div>
  );
}

function RiderSection({ shipments, rider }) {
  return (
    <div className="print:page-break">
      <div className="bg-white rounded-xl shadow border border-gray-100 overflow-hidden">
        <div className="bg-gray-50 px-4 py-3 border-b border-gray-100 print:bg-gray-100">
          <h3 className="font-bold text-gray-900 text-sm">Rider: {rider}</h3>
          <p className="text-xs text-gray-500">{shipments.length} parcel(s)</p>
        </div>
        <table className="w-full text-sm">
          <thead className="bg-gray-50 print:bg-gray-50">
            <tr>
              <th className="text-left px-3 py-2 font-medium text-xs text-gray-600">#</th>
              <th className="text-left px-3 py-2 font-medium text-xs text-gray-600">Tracking</th>
              <th className="text-left px-3 py-2 font-medium text-xs text-gray-600">Receiver</th>
              <th className="text-left px-3 py-2 font-medium text-xs text-gray-600">Phone</th>
              <th className="text-left px-3 py-2 font-medium text-xs text-gray-600">Delivery Address</th>
              <th className="text-left px-3 py-2 font-medium text-xs text-gray-600">Parcel</th>
              <th className="text-left px-3 py-2 font-medium text-xs text-gray-600">COD</th>
              <th className="text-left px-3 py-2 font-medium text-xs text-gray-600">Instructions</th>
              <th className="text-left px-3 py-2 font-medium text-xs text-gray-600">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {shipments.map((s, i) => (
              <tr key={s.id} className="hover:bg-gray-50">
                <td className="px-3 py-2 text-xs text-gray-500">{i + 1}</td>
                <td className="px-3 py-2 font-semibold text-gray-900 text-xs">{s.tracking_number}</td>
                <td className="px-3 py-2 text-gray-800 text-xs">{s.receiver_name}</td>
                <td className="px-3 py-2 text-gray-600 text-xs">{s.receiver_phone}</td>
                <td className="px-3 py-2 text-gray-600 text-xs max-w-[180px]">{s.delivery_address || s.receiver_address || '-'}</td>
                <td className="px-3 py-2 text-gray-600 text-xs">{s.parcel_type || '-'}{s.weight ? ` (${s.weight}kg)` : ''}</td>
                <td className="px-3 py-2 text-xs">{s.cod_amount ? `LKR ${s.cod_amount}` : '-'}</td>
                <td className="px-3 py-2 text-xs text-amber-600 max-w-[120px]">{s.special_instructions || '-'}</td>
                <td className="px-3 py-2 text-xs">
                  <span className={`inline-block px-1.5 py-0.5 rounded text-xs font-medium ${statusColors[s.status] || 'bg-gray-100 text-gray-800'}`}>
                    {s.status.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase())}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
