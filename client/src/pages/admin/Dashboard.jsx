import { useState, useEffect, useMemo } from 'react';
import { useNavigate, useLocation, Routes, Route, Navigate } from 'react-router-dom';
import ShipmentForm from './ShipmentForm';
import Clients from './Clients';
import Pickups from './Pickups';
import DocketEntry from './DocketEntry';
import Deliveries from './Deliveries';
import COD from './COD';
import Reports from './Reports';
import StaffManagement from './StaffManagement';
import DeliverySheet from './DeliverySheet';
import Waybill from '../../components/Waybill';
import Messages from './Messages';

const API = '/api/admin';

const navSections = [
  {
    label: 'Overview',
    items: [
      { id: '', label: 'Dashboard', icon: <svg className="w-[18px] h-[18px]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.7}><path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6A2.25 2.25 0 016 3.75h2.25A2.25 2.25 0 0110.5 6v2.25a2.25 2.25 0 01-2.25 2.25H6a2.25 2.25 0 01-2.25-2.25V6zM3.75 15.75A2.25 2.25 0 016 13.5h2.25a2.25 2.25 0 012.25 2.25V18a2.25 2.25 0 01-2.25 2.25H6A2.25 2.25 0 013.75 18v-2.25zM13.5 6a2.25 2.25 0 012.25-2.25H18A2.25 2.25 0 0120.25 6v2.25A2.25 2.25 0 0118 10.5h-2.25a2.25 2.25 0 01-2.25-2.25V6zM13.5 15.75a2.25 2.25 0 012.25-2.25H18a2.25 2.25 0 012.25 2.25V18A2.25 2.25 0 0118 20.25h-2.25A2.25 2.25 0 0113.5 18v-2.25z" /></svg> },
    ],
  },
  {
    label: 'Operations',
    items: [
      { id: 'docket-entry', label: 'Docket Entry', icon: <svg className="w-[18px] h-[18px]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.7}><path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" /></svg> },
      { id: 'pickups', label: 'Pickups', icon: <svg className="w-[18px] h-[18px]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.7}><path strokeLinecap="round" strokeLinejoin="round" d="M8.25 18.75a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h6m-9 0H3.375a1.125 1.125 0 01-1.125-1.125V14.25m17.25 4.5a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0H21a.75.75 0 00.75-.75V11.25a3 3 0 00-3-3h-1.5l-1.72-4.575A1.5 1.5 0 0014.925 3H9.075a1.5 1.5 0 00-1.425 1.05L5.925 8.25H4.5A3 3 0 001.5 11.25v6.375c0 .621.504 1.125 1.125 1.125h3" /></svg> },
      { id: 'deliveries', label: 'Deliveries', icon: <svg className="w-[18px] h-[18px]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.7}><path strokeLinecap="round" strokeLinejoin="round" d="M8.25 18.75a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h6m-9 0H3.375a1.125 1.125 0 01-1.125-1.125V14.25m17.25 4.5a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0H21a.75.75 0 00.75-.75V11.25a3 3 0 00-3-3h-1.5l-1.72-4.575A1.5 1.5 0 0014.925 3H9.075a1.5 1.5 0 00-1.425 1.05L5.925 8.25H4.5A3 3 0 001.5 11.25v6.375c0 .621.504 1.125 1.125 1.125h3" /></svg> },
      { id: 'delivery-sheet', label: 'Delivery Sheet', icon: <svg className="w-[18px] h-[18px]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.7}><path strokeLinecap="round" strokeLinejoin="round" d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 002.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 00-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 00.75-.75 2.25 2.25 0 00-.1-.664m-5.8 0A2.251 2.251 0 0113.5 2.25H15a2.25 2.25 0 012.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25z" /></svg> },
      { id: 'cod', label: 'COD Tracking', icon: <svg className="w-[18px] h-[18px]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.7}><path strokeLinecap="round" strokeLinejoin="round" d="M12 6v12m-3-2.818l.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006 0l.415.33M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg> },
    ],
  },
  {
    label: 'Management',
    items: [
      { id: 'clients', label: 'Clients', icon: <svg className="w-[18px] h-[18px]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.7}><path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" /></svg> },
      { id: 'staff', label: 'Staff', icon: <svg className="w-[18px] h-[18px]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.7}><path strokeLinecap="round" strokeLinejoin="round" d="M20.25 14.15v4.25c0 1.094-.787 2.036-1.872 2.18-2.087.277-4.216.42-6.378.42s-4.291-.143-6.378-.42c-1.085-.144-1.872-1.086-1.872-2.18v-4.25m16.5 0a2.18 2.18 0 00.75-1.661V8.706c0-1.081-.768-2.015-1.837-2.175a48.114 48.114 0 00-3.413-.387m4.5 8.006c-.194.165-.42.295-.673.38A23.978 23.978 0 0112 15.75c-2.648 0-5.195-.429-7.577-1.22a2.016 2.016 0 01-.673-.38m0 0A2.18 2.18 0 013 12.489V8.706c0-1.081.768-2.015 1.837-2.175a48.111 48.111 0 013.413-.387m7.5 0V5.25A2.25 2.25 0 0013.5 3h-3a2.25 2.25 0 00-2.25 2.25v.894m7.5 0a48.667 48.667 0 00-7.5 0M12 12.75h.008v.008H12v-.008z" /></svg> },
    ],
  },
  {
    label: 'Insights',
    items: [
      { id: 'reports', label: 'Reports', icon: <svg className="w-[18px] h-[18px]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.7}><path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z" /></svg> },
      { id: 'messages', label: 'Messages', icon: <svg className="w-[18px] h-[18px]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.7}><path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" /></svg> },
    ],
  },
];

const statusColors = {
  pending_scan: 'bg-slate-100 text-slate-700 ring-1 ring-slate-200',
  pickup_requested: 'bg-amber-50 text-amber-700 ring-1 ring-amber-200',
  picked_up: 'bg-orange-50 text-orange-700 ring-1 ring-orange-200',
  at_sorting_center: 'bg-violet-50 text-violet-700 ring-1 ring-violet-200',
  sorted: 'bg-indigo-50 text-indigo-700 ring-1 ring-indigo-200',
  out_for_delivery: 'bg-blue-50 text-blue-700 ring-1 ring-blue-200',
  customer_contacted: 'bg-teal-50 text-teal-700 ring-1 ring-teal-200',
  delivered: 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200',
  failed_delivery: 'bg-red-50 text-red-700 ring-1 ring-red-200',
  returned_to_sender: 'bg-gray-100 text-gray-700 ring-1 ring-gray-200',
  rescheduled: 'bg-cyan-50 text-cyan-700 ring-1 ring-cyan-200',
};

const quotes = [
  'Every delivery is a promise kept.',
  'Your dedication moves the world forward.',
  'Speed, accuracy, care — the Straightway standard.',
  'Behind every tracking number is a customer counting on you.',
  'Excellence isn\'t an act, it\'s a habit.',
  'Logistics is the art of making the impossible, possible.',
  'A smooth delivery today builds trust for tomorrow.',
];

export default function AdminDashboard() {
  const location = useLocation();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [currentQuote, setCurrentQuote] = useState(0);

  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);
  const [stats, setStats] = useState(null);
  const [shipments, setShipments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [trackData, setTrackData] = useState(null);
  const [trackLoading, setTrackLoading] = useState(false);
  const [waybillShipment, setWaybillShipment] = useState(null);

  let adminName = 'Admin';
  try {
    const t = sessionStorage.getItem('swc_token');
    if (t) adminName = JSON.parse(atob(t.split('.')[1])).username;
  } catch {}

  useEffect(() => {
    const qi = setInterval(() => setCurrentQuote(q => (q + 1) % quotes.length), 8000);
    const ti = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => { clearInterval(qi); clearInterval(ti); };
  }, []);

  const getToken = () => sessionStorage.getItem('swc_token');

  const activeTab = useMemo(() => {
    const path = location.pathname.replace('/admin/dashboard', '').replace(/^\//, '');
    return path || '';
  }, [location.pathname]);

  const handleNav = (id) => {
    navigate(`/admin/dashboard/${id}`);
    setSidebarOpen(false);
    setShowForm(false);
    setEditing(null);
    setTrackData(null);
    setWaybillShipment(null);
  };

  useEffect(() => {
    if (activeTab === '') { fetchStats(); fetchShipments(); }
  }, [activeTab]);

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

  const greet = () => {
    const h = currentTime.getHours();
    if (h < 12) return 'Good morning';
    if (h < 17) return 'Good afternoon';
    return 'Good evening';
  };

  const dateStr = currentTime.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
  const timeStr = currentTime.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit' });

  const tabLabel = useMemo(() => {
    if (!activeTab) return 'Dashboard';
    for (const section of navSections) {
      for (const item of section.items) {
        if (item.id === activeTab) return item.label;
      }
    }
    return activeTab.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
  }, [activeTab]);

  const statCards = stats ? [
    { label: 'Total Orders', value: stats.total, iconBg: 'bg-blue-500/10', icon: <svg className="w-5 h-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.7}><path strokeLinecap="round" strokeLinejoin="round" d="M20.25 7.5l-.625 10.632a2.25 2.25 0 01-2.247 2.118H6.622a2.25 2.25 0 01-2.247-2.118L3.75 7.5M10 11.25h4M3.375 7.5h17.25c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125z" /></svg> },
    { label: "Today's Orders", value: stats.today, iconBg: 'bg-amber-500/10', icon: <svg className="w-5 h-5 text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.7}><path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" /></svg> },
    { label: 'Delivered', value: stats.delivered, iconBg: 'bg-emerald-500/10', icon: <svg className="w-5 h-5 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.7}><path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg> },
    { label: 'Pending Scan', value: stats.pendingScan || 0, iconBg: 'bg-slate-500/10', icon: <svg className="w-5 h-5 text-slate-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.7}><path strokeLinecap="round" strokeLinejoin="round" d="M3.75 4.875c0-.621.504-1.125 1.125-1.125h4.5c.621 0 1.125.504 1.125 1.125v4.5c0 .621-.504 1.125-1.125 1.125h-4.5A1.125 1.125 0 013.75 9.375v-4.5z" /><path strokeLinecap="round" strokeLinejoin="round" d="M3.75 14.625c0-.621.504-1.125 1.125-1.125h4.5c.621 0 1.125.504 1.125 1.125v4.5c0 .621-.504 1.125-1.125 1.125h-4.5a1.125 1.125 0 01-1.125-1.125v-4.5z" /><path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.875c0-.621.504-1.125 1.125-1.125h4.5c.621 0 1.125.504 1.125 1.125v4.5c0 .621-.504 1.125-1.125 1.125h-4.5A1.125 1.125 0 0113.5 9.375v-4.5z" /><path strokeLinecap="round" strokeLinejoin="round" d="M6.75 6.75h.008v.008H6.75V6.75zm0 10.5h.008v.008H6.75v-.008zm0-5.25h.008v.008H6.75V12z" /></svg> },
    { label: 'At Sorting', value: stats.atSorting, iconBg: 'bg-violet-500/10', icon: <svg className="w-5 h-5 text-violet-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.7}><path strokeLinecap="round" strokeLinejoin="round" d="M3.75 21h16.5M4.5 3h15M5.25 3v18m13.5-18v18M9 6.75h1.5m-1.5 3h1.5m-1.5 3h1.5m3-6H15m-1.5 3H15m-1.5 3H15M9 21v-3.375c0-.621.504-1.125 1.125-1.125h3.75c.621 0 1.125.504 1.125 1.125V21" /></svg> },
    { label: 'Out for Delivery', value: stats.outForDelivery, iconBg: 'bg-blue-500/10', icon: <svg className="w-5 h-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.7}><path strokeLinecap="round" strokeLinejoin="round" d="M8.25 18.75a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h6m-9 0H3.375a1.125 1.125 0 01-1.125-1.125V14.25m17.25 4.5a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0H21a.75.75 0 00.75-.75V11.25a3 3 0 00-3-3h-1.5l-1.72-4.575A1.5 1.5 0 0014.925 3H9.075a1.5 1.5 0 00-1.425 1.05L5.925 8.25H4.5A3 3 0 001.5 11.25v6.375c0 .621.504 1.125 1.125 1.125h3" /></svg> },
    { label: 'Failed', value: stats.failed, iconBg: 'bg-red-500/10', icon: <svg className="w-5 h-5 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.7}><path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" /></svg> },
    { label: 'Total COD', value: `LKR ${(stats.totalCod || 0).toLocaleString()}`, iconBg: 'bg-cyan-500/10', icon: <svg className="w-5 h-5 text-cyan-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.7}><path strokeLinecap="round" strokeLinejoin="round" d="M12 6v12m-3-2.818l.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006 0l.415.33M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg> },
  ] : [];

  return (
    <div className="flex h-screen bg-[#f8fafc] overflow-hidden font-sans">
      {sidebarOpen && <div className="fixed inset-0 bg-black/30 backdrop-blur-sm z-40 lg:hidden transition-opacity" onClick={() => setSidebarOpen(false)} />}

      {/* Sidebar */}
      <aside className={`fixed lg:static inset-y-0 left-0 z-50 w-[272px] bg-white border-r border-gray-200/80 flex flex-col transition-transform duration-300 ease-out ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}>
        <div className="h-[72px] flex items-center gap-3.5 px-6 border-b border-gray-100">
          <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-blue-500 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-500/20">
            <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M13.5 21v-7.5a.75.75 0 01.75-.75h3a.75.75 0 01.75.75V21m-4.5 0H2.36m11.14 0H18m0 0h3.64m-1.39 0V9.349m-16.5 11.65V9.35m0 0a3.001 3.001 0 003.75-.615A2.993 2.993 0 009.75 9.75c.896 0 1.7-.393 2.25-1.016a2.993 2.993 0 002.25 1.016c.896 0 1.7-.393 2.25-1.016A3.001 3.001 0 0021 9.349" /></svg>
          </div>
          <div>
            <p className="font-bold text-[15px] text-gray-900 tracking-tight leading-none">Straightway</p>
            <p className="text-[10px] text-gray-400 font-semibold uppercase tracking-[0.15em] mt-0.5">Courier System</p>
          </div>
        </div>

        <nav className="flex-1 overflow-y-auto py-5 px-4 space-y-6">
          {navSections.map((section, si) => (
            <div key={si}>
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.15em] px-3 mb-2">{section.label}</p>
              <div className="space-y-0.5">
                {section.items.map(item => (
                  <button key={item.id} onClick={() => handleNav(item.id)}
                    className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-[13px] font-medium transition-all duration-200 ${
                      activeTab === item.id
                        ? 'bg-blue-50 text-blue-700 shadow-sm ring-1 ring-blue-100'
                        : 'text-gray-500 hover:text-gray-800 hover:bg-gray-50'
                    }`}>
                    <span className={`flex-shrink-0 ${activeTab === item.id ? 'text-blue-600' : 'text-gray-400'}`}>{item.icon}</span>
                    {item.label}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </nav>

        <div className="p-4 border-t border-gray-100">
          <div className="flex items-center gap-3 px-3 py-2.5 rounded-xl bg-gray-50/80">
            <div className="w-9 h-9 bg-gradient-to-br from-blue-600 to-blue-500 rounded-xl flex items-center justify-center text-white text-sm font-bold shadow-md shadow-blue-500/20">
              {adminName.charAt(0).toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[13px] font-semibold text-gray-900 truncate capitalize">{adminName}</p>
              <p className="text-[11px] text-gray-400 font-medium">Administrator</p>
            </div>
            <button onClick={handleLogout} className="p-2 text-gray-400 hover:text-red-500 rounded-lg hover:bg-white transition-all" title="Logout">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15m3 0l3-3m0 0l-3-3m3 3H9" /></svg>
            </button>
          </div>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top bar */}
        <header className="h-[72px] bg-white border-b border-gray-200/80 flex items-center justify-between px-5 sm:px-8 flex-shrink-0">
          <div className="flex items-center gap-4">
            <button onClick={() => setSidebarOpen(true)} className="lg:hidden p-2 -ml-2 text-gray-500 hover:bg-gray-100 rounded-xl">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" /></svg>
            </button>
            <div>
              <h1 className="text-xl font-bold text-gray-900 tracking-tight">
                {activeTab === '' ? <>{greet()}, {adminName} <span className="inline-block animate-[wave_1.5s_ease-in-out]">👋</span></> : tabLabel}
              </h1>
              <p className="text-[13px] text-gray-400 mt-0.5 hidden sm:block">{activeTab === '' ? quotes[currentQuote] : `Straightway Courier / ${tabLabel}`}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="hidden md:flex flex-col items-end mr-2">
              <span className="text-sm font-semibold text-gray-700 tabular-nums">{timeStr}</span>
              <span className="text-[11px] text-gray-400 font-medium">{dateStr}</span>
            </div>
            <div className="w-px h-8 bg-gray-200 hidden md:block" />
            <button onClick={() => setShowForm(true)}
              className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-blue-600 to-blue-500 text-white rounded-xl text-sm font-semibold hover:shadow-lg hover:shadow-blue-500/25 transition-all duration-200 active:scale-[0.97]">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" /></svg>
              <span className="hidden sm:inline">New Shipment</span>
            </button>
          </div>
        </header>

        {/* Scrollable content */}
        <main className="flex-1 overflow-y-auto px-5 sm:px-8 py-6">
          {showForm ? (
            <ShipmentForm shipment={editing} onDone={() => { setShowForm(false); setEditing(null); if (activeTab === '') { fetchShipments(); fetchStats(); } }}
              onCancel={() => { setShowForm(false); setEditing(null); }} />
          ) : activeTab === '' ? (
            /* ===== DASHBOARD OVERVIEW ===== */
            <div className="space-y-6">
              {stats && (
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                  {statCards.map((card, i) => (
                    <div key={i} className="bg-white rounded-2xl border border-gray-100 p-5 hover:shadow-lg hover:shadow-gray-100/80 hover:-translate-y-0.5 transition-all duration-300 group cursor-default">
                      <div className="flex items-start justify-between mb-4">
                        <div className={`w-11 h-11 ${card.iconBg} rounded-xl flex items-center justify-center transition-transform group-hover:scale-110 duration-300`}>
                          {card.icon}
                        </div>
                      </div>
                      <p className="text-2xl font-extrabold text-gray-900 tracking-tight leading-none">{card.value}</p>
                      <p className="text-[12px] text-gray-400 font-medium mt-1.5">{card.label}</p>
                    </div>
                  ))}
                </div>
              )}

              {stats && (
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="bg-white rounded-2xl border border-gray-100 p-4 flex items-center gap-3.5 hover:shadow-md transition-shadow">
                    <div className="w-10 h-10 bg-teal-50 rounded-xl flex items-center justify-center">
                      <svg className="w-5 h-5 text-teal-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.7}><path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" /></svg>
                    </div>
                    <div>
                      <p className="text-lg font-bold text-gray-900 leading-none">{stats.totalClients || 0}</p>
                      <p className="text-[11px] text-gray-400 font-medium mt-1">Clients</p>
                    </div>
                  </div>
                  <div className="bg-white rounded-2xl border border-gray-100 p-4 flex items-center gap-3.5 hover:shadow-md transition-shadow">
                    <div className="w-10 h-10 bg-pink-50 rounded-xl flex items-center justify-center">
                      <svg className="w-5 h-5 text-pink-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.7}><path strokeLinecap="round" strokeLinejoin="round" d="M15.75 10.5l4.72-4.72a.75.75 0 011.28.53v11.38a.75.75 0 01-1.28.53l-4.72-4.72M4.5 18.75h9a2.25 2.25 0 002.25-2.25v-9a2.25 2.25 0 00-2.25-2.25h-9A2.25 2.25 0 002.25 7.5v9a2.25 2.25 0 002.25 2.25z" /></svg>
                    </div>
                    <div>
                      <p className="text-lg font-bold text-gray-900 leading-none">{stats.activeRiders || 0}</p>
                      <p className="text-[11px] text-gray-400 font-medium mt-1">Active Riders</p>
                    </div>
                  </div>
                  <div className="bg-white rounded-2xl border border-gray-100 p-4 flex items-center gap-3.5 hover:shadow-md transition-shadow">
                    <div className="w-10 h-10 bg-orange-50 rounded-xl flex items-center justify-center">
                      <svg className="w-5 h-5 text-orange-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.7}><path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" /></svg>
                    </div>
                    <div>
                      <p className="text-lg font-bold text-gray-900 leading-none">{stats.todayPickups || 0}</p>
                      <p className="text-[11px] text-gray-400 font-medium mt-1">Today Pickups</p>
                    </div>
                  </div>
                  <div className="bg-white rounded-2xl border border-gray-100 p-4 flex items-center gap-3.5 hover:shadow-md transition-shadow">
                    <div className="w-10 h-10 bg-emerald-50 rounded-xl flex items-center justify-center">
                      <svg className="w-5 h-5 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.7}><path strokeLinecap="round" strokeLinejoin="round" d="M8.25 18.75a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h6m-9 0H3.375a1.125 1.125 0 01-1.125-1.125V14.25m17.25 4.5a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0H21a.75.75 0 00.75-.75V11.25a3 3 0 00-3-3h-1.5l-1.72-4.575A1.5 1.5 0 0014.925 3H9.075a1.5 1.5 0 00-1.425 1.05L5.925 8.25H4.5A3 3 0 001.5 11.25v6.375c0 .621.504 1.125 1.125 1.125h3" /></svg>
                    </div>
                    <div>
                      <p className="text-lg font-bold text-gray-900 leading-none">{stats.todayDeliveries || 0}</p>
                      <p className="text-[11px] text-gray-400 font-medium mt-1">Today Deliveries</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Shipments */}
              <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
                <div className="px-6 py-5 border-b border-gray-100 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                  <div>
                    <h2 className="text-base font-bold text-gray-900">Recent Shipments</h2>
                    <p className="text-[13px] text-gray-400 mt-0.5">{shipments.length} shipment{shipments.length !== 1 ? 's' : ''} found</p>
                  </div>
                  <form onSubmit={(e) => { e.preventDefault(); fetchShipments(); }} className="flex flex-wrap gap-2">
                    <div className="relative">
                      <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" /></svg>
                      <input type="text" placeholder="Search..." value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="pl-9 pr-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-400 w-48 transition-all" />
                    </div>
                    <select value={statusFilter} onChange={(e) => { setStatusFilter(e.target.value); setTimeout(fetchShipments, 0); }}
                      className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/40 transition-all">
                      <option value="">All Status</option>
                      {['pending_scan','pickup_requested','picked_up','at_sorting_center','sorted','out_for_delivery','customer_contacted','delivered','failed_delivery','returned_to_sender','rescheduled'].map(st => (
                        <option key={st} value={st}>{st.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase())}</option>
                      ))}
                    </select>
                    <input type="date" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm" title="From" />
                    <input type="date" value={dateTo} onChange={(e) => setDateTo(e.target.value)} className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm" title="To" />
                    <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded-xl text-sm font-semibold hover:bg-blue-700 transition-colors">Filter</button>
                    <button type="button" onClick={() => { setSearch(''); setStatusFilter(''); setDateFrom(''); setDateTo(''); fetchShipments(); }}
                      className="px-4 py-2 bg-gray-100 text-gray-600 rounded-xl text-sm font-medium hover:bg-gray-200 transition-colors">Clear</button>
                  </form>
                </div>
                {loading ? (
                  <div className="p-16 flex flex-col items-center gap-3">
                    <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
                    <p className="text-sm text-gray-400 font-medium">Loading shipments...</p>
                  </div>
                ) : shipments.length === 0 ? (
                  <div className="p-16 text-center">
                    <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                      <svg className="w-8 h-8 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M20.25 7.5l-.625 10.632a2.25 2.25 0 01-2.247 2.118H6.622a2.25 2.25 0 01-2.247-2.118L3.75 7.5m6 4.125l2.25 2.25m0 0l2.25 2.25M12 13.875l2.25-2.25M12 13.875l-2.25 2.25M3.375 7.5h17.25c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125z" /></svg>
                    </div>
                    <p className="text-gray-500 font-semibold">No shipments found</p>
                    <p className="text-sm text-gray-400 mt-1 mb-4">Create your first shipment to get started</p>
                    <button onClick={() => setShowForm(true)} className="px-5 py-2.5 bg-blue-600 text-white rounded-xl text-sm font-semibold hover:bg-blue-700 transition-colors">Create Shipment</button>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b border-gray-100">
                          <th className="text-left px-6 py-3.5 font-semibold text-[11px] text-gray-400 uppercase tracking-wider">Tracking</th>
                          <th className="text-left px-6 py-3.5 font-semibold text-[11px] text-gray-400 uppercase tracking-wider">Sender</th>
                          <th className="text-left px-6 py-3.5 font-semibold text-[11px] text-gray-400 uppercase tracking-wider">Receiver</th>
                          <th className="text-left px-6 py-3.5 font-semibold text-[11px] text-gray-400 uppercase tracking-wider">Client</th>
                          <th className="text-left px-6 py-3.5 font-semibold text-[11px] text-gray-400 uppercase tracking-wider">Route</th>
                          <th className="text-left px-6 py-3.5 font-semibold text-[11px] text-gray-400 uppercase tracking-wider">Status</th>
                          <th className="text-center px-6 py-3.5 font-semibold text-[11px] text-gray-400 uppercase tracking-wider">COD</th>
                          <th className="text-right px-6 py-3.5 font-semibold text-[11px] text-gray-400 uppercase tracking-wider">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-50">
                        {shipments.map(s => (
                          <tr key={s.id} className="hover:bg-gray-50/60 transition-colors group">
                            <td className="px-6 py-4">
                              <span className="font-bold text-blue-600 text-[13px] bg-blue-50 px-2.5 py-1 rounded-lg">{s.tracking_number}</span>
                            </td>
                            <td className="px-6 py-4">
                              <p className="text-[13px] font-medium text-gray-900">{s.sender_name}</p>
                              <p className="text-[12px] text-gray-400 mt-0.5">{s.sender_phone}</p>
                            </td>
                            <td className="px-6 py-4">
                              <p className="text-[13px] font-medium text-gray-900">{s.receiver_name}</p>
                              <p className="text-[12px] text-gray-400 mt-0.5">{s.receiver_phone}</p>
                            </td>
                            <td className="px-6 py-4 text-[13px] text-gray-500 font-medium">{s.client_name || <span className="text-gray-300">—</span>}</td>
                            <td className="px-6 py-4 text-[13px] text-gray-500 max-w-[140px] truncate">{s.origin} → {s.destination}</td>
                            <td className="px-6 py-4">
                              <span className={`inline-flex items-center px-2.5 py-1 rounded-lg text-[11px] font-bold uppercase tracking-wide ${statusColors[s.status] || 'bg-gray-100 text-gray-700'}`}>
                                {s.status.replace(/_/g, ' ')}
                              </span>
                            </td>
                            <td className="px-6 py-4 text-center text-[13px] font-semibold text-gray-700">{s.cod_amount ? `LKR ${Number(s.cod_amount).toLocaleString()}` : <span className="text-gray-300">—</span>}</td>
                            <td className="px-6 py-4">
                              <div className="flex items-center justify-end gap-1 opacity-60 group-hover:opacity-100 transition-opacity">
                                <a href={`/waybill.html?tracking=${s.tracking_number}`} target="_blank" className="px-2.5 py-1.5 text-gray-500 hover:text-gray-800 hover:bg-gray-100 rounded-lg text-[12px] font-medium transition-all">Print</a>
                                <button onClick={() => setWaybillShipment(s)} className="px-2.5 py-1.5 text-gray-500 hover:text-gray-800 hover:bg-gray-100 rounded-lg text-[12px] font-medium transition-all">Waybill</button>
                                <button onClick={() => viewTracking(s.id)} className="px-2.5 py-1.5 text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-lg text-[12px] font-medium transition-all">Track</button>
                                <button onClick={() => { setEditing(s); setShowForm(true); }} className="px-2.5 py-1.5 text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-lg text-[12px] font-medium transition-all">Edit</button>
                                <button onClick={() => handleDelete(s.id)} className="px-2.5 py-1.5 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg text-[12px] font-medium transition-all">Del</button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          ) : (
            /* ===== SUB-TAB CONTENT ===== */
            <div>
              {activeTab === 'docket-entry' && <DocketEntry />}
              {activeTab === 'pickups' && <Pickups />}
              {activeTab === 'deliveries' && <Deliveries />}
              {activeTab === 'delivery-sheet' && <DeliverySheet />}
              {activeTab === 'cod' && <COD />}
              {activeTab === 'clients' && <Clients />}
              {activeTab === 'staff' && <StaffManagement />}
              {activeTab === 'reports' && <Reports />}
              {activeTab === 'messages' && <Messages />}
            </div>
          )}
        </main>
      </div>

      {waybillShipment && <Waybill shipment={waybillShipment} onClose={() => setWaybillShipment(null)} />}

      {/* Tracking Modal */}
      {trackData && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 px-4" onClick={() => setTrackData(null)}>
          <div className="bg-white rounded-3xl shadow-2xl max-w-lg w-full max-h-[85vh] overflow-hidden" onClick={e => e.stopPropagation()}>
            <div className="sticky top-0 bg-white border-b border-gray-100 px-6 py-5 flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-bold text-gray-900 text-lg">{trackData.shipment.tracking_number}</span>
                  <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider ${statusColors[trackData.shipment.status] || 'bg-gray-100 text-gray-700'}`}>
                    {trackData.shipment.status?.replace(/_/g, ' ')}
                  </span>
                </div>
                <p className="text-[13px] text-gray-400 mt-1">{trackData.shipment.receiver_name} → {trackData.shipment.destination}</p>
              </div>
              <button onClick={() => setTrackData(null)} className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-xl transition-all">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>
            <div className="p-6 overflow-y-auto max-h-[calc(85vh-80px)]">
              {trackLoading ? (
                <div className="py-12 flex flex-col items-center gap-3">
                  <div className="w-7 h-7 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
                  <p className="text-sm text-gray-400 font-medium">Loading tracking...</p>
                </div>
              ) : (
                <div className="relative">
                  <div className="absolute left-[15px] top-4 bottom-4 w-0.5 bg-gradient-to-b from-blue-400 via-gray-200 to-gray-100 rounded-full" />
                  {(trackData.events || []).map((event, i) => {
                    const cfg = {
                      pending_scan: { color: 'bg-slate-400', ring: 'ring-slate-100', label: 'Pending Scan' },
                      pickup_requested: { color: 'bg-amber-500', ring: 'ring-amber-100', label: 'Pickup Requested' },
                      picked_up: { color: 'bg-orange-500', ring: 'ring-orange-100', label: 'Picked Up' },
                      at_sorting_center: { color: 'bg-violet-500', ring: 'ring-violet-100', label: 'At Sorting Center' },
                      sorted: { color: 'bg-indigo-500', ring: 'ring-indigo-100', label: 'Sorted' },
                      out_for_delivery: { color: 'bg-blue-500', ring: 'ring-blue-100', label: 'Out for Delivery' },
                      customer_contacted: { color: 'bg-teal-500', ring: 'ring-teal-100', label: 'Customer Contacted' },
                      delivered: { color: 'bg-emerald-500', ring: 'ring-emerald-100', label: 'Delivered' },
                      failed_delivery: { color: 'bg-red-500', ring: 'ring-red-100', label: 'Failed Delivery' },
                      returned_to_sender: { color: 'bg-red-600', ring: 'ring-red-200', label: 'Returned to Sender' },
                      rescheduled: { color: 'bg-cyan-500', ring: 'ring-cyan-100', label: 'Rescheduled' },
                    }[event.event_type] || { color: 'bg-gray-400', ring: 'ring-gray-100', label: event.status || event.event_type };
                    return (
                      <div key={event.id} className="flex gap-4 pb-6 relative">
                        <div className="flex flex-col items-center flex-shrink-0">
                          <div className={`w-[32px] h-[32px] rounded-full ${cfg.color} ring-4 ${cfg.ring} flex items-center justify-center z-10 shadow-sm`}>
                            <span className="text-white text-[11px] font-bold">{i + 1}</span>
                          </div>
                        </div>
                        <div className="flex-1 pt-0.5">
                          <p className="font-semibold text-[13px] text-gray-900">{cfg.label}</p>
                          {event.description && <p className="text-[13px] text-gray-500 mt-0.5">{event.description}</p>}
                          {event.staff_name && <p className="text-[12px] text-gray-400 mt-0.5">By {event.staff_name}</p>}
                          {event.location && <p className="text-[12px] text-gray-400">{event.location}</p>}
                          <p className="text-[11px] text-gray-400 mt-1 font-medium">{new Date(event.timestamp).toLocaleString()}</p>
                        </div>
                      </div>
                    );
                  })}
                  {trackData.delivery_attempts?.length > 0 && (
                    <div className="mt-4 pt-4 border-t border-gray-100">
                      <p className="text-[11px] font-bold text-gray-400 mb-3 uppercase tracking-wider">Delivery Attempts</p>
                      {trackData.delivery_attempts.map(a => (
                        <div key={a.id} className="flex items-start gap-2 text-[13px] text-gray-500 mb-2">
                          <span className="w-1.5 h-1.5 bg-red-400 rounded-full mt-1.5 flex-shrink-0" />
                          <span>Attempt #{a.attempt_number}: {a.reason}{a.custom_note ? ` — ${a.custom_note}` : ''} <span className="text-gray-400 text-[11px]">({new Date(a.timestamp).toLocaleString()})</span></span>
                        </div>
                      ))}
                    </div>
                  )}
                  {(!trackData.events || trackData.events.length === 0) && (
                    <div className="py-12 text-center">
                      <div className="w-14 h-14 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-3">
                        <svg className="w-7 h-7 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                      </div>
                      <p className="text-gray-500 font-medium">No tracking events yet</p>
                    </div>
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
