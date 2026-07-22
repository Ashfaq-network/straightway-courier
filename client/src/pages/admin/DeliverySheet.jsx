import { useState, useEffect, useRef, useCallback } from 'react';

const API = '/api/admin';

const statusColors = {
  pending_scan: 'bg-gray-100 text-gray-800',
  at_sorting_center: 'bg-violet-100 text-violet-800',
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
  const [riders, setRiders] = useState([]);
  const [riderFilter, setRiderFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [scanMode, setScanMode] = useState(false);
  const [scanResult, setScanResult] = useState('');
  const [scanStatus, setScanStatus] = useState('');
  const [editItem, setEditItem] = useState(null);
  const [editForm, setEditForm] = useState({});
  const scannerRef = useRef(null);

  const getToken = () => sessionStorage.getItem('swc_token');

  useEffect(() => { fetchRiders(); fetchSheet(); }, []);

  useEffect(() => {
    if (!scanMode) { stopScanner(); return; }
    startScanner();
    return () => stopScanner();
  }, [scanMode]);

  const fetchRiders = async () => {
    try {
      const res = await fetch(`${API}/staff`, { headers: { 'Authorization': `Bearer ${getToken()}` } });
      if (res.ok) { const data = await res.json(); setRiders(data.filter(s => s.role === 'delivery_rider' && s.is_active)); }
    } catch {}
  };

  const fetchSheet = async () => {
    setLoading(true);
    try {
      const params = riderFilter ? `?rider_id=${riderFilter}` : '';
      const res = await fetch(`${API}/delivery-sheet${params}`, { headers: { 'Authorization': `Bearer ${getToken()}` } });
      if (res.ok) setItems(await res.json());
    } catch (err) { console.error(err); } finally { setLoading(false); }
  };

  useEffect(() => { fetchSheet(); }, [riderFilter]);

  const startScanner = async () => {
    try {
      const { Html5Qrcode } = await import('html5-qrcode');
      const scanner = new Html5Qrcode('scanner-container');
      scannerRef.current = scanner;
      await scanner.start(
        { facingMode: 'environment' },
        { fps: 10, qrbox: { width: 250, height: 250 } },
        onScanSuccess,
        () => {}
      );
    } catch (err) { console.error('Scanner error:', err); setScanStatus('Camera access denied or not available'); }
  };

  const stopScanner = () => {
    if (scannerRef.current) {
      scannerRef.current.stop().catch(() => {});
      scannerRef.current.clear().catch(() => {});
      scannerRef.current = null;
    }
  };

  const onScanSuccess = useCallback(async (decodedText) => {
    setScanResult(decodedText);
    setScanStatus('Scanning...');
    try {
      const res = await fetch(`${API}/scan/${encodeURIComponent(decodedText)}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${getToken()}` },
        body: JSON.stringify({ receiver_name: 'Scanned Delivery', remarks: 'Delivered via barcode scan', rider_id: riderFilter || null })
      });
      if (res.ok) {
        setScanStatus(`✓ ${decodedText} — Delivered!`);
        fetchSheet();
      } else {
        const d = await res.json();
        setScanStatus(`✗ ${decodedText} — ${d.error}`);
      }
    } catch { setScanStatus(`✗ ${decodedText} — Network error`); }
    setTimeout(() => { setScanResult(''); }, 3000);
  }, []);

  const handleEdit = (item) => {
    setEditItem(item.id);
    setEditForm({
      receiver_name: item.receiver_name || '',
      receiver_phone: item.receiver_phone || '',
      delivery_address: item.delivery_address || item.receiver_address || '',
      special_instructions: item.special_instructions || '',
      status: item.status || '',
    });
  };

  const handleSaveEdit = async (id) => {
    try {
      const res = await fetch(`${API}/shipments/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${getToken()}` },
        body: JSON.stringify({
          receiver_name: editForm.receiver_name,
          receiver_phone: editForm.receiver_phone,
          delivery_address: editForm.delivery_address,
          special_instructions: editForm.special_instructions,
          status: editForm.status,
        })
      });
      if (res.ok) { setEditItem(null); fetchSheet(); }
    } catch (err) { alert(err.message); }
  };

  const handleAssignRider = async (shipmentId, newRiderId) => {
    try {
      const res = await fetch(`${API}/delivery-sheet/${shipmentId}/assign`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${getToken()}` },
        body: JSON.stringify({ rider_id: newRiderId || null })
      });
      if (res.ok) fetchSheet();
    } catch (err) { console.error(err); }
  };

  const filtered = items.filter(s => {
    if (riderFilter && String(s.delivery_rider_id) !== String(riderFilter)) return false;
    if (statusFilter && s.status !== statusFilter) return false;
    return true;
  });

  const grouped = {};
  filtered.forEach(s => { const r = s.rider_name || 'Unassigned'; if (!grouped[r]) grouped[r] = []; grouped[r].push(s); });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-8">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6 no-print">
        <button onClick={onBack} className="text-brand-500 hover:underline text-sm inline-block">&larr; Back to Dashboard</button>
        <h2 className="text-xl font-bold text-gray-900">Delivery Sheet</h2>
      </div>

      <div className="no-print mb-4 flex flex-wrap gap-2">
        <select value={riderFilter} onChange={(e) => setRiderFilter(e.target.value)}
          className="px-4 py-2.5 border border-gray-200 rounded-lg text-sm">
          <option value="">All Riders</option>
          {riders.map(r => <option key={r.id} value={r.id}>{r.name}</option>)}
        </select>
        <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}
          className="px-4 py-2.5 border border-gray-200 rounded-lg text-sm">
          <option value="">All Statuses</option>
          {['pending_scan','at_sorting_center','sorted','out_for_delivery','customer_contacted','delivered','failed_delivery','returned_to_sender','rescheduled'].map(st => (
            <option key={st} value={st}>{st.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase())}</option>
          ))}
        </select>
        <button onClick={() => setScanMode(!scanMode)}
          className={`px-4 py-2.5 rounded-lg text-sm font-semibold flex items-center gap-2 ${scanMode ? 'bg-red-500 text-white' : 'bg-brand-500 text-white hover:bg-brand-600'}`}>
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" /></svg>
          {scanMode ? 'Stop Scanner' : 'Scan Parcel'}
        </button>
        <button onClick={() => window.print()}
          className="px-5 py-2.5 bg-brand-500 text-white font-semibold rounded-lg hover:bg-brand-600 text-sm flex items-center gap-2">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" /></svg>
          Print
        </button>
      </div>

      {scanMode && (
        <div className="no-print bg-gray-900 rounded-xl p-6 mb-6">
          <div id="scanner-container" className="rounded-lg overflow-hidden mb-4" style={{ maxWidth: 400 }} />
          {scanResult && <p className="text-white text-sm font-mono">Last scan: {scanResult}</p>}
          {scanStatus && <p className={`text-sm font-semibold mt-1 ${scanStatus.startsWith('✓') ? 'text-green-400' : scanStatus.startsWith('✗') ? 'text-red-400' : 'text-yellow-400'}`}>{scanStatus}</p>}
          <p className="text-gray-400 text-xs mt-2">Point camera at parcel barcode to mark as delivered</p>
        </div>
      )}

      <div className="print-area">
        <div className="text-center mb-6 hidden print:block">
          <h1 className="text-2xl font-bold text-gray-900">Delivery Sheet</h1>
          <p className="text-sm text-gray-500">Straightway Couriers — {new Date().toLocaleDateString('en-GB', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
          {riderFilter && <p className="text-sm font-semibold">Rider: {riders.find(r => String(r.id) === String(riderFilter))?.name}</p>}
        </div>

        {loading ? <p className="text-gray-500">Loading...</p> : filtered.length === 0 ? (
          <div className="text-center py-16 bg-gray-50 rounded-xl">
            <p className="text-gray-500">No deliveries found.</p>
          </div>
        ) : (
          <div className="space-y-6">
            {Object.entries(grouped).map(([rider, shipments]) => (
              <div key={rider} className="print:page-break">
                <div className="bg-white rounded-xl shadow border border-gray-100 overflow-hidden">
                  <div className="bg-gray-50 px-4 py-3 border-b border-gray-100 print:bg-gray-100 flex justify-between items-center">
                    <div>
                      <h3 className="font-bold text-gray-900 text-sm">Rider: {rider}</h3>
                      <p className="text-xs text-gray-500">{shipments.length} parcel(s)</p>
                    </div>
                    <div className="no-print flex gap-2">
                      <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded">{shipments.filter(s => s.status === 'delivered').length} delivered</span>
                      <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded">{shipments.filter(s => s.status !== 'delivered').length} pending</span>
                    </div>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead className="bg-gray-50 print:bg-gray-50">
                        <tr>
                          <th className="text-left px-3 py-2 font-medium text-xs text-gray-600">#</th>
                          <th className="text-left px-3 py-2 font-medium text-xs text-gray-600">Tracking</th>
                          <th className="text-left px-3 py-2 font-medium text-xs text-gray-600">Receiver</th>
                          <th className="text-left px-3 py-2 font-medium text-xs text-gray-600">Phone</th>
                          <th className="text-left px-3 py-2 font-medium text-xs text-gray-600">Address</th>
                          <th className="text-left px-3 py-2 font-medium text-xs text-gray-600">Items</th>
                          <th className="text-left px-3 py-2 font-medium text-xs text-gray-600">COD</th>
                          <th className="text-left px-3 py-2 font-medium text-xs text-gray-600">Instructions</th>
                          <th className="text-left px-3 py-2 font-medium text-xs text-gray-600">Status</th>
                          <th className="text-left px-3 py-2 font-medium text-xs text-gray-600 print:hidden">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100">
                        {shipments.map((s, i) => (
                          editItem === s.id ? (
                            <tr key={s.id} className="bg-amber-50">
                              <td className="px-3 py-2 text-xs text-gray-500">{i + 1}</td>
                              <td className="px-3 py-2 font-semibold text-gray-900 text-xs">{s.tracking_number}</td>
                              <td className="px-3 py-2"><input value={editForm.receiver_name} onChange={e => setEditForm({...editForm, receiver_name: e.target.value})} className="px-2 py-1 border rounded text-xs w-full" /></td>
                              <td className="px-3 py-2"><input value={editForm.receiver_phone} onChange={e => setEditForm({...editForm, receiver_phone: e.target.value})} className="px-2 py-1 border rounded text-xs w-full" /></td>
                              <td className="px-3 py-2"><input value={editForm.delivery_address} onChange={e => setEditForm({...editForm, delivery_address: e.target.value})} className="px-2 py-1 border rounded text-xs w-full" /></td>
                              <td className="px-3 py-2 text-xs">{s.num_items || '-'}</td>
                              <td className="px-3 py-2 text-xs">{s.cod_amount ? `LKR ${s.cod_amount}` : '-'}</td>
                              <td className="px-3 py-2"><input value={editForm.special_instructions} onChange={e => setEditForm({...editForm, special_instructions: e.target.value})} className="px-2 py-1 border rounded text-xs w-full" /></td>
                              <td className="px-3 py-2">
                                <select value={editForm.status} onChange={e => setEditForm({...editForm, status: e.target.value})} className="px-2 py-1 border rounded text-xs">
                                  {['at_sorting_center','sorted','out_for_delivery','customer_contacted','delivered','failed_delivery','rescheduled'].map(st => (
                                    <option key={st} value={st}>{st.replace(/_/g, ' ')}</option>
                                  ))}
                                </select>
                              </td>
                              <td className="px-3 py-2 print:hidden whitespace-nowrap">
                                <button onClick={() => handleSaveEdit(s.id)} className="text-green-600 hover:underline text-xs mr-2">Save</button>
                                <button onClick={() => setEditItem(null)} className="text-gray-400 hover:underline text-xs">Cancel</button>
                              </td>
                            </tr>
                          ) : (
                            <tr key={s.id} className={`hover:bg-gray-50 ${s.status === 'delivered' ? 'bg-green-50/50' : ''}`}>
                              <td className="px-3 py-2 text-xs text-gray-500">{i + 1}</td>
                              <td className="px-3 py-2 font-semibold text-gray-900 text-xs">{s.tracking_number}</td>
                              <td className="px-3 py-2 text-gray-800 text-xs">{s.receiver_name}</td>
                              <td className="px-3 py-2 text-gray-600 text-xs">{s.receiver_phone}</td>
                              <td className="px-3 py-2 text-gray-600 text-xs max-w-[180px]">{s.delivery_address || s.receiver_address || '-'}</td>
                              <td className="px-3 py-2 text-gray-600 text-xs">{s.num_items || '-'}</td>
                              <td className="px-3 py-2 text-xs">{s.cod_amount ? `LKR ${s.cod_amount}` : '-'}</td>
                              <td className="px-3 py-2 text-xs text-amber-600 max-w-[120px]">{s.special_instructions || '-'}</td>
                              <td className="px-3 py-2 text-xs">
                                <span className={`inline-block px-1.5 py-0.5 rounded text-xs font-medium ${statusColors[s.status] || 'bg-gray-100 text-gray-800'}`}>
                                  {s.status.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase())}
                                </span>
                              </td>
                              <td className="px-3 py-2 print:hidden">
                                <div className="flex gap-1 items-center flex-wrap">
                                  {s.status !== 'delivered' && (
                                    <select value={s.delivery_rider_id || ''} onChange={(e) => handleAssignRider(s.id, e.target.value || null)}
                                      className="px-1.5 py-1 border border-gray-200 rounded text-xs bg-white max-w-[100px]">
                                      <option value="">No Rider</option>
                                      {riders.map(r => <option key={r.id} value={r.id}>{r.name}</option>)}
                                    </select>
                                  )}
                                  <button onClick={() => handleEdit(s)} className="text-blue-500 hover:underline text-xs">Edit</button>
                                  {s.status !== 'delivered' && (
                                    <button onClick={async () => {
                                      if (!confirm(`Mark ${s.tracking_number} as delivered?`)) return;
                                      await fetch(`${API}/scan/${s.tracking_number}`, {
                                        method: 'PUT', headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${getToken()}` },
                                        body: JSON.stringify({ receiver_name: s.receiver_name, remarks: 'Marked delivered manually', rider_id: s.delivery_rider_id || riderFilter || null })
                                      });
                                      fetchSheet();
                                    }} className="text-green-500 hover:underline text-xs">Deliver</button>
                                  )}
                                </div>
                              </td>
                            </tr>
                          )
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            ))}
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
