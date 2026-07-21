import { useState, useEffect } from 'react';

const API = '/api/admin';

const statusColors = {
  pickup_requested: 'bg-yellow-100 text-yellow-800',
  picked_up: 'bg-orange-100 text-orange-800',
};

export default function Pickups({ onBack }) {
  const [pickups, setPickups] = useState([]);
  const [drivers, setDrivers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [assignForm, setAssignForm] = useState({ id: null, driver_id: '', scheduled_at: '' });

  const getToken = () => sessionStorage.getItem('swc_token');

  useEffect(() => { fetchPickups(); fetchDrivers(); }, []);

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
        setDrivers(data.filter(s => s.role === 'pickup_driver' && s.is_active));
      }
    } catch (err) { console.error(err); }
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

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-8">
      <button onClick={onBack} className="text-brand-500 hover:underline text-sm mb-4 inline-block">&larr; Back to Dashboard</button>
      <h2 className="text-xl font-bold text-gray-900 mb-6">Pickup Management</h2>

      <div className="mb-4">
        <input type="text" placeholder="Search by client, sender, tracking number..." value={search}
          onChange={(e) => setSearch(e.target.value)}
          onKeyDown={(e) => { if (e.key === 'Enter') { setLoading(true); fetchPickups(search); } }}
          className="w-full max-w-md px-3 py-2.5 border border-gray-300 rounded-lg text-sm" />
      </div>

      {assignForm.id && (
        <form onSubmit={handleAssign} className="bg-gray-50 rounded-xl p-6 border border-gray-100 mb-6">
          <h3 className="font-semibold text-gray-900 mb-4">Assign Driver</h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <select value={assignForm.driver_id} onChange={(e) => setAssignForm({...assignForm, driver_id: e.target.value})} className="px-3 py-2.5 border border-gray-300 rounded-lg text-sm" required>
              <option value="">Select driver</option>
              {drivers.map(d => <option key={d.id} value={d.id}>{d.name} ({d.phone})</option>)}
            </select>
            <input type="datetime-local" value={assignForm.scheduled_at} onChange={(e) => setAssignForm({...assignForm, scheduled_at: e.target.value})} className="px-3 py-2.5 border border-gray-300 rounded-lg text-sm" />
            <div className="flex gap-2">
              <button type="submit" className="px-4 py-2 bg-brand-500 text-white rounded-lg text-sm">Assign</button>
              <button type="button" onClick={() => setAssignForm({ id: null, driver_id: '', scheduled_at: '' })} className="px-4 py-2 bg-gray-200 rounded-lg text-sm">Cancel</button>
            </div>
          </div>
        </form>
      )}

      {loading ? <p className="text-gray-500">Loading...</p> : pickups.length === 0 ? (
        <p className="text-gray-500">No pickups found.</p>
      ) : (
        <div className="overflow-x-auto bg-white rounded-xl shadow border border-gray-100">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-gray-600">
              <tr>
                <th className="text-left px-4 py-3 font-medium">Tracking #</th>
                <th className="text-left px-4 py-3 font-medium">Client</th>
                <th className="text-left px-4 py-3 font-medium">Sender</th>
                <th className="text-left px-4 py-3 font-medium">Pickup Address</th>
                <th className="text-left px-4 py-3 font-medium">Driver</th>
                <th className="text-left px-4 py-3 font-medium">Scheduled</th>
                <th className="text-left px-4 py-3 font-medium">Status</th>
                <th className="text-right px-4 py-3 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {pickups.map(p => {
                const isClient = p._type === 'client';
                return (
                <tr key={p.id || 'c_' + p.client_id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 font-medium text-gray-900">{isClient ? <span className="text-gray-300">—</span> : p.tracking_number}</td>
                  <td className="px-4 py-3 text-gray-600 text-xs">{p.client_name || <span className="text-gray-400">Walk-in</span>}</td>
                  <td className="px-4 py-3 text-gray-600">{p.sender_name}<br/><span className="text-xs">{p.sender_phone}</span></td>
                  <td className="px-4 py-3 text-gray-600 text-xs">{p.pickup_address || p.sender_address || '-'}</td>
                  <td className="px-4 py-3 text-gray-600">{isClient ? <span className="text-gray-300">—</span> : (p.driver_name || <span className="text-gray-400">Unassigned</span>)}</td>
                  <td className="px-4 py-3 text-xs text-gray-500">{isClient ? <span className="text-gray-300">—</span> : (p.pickup_scheduled_at ? new Date(p.pickup_scheduled_at).toLocaleString() : '-')}</td>
                  <td className="px-4 py-3">
                    {isClient ? (
                      <span className="inline-block px-2 py-0.5 rounded text-xs font-semibold bg-gray-100 text-gray-500">No pickup</span>
                    ) : (
                      <span className={`inline-block px-2 py-0.5 rounded text-xs font-semibold ${statusColors[p.status] || 'bg-gray-100'}`}>
                        {p.status.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase())}
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-right whitespace-nowrap">
                    {isClient ? (
                      <span className="text-xs text-gray-400">Create a shipment first</span>
                    ) : (p.status === 'pickup_requested' && (
                      <>
                        <button onClick={() => setAssignForm({ id: p.id, driver_id: p.pickup_driver_id || '', scheduled_at: p.pickup_scheduled_at || '' })}
                          className="text-purple-500 hover:underline text-xs mr-2">Assign</button>
                        <button onClick={() => handleStatus(p.id, 'picked_up')} className="text-orange-500 hover:underline text-xs">Pick Up</button>
                      </>
                    ))}
                  </td>
                </tr>
              );})}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
