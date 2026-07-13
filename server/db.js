import { Pool } from '@neondatabase/serverless';

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

export async function query(text, params) {
  return pool.query(text, params);
}

export async function initDB() {
  // ─── Tracking Number Sequence (atomic, race-condition-free) ────────
  await pool.query('CREATE SEQUENCE IF NOT EXISTS tracking_number_seq START 1');

  // ─── Admins (backward compat) ──────────────────────────────────────
  await pool.query(`
    CREATE TABLE IF NOT EXISTS admins (
      id SERIAL PRIMARY KEY,
      username TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      role TEXT DEFAULT 'admin',
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  `);

  // ─── Delivery / Office Staff (expanded with role) ──────────────────
  await pool.query(`
    CREATE TABLE IF NOT EXISTS delivery_staff (
      id SERIAL PRIMARY KEY,
      name TEXT NOT NULL,
      phone TEXT NOT NULL,
      email TEXT,
      username TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      role TEXT DEFAULT 'delivery_rider',
      is_active BOOLEAN DEFAULT true,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  `);

  // Add role column if missing (for existing tables)
  await pool.query(`
    DO $$ BEGIN
      IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='delivery_staff' AND column_name='role') THEN
        ALTER TABLE delivery_staff ADD COLUMN role TEXT DEFAULT 'delivery_rider';
      END IF;
    END $$;
  `).catch(() => {});

  // ─── Clients ───────────────────────────────────────────────────────
  await pool.query(`
    CREATE TABLE IF NOT EXISTS clients (
      id SERIAL PRIMARY KEY,
      client_type TEXT DEFAULT 'individual',
      company_name TEXT,
      contact_person TEXT NOT NULL,
      phone TEXT NOT NULL,
      email TEXT,
      address TEXT,
      billing_address TEXT,
      is_active BOOLEAN DEFAULT true,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  `);

  // ─── Client Users (login credentials) ──────────────────────────────
  await pool.query(`
    CREATE TABLE IF NOT EXISTS client_users (
      id SERIAL PRIMARY KEY,
      client_id INTEGER NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
      username TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      is_active BOOLEAN DEFAULT true,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  `);

  // ─── Shipments (expanded) ──────────────────────────────────────────
  await pool.query(`
    CREATE TABLE IF NOT EXISTS shipments (
      id SERIAL PRIMARY KEY,
      tracking_number TEXT UNIQUE NOT NULL,
      client_id INTEGER REFERENCES clients(id),
      sender_name TEXT NOT NULL,
      sender_phone TEXT,
      sender_email TEXT,
      sender_address TEXT,
      receiver_name TEXT NOT NULL,
      receiver_phone TEXT,
      receiver_email TEXT,
      receiver_address TEXT,
      pickup_address TEXT,
      delivery_address TEXT,
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
      status TEXT NOT NULL DEFAULT 'pickup_requested',
      estimated_delivery TEXT,
      notes TEXT,
      assigned_pickup_staff_id INTEGER REFERENCES delivery_staff(id),
      assigned_delivery_staff_id INTEGER REFERENCES delivery_staff(id),
      pickup_driver_id INTEGER REFERENCES delivery_staff(id),
      delivery_rider_id INTEGER REFERENCES delivery_staff(id),
      sorting_area TEXT,
      receiver_signature TEXT,
      delivery_photo TEXT,
      delivered_by TEXT,
      delivered_at TIMESTAMP,
      delivery_remarks TEXT,
      pickup_scheduled_at TIMESTAMP,
      pickup_completed_at TIMESTAMP,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  `);

  // Add new columns if table already exists
  const addCol = async (table, col, def) => {
    if (!/^[a-z_]+$/.test(table) || !/^[a-z_]+$/.test(col) || !/^[a-z0-9\s()_,]+$/i.test(def)) {
      console.error(`addCol: invalid identifiers table="${table}" col="${col}" def="${def}"`);
      return;
    }
    await pool.query(`
      DO $$ BEGIN
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='${table}' AND column_name='${col}') THEN
          ALTER TABLE ${table} ADD COLUMN ${col} ${def};
        END IF;
      END $$;
    `).catch(() => {});
  };

  await addCol('shipments', 'client_id', 'INTEGER REFERENCES clients(id)');
  await addCol('shipments', 'pickup_address', 'TEXT');
  await addCol('shipments', 'delivery_address', 'TEXT');
  await addCol('shipments', 'pickup_driver_id', 'INTEGER REFERENCES delivery_staff(id)');
  await addCol('shipments', 'delivery_rider_id', 'INTEGER REFERENCES delivery_staff(id)');
  await addCol('shipments', 'sorting_area', 'TEXT');
  await addCol('shipments', 'receiver_signature', 'TEXT');
  await addCol('shipments', 'delivery_photo', 'TEXT');
  await addCol('shipments', 'delivered_by', 'TEXT');
  await addCol('shipments', 'delivered_at', 'TIMESTAMP');
  await addCol('shipments', 'delivery_remarks', 'TEXT');
  await addCol('shipments', 'pickup_scheduled_at', 'TIMESTAMP');
  await addCol('shipments', 'pickup_completed_at', 'TIMESTAMP');

  // ─── Tracking Events ───────────────────────────────────────────────
  await pool.query(`
    CREATE TABLE IF NOT EXISTS tracking_events (
      id SERIAL PRIMARY KEY,
      shipment_id INTEGER NOT NULL REFERENCES shipments(id) ON DELETE CASCADE,
      event_type TEXT NOT NULL,
      status TEXT NOT NULL,
      location TEXT,
      description TEXT,
      staff_name TEXT,
      timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  `);

  // ─── Delivery Attempts ─────────────────────────────────────────────
  await pool.query(`
    CREATE TABLE IF NOT EXISTS delivery_attempts (
      id SERIAL PRIMARY KEY,
      shipment_id INTEGER NOT NULL REFERENCES shipments(id) ON DELETE CASCADE,
      attempt_number INTEGER NOT NULL,
      status TEXT NOT NULL,
      reason TEXT,
      custom_note TEXT,
      attempted_by TEXT,
      timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  `);

  // ─── COD Settlements ───────────────────────────────────────────────
  await pool.query(`
    CREATE TABLE IF NOT EXISTS cod_settlements (
      id SERIAL PRIMARY KEY,
      shipment_id INTEGER NOT NULL REFERENCES shipments(id) ON DELETE CASCADE,
      rider_id INTEGER REFERENCES delivery_staff(id),
      cod_amount DECIMAL(10,2) NOT NULL,
      collected_amount DECIMAL(10,2) DEFAULT 0,
      settled_amount DECIMAL(10,2) DEFAULT 0,
      status TEXT DEFAULT 'pending',
      collected_at TIMESTAMP,
      settled_at TIMESTAMP,
      notes TEXT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  `);

  // ─── Activity Logs ─────────────────────────────────────────────────
  await pool.query(`
    CREATE TABLE IF NOT EXISTS activity_logs (
      id SERIAL PRIMARY KEY,
      admin_id INTEGER,
      action TEXT NOT NULL,
      details TEXT,
      timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  `);

  // ─── Contact Messages ──────────────────────────────────────────────
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

  // ─── Settings ──────────────────────────────────────────────────────
  await pool.query(`
    CREATE TABLE IF NOT EXISTS settings (
      key TEXT PRIMARY KEY,
      value TEXT
    );
  `);
}

export default pool;
