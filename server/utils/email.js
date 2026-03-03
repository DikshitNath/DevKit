// ─── utils/email.js — add this function alongside your existing mailer ──
//
// Replace the old sendPasswordResetEmail with sendOtpEmail.
// Adjust the transporter setup to match whatever you already use
// (nodemailer, SendGrid, Resend, etc.)

const nodemailer = require('nodemailer')

const transporter = nodemailer.createTransport({
  host:   process.env.SMTP_HOST,
  port:   Number(process.env.SMTP_PORT) || 587,
  secure: false,
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_PASS,
  },
})

/**
 * Send a 6-digit OTP to the user's email.
 * @param {string} to  — recipient email address
 * @param {string} otp — plain 6-digit code (never stored, only emailed)
 */
async function sendOtpEmail(to, otp) {
  await transporter.sendMail({
    from:    `"DevKit" <${process.env.SMTP_FROM || process.env.SMTP_USER}>`,
    to,
    subject: 'Your DevKit password reset code',
    text: `Your password reset code is: ${otp}\n\nThis code expires in 10 minutes.\n\nIf you didn't request this, ignore this email.`,
    html: `
      <div style="font-family: 'IBM Plex Mono', monospace; max-width: 480px; margin: 0 auto; padding: 32px; background: #0c0c18; color: #e2e2f0; border-radius: 12px; border: 1px solid #1e1e30;">
        <div style="font-size: 24px; font-weight: 700; margin-bottom: 8px; color: #a78bfa;">DevKit</div>
        <div style="font-size: 14px; color: #6060a0; margin-bottom: 28px;">Password Reset</div>

        <p style="font-size: 13px; color: #e2e2f0; margin: 0 0 20px; line-height: 1.6;">
          Use the code below to reset your DevKit password. It expires in <strong>10 minutes</strong>.
        </p>

        <div style="background: #080810; border: 1px solid #4f46e544; border-radius: 10px; padding: 24px; text-align: center; margin-bottom: 24px;">
          <div style="font-size: 36px; font-weight: 800; letter-spacing: 10px; color: #a78bfa;">${otp}</div>
        </div>

        <p style="font-size: 11px; color: #2a2a45; margin: 0; line-height: 1.6;">
          If you didn't request a password reset, you can safely ignore this email.
        </p>
      </div>
    `,
  })
}

module.exports = { sendOtpEmail }