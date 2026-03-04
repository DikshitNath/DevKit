const express = require('express')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const crypto = require('crypto')
const User = require('../models/User')
const auth = require('../middleware/authMiddleware')
const passport = require('../utils/passport')
const nodemailer = require('nodemailer')
const { sendOtpEmail } = require('../utils/email')

const router = express.Router()

const signToken = (user) => jwt.sign(
  { id: user._id, username: user.username },
  process.env.JWT_SECRET,
  { expiresIn: '7d' }
)

const setCookie = (res, token) => res.cookie('token', token, {
  httpOnly: true,
  secure: true,
  sameSite: 'none',
  maxAge: 7 * 24 * 60 * 60 * 1000
})

function generateOtp() {
  return (crypto.randomInt(100000, 999999)).toString()
}

/** SHA-256 hash before storing — never persist raw OTPs or tokens */
function sha256(value) {
  return crypto.createHash('sha256').update(value).digest('hex')
}

// Register
router.post('/register', async (req, res) => {
  const { username, email, password } = req.body
  try {
    const hashedPassword = await bcrypt.hash(password, 10)
    const user = await User.create({ username, email, password: hashedPassword })
    res.status(201).json({ message: 'User created successfully' })
  } catch (err) {
    res.status(400).json({ error: err.message })
  }
})

// Login
router.post('/login', async (req, res) => {
  const { email, password } = req.body
  try {
    const user = await User.findOne({ email })
    if (!user) return res.status(400).json({ error: 'Invalid credentials' })
    if (!user.password) return res.status(400).json({ error: 'Please login with Google' })

    const isMatch = await bcrypt.compare(password, user.password)
    if (!isMatch) return res.status(400).json({ error: 'Invalid credentials' })

    setCookie(res, signToken(user))
    res.json({ message: 'Logged in successfully', user: { id: user._id, username: user.username, email: user.email, avatar: user.avatar } })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// Logout
router.post('/logout', (req, res) => {
  res.clearCookie('token')
  res.json({ message: 'Logged out successfully' })
})

// Me
router.get('/me', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password -resetPasswordToken -resetPasswordExpiry')
    if (!user) return res.status(404).json({ error: 'User not found' })
    res.json({ user })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// Update profile
router.put('/profile', auth, async (req, res) => {
  const { username, email, currentPassword, newPassword } = req.body
  try {
    const user = await User.findById(req.user.id)
    if (!user) return res.status(404).json({ error: 'User not found' })

    if (username) user.username = username
    if (email) user.email = email

    if (newPassword) {
      if (!currentPassword) return res.status(400).json({ error: 'Current password required' })
      const isMatch = await bcrypt.compare(currentPassword, user.password)
      if (!isMatch) return res.status(400).json({ error: 'Current password is incorrect' })
      user.password = await bcrypt.hash(newPassword, 10)
    }

    await user.save()
    const token = signToken(user)
    setCookie(res, token)
    res.json({ message: 'Profile updated', user: { id: user._id, username: user.username, email: user.email, avatar: user.avatar } })
  } catch (err) {
    res.status(400).json({ error: err.message })
  }
})

// Forgot password
router.post('/forgot-password', async (req, res) => {
  const email = req.body.email?.trim().toLowerCase()

  if (!email) return res.status(400).json({ error: 'Email is required' })

  try {
    const user = await User.findOne({ email }).select('+otpHash +otpExpiry')

    if (!user || !user.password) {
      return res.json({ message: 'OTP sent' })
    }

    const otp       = generateOtp()
    const otpHash   = sha256(otp)
    const otpExpiry = new Date(Date.now() + 10 * 60 * 1000)

    // Use findOneAndUpdate to bypass any Mongoose caching/select issues
    const updated = await User.findOneAndUpdate(
      { email },
      {
        $set: {
          otpHash,
          otpExpiry,
        },
        $unset: {
          resetPasswordToken:  '',
          resetPasswordExpiry: '',
        },
      },
      { new: true, select: '+otpHash +otpExpiry' }
    )

    console.log('[forgot-password] after update — otpHash in DB:', updated?.otpHash)
    console.log('[forgot-password] after update — otpExpiry in DB:', updated?.otpExpiry)

    await sendOtpEmail(email, otp)

    res.json({ message: 'OTP sent' })
  } catch (err) {
    console.error('[forgot-password]', err)
    res.status(500).json({ error: 'Failed to send code. Please try again.' })
  }
})

// ─── POST /api/auth/verify-otp ────────────────────────────────────────
// Body:     { email, otp }
// Response: { resetToken }
//
// Verifies the OTP, then issues a short-lived resetToken so the
// frontend can proceed to the password step without re-verifying.

router.post('/verify-otp', async (req, res) => {
  const email = req.body.email?.trim().toLowerCase()
  const otp   = req.body.otp?.trim()

  if (!email || !otp) {
    return res.status(400).json({ error: 'Email and OTP are required' })
  }

  if (!/^\d{6}$/.test(otp)) {
    return res.status(400).json({ error: 'OTP must be a 6-digit number' })
  }

  try {
    const user = await User.findOne({ email }).select('+otpHash +otpExpiry')

    const genericError = () =>
      res.status(400).json({ error: 'Invalid or expired code. Please request a new one.' })

    if (!user || !user.otpHash || !user.otpExpiry) {
      console.log('[verify-otp] FAILED — user or OTP fields missing')
      return genericError()
    }

    if (new Date() > user.otpExpiry) {
      console.log('[verify-otp] FAILED — OTP expired')
      user.otpHash   = undefined
      user.otpExpiry = undefined
      await user.save()
      return res.status(400).json({ error: 'Code has expired. Please request a new one.' })
    }

    if (sha256(otp) !== user.otpHash) {
      console.log('[verify-otp] FAILED — hash mismatch')
      return genericError()
    }

    // Valid — consume OTP
    user.otpHash   = undefined
    user.otpExpiry = undefined

    const resetToken = crypto.randomBytes(32).toString('hex')
    user.resetPasswordToken  = sha256(resetToken)
    user.resetPasswordExpiry = new Date(Date.now() + 10 * 60 * 1000)

    await user.save()

    console.log('[verify-otp] SUCCESS — reset token issued')

    res.json({ resetToken })
  } catch (err) {
    console.error('[verify-otp]', err)
    res.status(500).json({ error: 'Verification failed. Please try again.' })
  }
})
// Reset password
router.post('/reset-password', async (req, res) => {
  const { resetToken, newPassword } = req.body

  if (!resetToken || !newPassword) {
    return res.status(400).json({ error: 'Reset token and new password are required' })
  }

  if (newPassword.length < 6) {
    return res.status(400).json({ error: 'Password must be at least 6 characters' })
  }

  try {
    const user = await User.findOne({
      resetPasswordToken:  sha256(resetToken),
      resetPasswordExpiry: { $gt: Date.now() },
    })

    if (!user) {
      return res.status(400).json({ error: 'Invalid or expired session. Please start over.' })
    }

    user.password            = await bcrypt.hash(newPassword, 12)
    user.resetPasswordToken  = undefined
    user.resetPasswordExpiry = undefined
    // Belt-and-suspenders: clear OTP fields too
    user.resetOtpHash        = undefined
    user.resetOtpExpiry      = undefined

    await user.save()

    res.json({ message: 'Password updated successfully' })
  } catch (err) {
    console.error('[reset-password]', err)
    res.status(500).json({ error: 'Failed to reset password. Please try again.' })
  }
})

// Delete account
router.delete('/delete-account', auth, async (req, res) => {
  const { password } = req.body

  try {
    const user = await User.findById(req.user.id).select('+password')

    if (!user) return res.status(404).json({ error: 'User not found' })

    // Password accounts must confirm with their current password
    if (user.password) {
      if (!password) {
        return res.status(400).json({ error: 'Password is required to delete your account' })
      }
      const match = await bcrypt.compare(password, user.password)
      if (!match) {
        return res.status(400).json({ error: 'Incorrect password' })
      }
    }

    // Delete all data belonging to this user
    // await Snippet.deleteMany({ user: user._id })

    await User.findByIdAndDelete(user._id)

    // Clear the JWT cookie
    res.clearCookie('token')

    res.json({ message: 'Account deleted successfully' })
  } catch (err) {
    console.error('[delete-account]', err)
    res.status(500).json({ error: 'Failed to delete account. Please try again.' })
  }
})

// Google OAuth
router.get('/google', passport.authenticate('google', { scope: ['profile', 'email'] }))

router.get('/google/callback',
  passport.authenticate('google', { session: false, failureRedirect: '/login' }),
  (req, res) => {
    const token = signToken(req.user)
    setCookie(res, token)
    res.redirect(`${process.env.CLIENT_URL}/`)
  }
)


module.exports = router