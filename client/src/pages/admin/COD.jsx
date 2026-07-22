import { useState, useEffect } from 'react';

const API = '/api/admin';

export default function COD() {
  const [settlements, setSettlements] = useState([]);
  const [summary, setSummary] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showSettle, setShowSettle] = useState(false);
  const [settleForm, setSettleForm] = useState({ shipment_id: '', rider_id: '', collected_amount: '', notes: '' });
  const [shipments, setShipments] = useState([]);
  const [riders, setRiders] = useState([]);

  const getToken = () => sessionStorage.getItem('swc_token');

  useEffect(() => { fetchSettlements(); fetchSummary(); fetchShipments(); fetchRiders(); }, []);

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

  const fetchRiders = async () => {
    try {
      const res = await fetch(`${API}/staff`, { headers: { 'Authorization': `Bearer ${getToken()}` } });
      if (res.ok) {
        const data = await res.json();
        setRiders(data.filter(s => s.role === 'delivery_rider' && s.is_active));
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
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-xl bg-emerald-50 flex items-center justify-center">
            <svg className="w-5 h-5 text-emerald-600" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18.75a60.07 60.07 0 0115.797 2.101c.727.198 1.453-.342 1.453-1.096V18.75M3.75 4.5v.75A.75.75 0 013 6h-.75m0 0v-.375c0-.621.504-1.125 1.125-1.125H20.25M2.25 6v9m18-10.5v.75c0 .414.336.75.75.75h.75m-1.5-1.5h.375c.621 0 1.125.504 1.125 1.125v9.75c0 .621-.504 1.125-1.125 1.125h-.375m1.5-1.5H21a.75.75 0 00-.75.75v.75m0 0H3.75m0 0h-.375a1.125 1.125 0 01-1.125-1.125V15m1.5 1.5v-.75A.75.75 0 003 15h-.75M15 10.5a3 3 0 11-6 0 3 3 0 016 0zm3 0h.008v.008H18V10.5zm-12 0h.008v.008H6V10.5z" /></svg>
          </div>
          <div>
            <h2 className="text-lg font-bold text-gray-900">COD Management</h2>
            <p className="text-[13px] text-gray-400 mt-0.5">Track cash-on-delivery settlements and rider balances</p>
          </div>
        </div>
        <button onClick={() => setShowSettle(true)} className="px-4 py-2.5 bg-gradient-to-r from-blue-600 to-blue-500 text-white rounded-xl text-sm font-semibold hover:shadow-lg hover:shadow-blue-500/25 transition-all active:scale-[0.97]">
          + New Settlement
        </button>
      </div>

      {showSettle && (
        <form onSubmit={handleSettle} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
          <div className="flex items-center gap-3 mb-5">
            <div className="w-11 h-11 rounded-xl bg-emerald-50 flex items-center justify-center">
              <svg className="w-5 h-5 text-emerald-600" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M12 6v12m-3-2.818l.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006 0l.415.33M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
            </div>
            <div>
              <h3 className="text-lg font-bold text-gray-900">Record COD Settlement</h3>
              <p className="text-[13px] text-gray-400 mt-0.5">Enter the settlement details for a delivered shipment</p>
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-[13px] font-medium text-gray-700 mb-1.5">Shipment *</label>
              <select value={settleForm.shipment_id} onChange={(e) => setSettleForm({...settleForm, shipment_id: e.target.value})} className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-400 transition-all" required>
                <option value="">Select shipment</option>
                {shipments.map(s => <option key={s.id} value={s.id}>{s.tracking_number} — LKR {s.cod_amount} — {s.receiver_name}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-[13px] font-medium text-gray-700 mb-1.5">Rider *</label>
              <select value={settleForm.rider_id} onChange={(e) => setSettleForm({...settleForm, rider_id: e.target.value})} className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-400 transition-all" required>
                <option value="">Select rider</option>
                {riders.map(r => <option key={r.id} value={r.id}>{r.name} ({r.phone})</option>)}
              </select>
            </div>
            <div>
              <label className="block text-[13px] font-medium text-gray-700 mb-1.5">Collected Amount</label>
              <input type="number" step="0.01" placeholder="e.g. 2500.00" value={settleForm.collected_amount} onChange={(e) => setSettleForm({...settleForm, collected_amount: e.target.value})} className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-400 transition-all" />
            </div>
            <div>
              <label className="block text-[13px] font-medium text-gray-700 mb-1.5">Notes</label>
              <input type="text" placeholder="Optional notes" value={settleForm.notes} onChange={(e) => setSettleForm({...settleForm, notes: e.target.value})} className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-400 transition-all" />
            </div>
          </div>
          <div className="flex gap-2.5 mt-5">
            <button type="submit" className="px-4 py-2.5 bg-gradient-to-r from-blue-600 to-blue-500 text-white rounded-xl text-sm font-semibold hover:shadow-lg hover:shadow-blue-500/25 transition-all active:scale-[0.97]">Record Settlement</button>
            <button type="button" onClick={() => setShowSettle(false)} className="px-4 py-2.5 bg-gray-100 text-gray-700 rounded-xl text-sm font-medium hover:bg-gray-200 transition-colors">Cancel</button>
          </div>
        </form>
      )}

      {/* Rider Summary */}
      {summary.length > 0 && (
        <div>
          <div className="flex items-center gap-2 mb-3">
            <h3 className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider">Rider Balances</h3>
            <div className="flex-1 h-px bg-gray-100"></div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {summary.map(r => (
              <div key={r.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center flex-shrink-0">
                    <span className="text-sm font-bold text-blue-600">{(r.name || '?')[0].toUpperCase()}</span>
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-gray-900 truncate">{r.name}</p>
                    <p className="text-[13px] text-gray-400">{r.phone}</p>
                  </div>
                </div>
                <div className="space-y-2.5">
                  <div className="flex items-center justify-between">
                    <span className="text-[13px] text-gray-400">Total COD</span>
                    <span className="text-sm font-semibold text-gray-900">LKR {parseFloat(r.total_cod || 0).toLocaleString()}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-[13px] text-gray-400">Collected</span>
                    <span className="text-sm font-semibold text-green-600">LKR {parseFloat(r.total_collected || 0).toLocaleString()}</span>
                  </div>
                  <div className="h-px bg-gray-100"></div>
                  <div className="flex items-center justify-between">
                    <span className="text-[13px] text-gray-400">Outstanding</span>
                    <span className="text-sm font-semibold text-red-600">LKR {(parseFloat(r.total_cod || 0) - parseFloat(r.total_collected || 0)).toLocaleString()}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Settlements Table */}
      <div>
        <div className="flex items-center gap-2 mb-3">
          <h3 className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider">Settlement History</h3>
          <div className="flex-1 h-px bg-gray-100"></div>
        </div>

        {loading ? (
          <div className="flex items-center gap-3 py-12 justify-center">
            <div className="w-5 h-5 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
            <span className="text-sm text-gray-500">Loading settlements...</span>
          </div>
        ) : (
          <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-100">
                    <th className="text-left px-5 py-3.5 text-[11px] font-semibold text-gray-400 uppercase tracking-wider">Tracking #</th>
                    <th className="text-left px-5 py-3.5 text-[11px] font-semibold text-gray-400 uppercase tracking-wider">Rider</th>
                    <th className="text-left px-5 py-3.5 text-[11px] font-semibold text-gray-400 uppercase tracking-wider">COD Amount</th>
                    <th className="text-left px-5 py-3.5 text-[11px] font-semibold text-gray-400 uppercase tracking-wider">Collected</th>
                    <th className="text-left px-5 py-3.5 text-[11px] font-semibold text-gray-400 uppercase tracking-wider">Settled</th>
                    <th className="text-left px-5 py-3.5 text-[11px] font-semibold text-gray-400 uppercase tracking-wider">Status</th>
                    <th className="text-left px-5 py-3.5 text-[11px] font-semibold text-gray-400 uppercase tracking-wider">Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100/60">
                  {settlements.map(s => (
                    <tr key={s.id} className="hover:bg-gray-50/60 transition-colors group">
                      <td className="px-5 py-3.5 font-medium text-gray-900">{s.tracking_number}</td>
                      <td className="px-5 py-3.5 text-gray-600 text-[13px]">{s.rider_name || '-'}</td>
                      <td className="px-5 py-3.5 font-medium text-gray-900">LKR {parseFloat(s.cod_amount).toLocaleString()}</td>
                      <td className="px-5 py-3.5 font-medium text-green-600">LKR {parseFloat(s.collected_amount).toLocaleString()}</td>
                      <td className="px-5 py-3.5 text-gray-600">LKR {parseFloat(s.settled_amount).toLocaleString()}</td>
                      <td className="px-5 py-3.5">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-lg text-[11px] font-semibold ring-1 ring-inset ${s.status === 'settled' ? 'bg-green-50 text-green-700 ring-green-600/20' : 'bg-yellow-50 text-yellow-700 ring-yellow-600/20'}`}>
                          {s.status}
                        </span>
                      </td>
                      <td className="px-5 py-3.5 text-[13px] text-gray-500">{s.created_at ? new Date(s.created_at).toLocaleDateString() : '-'}</td>
                    </tr>
                  ))}
                  {settlements.length === 0 && (
                    <tr>
                      <td colSpan={7}>
                        <div className="py-12 text-center">
                          <div className="w-14 h-14 rounded-2xl bg-gray-100 flex items-center justify-center mx-auto mb-4">
                            <svg className="w-7 h-7 text-gray-400" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18.75a60.07 60.07 0 0115.797 2.101c.727.198 1.453-.342 1.453-1.096V18.75M3.75 4.5v.75A.75.75 0 013 6h-.75m0 0v-.375c0-.621.504-1.125 1.125-1.125H20.25M2.25 6v9m18-10.5v.75c0 .414.336.75.75.75h.75m-1.5-1.5h.375c.621 0 1.125.504 1.125 1.125v9.75c0 .621-.504 1.125-1.125 1.125h-.375m1.5-1.5H21a.75.75 0 00-.75.75v.75m0 0H3.75m0 0h-.375a1.125 1.125 0 01-1.125-1.125V15m1.5 1.5v-.75A.75.75 0 003 15h-.75M15 10.5a3 3 0 11-6 0 3 3 0 016 0zm3 0h.008v.008H18V10.5zm-12 0h.008v.008H6V10.5z" /></svg>
                          </div>
                          <p className="text-sm font-medium text-gray-900 mb-1">No settlements yet</p>
                          <p className="text-[13px] text-gray-400">Record your first COD settlement to get started.</p>
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
