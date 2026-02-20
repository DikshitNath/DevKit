const express = require('express')
const cors = require('cors')
require('dotenv').config()

const aiRoutes = require('./routes/ai')

const app = express()

app.use(cors({
  origin: 'http://localhost:5173',
  credentials: true
}))
app.use(express.json())

app.use('/api/ai', aiRoutes)

app.listen(process.env.PORT || 4000, () => {
  console.log(`AI server running on port ${process.env.PORT || 4000}`)
})