import { Router } from 'express';
import nodemailer from 'nodemailer';
import { query } from '../db.js';

const router = Router();

function escapeHtml(str) {
  return String(str).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'})[c]);
}

router.post('/', async (req, res) => {
  try {
    const { name, email, phone, subject, message } = req.body;
    if (!name || !email || !message) {
      return res.status(400).json({ error: 'Name, email, and message are required' });
    }

    await query(
      'INSERT INTO contact_messages (name, email, phone, subject, message) VALUES ($1, $2, $3, $4, $5)',
      [name, email, phone || null, subject || null, message]
    );

    // Optionally email the admin
    const smtpHost = process.env.SMTP_HOST;
    if (smtpHost) {
      const transporter = nodemailer.createTransport({
        host: smtpHost,
        port: parseInt(process.env.SMTP_PORT || '587'),
        secure: process.env.SMTP_SECURE === 'true',
        auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
      });
      await transporter.sendMail({
        from: process.env.SMTP_FROM || email,
        to: process.env.CONTACT_EMAIL || process.env.SMTP_FROM,
        subject: `Contact Form: ${subject || 'No Subject'}`,
        html: `<p><strong>Name:</strong> ${escapeHtml(name)}</p><p><strong>Email:</strong> ${escapeHtml(email)}</p><p><strong>Phone:</strong> ${escapeHtml(phone || 'N/A')}</p><p><strong>Message:</strong></p><p>${escapeHtml(message)}</p>`,
      });
    }

    res.status(201).json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
