import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const API = '/api/staff';

export default function StaffDashboard() {
  const [shipments, setShipments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState(null);
  const [selectedShipment, setSelectedShipment] = useState(null);
  const [status, setStatus] = useState('');
  const [location, setLocation] = useState('');
  const [description, setDescription] = useState('');
  const [attemptReason, setAttemptReason] = useState('');
  const [attemptNote, setAttemptNote] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    fetchProfile();
    fetchShipments();
  }, []);

  const getToken = () => sessionStorage.getItem('staff_token');

  const fetchProfile = async () => {
    try {
      const res = await fetch(`${API}/profile`, {
        headers: { 'Authorization': `Bearer ${getToken()}` }
      });
      if (res.ok) setProfile(await res.json());
    } catch (err) { console.error(err); }
  };

  const fetchShipments = async () => {
    try {
      const res = await fetch(`${API}/my-shipments`, {
        headers: { 'Authorization': `Bearer ${getToken()}` }
      });
      if (res.status === 401 || res.status === 403) {
        sessionStorage.removeItem('staff_token');
        navigate('/staff');
        return;
      }
      const data = await res.json();
      setShipments(data);
    } catch (err) { console.error(err); } finally { setLoading(false); }
  };

  const handleStatusUpdate = async (id) => {
    if (!status) return;
    await fetch(`${API}/shipments/${id}/status`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${getToken()}` },
      body: JSON.stringify({ status, location, description })
    });
    setSelectedShipment(null);
    setStatus('');
    setLocation('');
    setDescription('');
    fetchShipments();
  };

  const handleDeliveryAttempt = async (id) => {
    if (!attemptReason) return;
    await fetch(`${API}/shipments/${id}/delivery-attempt`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${getToken()}` },
      body: JSON.stringify({ reason: attemptReason, custom_note: attemptNote })
    });
    setSelectedShipment(null);
    setAttemptReason('');
    setAttemptNote('');
    fetchShipments();
  };

  const handleLogout = () => {
    sessionStorage.removeItem('staff_token');
    navigate('/staff');
  };

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

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Delivery Portal</h1>
          {profile && <p className="text-sm text-gray-500">Welcome, {profile.name}</p>}
        </div>
        <button onClick={handleLogout} className="px-4 py-2 bg-gray-200 text-gray-700 font-semibold rounded-lg hover:bg-gray-300 text-sm transition-colors">
          Logout
        </button>
      </div>

      {/* Assigned Shipments */}
      {loading ? (
        <p className="text-gray-500">Loading...</p>
      ) : shipments.length === 0 ? (
        <div className="text-center py-16 bg-gray-50 rounded-xl">
          <p className="text-gray-500">No assigned shipments right now.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {shipments.map(s => (
            <div key={s.id} className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-bold text-gray-900">{s.tracking_number}</span>
                    <span className={`inline-block px-2 py-0.5 rounded text-xs font-semibold ${statusColors[s.status] || 'bg-gray-100 text-gray-800'}`}>
                      {s.status.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase())}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600">
                    {s.receiver_name} &mdash; {s.receiver_phone}
                  </p>
                  <p className="text-xs text-gray-400">{s.origin} &rarr; {s.destination}</p>
                  {s.special_instructions && (
                    <p className="text-xs text-amber-600 mt-1">
                      <span className="font-medium">Instructions:</span> {s.special_instructions}
                    </p>
                  )}
                </div>

                {selectedShipment === s.id ? (
                  <div className="flex flex-col gap-2 w-full sm:w-64">
                    <select value={status} onChange={(e) => setStatus(e.target.value)}
                      className="px-3 py-1.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500">
                      <option value="">Update status...</option>
                      {['picked_up','at_warehouse','sorted','out_for_delivery','customer_contacted','delivered','returned','rescheduled'].map(st => (
                        <option key={st} value={st}>{st.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase())}</option>
                      ))}
                    </select>
                    <input type="text" placeholder="Location" value={location} onChange={(e) => setLocation(e.target.value)}
                      className="px-3 py-1.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500" />
                    <input type="text" placeholder="Description" value={description} onChange={(e) => setDescription(e.target.value)}
                      className="px-3 py-1.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500" />
                    <div className="flex gap-1">
                      <button onClick={() => handleStatusUpdate(s.id)} className="flex-1 px-3 py-1.5 bg-purple-500 text-white text-xs font-semibold rounded-lg hover:bg-purple-600">
                        Update
                      </button>
                      <button onClick={() => setSelectedShipment(null)} className="px-3 py-1.5 bg-gray-200 text-gray-700 text-xs rounded-lg hover:bg-gray-300">
                        Cancel
                      </button>
                    </div>
                    {/* Delivery Attempt */}
                    <div className="border-t border-gray-200 pt-2 mt-1">
                      <p className="text-xs font-medium text-gray-500 mb-1">Failed delivery?</p>
                      <select value={attemptReason} onChange={(e) => setAttemptReason(e.target.value)}
                        className="w-full px-3 py-1.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 mb-1">
                        <option value="">Select reason...</option>
                        <option value="Customer unavailable">Customer unavailable</option>
                        <option value="Requested delivery on another day">Requested delivery on another day</option>
                        <option value="Incorrect address">Incorrect address</option>
                        <option value="Phone unreachable">Phone unreachable</option>
                        <option value="Other">Other</option>
                      </select>
                      <input type="text" placeholder="Note" value={attemptNote} onChange={(e) => setAttemptNote(e.target.value)}
                        className="w-full px-3 py-1.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 mb-1" />
                      <button onClick={() => handleDeliveryAttempt(s.id)} className="w-full px-3 py-1.5 bg-amber-500 text-white text-xs font-semibold rounded-lg hover:bg-amber-600">
                        Log Failed Attempt
                      </button>
                    </div>
                  </div>
                ) : (
                  <button onClick={() => setSelectedShipment(s.id)}
                    className="px-4 py-2 bg-purple-500 text-white text-sm font-semibold rounded-lg hover:bg-purple-600 transition-colors whitespace-nowrap">
                    Update Status
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
