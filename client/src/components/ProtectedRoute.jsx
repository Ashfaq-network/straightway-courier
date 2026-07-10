import { Navigate } from 'react-router-dom';

export function AdminRoute({ children }) {
  const token = localStorage.getItem('swc_token');
  if (!token) return <Navigate to="/admin" replace />;
  return children;
}

export function StaffRoute({ children }) {
  const token = localStorage.getItem('staff_token');
  if (!token) return <Navigate to="/staff" replace />;
  return children;
}
