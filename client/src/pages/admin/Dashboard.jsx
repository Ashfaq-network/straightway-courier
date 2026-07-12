import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import ShipmentForm from './ShipmentForm';
import Clients from './Clients';
import Pickups from './Pickups';
import Sorting from './Sorting';
import Deliveries from './Deliveries';
import COD from './COD';
import Reports from './Reports';

const API = '/api/admin';

export default function AdminDashboard() {
  const [tab, setTab] = useState('dashboard');
  const [stats, setStats] = useState(null);
  const [shipments, setShipments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [trackData, setTrackData] = useState(null);
  const [trackLoading, setTrackLoading] = useState(false);
  const navigate = useNavigate();

  const getToken = () => sessionStorage.getItem('swc_token');

  useEffect(() => {
    if (tab === 'dashboard') { fetchStats(); fetchShipments(); }
  }, [tab]);

  const fetchStats = async () => {
    try {
      const res = await fetch(`${API}/stats`, { headers: { 'Authorization': `Bearer ${getToken()}` } });
      if (res.ok) setStats(await res.json());
      else if (res.status === 401) { sessionStorage.removeItem('swc_token'); navigate('/admin'); }
    } catch (err) { console.error(err); }
  };

  const fetchShipments = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (search) params.append('search', search);
      if (statusFilter) params.append('status', statusFilter);
      if (dateFrom) params.append('startDate', dateFrom);
      if (dateTo) params.append('endDate', dateTo);
      const res = await fetch(`${API}/shipments?${params}`, { headers: { 'Authorization': `Bearer ${getToken()}` } });
      if (res.ok) setShipments(await res.json());
      else if (res.status === 401) { sessionStorage.removeItem('swc_token'); navigate('/admin'); }
    } catch (err) { console.error(err); } finally { setLoading(false); }
  };

  const handleStatusUpdate = async (id, status) => {
    await fetch(`${API}/shipments/${id}/status`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${getToken()}` },
      body: JSON.stringify({ status })
    });
    fetchShipments();
    fetchStats();
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this shipment?')) return;
    await fetch(`${API}/shipments/${id}`, { method: 'DELETE', headers: { 'Authorization': `Bearer ${getToken()}` } });
    fetchShipments();
    fetchStats();
  };

  const viewTracking = async (id) => {
    setTrackLoading(true);
    setTrackData(null);
    try {
      const res = await fetch(`${API}/shipments/${id}/events`, { headers: { 'Authorization': `Bearer ${getToken()}` } });
      if (res.ok) {
        const s = await fetch(`${API}/shipments/${id}`, { headers: { 'Authorization': `Bearer ${getToken()}` } });
        setTrackData({ shipment: await s.json(), ...await res.json() });
      }
    } catch (err) { console.error(err); } finally { setTrackLoading(false); }
  };

  const handleLogout = () => {
    sessionStorage.removeItem('swc_token');
    navigate('/admin');
  };

  const tabs = [
    { id: 'dashboard', label: 'Dashboard' },
    { id: 'clients', label: 'Clients' },
    { id: 'pickups', label: 'Pickups' },
    { id: 'sorting', label: 'Sorting' },
    { id: 'deliveries', label: 'Deliveries' },
    { id: 'cod', label: 'COD' },
    { id: 'reports', label: 'Reports' },
  ];

  const statusColors = {
    pickup_requested: 'bg-yellow-100 text-yellow-800',
    picked_up: 'bg-orange-100 text-orange-800',
    at_sorting_center: 'bg-purple-100 text-purple-800',
    sorted: 'bg-indigo-100 text-indigo-800',
    out_for_delivery: 'bg-blue-100 text-blue-800',
    customer_contacted: 'bg-teal-100 text-teal-800',
    delivered: 'bg-green-100 text-green-800',
    failed_delivery: 'bg-red-100 text-red-800',
    returned_to_sender: 'bg-gray-200 text-gray-800',
    rescheduled: 'bg-cyan-100 text-cyan-800',
  };

  if (tab === 'clients') return <Clients onBack={() => setTab('dashboard')} />;
  if (tab === 'pickups') return <Pickups onBack={() => setTab('dashboard')} />;
  if (tab === 'sorting') return <Sorting onBack={() => setTab('dashboard')} />;
  if (tab === 'deliveries') return <Deliveries onBack={() => setTab('dashboard')} />;
  if (tab === 'cod') return <COD onBack={() => setTab('dashboard')} />;
  if (tab === 'reports') return <Reports onBack={() => setTab('dashboard')} />;

  if (showForm) {
    return <ShipmentForm shipment={editing} onDone={() => { setShowForm(false); setEditing(null); fetchShipments(); fetchStats(); }}
      onCancel={() => { setShowForm(false); setEditing(null); }} />;
  }

  const statCards = stats ? [
    { label: 'Total Orders', value: stats.total, color: 'bg-blue-50 text-blue-600' },
    { label: "Today's Orders", value: stats.today, color: 'bg-amber-50 text-amber-600' },
    { label: 'Delivered', value: stats.delivered, color: 'bg-emerald-50 text-emerald-600' },
    { label: 'Pickup Requested', value: stats.pickupRequested, color: 'bg-yellow-50 text-yellow-600' },
    { label: 'At Sorting', value: stats.atSorting, color: 'bg-purple-50 text-purple-600' },
    { label: 'Out for Delivery', value: stats.outForDelivery, color: 'bg-indigo-50 text-indigo-600' },
    { label: 'Failed', value: stats.failed, color: 'bg-red-50 text-red-600' },
    { label: 'Clients', value: stats.totalClients, color: 'bg-teal-50 text-teal-600' },
    { label: 'Active Riders', value: stats.activeRiders, color: 'bg-pink-50 text-pink-600' },
    { label: "Today's Pickups", value: stats.todayPickups, color: 'bg-orange-50 text-orange-600' },
    { label: "Today's Deliveries", value: stats.todayDeliveries, color: 'bg-green-50 text-green-600' },
    { label: 'Total COD', value: `LKR ${stats.totalCod.toLocaleString()}`, color: 'bg-cyan-50 text-cyan-600' },
  ] : [];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-8">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
        <div className="flex flex-wrap gap-2">
          <button onClick={() => setShowForm(true)} className="px-4 py-2 bg-brand-500 text-white font-semibold rounded-lg hover:bg-brand-600 text-sm">+ New Shipment</button>
          <button onClick={handleLogout} className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 text-sm">Logout</button>
        </div>
      </div>

      <div className="flex flex-wrap gap-1 mb-6 border-b border-gray-200">
        {tabs.map(t => (
          <button key={t.id} onClick={() => setTab(t.id)}
            className={`px-4 py-2.5 text-sm font-medium rounded-t-lg transition-colors ${tab === t.id ? 'bg-brand-500 text-white' : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'}`}>
            {t.label}
          </button>
        ))}
      </div>

      {stats && (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-3 mb-6">
          {statCards.map((card, i) => (
            <div key={i} className={`${card.color} rounded-xl p-3 border border-gray-100 shadow-sm`}>
              <p className="text-xs font-medium opacity-75">{card.label}</p>
              <p className="text-lg font-bold mt-1">{card.value}</p>
            </div>
          ))}
        </div>
      )}

      <div className="flex flex-col gap-3 mb-4">
        <form onSubmit={(e) => { e.preventDefault(); fetchShipments(); }} className="flex flex-wrap gap-2">
          <input type="text" placeholder="Search tracking #, name, phone..." value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="flex-1 min-w-[200px] px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500 text-sm" />
          <select value={statusFilter} onChange={(e) => { setStatusFilter(e.target.value); setTimeout(fetchShipments, 0); }}
            className="px-4 py-2.5 border border-gray-200 rounded-lg text-sm">
            <option value="">All Statuses</option>
            {['pickup_requested','picked_up','at_sorting_center','sorted','out_for_delivery','customer_contacted','delivered','failed_delivery','returned_to_sender','rescheduled'].map(st => (
              <option key={st} value={st}>{st.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase())}</option>
            ))}
          </select>
          <input type="date" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)}
            className="px-3 py-2.5 border border-gray-200 rounded-lg text-sm" title="From date" />
          <input type="date" value={dateTo} onChange={(e) => setDateTo(e.target.value)}
            className="px-3 py-2.5 border border-gray-200 rounded-lg text-sm" title="To date" />
          <button type="submit" className="px-4 py-2.5 bg-brand-500 text-white rounded-lg hover:bg-brand-600 text-sm">Filter</button>
          <button type="button" onClick={() => { setSearch(''); setStatusFilter(''); setDateFrom(''); setDateTo(''); fetchShipments(); }}
            className="px-4 py-2.5 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 text-sm">Clear</button>
        </form>
      </div>

      {loading ? <p className="text-gray-500">Loading...</p> : shipments.length === 0 ? (
        <div className="text-center py-16 bg-gray-50 rounded-xl">
          <p className="text-gray-500 mb-4">No shipments found.</p>
          <button onClick={() => setShowForm(true)} className="px-4 py-2 bg-brand-500 text-white rounded-lg text-sm">Create First Shipment</button>
        </div>
      ) : (
        <div className="overflow-x-auto bg-white rounded-xl shadow border border-gray-100">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-gray-600">
              <tr>
                <th className="text-left px-4 py-3 font-medium">Tracking #</th>
                <th className="text-left px-4 py-3 font-medium">Sender</th>
                <th className="text-left px-4 py-3 font-medium">Receiver</th>
                <th className="text-left px-4 py-3 font-medium">Client</th>
                <th className="text-left px-4 py-3 font-medium">Route</th>
                <th className="text-left px-4 py-3 font-medium">Status</th>
                <th className="text-center px-4 py-3 font-medium">Charge</th>
                <th className="text-right px-4 py-3 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {shipments.map(s => (
                <tr key={s.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 font-medium text-gray-900">{s.tracking_number}</td>
                  <td className="px-4 py-3 text-gray-600 text-xs">{s.sender_name}<br/>{s.sender_phone}</td>
                  <td className="px-4 py-3 text-gray-600 text-xs">{s.receiver_name}<br/>{s.receiver_phone}</td>
                  <td className="px-4 py-3 text-xs text-gray-500">{s.client_name || '-'}</td>
                  <td className="px-4 py-3 text-gray-600 text-xs">{s.origin} → {s.destination}</td>
                  <td className="px-4 py-3">
                    <span className={`inline-block px-2 py-0.5 rounded text-xs font-semibold ${statusColors[s.status] || 'bg-gray-100'}`}>
                      {s.status.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase())}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-center text-xs">{s.delivery_charge ? `LKR ${s.delivery_charge}` : '-'}</td>
                  <td className="px-4 py-3 text-right whitespace-nowrap">
                    <button onClick={() => viewTracking(s.id)} className="text-teal-500 hover:underline text-xs mr-2">Track</button>
                    <button onClick={() => { setEditing(s); setShowForm(true); }} className="text-blue-500 hover:underline text-xs mr-2">Edit</button>
                    <button onClick={() => handleDelete(s.id)} className="text-red-500 hover:underline text-xs">Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Tracking Modal */}
      {trackData && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 px-4" onClick={() => setTrackData(null)}>
          <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full max-h-[80vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            <div className="sticky top-0 bg-white border-b border-gray-100 px-6 py-4 flex items-center justify-between rounded-t-2xl">
              <div>
                <h3 className="font-bold text-gray-900">{trackData.shipment.tracking_number}</h3>
                <p className="text-xs text-gray-500">{trackData.shipment.receiver_name} → {trackData.shipment.destination}</p>
              </div>
              <button onClick={() => setTrackData(null)} className="p-1 text-gray-400 hover:text-gray-600">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>
            <div className="p-6">
              {trackLoading ? (
                <p className="text-center text-gray-500 py-8">Loading...</p>
              ) : (
                <div className="relative">
                  <div className="absolute left-[17px] top-3 bottom-3 w-0.5 bg-gradient-to-b from-brand-500 to-gray-200 rounded-full" />
                  {(trackData.events || []).map((event, i) => {
                    const cfg = {
                      pickup_requested: { color: 'bg-yellow-500', ring: 'ring-yellow-200', label: 'Pickup Requested' },
                      picked_up: { color: 'bg-amber-500', ring: 'ring-amber-200', label: 'Picked Up' },
                      at_sorting_center: { color: 'bg-violet-500', ring: 'ring-violet-200', label: 'At Sorting Center' },
                      sorted: { color: 'bg-indigo-500', ring: 'ring-indigo-200', label: 'Sorted' },
                      out_for_delivery: { color: 'bg-blue-500', ring: 'ring-blue-200', label: 'Out for Delivery' },
                      customer_contacted: { color: 'bg-teal-500', ring: 'ring-teal-200', label: 'Customer Contacted' },
                      delivered: { color: 'bg-emerald-500', ring: 'ring-emerald-200', label: 'Delivered' },
                      failed_delivery: { color: 'bg-red-500', ring: 'ring-red-200', label: 'Failed Delivery' },
                      returned_to_sender: { color: 'bg-red-600', ring: 'ring-red-300', label: 'Returned to Sender' },
                      rescheduled: { color: 'bg-cyan-500', ring: 'ring-cyan-200', label: 'Rescheduled' },
                    }[event.event_type] || { color: 'bg-gray-400', ring: 'ring-gray-200', label: event.status || event.event_type };
                    return (
                      <div key={event.id} className="flex gap-4 pb-6 relative">
                        <div className="flex flex-col items-center flex-shrink-0">
                          <div className={`w-[34px] h-[34px] rounded-full ${cfg.color} ring-4 ${cfg.ring} flex items-center justify-center text-xs z-10 shadow-sm`}>
                            <span className="text-white text-xs font-bold">{i + 1}</span>
                          </div>
                        </div>
                        <div className="flex-1 pt-1">
                          <p className="font-semibold text-sm text-gray-900">{cfg.label}</p>
                          {event.description && <p className="text-sm text-gray-500">{event.description}</p>}
                          {event.staff_name && <p className="text-xs text-gray-400">By: {event.staff_name}</p>}
                          {event.location && <p className="text-xs text-gray-400">Location: {event.location}</p>}
                          <p className="text-xs text-gray-400 mt-1">{new Date(event.timestamp).toLocaleString()}</p>
                        </div>
                      </div>
                    );
                  })}
                  {trackData.delivery_attempts?.length > 0 && (
                    <div className="mt-4 pt-4 border-t border-gray-100">
                      <p className="text-xs font-semibold text-gray-500 mb-2 uppercase tracking-wider">Delivery Attempts</p>
                      {trackData.delivery_attempts.map(a => (
                        <div key={a.id} className="text-xs text-gray-500 mb-1">Attempt #{a.attempt_number}: {a.reason}{a.custom_note ? ` — ${a.custom_note}` : ''} ({new Date(a.timestamp).toLocaleString()})</div>
                      ))}
                    </div>
                  )}
                  {(!trackData.events || trackData.events.length === 0) && (
                    <p className="text-center text-gray-500 py-8">No tracking events yet.</p>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
