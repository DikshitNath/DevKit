const nodemailer = require('nodemailer')

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_PASS,
  }
})

exports.sendPasswordResetEmail = async (email, token) => {
  const resetUrl = `${process.env.CLIENT_URL}/reset-password?token=${token}`
  await transporter.sendMail({
    from: `"DevKit" <${process.env.GMAIL_USER}>`,
    to: email,
    subject: 'Reset your DevKit password',
    html: `
      <div style="font-family: monospace; max-width: 500px; margin: 0 auto; padding: 32px; background: #0d0d14; color: #e2e2f0; border-radius: 12px;">
        <h2 style="color: #a78bfa; margin-bottom: 16px;">Reset your password</h2>
        <p style="color: #888; margin-bottom: 24px;">Click the button below to reset your DevKit password. This link expires in 1 hour.</p>
        <a href="${resetUrl}" style="display: inline-block; background: linear-gradient(135deg, #6366f1, #8b5cf6); color: white; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: 600;">Reset Password</a>
        <p style="color: #444; margin-top: 24px; font-size: 12px;">If you didn't request this, ignore this email.</p>
      </div>
    `
  })
}