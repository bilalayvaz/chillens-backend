const express = require('express')
const router = express.Router()
const Post = require('../models/Post')
const { verifyToken } = require('../middleware/auth')

// Post oluştur
router.post('/', verifyToken, async (req, res) => {
  try {
    const { content, ipfsUri, lensProfileId, handle } = req.body

    if (req.user.lensProfileId !== lensProfileId) {
      return res.status(403).json({ error: 'Unauthorized' })
    }

    const post = new Post({
      content,
      ipfsUri,
      lensProfileId,
      handle
    })

    await post.save()
    res.status(201).json(post)
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

// Son 10 postu getir
router.get('/', async (req, res) => {
  try {
    const posts = await Post.find()
      .sort({ createdAt: -1 })
      .limit(10)
    res.json(posts)
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

// Profil ID'ye göre postları getir
router.get('/profile/:lensProfileId', verifyToken, async (req, res) => {
  try {

    if (req.user.lensProfileId !== req.params.lensProfileId) {
      return res.status(403).json({ error: 'Unauthorized' })
    }
    
    const posts = await Post.find({ 
      lensProfileId: req.params.lensProfileId 
    }).sort({ createdAt: -1 })
    
    res.json(posts)
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

module.exports = router; 