import { useState, useEffect } from 'react';

const API = '/api/admin';

const defaultForm = {
  tracking_number: '', sw_tracking_number: '', client_id: '',
  sender_name: '', sender_phone: '', sender_address: '',
  receiver_name: '', receiver_phone: '', receiver_address: '',
  destination: '',
  num_items: '', weight: '', cod_amount: '',
  docket_date: new Date().toISOString().slice(0, 16),
  sorting_area: '',
  special_instructions: '',
};

export default function DocketEntry({ onBack }) {
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
  const [remainingItems, setRemainingItems] = useState(null);
  const [assignForm, setAssignForm] = useState({ id: null, rider_id: '', sorting_area: '' });

  const getToken = () => sessionStorage.getItem('swc_token');

  useEffect(() => { fetchItems(); fetchRiders(); fetchClients(); }, []);

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

  const generateTracking = async () => {
    try {
      const res = await fetch(`${API}/generate-pc-tracking`, { headers: { 'Authorization': `Bearer ${getToken()}` } });
      if (res.ok) {
        const data = await res.json();
        setForm({ ...form, tracking_number: data.tracking_number });
      }
    } catch (err) { console.error(err); }
  };

  const openNew = () => {
    setEditingId(null);
    setPickups([]);
    setSelectedPickupId(null);
    setRemainingItems(null);
    setForm({ ...defaultForm, docket_date: new Date().toISOString().slice(0, 16) });
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
      docket_date: s.pickup_scheduled_at ? s.pickup_scheduled_at.slice(0, 16) : new Date().toISOString().slice(0, 16),
      sorting_area: s.sorting_area || '',
      special_instructions: s.special_instructions || '',
    });
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
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
        if (!res.ok) { const d = await res.json(); alert(d.error); return; }
        shipment = await res.json();
      } else {
        const body = {
          ...form,
          client_id: form.client_id || null,
          pickup_id: selectedPickupId || null,
          origin: form.sender_address || 'N/A',
          destination: form.destination || form.receiver_address || 'N/A',
          delivery_type: '',
          delivery_charge: '',
          payment_status: 'pending',
          status: 'at_sorting_center',
        };
        const res = await fetch(`${API}/shipments`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${getToken()}` },
          body: JSON.stringify(body)
        });
        if (!res.ok) { const d = await res.json(); alert(d.error); return; }
        shipment = await res.json();

        if (form.sorting_area) {
          await fetch(`${API}/sorting/${shipment.id}/assign`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${getToken()}` },
            body: JSON.stringify({ rider_id: null, sorting_area: form.sorting_area })
          });
        }
      }

      setShowForm(false);
      setEditingId(null);
      setPickups([]);
      setSelectedPickupId(null);
      setRemainingItems(null);
      setForm(defaultForm);
      fetchItems(search);
    } catch (err) { alert(err.message); } finally { setSaving(false); }
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
      <html><head><title>Docket ${s.tracking_number}</title>
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
        <h2>Docket Entry — ${s.tracking_number}</h2>
      </div>
      <div class="info">
        <div class="box">
          <h3>Sender</h3>
          <p><strong>${s.sender_name || ''}</strong></p>
          <p>${s.sender_phone || ''}</p>
          <p>${s.sender_address || ''}</p>
        </div>
        <div class="box">
          <h3>Receiver</h3>
          <p><strong>${s.receiver_name || ''}</strong></p>
          <p>${s.receiver_phone || ''}</p>
          <p>${s.receiver_address || ''}</p>
        </div>
      </div>
      <table class="details">
        <tr><td>Docket #</td><td>${s.tracking_number}</td></tr>
        ${s.sw_tracking_number ? `<tr><td>SW Tracking #</td><td>${s.sw_tracking_number}</td></tr>` : ''}
        <tr><td>Destination</td><td>${s.destination || ''}</td></tr>
        <tr><td>Items</td><td>${s.num_items || 1}</td></tr>
        <tr><td>Weight</td><td>${s.weight || '-'}</td></tr>
        <tr><td>COD Amount</td><td>${s.cod_amount ? 'Rs. ' + parseFloat(s.cod_amount).toLocaleString() : '-'}</td></tr>
        <tr><td>Sorting Area</td><td>${s.sorting_area || '-'}</td></tr>
        <tr><td>Status</td><td>${s.status.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase())}</td></tr>
        ${s.special_instructions ? `<tr><td>Instructions</td><td>${s.special_instructions}</td></tr>` : ''}
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
          handlePickupSelect(String(p[0].id));
        } else if (p.length === 0) {
          setSelectedPickupId(null);
          setRemainingItems(null);
        }
      } else {
        setPickups([]);
        setSelectedPickupId(null);
        setRemainingItems(null);
      }
    } else {
      setForm({ ...form, client_id: '' });
      setPickups([]);
      setSelectedPickupId(null);
      setRemainingItems(null);
    }
  };

  const handlePickupSelect = async (pickupId) => {
    const pickup = pickups.find(p => String(p.id) === String(pickupId));
    if (pickup) {
      setSelectedPickupId(pickupId);
      setRemainingItems(pickup.remaining_items);
      const res = await fetch(`${API}/generate-pc-tracking`, { headers: { 'Authorization': `Bearer ${getToken()}` } });
      const newTracking = res.ok ? (await res.json()).tracking_number : '';
      setForm({
        ...form,
        tracking_number: newTracking,
        sender_name: pickup.sender_name || form.sender_name,
        sender_phone: pickup.sender_phone || form.sender_phone,
        sender_address: pickup.sender_address || form.sender_address,
        num_items: '1',
        weight: pickup.weight || form.weight,
        destination: pickup.destination || form.destination,
        special_instructions: pickup.special_instructions || form.special_instructions,
      });
    } else {
      setSelectedPickupId(null);
      setRemainingItems(null);
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <button onClick={onBack} className="text-brand-500 hover:underline text-sm mb-2 inline-block">&larr; Back to Dashboard</button>
          <h2 className="text-xl font-bold text-gray-900">Docket Entry</h2>
          <p className="text-xs text-gray-500 mt-1">Create, record & assign shipments at sorting center</p>
        </div>
        <button onClick={openNew} className="px-4 py-2 bg-brand-500 text-white rounded-lg text-sm font-semibold hover:bg-brand-600">
          + New Docket
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="bg-gray-50 rounded-xl p-6 border border-gray-100 mb-6">
          <h3 className="font-semibold text-gray-900 mb-4">{editingId ? 'Edit Docket Entry' : 'New Docket Entry'}</h3>

          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 mb-4">
            <div className="sm:col-span-2">
              <label className="block text-xs font-medium text-gray-600 mb-1">Docket / Tracking #</label>
              <div className="flex gap-2">
                <input type="text" required value={form.tracking_number} onChange={(e) => setForm({...form, tracking_number: e.target.value})}
                  placeholder="e.g. PC001" className="flex-1 px-3 py-2.5 border border-gray-300 rounded-lg text-sm font-bold text-brand-600" />
                <button type="button" onClick={generateTracking}
                  className="px-4 py-2.5 bg-gray-200 text-gray-700 rounded-lg text-sm hover:bg-gray-300 font-medium">Generate</button>
              </div>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Client</label>
              <select value={form.client_id} onChange={(e) => handleClientSelect(e.target.value)}
                className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm">
                <option value="">Walk-in / No Client</option>
                {clients.map(c => <option key={c.id} value={c.id}>{c.company_name || c.contact_person}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">No. of Items</label>
              <input type="text" inputMode="numeric" value={form.num_items}
                onChange={(e) => setForm({...form, num_items: e.target.value})}
                disabled={!!selectedPickupId}
                className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm disabled:bg-gray-100 disabled:text-gray-500" />
            </div>
          </div>

          {pickups.length > 1 && (
            <div className="mb-4">
              <label className="block text-xs font-medium text-gray-600 mb-1">From Pickup</label>
              <div className="flex items-center gap-4">
                <select onChange={(e) => handlePickupSelect(e.target.value)} className="flex-1 max-w-md px-3 py-2.5 border border-gray-300 rounded-lg text-sm">
                  <option value="">Select a pickup...</option>
                  {pickups.map(p => <option key={p.id} value={p.id}>{p.tracking_number} — {p.sender_name} ({p.remaining_items} left)</option>)}
                </select>
              </div>
            </div>
          )}
          {selectedPickupId && remainingItems !== null && (
            <div className="mb-4 text-sm text-gray-500">
              Pickup <span className="font-semibold text-brand-600">{pickups.find(p => String(p.id) === String(selectedPickupId))?.tracking_number}</span> — <span className="font-semibold text-brand-600">{remainingItems}</span> parcel{remainingItems !== 1 ? 's' : ''} remaining
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 mb-4">
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Weight (kg)</label>
              <input type="text" inputMode="decimal" placeholder="e.g. 1.5" value={form.weight} onChange={(e) => setForm({...form, weight: e.target.value})}
                className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm" />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Destination</label>
              <input type="text" value={form.destination} onChange={(e) => setForm({...form, destination: e.target.value})}
                placeholder="e.g. Kandy" className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm" />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Date & Time</label>
              <input type="datetime-local" value={form.docket_date} onChange={(e) => setForm({...form, docket_date: e.target.value})}
                className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm" />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">SW Tracking #</label>
              <input type="text" value={form.sw_tracking_number} onChange={(e) => setForm({...form, sw_tracking_number: e.target.value})}
                placeholder="e.g. SW0001" className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm" />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
            <div className="border border-gray-200 rounded-lg p-4 bg-white">
              <h4 className="text-xs font-semibold text-gray-500 uppercase mb-3">Sender</h4>
              <div className="space-y-2.5">
                <input type="text" placeholder="Name *" required value={form.sender_name} onChange={(e) => setForm({...form, sender_name: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm" />
                <input type="text" placeholder="Phone *" required value={form.sender_phone} onChange={(e) => setForm({...form, sender_phone: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm" />
                <input type="text" placeholder="Address" value={form.sender_address} onChange={(e) => setForm({...form, sender_address: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm" />
              </div>
            </div>
            <div className="border border-gray-200 rounded-lg p-4 bg-white">
              <h4 className="text-xs font-semibold text-gray-500 uppercase mb-3">Receiver</h4>
              <div className="space-y-2.5">
                <input type="text" placeholder="Name *" required value={form.receiver_name} onChange={(e) => setForm({...form, receiver_name: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm" />
                <input type="text" placeholder="Phone *" required value={form.receiver_phone} onChange={(e) => setForm({...form, receiver_phone: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm" />
                <input type="text" placeholder="Address" value={form.receiver_address} onChange={(e) => setForm({...form, receiver_address: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm" />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">COD Amount (Rs.)</label>
              <input type="text" inputMode="numeric" placeholder="e.g. 5000" value={form.cod_amount} onChange={(e) => setForm({...form, cod_amount: e.target.value})}
                className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm" />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Sorting Area</label>
              <input type="text" placeholder="e.g. Colombo 3" value={form.sorting_area} onChange={(e) => setForm({...form, sorting_area: e.target.value})}
                className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm" />
            </div>
          </div>

          <div className="mb-4">
            <label className="block text-xs font-medium text-gray-600 mb-1">Special Instructions</label>
            <textarea rows={2} placeholder="Notes for the delivery rider..." value={form.special_instructions}
              onChange={(e) => setForm({...form, special_instructions: e.target.value})}
              className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm" />
          </div>

          <div className="flex gap-2">
            <button type="submit" disabled={saving}
              className="px-5 py-2 bg-brand-500 text-white rounded-lg text-sm font-semibold hover:bg-brand-600 disabled:opacity-50">
              {saving ? 'Saving...' : editingId ? 'Update Docket' : 'Create Docket'}
            </button>
            <button type="button" onClick={() => { setShowForm(false); setEditingId(null); setForm(defaultForm); setPickups([]); setSelectedPickupId(null); setRemainingItems(null); }}
              className="px-5 py-2 bg-gray-200 text-gray-700 rounded-lg text-sm">Cancel</button>
          </div>
        </form>
      )}

      <div className="mb-4">
        <input type="text" placeholder="Search by docket#, sender, receiver..." value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full max-w-md px-3 py-2.5 border border-gray-300 rounded-lg text-sm" />
      </div>

      {assignForm.id && (
        <form onSubmit={handleAssign} className="bg-gray-50 rounded-xl p-6 border border-gray-100 mb-6">
          <h3 className="font-semibold text-gray-900 mb-4">Assign to Delivery Rider</h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <input type="text" placeholder="Sorting area (e.g. Colombo 3)" value={assignForm.sorting_area}
              onChange={(e) => setAssignForm({...assignForm, sorting_area: e.target.value})}
              className="px-3 py-2.5 border border-gray-300 rounded-lg text-sm" required />
            <select value={assignForm.rider_id} onChange={(e) => setAssignForm({...assignForm, rider_id: e.target.value})}
              className="px-3 py-2.5 border border-gray-300 rounded-lg text-sm" required>
              <option value="">Select rider</option>
              {riders.map(r => <option key={r.id} value={r.id}>{r.name} ({r.phone})</option>)}
            </select>
            <div className="flex gap-2">
              <button type="submit" className="px-4 py-2 bg-brand-500 text-white rounded-lg text-sm">Assign</button>
              <button type="button" onClick={() => setAssignForm({ id: null, rider_id: '', sorting_area: '' })} className="px-4 py-2 bg-gray-200 rounded-lg text-sm">Cancel</button>
            </div>
          </div>
        </form>
      )}

      {loading ? <p className="text-gray-500">Loading...</p> : items.length === 0 ? (
        <p className="text-gray-500">No docket entries found.</p>
      ) : (
        <div className="overflow-x-auto bg-white rounded-xl shadow border border-gray-100">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-gray-600">
              <tr>
                <th className="text-left px-4 py-3 font-medium">Docket #</th>
                <th className="text-left px-4 py-3 font-medium">Sender</th>
                <th className="text-left px-4 py-3 font-medium">Receiver</th>
                <th className="text-left px-4 py-3 font-medium">Destination</th>
                <th className="text-left px-4 py-3 font-medium">Items</th>
                <th className="text-left px-4 py-3 font-medium">Area</th>
                <th className="text-left px-4 py-3 font-medium">Rider</th>
                <th className="text-left px-4 py-3 font-medium">Status</th>
                <th className="text-right px-4 py-3 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {items.map(s => (
                <tr key={s.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 font-medium text-gray-900">{s.tracking_number}</td>
                  <td className="px-4 py-3 text-gray-600 text-xs">{s.sender_name}<br/><span className="text-gray-400">{s.sender_phone}</span></td>
                  <td className="px-4 py-3 text-gray-600 text-xs">{s.receiver_name}<br/><span className="text-gray-400">{s.receiver_phone}</span></td>
                  <td className="px-4 py-3 text-gray-600 text-xs">{s.destination}</td>
                  <td className="px-4 py-3 text-gray-600 text-xs">{s.num_items || '-'}</td>
                  <td className="px-4 py-3 text-gray-600 text-xs">{s.sorting_area || '-'}</td>
                  <td className="px-4 py-3 text-gray-600 text-xs">{s.rider_name || <span className="text-gray-400">—</span>}</td>
                  <td className="px-4 py-3">
                    <span className="inline-block px-2 py-0.5 rounded text-xs font-semibold bg-purple-100 text-purple-800">
                      {s.status.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase())}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right whitespace-nowrap">
                    {s.status === 'at_sorting_center' && (
                      <>
                        <button onClick={() => openEdit(s)}
                          className="text-blue-500 hover:underline text-xs mr-2">Edit</button>
                        <button onClick={() => setAssignForm({ id: s.id, rider_id: s.delivery_rider_id || '', sorting_area: s.sorting_area || '' })}
                          className="text-purple-500 hover:underline text-xs mr-2">Assign</button>
                        {s.delivery_rider_id && (
                          <button onClick={() => handleSort(s.id)}
                            className="text-indigo-500 hover:underline text-xs mr-2">Sort</button>
                        )}
                        <button onClick={() => handlePDF(s)}
                          className="text-green-500 hover:underline text-xs mr-2">PDF</button>
                        <button onClick={() => handleDelete(s.id, s.tracking_number)}
                          className="text-red-400 hover:text-red-600 text-xs">Delete</button>
                      </>
                    )}
                    {s.status === 'sorted' && (
                      <>
                        <button onClick={() => handlePDF(s)}
                          className="text-green-500 hover:underline text-xs mr-2">PDF</button>
                        <button onClick={() => handleDelete(s.id, s.tracking_number)}
                          className="text-red-400 hover:text-red-600 text-xs mr-2">Delete</button>
                        <span className="text-xs text-gray-400 italic">Sorted</span>
                      </>
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
