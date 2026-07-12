import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const API = '/api/client';

export default function ClientDashboard() {
  const [tab, setTab] = useState('dashboard');
  const [profile, setProfile] = useState(null);
  const [shipments, setShipments] = useState([]);
  const [invoices, setInvoices] = useState([]);
  const [trackingDetail, setTrackingDetail] = useState(null);
  const [loadingTracking, setLoadingTracking] = useState(false);
  const [trackQuery, setTrackQuery] = useState('');
  const [trackResult, setTrackResult] = useState(null);
  const [trackLoading, setTrackLoading] = useState(false);
  const [trackError, setTrackError] = useState('');
  const [form, setForm] = useState({ sender_name: '', sender_phone: '', sender_address: '', receiver_name: '', receiver_phone: '', receiver_address: '', parcel_type: '', parcel_description: '', weight: '', delivery_type: '', cod_amount: '' });
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [profileForm, setProfileForm] = useState({ company_name: '', contact_person: '', phone: '', email: '', address: '' });
  const [profileSaving, setProfileSaving] = useState(false);
  const [profileMsg, setProfileMsg] = useState('');
  const navigate = useNavigate();

  const getToken = () => sessionStorage.getItem('client_token');

  useEffect(() => {
    const user = sessionStorage.getItem('client_user');
    if (!user) { navigate('/client'); return; }
    setProfile(JSON.parse(user));
    fetchShipments();
    fetchInvoices();
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const res = await fetch(`${API}/profile`, { headers: { 'Authorization': `Bearer ${getToken()}` } });
      if (res.ok) {
        const data = await res.json();
        setProfileForm({ company_name: data.company_name || '', contact_person: data.contact_person || '', phone: data.phone || '', email: data.email || '', address: data.address || '' });
      }
    } catch (err) { console.error(err); }
  };

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

  const viewTracking = async (trackingNumber) => {
    setLoadingTracking(true);
    setTrackingDetail(null);
    try {
      const res = await fetch(`${API}/shipments/${trackingNumber}`, { headers: { 'Authorization': `Bearer ${getToken()}` } });
      if (res.ok) setTrackingDetail(await res.json());
    } catch (err) { console.error(err); } finally { setLoadingTracking(false); }
  };

  const handleTrackLookup = async () => {
    if (!trackQuery.trim()) return;
    setTrackLoading(true);
    setTrackResult(null);
    setTrackError('');
    try {
      const res = await fetch(`${API}/shipments/${trackQuery.trim()}`, { headers: { 'Authorization': `Bearer ${getToken()}` } });
      if (!res.ok) { setTrackError('Shipment not found'); return; }
      setTrackResult(await res.json());
    } catch (err) { setTrackError(err.message); } finally { setTrackLoading(false); }
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
      setForm({ sender_name: '', sender_phone: '', sender_address: '', receiver_name: '', receiver_phone: '', receiver_address: '', parcel_type: '', parcel_description: '', weight: '', delivery_type: '', cod_amount: '' });
      fetchShipments();
    } catch (err) { alert(err.message); } finally { setSubmitting(false); }
  };

  const handleProfileSave = async (e) => {
    e.preventDefault();
    setProfileSaving(true);
    setProfileMsg('');
    try {
      const res = await fetch(`${API}/profile`, {
        method: 'PUT', headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${getToken()}` },
        body: JSON.stringify(profileForm)
      });
      if (res.ok) { setProfileMsg('Profile updated'); sessionStorage.setItem('client_user', JSON.stringify(await res.json())); }
      else { setProfileMsg('Failed to update'); }
    } catch (err) { setProfileMsg(err.message); } finally { setProfileSaving(false); }
  };

  const handleLogout = () => {
    sessionStorage.removeItem('client_token');
    sessionStorage.removeItem('client_user');
    navigate('/client');
  };

  const statusColors = {
    pickup_requested: 'bg-yellow-100 text-yellow-800',
    picked_up: 'bg-orange-100 text-orange-800',
    at_sorting_center: 'bg-violet-100 text-violet-800',
    sorted: 'bg-indigo-100 text-indigo-800',
    out_for_delivery: 'bg-blue-100 text-blue-800',
    customer_contacted: 'bg-teal-100 text-teal-800',
    delivered: 'bg-green-100 text-green-800',
    failed_delivery: 'bg-red-100 text-red-800',
    returned_to_sender: 'bg-gray-200 text-gray-800',
    rescheduled: 'bg-cyan-100 text-cyan-800',
  };

  const eventConfig = {
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
  };

  const tabs = [
    { id: 'dashboard', label: 'Dashboard' },
    { id: 'track', label: 'Track Shipment' },
    { id: 'pickup', label: 'Request Pickup' },
    { id: 'history', label: 'History' },
    { id: 'invoices', label: 'Invoices' },
    { id: 'profile', label: 'Profile' },
  ];

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-8">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Client Portal</h1>
          {profile && <p className="text-sm text-gray-500">Welcome, {profile.contact_person || profile.company_name}</p>}
        </div>
        <button onClick={handleLogout} className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 text-sm">Logout</button>
      </div>

      <div className="flex flex-wrap gap-1 mb-6 border-b border-gray-200">
        {tabs.map(t => (
          <button key={t.id} onClick={() => setTab(t.id)}
            className={`px-4 py-2.5 text-sm font-medium rounded-t-lg transition-colors ${tab === t.id ? 'bg-teal-500 text-white' : 'text-gray-600 hover:text-gray-900'}`}>
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
                  <th className="text-left px-4 py-3 font-medium"></th>
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
                    <td className="px-4 py-3">
                      <button onClick={() => viewTracking(s.tracking_number)}
                        className="text-teal-600 hover:text-teal-800 text-xs font-medium">Track</button>
                    </td>
                  </tr>
                ))}
                {shipments.length === 0 && <tr><td colSpan={6} className="px-4 py-8 text-center text-gray-500">No shipments yet.</td></tr>}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {tab === 'track' && (
        <div className="max-w-2xl">
          <div className="bg-white rounded-xl shadow border border-gray-100 p-6">
            <h3 className="font-semibold text-gray-900 mb-4">Track a Shipment</h3>
            <div className="flex gap-2">
              <input type="text" value={trackQuery} onChange={e => setTrackQuery(e.target.value)}
                placeholder="Enter tracking number (e.g. SW0001)"
                className="flex-1 px-3 py-2.5 border border-gray-300 rounded-lg text-sm" />
              <button onClick={handleTrackLookup} disabled={!trackQuery || trackLoading}
                className="px-5 py-2.5 bg-teal-500 text-white text-sm font-semibold rounded-lg hover:bg-teal-600 disabled:opacity-50">
                {trackLoading ? 'Searching...' : 'Track'}
              </button>
            </div>
            {trackError && <p className="text-red-500 text-sm mt-2">{trackError}</p>}

            {trackResult && (
              <div className="mt-6 border-t border-gray-100 pt-6">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <p className="text-sm text-gray-500">Tracking #{trackResult.shipment.tracking_number}</p>
                    <p className="text-sm text-gray-600">{trackResult.shipment.receiver_name} → {trackResult.shipment.destination}</p>
                  </div>
                  <span className={`inline-block px-2 py-0.5 rounded text-xs font-semibold ${statusColors[trackResult.shipment.status] || 'bg-gray-100'}`}>
                    {trackResult.shipment.status.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase())}
                  </span>
                </div>
                <div className="relative">
                  <div className="absolute left-[17px] top-3 bottom-3 w-0.5 bg-gradient-to-b from-teal-500 to-gray-200 rounded-full" />
                  {(trackResult.events || []).map((event, i) => {
                    const cfg = eventConfig[event.event_type] || { color: 'bg-gray-400', ring: 'ring-gray-200', label: event.status || event.event_type };
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
                          <p className="text-xs text-gray-400 mt-1">{new Date(event.timestamp).toLocaleString()}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {tab === 'pickup' && (
        <div className="max-w-2xl">
          {submitted ? (
            <div className="bg-green-50 border border-green-200 rounded-xl p-8 text-center">
              <h3 className="text-lg font-bold text-green-800 mb-2">Pickup Request Submitted!</h3>
              <p className="text-green-600 text-sm mb-4">We'll contact you shortly to confirm your pickup.</p>
              <button onClick={() => setSubmitted(false)} className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 text-sm">Request Another</button>
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
                  <input type="text" placeholder="e.g. Document, Package" value={form.parcel_type} onChange={(e) => setForm({...form, parcel_type: e.target.value})} className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Weight</label>
                  <input type="text" placeholder="e.g. 2 kg" value={form.weight} onChange={(e) => setForm({...form, weight: e.target.value})} className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Delivery Type</label>
                  <input type="text" placeholder="e.g. Standard, Express" value={form.delivery_type} onChange={(e) => setForm({...form, delivery_type: e.target.value})} className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">COD Amount (LKR)</label>
                  <input type="text" inputMode="decimal" placeholder="0.00" value={form.cod_amount} onChange={(e) => setForm({...form, cod_amount: e.target.value})} className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm" />
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
                <th className="text-left px-4 py-3 font-medium"></th>
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
                  <td className="px-4 py-3">
                    <button onClick={() => viewTracking(s.tracking_number)}
                      className="text-teal-600 hover:text-teal-800 text-xs font-medium">View</button>
                  </td>
                </tr>
              ))}
              {shipments.length === 0 && <tr><td colSpan={8} className="px-4 py-8 text-center text-gray-500">No shipment history.</td></tr>}
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

      {tab === 'profile' && (
        <div className="max-w-lg">
          <form onSubmit={handleProfileSave} className="bg-white rounded-xl shadow border border-gray-100 p-6 space-y-4">
            <h3 className="font-semibold text-gray-900">Company Profile</h3>
            {profileMsg && <p className={`text-sm ${profileMsg === 'Profile updated' ? 'text-green-600' : 'text-red-600'}`}>{profileMsg}</p>}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Company Name</label>
              <input type="text" value={profileForm.company_name} onChange={(e) => setProfileForm({...profileForm, company_name: e.target.value})}
                className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Contact Person *</label>
              <input type="text" required value={profileForm.contact_person} onChange={(e) => setProfileForm({...profileForm, contact_person: e.target.value})}
                className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Phone *</label>
              <input type="text" required value={profileForm.phone} onChange={(e) => setProfileForm({...profileForm, phone: e.target.value})}
                className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <input type="email" value={profileForm.email} onChange={(e) => setProfileForm({...profileForm, email: e.target.value})}
                className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
              <input type="text" value={profileForm.address} onChange={(e) => setProfileForm({...profileForm, address: e.target.value})}
                className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm" />
            </div>
            <button type="submit" disabled={profileSaving}
              className="px-6 py-2.5 bg-teal-500 text-white text-sm font-semibold rounded-lg hover:bg-teal-600 disabled:opacity-50">
              {profileSaving ? 'Saving...' : 'Save Changes'}
            </button>
          </form>
        </div>
      )}

      {/* Tracking Detail Modal */}
      {trackingDetail && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 px-4" onClick={() => setTrackingDetail(null)}>
          <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full max-h-[80vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            <div className="sticky top-0 bg-white border-b border-gray-100 px-6 py-4 flex items-center justify-between rounded-t-2xl">
              <div>
                <h3 className="font-bold text-gray-900">{trackingDetail.shipment.tracking_number}</h3>
                <p className="text-xs text-gray-500">{trackingDetail.shipment.receiver_name} → {trackingDetail.shipment.destination}</p>
              </div>
              <button onClick={() => setTrackingDetail(null)} className="p-1 text-gray-400 hover:text-gray-600">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>
            <div className="p-6">
              {loadingTracking ? (
                <p className="text-center text-gray-500 py-8">Loading...</p>
              ) : (
                <div className="relative">
                  <div className="absolute left-[17px] top-3 bottom-3 w-0.5 bg-gradient-to-b from-teal-500 to-gray-200 rounded-full" />
                  {(trackingDetail.events || []).map((event, i) => {
                    const cfg = eventConfig[event.event_type] || { color: 'bg-gray-400', ring: 'ring-gray-200', label: event.status || event.event_type };
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
                          <p className="text-xs text-gray-400 mt-1">{new Date(event.timestamp).toLocaleString()}</p>
                        </div>
                      </div>
                    );
                  })}
                  {(!trackingDetail.events || trackingDetail.events.length === 0) && (
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
