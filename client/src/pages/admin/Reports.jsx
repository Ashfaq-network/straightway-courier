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
    { id: 'daily', label: 'Daily Summary' },
    { id: 'monthly', label: 'Monthly' },
    { id: 'riders', label: 'Rider Performance' },
    { id: 'export', label: 'Export Data' },
  ];

  return (
    <div className="space-y-5">
      <h2 className="text-xl font-bold text-gray-900">Reports</h2>

      <div className="flex flex-wrap gap-1 mb-6 border-b border-gray-200">
        {tabs.map(t => (
          <button key={t.id} onClick={() => setTab(t.id)}
            className={`px-4 py-2.5 text-sm font-medium rounded-t-lg ${tab === t.id ? 'bg-blue-600 text-white' : 'text-gray-600 hover:text-gray-900'}`}>
            {t.label}
          </button>
        ))}
      </div>

      {tab === 'daily' && (
        <div>
          <input type="date" value={date} onChange={(e) => setDate(e.target.value)} className="mb-4 px-4 py-2.5 border border-gray-200 rounded-lg text-sm" />
          {daily && (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
              {[
                { label: 'Total Pickups', value: daily.total_pickups, color: 'bg-orange-50 text-orange-600' },
                { label: 'Total Delivered', value: daily.total_delivered, color: 'bg-green-50 text-green-600' },
                { label: 'Pending Parcels', value: daily.pending_parcels, color: 'bg-yellow-50 text-yellow-600' },
                { label: 'Failed Deliveries', value: daily.failed_deliveries, color: 'bg-red-50 text-red-600' },
                { label: 'Returned', value: daily.returned_parcels, color: 'bg-gray-50 text-gray-600' },
                { label: 'Total COD', value: `LKR ${parseFloat(daily.total_cod).toLocaleString()}`, color: 'bg-cyan-50 text-cyan-600' },
                { label: 'Total Charges', value: `LKR ${parseFloat(daily.total_charges).toLocaleString()}`, color: 'bg-blue-50 text-blue-600' },
              ].map((c, i) => (
                <div key={i} className={`${c.color} rounded-xl p-4 border border-gray-100 shadow-sm`}>
                  <p className="text-xs font-medium opacity-75">{c.label}</p>
                  <p className="text-xl font-bold mt-1">{c.value}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {tab === 'monthly' && (
        <div>
          <input type="month" value={monthStr} onChange={(e) => setMonthStr(e.target.value)} className="mb-4 px-4 py-2.5 border border-gray-200 rounded-lg text-sm" />
          <div className="overflow-x-auto bg-white rounded-xl shadow border border-gray-100">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 text-gray-600">
                <tr>
                  <th className="text-left px-4 py-3 font-medium">Date</th>
                  <th className="text-right px-4 py-3 font-medium">Total</th>
                  <th className="text-right px-4 py-3 font-medium">Delivered</th>
                  <th className="text-right px-4 py-3 font-medium">Revenue</th>
                  <th className="text-right px-4 py-3 font-medium">COD</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {monthly.map(d => (
                  <tr key={d.day} className="hover:bg-gray-50">
                    <td className="px-4 py-3 font-medium text-gray-900">{new Date(d.day).toLocaleDateString()}</td>
                    <td className="px-4 py-3 text-right">{d.total}</td>
                    <td className="px-4 py-3 text-right">{d.delivered}</td>
                    <td className="px-4 py-3 text-right">LKR {parseFloat(d.revenue).toLocaleString()}</td>
                    <td className="px-4 py-3 text-right">LKR {parseFloat(d.cod_total).toLocaleString()}</td>
                  </tr>
                ))}
                {monthly.length === 0 && <tr><td colSpan={5} className="px-4 py-8 text-center text-gray-500">No data for this month.</td></tr>}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {tab === 'riders' && (
        <div className="overflow-x-auto bg-white rounded-xl shadow border border-gray-100">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-gray-600">
              <tr>
                <th className="text-left px-4 py-3 font-medium">Rider</th>
                <th className="text-left px-4 py-3 font-medium">Role</th>
                <th className="text-center px-4 py-3 font-medium">Assigned</th>
                <th className="text-center px-4 py-3 font-medium">Delivered</th>
                <th className="text-center px-4 py-3 font-medium">Failed</th>
                <th className="text-right px-4 py-3 font-medium">COD Collected</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {riderPerf.map(r => (
                <tr key={r.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 font-medium text-gray-900">{r.name}<br/><span className="text-xs text-gray-500">{r.phone}</span></td>
                  <td className="px-4 py-3 text-gray-600 capitalize">{r.role.replace(/_/g, ' ')}</td>
                  <td className="px-4 py-3 text-center">{r.total_assigned}</td>
                  <td className="px-4 py-3 text-center text-green-600 font-semibold">{r.deliveries_completed}</td>
                  <td className="px-4 py-3 text-center text-red-600">{r.deliveries_failed}</td>
                  <td className="px-4 py-3 text-right">LKR {parseFloat(r.cod_collected).toLocaleString()}</td>
                </tr>
              ))}
              {riderPerf.length === 0 && <tr><td colSpan={6} className="px-4 py-8 text-center text-gray-500">No rider data.</td></tr>}
            </tbody>
          </table>
        </div>
      )}

      {tab === 'export' && (
        <div>
          <div className="flex gap-3 mb-4 items-end">
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Start Date</label>
              <input type="date" value={exportStart} onChange={(e) => setExportStart(e.target.value)} className="px-3 py-2.5 border border-gray-200 rounded-lg text-sm" />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">End Date</label>
              <input type="date" value={exportEnd} onChange={(e) => setExportEnd(e.target.value)} className="px-3 py-2.5 border border-gray-200 rounded-lg text-sm" />
            </div>
            <button onClick={handleExport} className="px-4 py-2.5 bg-emerald-500 text-white rounded-lg text-sm">Export CSV</button>
          </div>
          {exportData.length > 0 && (
            <p className="text-sm text-gray-500">{exportData.length} records exported.</p>
          )}
        </div>
      )}
    </div>
  );
}
