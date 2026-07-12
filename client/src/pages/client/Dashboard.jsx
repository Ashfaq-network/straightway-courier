import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const API = '/api/client';

export default function ClientDashboard() {
  const [tab, setTab] = useState('dashboard');
  const [profile, setProfile] = useState(null);
  const [shipments, setShipments] = useState([]);
  const [invoices, setInvoices] = useState([]);
  const [form, setForm] = useState({ sender_name: '', sender_phone: '', sender_address: '', receiver_name: '', receiver_phone: '', receiver_address: '', parcel_type: 'document', parcel_description: '', weight: '', delivery_type: 'standard', cod_amount: '' });
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const navigate = useNavigate();

  const getToken = () => sessionStorage.getItem('client_token');

  useEffect(() => {
    const user = sessionStorage.getItem('client_user');
    if (!user) { navigate('/client/login'); return; }
    setProfile(JSON.parse(user));
    fetchShipments();
    fetchInvoices();
  }, []);

  const fetchShipments = async () => {
    try {
      const res = await fetch(`${API}/shipments`, { headers: { 'Authorization': `Bearer ${getToken()}` } });
      if (res.ok) setShipments(await res.json());
    } catch (err) { console.error(err); }
  };

  const fetchInvoices = async () => {
    try {
      const res = await fetch(`${API}/reports/invoices`, { headers: { 'Authorization': `Bearer ${getToken()}` } });
      if (res.ok) setInvoices(await res.json());
    } catch (err) { console.error(err); }
  };

  const handlePickupRequest = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await fetch(`${API}/pickup-request`, {
        method: 'POST', headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${getToken()}` },
        body: JSON.stringify(form)
      });
      if (!res.ok) { const d = await res.json(); alert(d.error); return; }
      setSubmitted(true);
      setForm({ sender_name: '', sender_phone: '', sender_address: '', receiver_name: '', receiver_phone: '', receiver_address: '', parcel_type: 'document', parcel_description: '', weight: '', delivery_type: 'standard', cod_amount: '' });
      fetchShipments();
    } catch (err) { alert(err.message); } finally { setSubmitting(false); }
  };

  const handleLogout = () => {
    sessionStorage.removeItem('client_token');
    sessionStorage.removeItem('client_user');
    navigate('/client/login');
  };

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

  const tabs = [
    { id: 'dashboard', label: 'Dashboard' },
    { id: 'pickup', label: 'Request Pickup' },
    { id: 'history', label: 'History' },
    { id: 'invoices', label: 'Invoices' },
  ];

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-8">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Client Portal</h1>
          {profile && <p className="text-sm text-gray-500">Welcome, {profile.contact_person || profile.company_name}</p>}
        </div>
        <button onClick={handleLogout} className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg text-sm">Logout</button>
      </div>

      <div className="flex flex-wrap gap-1 mb-6 border-b border-gray-200">
        {tabs.map(t => (
          <button key={t.id} onClick={() => setTab(t.id)}
            className={`px-4 py-2.5 text-sm font-medium rounded-t-lg ${tab === t.id ? 'bg-teal-500 text-white' : 'text-gray-600 hover:text-gray-900'}`}>
            {t.label}
          </button>
        ))}
      </div>

      {tab === 'dashboard' && (
        <div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
            <div className="bg-blue-50 text-blue-600 rounded-xl p-4 border border-gray-100 shadow-sm">
              <p className="text-xs font-medium opacity-75">Total Shipments</p>
              <p className="text-2xl font-bold mt-1">{shipments.length}</p>
            </div>
            <div className="bg-green-50 text-green-600 rounded-xl p-4 border border-gray-100 shadow-sm">
              <p className="text-xs font-medium opacity-75">Delivered</p>
              <p className="text-2xl font-bold mt-1">{shipments.filter(s => s.status === 'delivered').length}</p>
            </div>
            <div className="bg-yellow-50 text-yellow-600 rounded-xl p-4 border border-gray-100 shadow-sm">
              <p className="text-xs font-medium opacity-75">In Transit</p>
              <p className="text-2xl font-bold mt-1">{shipments.filter(s => !['delivered','returned_to_sender'].includes(s.status)).length}</p>
            </div>
            <div className="bg-purple-50 text-purple-600 rounded-xl p-4 border border-gray-100 shadow-sm">
              <p className="text-xs font-medium opacity-75">COD Total</p>
              <p className="text-2xl font-bold mt-1">LKR {shipments.filter(s => s.payment_status === 'cod').reduce((sum, s) => sum + parseFloat(s.cod_amount || 0), 0).toLocaleString()}</p>
            </div>
          </div>

          <h3 className="font-semibold text-gray-900 mb-3">Recent Shipments</h3>
          <div className="overflow-x-auto bg-white rounded-xl shadow border border-gray-100">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 text-gray-600">
                <tr>
                  <th className="text-left px-4 py-3 font-medium">Tracking #</th>
                  <th className="text-left px-4 py-3 font-medium">Receiver</th>
                  <th className="text-left px-4 py-3 font-medium">Destination</th>
                  <th className="text-left px-4 py-3 font-medium">Status</th>
                  <th className="text-left px-4 py-3 font-medium">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {shipments.slice(0, 10).map(s => (
                  <tr key={s.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 font-medium text-teal-600">{s.tracking_number}</td>
                    <td className="px-4 py-3 text-gray-600">{s.receiver_name}</td>
                    <td className="px-4 py-3 text-gray-600 text-xs">{s.destination}</td>
                    <td className="px-4 py-3">
                      <span className={`inline-block px-2 py-0.5 rounded text-xs font-semibold ${statusColors[s.status] || 'bg-gray-100'}`}>
                        {s.status.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase())}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-xs text-gray-500">{new Date(s.created_at).toLocaleDateString()}</td>
                  </tr>
                ))}
                {shipments.length === 0 && <tr><td colSpan={5} className="px-4 py-8 text-center text-gray-500">No shipments yet.</td></tr>}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {tab === 'pickup' && (
        <div className="max-w-2xl">
          {submitted ? (
            <div className="bg-green-50 border border-green-200 rounded-xl p-8 text-center">
              <h3 className="text-lg font-bold text-green-800 mb-2">Pickup Request Submitted!</h3>
              <p className="text-green-600 text-sm mb-4">We'll contact you shortly to confirm the pickup.</p>
              <button onClick={() => setSubmitted(false)} className="px-4 py-2 bg-green-500 text-white rounded-lg text-sm">Request Another</button>
            </div>
          ) : (
            <form onSubmit={handlePickupRequest} className="bg-white rounded-xl shadow border border-gray-100 p-6 space-y-4">
              <h3 className="font-semibold text-gray-900">New Pickup Request</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Your Name *</label>
                  <input type="text" required value={form.sender_name} onChange={(e) => setForm({...form, sender_name: e.target.value})} className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Your Phone *</label>
                  <input type="text" required value={form.sender_phone} onChange={(e) => setForm({...form, sender_phone: e.target.value})} className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm" />
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Pickup Address</label>
                  <input type="text" value={form.sender_address} onChange={(e) => setForm({...form, sender_address: e.target.value})} className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Receiver Name *</label>
                  <input type="text" required value={form.receiver_name} onChange={(e) => setForm({...form, receiver_name: e.target.value})} className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Receiver Phone *</label>
                  <input type="text" required value={form.receiver_phone} onChange={(e) => setForm({...form, receiver_phone: e.target.value})} className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm" />
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Delivery Address</label>
                  <input type="text" value={form.receiver_address} onChange={(e) => setForm({...form, receiver_address: e.target.value})} className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Parcel Type</label>
                  <select value={form.parcel_type} onChange={(e) => setForm({...form, parcel_type: e.target.value})} className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm">
                    <option value="document">Document</option>
                    <option value="package">Package</option>
                    <option value="fragile">Fragile</option>
                    <option value="electronics">Electronics</option>
                    <option value="food">Food/Perishable</option>
                    <option value="other">Other</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Weight</label>
                  <input type="text" placeholder="e.g. 2 kg" value={form.weight} onChange={(e) => setForm({...form, weight: e.target.value})} className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Delivery Type</label>
                  <select value={form.delivery_type} onChange={(e) => setForm({...form, delivery_type: e.target.value})} className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm">
                    <option value="standard">Standard</option>
                    <option value="express">Express</option>
                    <option value="same_day">Same Day</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">COD Amount (LKR)</label>
                  <input type="number" step="0.01" value={form.cod_amount} onChange={(e) => setForm({...form, cod_amount: e.target.value})} className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm" />
                </div>
              </div>
              <button type="submit" disabled={submitting} className="px-6 py-2.5 bg-teal-500 text-white rounded-lg hover:bg-teal-600 text-sm font-semibold">
                {submitting ? 'Submitting...' : 'Request Pickup'}
              </button>
            </form>
          )}
        </div>
      )}

      {tab === 'history' && (
        <div className="overflow-x-auto bg-white rounded-xl shadow border border-gray-100">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-gray-600">
              <tr>
                <th className="text-left px-4 py-3 font-medium">Tracking #</th>
                <th className="text-left px-4 py-3 font-medium">Receiver</th>
                <th className="text-left px-4 py-3 font-medium">Destination</th>
                <th className="text-left px-4 py-3 font-medium">Status</th>
                <th className="text-left px-4 py-3 font-medium">Weight</th>
                <th className="text-right px-4 py-3 font-medium">Charge</th>
                <th className="text-left px-4 py-3 font-medium">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {shipments.map(s => (
                <tr key={s.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 font-medium text-teal-600">{s.tracking_number}</td>
                  <td className="px-4 py-3 text-gray-600">{s.receiver_name}</td>
                  <td className="px-4 py-3 text-gray-600 text-xs">{s.destination}</td>
                  <td className="px-4 py-3">
                    <span className={`inline-block px-2 py-0.5 rounded text-xs font-semibold ${statusColors[s.status] || 'bg-gray-100'}`}>
                      {s.status.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase())}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-gray-600">{s.weight || '-'}</td>
                  <td className="px-4 py-3 text-right">{s.delivery_charge ? `LKR ${s.delivery_charge}` : '-'}</td>
                  <td className="px-4 py-3 text-xs text-gray-500">{new Date(s.created_at).toLocaleDateString()}</td>
                </tr>
              ))}
              {shipments.length === 0 && <tr><td colSpan={7} className="px-4 py-8 text-center text-gray-500">No shipment history.</td></tr>}
            </tbody>
          </table>
        </div>
      )}

      {tab === 'invoices' && (
        <div className="overflow-x-auto bg-white rounded-xl shadow border border-gray-100">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-gray-600">
              <tr>
                <th className="text-left px-4 py-3 font-medium">Tracking #</th>
                <th className="text-right px-4 py-3 font-medium">Delivery Charge</th>
                <th className="text-right px-4 py-3 font-medium">COD Amount</th>
                <th className="text-left px-4 py-3 font-medium">Payment Status</th>
                <th className="text-left px-4 py-3 font-medium">Delivery Status</th>
                <th className="text-left px-4 py-3 font-medium">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {invoices.map(s => (
                <tr key={s.tracking_number} className="hover:bg-gray-50">
                  <td className="px-4 py-3 font-medium text-teal-600">{s.tracking_number}</td>
                  <td className="px-4 py-3 text-right">{s.delivery_charge ? `LKR ${s.delivery_charge}` : '-'}</td>
                  <td className="px-4 py-3 text-right">{s.cod_amount ? `LKR ${s.cod_amount}` : '-'}</td>
                  <td className="px-4 py-3">
                    <span className={`inline-block px-2 py-0.5 rounded text-xs font-semibold ${s.payment_status === 'paid' ? 'bg-green-100 text-green-800' : s.payment_status === 'cod' ? 'bg-blue-100 text-blue-800' : 'bg-yellow-100 text-yellow-800'}`}>
                      {s.payment_status}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`inline-block px-2 py-0.5 rounded text-xs font-semibold ${statusColors[s.status] || 'bg-gray-100'}`}>
                      {s.status.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase())}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-xs text-gray-500">{new Date(s.created_at).toLocaleDateString()}</td>
                </tr>
              ))}
              {invoices.length === 0 && <tr><td colSpan={6} className="px-4 py-8 text-center text-gray-500">No invoices yet.</td></tr>}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
