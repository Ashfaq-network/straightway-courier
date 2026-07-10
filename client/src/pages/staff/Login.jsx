import { useState, useEffect } from 'react';
import { useNavigate, Navigate } from 'react-router-dom';

const API = '/api/staff';

export default function StaffLogin() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const [checkingToken, setCheckingToken] = useState(true);
  const [hasToken, setHasToken] = useState(false);

  useEffect(() => {
    try {
      setHasToken(!!localStorage.getItem('staff_token'));
    } catch(e) {}
    setCheckingToken(false);
  }, []);

  if (checkingToken) return null;

  if (hasToken) {
    return <Navigate to="/staff/dashboard" replace />;
  }

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

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Login failed');
      }

      const data = await res.json();
      localStorage.setItem('staff_token', data.token);
      navigate('/staff/dashboard');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center px-4 py-16" style={{minHeight: '60vh'}}>
      <div className="w-full max-w-sm">
        <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6">
          <div className="text-center mb-5">
            <div className="w-10 h-10 bg-purple-500 rounded-xl flex items-center justify-center mx-auto mb-2">
              <span className="text-white font-bold text-lg">S</span>
            </div>
            <h1 className="text-xl font-bold text-gray-900">Staff Login</h1>
            <p className="text-xs text-gray-500">Straightway Couriers — Delivery Portal</p>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-2.5 mb-3">
              <p className="text-red-700 text-xs">{error}</p>
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-3">
            <input type="text" placeholder="Username" required value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full px-3 py-2.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500" />
            <input type="password" placeholder="Password" required value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-3 py-2.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500" />
            <button type="submit" disabled={loading}
              className="w-full py-2.5 text-sm bg-purple-500 text-white font-semibold rounded-lg hover:bg-purple-600 disabled:opacity-50 transition-colors">
              {loading ? 'Logging in...' : 'Login'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
