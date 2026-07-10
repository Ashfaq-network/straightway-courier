import { Router } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { query } from '../db.js';
import { sendTrackingEmail } from '../email.js';
import { requireAdmin } from '../middleware/auth.js';

const router = Router();
const JWT_SECRET = process.env.JWT_SECRET || 'fallback-secret-change-me';

// ─── Auth ───────────────────────────────────────────────────────────
router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    const result = await query('SELECT * FROM admins WHERE username = $1', [username]);
    const admin = result.rows[0];
    if (!admin || !(await bcrypt.compare(password, admin.password_hash))) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    const token = jwt.sign({ id: admin.id, username: admin.username, role: admin.role || 'admin' }, JWT_SECRET, { expiresIn: '7d' });
    res.json({ token, user: { id: admin.id, username: admin.username, role: admin.role } });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// All routes below require admin auth
router.use(requireAdmin);

// ─── Stats ──────────────────────────────────────────────────────────
router.get('/stats', async (req, res) => {
  try {
    const { username, password } = req.body;
    const result = await query('SELECT * FROM admins WHERE username = $1', [username]);
    const admin = result.rows[0];
    if (!admin || !(await bcrypt.compare(password, admin.password_hash))) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    const token = jwt.sign({ id: admin.id, username: admin.username, role: admin.role || 'admin' }, JWT_SECRET, { expiresIn: '7d' });
    res.json({ token, user: { id: admin.id, username: admin.username, role: admin.role } });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ─── Stats ──────────────────────────────────────────────────────────
router.get('/stats', async (req, res) => {
  try {
    const total = await query('SELECT COUNT(*) FROM shipments');
    const today = await query("SELECT COUNT(*) FROM shipments WHERE DATE(created_at) = CURRENT_DATE");
    const delivered = await query("SELECT COUNT(*) FROM shipments WHERE status = 'delivered'");
    const pending = await query("SELECT COUNT(*) FROM shipments WHERE status = 'pending'");
    const inWarehouse = await query("SELECT COUNT(*) FROM shipments WHERE status = 'at_warehouse'");
    const outForDelivery = await query("SELECT COUNT(*) FROM shipments WHERE status = 'out_for_delivery'");
    const failed = await query("SELECT COUNT(*) FROM shipments WHERE status = 'failed'");
    const returned = await query("SELECT COUNT(*) FROM shipments WHERE status = 'returned'");
    res.json({
      total: parseInt(total.rows[0].count),
      today: parseInt(today.rows[0].count),
      delivered: parseInt(delivered.rows[0].count),
      pending: parseInt(pending.rows[0].count),
      inWarehouse: parseInt(inWarehouse.rows[0].count),
      outForDelivery: parseInt(outForDelivery.rows[0].count),
      failed: parseInt(failed.rows[0].count),
      returned: parseInt(returned.rows[0].count),
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ─── Shipments CRUD ─────────────────────────────────────────────────
router.get('/shipments', async (req, res) => {
  try {
    const { search, status, startDate, endDate } = req.query;
    let sql = `
      SELECT s.*, 
        pickup.name AS pickup_staff_name, pickup.phone AS pickup_staff_phone,
        delivery.name AS delivery_staff_name, delivery.phone AS delivery_staff_phone
      FROM shipments s
      LEFT JOIN delivery_staff pickup ON s.assigned_pickup_staff_id = pickup.id
      LEFT JOIN delivery_staff delivery ON s.assigned_delivery_staff_id = delivery.id
      WHERE 1=1
    `;
    const params = [];
    let idx = 1;
    if (search) {
      sql += ` AND (s.tracking_number ILIKE $${idx} OR s.sender_name ILIKE $${idx} OR s.receiver_name ILIKE $${idx} OR s.sender_phone ILIKE $${idx} OR s.receiver_phone ILIKE $${idx})`;
      params.push(`%${search}%`);
      idx++;
    }
    if (status) {
      sql += ` AND s.status = $${idx}`;
      params.push(status);
      idx++;
    }
    if (startDate) {
      sql += ` AND s.created_at >= $${idx}`;
      params.push(startDate);
      idx++;
    }
    if (endDate) {
      sql += ` AND s.created_at <= $${idx}`;
      params.push(endDate);
      idx++;
    }
    sql += ' ORDER BY s.created_at DESC';
    const result = await query(sql, params);
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/shipments/:id', async (req, res) => {
  try {
    const result = await query(`
      SELECT s.*, 
        pickup.name AS pickup_staff_name, pickup.phone AS pickup_staff_phone,
        delivery.name AS delivery_staff_name, delivery.phone AS delivery_staff_phone
      FROM shipments s
      LEFT JOIN delivery_staff pickup ON s.assigned_pickup_staff_id = pickup.id
      LEFT JOIN delivery_staff delivery ON s.assigned_delivery_staff_id = delivery.id
      WHERE s.id = $1
    `, [req.params.id]);
    if (!result.rows[0]) return res.status(404).json({ error: 'Shipment not found' });
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/tracking/:tracking_number', async (req, res) => {
  try {
    const result = await query('SELECT * FROM shipments WHERE tracking_number = $1', [req.params.tracking_number]);
    if (!result.rows[0]) return res.status(404).json({ error: 'Shipment not found' });
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/shipments/:id/events', async (req, res) => {
  try {
    const shipment = await query('SELECT id FROM shipments WHERE id = $1', [req.params.id]);
    if (!shipment.rows[0]) return res.status(404).json({ error: 'Shipment not found' });
    const events = await query('SELECT * FROM tracking_events WHERE shipment_id = $1 ORDER BY timestamp ASC', [shipment.rows[0].id]);
    const attempts = await query('SELECT * FROM delivery_attempts WHERE shipment_id = $1 ORDER BY attempt_number ASC', [shipment.rows[0].id]);
    res.json({ events: events.rows, delivery_attempts: attempts.rows });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/shipments/tracking/:tracking_number/events', async (req, res) => {
  try {
    const shipment = await query('SELECT id FROM shipments WHERE tracking_number = $1', [req.params.tracking_number]);
    if (!shipment.rows[0]) return res.status(404).json({ error: 'Shipment not found' });
    const events = await query('SELECT * FROM tracking_events WHERE shipment_id = $1 ORDER BY timestamp ASC', [shipment.rows[0].id]);
    const attempts = await query('SELECT * FROM delivery_attempts WHERE shipment_id = $1 ORDER BY attempt_number ASC', [shipment.rows[0].id]);
    res.json({ events: events.rows, delivery_attempts: attempts.rows });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/shipments', async (req, res) => {
  try {
    const {
      tracking_number, sender_name, sender_phone, sender_email, sender_address,
      receiver_name, receiver_phone, receiver_email, receiver_address,
      origin, destination, parcel_type, parcel_description, num_items, weight,
      delivery_type, cod_amount, delivery_charge, payment_status,
      special_instructions, estimated_delivery, notes,
      assigned_pickup_staff_id, assigned_delivery_staff_id
    } = req.body;

    const result = await query(`
      INSERT INTO shipments (
        tracking_number, sender_name, sender_phone, sender_email, sender_address,
        receiver_name, receiver_phone, receiver_email, receiver_address,
        origin, destination, parcel_type, parcel_description, num_items, weight,
        delivery_type, cod_amount, delivery_charge, payment_status,
        special_instructions, estimated_delivery, notes,
        assigned_pickup_staff_id, assigned_delivery_staff_id
      ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18,$19,$20,$21,$22,$23,$24)
      RETURNING *
    `, [
      tracking_number, sender_name, sender_phone || null, sender_email || null, sender_address || null,
      receiver_name, receiver_phone || null, receiver_email || null, receiver_address || null,
      origin, destination, parcel_type || null, parcel_description || null, num_items || 1, weight || null,
      delivery_type || null, cod_amount || 0, delivery_charge || 0, payment_status || 'pending',
      special_instructions || null, estimated_delivery || null, notes || null,
      assigned_pickup_staff_id || null, assigned_delivery_staff_id || null
    ]);

    const shipment = result.rows[0];

    await query(`
      INSERT INTO tracking_events (shipment_id, event_type, status, description)
      VALUES ($1, 'order_created', 'Order Created', 'Shipment created and registered in system')
    `, [shipment.id]);

    await query(`
      INSERT INTO activity_logs (admin_id, action, details)
      VALUES ($1, 'create_shipment', $2)
    `, [req.user?.id || null, `Created shipment ${tracking_number}`]);

    if (receiver_email) {
      sendTrackingEmail(shipment).catch(() => {});
    }

    res.status(201).json(shipment);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.put('/shipments/:id', async (req, res) => {
  try {
    const {
      sender_name, sender_phone, sender_email, sender_address,
      receiver_name, receiver_phone, receiver_email, receiver_address,
      origin, destination, parcel_type, parcel_description, num_items, weight,
      delivery_type, cod_amount, delivery_charge, payment_status,
      special_instructions, estimated_delivery, notes,
      assigned_pickup_staff_id, assigned_delivery_staff_id
    } = req.body;

    const result = await query(`
      UPDATE shipments SET
        sender_name=$1, sender_phone=$2, sender_email=$3, sender_address=$4,
        receiver_name=$5, receiver_phone=$6, receiver_email=$7, receiver_address=$8,
        origin=$9, destination=$10, parcel_type=$11, parcel_description=$12,
        num_items=$13, weight=$14, delivery_type=$15, cod_amount=$16,
        delivery_charge=$17, payment_status=$18, special_instructions=$19,
        estimated_delivery=$20, notes=$21, assigned_pickup_staff_id=$22,
        assigned_delivery_staff_id=$23, updated_at=CURRENT_TIMESTAMP
      WHERE id=$24 RETURNING *
    `, [
      sender_name, sender_phone || null, sender_email || null, sender_address || null,
      receiver_name, receiver_phone || null, receiver_email || null, receiver_address || null,
      origin, destination, parcel_type || null, parcel_description || null,
      num_items || 1, weight || null, delivery_type || null,
      cod_amount || 0, delivery_charge || 0, payment_status || 'pending',
      special_instructions || null, estimated_delivery || null, notes || null,
      assigned_pickup_staff_id || null, assigned_delivery_staff_id || null,
      req.params.id
    ]);

    if (!result.rows[0]) return res.status(404).json({ error: 'Shipment not found' });

    await query(`
      INSERT INTO activity_logs (admin_id, action, details)
      VALUES ($1, 'update_shipment', $2)
    `, [req.user?.id || null, `Updated shipment #${req.params.id}`]);

    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.delete('/shipments/:id', async (req, res) => {
  try {
    const result = await query('DELETE FROM shipments WHERE id = $1 RETURNING *', [req.params.id]);
    if (!result.rows[0]) return res.status(404).json({ error: 'Shipment not found' });
    await query(`
      INSERT INTO activity_logs (admin_id, action, details)
      VALUES ($1, 'delete_shipment', $2)
    `, [req.user?.id || null, `Deleted shipment #${req.params.id}`]);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ─── Status Updates ─────────────────────────────────────────────────
router.put('/shipments/:id/status', async (req, res) => {
  try {
    const { status, description, location, staff_name } = req.body;
    const validStatuses = [
      'pending', 'picked_up', 'at_warehouse', 'sorted', 'out_for_delivery',
      'customer_contacted', 'delivered', 'returned', 'rescheduled', 'failed'
    ];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ error: 'Invalid status' });
    }

    const shipment = await query('UPDATE shipments SET status=$1, updated_at=CURRENT_TIMESTAMP WHERE id=$2 RETURNING *', [status, req.params.id]);
    if (!shipment.rows[0]) return res.status(404).json({ error: 'Shipment not found' });

    const eventType = status;
    const statusLabel = status.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');

    await query(`
      INSERT INTO tracking_events (shipment_id, event_type, status, description, location, staff_name)
      VALUES ($1, $2, $3, $4, $5, $6)
    `, [req.params.id, eventType, statusLabel, description || statusLabel, location || null, staff_name || null]);

    await query(`
      INSERT INTO activity_logs (admin_id, action, details)
      VALUES ($1, 'update_status', $2)
    `, [req.user?.id || null, `Updated shipment #${req.params.id} to ${status}`]);

    if (shipment.rows[0].receiver_email && ['picked_up', 'at_warehouse', 'out_for_delivery', 'delivered', 'rescheduled', 'failed'].includes(status)) {
      const events = await query('SELECT * FROM tracking_events WHERE shipment_id = $1 ORDER BY timestamp ASC', [req.params.id]);
      sendTrackingEmail({ ...shipment.rows[0], events: events.rows }).catch(() => {});
    }

    res.json(shipment.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ─── Delivery Attempts ──────────────────────────────────────────────
router.post('/shipments/:id/delivery-attempt', async (req, res) => {
  try {
    const { reason, custom_note, attempted_by } = req.body;
    const shipment = await query('SELECT * FROM shipments WHERE id = $1', [req.params.id]);
    if (!shipment.rows[0]) return res.status(404).json({ error: 'Shipment not found' });

    const attemptCount = await query('SELECT COUNT(*) FROM delivery_attempts WHERE shipment_id = $1', [req.params.id]);
    const attemptNumber = parseInt(attemptCount.rows[0].count) + 1;

    const result = await query(`
      INSERT INTO delivery_attempts (shipment_id, attempt_number, status, reason, custom_note, attempted_by)
      VALUES ($1, $2, 'failed', $3, $4, $5) RETURNING *
    `, [req.params.id, attemptNumber, reason, custom_note || null, attempted_by || null]);

    await query(`
      INSERT INTO tracking_events (shipment_id, event_type, status, description, staff_name)
      VALUES ($1, 'delivery_attempt', 'Delivery Attempt ' || $2, $3, $4)
    `, [req.params.id, attemptNumber, reason + (custom_note ? ': ' + custom_note : ''), attempted_by || null]);

    // Auto-notify if failed after 3+ attempts
    if (attemptNumber >= 3) {
      await query(`
        INSERT INTO tracking_events (shipment_id, event_type, status, description)
        VALUES ($1, 'storage_charges', 'Storage Charges May Apply', 'Delivery failed after multiple attempts. Storage or re-delivery charges may apply per company policy.')
      `, [req.params.id]);
    }

    await query(`
      INSERT INTO activity_logs (admin_id, action, details)
      VALUES ($1, 'delivery_attempt', $2)
    `, [req.user?.id || null, `Delivery attempt #${attemptNumber} for shipment #${req.params.id}: ${reason}`]);

    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ─── Resend Email ───────────────────────────────────────────────────
router.post('/shipments/:id/resend-email', async (req, res) => {
  try {
    const result = await query('SELECT * FROM shipments WHERE id = $1', [req.params.id]);
    if (!result.rows[0]) return res.status(404).json({ error: 'Shipment not found' });
    const shipment = result.rows[0];
    const events = await query('SELECT * FROM tracking_events WHERE shipment_id = $1 ORDER BY timestamp ASC', [req.params.id]);
    shipment.events = events.rows;
    await sendTrackingEmail(shipment);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ─── Delivery Staff Management ──────────────────────────────────────
router.get('/staff', async (req, res) => {
  try {
    const result = await query('SELECT id, name, phone, email, username, is_active, created_at FROM delivery_staff ORDER BY name');
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/staff', async (req, res) => {
  try {
    const { name, phone, email, username, password } = req.body;
    const password_hash = await bcrypt.hash(password, 10);
    const result = await query(`
      INSERT INTO delivery_staff (name, phone, email, username, password_hash)
      VALUES ($1, $2, $3, $4, $5) RETURNING id, name, phone, email, username, is_active, created_at
    `, [name, phone, email || null, username, password_hash]);
    await query(`
      INSERT INTO activity_logs (admin_id, action, details)
      VALUES ($1, 'create_staff', $2)
    `, [req.user?.id || null, `Created delivery staff: ${name}`]);
    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.put('/staff/:id', async (req, res) => {
  try {
    const { name, phone, email, username, is_active } = req.body;
    const result = await query(`
      UPDATE delivery_staff SET name=$1, phone=$2, email=$3, username=$4, is_active=$5
      WHERE id=$6 RETURNING id, name, phone, email, username, is_active, created_at
    `, [name, phone, email || null, username, is_active !== undefined ? is_active : true, req.params.id]);
    if (!result.rows[0]) return res.status(404).json({ error: 'Staff not found' });
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.delete('/staff/:id', async (req, res) => {
  try {
    await query('DELETE FROM delivery_staff WHERE id = $1', [req.params.id]);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ─── Activity Log ───────────────────────────────────────────────────
router.get('/activity-logs', async (req, res) => {
  try {
    const result = await query('SELECT * FROM activity_logs ORDER BY timestamp DESC LIMIT 100');
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ─── Contact Messages ───────────────────────────────────────────────
router.get('/messages', async (req, res) => {
  try {
    const result = await query('SELECT * FROM contact_messages ORDER BY created_at DESC');
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.delete('/messages/:id', async (req, res) => {
  try {
    await query('DELETE FROM contact_messages WHERE id = $1', [req.params.id]);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
