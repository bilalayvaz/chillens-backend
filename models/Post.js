const mongoose = require('mongoose')

const postSchema = new mongoose.Schema({
  id: String,
  content: String,
  ipfsUri: String,
  lensProfileId: String,
  handle: String,
  createdAt: { type: Date, default: Date.now },
  status: { type: String, enum: ['posted', 'failed'], default: 'posted' }
})

module.exports = mongoose.model('Post', postSchema)