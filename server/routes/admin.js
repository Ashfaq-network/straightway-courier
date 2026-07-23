import { Router } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { query } from '../db.js';
import { sendTrackingEmail } from '../email.js';
import { requireAdmin, JWT_SECRET } from '../middleware/auth.js';

const router = Router();

// ─── Auth ───────────────────────────────────────────────────────────
router.post('/login', async (req, res) => {
  try {
    const count = await query('SELECT COUNT(*) FROM admins');
    if (parseInt(count.rows[0].count) === 0) {
      const hash = await bcrypt.hash('salman2001', 10);
      await query('INSERT INTO admins (username, password_hash) VALUES ($1, $2)', ['salman', hash]);
    }

    const { username, password } = req.body;
    if (!username || !password) return res.status(400).json({ error: 'Username and password are required' });
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

router.use(requireAdmin);

// ─── Generate Tracking Number (atomic sequence) ─────────────────────
router.get('/generate-tracking', async (req, res) => {
  try {
    const seq = await query("SELECT 'SW' || LPAD(NEXTVAL('tracking_number_seq')::text, 3, '0') AS tn");
    res.json({ tracking_number: seq.rows[0].tn });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/generate-pc-tracking', async (req, res) => {
  try {
    const seq = await query("SELECT 'PC' || LPAD(NEXTVAL('pc_tracking_number_seq')::text, 3, '0') AS tn");
    res.json({ tracking_number: seq.rows[0].tn });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ─── Dashboard Stats (expanded) ─────────────────────────────────────
router.get('/stats', async (req, res) => {
  try {
    const total = await query('SELECT COUNT(*) FROM shipments');
    const today = await query("SELECT COUNT(*) FROM shipments WHERE DATE(created_at) = CURRENT_DATE");
    const delivered = await query("SELECT COUNT(*) FROM shipments WHERE status = 'delivered'");
    const pickupRequested = await query("SELECT COUNT(*) FROM shipments WHERE status = 'pickup_requested'");
    const pickedUp = await query("SELECT COUNT(*) FROM shipments WHERE status = 'picked_up'");
    const atSorting = await query("SELECT COUNT(*) FROM shipments WHERE status = 'at_sorting_center'");
    const outForDelivery = await query("SELECT COUNT(*) FROM shipments WHERE status = 'out_for_delivery'");
    const failed = await query("SELECT COUNT(*) FROM shipments WHERE status = 'failed_delivery'");
    const returned = await query("SELECT COUNT(*) FROM shipments WHERE status = 'returned_to_sender'");
    const todayPickups = await query("SELECT COUNT(*) FROM shipments WHERE DATE(pickup_scheduled_at) = CURRENT_DATE");
    const todayDeliveries = await query("SELECT COUNT(*) FROM shipments WHERE status = 'delivered' AND DATE(delivered_at) = CURRENT_DATE");
    const totalCod = await query("SELECT COALESCE(SUM(cod_amount), 0) AS value FROM shipments WHERE cod_amount > 0");
    const totalCharges = await query("SELECT COALESCE(SUM(delivery_charge), 0) AS value FROM shipments");
    const activeRiders = await query("SELECT COUNT(*) FROM delivery_staff WHERE role IN ('pickup_driver','delivery_rider') AND is_active = true");
    const totalClients = await query("SELECT COUNT(*) FROM clients WHERE is_active = true");
    const pendingCod = await query("SELECT COALESCE(SUM(cod_amount), 0) AS value FROM shipments WHERE cod_amount > 0 AND status != 'delivered'");
    const pendingScan = await query("SELECT COUNT(*) FROM shipments WHERE status = 'pending_scan'");

    res.json({
      total: parseInt(total.rows[0].count),
      today: parseInt(today.rows[0].count),
      delivered: parseInt(delivered.rows[0].count),
      pickupRequested: parseInt(pickupRequested.rows[0].count),
      pickedUp: parseInt(pickedUp.rows[0].count),
      atSorting: parseInt(atSorting.rows[0].count),
      outForDelivery: parseInt(outForDelivery.rows[0].count),
      failed: parseInt(failed.rows[0].count),
      returned: parseInt(returned.rows[0].count),
      todayPickups: parseInt(todayPickups.rows[0].count),
      todayDeliveries: parseInt(todayDeliveries.rows[0].count),
      totalCod: parseFloat(totalCod.rows[0].value),
      totalCharges: parseFloat(totalCharges.rows[0].value),
      activeRiders: parseInt(activeRiders.rows[0].count),
      totalClients: parseInt(totalClients.rows[0].count),
      pendingCod: parseFloat(pendingCod.rows[0].value),
      pendingScan: parseInt(pendingScan.rows[0].count),
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ─── Shipments CRUD ─────────────────────────────────────────────────
router.get('/shipments', async (req, res) => {
  try {
    const { search, status, startDate, endDate, client_id } = req.query;
    let sql = `SELECT s.*, c.company_name AS client_name
      FROM shipments s
      LEFT JOIN clients c ON s.client_id = c.id
      WHERE 1=1`;
    const params = [];
    let idx = 1;
    if (search) {
      sql += ` AND (s.tracking_number ILIKE $${idx} OR s.sender_name ILIKE $${idx} OR s.receiver_name ILIKE $${idx} OR s.sender_phone ILIKE $${idx} OR s.receiver_phone ILIKE $${idx} OR s.receiver_address ILIKE $${idx})`;
      params.push(`%${search}%`);
      idx++;
    }
    if (status) { sql += ` AND s.status = $${idx}`; params.push(status); idx++; }
    if (client_id) { sql += ` AND s.client_id = $${idx}`; params.push(client_id); idx++; }
    if (startDate) { sql += ` AND s.created_at >= $${idx}`; params.push(startDate); idx++; }
    if (endDate) { sql += ` AND s.created_at < ($${idx}::date + INTERVAL '1 day')`; params.push(endDate); idx++; }
    sql += ' ORDER BY s.created_at DESC';
    const result = await query(sql, params);
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/shipments/:id', async (req, res) => {
  try {
    const result = await query(`SELECT s.*, c.company_name AS client_name
      FROM shipments s LEFT JOIN clients c ON s.client_id = c.id WHERE s.id = $1`, [req.params.id]);
    if (!result.rows[0]) return res.status(404).json({ error: 'Shipment not found' });
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/tracking/:tracking_number', async (req, res) => {
  try {
    const result = await query('SELECT * FROM shipments WHERE tracking_number = $1 OR sw_tracking_number = $1', [req.params.tracking_number]);
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
      client_id, tracking_number, sw_tracking_number, sender_name, sender_phone, sender_email,
      sender_address, receiver_name, receiver_phone, receiver_email, receiver_address,
      pickup_address, delivery_address, origin, destination,
      parcel_type, parcel_description, num_items, weight, delivery_type,
      cod_amount, delivery_charge, payment_status, special_instructions,
      estimated_delivery, notes, status, pickup_id
    } = req.body;

    if (!sender_name || !sender_name.trim()) return res.status(400).json({ error: 'Sender name is required' });
    if (!receiver_name || !receiver_name.trim()) return res.status(400).json({ error: 'Receiver name is required' });
    if (!origin || !origin.trim()) return res.status(400).json({ error: 'Origin is required' });
    if (!destination || !destination.trim()) return res.status(400).json({ error: 'Destination is required' });
    if (!tracking_number || !tracking_number.trim()) return res.status(400).json({ error: 'Tracking number is required' });

    const result = await query(`
      INSERT INTO shipments (client_id, tracking_number, sw_tracking_number, sender_name, sender_phone,
        sender_email, sender_address, receiver_name, receiver_phone, receiver_email,
        receiver_address, pickup_address, delivery_address, origin, destination,
        parcel_type, parcel_description, num_items, weight, delivery_type,
        cod_amount, delivery_charge, payment_status, special_instructions,
        estimated_delivery, notes, status, pickup_id)
      VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18,$19,$20,$21,$22,$23,$24,$25,$26,$27,$28)
      RETURNING *
    `, [client_id || null, tracking_number, sw_tracking_number || null, sender_name, sender_phone || null,
      sender_email || null, sender_address || null, receiver_name, receiver_phone || null,
      receiver_email || null, receiver_address || null, pickup_address || null,
      delivery_address || null, origin, destination, parcel_type || null,
      parcel_description || null, num_items || 1, weight || null, delivery_type || null,
      cod_amount || 0, delivery_charge || 0, payment_status || 'pending',
      special_instructions || null, estimated_delivery || null, notes || null,
      status || 'pickup_requested', pickup_id || null
    ]);

    const shipment = result.rows[0];
    await query(`INSERT INTO tracking_events (shipment_id, event_type, status, description)
      VALUES ($1, 'pickup_requested', 'Pickup Requested', 'Pickup has been requested')`, [shipment.id]);
    await query(`INSERT INTO activity_logs (admin_id, action, details)
      VALUES ($1, 'create_shipment', $2)`, [req.user?.id || null, `Created shipment ${tracking_number}`]);
    if (receiver_email) sendTrackingEmail(shipment).catch(() => {});
    res.status(201).json(shipment);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.put('/shipments/:id', async (req, res) => {
  try {
    const fields = [];
    const values = [];
    let idx = 1;
    for (const key of ['client_id','sender_name','sender_phone','sender_email','sender_address',
      'receiver_name','receiver_phone','receiver_email','receiver_address',
      'pickup_address','delivery_address','origin','destination',
      'parcel_type','parcel_description','num_items','weight','delivery_type',
      'cod_amount','delivery_charge','payment_status','special_instructions',
      'estimated_delivery','notes','status','sorting_area',
      'pickup_driver_id','delivery_rider_id','pickup_scheduled_at',
      'sw_tracking_number','pickup_id']) {
      if (req.body[key] !== undefined) {
        fields.push(`${key}=$${idx}`);
        values.push(req.body[key] === '' ? null : req.body[key]);
        idx++;
      }
    }
    if (fields.length === 0) return res.status(400).json({ error: 'No fields to update' });
    fields.push('updated_at=CURRENT_TIMESTAMP');
    values.push(req.params.id);
    const result = await query(`UPDATE shipments SET ${fields.join(', ')} WHERE id=$${idx} RETURNING *`, values);
    if (!result.rows[0]) return res.status(404).json({ error: 'Shipment not found' });
    await query(`INSERT INTO activity_logs (admin_id, action, details)
      VALUES ($1, 'update_shipment', $2)`, [req.user?.id || null, `Updated shipment #${req.params.id}`]);
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.delete('/shipments/:id', async (req, res) => {
  try {
    const result = await query('DELETE FROM shipments WHERE id = $1 RETURNING *', [req.params.id]);
    if (!result.rows[0]) return res.status(404).json({ error: 'Shipment not found' });
    await query(`INSERT INTO activity_logs (admin_id, action, details)
      VALUES ($1, 'delete_shipment', $2)`, [req.user?.id || null, `Deleted shipment #${req.params.id}`]);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ─── Status Updates (expanded status list) ──────────────────────────
router.put('/shipments/:id/status', async (req, res) => {
  try {
    const { status, description, location, staff_name, receiver_signature, delivery_photo, delivery_remarks } = req.body;
    const validStatuses = [
      'pickup_requested', 'picked_up', 'at_sorting_center', 'sorted', 'out_for_delivery',
      'customer_contacted', 'delivered', 'failed_delivery', 'returned_to_sender', 'rescheduled'
    ];
    if (!validStatuses.includes(status)) return res.status(400).json({ error: 'Invalid status' });

    let extraFields = '';
    const extraValues = [];
    if (status === 'delivered') {
      extraFields = ', delivered_at=CURRENT_TIMESTAMP, delivered_by=$3, receiver_signature=$4, delivery_photo=$5, delivery_remarks=$6';
      extraValues.push(staff_name || req.user?.username || null, receiver_signature || null, delivery_photo || null, delivery_remarks || null);
    }
    if (status === 'picked_up') extraFields = ', pickup_completed_at=CURRENT_TIMESTAMP';
    if (status === 'returned_to_sender') extraFields = ', updated_at=CURRENT_TIMESTAMP';

    const shipment = await query(`UPDATE shipments SET status=$1, updated_at=CURRENT_TIMESTAMP${extraFields} WHERE id=$2 RETURNING *`,
      [status, req.params.id, ...extraValues]);
    if (!shipment.rows[0]) return res.status(404).json({ error: 'Shipment not found' });

    const statusLabel = status.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
    await query(`INSERT INTO tracking_events (shipment_id, event_type, status, description, location, staff_name)
      VALUES ($1, $2, $3, $4, $5, $6)`,
      [req.params.id, status, statusLabel, description || statusLabel, location || null, staff_name || null]);
    await query(`INSERT INTO activity_logs (admin_id, action, details)
      VALUES ($1, 'update_status', $2)`, [req.user?.id || null, `Updated shipment #${req.params.id} to ${status}`]);

    const notifyStatuses = ['picked_up', 'at_sorting_center', 'out_for_delivery', 'delivered', 'rescheduled', 'failed_delivery', 'returned_to_sender'];
    if (shipment.rows[0].receiver_email && notifyStatuses.includes(status)) {
      sendTrackingEmail({ ...shipment.rows[0], status }).catch(() => {});
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
    const result = await query(`INSERT INTO delivery_attempts (shipment_id, attempt_number, status, reason, custom_note, attempted_by)
      VALUES ($1, $2, 'failed', $3, $4, $5) RETURNING *`,
      [req.params.id, attemptNumber, reason, custom_note || null, attempted_by || null]);
    await query(`INSERT INTO tracking_events (shipment_id, event_type, status, description, staff_name)
      VALUES ($1, 'delivery_attempt', 'Delivery Attempt ' || $2, $3, $4)`,
      [req.params.id, attemptNumber, reason + (custom_note ? ': ' + custom_note : ''), attempted_by || null]);
    if (attemptNumber >= 3) {
      await query(`INSERT INTO tracking_events (shipment_id, event_type, status, description)
        VALUES ($1, 'storage_charges', 'Storage Charges May Apply', 'Delivery failed after multiple attempts')`, [req.params.id]);
    }
    await query(`INSERT INTO activity_logs (admin_id, action, details)
      VALUES ($1, 'delivery_attempt', $2)`, [req.user?.id || null, `Delivery attempt #${attemptNumber} for #${req.params.id}: ${reason}`]);
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

// ─── Clients CRUD ───────────────────────────────────────────────────
router.get('/clients', async (req, res) => {
  try {
    const { search } = req.query;
    let sql = 'SELECT * FROM clients WHERE 1=1';
    const params = [];
    if (search) {
      sql += ' AND (company_name ILIKE $1 OR contact_person ILIKE $1 OR phone ILIKE $1 OR email ILIKE $1)';
      params.push(`%${search}%`);
    }
    sql += ' ORDER BY created_at DESC';
    const result = await query(sql, params);
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/clients', async (req, res) => {
  try {
    const { client_type, company_name, contact_person, phone, email, address, billing_address } = req.body;
    if (!contact_person || !contact_person.trim()) return res.status(400).json({ error: 'Contact person is required' });
    if (!phone || !phone.trim()) return res.status(400).json({ error: 'Phone is required' });
    const result = await query(`INSERT INTO clients (client_type, company_name, contact_person, phone, email, address, billing_address)
      VALUES ($1,$2,$3,$4,$5,$6,$7) RETURNING *`,
      [client_type || 'individual', company_name || null, contact_person, phone, email || null, address || null, billing_address || null]);
    await query(`INSERT INTO activity_logs (admin_id, action, details)
      VALUES ($1, 'create_client', $2)`, [req.user?.id || null, `Created client: ${contact_person}`]);
    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.put('/clients/:id', async (req, res) => {
  try {
    const { client_type, company_name, contact_person, phone, email, address, billing_address, is_active } = req.body;
    const existing = await query('SELECT * FROM clients WHERE id = $1', [req.params.id]);
    if (!existing.rows[0]) return res.status(404).json({ error: 'Client not found' });
    const e = existing.rows[0];
    const result = await query(`UPDATE clients SET client_type=$1, company_name=$2, contact_person=$3, phone=$4, email=$5, address=$6, billing_address=$7, is_active=$8, updated_at=CURRENT_TIMESTAMP WHERE id=$9 RETURNING *`,
      [client_type || e.client_type, company_name !== undefined ? (company_name || null) : e.company_name, contact_person || e.contact_person, phone || e.phone, email !== undefined ? (email || null) : e.email, address !== undefined ? (address || null) : e.address, billing_address !== undefined ? (billing_address || null) : e.billing_address, is_active !== undefined ? is_active : e.is_active, req.params.id]);
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.delete('/clients/:id', async (req, res) => {
  try {
    const shipmentCount = await query('SELECT COUNT(*) FROM shipments WHERE client_id = $1', [req.params.id]);
    if (parseInt(shipmentCount.rows[0].count) > 0) {
      await query('UPDATE clients SET is_active = false, updated_at = CURRENT_TIMESTAMP WHERE id = $1 RETURNING *', [req.params.id]);
      return res.json({ success: true, message: 'Client deactivated (has existing shipments)' });
    }
    const result = await query('DELETE FROM clients WHERE id = $1 RETURNING *', [req.params.id]);
    if (!result.rows[0]) return res.status(404).json({ error: 'Client not found' });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ─── Client Login Creation ──────────────────────────────────────────
router.post('/clients/:id/create-login', async (req, res) => {
  try {
    const { username, password } = req.body;
    if (!username || !username.trim()) return res.status(400).json({ error: 'Username is required' });
    if (!password || password.length < 4) return res.status(400).json({ error: 'Password must be at least 4 characters' });
    const client = await query('SELECT * FROM clients WHERE id = $1', [req.params.id]);
    if (!client.rows[0]) return res.status(404).json({ error: 'Client not found' });
    const existing = await query('SELECT id FROM client_users WHERE username = $1', [username]);
    if (existing.rows[0]) return res.status(400).json({ error: 'Username already taken' });
    const password_hash = await bcrypt.hash(password, 10);
    const result = await query(`INSERT INTO client_users (client_id, username, password_hash) VALUES ($1, $2, $3) RETURNING id, username`,
      [req.params.id, username, password_hash]);
    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ─── Pickup Management ──────────────────────────────────────────────
router.get('/pickups', async (req, res) => {
  try {
    const { status, search, client_id } = req.query;
    let sql = `SELECT s.*, d.name AS driver_name, d.phone AS driver_phone,
      COALESCE(c.company_name, c.contact_person) AS client_name,
      s.num_items - COALESCE((SELECT SUM(ss.num_items) FROM shipments ss WHERE ss.pickup_id = s.id), 0) AS remaining_items,
      'shipment' AS _type
      FROM shipments s
      LEFT JOIN delivery_staff d ON s.pickup_driver_id = d.id
      LEFT JOIN clients c ON s.client_id = c.id
      WHERE s.status IN ('pickup_requested','picked_up') AND s.num_items > COALESCE((SELECT SUM(ss.num_items) FROM shipments ss WHERE ss.pickup_id = s.id), 0)`;
    const params = [];
    let idx = 1;
    if (status) { sql += ` AND s.status = $${idx}`; params.push(status); idx++; }
    if (client_id) { sql += ` AND s.client_id = $${idx}`; params.push(client_id); idx++; }
    if (search) {
      sql += ` AND (c.company_name ILIKE $${idx} OR c.contact_person ILIKE $${idx} OR s.sender_name ILIKE $${idx} OR s.receiver_name ILIKE $${idx} OR s.tracking_number ILIKE $${idx} OR s.sender_phone ILIKE $${idx})`;
      params.push(`%${search}%`);
      idx++;
    }
    sql += ' ORDER BY s.created_at DESC';
    const result = await query(sql, params);

    let clients = [];
    if (search) {
      const cl = await query(`SELECT id, company_name, contact_person, phone, email, address
        FROM clients WHERE is_active = true AND (company_name ILIKE $1 OR contact_person ILIKE $1 OR phone ILIKE $1)
        ORDER BY created_at DESC`, [`%${search}%`]);
      clients = cl.rows;
    }

    const rows = result.rows;
    const clientIdsInResult = new Set(rows.filter(r => r.client_id).map(r => r.client_id));
    const clientRows = clients.filter(c => !clientIdsInResult.has(c.id)).map(c => ({
      client_id: c.id,
      client_name: c.company_name || c.contact_person,
      sender_name: c.contact_person,
      sender_phone: c.phone,
      _type: 'client',
    }));

    res.json([...rows, ...clientRows]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.put('/pickups/:id/assign', async (req, res) => {
  try {
    const { driver_id, scheduled_at } = req.body;
    const result = await query(`UPDATE shipments SET pickup_driver_id=$1, pickup_scheduled_at=$2, updated_at=CURRENT_TIMESTAMP WHERE id=$3 RETURNING *`,
      [driver_id || null, scheduled_at || null, req.params.id]);
    if (!result.rows[0]) return res.status(404).json({ error: 'Shipment not found' });
    if (driver_id) {
      const driver = await query('SELECT name FROM delivery_staff WHERE id = $1', [driver_id]);
      await query(`INSERT INTO tracking_events (shipment_id, event_type, status, description, staff_name)
        VALUES ($1, 'driver_assigned', 'Driver Assigned', $2, $3)`,
        [req.params.id, `Pickup driver assigned: ${driver.rows[0]?.name || ''}`, driver.rows[0]?.name || null]);
    }
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ─── Sorting ────────────────────────────────────────────────────────
router.get('/sorting', async (req, res) => {
  try {
    const { area, search } = req.query;
    let sql = `SELECT s.*, d.name AS rider_name
      FROM shipments s LEFT JOIN delivery_staff d ON s.delivery_rider_id = d.id
      WHERE s.status IN ('at_sorting_center','sorted')`;
    const params = [];
    let idx = 1;
    if (area) { sql += ` AND s.sorting_area ILIKE $${idx}`; params.push(`%${area}%`); idx++; }
    if (search) {
      sql += ` AND (s.tracking_number ILIKE $${idx} OR s.sender_name ILIKE $${idx} OR s.receiver_name ILIKE $${idx} OR s.sender_phone ILIKE $${idx} OR s.receiver_phone ILIKE $${idx} OR s.destination ILIKE $${idx})`;
      params.push(`%${search}%`);
      idx++;
    }
    sql += ' ORDER BY s.updated_at DESC';
    const result = await query(sql, params);
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.put('/sorting/:id/assign', async (req, res) => {
  try {
    const { rider_id, sorting_area } = req.body;
    const result = await query(`UPDATE shipments SET delivery_rider_id=$1, sorting_area=$2, status='sorted', updated_at=CURRENT_TIMESTAMP WHERE id=$3 RETURNING *`,
      [rider_id || null, sorting_area || null, req.params.id]);
    if (!result.rows[0]) return res.status(404).json({ error: 'Shipment not found' });
    await query(`INSERT INTO tracking_events (shipment_id, event_type, status, description)
      VALUES ($1, 'sorted', 'Sorted', $2)`,
      [req.params.id, sorting_area ? `Sorted for area: ${sorting_area}` : 'Sorted and ready for delivery']);
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ─── Delivery Management ────────────────────────────────────────────
router.get('/deliveries', async (req, res) => {
  try {
    const { status } = req.query;
    let sql = `SELECT s.*, d.name AS rider_name, d.phone AS rider_phone
      FROM shipments s LEFT JOIN delivery_staff d ON s.delivery_rider_id = d.id
      WHERE s.status IN ('sorted','out_for_delivery','customer_contacted','delivered','failed_delivery','rescheduled')`;
    const params = [];
    if (status) { sql += ' AND s.status = $1'; params.push(status); }
    sql += ' ORDER BY s.updated_at DESC';
    const result = await query(sql, params.length ? params : undefined);
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.put('/deliveries/:id/complete', async (req, res) => {
  try {
    const { receiver_name, signature, delivery_photo, remarks } = req.body;
    const riderResult = await query(`SELECT d.name FROM shipments s LEFT JOIN delivery_staff d ON s.delivery_rider_id = d.id WHERE s.id = $1`, [req.params.id]);
    const riderName = riderResult.rows[0]?.name || null;
    const result = await query(`UPDATE shipments SET status='delivered', receiver_signature=$1, delivery_photo=$2, delivery_remarks=$3, delivered_by=$4, delivered_at=CURRENT_TIMESTAMP, updated_at=CURRENT_TIMESTAMP WHERE id=$5 RETURNING *`,
      [signature || null, delivery_photo || null, remarks || null, riderName, req.params.id]);
    if (!result.rows[0]) return res.status(404).json({ error: 'Shipment not found' });
    await query(`INSERT INTO tracking_events (shipment_id, event_type, status, description, staff_name)
      VALUES ($1, 'delivered', 'Delivered', $2, $3)`,
      [req.params.id, remarks ? `Delivered successfully. Remarks: ${remarks}` : 'Delivered successfully', riderName]);
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ─── Scan to Deliver ─────────────────────────────────────────────
router.put('/scan/:tracking_number', async (req, res) => {
  try {
    const { receiver_name, remarks, rider_id } = req.body;
    const tn = req.params.tracking_number;
    const result = await query(
      `UPDATE shipments SET status='sorted', delivery_rider_id = COALESCE($4, delivery_rider_id), updated_at=CURRENT_TIMESTAMP
       WHERE (tracking_number=$3 OR sw_tracking_number=$3)
       AND status IN ('pending_scan','at_sorting_center')
       RETURNING *`,
      [receiver_name || null, remarks || null, tn, rider_id || null]);
    if (!result.rows[0]) return res.status(404).json({ error: 'Shipment not found or already in delivery' });
    await query(`INSERT INTO tracking_events (shipment_id, event_type, status, description, staff_name)
      VALUES ($1, 'sorted', 'Sorted', 'Scanned and assigned for delivery', $2)`,
      [result.rows[0].id, receiver_name || null]);
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ─── Delivery Sheet by Rider ─────────────────────────────────────
// ─── Delivery Sheet Assignment ────────────────────────────────────
router.put('/delivery-sheet/:id/assign', async (req, res) => {
  try {
    const { rider_id } = req.body;
    const result = await query(
      `UPDATE shipments SET delivery_rider_id=$1, status='sorted', updated_at=CURRENT_TIMESTAMP
       WHERE id=$2 RETURNING *`,
      [rider_id || null, req.params.id]);
    if (!result.rows[0]) return res.status(404).json({ error: 'Shipment not found' });
    await query(`INSERT INTO tracking_events (shipment_id, event_type, status, description)
      VALUES ($1, 'sorted', 'Sorted', $2)`,
      [req.params.id, rider_id ? `Assigned to rider` : 'Unassigned from rider']);
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/delivery-sheet', async (req, res) => {
  try {
    const { rider_id } = req.query;
    let sql = `SELECT s.*, d.name AS rider_name, d.phone AS rider_phone,
      COALESCE(c.company_name, c.contact_person) AS client_name
      FROM shipments s
      LEFT JOIN delivery_staff d ON s.delivery_rider_id = d.id
      LEFT JOIN clients c ON s.client_id = c.id
      WHERE s.status IN ('pending_scan','at_sorting_center','sorted','out_for_delivery','customer_contacted','delivered','failed_delivery','rescheduled')`;
    const params = [];
    if (rider_id) { sql += ` AND s.delivery_rider_id = $1`; params.push(rider_id); }
    sql += ' ORDER BY rider_name, s.created_at DESC';
    const result = await query(sql, params.length ? params : undefined);
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ─── COD Management ─────────────────────────────────────────────────
router.get('/cod', async (req, res) => {
  try {
    const { rider_id, status } = req.query;
    let sql = `SELECT cs.*, s.tracking_number, s.receiver_name, s.cod_amount AS shipment_cod,
      d.name AS rider_name FROM cod_settlements cs
      JOIN shipments s ON cs.shipment_id = s.id
      LEFT JOIN delivery_staff d ON cs.rider_id = d.id
      WHERE 1=1`;
    const params = [];
    let idx = 1;
    if (rider_id) { sql += ` AND cs.rider_id = $${idx}`; params.push(rider_id); idx++; }
    if (status) { sql += ` AND cs.status = $${idx}`; params.push(status); idx++; }
    sql += ' ORDER BY cs.created_at DESC';
    const result = await query(sql, params);
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/cod/settle', async (req, res) => {
  try {
    const { rider_id, shipment_id, collected_amount, notes } = req.body;
    const shipment = await query('SELECT * FROM shipments WHERE id = $1', [shipment_id]);
    if (!shipment.rows[0]) return res.status(404).json({ error: 'Shipment not found' });
    const existing = await query('SELECT id FROM cod_settlements WHERE shipment_id = $1', [shipment_id]);
    if (existing.rows[0]) return res.status(400).json({ error: 'Already settled for this shipment' });
    const result = await query(`INSERT INTO cod_settlements (shipment_id, rider_id, cod_amount, collected_amount, settled_amount, status, collected_at, notes)
      VALUES ($1, $2, $3, $4, $4, 'settled', CURRENT_TIMESTAMP, $5) RETURNING *`,
      [shipment_id, rider_id || null, shipment.rows[0].cod_amount, collected_amount || shipment.rows[0].cod_amount, notes || null]);
    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/cod/summary', async (req, res) => {
  try {
    const riders = await query(`SELECT d.id, d.name, d.phone,
      COALESCE(sub.total_cod, 0) AS total_cod,
      COALESCE(cs_sub.total_collected, 0) AS total_collected,
      COALESCE(sub.cod_shipments, 0) AS cod_shipments
      FROM delivery_staff d
      LEFT JOIN (
        SELECT COALESCE(SUM(s.cod_amount), 0) AS total_cod,
          COUNT(s.id) AS cod_shipments,
          s.delivery_rider_id AS rider_id
        FROM shipments s
        WHERE s.payment_status = 'cod' AND s.status NOT IN ('pickup_requested','picked_up')
        GROUP BY s.delivery_rider_id
      ) sub ON sub.rider_id = d.id
      LEFT JOIN (
        SELECT cs.rider_id, COALESCE(SUM(cs.collected_amount), 0) AS total_collected
        FROM cod_settlements cs
        GROUP BY cs.rider_id
      ) cs_sub ON cs_sub.rider_id = d.id
      WHERE d.role IN ('pickup_driver','delivery_rider')
      ORDER BY d.name`);
    res.json(riders.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ─── Daily Reports ──────────────────────────────────────────────────
router.get('/reports/daily', async (req, res) => {
  try {
    const { date } = req.query;
    let sql;
    let params;
    if (date) {
      sql = `SELECT COUNT(*) FILTER (WHERE status IN ('pickup_requested','picked_up')) AS total_pickups,
        COUNT(*) FILTER (WHERE status = 'delivered') AS total_delivered,
        COUNT(*) FILTER (WHERE status IN ('pickup_requested','picked_up','at_sorting_center','sorted','out_for_delivery')) AS pending_parcels,
        COUNT(*) FILTER (WHERE status = 'failed_delivery') AS failed_deliveries,
        COUNT(*) FILTER (WHERE status = 'returned_to_sender') AS returned_parcels,
        COALESCE(SUM(cod_amount) FILTER (WHERE cod_amount > 0), 0) AS total_cod,
        COALESCE(SUM(delivery_charge), 0) AS total_charges
        FROM shipments WHERE DATE(created_at) = $1`;
      params = [date];
    } else {
      sql = `SELECT COUNT(*) FILTER (WHERE status IN ('pickup_requested','picked_up')) AS total_pickups,
        COUNT(*) FILTER (WHERE status = 'delivered') AS total_delivered,
        COUNT(*) FILTER (WHERE status IN ('pickup_requested','picked_up','at_sorting_center','sorted','out_for_delivery')) AS pending_parcels,
        COUNT(*) FILTER (WHERE status = 'failed_delivery') AS failed_deliveries,
        COUNT(*) FILTER (WHERE status = 'returned_to_sender') AS returned_parcels,
        COALESCE(SUM(cod_amount) FILTER (WHERE cod_amount > 0), 0) AS total_cod,
        COALESCE(SUM(delivery_charge), 0) AS total_charges
        FROM shipments WHERE DATE(created_at) = CURRENT_DATE`;
      params = undefined;
    }
    const result = await query(sql, params);
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/reports/monthly', async (req, res) => {
  try {
    const { year, month } = req.query;
    if (!year || !month) return res.status(400).json({ error: 'year and month required' });
    const result = await query(`
      SELECT DATE(created_at) AS day, COUNT(*) AS total,
        COUNT(*) FILTER (WHERE status = 'delivered') AS delivered,
        COALESCE(SUM(delivery_charge) FILTER (WHERE status NOT IN ('pickup_requested','picked_up')), 0) AS revenue,
        COALESCE(SUM(cod_amount) FILTER (WHERE cod_amount > 0), 0) AS cod_total
      FROM shipments
      WHERE EXTRACT(YEAR FROM created_at) = $1 AND EXTRACT(MONTH FROM created_at) = $2
      GROUP BY DATE(created_at) ORDER BY day
    `, [year, month]);
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/reports/rider-performance', async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    let where = '';
    const params = [];
    if (startDate && endDate) { where = ' WHERE s.delivered_at >= $1 AND s.delivered_at < ($2::date + INTERVAL \'1 day\')'; params.push(startDate, endDate); }
    const result = await query(`
      SELECT d.id, d.name, d.phone, d.role,
        COUNT(s.id) FILTER (WHERE s.status = 'delivered') AS deliveries_completed,
        COUNT(s.id) FILTER (WHERE s.status = 'failed_delivery') AS deliveries_failed,
        COUNT(s.id) AS total_assigned,
        COALESCE(SUM(s.cod_amount) FILTER (WHERE s.payment_status = 'cod' AND s.status = 'delivered'), 0) AS cod_collected
      FROM delivery_staff d
      LEFT JOIN shipments s ON s.delivery_rider_id = d.id OR s.pickup_driver_id = d.id
      ${where}
      GROUP BY d.id, d.name, d.phone, d.role ORDER BY deliveries_completed DESC
    `, params);
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/reports/export', async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    let sql = `SELECT s.*, c.company_name AS client_name FROM shipments s LEFT JOIN clients c ON s.client_id = c.id WHERE 1=1`;
    const params = [];
    let idx = 1;
    if (startDate) { sql += ` AND s.created_at >= $${idx}`; params.push(startDate); idx++; }
    if (endDate) { sql += ` AND s.created_at < ($${idx}::date + INTERVAL '1 day')`; params.push(endDate); idx++; }
    sql += ' ORDER BY s.created_at DESC';
    const result = await query(sql, params.length ? params : undefined);
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ─── Delivery Staff Management (with role) ──────────────────────────
router.get('/staff', async (req, res) => {
  try {
    const result = await query('SELECT id, name, phone, email, username, role, is_active, created_at FROM delivery_staff ORDER BY name');
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/staff', async (req, res) => {
  try {
    const { name, phone, email, username, password, role } = req.body;
    if (!name || !name.trim()) return res.status(400).json({ error: 'Name is required' });
    if (!phone || !phone.trim()) return res.status(400).json({ error: 'Phone is required' });
    if (!username || !username.trim()) return res.status(400).json({ error: 'Username is required' });
    if (!password || password.length < 4) return res.status(400).json({ error: 'Password must be at least 4 characters' });
    const password_hash = await bcrypt.hash(password, 10);
    const result = await query(`INSERT INTO delivery_staff (name, phone, email, username, password_hash, role)
      VALUES ($1, $2, $3, $4, $5, $6) RETURNING id, name, phone, email, username, role, is_active, created_at`,
      [name, phone, email || null, username, password_hash, role || 'delivery_rider']);
    await query(`INSERT INTO activity_logs (admin_id, action, details)
      VALUES ($1, 'create_staff', $2)`, [req.user?.id || null, `Created staff: ${name} (${role || 'delivery_rider'})`]);
    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.put('/staff/:id', async (req, res) => {
  try {
    const { name, phone, email, username, role, is_active } = req.body;
    const existing = await query('SELECT * FROM delivery_staff WHERE id = $1', [req.params.id]);
    if (!existing.rows[0]) return res.status(404).json({ error: 'Staff not found' });
    const e = existing.rows[0];
    const result = await query(`UPDATE delivery_staff SET name=$1, phone=$2, email=$3, username=$4, role=$5, is_active=$6 WHERE id=$7
      RETURNING id, name, phone, email, username, role, is_active, created_at`,
      [name || e.name, phone || e.phone, email !== undefined ? (email || null) : e.email, username || e.username, role || e.role, is_active !== undefined ? is_active : e.is_active, req.params.id]);
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.delete('/staff/:id', async (req, res) => {
  try {
    const result = await query('DELETE FROM delivery_staff WHERE id = $1 RETURNING *', [req.params.id]);
    if (!result.rows[0]) return res.status(404).json({ error: 'Staff member not found' });
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
    const result = await query('DELETE FROM contact_messages WHERE id = $1 RETURNING *', [req.params.id]);
    if (!result.rows[0]) return res.status(404).json({ error: 'Message not found' });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
