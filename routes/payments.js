// routes/payments.js
const express = require('express');
const router = express.Router();
const User = require('../models/User');
const { verifyToken } = require('../middleware/auth'); // Burayı ekledik

// Public route - plan listesi
router.get('/plans', async (req, res) => {
  console.log('GET /api/payments/plans request received'); // Debug log
  const plans = [
    {
      tokenAmount: "1000000000000000000",
      credits: 50,
      price: 1
    },
    {
      tokenAmount: "120000000000000000000", 
      credits: 5,
      price: 120
    },
    {
      tokenAmount: "200000000000000000000", 
      credits: 10,
      price: 200
    }, 
    {
      tokenAmount: "375000000000000000000", 
      credits: 25,
      price: 375
    },
  ];
  res.json(plans);
});

// Protected route - ödeme doğrulama
router.post('/verify', verifyToken, async (req, res) => {
  const { paymentId, userAddress: lensProfileId, token, txHash, creditAmount, price } = req.body;
  
  try {
    console.log('Looking for user with Lens Profile ID:', lensProfileId);
    
    let user = await User.findOne({ lensProfileId });
    if (!user) {
      console.log('User not found with Lens Profile ID:', lensProfileId);
      return res.status(404).json({ error: 'User not found with this Lens Profile ID' });
    }

    // Ödemenin daha önce işlenip işlenmediğini kontrol et
    const existingPayment = user.payments.find(p => p.txHash === txHash);
    if (existingPayment) {
      return res.status(400).json({ error: 'Payment already processed' });
    }

    // Ödemeyi kaydet
    user.payments.push({
      paymentId,
      token,
      paidAmount: price,
      txHash,
      creditAmount,
      status: 'completed',
      networkId: 137
    });

    // Kredileri güncelle
    user.credits += creditAmount;
    user.totalCreditsPurchased = (user.totalCreditsPurchased || 0) + creditAmount;
    user.totalAmountSpent = (user.totalAmountSpent || 0) + price;

    await user.save();
    
    console.log('User credits updated:', {
      lensProfileId,
      credits: user.credits,
      totalPurchased: user.totalCreditsPurchased,
      totalSpent: user.totalAmountSpent
    });

    res.json({
      success: true,
      credits: user.credits,
      totalPurchased: user.totalCreditsPurchased,
      totalSpent: user.totalAmountSpent
    });
  } catch (error) {
    console.error('Payment verification error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Protected route - ödeme geçmişi
router.get('/history/:lensProfileId', verifyToken, async (req, res) => {
  try {
    const user = await User.findOne({ lensProfileId: req.params.lensProfileId });
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const payments = user.payments
      .sort((a, b) => b.timestamp - a.timestamp)
      .map(p => ({
        ...p.toObject(),
        network: p.networkId === 137 ? 'Polygon' : 'Unknown'
      }));

    res.json(payments);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;