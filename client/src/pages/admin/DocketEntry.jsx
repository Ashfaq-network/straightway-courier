import { useState, useEffect, useRef } from 'react';

const API = '/api/admin';

const esc = (str) => String(str || '').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');

const localDT = () => {
  const d = new Date();
  const off = d.getTimezoneOffset();
  return new Date(d.getTime() - off * 60000).toISOString().slice(0, 16);
};

const defaultForm = {
  tracking_number: '', sw_tracking_number: '', client_id: '',
  sender_name: '', sender_phone: '', sender_address: '',
  receiver_name: '', receiver_phone: '', receiver_address: '',
  destination: '',
  num_items: '', weight: '', cod_amount: '',
  docket_date: localDT(),
  sorting_area: '',
  special_instructions: '',
};

const POSTAL_CODES = {
  '00100':'Fort','00200':'Slave Island','00300':'Colpetty','00400':'Bambalapitiya',
  '00500':'Havelock Town','00600':'Kirulapone','00700':'Wellawatte','00800':'Borella',
  '00900':'Dematagoda','01000':'Maradana','01100':'Pettah','01200':'Hulftsdorp',
  '01300':'Maligawatta','01400':'Grandpass','01500':'Mutwal','10100':'Sri Jayawardenepura Kotte',
  '10115':'Malabe','10120':'Battaramulla','10250':'Nugegoda','10280':'Maharagama',
  '10290':'Boralesgamuwa','10350':'Dehiwala','10400':'Moratuwa','10640':'Kaduwela',
  '11000':'Gampaha','11010':'Ragama','11450':'Katunayake','11500':'Negombo',
  '12000':'Kalutara','12070':'Beruwala','12500':'Panadura','20000':'Kandy',
  '20160':'Ampitiya','20400':'Peradeniya','20500':'Gampola','21100':'Dambulla',
  '22000':'Nuwara Eliya','30000':'Batticaloa','31000':'Trincomalee','32000':'Ampara',
  '40000':'Jaffna','50000':'Anuradhapura','51000':'Polonnaruwa','60000':'Kurunegala',
  '61000':'Chilaw','61170':'Wennappuwa','70000':'Ratnapura','71000':'Kegalle',
  '71200':'Undugoda','80000':'Galle','80240':'Hikkaduwa','80300':'Ambalangoda',
  '81000':'Matara','81180':'Kottegoda','81700':'Weligama','82000':'Hambantota',
  '90000':'Badulla','91000':'Monaragala',
};

export default function DocketEntry() {
  const [items, setItems] = useState([]);
  const [riders, setRiders] = useState([]);
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(defaultForm);
  const [saving, setSaving] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [pickups, setPickups] = useState([]);
  const [selectedPickupId, setSelectedPickupId] = useState(null);
  const [assignForm, setAssignForm] = useState({ id: null, rider_id: '', sorting_area: '' });
  const [postalSuggestions, setPostalSuggestions] = useState([]);
  const submittingRef = useRef(false);

  const getToken = () => sessionStorage.getItem('swc_token');

  useEffect(() => { fetchRiders(); fetchClients(); }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(true);
      fetchItems(search);
    }, 300);
    return () => clearTimeout(timer);
  }, [search]);

  const fetchItems = async (q) => {
    try {
      const params = new URLSearchParams();
      if (q) params.set('search', q);
      const res = await fetch(`${API}/sorting?${params}`, { headers: { 'Authorization': `Bearer ${getToken()}` } });
      if (res.ok) setItems(await res.json());
    } catch (err) { console.error(err); } finally { setLoading(false); }
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

  const fetchClients = async () => {
    try {
      const res = await fetch(`${API}/clients`, { headers: { 'Authorization': `Bearer ${getToken()}` } });
      if (res.ok) setClients(await res.json());
    } catch (err) { console.error(err); }
  };

  const fetchPickups = async (clientId) => {
    try {
      const res = await fetch(`${API}/pickups?client_id=${clientId}`, { headers: { 'Authorization': `Bearer ${getToken()}` } });
      if (res.ok) {
        const data = await res.json();
        setPickups(data.filter(p => p._type === 'shipment'));
      } else {
        setPickups([]);
      }
    } catch (err) { console.error(err); setPickups([]); }
  };


  const openNew = async () => {
    setEditingId(null);
    setPickups([]);
    setSelectedPickupId(null);
    let tn = '';
    try {
      const r = await fetch(`${API}/generate-pc-tracking`, { headers: { 'Authorization': `Bearer ${getToken()}` } });
      if (r.ok) tn = (await r.json()).tracking_number;
    } catch {}
    setForm({ ...defaultForm, tracking_number: tn, docket_date: localDT() });
    setShowForm(true);
  };

  const openEdit = (s) => {
    setEditingId(s.id);
    setForm({
      tracking_number: s.tracking_number || '',
      sw_tracking_number: s.sw_tracking_number || '',
      client_id: s.client_id || '',
      sender_name: s.sender_name || '',
      sender_phone: s.sender_phone || '',
      sender_address: s.sender_address || '',
      receiver_name: s.receiver_name || '',
      receiver_phone: s.receiver_phone || '',
      receiver_address: s.receiver_address || '',
      destination: s.destination || '',
      num_items: s.num_items || '',
      weight: s.weight || '',
      cod_amount: s.cod_amount || '',
      docket_date: s.pickup_scheduled_at ? s.pickup_scheduled_at.slice(0, 16) : localDT(),
      sorting_area: s.sorting_area || '',
      special_instructions: s.special_instructions || '',
    });
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (submittingRef.current) return;
    submittingRef.current = true;
    setSaving(true);
    try {
      let shipment;
      if (editingId) {
        const body = {
          tracking_number: form.tracking_number,
          sw_tracking_number: form.sw_tracking_number || null,
          client_id: form.client_id || null,
          sender_name: form.sender_name,
          sender_phone: form.sender_phone,
          sender_address: form.sender_address,
          receiver_name: form.receiver_name,
          receiver_phone: form.receiver_phone,
          receiver_address: form.receiver_address,
          num_items: form.num_items,
          weight: form.weight,
          cod_amount: form.cod_amount || null,
          origin: form.sender_address || 'N/A',
          destination: form.destination || form.receiver_address || 'N/A',
          pickup_scheduled_at: form.docket_date || null,
          special_instructions: form.special_instructions,
          sorting_area: form.sorting_area,
        };
        const res = await fetch(`${API}/shipments/${editingId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${getToken()}` },
          body: JSON.stringify(body)
        });
        if (!res.ok) { const d = await res.json(); alert(d.error); setSaving(false); submittingRef.current = false; return; }
        shipment = await res.json();
      } else if (selectedPickupId) {
        const body = {
          tracking_number: form.tracking_number,
          sw_tracking_number: form.sw_tracking_number || null,
          client_id: form.client_id || null,
          sender_name: form.sender_name,
          sender_phone: form.sender_phone,
          sender_address: form.sender_address,
          receiver_name: form.receiver_name,
          receiver_phone: form.receiver_phone,
          receiver_address: form.receiver_address,
          destination: form.destination || form.receiver_address || 'N/A',
          origin: form.sender_address || 'N/A',
          cod_amount: form.cod_amount || null,
          weight: form.weight,
          num_items: form.num_items || 1,
          special_instructions: form.special_instructions,
          sorting_area: form.sorting_area,
          status: 'pending_scan',
          pickup_scheduled_at: form.docket_date || null,
          pickup_id: Number(selectedPickupId),
        };
        const res = await fetch(`${API}/shipments`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${getToken()}` },
          body: JSON.stringify(body)
        });
        if (!res.ok) { const d = await res.json(); alert(d.error); setSaving(false); submittingRef.current = false; return; }
        shipment = await res.json();

        if (form.sorting_area) {
          await fetch(`${API}/sorting/${shipment.id}/assign`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${getToken()}` },
            body: JSON.stringify({ rider_id: null, sorting_area: form.sorting_area })
          });
        }
      } else {
        const body = {
          ...form,
          client_id: form.client_id || null,
          origin: form.sender_address || 'N/A',
          destination: form.destination || form.receiver_address || 'N/A',
          delivery_type: '',
          delivery_charge: '',
          payment_status: 'pending',
          status: 'pending_scan',
        };
        const res = await fetch(`${API}/shipments`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${getToken()}` },
          body: JSON.stringify(body)
        });
        if (!res.ok) { const d = await res.json(); alert(d.error); setSaving(false); submittingRef.current = false; return; }
        shipment = await res.json();

        if (form.sorting_area) {
          await fetch(`${API}/sorting/${shipment.id}/assign`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${getToken()}` },
            body: JSON.stringify({ rider_id: null, sorting_area: form.sorting_area })
          });
        }
      }

      if (editingId || !selectedPickupId) {
        setShowForm(false);
        setEditingId(null);
        setPickups([]);
        setSelectedPickupId(null);
        setForm({...defaultForm, docket_date: localDT()});
      } else {
        const currentPickup = pickups.find(p => String(p.id) === String(selectedPickupId));
        const remaining = currentPickup ? (currentPickup.remaining_items ?? currentPickup.num_items) - 1 : 0;
          if (remaining > 0) {
          const updated = { ...currentPickup, remaining_items: remaining };
          setPickups(pickups.map(p => String(p.id) === String(selectedPickupId) ? updated : p));
          await fillFromPickup(updated, form.client_id);
        } else {
          const remainingPickups = pickups.filter(p => String(p.id) !== String(selectedPickupId));
          setPickups(remainingPickups);
          if (remainingPickups.length > 0) {
            await fillFromPickup(remainingPickups[0], form.client_id);
          } else {
            setShowForm(false);
            setSelectedPickupId(null);
            setForm({
              ...defaultForm,
              client_id: form.client_id,
              sender_name: form.sender_name,
              sender_phone: form.sender_phone,
              sender_address: form.sender_address,
              docket_date: localDT(),
            });
          }
        }
      }
      fetchItems(search);
    } catch (err) { alert(err.message); } finally { setSaving(false); submittingRef.current = false; }
  };

  const handlePostalChange = (val) => {
    setForm({ ...form, receiver_address: val });
    if (val.length >= 3) {
      const matches = Object.entries(POSTAL_CODES)
        .filter(([code, city]) => code.startsWith(val) || city.toLowerCase().includes(val.toLowerCase()))
        .slice(0, 6);
      setPostalSuggestions(matches);
    } else {
      setPostalSuggestions([]);
    }
  };

  const selectPostal = (code, city) => {
    setForm({ ...form, receiver_address: code, destination: city });
    setPostalSuggestions([]);
  };

  const handleAssign = async (e) => {
    e.preventDefault();
    await fetch(`${API}/sorting/${assignForm.id}/assign`, {
      method: 'PUT', headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${getToken()}` },
      body: JSON.stringify({ rider_id: assignForm.rider_id ? parseInt(assignForm.rider_id) : null, sorting_area: assignForm.sorting_area })
    });
    setAssignForm({ id: null, rider_id: '', sorting_area: '' });
    fetchItems(search);
  };

  const handleSort = async (id) => {
    await fetch(`${API}/shipments/${id}/status`, {
      method: 'PUT', headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${getToken()}` },
      body: JSON.stringify({ status: 'sorted' })
    });
    fetchItems(search);
  };

  const handleDelete = async (id, tn) => {
    if (!confirm(`Delete docket entry ${tn}?`)) return;
    await fetch(`${API}/shipments/${id}`, {
      method: 'DELETE', headers: { 'Authorization': `Bearer ${getToken()}` }
    });
    fetchItems(search);
  };

  const handlePDF = (s) => {
    const w = window.open('', '_blank');
    w.document.write(`
      <html><head><title>Docket ${esc(s.tracking_number)}</title>
      <style>
        body { font-family: Arial, sans-serif; padding: 40px; color: #333; }
        .header { text-align: center; border-bottom: 2px solid #1e3a8a; padding-bottom: 15px; margin-bottom: 20px; }
        .header h1 { color: #1e3a8a; margin: 0; font-size: 22px; }
        .header h2 { color: #666; margin: 5px 0 0; font-size: 16px; font-weight: normal; }
        .info { display: flex; justify-content: space-between; gap: 30px; margin-bottom: 20px; }
        .box { flex: 1; border: 1px solid #ddd; border-radius: 6px; padding: 12px; }
        .box h3 { margin: 0 0 8px; font-size: 12px; color: #999; text-transform: uppercase; }
        .box p { margin: 3px 0; font-size: 14px; }
        .details { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
        .details td { padding: 6px 10px; border: 1px solid #eee; font-size: 13px; }
        .details td:first-child { font-weight: 600; color: #666; width: 140px; background: #f9f9f9; }
        .footer { text-align: center; color: #999; font-size: 11px; border-top: 1px solid #ddd; padding-top: 15px; }
        @media print { body { padding: 20px; } }
      </style></head><body>
      <div class="header">
        <h1>STRAIGHTWAY COURIERS</h1>
        <h2>Docket Entry — ${esc(s.tracking_number)}</h2>
      </div>
      <div class="info">
        <div class="box">
          <h3>Sender</h3>
          <p><strong>${esc(s.sender_name)}</strong></p>
          <p>${esc(s.sender_phone)}</p>
          <p>${esc(s.sender_address)}</p>
        </div>
        <div class="box">
          <h3>Receiver</h3>
          <p><strong>${esc(s.receiver_name)}</strong></p>
          <p>${esc(s.receiver_phone)}</p>
          <p>Postal Code: ${esc(s.receiver_address)}</p>
        </div>
      </div>
      <table class="details">
        <tr><td>Docket #</td><td>${esc(s.tracking_number)}</td></tr>
        ${s.sw_tracking_number ? `<tr><td>SW Tracking #</td><td>${esc(s.sw_tracking_number)}</td></tr>` : ''}
        <tr><td>Destination</td><td>${esc(s.destination)}</td></tr>
        <tr><td>Items</td><td>${esc(s.num_items || 1)}</td></tr>
        <tr><td>Weight</td><td>${esc(s.weight || '-')}</td></tr>
        <tr><td>COD Amount</td><td>${s.cod_amount ? 'Rs. ' + parseFloat(s.cod_amount).toLocaleString() : '-'}</td></tr>
        <tr><td>Sorting Area</td><td>${esc(s.sorting_area || '-')}</td></tr>
        <tr><td>Status</td><td>${esc(s.status.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase()))}</td></tr>
        ${s.special_instructions ? `<tr><td>Instructions</td><td>${esc(s.special_instructions)}</td></tr>` : ''}
      </table>
      <div class="footer">Generated on ${new Date().toLocaleDateString('en-GB')} — Straightway Couriers</div>
      <script>window.print()<\/script>
      </body></html>
    `);
    w.document.close();
  };

  const handleClientSelect = async (clientId) => {
    const client = clients.find(c => String(c.id) === String(clientId));
    if (client) {
      setForm({
        ...form,
        client_id: clientId,
        sender_name: client.contact_person || '',
        sender_phone: client.phone || '',
        sender_address: client.address || '',
      });
      const res = await fetch(`${API}/pickups?client_id=${clientId}`, { headers: { 'Authorization': `Bearer ${getToken()}` } });
      if (res.ok) {
        const data = await res.json();
        const p = data.filter(p => p._type === 'shipment');
        setPickups(p);
        if (p.length === 1) {
          await fillFromPickup(p[0], clientId);
        } else if (p.length === 0) {
          setSelectedPickupId(null);
          let tn = form.tracking_number;
          if (!tn) {
            try {
              const r = await fetch(`${API}/generate-pc-tracking`, { headers: { 'Authorization': `Bearer ${getToken()}` } });
              if (r.ok) tn = (await r.json()).tracking_number;
            } catch {}
          }
          setForm(f => ({ ...f, tracking_number: tn }));
        }
      } else {
        setPickups([]);
        setSelectedPickupId(null);
      }
    } else {
      setForm({ ...form, client_id: '' });
      setPickups([]);
      setSelectedPickupId(null);
    }
  };

  const handlePickupSelect = async (pickupId) => {
    const pickup = pickups.find(p => String(p.id) === String(pickupId));
    if (pickup) {
      setSelectedPickupId(pickupId);
      setForm({
        ...form,
        tracking_number: pickup.tracking_number || '',
        sender_name: pickup.sender_name || form.sender_name,
        sender_phone: pickup.sender_phone || form.sender_phone,
        sender_address: pickup.sender_address || form.sender_address,
        num_items: '1',
        weight: pickup.weight || form.weight,
        destination: pickup.destination || form.destination,
        special_instructions: pickup.special_instructions || form.special_instructions,
      });
    }
  };

  const fillFromPickup = async (pickup, clientId) => {
    if (!pickup) return;
    setSelectedPickupId(pickup.id);
    setForm({
      ...defaultForm,
      tracking_number: pickup.tracking_number || '',
      client_id: clientId || '',
      sender_name: pickup.sender_name || '',
      sender_phone: pickup.sender_phone || '',
      sender_address: pickup.sender_address || '',
      num_items: '1',
      weight: pickup.weight || '',
      destination: pickup.destination || '',
      special_instructions: pickup.special_instructions || '',
      docket_date: localDT(),
    });
  };

  const statusBadge = (status) => {
    const colors = {
      pending_scan: 'bg-slate-100 text-slate-700 ring-1 ring-slate-200',
      at_sorting_center: 'bg-violet-50 text-violet-700 ring-1 ring-violet-200',
      sorted: 'bg-indigo-50 text-indigo-700 ring-1 ring-indigo-200',
      out_for_delivery: 'bg-blue-50 text-blue-700 ring-1 ring-blue-200',
      delivered: 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200',
      failed_delivery: 'bg-red-50 text-red-700 ring-1 ring-red-200',
    };
    const cls = colors[status] || 'bg-gray-100 text-gray-700 ring-1 ring-gray-200';
    return <span className={`inline-flex items-center px-2.5 py-1 rounded-lg text-[11px] font-bold uppercase tracking-wide ${cls}`}>{status.replace(/_/g, ' ')}</span>;
  };

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 bg-gradient-to-br from-blue-600 to-blue-500 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/20">
            <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" /></svg>
          </div>
          <div>
            <h2 className="text-lg font-bold text-gray-900">Docket Entry</h2>
            <p className="text-[13px] text-gray-400 mt-0.5">Create, record &amp; assign shipments at sorting center</p>
          </div>
        </div>
        <button onClick={openNew}
          className="px-4 py-2.5 bg-gradient-to-r from-blue-600 to-blue-500 text-white rounded-xl text-sm font-semibold hover:shadow-lg hover:shadow-blue-500/25 transition-all active:scale-[0.97]">
          + New Docket
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
          <h3 className="font-bold text-gray-900 text-base mb-1">{editingId ? 'Edit Docket Entry' : 'New Docket Entry'}</h3>
          {!editingId && (
            <p className="mb-5 text-[13px] text-gray-400">Docket # <span className="font-bold text-amber-600">{form.tracking_number}</span></p>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-5">
            <div>
              <label className="block text-[13px] font-semibold text-gray-600 mb-1.5">Client</label>
              <select value={form.client_id} onChange={(e) => handleClientSelect(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-400 transition-all">
                <option value="">Walk-in / No Client</option>
                {clients.map(c => <option key={c.id} value={c.id}>{c.company_name || c.contact_person}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-[13px] font-semibold text-gray-600 mb-1.5">No. of Items</label>
              <input type="text" inputMode="numeric" value={form.num_items}
                onChange={(e) => setForm({...form, num_items: e.target.value})}
                disabled={!!selectedPickupId}
                className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-400 transition-all disabled:bg-gray-100 disabled:text-gray-500 disabled:cursor-not-allowed" />
            </div>
          </div>

          {pickups.length > 1 && (
            <div className="mb-5">
              <label className="block text-[13px] font-semibold text-gray-600 mb-1.5">From Pickup</label>
              <select onChange={(e) => handlePickupSelect(e.target.value)} className="w-full max-w-md px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-400 transition-all">
                <option value="">Select a pickup...</option>
                {pickups.map(p => <option key={p.id} value={p.id}>{p.tracking_number} — {p.sender_name}</option>)}
              </select>
            </div>
          )}
          {selectedPickupId && (() => {
            const p = pickups.find(p => String(p.id) === String(selectedPickupId));
            return p ? (
              <div className="mb-5 px-4 py-3 bg-blue-50/60 rounded-xl border border-blue-100 text-[13px] text-gray-600">
                Pickup: <span className="font-bold text-blue-700">{p.tracking_number}</span>
                {' \u00B7 '}Parcels: <span className="font-bold text-blue-700">{p.num_items}</span>
                {p.remaining_items != null && <> ({p.remaining_items} remaining)</>}
                {' \u00B7 '}Docket #: <span className="font-bold text-amber-600">{form.tracking_number}</span>
              </div>
            ) : null;
          })()}

          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 mb-5">
            <div>
              <label className="block text-[13px] font-semibold text-gray-600 mb-1.5">Weight (kg)</label>
              <input type="text" inputMode="decimal" placeholder="e.g. 1.5" value={form.weight} onChange={(e) => setForm({...form, weight: e.target.value})}
                className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-400 transition-all" />
            </div>
            <div>
              <label className="block text-[13px] font-semibold text-gray-600 mb-1.5">Destination</label>
              <input type="text" value={form.destination} onChange={(e) => setForm({...form, destination: e.target.value})}
                placeholder="e.g. Kandy" className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-400 transition-all" />
            </div>
            <div>
              <label className="block text-[13px] font-semibold text-gray-600 mb-1.5">Date &amp; Time</label>
              <input type="datetime-local" value={form.docket_date} onChange={(e) => setForm({...form, docket_date: e.target.value})}
                className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-400 transition-all" />
            </div>
            <div>
              <label className="block text-[13px] font-semibold text-gray-600 mb-1.5">SW Tracking # *</label>
              <input type="text" required value={form.sw_tracking_number} onChange={(e) => setForm({...form, sw_tracking_number: e.target.value})}
                placeholder="e.g. SW0001" className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-400 transition-all" />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-5">
            <div className="border border-gray-100 rounded-2xl p-5 bg-gray-50/50">
              <h4 className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-3 pb-3 border-b border-gray-200/60">Sender</h4>
              <div className="space-y-3">
                <input type="text" placeholder="Name *" required value={form.sender_name} onChange={(e) => setForm({...form, sender_name: e.target.value})}
                  className="w-full px-3.5 py-2.5 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-400 transition-all" />
                <input type="text" placeholder="Phone *" required value={form.sender_phone} onChange={(e) => setForm({...form, sender_phone: e.target.value})}
                  className="w-full px-3.5 py-2.5 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-400 transition-all" />
                <input type="text" placeholder="Address" value={form.sender_address} onChange={(e) => setForm({...form, sender_address: e.target.value})}
                  className="w-full px-3.5 py-2.5 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-400 transition-all" />
              </div>
            </div>
            <div className="border border-gray-100 rounded-2xl p-5 bg-gray-50/50">
              <h4 className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-3 pb-3 border-b border-gray-200/60">Receiver</h4>
              <div className="space-y-3">
                <input type="text" placeholder="Name *" required value={form.receiver_name} onChange={(e) => setForm({...form, receiver_name: e.target.value})}
                  className="w-full px-3.5 py-2.5 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-400 transition-all" />
                <input type="text" placeholder="Phone *" required value={form.receiver_phone} onChange={(e) => setForm({...form, receiver_phone: e.target.value})}
                  className="w-full px-3.5 py-2.5 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-400 transition-all" />
                <div className="relative">
                  <input type="text" placeholder="Postal Code *" required value={form.receiver_address} onChange={(e) => handlePostalChange(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-400 transition-all" />
                  {postalSuggestions.length > 0 && (
                    <div className="absolute z-20 left-0 right-0 mt-1.5 border border-gray-200 rounded-xl bg-white shadow-lg overflow-hidden">
                      {postalSuggestions.map(([code, city]) => (
                        <button key={code} type="button" onClick={() => selectPostal(code, city)}
                          className="w-full text-left px-4 py-2.5 text-sm hover:bg-gray-50 transition-colors border-b border-gray-50 last:border-0">
                          <span className="font-bold text-gray-900">{code}</span> <span className="text-gray-400">—</span> <span className="text-gray-600">{city}</span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-5">
            <div>
              <label className="block text-[13px] font-semibold text-gray-600 mb-1.5">COD Amount (Rs.)</label>
              <input type="text" inputMode="numeric" placeholder="e.g. 5000" value={form.cod_amount} onChange={(e) => setForm({...form, cod_amount: e.target.value})}
                className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-400 transition-all" />
            </div>
            <div>
              <label className="block text-[13px] font-semibold text-gray-600 mb-1.5">Sorting Area</label>
              <input type="text" placeholder="e.g. Colombo 3" value={form.sorting_area} onChange={(e) => setForm({...form, sorting_area: e.target.value})}
                className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-400 transition-all" />
            </div>
          </div>

          <div className="mb-5">
            <label className="block text-[13px] font-semibold text-gray-600 mb-1.5">Special Instructions</label>
            <textarea rows={2} placeholder="Notes for the delivery rider..." value={form.special_instructions}
              onChange={(e) => setForm({...form, special_instructions: e.target.value})}
              className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-400 transition-all resize-none" />
          </div>

          <div className="flex gap-2.5 pt-1">
            <button type="submit" disabled={saving}
              className="px-5 py-2.5 bg-gradient-to-r from-blue-600 to-blue-500 text-white rounded-xl text-sm font-semibold hover:shadow-lg hover:shadow-blue-500/25 transition-all active:scale-[0.97] disabled:opacity-50 disabled:cursor-not-allowed">
              {saving ? 'Saving...' : editingId ? 'Update Docket' : 'Create Docket'}
            </button>
            <button type="button" onClick={() => { setShowForm(false); setEditingId(null); setForm({...defaultForm, docket_date: localDT()}); setPickups([]); setSelectedPickupId(null); }}
              className="px-5 py-2.5 bg-gray-100 text-gray-600 rounded-xl text-sm font-semibold hover:bg-gray-200 transition-colors">Cancel</button>
          </div>
        </form>
      )}

      <div className="relative max-w-md">
        <svg className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" /></svg>
        <input type="text" placeholder="Search by docket#, sender, receiver..." value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-400 transition-all" />
      </div>

      {assignForm.id && (
        <form onSubmit={handleAssign} className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
          <h3 className="font-bold text-gray-900 text-base mb-4">Assign to Delivery Rider</h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <input type="text" placeholder="Sorting area (e.g. Colombo 3)" value={assignForm.sorting_area}
              onChange={(e) => setAssignForm({...assignForm, sorting_area: e.target.value})}
              className="px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-400 transition-all" required />
            <select value={assignForm.rider_id} onChange={(e) => setAssignForm({...assignForm, rider_id: e.target.value})}
              className="px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-400 transition-all" required>
              <option value="">Select rider</option>
              {riders.map(r => <option key={r.id} value={r.id}>{r.name} ({r.phone})</option>)}
            </select>
            <div className="flex gap-2.5">
              <button type="submit" className="px-5 py-2.5 bg-gradient-to-r from-blue-600 to-blue-500 text-white rounded-xl text-sm font-semibold hover:shadow-lg hover:shadow-blue-500/25 transition-all active:scale-[0.97]">Assign</button>
              <button type="button" onClick={() => setAssignForm({ id: null, rider_id: '', sorting_area: '' })} className="px-5 py-2.5 bg-gray-100 text-gray-600 rounded-xl text-sm font-semibold hover:bg-gray-200 transition-colors">Cancel</button>
            </div>
          </div>
        </form>
      )}

      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
        {loading ? (
          <div className="p-16 flex flex-col items-center gap-3">
            <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
            <p className="text-sm text-gray-400 font-medium">Loading docket entries...</p>
          </div>
        ) : items.length === 0 ? (
          <div className="p-16 text-center">
            <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" /></svg>
            </div>
            <p className="text-gray-500 font-semibold">No docket entries found</p>
            <p className="text-sm text-gray-400 mt-1 mb-4">Create your first docket entry to get started</p>
            <button onClick={openNew} className="px-5 py-2.5 bg-gradient-to-r from-blue-600 to-blue-500 text-white rounded-xl text-sm font-semibold hover:shadow-lg hover:shadow-blue-500/25 transition-all">+ New Docket</button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100">
                  <th className="text-left px-6 py-3.5 font-semibold text-[11px] text-gray-400 uppercase tracking-wider">Docket #</th>
                  <th className="text-left px-6 py-3.5 font-semibold text-[11px] text-gray-400 uppercase tracking-wider">SW Tracking</th>
                  <th className="text-left px-6 py-3.5 font-semibold text-[11px] text-gray-400 uppercase tracking-wider">Sender</th>
                  <th className="text-left px-6 py-3.5 font-semibold text-[11px] text-gray-400 uppercase tracking-wider">Receiver</th>
                  <th className="text-left px-6 py-3.5 font-semibold text-[11px] text-gray-400 uppercase tracking-wider">Postal Code</th>
                  <th className="text-left px-6 py-3.5 font-semibold text-[11px] text-gray-400 uppercase tracking-wider">Items</th>
                  <th className="text-left px-6 py-3.5 font-semibold text-[11px] text-gray-400 uppercase tracking-wider">Area</th>
                  <th className="text-left px-6 py-3.5 font-semibold text-[11px] text-gray-400 uppercase tracking-wider">Rider</th>
                  <th className="text-left px-6 py-3.5 font-semibold text-[11px] text-gray-400 uppercase tracking-wider">Status</th>
                  <th className="text-right px-6 py-3.5 font-semibold text-[11px] text-gray-400 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {items.map(s => (
                  <tr key={s.id} className="hover:bg-gray-50/60 transition-colors group">
                    <td className="px-6 py-4">
                      <span className="font-bold text-blue-600 text-[13px] bg-blue-50 px-2.5 py-1 rounded-lg">{s.tracking_number}</span>
                    </td>
                    <td className="px-6 py-4 text-[13px] text-gray-500 font-medium">{s.sw_tracking_number || <span className="text-gray-300">—</span>}</td>
                    <td className="px-6 py-4">
                      <p className="text-[13px] font-medium text-gray-900">{s.sender_name}</p>
                      <p className="text-[12px] text-gray-400 mt-0.5">{s.sender_phone}</p>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-[13px] font-medium text-gray-900">{s.receiver_name}</p>
                      <p className="text-[12px] text-gray-400 mt-0.5">{s.receiver_phone}</p>
                    </td>
                    <td className="px-6 py-4 text-[13px] text-gray-500">{s.receiver_address || <span className="text-gray-300">—</span>}</td>
                    <td className="px-6 py-4 text-[13px] text-gray-500 font-medium">{s.num_items || <span className="text-gray-300">—</span>}</td>
                    <td className="px-6 py-4 text-[13px] text-gray-500">{s.sorting_area || <span className="text-gray-300">—</span>}</td>
                    <td className="px-6 py-4 text-[13px] text-gray-500">{s.rider_name || <span className="text-gray-300">—</span>}</td>
                    <td className="px-6 py-4">{statusBadge(s.status)}</td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-end gap-1 opacity-60 group-hover:opacity-100 transition-opacity">
                        {(s.status === 'at_sorting_center' || s.status === 'pending_scan') && (
                          <>
                            <button onClick={() => openEdit(s)}
                              className="px-2.5 py-1.5 text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-lg text-[12px] font-medium transition-all">Edit</button>
                            <button onClick={() => setAssignForm({ id: s.id, rider_id: s.delivery_rider_id || '', sorting_area: s.sorting_area || '' })}
                              className="px-2.5 py-1.5 text-violet-600 hover:text-violet-700 hover:bg-violet-50 rounded-lg text-[12px] font-medium transition-all">Assign</button>
                            {s.delivery_rider_id && (
                              <button onClick={() => handleSort(s.id)}
                                className="px-2.5 py-1.5 text-indigo-600 hover:text-indigo-700 hover:bg-indigo-50 rounded-lg text-[12px] font-medium transition-all">Sort</button>
                            )}
                            <button onClick={() => handlePDF(s)}
                              className="px-2.5 py-1.5 text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50 rounded-lg text-[12px] font-medium transition-all">PDF</button>
                            <button onClick={() => handleDelete(s.id, s.tracking_number)}
                              className="px-2.5 py-1.5 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg text-[12px] font-medium transition-all">Del</button>
                          </>
                        )}
                        {s.status === 'sorted' && (
                          <>
                            <button onClick={() => handlePDF(s)}
                              className="px-2.5 py-1.5 text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50 rounded-lg text-[12px] font-medium transition-all">PDF</button>
                            <button onClick={() => handleDelete(s.id, s.tracking_number)}
                              className="px-2.5 py-1.5 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg text-[12px] font-medium transition-all">Del</button>
                            <span className="px-2.5 py-1.5 text-[12px] text-gray-400 italic font-medium">Sorted</span>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
