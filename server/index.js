import express from 'express';
import cors from 'cors';
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

app.use(cors());
app.use(express.json());

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
