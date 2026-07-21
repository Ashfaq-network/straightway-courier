import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const API = '/api/client';

const statusLabels = {
  pickup_requested: 'Pickup Requested', picked_up: 'Picked Up', at_sorting_center: 'At Sorting Center',
  sorted: 'Sorted', out_for_delivery: 'Out for Delivery', customer_contacted: 'Customer Contacted',
  delivered: 'Delivered', failed_delivery: 'Failed Delivery', returned_to_sender: 'Returned to Sender', rescheduled: 'Rescheduled',
};
const statusOrder = ['pickup_requested','picked_up','at_sorting_center','sorted','out_for_delivery','delivered'];

const statusColors = {
  pickup_requested: 'bg-yellow-100 text-yellow-800', picked_up: 'bg-orange-100 text-orange-800',
  at_sorting_center: 'bg-violet-100 text-violet-800', sorted: 'bg-indigo-100 text-indigo-800',
  out_for_delivery: 'bg-blue-100 text-blue-800', customer_contacted: 'bg-teal-100 text-teal-800',
  delivered: 'bg-green-100 text-green-800', failed_delivery: 'bg-red-100 text-red-800',
  returned_to_sender: 'bg-gray-200 text-gray-800', rescheduled: 'bg-cyan-100 text-cyan-800',
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

function Icon({ name, className = '' }) {
  const icons = {
    total: <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M20.25 7.5l-.625 10.632a2.25 2.25 0 01-2.247 2.118H6.622a2.25 2.25 0 01-2.247-2.118L3.75 7.5M10 11.25h4M3.375 7.5h17.25c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125z" /></svg>,
    delivered: <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>,
    transit: <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M8.25 18.75a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h6m-9 0H3.375a1.125 1.125 0 01-1.125-1.125V14.25m17.25 4.5a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0H21a.75.75 0 00.75-.75V11.25a3 3 0 00-3-3h-1.5l-1.72-4.575A1.5 1.5 0 0014.925 3H9.075a1.5 1.5 0 00-1.425 1.05L5.925 8.25H4.5A3 3 0 001.5 11.25v6.375c0 .621.504 1.125 1.125 1.125h3" /></svg>,
    cod: <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M12 6v12m-3-2.818l.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006 0l.415.33M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>,
    failed: <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" /></svg>,
    search: <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" /></svg>,
    arrow: <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" /></svg>,
    close: <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>,
    package: <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M20.25 7.5l-.625 10.632a2.25 2.25 0 01-2.247 2.118H6.622a2.25 2.25 0 01-2.247-2.118L3.75 7.5m8.25 3v6.75m0 0l-3-3m3 3l3-3M3.375 7.5h17.25c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125z" /></svg>,
    refresh: <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182" /></svg>,
  };
  return icons[name] || null;
}

export default function ClientDashboard() {
  const [tab, setTab] = useState('dashboard');
  const [profile, setProfile] = useState(null);
  const [shipments, setShipments] = useState([]);
  const [invoices, setInvoices] = useState([]);
  const [trackingDetail, setTrackingDetail] = useState(null);
  const [loadingTracking, setLoadingTracking] = useState(false);
  const [trackSearch, setTrackSearch] = useState('');
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

  const handleTrackSearch = (e) => {
    e.preventDefault();
    if (trackSearch.trim()) {
      viewTracking(trackSearch.trim());
      setTrackSearch('');
    }
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
      if (res.ok) {
        const updated = await res.json();
        setProfile(updated);
        sessionStorage.setItem('client_user', JSON.stringify(updated));
        setProfileMsg('Profile updated');
      }
      else { setProfileMsg('Failed to update'); }
    } catch (err) { setProfileMsg(err.message); } finally { setProfileSaving(false); }
  };

  const handleLogout = () => {
    sessionStorage.removeItem('client_token');
    sessionStorage.removeItem('client_user');
    navigate('/client');
  };

  const totalCOD = shipments.reduce((sum, s) => sum + parseFloat(s.cod_amount || 0), 0);
  const pendingCOD = shipments.filter(s => s.payment_status === 'cod' && s.status !== 'delivered').reduce((sum, s) => sum + parseFloat(s.cod_amount || 0), 0);
  const inTransit = shipments.filter(s => !['delivered','returned_to_sender','failed_delivery'].includes(s.status)).length;
  const delivered = shipments.filter(s => s.status === 'delivered').length;
  const failed = shipments.filter(s => s.status === 'failed_delivery').length;

  const statusCounts = {};
  shipments.forEach(s => { statusCounts[s.status] = (statusCounts[s.status] || 0) + 1; });
  const maxCount = Math.max(...Object.values(statusCounts), 1);

  const tabs = [
    { id: 'dashboard', label: 'Dashboard' },
    { id: 'pickup', label: 'Request Pickup' },
    { id: 'history', label: 'History' },
    { id: 'invoices', label: 'Invoices' },
    { id: 'profile', label: 'Profile' },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-40">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 bg-teal-500 rounded-lg flex items-center justify-center">
                <Icon name="package" className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-sm font-bold text-gray-900 leading-tight">Straight Way Couriers</h1>
                <p className="text-[11px] text-gray-400">Client Portal</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="hidden sm:flex items-center gap-2 text-sm text-gray-500">
                <div className="w-8 h-8 bg-teal-100 rounded-full flex items-center justify-center text-teal-600 font-bold text-xs">
                  {(profile?.contact_person || 'U')[0].toUpperCase()}
                </div>
                <span className="font-medium">{profile?.contact_person || profile?.company_name}</span>
              </div>
              <button onClick={handleLogout} className="px-3 py-1.5 bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200 text-xs font-medium transition-colors">Logout</button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Tabs */}
        <div className="flex gap-1 mb-6 overflow-x-auto pb-1">
          {tabs.map(t => (
            <button key={t.id} onClick={() => setTab(t.id)}
              className={`px-4 py-2.5 text-sm font-medium rounded-lg whitespace-nowrap transition-all ${tab === t.id ? 'bg-teal-500 text-white shadow-sm shadow-teal-200' : 'text-gray-500 hover:text-gray-800 hover:bg-white'}`}>
              {t.label}
            </button>
          ))}
        </div>

        {/* Dashboard Tab */}
        {tab === 'dashboard' && (
          <div className="space-y-6">
            {/* Tracking Search */}
            <form onSubmit={handleTrackSearch} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 flex gap-3">
              <div className="relative flex-1">
                <Icon name="search" className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input type="text" value={trackSearch} onChange={(e) => setTrackSearch(e.target.value)}
                  placeholder="Track a parcel — enter tracking number..."
                  className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent" />
              </div>
              <button type="submit" className="px-5 py-3 bg-teal-500 text-white rounded-xl text-sm font-semibold hover:bg-teal-600 transition-colors flex items-center gap-2">
                <Icon name="search" className="w-4 h-4" /> Track
              </button>
            </form>

            {/* Stat Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 hover:shadow-md transition-shadow">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center"><Icon name="total" className="w-5 h-5 text-blue-500" /></div>
                </div>
                <p className="text-2xl font-bold text-gray-900">{shipments.length}</p>
                <p className="text-xs text-gray-400 mt-0.5">Total Shipments</p>
              </div>
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 hover:shadow-md transition-shadow">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 bg-green-50 rounded-xl flex items-center justify-center"><Icon name="delivered" className="w-5 h-5 text-green-500" /></div>
                </div>
                <p className="text-2xl font-bold text-gray-900">{delivered}</p>
                <p className="text-xs text-gray-400 mt-0.5">Delivered</p>
              </div>
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 hover:shadow-md transition-shadow">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 bg-amber-50 rounded-xl flex items-center justify-center"><Icon name="transit" className="w-5 h-5 text-amber-500" /></div>
                </div>
                <p className="text-2xl font-bold text-gray-900">{inTransit}</p>
                <p className="text-xs text-gray-400 mt-0.5">In Transit</p>
              </div>
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 hover:shadow-md transition-shadow">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 bg-teal-50 rounded-xl flex items-center justify-center"><Icon name="cod" className="w-5 h-5 text-teal-500" /></div>
                </div>
                <p className="text-2xl font-bold text-gray-900">LKR {totalCOD.toLocaleString()}</p>
                <p className="text-xs text-gray-400 mt-0.5">Total COD</p>
              </div>
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 hover:shadow-md transition-shadow">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 bg-red-50 rounded-xl flex items-center justify-center"><Icon name="failed" className="w-5 h-5 text-red-500" /></div>
                </div>
                <p className="text-2xl font-bold text-gray-900">{failed}</p>
                <p className="text-xs text-gray-400 mt-0.5">Failed</p>
              </div>
            </div>

            {/* Status Distribution + Quick Actions */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Status Distribution */}
              <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                <h3 className="font-semibold text-gray-900 mb-4">Shipment Status</h3>
                {Object.keys(statusCounts).length > 0 ? (
                  <div className="space-y-3">
                    {Object.entries(statusCounts).sort((a,b) => b[1] - a[1]).map(([status, count]) => (
                      <div key={status} className="flex items-center gap-3">
                        <span className="text-xs text-gray-500 w-36 truncate">{statusLabels[status] || status}</span>
                        <div className="flex-1 bg-gray-100 rounded-full h-5 overflow-hidden">
                          <div className="h-full rounded-full bg-gradient-to-r from-teal-400 to-teal-500 transition-all duration-500"
                            style={{ width: `${(count / maxCount) * 100}%` }} />
                        </div>
                        <span className="text-sm font-semibold text-gray-700 w-8 text-right">{count}</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-gray-400 py-8 text-center">No shipments yet. Request your first pickup!</p>
                )}
              </div>

              {/* Quick Actions */}
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                <h3 className="font-semibold text-gray-900 mb-4">Quick Actions</h3>
                <div className="space-y-3">
                  <button onClick={() => setTab('pickup')} className="w-full flex items-center gap-3 p-3 bg-teal-50 hover:bg-teal-100 rounded-xl transition-colors text-left group">
                    <div className="w-10 h-10 bg-teal-500 rounded-xl flex items-center justify-center group-hover:scale-105 transition-transform">
                      <Icon name="package" className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-gray-900">New Pickup</p>
                      <p className="text-xs text-gray-400">Request a parcel pickup</p>
                    </div>
                    <Icon name="arrow" className="w-4 h-4 text-gray-300 ml-auto" />
                  </button>
                  <button onClick={() => setTab('history')} className="w-full flex items-center gap-3 p-3 bg-gray-50 hover:bg-gray-100 rounded-xl transition-colors text-left group">
                    <div className="w-10 h-10 bg-gray-200 rounded-xl flex items-center justify-center group-hover:scale-105 transition-transform">
                      <Icon name="refresh" className="w-5 h-5 text-gray-500" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-gray-900">View History</p>
                      <p className="text-xs text-gray-400">All your shipments</p>
                    </div>
                    <Icon name="arrow" className="w-4 h-4 text-gray-300 ml-auto" />
                  </button>
                  <button onClick={() => setTab('invoices')} className="w-full flex items-center gap-3 p-3 bg-gray-50 hover:bg-gray-100 rounded-xl transition-colors text-left group">
                    <div className="w-10 h-10 bg-gray-200 rounded-xl flex items-center justify-center group-hover:scale-105 transition-transform">
                      <Icon name="cod" className="w-5 h-5 text-gray-500" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-gray-900">Invoices</p>
                      <p className="text-xs text-gray-400">View charges & payments</p>
                    </div>
                    <Icon name="arrow" className="w-4 h-4 text-gray-300 ml-auto" />
                  </button>
                </div>
              </div>
            </div>

            {/* COD Pending Banner */}
            {pendingCOD > 0 && (
              <div className="bg-gradient-to-r from-amber-500 to-orange-500 rounded-2xl p-5 text-white flex items-center gap-4">
                <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center flex-shrink-0">
                  <Icon name="cod" className="w-6 h-6 text-white" />
                </div>
                <div className="flex-1">
                  <p className="font-semibold">Pending COD Collection</p>
                  <p className="text-sm text-white/80">LKR {pendingCOD.toLocaleString()} awaiting collection from delivered parcels</p>
                </div>
              </div>
            )}

            {/* Recent Shipments */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100">
              <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
                <h3 className="font-semibold text-gray-900">Recent Shipments</h3>
                {shipments.length > 5 && (
                  <button onClick={() => setTab('history')} className="text-xs text-teal-600 font-medium hover:text-teal-700">View All</button>
                )}
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50 text-gray-500">
                    <tr>
                      <th className="text-left px-6 py-3 font-medium text-xs uppercase tracking-wider">Tracking #</th>
                      <th className="text-left px-6 py-3 font-medium text-xs uppercase tracking-wider">Receiver</th>
                      <th className="text-left px-6 py-3 font-medium text-xs uppercase tracking-wider">Destination</th>
                      <th className="text-left px-6 py-3 font-medium text-xs uppercase tracking-wider">Status</th>
                      <th className="text-left px-6 py-3 font-medium text-xs uppercase tracking-wider">COD</th>
                      <th className="text-left px-6 py-3 font-medium text-xs uppercase tracking-wider">Date</th>
                      <th className="text-left px-6 py-3 font-medium text-xs uppercase tracking-wider"></th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {shipments.slice(0, 5).map(s => (
                      <tr key={s.id} className="hover:bg-gray-50/50 transition-colors">
                        <td className="px-6 py-3.5 font-semibold text-teal-600">{s.tracking_number}</td>
                        <td className="px-6 py-3.5 text-gray-600">{s.receiver_name}</td>
                        <td className="px-6 py-3.5 text-gray-500 text-xs max-w-[150px] truncate">{s.destination}</td>
                        <td className="px-6 py-3.5">
                          <span className={`inline-block px-2.5 py-1 rounded-lg text-xs font-semibold ${statusColors[s.status] || 'bg-gray-100'}`}>
                            {statusLabels[s.status] || s.status}
                          </span>
                        </td>
                        <td className="px-6 py-3.5 text-gray-600 font-medium">{s.cod_amount > 0 ? `LKR ${parseFloat(s.cod_amount).toLocaleString()}` : '-'}</td>
                        <td className="px-6 py-3.5 text-xs text-gray-400">{new Date(s.created_at).toLocaleDateString()}</td>
                        <td className="px-6 py-3.5">
                          <button onClick={() => viewTracking(s.tracking_number)}
                            className="px-3 py-1.5 bg-teal-50 text-teal-600 rounded-lg text-xs font-semibold hover:bg-teal-100 transition-colors">Track</button>
                        </td>
                      </tr>
                    ))}
                    {shipments.length === 0 && (
                      <tr><td colSpan={7} className="px-6 py-16 text-center">
                        <div className="flex flex-col items-center gap-3">
                          <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center"><Icon name="package" className="w-8 h-8 text-gray-300" /></div>
                          <p className="text-gray-400 text-sm">No shipments yet</p>
                          <button onClick={() => setTab('pickup')} className="px-4 py-2 bg-teal-500 text-white rounded-lg text-sm font-semibold hover:bg-teal-600">Request First Pickup</button>
                        </div>
                      </td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* Pickup Request Tab */}
        {tab === 'pickup' && (
          <div className="max-w-2xl">
            {submitted ? (
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-12 text-center">
                <div className="w-20 h-20 bg-green-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <Icon name="delivered" className="w-10 h-10 text-green-500" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">Pickup Request Submitted!</h3>
                <p className="text-gray-500 text-sm mb-6 max-w-sm mx-auto">We'll contact you shortly to confirm your pickup. You can track the status from your dashboard.</p>
                <div className="flex gap-3 justify-center">
                  <button onClick={() => { setSubmitted(false); setTab('dashboard'); }} className="px-5 py-2.5 bg-gray-100 text-gray-700 rounded-xl text-sm font-medium hover:bg-gray-200 transition-colors">Back to Dashboard</button>
                  <button onClick={() => setSubmitted(false)} className="px-5 py-2.5 bg-teal-500 text-white rounded-xl text-sm font-semibold hover:bg-teal-600 transition-colors">Request Another</button>
                </div>
              </div>
            ) : (
              <form onSubmit={handlePickupRequest} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 space-y-5">
                <div>
                  <h3 className="font-semibold text-gray-900 text-lg">New Pickup Request</h3>
                  <p className="text-sm text-gray-400 mt-1">Fill in the details below to request a pickup</p>
                </div>

                <div className="bg-gray-50 rounded-xl p-4 space-y-4">
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Sender Details</p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Your Name *</label>
                      <input type="text" required value={form.sender_name} onChange={(e) => setForm({...form, sender_name: e.target.value})} className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 bg-white" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Your Phone *</label>
                      <input type="text" required value={form.sender_phone} onChange={(e) => setForm({...form, sender_phone: e.target.value})} className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 bg-white" />
                    </div>
                    <div className="sm:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-1">Pickup Address</label>
                      <input type="text" value={form.sender_address} onChange={(e) => setForm({...form, sender_address: e.target.value})} className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 bg-white" />
                    </div>
                  </div>
                </div>

                <div className="bg-gray-50 rounded-xl p-4 space-y-4">
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Receiver Details</p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Receiver Name *</label>
                      <input type="text" required value={form.receiver_name} onChange={(e) => setForm({...form, receiver_name: e.target.value})} className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 bg-white" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Receiver Phone *</label>
                      <input type="text" required value={form.receiver_phone} onChange={(e) => setForm({...form, receiver_phone: e.target.value})} className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 bg-white" />
                    </div>
                    <div className="sm:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-1">Delivery Address</label>
                      <input type="text" value={form.receiver_address} onChange={(e) => setForm({...form, receiver_address: e.target.value})} className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 bg-white" />
                    </div>
                  </div>
                </div>

                <div className="bg-gray-50 rounded-xl p-4 space-y-4">
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Parcel Details</p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Parcel Type</label>
                      <input type="text" placeholder="e.g. Document, Package" value={form.parcel_type} onChange={(e) => setForm({...form, parcel_type: e.target.value})} className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 bg-white" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Weight</label>
                      <input type="text" placeholder="e.g. 2 kg" value={form.weight} onChange={(e) => setForm({...form, weight: e.target.value})} className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 bg-white" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Delivery Type</label>
                      <input type="text" placeholder="e.g. Standard, Express" value={form.delivery_type} onChange={(e) => setForm({...form, delivery_type: e.target.value})} className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 bg-white" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">COD Amount (LKR)</label>
                      <input type="text" inputMode="decimal" placeholder="0.00" value={form.cod_amount} onChange={(e) => setForm({...form, cod_amount: e.target.value})} className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 bg-white" />
                    </div>
                  </div>
                </div>

                <button type="submit" disabled={submitting} className="w-full px-6 py-3 bg-teal-500 text-white rounded-xl text-sm font-semibold hover:bg-teal-600 transition-colors disabled:opacity-50">
                  {submitting ? 'Submitting...' : 'Request Pickup'}
                </button>
              </form>
            )}
          </div>
        )}

        {/* History Tab */}
        {tab === 'history' && (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100">
              <h3 className="font-semibold text-gray-900">Shipment History</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 text-gray-500">
                  <tr>
                    <th className="text-left px-6 py-3 font-medium text-xs uppercase tracking-wider">Tracking #</th>
                    <th className="text-left px-6 py-3 font-medium text-xs uppercase tracking-wider">Receiver</th>
                    <th className="text-left px-6 py-3 font-medium text-xs uppercase tracking-wider">Destination</th>
                    <th className="text-left px-6 py-3 font-medium text-xs uppercase tracking-wider">Status</th>
                    <th className="text-left px-6 py-3 font-medium text-xs uppercase tracking-wider">Weight</th>
                    <th className="text-right px-6 py-3 font-medium text-xs uppercase tracking-wider">COD</th>
                    <th className="text-left px-6 py-3 font-medium text-xs uppercase tracking-wider">Date</th>
                    <th className="text-left px-6 py-3 font-medium text-xs uppercase tracking-wider"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {shipments.map(s => (
                    <tr key={s.id} className="hover:bg-gray-50/50 transition-colors">
                      <td className="px-6 py-3.5 font-semibold text-teal-600">{s.tracking_number}</td>
                      <td className="px-6 py-3.5 text-gray-600">{s.receiver_name}</td>
                      <td className="px-6 py-3.5 text-gray-500 text-xs max-w-[150px] truncate">{s.destination}</td>
                      <td className="px-6 py-3.5">
                        <span className={`inline-block px-2.5 py-1 rounded-lg text-xs font-semibold ${statusColors[s.status] || 'bg-gray-100'}`}>
                          {statusLabels[s.status] || s.status}
                        </span>
                      </td>
                      <td className="px-6 py-3.5 text-gray-500">{s.weight || '-'}</td>
                      <td className="px-6 py-3.5 text-right font-medium">{s.cod_amount > 0 ? `LKR ${parseFloat(s.cod_amount).toLocaleString()}` : '-'}</td>
                      <td className="px-6 py-3.5 text-xs text-gray-400">{new Date(s.created_at).toLocaleDateString()}</td>
                      <td className="px-6 py-3.5">
                        <button onClick={() => viewTracking(s.tracking_number)}
                          className="px-3 py-1.5 bg-teal-50 text-teal-600 rounded-lg text-xs font-semibold hover:bg-teal-100 transition-colors">Track</button>
                      </td>
                    </tr>
                  ))}
                  {shipments.length === 0 && <tr><td colSpan={8} className="px-6 py-16 text-center text-gray-400">No shipment history.</td></tr>}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Invoices Tab */}
        {tab === 'invoices' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
                <p className="text-xs text-gray-400 mb-1">Total Invoices</p>
                <p className="text-2xl font-bold text-gray-900">{invoices.length}</p>
              </div>
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
                <p className="text-xs text-gray-400 mb-1">Total COD</p>
                <p className="text-2xl font-bold text-teal-600">LKR {invoices.reduce((s,i) => s + parseFloat(i.cod_amount || 0), 0).toLocaleString()}</p>
              </div>
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
                <p className="text-xs text-gray-400 mb-1">Total Charges</p>
                <p className="text-2xl font-bold text-gray-900">LKR {invoices.reduce((s,i) => s + parseFloat(i.delivery_charge || 0), 0).toLocaleString()}</p>
              </div>
            </div>
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-100">
                <h3 className="font-semibold text-gray-900">All Invoices</h3>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50 text-gray-500">
                    <tr>
                      <th className="text-left px-6 py-3 font-medium text-xs uppercase tracking-wider">Tracking #</th>
                      <th className="text-right px-6 py-3 font-medium text-xs uppercase tracking-wider">Charge</th>
                      <th className="text-right px-6 py-3 font-medium text-xs uppercase tracking-wider">COD Amount</th>
                      <th className="text-left px-6 py-3 font-medium text-xs uppercase tracking-wider">Payment</th>
                      <th className="text-left px-6 py-3 font-medium text-xs uppercase tracking-wider">Delivery</th>
                      <th className="text-left px-6 py-3 font-medium text-xs uppercase tracking-wider">Date</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {invoices.map(s => (
                      <tr key={s.tracking_number} className="hover:bg-gray-50/50 transition-colors">
                        <td className="px-6 py-3.5 font-semibold text-teal-600">{s.tracking_number}</td>
                        <td className="px-6 py-3.5 text-right font-medium">{s.delivery_charge > 0 ? `LKR ${parseFloat(s.delivery_charge).toLocaleString()}` : '-'}</td>
                        <td className="px-6 py-3.5 text-right font-medium">{s.cod_amount > 0 ? `LKR ${parseFloat(s.cod_amount).toLocaleString()}` : '-'}</td>
                        <td className="px-6 py-3.5">
                          <span className={`inline-block px-2.5 py-1 rounded-lg text-xs font-semibold ${s.payment_status === 'paid' ? 'bg-green-100 text-green-800' : s.payment_status === 'cod' ? 'bg-blue-100 text-blue-800' : 'bg-yellow-100 text-yellow-800'}`}>
                            {s.payment_status}
                          </span>
                        </td>
                        <td className="px-6 py-3.5">
                          <span className={`inline-block px-2.5 py-1 rounded-lg text-xs font-semibold ${statusColors[s.status] || 'bg-gray-100'}`}>
                            {statusLabels[s.status] || s.status}
                          </span>
                        </td>
                        <td className="px-6 py-3.5 text-xs text-gray-400">{new Date(s.created_at).toLocaleDateString()}</td>
                      </tr>
                    ))}
                    {invoices.length === 0 && <tr><td colSpan={6} className="px-6 py-16 text-center text-gray-400">No invoices yet.</td></tr>}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* Profile Tab */}
        {tab === 'profile' && (
          <div className="max-w-lg">
            <form onSubmit={handleProfileSave} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 space-y-5">
              <div>
                <h3 className="font-semibold text-gray-900 text-lg">Company Profile</h3>
                <p className="text-sm text-gray-400 mt-1">Update your account information</p>
              </div>
              {profileMsg && (
                <div className={`p-3 rounded-xl text-sm font-medium ${profileMsg === 'Profile updated' ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-red-50 text-red-700 border border-red-200'}`}>
                  {profileMsg}
                </div>
              )}
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Company Name</label>
                  <input type="text" value={profileForm.company_name} onChange={(e) => setProfileForm({...profileForm, company_name: e.target.value})}
                    className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-500" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Contact Person *</label>
                  <input type="text" required value={profileForm.contact_person} onChange={(e) => setProfileForm({...profileForm, contact_person: e.target.value})}
                    className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-500" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Phone *</label>
                  <input type="text" required value={profileForm.phone} onChange={(e) => setProfileForm({...profileForm, phone: e.target.value})}
                    className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-500" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                  <input type="email" value={profileForm.email} onChange={(e) => setProfileForm({...profileForm, email: e.target.value})}
                    className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-500" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
                  <input type="text" value={profileForm.address} onChange={(e) => setProfileForm({...profileForm, address: e.target.value})}
                    className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-500" />
                </div>
              </div>
              <button type="submit" disabled={profileSaving}
                className="px-6 py-2.5 bg-teal-500 text-white text-sm font-semibold rounded-xl hover:bg-teal-600 disabled:opacity-50 transition-colors">
                {profileSaving ? 'Saving...' : 'Save Changes'}
              </button>
            </form>
          </div>
        )}
      </div>

      {/* Tracking Detail Modal */}
      {trackingDetail && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 px-4" onClick={() => setTrackingDetail(null)}>
          <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full max-h-[85vh] overflow-hidden" onClick={e => e.stopPropagation()}>
            <div className="bg-gradient-to-r from-teal-500 to-teal-600 px-6 py-5 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-bold">{trackingDetail.shipment.tracking_number}</h3>
                  <p className="text-sm text-white/70">{trackingDetail.shipment.receiver_name} → {trackingDetail.shipment.destination}</p>
                </div>
                <button onClick={() => setTrackingDetail(null)} className="p-1.5 bg-white/20 rounded-lg hover:bg-white/30 transition-colors">
                  <Icon name="close" className="w-5 h-5 text-white" />
                </button>
              </div>
              {/* Progress Bar */}
              {!loadingTracking && (
                <div className="mt-4 flex gap-1">
                  {statusOrder.map((st, i) => {
                    const currentIdx = statusOrder.indexOf(trackingDetail.shipment.status);
                    const isActive = i <= currentIdx && currentIdx >= 0;
                    return <div key={st} className={`h-1.5 flex-1 rounded-full transition-all ${isActive ? 'bg-white' : 'bg-white/30'}`} />;
                  })}
                </div>
              )}
            </div>
            <div className="p-6 overflow-y-auto max-h-[60vh]">
              {loadingTracking ? (
                <p className="text-center text-gray-400 py-12">Loading tracking info...</p>
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
                          {event.description && <p className="text-sm text-gray-500 mt-0.5">{event.description}</p>}
                          {event.staff_name && <p className="text-xs text-gray-400 mt-1">By: {event.staff_name}</p>}
                          <p className="text-xs text-gray-400 mt-1">{new Date(event.timestamp).toLocaleString()}</p>
                        </div>
                      </div>
                    );
                  })}
                  {(!trackingDetail.events || trackingDetail.events.length === 0) && (
                    <p className="text-center text-gray-400 py-12">No tracking events yet.</p>
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
