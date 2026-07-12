import { useState, useEffect } from 'react';

const API = '/api/admin';

export default function Clients({ onBack }) {
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editClient, setEditClient] = useState(null);
  const [form, setForm] = useState({ client_type: 'individual', company_name: '', contact_person: '', phone: '', email: '', address: '', billing_address: '' });
  const [loginForm, setLoginForm] = useState({ username: '', password: '' });
  const [showLogin, setShowLogin] = useState(null);

  const getToken = () => sessionStorage.getItem('swc_token');

  useEffect(() => { fetchClients(); }, []);

  const fetchClients = async () => {
    try {
      const params = search ? `?search=${encodeURIComponent(search)}` : '';
      const res = await fetch(`${API}/clients${params}`, { headers: { 'Authorization': `Bearer ${getToken()}` } });
      if (res.ok) setClients(await res.json());
    } catch (err) { console.error(err); } finally { setLoading(false); }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const url = editClient ? `${API}/clients/${editClient.id}` : `${API}/clients`;
    const method = editClient ? 'PUT' : 'POST';
    await fetch(url, { method, headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${getToken()}` }, body: JSON.stringify(form) });
    setShowForm(false); setEditClient(null); resetForm(); fetchClients();
  };

  const createLogin = async (clientId) => {
    if (!loginForm.username || !loginForm.password) { alert('Username and password required'); return; }
    const res = await fetch(`${API}/clients/${clientId}/create-login`, {
      method: 'POST', headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${getToken()}` }, body: JSON.stringify(loginForm)
    });
    if (!res.ok) { const d = await res.json(); alert(d.error); return; }
    alert('Login created successfully!');
    setShowLogin(null);
    setLoginForm({ username: '', password: '' });
  };

  const resetForm = () => setForm({ client_type: 'individual', company_name: '', contact_person: '', phone: '', email: '', address: '', billing_address: '' });

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <button onClick={onBack} className="text-brand-500 hover:underline text-sm mb-2 inline-block">&larr; Back to Dashboard</button>
          <h2 className="text-xl font-bold text-gray-900">Client Management</h2>
        </div>
        <button onClick={() => { setShowForm(true); setEditClient(null); resetForm(); }} className="px-4 py-2 bg-brand-500 text-white rounded-lg hover:bg-brand-600 text-sm">+ Add Client</button>
      </div>

      <div className="flex gap-2 mb-4">
        <input type="text" placeholder="Search clients..." value={search} onChange={(e) => setSearch(e.target.value)}
          className="flex-1 px-4 py-2.5 border border-gray-200 rounded-lg text-sm" />
        <button onClick={fetchClients} className="px-4 py-2.5 bg-brand-500 text-white rounded-lg text-sm">Search</button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="bg-gray-50 rounded-xl p-6 border border-gray-100 mb-6">
          <h3 className="font-semibold text-gray-900 mb-4">{editClient ? 'Edit Client' : 'New Client'}</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
              <select value={form.client_type} onChange={(e) => setForm({...form, client_type: e.target.value})} className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm">
                <option value="individual">Individual</option>
                <option value="company">Company</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Company Name</label>
              <input type="text" value={form.company_name} onChange={(e) => setForm({...form, company_name: e.target.value})} className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Contact Person *</label>
              <input type="text" required value={form.contact_person} onChange={(e) => setForm({...form, contact_person: e.target.value})} className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Phone *</label>
              <input type="text" required value={form.phone} onChange={(e) => setForm({...form, phone: e.target.value})} className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <input type="email" value={form.email} onChange={(e) => setForm({...form, email: e.target.value})} className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
              <input type="text" value={form.address} onChange={(e) => setForm({...form, address: e.target.value})} className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm" />
            </div>
            <div className="sm:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Billing Address</label>
              <input type="text" value={form.billing_address} onChange={(e) => setForm({...form, billing_address: e.target.value})} className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm" />
            </div>
          </div>
          <div className="flex gap-2 mt-4">
            <button type="submit" className="px-4 py-2 bg-brand-500 text-white rounded-lg text-sm">{editClient ? 'Update' : 'Create'}</button>
            <button type="button" onClick={() => setShowForm(false)} className="px-4 py-2 bg-gray-200 rounded-lg text-sm">Cancel</button>
          </div>
        </form>
      )}

      {showLogin && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50" onClick={() => setShowLogin(null)}>
          <div className="bg-white rounded-xl p-6 max-w-sm w-full mx-4" onClick={(e) => e.stopPropagation()}>
            <h3 className="font-semibold text-gray-900 mb-4">Create Client Login</h3>
            <div className="space-y-3">
              <input type="text" placeholder="Username" value={loginForm.username} onChange={(e) => setLoginForm({...loginForm, username: e.target.value})} className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm" />
              <input type="password" placeholder="Password" value={loginForm.password} onChange={(e) => setLoginForm({...loginForm, password: e.target.value})} className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm" />
              <div className="flex gap-2">
                <button onClick={() => createLogin(showLogin)} className="px-4 py-2 bg-brand-500 text-white rounded-lg text-sm">Create</button>
                <button onClick={() => setShowLogin(null)} className="px-4 py-2 bg-gray-200 rounded-lg text-sm">Cancel</button>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
        {loading ? <p className="p-4 text-gray-500">Loading...</p> : clients.length === 0 ? (
          <p className="p-4 text-gray-500">No clients yet.</p>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-gray-600">
              <tr>
                <th className="text-left px-4 py-3 font-medium">Name/Company</th>
                <th className="text-left px-4 py-3 font-medium">Contact Person</th>
                <th className="text-left px-4 py-3 font-medium">Phone</th>
                <th className="text-left px-4 py-3 font-medium">Email</th>
                <th className="text-center px-4 py-3 font-medium">Status</th>
                <th className="text-right px-4 py-3 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {clients.map(c => (
                <tr key={c.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 font-medium text-gray-900">{c.company_name || c.contact_person}</td>
                  <td className="px-4 py-3 text-gray-600">{c.contact_person}</td>
                  <td className="px-4 py-3 text-gray-600">{c.phone}</td>
                  <td className="px-4 py-3 text-gray-600">{c.email || '-'}</td>
                  <td className="px-4 py-3 text-center">
                    <span className={`inline-block px-2 py-0.5 rounded text-xs font-semibold ${c.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                      {c.is_active ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <button onClick={() => { setShowLogin(c.id); }} className="text-purple-500 hover:underline text-xs mr-2">Login</button>
                    <button onClick={() => { setEditClient(c); setForm({ client_type: c.client_type, company_name: c.company_name || '', contact_person: c.contact_person, phone: c.phone, email: c.email || '', address: c.address || '', billing_address: c.billing_address || '' }); setShowForm(true); }} className="text-blue-500 hover:underline text-xs mr-2">Edit</button>
                    <button onClick={async () => { if (!confirm('Delete?')) return; await fetch(`${API}/clients/${c.id}`, { method: 'DELETE', headers: { 'Authorization': `Bearer ${getToken()}` } }); fetchClients(); }} className="text-red-500 hover:underline text-xs">Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
