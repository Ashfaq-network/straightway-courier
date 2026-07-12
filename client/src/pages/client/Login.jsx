import { useState, useEffect } from 'react';
import { useNavigate, Navigate } from 'react-router-dom';

const API = '/api/client';

export default function ClientLogin() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const [checking, setChecking] = useState(true);
  const [hasToken, setHasToken] = useState(false);

  useEffect(() => {
    try { setHasToken(!!sessionStorage.getItem('client_token')); } catch(e) {}
    setChecking(false);
  }, []);

  if (checking) return null;
  if (hasToken) return <Navigate to="/client/dashboard" replace />;

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const res = await fetch(`${API}/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
      });
      if (!res.ok) { const d = await res.json(); throw new Error(d.error || 'Login failed'); }
      const data = await res.json();
      sessionStorage.setItem('client_token', data.token);
      sessionStorage.setItem('client_user', JSON.stringify(data.user));
      navigate('/client/dashboard');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 bg-gray-50">
      <div className="w-full max-w-sm">
        <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6">
          <div className="text-center mb-5">
            <div className="w-12 h-12 bg-teal-500 rounded-xl flex items-center justify-center mx-auto mb-3">
              <span className="text-white font-bold text-xl">C</span>
            </div>
            <h1 className="text-xl font-bold text-gray-900">Client Login</h1>
            <p className="text-xs text-gray-500">Straightway Couriers — Track & Manage</p>
          </div>
          {error && <div className="bg-red-50 border border-red-200 rounded-lg p-2.5 mb-3"><p className="text-red-700 text-xs">{error}</p></div>}
          <form onSubmit={handleLogin} className="space-y-3">
            <input type="text" placeholder="Username" required value={username} onChange={(e) => setUsername(e.target.value)}
              className="w-full px-3 py-2.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500" />
            <input type="password" placeholder="Password" required value={password} onChange={(e) => setPassword(e.target.value)}
              className="w-full px-3 py-2.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500" />
            <button type="submit" disabled={loading}
              className="w-full py-2.5 text-sm bg-teal-500 text-white font-semibold rounded-lg hover:bg-teal-600 disabled:opacity-50">
              {loading ? 'Logging in...' : 'Login'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
