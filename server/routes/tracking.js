import { Router } from 'express';
import { query } from '../db.js';

const router = Router();

router.get('/:tracking_number', async (req, res) => {
  try {
    const tn = req.params.tracking_number;
    const result = await query(`SELECT s.*, c.company_name AS client_name
      FROM shipments s LEFT JOIN clients c ON s.client_id = c.id
      WHERE s.tracking_number = $1 OR s.sw_tracking_number = $1`, [tn]);
    if (!result.rows[0]) return res.status(404).json({ error: 'Shipment not found' });

    const shipment = result.rows[0];
    const events = await query('SELECT * FROM tracking_events WHERE shipment_id = $1 ORDER BY timestamp ASC', [shipment.id]);
    const attempts = await query('SELECT * FROM delivery_attempts WHERE shipment_id = $1 ORDER BY attempt_number ASC', [shipment.id]);

    res.json({
      shipment: {
        ...shipment,
        pickup_requested: shipment.status === 'pickup_requested',
        picked_up: shipment.status === 'picked_up',
        at_sorting_center: shipment.status === 'at_sorting_center',
        sorted: shipment.status === 'sorted',
        out_for_delivery: shipment.status === 'out_for_delivery',
        delivered: shipment.status === 'delivered',
        failed_delivery: shipment.status === 'failed_delivery',
        returned_to_sender: shipment.status === 'returned_to_sender',
        rescheduled: shipment.status === 'rescheduled',
      },
      events: events.rows,
      delivery_attempts: attempts.rows,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
