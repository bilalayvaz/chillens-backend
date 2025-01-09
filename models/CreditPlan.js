const mongoose = require('mongoose')
const creditPlanSchema = new mongoose.Schema({
    tokenAmount: String,
    credits: Number,
    price: Number,
    isActive: Boolean
  })

  module.exports = mongoose.model('CreditPlan', creditPlanSchema)