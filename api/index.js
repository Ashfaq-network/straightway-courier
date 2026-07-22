import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import { initDB, query } from '../server/db.js';
import trackingRoutes from '../server/routes/tracking.js';
import adminRoutes from '../server/routes/admin.js';
import staffRoutes from '../server/routes/staff.js';
import contactRoutes from '../server/routes/contact.js';
import clientRoutes from '../server/routes/client.js';
import { sendRegistrationEmail } from '../server/email.js';

const app = express();
let initialized = false;
let initPromise = null;

const allowedOrigins = (process.env.CORS_ORIGIN || 'https://straightwaycourier.vercel.app,https://straightwaycouriers.com,https://www.straightwaycouriers.com,http://localhost:5173,http://localhost:5000').split(',');
app.use(helmet());
app.use(cors({ origin: (origin, cb) => { if (!origin || allowedOrigins.includes(origin)) cb(null, true); else cb(new Error('Not allowed by CORS')); }, credentials: true }));
app.use(express.json({ limit: '1mb' }));

const loginLimiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 10, message: { error: 'Too many login attempts, try again later' }, standardHeaders: true, legacyHeaders: false });
app.use('/api/admin/login', loginLimiter);
app.use('/api/staff/login', loginLimiter);
app.use('/api/client/login', loginLimiter);
const contactLimiter = rateLimit({ windowMs: 60 * 60 * 1000, max: 5, message: { error: 'Too many messages, try again later' }, standardHeaders: true, legacyHeaders: false });
app.use('/api/contact', contactLimiter);
const registerLimiter = rateLimit({ windowMs: 60 * 60 * 1000, max: 10, message: { error: 'Too many registration attempts, try again later' }, standardHeaders: true, legacyHeaders: false });

function stripHtml(obj) {
  if (typeof obj === 'string') return obj.replace(/<[^>]*>/g, '');
  if (obj && typeof obj === 'object') for (const k in obj) obj[k] = stripHtml(obj[k]);
  return obj;
}
app.use((req, res, next) => { if (req.body) req.body = stripHtml(req.body); next(); });

app.use(async (req, res, next) => {
  if (!initialized) {
    if (!initPromise) {
      initPromise = initDB().then(() => { initialized = true; }).catch(err => {
        console.error('DB init failed:', err);
        initPromise = null;
      });
    }
    await initPromise;
    if (!initialized) return res.status(503).json({ error: 'Database not available, try again shortly' });
  }
  next();
});

app.use('/api/track', trackingRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/staff', staffRoutes);
app.use('/api/client', clientRoutes);
app.use('/api/contact', contactRoutes);

app.use('/api/register', registerLimiter);
app.post('/api/register', async (req, res) => {
  try {
    const { company_name, contact_person, phone, email, address, client_type,
      nic_number, business_reg_number, bank_name, bank_branch, bank_account_number, bank_account_holder } = req.body;
    if (!contact_person || !contact_person.trim()) return res.status(400).json({ error: 'Contact person is required' });
    if (!phone || !phone.trim()) return res.status(400).json({ error: 'Phone number is required' });

    const result = await query(`INSERT INTO clients (client_type, company_name, contact_person, phone, email, address,
      nic_number, business_reg_number, bank_name, bank_branch, bank_account_number, bank_account_holder)
      VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12) RETURNING *`,
      [client_type || 'individual', company_name || null, contact_person, phone, email || null, address || null,
      nic_number || null, business_reg_number || null, bank_name || null, bank_branch || null, bank_account_number || null, bank_account_holder || null]);

    sendRegistrationEmail(result.rows[0]).catch(() => {});
    console.log('Registration email queued for:', contact_person, '→ SMTP configured:', !!process.env.SMTP_HOST);

    res.status(201).json({ message: 'Registration successful! We will contact you shortly to set up your account.' });
  } catch (err) {
    res.status(500).json({ error: 'Registration failed. Please try again.' });
  }
});

app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  res.status(500).json({ error: 'Internal server error' });
});

export default app;
