import bcrypt from 'bcryptjs';
import { query, initDB } from './db.js';

async function seed() {
  await initDB();

  const existing = await query('SELECT * FROM admins WHERE username = $1', ['admin']);

  if (existing.rows.length === 0) {
    const hash = bcrypt.hashSync('admin123', 10);
    await query('INSERT INTO admins (username, password_hash) VALUES ($1, $2)', ['admin', hash]);
    console.log('Admin user created: admin / admin123');
  } else {
    console.log('Admin user already exists');
  }

  process.exit(0);
}

seed().catch(err => {
  console.error(err);
  process.exit(1);
});
