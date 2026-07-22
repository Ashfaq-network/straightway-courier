import { useState, useEffect } from 'react';

const API = '/api/admin';

export default function Messages() {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);

  const getToken = () => sessionStorage.getItem('swc_token');

  useEffect(() => { fetchMessages(); }, []);

  const fetchMessages = async () => {
    try {
      const res = await fetch(`${API}/messages`, { headers: { 'Authorization': `Bearer ${getToken()}` } });
      if (res.ok) setMessages(await res.json());
    } catch (err) { console.error(err); } finally { setLoading(false); }
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this message?')) return;
    await fetch(`${API}/messages/${id}`, { method: 'DELETE', headers: { 'Authorization': `Bearer ${getToken()}` } });
    fetchMessages();
  };

  return (
    <div className="space-y-5">
      <h2 className="text-xl font-bold text-gray-900">Contact Messages</h2>

      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
        {loading ? <p className="p-4 text-gray-500">Loading...</p> : messages.length === 0 ? (
          <p className="p-4 text-gray-500">No messages yet.</p>
        ) : (
          <div className="divide-y divide-gray-100">
            {messages.map(m => (
              <div key={m.id} className="p-5 hover:bg-gray-50">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-semibold text-gray-900 text-sm">{m.name}</span>
                      <span className="text-xs text-gray-400">({m.email})</span>
                      {m.phone && <span className="text-xs text-gray-400">| {m.phone}</span>}
                    </div>
                    {m.subject && <p className="text-xs font-medium text-gray-500 mb-1">{m.subject}</p>}
                    <p className="text-sm text-gray-600 whitespace-pre-wrap">{m.message}</p>
                    <p className="text-xs text-gray-400 mt-2">{new Date(m.created_at).toLocaleString()}</p>
                  </div>
                  <button onClick={() => handleDelete(m.id)} className="text-red-500 hover:text-red-700 text-xs shrink-0">Delete</button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}