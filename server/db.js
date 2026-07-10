import { Pool } from '@neondatabase/serverless';

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

export async function query(text, params) {
  return pool.query(text, params);
}

export async function initDB() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS admins (
      id SERIAL PRIMARY KEY,
      username TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      role TEXT DEFAULT 'admin',
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS delivery_staff (
      id SERIAL PRIMARY KEY,
      name TEXT NOT NULL,
      phone TEXT NOT NULL,
      email TEXT,
      username TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      is_active BOOLEAN DEFAULT true,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS shipments (
      id SERIAL PRIMARY KEY,
      tracking_number TEXT UNIQUE NOT NULL,
      sender_name TEXT NOT NULL,
      sender_phone TEXT,
      sender_email TEXT,
      sender_address TEXT,
      receiver_name TEXT NOT NULL,
      receiver_phone TEXT,
      receiver_email TEXT,
      receiver_address TEXT,
      origin TEXT NOT NULL,
      destination TEXT NOT NULL,
      parcel_type TEXT,
      parcel_description TEXT,
      num_items INTEGER DEFAULT 1,
      weight TEXT,
      delivery_type TEXT,
      cod_amount DECIMAL(10,2) DEFAULT 0,
      delivery_charge DECIMAL(10,2) DEFAULT 0,
      payment_status TEXT DEFAULT 'pending',
      special_instructions TEXT,
      status TEXT NOT NULL DEFAULT 'pending',
      estimated_delivery TEXT,
      notes TEXT,
      assigned_pickup_staff_id INTEGER,
      assigned_delivery_staff_id INTEGER,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (assigned_pickup_staff_id) REFERENCES delivery_staff(id),
      FOREIGN KEY (assigned_delivery_staff_id) REFERENCES delivery_staff(id)
    );
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS tracking_events (
      id SERIAL PRIMARY KEY,
      shipment_id INTEGER NOT NULL,
      event_type TEXT NOT NULL,
      status TEXT NOT NULL,
      location TEXT,
      description TEXT,
      staff_name TEXT,
      timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (shipment_id) REFERENCES shipments(id) ON DELETE CASCADE
    );
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS delivery_attempts (
      id SERIAL PRIMARY KEY,
      shipment_id INTEGER NOT NULL,
      attempt_number INTEGER NOT NULL,
      status TEXT NOT NULL,
      reason TEXT,
      custom_note TEXT,
      attempted_by TEXT,
      timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (shipment_id) REFERENCES shipments(id) ON DELETE CASCADE
    );
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS activity_logs (
      id SERIAL PRIMARY KEY,
      admin_id INTEGER,
      action TEXT NOT NULL,
      details TEXT,
      timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS contact_messages (
      id SERIAL PRIMARY KEY,
      name TEXT NOT NULL,
      email TEXT NOT NULL,
      phone TEXT,
      subject TEXT,
      message TEXT NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS settings (
      key TEXT PRIMARY KEY,
      value TEXT
    );
  `);
}

export default pool;
