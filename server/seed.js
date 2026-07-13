import bcrypt from 'bcryptjs';
import { query, initDB } from './db.js';

async function seed() {
  await initDB();

  const existing = await query('SELECT * FROM admins WHERE username = $1', ['salman']);
  if (existing.rows.length === 0) {
    const hash = bcrypt.hashSync('salman2001', 10);
    await query('INSERT INTO admins (username, password_hash) VALUES ($1, $2)', ['salman', hash]);
    console.log('Admin user created: salman / salman2001');
  } else {
    console.log('Admin user already exists');
  }

  const staffExisting = await query('SELECT * FROM delivery_staff WHERE username = $1', ['staff1']);
  if (staffExisting.rows.length === 0) {
    const hash = bcrypt.hashSync('staff123', 10);
    await query(
      'INSERT INTO delivery_staff (name, phone, email, username, password_hash) VALUES ($1, $2, $3, $4, $5)',
      ['Kumar Sangakkara', '+94 77 123 4567', 'kumar@straightway.lk', 'staff1', hash]
    );
    console.log('Delivery staff created: staff1 / staff123');
  } else {
    console.log('Delivery staff already exists');
  }

  process.exit(0);
}

seed().catch(err => {
  console.error(err);
  process.exit(1);
});
