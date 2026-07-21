import { useState, useEffect } from 'react';

const API = '/api/admin';

export default function DocketEntry({ onBack }) {
  const [items, setItems] = useState([]);
  const [riders, setRiders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [assignForm, setAssignForm] = useState({ id: null, rider_id: '', sorting_area: '' });

  const getToken = () => sessionStorage.getItem('swc_token');

  useEffect(() => { fetchItems(); fetchRiders(); }, []);

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

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <button onClick={onBack} className="text-brand-500 hover:underline text-sm mb-2 inline-block">&larr; Back to Dashboard</button>
          <h2 className="text-xl font-bold text-gray-900">Docket Entry</h2>
          <p className="text-xs text-gray-500 mt-1">Record & assign shipments from sorting center</p>
        </div>
      </div>

      <div className="mb-4">
        <input type="text" placeholder="Search by tracking, sender, receiver..." value={search}
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
        <p className="text-gray-500">No shipments in sorting center.</p>
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
                <th className="text-right px-4 py-3 font-medium">Action</th>
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
                        <button onClick={() => setAssignForm({ id: s.id, rider_id: s.delivery_rider_id || '', sorting_area: s.sorting_area || '' })}
                          className="text-purple-500 hover:underline text-xs mr-2">Assign</button>
                        {s.delivery_rider_id && (
                          <button onClick={() => handleSort(s.id)}
                            className="text-indigo-500 hover:underline text-xs">Mark Sorted</button>
                        )}
                      </>
                    )}
                    {s.status === 'sorted' && (
                      <span className="text-xs text-gray-400 italic">Sorted</span>
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
