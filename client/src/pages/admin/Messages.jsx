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
    <div className="space-y-6">
      {/* Header */}
      <div>
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-xl bg-purple-50 flex items-center justify-center">
            <svg className="w-5 h-5 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
          </div>
          <div>
            <h2 className="text-lg font-bold text-gray-900">Contact Messages</h2>
            <p className="text-[13px] text-gray-400 mt-0.5">Inquiries and messages from your website</p>
          </div>
        </div>
      </div>

      {/* Loading */}
      {loading && (
        <div className="flex flex-col items-center justify-center py-20">
          <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
          <p className="text-sm text-gray-400 mt-3">Loading messages...</p>
        </div>
      )}

      {/* Empty */}
      {!loading && messages.length === 0 && (
        <div className="flex flex-col items-center justify-center py-20 bg-gray-50 rounded-2xl border border-gray-100">
          <div className="w-14 h-14 rounded-2xl bg-gray-100 flex items-center justify-center mb-4">
            <svg className="w-6 h-6 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
          </div>
          <p className="text-sm font-medium text-gray-600">No messages yet</p>
          <p className="text-xs text-gray-400 mt-1">Contact form submissions will appear here</p>
        </div>
      )}

      {/* Messages */}
      {!loading && messages.length > 0 && (
        <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm">
          <div className="divide-y divide-gray-100">
            {messages.map((m, idx) => (
              <div key={m.id} className={`p-5 hover:bg-gray-50/60 transition-colors group ${idx === 0 ? 'pt-5' : ''}`}>
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-purple-500 to-purple-600 flex items-center justify-center text-white text-xs font-bold shrink-0">
                        {m.name?.charAt(0)?.toUpperCase() || '?'}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-gray-900 text-sm">{m.name}</span>
                          <span className="text-[11px] text-gray-400 bg-gray-100 px-2 py-0.5 rounded-md">{m.email}</span>
                          {m.phone && <span className="text-[11px] text-gray-400 bg-gray-100 px-2 py-0.5 rounded-md">{m.phone}</span>}
                        </div>
                      </div>
                    </div>
                    {m.subject && (
                      <div className="ml-12 mb-2">
                        <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider mb-1">Subject</p>
                        <p className="text-sm font-medium text-gray-700">{m.subject}</p>
                      </div>
                    )}
                    <div className="ml-12">
                      <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider mb-1">Message</p>
                      <p className="text-sm text-gray-600 whitespace-pre-wrap leading-relaxed bg-gray-50 rounded-xl px-4 py-3 border border-gray-100">{m.message}</p>
                    </div>
                    <div className="ml-12 mt-2 flex items-center gap-1.5">
                      <svg className="w-3 h-3 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                      <p className="text-[11px] text-gray-400">{new Date(m.created_at).toLocaleString()}</p>
                    </div>
                  </div>
                  <button onClick={() => handleDelete(m.id)}
                    className="px-3 py-1.5 bg-gray-100 text-gray-500 rounded-lg text-xs font-medium hover:bg-red-50 hover:text-red-600 hover:ring-1 hover:ring-red-200 transition-all shrink-0 opacity-0 group-hover:opacity-100">
                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
