const mongoose = require('mongoose')

const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  email:    { type: String, required: true, unique: true },
  password: { type: String },
  googleId: { type: String },
  avatar:   { type: String },

  // Password reset — OTP step
  otpHash:   { type: String, select: false },
  otpExpiry: { type: Date,   select: false },

  // Password reset — token step (after OTP verified)
  resetPasswordToken:  { type: String },
  resetPasswordExpiry: { type: Date   },

}, { timestamps: true })

module.exports = mongoose.model('User', userSchema)