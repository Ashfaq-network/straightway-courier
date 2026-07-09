import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.ethereal.email',
  port: parseInt(process.env.SMTP_PORT || '587'),
  secure: process.env.SMTP_SECURE === 'true',
  auth: {
    user: process.env.SMTP_USER || '',
    pass: process.env.SMTP_PASS || '',
  },
});

export function sendTrackingEmail({ to, trackingNumber, receiverName, senderName }) {
  const baseUrl = process.env.SITE_URL || 'http://localhost:3000';
  const trackingUrl = `${baseUrl}/track?number=${trackingNumber}`;

  const html = `
    <div style="font-family: 'Segoe UI', Tahoma, sans-serif; max-width: 560px; margin: 0 auto; padding: 32px 24px; background: #f9fafb; border-radius: 16px;">
      <div style="background: linear-gradient(135deg, #2563eb, #1d4ed8); border-radius: 12px; padding: 24px; text-align: center; margin-bottom: 24px;">
        <h1 style="color: #ffffff; margin: 0; font-size: 20px; letter-spacing: 1px;">STRAIGHTWAY COURIERS</h1>
      </div>

      <h2 style="color: #111827; margin: 0 0 8px;">Your Shipment is on the Way!</h2>
      <p style="color: #6b7280; margin: 0 0 20px; font-size: 14px;">Hi ${receiverName},</p>
      <p style="color: #6b7280; margin: 0 0 20px; font-size: 14px;">${senderName} has sent you a shipment through Straightway Couriers. Use the tracking number below to follow your package.</p>

      <div style="background: #ffffff; border-radius: 12px; padding: 20px; text-align: center; margin-bottom: 20px; border: 1px solid #e5e7eb;">
        <p style="color: #6b7280; font-size: 12px; margin: 0 0 4px; text-transform: uppercase; letter-spacing: 1px;">Tracking Number</p>
        <p style="font-size: 24px; font-weight: 700; color: #2563eb; margin: 0; letter-spacing: 2px;">${trackingNumber}</p>
      </div>

      <a href="${trackingUrl}" style="display: block; background: #2563eb; color: #ffffff; text-decoration: none; padding: 14px 24px; border-radius: 10px; font-size: 15px; font-weight: 600; text-align: center; margin-bottom: 20px;">Track Your Shipment</a>

      <p style="color: #9ca3af; font-size: 12px; text-align: center; margin: 0;">Straightway Couriers — Colombo, Sri Lanka</p>
    </div>
  `;

  return transporter.sendMail({
    from: process.env.SMTP_FROM || '"Straightway Couriers" <noreply@straightwaycouriers.com>',
    to,
    subject: `Shipment Update — ${trackingNumber}`,
    html,
  });
}
