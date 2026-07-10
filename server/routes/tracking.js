import { Router } from 'express';
import { query } from '../db.js';

const router = Router();

router.get('/:tracking_number', async (req, res) => {
  try {
    const result = await query(`
      SELECT s.*, 
        pickup.name AS pickup_staff_name, pickup.phone AS pickup_staff_phone,
        delivery.name AS delivery_staff_name, delivery.phone AS delivery_staff_phone
      FROM shipments s
      LEFT JOIN delivery_staff pickup ON s.assigned_pickup_staff_id = pickup.id
      LEFT JOIN delivery_staff delivery ON s.assigned_delivery_staff_id = delivery.id
      WHERE s.tracking_number = $1
    `, [req.params.tracking_number]);

    if (!result.rows[0]) {
      return res.status(404).json({ error: 'Shipment not found' });
    }

    const shipment = result.rows[0];

    const events = await query(
      'SELECT * FROM tracking_events WHERE shipment_id = $1 ORDER BY timestamp ASC',
      [shipment.id]
    );

    const attempts = await query(
      'SELECT * FROM delivery_attempts WHERE shipment_id = $1 ORDER BY attempt_number ASC',
      [shipment.id]
    );

    res.json({
      shipment,
      events: events.rows,
      delivery_attempts: attempts.rows,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
