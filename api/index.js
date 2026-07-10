import express from 'express';
import cors from 'cors';
import { initDB } from '../server/db.js';
import trackingRoutes from '../server/routes/tracking.js';
import adminRoutes from '../server/routes/admin.js';
import staffRoutes from '../server/routes/staff.js';
import contactRoutes from '../server/routes/contact.js';

const app = express();
let initialized = false;

app.use(cors());
app.use(express.json());

app.use(async (req, res, next) => {
  if (!initialized) {
    try {
      await initDB();
    } catch (err) {
      console.error('DB init failed:', err);
    }
    initialized = true;
  }
  next();
});

app.use('/api/track', trackingRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/staff', staffRoutes);
app.use('/api/contact', contactRoutes);

app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  res.status(500).json({ error: 'Internal server error' });
});

export default app;
