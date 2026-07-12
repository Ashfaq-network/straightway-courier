import jwt from 'jsonwebtoken';

export const JWT_SECRET = process.env.JWT_SECRET || 'straightway-secret-key-change-in-production';

export function generateToken(payload) {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: '7d' });
}

export function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'Access denied' });
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch {
    res.status(403).json({ error: 'Invalid token' });
  }
}

export function requireRole(...roles) {
  return (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    if (!token) return res.status(401).json({ error: 'Access denied' });
    try {
      const decoded = jwt.verify(token, JWT_SECRET);
      if (!roles.includes(decoded.role)) {
        return res.status(403).json({ error: `Requires one of roles: ${roles.join(', ')}` });
      }
      req.user = decoded;
      next();
    } catch {
      res.status(403).json({ error: 'Invalid token' });
    }
  };
}

export const requireAdmin = requireRole('admin', 'office_staff');
export const requireStaff = requireRole('pickup_driver', 'delivery_rider', 'office_staff', 'admin');
