import { Router } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { query } from '../db.js';

const router = Router();
const JWT_SECRET = process.env.JWT_SECRET || 'fallback-secret-change-me';

function authenticateClient(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'Access denied' });
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    if (decoded.role !== 'client') return res.status(403).json({ error: 'Client access required' });
    req.client = decoded;
    next();
  } catch {
    res.status(403).json({ error: 'Invalid token' });
  }
}

router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    const result = await query(`SELECT cu.*, c.company_name, c.contact_person, c.phone, c.email
      FROM client_users cu JOIN clients c ON cu.client_id = c.id WHERE cu.username = $1 AND cu.is_active = true AND c.is_active = true`, [username]);
    const user = result.rows[0];
    if (!user || !(await bcrypt.compare(password, user.password_hash))) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    const token = jwt.sign({ id: user.id, client_id: user.client_id, username: user.username, role: 'client' }, JWT_SECRET, { expiresIn: '7d' });
    res.json({ token, user: { id: user.client_id, company_name: user.company_name, contact_person: user.contact_person, phone: user.phone, email: user.email } });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.use(authenticateClient);

router.get('/profile', async (req, res) => {
  try {
    const result = await query('SELECT * FROM clients WHERE id = $1', [req.client.client_id]);
    if (!result.rows[0]) return res.status(404).json({ error: 'Client not found' });
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.put('/profile', async (req, res) => {
  try {
    const { company_name, contact_person, phone, email, address } = req.body;
    const result = await query(`UPDATE clients SET company_name=$1, contact_person=$2, phone=$3, email=$4, address=$5, updated_at=CURRENT_TIMESTAMP WHERE id=$6 RETURNING *`,
      [company_name || null, contact_person, phone, email || null, address || null, req.client.client_id]);
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/pickup-request', async (req, res) => {
  try {
    const { sender_name, sender_phone, sender_address, receiver_name, receiver_phone,
      receiver_address, parcel_type, parcel_description, weight, delivery_type, cod_amount } = req.body;

    const tnResult = await query("SELECT tracking_number FROM shipments WHERE tracking_number LIKE 'SW%' ORDER BY id DESC LIMIT 1");
    let num = 1;
    if (tnResult.rows[0]) {
      const match = tnResult.rows[0].tracking_number.match(/SW(\d+)/);
      if (match) num = parseInt(match[1]) + 1;
    }
    const tracking_number = `SW${String(num).padStart(4, '0')}`;

    const result = await query(`INSERT INTO shipments (client_id, tracking_number, sender_name, sender_phone,
      sender_address, receiver_name, receiver_phone, receiver_address, origin, destination,
      parcel_type, parcel_description, weight, delivery_type, cod_amount, status)
      VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,'pickup_requested') RETURNING *`,
      [req.client.client_id, tracking_number, sender_name, sender_phone, sender_address || null,
      receiver_name, receiver_phone, receiver_address || null, sender_address || 'N/A', receiver_address || 'N/A',
      parcel_type || null, parcel_description || null, weight || null, delivery_type || 'standard', cod_amount || 0]);

    await query(`INSERT INTO tracking_events (shipment_id, event_type, status, description)
      VALUES ($1, 'pickup_requested', 'Pickup Requested', 'Pickup has been requested via client portal')`, [result.rows[0].id]);
    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/shipments', async (req, res) => {
  try {
    const result = await query(`SELECT * FROM shipments WHERE client_id = $1 ORDER BY created_at DESC`, [req.client.client_id]);
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/shipments/:tracking_number', async (req, res) => {
  try {
    const result = await query(`SELECT s.*, c.company_name AS client_name
      FROM shipments s LEFT JOIN clients c ON s.client_id = c.id
      WHERE s.tracking_number = $1 AND s.client_id = $2`,
      [req.params.tracking_number, req.client.client_id]);
    if (!result.rows[0]) return res.status(404).json({ error: 'Shipment not found' });
    const events = await query('SELECT * FROM tracking_events WHERE shipment_id = $1 ORDER BY timestamp ASC', [result.rows[0].id]);
    res.json({ shipment: result.rows[0], events: events.rows });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/reports/invoices', async (req, res) => {
  try {
    const result = await query(`SELECT tracking_number, created_at, delivery_charge, cod_amount, payment_status, status
      FROM shipments WHERE client_id = $1 ORDER BY created_at DESC`, [req.client.client_id]);
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/reports/cod', async (req, res) => {
  try {
    const result = await query(`SELECT tracking_number, cod_amount, payment_status, status, receiver_name, created_at
      FROM shipments WHERE client_id = $1 AND payment_status = 'cod' ORDER BY created_at DESC`, [req.client.client_id]);
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
