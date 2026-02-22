const express = require('express')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const crypto = require('crypto')
const User = require('../models/User')
const auth = require('../middleware/authMiddleware')
const passport = require('../utils/passport')
const { sendPasswordResetEmail } = require('../utils/email')

const router = express.Router()

const signToken = (user) => jwt.sign(
  { id: user._id, username: user.username },
  process.env.JWT_SECRET,
  { expiresIn: '7d' }
)

const setCookie = (res, token) => res.cookie('token', token, {
  httpOnly: true,
  secure: false,
  sameSite: 'lax',
  maxAge: 7 * 24 * 60 * 60 * 1000
})

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
  const { email } = req.body
  try {
    const user = await User.findOne({ email })
    if (!user) return res.status(404).json({ error: 'No account with that email' })
    if (!user.password) return res.status(400).json({ error: 'This account uses Google login' })

    const token = crypto.randomBytes(32).toString('hex')
    user.resetPasswordToken = token
    user.resetPasswordExpiry = Date.now() + 3600000 // 1 hour
    await user.save()

    await sendPasswordResetEmail(email, token)
    res.json({ message: 'Reset email sent' })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// Reset password
router.post('/reset-password', async (req, res) => {
  const { token, password } = req.body
  try {
    const user = await User.findOne({
      resetPasswordToken: token,
      resetPasswordExpiry: { $gt: Date.now() }
    })
    if (!user) return res.status(400).json({ error: 'Invalid or expired token' })

    user.password = await bcrypt.hash(password, 10)
    user.resetPasswordToken = undefined
    user.resetPasswordExpiry = undefined
    await user.save()

    res.json({ message: 'Password reset successful' })
  } catch (err) {
    res.status(500).json({ error: err.message })
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