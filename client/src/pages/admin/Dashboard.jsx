import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import ShipmentForm from './ShipmentForm';
import StaffManagement from './StaffManagement';

const API = '/api/admin';

export default function AdminDashboard() {
  const [shipments, setShipments] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);
  const [viewEvents, setViewEvents] = useState(null);
  const [events, setEvents] = useState([]);
  const [deliveryAttempts, setDeliveryAttempts] = useState([]);
  const [showStaff, setShowStaff] = useState(false);
  const [showActivity, setShowActivity] = useState(false);
  const [activityLogs, setActivityLogs] = useState([]);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [newEvent, setNewEvent] = useState({ status: '', location: '', description: '', staff_name: '' });
  const [attemptForm, setAttemptForm] = useState({ reason: '', custom_note: '', attempted_by: '' });
  const [activeTab, setActiveTab] = useState('shipments');
  const printRef = useRef();
  const navigate = useNavigate();

  useEffect(() => {
    fetchShipments();
    fetchStats();
  }, []);

  const getToken = () => sessionStorage.getItem('swc_token');

  const fetchStats = async () => {
    try {
      const res = await fetch(`${API}/stats`, {
        headers: { 'Authorization': `Bearer ${getToken()}` }
      });
      if (res.ok) setStats(await res.json());
    } catch (err) { console.error(err); }
  };

  const fetchShipments = async () => {
    try {
      const params = new URLSearchParams();
      if (search) params.append('search', search);
      if (statusFilter) params.append('status', statusFilter);
      const res = await fetch(`${API}/shipments?${params}`, {
        headers: { 'Authorization': `Bearer ${getToken()}` }
      });
      if (res.status === 401 || res.status === 403) {
        sessionStorage.removeItem('swc_token');
        navigate('/admin');
        return;
      }
      const data = await res.json();
      setShipments(data);
    } catch (err) { console.error(err); } finally { setLoading(false); }
  };

  const fetchActivityLogs = async () => {
    try {
      const res = await fetch(`${API}/activity-logs`, {
        headers: { 'Authorization': `Bearer ${getToken()}` }
      });
      if (res.ok) setActivityLogs(await res.json());
    } catch (err) { console.error(err); }
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this shipment?')) return;
    await fetch(`${API}/shipments/${id}`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${getToken()}` }
    });
    fetchShipments();
    fetchStats();
  };

  const handleEdit = (shipment) => {
    setEditing(shipment);
    setShowForm(true);
  };

  const handleSendEmail = async (shipment) => {
    if (!shipment.receiver_email) {
      alert('No receiver email on file for this shipment.');
      return;
    }
    try {
      const res = await fetch(`${API}/shipments/${shipment.id}/resend-email`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${getToken()}` }
      });
      if (!res.ok) { const data = await res.json(); throw new Error(data.error || 'Failed to send'); }
      alert('Email sent successfully!');
    } catch (err) { alert(err.message); }
  };

  const handlePrint = (shipment) => {
    const printWindow = window.open('', '_blank');
    printWindow.document.write(`
      <html><head><title>Shipment ${shipment.tracking_number}</title>
      <style>body{font-family:Arial;padding:40px;max-width:800px;margin:0 auto}h1{color:#1e3a5f}h2{color:#333;border-bottom:1px solid #ddd;padding-bottom:5px}.grid{display:grid;grid-template-columns:1fr 1fr;gap:20px}.field{margin-bottom:10px}label{font-weight:bold;color:#666;font-size:12px;display:block}@media print{button{display:none}}</style></head>
      <body>
        <h1>Straightway Couriers</h1>
        <p><strong>Tracking:</strong> ${shipment.tracking_number} | <strong>Status:</strong> ${shipment.status}</p>
        <hr/>
        <h2>Sender</h2>
        <p>${shipment.sender_name}<br/>${shipment.sender_phone || ''}${shipment.sender_address ? '<br/>' + shipment.sender_address : ''}</p>
        <h2>Receiver</h2>
        <p>${shipment.receiver_name}<br/>${shipment.receiver_phone || ''}${shipment.receiver_address ? '<br/>' + shipment.receiver_address : ''}</p>
        <h2>Parcel Details</h2>
        <div class="grid">
          <div class="field"><label>Origin</label><p>${shipment.origin}</p></div>
          <div class="field"><label>Destination</label><p>${shipment.destination}</p></div>
          ${shipment.parcel_type ? `<div class="field"><label>Type</label><p>${shipment.parcel_type}</p></div>` : ''}
          ${shipment.weight ? `<div class="field"><label>Weight</label><p>${shipment.weight}</p></div>` : ''}
          ${shipment.num_items ? `<div class="field"><label>Items</label><p>${shipment.num_items}</p></div>` : ''}
          ${shipment.delivery_charge ? `<div class="field"><label>Charge</label><p>LKR ${shipment.delivery_charge}</p></div>` : ''}
          ${shipment.cod_amount ? `<div class="field"><label>COD</label><p>LKR ${shipment.cod_amount}</p></div>` : ''}
        </div>
        <button onclick="window.print()">Print</button>
      </body></html>
    `);
    printWindow.document.close();
  };

  const handleExport = () => {
    const headers = ['Tracking #','Sender','Sender Phone','Receiver','Receiver Phone','Origin','Destination','Weight','Status','Created'];
    const rows = shipments.map(s => [
      s.tracking_number, s.sender_name, s.sender_phone, s.receiver_name, s.receiver_phone,
      s.origin, s.destination, s.weight, s.status,
      new Date(s.created_at).toLocaleDateString()
    ]);
    const csv = [headers.join(','), ...rows.map(r => r.map(c => `"${c||''}"`).join(','))].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = `shipments_${new Date().toISOString().slice(0,10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleFormDone = () => {
    setShowForm(false);
    setEditing(null);
    fetchShipments();
    fetchStats();
  };

  const handleViewEvents = async (shipment) => {
    setViewEvents(shipment);
    setNewEvent({ status: '', location: '', description: '', staff_name: '' });
    setAttemptForm({ reason: '', custom_note: '', attempted_by: '' });
    fetchEvents(shipment);
  };

  const fetchEvents = async (shipment) => {
    try {
      const res = await fetch(`${API}/shipments/${shipment.id}/events`, {
        headers: { 'Authorization': `Bearer ${getToken()}` }
      });
      if (res.ok) {
        const data = await res.json();
        setEvents(data.events || []);
        setDeliveryAttempts(data.delivery_attempts || []);
      }
    } catch (err) { console.error(err); setEvents([]); setDeliveryAttempts([]); }
  };

  const handleAddEvent = async (e) => {
    e.preventDefault();
    if (!newEvent.status) return;
    await fetch(`${API}/shipments/${viewEvents.id}/status`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${getToken()}` },
      body: JSON.stringify(newEvent)
    });
    setNewEvent({ status: '', location: '', description: '', staff_name: '' });
    fetchEvents(viewEvents);
    fetchShipments();
  };

  const handleDeliveryAttempt = async (e) => {
    e.preventDefault();
    if (!attemptForm.reason) return;
    await fetch(`${API}/shipments/${viewEvents.id}/delivery-attempt`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${getToken()}` },
      body: JSON.stringify(attemptForm)
    });
    setAttemptForm({ reason: '', custom_note: '', attempted_by: '' });
    fetchEvents(viewEvents);
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchShipments();
  };

  const handleLogout = () => {
    sessionStorage.removeItem('swc_token');
    navigate('/admin');
  };

  const statCards = stats ? [
    { label: 'Total Orders', value: stats.total, color: 'bg-blue-50 text-blue-600' },
    { label: "Today's Orders", value: stats.today, color: 'bg-amber-50 text-amber-600' },
    { label: 'Delivered', value: stats.delivered, color: 'bg-emerald-50 text-emerald-600' },
    { label: 'Pending', value: stats.pending, color: 'bg-yellow-50 text-yellow-600' },
    { label: 'In Warehouse', value: stats.inWarehouse, color: 'bg-purple-50 text-purple-600' },
    { label: 'Out for Delivery', value: stats.outForDelivery, color: 'bg-indigo-50 text-indigo-600' },
    { label: 'Failed', value: stats.failed, color: 'bg-red-50 text-red-600' },
    { label: 'Returned', value: stats.returned, color: 'bg-gray-50 text-gray-600' },
  ] : [];

  const statusColors = {
    pending: 'bg-yellow-100 text-yellow-800',
    picked_up: 'bg-orange-100 text-orange-800',
    at_warehouse: 'bg-purple-100 text-purple-800',
    sorted: 'bg-indigo-100 text-indigo-800',
    out_for_delivery: 'bg-blue-100 text-blue-800',
    customer_contacted: 'bg-teal-100 text-teal-800',
    delivered: 'bg-green-100 text-green-800',
    returned: 'bg-red-100 text-red-800',
    rescheduled: 'bg-cyan-100 text-cyan-800',
    failed: 'bg-gray-200 text-gray-800',
  };

  if (showStaff) return <StaffManagement onBack={() => setShowStaff(false)} />;
  if (showActivity) {
    if (activityLogs.length === 0) {
      fetchActivityLogs();
    }
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-8">
        <button onClick={() => setShowActivity(false)} className="text-brand-500 hover:underline text-sm mb-4 inline-block">&larr; Back</button>
        <h2 className="text-xl font-bold text-gray-900 mb-4">Activity Log</h2>
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
          {activityLogs.length === 0 ? (
            <p className="p-4 text-gray-500">Loading...</p>
          ) : (
            <table className="w-full text-sm">
              <thead className="bg-gray-50 text-gray-600">
                <tr>
                  <th className="text-left px-4 py-3 font-medium">Action</th>
                  <th className="text-left px-4 py-3 font-medium">Details</th>
                  <th className="text-right px-4 py-3 font-medium">Time</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {activityLogs.map(log => (
                  <tr key={log.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 font-medium text-gray-900">{log.action}</td>
                    <td className="px-4 py-3 text-gray-600">{log.details}</td>
                    <td className="px-4 py-3 text-right text-gray-400 text-xs">{new Date(log.timestamp).toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    );
  }

  if (showForm) {
    return <ShipmentForm shipment={editing} onDone={handleFormDone} onCancel={() => { setShowForm(false); setEditing(null); }} />;
  }

  if (viewEvents) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-8">
        <button onClick={() => setViewEvents(null)} className="text-brand-500 hover:underline text-sm mb-4 inline-block">&larr; Back to Dashboard</button>
        <h2 className="text-xl font-bold text-gray-900 mb-1">{viewEvents.tracking_number}</h2>
        <p className="text-gray-500 text-sm mb-2">{viewEvents.receiver_name} &mdash; {viewEvents.destination}</p>
        <span className={`inline-block px-2 py-0.5 rounded text-xs font-semibold mb-6 ${statusColors[viewEvents.status] || 'bg-gray-100 text-gray-800'}`}>
          {viewEvents.status.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase())}
        </span>

        {/* Quick Status Buttons */}
        <div className="bg-gray-50 rounded-xl p-4 mb-6">
          <h3 className="font-semibold text-gray-900 text-sm mb-3">Quick Status Update</h3>
          <div className="flex flex-wrap gap-2">
            {['picked_up','at_warehouse','sorted','out_for_delivery','customer_contacted','delivered','returned','rescheduled'].map(st => (
              <button key={st} onClick={async () => {
                await fetch(`${API}/shipments/${viewEvents.id}/status`, {
                  method: 'PUT',
                  headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${getToken()}` },
                  body: JSON.stringify({ status: st, description: '', location: '', staff_name: '' })
                });
                fetchEvents(viewEvents);
                fetchShipments();
              }} className="px-3 py-1.5 bg-white border border-gray-200 rounded-lg text-xs font-medium text-gray-700 hover:bg-brand-50 hover:border-brand-200 transition-colors">
                {st.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')}
              </button>
            ))}
          </div>
        </div>

        {/* Add Event Form */}
        <form onSubmit={handleAddEvent} className="bg-white border border-gray-200 rounded-xl p-6 mb-6">
          <h3 className="font-semibold text-gray-900 mb-4">Add Tracking Event</h3>
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 mb-3">
            <select value={newEvent.status} onChange={(e) => setNewEvent({...newEvent, status: e.target.value})}
              className="px-3 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500 text-sm" required>
              <option value="">Select status</option>
              {['picked_up','at_warehouse','sorted','out_for_delivery','customer_contacted','delivered','returned','rescheduled','failed'].map(st => (
                <option key={st} value={st}>{st.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')}</option>
              ))}
            </select>
            <input type="text" placeholder="Location" value={newEvent.location} onChange={(e) => setNewEvent({...newEvent, location: e.target.value})}
              className="px-3 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500 text-sm" />
            <input type="text" placeholder="Description" value={newEvent.description} onChange={(e) => setNewEvent({...newEvent, description: e.target.value})}
              className="px-3 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500 text-sm" />
            <input type="text" placeholder="Staff Name" value={newEvent.staff_name} onChange={(e) => setNewEvent({...newEvent, staff_name: e.target.value})}
              className="px-3 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500 text-sm" />
          </div>
          <button type="submit" className="px-4 py-2 bg-brand-500 text-white font-semibold rounded-lg hover:bg-brand-600 text-sm transition-colors">
            Add Event
          </button>
        </form>

        {/* Delivery Attempt Form */}
        <form onSubmit={handleDeliveryAttempt} className="bg-amber-50 border border-amber-200 rounded-xl p-6 mb-6">
          <h3 className="font-semibold text-gray-900 mb-1">Log Failed Delivery Attempt</h3>
          <p className="text-xs text-gray-500 mb-4">Record why delivery was unsuccessful</p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-3">
            <select value={attemptForm.reason} onChange={(e) => setAttemptForm({...attemptForm, reason: e.target.value})}
              className="px-3 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 text-sm" required>
              <option value="">Select reason</option>
              <option value="Customer unavailable">Customer unavailable</option>
              <option value="Requested delivery on another day">Requested delivery on another day</option>
              <option value="Incorrect address">Incorrect address</option>
              <option value="Phone unreachable">Phone unreachable</option>
              <option value="Customer requested later delivery">Customer requested later delivery</option>
              <option value="Other">Other</option>
            </select>
            <input type="text" placeholder="Custom note" value={attemptForm.custom_note} onChange={(e) => setAttemptForm({...attemptForm, custom_note: e.target.value})}
              className="px-3 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 text-sm" />
            <input type="text" placeholder="Attempted by" value={attemptForm.attempted_by} onChange={(e) => setAttemptForm({...attemptForm, attempted_by: e.target.value})}
              className="px-3 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 text-sm" />
          </div>
          <button type="submit" className="px-4 py-2 bg-amber-500 text-white font-semibold rounded-lg hover:bg-amber-600 text-sm transition-colors">
            Log Attempt
          </button>
        </form>

        {/* Events Timeline */}
        <h3 className="font-semibold text-gray-900 mb-3">Tracking History</h3>
        <div className="space-y-3 mb-8">
          {events.length === 0 && <p className="text-gray-500 text-sm">No events yet.</p>}
          {events.map((event) => (
            <div key={event.id} className="flex items-start gap-3 border-l-2 border-gray-200 pl-4 py-2">
              <div>
                <span className={`inline-block px-2 py-0.5 rounded text-xs font-semibold ${statusColors[event.event_type] || 'bg-gray-100 text-gray-800'}`}>
                  {event.status || event.event_type}
                </span>
                {event.location && <span className="text-sm text-gray-500 ml-2">{event.location}</span>}
                <p className="text-sm text-gray-600 mt-1">{event.description || ''}</p>
                {event.staff_name && <p className="text-xs text-gray-400 mt-0.5">By: {event.staff_name}</p>}
                <p className="text-xs text-gray-400 mt-0.5">{new Date(event.timestamp).toLocaleString()}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Delivery Attempts */}
        {deliveryAttempts.length > 0 && (
          <>
            <h3 className="font-semibold text-gray-900 mb-3">Delivery Attempts</h3>
            <div className="space-y-3">
              {deliveryAttempts.map((attempt) => (
                <div key={attempt.id} className="bg-red-50 border border-red-100 rounded-lg p-4">
                  <p className="font-semibold text-sm text-red-800">Delivery Attempt {attempt.attempt_number}</p>
                  <p className="text-sm text-red-600">Status: {attempt.reason}</p>
                  {attempt.custom_note && <p className="text-sm text-red-500">{attempt.custom_note}</p>}
                  {attempt.attempted_by && <p className="text-xs text-red-400 mt-1">By: {attempt.attempted_by}</p>}
                  <p className="text-xs text-red-300 mt-0.5">{new Date(attempt.timestamp).toLocaleString()}</p>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
        <div className="flex flex-wrap gap-2">
          <button onClick={() => { setShowStaff(true); }} className="px-4 py-2 bg-purple-500 text-white font-semibold rounded-lg hover:bg-purple-600 text-sm transition-colors">
            Staff
          </button>
          <button onClick={() => { setShowActivity(true); fetchActivityLogs(); }} className="px-4 py-2 bg-gray-500 text-white font-semibold rounded-lg hover:bg-gray-600 text-sm transition-colors">
            Activity Log
          </button>
          <button onClick={handleExport} className="px-4 py-2 bg-emerald-500 text-white font-semibold rounded-lg hover:bg-emerald-600 text-sm transition-colors">
            Export CSV
          </button>
          <button onClick={() => setShowForm(true)} className="px-4 py-2 bg-brand-500 text-white font-semibold rounded-lg hover:bg-brand-600 text-sm transition-colors">
            + New Shipment
          </button>
          <button onClick={handleLogout} className="px-4 py-2 bg-gray-200 text-gray-700 font-semibold rounded-lg hover:bg-gray-300 text-sm transition-colors">
            Logout
          </button>
        </div>
      </div>

      {/* Stats */}
      {stats && (
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3 mb-6">
          {statCards.map((card, i) => (
            <div key={i} className={`${card.color} rounded-xl p-3 border border-gray-100 shadow-sm`}>
              <p className="text-xs font-medium opacity-75">{card.label}</p>
              <p className="text-xl font-bold mt-1">{card.value}</p>
            </div>
          ))}
        </div>
      )}

      {/* Search & Filter */}
      <form onSubmit={handleSearchSubmit} className="flex flex-col sm:flex-row gap-3 mb-4">
        <input type="text" placeholder="Search by tracking #, name, or phone..." value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="flex-1 px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500 text-sm" />
        <select value={statusFilter} onChange={(e) => { setStatusFilter(e.target.value); setTimeout(fetchShipments, 0); }}
          className="px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500 text-sm">
          <option value="">All Statuses</option>
          {['pending','picked_up','at_warehouse','sorted','out_for_delivery','customer_contacted','delivered','returned','rescheduled','failed'].map(st => (
            <option key={st} value={st}>{st.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase())}</option>
          ))}
        </select>
        <button type="submit" className="px-4 py-2.5 bg-brand-500 text-white font-semibold rounded-lg hover:bg-brand-600 text-sm transition-colors">
          Search
        </button>
      </form>

      {/* Shipments Table */}
      {loading ? (
        <p className="text-gray-500">Loading...</p>
      ) : shipments.length === 0 ? (
        <div className="text-center py-16 bg-gray-50 rounded-xl">
          <p className="text-gray-500 mb-4">No shipments found.</p>
          <button onClick={() => setShowForm(true)} className="px-4 py-2 bg-brand-500 text-white font-semibold rounded-lg hover:bg-brand-600 text-sm">
            Create First Shipment
          </button>
        </div>
      ) : (
        <div className="overflow-x-auto bg-white rounded-xl shadow border border-gray-100" ref={printRef}>
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-gray-600">
              <tr>
                <th className="text-left px-4 py-3 font-medium">Tracking #</th>
                <th className="text-left px-4 py-3 font-medium">Sender</th>
                <th className="text-left px-4 py-3 font-medium">Receiver</th>
                <th className="text-left px-4 py-3 font-medium">Origin</th>
                <th className="text-left px-4 py-3 font-medium">Destination</th>
                <th className="text-left px-4 py-3 font-medium">Status</th>
                <th className="text-center px-4 py-3 font-medium">Charge</th>
                <th className="text-right px-4 py-3 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {shipments.map((s) => (
                <tr key={s.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 font-medium text-gray-900">{s.tracking_number}</td>
                  <td className="px-4 py-3 text-gray-600">
                    {s.sender_name}
                    {s.assigned_pickup_staff_name && <span className="block text-xs text-purple-500">Pickup: {s.assigned_pickup_staff_name}</span>}
                  </td>
                  <td className="px-4 py-3 text-gray-600">
                    {s.receiver_name}
                    {s.assigned_delivery_staff_name && <span className="block text-xs text-blue-500">Delivery: {s.assigned_delivery_staff_name}</span>}
                  </td>
                  <td className="px-4 py-3 text-gray-600">{s.origin}</td>
                  <td className="px-4 py-3 text-gray-600">{s.destination}</td>
                  <td className="px-4 py-3">
                    <span className={`inline-block px-2 py-0.5 rounded text-xs font-semibold ${statusColors[s.status] || 'bg-gray-100 text-gray-800'}`}>
                      {s.status.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase())}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-center text-gray-600 text-xs">
                    {s.delivery_charge ? `LKR ${s.delivery_charge}` : '-'}
                  </td>
                  <td className="px-4 py-3 text-right whitespace-nowrap">
                    <button onClick={() => handleViewEvents(s)} className="text-brand-500 hover:underline text-xs mr-2">Events</button>
                    <button onClick={() => handleEdit(s)} className="text-blue-500 hover:underline text-xs mr-2">Edit</button>
                    <button onClick={() => handlePrint(s)} className="text-gray-500 hover:underline text-xs mr-2">Print</button>
                    <button onClick={() => handleSendEmail(s)} className="text-emerald-500 hover:underline text-xs mr-2">Email</button>
                    <button onClick={() => handleDelete(s.id)} className="text-red-500 hover:underline text-xs">Delete</button>
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
