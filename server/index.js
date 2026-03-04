const express = require('express')
const mongoose = require('mongoose')
const cookieParser = require('cookie-parser')
const cors = require('cors')
const session = require('express-session')
const helmet = require('helmet') 
const rateLimit = require('express-rate-limit')
require('dotenv').config()
const passport = require('./utils/passport')

const authRoutes = require('./routes/auth')
const snippetRoutes = require('./routes/snippets')
const aiRoutes = require('./routes/ai')

const app = express()

// 1. TRUST THE PROXY (Crucial for secure cross-origin cookies on hosting platforms)
app.set('trust proxy', 1)

// 2. PRODUCTION SECURITY
app.use(helmet()) // Secures HTTP headers

// Limit requests to prevent brute-force attacks
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per window
})
app.use('/api/', limiter)

// 3. FLEXIBLE CORS CONFIGURATION
// This allows your production URL and local environments to work seamlessly
const allowedOrigins = [
  process.env.CLIENT_URL, 
  'http://localhost:5173', 
  'http://localhost:3000'
]

app.use(cors({ 
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true)
    } else {
      callback(new Error('Not allowed by CORS'))
    }
  }, 
  credentials: true 
}))

app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use(cookieParser())

// 4. ENVIRONMENT-AWARE COOKIES
const isProduction = process.env.NODE_ENV === 'production';

app.use(session({
  secret: process.env.SESSION_SECRET || process.env.JWT_SECRET,
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: isProduction, // true in production (HTTPS), false locally (HTTP)
    sameSite: isProduction ? 'none' : 'lax', // 'none' cross-domain, 'lax' locally
    httpOnly: true,
    maxAge: 7 * 24 * 60 * 60 * 1000  // 7 days
  }
}))

app.use(passport.initialize())
app.use(passport.session())

app.use('/api/auth', authRoutes)
app.use('/api/snippets', snippetRoutes)
app.use('/api/ai', aiRoutes)

mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.log(err))

app.listen(process.env.PORT || 3000, () => {
  console.log(`Server running on port ${process.env.PORT || 3000}`)
})