const express = require('express')
const Snippet = require('../models/Snippet')
const auth = require('../middleware/authMiddleware')

const router = express.Router()

router.get('/', auth, async (req, res) => {
  try {
    const snippets = await Snippet.find({ user: req.user.id }).sort({ createdAt: -1 })
    res.json(snippets)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

router.get('/public', async (req, res) => {
  try {
    const snippets = await Snippet.find({ isPublic: true })
      .populate('user', 'username')
      .sort({ createdAt: -1 })
    res.json(snippets)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

router.get('/:id', auth, async (req, res) => {
  try {
    const snippet = await Snippet.findById(req.params.id)
    if (!snippet) return res.status(404).json({ error: 'Snippet not found' })
    res.json(snippet)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

router.post('/', auth, async (req, res) => {
  const { title, code, language, tags, isPublic } = req.body
  try {
    const snippet = await Snippet.create({
      user: req.user.id,
      title,
      code,
      language,
      tags: tags || [],
      isPublic: isPublic || false
    })
    res.status(201).json(snippet)
  } catch (err) {
    res.status(400).json({ error: err.message })
  }
})

router.put('/:id', auth, async (req, res) => {
  try {
    const { title, code, language, tags, isPublic } = req.body
    const snippet = await Snippet.findOneAndUpdate(
      { _id: req.params.id, user: req.user.id },
      { title, code, language, tags: tags || [], isPublic },
      { new: true }
    )
    if (!snippet) return res.status(404).json({ error: 'Snippet not found' })
    res.json(snippet)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

router.delete('/:id', auth, async (req, res) => {
  try {
    await Snippet.findOneAndDelete({ _id: req.params.id, user: req.user.id })
    res.json({ message: 'Snippet deleted' })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

module.exports = router