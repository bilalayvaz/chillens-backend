// User model
const mongoose = require('mongoose')

const userSchema = new mongoose.Schema({
  lensProfileId: {
    type: String,
    required: true,
    unique: true
  },
  handle: {
    type: String,
    required: true
  },
  credits: {
    type: Number,
    default: 7
  },
  totalCreditsUsed: {
    type: Number,
    default: 0
  },
  totalCreditsPurchased: {
    type: Number,
    default: 0
  },
  totalAmountSpent: {
    type: Number,
    default: 0
  },
  payments: {
    type: [{
      paymentId: { type: String },
      token: { type: String },
      paidAmount: { type: Number }, // Kullanıcının ödediği BONSAI miktarı
      txHash: { type: String },
      creditAmount: { type: Number }, // Aldığı kredi miktarı
      timestamp: {
        type: Date,
        default: Date.now
      },
      status: {
        type: String,
        enum: ['pending', 'completed', 'failed'],
        default: 'pending'
      },
      networkId: {
        type: Number,
        required: true
      }
    }],
    default: []
  },
  lastPostTime: {
    type: Date,
    default: null
  }
}, { 
  timestamps: true,
  indexes: [
    { handle: 1 },
    { 'payments.txHash': 1 }
  ]
})

userSchema.pre('save', function(next) {
  if (this.credits < 0) this.credits = 0
  next()
})

module.exports = mongoose.model('User', userSchema)