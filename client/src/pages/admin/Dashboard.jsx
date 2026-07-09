import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import ShipmentForm from './ShipmentForm';

const API = '/api/admin';

export default function AdminDashboard() {
  const [shipments, setShipments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);
  const [viewEvents, setViewEvents] = useState(null);
  const [events, setEvents] = useState([]);
  const [newEvent, setNewEvent] = useState({ status: '', location: '', description: '' });
  const navigate = useNavigate();

  useEffect(() => {
    fetchShipments();
  }, []);

  const getToken = () => localStorage.getItem('swc_token');

  const fetchShipments = async () => {
    try {
      const res = await fetch(`${API}/shipments`, {
        headers: { 'Authorization': `Bearer ${getToken()}` }
      });
      if (res.status === 401 || res.status === 403) {
        localStorage.removeItem('swc_token');
        navigate('/admin');
        return;
      }
      const data = await res.json();
      setShipments(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this shipment?')) return;
    await fetch(`${API}/shipments/${id}`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${getToken()}` }
    });
    fetchShipments();
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
      const res = await fetch(`${API}/shipments/${shipment.id}/send-email`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${getToken()}` }
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to send');
      }
      alert('Email sent successfully!');
    } catch (err) {
      alert(err.message);
    }
  };

  const handleFormDone = () => {
    setShowForm(false);
    setEditing(null);
    fetchShipments();
  };

  const handleViewEvents = async (shipment) => {
    setViewEvents(shipment);
    setNewEvent({ status: '', location: '', description: '' });
    try {
      const res = await fetch(`${API}/shipments/${shipment.id}/events`, {
        headers: { 'Authorization': `Bearer ${getToken()}` }
      });
      const data = await res.json();
      setEvents(data);
    } catch (err) {
      console.error(err);
      setEvents([]);
    }
  };

  const handleAddEvent = async (e) => {
    e.preventDefault();
    if (!newEvent.status) return;

    await fetch(`${API}/shipments/${viewEvents.id}/events`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${getToken()}`
      },
      body: JSON.stringify(newEvent)
    });

    setNewEvent({ status: '', location: '', description: '' });
    handleViewEvents(viewEvents);
    fetchShipments();
  };

  const handleLogout = () => {
    localStorage.removeItem('swc_token');
    navigate('/admin');
  };

  const statusBadge = (status) => {
    const colors = {
      pending: 'bg-yellow-100 text-yellow-800',
      in_transit: 'bg-blue-100 text-blue-800',
      out_for_delivery: 'bg-indigo-100 text-indigo-800',
      delivered: 'bg-green-100 text-green-800',
      exception: 'bg-red-100 text-red-800',
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  if (showForm) {
    return (
      <ShipmentForm
        shipment={editing}
        onDone={handleFormDone}
        onCancel={() => { setShowForm(false); setEditing(null); }}
      />
    );
  }

  if (viewEvents) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <button
          onClick={() => setViewEvents(null)}
          className="text-brand-500 hover:underline text-sm mb-4 inline-block"
        >
          &larr; Back to Dashboard
        </button>

        <h2 className="text-xl font-bold text-gray-900 mb-1">{viewEvents.tracking_number}</h2>
        <p className="text-gray-500 text-sm mb-6">{viewEvents.receiver_name} — {viewEvents.destination}</p>

        <form onSubmit={handleAddEvent} className="bg-gray-50 rounded-xl p-6 mb-8">
          <h3 className="font-semibold text-gray-900 mb-4">Add Tracking Event</h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-3">
            <select
              value={newEvent.status}
              onChange={(e) => setNewEvent({ ...newEvent, status: e.target.value })}
              className="px-3 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500"
              required
            >
              <option value="">Select status</option>
              <option value="pending">Pending</option>
              <option value="in_transit">In Transit</option>
              <option value="out_for_delivery">Out for Delivery</option>
              <option value="delivered">Delivered</option>
              <option value="exception">Exception</option>
            </select>
            <input
              type="text"
              placeholder="Location"
              value={newEvent.location}
              onChange={(e) => setNewEvent({ ...newEvent, location: e.target.value })}
              className="px-3 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500"
            />
            <input
              type="text"
              placeholder="Description"
              value={newEvent.description}
              onChange={(e) => setNewEvent({ ...newEvent, description: e.target.value })}
              className="px-3 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500"
            />
          </div>
          <button
            type="submit"
            className="px-4 py-2 bg-brand-500 text-white font-semibold rounded-lg hover:bg-brand-600 text-sm transition-colors"
          >
            Add Event
          </button>
        </form>

        <h3 className="font-semibold text-gray-900 mb-3">Tracking History</h3>
        <div className="space-y-3">
          {events.length === 0 && <p className="text-gray-500 text-sm">No events yet.</p>}
          {events.map((event) => (
            <div key={event.id} className="flex items-start gap-3 border-l-2 border-gray-200 pl-4 py-2">
              <div>
                <span className={`inline-block px-2 py-0.5 rounded text-xs font-semibold ${statusBadge(event.status)}`}>
                  {event.status.replace(/_/g, ' ')}
                </span>
                {event.location && <span className="text-sm text-gray-500 ml-2">{event.location}</span>}
                <p className="text-sm text-gray-600 mt-1">{event.description || ''}</p>
                <p className="text-xs text-gray-400 mt-0.5">{new Date(event.timestamp).toLocaleString()}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
        <div className="flex gap-3">
          <button
            onClick={() => setShowForm(true)}
            className="px-4 py-2 bg-brand-500 text-white font-semibold rounded-lg hover:bg-brand-600 text-sm transition-colors"
          >
            + New Shipment
          </button>
          <button
            onClick={handleLogout}
            className="px-4 py-2 bg-gray-200 text-gray-700 font-semibold rounded-lg hover:bg-gray-300 text-sm transition-colors"
          >
            Logout
          </button>
        </div>
      </div>

      {loading ? (
        <p className="text-gray-500">Loading...</p>
      ) : shipments.length === 0 ? (
        <div className="text-center py-16 bg-gray-50 rounded-xl">
          <p className="text-gray-500 mb-4">No shipments yet.</p>
          <button
            onClick={() => setShowForm(true)}
            className="px-4 py-2 bg-brand-500 text-white font-semibold rounded-lg hover:bg-brand-600 text-sm"
          >
            Create First Shipment
          </button>
        </div>
      ) : (
        <div className="overflow-x-auto bg-white rounded-xl shadow border border-gray-100">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-gray-600">
              <tr>
                <th className="text-left px-4 py-3 font-medium">Tracking #</th>
                <th className="text-left px-4 py-3 font-medium">Sender</th>
                <th className="text-left px-4 py-3 font-medium">Receiver</th>
                <th className="text-left px-4 py-3 font-medium">Origin</th>
                <th className="text-left px-4 py-3 font-medium">Destination</th>
                <th className="text-left px-4 py-3 font-medium">Status</th>
                <th className="text-right px-4 py-3 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {shipments.map((s) => (
                <tr key={s.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 font-medium text-gray-900">{s.tracking_number}</td>
                  <td className="px-4 py-3 text-gray-600">{s.sender_name}</td>
                  <td className="px-4 py-3 text-gray-600">{s.receiver_name}</td>
                  <td className="px-4 py-3 text-gray-600">{s.origin}</td>
                  <td className="px-4 py-3 text-gray-600">{s.destination}</td>
                  <td className="px-4 py-3">
                    <span className={`inline-block px-2 py-0.5 rounded text-xs font-semibold ${statusBadge(s.status)}`}>
                      {s.status.replace(/_/g, ' ')}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <button onClick={() => handleViewEvents(s)} className="text-brand-500 hover:underline text-xs mr-3">Events</button>
                    <button onClick={() => handleEdit(s)} className="text-blue-500 hover:underline text-xs mr-3">Edit</button>
                    <button onClick={() => handleSendEmail(s)} className="text-emerald-500 hover:underline text-xs mr-3">Email</button>
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
