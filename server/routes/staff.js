import { Router } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { query } from '../db.js';
import { requireStaff } from '../middleware/auth.js';

const router = Router();
const JWT_SECRET = process.env.JWT_SECRET || 'fallback-secret-change-me';

// ─── Login ──────────────────────────────────────────────────────────
router.post('/login', async (req, res) => {
  try {
    // Auto-create default staff if none exists
    const count = await query('SELECT COUNT(*) FROM delivery_staff');
    if (parseInt(count.rows[0].count) === 0) {
      const hash = await bcrypt.hash('staff123', 10);
      await query(
        'INSERT INTO delivery_staff (name, phone, email, username, password_hash) VALUES ($1, $2, $3, $4, $5)',
        ['Kumar Sangakkara', '+94 77 123 4567', 'kumar@straightway.lk', 'staff1', hash]
      );
    }

    const { username, password } = req.body;
    const result = await query('SELECT * FROM delivery_staff WHERE username = $1 AND is_active = true', [username]);
    const staff = result.rows[0];
    if (!staff || !(await bcrypt.compare(password, staff.password_hash))) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    const token = jwt.sign({ id: staff.id, name: staff.name, role: 'staff' }, JWT_SECRET, { expiresIn: '7d' });
    res.json({ token, user: { id: staff.id, name: staff.name, username: staff.username, role: 'staff' } });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// All routes below require staff auth
router.use(requireStaff);

// ─── My Assigned Shipments ──────────────────────────────────────────
router.get('/my-shipments', async (req, res) => {
  try {
    const result = await query(`
      SELECT * FROM shipments
      WHERE (assigned_pickup_staff_id = $1 OR assigned_delivery_staff_id = $1)
      AND status != 'delivered' AND status != 'returned'
      ORDER BY created_at DESC
    `, [req.user.id]);
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ─── Update Status ──────────────────────────────────────────────────
router.put('/shipments/:id/status', async (req, res) => {
  try {
    const { status, description, location } = req.body;
    const validStatuses = [
      'pending', 'picked_up', 'at_warehouse', 'sorted', 'out_for_delivery',
      'customer_contacted', 'delivered', 'returned', 'rescheduled', 'failed'
    ];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ error: 'Invalid status' });
    }

    const shipment = await query(
      'UPDATE shipments SET status=$1, updated_at=CURRENT_TIMESTAMP WHERE id=$2 RETURNING *',
      [status, req.params.id]
    );
    if (!shipment.rows[0]) return res.status(404).json({ error: 'Shipment not found' });

    const statusLabel = status.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');

    await query(`
      INSERT INTO tracking_events (shipment_id, event_type, status, description, location, staff_name)
      VALUES ($1, $2, $3, $4, $5, $6)
    `, [req.params.id, status, statusLabel, description || statusLabel, location || null, req.user.name]);

    res.json(shipment.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ─── Delivery Attempt ───────────────────────────────────────────────
router.post('/shipments/:id/delivery-attempt', async (req, res) => {
  try {
    const { reason, custom_note } = req.body;
    const attemptCount = await query('SELECT COUNT(*) FROM delivery_attempts WHERE shipment_id = $1', [req.params.id]);
    const attemptNumber = parseInt(attemptCount.rows[0].count) + 1;

    await query(`
      INSERT INTO delivery_attempts (shipment_id, attempt_number, status, reason, custom_note, attempted_by)
      VALUES ($1, $2, 'failed', $3, $4, $5)
    `, [req.params.id, attemptNumber, reason, custom_note || null, req.user.name]);

    await query(`
      INSERT INTO tracking_events (shipment_id, event_type, status, description, staff_name)
      VALUES ($1, 'delivery_attempt', 'Delivery Attempt ' || $2, $3, $4)
    `, [req.params.id, attemptNumber, reason + (custom_note ? ': ' + custom_note : ''), req.user.name]);

    if (attemptNumber >= 3) {
      await query(`
        INSERT INTO tracking_events (shipment_id, event_type, status, description)
        VALUES ($1, 'storage_charges', 'Storage Charges May Apply', 'Delivery failed after multiple attempts. Storage or re-delivery charges may apply per company policy.')
      `, [req.params.id]);
    }

    res.json({ success: true, attempt_number: attemptNumber });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ─── Profile ────────────────────────────────────────────────────────
router.get('/profile', async (req, res) => {
  try {
    const result = await query('SELECT id, name, phone, email, username FROM delivery_staff WHERE id = $1', [req.user.id]);
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
