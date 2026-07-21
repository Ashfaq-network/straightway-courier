import { useState, useEffect } from 'react';

const API = '/api/admin';

export default function COD({ onBack }) {
  const [settlements, setSettlements] = useState([]);
  const [summary, setSummary] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showSettle, setShowSettle] = useState(false);
  const [settleForm, setSettleForm] = useState({ shipment_id: '', rider_id: '', collected_amount: '', notes: '' });
  const [shipments, setShipments] = useState([]);

  const getToken = () => sessionStorage.getItem('swc_token');

  useEffect(() => { fetchSettlements(); fetchSummary(); fetchShipments(); }, []);

  const fetchSettlements = async () => {
    try {
      const res = await fetch(`${API}/cod`, { headers: { 'Authorization': `Bearer ${getToken()}` } });
      if (res.ok) setSettlements(await res.json());
    } catch (err) { console.error(err); }
  };

  const fetchSummary = async () => {
    try {
      const res = await fetch(`${API}/cod/summary`, { headers: { 'Authorization': `Bearer ${getToken()}` } });
      if (res.ok) setSummary(await res.json());
    } catch (err) { console.error(err); } finally { setLoading(false); }
  };

  const fetchShipments = async () => {
    try {
      const res = await fetch(`${API}/shipments?status=delivered`, { headers: { 'Authorization': `Bearer ${getToken()}` } });
      if (res.ok) {
        const data = await res.json();
        setShipments(data.filter(s => s.payment_status === 'cod'));
      }
    } catch (err) { console.error(err); }
  };

  const handleSettle = async (e) => {
    e.preventDefault();
    await fetch(`${API}/cod/settle`, {
      method: 'POST', headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${getToken()}` },
      body: JSON.stringify(settleForm)
    });
    setShowSettle(false);
    setSettleForm({ shipment_id: '', rider_id: '', collected_amount: '', notes: '' });
    fetchSettlements();
    fetchSummary();
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-8">
      <button onClick={onBack} className="text-brand-500 hover:underline text-sm mb-4 inline-block">&larr; Back to Dashboard</button>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-gray-900">COD Management</h2>
        <button onClick={() => setShowSettle(true)} className="px-4 py-2 bg-brand-500 text-white rounded-lg text-sm">+ New Settlement</button>
      </div>

      {showSettle && (
        <form onSubmit={handleSettle} className="bg-gray-50 rounded-xl p-6 border border-gray-100 mb-6">
          <h3 className="font-semibold text-gray-900 mb-4">Record COD Settlement</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <select value={settleForm.shipment_id} onChange={(e) => setSettleForm({...settleForm, shipment_id: e.target.value})} className="px-3 py-2.5 border border-gray-300 rounded-lg text-sm" required>
              <option value="">Select shipment</option>
              {shipments.map(s => <option key={s.id} value={s.id}>{s.tracking_number} — LKR {s.cod_amount} — {s.receiver_name}</option>)}
            </select>
            <input type="number" step="0.01" placeholder="Collected amount" value={settleForm.collected_amount} onChange={(e) => setSettleForm({...settleForm, collected_amount: e.target.value})} className="px-3 py-2.5 border border-gray-300 rounded-lg text-sm" />
            <input type="text" placeholder="Notes" value={settleForm.notes} onChange={(e) => setSettleForm({...settleForm, notes: e.target.value})} className="px-3 py-2.5 border border-gray-300 rounded-lg text-sm" />
          </div>
          <div className="flex gap-2 mt-4">
            <button type="submit" className="px-4 py-2 bg-brand-500 text-white rounded-lg text-sm">Record</button>
            <button type="button" onClick={() => setShowSettle(false)} className="px-4 py-2 bg-gray-200 rounded-lg text-sm">Cancel</button>
          </div>
        </form>
      )}

      {/* Rider Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
        {summary.map(r => (
          <div key={r.id} className="bg-white rounded-xl border border-gray-100 shadow-sm p-4">
            <p className="font-semibold text-gray-900">{r.name}</p>
            <p className="text-xs text-gray-500">{r.phone}</p>
            <div className="mt-3 grid grid-cols-2 gap-2 text-sm">
              <div><span className="text-gray-500">Total COD:</span><br/><span className="font-semibold">LKR {parseFloat(r.total_cod || 0).toLocaleString()}</span></div>
              <div><span className="text-gray-500">Collected:</span><br/><span className="font-semibold text-green-600">LKR {parseFloat(r.total_collected || 0).toLocaleString()}</span></div>
              <div className="col-span-2"><span className="text-gray-500">Outstanding:</span><br/><span className="font-semibold text-red-600">LKR {(parseFloat(r.total_cod || 0) - parseFloat(r.total_collected || 0)).toLocaleString()}</span></div>
            </div>
          </div>
        ))}
      </div>

      {loading ? <p className="text-gray-500">Loading...</p> : (
        <div className="overflow-x-auto bg-white rounded-xl shadow border border-gray-100">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-gray-600">
              <tr>
                <th className="text-left px-4 py-3 font-medium">Tracking #</th>
                <th className="text-left px-4 py-3 font-medium">Rider</th>
                <th className="text-left px-4 py-3 font-medium">COD Amount</th>
                <th className="text-left px-4 py-3 font-medium">Collected</th>
                <th className="text-left px-4 py-3 font-medium">Settled</th>
                <th className="text-left px-4 py-3 font-medium">Status</th>
                <th className="text-left px-4 py-3 font-medium">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {settlements.map(s => (
                <tr key={s.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 font-medium text-gray-900">{s.tracking_number}</td>
                  <td className="px-4 py-3 text-gray-600">{s.rider_name || '-'}</td>
                  <td className="px-4 py-3">LKR {parseFloat(s.cod_amount).toLocaleString()}</td>
                  <td className="px-4 py-3">LKR {parseFloat(s.collected_amount).toLocaleString()}</td>
                  <td className="px-4 py-3">LKR {parseFloat(s.settled_amount).toLocaleString()}</td>
                  <td className="px-4 py-3">
                    <span className={`inline-block px-2 py-0.5 rounded text-xs font-semibold ${s.status === 'settled' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                      {s.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-xs text-gray-500">{s.created_at ? new Date(s.created_at).toLocaleDateString() : '-'}</td>
                </tr>
              ))}
              {settlements.length === 0 && <tr><td colSpan={7} className="px-4 py-8 text-center text-gray-500">No settlements yet.</td></tr>}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
