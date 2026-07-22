import { useState, useEffect } from 'react';

const API = '/api/admin';

export default function StaffManagement() {
  const [staff, setStaff] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editStaff, setEditStaff] = useState(null);
  const [form, setForm] = useState({ name: '', phone: '', email: '', username: '', password: '', role: 'delivery_rider' });

  useEffect(() => { fetchStaff(); }, []);

  const getToken = () => sessionStorage.getItem('swc_token');

  const fetchStaff = async () => {
    try {
      const res = await fetch(`${API}/staff`, { headers: { 'Authorization': `Bearer ${getToken()}` } });
      if (res.ok) setStaff(await res.json());
    } catch (err) { console.error(err); } finally { setLoading(false); }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const url = editStaff ? `${API}/staff/${editStaff.id}` : `${API}/staff`;
    const method = editStaff ? 'PUT' : 'POST';
    const body = editStaff ? { name: form.name, phone: form.phone, email: form.email, username: form.username, role: form.role, is_active: true } : form;

    await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${getToken()}` },
      body: JSON.stringify(body)
    });

    setShowForm(false);
    setEditStaff(null);
    setForm({ name: '', phone: '', email: '', username: '', password: '', role: 'delivery_rider' });
    fetchStaff();
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this staff member?')) return;
    await fetch(`${API}/staff/${id}`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${getToken()}` }
    });
    fetchStaff();
  };

  const handleEdit = (s) => {
    setEditStaff(s);
    setForm({ name: s.name, phone: s.phone, email: s.email || '', username: s.username, password: '', role: s.role || 'delivery_rider' });
    setShowForm(true);
  };

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-gray-900">Delivery Staff Management</h2>
        <button onClick={() => { setShowForm(true); setEditStaff(null); setForm({ name: '', phone: '', email: '', username: '', password: '', role: 'delivery_rider' }); }}
          className="px-4 py-2 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 text-sm transition-colors">
          + Add Staff
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="bg-gray-50 rounded-xl p-6 border border-gray-100 mb-6">
          <h3 className="font-semibold text-gray-900 mb-4">{editStaff ? 'Edit Staff' : 'New Staff'}</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Name *</label>
              <input type="text" required value={form.name} onChange={(e) => setForm({...form, name: e.target.value})}
                className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Phone *</label>
              <input type="text" required value={form.phone} onChange={(e) => setForm({...form, phone: e.target.value})}
                className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <input type="email" value={form.email} onChange={(e) => setForm({...form, email: e.target.value})}
                className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Role *</label>
              <select value={form.role} onChange={(e) => setForm({...form, role: e.target.value})}
                className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600">
                <option value="delivery_rider">Delivery Rider</option>
                <option value="pickup_driver">Pickup Driver</option>
                <option value="sorting_staff">Sorting Staff</option>
                <option value="office_staff">Office Staff</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Username *</label>
              <input type="text" required value={form.username} onChange={(e) => setForm({...form, username: e.target.value})}
                className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600" />
            </div>
            {!editStaff && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Password *</label>
                <input type="password" required value={form.password} onChange={(e) => setForm({...form, password: e.target.value})}
                  className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600" />
              </div>
            )}
          </div>
          <div className="flex gap-2">
            <button type="submit" className="px-4 py-2 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 text-sm">
              {editStaff ? 'Update' : 'Create'}
            </button>
            <button type="button" onClick={() => setShowForm(false)} className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 text-sm">
              Cancel
            </button>
          </div>
        </form>
      )}

      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
        {loading ? (
          <p className="p-4 text-gray-500">Loading...</p>
        ) : staff.length === 0 ? (
          <p className="p-4 text-gray-500">No staff members yet.</p>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-gray-600">
              <tr>
                <th className="text-left px-4 py-3 font-medium">Name</th>
                <th className="text-left px-4 py-3 font-medium">Role</th>
                <th className="text-left px-4 py-3 font-medium">Phone</th>
                <th className="text-left px-4 py-3 font-medium">Username</th>
                <th className="text-left px-4 py-3 font-medium">Status</th>
                <th className="text-right px-4 py-3 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {staff.map(s => (
                <tr key={s.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 font-medium text-gray-900">{s.name}</td>
                  <td className="px-4 py-3 text-gray-600">
                    <span className="inline-block px-2 py-0.5 rounded text-xs font-semibold bg-blue-50 text-blue-700">
                      {(s.role || 'office_staff').replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase())}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-gray-600">{s.phone}</td>
                  <td className="px-4 py-3 text-gray-600">{s.username}</td>
                  <td className="px-4 py-3">
                    <span className={`inline-block px-2 py-0.5 rounded text-xs font-semibold ${s.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                      {s.is_active ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <button onClick={() => handleEdit(s)} className="text-blue-500 hover:underline text-xs mr-3">Edit</button>
                    <button onClick={() => handleDelete(s.id)} className="text-red-500 hover:underline text-xs">Delete</button>
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
