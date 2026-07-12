import { Router } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { query } from '../db.js';
import { requireStaff } from '../middleware/auth.js';

const router = Router();
const JWT_SECRET = process.env.JWT_SECRET || 'fallback-secret-change-me';

router.post('/login', async (req, res) => {
  try {
    const count = await query('SELECT COUNT(*) FROM delivery_staff');
    if (parseInt(count.rows[0].count) === 0) {
      const hash = await bcrypt.hash('staff123', 10);
      await query(`INSERT INTO delivery_staff (name, phone, email, username, password_hash, role)
        VALUES ($1, $2, $3, $4, $5, $6)`,
        ['Kumar Sangakkara', '+94 77 123 4567', 'kumar@straightway.lk', 'staff1', hash, 'delivery_rider']);
    }

    const { username, password } = req.body;
    const result = await query('SELECT * FROM delivery_staff WHERE username = $1 AND is_active = true', [username]);
    const staff = result.rows[0];
    if (!staff || !(await bcrypt.compare(password, staff.password_hash))) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    const token = jwt.sign({ id: staff.id, name: staff.name, role: staff.role, username: staff.username }, JWT_SECRET, { expiresIn: '7d' });
    res.json({ token, user: { id: staff.id, name: staff.name, role: staff.role, username: staff.username } });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.use(requireStaff);

router.get('/profile', async (req, res) => {
  try {
    const result = await query('SELECT id, name, phone, email, username, role FROM delivery_staff WHERE id = $1', [req.user.id]);
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/my-shipments', async (req, res) => {
  try {
    const { role } = req.user;
    let sql;
    if (role === 'pickup_driver') {
      sql = `SELECT * FROM shipments WHERE pickup_driver_id = $1 AND status NOT IN ('delivered','returned_to_sender') ORDER BY created_at DESC`;
    } else if (role === 'delivery_rider') {
      sql = `SELECT * FROM shipments WHERE delivery_rider_id = $1 AND status NOT IN ('delivered','returned_to_sender') ORDER BY created_at DESC`;
    } else {
      sql = `SELECT * FROM shipments WHERE (pickup_driver_id = $1 OR delivery_rider_id = $1) AND status NOT IN ('delivered','returned_to_sender') ORDER BY created_at DESC`;
    }
    const result = await query(sql, [req.user.id]);
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.put('/shipments/:id/status', async (req, res) => {
  try {
    const { status, description, location, receiver_signature, delivery_photo, delivery_remarks } = req.body;
    const validStatuses = [
      'pickup_requested', 'picked_up', 'at_sorting_center', 'sorted', 'out_for_delivery',
      'customer_contacted', 'delivered', 'failed_delivery', 'returned_to_sender', 'rescheduled'
    ];
    if (!validStatuses.includes(status)) return res.status(400).json({ error: 'Invalid status' });

    let extra = '';
    const vals = [];
    if (status === 'delivered') {
      extra = ', delivered_at=CURRENT_TIMESTAMP, delivered_by=$7, receiver_signature=$8, delivery_photo=$9, delivery_remarks=$10';
      vals.push(req.user.name, receiver_signature || null, delivery_photo || null, delivery_remarks || null);
    }
    if (status === 'picked_up') extra = ', pickup_completed_at=CURRENT_TIMESTAMP';

    const shipment = await query(`UPDATE shipments SET status=$1, updated_at=CURRENT_TIMESTAMP${extra} WHERE id=$2 RETURNING *`,
      [status, req.params.id, ...vals]);
    if (!shipment.rows[0]) return res.status(404).json({ error: 'Shipment not found' });

    const statusLabel = status.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
    await query(`INSERT INTO tracking_events (shipment_id, event_type, status, description, location, staff_name)
      VALUES ($1, $2, $3, $4, $5, $6)`,
      [req.params.id, status, statusLabel, description || statusLabel, location || null, req.user.name]);

    res.json(shipment.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/shipments/:id/delivery-attempt', async (req, res) => {
  try {
    const { reason, custom_note } = req.body;
    const attemptCount = await query('SELECT COUNT(*) FROM delivery_attempts WHERE shipment_id = $1', [req.params.id]);
    const attemptNumber = parseInt(attemptCount.rows[0].count) + 1;
    await query(`INSERT INTO delivery_attempts (shipment_id, attempt_number, status, reason, custom_note, attempted_by)
      VALUES ($1, $2, 'failed', $3, $4, $5)`,
      [req.params.id, attemptNumber, reason, custom_note || null, req.user.name]);
    await query(`INSERT INTO tracking_events (shipment_id, event_type, status, description, staff_name)
      VALUES ($1, 'delivery_attempt', 'Delivery Attempt ' || $2, $3, $4)`,
      [req.params.id, attemptNumber, reason + (custom_note ? ': ' + custom_note : ''), req.user.name]);
    if (attemptNumber >= 3) {
      await query(`INSERT INTO tracking_events (shipment_id, event_type, status, description)
        VALUES ($1, 'storage_charges', 'Storage Charges May Apply', 'Delivery failed after multiple attempts')`, [req.params.id]);
    }
    res.json({ success: true, attempt_number: attemptNumber });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
