import serverless from 'serverless-http';
import app from '../server/index.js';
import { initDB } from '../server/db.js';

initDB().catch(err => console.error('DB init failed:', err));

export const handler = serverless(app);
