import { useState, useEffect } from 'react';

const API = '/api/admin';

const statusColors = {
  pickup_requested: 'bg-yellow-50 text-yellow-700 ring-yellow-600/20',
  picked_up: 'bg-orange-50 text-orange-700 ring-orange-600/20',
};

const defaultPickupForm = {
  tracking_number: '', client_id: '',
  sender_name: '', sender_phone: '', sender_address: '',
  parcel_type: '',
  num_items: '', pickup_scheduled_at: '', pickup_driver_id: '',
  special_instructions: '',
};

export default function Pickups() {
  const [pickups, setPickups] = useState([]);
  const [drivers, setDrivers] = useState([]);
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [pickupForm, setPickupForm] = useState(defaultPickupForm);
  const [creating, setCreating] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [assignForm, setAssignForm] = useState({ id: null, driver_id: '', scheduled_at: '' });

  const getToken = () => sessionStorage.getItem('swc_token');

  useEffect(() => { fetchPickups(); fetchDrivers(); fetchClients(); }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(true);
      fetchPickups(search);
    }, 300);
    return () => clearTimeout(timer);
  }, [search]);

  const fetchPickups = async (q) => {
    try {
      const params = new URLSearchParams();
      if (q) params.set('search', q);
      const res = await fetch(`${API}/pickups?${params}`, { headers: { 'Authorization': `Bearer ${getToken()}` } });
      if (res.ok) setPickups(await res.json());
    } catch (err) { console.error(err); } finally { setLoading(false); }
  };

  const fetchDrivers = async () => {
    try {
      const res = await fetch(`${API}/staff`, { headers: { 'Authorization': `Bearer ${getToken()}` } });
      if (res.ok) {
        const data = await res.json();
        setDrivers(data.filter(s => s.is_active));
      }
    } catch (err) { console.error(err); }
  };

  const fetchClients = async () => {
    try {
      const res = await fetch(`${API}/clients`, { headers: { 'Authorization': `Bearer ${getToken()}` } });
      if (res.ok) setClients(await res.json());
    } catch (err) { console.error(err); }
  };

  const openNewPickup = async () => {
    try {
      const res = await fetch(`${API}/generate-pc-tracking`, { headers: { 'Authorization': `Bearer ${getToken()}` } });
      if (res.ok) {
        const data = await res.json();
        setEditingId(null);
        setPickupForm({ ...defaultPickupForm, tracking_number: data.tracking_number });
        setShowForm(true);
      }
    } catch (err) { console.error(err); }
  };

  const openEditPickup = async (p) => {
    setEditingId(p.id);
    setPickupForm({
      tracking_number: p.tracking_number || '',
      client_id: p.client_id || '',
      sender_name: p.sender_name || '',
      sender_phone: p.sender_phone || '',
      sender_address: p.sender_address || '',
      parcel_type: p.parcel_type || '',
      num_items: p.num_items || '',
      pickup_scheduled_at: p.pickup_scheduled_at ? p.pickup_scheduled_at.slice(0, 16) : '',
      pickup_driver_id: p.pickup_driver_id || '',
      special_instructions: p.special_instructions || '',
    });
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const cancelForm = () => {
    setShowForm(false);
    setEditingId(null);
    setPickupForm(defaultPickupForm);
  };

  const handlePickupSubmit = async (e) => {
    e.preventDefault();
    setCreating(true);
    try {
      const body = {
        ...pickupForm,
        client_id: pickupForm.client_id || null,
        receiver_name: pickupForm.sender_name,
        receiver_phone: pickupForm.sender_phone,
        origin: pickupForm.sender_address || 'N/A',
        destination: pickupForm.sender_address || 'N/A',
        delivery_type: '', cod_amount: '', delivery_charge: '',
        payment_status: 'pending',
        status: editingId ? undefined : 'pickup_requested',
      };
      if (!editingId) {
        body.status = 'pickup_requested';
      }

      let shipment;
      if (editingId) {
        const res = await fetch(`${API}/shipments/${editingId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${getToken()}` },
          body: JSON.stringify(body)
        });
        if (!res.ok) { const d = await res.json(); alert(d.error); return; }
        shipment = await res.json();

        if (pickupForm.pickup_driver_id || pickupForm.pickup_scheduled_at) {
          await fetch(`${API}/pickups/${editingId}/assign`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${getToken()}` },
            body: JSON.stringify({
              driver_id: pickupForm.pickup_driver_id ? parseInt(pickupForm.pickup_driver_id) : null,
              scheduled_at: pickupForm.pickup_scheduled_at || null,
            })
          });
        }
      } else {
        const res = await fetch(`${API}/shipments`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${getToken()}` },
          body: JSON.stringify(body)
        });
        if (!res.ok) { const d = await res.json(); alert(d.error); return; }
        shipment = await res.json();

        if (pickupForm.pickup_driver_id || pickupForm.pickup_scheduled_at) {
          await fetch(`${API}/pickups/${shipment.id}/assign`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${getToken()}` },
            body: JSON.stringify({
              driver_id: pickupForm.pickup_driver_id ? parseInt(pickupForm.pickup_driver_id) : null,
              scheduled_at: pickupForm.pickup_scheduled_at || null,
            })
          });
        }
      }

      cancelForm();
      fetchPickups();
    } catch (err) { alert(err.message); } finally { setCreating(false); }
  };

  const handleClientSelect = (clientId) => {
    const client = clients.find(c => String(c.id) === String(clientId));
    if (client) {
      setPickupForm({
        ...pickupForm,
        client_id: clientId,
        sender_name: client.contact_person || '',
        sender_phone: client.phone || '',
        sender_address: client.address || '',
      });
    } else {
      setPickupForm({ ...pickupForm, client_id: '' });
    }
  };

  const handleAssign = async (e) => {
    e.preventDefault();
    await fetch(`${API}/pickups/${assignForm.id}/assign`, {
      method: 'PUT', headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${getToken()}` },
      body: JSON.stringify({ driver_id: assignForm.driver_id ? parseInt(assignForm.driver_id) : null, scheduled_at: assignForm.scheduled_at || null })
    });
    setAssignForm({ id: null, driver_id: '', scheduled_at: '' });
    fetchPickups();
  };

  const handleStatus = async (id, status) => {
    await fetch(`${API}/shipments/${id}/status`, {
      method: 'PUT', headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${getToken()}` },
      body: JSON.stringify({ status })
    });
    fetchPickups();
  };

  const handleDelete = async (id, tracking) => {
    if (!confirm(`Delete pickup ${tracking}? This cannot be undone.`)) return;
    await fetch(`${API}/shipments/${id}`, {
      method: 'DELETE', headers: { 'Authorization': `Bearer ${getToken()}` }
    });
    fetchPickups();
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-xl bg-amber-50 flex items-center justify-center">
            <svg className="w-5 h-5 text-amber-600" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" /></svg>
          </div>
          <div>
            <h2 className="text-lg font-bold text-gray-900">Pickups</h2>
            <p className="text-[13px] text-gray-400 mt-0.5">Manage pickup requests and scheduling</p>
          </div>
        </div>
        <button onClick={openNewPickup} className="px-4 py-2.5 bg-gradient-to-r from-blue-600 to-blue-500 text-white rounded-xl text-sm font-semibold hover:shadow-lg hover:shadow-blue-500/25 transition-all active:scale-[0.97]">
          + New Pickup
        </button>
      </div>

      {showForm && (
        <form onSubmit={handlePickupSubmit} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
          <div className="flex items-center gap-3 mb-5">
            <div className="w-11 h-11 rounded-xl bg-blue-50 flex items-center justify-center">
              <svg className="w-5 h-5 text-blue-600" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" /></svg>
            </div>
            <div>
              <h3 className="text-lg font-bold text-gray-900">{editingId ? 'Edit Pickup' : 'New Pickup (PC Series)'}</h3>
              <p className="text-[13px] text-gray-400 mt-0.5">Fill in the pickup details below</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 mb-5">
            <div>
              <label className="block text-[13px] font-medium text-gray-700 mb-1.5">Tracking Number</label>
              <input type="text" value={pickupForm.tracking_number} onChange={(e) => setPickupForm({...pickupForm, tracking_number: e.target.value})}
                className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm font-bold text-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-400 transition-all" />
            </div>
            <div>
              <label className="block text-[13px] font-medium text-gray-700 mb-1.5">Client</label>
              <select value={pickupForm.client_id} onChange={(e) => handleClientSelect(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-400 transition-all">
                <option value="">Walk-in / No Client</option>
                {clients.map(c => <option key={c.id} value={c.id}>{c.company_name || c.contact_person}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-[13px] font-medium text-gray-700 mb-1.5">Parcel Type</label>
              <input type="text" placeholder="e.g. Document, Package" value={pickupForm.parcel_type} onChange={(e) => setPickupForm({...pickupForm, parcel_type: e.target.value})}
                className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-400 transition-all" />
            </div>
            <div>
              <label className="block text-[13px] font-medium text-gray-700 mb-1.5">No. of Parcels</label>
              <input type="text" inputMode="numeric" placeholder="e.g. 2" value={pickupForm.num_items} onChange={(e) => setPickupForm({...pickupForm, num_items: e.target.value})}
                className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-400 transition-all" />
            </div>
          </div>

          <div className="border border-gray-100 rounded-xl p-4 bg-gray-50/50 mb-5">
            <h4 className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider mb-3">Sender Details</h4>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <input type="text" placeholder="Name *" required value={pickupForm.sender_name} onChange={(e) => setPickupForm({...pickupForm, sender_name: e.target.value})}
                className="w-full px-3.5 py-2.5 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-400 transition-all" />
              <input type="text" placeholder="Phone *" required value={pickupForm.sender_phone} onChange={(e) => setPickupForm({...pickupForm, sender_phone: e.target.value})}
                className="w-full px-3.5 py-2.5 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-400 transition-all" />
              <input type="text" placeholder="Address" value={pickupForm.sender_address} onChange={(e) => setPickupForm({...pickupForm, sender_address: e.target.value})}
                className="w-full px-3.5 py-2.5 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-400 transition-all" />
            </div>
          </div>

          <div className="mb-5">
            <label className="block text-[13px] font-medium text-gray-700 mb-1.5">Special Instructions</label>
            <textarea rows={2} placeholder="Instructions for pickup driver..." value={pickupForm.special_instructions}
              onChange={(e) => setPickupForm({...pickupForm, special_instructions: e.target.value})}
              className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-400 transition-all resize-none" />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-5">
            <div>
              <label className="block text-[13px] font-medium text-gray-700 mb-1.5">Scheduled Pickup</label>
              <input type="datetime-local" value={pickupForm.pickup_scheduled_at} onChange={(e) => setPickupForm({...pickupForm, pickup_scheduled_at: e.target.value})}
                className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-400 transition-all" />
            </div>
            <div>
              <label className="block text-[13px] font-medium text-gray-700 mb-1.5">Pickup Driver</label>
              <select value={pickupForm.pickup_driver_id} onChange={(e) => setPickupForm({...pickupForm, pickup_driver_id: e.target.value})}
                className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-400 transition-all">
                <option value="">Select driver</option>
                {drivers.map(d => <option key={d.id} value={d.id}>{d.name} ({d.phone})</option>)}
              </select>
            </div>
          </div>

          <div className="flex gap-2.5">
            <button type="submit" disabled={creating}
              className="px-5 py-2.5 bg-gradient-to-r from-blue-600 to-blue-500 text-white rounded-xl text-sm font-semibold hover:shadow-lg hover:shadow-blue-500/25 transition-all active:scale-[0.97] disabled:opacity-50 disabled:cursor-not-allowed">
              {creating ? 'Saving...' : editingId ? 'Update Pickup' : 'Create Pickup'}
            </button>
            <button type="button" onClick={cancelForm}
              className="px-4 py-2.5 bg-gray-100 text-gray-700 rounded-xl text-sm font-medium hover:bg-gray-200 transition-colors">Cancel</button>
          </div>
        </form>
      )}

      <div className="mb-4">
        <div className="relative max-w-md">
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
            <svg className="h-4 w-4 text-gray-400" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" /></svg>
          </div>
          <input type="text" placeholder="Search by client, sender, tracking number..." value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-400 transition-all placeholder:text-gray-400" />
        </div>
      </div>

      {assignForm.id && (
        <form onSubmit={handleAssign} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
          <div className="flex items-center gap-3 mb-5">
            <div className="w-11 h-11 rounded-xl bg-purple-50 flex items-center justify-center">
              <svg className="w-5 h-5 text-purple-600" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" /></svg>
            </div>
            <div>
              <h3 className="text-lg font-bold text-gray-900">Assign Driver</h3>
              <p className="text-[13px] text-gray-400 mt-0.5">Assign a driver and schedule the pickup</p>
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <select value={assignForm.driver_id} onChange={(e) => setAssignForm({...assignForm, driver_id: e.target.value})} className="px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-400 transition-all" required>
              <option value="">Select driver</option>
              {drivers.map(d => <option key={d.id} value={d.id}>{d.name} ({d.phone})</option>)}
            </select>
            <input type="datetime-local" value={assignForm.scheduled_at} onChange={(e) => setAssignForm({...assignForm, scheduled_at: e.target.value})} className="px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-400 transition-all" />
            <div className="flex gap-2.5">
              <button type="submit" className="px-4 py-2.5 bg-gradient-to-r from-blue-600 to-blue-500 text-white rounded-xl text-sm font-semibold hover:shadow-lg hover:shadow-blue-500/25 transition-all active:scale-[0.97]">Assign</button>
              <button type="button" onClick={() => setAssignForm({ id: null, driver_id: '', scheduled_at: '' })} className="px-4 py-2.5 bg-gray-100 text-gray-700 rounded-xl text-sm font-medium hover:bg-gray-200 transition-colors">Cancel</button>
            </div>
          </div>
        </form>
      )}

      {loading ? (
        <div className="flex items-center gap-3 py-12 justify-center">
          <div className="w-5 h-5 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
          <span className="text-sm text-gray-500">Loading pickups...</span>
        </div>
      ) : pickups.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center">
          <div className="w-14 h-14 rounded-2xl bg-gray-100 flex items-center justify-center mx-auto mb-4">
            <svg className="w-7 h-7 text-gray-400" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" /></svg>
          </div>
          <p className="text-sm font-medium text-gray-900 mb-1">No pickups found</p>
          <p className="text-[13px] text-gray-400 mb-5">Create your first pickup to get started.</p>
          <button onClick={openNewPickup} className="px-4 py-2.5 bg-gradient-to-r from-blue-600 to-blue-500 text-white rounded-xl text-sm font-semibold hover:shadow-lg hover:shadow-blue-500/25 transition-all active:scale-[0.97]">
            + New Pickup
          </button>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100">
                  <th className="text-left px-5 py-3.5 text-[11px] font-semibold text-gray-400 uppercase tracking-wider">Tracking #</th>
                  <th className="text-left px-5 py-3.5 text-[11px] font-semibold text-gray-400 uppercase tracking-wider">Client</th>
                  <th className="text-left px-5 py-3.5 text-[11px] font-semibold text-gray-400 uppercase tracking-wider">Sender</th>
                  <th className="text-left px-5 py-3.5 text-[11px] font-semibold text-gray-400 uppercase tracking-wider">Pickup Address</th>
                  <th className="text-left px-5 py-3.5 text-[11px] font-semibold text-gray-400 uppercase tracking-wider">Parcels</th>
                  <th className="text-left px-5 py-3.5 text-[11px] font-semibold text-gray-400 uppercase tracking-wider">Driver</th>
                  <th className="text-left px-5 py-3.5 text-[11px] font-semibold text-gray-400 uppercase tracking-wider">Scheduled</th>
                  <th className="text-left px-5 py-3.5 text-[11px] font-semibold text-gray-400 uppercase tracking-wider">Status</th>
                  <th className="text-right px-5 py-3.5 text-[11px] font-semibold text-gray-400 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100/60">
                {pickups.map(p => {
                  const isClient = p._type === 'client';
                  return (
                  <tr key={p.id || 'c_' + p.client_id} className="hover:bg-gray-50/60 transition-colors group">
                    <td className="px-5 py-3.5 font-medium text-gray-900">{isClient ? <span className="text-gray-300">—</span> : p.tracking_number}</td>
                    <td className="px-5 py-3.5 text-gray-600 text-[13px]">{p.client_name || <span className="text-gray-400">Walk-in</span>}</td>
                    <td className="px-5 py-3.5 text-gray-600"><span className="font-medium">{p.sender_name}</span><br/><span className="text-[13px] text-gray-400">{p.sender_phone}</span></td>
                    <td className="px-5 py-3.5 text-gray-600 text-[13px] max-w-[180px] truncate">{p.pickup_address || p.sender_address || '-'}</td>
                    <td className="px-5 py-3.5 text-gray-600 text-[13px]">{isClient ? '-' : (p.num_items || '-')}</td>
                    <td className="px-5 py-3.5 text-gray-600 text-[13px]">{isClient ? <span className="text-gray-300">—</span> : (p.driver_name || <span className="text-gray-400">Unassigned</span>)}</td>
                    <td className="px-5 py-3.5 text-[13px] text-gray-500">{isClient ? <span className="text-gray-300">—</span> : (p.pickup_scheduled_at ? new Date(p.pickup_scheduled_at).toLocaleString() : '-')}</td>
                    <td className="px-5 py-3.5">
                      {isClient ? (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-lg text-[11px] font-semibold bg-gray-100 text-gray-500 ring-1 ring-inset ring-gray-500/10">No pickup</span>
                      ) : (
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-lg text-[11px] font-semibold ring-1 ring-inset ${statusColors[p.status] || 'bg-gray-100 text-gray-600 ring-gray-500/10'}`}>
                          {p.status.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase())}
                        </span>
                      )}
                    </td>
                    <td className="px-5 py-3.5 text-right whitespace-nowrap">
                      {isClient ? (
                        <span className="text-[13px] text-gray-400">—</span>
                      ) : (
                        <div className="flex flex-wrap gap-1 justify-end">
                          {p.status === 'pickup_requested' && (
                            <>
                              <button onClick={() => openEditPickup(p)}
                                className="px-2.5 py-1 rounded-lg text-xs font-medium text-blue-600 hover:bg-blue-50 transition-colors">Edit</button>
                              <button onClick={() => setAssignForm({ id: p.id, driver_id: p.pickup_driver_id || '', scheduled_at: p.pickup_scheduled_at || '' })}
                                className="px-2.5 py-1 rounded-lg text-xs font-medium text-purple-600 hover:bg-purple-50 transition-colors">Assign</button>
                              <button onClick={() => handleStatus(p.id, 'picked_up')}
                                className="px-2.5 py-1 rounded-lg text-xs font-medium text-orange-600 hover:bg-orange-50 transition-colors">Pick Up</button>
                              <button onClick={() => handleDelete(p.id, p.tracking_number)}
                                className="px-2.5 py-1 rounded-lg text-xs font-medium text-red-500 hover:bg-red-50 transition-colors">Delete</button>
                            </>
                          )}
                          {p.status === 'picked_up' && (
                            <span className="text-xs text-gray-400 italic px-2.5 py-1">Picked up</span>
                          )}
                        </div>
                      )}
                    </td>
                  </tr>
                );})}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
