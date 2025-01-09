// backend/models/Aipost.js
const mongoose = require("mongoose");

const aipostSchema = new mongoose.Schema(
  {
    createdContent: { type: String, required: true },
    status: { type: Boolean, default: false }, 
    createdAt: { type: Date, default: Date.now }, 
  }
);

module.exports = mongoose.model("Aipost", aipostSchema);
