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

const baseUrl = process.env.SITE_URL || 'https://straightwaycourier.vercel.app';

function trackingUrl(trackingNumber) {
  return `${baseUrl}/track?number=${trackingNumber}`;
}

const templates = {
  picked_up: {
    subject: (tn) => `📦 Shipment Picked Up — ${tn}`,
    heading: 'Your Parcel Has Been Picked Up!',
    body: 'Your parcel has been picked up and is on its way. Our team is handling it with care.',
    color: '#f97316',
  },
  at_warehouse: {
    subject: (tn) => `📍 Parcel at Warehouse — ${tn}`,
    heading: 'Your Parcel Has Reached Our Warehouse',
    body: 'Your parcel has arrived safely at our warehouse and will be sorted shortly.',
    color: '#8b5cf6',
  },
  out_for_delivery: {
    subject: (tn) => `🚚 Out for Delivery — ${tn}`,
    heading: 'Your Parcel Is Out for Delivery!',
    body: 'Your parcel is out for delivery and will arrive soon. Please keep an eye out for our delivery personnel.',
    color: '#2563eb',
  },
  delivered: {
    subject: (tn) => `✅ Delivered — ${tn}`,
    heading: 'Your Parcel Has Been Delivered!',
    body: 'Your parcel has been successfully delivered. Thank you for choosing Straightway Couriers.',
    color: '#16a34a',
  },
  rescheduled: {
    subject: (tn) => `🔄 Delivery Rescheduled — ${tn}`,
    heading: 'Your Delivery Has Been Rescheduled',
    body: 'Your delivery date has been updated. Please check the tracking page for the new scheduled time.',
    color: '#0891b2',
  },
  failed: {
    subject: (tn) => `⚠️ Delivery Delayed — ${tn}`,
    heading: 'Your Delivery Has Been Delayed',
    body: 'We encountered an issue with your delivery. Our team is working to resolve it. Please check tracking for updates or contact us.',
    color: '#dc2626',
  },
};

const defaultTemplate = {
  subject: (tn) => `Shipment Update — ${tn}`,
  heading: 'Your Shipment Has Been Updated',
  body: 'There is a new update on your shipment. Check the tracking page for details.',
  color: '#2563eb',
};

function buildEmailHtml({ receiverName, senderName, trackingNumber, heading, body, color }) {
  return `
    <div style="font-family: 'Segoe UI', Tahoma, sans-serif; max-width: 560px; margin: 0 auto; padding: 32px 24px; background: #f9fafb; border-radius: 16px;">
      <div style="background: linear-gradient(135deg, ${color}, ${color}dd); border-radius: 12px; padding: 24px; text-align: center; margin-bottom: 24px;">
        <h1 style="color: #ffffff; margin: 0; font-size: 20px; letter-spacing: 1px;">STRAIGHTWAY COURIERS</h1>
      </div>

      <h2 style="color: #111827; margin: 0 0 8px;">${heading}</h2>
      <p style="color: #6b7280; margin: 0 0 20px; font-size: 14px;">Hi ${receiverName},</p>
      <p style="color: #6b7280; margin: 0 0 20px; font-size: 14px; line-height: 1.6;">${body}</p>

      ${senderName ? `<p style="color: #6b7280; margin: 0 0 20px; font-size: 14px;">Sent by: <strong>${senderName}</strong></p>` : ''}

      <div style="background: #ffffff; border-radius: 12px; padding: 20px; text-align: center; margin-bottom: 20px; border: 1px solid #e5e7eb;">
        <p style="color: #6b7280; font-size: 12px; margin: 0 0 4px; text-transform: uppercase; letter-spacing: 1px;">Tracking Number</p>
        <p style="font-size: 24px; font-weight: 700; color: ${color}; margin: 0; letter-spacing: 2px;">${trackingNumber}</p>
      </div>

      <a href="${trackingUrl(trackingNumber)}" style="display: block; background: ${color}; color: #ffffff; text-decoration: none; padding: 14px 24px; border-radius: 10px; font-size: 15px; font-weight: 600; text-align: center; margin-bottom: 20px;">Track Your Shipment</a>

      <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 24px 0;" />

      <p style="color: #9ca3af; font-size: 12px; text-align: center; margin: 0 0 4px;">Need help? Contact us:</p>
      <p style="color: #9ca3af; font-size: 12px; text-align: center; margin: 0;">
        📞 <a href="tel:+94772520636" style="color: #2563eb; text-decoration: none;">+94 77 252 0636</a>
        &nbsp;|&nbsp;
        💬 <a href="https://wa.me/94772520636" style="color: #2563eb; text-decoration: none;">WhatsApp</a>
      </p>
      <p style="color: #9ca3af; font-size: 12px; text-align: center; margin: 16px 0 0;">Straightway Couriers — Colombo, Sri Lanka</p>
    </div>
  `;
}

export function sendTrackingEmail(shipment) {
  const { receiver_email, tracking_number, receiver_name, sender_name } = shipment;
  if (!receiver_email) return Promise.resolve();

  const tpl = templates[shipment.status] || defaultTemplate;

  return transporter.sendMail({
    from: process.env.SMTP_FROM || '"Straightway Couriers" <straightwaycouriers@gmail.com>',
    to: receiver_email,
    subject: tpl.subject(tracking_number),
    html: buildEmailHtml({
      receiverName: receiver_name,
      senderName: sender_name,
      trackingNumber: tracking_number,
      heading: tpl.heading,
      body: tpl.body,
      color: tpl.color,
    }),
  }).catch(err => {
    console.error('Email send failed:', err.message);
  });
}
