import { Navigate } from 'react-router-dom';

export default function ProtectedRoute({ children }) {
  const token = localStorage.getItem('swc_token');
  if (!token) return <Navigate to="/admin" replace />;
  return children;
}
