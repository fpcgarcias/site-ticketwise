/**
 * Envio de e-mail transacional (mesma configuração do contact.cjs).
 */
const nodemailer = require('nodemailer');
require('dotenv').config({ path: require('path').join(__dirname, '..', '..', '.env') });

function createEmailTransporter() {
  if (process.env.EMAIL_PROVIDER === 'gmail') {
    return nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD
      }
    });
  }
  if (process.env.EMAIL_PROVIDER === 'brevo') {
    return nodemailer.createTransport({
      host: 'smtp-relay.brevo.com',
      port: 587,
      secure: false,
      auth: {
        user: process.env.BREVO_EMAIL,
        pass: process.env.BREVO_PASSWORD
      }
    });
  }
  return nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT || 587),
    secure: process.env.SMTP_SECURE === 'true',
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASSWORD
    }
  });
}

/**
 * @param {{ to: string, subject: string, html: string }} opts
 */
async function sendTransactionalEmail({ to, subject, html }) {
  const from = process.env.EMAIL_FROM || 'noreply@ticketwise.com.br';
  if (!to) return { skipped: true, reason: 'no recipient' };

  try {
    const transporter = createEmailTransporter();
    await transporter.sendMail({
      from,
      to,
      subject,
      html
    });
    return { sent: true };
  } catch (err) {
    console.error('[mailer] Falha ao enviar e-mail:', err?.message || err);
    return { sent: false, error: err?.message };
  }
}

module.exports = {
  sendTransactionalEmail,
  createEmailTransporter
};
