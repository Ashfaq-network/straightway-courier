import { useState, useEffect } from 'react';

const API = '/api/admin';

export default function Reports() {
  const [daily, setDaily] = useState(null);
  const [monthly, setMonthly] = useState([]);
  const [riderPerf, setRiderPerf] = useState([]);
  const [exportData, setExportData] = useState([]);
  const [tab, setTab] = useState('daily');
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [monthStr, setMonthStr] = useState(new Date().toISOString().slice(0, 7));
  const [exportStart, setExportStart] = useState('');
  const [exportEnd, setExportEnd] = useState('');

  const getToken = () => sessionStorage.getItem('swc_token');

  useEffect(() => {
    if (tab === 'daily') fetchDaily();
    else if (tab === 'monthly') fetchMonthly();
    else if (tab === 'riders') fetchRiderPerf();
  }, [tab, date, monthStr]);

  const fetchDaily = async () => {
    const res = await fetch(`${API}/reports/daily?date=${date}`, { headers: { 'Authorization': `Bearer ${getToken()}` } });
    if (res.ok) setDaily(await res.json());
  };

  const fetchMonthly = async () => {
    const [y, m] = monthStr.split('-');
    const res = await fetch(`${API}/reports/monthly?year=${y}&month=${m}`, { headers: { 'Authorization': `Bearer ${getToken()}` } });
    if (res.ok) setMonthly(await res.json());
  };

  const fetchRiderPerf = async () => {
    const res = await fetch(`${API}/reports/rider-performance`, { headers: { 'Authorization': `Bearer ${getToken()}` } });
    if (res.ok) setRiderPerf(await res.json());
  };

  const handleExport = async () => {
    const params = new URLSearchParams();
    if (exportStart) params.append('startDate', exportStart);
    if (exportEnd) params.append('endDate', exportEnd);
    const res = await fetch(`${API}/reports/export?${params}`, { headers: { 'Authorization': `Bearer ${getToken()}` } });
    if (!res.ok) return;
    const data = await res.json();
    setExportData(data);

    const headers = ['Tracking #','Client','Sender','Receiver','Origin','Destination','Weight','Charge','COD','Status','Created'];
    const rows = data.map(s => [s.tracking_number, s.client_name || '', s.sender_name, s.receiver_name, s.origin, s.destination, s.weight || '', s.delivery_charge || 0, s.cod_amount || 0, s.status, new Date(s.created_at).toLocaleDateString()]);
    const csv = [headers.join(','), ...rows.map(r => r.map(c => `"${c}"`).join(','))].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = `shipments_${new Date().toISOString().slice(0,10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const tabs = [
    { id: 'daily', label: 'Daily Summary', icon: <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg> },
    { id: 'monthly', label: 'Monthly', icon: <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg> },
    { id: 'riders', label: 'Rider Performance', icon: <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" /></svg> },
    { id: 'export', label: 'Export Data', icon: <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg> },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-xl bg-indigo-50 flex items-center justify-center">
            <svg className="w-5 h-5 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>
          </div>
          <div>
            <h2 className="text-lg font-bold text-gray-900">Reports</h2>
            <p className="text-[13px] text-gray-400 mt-0.5">Analytics, performance metrics, and data exports</p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex flex-wrap gap-1 p-1 bg-gray-100 rounded-xl">
        {tabs.map(t => (
          <button key={t.id} onClick={() => setTab(t.id)}
            className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium rounded-lg transition-all ${tab === t.id ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50/50'}`}>
            {t.icon}
            {t.label}
          </button>
        ))}
      </div>

      {/* Daily Tab */}
      {tab === 'daily' && (
        <div className="space-y-5">
          <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
            <label className="block text-[11px] font-semibold text-gray-400 uppercase tracking-wider mb-2">Select Date</label>
            <input type="date" value={date} onChange={(e) => setDate(e.target.value)} className="px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-400 transition-all" />
          </div>
          {daily && (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
              {[
                { label: 'Total Pickups', value: daily.total_pickups, icon: <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8" /></svg>, color: 'text-orange-600', bg: 'bg-orange-50', ring: 'ring-orange-100' },
                { label: 'Total Delivered', value: daily.total_delivered, icon: <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>, color: 'text-green-600', bg: 'bg-green-50', ring: 'ring-green-100' },
                { label: 'Pending Parcels', value: daily.pending_parcels, icon: <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>, color: 'text-amber-600', bg: 'bg-amber-50', ring: 'ring-amber-100' },
                { label: 'Failed Deliveries', value: daily.failed_deliveries, icon: <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>, color: 'text-red-600', bg: 'bg-red-50', ring: 'ring-red-100' },
                { label: 'Returned', value: daily.returned_parcels, icon: <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6" /></svg>, color: 'text-gray-600', bg: 'bg-gray-50', ring: 'ring-gray-200' },
                { label: 'Total COD', value: `LKR ${parseFloat(daily.total_cod || 0).toLocaleString()}`, icon: <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>, color: 'text-cyan-600', bg: 'bg-cyan-50', ring: 'ring-cyan-100' },
                { label: 'Total Charges', value: `LKR ${parseFloat(daily.total_charges || 0).toLocaleString()}`, icon: <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" /></svg>, color: 'text-blue-600', bg: 'bg-blue-50', ring: 'ring-blue-100' },
              ].map((c, i) => (
                <div key={i} className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm hover:shadow-md transition-shadow group">
                  <div className="flex items-center justify-between mb-3">
                    <div className={`w-9 h-9 rounded-xl ${c.bg} flex items-center justify-center ring-1 ${c.ring}`}>
                      <span className={c.color}>{c.icon}</span>
                    </div>
                  </div>
                  <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider">{c.label}</p>
                  <p className="text-2xl font-bold text-gray-900 mt-1">{c.value}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Monthly Tab */}
      {tab === 'monthly' && (
        <div className="space-y-5">
          <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
            <label className="block text-[11px] font-semibold text-gray-400 uppercase tracking-wider mb-2">Select Month</label>
            <input type="month" value={monthStr} onChange={(e) => setMonthStr(e.target.value)} className="px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-400 transition-all" />
          </div>
          <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-100">
                    <th className="text-left px-5 py-3.5 text-[11px] font-semibold text-gray-400 uppercase tracking-wider">Date</th>
                    <th className="text-right px-5 py-3.5 text-[11px] font-semibold text-gray-400 uppercase tracking-wider">Total</th>
                    <th className="text-right px-5 py-3.5 text-[11px] font-semibold text-gray-400 uppercase tracking-wider">Delivered</th>
                    <th className="text-right px-5 py-3.5 text-[11px] font-semibold text-gray-400 uppercase tracking-wider">Revenue</th>
                    <th className="text-right px-5 py-3.5 text-[11px] font-semibold text-gray-400 uppercase tracking-wider">COD</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {monthly.map(d => (
                    <tr key={d.day} className="hover:bg-gray-50/60 transition-colors">
                      <td className="px-5 py-3.5 font-medium text-gray-900">{new Date(d.day).toLocaleDateString()}</td>
                      <td className="px-5 py-3.5 text-right text-gray-700">{d.total}</td>
                      <td className="px-5 py-3.5 text-right text-green-600 font-semibold">{d.delivered}</td>
                      <td className="px-5 py-3.5 text-right text-gray-700">LKR {parseFloat(d.revenue || 0).toLocaleString()}</td>
                      <td className="px-5 py-3.5 text-right text-gray-700">LKR {parseFloat(d.cod_total || 0).toLocaleString()}</td>
                    </tr>
                  ))}
                  {monthly.length === 0 && (
                    <tr>
                      <td colSpan={5}>
                        <div className="flex flex-col items-center justify-center py-16">
                          <div className="w-14 h-14 rounded-2xl bg-gray-100 flex items-center justify-center mb-4">
                            <svg className="w-6 h-6 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>
                          </div>
                          <p className="text-sm font-medium text-gray-600">No data for this month</p>
                          <p className="text-xs text-gray-400 mt-1">Try selecting a different month</p>
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Riders Tab */}
      {tab === 'riders' && (
        <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100">
                  <th className="text-left px-5 py-3.5 text-[11px] font-semibold text-gray-400 uppercase tracking-wider">Rider</th>
                  <th className="text-left px-5 py-3.5 text-[11px] font-semibold text-gray-400 uppercase tracking-wider">Role</th>
                  <th className="text-center px-5 py-3.5 text-[11px] font-semibold text-gray-400 uppercase tracking-wider">Assigned</th>
                  <th className="text-center px-5 py-3.5 text-[11px] font-semibold text-gray-400 uppercase tracking-wider">Delivered</th>
                  <th className="text-center px-5 py-3.5 text-[11px] font-semibold text-gray-400 uppercase tracking-wider">Failed</th>
                  <th className="text-right px-5 py-3.5 text-[11px] font-semibold text-gray-400 uppercase tracking-wider">COD Collected</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {riderPerf.map(r => (
                  <tr key={r.id} className="hover:bg-gray-50/60 transition-colors group">
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white text-xs font-bold">
                          {r.name?.charAt(0)?.toUpperCase() || '?'}
                        </div>
                        <div>
                          <p className="font-semibold text-gray-900 text-sm">{r.name}</p>
                          <p className="text-[11px] text-gray-400">{r.phone}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-3.5 text-gray-500 capitalize">{r.role.replace(/_/g, ' ')}</td>
                    <td className="px-5 py-3.5 text-center text-gray-700 font-medium">{r.total_assigned}</td>
                    <td className="px-5 py-3.5 text-center">
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-green-50 text-green-700 ring-1 ring-green-200 text-xs font-semibold">
                        {r.deliveries_completed}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 text-center">
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-red-50 text-red-700 ring-1 ring-red-200 text-xs font-semibold">
                        {r.deliveries_failed}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 text-right text-gray-700 font-medium">LKR {parseFloat(r.cod_collected || 0).toLocaleString()}</td>
                  </tr>
                ))}
                {riderPerf.length === 0 && (
                  <tr>
                    <td colSpan={6}>
                      <div className="flex flex-col items-center justify-center py-16">
                        <div className="w-14 h-14 rounded-2xl bg-gray-100 flex items-center justify-center mb-4">
                          <svg className="w-6 h-6 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                        </div>
                        <p className="text-sm font-medium text-gray-600">No rider data</p>
                        <p className="text-xs text-gray-400 mt-1">Performance metrics will appear here</p>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Export Tab */}
      {tab === 'export' && (
        <div className="space-y-5">
          <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
            <div className="flex items-center gap-3 mb-5">
              <div className="w-11 h-11 rounded-xl bg-emerald-50 flex items-center justify-center">
                <svg className="w-5 h-5 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
              </div>
              <div>
                <h3 className="text-sm font-bold text-gray-900">Export Shipments</h3>
                <p className="text-[13px] text-gray-400 mt-0.5">Download filtered data as CSV</p>
              </div>
            </div>
            <div className="flex flex-wrap gap-3 items-end">
              <div>
                <label className="block text-[11px] font-semibold text-gray-400 uppercase tracking-wider mb-1.5">Start Date</label>
                <input type="date" value={exportStart} onChange={(e) => setExportStart(e.target.value)} className="px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-400 transition-all" />
              </div>
              <div>
                <label className="block text-[11px] font-semibold text-gray-400 uppercase tracking-wider mb-1.5">End Date</label>
                <input type="date" value={exportEnd} onChange={(e) => setExportEnd(e.target.value)} className="px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-400 transition-all" />
              </div>
              <button onClick={handleExport} className="px-4 py-2.5 bg-gradient-to-r from-blue-600 to-blue-500 text-white rounded-xl text-sm font-semibold hover:shadow-lg hover:shadow-blue-500/25 transition-all active:scale-[0.97] flex items-center gap-2">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
                Export CSV
              </button>
            </div>
            {exportData.length > 0 && (
              <div className="mt-4 flex items-center gap-2 px-4 py-3 bg-green-50 rounded-xl ring-1 ring-green-200">
                <svg className="w-4 h-4 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                <p className="text-sm text-green-700 font-medium">{exportData.length} records exported successfully</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
