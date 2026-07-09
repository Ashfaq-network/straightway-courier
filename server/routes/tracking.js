import { Router } from 'express';
import { query } from '../db.js';

const router = Router();

router.get('/:trackingNumber', async (req, res) => {
  const { trackingNumber } = req.params;

  const shipmentResult = await query(
    'SELECT * FROM shipments WHERE tracking_number = $1',
    [trackingNumber]
  );

  const shipment = shipmentResult.rows[0];

  if (!shipment) {
    return res.status(404).json({ error: 'Tracking number not found' });
  }

  const eventsResult = await query(
    'SELECT * FROM tracking_events WHERE shipment_id = $1 ORDER BY timestamp ASC',
    [shipment.id]
  );

  res.json({ shipment, events: eventsResult.rows });
});

export default router;
