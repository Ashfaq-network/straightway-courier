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

      <div className="flex flex-col sm:flex-row gap-3 mb-4">
        <form onSubmit={(e) => { e.preventDefault(); fetchShipments(); }} className="flex-1 flex gap-2">
          <input type="text" placeholder="Search by tracking #, name, phone..." value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="flex-1 px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500 text-sm" />
          <select value={statusFilter} onChange={(e) => { setStatusFilter(e.target.value); setTimeout(fetchShipments, 0); }}
            className="px-4 py-2.5 border border-gray-200 rounded-lg text-sm">
            <option value="">All Statuses</option>
            {['pickup_requested','picked_up','at_sorting_center','sorted','out_for_delivery','customer_contacted','delivered','failed_delivery','returned_to_sender','rescheduled'].map(st => (
              <option key={st} value={st}>{st.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase())}</option>
            ))}
          </select>
          <button type="submit" className="px-4 py-2.5 bg-brand-500 text-white rounded-lg hover:bg-brand-600 text-sm">Search</button>
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
                  <td className="px-4 py-3 text-gray-600 text-xs">{s.origin} → {s.destination}</td>
                  <td className="px-4 py-3">
                    <span className={`inline-block px-2 py-0.5 rounded text-xs font-semibold ${statusColors[s.status] || 'bg-gray-100'}`}>
                      {s.status.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase())}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-center text-xs">{s.delivery_charge ? `LKR ${s.delivery_charge}` : '-'}</td>
                  <td className="px-4 py-3 text-right whitespace-nowrap">
                    <button onClick={() => { setEditing(s); setShowForm(true); }} className="text-blue-500 hover:underline text-xs mr-2">Edit</button>
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
