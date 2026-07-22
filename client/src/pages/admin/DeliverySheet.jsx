import { useState, useEffect, useRef, useCallback } from 'react';

const API = '/api/admin';

const statusColors = {
  pending_scan: 'bg-gray-100 text-gray-700 ring-1 ring-gray-200',
  at_sorting_center: 'bg-violet-50 text-violet-700 ring-1 ring-violet-200',
  sorted: 'bg-indigo-50 text-indigo-700 ring-1 ring-indigo-200',
  out_for_delivery: 'bg-blue-50 text-blue-700 ring-1 ring-blue-200',
  customer_contacted: 'bg-teal-50 text-teal-700 ring-1 ring-teal-200',
  delivered: 'bg-green-50 text-green-700 ring-1 ring-green-200',
  failed_delivery: 'bg-red-50 text-red-700 ring-1 ring-red-200',
  returned_to_sender: 'bg-gray-100 text-gray-700 ring-1 ring-gray-200',
  rescheduled: 'bg-cyan-50 text-cyan-700 ring-1 ring-cyan-200',
};

export default function DeliverySheet() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [riders, setRiders] = useState([]);
  const [riderFilter, setRiderFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [scanMode, setScanMode] = useState(false);
  const [scanResult, setScanResult] = useState('');
  const [scanStatus, setScanStatus] = useState('');
  const [physicalScanValue, setPhysicalScanValue] = useState('');
  const [physicalScanStatus, setPhysicalScanStatus] = useState('');
  const [editItem, setEditItem] = useState(null);
  const [editForm, setEditForm] = useState({});
  const scannerRef = useRef(null);
  const physicalScanRef = useRef(null);
  const physicalScanTimer = useRef(null);

  const getToken = () => sessionStorage.getItem('swc_token');

  useEffect(() => { fetchRiders(); fetchSheet(); }, []);

  useEffect(() => {
    if (!scanMode) { stopScanner(); return; }
    startScanner();
    return () => stopScanner();
  }, [scanMode]);

  useEffect(() => {
    const interval = setInterval(() => {
      if (physicalScanRef.current && document.activeElement !== physicalScanRef.current) {
        physicalScanRef.current.focus();
      }
    }, 2000);
    return () => clearInterval(interval);
  }, []);

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

  const processScan = useCallback(async (trackingNumber) => {
    const tn = trackingNumber.trim();
    if (!tn) return;
    setPhysicalScanStatus(`Scanning ${tn}...`);
    try {
      const res = await fetch(`${API}/scan/${encodeURIComponent(tn)}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${getToken()}` },
        body: JSON.stringify({ receiver_name: 'Scanned Delivery', remarks: 'Scanned via barcode scanner', rider_id: riderFilter || null })
      });
      if (res.ok) {
        setPhysicalScanStatus(`✓ ${tn} — Sorted & assigned!`);
        fetchSheet();
      } else {
        const d = await res.json();
        setPhysicalScanStatus(`✗ ${tn} — ${d.error}`);
      }
    } catch {
      setPhysicalScanStatus(`✗ ${tn} — Network error`);
    }
    setTimeout(() => setPhysicalScanStatus(''), 4000);
  }, [riderFilter]);

  const handlePhysicalScanInput = (e) => {
    const value = e.target.value;
    setPhysicalScanValue(value);
    if (physicalScanTimer.current) clearTimeout(physicalScanTimer.current);
    physicalScanTimer.current = setTimeout(() => {
      if (value.trim()) {
        processScan(value);
        setPhysicalScanValue('');
      }
    }, 150);
  };

  const handlePhysicalScanKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      if (physicalScanTimer.current) clearTimeout(physicalScanTimer.current);
      if (physicalScanValue.trim()) {
        processScan(physicalScanValue);
        setPhysicalScanValue('');
      }
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
        setScanStatus(`✓ ${decodedText} — Sorted & assigned!`);
        fetchSheet();
      } else {
        const d = await res.json();
        setScanStatus(`✗ ${decodedText} — ${d.error}`);
      }
    } catch { setScanStatus(`✗ ${decodedText} — Network error`); }
    setTimeout(() => { setScanResult(''); }, 3000);
  }, [riderFilter]);

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
    <div className="space-y-6">
      {/* Header */}
      <div className="no-print">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-xl bg-blue-50 flex items-center justify-center">
            <svg className="w-5 h-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17a2 2 0 11-4 0 2 2 0 014 0zM19 17a2 2 0 11-4 0 2 2 0 014 0zM13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10l2-1h2m10 1l2-1V8a1 1 0 00-1-1h-4" /></svg>
          </div>
          <div>
            <h2 className="text-lg font-bold text-gray-900">Delivery Sheet</h2>
            <p className="text-[13px] text-gray-400 mt-0.5">Track and manage daily deliveries by rider</p>
          </div>
        </div>
      </div>

      {/* Physical Barcode Scanner */}
      <div className="no-print bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center">
            <svg className="w-5 h-5 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" /></svg>
          </div>
          <div>
            <h3 className="text-sm font-bold text-gray-900">Barcode Scanner</h3>
            <p className="text-[12px] text-gray-400">Scan a parcel barcode to sort and assign to rider</p>
          </div>
          <div className="ml-auto flex items-center gap-1.5">
            <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-[11px] font-semibold text-emerald-600">Ready</span>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative flex-1">
            <div className="absolute left-3 top-1/2 -translate-y-1/2">
              <svg className="w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" /></svg>
            </div>
            <input
              ref={physicalScanRef}
              type="text"
              value={physicalScanValue}
              onChange={handlePhysicalScanInput}
              onKeyDown={handlePhysicalScanKeyDown}
              placeholder="Scan barcode here — auto-detects tracking number..."
              autoFocus
              className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm font-mono focus:outline-none focus:ring-2 focus:ring-emerald-500/40 focus:border-emerald-400 transition-all"
            />
          </div>
          <select value={riderFilter} onChange={(e) => setRiderFilter(e.target.value)}
            className="px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-400 transition-all">
            <option value="">Assign to rider...</option>
            {riders.map(r => <option key={r.id} value={r.id}>{r.name}</option>)}
          </select>
        </div>
        {physicalScanStatus && (
          <p className={`text-sm font-semibold mt-2 ${physicalScanStatus.startsWith('✓') ? 'text-emerald-600' : physicalScanStatus.startsWith('✗') ? 'text-red-500' : 'text-amber-600'}`}>
            {physicalScanStatus}
          </p>
        )}
      </div>

      {/* Toolbar */}
      <div className="no-print flex flex-wrap items-center gap-2.5">
        <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}
          className="px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-400 transition-all">
          <option value="">All Statuses</option>
          {['pending_scan','at_sorting_center','sorted','out_for_delivery','customer_contacted','delivered','failed_delivery','returned_to_sender','rescheduled'].map(st => (
            <option key={st} value={st}>{st.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase())}</option>
          ))}
        </select>
        <button onClick={() => setScanMode(!scanMode)}
          className={`px-4 py-2.5 rounded-xl text-sm font-semibold flex items-center gap-2 transition-all active:scale-[0.97] ${scanMode ? 'bg-red-500 text-white hover:bg-red-600' : 'bg-gradient-to-r from-blue-600 to-blue-500 text-white hover:shadow-lg hover:shadow-blue-500/25'}`}>
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
          {scanMode ? 'Stop Camera' : 'Camera Scan'}
        </button>
        <button onClick={() => window.print()}
          className="px-4 py-2.5 bg-gray-100 text-gray-700 rounded-xl text-sm font-medium hover:bg-gray-200 transition-colors flex items-center gap-2">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" /></svg>
          Print
        </button>
      </div>

      {/* Camera Scanner */}
      {scanMode && (
        <div className="no-print bg-gray-900 rounded-2xl p-6">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
            <p className="text-white text-sm font-semibold">Camera Scanner Active</p>
          </div>
          <div id="scanner-container" className="rounded-xl overflow-hidden mb-4" style={{ maxWidth: 400 }} />
          {scanResult && <p className="text-white text-sm font-mono">Last scan: {scanResult}</p>}
          {scanStatus && <p className={`text-sm font-semibold mt-1 ${scanStatus.startsWith('✓') ? 'text-green-400' : scanStatus.startsWith('✗') ? 'text-red-400' : 'text-yellow-400'}`}>{scanStatus}</p>}
          <p className="text-gray-500 text-xs mt-2">Point camera at parcel barcode to scan</p>
        </div>
      )}

      {/* Print Header */}
      <div className="print-area">
        <div className="text-center mb-6 hidden print:block">
          <h1 className="text-2xl font-bold text-gray-900">Delivery Sheet</h1>
          <p className="text-sm text-gray-500">Straightway Couriers — {new Date().toLocaleDateString('en-GB', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
          {riderFilter && <p className="text-sm font-semibold">Rider: {riders.find(r => String(r.id) === String(riderFilter))?.name}</p>}
        </div>

        {/* Loading */}
        {loading && (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
            <p className="text-sm text-gray-400 mt-3">Loading deliveries...</p>
          </div>
        )}

        {/* Empty */}
        {!loading && filtered.length === 0 && (
          <div className="flex flex-col items-center justify-center py-20 bg-gray-50 rounded-2xl border border-gray-100">
            <div className="w-14 h-14 rounded-2xl bg-gray-100 flex items-center justify-center mb-4">
              <svg className="w-6 h-6 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" /></svg>
            </div>
            <p className="text-sm font-medium text-gray-600">No deliveries found</p>
            <p className="text-xs text-gray-400 mt-1">Try adjusting your filters</p>
          </div>
        )}

        {/* Delivery Groups */}
        {!loading && filtered.length > 0 && (
          <div className="space-y-6">
            {Object.entries(grouped).map(([rider, shipments]) => (
              <div key={rider} className="print:page-break">
                <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
                  {/* Group Header */}
                  <div className="bg-gray-50 px-5 py-3.5 border-b border-gray-100 flex justify-between items-center">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl bg-white border border-gray-200 flex items-center justify-center">
                        <svg className="w-4 h-4 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
                      </div>
                      <div>
                        <h3 className="font-bold text-gray-900 text-sm">{rider}</h3>
                        <p className="text-[11px] text-gray-400">{shipments.length} parcel{shipments.length !== 1 ? 's' : ''}</p>
                      </div>
                    </div>
                    <div className="no-print flex gap-1.5">
                      <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-green-700 bg-green-50 ring-1 ring-green-200 px-2.5 py-1 rounded-lg">
                        <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                        {shipments.filter(s => s.status === 'delivered').length} delivered
                      </span>
                      <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-blue-700 bg-blue-50 ring-1 ring-blue-200 px-2.5 py-1 rounded-lg">
                        <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                        {shipments.filter(s => s.status !== 'delivered').length} pending
                      </span>
                    </div>
                  </div>

                  {/* Table */}
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b border-gray-100">
                          <th className="text-left px-4 py-3 text-[11px] font-semibold text-gray-400 uppercase tracking-wider">#</th>
                          <th className="text-left px-4 py-3 text-[11px] font-semibold text-gray-400 uppercase tracking-wider">Tracking</th>
                          <th className="text-left px-4 py-3 text-[11px] font-semibold text-gray-400 uppercase tracking-wider">Receiver</th>
                          <th className="text-left px-4 py-3 text-[11px] font-semibold text-gray-400 uppercase tracking-wider">Phone</th>
                          <th className="text-left px-4 py-3 text-[11px] font-semibold text-gray-400 uppercase tracking-wider">Address</th>
                          <th className="text-left px-4 py-3 text-[11px] font-semibold text-gray-400 uppercase tracking-wider">Items</th>
                          <th className="text-left px-4 py-3 text-[11px] font-semibold text-gray-400 uppercase tracking-wider">COD</th>
                          <th className="text-left px-4 py-3 text-[11px] font-semibold text-gray-400 uppercase tracking-wider">Instructions</th>
                          <th className="text-left px-4 py-3 text-[11px] font-semibold text-gray-400 uppercase tracking-wider">Status</th>
                          <th className="text-left px-4 py-3 text-[11px] font-semibold text-gray-400 uppercase tracking-wider print:hidden">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100">
                        {shipments.map((s, i) => (
                          editItem === s.id ? (
                            <tr key={s.id} className="bg-amber-50/60">
                              <td className="px-4 py-3 text-xs text-gray-400">{i + 1}</td>
                              <td className="px-4 py-3 font-semibold text-gray-900 text-xs">{s.tracking_number}</td>
                              <td className="px-4 py-2"><input value={editForm.receiver_name} onChange={e => setEditForm({...editForm, receiver_name: e.target.value})} className="px-3 py-1.5 bg-gray-50 border border-gray-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-400 transition-all w-full" /></td>
                              <td className="px-4 py-2"><input value={editForm.receiver_phone} onChange={e => setEditForm({...editForm, receiver_phone: e.target.value})} className="px-3 py-1.5 bg-gray-50 border border-gray-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-400 transition-all w-full" /></td>
                              <td className="px-4 py-2"><input value={editForm.delivery_address} onChange={e => setEditForm({...editForm, delivery_address: e.target.value})} className="px-3 py-1.5 bg-gray-50 border border-gray-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-400 transition-all w-full" /></td>
                              <td className="px-4 py-3 text-xs text-gray-500">{s.num_items || '-'}</td>
                              <td className="px-4 py-3 text-xs text-gray-500">{s.cod_amount ? `LKR ${s.cod_amount}` : '-'}</td>
                              <td className="px-4 py-2"><input value={editForm.special_instructions} onChange={e => setEditForm({...editForm, special_instructions: e.target.value})} className="px-3 py-1.5 bg-gray-50 border border-gray-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-400 transition-all w-full" /></td>
                              <td className="px-4 py-2">
                                <select value={editForm.status} onChange={e => setEditForm({...editForm, status: e.target.value})} className="px-3 py-1.5 bg-gray-50 border border-gray-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-400 transition-all">
                                  {['at_sorting_center','sorted','out_for_delivery','customer_contacted','delivered','failed_delivery','rescheduled'].map(st => (
                                    <option key={st} value={st}>{st.replace(/_/g, ' ')}</option>
                                  ))}
                                </select>
                              </td>
                              <td className="px-4 py-3 print:hidden whitespace-nowrap">
                                <div className="flex items-center gap-2">
                                  <button onClick={() => handleSaveEdit(s.id)} className="px-3 py-1.5 bg-gradient-to-r from-blue-600 to-blue-500 text-white rounded-lg text-xs font-semibold hover:shadow-lg hover:shadow-blue-500/25 transition-all active:scale-[0.97]">Save</button>
                                  <button onClick={() => setEditItem(null)} className="px-3 py-1.5 bg-gray-100 text-gray-700 rounded-lg text-xs font-medium hover:bg-gray-200 transition-colors">Cancel</button>
                                </div>
                              </td>
                            </tr>
                          ) : (
                            <tr key={s.id} className={`hover:bg-gray-50/60 transition-colors group ${s.status === 'delivered' ? 'bg-green-50/30' : ''}`}>
                              <td className="px-4 py-3 text-xs text-gray-400">{i + 1}</td>
                              <td className="px-4 py-3 font-semibold text-gray-900 text-xs">{s.tracking_number}</td>
                              <td className="px-4 py-3 text-gray-700 text-xs">{s.receiver_name}</td>
                              <td className="px-4 py-3 text-gray-500 text-xs">{s.receiver_phone}</td>
                              <td className="px-4 py-3 text-gray-500 text-xs max-w-[180px] truncate">{s.delivery_address || s.receiver_address || '-'}</td>
                              <td className="px-4 py-3 text-gray-500 text-xs">{s.num_items || '-'}</td>
                              <td className="px-4 py-3 text-xs text-gray-700 font-medium">{s.cod_amount ? `LKR ${s.cod_amount}` : '-'}</td>
                              <td className="px-4 py-3 text-xs text-amber-600 max-w-[120px] truncate">{s.special_instructions || '-'}</td>
                              <td className="px-4 py-3 text-xs">
                                <span className={`inline-block px-2.5 py-1 rounded-lg text-[11px] font-semibold ${statusColors[s.status] || 'bg-gray-100 text-gray-700 ring-1 ring-gray-200'}`}>
                                  {s.status.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase())}
                                </span>
                              </td>
                              <td className="px-4 py-3 print:hidden">
                                <div className="flex gap-1.5 items-center flex-wrap">
                                  {s.status !== 'delivered' && (
                                    <select value={s.delivery_rider_id || ''} onChange={(e) => handleAssignRider(s.id, e.target.value || null)}
                                      className="px-2.5 py-1.5 bg-gray-50 border border-gray-200 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-blue-500/40 transition-all max-w-[100px]">
                                      <option value="">No Rider</option>
                                      {riders.map(r => <option key={r.id} value={r.id}>{r.name}</option>)}
                                    </select>
                                  )}
                                  <button onClick={() => handleEdit(s)} className="text-blue-500 hover:text-blue-700 text-xs font-medium transition-colors">Edit</button>
                                  {s.status !== 'delivered' && (
                                    <button onClick={async () => {
                                      if (!confirm(`Mark ${s.tracking_number} as delivered?`)) return;
                                      await fetch(`${API}/scan/${s.tracking_number}`, {
                                        method: 'PUT', headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${getToken()}` },
                                        body: JSON.stringify({ receiver_name: s.receiver_name, remarks: 'Marked delivered manually', rider_id: s.delivery_rider_id || riderFilter || null })
                                      });
                                      fetchSheet();
                                    }} className="text-green-600 hover:text-green-700 text-xs font-medium transition-colors">Deliver</button>
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
