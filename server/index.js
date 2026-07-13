import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import path from 'path';
import { fileURLToPath } from 'url';
import { initDB } from './db.js';
import trackingRoutes from './routes/tracking.js';
import adminRoutes from './routes/admin.js';
import staffRoutes from './routes/staff.js';
import clientRoutes from './routes/client.js';
import contactRoutes from './routes/contact.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();
const PORT = process.env.PORT || 5000;

const allowedOrigins = (process.env.CORS_ORIGIN || 'http://localhost:5173,http://localhost:5000').split(',');
app.use(helmet());
app.use(cors({ origin: (origin, cb) => { if (!origin || allowedOrigins.includes(origin)) cb(null, true); else cb(new Error('Not allowed by CORS')); }, credentials: true }));
app.use(express.json({ limit: '1mb' }));

const loginLimiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 10, message: { error: 'Too many login attempts, try again later' }, standardHeaders: true, legacyHeaders: false });
app.use('/api/admin/login', loginLimiter);
app.use('/api/staff/login', loginLimiter);
app.use('/api/client/login', loginLimiter);
const contactLimiter = rateLimit({ windowMs: 60 * 60 * 1000, max: 5, message: { error: 'Too many messages, try again later' }, standardHeaders: true, legacyHeaders: false });
app.use('/api/contact', contactLimiter);

function stripHtml(obj) {
  if (typeof obj === 'string') return obj.replace(/<[^>]*>/g, '');
  if (obj && typeof obj === 'object') for (const k in obj) obj[k] = stripHtml(obj[k]);
  return obj;
}
app.use((req, res, next) => { if (req.body) req.body = stripHtml(req.body); next(); });

app.use('/api/track', trackingRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/staff', staffRoutes);
app.use('/api/client', clientRoutes);
app.use('/api/contact', contactRoutes);

if (process.env.VERCEL !== '1') {
  initDB().then(() => {
    if (process.env.NODE_ENV === 'production') {
      app.use(express.static(path.join(__dirname, '..', 'client', 'dist')));
      app.get('*', (req, res) => {
        res.sendFile(path.join(__dirname, '..', 'client', 'dist', 'index.html'));
      });
    }

    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  }).catch(err => {
    console.error('DB init failed:', err);
    process.exit(1);
  });
}

export default app;
