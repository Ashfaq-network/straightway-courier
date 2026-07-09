import { Router } from 'express';
import bcrypt from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid';
import { query, initDB } from '../db.js';
import { generateToken, authenticateToken } from '../middleware/auth.js';
import { sendTrackingEmail } from '../email.js';

const router = Router();

router.post('/login', async (req, res) => {
  const { username, password } = req.body;

  const result = await query('SELECT * FROM admins WHERE username = $1', [username]);
  const admin = result.rows[0];

  if (!admin || !bcrypt.compareSync(password, admin.password_hash)) {
    return res.status(401).json({ error: 'Invalid credentials' });
  }

  const token = generateToken({ id: admin.id, username: admin.username });
  res.json({ token });
});

router.get('/shipments', authenticateToken, async (req, res) => {
  const result = await query('SELECT * FROM shipments ORDER BY created_at DESC');
  res.json(result.rows);
});

router.post('/shipments', authenticateToken, async (req, res) => {
  const {
    sender_name, sender_phone, sender_email, receiver_name, receiver_phone, receiver_email,
    origin, destination, weight, status, estimated_delivery, notes
  } = req.body;

  const tracking_number = 'SWC-' + uuidv4().slice(0, 8).toUpperCase();

  const result = await query(`
    INSERT INTO shipments (tracking_number, sender_name, sender_phone, sender_email, receiver_name, receiver_phone, receiver_email, origin, destination, weight, status, estimated_delivery, notes)
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
    RETURNING *
  `, [
    tracking_number, sender_name, sender_phone, sender_email, receiver_name, receiver_phone, receiver_email,
    origin, destination, weight, status || 'pending', estimated_delivery, notes
  ]);

  const shipment = result.rows[0];

  await query(`
    INSERT INTO tracking_events (shipment_id, status, location, description)
    VALUES ($1, $2, $3, $4)
  `, [shipment.id, 'pending', origin, 'Shipment created']);

  if (receiver_email) {
    sendTrackingEmail({
      to: receiver_email,
      trackingNumber: tracking_number,
      receiverName: receiver_name,
      senderName: sender_name,
    }).catch(err => console.error('Email send failed:', err.message));
  }

  res.status(201).json(shipment);
});

router.put('/shipments/:id', authenticateToken, async (req, res) => {
  const { id } = req.params;
  const {
    sender_name, sender_phone, sender_email, receiver_name, receiver_phone, receiver_email,
    origin, destination, weight, status, estimated_delivery, notes
  } = req.body;

  await query(`
    UPDATE shipments SET sender_name=$1, sender_phone=$2, sender_email=$3, receiver_name=$4, receiver_phone=$5, receiver_email=$6,
    origin=$7, destination=$8, weight=$9, status=$10, estimated_delivery=$11, notes=$12
    WHERE id=$13
  `, [sender_name, sender_phone, sender_email, receiver_name, receiver_phone, receiver_email,
    origin, destination, weight, status, estimated_delivery, notes, id]);

  const result = await query('SELECT * FROM shipments WHERE id = $1', [id]);
  res.json(result.rows[0]);
});

router.delete('/shipments/:id', authenticateToken, async (req, res) => {
  const { id } = req.params;
  await query('DELETE FROM shipments WHERE id = $1', [id]);
  res.json({ message: 'Shipment deleted' });
});

router.post('/shipments/:id/events', authenticateToken, async (req, res) => {
  const { id } = req.params;
  const { status, location, description } = req.body;

  const result = await query(`
    INSERT INTO tracking_events (shipment_id, status, location, description)
    VALUES ($1, $2, $3, $4)
    RETURNING *
  `, [id, status, location, description]);

  if (status) {
    await query('UPDATE shipments SET status = $1 WHERE id = $2', [status, id]);
  }

  res.status(201).json(result.rows[0]);
});

router.get('/shipments/:id/events', authenticateToken, async (req, res) => {
  const { id } = req.params;
  const result = await query(
    'SELECT * FROM tracking_events WHERE shipment_id = $1 ORDER BY timestamp ASC',
    [id]
  );
  res.json(result.rows);
});

router.post('/shipments/:id/send-email', authenticateToken, async (req, res) => {
  const { id } = req.params;
  const result = await query('SELECT * FROM shipments WHERE id = $1', [id]);
  const shipment = result.rows[0];

  if (!shipment) return res.status(404).json({ error: 'Shipment not found' });
  if (!shipment.receiver_email) return res.status(400).json({ error: 'No receiver email on file' });

  try {
    await sendTrackingEmail({
      to: shipment.receiver_email,
      trackingNumber: shipment.tracking_number,
      receiverName: shipment.receiver_name,
      senderName: shipment.sender_name,
    });
    res.json({ message: 'Email sent' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
