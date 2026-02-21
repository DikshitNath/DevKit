const mongoose = require('mongoose')

const snippetSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  title: { type: String, required: true },
  code: { type: String, required: true },
  language: { type: String, default: 'javascript' },
  tags: [{ type: String }],
  isPublic: { type: Boolean, default: false },
}, { timestamps: true })

module.exports = mongoose.model('Snippet', snippetSchema)